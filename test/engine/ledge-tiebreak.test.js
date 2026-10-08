import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collapse, resolveFalls, runLedge } from '../../src/stages/ledge.js';
import { ledgeRules, mapKnowledge } from '../../src/rules.js';
import { SEATS, ledgeGame, makeGame, ofType } from './helpers.js';

// Rules v3: ties on the ledge go to footing (unclamped), then landed shoves, then the RNG.

const gameWith = (alive, seed = 1) => {
  const g = makeGame({ seed, dead: SEATS.filter((s) => !alive.includes(s)), powers: { Ash: 'nothing', Bex: 'map', Cole: 'wedge', Dara: 'glass_eye' } });
  g.stage = 'ledge';
  return g;
};
const fell = (g) => ofType(g.events, 'death').map((d) => [d.name, d.place ?? null]);
const lucky = (g) => ofType(g.events, 'lucky_save');

test('same-round falls: lower footing falls first, below zero counts', () => {
  const g = gameWith(['Ash', 'Bex', 'Cole', 'Dara']);
  resolveFalls(g, ['Ash', 'Bex', 'Cole'], { Ash: 0, Bex: -2, Cole: -1, Dara: 3 }, { Ash: 9, Bex: 0, Cole: 0, Dara: 0 });
  assert.deepEqual(fell(g), [['Bex', null], ['Cole', 3], ['Ash', 2]]);
  assert.equal(lucky(g).length, 0);
});

test('same-round falls with equal footing: fewer landed shoves falls first, whatever the RNG says', () => {
  for (let seed = 1; seed <= 30; seed++) {
    const g = gameWith(['Ash', 'Bex', 'Cole', 'Dara'], seed);
    resolveFalls(g, ['Ash', 'Bex', 'Cole'], { Ash: 0, Bex: 0, Cole: 0, Dara: 3 }, { Ash: 2, Bex: 0, Cole: 1, Dara: 0 });
    assert.deepEqual(fell(g).map(([n]) => n), ['Bex', 'Cole', 'Ash'], `seed ${seed}`);
  }
});

test('same-round falls tied on footing and landed shoves are ordered by the RNG: both orders occur', () => {
  const firsts = new Set();
  for (let seed = 1; seed <= 30; seed++) {
    const g = gameWith(['Ash', 'Bex', 'Cole'], seed);
    resolveFalls(g, ['Ash', 'Bex'], { Ash: 0, Bex: 0, Cole: 3 }, { Ash: 1, Bex: 1, Cole: 0 });
    firsts.add(fell(g)[0][0]);
  }
  assert.deepEqual([...firsts].sort(), ['Ash', 'Bex']);
});

test('everyone would fall: the best footing is saved, with the photo-finish-on-footing reason', () => {
  for (let seed = 1; seed <= 20; seed++) {
    const g = gameWith(['Ash', 'Bex', 'Cole'], seed);
    resolveFalls(g, ['Ash', 'Bex', 'Cole'], { Ash: -1, Bex: 0, Cole: -2 }, { Ash: 5, Bex: 0, Cole: 5 });
    assert.deepEqual(lucky(g).map((e) => [e.name, e.why]), [['Bex', 'won the photo finish on footing']]);
    assert.deepEqual(fell(g), [['Cole', 3], ['Ash', 2]]);
    assert.deepEqual([...g.alive], ['Bex']);
  }
});

test('everyone would fall with equal top footing: the most landed shoves is saved, reason shoves landed', () => {
  for (let seed = 1; seed <= 20; seed++) {
    const g = gameWith(['Ash', 'Bex', 'Cole'], seed);
    resolveFalls(g, ['Ash', 'Bex', 'Cole'], { Ash: -1, Bex: -1, Cole: -1 }, { Ash: 1, Bex: 3, Cole: 2 });
    assert.deepEqual(lucky(g).map((e) => [e.name, e.why]), [['Bex', 'won the photo finish on shoves landed']]);
    assert.deepEqual(fell(g), [['Ash', 3], ['Cole', 2]]);
  }
});

test('everyone would fall, equal footing and equal landed shoves: the RNG decides and the reason is a last toe-hold', () => {
  const winners = new Set();
  for (let seed = 1; seed <= 30; seed++) {
    const g = gameWith(['Ash', 'Bex', 'Cole'], seed);
    resolveFalls(g, ['Ash', 'Bex', 'Cole'], { Ash: 0, Bex: 0, Cole: 0 }, { Ash: 1, Bex: 1, Cole: 1 });
    assert.equal(lucky(g).length, 1);
    assert.equal(lucky(g)[0].why, 'a last toe-hold');
    winners.add(lucky(g)[0].name);
  }
  assert.equal(winners.size, 3);
});

