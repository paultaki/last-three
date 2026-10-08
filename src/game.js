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

const clip = (value, max) => String(value).slice(0, max);

function cleanText(value) {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  return text ? text.slice(0, TEXT_LIMIT) : null;
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
      timer = setTimeout(() => reject(new Error('agent timed out')), this.timeoutMs);
      timer.unref?.();
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
    const result = { thought: null, say: null, whisper: null, forge: null, action: '', valid: false, notes: [] };
    let response = null;
    if (!raw.ok) {
      result.notes.push(`agent error: ${clip(raw.error?.message ?? raw.error, NOTE_LIMIT)}`);
    } else if (!raw.value || typeof raw.value !== 'object' || Array.isArray(raw.value)) {
      result.notes.push('response was not an object');
    } else {
      response = raw.value;
    }
    let proposed = '';
    if (response) {
      try {
        result.thought = cleanText(response.thought);
        result.say = cleanText(response.say);
        result.whisper = this.#readWhisper(response.whisper);
        result.forge = this.#readForge(response.forge);
        proposed = typeof response.action === 'string' ? response.action.trim() : '';
      } catch (error) {
        result.notes.push(`unreadable response: ${clip(error?.message, NOTE_LIMIT)}`);
      }
    }
    result.valid = proposed !== '' && view.legalActions.includes(proposed);
    if (result.valid) {
      result.action = proposed;
    } else {
      result.action = fallbackFor(name, view);
      if (response) result.notes.push(proposed ? `illegal action "${clip(proposed, 40)}"` : 'missing action');
    }
    return result;
  }

  #readWhisper(value) {
    if (!value || typeof value !== 'object') return null;
    const text = cleanText(value.text);
    return text ? { to: typeof value.to === 'string' ? value.to : '', text } : null;
  }

  #readForge(value) {
    if (!value || typeof value !== 'object') return null;
    return {
      as: typeof value.as === 'string' ? value.as : '',
      to: typeof value.to === 'string' ? value.to : 'all',
      text: cleanText(value.text),
    };
  }

  // ---- speech --------------------------------------------------------------------------

  /** thought, say, whisper, forge for each asker, in seat order, before any action resolves. */
  speak(names, results) {
    for (const name of names) {
      const r = results[name];
      if (r.thought) this.emit('thought', { name, text: r.thought });
      if (r.say) {
        this.emit('say', { name, text: r.say });
        this.announce(`${name}: ${r.say}`);
      }
      if (r.whisper) this.#deliverWhisper(name, r);
      if (r.forge) this.#deliverForge(name, r);
    }
  }

  #deliverWhisper(name, r) {
    const to = this.resolveSeat(r.whisper.to);
    if (!to || to === name || !this.alive.has(to)) {
      r.notes.push('whisper dropped: recipient is not another living agent');
      return;
    }
    this.emit('whisper', { from: name, to, text: r.whisper.text });
    this.inbox.get(to).push({ from: name, text: r.whisper.text });
  }

  #forgeProblem(name, forge, as, to) {
    if (this.power[name] !== 'forger') return 'you are not the forger';
    if (this.spent.has(name)) return 'the forge is already spent';
    if (!as || as === name || !this.alive.has(as)) return 'must forge as a different living agent';
    if (!forge.text) return 'empty text';
    if (to !== 'all' && (!to || to === name || to === as || !this.alive.has(to))) return 'bad recipient';
    return null;
  }

  #deliverForge(name, r) {
    const as = this.resolveSeat(r.forge.as);
    const to = r.forge.to.trim().toLowerCase() === 'all' ? 'all' : this.resolveSeat(r.forge.to);
    const problem = this.#forgeProblem(name, r.forge, as, to);
    if (problem) {
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
      this.announce(`${as}: ${r.forge.text}`);
    } else {
      this.emit('whisper', { from: name, to, text: r.forge.text, forgedAs: as });
      this.inbox.get(to).push({ from: as, text: r.forge.text });
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
