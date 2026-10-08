// Shared test helpers: crafted fixed-response agents and stage-level game construction.

import { Game, SEATS } from '../../src/game.js';
import { POWER_IDS } from '../../src/powers.js';

export { SEATS, Game };

export const reply = (action, extra = {}) => ({ thought: '', say: null, whisper: null, forge: null, ...extra, action });

/** A full seat -> power map: `wanted` powers on the given seats, the rest filled in order. */
export function powersWith(wanted = {}) {
  const rest = POWER_IDS.filter((id) => !Object.values(wanted).includes(id));
  return Object.fromEntries(SEATS.map((seat) => [seat, wanted[seat] ?? rest.shift()]));
}

/** The harmless action for whatever the view offers. */
export function idle(view) {
  const legal = view.legalActions;
  const quiet = ['hold', 'wait', 'stay', 'brace'].find((a) => legal.includes(a));
  if (quiet) return reply(quiet);
  if (view.stage === 'disc') return reply(`tile:${view.alive.indexOf(view.you) + 1}`);
  return reply(legal[0]);
}

export const agentFor = (name, act) => ({ name, model: 'test/fixed', act });

/** Eight agents sharing `policy`, with per-seat overrides. Every policy receives a view. */
export function fixedAgents(policy = idle, overrides = {}) {
  return Object.fromEntries(SEATS.map((seat) => [seat, agentFor(seat, overrides[seat] ?? policy)]));
}

/** Wrap a policy so every view the agent receives is kept (deep-cloned) in `store`. */
export function spy(policy, store) {
  return (view) => {
    store.push(structuredClone(view));
    return policy(view);
  };
}

export function makeGame({ seed = 1, powers = {}, agents = fixedAgents(), config = {}, dead = [] } = {}) {
  const g = new Game({ seed, agents, config: { ...config, powers: powersWith(powers) } });
  for (const name of dead) g.alive.delete(name);
  return g;
}

export const ofType = (events, type) => events.filter((e) => e.type === type);

/** Final tiles/line/footing reveals etc: the data of the last reveal of `what`. */
export const lastReveal = (events, what) => ofType(events, 'reveal').filter((e) => e.what === what).at(-1)?.data;

/**
 * Bridge oracle for full games: any agent that holds the glass eye leaks the safe sides into a
 * shared object, so other agents can step right or wrong on purpose.
 */
export function makeOracle() {
  const oracle = { safe: null };
  const learn = (view) => {
    const rows = view.privateKnowledge.filter((k) => /^Row \d safe side/.test(k));
    if (rows.length === 8) oracle.safe = rows.map((k) => k.slice(-1));
  };
  return { oracle, learn };
}

const THREE = ['Ash', 'Bex', 'Cole'];

/** Ledge game with `fighters` alive; `plan[round][seat]` is an action, everyone else braces. */
export function ledgeGame({ fighters = THREE, powers = { Ash: 'nothing', Bex: 'map', Cole: 'wedge' }, plan = {}, views = [], config = {}, seed = 1 } = {}) {
  const dead = ['Ash', 'Bex', 'Cole', 'Dara', 'Eli', 'Fenn', 'Gus', 'Hana'].filter((n) => !fighters.includes(n));
  const agents = fixedAgents(spy((view) => reply(plan[view.round]?.[view.you] ?? (view.legalActions.includes('brace') ? 'brace' : 'dodge')), views));
  const g = makeGame({ seed, powers, agents, config, dead });
  g.stage = 'ledge';
  return g;
}

export const footingReveals = (g) => ofType(g.events, 'reveal').filter((e) => e.what === 'footing').map((e) => e.data.footing);

