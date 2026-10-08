import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runLedge } from '../../src/stages/ledge.js';
import { runPit } from '../../src/stages/pit.js';
import { PIT_LIFTS_PER_ROUND, PIT_ROUNDS, ROPE_COST_FOOTING, pitRules } from '../../src/rules.js';
import { SEATS, fixedAgents, idle, makeGame, ofType, reply, spy } from './helpers.js';

const ALL = SEATS;
const dead = (alive) => SEATS.filter((s) => !alive.includes(s));

/**
 * A pit with `alive` in it. `plan[round][seat]` is the action that seat plays in that round when it
 * is legal; everyone else plays the quiet default (wait down, leave out).
 */
function pitGame({ plan = {}, alive = ALL, powers = {}, seed = 1, views = [] } = {}) {
  const policy = (view) => {
    const wanted = plan[view.round]?.[view.you];
    return wanted && view.legalActions.includes(wanted) ? reply(wanted) : idle(view);
  };
  const g = makeGame({ seed, powers, agents: fixedAgents(spy(policy, views)), dead: dead(alive) });
  return g;
}

const reveals = (g, what = 'pit') => ofType(g.events, 'reveal').filter((e) => e.what === what).map((e) => e.data);
const deaths = (g) => ofType(g.events, 'death');
const viewOf = (views, you, round) => views.find((v) => v.you === you && v.round === round);
const feather = (g) => g.holderOf('feather');

// ---- base selection -----------------------------------------------------------------------

test('a volunteer beats a push: with offer_back in the room, push_base is ignored', async () => {
  const g = pitGame({ plan: { 1: { Ash: 'offer_back', Bex: 'push_base:Cole' } } });
  await runPit(g);
  assert.equal(reveals(g)[0].base, 'Ash');
});

test('several volunteers: the RNG picks one, every volunteer can be picked, the others stay down and may climb', async () => {
  const picked = new Set();
  for (let seed = 1; seed <= 40; seed++) {
    const g = pitGame({ seed, plan: { 1: { Ash: 'offer_back', Bex: 'offer_back', Cole: 'offer_back' }, 2: { Ash: 'climb', Bex: 'climb', Cole: 'climb' } } });
    await runPit(g);
    const [r1, r2] = reveals(g);
    assert.ok(['Ash', 'Bex', 'Cole'].includes(r1.base));
    picked.add(r1.base);
    assert.ok(r1.down.includes('Ash') && r1.down.includes('Bex') && r1.down.includes('Cole'), 'nobody is out in round 1');
    assert.deepEqual(r2.lifted.sort(), ['Ash', 'Bex', 'Cole'].filter((n) => n !== r1.base).sort(), 'the unchosen volunteers climb out in round 2');
  }
  assert.equal(picked.size, 3);
});

test('push_base puts the target at the bottom only when nobody offered; several targets: the RNG picks one', async () => {
  const picked = new Set();
  for (let seed = 1; seed <= 40; seed++) {
    const g = pitGame({ seed, plan: { 1: { Ash: 'push_base:Cole', Bex: 'push_base:Dara', Eli: 'push_base:Cole' } } });
    await runPit(g);
    picked.add(reveals(g)[0].base);
  }
  assert.deepEqual([...picked].sort(), ['Cole', 'Dara']);
  const g = pitGame({ plan: { 1: { Ash: 'push_base:Cole' } } });
  await runPit(g);
  assert.equal(reveals(g)[0].base, 'Cole');
});

test('pushing the anchor holder fails and is logged; other pushed targets still count; with no other target there is no base', async () => {
  const lone = pitGame({ powers: { Dara: 'anchor' }, plan: { 1: { Ash: 'push_base:Dara' } } });
  await runPit(lone);
  assert.equal(reveals(lone)[0].base, null);
  const fails = ofType(lone.events, 'ability_use').filter((e) => e.power === 'anchor');
  assert.equal(fails.length, 1);
  assert.equal(fails[0].name, 'Dara');
  assert.match(fails[0].detail, /Ash.*failed/);
  assert.equal(fails[0].round, 1);

  const mixed = pitGame({ powers: { Dara: 'anchor' }, plan: { 1: { Ash: 'push_base:Dara', Bex: 'push_base:Eli' } } });
  await runPit(mixed);
  assert.equal(reveals(mixed)[0].base, 'Eli');
});

