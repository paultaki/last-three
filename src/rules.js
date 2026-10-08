// Plain-language rules text. The engine is the single source of truth for what agents are told.
// Nothing here may mention a power by name: holder-only additions live in `holderNote`.

export const BRIDGE_ROWS = 8;
export const BRIDGE_WAIT_ROUNDS = 6;
export const CRUSHER_ROUNDS = 5;
export const DIVE_SURVIVAL = 0.25;
export const DISC_ROUNDS = 2;
export const LEDGE_MAX_ROUNDS = 20;
export const LEDGE_BASE_FOOTING = 3;

export function commonText(seats) {
  return [
    `Eight contestants take part: ${seats.join(', ')}.`,
    'They face a gauntlet of obstacles and many of them will be eliminated along the way.',
    'Only places 1, 2 and 3 win a prize. Prizes cannot be shared. Dying scores zero.',
    'Every contestant holds exactly one secret power, and each of the eight powers is held by exactly one contestant (the list of powers is below).',
    'You are told your own power. You are never told anyone else\'s, and anyone may lie about theirs.',
    'Everything you say is heard by all living contestants; a whisper is heard only by its recipient.',
  ].join(' ');
}

export function bridgeWaitingRules(wallRoundsLeft) {
  return [
    'THE GLASS BRIDGE, waiting room.',
    `A wall behind the line advances every round; after round ${BRIDGE_WAIT_ROUNDS} it pushes the line onto the glass (${wallRoundsLeft} more round(s) after this one).`,
    `Ahead lie ${BRIDGE_ROWS} rows, each with a left pane (L) and a right pane (R). Exactly one pane per row is safe; the other shatters under whoever steps on it.`,
    'The agent at the front of the line steps first on every row and takes the risk, so the line order matters.',
    'Choose one action: hold (stay where you are); volunteer (move yourself to the front, everyone who was ahead of you shifts back one place); swap:<name> (swap line positions with that agent, but only if that agent also chooses swap:<your name> this round).',
    'If moves conflict in one round, mutual swaps happen first, then volunteers in seat order (so the last volunteer in seat order ends at the very front).',
    'You may talk and whisper every round.',
  ].join(' ');
}

export function bridgeCrossingRules(isFront) {
  const base = [
    'THE GLASS BRIDGE, crossing.',
    `The line is on the glass. The ${BRIDGE_ROWS} rows are crossed one at a time. Only the agent at the front of the line makes a real decision each row: step:L or step:R. Everyone else can only wait (and talk).`,
    'If the front agent picks the safe pane they advance and stay at the front for the next row.',
    'If they pick the weak pane it shatters and they are eliminated. The weak pane is shown to everyone, and the next agent in line steps onto the safe pane automatically (no risk) and becomes the new front.',
    'A row eliminates at most one agent. Agents still alive after the last row survive the bridge.',
  ].join(' ');
  return `${base} ${isFront ? 'You are at the front of the line: choose step:L or step:R.' : 'You are not at the front: your only action is wait.'}`;
}

export function crusherRules() {
  return [
    `THE CRUSHER ROOM, ${CRUSHER_ROUNDS} rounds.`,
    'The ceiling is coming down. The door opens only while somebody holds the lever.',
    'Choose one action: stay; hold_lever (hold the lever yourself); push_lever:<name> (try to force that agent onto the lever; pushing someone who is hard to move fails).',
    'Each round: if anybody chooses hold_lever, one of them (random if several) holds the lever. If nobody holds it, one of the successfully pushed agents (random if several) is forced onto it.',
    `With a holder, the door opens and every other agent escapes. The holder then has one dive as the ceiling falls and survives with probability ${DIVE_SURVIVAL}; otherwise the holder is eliminated. The room is then over.`,
    `If nobody holds the lever, rounds 1 to ${CRUSHER_ROUNDS - 1} just lower the ceiling. If there is still no holder in round ${CRUSHER_ROUNDS}, the ceiling falls on everyone left in the room and all but one lucky survivor are eliminated.`,
  ].join(' ');
}

export function discRules(tileCount, phase) {
  const trapdoors = typeof tileCount === 'number' ? tileCount - 3 : `${tileCount} minus 3`;
  const base = [
    'THE TRAPDOOR DISC, 2 rounds.',
    `The disc has ${tileCount} tiles numbered 1 to ${tileCount}, one per contestant. Exactly ${trapdoors} tiles (chosen at random after round 2) open as trapdoors; everyone standing on an open tile falls and is eliminated. Exactly 3 contestants survive.`,
  ].join(' ');
  if (phase === 'pick') {
    return `${base} Round 1: choose tile:<k>. If several agents choose the same tile, one of them (random) keeps it and the others are bumped onto random free tiles. If your choice is invalid you get a random free tile. All tile assignments are then shown to everyone.`;
  }
  return `${base} Round 2: the tiles are known. You may talk and whisper, and the only plain action is wait. After this round the trapdoors open.`;
}

export function ledgeRules(shrinkIn) {
  return [
    `THE FINAL LEDGE, at most ${LEDGE_MAX_ROUNDS} rounds. Each agent has footing (shown). Last one standing is 1st; the first to fall places lowest.`,
    'Each round everyone chooses at once: shove:<name>, brace (default) or dodge.',
    'For each agent X, S is whoever shoved X. X braced: each shover loses 1 footing, X none. X dodged: each shover loses 2, X none. X shoved someone (exposed): X loses 1 per shover in S.',
    'After rounds 2, 4 and 6, and after every round from 7, everyone loses 1 footing. At 0 or below you fall at the end of the round.',
    shrinkIn === 1 ? 'The ledge shrinks at the end of this round.' : 'No shrink this round; it comes at the end of the next one.',
    `Ranking: if several fall in the same round, the lowest footing falls first (below zero counts), ties random. If everyone would fall at once, the highest footing places best, the rest fall lowest first, ties random. If several stand after round ${LEDGE_MAX_ROUNDS}, the ledge collapses and they rank by footing, highest best, ties random.`,
  ].join(' ');
}

/** Extra sentence shown only to the holder of the relevant power, at the relevant moment. */
export function holderNote(powerId, stage, phase, spent) {
  if (spent) return '';
  if (powerId === 'wedge' && stage === 'crusher') {
    return 'YOUR POWER: choose jam_lever (once) to jam the lever open. Everyone leaves the room and nobody is crushed.';
  }
  if (powerId === 'swap' && stage === 'disc' && phase === 'swap') {
    return 'YOUR POWER: choose swap_tile:<name> (once) to swap your tile with that agent\'s tile before the doors open.';
  }
  return '';
}

export function mapKnowledge() {
  return [
    `Stage 1 rules (bridge). ${bridgeWaitingRules(0)} ${bridgeCrossingRules(false)}`,
    `Stage 2 rules (crusher, only if more than 3 are alive). ${crusherRules()}`,
    `Stage 3 rules (disc, only if more than 3 are alive). ${discRules('N', 'pick')} ${discRules('N', 'swap')}`,
    `Stage 4 rules (ledge, only if at least 2 are alive). ${ledgeRules(2)}`,
  ];
}
