import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runGame } from '../../src/engine.js';
import { BOT_KINDS, createScriptedAgents } from '../../src/scripted.js';
import { validateTape } from '../../src/tape.js';

const mix = (seed) => Array.from({ length: 8 }, (_, k) => BOT_KINDS[(seed + k * 3) % BOT_KINDS.length]);
const play = (seed, kinds = mix(seed)) => runGame({ seed, agents: createScriptedAgents(seed, kinds) });

test('same seed and same scripted agents give a byte-identical JSON tape (20 seeds)', async () => {
  for (let seed = 1; seed <= 20; seed++) {
    const a = JSON.stringify(await play(seed));
    const b = JSON.stringify(await play(seed));
    assert.equal(a, b, `seed ${seed} diverged`);
  }
});

test('determinism does not depend on how fast agents answer', async () => {
  const slow = (agents) => Object.fromEntries(Object.entries(agents).map(([seat, agent], k) => [
    seat,
    { ...agent, act: async (view) => { await new Promise((r) => setTimeout(r, (8 - k) % 3)); return agent.act(view); } },
  ]));
  // Scripted bots draw from their own RNGs in call order, which is seat order either way.
  const fast = await runGame({ seed: 9, agents: createScriptedAgents(9, ['saint', 'coward', 'shover', 'saint', 'coward', 'shover', 'saint', 'coward']) });
  const lazy = await runGame({ seed: 9, agents: slow(createScriptedAgents(9, ['saint', 'coward', 'shover', 'saint', 'coward', 'shover', 'saint', 'coward'])) });
  assert.equal(JSON.stringify(lazy), JSON.stringify(fast));
});

test('different seeds give different games, and the tape is JSON round-trippable', async () => {
  const a = await play(1);
  const b = await play(2);
  assert.notEqual(JSON.stringify(a.events), JSON.stringify(b.events));
  const again = JSON.parse(JSON.stringify(a));
  assert.deepEqual(again, a);
  validateTape(again);
});

test('the default id and createdAt are stable; callers can override them', async () => {
  const plain = await play(7);
  assert.match(plain.id, /^20261008-0007$/);
  assert.equal(plain.createdAt, '2026-10-08T00:00:00.000Z');
  const custom = await runGame({ seed: 7, agents: createScriptedAgents(7, mix(7)), config: { id: 'abc', createdAt: '2026-10-09T10:00:00.000Z' } });
  assert.deepEqual([custom.id, custom.createdAt], ['abc', '2026-10-09T10:00:00.000Z']);
  assert.equal(JSON.stringify(custom.events), JSON.stringify(plain.events));
});
