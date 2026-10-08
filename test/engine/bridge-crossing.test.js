import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runBridge } from '../../src/stages/bridge.js';
import { fixedAgents, idle, makeGame, ofType, reply, spy } from './helpers.js';

const opposite = (side) => (side === 'L' ? 'R' : 'L');

/** Build a game whose front agent steps right or wrong per row, as decided by `decide(row, view)`. */
function steppingGame({ decide, powers, seed = 3, views = [], overrides = {} }) {
  let g;
  const policy = spy((view) => {
    if (view.phase !== 'crossing' || !view.legalActions.includes('step:L')) return idle(view);
    const safe = g.bridgeSafe[view.round - 1];
    return reply(`step:${decide(view.round, view) === 'right' ? safe : opposite(safe)}`);
  }, views);
  g = makeGame({ seed, powers, agents: fixedAgents(policy, overrides) });
  return g;
}

const crossingEvents = (g) => g.events.slice(g.events.findIndex((e) => e.type === 'round_start' && e.phase === 'crossing'));
const rowEvents = (g, row) => {
  const start = g.events.findIndex((e) => e.type === 'round_start' && e.phase === 'crossing' && e.round === row);
  const end = g.events.findIndex((e, k) => k > start && e.type === 'reveal' && e.what === 'weak_pane');
  return g.events.slice(start, end + 1);
};

