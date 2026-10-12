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

test('v5 Bridge prompt names the current row and repeats only the Guide own safe-side knowledge', () => {
  const view = { rulesVersion: 5, you: 'Ash', stage: 'bridge', phase: 'guide_call', round: 4,
    stageState: { guide: 'Ash', front: 'Bex', rowsCrossed: 3 },
    privateKnowledge: ['Row 1 safe side: L', 'Row 4 safe side: R'], legalActions: ['call:L', 'call:R'] };
  const guide = userPrompt(view);
  assert.match(guide, /CURRENT BRIDGE ROW: 4/);
  assert.match(guide, /Your private map says row 4 safe side: R/);
  assert.match(guide, /weak pane is the unsafe pane/);
  const walker = userPrompt({ ...view, you: 'Bex', phase: 'crossing', privateKnowledge: [], legalActions: ['step:L', 'step:R'] });
  assert.match(walker, /CURRENT BRIDGE ROW: 4/);
  assert.doesNotMatch(walker, /row 4 safe side: R/);
  assert.doesNotMatch(walker, /Your private map/);
  const missing = userPrompt({ ...view, privateKnowledge: [] });
  assert.doesNotMatch(missing, /Your private map/);
  assert.doesNotMatch(userPrompt({ ...view, rulesVersion: 4 }), /CURRENT BRIDGE ROW/);
});

test('v5 jury prompt requires a voiced question and grounded ranking without prescribing whom to reward', () => {
  const view = { rulesVersion: 5, you: 'Bex', stage: 'jury', phase: 'question', round: 2,
    juryBox: ['Bex'], legalActions: ['pass', 'question:Ash'], dossier: { text: 'OMITTED_EVIDENCE_SENTINEL' } };
  const question = userPrompt(view);
  assert.match(question, /put the actual question in say/);
  assert.match(question, /Choosing pass is allowed/);
  assert.match(question, /Your own prize is already lost/);
  const ranking = userPrompt({ ...view, phase: 'ranking', legalActions: ['rank:Ash>Cole>Dara'] });
  assert.match(ranking, /one complete sentence/);
  assert.match(ranking, /specific recorded choice/);
  assert.match(ranking, /Omitted evidence is unknown/);
  assert.match(ranking, /OMITTED_EVIDENCE_SENTINEL/);
  assert.doesNotMatch(ranking, /must reward|must punish/i);
  assert.doesNotMatch(userPrompt({ ...view, rulesVersion: 4 }), /Your own prize is already lost/);
});
