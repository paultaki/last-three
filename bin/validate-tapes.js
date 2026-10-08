#!/usr/bin/env node
// Validate every tape in web/tapes (or the directory given as the first argument).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateTape } from '../src/tape.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const NOT_TAPES = new Set(['index.json', 'stats.json']);

const dir = process.argv[2] ?? path.join(ROOT, 'web', 'tapes');
if (!fs.existsSync(dir)) {
  console.log(`No tapes directory found at ${dir}.`);
  process.exit(0);
}

let passed = 0;
let failed = 0;
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json') && !NOT_TAPES.has(f)).sort()) {
  try {
    validateTape(JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')));
    console.log(`ok   ${file}`);
    passed += 1;
  } catch (err) {
    console.error(`FAIL ${file}: ${err.message}`);
    failed += 1;
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
