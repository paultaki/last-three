import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runCrusher } from '../../src/stages/crusher.js';
import { SEATS, fixedAgents, idle, makeGame, ofType, reply, spy } from './helpers.js';

/** Everyone idles (stay) except the listed seats, which play the given action every round. */
const actors = (plays) => Object.fromEntries(Object.entries(plays).map(([seat, action]) => [seat, (view) => (view.legalActions.includes(action) ? reply(action) : idle(view))]));
const crusherGame = (plays, extra = {}) => makeGame({ ...extra, agents: fixedAgents(idle, actors(plays)) });
const deathsOf = (g) => ofType(g.events, 'death');
const ceilings = (g) => ofType(g.events, 'reveal').filter((e) => e.what === 'ceiling').map((e) => e.data);

test('nobody holds the lever: ceiling lowers rounds 1-4, then round 5 kills all but exactly one lucky survivor', async () => {
  const g = crusherGame({}, { powers: { Ash: 'feather' }, seed: 5 });
  g.spent.add('Ash'); // feather already spent, so only the floor rule can save someone
  await runCrusher(g);
  assert.deepEqual(ceilings(g).map((c) => c.ceiling), [4, 3, 2, 1, 0]);
  assert.equal(deathsOf(g).length, 7);
  assert.ok(deathsOf(g).every((d) => d.cause === 'crusher' && d.style === 'flatten' && d.round === 5));
  const lucky = ofType(g.events, 'lucky_save');
  assert.equal(lucky.length, 1);
  assert.equal(g.alive.size, 1);
  assert.deepEqual([...g.alive], [lucky[0].name]);
});

test('deadline with the feather unspent: the holder survives by feather and no lucky_save is needed', async () => {
  const g = crusherGame({}, { powers: { Cole: 'feather' } });
  await runCrusher(g);
  assert.equal(ofType(g.events, 'lucky_save').length, 0);
  assert.deepEqual([...g.alive], ['Cole']);
  assert.equal(deathsOf(g).length, 7);
  assert.equal(ofType(g.events, 'ability_use')[0].power, 'feather');
});

test('hold_lever ends the room in that round: others escape, the holder dives with p = 0.25', async () => {
  let survived = 0;
  const trials = 400;
  for (let seed = 1; seed <= trials; seed++) {
    const g = crusherGame({ Bex: 'hold_lever' }, { seed, powers: { Hana: 'feather' } });
    g.spent.add('Hana');
    await runCrusher(g);
    assert.equal(ofType(g.events, 'round_start').length, 1, 'stage ends after the holder round');
    const dead = deathsOf(g);
    assert.ok(dead.length <= 1 && dead.every((d) => d.name === 'Bex' && d.cause === 'crusher' && d.style === 'flatten'));
    assert.equal(g.alive.size, 8 - dead.length);
    if (!dead.length) survived += 1;
  }
  const rate = survived / trials;
  assert.ok(rate > 0.18 && rate < 0.32, `dive survival rate ${rate}`);
});

test('several agents holding the lever: the RNG picks exactly one holder, over seeds each can be picked', async () => {
  const picked = new Set();
  for (let seed = 1; seed <= 60; seed++) {
    const g = crusherGame({ Ash: 'hold_lever', Cole: 'hold_lever', Gus: 'hold_lever' }, { seed });
    await runCrusher(g);
    const reveal = ofType(g.events, 'reveal').find((e) => e.what === 'ceiling');
    assert.ok(['Ash', 'Cole', 'Gus'].includes(reveal.data.leverHolder));
    picked.add(reveal.data.leverHolder);
    assert.ok(deathsOf(g).length <= 1);
  }
  assert.equal(picked.size, 3);
});

test('push_lever puts the target on the lever when nobody holds it', async () => {
  const g = crusherGame({ Ash: 'push_lever:Dara', Bex: 'push_lever:Dara' }, { powers: { Hana: 'nothing', Dara: 'map' } });
  await runCrusher(g);
  const reveal = ofType(g.events, 'reveal')[0];
  assert.equal(reveal.data.leverHolder, 'Dara');
  assert.ok(deathsOf(g).every((d) => d.name === 'Dara'));
});

test('push_lever fails against the anchor holder: the push is logged and the ceiling keeps lowering', async () => {
  const g = crusherGame({ Ash: 'push_lever:Dara' }, { powers: { Dara: 'anchor' } });
  g.spent.add(g.holderOf('feather'));
  await runCrusher(g);
  const anchor = ofType(g.events, 'ability_use').filter((e) => e.power === 'anchor');
  assert.equal(anchor.length, 5, 'one failed push logged per round');
  assert.ok(anchor.every((e) => e.name === 'Dara'));
  assert.deepEqual(ceilings(g).map((c) => c.ceiling), [4, 3, 2, 1, 0]);
  assert.equal(g.alive.size, 1, 'the deadline still happens: one lucky survivor');
});

test('a valid push still works when another push at the anchor fails; holders beat pushes', async () => {
  const g = crusherGame({ Ash: 'push_lever:Dara', Bex: 'push_lever:Eli' }, { powers: { Dara: 'anchor', Eli: 'nothing' } });
  await runCrusher(g);
  assert.equal(ofType(g.events, 'reveal')[0].data.leverHolder, 'Eli');
  const h = crusherGame({ Ash: 'hold_lever', Bex: 'push_lever:Cole' });
  await runCrusher(h);
  assert.equal(ofType(h.events, 'reveal')[0].data.leverHolder, 'Ash');
});

