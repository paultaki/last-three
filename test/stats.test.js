import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeStats, claimedPowers, claimedSafeSide, safeSidesByRow } from '../src/stats.js';

const STAMPED = new Set(['round_start', 'stage_start', 'stage_end', 'death']);

/**
 * Build a tape from [type, fields] pairs; `i` is assigned in order. Like the real engine,
 * only round_start/stage_start/stage_end/death keep stage and round; the rest must be inferred.
 */
function tape(id, players, places, steps) {
  const events = steps.map(([type, fields], i) => {
    const { stage, round, ...rest } = fields;
    return { i, type, ...(STAMPED.has(type) ? { stage, round } : {}), ...rest };
  });
  return { version: 1, id, seed: 1, createdAt: '2026-10-08T00:00:00Z', players, events, result: { places, deaths: [] } };
}
const player = (name, model, power) => ({ name, model, power });
const bridge = (round, extra = {}) => ({ stage: 'bridge', round, ...extra });
const act = (name, action, f = {}) => ['action', { name, action, valid: true, ...f }];
const say = (name, text, f = {}) => ['say', { name, text, ...f }];

const game1 = tape(
  'g1',
  [player('Ash', 'A', 'glass_eye'), player('Bex', 'B', 'nothing'), player('Cole', 'A', 'wedge'), player('Dara', 'B', 'map')],
  [{ name: 'Ash', place: 1 }, { name: 'Bex', place: 2 }, { name: 'Cole', place: 3 }, { name: 'Dara', place: null, diedAt: 'bridge' }],
  [
    ['round_start', { ...bridge(1), phase: 'waiting', roundsTotal: 6 }],
    act('Ash', 'volunteer', bridge(1)),
    act('Bex', 'hold', bridge(1)),
    say('Bex', "I'm the Glass Eye, follow me.", bridge(1)), // power lie (Bex has nothing)
    say('Ash', 'I can see through the glass, trust me.', bridge(1)), // true
    ['whisper', { from: 'Cole', to: 'Ash', text: 'I have the wedge.', ...bridge(1) }], // true
    ['whisper', { from: 'Dara', to: 'Bex', text: 'Is Cole the Glass Eye? I want to know.', ...bridge(1) }], // question
    say('Bex', "I'm not the glass eye.", bridge(1)), // denial
    say('Dara', 'I think Cole is the glass eye.', bridge(1)), // third-person
    say('Cole', "I'm the Anchor, nobody can push me.", bridge(1)), // power lie (Cole has wedge)
    ['round_start', { ...bridge(1), phase: 'crossing', roundsTotal: 8 }],
    say('Ash', 'Left is safe.', bridge(1)), // true: row 1 safe is L
    say('Bex', 'go R', bridge(1)), // side lie
    act('Dara', 'step:R', bridge(1)),
    ['reveal', { ...bridge(1), what: 'weak_pane', data: { row: 1, weak: 'R' } }],
    ['death', { ...bridge(1), name: 'Dara', cause: 'glass', style: 'shatter' }],
    ['round_start', { ...bridge(2), phase: 'crossing', roundsTotal: 8 }],
    act('Ash', 'step:L', { ...bridge(2), auto: true }),
    say('Bex', "I'll go R", bridge(2)), // own intention, skipped
    say('Cole', 'maybe left', bridge(2)), // hedged, skipped
    say('Ash', 'Right is weak, take left.', bridge(2)), // true
    say('Cole', 'Row 2: right is safe.', bridge(2)), // side lie
    say('Bex', 'Right is safe.', bridge(2, { forgedAs: 'Ash' })), // forged, skipped
    ['reveal', { ...bridge(2), what: 'weak_pane', data: { row: 2, weak: 'R' } }],
    ['round_start', { stage: 'crusher', round: 1, phase: 'play', roundsTotal: 5 }],
    act('Cole', 'hold_lever', { stage: 'crusher', round: 1 }),
    act('Ash', 'push_lever:Bex', { stage: 'crusher', round: 1 }),
    act('Bex', 'stay', { stage: 'crusher', round: 1 }),
    ['round_start', { stage: 'ledge', round: 1, phase: 'play', roundsTotal: 20 }],
    act('Ash', 'shove:Bex', { stage: 'ledge', round: 1 }),
    act('Bex', 'shove:Cole', { stage: 'ledge', round: 1, valid: false }), // invalid, not counted
    act('Cole', 'dodge', { stage: 'ledge', round: 1 }),
  ],
);

