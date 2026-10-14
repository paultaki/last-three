#!/usr/bin/env node
// Play many LLM games under a spend cap.
// Usage: node bin/batch.js --games N [--start-seed S] [--cap USD] [--per-game-cap USD] [--concurrency 2] [--tier cheap|mixed|heavy|premium]
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { createLedger, SpendCapError } from '../src/llm/ledger.js';
import { DEFAULT_ROSTER, HEAVY_ROSTER, PREMIUM_ROSTER, MIXED_ROSTER } from '../src/llm/llmAgent.js';
import { playLlmGame, resolveRoster, saveTape } from './run-llm.js';

const DEFAULT_PER_GAME_CAP_USD = 0.6;

function readOptions() {
  const { values } = parseArgs({
    options: {
      games: { type: 'string' },
      'start-seed': { type: 'string' },
      cap: { type: 'string' },
      'per-game-cap': { type: 'string' },
      concurrency: { type: 'string', default: '2' },
      tier: { type: 'string', default: 'cheap' },
      rules: { type: 'string', default: '5' },
      rotate: { type: 'boolean', default: false },
    },
  });
  const games = Number(values.games);
  if (!Number.isInteger(games) || games < 1) throw new Error('--games N is required (positive integer)');
  const startSeed = values['start-seed'] === undefined ? Math.floor(Math.random() * 1e6) : Number(values['start-seed']);
  const concurrency = Math.max(1, Number(values.concurrency) || 1);
  return {
    games,
    startSeed,
    concurrency,
    tier: values.tier,
    rules: Number(values.rules),
    rotate: values.rotate,
    capUsd: values.cap === undefined ? undefined : Number(values.cap),
    perGameCapUsd: values['per-game-cap'] === undefined ? DEFAULT_PER_GAME_CAP_USD : Number(values['per-game-cap']),
  };
}

/**
 * Run `games` games, `concurrency` at a time. Never throws for a single failed game;
 * stops starting new games when the cap is reached or the next game is projected to exceed it.
 * @returns {Promise<{played: number, failed: number, stopped: string|null}>}
 */
// v6 test batches rotate the room order so every room gets played while the cast is still big.
export const V6_ROTATIONS = [
  ['bridge', 'lever', 'cups', 'jackets', 'bomb', 'vault'],
  ['vault', 'bomb', 'jackets', 'cups', 'lever', 'bridge'],
  ['cups', 'jackets', 'vault', 'bomb', 'bridge', 'lever'],
  ['jackets', 'bomb', 'bridge', 'vault', 'lever', 'cups'],
];

export async function runBatch({ games, startSeed, concurrency, ledger, models, tier = 'cheap', rules = 5, rotate = false, log = console.log }) {
  const costs = [];
  let next = 0;
  let inFlight = 0;
  let played = 0;
  let failed = 0;
  let stopped = null;

  const projected = () => {
    const avg = costs.length ? costs.reduce((a, b) => a + b, 0) / costs.length : 0;
    return avg * (inFlight + 1);
  };

  async function runOne(index) {
    const seed = startSeed + index;
    const before = ledger.totals().usd;
    try {
      const order = rules === 6 && rotate ? V6_ROTATIONS[index % V6_ROTATIONS.length] : undefined;
      const tape = await playLlmGame({ seed, models, ledger, rules, order });
      saveTape(tape, null, { tier });
      played += 1;
      costs.push(tape.usage.usd);
      log(`game ${tape.id} seed ${seed}: winner ${tape.result.places.find((p) => p.place === 1)?.name}, $${tape.usage.usd.toFixed(4)}`);
    } catch (err) {
      costs.push(ledger.totals().usd - before);
      if (err instanceof SpendCapError && err.scope === 'total') stopped = err.message;
      else failed += 1;
      log(`game seed ${seed} skipped: ${err.message}`);
    }
    log(`  running total $${ledger.totals().usd.toFixed(4)} of $${ledger.cap.toFixed(2)}`);
  }

  async function worker() {
    while (next < games && !stopped) {
      if (ledger.totals().usd + projected() > ledger.cap) {
        stopped = `next game projected to exceed the $${ledger.cap.toFixed(2)} cap`;
        break;
      }
      const index = next++;
      inFlight += 1;
      try {
        await runOne(index);
      } finally {
        inFlight -= 1;
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, games) }, worker));
  return { played, failed, stopped };
}

async function main() {
  const opts = readOptions();
  const ledger = createLedger({
    ...(opts.capUsd === undefined ? {} : { capUsd: opts.capUsd }),
    perGameCapUsd: opts.perGameCapUsd,
  });
  await ledger.ready();
  const rosters = { cheap: DEFAULT_ROSTER, mixed: MIXED_ROSTER, heavy: HEAVY_ROSTER, premium: PREMIUM_ROSTER };
  if (!rosters[opts.tier]) throw new Error('--tier must be cheap, mixed, heavy or premium');
  const models = await resolveRoster(rosters[opts.tier], ledger);
  const result = await runBatch({ ...opts, ledger, models });
  console.log(`done: ${result.played} played, ${result.failed} failed${result.stopped ? `; stopped: ${result.stopped}` : ''}`);
  console.log(`total spend $${ledger.totals().usd.toFixed(4)} of $${ledger.cap.toFixed(2)} cap`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err instanceof SpendCapError ? `stopped: ${err.message}` : err.stack ?? err.message);
    process.exit(1);
  });
}
