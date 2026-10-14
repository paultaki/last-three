import { BRIDGE_ROWS, BRIDGE_WAIT_ROUNDS, V6_BRIDGE_ROWS, guidedBridgeRules, v6BridgeRules } from '../rules.js';

// v6 shortens the bridge so it cannot consume the cast before the other rooms.
const rowsOf = g => g.v6 ? (g.config.bridgeRows ?? V6_BRIDGE_ROWS) : BRIDGE_ROWS;
const waitsOf = g => g.v6 ? 2 : BRIDGE_WAIT_ROUNDS;
const rulesOf = (g, phase) => g.v6 ? v6BridgeRules(phase, rowsOf(g)).replace('six rounds', `${waitsOf(g)} rounds`) : guidedBridgeRules(phase);

export async function runBridge(g) {
  g.beginStage('bridge', 'Elect a Guide to call the safe path.');
  g.bridgeSafe = Array.from({ length: rowsOf(g) }, () => g.rng.chance(0.5) ? 'L' : 'R');
  const names = g.aliveList();
  g.beginRound('campaign', 1, 1);
  await publicTurn(g, names, 'campaign', () => ['campaign'], () => 'campaign');
  let candidates = names;
  let tallies, tied, method;
  for (let ballot = 1; ballot <= 2; ballot++) {
    const phase = ballot === 1 ? 'guide_vote' : 'guide_revote';
    g.beginRound(phase, ballot, 2);
    const results = await publicTurn(g, names, phase, () => candidates.map(n => `guide_vote:${n}`), () => `guide_vote:${g.rng.pick(candidates)}`, { candidates }, [], false);
    tallies = Object.fromEntries(candidates.map(n => [n, 0]));
    for (const name of names) {
      const target = results[name].action.slice(11);
      tallies[target]++;
      g.emit('guide_vote', { name, target, ballot });
    }
    const high = Math.max(...Object.values(tallies));
    tied = candidates.filter(n => tallies[n] === high);
    if (tied.length === 1) { method = ballot === 1 ? 'vote' : 'revote'; break; }
    candidates = tied;
  }
  g.guide = tied.length === 1 ? tied[0] : g.rng.pick(tied);
  g.emit('guide_elected', { name: g.guide, tallies, tied, method: method ?? 'seeded' });
  const line = g.rng.shuffle(names.filter(n => n !== g.guide));
  const revealLine = () => g.emit('reveal', { what: 'line', data: { line: [...line] } });
  revealLine();
  for (let round = 1; round <= waitsOf(g); round++) {
    g.beginRound('waiting', round, waitsOf(g));
    const walkers = names.filter(n => n !== g.guide);
    const results = await publicTurn(g, walkers, 'waiting', name => ['hold', 'volunteer', ...walkers.filter(n => n !== name).map(n => `swap:${n}`)], () => 'hold', { front: line[0], wallRoundsLeft: waitsOf(g) - round }, line);
    for (const name of walkers) {
      const action = results[name].action;
      const partner = action.slice(5);
      if (action.startsWith('swap:') && walkers.indexOf(name) < walkers.indexOf(partner) && results[partner].action === `swap:${name}`) {
        const a = line.indexOf(name), b = line.indexOf(partner);
        [line[a], line[b]] = [line[b], line[a]];
      }
    }
    for (const name of walkers) if (results[name].action === 'volunteer') {
      line.splice(line.indexOf(name), 1); line.unshift(name);
    }
    revealLine();
  }
  const weakPanesRevealed = [];
  for (let row = 1; row <= rowsOf(g); row++) {
    const walker = line[0];
    const safe = g.bridgeSafe[row - 1];
    const state = { guide: g.guide, front: walker, rowsCrossed: row - 1, weakPanesRevealed: [...weakPanesRevealed] };
    g.beginRound('guide_call', row, rowsOf(g));
    const called = await publicTurn(g, [g.guide], 'guide_call', () => ['call:L', 'call:R'], () => `call:${safe}`, state, line);
    const side = called[g.guide].action.slice(5);
    g.emit('guide_call', { name: g.guide, walker, row, side });
    if (side !== safe) g.breakPact(g.guide, walker, 'false_guide_call');
    state.guideCall = side;
    g.beginRound('counter_call', row, rowsOf(g));
    const counters = g.aliveList(); // Anyone may shout a counter-call, including the walker and Guide.
    const replies = await publicTurn(g, counters, 'counter_call', () => ['wait', 'counter:L', 'counter:R'], () => 'wait', state, line);
    state.counterCalls = [];
    for (const name of counters) if (replies[name].action.startsWith('counter:')) {
      const counter = { name, walker, row, side: replies[name].action.slice(8) };
      state.counterCalls.push(counter);
      g.emit('counter_call', counter);
    }
    g.beginRound('crossing', row, rowsOf(g));
    const steps = await publicTurn(g, [walker], 'crossing', () => ['step:L', 'step:R'], () => `step:${side}`, state, line);
    if (steps[walker].action.slice(5) !== safe) {
      const { died } = g.eliminate([walker], { cause: 'glass', style: 'shatter', luckyWhy: 'the final three are caught by the safety ledge' });
      if (died.length && g.v6) {
        const stepped = steps[walker].action.slice(5);
        if (side === stepped) g.grudge(g.guide, walker, 'false_guide_call');
        for (const c of state.counterCalls) if (c.side === stepped && c.name !== walker) g.grudge(c.name, walker, 'false_counter_call');
      }
      if (died.length) {
        line.shift();
        g.emit('action', { name: line[0], action: `step:${safe}`, valid: true, auto: true });
      }
    }
    const weak = safe === 'L' ? 'R' : 'L';
    weakPanesRevealed.push({ row, weak });
    g.emit('reveal', { what: 'weak_pane', data: { row, weak } });
    await g.finishEliminations();
  }
  g.endStage();
}

async function publicTurn(g, names, phase, actions, fallback, state = {}, line = [], allowBreak = true) {
  const results = await g.ask(names, name => ({
    phase, roundsTotal: phase === 'waiting' ? waitsOf(g) : phase === 'campaign' ? 1 : phase.startsWith('guide_v') || phase === 'guide_revote' ? 2 : rowsOf(g),
    stageState: state, line: [...line], legalActions: actions(name), rules: rulesOf(g, phase), allowBreak,
  }), fallback);
  g.speak(names, results);
  g.emitActions(names, results);
  return results;
}