test('the base is chosen the same round it climbs: a base and a climber together lift in round 1', async () => {
  const g = pitGame({ plan: { 1: { Ash: 'offer_back', Bex: 'climb' } } });
  await runPit(g);
  assert.deepEqual(reveals(g)[0].lifted, ['Bex']);
});

// ---- lifts --------------------------------------------------------------------------------

test('at most two climbers get out per round, the RNG picks which, and the rest climb on the next round', async () => {
  const everyClimb = { Bex: 'climb', Cole: 'climb', Dara: 'climb', Eli: 'climb', Fenn: 'climb' };
  const firstLifted = new Set();
  for (let seed = 1; seed <= 40; seed++) {
    const g = pitGame({ seed, plan: { 1: { Ash: 'offer_back', ...everyClimb }, 2: everyClimb, 3: everyClimb } });
    await runPit(g);
    const [r1, r2, r3] = reveals(g);
    assert.equal(PIT_LIFTS_PER_ROUND, 2);
    assert.deepEqual([r1.lifted.length, r2.lifted.length, r3.lifted.length], [2, 2, 1]);
    assert.equal(new Set([...r1.lifted, ...r2.lifted, ...r3.lifted]).size, 5, 'everyone gets out eventually');
    r1.lifted.forEach((n) => firstLifted.add(n));
  }
  assert.ok(firstLifted.size >= 4, `RNG spreads the first lift (${[...firstLifted]})`);
});

test('no climbing without a base: climbers stay down', async () => {
  const g = pitGame({ plan: { 1: { Ash: 'climb', Bex: 'climb' }, 2: { Ash: 'climb' } } });
  await runPit(g);
  const [r1, r2] = reveals(g);
  assert.deepEqual([r1.lifted, r2.lifted], [[], []]);
  assert.equal(r2.out.length, 0);
  assert.ok(g.events.some((e) => e.type === 'round_start') && ofType(g.events, 'round_start').length === PIT_ROUNDS);
});

test('the base cannot climb, offer or push: its only legal action is wait, and anything else defaults to wait as invalid', async () => {
  const views = [];
  const g = pitGame({ views, plan: { 1: { Ash: 'offer_back' }, 2: { Ash: 'climb' }, 3: { Ash: 'push_base:Bex' } } });
  await runPit(g);
  assert.deepEqual(viewOf(views, 'Ash', 2).legalActions, ['wait']);
  assert.ok(!reveals(g)[1].lifted.includes('Ash'));
  const bad = ofType(g.events, 'action').filter((e) => e.name === 'Ash' && e.round >= 2);
  assert.ok(bad.every((a) => a.action === 'wait'));
  // the engine saw `climb` and `push_base:Bex` as illegal only if the fixed agent could send them; the policy filters, so force it raw
  const raw = makeGame({ agents: fixedAgents((view) => reply(view.you === 'Ash' ? (view.round === 1 ? 'offer_back' : 'climb') : idle(view).action)) });
  await runPit(raw);
  const forced = ofType(raw.events, 'action').filter((e) => e.name === 'Ash' && e.round === 2)[0];
  assert.deepEqual([forced.action, forced.valid], ['wait', false]);
  assert.equal(reveals(raw)[1].base, 'Ash');
});

// ---- the rope -----------------------------------------------------------------------------

