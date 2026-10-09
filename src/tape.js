// Tape format (spec section 7) and its validator. validateTape throws a clear Error on the first problem.

import { POWER_IDS } from './powers.js';
import { CHALK_MAX_NOTES, CHALK_NOTE_LIMIT } from './rules.js';

export const STAGE_NAMES = ['bridge', 'crusher', 'pit', 'disc', 'ledge'];
/** Rules v4 epilogue: not an obstacle, so it is not in STAGE_NAMES (nobody dies or places in it). */
export const EPILOGUE_STAGE = 'chalk';
const CAUSES = ['glass', 'crusher', 'pit', 'trapdoor', 'ledge'];
const STYLES = ['shatter', 'flatten', 'sink', 'chute', 'tumble'];
/** The only (cause, style) a death in each stage may carry. */
const DEATH_BY_STAGE = {
  bridge: ['glass', 'shatter'],
  crusher: ['crusher', 'flatten'],
  pit: ['pit', 'sink'],
  disc: ['trapdoor', 'chute'],
  ledge: ['ledge', 'tumble'],
};
const REVEAL_WHATS = ['weak_pane', 'tiles', 'ceiling', 'footing', 'line', 'trapdoors', 'pit', 'rope'];
const PIT_MIN_ALIVE = 3;
const MAX_PLACES = 3;
const PLAYER_COUNT = 8;
const LEDGE_PLACE_CAP = MAX_PLACES;

/** Value types for fields that must not just be present but well formed. */
const FIELD_TYPES = {
  alive: 'array', survivors: 'array', players: 'array', places: 'array',
  notes: 'array', place: 'number',
  text: 'string', note: 'string', detail: 'string', why: 'string', power: 'string', action: 'string', what: 'string', phase: 'string',
  valid: 'boolean', roundsTotal: 'number',
};

/** Required fields per event type; `names` lists fields that must hold a player name. */
const EVENT_SHAPES = {
  game_start: { fields: ['players'] },
  stage_start: { fields: ['alive', 'note'], stage: true },
  round_start: { fields: ['phase', 'roundsTotal'], stage: true, round: true },
  thought: { fields: ['name', 'text'], names: ['name'] },
  say: { fields: ['name', 'text'], names: ['name'] },
  whisper: { fields: ['from', 'to', 'text'], names: ['from', 'to'] },
  action: { fields: ['name', 'action', 'valid'], names: ['name'] },
  reveal: { fields: ['what', 'data'] },
  ability_use: { fields: ['name', 'power', 'detail'], names: ['name'] },
  lucky_save: { fields: ['name', 'why'], names: ['name'] },
  death: { fields: ['name', 'cause', 'style'], names: ['name'], stage: true },
  stage_end: { fields: ['survivors'], stage: true },
  game_end: { fields: ['places'] },
  chalk_read: { fields: ['notes'] },
  chalk_write: { fields: ['name', 'place', 'text'], names: ['name'], stage: true, round: true },
};
/** The only event types the epilogue may contain. */
const CHALK_EVENT_TYPES = ['stage_start', 'round_start', 'thought', 'action', 'chalk_write', 'stage_end'];

const fail = (message) => {
  throw new Error(message);
};
const present = (value) => value !== undefined && value !== null;

export function validateTape(tape) {
  if (!tape || typeof tape !== 'object') fail('Tape must be an object');
  validateHeader(tape);
  const names = validatePlayers(tape.players);
  const deaths = validateEvents(tape.events, names);
  validateStartPlayers(tape);
  validateResult(tape, names, deaths);
  validateLedgeOutcome(tape, names, deaths);
  validateChalk(tape, names);
  validateNamedLists(tape.events, names);
  validateUsage(tape.usage);
}

function validateHeader({ version, rulesVersion, id, seed, createdAt }) {
  if (version !== 1) fail(`Bad version: expected 1, got ${version}`);
  if (rulesVersion !== undefined && (!Number.isInteger(rulesVersion) || rulesVersion < 1)) fail(`Bad rulesVersion: expected a positive integer, got ${rulesVersion}`);
  if (typeof id !== 'string' || !id) fail('Missing or invalid id');
  if (!Number.isInteger(seed)) fail('Seed must be an integer');
  if (typeof createdAt !== 'string' || !createdAt) fail('Missing or invalid createdAt');
}

