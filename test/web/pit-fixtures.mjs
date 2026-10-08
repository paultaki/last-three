// In-memory pit tapes for the viewer tests, written by the real engine with the scripted bots.
// The scan below picks one tape per scenario, so a change to the engine's dice still finds the cases.
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const KIND_SETS = [
  undefined,
  'random',
  ['random', 'random', 'coward', 'coward', 'random', 'coward', 'random', 'liar'],
  ['saint', 'coward', 'coward', 'coward', 'coward', 'coward', 'coward', 'coward'],
  ['shover', 'coward', 'liar', 'coward', 'random', 'coward', 'random', 'coward'],
  ['coward'],
];

const pitEvents = (tape) => tape.events.filter((e) => e.stage === 'pit');
const has = (tape, pred) => tape.events.some(pred);
const baseRounds = (tape) => {
  // for each pit reveal that sets a new base: was it a volunteer (offer_back that round) or a push?
  const out = [];
  let acts = [];
  let base = null;
  for (const e of pitEvents(tape)) {
    if (e.type === 'round_start') acts = [];
    if (e.type === 'action') acts.push(e.action);
    if (e.type === 'reveal' && e.what === 'pit') {
      if (e.data.base && e.data.base !== base) out.push(acts.includes('offer_back') ? 'volunteer' : 'pushed');
      base = e.data.base;
    }
  }
  return out;
};

// name -> predicate over a tape
export const SCENARIOS = {
  volunteer: (t) => baseRounds(t).includes('volunteer') && !has(t, (e) => e.type === 'ability_use' && e.stage === 'pit'),
  pushed: (t) => baseRounds(t).includes('pushed') && !has(t, (e) => e.type === 'ability_use' && e.stage === 'pit'),
  // the rope thrower makes it to the ledge, where the price shows
  rope: (t) => {
    const rope = t.events.find((e) => e.type === 'reveal' && e.what === 'rope');
    const ledge = t.events.find((e) => e.type === 'stage_start' && e.stage === 'ledge');
    return !!rope && !!ledge && ledge.alive.includes(rope.data.by);
  },
  sink: (t) => has(t, (e) => e.type === 'death' && e.style === 'sink') && !has(t, (e) => e.type === 'lucky_save' && e.stage === 'pit'),
  feather: (t) => has(t, (e) => e.type === 'ability_use' && e.power === 'feather' && e.stage === 'pit'),
  floor3: (t) => has(t, (e) => e.type === 'lucky_save' && e.stage === 'pit' && e.why === 'a plank floats by'),
  anchor: (t) => has(t, (e) => e.type === 'ability_use' && e.power === 'anchor' && e.stage === 'pit'),
  photoShoves: (t) => has(t, (e) => e.type === 'lucky_save' && /photo finish on shoves/.test(e.why)),
  photoFooting: (t) => has(t, (e) => e.type === 'lucky_save' && /photo finish on footing/.test(e.why)),
  big: (t) => pitEvents(t).some((e) => e.type === 'stage_start' && e.alive.length >= 7),
  noPit: (t) => !has(t, (e) => e.stage === 'pit'),
};

/** Returns { name: tape } with `id` set to `pit-<name>`. Scenarios the engine never produced are left out. */
export async function buildPitTapes({ maxSeed = 420, only = null } = {}) {
  const { runGame } = await import(pathToFileURL(path.join(root, 'src', 'engine.js')).href);
  const { createScriptedAgents } = await import(pathToFileURL(path.join(root, 'src', 'scripted.js')).href);
  const wanted = new Set(only || Object.keys(SCENARIOS));
  const found = {};
  for (let seed = 1; seed <= maxSeed && wanted.size; seed++) {
    const kinds = KIND_SETS[seed % KIND_SETS.length];
    const tape = await runGame({ seed, agents: createScriptedAgents(seed, kinds), config: { id: `pit-seed-${seed}`, createdAt: '2026-10-08T00:00:00Z' } });
    for (const name of [...wanted]) {
      if (SCENARIOS[name](tape)) {
        found[name] = { ...tape, id: `pit-${name}` };
        wanted.delete(name);
      }
    }
  }
  return found;
}
