// Chat-completions client for the Vercel AI Gateway (OpenAI-compatible).
// Zero dependencies: global fetch, node:fs and node:child_process only.
import { readFileSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ENDPOINT = 'https://ai-gateway.vercel.sh/v1/chat/completions';
const PROJECT_ROOT = fileURLToPath(new URL('../../', import.meta.url));
const ENV_FILE = `${PROJECT_ROOT}.env.local`;
const VERCEL_SCOPE = 'pauls-projects-667765b0';
const MAX_RETRIES = 2;
const BACKOFF_MS = 1000;
const DEFAULT_TIMEOUT_MS = 60_000;

/** Error raised for any gateway failure; `status` is the HTTP code when there was one. */
export class GatewayError extends Error {
  constructor(message, { status = null, code = null } = {}) {
    super(message);
    this.name = 'GatewayError';
    this.status = status;
    this.code = code;
  }
}

const hooks = {
  fetch: (...args) => globalThis.fetch(...args),
  exec: runVercelPull,
  readToken: readEnvToken,
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  timeoutMs: DEFAULT_TIMEOUT_MS,
};
let cachedToken = null;
let refreshPromise = null;
const noJsonFormat = new Set();
const noReasoningParam = new Set();

/** Inject a fetch implementation (tests). */
export function setFetch(fn) {
  hooks.fetch = fn;
}

/**
 * Override internals for tests: `exec` (token refresh runner), `readToken`,
 * `sleep` (backoff) and `timeoutMs`.
 */
export function setHooks(overrides) {
  Object.assign(hooks, overrides);
}

/** Restore defaults and clear all caches (tests). */
export function resetGateway() {
  hooks.fetch = (...args) => globalThis.fetch(...args);
  hooks.exec = runVercelPull;
  hooks.readToken = readEnvToken;
  hooks.sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  hooks.timeoutMs = DEFAULT_TIMEOUT_MS;
  cachedToken = null;
  refreshPromise = null;
  noJsonFormat.clear();
  noReasoningParam.clear();
}

function readEnvToken() {
  let text = '';
  try {
    text = readFileSync(ENV_FILE, 'utf8');
  } catch {
    return null;
  }
  const line = text.split('\n').find((l) => l.startsWith('VERCEL_OIDC_TOKEN='));
  if (!line) return null;
  return line.slice('VERCEL_OIDC_TOKEN='.length).trim().replace(/^["']|["']$/g, '') || null;
}

function runVercelPull() {
  const args = ['env', 'pull', '.env.local', '--yes', '--scope', VERCEL_SCOPE];
  return new Promise((resolve, reject) => {
    execFile('vercel', args, { cwd: PROJECT_ROOT, timeout: 120_000 }, (err) =>
      err ? reject(err) : resolve(),
    );
  });
}

function currentToken() {
  if (process.env.AI_GATEWAY_API_KEY) return process.env.AI_GATEWAY_API_KEY;
  if (!cachedToken) cachedToken = hooks.readToken();
  if (!cachedToken) {
    throw new GatewayError('No gateway token: set AI_GATEWAY_API_KEY or run `vercel env pull`', {
      code: 'no_token',
    });
  }
  return cachedToken;
}

/** One shared in-flight `vercel env pull`, whatever the number of callers. */
function refreshToken() {
  if (!refreshPromise) {
    refreshPromise = Promise.resolve(hooks.exec())
      .then(() => {
        cachedToken = null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function canRefresh() {
  return !process.env.AI_GATEWAY_API_KEY;
}

async function post(body, token, callerSignal) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error('timeout')), hooks.timeoutMs);
  const onCallerAbort = () => controller.abort(callerSignal.reason);
  if (callerSignal) {
    if (callerSignal.aborted) controller.abort(callerSignal.reason);
    else callerSignal.addEventListener('abort', onCallerAbort, { once: true });
  }
  try {
    return await hooks.fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
    callerSignal?.removeEventListener('abort', onCallerAbort);
  }
}

function extractText(data) {
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === 'string' && content.trim()) return content;
  if (Array.isArray(content)) {
    const joined = content.map((p) => (typeof p === 'string' ? p : p?.text ?? '')).join('');
    if (joined.trim()) return joined;
  }
  throw new GatewayError('Gateway returned an empty completion', { code: 'empty' });
}

function readUsage(data, system, user, text) {
  const inputTokens = data?.usage?.prompt_tokens;
  const outputTokens = data?.usage?.completion_tokens;
  return {
    inputTokens: Number.isFinite(inputTokens) ? inputTokens : Math.ceil((system.length + user.length) / 4),
    outputTokens: Number.isFinite(outputTokens) ? outputTokens : Math.ceil(text.length / 4),
  };
}

function isRetryable(status) {
  return status === 429 || (status >= 500 && status <= 599);
}

/**
 * Send one chat completion.
 * @param {{model: string, system: string, user: string, maxTokens?: number,
 *   temperature?: number, json?: boolean, thinking?: boolean, signal?: AbortSignal}} opts
 * @returns {Promise<{text: string, usage: {inputTokens: number, outputTokens: number}, model: string}>}
 */
export async function chat({ model, system, user, maxTokens = 800, temperature = 1, json = true, thinking = false, signal }) {
  const buildBody = () => {
    const body = {
      model,
      temperature,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    };
    if (json && !noJsonFormat.has(model)) body.response_format = { type: 'json_object' };
    // Thinking models spend the whole token budget on hidden reasoning and return nothing; the game wants quick answers.
    if (!thinking && !noReasoningParam.has(model)) body.reasoning = { enabled: false };
    return body;
  };

  let attempt = 0;
  let refreshed = false;
  for (;;) {
    const token = currentToken();
    let res;
    try {
      res = await post(buildBody(), token, signal);
    } catch (err) {
      if (signal?.aborted || attempt >= MAX_RETRIES) {
        throw new GatewayError(`Gateway request failed: ${err?.message ?? err}`, { code: 'network' });
      }
      await hooks.sleep(BACKOFF_MS * 2 ** attempt++);
      continue;
    }

    if (res.ok) {
      const data = await res.json();
      const text = extractText(data);
      return { text, usage: readUsage(data, system, user, text), model: data?.model ?? model };
    }

    const detail = (await res.text().catch(() => '')).slice(0, 400);
    if (res.status === 401 && !refreshed && canRefresh()) {
      refreshed = true;
      if (token === currentTokenSafe()) await refreshToken();
      continue;
    }
    if (res.status === 400 && json && !noJsonFormat.has(model) && /response_format/i.test(detail)) {
      noJsonFormat.add(model);
      continue;
    }
    if (res.status === 400 && !thinking && !noReasoningParam.has(model) && /reasoning/i.test(detail)) {
      noReasoningParam.add(model);
      continue;
    }
    if (isRetryable(res.status) && attempt < MAX_RETRIES) {
      await hooks.sleep(BACKOFF_MS * 2 ** attempt++);
      continue;
    }
    throw new GatewayError(`Gateway HTTP ${res.status} for ${model}: ${detail}`, { status: res.status });
  }
}

/** Token as currently cached, without throwing; used to detect a refresh by another caller. */
function currentTokenSafe() {
  try {
    return currentToken();
  } catch {
    return null;
  }
}
