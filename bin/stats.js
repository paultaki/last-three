#!/usr/bin/env node
// Read every tape in web/tapes and write web/tapes/stats.json.
// Usage: node bin/stats.js
import { readdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeStats } from '../src/stats.js';

const TAPES_DIR = resolve(fileURLToPath(new URL('../', import.meta.url)), 'web/tapes');
const SKIP = new Set(['index.json', 'stats.json']);

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

const stats = computeStats(loadTapes());
const out = resolve(TAPES_DIR, 'stats.json');
writeFileSync(`${out}.tmp`, `${JSON.stringify(stats, null, 2)}\n`);
renameSync(`${out}.tmp`, out);
console.log(`${stats.games} tapes -> web/tapes/stats.json`);
printTable(stats);
