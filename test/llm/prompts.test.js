import { test } from 'node:test';
import assert from 'node:assert/strict';
import { systemPrompt, userPrompt, parseResponse } from '../../src/llm/prompts.js';

const view = {
  you: 'Ash',
  power: { id: 'glass_eye', description: 'You learn the safe side of every row.' },
  powerSpent: false,
  stage: 'bridge',
  phase: 'waiting',
  round: 3,
  roundsTotal: 6,
  alive: ['Ash', 'Bex', 'Cole'],
  dead: [{ name: 'Gus', stage: 'bridge', cause: 'glass' }],
  line: ['Ash', 'Cole'],
  stageState: { rowsCrossed: 0, front: 'Ash' },
  privateKnowledge: ['Row 1 safe side: L'],
  publicLog: ['Bex: hello there'],
  whispersToYou: [{ from: 'Bex', text: 'ally with me' }],
  rules: 'The wall advances each round.',
  legalActions: ['hold', 'volunteer', 'swap:Bex'],
  common: 'Eight contestants, three prizes.',
  powerBlurbs: [{ id: 'glass_eye', blurb: 'Someone can see through glass.' }],
  hiddenField: 'TOP-SECRET-SENTINEL',
};

test('userPrompt includes the view facts and every legal action', () => {
  const p = userPrompt(view);
  for (const needle of [
    'You are Ash', 'glass_eye', 'bridge', 'waiting', '3/6', 'Bex', 'Gus (bridge, glass)',
    'Line (front first): Ash, Cole', 'Row 1 safe side: L', 'ally with me', 'Bex: hello there',
    'The wall advances', 'Eight contestants', 'Someone can see through glass.',
    '- hold', '- volunteer', '- swap:Bex',
  ]) {
    assert.ok(p.includes(needle), `missing: ${needle}`);
  }
});

test('userPrompt contains nothing beyond the view fields', () => {
  assert.ok(!userPrompt(view).includes('TOP-SECRET-SENTINEL'));
});

test('userPrompt tolerates sparse views and stays compact', () => {
  const p = userPrompt({ you: 'Bex', stage: 'ledge', phase: 'play', round: 1, alive: ['Bex'], legalActions: ['brace'] });
  assert.ok(p.includes('- brace'));
  assert.ok(p.length < 2500);
});

test('systemPrompt is static and states objective and schema', () => {
  assert.equal(systemPrompt(), systemPrompt());
  assert.match(systemPrompt(), /Nothing else matters/);
  assert.match(systemPrompt(), /"whisper"/);
  assert.match(systemPrompt(), /forger/);
  assert.match(systemPrompt(), /rivals, not your friends/);
  assert.match(systemPrompt(), /Never help a rival for free/);
});

const base = '{"thought":"t","say":"hi","whisper":null,"action":"hold","forge":null}';

test('parseResponse accepts clean JSON', () => {
  const r = parseResponse(base, view);
  assert.equal(r.repaired, false);
  assert.deepEqual(r.response, { thought: 't', say: 'hi', whisper: null, action: 'hold', forge: null });
});

test('parseResponse handles fenced JSON', () => {
  const r = parseResponse('```json\n' + base + '\n```', view);
  assert.equal(r.response.action, 'hold');
  assert.equal(r.repaired, true);
});

test('parseResponse handles prose-wrapped JSON and braces inside strings', () => {
  const text = 'Sure! Here you go: {"thought":"a } brace","say":null,"action":"volunteer"} Hope that helps.';
  const r = parseResponse(text, view);
  assert.equal(r.response.thought, 'a } brace');
  assert.equal(r.response.action, 'volunteer');
});

test('parseResponse tolerates trailing commas', () => {
  const r = parseResponse('{"thought":"t","action":"hold","whisper":{"to":"Bex","text":"x",},}', view);
  assert.deepEqual(r.response.whisper, { to: 'Bex', text: 'x' });
});

test('parseResponse fills missing fields with null', () => {
  const r = parseResponse('{"action":"hold"}', view);
  assert.deepEqual(r.response, { thought: '', say: null, whisper: null, action: 'hold', forge: null });
});

test('parseResponse coerces action case and spacing to a legal action, never inventing one', () => {
  assert.equal(parseResponse('{"action":"  HOLD "}', view).response.action, 'hold');
  assert.equal(parseResponse('{"action":"swap: bex"}', view).response.action, 'swap:Bex');
  assert.equal(parseResponse('{"action":"fly away"}', view).response.action, 'fly away');
});

test('parseResponse coerces forge and drops malformed whisper', () => {
  const r = parseResponse('{"action":"hold","whisper":"hi","forge":{"as":"Cole","text":"boo"}}', view);
  assert.equal(r.response.whisper, null);
  assert.deepEqual(r.response.forge, { as: 'Cole', to: 'all', text: 'boo' });
});

test('parseResponse reports errors', () => {
  assert.ok(parseResponse('', view).error);
  assert.ok(parseResponse('I refuse to answer', view).error);
  assert.match(parseResponse('{"thought":"no action"}', view).error, /action/);
});
