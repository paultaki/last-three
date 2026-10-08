#!/usr/bin/env node
// Play one scripted (free, offline) game and write its tape.
//   node bin/play.js [--seed N] [--kinds random,saint,...] [--out path] [--id name]

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runGame } from '../src/engine.js';
import { BOT_KINDS, createScriptedAgents } from '../src/scripted.js';
import { validateTape } from '../src/tape.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const STAGES = ['bridge', 'crusher', 'pit', 'disc', 'ledge'];
const USAGE = `Usage: node bin/play.js [--seed N] [--kinds ${BOT_KINDS.join(',')}] [--out file] [--id name]`;

function parseArgs(argv) {
  const opts = { seed: Math.floor(Math.random() * 1_000_000), kinds: undefined, out: null, id: null };
  for (let i = 0; i < argv.length; i += 2) {
    const [flag, value] = [argv[i], argv[i + 1]];
    if (flag === '--help' || flag === '-h') throw new Error(USAGE);
    if (value === undefined) throw new Error(`Missing value for ${flag}\n${USAGE}`);
    if (flag === '--seed') opts.seed = Number.parseInt(value, 10);
    else if (flag === '--kinds') opts.kinds = value.split(',');
    else if (flag === '--out') opts.out = value;
    else if (flag === '--id') opts.id = value;
    else throw new Error(`Unknown option ${flag}\n${USAGE}`);
  }
  if (!Number.isInteger(opts.seed)) throw new Error('--seed must be an integer');
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const id = opts.id ?? `scripted-${opts.seed}`;
  const outPath = opts.out ?? path.join(ROOT, 'web', 'tapes', `${id}.json`);

  console.log(`Running game with seed ${opts.seed}...`);
  const agents = createScriptedAgents(opts.seed, opts.kinds);
  const tape = await runGame({ seed: opts.seed, agents, config: { id, createdAt: new Date().toISOString() } });
  validateTape(tape);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(tape, null, 2)}\n`);
  console.log(`Tape written to ${outPath}`);

  console.log('\nPlaces:');
  for (const p of tape.result.places.filter((x) => x.place).sort((a, b) => a.place - b.place)) {
    console.log(`  ${p.place}. ${p.name}`);
  }
  console.log('\nDeaths by stage:');
  for (const stage of STAGES) {
    const names = tape.result.deaths.filter((d) => d.stage === stage).map((d) => d.name);
    if (names.length) console.log(`  ${stage}: ${names.join(', ')}`);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
