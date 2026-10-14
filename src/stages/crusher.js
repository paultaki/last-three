import { CRUSHER_ROUNDS, DIVE_SURVIVAL, crusherV5Rules } from '../rules.js';

export async function runCrusher(g) {
  g.beginStage('crusher', g.alive.size > 3 ? 'A lever opens the door while the ceiling descends.' : 'Three remain; the Crusher is skipped.');
  if (g.alive.size > 3) for (let round = 1; round <= CRUSHER_ROUNDS; round++) {
    g.beginRound('play', round, CRUSHER_ROUNDS);
    const names = g.aliveList();
    const results = await g.ask(names, name => ({
      phase: 'play', roundsTotal: CRUSHER_ROUNDS, stageState: { ceiling: CRUSHER_ROUNDS + 1 - round, leverHolder: null },
      legalActions: ['stay', 'hold_lever', ...names.filter(n => n !== name).map(n => `push_lever:${n}`)], rules: crusherV5Rules(),
    }), () => 'stay');
    g.speak(names, results);
    g.emitActions(names, results);
    const targets = new Set();
    for (const name of names) if (results[name].action.startsWith('push_lever:')) {
      const target = results[name].action.slice(11);
      targets.add(target);
      g.breakPact(name, target, 'push_lever');
    }
    const volunteers = names.filter(n => results[n].action === 'hold_lever');
    const candidates = volunteers.length ? volunteers : names.filter(n => targets.has(n));
    const holder = candidates.length ? g.rng.pick(candidates) : null;
    if (holder) {
      const dive = g.rng.chance(DIVE_SURVIVAL);
      g.emit('reveal', { what: 'ceiling', data: { ceiling: 0, leverHolder: holder, dive } });
      for (const name of names.filter(n => n !== holder)) g.debt(name, holder, 'lever');
      if (!dive) g.eliminate([holder], { cause: 'crusher', style: 'flatten', luckyWhy: 'the safety stop holds' });
      await g.finishEliminations();
      break;
    }
    g.emit('reveal', { what: 'ceiling', data: { ceiling: CRUSHER_ROUNDS - round, leverHolder: null } });
    if (round === CRUSHER_ROUNDS) {
      g.eliminate(names, { cause: 'crusher', style: 'flatten', luckyWhy: 'a crate holds the ceiling above the final three' });
      await g.finishEliminations();
    }
  }
  g.endStage();
}
