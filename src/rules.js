// Plain-language rules text. The engine is the single source of truth for what agents are told.
// Nothing here may mention a power by name: holder-only additions live in `holderNote`.

export const BRIDGE_ROWS = 8;
export const BRIDGE_WAIT_ROUNDS = 6;
export const CRUSHER_ROUNDS = 5;
export const DIVE_SURVIVAL = 0.25;
export const WEDGE_DIVE_SURVIVAL = 0.5;
export const PIT_ROUNDS = 5;
export const PIT_LIFTS_PER_ROUND = 2;
export const ROPE_COST_FOOTING = 2;
export const DISC_ROUNDS = 2;
export const LEDGE_MAX_ROUNDS = 20;
export const LEDGE_BASE_FOOTING = 3;
export const CHALK_MAX_NOTES = 3;
export const CHALK_NOTE_LIMIT = 140;

export function commonText(seats, hasChalk = false) {
  return [
    `Eight contestants take part: ${seats.join(', ')}.`,
    'You are rivals, not friends. Only three of you get a prize: places 1, 2 and 3. Everyone else gets no prize. Dying scores zero, and prizes cannot be shared.',
    'The other contestants are your competition. Any help you give or get is a trade that suits somebody, and nobody has to keep a promise.',
    'They face a gauntlet of obstacles and many of them will be eliminated along the way.',
    'Every contestant holds exactly one secret power, and each of the eight powers is held by exactly one contestant (the list of powers is below).',
    'You are told your own power. You are never told anyone else\'s, and anyone may lie about theirs.',
    'Everything you say is heard by all living contestants; a whisper is heard only by its recipient.',
    ...(hasChalk
      ? ['On the waiting-room wall are messages scratched in chalk by earlier contestants who finished in the top three. Nobody can verify them: they may be honest, mistaken, or lies.']
      : []),
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

const PIT_CORE = [
  `THE PIT, ${PIT_ROUNDS} rounds.`,
  `Everyone alive falls into a flooding pit. After round ${PIT_ROUNDS} the water covers it and everyone still down is eliminated; at least 3 contestants always stay alive, so if the flood would leave fewer, lucky agents are saved at random.`,
  'Somebody must stay at the bottom as the step: the base. The base can never climb out alone and can only wait.',
  'While you are down and not the base, choose one: wait; offer_back (volunteer to be the base); climb (climb out over the base, only possible once there is a base); push_base:<name> (try to force another agent still down to be the base; it fails against someone hard to move). offer_back and push_base are only offered while there is no base.',
  `Each round: if there is no base, one volunteer (random if several) becomes the base; with no volunteers, one successfully pushed agent (random) is forced to be the base. Then at most ${PIT_LIFTS_PER_ROUND} climbers get out (random if more try; the rest stay down and may try again). Then the rope.`,
  `The pit has one rope, usable once. An agent who was already out at the start of the round can choose reach_down to haul the base out alive (random if several try). The price: whoever throws it starts the last obstacle of the game with ${ROPE_COST_FOOTING} less footing (never below 1). After a rescue there is no base and no rope.`,
  'Agents who are out can only leave or reach_down, and may still talk and whisper. If nobody is left down, the pit ends early.',
];

const PIT_ROLE = {
  down: 'You are down in the pit and are not the base.',
  base: 'You are the base: your only action is wait. Unless an agent who is out throws the rope, you will be eliminated when the pit floods.',
  out: 'You are out of the pit: your actions are leave, or reach_down (throw the rope to the base) while there is a base down there and the rope is unused.',
};

/** role: 'down' | 'base' | 'out', or null for the whole story (the Map holder's copy). */
export function pitRules(role = null) {
  const roles = role ? [PIT_ROLE[role]] : Object.values(PIT_ROLE);
  return [...PIT_CORE, ...roles].join(' ');
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
    'Each round everyone chooses at once: shove:<name>, brace or dodge.',
    'No repeating a defence: you cannot brace two rounds in a row, and you cannot dodge two rounds in a row. A shove is never restricted and resets this; round 1 is free. A missing or disallowed choice defaults to brace, or to dodge if brace is closed.',
    'For each agent X, S is whoever shoved X. X braced: each shover loses 1 footing, X none. X dodged: each shover loses 2, X none. X shoved someone (exposed): X loses 1 per shover in S.',
    'After rounds 2, 4 and 6, and after every round from 7, everyone loses 1 footing. At 0 or below you fall at the end of the round.',
    shrinkIn === 1 ? 'The ledge shrinks at the end of this round.' : 'No shrink this round; it comes at the end of the next one.',
    `Ranking: if several fall in the same round, the lowest footing falls first (below zero counts). Footing ties go to more landed shoves (shoves at an agent who was also shoving, so they lost footing; the count is shown), and a tie in both is settled at random. If everyone would fall at once, the highest footing places best and the rest fall lowest first, same tie-breaks. If several stand after round ${LEDGE_MAX_ROUNDS}, the ledge collapses and they rank by footing, highest best, same tie-breaks.`,
  ].join(' ');
}

/** The epilogue: the placed agents may leave one note on the chalk wall. Names no power. */
export function chalkRules(place) {
  return [
    `The game is over and you finished in place ${place}.`,
    `You may scratch ONE message (at most ${CHALK_NOTE_LIMIT} characters) on the chalk wall for future contestants.`,
    'You will never meet them and nothing you write changes your result.',
    'Put the message in "say".',
    'Write whatever you like: a warning, advice, a lie, a taunt.',
    'Choose skip to write nothing.',
  ].join(' ');
}

// Control characters are stripped (tab, newline and friends count as whitespace and collapse to one
// space), as are zero-width and bidi marks and lone surrogates.
const CONTROL = /[\u0000-\u0008\u000e-\u001f\u007f-\u0084\u0086-\u009f]/g;
const INVISIBLE = /[\u200b-\u200f\u202a-\u202e\u2060-\u2069\ufeff\u00ad]|[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/g;

/** One chalk note as clean, single-line text of at most CHALK_NOTE_LIMIT characters, or '' (never throws). */
export function sanitizeChalkText(value) {
  if (typeof value !== 'string') return '';
  const flat = value.slice(0, 4 * CHALK_NOTE_LIMIT).replace(INVISIBLE, '').replace(CONTROL, '').replace(/[\s\u0085]+/g, ' ').trim();
  let cut = flat.slice(0, CHALK_NOTE_LIMIT);
  if (/[\ud800-\udbff]$/.test(cut)) cut = cut.slice(0, -1); // never split a surrogate pair
  return cut.trim();
}

/** The caller's chalk input as at most CHALK_MAX_NOTES clean `{text, byPlace}` notes. Anything unusable is dropped. */
export function sanitizeChalkNotes(input) {
  const notes = [];
  if (!Array.isArray(input)) return notes;
  for (let k = 0; k < input.length && notes.length < CHALK_MAX_NOTES; k++) {
    let text;
    let byPlace;
    try {
      const item = input[k];
      if (typeof item !== 'object' || item === null) continue;
      text = sanitizeChalkText(item.text);
      byPlace = item.byPlace;
    } catch {
      continue;
    }
    if (text && Number.isInteger(byPlace) && byPlace >= 1 && byPlace <= 3) notes.push({ text, byPlace });
  }
  return notes;
}

/** Extra sentence shown only to the holder of the relevant power, at the relevant moment. */
export function holderNote(powerId, stage, phase, spent) {
  if (spent) return '';
  if (powerId === 'wedge' && stage === 'crusher') {
    return `YOUR POWER: choose jam_lever (once) to jam the lever open. Every other contestant walks out and the room is over, but you are caught in the jaws like a lever holder: you get one dive as the ceiling falls and survive the squeeze only about half the time (${WEDGE_DIVE_SURVIVAL}); otherwise you are eliminated. This is risky. A hold_lever holder survives only about a quarter of the time (${DIVE_SURVIVAL}).`;
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
    `Stage 3 rules (pit, only if more than 3 are alive). ${pitRules()}`,
    `Stage 4 rules (disc, only if more than 3 are alive). ${discRules('N', 'pick')} ${discRules('N', 'swap')}`,
    `Stage 5 rules (ledge, only if at least 2 are alive). ${ledgeRules(2)}`,
  ];
}
