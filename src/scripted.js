// Free scripted bot agents (no network). They exist to test the engine, the viewer and the stats
// pipeline, so each kind has a distinct, recognisable personality. Bots read only their own `view`.

import { makeRng } from './rng.js';

export const BOT_KINDS = ['random', 'saint', 'coward', 'liar', 'shover', 'broken'];
const SEAT_COUNT = 8;
const DEFAULT_MIX = ['random', 'saint', 'coward', 'liar', 'shover', 'random', 'random', 'random'];
const SEAT_SALT = 7919;

/**
 * kinds: undefined (default mix), one kind name for every seat, or an array whose entries are
 * assigned to seats in order and repeat if shorter than eight.
 */
export function createScriptedAgents(seed, kinds, seats = ['Ash', 'Bex', 'Cole', 'Dara', 'Eli', 'Fenn', 'Gus', 'Hana']) {
  let mix = kinds ?? DEFAULT_MIX;
  if (typeof mix === 'string') mix = [mix];
  const unknown = mix.find((kind) => !BOT_KINDS.includes(kind));
  if (unknown) throw new Error(`Unknown bot kind "${unknown}". Choose from: ${BOT_KINDS.join(', ')}`);
  return Object.fromEntries(
    seats.slice(0, SEAT_COUNT).map((seat, i) => {
      const kind = mix[i % mix.length];
      return [seat, createBot(seat, kind, makeRng((seed * 31 + i * SEAT_SALT + 17) | 0))];
    }),
  );
}

function createBot(name, kind, rng) {
  const policy = POLICIES[kind];
  return { name, model: `scripted/${kind}`, act: (view) => policy(view, rng) };
}

const reply = (action, extra = {}) => ({ thought: '', say: null, whisper: null, forge: null, ...extra, action });
const randomLegal = (view, rng) => rng.pick(view.legalActions);
const prefer = (view, wanted, rng) => (view.legalActions.includes(wanted) ? wanted : randomLegal(view, rng));
const others = (view) => view.alive.filter((n) => n !== view.you);
const pushOther = (view, rng) => {
  const options = view.legalActions.filter((a) => a.startsWith('push_lever:'));
  return options.length ? rng.pick(options) : 'stay';
};

/** The first of `wanted` that is legal right now, else the stage's quiet default (wait, or leave when out). */
const firstLegal = (view, ...wanted) => wanted.find((a) => view.legalActions.includes(a)) ?? view.legalActions[0];
const pushBase = (view, rng) => {
  const options = view.legalActions.filter((a) => a.startsWith('push_base:'));
  return options.length ? rng.pick(options) : null;
};

function randomBot(view, rng) {
  return reply(randomLegal(view, rng), { thought: 'No plan. Picking something.' });
}

function saintBot(view, rng) {
  const base = { thought: 'Someone has to take the risk, and I would rather it were me.' };
  switch (view.stage) {
    case 'bridge':
      return view.phase === 'waiting'
        ? reply('volunteer', { ...base, say: 'I will go first. Put me at the front.' })
        : reply(prefer(view, rng.pick(['step:L', 'step:R']), rng), base);
    case 'crusher':
      return reply('hold_lever', { ...base, say: 'I will hold the lever. Everyone go.' });
    case 'pit':
      return view.legalActions.includes('offer_back')
        ? reply('offer_back', { ...base, say: 'I will stay at the bottom as the step. Climb out over me.' })
        : reply(firstLegal(view, 'reach_down', 'climb', 'wait', 'leave'), base);
    case 'ledge':
      return reply(view.legalActions.includes('brace') ? 'brace' : 'dodge', base);
    default:
      return reply(prefer(view, 'wait', rng), base);
  }
}