test('rope: only an agent who was out at the start of the round, only while a base is down and the rope is unused', async () => {
  const views = [];
  const g = pitGame({ views, plan: { 1: { Ash: 'offer_back', Bex: 'climb' }, 2: { Bex: 'reach_down' } } });
  await runPit(g);
  // Bex climbed out in round 1, so it could not reach down in round 1 (not even legal), but can in round 2
  assert.ok(!viewOf(views, 'Bex', 1).legalActions.includes('reach_down'));
  assert.deepEqual(viewOf(views, 'Bex', 2).legalActions, ['leave', 'reach_down']);
  assert.deepEqual(viewOf(views, 'Cole', 1).legalActions.includes('reach_down'), false);
  const [r1, r2, r3] = reveals(g);
  assert.equal(r1.roped, null);
  assert.deepEqual([r2.roped, r2.rescued, r2.ropeUsed], ['Bex', 'Ash', true]);
  // the rope is gone for good: reach_down is no longer offered, even with a new base down there
  assert.ok(r3.ropeUsed);
  assert.deepEqual(ofType(g.events, 'reveal').filter((e) => e.what === 'rope').length, 1);
});

test('rope: with several reachers the RNG picks one rescuer, and a rope cannot be thrown without a base', async () => {
  const thrown = new Set();
  for (let seed = 1; seed <= 40; seed++) {
    const g = pitGame({ seed, plan: { 1: { Ash: 'offer_back', Bex: 'climb', Cole: 'climb' }, 2: { Bex: 'reach_down', Cole: 'reach_down' } } });
    await runPit(g);
    const rope = ofType(g.events, 'reveal').filter((e) => e.what === 'rope');
    assert.equal(rope.length, 1);
    assert.deepEqual(Object.keys(rope[0].data).sort(), ['by', 'cost', 'saved']);
    assert.equal(rope[0].data.saved, 'Ash');
    assert.equal(rope[0].data.cost, ROPE_COST_FOOTING);
    thrown.add(rope[0].data.by);
  }
  assert.deepEqual([...thrown].sort(), ['Bex', 'Cole']);

  const views = [];
  const none = pitGame({ views, plan: { 1: { Ash: 'push_base:Bex' } } });
  await runPit(none);
  assert.ok(views.every((v) => !v.legalActions.includes('reach_down')));
});

test('rescue frees the base alive; then there is no base and no rope, a new volunteer is needed and is left to the flood', async () => {
  const views = [];
  const g = pitGame({
    views,
    alive: ['Ash', 'Bex', 'Cole', 'Dara', 'Eli', 'Fenn'],
    powers: { Cole: 'nothing' },
    plan: {
      1: { Ash: 'offer_back', Bex: 'climb' },
      2: { Bex: 'reach_down' },
      3: { Cole: 'offer_back' },
      4: { Bex: 'reach_down', Dara: 'climb' },
    },
  });
  await runPit(g);
  const [r1, r2, r3, r4, r5] = reveals(g);
  assert.deepEqual([r1.base, r2.base, r2.rescued], ['Ash', null, 'Ash']);
  assert.ok(r2.out.includes('Ash') && !r2.down.includes('Ash'));
  assert.deepEqual(viewOf(views, 'Dara', 3).legalActions.filter((a) => a === 'offer_back' || a.startsWith('push_base:')).length > 0, true, 'volunteering is open again');
  assert.equal(r3.base, 'Cole');
  assert.ok(!viewOf(views, 'Ash', 4).legalActions.includes('reach_down'), 'the rope is gone');
  assert.equal(r4.roped, null);
  assert.equal(r5.base, 'Cole');
  assert.ok(deaths(g).some((d) => d.name === 'Cole'), 'the second base is eliminated by the flood');
});

