// validateTape against the mutations a second-opinion review used to slip bad tapes through.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runGame, SEATS } from '../../src/engine.js';
import { createScriptedAgents } from '../../src/scripted.js';
import { validateTape } from '../../src/tape.js';

const KINDS = ['random', 'saint', 'coward', 'liar', 'shover'];

/** The first tape from the fuzz mixes (same as the 300-game fuzz) that satisfies `wanted`. */
async function findTape(wanted) {
  for (let seed = 1; seed <= 300; seed++) {
    const mix = SEATS.map((_, i) => KINDS[(seed * 7 + i * 3) % KINDS.length]);
    const tape = await runGame({ seed, agents: createScriptedAgents(seed, mix) });
    if (wanted(tape)) return tape;
  }
  throw new Error('no fuzz tape matched');
}

const ledgeSize = (tape) => tape.events.find((e) => e.type === 'stage_start' && e.stage === 'ledge')?.alive.length ?? 0;
const base = await findTape((t) => ledgeSize(t) === 3 && t.events.some((e) => e.type === 'ability_use') && t.events.some((e) => e.type === 'lucky_save'));
const four = await findTape((t) => ledgeSize(t) === 4);
const two = await findTape((t) => ledgeSize(t) === 2);
const noLedge = await findTape((t) => ledgeSize(t) === 0);

const rejects = (source, mutate, pattern) => {
  const tape = JSON.parse(JSON.stringify(source)); // engine tapes alias the roster between players and game_start
  mutate(tape);
  assert.throws(() => validateTape(tape), pattern);
};
const ofType = (tape, type) => tape.events.filter((e) => e.type === type);
const renumber = (tape) => tape.events.forEach((e, k) => { e.i = k; });

/** Rewrite places everywhere they are recorded: result, game_end and ledge death events. */
function setPlaces(tape, assignment) {
  const diedAt = (name) => tape.events.find((e) => e.type === 'death' && e.name === name)?.stage;
  const fix = (entry) => {
    if (!(entry.name in assignment)) return;
    entry.place = assignment[entry.name];
    if (entry.place === null) entry.diedAt = diedAt(entry.name);
    else delete entry.diedAt;
  };
  tape.result.places.forEach(fix);
  tape.events.at(-1).places.forEach(fix);
  for (const e of ofType(tape, 'death').filter((x) => x.name in assignment && x.stage === 'ledge')) {
    if (assignment[e.name] === null) delete e.place;
    else e.place = assignment[e.name];
  }
}
const holder = (tape, place) => tape.result.places.find((p) => p.place === place).name;

test('the fuzz tapes used here validate untouched (three, four, two and no players on the ledge)', () => {
  for (const tape of [base, four, two, noLedge]) validateTape(tape);
});

test('the first event index must be 0', () => {
  rejects(base, (t) => t.events.forEach((e) => { e.i += 100; }), /First event index must be 0/);
  rejects(base, (t) => t.events.forEach((e) => { e.i += 1; }), /First event index must be 0/);
});

test('events must carry the fields their type requires, well formed', () => {
  rejects(base, (t) => { delete ofType(t, 'ability_use')[0].detail; }, /ability_use missing detail/);
  rejects(base, (t) => { delete ofType(t, 'lucky_save')[0].why; }, /lucky_save missing why/);
  rejects(base, (t) => { delete ofType(t, 'stage_start')[0].note; }, /stage_start missing note/);
  rejects(base, (t) => { ofType(t, 'stage_start')[0].alive = 'everybody'; }, /alive must be a array/);
  rejects(base, (t) => { ofType(t, 'say')[0].text = 12; }, /text must be a string/);
  rejects(base, (t) => { ofType(t, 'action')[0].valid = 'yes'; }, /valid must be a boolean/);
});

test('usage is required, finite and non-negative', () => {
  rejects(base, (t) => { delete t.usage; }, /Missing usage/);
  rejects(base, (t) => { t.usage = null; }, /Missing usage/);
  rejects(base, (t) => { t.usage.usd = NaN; }, /usage\.usd/);
  rejects(base, (t) => { t.usage.usd = Infinity; }, /usage\.usd/);
  rejects(base, (t) => { t.usage.calls = -1; }, /usage\.calls/);
  rejects(base, (t) => { t.usage.inputTokens = '5'; }, /usage\.inputTokens/);
  rejects(base, (t) => { delete t.usage.outputTokens; }, /usage\.outputTokens/);
});

test('the game_start roster must be exactly the eight tape players', () => {
  rejects(base, (t) => { t.players = []; }, /exactly 8 players/);
  rejects(base, (t) => { t.events[0].players = []; }, /exactly 8 players/);
  rejects(base, (t) => { t.events[0].players.pop(); }, /exactly 8 players/);
  rejects(base, (t) => { t.events[0].players[2].power = 'nothing'; t.events[0].players[3].power = 'nothing'; }, /differ from tape.players/);
  rejects(base, (t) => { t.events[0].players[0].model = 'other/model'; }, /differ from tape.players/);
});

