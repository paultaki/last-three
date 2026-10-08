// Spend accounting with a hard dollar cap, persisted in .ledger/spend.json.
import { readFileSync, writeFileSync, renameSync, mkdirSync } from 'node:fs';
import { dirname, resolve, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = fileURLToPath(new URL('../../', import.meta.url));
const MODELS_URL = 'https://ai-gateway.vercel.sh/v1/models';
const PRICE_TTL_MS = 24 * 60 * 60 * 1000;
/** No matter what cap is requested, total spend never goes above this. */
export const HARD_CEILING_USD = 18;
export const DEFAULT_CAP_USD = 12;
const UNKNOWN_PRICE = { input: 1 / 1e6, output: 5 / 1e6 };

/** Thrown when a call would push spend past the total or per-game cap. */
export class SpendCapError extends Error {
  constructor(message, { scope = 'total', capUsd = null } = {}) {
    super(message);
    this.name = 'SpendCapError';
    this.scope = scope;
    this.capUsd = capUsd;
  }
}

const emptyBucket = () => ({ usd: 0, inputTokens: 0, outputTokens: 0, calls: 0 });
const emptyState = () => ({ ...emptyBucket(), byModel: {}, byGame: {} });

function addTo(bucket, usd, inputTokens, outputTokens) {
  bucket.usd += usd;
  bucket.inputTokens += inputTokens;
  bucket.outputTokens += outputTokens;
  bucket.calls += 1;
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function writeJsonAtomic(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.${process.pid}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`);
  renameSync(tmp, path);
}

/** Convert the gateway /v1/models payload into { [modelId]: { input, output } } (USD per token). */
export function parsePriceTable(payload) {
  const table = {};
  for (const m of payload?.data ?? []) {
    const input = Number(m?.pricing?.input);
    const output = Number(m?.pricing?.output);
    if (m?.id && Number.isFinite(input) && Number.isFinite(output)) table[m.id] = { input, output };
  }
  return table;
}

/**
 * @param {{path?: string, capUsd?: number, perGameCapUsd?: number,
 *   prices?: Record<string, {input: number, output: number}>,
 *   fetchImpl?: typeof fetch, now?: () => number, warn?: (msg: string) => void}} [opts]
 */
export function createLedger({
  path = '.ledger/spend.json',
  capUsd = DEFAULT_CAP_USD,
  perGameCapUsd = Infinity,
  prices = null,
  fetchImpl = (...a) => globalThis.fetch(...a),
  now = Date.now,
  warn = (msg) => console.warn(msg),
} = {}) {
  const file = isAbsolute(path) ? path : resolve(PROJECT_ROOT, path);
  const priceFile = resolve(dirname(file), 'prices.json');
  const cap = Math.min(capUsd, HARD_CEILING_USD);
  let table = prices;
  let readyPromise = null;
  const warned = new Set();

  const load = () => readJson(file) ?? emptyState();

  async function fetchPrices() {
    const cached = readJson(priceFile);
    if (cached && now() - cached.fetchedAt < PRICE_TTL_MS) return cached.prices;
    try {
      const res = await fetchImpl(MODELS_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const fresh = parsePriceTable(await res.json());
      writeJsonAtomic(priceFile, { fetchedAt: now(), prices: fresh });
      return fresh;
    } catch (err) {
      warn(`ledger: price table unavailable (${err.message}); using ${cached ? 'stale cache' : 'defaults'}`);
      return cached?.prices ?? {};
    }
  }

  function priceOf(model) {
    const found = table?.[model];
    if (found) return found;
    if (!warned.has(model)) {
      warned.add(model);
      warn(`ledger: no price for ${model}; assuming $1/M input, $5/M output`);
    }
    return UNKNOWN_PRICE;
  }

  const costOf = (model, inputTokens, outputTokens) => {
    const p = priceOf(model);
    return inputTokens * p.input + outputTokens * p.output;
  };

  return {
    cap,
    perGameCapUsd,
    /** Load the price table once (cached on disk for 24 h). Safe to call repeatedly. */
    ready() {
      if (!readyPromise) readyPromise = table ? Promise.resolve() : fetchPrices().then((t) => void (table = t));
      return readyPromise;
    },
    costOf,
    /** Throw SpendCapError if spending `estimatedUsd` more would breach a cap. */
    assertCanSpend(estimatedUsd, gameId) {
      const state = load();
      if (state.usd + estimatedUsd > cap) {
        throw new SpendCapError(
          `spend cap $${cap.toFixed(2)} reached ($${state.usd.toFixed(4)} spent)`,
          { scope: 'total', capUsd: cap },
        );
      }
      const gameUsd = state.byGame[gameId]?.usd ?? 0;
      if (gameId != null && gameUsd + estimatedUsd > perGameCapUsd) {
        throw new SpendCapError(
          `per-game cap $${perGameCapUsd.toFixed(2)} reached for ${gameId} ($${gameUsd.toFixed(4)} spent)`,
          { scope: 'game', capUsd: perGameCapUsd },
        );
      }
    },
    /** Record one completed call; returns its cost in USD. */
    record(model, inputTokens, outputTokens, gameId) {
      const usd = costOf(model, inputTokens, outputTokens);
      const state = load();
      addTo(state, usd, inputTokens, outputTokens);
      addTo((state.byModel[model] ??= emptyBucket()), usd, inputTokens, outputTokens);
      if (gameId != null) addTo((state.byGame[gameId] ??= emptyBucket()), usd, inputTokens, outputTokens);
      writeJsonAtomic(file, state);
      return usd;
    },
    totals() {
      return load();
    },
    gameTotals(gameId) {
      return { ...(load().byGame[gameId] ?? emptyBucket()) };
    },
  };
}