test('the rescuer pays: footing at the start of the ledge drops by 1, stacks with anchor, never goes below 1', async () => {
  const g = pitGame({
    alive: ['Ash', 'Bex', 'Cole', 'Dara', 'Eli'],
    powers: { Bex: 'anchor', Cole: 'nothing' },
    plan: { 1: { Ash: 'offer_back', Bex: 'climb', Cole: 'climb' }, 2: { Bex: 'reach_down' } },
  });
  await runPit(g);
  assert.equal(g.ropeCost.get('Bex'), ROPE_COST_FOOTING);
  assert.ok(ofType(g.events, 'reveal').some((e) => e.what === 'rope' && e.data.by === 'Bex'));
  // after the flood Dara and Eli are gone; the three left are Ash, Bex, Cole and run the ledge
  assert.deepEqual(g.aliveList(), ['Ash', 'Bex', 'Cole']);
  await runLedge(g);
  const first = reveals(g, 'footing')[0];
  assert.deepEqual(first.footing, { Ash: 3, Bex: 3, Cole: 3 }, 'anchor 4 - rope 1 = 3; others unchanged');

  const floor = makeGame({ dead: dead(['Ash', 'Bex', 'Cole']), powers: { Ash: 'feather', Bex: 'nothing' } });
  floor.spent.add('Ash');
  floor.ropeCost.set('Ash', 5);
  floor.ropeCost.set('Bex', 5);
  floor.stage = 'ledge';
  await runLedge(floor);
  assert.deepEqual(reveals(floor, 'footing')[0].footing, { Ash: 1, Bex: 1, Cole: 3 }, 'never below 1, even with a spent feather');
});

test('the log says who threw the rope', async () => {
  const views = [];
  const g = pitGame({ views, plan: { 1: { Ash: 'offer_back', Bex: 'climb' }, 2: { Bex: 'reach_down' } } });
  await runPit(g);
  assert.ok(viewOf(views, 'Cole', 3).publicLog.some((l) => /Bex threw the rope and hauled Ash out/.test(l)));
});

// ---- the flood ----------------------------------------------------------------------------

test('the flood eliminates exactly those still down, base included, as pit/sink; lifted agents are safe', async () => {
  const g = pitGame({
    powers: { Ash: 'nothing' },
    plan: { 1: { Ash: 'offer_back', Bex: 'climb', Cole: 'climb' }, 2: { Dara: 'climb', Eli: 'climb' }, 3: { Fenn: 'climb' } },
  });
  g.spent.add(feather(g)); // no feather in this test
  await runPit(g);
  const last = reveals(g).at(-1);
  assert.deepEqual(last.down, ['Ash', 'Gus', 'Hana']);
  assert.equal(last.flood, PIT_ROUNDS);
  assert.deepEqual(deaths(g).map((d) => d.name), ['Ash', 'Gus', 'Hana']);
  assert.ok(deaths(g).every((d) => d.cause === 'pit' && d.style === 'sink' && d.round === PIT_ROUNDS && d.place === undefined));
  assert.equal(g.alive.size, 5);
  assert.ok(g.log.some((l) => /sank beneath/.test(l)));
  const survivors = ofType(g.events, 'stage_end')[0].survivors;
  assert.deepEqual(survivors, ['Bex', 'Cole', 'Dara', 'Eli', 'Fenn']);
});

test('feather cancels one flood death and the holder floats out', async () => {
  const g = pitGame({
    powers: { Gus: 'feather' },
    plan: { 1: { Ash: 'offer_back', Bex: 'climb', Cole: 'climb' }, 2: { Dara: 'climb', Eli: 'climb' }, 3: { Fenn: 'climb' } },
  });
  await runPit(g);
  assert.deepEqual(deaths(g).map((d) => d.name), ['Ash', 'Hana']);
  const use = ofType(g.events, 'ability_use').filter((e) => e.power === 'feather');
  assert.equal(use.length, 1);
  assert.equal(use[0].name, 'Gus');
  assert.ok(g.spent.has('Gus') && g.alive.has('Gus'));
  assert.equal(ofType(g.events, 'lucky_save').length, 0);
});

test('the flood never leaves fewer than three alive: lucky_save events bring it back to three', async () => {
  const four = pitGame({ alive: ['Ash', 'Bex', 'Cole', 'Dara'], seed: 3 });
  four.spent.add(feather(four));
  await runPit(four);
  assert.equal(four.alive.size, 3);
  assert.equal(deaths(four).length, 1);
  assert.equal(ofType(four.events, 'lucky_save').length, 3);

  const eight = pitGame({ seed: 4 });
  eight.spent.add(feather(eight));
  await runPit(eight);
  assert.equal(eight.alive.size, 3);
  const saves = ofType(eight.events, 'lucky_save');
  assert.equal(saves.length, 3);
  assert.ok(saves.every((e) => e.why === 'a plank floats by'));
  assert.equal(deaths(eight).length, 5);
  assert.ok(saves.every((s) => !deaths(eight).some((d) => d.name === s.name)));
});

