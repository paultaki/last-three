// Chalk wall (rules v4) tapes for the viewer tests. They start from real engine tapes (scripted bots)
// and get the chalk events and top-level fields injected in exactly the shapes the engine writes,
// so the tests do not depend on what the engine's epilogue happens to produce for a given seed.
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const KIND_SETS = [undefined, 'random', ['random', 'random', 'coward', 'coward', 'random', 'coward', 'random', 'liar'], ['saint', 'coward', 'coward', 'coward', 'coward', 'coward', 'coward', 'coward'], ['shover', 'coward', 'liar', 'coward', 'random', 'coward', 'random', 'coward']];

const clone = (v) => JSON.parse(JSON.stringify(v));
const reindex = (events) => events.map((e, i) => ({ ...e, i }));
const placedOf = (tape) => {
  const end = tape.events.find((e) => e.type === 'game_end');
  return tape.players.map((p) => ({ name: p.name, place: (end.places.find((x) => x.name === p.name) || {}).place })).filter((p) => Number.isInteger(p.place));
};

/** A rules-v3 style tape: no chalk_read, no epilogue, no top-level chalk fields. */
export function stripChalk(tape) {
  const out = clone(tape);
  out.events = reindex(out.events.filter((e) => e.type !== 'chalk_read' && e.stage !== 'chalk'));
  delete out.chalkShown;
  delete out.chalkWritten;
  out.rulesVersion = 3;
  return out;
}

/**
 * Inject the wall. `shown`: earlier notes [{text, byPlace}] (chalk_read after game_start when non-empty).
 * `plan`: { 1: 'note', 2: null, 3: 'note' } by final place; a string writes, null or missing skips.
 */
export function injectChalk(base, { shown = [], plan = {}, id } = {}) {
  const tape = stripChalk(base);
  const placed = placedOf(tape); // seat order
  const events = tape.events.slice();
  const end = events.pop();
  const k = events.findIndex((e) => e.type === 'game_start') + 1;
  if (shown.length) events.splice(k, 0, { type: 'chalk_read', stage: null, round: null, notes: clone(shown) });
  const names = placed.map((p) => p.name);
  const at = { stage: 'chalk', round: 1 };
  const written = [];
  events.push({ type: 'stage_start', stage: 'chalk', round: null, alive: names, note: 'The game is over. The top three finishers may each leave one message on the chalk wall.' });
  events.push({ type: 'round_start', ...at, phase: 'write', roundsTotal: 1 });
  for (const p of placed) events.push({ type: 'thought', ...at, name: p.name, text: typeof plan[p.place] === 'string' ? 'One note for whoever comes next.' : 'Nothing to say.' });
  for (const p of placed) events.push({ type: 'action', ...at, name: p.name, action: typeof plan[p.place] === 'string' ? 'write' : 'skip', valid: true });
  for (const p of placed) {
    if (typeof plan[p.place] === 'string' && plan[p.place].trim()) {
      const note = { name: p.name, place: p.place, text: plan[p.place] };
      written.push(note);
      events.push({ type: 'chalk_write', ...at, ...note });
    }
  }
  events.push({ type: 'stage_end', ...at, survivors: names });
  events.push(end);
  tape.events = reindex(events);
  tape.chalkShown = clone(shown);
  tape.chalkWritten = written;
  tape.rulesVersion = 4;
  tape.id = id || `${tape.id}-chalk`;
  return tape;
}

const W140 = 'MMMM WWWW MMMM WWWW '.repeat(7).trim().padEnd(140, 'W').slice(0, 140);
const NATURAL = 'The left pane on row three is weak, but do not trust the quiet one who offers to go first: they said the same thing to me, twice. Good luck!'.slice(0, 140);
export const NOTES = {
  short: 'Go left.',
  mid: 'Whoever volunteers for the pit step is not your friend, whatever they promise.',
  w140: W140,
  natural: NATURAL,
  solid: 'W'.repeat(140),
  html: '<img src=x onerror=alert(1)> <b>bold</b> &amp; "quotes" </p>',
};

/** One real engine tape per scenario: full (3 places), lone survivor, two places. Scanned over seeds, deterministic. */
export async function buildChalkBases({ maxSeed = 200 } = {}) {
  const { runGame } = await import(pathToFileURL(path.join(root, 'src', 'engine.js')).href);
  const { createScriptedAgents } = await import(pathToFileURL(path.join(root, 'src', 'scripted.js')).href);
  const want = { full: (n) => n === 3, lone: (n) => n === 1, two: (n) => n === 2 };
  const found = {};
  for (let seed = 1; seed <= maxSeed && Object.keys(found).length < 3; seed++) {
    const kinds = KIND_SETS[seed % KIND_SETS.length];
    const tape = await runGame({ seed, agents: createScriptedAgents(seed, kinds), config: { id: `chalk-base-${seed}`, createdAt: '2026-10-08T00:00:00Z' } });
    const n = placedOf(tape).length;
    for (const [name, pred] of Object.entries(want)) if (!found[name] && pred(n)) found[name] = tape;
  }
  return found;
}

/** The named fixtures. Keys become tape ids `chalk-<key>`. */
export async function buildChalkTapes() {
  const bases = await buildChalkBases();
  const full = bases.full;
  const tapes = {
    wall0: injectChalk(full, { plan: { 1: NOTES.mid, 2: NOTES.short, 3: NOTES.natural } }),
    wall1: injectChalk(full, { shown: [{ text: NOTES.short, byPlace: 1 }], plan: { 1: NOTES.mid, 2: null, 3: NOTES.short } }),
    wall3: injectChalk(full, { shown: [{ text: NOTES.w140, byPlace: 1 }, { text: NOTES.natural, byPlace: 2 }, { text: NOTES.solid, byPlace: 3 }], plan: { 1: NOTES.w140, 2: NOTES.solid, 3: NOTES.natural } }),
    html: injectChalk(full, { shown: [{ text: NOTES.html, byPlace: 2 }, { text: NOTES.short, byPlace: 1 }], plan: { 1: NOTES.html, 2: NOTES.mid, 3: null } }),
    skip: injectChalk(full, { shown: [{ text: NOTES.mid, byPlace: 3 }], plan: {} }),
    old: stripChalk(full),
  };
  if (bases.lone) tapes.lone = injectChalk(bases.lone, { shown: [{ text: NOTES.mid, byPlace: 1 }, { text: NOTES.short, byPlace: 2 }], plan: { 1: NOTES.natural } });
  if (bases.two) tapes.two = injectChalk(bases.two, { shown: [{ text: NOTES.short, byPlace: 1 }], plan: { 1: NOTES.mid, 2: null } });
  for (const [key, tape] of Object.entries(tapes)) tape.id = `chalk-${key}`;
  return tapes;
}
