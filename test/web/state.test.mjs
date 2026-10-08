// Node unit tests for the viewer's pure reducer (web/lib/state.js).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stateAt, aliveNames, chapters, isStepWorthy } from '../../web/lib/state.js';

const tapesDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'web', 'tapes');
const load = (id) => JSON.parse(fs.readFileSync(path.join(tapesDir, `${id}.json`), 'utf8'));
const sample = load('sample');
const idxOf = (pred) => sample.events.findIndex(pred);

test('stateAt is a pure function of (tape, i)', () => {
  const a = stateAt(sample, 120);
  const b = stateAt(sample, 120);
  assert.deepEqual(a, b);
  stateAt(sample, 250);
  assert.deepEqual(stateAt(sample, 120), a, 'folding further must not mutate the earlier result');
});

test('before the first event everyone is alive in the lobby', () => {
  const s = stateAt(sample, -1);
  assert.equal(s.stage, 'lobby');
  assert.equal(aliveNames(s).length, 8);
});

test('bridge: line, rows and deaths', () => {
  const afterVolunteer = stateAt(sample, idxOf((e) => e.type === 'reveal' && e.what === 'line' && e.data.line[0] === 'Fenn'));
  assert.equal(afterVolunteer.bridge.line[0], 'Fenn');
  const fenn = idxOf((e) => e.type === 'death' && e.name === 'Fenn');
  const s = stateAt(sample, fenn);
  assert.equal(s.players.Fenn.alive, false);
  assert.equal(s.players.Fenn.fate.style, 'shatter');
  assert.equal(s.bridge.line[0], 'Eli', 'next in line becomes the front');
  const after = stateAt(sample, fenn + 3);
  assert.equal(after.bridge.rows[4].by, 'Fenn');
  assert.equal(after.bridge.rows[4].weak, 'R');
  assert.equal(after.bridge.at.Eli.side, 'L');
});

test('feather bounce keeps the front alive but the pane is marked broken', () => {
  const i = idxOf((e) => e.type === 'reveal' && e.what === 'weak_pane' && e.data.row === 2);
  const s = stateAt(sample, i);
  assert.equal(s.players.Fenn.alive, true);
  assert.equal(s.bridge.rows[2].by, 'Fenn');
  assert.deepEqual(s.bridge.at.Fenn, { row: 2, side: 'R' });
});

test('crusher: holder inferred from the lever action, slab crushes on the flatten', () => {
  const hold = idxOf((e) => e.type === 'action' && e.action === 'hold_lever');
  const s = stateAt(sample, hold);
  assert.equal(s.crusher.holder, 'Dara');
  assert.equal(s.crusher.door, true);
  const dead = stateAt(sample, hold + 1);
  assert.equal(dead.players.Dara.fate.style, 'flatten');
  assert.equal(dead.crusher.crushed, true);
});

test('disc: bump, swap and chute deaths', () => {
  const tiles = idxOf((e) => e.type === 'reveal' && e.what === 'tiles');
  assert.equal(stateAt(sample, tiles).disc.tiles.Cole, 4);
  const swap = idxOf((e) => e.type === 'ability_use' && e.power === 'swap');
  const s = stateAt(sample, swap);
  assert.equal(s.disc.tiles.Bex, 2);
  assert.equal(s.disc.tiles.Hana, 3);
  const open = stateAt(sample, idxOf((e) => e.type === 'reveal' && e.what === 'trapdoors'));
  assert.deepEqual([...open.disc.open].sort(), [2, 4]);
  assert.equal(open.players.Bex.fate.style, 'chute');
});

test('ledge: footing, falls with places, winner', () => {
  const end = stateAt(sample, sample.events.length - 1);
  assert.equal(end.ended, true);
  assert.equal(end.winner, 'Ash');
  assert.equal(end.players.Gus.place, 3);
  assert.equal(end.players.Hana.place, 2);
  assert.equal(aliveNames(end).join(), 'Ash');
  assert.equal(end.deaths.length, 7);
});

test('captions never leak thoughts when the cut is off', () => {
  const t = idxOf((e) => e.type === 'thought');
  const s = stateAt(sample, t);
  assert.ok(!s.caption || !/thinks/.test(s.caption.text));
  assert.match(s.captionCut.text, /thinks/);
});

test('forged say shows the forged name publicly and the sender in the cut', () => {
  const i = idxOf((e) => e.type === 'say' && e.forgedAs);
  const s = stateAt(sample, i);
  assert.match(s.caption.text, /^Hana:/);
  assert.match(s.captionCut.text, /forged by Cole/);
  assert.equal(s.speech.at(-1).as, 'Hana');
});

test('chapters cover all four stages and the result', () => {
  assert.deepEqual(chapters(sample).map((c) => c.id), ['start', 'bridge', 'crusher', 'disc', 'ledge', 'results']);
});

test('isStepWorthy skips secrets unless the cut is on', () => {
  assert.equal(isStepWorthy({ type: 'thought' }, false), false);
  assert.equal(isStepWorthy({ type: 'thought' }, true), true);
  assert.equal(isStepWorthy({ type: 'action', action: 'hold' }, false), false);
  assert.equal(isStepWorthy({ type: 'death' }, false), true);
});

for (const id of ['42', '7']) {
  const file = path.join(tapesDir, `${id}.json`);
  if (!fs.existsSync(file)) continue;
  test(`engine tape ${id}: every index folds without throwing and ends consistently`, () => {
    const tape = load(id);
    for (let i = -1; i < tape.events.length; i += 1) stateAt(tape, i);
    const end = stateAt(tape, tape.events.length - 1);
    assert.equal(end.ended, true);
    assert.ok(aliveNames(end).length <= 3);
  });
}
