// Rules v6 rooms. Each room forces at least one death and lets the players choose who.
// Rooms decide outcomes only through the Game helpers (ask/speak/eliminate/grudge).
import {
  LEVER_ROUNDS, JACKET_NIGHTS, BOMB_MIN_PASSES, BOMB_MAX_PASSES, VAULT_TALK_ROUNDS,
  leverRules, cupsRules, jacketRules, bombRules, vaultRules,
} from '../rules.js';

const others = (g, name) => g.aliveList().filter(n => n !== name);

/** Ask, then record speech and actions in seat order. */
async function turn(g, names, phase, actionsFor, fallback, rules, stageState = {}, roundsTotal = 1) {
  const results = await g.ask(names, name => ({
    phase, roundsTotal, stageState, legalActions: actionsFor(name), rules: typeof rules === 'function' ? rules(name) : rules,
  }), fallback);
  g.speak(names, results);
  g.emitActions(names, results);
  return results;
}

const breakIfPartner = (g, by, victim, reason) => {
  if (g.partners(by).includes(victim)) g.breakPact(by, victim, reason);
};

// ---- The Lever: the holder always dies ----------------------------------------------------

export async function runLever(g, { sudden = false } = {}) {
  g.beginStage('lever', sudden ? 'Sudden death: back to the lever room.' : 'The ceiling descends. Whoever holds the lever dies.');
  if (g.alive.size > 3) for (let round = 1; round <= LEVER_ROUNDS; round++) {
    g.beginRound('play', round, LEVER_ROUNDS);
    const names = g.aliveList();
    const final = round === LEVER_ROUNDS;
    const results = await turn(g, names, 'play',
      name => [...(final ? [] : ['stay']), 'hold_lever', ...others(g, name).map(n => `push_lever:${n}`)],
      name => (final ? `push_lever:${g.rng.pick(others(g, name))}` : 'stay'),
      leverRules(round), { ceiling: LEVER_ROUNDS + 1 - round, finalRound: final }, LEVER_ROUNDS);
    const pushes = {};
    for (const name of names) {
      const action = results[name].action;
      if (!action.startsWith('push_lever:')) continue;
      const target = action.slice(11);
      (pushes[target] ??= []).push(name);
      breakIfPartner(g, name, target, 'push_lever');
    }
    const volunteers = names.filter(n => results[n].action === 'hold_lever');
    let holder = null;
    if (volunteers.length) holder = g.rng.pick(volunteers);
    else if (Object.keys(pushes).length) {
      const most = Math.max(...Object.values(pushes).map(p => p.length));
      holder = g.rng.pick(Object.keys(pushes).filter(t => pushes[t].length === most));
    }
    g.emit('reveal', { what: 'lever', data: { round, holder, volunteers, pushes } });
    if (!holder) continue;
    if (!volunteers.length) for (const pusher of pushes[holder]) g.grudge(pusher, holder, 'push_lever');
    g.eliminate([holder], { cause: 'crusher', style: 'flatten', luckyWhy: 'the lever jams open' });
    await g.finishEliminations();
    break;
  }
  g.endStage();
}

// ---- Poison Cups: one secret pourer, then swaps ------------------------------------------