function validatePlayers(players) {
  if (!Array.isArray(players) || players.length !== PLAYER_COUNT) fail(`Must have exactly ${PLAYER_COUNT} players`);
  const names = new Set();
  const powers = new Set();
  players.forEach((p, k) => {
    if (!p || !p.name || !p.model || !p.power) fail(`Player ${k} missing name, model, or power`);
    if (names.has(p.name)) fail(`Duplicate player name: ${p.name}`);
    if (!POWER_IDS.includes(p.power)) fail(`Unknown power: ${p.power}`);
    if (powers.has(p.power)) fail(`Duplicate power: ${p.power}`);
    names.add(p.name);
    powers.add(p.power);
  });
  return names;
}

/** Returns the death events in order (used for the result cross-checks). */
function validateEvents(events, names) {
  if (!Array.isArray(events) || events.length === 0) fail('Events must be a non-empty array');
  const dead = new Set();
  const deaths = [];
  let lastI = -1;
  events.forEach((event, idx) => {
    if (!event || typeof event !== 'object') fail(`Event ${idx} is not an object`);
    if (!Number.isInteger(event.i)) fail(`Event ${idx} missing or invalid i`);
    if (event.i <= lastI) fail(`Event indices not strictly increasing at index ${idx}: ${lastI} >= ${event.i}`);
    lastI = event.i;
    const shape = EVENT_SHAPES[event.type];
    if (!shape) fail(`Event ${idx} unknown type: ${event.type}`);
    validateStageRound(event, idx, shape);
    for (const field of shape.fields) {
      if (!present(event[field])) fail(`Event ${idx} ${event.type} missing ${field}`);
      const expected = FIELD_TYPES[field];
      const actual = Array.isArray(event[field]) ? 'array' : typeof event[field];
      if (expected && actual !== expected) fail(`Event ${idx} ${event.type} ${field} must be a ${expected}`);
    }
    if (event.forgedAs !== undefined && !names.has(event.forgedAs)) fail(`Event ${idx} ${event.type} unknown player: ${event.forgedAs}`);
    for (const field of shape.names ?? []) {
      if (!names.has(event[field])) fail(`Event ${idx} ${event.type} unknown player: ${event[field]}`);
    }
    checkLifecycle(event, idx, dead, deaths);
  });
  if (events[0].type !== 'game_start') fail('First event must be game_start');
  if (events[0].i !== 0) fail(`First event index must be 0, got ${events[0].i}`);
  if (events.at(-1).type !== 'game_end') fail('Last event must be game_end');
  if (events.filter((e) => e.type === 'game_start').length !== 1) fail('Exactly one game_start required');
  if (events.filter((e) => e.type === 'game_end').length !== 1) fail('Exactly one game_end required');
  return deaths;
}

function validateStageRound(event, idx, shape) {
  if (!('stage' in event) || !('round' in event)) fail(`Event ${idx} ${event.type} must carry stage and round keys (null if n/a)`);
  if (event.stage !== null && !STAGE_NAMES.includes(event.stage) && event.stage !== EPILOGUE_STAGE) fail(`Event ${idx} bad stage: ${event.stage}`);
  if (event.round !== null && !Number.isInteger(event.round)) fail(`Event ${idx} bad round: ${event.round}`);
  if (shape.stage && event.stage === null) fail(`Event ${idx} ${event.type} needs a stage`);
  if (shape.round && event.round === null) fail(`Event ${idx} ${event.type} needs a round`);
}

const ACTOR_FIELDS = { thought: 'name', say: 'name', action: 'name', ability_use: 'name', whisper: 'from' };

function checkLifecycle(event, idx, dead, deaths) {
  const actor = event[ACTOR_FIELDS[event.type]];
  // The epilogue is the one place the dead may act (placed fallers write a note); validateChalk polices it.
  if (actor && dead.has(actor) && event.stage !== EPILOGUE_STAGE) fail(`Event ${idx} ${event.type}: ${actor} acts after dying`);
  if (event.type === 'lucky_save' && dead.has(event.name)) fail(`Event ${idx} lucky_save for dead agent ${event.name}`);
  if (event.type !== 'death') return;
  if (!CAUSES.includes(event.cause)) fail(`Event ${idx} death unknown cause: ${event.cause}`);
  if (!STYLES.includes(event.style)) fail(`Event ${idx} death unknown style: ${event.style}`);
  const [cause, style] = DEATH_BY_STAGE[event.stage] ?? [];
  if (event.cause !== cause || event.style !== style) fail(`Event ${idx} a ${event.stage} death must have cause ${cause} and style ${style}, got ${event.cause} and ${event.style}`);
  if (dead.has(event.name)) fail(`Event ${idx} ${event.name} dies twice`);
  if (event.place !== undefined && event.stage !== 'ledge') fail(`Event ${idx} only ledge deaths carry a place`);
  dead.add(event.name);
  deaths.push(event);
}