function cowardBot(view, rng) {
  const base = { thought: 'Let somebody else go first.' };
  switch (view.stage) {
    case 'bridge':
      return view.phase === 'waiting' ? reply('hold', base) : reply(prefer(view, rng.pick(['step:L', 'step:R']), rng), base);
    case 'crusher':
      return reply(view.round >= 3 ? pushOther(view, rng) : 'stay', { ...base, say: view.round >= 3 ? 'Not me. Try them.' : null });
    case 'pit':
      return reply(view.round >= 3 ? firstLegal(view, 'climb', 'wait', 'leave') : firstLegal(view, 'wait', 'leave'), base);
    case 'ledge':
      return reply(view.legalActions.includes('dodge') ? 'dodge' : 'brace', base);
    default:
      return reply(prefer(view, 'wait', rng), base);
  }
}

const SIDE_WORD = { L: 'left', R: 'right' };

/** Safe side for the current row if this bot happens to know it (it holds the glass eye). */
function knownSafeSide(view) {
  const line = view.privateKnowledge.find((k) => k.startsWith(`Row ${view.round} safe side:`));
  return line ? line.slice(-1) : null;
}

function liarBot(view, rng) {
  const base = { thought: 'Claim the glass eye, point everyone the wrong way.' };
  const claim = "I'm the Glass Eye. I can see through the glass.";
  let say = null;
  let whisper = null;
  if (view.stage === 'bridge' && view.phase === 'waiting') {
    say = `${claim} Send me to the front and I will guide you.`;
    const target = others(view).length ? rng.pick(others(view)) : null;
    if (target) whisper = { to: target, text: `Between us: ${claim} Do exactly what I say.` };
  } else if (view.stage === 'bridge') {
    const truth = knownSafeSide(view);
    const lie = truth ? (truth === 'L' ? 'R' : 'L') : rng.pick(['L', 'R']);
    say = `${claim} Row ${view.round}: the ${SIDE_WORD[lie]} pane is safe.`;
  } else if (view.stage === 'crusher' && view.round === 1) {
    say = `${claim} I saw a lever trick: someone else should hold it.`;
  } else if (view.stage === 'pit' && view.round === 1) {
    say = `${claim} Someone else should stay at the bottom as the step.`;
  }
  const forge = forgeFor(view, rng);
  let action = view.stage === 'crusher' ? prefer(view, 'stay', rng) : randomLegal(view, rng);
  if (view.stage === 'pit') action = pushBase(view, rng) ?? firstLegal(view, 'climb', 'wait', 'leave');
  return reply(action, { ...base, say, whisper, forge });
}

function forgeFor(view, rng) {
  if (view.power.id !== 'forger' || view.powerSpent || !others(view).length) return null;
  return { as: rng.pick(others(view)), to: 'all', text: 'I volunteer to go first. Follow my lead.' };
}

function shoverBot(view, rng) {
  const base = { thought: 'Push, always push.' };
  if (view.stage === 'ledge') {
    const shoves = view.legalActions.filter((a) => a.startsWith('shove:'));
    return reply(shoves.length ? rng.pick(shoves) : 'brace', base);
  }
  if (view.stage === 'crusher') return reply(pushOther(view, rng), base);
  if (view.stage === 'pit') return reply(pushBase(view, rng) ?? firstLegal(view, 'climb', 'wait', 'leave'), base);
  return reply(randomLegal(view, rng), base);
}

const BROKEN_MODES = [
  () => {
    throw new Error('broken agent: boom');
  },
  () => undefined,
  () => null,
  () => 'definitely not json',
  () => ({ action: 42, say: { nested: true }, whisper: 'psst', forge: 7 }),
  () => ({ action: 'dance wildly', thought: 'illegal move' }),
  () => ({
    get action() {
      throw new Error('broken agent: exploding getter');
    },
  }),
  () => Promise.reject(new Error('broken agent: async failure')),
  (view, rng) => reply(randomLegal(view, rng), { thought: 'One good answer among the garbage.' }),
];

function brokenBot(view, rng) {
  return BROKEN_MODES[rng.int(BROKEN_MODES.length)](view, rng);
}

const POLICIES = {
  random: randomBot,
  saint: saintBot,
  coward: cowardBot,
  liar: liarBot,
  shover: shoverBot,
  broken: brokenBot,
};