const game2 = tape(
  'g2',
  [player('Ash', 'B', 'glass_eye'), player('Bex', 'A', 'nothing'), player('Cole', 'B', 'wedge'), player('Dara', 'A', 'map')],
  [{ name: 'Ash', place: null, diedAt: 'disc' }, { name: 'Bex', place: 1 }, { name: 'Dara', place: 2 }, { name: 'Cole', place: 3 }],
  [
    ['round_start', { ...bridge(1), phase: 'waiting', roundsTotal: 6 }],
    act('Bex', 'volunteer', bridge(1)),
    say('Ash', 'I hold the glass eye.', bridge(1)), // true
    ['whisper', { from: 'Cole', to: 'Bex', text: "I've got nothing at all.", ...bridge(1) }], // lie (wedge)
    say('Bex', 'I have nothing.', bridge(1)), // true
    ['round_start', { ...bridge(1), phase: 'crossing', roundsTotal: 8 }],
    act('Bex', 'step:L', bridge(1)),
    ['reveal', { ...bridge(1), what: 'weak_pane', data: { row: 1, weak: 'R' } }],
    ['death', { stage: 'disc', round: 2, name: 'Ash', cause: 'trapdoor', style: 'chute' }],
  ],
);

const byModel = (stats) => Object.fromEntries(stats.models.map((m) => [m.model, m]));

test('computeStats aggregates per model from two tapes', () => {
  const stats = computeStats([game1, game2]);
  assert.equal(stats.games, 2);
  assert.ok(Date.parse(stats.generatedAt));
  const { A, B } = byModel(stats);

  assert.equal(A.games, 4);
  assert.equal(A.meanPlace, 1.75);
  assert.equal(A.wins, 2);
  assert.equal(A.top3, 4);
  assert.deepEqual(A.deathsByStage, { bridge: 0, crusher: 0, pit: 0, disc: 0, ledge: 0 });
  assert.equal(A.volunteers, 2);
  assert.equal(A.frontOfBridge, 1);
  assert.equal(A.holdLever, 1);
  assert.equal(A.pushLever, 1);
  assert.equal(A.shoves, 1);

  assert.equal(B.games, 4);
  assert.equal(B.meanPlace, 3.25); // places 2, 4 (eliminated), 4 (eliminated), 3
  assert.equal(B.wins, 0);
  assert.equal(B.top3, 2);
  assert.deepEqual(B.deathsByStage, { bridge: 1, crusher: 0, pit: 0, disc: 1, ledge: 0 });
  assert.equal(B.shoves, 0); // the only shove was flagged invalid
  assert.equal(B.frontOfBridge, 1);
});

test('models are sorted by mean place', () => {
  assert.deepEqual(computeStats([game1, game2]).models.map((m) => m.model), ['A', 'B']);
});

test('power lies: false claims counted, true claims, denials, questions and third-person ignored', () => {
  const { A, B } = byModel(computeStats([game1, game2]));
  assert.equal(A.lies.power, 1); // Cole claimed the Anchor while holding the wedge
  assert.equal(B.lies.power, 2); // Bex claimed Glass Eye; Cole claimed to have nothing
});

test('side lies: contradicts the revealed pane; hedges, intentions and forged messages skipped', () => {
  const { A, B } = byModel(computeStats([game1, game2]));
  assert.equal(B.lies.side, 1); // Bex "go R" on row 1
  assert.equal(A.lies.side, 1); // Cole "Row 2: right is safe"
});

test('empty input is fine', () => {
  const stats = computeStats([]);
  assert.equal(stats.games, 0);
  assert.deepEqual(stats.models, []);
  assert.ok(stats.notes.some((n) => /heuristic/i.test(n)));
});

test('claimedPowers detects first-person claims only', () => {
  assert.deepEqual(claimedPowers("I'm the Glass Eye."), ['glass_eye']);
  assert.deepEqual(claimedPowers('I can jam the lever if needed.'), ['wedge']);
  assert.deepEqual(claimedPowers('My power is to trade places.'), ['swap']);
  assert.deepEqual(claimedPowers("I'm the Forger"), ['forger']);
  assert.deepEqual(claimedPowers('I have a feeling Bex is the glass eye.', ['Bex']), []);
  assert.deepEqual(claimedPowers('Who is the glass eye?'), []);
  assert.deepEqual(claimedPowers("I'm not the anchor."), []);
});

test('claimedSafeSide parses phrasings and ignores hedges', () => {
  assert.equal(claimedSafeSide('left is safe'), 'left');
  assert.equal(claimedSafeSide('The safe one is R'), 'right');
  assert.equal(claimedSafeSide('L is weak'), 'right');
  assert.equal(claimedSafeSide('right is not safe'), 'left');
  assert.equal(claimedSafeSide('step R, trust me'), 'right');
  assert.equal(claimedSafeSide('maybe left is safe'), null);
  assert.equal(claimedSafeSide("I'll go left"), null);
  assert.equal(claimedSafeSide('which side is safe?'), null);
});

test('safeSidesByRow combines reveals and auto steps', () => {
  const rows = safeSidesByRow([
    { type: 'reveal', what: 'weak_pane', data: { row: 1, weak: 'L' } },
    { type: 'action', stage: 'bridge', round: 3, auto: true, action: 'step:R' },
  ]);
  assert.equal(rows.get(1), 'right');
  assert.equal(rows.get(3), 'right');
});
