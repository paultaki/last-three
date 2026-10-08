// Rules v2: nobody may make the same defensive move (brace or dodge) two rounds in a row.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runGame, RULES_VERSION } from '../../src/engine.js';
import { runLedge } from '../../src/stages/ledge.js';
import { createScriptedAgents } from '../../src/scripted.js';
import { validateTape } from '../../src/tape.js';
import { fixedAgents, makeGame, ofType, reply, spy } from './helpers.js';

const THREE = ['Ash', 'Bex', 'Cole'];
const DEAD = ['Dara', 'Eli', 'Fenn', 'Gus', 'Hana'];

/** A three-way ledge where `policy(view)` answers for everyone; views are collected per seat. */
async function ledgeWith(policy, { rounds = 4, seed = 1, perSeat = {} } = {}) {
  const views = [];
  const g = makeGame({ seed, dead: DEAD, powers: { Ash: 'nothing', Bex: 'map', Cole: 'wedge' }, config: { ledgeMaxRounds: rounds }, agents: fixedAgents(spy(policy, views), perSeat) });
  g.stage = 'ledge';
  await runLedge(g);
  return { g, views };
}

const actionsOf = (g, name) => ofType(g.events, 'action').filter((a) => a.name === name);
const viewsOf = (views, name) => views.filter((v) => v.you === name);
const defences = (legal) => legal.filter((a) => !a.startsWith('shove:'));

test('round 1 is free; afterwards the defence you used last round is closed to you', async () => {
  const plan = { 1: { Ash: 'brace', Bex: 'dodge', Cole: 'shove:Ash' }, 2: { Ash: 'dodge', Bex: 'brace', Cole: 'brace' } };
  const { views } = await ledgeWith((view) => reply(plan[view.round]?.[view.you] ?? defences(view.legalActions)[0]), { rounds: 3 });
  const legal = (name, round) => viewsOf(views, name).find((v) => v.round === round).legalActions;
  assert.deepEqual(defences(legal('Ash', 1)), ['brace', 'dodge']);
  assert.deepEqual(defences(legal('Ash', 2)), ['dodge'], 'braced in round 1');
  assert.deepEqual(defences(legal('Bex', 2)), ['brace'], 'dodged in round 1');
  assert.deepEqual(defences(legal('Cole', 2)), ['brace', 'dodge'], 'a shove is never restricted and resets the rule');
  assert.ok(legal('Ash', 2).includes('shove:Bex') && legal('Ash', 2).includes('shove:Cole'));
  assert.deepEqual(defences(legal('Ash', 3)), ['brace'], 'dodged in round 2');
  assert.deepEqual(defences(legal('Cole', 3)), ['dodge'], 'braced in round 2');
});

test('lastDefence is in the stageState of the viewing agent only, and tracks their own last defence', async () => {
  const plan = { 1: { Ash: 'brace', Bex: 'dodge', Cole: 'shove:Ash' }, 2: { Ash: 'shove:Bex', Bex: 'brace', Cole: 'dodge' } };
  const { views } = await ledgeWith((view) => reply(plan[view.round]?.[view.you] ?? 'shove:Ash'), { rounds: 3 });
  const last = (name) => viewsOf(views, name).map((v) => v.stageState.lastDefence);
  assert.deepEqual(last('Ash'), [null, 'brace', null]);
  assert.deepEqual(last('Bex'), [null, 'dodge', 'brace']);
  assert.deepEqual(last('Cole'), [null, null, 'dodge']);
  for (const v of views) assert.ok(['brace', 'dodge', null].includes(v.stageState.lastDefence));
});

test('a forbidden repeat is invalid, noted, and replaced by the default; the default is brace unless brace is closed', async () => {
  // Everyone always asks for brace. Round 1 is fine; round 2 brace is closed so the default is dodge;
  // round 3 brace is open again (they dodged), and so on.
  const { g } = await ledgeWith(() => reply('brace'), { rounds: 4 });
  const ash = actionsOf(g, 'Ash');
  assert.deepEqual(ash.map((a) => [a.action, a.valid]), [['brace', true], ['dodge', false], ['brace', true], ['dodge', false]]);
  assert.match(ash[1].note, /brace not allowed twice in a row/);
  assert.equal(ash[0].note, undefined);
});