function validatePlaceEntries(places, names) {
  if (!Array.isArray(places)) fail('Result missing places array');
  const seen = new Set();
  const byPlace = new Map();
  for (const p of places) {
    if (!p || !names.has(p.name)) fail(`Unknown player in places: ${p?.name}`);
    if (seen.has(p.name)) fail(`Player listed twice in places: ${p.name}`);
    seen.add(p.name);
    if (p.place === null) {
      if (!STAGE_NAMES.includes(p.diedAt)) fail(`Player ${p.name} has no place, so diedAt must name a stage, got ${p.diedAt}`);
      continue;
    }
    if (!Number.isInteger(p.place) || p.place < 1 || p.place > MAX_PLACES) fail(`Place must be 1-3 or null, got ${p.place}`);
    if (byPlace.has(p.place)) fail(`Duplicate place assignment: ${p.place}`);
    byPlace.set(p.place, p.name);
  }
  if (seen.size !== names.size) fail('Every player must appear in result.places');
  const sorted = [...byPlace.keys()].sort((a, b) => a - b);
  sorted.forEach((place, k) => {
    if (place !== k + 1) fail(`Places must be contiguous from 1, got ${sorted}`);
  });
  return byPlace;
}

function validateResult(tape, names, deathEvents) {
  const { result, events } = tape;
  if (!result || !Array.isArray(result.deaths)) fail('Result missing deaths array');
  validatePlaceEntries(result.places, names);

  const ended = events.at(-1).places;
  if (JSON.stringify(ended) !== JSON.stringify(result.places)) fail('game_end places differ from result.places');
  if (JSON.stringify(result.deaths.map(stripDeath)) !== JSON.stringify(deathEvents.map(stripDeath))) {
    fail('result.deaths does not match the death events');
  }

  const deathOf = new Map(deathEvents.map((d) => [d.name, d]));
  const survivors = [...names].filter((n) => !deathOf.has(n));
  if (survivors.length !== 1) fail(`Exactly one agent must survive, found ${survivors.length}`);

  for (const p of result.places) {
    const death = deathOf.get(p.name);
    if (p.place !== null && death && death.stage !== 'ledge') {
      fail(`Agent ${p.name} died before ledge but has place ${p.place}`);
    }
    if (death && death.place !== undefined && death.place !== p.place) fail(`Agent ${p.name} death place differs from result`);
    if (p.place === null && !death) fail(`Agent ${p.name} survived but has no place`);
    if (p.place === null && p.diedAt !== death.stage) fail(`Agent ${p.name} diedAt differs from death stage`);
  }
  const winner = result.places.find((p) => p.place === 1);
  if (!winner || winner.name !== survivors[0]) fail('Place 1 must go to the sole survivor');
}

/** game_start.players is the same roster as tape.players. */
function validateStartPlayers({ players, events }) {
  const started = events[0].players;
  if (!Array.isArray(started) || started.length !== PLAYER_COUNT) fail(`game_start must list exactly ${PLAYER_COUNT} players`);
  const plain = (list) => JSON.stringify(list.map((p) => [p?.name, p?.model, p?.power]));
  if (plain(started) !== plain(players)) fail('game_start players differ from tape.players');
}

/**
 * Places must follow from the events: everyone on the ledge ranks by the order they fell
 * (the j-th faller of k placed k - j, only 1 to 3 pay), the survivor is 1st, and nobody else ranks.
 */
function validateLedgeOutcome(tape, names, deathEvents) {
  const { events, result } = tape;
  const starts = events.filter((e) => e.type === 'stage_start' && e.stage === 'ledge');
  if (starts.length > 1) fail('The ledge can only start once');
  const onLedge = new Set(starts[0]?.alive ?? []);
  const expected = new Map(); // name -> expected place (null = none)
  const survivor = [...names].find((n) => !deathEvents.some((d) => d.name === n));
  const fallers = deathEvents.filter((d) => d.stage === 'ledge');
  fallers.forEach((death, j) => {
    if (!onLedge.has(death.name)) fail(`Agent ${death.name} died on the ledge without being on it`);
    const standing = onLedge.size - j;
    const place = standing <= LEDGE_PLACE_CAP ? standing : null;
    if ((death.place ?? null) !== place) fail(`Agent ${death.name} fell ${ordinal(j + 1)} of ${onLedge.size} on the ledge so its place must be ${place}, got ${death.place ?? null}`);
    expected.set(death.name, place);
  });
  if (starts.length === 1 && !onLedge.has(survivor)) fail(`Survivor ${survivor} was not on the ledge`);
  if (starts.length === 1 && fallers.length !== onLedge.size - 1) fail('Everyone on the ledge but the survivor must fall on it');
  expected.set(survivor, 1);
  for (const p of result.places) {
    const want = expected.get(p.name) ?? null;
    if (p.place !== want) fail(`Agent ${p.name} should have place ${want} from the events, got ${p.place}`);
  }
}