test('the reason looks at the runner-up: a footing lead is reported as footing even when shoves also differ', () => {
  const g = gameWith(['Ash', 'Bex']);
  resolveFalls(g, ['Ash', 'Bex'], { Ash: 0, Bex: -1 }, { Ash: 0, Bex: 7 });
  assert.equal(lucky(g)[0].name, 'Ash');
  assert.equal(lucky(g)[0].why, 'won the photo finish on footing');
  const h = gameWith(['Ash', 'Bex']);
  resolveFalls(h, ['Ash', 'Bex'], { Ash: 0, Bex: 0 }, { Ash: 0, Bex: 7 });
  assert.equal(lucky(h)[0].name, 'Bex');
  assert.equal(lucky(h)[0].why, 'won the photo finish on shoves landed');
});

test('the public log says the photo finish, not luck, when it was not a coin flip', () => {
  const g = gameWith(['Ash', 'Bex']);
  resolveFalls(g, ['Ash', 'Bex'], { Ash: 0, Bex: -1 }, { Ash: 0, Bex: 0 });
  assert.ok(g.log.some((l) => /Ash is the last one left on the ledge: won the photo finish on footing/.test(l)));
  const h = gameWith(['Ash', 'Bex']);
  resolveFalls(h, ['Ash', 'Bex'], { Ash: 0, Bex: 0 }, { Ash: 0, Bex: 0 });
  assert.ok(h.log.some((l) => /saved by luck: a last toe-hold/.test(l)));
});

test('round-20 collapse ranks by footing, then landed shoves, then the RNG; the best stays', () => {
  const g = gameWith(['Ash', 'Bex', 'Cole', 'Dara']);
  collapse(g, { Ash: 2, Bex: 2, Cole: 1, Dara: 2 }, { Ash: 0, Bex: 3, Cole: 9, Dara: 1 });
  assert.deepEqual(fell(g), [['Cole', null], ['Ash', 3], ['Dara', 2]]);
  assert.deepEqual([...g.alive], ['Bex']);
});

test('collapse tied on footing and landed shoves: the RNG picks the survivor, every candidate can win', () => {
  const winners = new Set();
  for (let seed = 1; seed <= 30; seed++) {
    const g = gameWith(['Ash', 'Bex', 'Cole'], seed);
    collapse(g, { Ash: 1, Bex: 1, Cole: 1 }, { Ash: 2, Bex: 2, Cole: 2 });
    winners.add([...g.alive][0]);
  }
  assert.equal(winners.size, 3);
});

test('end to end: landed shoves count only against a target that was shoving too, and are public', async () => {
  const views = [];
  const plan = {
    1: { Ash: 'shove:Bex', Bex: 'shove:Ash', Cole: 'brace' }, // both land
    2: { Ash: 'dodge', Bex: 'brace', Cole: 'shove:Bex' }, // Cole shoves a bracing Bex: nothing lands
    3: { Ash: 'shove:Bex', Bex: 'shove:Cole', Cole: 'dodge' }, // Ash lands on Bex (Bex is shoving); Bex's shove at a dodger does not
  };
  const g = ledgeGame({ plan, views });
  await runLedge(g);
  const at = (round, you = 'Cole') => views.find((v) => v.round === round && v.you === you).stageState.landedShoves;
  assert.deepEqual(at(1), { Ash: 0, Bex: 0, Cole: 0 });
  assert.deepEqual(at(2), { Ash: 1, Bex: 1, Cole: 0 });
  assert.deepEqual(at(3), { Ash: 1, Bex: 1, Cole: 0 });
  assert.deepEqual(at(4), { Ash: 2, Cole: 0 }, 'Bex fell in round 3');
  assert.deepEqual(at(2, 'Ash'), at(2, 'Bex'), 'identical for every viewer');
  const reveals = ofType(g.events, 'reveal').filter((e) => e.what === 'footing');
  assert.deepEqual(reveals[0].data.landedShoves, { Ash: 0, Bex: 0, Cole: 0 });
  assert.deepEqual(reveals[1].data.landedShoves, { Ash: 1, Bex: 1, Cole: 0 });
});

test('end to end: three evenly matched agents all hit zero together and the winner is a coin flip', async () => {
  const reasons = new Set();
  for (let seed = 1; seed <= 12; seed++) {
    const g = ledgeGame({ seed });
    await runLedge(g);
    const saves = lucky(g);
    assert.equal(saves.length, 1);
    reasons.add(saves[0].why);
  }
  assert.deepEqual([...reasons], ['a last toe-hold']);
});

test('the rules text and the Map copy explain the tie-break in plain words', () => {
  for (const text of [ledgeRules(1), ledgeRules(2), mapKnowledge()[4]]) {
    assert.match(text, /Footing ties go to more landed shoves/);
    assert.match(text, /a tie in both is settled at random/);
    assert.match(text, /landed shoves \(shoves at an agent who was also shoving/);
  }
});