export async function runCups(g) {
  g.beginStage('cups', 'One cup is poisoned. The pourer knows which.');
  if (g.alive.size > 3) {
    const pourer = g.rng.pick(g.aliveList());
    g.emit('reveal', { what: 'pourer', data: { pourer } });
    g.beginRound('pour', 1, 1);
    // The pour is secret: only the pourer's private thought and a private event record it.
    const poured = await g.ask([pourer], name => ({
      phase: 'pour', roundsTotal: 1, allowBreak: false, legalActions: others(g, name).map(n => `poison:${n}`), rules: cupsRules('pour', pourer),
    }), name => `poison:${g.rng.pick(others(g, name))}`);
    g.think([pourer], poured);
    const target = poured[pourer].action.slice(7);
    g.emit('cup_poured', { name: pourer, target, valid: poured[pourer].valid, visibility: 'private' });
    g.secrets.set(pourer, [`You put the poison in ${target}'s cup.`]);

    g.beginRound('swap', 1, 1);
    const names = g.aliveList();
    const results = await turn(g, names, 'swap', name => ['drink', ...others(g, name).map(n => `swap:${n}`)],
      () => 'drink', cupsRules('swap', pourer), { pourer });
    let holder = target, handedBy = pourer;
    const swaps = [], betrayals = [];
    for (const name of g.rng.shuffle(names.filter(n => results[n].action.startsWith('swap:')))) {
      const other = results[name].action.slice(5);
      swaps.push({ name, with: other });
      g.emit('cup_swap', { name, with: other });
      if (holder === name) {
        holder = other;
        handedBy = name; // the swapper pushed the poison onto `other`
        betrayals.push([name, other]);
      } else if (holder === other) {
        holder = name;
        handedBy = null; // `name` took the poison themselves
      }
    }
    g.emit('reveal', { what: 'cups', data: { pourer, poisoned: target, swaps, victim: holder } });
    // Breaking pacts any earlier would announce where the poison is.
    breakIfPartner(g, pourer, target, 'poison');
    for (const [by, victim] of betrayals) breakIfPartner(g, by, victim, 'cup_swap');
    if (handedBy) g.grudge(handedBy, holder, handedBy === pourer ? 'poison' : 'cup_swap');
    g.eliminate([holder], { cause: 'poison', style: 'poison', luckyWhy: 'the poison was too weak' });
    await g.finishEliminations();
    g.secrets.clear();
  }
  g.endStage();
}

// ---- Life Jackets: one short, guard once, steal in the dark -----------------------------

export async function runJackets(g) {
  g.beginStage('jackets', 'The ship sinks at dawn. One jacket too few.');
  if (g.alive.size > 3) {
    let bare = g.rng.pick(g.aliveList());
    const guardsUsed = new Set();
    g.emit('reveal', { what: 'jackets', data: { night: 0, without: bare } });
    for (let night = 1; night <= JACKET_NIGHTS; night++) {
      g.beginRound('night', night, JACKET_NIGHTS);
      const names = g.aliveList();
      const results = await turn(g, names, 'night',
        name => (name === bare ? ['sleep', ...others(g, name).map(n => `steal:${n}`)] : ['sleep', ...(guardsUsed.has(name) ? [] : ['guard'])]),
        () => 'sleep', name => jacketRules(night, JACKET_NIGHTS, bare, guardsUsed.has(name)), { without: bare }, JACKET_NIGHTS);
      for (const name of names) if (results[name].action === 'guard') guardsUsed.add(name);
      const action = results[bare].action;
      let theft = null;
      if (action.startsWith('steal:')) {
        const victim = action.slice(6);
        const guarded = results[victim].action === 'guard';
        theft = { thief: bare, victim, guarded };
        if (!guarded) bare = victim;
      }
      g.emit('reveal', { what: 'jackets', data: { night, theft, without: bare } });
      if (theft && !theft.guarded) {
        g.grudge(theft.thief, theft.victim, 'steal_jacket');
        breakIfPartner(g, theft.thief, theft.victim, 'steal_jacket');
      }
    }
    g.eliminate([bare], { cause: 'drowned', style: 'drown', luckyWhy: 'a floating crate' });
    await g.finishEliminations();
  }
  g.endStage();
}

// ---- The Bomb: only the holder sees the timer --------------------------------------------