/**
 * The chalk wall (rules v4). Old tapes have none of it and pass untouched. When present: the notes
 * shown at the start match chalkShown, the epilogue asks exactly the placed agents after the last
 * obstacle, every note comes from a placed agent's valid `write`, and chalkWritten matches the events.
 */
function validateChalk(tape, names) {
  const { events, result } = tape;
  const reads = events.filter((e) => e.type === 'chalk_read');
  if (reads.length > 1) fail('At most one chalk_read allowed');
  if (reads.length === 1) {
    if (events[1] !== reads[0]) fail('chalk_read must come right after game_start');
    if (reads[0].stage !== null || reads[0].round !== null) fail('chalk_read must have null stage and round');
    validateShownNotes(reads[0].notes, 'chalk_read notes');
    if (reads[0].notes.length === 0) fail('chalk_read notes must not be empty');
  }
  if (tape.chalkShown !== undefined) {
    validateShownNotes(tape.chalkShown, 'chalkShown');
    if (JSON.stringify(tape.chalkShown) !== JSON.stringify(reads[0]?.notes ?? [])) fail('chalkShown does not match the chalk_read event');
  }

  const placedAt = new Map(result.places.filter((p) => p.place !== null).map((p) => [p.name, p.place]));
  const epilogue = events.filter((e) => e.stage === EPILOGUE_STAGE);
  const writes = epilogue.filter((e) => e.type === 'chalk_write');
  if (epilogue.length) validateEpilogue(events, epilogue, writes, placedAt);
  if (tape.chalkWritten !== undefined) {
    if (!Array.isArray(tape.chalkWritten)) fail('chalkWritten must be an array');
    const plain = ({ name, place, text }) => ({ name, place, text });
    if (JSON.stringify(tape.chalkWritten.map(plain)) !== JSON.stringify(writes.map(plain))) fail('chalkWritten does not match the chalk_write events');
  }
}

function validateShownNotes(notes, where) {
  if (!Array.isArray(notes) || notes.length > CHALK_MAX_NOTES) fail(`${where} must be an array of at most ${CHALK_MAX_NOTES} notes`);
  for (const note of notes) {
    if (!note || typeof note !== 'object') fail(`${where} has a note that is not an object`);
    if (typeof note.text !== 'string' || !note.text.trim() || note.text.length > CHALK_NOTE_LIMIT) fail(`${where} text must be 1-${CHALK_NOTE_LIMIT} characters`);
    if (!Number.isInteger(note.byPlace) || note.byPlace < 1 || note.byPlace > MAX_PLACES) fail(`${where} byPlace must be 1-${MAX_PLACES}`);
  }
}

