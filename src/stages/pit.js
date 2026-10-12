import { SEATS } from '../game.js';
import { PIT_ROUNDS, PIT_LIFTS_PER_ROUND, pitV5Rules } from '../rules.js';

const ordered = set => SEATS.filter(n => set.has(n));
const stateView = (s, flood) => ({ base: s.base, anchor: s.anchor, down: ordered(s.down), out: ordered(s.out), ropeUsed: s.ropeUsed, flood, liftsPerRound: PIT_LIFTS_PER_ROUND });
const role = (s, name) => s.out.has(name) ? 'out' : s.anchor === name ? 'rope anchor' : s.base === name ? 'base' : 'down';
function actions(s, name) {
  if (s.out.has(name)) return ['leave', ...(s.base && !s.ropeUsed ? ['reach_down'] : [])];
  if (s.anchor === name) return ['wait', ...(s.down.size === 1 ? ['climb_last'] : [])];
  if (s.base === name) return ['wait'];
  return ['wait', 'climb', ...(!s.base && !s.anchor ? ['offer_back', ...ordered(s.down).filter(n => n !== name).map(n => `push_base:${n}`)] : [])];
}

export async function runPit(g) {
  g.beginStage('pit', g.alive.size > 3 ? 'The water rises. Someone must be the step.' : 'Three remain; the Pit is skipped.');
  if (g.alive.size <= 3) { g.endStage(); return; }
  const s = { base: null, anchor: null, down: new Set(g.aliveList()), out: new Set(), ropeUsed: false };
  for (let round = 1; round <= PIT_ROUNDS && s.down.size; round++) {
    g.beginRound('play', round, PIT_ROUNDS);
    const names = g.aliveList(), outBefore = new Set(s.out), anchorBefore = s.anchor;
    const results = await g.ask(names, name => ({
      phase: 'play', roundsTotal: PIT_ROUNDS, stageState: stateView(s, round - 1),
      legalActions: actions(s, name), rules: pitV5Rules(role(s, name)),
    }), name => s.out.has(name) ? 'leave' : 'wait');
    g.speak(names, results);
    g.emitActions(names, results);
    const chose = action => name => results[name].action === action;
    if (!s.base && !s.anchor) {
      const down = ordered(s.down), volunteers = down.filter(chose('offer_back'));
      const targets = new Set();
      for (const name of down) if (results[name].action.startsWith('push_base:')) {
        const target = results[name].action.slice(10);
        targets.add(target);
        g.breakPact(name, target, 'push_base');
      }
      const candidates = volunteers.length ? volunteers : down.filter(n => targets.has(n));
      if (candidates.length) s.base = g.rng.pick(candidates);
    }
    const support = s.base ?? s.anchor;
    const climbers = support ? ordered(s.down).filter(n => n !== support && chose('climb')(n)) : [];
    const lifted = ordered(new Set(climbers.length > PIT_LIFTS_PER_ROUND ? g.rng.shuffle(climbers).slice(0, PIT_LIFTS_PER_ROUND) : climbers));
    for (const name of lifted) {
      s.down.delete(name); s.out.add(name);
      g.debt(name, support, s.anchor ? 'rope' : 'step');
    }
    let anchorOut = null;
    if (anchorBefore && results[anchorBefore].action === 'climb_last') {
      s.down.delete(anchorBefore); s.out.add(anchorBefore); s.anchor = null; anchorOut = anchorBefore;
    }
    const reachers = ordered(outBefore).filter(chose('reach_down'));
    let roped = null, rescued = null;
    if (s.base && !s.ropeUsed && reachers.length) {
      roped = g.rng.pick(reachers); rescued = s.base;
      s.down.delete(rescued); s.out.add(rescued);
      s.out.delete(roped); s.down.add(roped);
      s.base = null; s.anchor = roped; s.ropeUsed = true;
      g.emit('reveal', { what: 'rope', data: { by: roped, saved: rescued, anchor: roped } });
      g.debt(rescued, roped, 'rope');
    }
    g.emit('reveal', { what: 'pit', data: { ...stateView(s, round), lifted, roped, rescued, anchorOut } });
  }
  if (s.down.size) {
    g.eliminate(ordered(s.down), { cause: 'pit', style: 'sink', luckyWhy: 'a plank supports a final survivor' });
    await g.finishEliminations();
  }
  g.endStage();
}
