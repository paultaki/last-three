import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runLedge } from '../../src/stages/ledge.js';
import { footingReveals, ledgeGame, ofType } from './helpers.js';

async function afterRound1(plan, powers) {
  const g = ledgeGame({ plan: { 1: plan }, powers, config: { ledgeMaxRounds: 1 } });
  await runLedge(g);
  return footingReveals(g)[1];
}

test('starting footing: 3, anchor 4, and a holder who already used the feather starts at 1', async () => {
  const g = ledgeGame({ powers: { Ash: 'anchor', Bex: 'feather', Cole: 'nothing' } });
  g.spent.add('Bex');
  await runLedge(g);
  assert.deepEqual(footingReveals(g)[0], { Ash: 4, Bex: 1, Cole: 3 });
  const plain = ledgeGame();
  await runLedge(plain);
  assert.deepEqual(footingReveals(plain)[0], { Ash: 3, Bex: 3, Cole: 3 });
});

test('shoving a bracing agent costs the shover 1; the target loses nothing', async () => {
  assert.deepEqual(await afterRound1({ Ash: 'shove:Bex', Bex: 'brace' }), { Ash: 2, Bex: 3, Cole: 3 });
});

test('shoving a dodging agent costs the shover 2', async () => {
  assert.deepEqual(await afterRound1({ Ash: 'shove:Bex', Bex: 'dodge' }), { Ash: 1, Bex: 3, Cole: 3 });
  assert.deepEqual(await afterRound1({ Ash: 'shove:Cole', Bex: 'shove:Cole', Cole: 'dodge' }), { Ash: 1, Bex: 1, Cole: 3 });
});

test('an exposed (shoving) target loses 1 per shover; bracing shovers pay too', async () => {
  // Ash shoves Bex; Bex (exposed) shoves Cole who braces: Bex -1 (from Ash) -1 (braced Cole), Ash 0.
  assert.deepEqual(await afterRound1({ Ash: 'shove:Bex', Bex: 'shove:Cole', Cole: 'brace' }), { Ash: 3, Bex: 1, Cole: 3 });
  // Cole is shoved by Ash and Bex while shoving Ash: exposed to two shovers.
  assert.deepEqual(await afterRound1({ Ash: 'shove:Cole', Bex: 'shove:Cole', Cole: 'shove:Ash' }), { Ash: 2, Bex: 3, Cole: 1 });
});

test('mutual shoving: both are exposed and lose 1 each', async () => {
  assert.deepEqual(await afterRound1({ Ash: 'shove:Bex', Bex: 'shove:Ash' }), { Ash: 2, Bex: 2, Cole: 3 });
});

test('shrink schedule: rounds 2, 4, 6, then every round from 7; feather catches one fall', async () => {
  const views = [];
  const g = ledgeGame({ powers: { Ash: 'anchor', Bex: 'feather', Cole: 'nothing' }, views });
  await runLedge(g);
  const reveals = footingReveals(g).slice(1);
  assert.deepEqual(reveals, [
    { Ash: 4, Bex: 3, Cole: 3 }, // r1
    { Ash: 3, Bex: 2, Cole: 2 }, // r2 shrink
    { Ash: 3, Bex: 2, Cole: 2 }, // r3
    { Ash: 2, Bex: 1, Cole: 1 }, // r4 shrink
    { Ash: 2, Bex: 1, Cole: 1 }, // r5
    { Ash: 1, Bex: 1, Cole: 0 }, // r6 shrink: Bex hits 0 but the feather lifts them to 1
    { Ash: 0, Bex: 0 }, // r7 shrinks again (every round from 7), both left would fall
  ]);
  const ash = views.filter((v) => v.you === 'Ash');
  assert.deepEqual(ash.map((v) => v.stageState.shrinkIn), [2, 1, 2, 1, 2, 1, 1]);
  assert.deepEqual(ash.map((v) => v.stageState.footing.Ash), [4, 4, 3, 3, 2, 2, 1]);
  assert.deepEqual(ofType(g.events, 'ability_use').map((e) => [e.name, e.power, e.round]), [['Bex', 'feather', 6]]);
  const deaths = ofType(g.events, 'death');
  assert.deepEqual(deaths.map((d) => [d.name, d.round, d.place]), [['Cole', 6, 3], [deaths[1].name, 7, 2]]);
  const lucky = ofType(g.events, 'lucky_save');
  assert.deepEqual([lucky.length, lucky[0].round], [1, 7]);
  assert.ok(g.alive.size === 1 && g.alive.has(lucky[0].name));
});

test('maximum rounds: roundsTotal is 20; at the limit the ledge collapses, ordered by footing then RNG', async () => {
  const views = [];
  const normal = ledgeGame({ views });
  await runLedge(normal);
  assert.equal(views[0].roundsTotal, 20);

  const g = ledgeGame({ powers: { Ash: 'anchor', Bex: 'map', Cole: 'wedge' }, config: { ledgeMaxRounds: 3 } });
  await runLedge(g);
  assert.equal(ofType(g.events, 'round_start').length, 3);
  const deaths = ofType(g.events, 'death');
  assert.deepEqual(deaths.map((d) => d.place), [3, 2]);
  assert.ok(deaths.every((d) => d.round === 3 && d.cause === 'ledge' && d.style === 'tumble' && d.name !== 'Ash'));
  assert.deepEqual([...g.alive], ['Ash']);
});

test('ledge view: footing is public, legal actions are brace, dodge and shove:<other alive>', async () => {
  const views = [];
  const g = ledgeGame({ views });
  await runLedge(g);
  const first = views.find((v) => v.you === 'Ash');
  assert.deepEqual(first.legalActions, ['brace', 'dodge', 'shove:Bex', 'shove:Cole']);
  assert.deepEqual(first.stageState.footing, { Ash: 3, Bex: 3, Cole: 3 });
  assert.deepEqual([first.stage, first.phase, first.round], ['ledge', 'play', 1]);
  assert.doesNotMatch(first.rules, /feather|anchor|wedge/i);
});
