// Game state and the single paths everything goes through: event emission, asking agents,
// speech/whisper/forge delivery and eliminations. Stages (src/stages/*) only decide what
// happens; they never touch events or the alive set directly.

import { makeRng } from './rng.js';
import { POWERS, POWER_IDS, powerById } from './powers.js';
import { commonText, mapKnowledge } from './rules.js';

export const SEATS = ['Ash', 'Bex', 'Cole', 'Dara', 'Eli', 'Fenn', 'Gus', 'Hana'];
export const TEXT_LIMIT = 280;
const NOTE_LIMIT = 160;
const LOG_LIMIT = 40;
const DEFAULT_AGENT_TIMEOUT_MS = 180_000;

const DEATH_LINES = {
  shatter: 'fell through the glass',
  flatten: 'was flattened by the ceiling',
  chute: 'dropped through a trapdoor',
  tumble: 'tumbled off the ledge',
};

// Never copy more of a hostile string than this before trimming and cutting it down.
const READ_LIMIT = 4 * TEXT_LIMIT;
const ACTION_LIMIT = 200;

const clip = (value, max) => String(value).slice(0, max);

/** An error (or any thrown value) as text. Never throws, whatever was thrown. */
export function describeError(error) {
  try {
    if (typeof error === 'string') return error;
    const message = error !== null && typeof error === 'object' ? error.message : undefined;
    if (typeof message === 'string' && message) return message;
    return String(error);
  } catch {
    return 'unprintable error';
  }
}

const isObject = (value) => typeof value === 'object' && value !== null;

/** Inert, trimmed, bounded text, or null. */
function cleanText(value) {
  if (typeof value !== 'string') return null;
  const text = value.slice(0, READ_LIMIT).trim();
  return text ? text.slice(0, TEXT_LIMIT) : null;
}

const boundedString = (value, max = READ_LIMIT) => (typeof value === 'string' ? value.slice(0, max) : '');

/**
 * Copy an agent's response into plain, inert data. Every field is read exactly once inside a
 * try/catch and coerced to a primitive, so getters, proxies, cycles and giant strings cannot
 * reach the rest of the engine. Problems are appended to `notes`; the result is null when the
 * response is not an object at all.
 */
function snapshotResponse(value, notes) {
  try {
    if (!isObject(value) || Array.isArray(value)) {
      notes.push('response was not an object');
      return null;
    }
  } catch (error) {
    notes.push(`unreadable response: ${clip(describeError(error), NOTE_LIMIT)}`);
    return null;
  }
  const read = (source, key) => {
    try {
      return source[key];
    } catch (error) {
      notes.push(`unreadable ${key}: ${clip(describeError(error), NOTE_LIMIT)}`);
      return undefined;
    }
  };
  const action = read(value, 'action');
  const whisper = read(value, 'whisper');
  const forge = read(value, 'forge');
  return {
    thought: cleanText(read(value, 'thought')),
    say: cleanText(read(value, 'say')),
    whisper: isObject(whisper) ? { to: boundedString(read(whisper, 'to')), text: cleanText(read(whisper, 'text')) } : null,
    forge: snapshotForge(forge, read),
    action: boundedString(action, ACTION_LIMIT).trim(),
  };
}

function snapshotForge(forge, read) {
  if (forge === undefined || forge === null) return null;
  if (!isObject(forge)) return { malformed: true, as: '', to: null, text: null };
  const to = read(forge, 'to');
  return {
    malformed: false,
    as: boundedString(read(forge, 'as')),
    to: typeof to === 'string' ? to.slice(0, READ_LIMIT) : null,
    text: cleanText(read(forge, 'text')),
  };
}

