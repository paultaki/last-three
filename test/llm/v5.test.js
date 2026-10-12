import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { systemPrompt, userPrompt, parseResponse } from '../../src/llm/prompts.js';
import { createLlmAgent, MIXED_ROSTER } from '../../src/llm/llmAgent.js';
import { runGame } from '../../src/engine.js';
import { createScriptedAgents } from '../../src/scripted.js';
const removed = /\b(?:power|powers|chalk|forge|forging|forger|feather|wedge)\b/i;

test('v5 mixed roster exactly matches the requested eight models', () => {
  assert.deepEqual(MIXED_ROSTER, ['anthropic/claude-haiku-5.5', 'openai/gpt-oss-120b', 'google/gemini-2.5-flash-lite', 'spacexai/grok-4.1-fast-non-reasoning', 'deepseek/deepseek-v4-flash', 'alibaba/qwen3.8-flash', 'moonshotai/kimi-k2.6', 'zai/glm-5.3-flash']);
});

test('v5 every generated prompt excludes removed mechanics and discloses jury from the first turn', async () => {
  const agents = createScriptedAgents(32);
  const views = [];
  for (const a of Object.values(agents)) {
    const act = a.act;
    a.act = v => { views.push(v); return act(v); };
  }
  await runGame({ seed: 32, agents });
  assert.doesNotMatch(systemPrompt(), removed);
  const first = views.filter(v => v.phase === 'intro');
  assert.equal(first.length, 8);
  for (const v of first) assert.match(userPrompt(v), /jury.*rank the final three/);
  for (const v of views) {
    assert.doesNotMatch(userPrompt(v), removed, `${v.stage}/${v.phase}`);
    assert.ok(!('power' in v) && !('chalkWall' in v));
  }
});

test('v5 parser and repair prompt exclude retired schema, and observed events require no model call', async () => {
  const calls = [];
  const a = createLlmAgent({ name: 'Ash', model: 'offline/stub', chatFn: async r => {
    calls.push(r);
    return { text: calls.length === 1 ? 'bad' : '{"action":"pass","thought":"I listened."}', usage: { inputTokens: 0, outputTokens: 0 } };
  } });
  a.observe({ type: 'say', name: 'Bex', text: 'Remember this line.', visibility: 'public' });
  a.observe({ type: 'thought', name: 'Bex', text: 'PRIVATE_SENTINEL', visibility: 'private' });
  assert.equal(calls.length, 0);
  const view = { rulesVersion: 5, you: 'Ash', stage: 'jury', phase: 'question', round: 2, legalActions: ['pass'], juryBox: ['Ash'] };
  const result = await a.act(view);
  assert.ok(!('forge' in result));
  assert.equal(calls.length, 2);
  assert.ok(calls.every(c => c.user.includes('Remember this line') && !c.user.includes('PRIVATE_SENTINEL')));
  assert.ok(calls.every(c => !removed.test(c.system + c.user)));
  assert.ok(!('forge' in parseResponse('{"action":"pass","forge":{"as":"Bex","text":"boo"}}', view).response));
});

test('v5 paid runners are wired to mixed roster and do not access persistent chalk', () => {
  for (const file of ['bin/run-llm.js', 'bin/batch.js']) {
    const source = readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8');
    assert.match(source, /mixed: MIXED_ROSTER/);
    assert.doesNotMatch(source, /pickChalk|appendChalk|llm\/chalk/);
  }
});