test('early finish: when nobody is down the stage ends at once and nobody dies', async () => {
  const policy = (view) => {
    const down = view.stageState.down;
    if (view.you === 'Ash' && view.legalActions.includes('offer_back')) return reply('offer_back');
    if (view.legalActions.includes('reach_down') && down.length === 1) return reply('reach_down');
    if (view.legalActions.includes('climb')) return reply('climb');
    return idle(view);
  };
  const g = makeGame({ agents: fixedAgents(policy), dead: dead(['Ash', 'Bex', 'Cole', 'Dara']) });
  await runPit(g);
  assert.equal(ofType(g.events, 'round_start').length, 3);
  assert.equal(deaths(g).length, 0);
  const { roped, ...last } = reveals(g).at(-1);
  assert.ok(['Bex', 'Cole', 'Dara'].includes(roped), 'whoever of the climbers threw the rope');
  assert.deepEqual(last, { flood: 3, base: null, down: [], out: ['Ash', 'Bex', 'Cole', 'Dara'], ropeUsed: true, liftsPerRound: 2, lifted: [], rescued: 'Ash' });
  assert.equal(ofType(g.events, 'stage_end')[0].survivors.length, 4);
});

// ---- views, rules, shapes -----------------------------------------------------------------

test('legalActions per role: down, base and out', async () => {
  const views = [];
  const g = pitGame({ views, alive: ['Ash', 'Bex', 'Cole', 'Dara'], plan: { 1: { Ash: 'offer_back', Bex: 'climb', Cole: 'climb' } } });
  await runPit(g);
  assert.deepEqual(viewOf(views, 'Ash', 1).legalActions, ['wait', 'climb', 'offer_back', 'push_base:Bex', 'push_base:Cole', 'push_base:Dara']);
  assert.deepEqual(viewOf(views, 'Ash', 2).legalActions, ['wait'], 'the base');
  assert.deepEqual(viewOf(views, 'Dara', 2).legalActions, ['wait', 'climb'], 'down, with a base in place');
  assert.deepEqual(viewOf(views, 'Bex', 2).legalActions, ['leave', 'reach_down'], 'out, base still down');
  assert.deepEqual(viewOf(views, 'Bex', 1).legalActions, ['wait', 'climb', 'offer_back', 'push_base:Ash', 'push_base:Cole', 'push_base:Dara']);
  assert.match(viewOf(views, 'Ash', 2).rules, /You are the base/);
  assert.match(viewOf(views, 'Dara', 2).rules, /down in the pit and are not the base/);
  assert.match(viewOf(views, 'Bex', 2).rules, /You are out of the pit/);
});

test('stageState is public and exact; reveal and death shapes', async () => {
  const views = [];
  const g = pitGame({ views, plan: { 1: { Ash: 'offer_back', Bex: 'climb' } } });
  await runPit(g);
  const v = viewOf(views, 'Cole', 2);
  assert.deepEqual(v.stageState, { flood: 1, base: 'Ash', down: ['Ash', 'Cole', 'Dara', 'Eli', 'Fenn', 'Gus', 'Hana'], out: ['Bex'], ropeUsed: false, liftsPerRound: 2 });
  assert.deepEqual(viewOf(views, 'Cole', 1).stageState.flood, 0);
  assert.deepEqual(v.stageState, viewOf(views, 'Bex', 2).stageState, 'identical for every viewer');
  for (const data of reveals(g)) {
    assert.deepEqual(Object.keys(data), ['flood', 'base', 'down', 'out', 'ropeUsed', 'liftsPerRound', 'lifted', 'roped', 'rescued']);
  }
  const starts = ofType(g.events, 'round_start');
  assert.ok(starts.every((e) => e.phase === 'play' && e.roundsTotal === PIT_ROUNDS && e.stage === 'pit'));
  for (const d of deaths(g)) assert.deepEqual(Object.keys(d).sort(), ['cause', 'i', 'name', 'round', 'stage', 'style', 'type']);
});

