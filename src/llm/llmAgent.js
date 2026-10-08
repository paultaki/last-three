// LLM-backed Agent: view -> prompt -> gateway -> parsed response.
import { chat } from './gateway.js';
import { systemPrompt, userPrompt, parseResponse } from './prompts.js';
import { SpendCapError } from './ledger.js';

/** Default 8-seat roster (varied makers). */
export const DEFAULT_ROSTER = [
  'anthropic/claude-haiku-5.5',
  'openai/gpt-oss-120b',
  'google/gemini-2.5-flash-lite',
  'deepseek/deepseek-v4-flash',
  'alibaba/qwen3.8-flash',
  'zai/glm-5.3-flash',
  'spacexai/grok-4.1-fast-non-reasoning',
  'meta/llama-4-maverick',
];

/** Heavyweight 8-seat roster: stronger (about 20x pricier) models, better bluffers. */
export const HEAVY_ROSTER = [
  'anthropic/claude-sonnet-5.5',
  'google/gemini-3.1-pro-preview',
  'openai/gpt-5.6-luna',
  'moonshotai/kimi-k2.6',
  'deepseek/deepseek-v4-pro',
  'alibaba/qwen3.8-max',
  'spacexai/grok-4.1-fast-reasoning',
  'zai/glm-5.3-flashx',
];

/** Substitutes for any roster model that fails its probe. */
export const RESERVE_MODELS = [
  'mistral/mistral-small',
  'google/gemini-3.1-flash-lite',
  'alibaba/qwen3.8-omni-flash',
];

const MAX_TOKENS = 800;
const REPAIR_NOTE =
  'Your last reply could not be used. Reply again with ONLY the JSON object: ' +
  '{"thought": "...", "say": "..." or null, "whisper": {"to": "Name", "text": "..."} or null, ' +
  '"action": "<one of LEGAL ACTIONS exactly>", "forge": null}';

const approxTokens = (s) => Math.ceil(s.length / 4);

/**
 * @param {{name: string, model: string, ledger?: object, gameId?: string,
 *   chatFn?: typeof chat, maxTokens?: number}} opts
 * @returns {{name: string, model: string, act: (view: object) => Promise<object>,
 *   usage: () => object, capError: () => (Error | null)}}
 */
export function createLlmAgent({ name, model, ledger, gameId, chatFn = chat, maxTokens = MAX_TOKENS }) {
  const totals = { inputTokens: 0, outputTokens: 0, usd: 0, calls: 0 };
  let capError = null;

  async function ask(system, user) {
    await ledger?.ready?.();
    try {
      ledger?.assertCanSpend(ledger.costOf(model, approxTokens(system + user), maxTokens), gameId);
    } catch (err) {
      if (err instanceof SpendCapError) capError = err;
      throw err;
    }
    const res = await chatFn({ model, system, user, maxTokens });
    const { inputTokens, outputTokens } = res.usage;
    const usd = ledger ? ledger.record(model, inputTokens, outputTokens, gameId) : 0;
    totals.inputTokens += inputTokens;
    totals.outputTokens += outputTokens;
    totals.usd += usd;
    totals.calls += 1;
    return res.text;
  }

  /** A gateway "empty completion" counts as an unusable reply, so the repair retry applies. */
  async function askOrEmpty(system, user) {
    try {
      return await ask(system, user);
    } catch (err) {
      if (err?.code === 'empty') return '';
      throw err;
    }
  }

  return {
    name,
    model,
    async act(view) {
      const system = systemPrompt();
      const user = userPrompt(view);
      const first = parseResponse(await askOrEmpty(system, user), view);
      if (first.response) return first.response;
      const retry = parseResponse(await askOrEmpty(system, `${user}\n\n${REPAIR_NOTE}`), view);
      if (retry.response) return retry.response;
      throw new Error(`${name} (${model}): unusable reply twice (${first.error}; ${retry.error})`);
    },
    usage: () => ({ ...totals }),
    capError: () => capError,
  };
}

/**
 * Tiny connectivity check: ask for {"ok":true}. Returns true/false; spend-cap errors propagate.
 * @param {string} model
 * @param {{ledger?: object, chatFn?: typeof chat}} [opts]
 */
export async function probeModel(model, { ledger, chatFn = chat } = {}) {
  try {
    await ledger?.ready?.();
    ledger?.assertCanSpend(ledger.costOf(model, 60, 200));
    const res = await chatFn({
      model,
      system: 'Reply with a JSON object only.',
      user: 'Reply with exactly this JSON and nothing else: {"ok":true}',
      maxTokens: 600,
    });
    ledger?.record(model, res.usage.inputTokens, res.usage.outputTokens, 'probe');
    const { obj } = parseProbe(res.text);
    return Boolean(obj);
  } catch (err) {
    if (err instanceof SpendCapError) throw err;
    return false;
  }
}

function parseProbe(text) {
  const match = /\{[\s\S]*\}/.exec(text);
  try {
    return { obj: match ? JSON.parse(match[0]) : null };
  } catch {
    return { obj: null };
  }
}