test('wedge jam_lever: every other agent walks out, the stage ends that round, the jam beats a lever holder', async () => {
  const g = crusherGame({ Fenn: 'jam_lever', Ash: 'hold_lever' }, { powers: { Fenn: 'wedge' } });
  await runCrusher(g);
  const dead = deathsOf(g);
  assert.ok(dead.length <= 1 && dead.every((d) => d.name === 'Fenn' && d.cause === 'crusher' && d.style === 'flatten'), 'only the jammer can be caught');
  assert.equal(g.alive.size, 8 - dead.length);
  assert.ok(g.alive.has('Ash'), 'the lever holder is not caught: the jam wins');
  assert.equal(ofType(g.events, 'round_start').length, 1);
  assert.deepEqual(ofType(g.events, 'ability_use').map((e) => [e.name, e.power]), [['Fenn', 'wedge']]);
  assert.ok(g.spent.has('Fenn'));
  const reveal = ofType(g.events, 'reveal')[0].data;
  assert.equal(reveal.jammed, true);
  assert.equal(reveal.leverHolder, 'Fenn');
  assert.equal(reveal.dive, dead.length === 0);
});

test('wedge jam_lever: the jammer survives the dive about half the time, and the same seed always gives the same result', async () => {
  const run = async (seed) => {
    const g = crusherGame({ Fenn: 'jam_lever' }, { seed, powers: { Fenn: 'wedge' } });
    await runCrusher(g);
    return g.alive.has('Fenn');
  };
  let survived = 0;
  const trials = 600;
  for (let seed = 1; seed <= trials; seed++) {
    const first = await run(seed);
    assert.equal(first, await run(seed), `seed ${seed} is deterministic`);
    if (first) survived += 1;
  }
  const rate = survived / trials;
  assert.ok(rate > 0.44 && rate < 0.56, `jam dive survival rate ${rate}`);
});

test('wedge jam_lever: the jammer who loses the dive dies on the crusher and everyone else is untouched', async () => {
  for (let seed = 1; seed <= 40; seed++) {
    const g = crusherGame({ Fenn: 'jam_lever' }, { seed, powers: { Fenn: 'wedge' } });
    await runCrusher(g);
    if (g.alive.has('Fenn')) continue;
    assert.deepEqual(deathsOf(g).map((d) => [d.name, d.cause, d.style]), [['Fenn', 'crusher', 'flatten']]);
    assert.equal(g.alive.size, 7);
    return;
  }
  assert.fail('no failed dive in 40 seeds');
});

test('a feather held by someone else never fires when the jammer is caught', async () => {
  for (let seed = 1; seed <= 40; seed++) {
    const g = crusherGame({ Fenn: 'jam_lever' }, { seed, powers: { Fenn: 'wedge', Ash: 'feather' } });
    await runCrusher(g);
    assert.equal(ofType(g.events, 'ability_use').filter((e) => e.power === 'feather').length, 0);
  }
});

test('jam_lever is only legal for an unspent wedge holder; others using it are invalid', async () => {
  const views = [];
  const g = makeGame({ powers: { Fenn: 'wedge' }, agents: fixedAgents(spy(idle, views), { Ash: () => reply('jam_lever') }) });
  await runCrusher(g);
  const round1 = views.filter((v) => v.round === 1);
  for (const v of round1) assert.equal(v.legalActions.includes('jam_lever'), v.you === 'Fenn', v.you);
  const ash = ofType(g.events, 'action').find((a) => a.name === 'Ash' && a.round === 1);
  assert.deepEqual([ash.action, ash.valid], ['stay', false]);

  const spent = makeGame({ powers: { Fenn: 'wedge' }, agents: fixedAgents(spy(idle, (views.length = 0, views))) });
  spent.spent.add('Fenn');
  await runCrusher(spent);
  assert.ok(views.every((v) => !v.legalActions.includes('jam_lever')));
});

test('feather holder who loses the dive is saved and the stage still ends', async () => {
  let checked = 0;
  for (let seed = 1; seed <= 80 && checked < 3; seed++) {
    const g = crusherGame({ Gus: 'hold_lever' }, { seed, powers: { Gus: 'feather' } });
    await runCrusher(g);
    if (ofType(g.events, 'reveal')[0].data.dive) continue;
    checked += 1;
    assert.equal(deathsOf(g).length, 0);
    assert.deepEqual(ofType(g.events, 'ability_use').map((e) => e.power), ['feather']);
    assert.equal(g.alive.size, 8);
  }
  assert.equal(checked, 3);
});

test('crusher view: legal actions, ceiling 5 down to 1, rules never mention powers the viewer lacks', async () => {
  const views = [];
  const g = makeGame({ powers: { Fenn: 'wedge' }, agents: fixedAgents(spy(idle, views)) });
  await runCrusher(g);
  const ash = views.filter((v) => v.you === 'Ash');
  assert.deepEqual(ash.map((v) => v.stageState.ceiling), [5, 4, 3, 2, 1]);
  assert.deepEqual(ash[0].legalActions, ['stay', 'hold_lever', ...SEATS.slice(1).map((n) => `push_lever:${n}`)]);
  assert.ok(ash.every((v) => v.roundsTotal === 5 && v.stageState.leverHolder === null && v.phase === 'play'));
  for (const v of ash) assert.doesNotMatch(v.rules, /jam|wedge/i);
  const fenn = views.find((v) => v.you === 'Fenn');
  assert.match(fenn.rules, /jam_lever/);
  assert.match(fenn.rules, /only about half the time/);
  assert.match(fenn.power.description, /about half the time/);
});
