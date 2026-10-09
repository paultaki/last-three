// Shared by the fuzz tests: seeded bot mixes and the invariants every tape must satisfy.

import assert from 'node:assert/strict';
import { POWER_IDS } from '../../src/powers.js';
import { BOT_KINDS } from '../../src/scripted.js';
import { validateTape } from '../../src/tape.js';
import { CHALK_NOTE_LIMIT, sanitizeChalkNotes } from '../../src/rules.js';
import { makeRng } from '../../src/rng.js';
import { SEATS } from './helpers.js';

export const GAMES = 300;
const DEATH_STYLE = { bridge: ['glass', 'shatter'], crusher: ['crusher', 'flatten'], pit: ['pit', 'sink'], disc: ['trapdoor', 'chute'], ledge: ['ledge', 'tumble'] };
const STAGE_ORDER = ['bridge', 'crusher', 'pit', 'disc', 'ledge'];

/** Seeded mixes so any failure reproduces: some games are uniform, some mixed, some include `broken`. */
export function mixFor(seed, rng) {
  if (seed % 10 === 0) return BOT_KINDS[(seed / 10) % BOT_KINDS.length];
  return SEATS.map(() => BOT_KINDS[rng.int(seed % 3 === 0 ? BOT_KINDS.length : BOT_KINDS.length - 1)]);
}

/** About half the games get a chalk wall (even seeds), some of it hostile, so sanitising is fuzzed too. */
export function chalkFor(seed) {
  if (seed % 2 === 1) return undefined;
  const pool = [
    { text: 'Go left on the glass.\nAlways left.\u0000 Trust me.', byPlace: 1 },
    { text: `   ${'x'.repeat(300)}   `, byPlace: 3 },
    { text: 42, byPlace: 2 },
    null,
    'not an object',
    { text: 'Never hold the lever.', byPlace: 2 },
    { text: '\u202eesrever\u200b', byPlace: 1 },
    { text: 'Brace, then dodge, then brace.', byPlace: 7 },
    { text: 'Whoever volunteers first gets trusted.', byPlace: 1 },
  ];
  const rng = makeRng(seed * 977 + 5);
  return rng.shuffle(pool).slice(0, 1 + rng.int(pool.length - 1));
}

function checkRoundOrdering(tape, label) {
  const seat = (name) => SEATS.indexOf(name);
  let round = [];
  const flush = () => {
    const talk = round.filter((e) => ['thought', 'say', 'whisper'].includes(e.type));
    const acts = round.filter((e) => e.type === 'action' && !e.auto);
    const firstAction = round.findIndex((e) => e.type === 'action');
    const lastTalk = round.map((e) => ['thought', 'say', 'whisper'].includes(e.type)).lastIndexOf(true);
    if (firstAction !== -1) assert.ok(lastTalk < firstAction, `${label}: speech after an action in one round`);
    for (const type of ['thought', 'say']) {
      const who = talk.filter((e) => e.type === type && !e.forgedAs).map((e) => seat(e.name));
      assert.deepEqual(who, [...who].sort((a, b) => a - b), `${label}: ${type} not in seat order`);
    }
    const doers = acts.map((e) => seat(e.name));
    assert.deepEqual(doers, [...doers].sort((a, b) => a - b), `${label}: actions not in seat order`);
    round = [];
  };
  for (const e of tape.events) {
    if (e.type === 'round_start') flush();
    round.push(e);
  }
  flush();
}

