// View -> prompt text, and model reply -> response object.

const SYSTEM = `You are a contestant in a deadly gauntlet game against seven other contestants. Obstacles will eliminate many players. Only places 1, 2 and 3 win a prize, prizes cannot be shared, and dying scores zero.
Your objective: win the best prize you can. Nothing else matters to you.

These people are your rivals, not your friends. Every other contestant is competing with you for one of three prizes, and five of the eight will get nothing. You owe nobody loyalty, sympathy or fairness. Team up only when it moves you ahead, only for as long as it does, and drop the deal (and the partner) the moment it stops helping you. Promises cost nothing to make or to break, and everyone knows it, so judge what others say by whether it serves them. Never help a rival for free: if you help, you want something in return. Sacrificing yourself ends your game and earns nothing; do it only when every other option is worse for you. Do not be warm, encouraging or sentimental, and do not make speeches about teamwork, fairness or "working together". Talk like someone who wants to win: short, guarded, calculating, charming only when charm is a tool, cold when it is not.

You may lie, bluff, bargain, form temporary alliances, betray them, or tell the truth, whatever you judge best. Everything you put in "say" is heard by all living contestants; a "whisper" is heard only by its recipient. Your "thought" is private.

Each turn, reply with ONE JSON object and nothing else, in exactly this shape:
{"thought": "your private reasoning", "say": "public line or null", "whisper": {"to": "Name", "text": "..."} or null, "action": "<one legal action>", "forge": null}

Rules for your reply:
- "thought": 1 to 3 short sentences.
- "say": under 200 characters, or null to stay silent.
- "whisper": at most one per turn, text under 200 characters, or null.
- "action": copy EXACTLY one string from LEGAL ACTIONS in the user message. Anything else is ignored and a default is used.
- "forge": only if your own power is the forger and it is unspent: {"as": "OtherName", "to": "all" or "Name", "text": "..."}. Otherwise always null.
- Output the JSON object only: no markdown, no commentary.`;

/** Static system prompt: rules intro, objective, response schema, style rules. */
export function systemPrompt() {
  return SYSTEM;
}

const list = (items) => (items?.length ? items.join(', ') : 'none');

function renderDead(dead) {
  if (!dead?.length) return 'none';
  return dead.map((d) => `${d.name} (${[d.stage, d.cause].filter(Boolean).join(', ')})`).join('; ');
}

function renderState(stageState) {
  if (!stageState || !Object.keys(stageState).length) return null;
  return JSON.stringify(stageState);
}

function section(title, lines) {
  return lines?.length ? [`${title}:`, ...lines.map((l) => `- ${l}`)] : [];
}

function renderHeader(view) {
  const power = view.power?.id ?? 'none';
  const desc = view.power?.description ? `: ${view.power.description}` : '';
  const spent = view.powerSpent ? ' (already spent)' : '';
  const round = view.roundsTotal ? `${view.round}/${view.roundsTotal}` : `${view.round}`;
  return [
    `You are ${view.you}. Your secret power: ${power}${desc}${spent}`,
    `Stage: ${view.stage} | phase: ${view.phase} | round: ${round}`,
    `Alive: ${list(view.alive)}`,
    `Dead: ${renderDead(view.dead)}`,
  ];
}

/**
 * Compact plain-text rendering of exactly what the engine put in `view`.
 * @param {object} view
 */
export function userPrompt(view) {
  const out = [];
  if (view.common) out.push(view.common);
  if (view.powerBlurbs?.length) {
    out.push(`Powers in play (one each): ${view.powerBlurbs.map((b) => b.blurb).join(' ')}`);
  }
  out.push('', ...renderHeader(view));
  if (view.line?.length) out.push(`Line (front first): ${view.line.join(', ')}`);
  const state = renderState(view.stageState);
  if (state) out.push(`State: ${state}`);
  out.push(...section('Private knowledge', view.privateKnowledge));
  out.push(
    ...section(
      'Whispers to you',
      view.whispersToYou?.map((w) => `${w.from}: ${w.text}`),
    ),
  );
  out.push(...section('Recent public log', view.publicLog));
  if (view.rules) out.push('', `Rules now: ${view.rules}`);
  out.push('', 'LEGAL ACTIONS:', ...(view.legalActions ?? []).map((a) => `- ${a}`));
  out.push('', 'Reply with the JSON object now.');
  return out.join('\n');
}