test('the pit rules are plain words with the numbers, never name a power, and the Map copy carries them', async () => {
  for (const role of ['down', 'base', 'out', null]) {
    const text = pitRules(role);
    assert.match(text, /5 rounds/);
    assert.match(text, /at most 2 climbers/);
    assert.match(text, /1 less footing/);
    assert.match(text, /never below 1/);
    assert.match(text, /at least 3 contestants/);
    assert.doesNotMatch(text, /\b(glass_eye|wedge|feather|anchor|forger|nothing)\b/i);
    assert.doesNotMatch(text, /bridge|crusher|trapdoor|lever|glass pane|ledge/i);
  }
  assert.match(pitRules('base'), /can only wait/);
  assert.match(pitRules('down'), /can never climb out alone/);
  assert.match(pitRules('out'), /reach_down/);
  const views = [];
  await runPit(pitGame({ views, powers: { Fenn: 'map' } }));
  assert.ok(views.every((v) => v.rules.startsWith('THE PIT, 5 rounds.')));
});

test('information hiding: nothing shown in the pit names another agent\'s power', async () => {
  const views = [];
  const powers = { Ash: 'glass_eye', Bex: 'wedge', Cole: 'feather', Dara: 'anchor', Eli: 'swap', Fenn: 'forger', Gus: 'nothing', Hana: 'map' };
  const g = pitGame({
    views,
    powers,
    plan: { 1: { Ash: 'offer_back', Cole: 'climb', Eli: 'push_base:Dara' }, 2: { Cole: 'reach_down', Dara: 'climb' } },
  });
  await runPit(g);
  assert.ok(views.length >= 30);
  for (const v of views) {
    const { power, powerBlurbs, privateKnowledge, rules, ...rest } = v;
    assert.doesNotMatch(JSON.stringify(rest), /\b(glass_eye|wedge|feather|anchor|forger|nothing|map)\b/i, `${v.you} round ${v.round}`);
    assert.doesNotMatch(rules, /\b(glass_eye|wedge|feather|anchor|forger|nothing)\b/i);
    assert.equal(power.id, powers[v.you]);
    if (v.you !== 'Hana') assert.equal(privateKnowledge.length, 0);
  }
});

test('determinism: a scripted game with a pit gives byte-identical tapes for the same seed', async () => {
  const { runGame } = await import('../../src/engine.js');
  const { createScriptedAgents } = await import('../../src/scripted.js');
  const mix = ['saint', 'saint', 'coward', 'liar', 'shover', 'random', 'random', 'random'];
  let withPit = 0;
  for (let seed = 1; seed <= 12; seed++) {
    const a = await runGame({ seed, agents: createScriptedAgents(seed, mix) });
    const b = await runGame({ seed, agents: createScriptedAgents(seed, mix) });
    assert.equal(JSON.stringify(a), JSON.stringify(b));
    if (a.events.some((e) => e.stage === 'pit')) withPit += 1;
  }
  assert.ok(withPit >= 3, `${withPit} of 12 games reached the pit`);
});

test('nothing in the pit changes who is alive except the flood', async () => {
  const g = pitGame({ plan: { 1: { Ash: 'offer_back', Bex: 'climb', Cole: 'climb' }, 2: { Bex: 'reach_down' } } });
  await runPit(g);
  const firstDeath = g.events.findIndex((e) => e.type === 'death');
  const lastRound = g.events.map((e, k) => (e.type === 'reveal' && e.what === 'pit' ? k : -1)).filter((k) => k >= 0).at(-1);
  assert.ok(firstDeath === -1 || firstDeath > lastRound);
});