test('stepping on the safe pane every row: eight rows, no deaths, same front throughout', async () => {
  const views = [];
  const g = steppingGame({ decide: () => 'right', views, powers: { Ash: 'nothing' } });
  await runBridge(g);
  assert.equal(ofType(g.events, 'death').length, 0);
  assert.equal(g.alive.size, 8);
  const rounds = ofType(crossingEvents(g), 'round_start');
  assert.deepEqual(rounds.map((r) => r.round), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.ok(rounds.every((r) => r.roundsTotal === 8));
  const fronts = new Set(views.filter((v) => v.phase === 'crossing').map((v) => v.stageState.front));
  assert.equal(fronts.size, 1);
  const weak = ofType(g.events, 'reveal').filter((e) => e.what === 'weak_pane');
  assert.deepEqual(weak.map((e) => e.data), g.bridgeSafe.map((safe, k) => ({ row: k + 1, weak: opposite(safe) })));
  assert.equal(g.events.at(-1).type, 'stage_end');
  assert.equal(g.events.at(-1).survivors.length, 8);
});

test('every alive agent is asked every row, but only the front agent has real choices', async () => {
  const views = [];
  const g = steppingGame({ decide: () => 'right', views });
  await runBridge(g);
  for (let row = 1; row <= 8; row++) {
    const asked = views.filter((v) => v.phase === 'crossing' && v.round === row);
    assert.equal(asked.length, 8);
    const [front] = asked[0].line;
    for (const v of asked) {
      assert.deepEqual(v.legalActions, v.you === front ? ['step:L', 'step:R'] : ['wait']);
      assert.equal(v.stageState.rowsCrossed, row - 1);
      assert.equal(v.stageState.weakPanesRevealed.length, row - 1);
    }
    assert.equal(ofType(rowEvents(g, row), 'action').length, 8);
  }
});

test('a wrong step kills only the front agent; the next in line auto-steps the safe pane and becomes front', async () => {
  const views = [];
  const g = steppingGame({ decide: (row) => (row === 3 ? 'wrong' : 'right'), views });
  await runBridge(g);
  const deaths = ofType(g.events, 'death');
  assert.equal(deaths.length, 1);
  assert.deepEqual({ cause: deaths[0].cause, style: deaths[0].style, stage: deaths[0].stage, round: deaths[0].round }, { cause: 'glass', style: 'shatter', stage: 'bridge', round: 3 });
  const row3 = rowEvents(g, 3);
  const auto = row3.find((e) => e.type === 'action' && e.auto);
  assert.equal(auto.action, `step:${g.bridgeSafe[2]}`);
  assert.equal(auto.valid, true);
  const order = row3.map((e) => e.type);
  assert.ok(order.indexOf('death') < order.indexOf('action', order.indexOf('death')), 'auto step follows the death');
  const lineBefore = views.find((v) => v.phase === 'crossing' && v.round === 3).line;
  assert.equal(deaths[0].name, lineBefore[0]);
  assert.equal(auto.name, lineBefore[1]);
  const row4 = views.filter((v) => v.round === 4 && v.phase === 'crossing');
  assert.equal(row4.length, 7);
  assert.ok(row4.every((v) => v.stageState.front === lineBefore[1] && !v.line.includes(lineBefore[0])));
  assert.equal(g.alive.size, 7);
});

test('a row never kills more than one agent, even when every agent steps wrongly', async () => {
  const g = steppingGame({ decide: () => 'wrong' });
  await runBridge(g);
  const perRow = {};
  for (const d of ofType(g.events, 'death')) perRow[d.round] = (perRow[d.round] ?? 0) + 1;
  assert.ok(Object.values(perRow).every((n) => n === 1));
});

test('always wrong: one death per row until a single survivor, and the bridge stops there', async () => {
  const g = steppingGame({ decide: () => 'wrong' });
  await runBridge(g);
  assert.equal(g.alive.size, 1);
  const rows = ofType(g.events, 'round_start').filter((e) => e.phase === 'crossing').length;
  assert.ok(rows >= 7 && rows <= 8, `crossed ${rows} rows`);
  const stageEnd = g.events.at(-1);
  assert.equal(stageEnd.type, 'stage_end');
  assert.equal(stageEnd.survivors.length, 1);
});

test('the bridge finishes after row 8 even when the last row kills', async () => {
  const g = steppingGame({ decide: (row) => (row === 8 ? 'wrong' : 'right') });
  await runBridge(g);
  const death = ofType(g.events, 'death')[0];
  assert.equal(death.round, 8);
  assert.ok(rowEvents(g, 8).some((e) => e.type === 'action' && e.auto));
  assert.equal(g.alive.size, 7);
});

test('only the front agent\'s step counts: other agents\' steps are invalid and default to wait', async () => {
  const stubborn = () => reply('step:L');
  const g = steppingGame({ decide: () => 'right', overrides: { Ash: stubborn, Bex: stubborn, Cole: stubborn, Dara: stubborn, Eli: stubborn } });
  await runBridge(g);
  const crossing = ofType(crossingEvents(g), 'action').filter((a) => !a.auto);
  const nonFrontSteps = crossing.filter((a) => a.valid === false);
  assert.ok(nonFrontSteps.length > 0);
  assert.ok(nonFrontSteps.every((a) => a.action === 'wait' && /illegal action/.test(a.note)));
  assert.ok(g.alive.size >= 1);
});

test('front agent returning garbage steps a seeded random side and is flagged invalid', async () => {
  const garbage = () => ({ action: 'run!' });
  const outcomes = new Set();
  for (let seed = 1; seed <= 12; seed++) {
    const g = steppingGame({ seed, decide: () => 'right', overrides: Object.fromEntries(['Ash', 'Bex', 'Cole', 'Dara', 'Eli', 'Fenn', 'Gus', 'Hana'].map((n) => [n, (v) => (v.legalActions.includes('step:L') ? garbage() : idle(v))])) });
    await runBridge(g);
    const first = ofType(rowEvents(g, 1), 'action').find((a) => a.action.startsWith('step:'));
    assert.equal(first.valid, false);
    outcomes.add(first.action);
  }
  assert.deepEqual([...outcomes].sort(), ['step:L', 'step:R']);
});

test('feather: the first shatter is cancelled and the holder stays in front; the second kills', async () => {
  const volunteer = (view) => (view.phase === 'waiting' ? reply('volunteer') : null);
  const g = steppingGame({
    powers: { Hana: 'feather' },
    decide: (row) => (row <= 2 ? 'wrong' : 'right'),
    overrides: { Hana: (view) => volunteer(view) ?? g.stepPolicy(view) },
  });
  g.stepPolicy = (view) => {
    if (!view.legalActions.includes('step:L')) return idle(view);
    return reply(`step:${view.round <= 2 ? opposite(g.bridgeSafe[view.round - 1]) : g.bridgeSafe[view.round - 1]}`);
  };
  await runBridge(g);
  const used = ofType(g.events, 'ability_use');
  assert.deepEqual(used.map((e) => [e.name, e.power, e.round]), [['Hana', 'feather', 1]]);
  const deaths = ofType(g.events, 'death');
  assert.deepEqual(deaths.map((e) => [e.name, e.round]), [['Hana', 2]]);
  assert.ok(g.spent.has('Hana'));
  assert.equal(ofType(g.events, 'action').filter((a) => a.auto).length, 1);
});
