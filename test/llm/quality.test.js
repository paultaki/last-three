import { test } from 'node:test';
import assert from 'node:assert/strict';
import { degenerateAgents } from '../../bin/run-llm.js';

const action = (name, note) => ({ type: 'action', name, action: 'hold', valid: !note, ...(note ? { note } : {}) });

function tape(events) {
  return { players: [{ name: 'Ash', model: 'm/a' }, { name: 'Bex', model: 'm/b' }], events };
}

test('an agent whose calls mostly failed is flagged', () => {
  const events = [];
  for (let i = 0; i < 10; i += 1) events.push(action('Ash'), action('Bex', 'agent error: Bex (m/b): unusable reply twice'));
  assert.deepEqual(degenerateAgents(tape(events)), [{ name: 'Bex', model: 'm/b', errors: 10, actions: 10 }]);
});

test('a few errors, or too few actions to judge, are fine', () => {
  const events = [];
  for (let i = 0; i < 10; i += 1) events.push(action('Ash', i < 2 ? 'agent error: x' : undefined));
  for (let i = 0; i < 4; i += 1) events.push(action('Bex', 'agent error: x'));
  assert.deepEqual(degenerateAgents(tape(events)), []);
});

test('invalid-but-not-errored actions do not count', () => {
  const events = Array.from({ length: 12 }, () => action('Ash', 'brace not allowed twice in a row'));
  assert.deepEqual(degenerateAgents(tape(events)), []);
});
