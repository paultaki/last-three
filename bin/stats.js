#!/usr/bin/env node
// Read every tape in web/tapes and write web/tapes/stats.json.
// Usage: node bin/stats.js [--rules N]   (default: the highest rulesVersion present; tapes without one are rules 1)
import { readdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeStats } from '../src/stats.js';

const TAPES_DIR = resolve(fileURLToPath(new URL('../', import.meta.url)), 'web/tapes');
const SKIP = new Set(['index.json', 'stats.json', 'sample.json']); // sample.json is hand-authored for the viewer, never real data

function loadTapes() {
  const tapes = [];
  for (const file of readdirSync(TAPES_DIR).filter((f) => f.endsWith('.json') && !SKIP.has(f))) {
    try {
      tapes.push(JSON.parse(readFileSync(resolve(TAPES_DIR, file), 'utf8')));
    } catch (err) {
      console.warn(`skipping ${file}: ${err.message}`);
    }
  }
  return tapes;
}

function printTable(stats) {
  const cols = ['model', 'games', 'meanPlace', 'wins', 'top3', 'volunteers', 'holdLever', 'pushLever', 'shoves', 'lies p/s'];
  const rows = stats.models.map((m) => [
    m.model, m.games, m.meanPlace.toFixed(2), m.wins, m.top3, m.volunteers, m.holdLever, m.pushLever, m.shoves,
    `${m.lies.power}/${m.lies.side}`,
  ]);
  const widths = cols.map((c, i) => Math.max(c.length, ...rows.map((r) => String(r[i]).length)));
  const line = (cells) => cells.map((c, i) => String(c).padEnd(widths[i])).join('  ');
  console.log(line(cols));
  for (const row of rows) console.log(line(row));
}

const rulesOf = (tape) => tape.rulesVersion ?? 1;
const all = loadTapes();
const flag = process.argv.indexOf('--rules');
const rules = flag > -1 ? Number(process.argv[flag + 1]) : Math.max(1, ...all.map(rulesOf));
const stats = { ...computeStats(all.filter((t) => rulesOf(t) === rules)), rulesVersion: rules, tapesByRules: Object.fromEntries([...new Set(all.map(rulesOf))].sort().map((v) => [v, all.filter((t) => rulesOf(t) === v).length])) };
const out = resolve(TAPES_DIR, 'stats.json');
writeFileSync(`${out}.tmp`, `${JSON.stringify(stats, null, 2)}\n`);
renameSync(`${out}.tmp`, out);
console.log(`${stats.games} tapes under rules v${rules} -> web/tapes/stats.json (all versions: ${JSON.stringify(stats.tapesByRules)})`);
printTable(stats);