test('every name anywhere in the tape must be a player', () => {
  const zed = /unknown player: Zed/;
  rejects(base, (t) => { ofType(t, 'stage_start')[0].alive.push('Zed'); }, zed);
  rejects(base, (t) => { ofType(t, 'stage_end')[0].survivors[0] = 'Zed'; }, zed);
  rejects(base, (t) => { ofType(t, 'reveal').find((e) => e.what === 'line').data.line[0] = 'Zed'; }, zed);
  rejects(base, (t) => { ofType(t, 'reveal').find((e) => e.what === 'footing').data.footing.Zed = 3; }, zed);
  rejects(base, (t) => { ofType(t, 'say')[0].forgedAs = 'Zed'; }, zed);
  rejects(base, (t) => { ofType(t, 'whisper')[0].to = 'Zed'; }, zed);
  rejects(base, (t) => { ofType(t, 'whisper')[0].from = 'Zed'; }, zed);
  rejects(base, (t) => { ofType(t, 'death')[0].name = 'Zed'; }, zed);
  rejects(base, (t) => { t.result.deaths[0].name = 'Zed'; }, /Zed|result.deaths/);
  rejects(base, (t) => { t.result.places[0].name = 'Zed'; }, /Zed/);
  rejects(base, (t) => { t.events.at(-1).places[0].name = 'Zed'; }, /Zed|game_end/);
});

test('alive lists and survivors must match the deaths so far', () => {
  rejects(base, (t) => { ofType(t, 'stage_start')[1].alive.push(ofType(t, 'death')[0].name); }, /does not match who is alive|alive/);
  rejects(base, (t) => { ofType(t, 'stage_end')[0].survivors.pop(); }, /survivors does not match who is alive/);
  rejects(base, (t) => { const s = ofType(t, 'stage_start')[0]; s.alive = [s.alive[0], s.alive[0], ...s.alive.slice(2)]; }, /alive does not match/);
});

test('an agent without a place must say where it died', () => {
  const out = base.result.places.find((p) => p.place === null).name;
  rejects(base, (t) => { delete t.result.places.find((p) => p.name === out).diedAt; delete t.events.at(-1).places.find((p) => p.name === out).diedAt; }, /diedAt must name a stage/);
  rejects(base, (t) => { t.result.places.find((p) => p.name === out).diedAt = null; t.events.at(-1).places.find((p) => p.name === out).diedAt = null; }, /diedAt must name a stage/);
});

test('swapping places 2 and 3 (consistently everywhere) is caught from the order of the falls', () => {
  const [p2, p3] = [holder(base, 2), holder(base, 3)];
  rejects(base, (t) => setPlaces(t, { [p2]: 3, [p3]: 2 }), /fell #\d of 3 on the ledge so its place must be/);
});

test('a ledge participant with a null place is rejected', () => {
  rejects(base, (t) => setPlaces(t, { [holder(t, 3)]: null }), /fell #1 of 3 on the ledge so its place must be 3/);
  rejects(base, (t) => setPlaces(t, { [holder(t, 2)]: null }), /Places must be contiguous from 1, got 1,3/);
  rejects(base, (t) => setPlaces(t, { [holder(t, 2)]: null, [holder(t, 3)]: null }), /on the ledge so its place must be/);
});

test('places must follow the events even when only the summary is edited', () => {
  const [p2, p3] = [holder(base, 2), holder(base, 3)];
  rejects(base, (t) => {
    for (const list of [t.result.places, t.events.at(-1).places]) {
      list.find((p) => p.name === p2).place = 3;
      list.find((p) => p.name === p3).place = 2;
    }
  }, /place differs|death place differs|should have place/);
});

test('the winner must be a ledge participant and every other participant must fall on the ledge', () => {
  rejects(base, (t) => {
    const start = ofType(t, 'stage_start').find((e) => e.stage === 'ledge');
    const outsider = SEATS.find((n) => !start.alive.includes(n));
    start.alive = [...start.alive.slice(1), outsider];
  }, /does not match who is alive|died on the ledge without being on it|not on the ledge/);
  rejects(base, (t) => { ofType(t, 'stage_start').find((e) => e.stage === 'ledge').alive.pop(); }, /alive|ledge/);
});

test('four on the ledge: the first to fall has no place and diedAt ledge; faking a place is rejected', () => {
  const first = four.result.places.find((p) => p.place === null && p.diedAt === 'ledge');
  assert.ok(first, 'the first faller is recorded as diedAt ledge with a null place');
  rejects(four, (t) => setPlaces(t, { [first.name]: 3, [holder(t, 3)]: 2, [holder(t, 2)]: 1 }), /place|Place/);
  rejects(four, (t) => setPlaces(t, { [first.name]: 3 }), /Duplicate place|must be/);
  rejects(four, (t) => { t.result.places.find((p) => p.name === first.name).diedAt = 'disc'; t.events.at(-1).places.find((p) => p.name === first.name).diedAt = 'disc'; }, /diedAt differs from death stage/);
});

test('two on the ledge: the first to fall is 2nd', () => {
  assert.equal(two.result.places.filter((p) => p.place).length >= 2, true);
  const [p2, p1] = [holder(two, 2), holder(two, 1)];
  rejects(two, (t) => setPlaces(t, { [p2]: null }), /Places must be contiguous|place must be/);
  rejects(two, (t) => setPlaces(t, { [p2]: 1, [p1]: 2 }), /Place 1 must go to the sole survivor|place must be|should have place/);
});

test('no ledge at all: only the lone survivor ranks', () => {
  const out = noLedge.result.places.find((p) => p.place === null).name;
  rejects(noLedge, (t) => setPlaces(t, { [out]: 2 }), /died before ledge but has place 2|Places must be contiguous/);
});

test('mutations of an event-less tape or one with shifted indices fail cleanly, never crash', () => {
  rejects(base, (t) => { t.events = []; }, /non-empty array/);
  rejects(base, (t) => { t.events.forEach((e) => { e.i += 100; }); }, /First event index/);
  rejects(base, (t) => { t.events[1].i = 0; }, /not strictly increasing/);
  validateTape(structuredClone(base));
});
