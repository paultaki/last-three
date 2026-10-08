import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runLedge } from '../../src/stages/ledge.js';
import { ledgeGame, ofType } from './helpers.js';

test('lowest footing falls first and takes the worst place; the last standing is 1st', async () => {
  const g = ledgeGame({
    plan: {
      1: { Ash: 'shove:Bex', Bex: 'dodge', Cole: 'shove:Bex' },
      2: { Bex: 'dodge', Cole: 'shove:Bex' },
    },
  });
  await runLedge(g);
  const deaths = ofType(g.events, 'death');
  assert.deepEqual(deaths.map((d) => [d.name, d.round, d.place]), [['Cole', 2, 3], ['Ash', 2, 2]]);
  assert.deepEqual([...g.alive], ['Bex']);
  assert.equal(ofType(g.events, 'lucky_save').length, 0);
});

test('simultaneous falls with equal footing are ordered by the seeded RNG; places still 3 then 2', async () => {
  const orders = new Set();
  for (let seed = 1; seed <= 30; seed++) {
    const g = ledgeGame({ seed, plan: { 1: { Ash: 'shove:Bex', Bex: 'dodge', Cole: 'shove:Bex' }, 2: { Ash: 'shove:Bex', Bex: 'dodge', Cole: 'shove:Bex' } } });
    await runLedge(g);
    const deaths = ofType(g.events, 'death');
    assert.deepEqual(deaths.map((d) => d.place), [3, 2]);
    assert.deepEqual([...g.alive], ['Bex']);
    orders.add(deaths.map((d) => d.name).join('>'));
  }
  assert.deepEqual([...orders].sort(), ['Ash>Cole', 'Cole>Ash']);
});

test('everybody falling in the same round: highest footing (ties by RNG) is left standing in 1st', async () => {
  const g = ledgeGame({}); // all brace: all three hit 0 together at the end of round 6
  await runLedge(g);
  const lucky = ofType(g.events, 'lucky_save');
  assert.equal(lucky.length, 1);
  assert.equal(lucky[0].round, 6);
  assert.deepEqual(ofType(g.events, 'death').map((d) => d.place), [3, 2]);
  assert.deepEqual([...g.alive], [lucky[0].name]);
  assert.ok(ofType(g.events, 'death').every((d) => d.name !== lucky[0].name));
});

test('all falling together with unequal footing: the lowest takes 3rd, the highest two share the top by RNG', async () => {
  const g = ledgeGame({ powers: { Ash: 'anchor', Bex: 'map', Cole: 'wedge' }, plan: { 6: { Ash: 'shove:Bex', Bex: 'dodge' } } });
  await runLedge(g);
  const deaths = ofType(g.events, 'death');
  assert.deepEqual([deaths[0].name, deaths[0].place, deaths[1].place], ['Ash', 3, 2]);
  assert.equal(ofType(g.events, 'lucky_save').length, 1);
  assert.ok(['Bex', 'Cole'].includes([...g.alive][0]));
});

test('with exactly two on the ledge the first to fall is 2nd and the survivor 1st', async () => {
  const g = ledgeGame({ fighters: ['Ash', 'Bex'], plan: { 1: { Ash: 'shove:Bex' }, 2: { Ash: 'shove:Bex' } } });
  await runLedge(g);
  assert.deepEqual(ofType(g.events, 'death').map((d) => [d.name, d.round, d.place]), [['Ash', 2, 2]]);
  assert.deepEqual([...g.alive], ['Bex']);
});

test('four on the ledge (a feather survivor from the disc): the first to fall earns no place', async () => {
  const g = ledgeGame({ fighters: ['Ash', 'Bex', 'Cole', 'Dara'], powers: { Ash: 'nothing', Bex: 'map', Cole: 'wedge', Dara: 'swap' }, plan: { 1: { Ash: 'shove:Bex' }, 2: { Ash: 'shove:Bex' } } });
  await runLedge(g);
  const deaths = ofType(g.events, 'death');
  assert.equal(deaths[0].name, 'Ash');
  assert.equal('place' in deaths[0], false);
  assert.deepEqual(deaths.slice(1).map((d) => d.place), [3, 2]);
});

test('feather: the first fall is cancelled with footing 1; it is not cancelled twice', async () => {
  const shoveDodger = { Ash: 'shove:Bex', Bex: 'dodge' };
  const g = ledgeGame({
    powers: { Ash: 'feather', Bex: 'map', Cole: 'wedge' },
    plan: { 1: shoveDodger, 2: shoveDodger, 3: shoveDodger, 4: shoveDodger },
  });
  await runLedge(g);
  assert.deepEqual(ofType(g.events, 'ability_use').map((e) => [e.name, e.power, e.round]), [['Ash', 'feather', 2]]);
  assert.deepEqual(ofType(g.events, 'death').map((d) => [d.name, d.round, d.place]).slice(0, 1), [['Ash', 3, 3]]);
  assert.ok(g.spent.has('Ash'));
});
