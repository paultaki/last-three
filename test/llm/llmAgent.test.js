import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createLlmAgent, probeModel, DEFAULT_ROSTER, RESERVE_MODELS } from '../../src/llm/llmAgent.js';
import { createLedger, SpendCapError } from '../../src/llm/ledger.js';
import { GatewayError } from '../../src/llm/gateway.js';

const view = { you: 'Ash', stage: 'bridge', phase: 'waiting', round: 1, alive: ['Ash'], legalActions: ['hold', 'volunteer'] };
const good = '{"thought":"t","say":null,"whisper":null,"action":"hold","forge":null}';
const reply = (text, inputTokens = 100, outputTokens = 20) => ({ text, usage: { inputTokens, outputTokens }, model: 'm/a' });
const makeLedger = (opts = {}) =>
  createLedger({ path: join(mkdtempSync(join(tmpdir(), 'agent-')), 'spend.json'), prices: { 'm/a': { input: 1e-6, output: 5e-6 } }, warn: () => {}, ...opts });
const scripted = (...steps) => {
  const calls = [];
  const fn = async (req) => {
    calls.push(req);
    const step = steps[Math.min(calls.length - 1, steps.length - 1)];
    if (step instanceof Error) throw step;
    return step;
  };
  fn.calls = calls;
  return fn;
};

test('roster constants match the spec', () => {
  assert.equal(DEFAULT_ROSTER.length, 8);
  assert.equal(new Set(DEFAULT_ROSTER).size, 8);
  assert.equal(RESERVE_MODELS.length, 3);
});

test('act returns the parsed response and books usage', async () => {
  const ledger = makeLedger();
  const chatFn = scripted(reply(good));
  const agent = createLlmAgent({ name: 'Ash', model: 'm/a', ledger, gameId: 'g1', chatFn });
  const out = await agent.act(view);
  assert.equal(out.action, 'hold');
  assert.equal(chatFn.calls.length, 1);
  assert.equal(chatFn.calls[0].model, 'm/a');
  assert.match(chatFn.calls[0].user, /LEGAL ACTIONS/);
  assert.deepEqual(agent.usage().calls, 1);
  assert.equal(ledger.gameTotals('g1').calls, 1);
});

test('unparseable first reply triggers exactly one repair retry', async () => {
  const chatFn = scripted(reply('sorry, no json'), reply(good));
  const agent = createLlmAgent({ name: 'Ash', model: 'm/a', ledger: makeLedger(), gameId: 'g', chatFn });
  const out = await agent.act(view);
  assert.equal(out.action, 'hold');
  assert.equal(chatFn.calls.length, 2);
  assert.match(chatFn.calls[1].user, /could not be used/);
});

test('two unusable replies throw so the engine can apply the default', async () => {
  const chatFn = scripted(reply('nope'), reply('still nope'));
  const agent = createLlmAgent({ name: 'Ash', model: 'm/a', ledger: makeLedger(), gameId: 'g', chatFn });
  await assert.rejects(agent.act(view), /unusable reply twice/);
  assert.equal(chatFn.calls.length, 2);
});

test('an empty completion from the gateway is treated as an unusable reply', async () => {
  const chatFn = scripted(new GatewayError('empty', { code: 'empty' }), reply(good));
  const agent = createLlmAgent({ name: 'Ash', model: 'm/a', ledger: makeLedger(), gameId: 'g', chatFn });
  assert.equal((await agent.act(view)).action, 'hold');
});

test('other gateway errors propagate untouched', async () => {
  const chatFn = scripted(new GatewayError('HTTP 500', { status: 500 }));
  const agent = createLlmAgent({ name: 'Ash', model: 'm/a', ledger: makeLedger(), gameId: 'g', chatFn });
  await assert.rejects(agent.act(view), /HTTP 500/);
});

test('usage accumulates across calls, including repairs', async () => {
  const chatFn = scripted(reply('bad', 100, 10), reply(good, 150, 20), reply(good, 50, 5));
  const agent = createLlmAgent({ name: 'Ash', model: 'm/a', ledger: makeLedger(), gameId: 'g', chatFn });
  await agent.act(view);
  await agent.act(view);
  const u = agent.usage();
  assert.equal(u.calls, 3);
  assert.equal(u.inputTokens, 300);
  assert.equal(u.outputTokens, 35);
  assert.ok(Math.abs(u.usd - (300 * 1e-6 + 35 * 5e-6)) < 1e-12);
});

test('a spend cap stops the call before it is made and is remembered', async () => {
  const ledger = makeLedger({ perGameCapUsd: 0 });
  const chatFn = scripted(reply(good));
  const agent = createLlmAgent({ name: 'Ash', model: 'm/a', ledger, gameId: 'g', chatFn });
  await assert.rejects(agent.act(view), SpendCapError);
  assert.equal(chatFn.calls.length, 0);
  assert.ok(agent.capError() instanceof SpendCapError);
});

test('probeModel is true for a JSON reply and false for failures', async () => {
  assert.equal(await probeModel('m/a', { chatFn: scripted(reply('{"ok":true}')) }), true);
  assert.equal(await probeModel('m/a', { chatFn: scripted(reply('```json\n{"ok": true}\n```')) }), true);
  assert.equal(await probeModel('m/a', { chatFn: scripted(reply('hello')) }), false);
  assert.equal(await probeModel('m/a', { chatFn: scripted(new Error('boom')) }), false);
});

test('probeModel books its cost under "probe" and propagates spend-cap errors', async () => {
  const ledger = makeLedger();
  await probeModel('m/a', { ledger, chatFn: scripted(reply('{"ok":true}')) });
  assert.equal(ledger.gameTotals('probe').calls, 1);
  const capped = makeLedger({ capUsd: 0 });
  await assert.rejects(probeModel('m/a', { ledger: capped, chatFn: scripted(reply('{"ok":true}')) }), SpendCapError);
});
