// The chalk wall: messages scratched by earlier top-three finishers, remembered between games.
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeRng } from '../rng.js';

const ROOT = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const DEFAULT_PATH = resolve(ROOT, 'data/chalk.json');
const MAX_STORE = 60;
const POOL = 15;
const SHOWN = 3;

/** @returns {{id: string, text: string, byPlace: number, model: string|null, gameId: string}[]} */
export function loadChalk(path = DEFAULT_PATH) {
  if (!existsSync(path)) return [];
  try {
    const data = JSON.parse(readFileSync(path, 'utf8'));
    return Array.isArray(data) ? data.filter((n) => typeof n?.text === 'string' && n.text.trim()) : [];
  } catch {
    return [];
  }
}

/**
 * Choose up to three notes for one game: seeded, from the most recent notes, at most one per earlier game.
 * @returns {{text: string, byPlace: number}[]}
 */
export function pickChalk(seed, store = loadChalk()) {
  const recent = store.slice(-POOL);
  const rng = makeRng(seed ^ 0x5bd1e995);
  const seenGames = new Set();
  const picked = [];
  for (const note of rng.shuffle(recent)) {
    if (seenGames.has(note.gameId)) continue;
    seenGames.add(note.gameId);
    picked.push({ text: note.text, byPlace: note.byPlace });
    if (picked.length === SHOWN) break;
  }
  return picked;
}

/** Add this game's written notes to the store (newest last, capped). Synchronous so parallel games cannot interleave a write. */
export function appendChalk(tape, path = DEFAULT_PATH) {
  const written = Array.isArray(tape.chalkWritten) ? tape.chalkWritten : [];
  if (!written.length) return 0;
  const modelOf = (name) => tape.players.find((p) => p.name === name)?.model ?? null;
  const store = loadChalk(path);
  for (const note of written) {
    store.push({ id: `${tape.id}-${note.place}`, gameId: tape.id, text: note.text, byPlace: note.place, model: modelOf(note.name) });
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(`${path}.tmp`, `${JSON.stringify(store.slice(-MAX_STORE), null, 2)}\n`);
  renameSync(`${path}.tmp`, path);
  return written.length;
}
