// Stage 2: the Crusher Room (spec 4.2). Runs only with more than 3 alive.

import { SEATS } from '../game.js';
import { CRUSHER_ROUNDS, DIVE_SURVIVAL, WEDGE_DIVE_SURVIVAL, crusherRules, holderNote } from '../rules.js';

const FEATHER_DETAIL = 'Crushed, but the feather lifted the holder clear.';
const LUCKY_WHY = 'a crate jams the ceiling';

export async function runCrusher(g) {
  g.beginStage('crusher', 'The ceiling begins to descend; a lever opens the door.');
  for (let round = 1; round <= CRUSHER_ROUNDS; round++) {
    const done = await crusherRound(g, round);
    if (done) break;
  }
  g.endStage();
}

function legalActionsFor(g, name, names) {
  const actions = ['stay', 'hold_lever', ...names.filter((n) => n !== name).map((n) => `push_lever:${n}`)];
  if (g.powerOf(name) === 'wedge' && !g.spent.has(name)) actions.push('jam_lever');
  return actions;
}

async function crusherRound(g, round) {
  g.beginRound('play', round, CRUSHER_ROUNDS);
  const names = g.aliveList();
  const specFor = (name) => ({
    phase: 'play',
    roundsTotal: CRUSHER_ROUNDS,
    stageState: { ceiling: CRUSHER_ROUNDS + 1 - round, leverHolder: null },
    legalActions: legalActionsFor(g, name, names),
    rules: [crusherRules(), holderNote(g.powerOf(name), 'crusher', 'play', g.spent.has(name))].filter(Boolean).join(' '),
  });
  const results = await g.ask(names, specFor, () => 'stay');
  g.speak(names, results);
  g.emitActions(names, results);

  // 1. Jam beats everything: every other agent walks out and the room is over. The jammer is
  //    caught in the jaws like a lever holder, with a better dive than a hold_lever holder gets.
  const jammer = names.find((n) => results[n].action === 'jam_lever');
  if (jammer) {
    g.spent.add(jammer);
    g.emit('ability_use', { name: jammer, power: 'wedge', detail: 'Jammed the lever open; everyone else walks out, but the jaws catch the jammer.' });
    const survives = g.rng.chance(WEDGE_DIVE_SURVIVAL);
    g.emit('reveal', { what: 'ceiling', data: { ceiling: CRUSHER_ROUNDS + 1 - round, jammed: true, leverHolder: jammer, dive: survives } });
    g.announce(`The lever is jammed open. Everyone but ${jammer} walks out of the room.`);
    if (survives) {
      g.announce(`${jammer} dives clear as the ceiling slams down.`);
    } else {
      g.eliminate([jammer], { cause: 'crusher', style: 'flatten', featherDetail: FEATHER_DETAIL, luckyWhy: LUCKY_WHY });
    }
    return true;
  }

  // 2. Lever holder: holders first, otherwise a successfully pushed agent.
  const holder = pickHolder(g, names, results);
  if (holder) {
    const survives = g.rng.chance(DIVE_SURVIVAL);
    g.emit('reveal', { what: 'ceiling', data: { ceiling: 0, leverHolder: holder, dive: survives } });
    g.announce(`${holder} holds the lever. The door opens and everyone else escapes.`);
    if (survives) {
      g.announce(`${holder} dives clear as the ceiling slams down.`);
    } else {
      g.eliminate([holder], { cause: 'crusher', style: 'flatten', featherDetail: FEATHER_DETAIL, luckyWhy: LUCKY_WHY });
    }
    return true;
  }

  // 3. Nobody holds the lever.
  if (round < CRUSHER_ROUNDS) {
    g.emit('reveal', { what: 'ceiling', data: { ceiling: CRUSHER_ROUNDS - round } });
    g.announce('Nobody holds the lever. The ceiling lowers.');
    return false;
  }
  g.emit('reveal', { what: 'ceiling', data: { ceiling: 0 } });
  g.announce('The deadline passes with nobody on the lever. The ceiling falls on the room.');
  g.eliminate(names, { cause: 'crusher', style: 'flatten', featherDetail: FEATHER_DETAIL, luckyWhy: LUCKY_WHY });
  return true;
}

function pickHolder(g, names, results) {
  const holders = names.filter((n) => results[n].action === 'hold_lever');
  if (holders.length) return g.rng.pick(holders);

  const targets = new Set();
  for (const pusher of names) {
    const action = results[pusher].action;
    if (!action.startsWith('push_lever:')) continue;
    const target = action.slice('push_lever:'.length);
    if (g.powerOf(target) === 'anchor') {
      g.emit('ability_use', { name: target, power: 'anchor', detail: `${pusher} tried to push ${target} onto the lever and failed.` });
      g.announce(`${pusher} tried to push ${target} onto the lever, but ${target} would not budge.`);
    } else {
      targets.add(target);
    }
  }
  const candidates = SEATS.filter((seat) => targets.has(seat));
  return candidates.length ? g.rng.pick(candidates) : null;
}
