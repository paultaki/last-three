import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runBridge } from '../../src/stages/bridge.js';
import { SEATS, fixedAgents, idle, lastReveal, makeGame, ofType, reply, spy } from './helpers.js';

/** Events of the waiting room: everything before the first crossing round. */
const waitingEvents = (g) => g.events.slice(0, g.events.findIndex((e) => e.type === 'round_start' && e.phase === 'crossing'));

/** Policy driven by round: `plan(view, line)` returns the action for this agent or undefined for hold. */
const planned = (plan) => (view) => {
  if (view.phase !== 'waiting') return idle(view);
  return reply(plan(view, view.line) ?? 'hold');
};

const lineAfterRound = (g, round) => {
  const reveals = ofType(g.events, 'reveal').filter((e) => e.what === 'line');
  return reveals[round].data.line; // reveals[0] is the initial line
};

test('waiting room: six rounds, everyone asked each round, holding changes nothing', async () => {
  const g = makeGame({ seed: 4 });
  await runBridge(g);
  const rounds = ofType(g.events, 'round_start').filter((e) => e.phase === 'waiting');
  assert.deepEqual(rounds.map((r) => r.round), [1, 2, 3, 4, 5, 6]);
  assert.ok(rounds.every((r) => r.roundsTotal === 6));
  const initial = lineAfterRound(g, 0);
  assert.equal(new Set(initial).size, 8);
  for (let round = 1; round <= 6; round++) assert.deepEqual(lineAfterRound(g, round), initial);
  const actions = ofType(waitingEvents(g), 'action');
  assert.equal(actions.length, 8 * 6);
  assert.ok(actions.every((a) => a.action === 'hold' && a.valid));
});

test('waiting room view: legal actions, wallRoundsLeft counts down, line is shared', async () => {
  const views = [];
  const g = makeGame({ seed: 4, agents: fixedAgents(spy(idle, views)) });
  await runBridge(g);
  const ash = views.filter((v) => v.you === 'Ash' && v.phase === 'waiting');
  assert.deepEqual(ash.map((v) => v.stageState.wallRoundsLeft), [5, 4, 3, 2, 1, 0]);
  assert.deepEqual(ash[0].legalActions, ['hold', 'volunteer', ...SEATS.slice(1).map((n) => `swap:${n}`)]);
  assert.equal(ash[0].roundsTotal, 6);
  assert.equal(ash[0].stageState.front, ash[0].line[0]);
  const round1 = views.filter((v) => v.phase === 'waiting' && v.round === 1);
  assert.ok(round1.every((v) => JSON.stringify(v.line) === JSON.stringify(round1[0].line)));
});

test('volunteer moves the agent to the front and shifts those ahead back by one', async () => {
  let target;
  const g = makeGame({
    seed: 9,
    agents: fixedAgents(planned((view, line) => {
      target ??= line[4];
      return view.you === target && view.round === 1 ? 'volunteer' : 'hold';
    })),
  });
  await runBridge(g);
  const before = lineAfterRound(g, 0);
  const expected = [before[4], ...before.filter((n) => n !== before[4])];
  assert.deepEqual(lineAfterRound(g, 1), expected);
});

test('several volunteers resolve in seat order, so the last in seat order ends up in front', async () => {
  const g = makeGame({
    seed: 9,
    agents: fixedAgents(planned((view) => (['Gus', 'Bex', 'Eli'].includes(view.you) && view.round === 1 ? 'volunteer' : 'hold'))),
  });
  await runBridge(g);
  const before = lineAfterRound(g, 0);
  const rest = before.filter((n) => !['Bex', 'Eli', 'Gus'].includes(n));
  assert.deepEqual(lineAfterRound(g, 1), ['Gus', 'Eli', 'Bex', ...rest]);
});

test('a mutual swap exchanges line positions; a one-sided swap does nothing', async () => {
  const g = makeGame({
    seed: 12,
    agents: fixedAgents(planned((view, line) => {
      if (view.round === 1) {
        if (view.you === line[1]) return `swap:${line[3]}`;
        if (view.you === line[3]) return `swap:${line[1]}`;
        if (view.you === line[5]) return `swap:${line[6]}`; // line[6] holds: not mutual
      }
      return 'hold';
    })),
  });
  await runBridge(g);
  const before = lineAfterRound(g, 0);
  const expected = [...before];
  [expected[1], expected[3]] = [before[3], before[1]];
  assert.deepEqual(lineAfterRound(g, 1), expected);
});

test('conflict order: mutual swaps first, then volunteers; a swap with a volunteer is not mutual', async () => {
  const g = makeGame({
    seed: 12,
    agents: fixedAgents(planned((view, line) => {
      if (view.round !== 1) return 'hold';
      if (view.you === line[1]) return `swap:${line[2]}`;
      if (view.you === line[2]) return `swap:${line[1]}`;
      if (view.you === line[6]) return 'volunteer';
      if (view.you === line[4]) return `swap:${line[7]}`;
      if (view.you === line[7]) return 'volunteer';
      return 'hold';
    })),
  });
  await runBridge(g);
  const l = lineAfterRound(g, 0);
  // swap l1<->l2 first; then volunteers in seat order (l6 and l7 jump to the front one after the other)
  const afterSwap = [l[0], l[2], l[1], l[3], l[4], l[5], l[6], l[7]];
  const volunteers = SEATS.filter((n) => n === l[6] || n === l[7]);
  let expected = afterSwap;
  for (const v of volunteers) expected = [v, ...expected.filter((n) => n !== v)];
  assert.deepEqual(lineAfterRound(g, 1), expected);
});

test('invalid waiting-room action falls back to hold and is flagged invalid', async () => {
  const g = makeGame({ agents: fixedAgents(idle, { Cole: () => reply('teleport') }) });
  await runBridge(g);
  const cole = ofType(waitingEvents(g), 'action').filter((a) => a.name === 'Cole');
  assert.equal(cole.length, 6);
  assert.ok(cole.every((a) => a.action === 'hold' && a.valid === false && /illegal action/.test(a.note)));
  assert.deepEqual(lastReveal(g.events, 'line').line.length, 8);
});

test('thought, say and whisper events precede the actions of their round, in seat order', async () => {
  const talker = (view) => reply('hold', { thought: `t-${view.you}`, say: `s-${view.you}`, whisper: { to: 'Hana', text: `w-${view.you}` } });
  const g = makeGame({ agents: fixedAgents(talker, { Hana: () => reply('hold', { thought: 'only thought' }) }) });
  await runBridge(g);
  const first = g.events.slice(g.events.findIndex((e) => e.type === 'round_start'));
  const end = first.findIndex((e) => e.type === 'reveal');
  const round1 = first.slice(1, end);
  const firstAction = round1.findIndex((e) => e.type === 'action');
  assert.ok(round1.slice(0, firstAction).every((e) => ['thought', 'say', 'whisper'].includes(e.type)));
  assert.ok(round1.slice(firstAction).every((e) => e.type === 'action'));
  const speakers = round1.slice(0, firstAction).filter((e) => e.type === 'say').map((e) => e.name);
  assert.deepEqual(speakers, SEATS.slice(0, 7));
  assert.ok(ofType(round1, 'whisper').every((e) => e.to === 'Hana' && e.from !== 'Hana'));
});
