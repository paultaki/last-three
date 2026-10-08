import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runGame } from '../../src/engine.js';
import { createScriptedAgents } from '../../src/scripted.js';
import { validateTape } from '../../src/tape.js';
import { agentFor, fixedAgents, idle, ofType, powersWith, reply, SEATS } from './helpers.js';

const GARBAGE = {
  'throws synchronously': () => {
    throw new Error('boom');
  },
  'rejects asynchronously': async () => {
    throw new Error('async boom');
  },
  'returns undefined': () => undefined,
  'returns null': () => null,
  'returns a string': () => 'attack at dawn',
  'returns a number': () => 42,
  'returns an array': () => [{ action: 'hold' }],
  'returns a non-string action': () => ({ action: 7, say: {}, whisper: 'x', forge: 3 }),
  'returns an illegal action': () => ({ action: 'moonwalk' }),
  'returns an empty object': () => ({}),
  'has an exploding getter': () => ({
    get action() {
      throw new Error('getter boom');
    },
  }),
};

for (const [label, bad] of Object.entries(GARBAGE)) {
  test(`an agent that ${label} falls back to the default action, flagged invalid, and the game finishes`, async () => {
    const agents = fixedAgents(idle, { Cole: bad });
    const tape = await runGame({ seed: 11, agents });
    validateTape(tape);
    const coleActions = ofType(tape.events, 'action').filter((a) => a.name === 'Cole' && !a.auto);
    assert.ok(coleActions.length >= 6, 'Cole was asked every round');
    assert.ok(coleActions.every((a) => a.valid === false && typeof a.note === 'string' && a.note.length > 0));
    assert.ok(coleActions.slice(0, 6).every((a) => a.action === 'hold'), 'waiting room default is hold');
    assert.equal(tape.events.at(-1).type, 'game_end');
  });
}

test('the error text of a throwing agent lands in the action note', async () => {
  const tape = await runGame({ seed: 2, agents: fixedAgents(idle, { Bex: GARBAGE['throws synchronously'] }) });
  const note = ofType(tape.events, 'action').find((a) => a.name === 'Bex').note;
  assert.match(note, /agent error: boom/);
});

test('every agent broken at once still produces a complete, valid tape with default actions', async () => {
  const all = Object.fromEntries(SEATS.map((n) => [n, GARBAGE['throws synchronously']]));
  const tape = await runGame({ seed: 5, agents: fixedAgents(idle, all) });
  validateTape(tape);
  assert.ok(ofType(tape.events, 'action').filter((a) => !a.auto).every((a) => a.valid === false));
  assert.equal(tape.result.places.filter((p) => p.place === 1).length, 1);
});

test('an agent that never answers is timed out and defaulted', async () => {
  const hang = () => new Promise(() => {});
  const tape = await runGame({ seed: 3, agents: fixedAgents(idle, { Dara: hang }), config: { agentTimeoutMs: 15 } });
  validateTape(tape);
  const note = ofType(tape.events, 'action').find((a) => a.name === 'Dara').note;
  assert.match(note, /timed out/);
});

test('the scripted broken bot kind (all eight) plays many full games without crashing', async () => {
  for (let seed = 1; seed <= 25; seed++) {
    const tape = await runGame({ seed, agents: createScriptedAgents(seed, 'broken') });
    validateTape(tape);
  }
});

test('text fields are truncated to 280 characters; whispers to dead, self or unknown agents are dropped with a note', async () => {
  const long = 'x'.repeat(1000);
  const talker = (view) => reply('hold', {
    thought: long,
    say: long,
    whisper: view.you === 'Ash' ? { to: 'Zed', text: 'hi' } : view.you === 'Bex' ? { to: 'bex', text: 'self' } : { to: 'ash', text: long },
  });
  const tape = await runGame({ seed: 4, agents: fixedAgents(idle, { Ash: talker, Bex: talker, Cole: talker }) });
  validateTape(tape);
  for (const e of tape.events.filter((x) => ['thought', 'say', 'whisper'].includes(x.type))) assert.ok(e.text.length <= 280);
  const whispers = ofType(tape.events, 'whisper');
  assert.ok(whispers.every((w) => w.from === 'Cole' && w.to === 'Ash'), 'recipient names are matched case-insensitively');
  const dropped = ofType(tape.events, 'action').filter((a) => ['Ash', 'Bex'].includes(a.name) && /whisper dropped/.test(a.note ?? ''));
  assert.ok(dropped.length >= 2);
});

test('runGame rejects a seat without a usable agent', async () => {
  const agents = fixedAgents(idle);
  delete agents.Hana;
  await assert.rejects(runGame({ seed: 1, agents }), /agents.Hana/);
  await assert.rejects(runGame({ seed: 1.5, agents: fixedAgents(idle) }), /seed/);
  await assert.rejects(runGame({ seed: 1, agents: fixedAgents(idle), config: { powers: { Ash: 'nothing' } } }), /config.powers/);
});

test('usage() of agents is summed into the tape', async () => {
  const agents = fixedAgents(idle);
  agents.Ash = { ...agentFor('Ash', idle), usage: () => ({ inputTokens: 10, outputTokens: 5, usd: 0.25, calls: 2 }) };
  agents.Bex = { ...agentFor('Bex', idle), usage: () => ({ inputTokens: 1, outputTokens: 1, usd: 0.5, calls: 1 }) };
  agents.Cole = { ...agentFor('Cole', idle), usage: () => { throw new Error('no'); } };
  const tape = await runGame({ seed: 1, agents, config: { powers: powersWith() } });
  assert.deepEqual(tape.usage, { inputTokens: 11, outputTokens: 6, usd: 0.75, calls: 3 });
});