function validateEpilogue(events, epilogue, writes, placedAt) {
  const starts = epilogue.filter((e) => e.type === 'stage_start');
  const ends = epilogue.filter((e) => e.type === 'stage_end');
  if (starts.length !== 1 || ends.length !== 1) fail('The chalk epilogue needs exactly one stage_start and one stage_end');
  const first = events.indexOf(epilogue[0]);
  if (epilogue[0] !== starts[0]) fail('The chalk epilogue must begin with its stage_start');
  if (events.slice(first, -1).some((e) => e.stage !== EPILOGUE_STAGE)) fail('The chalk epilogue must come after the last obstacle, just before game_end');
  if (epilogue.at(-1) !== ends[0]) fail('The chalk epilogue must end with its stage_end');
  for (const e of epilogue) {
    if (!CHALK_EVENT_TYPES.includes(e.type)) fail(`Event ${e.i} ${e.type} is not allowed in the chalk epilogue`);
    if (e.round !== null && e.round !== 1) fail(`Event ${e.i} chalk round must be 1`);
  }
  const placedNames = [...placedAt.keys()];
  for (const [what, list] of [['stage_start alive', starts[0].alive], ['stage_end survivors', ends[0].survivors]]) {
    if (new Set(list).size !== list.length || list.length !== placedNames.length || placedNames.some((n) => !list.includes(n))) {
      fail(`Chalk ${what} must be exactly the placed agents`);
    }
  }
  const actions = new Map();
  for (const e of epilogue) {
    if (e.type !== 'thought' && e.type !== 'action') continue;
    if (!placedAt.has(e.name)) fail(`Event ${e.i} ${e.name} is not placed so cannot act in the chalk epilogue`);
    if (e.type === 'thought') continue;
    if (actions.has(e.name)) fail(`Event ${e.i} ${e.name} acts twice in the chalk epilogue`);
    if (e.action !== 'write' && e.action !== 'skip') fail(`Event ${e.i} chalk action must be write or skip, got ${e.action}`);
    if (e.action === 'write' && e.valid !== true) fail(`Event ${e.i} an invalid chalk action must default to skip`);
    actions.set(e.name, e);
  }
  if (actions.size !== placedNames.length) fail('Every placed agent must have exactly one chalk action');
  const written = new Set();
  for (const w of writes) {
    if (placedAt.get(w.name) !== w.place) fail(`Event ${w.i} chalk_write by ${w.name} has place ${w.place}, expected ${placedAt.get(w.name) ?? 'none (not placed)'}`);
    if (typeof w.text !== 'string' || !w.text.trim() || w.text.length > CHALK_NOTE_LIMIT) fail(`Event ${w.i} chalk_write text must be 1-${CHALK_NOTE_LIMIT} characters`);
    if (written.has(w.name)) fail(`Event ${w.i} ${w.name} writes twice`);
    written.add(w.name);
    if (actions.get(w.name)?.action !== 'write') fail(`Event ${w.i} chalk_write by ${w.name} without a write action`);
  }
}

const ordinal = (n) => `#${n}`;

const asArray = (value) => (Array.isArray(value) ? value : []);

/** Every name in a list or map anywhere in the tape is a player, and alive lists match the deaths so far. */
function validateNamedLists(events, names) {
  const dead = new Set();
  const known = (list, where) => {
    for (const n of list) if (!names.has(n)) fail(`${where} unknown player: ${n}`);
  };
  events.forEach((event, idx) => {
    const where = `Event ${idx} ${event.type}`;
    if (event.type === 'death') dead.add(event.name);
    if (event.type === 'stage_start' && event.stage === 'pit' && event.alive.length <= PIT_MIN_ALIVE) fail(`${where} the pit only runs with more than ${PIT_MIN_ALIVE} alive`);
    if (event.type === 'stage_end' && event.stage === 'pit' && event.survivors.length < PIT_MIN_ALIVE) fail(`${where} the pit must leave at least ${PIT_MIN_ALIVE} alive`);
    if ((event.type === 'stage_start' || event.type === 'stage_end') && event.stage !== EPILOGUE_STAGE) {
      const field = event.type === 'stage_start' ? 'alive' : 'survivors';
      known(event[field], where);
      const expected = [...names].filter((n) => !dead.has(n));
      if (new Set(event[field]).size !== event[field].length || event[field].length !== expected.length || expected.some((n) => !event[field].includes(n))) {
        fail(`${where} ${field} does not match who is alive`);
      }
    }
    if (event.type === 'reveal') {
      if (!REVEAL_WHATS.includes(event.what)) fail(`${where} unknown reveal: ${event.what}`);
      known(asArray(event.data?.down), `${where} down`);
      known(asArray(event.data?.out), `${where} out`);
      known(asArray(event.data?.lifted), `${where} lifted`);
      known([event.data?.base, event.data?.roped, event.data?.rescued, event.data?.by, event.data?.saved].filter((n) => n !== undefined && n !== null), `${where} pit`);
      known(asArray(event.data?.line), `${where} line`);
      known(Object.keys(event.data?.footing ?? {}), `${where} footing`);
    }
    if (event.type === 'game_end') known(event.places.map((p) => p?.name), where);
  });
}

const stripDeath = ({ name, stage, cause, style }) => ({ name, stage, cause, style });

function validateUsage(usage) {
  if (!usage || typeof usage !== 'object') fail('Missing usage object');
  for (const key of ['inputTokens', 'outputTokens', 'usd', 'calls']) {
    if (!Number.isFinite(usage[key]) || usage[key] < 0) fail(`Invalid usage.${key}: must be a finite, non-negative number`);
  }
}