export async function runBomb(g) {
  g.beginStage('bomb', 'Pass the bomb. Only the holder sees the timer.');
  if (g.alive.size > 3) {
    let holder = g.rng.pick(g.aliveList());
    let left = BOMB_MIN_PASSES + g.rng.int(BOMB_MAX_PASSES - BOMB_MIN_PASSES + 1);
    const total = left;
    g.emit('reveal', { what: 'bomb', data: { holder } });
    for (let pass = 1; left > 0; pass++) {
      g.secrets.set(holder, [`Bomb timer: ${left} pass${left === 1 ? '' : 'es'} left.${left === 1 ? ' Whoever you pass to now explodes.' : ''}`]);
      g.beginRound('pass', pass, null); // the length is the secret: never publish it
      const names = g.aliveList();
      const results = await turn(g, names, 'pass',
        name => (name === holder ? others(g, name).map(n => `pass:${n}`) : ['wait']),
        name => (name === holder ? `pass:${g.rng.pick(others(g, name))}` : 'wait'),
        name => bombRules(name === holder ? 'pass' : 'talk', holder), { holder }, null);
      const receiver = results[holder].action.slice(5);
      left--;
      g.emit('bomb_pass', { from: holder, to: receiver });
      g.secrets.delete(holder);
      if (left === 0) {
        g.emit('reveal', { what: 'bomb', data: { exploded: receiver, passedBy: holder, totalPasses: total } });
        g.grudge(holder, receiver, 'bomb_pass');
        breakIfPartner(g, holder, receiver, 'bomb_pass');
        g.eliminate([receiver], { cause: 'bomb', style: 'blast', luckyWhy: 'the bomb fizzles' });
        await g.finishEliminations();
      }
      holder = receiver;
    }
    g.secrets.clear();
  }
  g.endStage();
}

// ---- The Vault: split or steal -----------------------------------------------------------

export function vaultPair(g) {
  const alive = g.aliveList();
  const open = g.grudges.find(x => g.alive.has(x.by) && g.alive.has(x.victim));
  if (open) return { pair: [open.victim, open.by], why: 'revenge' };
  const counts = Object.fromEntries(alive.map(n => [n, g.grudges.filter(x => x.by === n).length]));
  const most = Math.max(...Object.values(counts));
  const villain = most > 0 ? g.rng.pick(alive.filter(n => counts[n] === most)) : g.rng.pick(alive);
  return { pair: [villain, g.rng.pick(alive.filter(n => n !== villain))], why: most > 0 ? 'most_blood' : 'draw' };
}

export async function runVault(g) {
  g.beginStage('vault', 'Two players. One prize box. Split or steal.');
  if (g.alive.size > 3) {
    const { pair, why } = vaultPair(g);
    g.emit('reveal', { what: 'vault_pair', data: { pair, why } });
    for (let round = 1; round <= VAULT_TALK_ROUNDS; round++) {
      g.beginRound('talk', round, VAULT_TALK_ROUNDS);
      await turn(g, g.aliveList(), 'talk', () => ['wait'], () => 'wait', vaultRules('talk', pair), { pair }, VAULT_TALK_ROUNDS);
    }
    g.beginRound('choose', 1, 1);
    const results = await turn(g, pair, 'choose', () => ['split', 'steal'], () => 'split', vaultRules('choose', pair), { pair });
    const [a, b] = pair;
    const steal = { [a]: results[a].action === 'steal', [b]: results[b].action === 'steal' };
    g.emit('reveal', { what: 'vault', data: { choices: { [a]: results[a].action, [b]: results[b].action } } });
    const doomed = [];
    if (steal[a] && steal[b]) doomed.push(a, b);
    else if (steal[a]) doomed.push(b);
    else if (steal[b]) doomed.push(a);
    for (const loser of doomed) {
      const winner = loser === a ? b : a;
      if (steal[winner]) { g.grudge(winner, loser, 'vault_steal'); breakIfPartner(g, winner, loser, 'vault_steal'); }
    }
    if (doomed.length) {
      g.eliminate(doomed, { cause: 'vault', style: 'vault', luckyWhy: 'the vault door sticks' });
      await g.finishEliminations();
    }
  }
  g.endStage();
}
