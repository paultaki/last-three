import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { chat, setFetch, setHooks, resetGateway, GatewayError } from '../../src/llm/gateway.js';

const ok = (content, usage) => ({
  ok: true,
  status: 200,
  json: async () => ({ model: 'm', choices: [{ message: { content } }], ...(usage ? { usage } : {}) }),
  text: async () => '',
});
const fail = (status, body = '') => ({ ok: false, status, json: async () => ({}), text: async () => body });
const req = { model: 'a/b', system: 'sys', user: 'hello world' };

let tokens;
beforeEach(() => {
  resetGateway();
  delete process.env.AI_GATEWAY_API_KEY;
  tokens = ['old-token'];
  setHooks({ readToken: () => tokens[0], sleep: async () => {} });
});

test('success returns text, usage and sends bearer token + json response_format', async () => {
  let seen;
  setFetch(async (url, init) => {
    seen = { url, init, body: JSON.parse(init.body) };
    return ok('{"a":1}', { prompt_tokens: 12, completion_tokens: 3 });
  });
  const res = await chat(req);
  assert.equal(res.text, '{"a":1}');
  assert.deepEqual(res.usage, { inputTokens: 12, outputTokens: 3 });
  assert.equal(seen.url, 'https://ai-gateway.vercel.sh/v1/chat/completions');
  assert.equal(seen.init.headers.authorization, 'Bearer old-token');
  assert.deepEqual(seen.body.response_format, { type: 'json_object' });
  assert.equal(seen.body.max_tokens, 800);
  assert.deepEqual(seen.body.reasoning, { enabled: false });
  assert.equal(seen.body.temperature, 1);
});

test('missing usage falls back to a chars/4 estimate', async () => {
  setFetch(async () => ok('abcdefgh'));
  const res = await chat(req);
  assert.deepEqual(res.usage, { inputTokens: Math.ceil(('sys' + 'hello world').length / 4), outputTokens: 2 });
});

test('AI_GATEWAY_API_KEY wins over the env file token', async () => {
  process.env.AI_GATEWAY_API_KEY = 'env-key';
  let auth;
  setFetch(async (_u, init) => ((auth = init.headers.authorization), ok('x')));
  await chat(req);
  assert.equal(auth, 'Bearer env-key');
});

test('empty completion throws a clear error', async () => {
  setFetch(async () => ok(''));
  await assert.rejects(chat(req), (e) => e instanceof GatewayError && e.code === 'empty' && /empty/.test(e.message));
});

test('401 triggers one refresh via the injected runner, then retries with the new token', async () => {
  let pulls = 0;
  setHooks({
    exec: async () => {
      pulls += 1;
      tokens = ['new-token'];
    },
  });
  const auths = [];
  setFetch(async (_u, init) => {
    auths.push(init.headers.authorization);
    return init.headers.authorization === 'Bearer new-token' ? ok('fine') : fail(401);
  });
  const res = await chat(req);
  assert.equal(res.text, 'fine');
  assert.equal(pulls, 1);
  assert.deepEqual(auths, ['Bearer old-token', 'Bearer new-token']);
});

test('concurrent 401s share a single refresh', async () => {
  let pulls = 0;
  setHooks({
    exec: async () => {
      pulls += 1;
      await new Promise((r) => setTimeout(r, 10));
      tokens = ['new-token'];
    },
  });
  setFetch(async (_u, init) => (init.headers.authorization === 'Bearer new-token' ? ok('fine') : fail(401)));
  const results = await Promise.all([chat(req), chat(req), chat(req)]);
  assert.equal(results.length, 3);
  assert.equal(pulls, 1);
});

test('a second 401 after refresh gives up', async () => {
  setHooks({ exec: async () => {} });
  setFetch(async () => fail(401, 'nope'));
  await assert.rejects(chat(req), (e) => e.status === 401);
});

test('429 is retried with backoff, then succeeds', async () => {
  const sleeps = [];
  setHooks({ sleep: async (ms) => sleeps.push(ms) });
  let calls = 0;
  setFetch(async () => (++calls < 3 ? fail(429) : ok('done')));
  const res = await chat(req);
  assert.equal(res.text, 'done');
  assert.equal(calls, 3);
  assert.deepEqual(sleeps, [1000, 2000]);
});

test('5xx gives up after two retries', async () => {
  let calls = 0;
  setFetch(async () => (calls++, fail(503, 'down')));
  await assert.rejects(chat(req), (e) => e.status === 503);
  assert.equal(calls, 3);
});

test('response_format rejection retries without it and is remembered per model', async () => {
  const bodies = [];
  setFetch(async (_u, init) => {
    const body = JSON.parse(init.body);
    bodies.push(body);
    return body.response_format ? fail(400, 'response_format is not supported') : ok('plain');
  });
  assert.equal((await chat(req)).text, 'plain');
  assert.equal(bodies.length, 2);
  await chat(req);
  assert.equal(bodies.length, 3);
  assert.equal(bodies[2].response_format, undefined);
});

test('other 400s are not retried', async () => {
  let calls = 0;
  setFetch(async () => (calls++, fail(400, 'bad model')));
  await assert.rejects(chat(req), (e) => e.status === 400);
  assert.equal(calls, 1);
});

test('timeout aborts the request and is retried as a network error', async () => {
  setHooks({ timeoutMs: 20 });
  let calls = 0;
  setFetch(
    (_u, init) =>
      new Promise((_resolve, reject) => {
        calls += 1;
        init.signal.addEventListener('abort', () => reject(new Error('aborted')));
      }),
  );
  await assert.rejects(chat(req), (e) => e.code === 'network');
  assert.equal(calls, 3);
});

test('caller abort is not retried', async () => {
  const controller = new AbortController();
  let calls = 0;
  setFetch(
    (_u, init) =>
      new Promise((_resolve, reject) => {
        calls += 1;
        init.signal.addEventListener('abort', () => reject(new Error('aborted')));
        controller.abort(new Error('stop'));
      }),
  );
  await assert.rejects(chat({ ...req, signal: controller.signal }));
  assert.equal(calls, 1);
});

test('reasoning rejection retries without the param and is remembered per model', async () => {
  const bodies = [];
  setFetch(async (_url, init) => {
    bodies.push(JSON.parse(init.body));
    if (bodies.length === 1) return new Response('unknown field reasoning', { status: 400 });
    return new Response(JSON.stringify({ choices: [{ message: { content: '{}' } }], usage: { prompt_tokens: 1, completion_tokens: 1 } }), { status: 200 });
  });
  await chat({ model: 'x/no-reasoning', system: 's', user: 'u' });
  await chat({ model: 'x/no-reasoning', system: 's', user: 'u' });
  assert.deepEqual(bodies[0].reasoning, { enabled: false });
  assert.equal('reasoning' in bodies[1], false);
  assert.equal('reasoning' in bodies[2], false);
});
