// Stage 1: the Glass Bridge (spec 4.1).

import { BRIDGE_ROWS, BRIDGE_WAIT_ROUNDS, bridgeCrossingRules, bridgeWaitingRules } from '../rules.js';

const SIDES = ['L', 'R'];
const otherSide = (side) => (side === 'L' ? 'R' : 'L');

export async function runBridge(g) {
  g.beginStage('bridge', 'Eight contestants step into the Glass Bridge.');
  g.bridgeSafe = Array.from({ length: BRIDGE_ROWS }, () => (g.rng.chance(0.5) ? 'L' : 'R'));
  const line = g.rng.shuffle(g.aliveList());
  g.emit('reveal', { what: 'line', data: { line: [...line] } });
  g.announce(`The line forms (front first): ${line.join(', ')}.`);

  for (let round = 1; round <= BRIDGE_WAIT_ROUNDS; round++) {
    await waitingRound(g, line, round);
  }

  // The viewer redraws the line from this reveal, so the crossing opens with it.
  g.round = null;
  g.emit('reveal', { what: 'line', data: { line: [...line] } });

  const weakPanes = [];
  for (let row = 1; row <= BRIDGE_ROWS; row++) {
    await crossingRow(g, line, row, weakPanes);
    if (g.alive.size === 1) break; // the game is decided; no point crossing further
  }
  g.endStage();
}

async function waitingRound(g, line, round) {
  g.beginRound('waiting', round, BRIDGE_WAIT_ROUNDS);
  const names = g.aliveList();
  const specFor = (name) => ({
    phase: 'waiting',
    roundsTotal: BRIDGE_WAIT_ROUNDS,
    line: [...line],
    stageState: {
      rowsCrossed: 0,
      weakPanesRevealed: [],
      front: line[0],
      wallRoundsLeft: BRIDGE_WAIT_ROUNDS - round,
    },
    legalActions: ['hold', 'volunteer', ...names.filter((n) => n !== name).map((n) => `swap:${n}`)],
    rules: bridgeWaitingRules(BRIDGE_WAIT_ROUNDS - round),
  });
  const results = await g.ask(names, specFor, () => 'hold');
  g.speak(names, results);
  g.emitActions(names, results);

  const chosen = (name) => (results[name].valid ? results[name].action : 'hold');
  // 1. Mutual swaps. Each agent names one target, so mutual pairs never overlap.
  for (const name of names) {
    const action = chosen(name);
    if (!action.startsWith('swap:')) continue;
    const partner = action.slice(5);
    if (names.indexOf(name) < names.indexOf(partner) && chosen(partner) === `swap:${name}`) {
      const a = line.indexOf(name);
      const b = line.indexOf(partner);
      [line[a], line[b]] = [line[b], line[a]];
      g.announce(`${name} and ${partner} swapped places in the line.`);
    }
  }
  // 2. Volunteers, in seat order, each jumping to the front.
  for (const name of names) {
    if (chosen(name) !== 'volunteer') continue;
    line.splice(line.indexOf(name), 1);
    line.unshift(name);
    g.announce(`${name} volunteered and moved to the front.`);
  }
  g.emit('reveal', { what: 'line', data: { line: [...line] } });
}

async function crossingRow(g, line, row, weakPanes) {
  g.beginRound('crossing', row, BRIDGE_ROWS);
  const names = g.aliveList();
  const front = line[0];
  const specFor = (name) => ({
    phase: 'crossing',
    roundsTotal: BRIDGE_ROWS,
    line: [...line],
    stageState: { rowsCrossed: row - 1, weakPanesRevealed: weakPanes.map((p) => ({ ...p })), front, wallRoundsLeft: 0 },
    legalActions: name === front ? ['step:L', 'step:R'] : ['wait'],
    rules: bridgeCrossingRules(name === front),
  });
  const fallbackFor = (name) => (name === front ? `step:${g.rng.pick(SIDES)}` : 'wait');
  const results = await g.ask(names, specFor, fallbackFor);
  g.speak(names, results);
  g.emitActions(names, results);

  // Only the front agent's decision counts.
  const safe = g.bridgeSafe[row - 1];
  const stepped = results[front].action.slice(5);
  if (stepped !== safe) {
    const { died } = g.eliminate([front], {
      cause: 'glass',
      style: 'shatter',
      featherDetail: 'The pane shattered but the feather held the holder up.',
      luckyWhy: 'the glass holds',
    });
    if (died.length) {
      line.shift();
      g.emit('action', { name: line[0], action: `step:${safe}`, valid: true, auto: true });
      g.announce(`${line[0]} stepped onto the safe pane automatically and is now at the front.`);
    }
  }
  const weak = otherSide(safe);
  weakPanes.push({ row, weak });
  g.emit('reveal', { what: 'weak_pane', data: { row, weak } });
  g.announce(`Row ${row}: the ${weak === 'L' ? 'left' : 'right'} pane was the weak one.`);
}