test('after a dodge, asking to dodge again is invalid and defaults to brace; garbage defaults the same way', async () => {
  const ask = { 1: 'dodge', 2: 'dodge', 3: 'definitely not an action' };
  const { g } = await ledgeWith((view) => reply(ask[view.round]), { rounds: 3 });
  const ash = actionsOf(g, 'Ash');
  assert.deepEqual(ash.map((a) => [a.action, a.valid]), [['dodge', true], ['brace', false], ['dodge', false]]);
  assert.match(ash[1].note, /dodge not allowed twice in a row/);
  assert.match(ash[2].note, /illegal action/);
});

test('an agent that throws or answers nothing still gets a legal default every round', async () => {
  const { g } = await ledgeWith(() => reply('brace'), {
    rounds: 4,
    perSeat: { Bex: () => { throw new Error('boom'); }, Cole: () => ({}) },
  });
  for (const name of ['Bex', 'Cole']) {
    assert.deepEqual(actionsOf(g, name).map((a) => a.action), ['brace', 'dodge', 'brace', 'dodge']);
  }
});

test('a shove between two braces clears the restriction; the shove itself is never restricted', async () => {
  const plan = { 1: 'brace', 2: 'shove:Bex', 3: 'brace', 4: 'shove:Bex' };
  const { g } = await ledgeWith((view) => reply(view.you === 'Ash' ? plan[view.round] : 'dodge'), { rounds: 4 });
  const ash = actionsOf(g, 'Ash');
  assert.deepEqual(ash.map((a) => [a.action, a.valid]), [['brace', true], ['shove:Bex', true], ['brace', true], ['shove:Bex', true]]);
});

test('the rotation bites: an agent who never shoves must alternate brace and dodge in every valid game', async () => {
  const kinds = ['random', 'saint', 'coward', 'liar', 'shover', 'broken'];
  for (let seed = 1; seed <= 60; seed++) {
    const mix = kinds.map((_, i) => kinds[(seed + i * 5) % kinds.length]);
    const tape = await runGame({ seed, agents: createScriptedAgents(seed, mix) });
    const actions = ofType(tape.events, 'action').filter((a) => a.stage === 'ledge');
    const previous = new Map();
    for (const a of actions) {
      const before = previous.get(a.name);
      assert.ok(!(before && (a.action === 'brace' || a.action === 'dodge') && a.action === before.action && before.round === a.round - 1),
        `seed ${seed}: ${a.name} repeated ${a.action} in round ${a.round}`);
      previous.set(a.name, a);
    }
  }
});

test('end to end: bots that always try brace on the ledge still finish a full game, defaulted to dodge on alternate rounds', async () => {
  let checked = 0;
  for (let seed = 1; seed <= 12 && checked < 3; seed++) {
    const scripted = createScriptedAgents(seed, 'random');
    const agents = Object.fromEntries(Object.entries(scripted).map(([seat, bot]) => [seat, { ...bot, act: (view) => (view.stage === 'ledge' ? reply('brace') : bot.act(view)) }]));
    const tape = await runGame({ seed, agents });
    validateTape(tape);
    const ledgeActions = ofType(tape.events, 'action').filter((a) => a.stage === 'ledge');
    if (!ledgeActions.length) continue;
    checked += 1;
    for (const a of ledgeActions) {
      assert.equal(a.action, a.round % 2 === 1 ? 'brace' : 'dodge', `seed ${seed} ${a.name} round ${a.round}`);
      assert.equal(a.valid, a.round % 2 === 1);
    }
  }
  assert.equal(checked, 3);
});

test('the ledge rules text and the map holder copy state the no-repeat rule', async () => {
  const { views } = await ledgeWith(() => reply('brace'), { rounds: 1 });
  const bex = viewsOf(views, 'Bex')[0]; // Bex holds the map
  assert.match(bex.rules, /cannot brace two rounds in a row/i);
  assert.match(bex.rules, /cannot dodge two rounds in a row/i);
  assert.ok(bex.privateKnowledge.some((k) => /cannot brace two rounds in a row/i.test(k)));
});

test('tapes carry rulesVersion 3; the validator wants a positive integer when present and tolerates old tapes', async () => {
  assert.equal(RULES_VERSION, 3);
  const tape = await runGame({ seed: 3, agents: createScriptedAgents(3) });
  assert.equal(tape.rulesVersion, 3);
  validateTape(tape);
  const old = structuredClone(tape);
  delete old.rulesVersion;
  validateTape(old);
  for (const bad of [0, -1, 1.5, '2', null]) {
    assert.throws(() => validateTape({ ...structuredClone(tape), rulesVersion: bad }), /rulesVersion/, String(bad));
  }
});
