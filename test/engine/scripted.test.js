import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BOT_KINDS, createScriptedAgents } from '../../src/scripted.js';
import { runGame } from '../../src/engine.js';
import { SEATS, ofType, powersWith, spy } from './helpers.js';
import { claimedPowers, claimedSafeSide } from '../../src/stats.js';

const crossingView = (power, privateKnowledge = []) => ({
  you: 'Ash', power: { id: power }, powerSpent: false, stage: 'bridge', phase: 'crossing', round: 3, alive: SEATS,
  legalActions: ['step:L', 'step:R'], privateKnowledge, publicLog: [], whispersToYou: [],
});

test('createScriptedAgents seats eight named bots and rejects unknown kinds', () => {
  const agents = createScriptedAgents(1, ['saint', 'coward']);
  assert.deepEqual(Object.keys(agents), SEATS);
  assert.deepEqual(Object.values(agents).map((a) => a.model), ['saint', 'coward', 'saint', 'coward', 'saint', 'coward', 'saint', 'coward'].map((k) => `scripted/${k}`));
  assert.throws(() => createScriptedAgents(1, 'wizard'), /Unknown bot kind/);
  assert.equal(Object.keys(createScriptedAgents(1)).length, 8);
  assert.deepEqual(BOT_KINDS, ['random', 'saint', 'coward', 'liar', 'shover', 'broken']);
});

test('liar claims to be the glass eye and names a safe side; with real knowledge the side is false', async () => {
  const liar = createScriptedAgents(5, 'liar').Ash;
  const blind = await liar.act(crossingView('nothing'));
  assert.match(blind.say, /Glass Eye/);
  assert.deepEqual(claimedPowers(blind.say), ['glass_eye']);
  assert.ok(['left', 'right'].includes(claimedSafeSide(blind.say)));

  const knowing = await liar.act(crossingView('glass_eye', ['Row 3 safe side: L']));
  assert.equal(claimedSafeSide(knowing.say), 'right', 'told the truth is left, the liar says right');
  const other = await liar.act(crossingView('glass_eye', ['Row 3 safe side: R']));
  assert.equal(claimedSafeSide(other.say), 'left');
});

test('saint volunteers and holds the lever; coward holds back; shover shoves', async () => {
  const bots = (kind) => createScriptedAgents(1, kind).Ash;
  const waiting = { ...crossingView('nothing'), phase: 'waiting', legalActions: ['hold', 'volunteer', 'swap:Bex'] };
  const crusher = { ...crossingView('nothing'), stage: 'crusher', phase: 'play', round: 1, legalActions: ['stay', 'hold_lever', 'push_lever:Bex'] };
  const ledge = { ...crossingView('nothing'), stage: 'ledge', phase: 'play', legalActions: ['brace', 'dodge', 'shove:Bex', 'shove:Cole'] };
  assert.equal((await bots('saint').act(waiting)).action, 'volunteer');
  assert.equal((await bots('saint').act(crusher)).action, 'hold_lever');
  assert.equal((await bots('coward').act(waiting)).action, 'hold');
  assert.notEqual((await bots('coward').act({ ...crusher, round: 1 })).action, 'hold_lever');
  assert.match((await bots('shover').act(ledge)).action, /^shove:/);
});

test('a forger liar uses its forge in a full game', async () => {
  let used = 0;
  for (let seed = 1; seed <= 6 && !used; seed++) {
    const tape = await runGame({ seed, agents: createScriptedAgents(seed, 'liar'), config: { powers: powersWith({ Cole: 'forger' }) } });
    used += ofType(tape.events, 'say').filter((e) => e.forgedAs).length;
  }
  assert.ok(used >= 1);
});

test('bots only ever pick legal actions (random kinds produce no invalid actions)', async () => {
  const views = [];
  for (let seed = 1; seed <= 5; seed++) {
    const kinds = ['random', 'saint', 'coward', 'liar', 'shover', 'random', 'saint', 'coward'];
    const agents = createScriptedAgents(seed, kinds);
    const tape = await runGame({ seed, agents: Object.fromEntries(Object.entries(agents).map(([s, a]) => [s, { ...a, act: spy(a.act, views) }])) });
    assert.ok(ofType(tape.events, 'action').every((a) => a.valid), `seed ${seed}`);
  }
  assert.ok(views.length > 500);
});
