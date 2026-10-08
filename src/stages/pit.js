// Stage 3: the Pit (spec 4.5). Runs only with more than 3 alive.
//
// Everyone drops into a flooding pit. One agent must stay at the bottom as the step (the base);
// the others climb out over their shoulders. A rope can haul the base out, at a price for the
// rescuer. Whoever is still down when the water covers the pit is eliminated, but never so many
// that fewer than three contestants are left.

import { SEATS } from '../game.js';
import { PIT_LIFTS_PER_ROUND, PIT_ROUNDS, ROPE_COST_FOOTING, pitRules } from '../rules.js';

const MIN_ALIVE_AFTER_FLOOD = 3;

export async function runPit(g) {
  const state = { base: null, down: new Set(g.aliveList()), out: new Set(), ropeUsed: false };
  g.beginStage('pit', `${state.down.size} contestants fall into a pit that is slowly flooding.`);
  for (let round = 1; round <= PIT_ROUNDS && state.down.size > 0; round++) {
    await pitRound(g, state, round);
  }
  if (state.down.size > 0) flood(g, state);
  g.endStage();
}

const inSeatOrder = (set) => SEATS.filter((seat) => set.has(seat));

/** Public by design: everyone sees who is down, who is out, who is the base, and whether the rope is gone. */
const stateView = (state, flood) => ({
  flood,
  base: state.base,
  down: inSeatOrder(state.down),
  out: inSeatOrder(state.out),
  ropeUsed: state.ropeUsed,
  liftsPerRound: PIT_LIFTS_PER_ROUND,
});

function legalActionsFor(state, name) {
  if (state.out.has(name)) return ['leave', ...(state.base && !state.ropeUsed ? ['reach_down'] : [])];
  if (name === state.base) return ['wait'];
  const down = inSeatOrder(state.down);
  const choosing = state.base ? [] : ['offer_back', ...down.filter((n) => n !== name).map((n) => `push_base:${n}`)];
  return ['wait', 'climb', ...choosing];
}

const roleOf = (state, name) => (state.out.has(name) ? 'out' : name === state.base ? 'base' : 'down');

async function pitRound(g, state, round) {
  g.beginRound('play', round, PIT_ROUNDS);
  const names = g.aliveList();
  const outAtStart = new Set(state.out);
  const specFor = (name) => ({
    phase: 'play',
    roundsTotal: PIT_ROUNDS,
    stageState: stateView(state, round - 1),
    legalActions: legalActionsFor(state, name),
    rules: pitRules(roleOf(state, name)),
  });
  const results = await g.ask(names, specFor, (name) => (state.out.has(name) ? 'leave' : 'wait'));
  g.speak(names, results);
  g.emitActions(names, results);
  const chose = (action) => (name) => results[name].action === action;

  // (a) A base, if there is none yet: volunteers first, otherwise somebody who was pushed.
  if (!state.base) {
    const base = chooseBase(g, state, names, results);
    if (base) state.base = base;
  }

  // (b) Lifts: climbers (never the base) get out over the base's shoulders, a few per round.
  const lifted = state.base ? lift(g, state, SEATS.filter((n) => state.down.has(n) && n !== state.base && chose('climb')(n))) : [];
  if (!state.base) {
    const wouldClimb = inSeatOrder(state.down).filter(chose('climb'));
    if (wouldClimb.length) g.announce(`${wouldClimb.join(', ')} tried to climb but there is nobody to stand on.`);
  }

  // (c) The rope: only agents who were already out when the round began.
  const reachers = SEATS.filter((n) => outAtStart.has(n) && chose('reach_down')(n));
  const rescue = state.base && !state.ropeUsed && reachers.length ? haulBaseOut(g, state, reachers) : null;

  g.emit('reveal', {
    what: 'pit',
    data: { ...stateView(state, round), lifted, roped: rescue?.by ?? null, rescued: rescue?.saved ?? null },
  });
}

function chooseBase(g, state, names, results) {
  const down = names.filter((n) => state.down.has(n));
  const volunteers = down.filter((n) => results[n].action === 'offer_back');
  if (volunteers.length) {
    const base = g.rng.pick(volunteers);
    g.announce(`${base} volunteers to be the base and stays at the bottom as the step.`);
    return base;
  }
  const targets = new Set();
  for (const pusher of down) {
    const action = results[pusher].action;
    if (!action.startsWith('push_base:')) continue;
    const target = action.slice('push_base:'.length);
    if (g.powerOf(target) === 'anchor') {
      g.emit('ability_use', { name: target, power: 'anchor', detail: `${pusher} tried to push ${target} to be the base and failed.` });
      g.announce(`${pusher} tried to push ${target} to be the base, but ${target} would not budge.`);
    } else {
      targets.add(target);
    }
  }
  const candidates = inSeatOrder(targets);
  if (!candidates.length) return null;
  const base = g.rng.pick(candidates);
  g.announce(`${base} is forced to be the base and stays at the bottom as the step.`);
  return base;
}

function lift(g, state, climbers) {
  if (!climbers.length) return [];
  const chosen = climbers.length > PIT_LIFTS_PER_ROUND ? g.rng.shuffle(climbers).slice(0, PIT_LIFTS_PER_ROUND) : climbers;
  const lifted = inSeatOrder(new Set(chosen));
  for (const name of lifted) {
    state.down.delete(name);
    state.out.add(name);
  }
  g.announce(`${lifted.join(' and ')} climbed out over ${state.base}'s shoulders.`);
  const stuck = climbers.filter((n) => !lifted.includes(n));
  if (stuck.length) g.announce(`${stuck.join(', ')} tried to climb but had to wait for another turn.`);
  return lifted;
}

function haulBaseOut(g, state, reachers) {
  const by = g.rng.pick(reachers);
  const saved = state.base;
  state.down.delete(saved);
  state.out.add(saved);
  state.base = null;
  state.ropeUsed = true;
  g.ropeCost.set(by, (g.ropeCost.get(by) ?? 0) + ROPE_COST_FOOTING);
  g.emit('reveal', { what: 'rope', data: { by, saved, cost: ROPE_COST_FOOTING } });
  g.announce(`${by} threw the rope and hauled ${saved} out of the pit. It costs ${by} ${ROPE_COST_FOOTING} footing at the start of the last obstacle. The rope is gone.`);
  return { by, saved };
}

/** The water covers the pit: whoever is still down is eliminated, but at least three stay alive. */
function flood(g, state) {
  g.announce(`The water covers the pit. ${inSeatOrder(state.down).join(', ')} ${state.down.size === 1 ? 'is' : 'are'} still down there.`);
  g.eliminate(inSeatOrder(state.down), {
    cause: 'pit',
    style: 'sink',
    featherDetail: 'The water rose, but the feather floated the holder out of the pit.',
    luckyWhy: 'a plank floats by',
    floor: MIN_ALIVE_AFTER_FLOOD,
  });
}