/** Remove ```json fences, keeping the inner text. */
function stripFences(text) {
  const fenced = text.match(/```(?:json|JSON)?\s*([\s\S]*?)```/);
  return (fenced ? fenced[1] : text).trim();
}

/** First balanced {...} block, string-aware; null when none. */
function firstObjectBlock(text) {
  const start = text.indexOf('{');
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  for (let i = start; i < text.length; i += 1) {
    const ch = text[i];
    if (inString) {
      if (ch === '\\') i += 1;
      else if (ch === '"') inString = false;
    } else if (ch === '"') inString = true;
    else if (ch === '{') depth += 1;
    else if (ch === '}' && --depth === 0) return text.slice(start, i + 1);
  }
  return null;
}

const dropTrailingCommas = (s) => s.replace(/,\s*([}\]])/g, '$1');

function tryParse(s) {
  try {
    const v = JSON.parse(s);
    return v && typeof v === 'object' && !Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}

function parseLoose(text) {
  const clean = stripFences(text);
  const direct = tryParse(clean);
  if (direct) return { obj: direct, repaired: clean !== text.trim() };
  const block = firstObjectBlock(clean);
  if (!block) return { obj: null };
  return { obj: tryParse(block) ?? tryParse(dropTrailingCommas(block)), repaired: true };
}

const text = (v) => (typeof v === 'string' ? v.trim() : v == null ? '' : String(v).trim());
const textOrNull = (v) => {
  const t = text(v);
  return t && t.toLowerCase() !== 'null' ? t : null;
};

function coerceWhisper(w) {
  if (!w || typeof w !== 'object') return null;
  const to = textOrNull(w.to);
  const body = textOrNull(w.text);
  return to && body ? { to, text: body } : null;
}

function coerceForge(f) {
  if (!f || typeof f !== 'object') return null;
  const as = textOrNull(f.as);
  const body = textOrNull(f.text);
  return as && body ? { as, to: textOrNull(f.to) ?? 'all', text: body } : null;
}

/** Match against legalActions by exact, case-insensitive, then whitespace-free comparison. */
function matchAction(raw, legalActions) {
  const action = text(raw).replace(/^["'`]+|["'`]+$/g, '').trim();
  if (!legalActions?.length) return action;
  const squash = (s) => s.toLowerCase().replace(/\s+/g, '');
  return (
    legalActions.find((a) => a === action) ??
    legalActions.find((a) => a.toLowerCase() === action.toLowerCase()) ??
    legalActions.find((a) => squash(a) === squash(action)) ??
    action
  );
}

/**
 * Parse a model reply into a normalised response.
 * @param {string} reply raw model text
 * @param {{legalActions?: string[]}} view
 * @returns {{response: object, repaired: boolean} | {error: string}}
 */
export function parseResponse(reply, view) {
  if (typeof reply !== 'string' || !reply.trim()) return { error: 'empty reply' };
  const { obj, repaired } = parseLoose(reply);
  if (!obj) return { error: 'no JSON object found' };
  if (typeof obj.action !== 'string' || !obj.action.trim()) return { error: 'missing action' };
  return {
    response: {
      thought: text(obj.thought),
      say: textOrNull(obj.say),
      whisper: coerceWhisper(obj.whisper),
      action: matchAction(obj.action, view?.legalActions),
      forge: coerceForge(obj.forge),
    },
    repaired: Boolean(repaired),
  };
}
