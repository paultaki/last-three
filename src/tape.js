// Tape format (spec section 7) and its validator. validateTape throws a clear Error on the first problem.

import { POWER_IDS } from './powers.js';

export const STAGE_NAMES = ['bridge', 'crusher', 'disc', 'ledge'];
const CAUSES = ['glass', 'crusher', 'trapdoor', 'ledge'];
const STYLES = ['shatter', 'flatten', 'chute', 'tumble'];
const MAX_PLACES = 3;
const PLAYER_COUNT = 8;
const LEDGE_PLACE_CAP = MAX_PLACES;

/** Value types for fields that must not just be present but well formed. */
const FIELD_TYPES = {
  alive: 'array', survivors: 'array', players: 'array', places: 'array',
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
};

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
  validateNamedLists(tape.events, names);
  validateUsage(tape.usage);
}

function validateHeader({ version, id, seed, createdAt }) {
  if (version !== 1) fail(`Bad version: expected 1, got ${version}`);
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
  if (event.stage !== null && !STAGE_NAMES.includes(event.stage)) fail(`Event ${idx} bad stage: ${event.stage}`);
  if (event.round !== null && !Number.isInteger(event.round)) fail(`Event ${idx} bad round: ${event.round}`);
  if (shape.stage && event.stage === null) fail(`Event ${idx} ${event.type} needs a stage`);
  if (shape.round && event.round === null) fail(`Event ${idx} ${event.type} needs a round`);
}

const ACTOR_FIELDS = { thought: 'name', say: 'name', action: 'name', ability_use: 'name', whisper: 'from' };

function checkLifecycle(event, idx, dead, deaths) {
  const actor = event[ACTOR_FIELDS[event.type]];
  if (actor && dead.has(actor)) fail(`Event ${idx} ${event.type}: ${actor} acts after dying`);
  if (event.type === 'lucky_save' && dead.has(event.name)) fail(`Event ${idx} lucky_save for dead agent ${event.name}`);
  if (event.type !== 'death') return;
  if (!CAUSES.includes(event.cause)) fail(`Event ${idx} death unknown cause: ${event.cause}`);
  if (!STYLES.includes(event.style)) fail(`Event ${idx} death unknown style: ${event.style}`);
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
    if (event.type === 'stage_start' || event.type === 'stage_end') {
      const field = event.type === 'stage_start' ? 'alive' : 'survivors';
      known(event[field], where);
      const expected = [...names].filter((n) => !dead.has(n));
      if (new Set(event[field]).size !== event[field].length || event[field].length !== expected.length || expected.some((n) => !event[field].includes(n))) {
        fail(`${where} ${field} does not match who is alive`);
      }
    }
    if (event.type === 'reveal') {
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
