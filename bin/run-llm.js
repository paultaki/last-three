#!/usr/bin/env node
// Play one LLM game and write its tape to web/tapes/<id>.json.
// Usage: node bin/run-llm.js [--seed N] [--models a,b,...(8)] [--cap USD] [--out path]
import { pickChalk, appendChalk } from '../src/llm/chalk.js';
import { readFileSync, writeFileSync, renameSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { createLlmAgent, probeModel, DEFAULT_ROSTER, RESERVE_MODELS } from '../src/llm/llmAgent.js';
import { createLedger, SpendCapError } from '../src/llm/ledger.js';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const TAPES_DIR = resolve(ROOT, 'web/tapes');
const INDEX_FILE = resolve(TAPES_DIR, 'index.json');
/** Different stream from the engine's power shuffle, so models and powers are not correlated. */
const MODEL_SHUFFLE_SALT = 0x9e3779b9;
const FALLBACK_SEATS = ['Ash', 'Bex', 'Cole', 'Dara', 'Eli', 'Fenn', 'Gus', 'Hana'];
const reservedIds = new Set();

function readJson(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJsonAtomic(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.${process.pid}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`);
  renameSync(tmp, path);
}

const entriesOf = (index) => (Array.isArray(index) ? index : (index?.tapes ?? []));

/** Next free tape id of the form YYYYMMDD-NNNN (unique within this process too). */
export function allocateTapeId(now = new Date()) {
  const day = now.toISOString().slice(0, 10).replaceAll('-', '');
  const used = entriesOf(readJson(INDEX_FILE, [])).map((e) => e.id);
  let n = 1;
  let id;
  do {
    id = `${day}-${String(n++).padStart(4, '0')}`;
  } while (used.includes(id) || reservedIds.has(id) || existsSync(resolve(TAPES_DIR, `${id}.json`)));
  reservedIds.add(id);
  return id;
}

/** Probe every model once; swap failing ones for reserves. Returns the final model list. */
export async function resolveRoster(models, ledger, log = console.log) {
  const results = await Promise.all(models.map((m) => probeModel(m, { ledger })));
  const reserves = [...RESERVE_MODELS].filter((m) => !models.includes(m));
  const roster = [];
  for (let i = 0; i < models.length; i += 1) {
    if (results[i]) {
      roster.push(models[i]);
      continue;
    }
    let replacement = null;
    while (reserves.length && !replacement) {
      const candidate = reserves.shift();
      if (await probeModel(candidate, { ledger })) replacement = candidate;
    }
    if (!replacement) throw new Error(`no working replacement for ${models[i]}`);
    log(`probe failed: ${models[i]} replaced by ${replacement}`);
    roster.push(replacement);
  }
  return roster;
}

function sumUsage(agents) {
  const sum = { inputTokens: 0, outputTokens: 0, usd: 0, calls: 0 };
  for (const agent of Object.values(agents)) {
    const u = agent.usage();
    sum.inputTokens += u.inputTokens;
    sum.outputTokens += u.outputTokens;
    sum.usd += u.usd;
    sum.calls += u.calls;
  }
  sum.usd = Number(sum.usd.toFixed(6));
  return sum;
}

function seatModels(seed, models, seats, shuffle) {
  const copy = [...models];
  const out = shuffle(seed ^ MODEL_SHUFFLE_SALT, copy);
  return seats.map((_, i) => out[i]);
}

/**
 * Play one game with already-probed `models` and return the validated tape.
 * Throws SpendCapError (and writes nothing) if a cap was hit mid-game.
 */
/** A game is unusable as data if one agent's calls mostly failed (it sat out on default actions). */
export class DegenerateGameError extends Error {}
const MAX_AGENT_ERROR_RATE = 0.25;
const MIN_ACTIONS_FOR_GATE = 8;

/**
 * Agents whose action events are mostly `agent error` defaults.
 * @returns {{name: string, model: string, errors: number, actions: number}[]}
 */
export function degenerateAgents(tape) {
  const stats = new Map();
  for (const e of tape.events) {
    if (e.type !== 'action') continue;
    const row = stats.get(e.name) ?? { errors: 0, actions: 0 };
    row.actions += 1;
    if (typeof e.note === 'string' && e.note.startsWith('agent error')) row.errors += 1;
    stats.set(e.name, row);
  }
  return [...stats]
    .filter(([, r]) => r.actions >= MIN_ACTIONS_FOR_GATE && r.errors / r.actions > MAX_AGENT_ERROR_RATE)
    .map(([name, r]) => ({ name, model: tape.players.find((p) => p.name === name)?.model ?? '?', ...r }));
}

export async function playLlmGame({ seed, models, ledger, id = allocateTapeId(), chalk = true }) {
  const { runGame, SEATS } = await import('../src/engine.js');
  const { validateTape } = await import('../src/tape.js');
  const { makeRng } = await import('../src/rng.js');
  const seats = SEATS ?? FALLBACK_SEATS;
  const shuffle = (s, arr) => {
    const out = makeRng(s).shuffle(arr);
    return Array.isArray(out) ? out : arr;
  };
  const seated = seatModels(seed, models, seats, shuffle);
  const agents = Object.fromEntries(
    seats.map((name, i) => [name, createLlmAgent({ name, model: seated[i], ledger, gameId: id })]),
  );
  const config = { id, createdAt: new Date().toISOString(), ...(chalk ? { chalk: pickChalk(seed) } : {}) };
  const tape = await runGame({ seed, agents, config });
  const capError = Object.values(agents).map((a) => a.capError()).find(Boolean);
  if (capError) throw new SpendCapError(`${capError.message}; tape ${id} discarded`, capError);
  const bad = degenerateAgents(tape);
  if (bad.length) {
    const who = bad.map((b) => `${b.name} (${b.model}) ${b.errors}/${b.actions} failed`).join(', ');
    throw new DegenerateGameError(`game ${id} discarded: ${who}`);
  }
  tape.id = id;
  tape.createdAt ??= new Date().toISOString();
  tape.usage = sumUsage(agents);
  validateTape(tape);
  return tape;
}

/** Write the tape file and prepend its entry to web/tapes/index.json (newest first). */
export function saveTape(tape, outPath = null, extra = {}) {
  const winner = tape.result?.places?.find((p) => p.place === 1)?.name ?? null;
  const entry = {
    id: tape.id,
    seed: tape.seed,
    createdAt: tape.createdAt,
    models: tape.players.map((p) => p.model),
    winner,
    winnerModel: tape.players.find((p) => p.name === winner)?.model ?? null,
    calls: tape.usage?.calls ?? 0,
    usd: tape.usage?.usd ?? 0,
    rules: tape.rulesVersion ?? 1,
    ...extra,
  };
  writeJsonAtomic(outPath ?? resolve(TAPES_DIR, `${tape.id}.json`), tape);
  if (!outPath) {
    appendChalk(tape);
    const index = readJson(INDEX_FILE, []);
    const rest = entriesOf(index).filter((e) => e.id !== tape.id);
    writeJsonAtomic(INDEX_FILE, Array.isArray(index) ? [entry, ...rest] : { ...index, tapes: [entry, ...rest] });
  }
  return entry;
}

function printResult(tape, ledger) {
  const modelOf = (name) => tape.players.find((p) => p.name === name)?.model ?? '?';
  const placed = tape.result.places.filter((p) => p.place).sort((a, b) => a.place - b.place);
  for (const p of placed) console.log(`  ${p.place}. ${p.name} (${modelOf(p.name)})`);
  const died = tape.result.places.filter((p) => !p.place).map((p) => `${p.name}@${p.diedAt}`);
  console.log(`  eliminated: ${died.join(', ') || 'none'}`);
  const u = tape.usage;
  console.log(`  ${u.calls} calls, ${u.inputTokens} in / ${u.outputTokens} out tokens, $${u.usd.toFixed(4)}`);
  console.log(`  ledger total: $${ledger.totals().usd.toFixed(4)} of $${ledger.cap.toFixed(2)} cap`);
}

async function main() {
  const { values } = parseArgs({
    options: {
      seed: { type: 'string' },
      models: { type: 'string' },
      cap: { type: 'string' },
      out: { type: 'string' },
    },
  });
  const seed = values.seed === undefined ? Math.floor(Math.random() * 2 ** 31) : Number(values.seed);
  if (!Number.isInteger(seed)) throw new Error('--seed must be an integer');
  const wanted = values.models ? values.models.split(',').map((m) => m.trim()).filter(Boolean) : DEFAULT_ROSTER;
  if (wanted.length !== 8) throw new Error(`need exactly 8 models, got ${wanted.length}`);
  const ledger = createLedger(values.cap ? { capUsd: Number(values.cap) } : {});
  await ledger.ready();

  const models = await resolveRoster(wanted, ledger);
  const id = allocateTapeId();
  console.log(`game ${id} seed ${seed}`);
  const tape = await playLlmGame({ seed, models, ledger, id });
  const entry = saveTape(tape, values.out ? resolve(values.out) : null);
  console.log(`winner: ${entry.winner} (${entry.winnerModel})`);
  printResult(tape, ledger);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err instanceof SpendCapError ? `stopped: ${err.message}` : err.stack ?? err.message);
    process.exit(1);
  });
}