/** `chalk` is whatever the game was given as config.chalk (undefined when nothing). */
export function checkTape(tape, label, { chalk } = {}) {
  validateTape(tape);

  // events: strictly increasing indices, stage/round keys everywhere
  tape.events.forEach((e, k) => {
    assert.equal(e.i, k, `${label}: event index`);
    assert.ok('stage' in e && 'round' in e, `${label}: event ${k} (${e.type}) lacks stage/round`);
  });

  // powers assigned exactly once
  assert.deepEqual(tape.players.map((p) => p.power).sort(), [...POWER_IDS].sort(), `${label}: powers`);

  // deaths carry stage/cause/style consistently
  const deaths = tape.events.filter((e) => e.type === 'death');
  for (const d of deaths) {
    assert.deepEqual([d.cause, d.style], DEATH_STYLE[d.stage], `${label}: death ${d.name}`);
    if (d.stage !== 'ledge') assert.equal(d.place, undefined, `${label}: only ledge deaths carry a place`);
  }

  // nobody speaks, thinks, whispers or acts after their own death
  const diedAt = new Map(deaths.map((d) => [d.name, d.i]));
  for (const e of tape.events) {
    const who = e.type === 'whisper' ? e.from : e.name;
    // the chalk epilogue is the one place the dead (placed fallers) may act
    if (['thought', 'say', 'whisper', 'action', 'ability_use'].includes(e.type) && diedAt.has(who) && e.stage !== 'chalk') {
      assert.ok(e.i < diedAt.get(who), `${label}: ${who} emitted ${e.type} after dying`);
    }
  }

  // places: at most 3, unique, within 1..3, only ledge reachers or a lone survivor
  const placed = tape.result.places.filter((p) => p.place !== null);
  assert.ok(placed.length >= 1 && placed.length <= 3, `${label}: ${placed.length} places`);
  assert.equal(new Set(placed.map((p) => p.place)).size, placed.length);
  assert.ok(placed.every((p) => p.place >= 1 && p.place <= 3));
  const stages = tape.events.filter((e) => e.type === 'stage_start' && e.stage !== 'chalk').map((e) => e.stage);
  const ledgeDead = new Set(deaths.filter((d) => d.stage === 'ledge').map((d) => d.name));
  const survivors = SEATS.filter((s) => !diedAt.has(s));
  assert.equal(survivors.length, 1, `${label}: exactly one survivor`);
  for (const p of placed) {
    assert.ok(ledgeDead.has(p.name) || (p.name === survivors[0] && p.place === 1), `${label}: ${p.name} should not have place ${p.place}`);
  }
  if (!stages.includes('ledge')) assert.equal(placed.length, 1, `${label}: lone survivor only`);
  for (const p of tape.result.places.filter((x) => x.place === null)) assert.ok(STAGE_ORDER.includes(p.diedAt));

  // stages run in order and respect their preconditions
  assert.deepEqual(stages, STAGE_ORDER.filter((s) => stages.includes(s)));
  for (const e of tape.events.filter((x) => x.type === 'stage_start')) {
    if (e.stage === 'crusher' || e.stage === 'pit' || e.stage === 'disc') assert.ok(e.alive.length > 3, `${label}: ${e.stage} with ${e.alive.length}`);
    if (e.stage === 'ledge') assert.ok(e.alive.length >= 2);
  }
  assert.ok(tape.events.filter((e) => e.type === 'lucky_save').every((e) => !diedAt.has(e.name) || e.i < diedAt.get(e.name)));

  // within each round: thought/say/whisper first, in seat order, then actions in seat order
  checkRoundOrdering(tape, label);

  checkPit(tape, label);
  checkChalk(tape, label, chalk);

  // JSON round trip
  assert.deepEqual(JSON.parse(JSON.stringify(tape)), tape, `${label}: not JSON round-trippable`);
}


/** Pit invariants: public state stays coherent from round to round, and the flood never leaves fewer than three. */
function checkPit(tape, label) {
  const events = tape.events.filter((e) => e.stage === 'pit');
  if (!events.length) return;
  const start = events.find((e) => e.type === 'stage_start');
  const end = events.find((e) => e.type === 'stage_end');
  assert.ok(start.alive.length > 3 && end.survivors.length >= 3, `${label}: pit ${start.alive.length} -> ${end.survivors.length}`);
  let prev = { base: null, down: [...start.alive], out: [], ropeUsed: false };
  let ropes = 0;
  for (const e of events.filter((x) => x.type === 'reveal' && x.what === 'pit')) {
    const d = e.data;
    assert.deepEqual([...d.down, ...d.out].sort(), [...start.alive].sort(), `${label}: down + out is everyone`);
    assert.ok(d.lifted.length <= 2 && d.lifted.every((n) => prev.down.includes(n) && d.out.includes(n) && n !== prev.base), `${label}: lifts`);
    assert.ok(d.base === null || d.down.includes(d.base), `${label}: the base is down`);
    if (prev.base) assert.ok(d.base === prev.base || d.rescued === prev.base, `${label}: the base only changes by rescue`);
    if (d.rescued) {
      ropes += 1;
      assert.equal(d.rescued, prev.base);
      assert.ok(prev.out.includes(d.roped), `${label}: the rescuer was already out`);
      assert.ok(d.out.includes(d.rescued) && d.ropeUsed && d.base === null);
    }
    assert.equal(d.roped === null, d.rescued === null);
    assert.ok(!prev.ropeUsed || d.ropeUsed, `${label}: the rope does not come back`);
    assert.equal(d.liftsPerRound, 2);
    prev = d;
  }
  assert.ok(ropes <= 1, `${label}: one rope`);
  // the base never acts beyond waiting
  const rounds = events.filter((e) => e.type === 'reveal' && e.what === 'pit');
  const baseBefore = new Map();
  rounds.forEach((r, k) => baseBefore.set(r.round + 1, r.data.base));
  for (const a of events.filter((x) => x.type === 'action' && x.valid)) {
    if (baseBefore.get(a.round) === a.name) assert.equal(a.action, 'wait', `${label}: the base can only wait`);
  }
  // deaths in the pit are exactly the agents still down at the end, minus lucky and feather saves
  const deaths = events.filter((e) => e.type === 'death').map((e) => e.name);
  const stillDown = prev.down;
  const saved = events.filter((e) => e.type === 'lucky_save' || (e.type === 'ability_use' && e.power === 'feather')).map((e) => e.name);
  assert.deepEqual([...deaths, ...saved].sort(), [...stillDown].sort(), `${label}: flood victims`);
}

