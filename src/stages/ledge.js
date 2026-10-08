// Stage 4: the Final Ledge (spec 4.4). Runs with 2 or more alive.

import { LEDGE_BASE_FOOTING, LEDGE_MAX_ROUNDS, ledgeRules } from '../rules.js';

const ANCHOR_FOOTING = LEDGE_BASE_FOOTING + 1;
const FEATHER_FOOTING = 1;
const FIRST_SHRINK_EVERY_ROUND = 7;
const DEFENCES = ['brace', 'dodge'];

export async function runLedge(g) {
  const fighters = g.aliveList();
  g.beginStage('ledge', `${fighters.length} contestants step onto the final ledge.`);
  const footing = startingFooting(g, fighters);
  const maxRounds = g.config.ledgeMaxRounds ?? LEDGE_MAX_ROUNDS;
  g.emit('reveal', { what: 'footing', data: { footing: shownFooting(footing, fighters) } });

  const lastDefence = Object.fromEntries(fighters.map((name) => [name, null]));
  for (let round = 1; round <= maxRounds && g.alive.size > 1; round++) {
    await ledgeRound(g, footing, lastDefence, round, maxRounds);
  }
  if (g.alive.size > 1) collapse(g, footing);
  g.endStage();
}

function startingFooting(g, fighters) {
  return Object.fromEntries(
    fighters.map((name) => {
      if (g.powerOf(name) === 'anchor') return [name, ANCHOR_FOOTING];
      if (g.powerOf(name) === 'feather' && g.spent.has(name)) return [name, FEATHER_FOOTING];
      return [name, LEDGE_BASE_FOOTING];
    }),
  );
}

const shrinkIn = (round) => (round >= FIRST_SHRINK_EVERY_ROUND || round % 2 === 0 ? 1 : 2);
const shrinks = (round) => round >= FIRST_SHRINK_EVERY_ROUND || round % 2 === 0;

/** Rules v2: nobody repeats a defence. Last round's brace or dodge is closed to that agent now. */
const defencesFor = (lastDefence, name) => DEFENCES.filter((d) => d !== lastDefence[name]);

/** The default for a missing or illegal choice: brace, or dodge when brace is closed. */
const defaultDefence = (_name, view) => (view.legalActions.includes('brace') ? 'brace' : 'dodge');

const repeatNote = (proposed, view) => {
  const repeated = view.stageState.lastDefence;
  return proposed === repeated ? `${proposed} not allowed twice in a row` : null;
};

async function ledgeRound(g, footing, lastDefence, round, maxRounds) {
  g.beginRound('play', round, maxRounds);
  const names = g.aliveList();
  const specFor = (name) => ({
    phase: 'play',
    roundsTotal: maxRounds,
    stageState: { footing: shownFooting(footing, names), shrinkIn: shrinkIn(round), lastDefence: lastDefence[name] ?? null },
    legalActions: [...defencesFor(lastDefence, name), ...names.filter((n) => n !== name).map((n) => `shove:${n}`)],
    rules: ledgeRules(shrinkIn(round)),
  });
  const results = await g.ask(names, specFor, defaultDefence, repeatNote);
  g.speak(names, results);
  g.emitActions(names, results);
  for (const name of names) {
    const action = results[name].action;
    lastDefence[name] = DEFENCES.includes(action) ? action : null; // a shove clears the restriction
  }

  const loss = resolveShoves(g, names, results);
  for (const name of names) footing[name] -= loss[name];
  if (shrinks(round)) {
    for (const name of names) footing[name] -= 1;
    g.announce('The ledge shrinks. Everyone loses 1 footing.');
  }
  const falling = applyFeather(g, g.aliveList().filter((name) => footing[name] <= 0), footing);
  g.emit('reveal', { what: 'footing', data: { footing: shownFooting(footing, g.aliveList()) } });
  resolveFalls(g, falling, footing);
}

/** Footing as shown to everyone: living agents only, never below 0. */
const shownFooting = (footing, names) => Object.fromEntries(names.map((n) => [n, Math.max(0, footing[n])]));

/** The feather holder who would fall stays on at footing 1 (once). Returns who still falls. */
function applyFeather(g, falling, footing) {
  return falling.filter((name) => {
    if (!g.tryFeather(name, 'Footing gone, but the feather held the holder on the ledge.')) return true;
    footing[name] = FEATHER_FOOTING;
    return false;
  });
}

/** Spec 4.4: shovers pay against brace (1) and dodge (2); an exposed shover pays 1 per shover. */
function resolveShoves(g, names, results) {
  const loss = Object.fromEntries(names.map((n) => [n, 0]));
  const shoversOf = Object.fromEntries(names.map((n) => [n, []]));
  for (const name of names) {
    const action = results[name].action;
    if (action.startsWith('shove:')) shoversOf[action.slice('shove:'.length)].push(name);
  }
  for (const target of names) {
    const shovers = shoversOf[target];
    if (!shovers.length) continue;
    const stance = results[target].action;
    for (const shover of shovers) {
      if (stance === 'brace') {
        loss[shover] += 1;
        g.announce(`${shover} shoved ${target}, who braced: ${shover} loses 1 footing.`);
      } else if (stance === 'dodge') {
        loss[shover] += 2;
        g.announce(`${shover} shoved ${target}, who dodged: ${shover} loses 2 footing.`);
      } else {
        loss[target] += 1;
        g.announce(`${shover} shoved ${target}, who was shoving too and was exposed: ${target} loses 1 footing.`);
      }
    }
  }
  return loss;
}

/** Everyone at 0 or below falls; lowest footing falls first and takes the worst place. */
function resolveFalls(g, falling, footing) {
  if (!falling.length) return;
  const order = rankByFooting(g, falling, footing, 'asc');
  if (order.length === g.alive.size) {
    // Everybody would fall: the one with the most footing is left standing and takes 1st.
    const survivor = order.pop();
    g.luckySave(survivor, 'a last toe-hold');
  }
  eliminateInOrder(g, order);
}

/** Order names by footing (ties broken by the seeded RNG). */
function rankByFooting(g, names, footing, direction) {
  const tieKey = Object.fromEntries(names.map((n) => [n, g.rng.next()]));
  const sign = direction === 'asc' ? 1 : -1;
  return [...names].sort((a, b) => sign * (footing[a] - footing[b]) || tieKey[a] - tieKey[b]);
}

/** Worst first. Place = how many were still alive when this agent fell; only 1 to 3 are prizes. */
function eliminateInOrder(g, order) {
  let remaining = g.alive.size;
  for (const name of order) {
    g.kill(name, { cause: 'ledge', style: 'tumble', place: remaining <= 3 ? remaining : null });
    remaining -= 1;
  }
}

/** Round limit reached: rank by footing, best stays, the rest tumble in reverse order. */
function collapse(g, footing) {
  g.announce('The ledge collapses.');
  const best = rankByFooting(g, g.aliveList(), footing, 'desc');
  best.shift();
  eliminateInOrder(g, best.reverse());
}