export class Game {
  constructor({ seed, agents, config = {} }) {
    if (!Number.isInteger(seed)) throw new TypeError('runGame: seed must be an integer');
    for (const seat of SEATS) {
      if (!agents || typeof agents[seat]?.act !== 'function') {
        throw new TypeError(`runGame: agents.${seat} must be an Agent with an act(view) function`);
      }
    }
    this.seed = seed;
    this.agents = agents;
    this.config = config;
    this.rng = makeRng(seed);
    this.timeoutMs = config.agentTimeoutMs ?? DEFAULT_AGENT_TIMEOUT_MS;

    this.events = [];
    this.stage = null;
    this.round = null;
    this.alive = new Set(SEATS);
    this.deaths = [];
    this.places = new Map();
    this.spent = new Set();
    this.bridgeSafe = null;

    this.log = [];
    this.cursor = new Map(SEATS.map((s) => [s, 0]));
    this.inbox = new Map(SEATS.map((s) => [s, []]));
    this.power = this.#assignPowers(config.powers);
    this.common = commonText(SEATS);
  }

  #assignPowers(override) {
    const shuffled = this.rng.shuffle(POWER_IDS);
    const power = Object.fromEntries(SEATS.map((seat, i) => [seat, shuffled[i]]));
    if (!override) return power;
    const given = SEATS.map((seat) => override[seat]);
    if (new Set(given).size !== SEATS.length || given.some((id) => !POWER_IDS.includes(id))) {
      throw new TypeError('config.powers must give each seat a distinct, known power id');
    }
    return Object.fromEntries(SEATS.map((seat, i) => [seat, given[i]]));
  }

  // ---- state helpers -------------------------------------------------------------------

  powerOf(name) {
    return this.power[name];
  }

  holderOf(powerId) {
    return SEATS.find((seat) => this.power[seat] === powerId);
  }

  aliveList() {
    return SEATS.filter((seat) => this.alive.has(seat));
  }

  /** Resolve a free-text agent name to a seat, tolerating case and surrounding whitespace. */
  resolveSeat(text) {
    if (typeof text !== 'string') return null;
    const wanted = text.trim().toLowerCase();
    return SEATS.find((seat) => seat.toLowerCase() === wanted) ?? null;
  }

  // ---- the one emit path ---------------------------------------------------------------

  /** Every event goes through here: `i`, `stage` and `round` can never be forgotten. */
  emit(type, fields = {}) {
    const event = { i: this.events.length, type, stage: this.stage, round: this.round, ...fields };
    this.events.push(event);
    return event;
  }

  announce(text) {
    this.log.push(text);
  }

  beginStage(stage, note) {
    this.stage = stage;
    this.round = null;
    this.emit('stage_start', { alive: this.aliveList(), note });
  }

  endStage() {
    this.emit('stage_end', { survivors: this.aliveList() });
    this.stage = null;
    this.round = null;
  }

  beginRound(phase, round, roundsTotal) {
    this.round = round;
    this.emit('round_start', { phase, roundsTotal });
  }

  // ---- views and asking ----------------------------------------------------------------

  #knowledgeFor(name) {
    const id = this.power[name];
    const out = [];
    if (id === 'map') out.push(...mapKnowledge());
    if (id === 'glass_eye' && this.stage === 'bridge' && this.bridgeSafe) {
      out.push(...this.bridgeSafe.map((side, row) => `Row ${row + 1} safe side: ${side}`));
    }
    return out;
  }

  /** A plain, fully detached JSON view for one agent. Advances that agent's log cursors. */
  view(name, spec) {
    const power = powerById(this.power[name]);
    const lines = this.log.slice(this.cursor.get(name));
    this.cursor.set(name, this.log.length);
    const whispers = this.inbox.get(name);
    this.inbox.set(name, []);
    return structuredClone({
      you: name,
      power: { id: power.id, description: power.description },
      powerSpent: this.spent.has(name),
      stage: this.stage,
      phase: spec.phase,
      round: this.round,
      roundsTotal: spec.roundsTotal,
      alive: this.aliveList(),
      dead: this.deaths.map(({ name: dead, stage, cause }) => ({ name: dead, stage, cause })),
      line: spec.line ?? [],
      stageState: spec.stageState ?? {},
      privateKnowledge: this.#knowledgeFor(name),
      publicLog: lines.slice(-LOG_LIMIT),
      whispersToYou: whispers,
      rules: spec.rules,
      legalActions: spec.legalActions,
      common: this.common,
      powerBlurbs: POWERS.map(({ id, blurb }) => ({ id, blurb })),
    });
  }

  async #callAgent(name, view) {
    let timer;
    const timeout = new Promise((_, reject) => {
      // Deliberately ref'd: a never-settling agent must not let the process exit before this fires.
      timer = setTimeout(() => reject(new Error('agent timed out')), this.timeoutMs);
    });
    try {
      const value = await Promise.race([(async () => this.agents[name].act(structuredClone(view)))(), timeout]);
      return { ok: true, value };
    } catch (error) {
      return { ok: false, error };
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Ask `names` (seat order) in parallel and normalise every answer. `specFor(name)` builds the
   * view spec, `fallbackFor(name, view)` returns the default action and is only called when needed.
   */
  async ask(names, specFor, fallbackFor) {
    const views = names.map((name) => this.view(name, specFor(name)));
    const raws = await Promise.all(names.map((name, k) => this.#callAgent(name, views[k])));
    return Object.fromEntries(names.map((name, k) => [name, this.#normalize(raws[k], views[k], name, fallbackFor)]));
  }

  #normalize(raw, view, name, fallbackFor) {
    const result = { thought: null, say: null, whisper: null, forge: null, forgeRejected: false, action: '', valid: false, notes: [] };
    let response = null;
    if (!raw.ok) {
      result.notes.push(`agent error: ${clip(describeError(raw.error), NOTE_LIMIT)}`);
    } else {
      response = snapshotResponse(raw.value, result.notes);
    }
    if (response) {
      result.thought = response.thought;
      result.say = response.say;
      result.whisper = response.whisper?.text ? response.whisper : null;
      result.forge = response.forge;
    }
    const proposed = response?.action ?? '';
    result.valid = proposed !== '' && view.legalActions.includes(proposed);
    if (result.valid) {
      result.action = proposed;
    } else {
      result.action = fallbackFor(name, view);
      if (response) result.notes.push(proposed ? `illegal action "${clip(proposed, 40)}"` : 'missing action');
    }
    return result;
  }

  // ---- speech --------------------------------------------------------------------------

  /**
   * thought, say, whisper, forge for each asker, in seat order, before any action resolves.
   *
   * Events record the real sender. What the other agents receive is ordered by APPARENT sender
   * (a forged line sits in the slot of the name it was forged as, right after that agent's own
   * line), so the order of delivery never reveals the forger.
   */
  speak(names, results) {
    const publicLines = [];
    const whispers = [];
    for (const name of names) {
      const r = results[name];
      try {
        if (r.thought) this.emit('thought', { name, text: r.thought });
        if (r.say) {
          this.emit('say', { name, text: r.say });
          publicLines.push({ as: name, forged: false, text: r.say });
        }
        if (r.whisper) this.#deliverWhisper(name, r, whispers);
        if (r.forge) this.#deliverForge(name, r, publicLines, whispers);
      } catch (error) {
        r.notes.push(`delivery failed: ${clip(describeError(error), NOTE_LIMIT)}`);
      }
    }
    for (const line of this.#inApparentOrder(publicLines)) this.announce(`${line.as}: ${line.text}`);
    for (const whisper of this.#inApparentOrder(whispers)) this.inbox.get(whisper.to).push({ from: whisper.as, text: whisper.text });
  }

  /** Seat order of the apparent sender; a forged line follows the genuine one. Stable otherwise. */
  #inApparentOrder(items) {
    const seat = (item) => SEATS.indexOf(item.as);
    return items
      .map((item, k) => ({ item, k }))
      .sort((a, b) => seat(a.item) - seat(b.item) || Number(a.item.forged) - Number(b.item.forged) || a.k - b.k)
      .map(({ item }) => item);
  }

  #deliverWhisper(name, r, whispers) {
    const to = this.resolveSeat(r.whisper.to);
    if (!to || to === name || !this.alive.has(to)) {
      r.notes.push('whisper dropped: recipient is not another living agent');
      return;
    }
    this.emit('whisper', { from: name, to, text: r.whisper.text });
    whispers.push({ to, as: name, forged: false, text: r.whisper.text });
  }

  /** `to` must be exactly "all" or a living agent other than the forger and the forged name. */
  #forgeTarget(raw) {
    if (typeof raw !== 'string') return null;
    return raw.trim().toLowerCase() === 'all' ? 'all' : this.resolveSeat(raw);
  }

  #forgeProblem(name, forge, as, to) {
    if (this.power[name] !== 'forger') return 'you are not the forger';
    if (this.spent.has(name)) return 'the forge is already spent';
    if (forge.malformed) return 'forge must be an object';
    if (!as || as === name || !this.alive.has(as)) return 'must forge as a different living agent';
    if (!forge.text) return 'empty text';
    if (to !== 'all' && (!to || to === name || to === as || !this.alive.has(to))) {
      return 'bad destination: "to" must be "all" or another living agent';
    }
    return null;
  }

  #deliverForge(name, r, publicLines, whispers) {
    const as = this.resolveSeat(r.forge.as);
    const to = this.#forgeTarget(r.forge.to);
    const problem = this.#forgeProblem(name, r.forge, as, to);
    if (problem) {
      r.forgeRejected = true;
      r.notes.push(`forge ignored: ${problem}`);
      return;
    }
    this.spent.add(name);
    this.emit('ability_use', {
      name,
      power: 'forger',
      detail: `forged a ${to === 'all' ? 'public' : 'whispered'} message as ${as}`,
    });
    if (to === 'all') {
      this.emit('say', { name, text: r.forge.text, forgedAs: as });
      publicLines.push({ as, forged: true, text: r.forge.text });
    } else {
      this.emit('whisper', { from: name, to, text: r.forge.text, forgedAs: as });
      whispers.push({ to, as, forged: true, text: r.forge.text });
    }
  }

  /** One `action` event per asker, in seat order. */
  emitActions(names, results, extraNotes = {}) {
    for (const name of names) {
      const r = results[name];
      const notes = [...r.notes, ...(extraNotes[name] ?? [])];
      this.emit('action', {
        name,
        action: r.action,
        valid: r.valid,
        ...(r.forgeRejected ? { forgeRejected: true } : {}),
        ...(notes.length ? { note: notes.join('; ') } : {}),
      });
    }
  }

  // ---- eliminations --------------------------------------------------------------------

  /** Passive feather: cancels the first elimination anywhere. Returns true if it fired. */
  tryFeather(name, detail) {
    if (this.power[name] !== 'feather' || this.spent.has(name)) return false;
    this.spent.add(name);
    this.emit('ability_use', { name, power: 'feather', detail });
    this.announce(`${name} should have been eliminated but somehow survived.`);
    return true;
  }

  luckySave(name, why) {
    this.emit('lucky_save', { name, why });
    this.announce(`${name} is saved by luck: ${why}.`);
  }

  /** The only place an agent leaves the alive set. */
  kill(name, { cause, style, place = null }) {
    this.alive.delete(name);
    this.deaths.push({ name, stage: this.stage, cause, style });
    this.emit('death', { name, cause, style, ...(place ? { place } : {}) });
    if (place) this.places.set(name, place);
    this.announce(`${name} ${DEATH_LINES[style]}.`);
  }

  /**
   * Resolve a batch of would-be eliminations: feather cancels the holder's, the floor rule saves one
   * random victim if nobody would be left, and only then do death events and state changes happen.
   * Returns { died, saved } (saved = feather or lucky save).
   */
  eliminate(victims, { cause, style, featherDetail, luckyWhy }) {
    let doomed = [...new Set(victims)].filter((name) => this.alive.has(name));
    const saved = doomed.filter((name) => this.tryFeather(name, featherDetail));
    doomed = doomed.filter((name) => !saved.includes(name));
    if (doomed.length > 0 && doomed.length === this.alive.size) {
      const lucky = this.rng.pick(doomed);
      this.luckySave(lucky, luckyWhy);
      saved.push(lucky);
      doomed = doomed.filter((name) => name !== lucky);
    }
    for (const name of doomed) this.kill(name, { cause, style });
    return { died: doomed, saved };
  }
}