/** Chalk wall invariants: the notes shown, the epilogue's cast, and where the written notes come from. */
function checkChalk(tape, label, supplied) {
  const shown = sanitizeChalkNotes(supplied);
  assert.deepEqual(tape.chalkShown, shown, `${label}: chalkShown is the sanitised input`);
  assert.ok(shown.length <= 3 && shown.every((n) => n.text.length > 0 && n.text.length <= CHALK_NOTE_LIMIT && !/[\u0000-\u001f\u007f]/.test(n.text)), `${label}: shown notes are clean`);
  const reads = tape.events.filter((e) => e.type === 'chalk_read');
  assert.equal(reads.length, shown.length ? 1 : 0, `${label}: chalk_read iff there is a wall`);
  if (reads.length) {
    assert.equal(tape.events[1], reads[0], `${label}: chalk_read right after game_start`);
    assert.deepEqual(reads[0].notes, shown);
    assert.ok(reads[0].stage === null && reads[0].round === null);
  }

  const placed = tape.result.places.filter((p) => p.place !== null);
  const epilogue = tape.events.filter((e) => e.stage === 'chalk');
  assert.ok(epilogue.length > 0, `${label}: someone is always placed, so the epilogue always runs`);
  assert.deepEqual(epilogue.map((e) => e.type).filter((t) => !['thought', 'action', 'chalk_write'].includes(t)), ['stage_start', 'round_start', 'stage_end'], `${label}: epilogue shape`);
  const start = epilogue[0];
  assert.deepEqual([...start.alive].sort(), placed.map((p) => p.name).sort(), `${label}: the epilogue asks exactly the placed agents`);
  assert.deepEqual(epilogue.at(-1).survivors, start.alive);
  const lastObstacle = tape.events.findLastIndex((e) => e.type === 'stage_end' && e.stage !== 'chalk');
  assert.ok(tape.events.indexOf(start) > lastObstacle && tape.events.at(-1).type === 'game_end', `${label}: epilogue sits between the last obstacle and game_end`);
  assert.ok(epilogue.every((e) => e.round === null || e.round === 1) && epilogue.filter((e) => e.type === 'round_start').length === 1);

  const actions = epilogue.filter((e) => e.type === 'action');
  assert.deepEqual(actions.map((a) => a.name), start.alive, `${label}: one action per placed agent, in seat order`);
  assert.ok(actions.every((a) => ['write', 'skip'].includes(a.action) && (a.action === 'write' ? a.valid : true)));
  const writes = epilogue.filter((e) => e.type === 'chalk_write');
  for (const w of writes) {
    assert.equal(w.place, placed.find((p) => p.name === w.name).place, `${label}: chalk_write place`);
    assert.ok(w.text.length > 0 && w.text.length <= CHALK_NOTE_LIMIT && w.text === w.text.trim(), `${label}: chalk_write text`);
    assert.equal(actions.find((a) => a.name === w.name).action, 'write', `${label}: a note only comes from a write`);
  }
  assert.deepEqual(tape.chalkWritten, writes.map(({ name, place, text }) => ({ name, place, text })), `${label}: chalkWritten equals the events`);
  assert.equal(new Set(writes.map((w) => w.name)).size, writes.length);
  assert.equal(tape.events.filter((e) => e.type === 'chalk_write' && e.stage !== 'chalk').length, 0);
}
