import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runGame } from '../../src/engine.js';
import { validateTape } from '../../src/tape.js';
import { fixedAgents, makeOracle, ofType, powersWith, reply } from './helpers.js';

const opposite = (side) => (side === 'L' ? 'R' : 'L');
const stagesRun = (tape) => ofType(tape.events, 'stage_start').map((e) => e.stage);

/**
 * Plays a whole game. The bridge front steps wrongly while more than `keep` agents are alive and
 * rightly afterwards, so the bridge leaves exactly `keep` alive (the feather, if it fires, costs
 * one extra wrong step but the target is still hit). `later(view)` plays every other stage.
 */
async function bridgeKeeps(keep, { later, seed = 7, powers = { Ash: 'glass_eye' } } = {}) {
  const { oracle, learn } = makeOracle();
  const policy = (view) => {
    learn(view);
    if (view.stage === 'bridge' && view.phase === 'crossing' && view.legalActions.includes('step:L')) {
      const safe = oracle.safe[view.round - 1];
      return reply(`step:${view.alive.length > keep ? opposite(safe) : safe}`);
    }
    if (view.stage === 'bridge') return reply(view.legalActions.includes('hold') ? 'hold' : 'wait');
    return later ? later(view) : reply(view.legalActions.find((a) => ['stay', 'wait', 'brace'].includes(a)) ?? view.legalActions[0]);
  };
  const tape = await runGame({ seed, agents: fixedAgents(policy), config: { powers: powersWith(powers) } });
  validateTape(tape);
  return tape;
}

const placed = (tape) => tape.result.places.filter((p) => p.place).map((p) => [p.place, p.name]).sort();

test('one survivor after the bridge: that agent is 1st and no further stage starts', async () => {
  const tape = await bridgeKeeps(1);
  assert.deepEqual(stagesRun(tape), ['bridge']);
  assert.equal(placed(tape).length, 1);
  assert.equal(placed(tape)[0][0], 1);
  assert.ok(tape.result.places.filter((p) => !p.place).every((p) => p.diedAt === 'bridge'));
  assert.equal(tape.events.at(-1).type, 'game_end');
  assert.equal(ofType(tape.events, 'death').length, 7);
});

test('three alive after the bridge: crusher and disc are skipped, straight to the ledge', async () => {
  const tape = await bridgeKeeps(3);
  assert.deepEqual(stagesRun(tape), ['bridge', 'ledge']);
  assert.equal(placed(tape).length, 3);
  assert.equal(ofType(tape.events, 'stage_start').at(-1).alive.length, 3);
});

test('two alive after the bridge: ledge with places 1 and 2 only', async () => {
  const tape = await bridgeKeeps(2);
  assert.deepEqual(stagesRun(tape), ['bridge', 'ledge']);
  assert.deepEqual(placed(tape).map(([place]) => place), [1, 2]);
});

test('four alive after the bridge: the crusher runs, and the disc runs only if more than 3 remain', async () => {
  const hold = (view) => (view.stage === 'crusher' ? reply('hold_lever') : reply(view.legalActions.find((a) => ['stay', 'wait', 'brace'].includes(a)) ?? view.legalActions[0]));
  for (const seed of [1, 2, 3, 4, 5, 6]) {
    const tape = await bridgeKeeps(4, { seed, later: (view) => (view.phase === 'pick' ? reply(`tile:${view.alive.indexOf(view.you) + 1}`) : hold(view)) });
    const stages = stagesRun(tape);
    assert.equal(stages[1], 'crusher');
    const afterCrusher = ofType(tape.events, 'stage_end').find((e) => e.stage === 'crusher').survivors.length;
    assert.equal(stages.includes('disc'), afterCrusher > 3);
    assert.equal(stages.includes('ledge'), (afterCrusher > 3 ? 3 : afterCrusher) >= 2 || stages.includes('disc'));
    assert.ok(placed(tape).length <= 3);
  }
});

test('the disc leaves three on the ledge (four when the feather catches someone)', async () => {
  const { oracle, learn } = makeOracle();
  const wedgeJam = (view) => {
    learn(view);
    if (view.stage === 'bridge' && view.legalActions.includes('step:L')) return reply(`step:${oracle.safe[view.round - 1]}`);
    if (view.stage === 'crusher') return reply(view.legalActions.includes('jam_lever') ? 'jam_lever' : 'stay');
    if (view.phase === 'pick') return reply(`tile:${view.alive.indexOf(view.you) + 1}`);
    return reply(view.legalActions.find((a) => ['wait', 'brace', 'hold'].includes(a)) ?? view.legalActions[0]);
  };
  const seen = new Set();
  for (let seed = 1; seed <= 30; seed++) {
    const tape = await runGame({ seed, agents: fixedAgents(wedgeJam), config: { powers: powersWith({ Ash: 'wedge', Bex: 'glass_eye' }) } });
    validateTape(tape);
    const discSurvivors = ofType(tape.events, 'stage_end').find((e) => e.stage === 'disc').survivors.length;
    const featherInDisc = ofType(tape.events, 'ability_use').some((e) => e.power === 'feather' && e.stage === 'disc');
    assert.equal(discSurvivors, featherInDisc ? 4 : 3);
    seen.add(discSurvivors);
    assert.equal(ofType(tape.events, 'stage_start').find((e) => e.stage === 'ledge').alive.length, discSurvivors);
  }
  assert.deepEqual([...seen].sort(), [3, 4]);
});

test('crusher deadline with nobody on the lever never wipes the room: a sole survivor wins at once', async () => {
  const { oracle, learn } = makeOracle();
  const policy = (view) => {
    learn(view);
    if (view.stage === 'bridge' && view.legalActions.includes('step:L')) return reply(`step:${oracle.safe[view.round - 1]}`);
    return reply(view.legalActions.find((a) => ['hold', 'wait', 'stay'].includes(a)));
  };
  for (const seed of [1, 2, 3, 4]) {
    const tape = await runGame({ seed, agents: fixedAgents(policy), config: { powers: powersWith({ Bex: 'glass_eye' }) } });
    validateTape(tape);
    assert.deepEqual(stagesRun(tape), ['bridge', 'crusher']);
    assert.equal(ofType(tape.events, 'death').length, 7);
    assert.equal(tape.result.places.filter((p) => p.place === 1).length, 1);
    const survivor = tape.result.places.find((p) => p.place === 1).name;
    const saved = ofType(tape.events, 'lucky_save').map((e) => e.name);
    const featherUsed = ofType(tape.events, 'ability_use').some((e) => e.power === 'feather');
    assert.ok(saved.includes(survivor) || featherUsed);
    assert.ok(!ofType(tape.events, 'death').some((d) => d.name === survivor));
  }
});
