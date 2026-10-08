// Pure replay reducer: stateAt(tape, i) folds tape events 0..i into scene state.
// No DOM in here, so it can be unit-tested in Node. Everything is read from the tape;
// unknown events are ignored and missing optional fields never throw.
import { describeEvent } from './text.js';

export const STAGES = ['bridge', 'crusher', 'pit', 'disc', 'ledge'];
const PIT_ROUNDS_DEFAULT = 5;
const MAX_SPEECH = 8;

export function parseAction(raw) {
  const s = String(raw == null ? '' : raw);
  const k = s.indexOf(':');
  return k < 0 ? { verb: s, arg: null } : { verb: s.slice(0, k), arg: s.slice(k + 1) };
}

const toNum = (v) => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(+v)) return +v;
  return null;
};
const other = (side) => (side === 'L' ? 'R' : 'L');
const uniq = (arr) => [...new Set(arr)];

// ---------------------------------------------------------------- derived (whole-tape) facts
const derivedCache = new WeakMap();

// Facts that need to look ahead of the current event, computed once per tape.
// A replay may legitimately use them: nothing here is hidden information.
export function derive(tape) {
  const hit = derivedCache.get(tape);
  if (hit) return hit;
  const events = Array.isArray(tape.events) ? tape.events : [];
  const d = {
    hasLineReveal: false,
    roundLine: new Map(), // round_start index -> names in the order its action events appear
    speechLine: new Map(), // round_start index -> names in the order of its thoughts (pre-move line)
    swapTarget: new Map(), // ability_use(swap) index -> target name
    lastIndex: events.length - 1,
  };
  let stage = null;
  let phase = null;
  let roundIdx = -1;
  const names = new Set((tape.players || []).map((p) => p.name));
  events.forEach((ev, idx) => {
    if (!ev) return;
    if (ev.type === 'stage_start') {
      stage = ev.stage;
      roundIdx = -1;
    } else if (ev.type === 'round_start') {
      stage = ev.stage || stage;
      phase = ev.phase || null;
      roundIdx = idx;
      d.roundLine.set(idx, []);
      d.speechLine.set(idx, []);
    } else if (ev.type === 'reveal' && ev.what === 'line') {
      d.hasLineReveal = true;
    } else if (ev.type === 'action' && roundIdx >= 0 && stage === 'bridge') {
      const arr = d.roundLine.get(roundIdx);
      if (arr && ev.name && !arr.includes(ev.name)) arr.push(ev.name);
    } else if ((ev.type === 'thought' || ev.type === 'say') && roundIdx >= 0 && stage === 'bridge') {
      const arr = d.speechLine.get(roundIdx);
      if (arr && ev.name && !arr.includes(ev.name)) arr.push(ev.name);
    } else if (ev.type === 'ability_use' && ev.power === 'swap') {
      let target = null;
      for (let k = idx + 1; k < Math.min(events.length, idx + 14) && !target; k++) {
        const nx = events[k];
        if (nx && nx.type === 'action' && nx.name === ev.name && String(nx.action).startsWith('swap_tile:')) {
          target = String(nx.action).slice(10);
        }
      }
      if (!target && ev.detail) {
        target = [...names].find((n) => n !== ev.name && new RegExp(`\\b${n}\\b`).test(String(ev.detail))) || null;
      }
      if (target) d.swapTarget.set(idx, target);
    }
  });
  void phase;
  derivedCache.set(tape, d);
  return d;
}

// ---------------------------------------------------------------- initial state
function initial(tape) {
  const order = (tape.players || []).map((p) => p.name);
  const players = {};
  for (const p of tape.players || []) {
    players[p.name] = { name: p.name, model: p.model, power: p.power, alive: true, place: null, fate: null };
  }
  return {
    i: -1,
    ev: null,
    started: false,
    ended: false,
    rules: Number.isInteger(tape && tape.rulesVersion) && tape.rulesVersion > 0 ? tape.rulesVersion : 1,
    stage: 'lobby',
    phase: null,
    round: null,
    roundsTotal: null,
    note: null,
    order,
    players,
    deaths: [],
    spent: {},
    acts: {},
    speech: [],
    flash: null,
    caption: null,
    captionCut: null,
    winner: null,
    places: null,
    stageIdx: -1,
    stageSurvivors: null,
    bridge: null,
    crusher: null,
    pit: null,
    ropeCost: {},
    disc: null,
    ledge: null,
  };
}

export function aliveNames(state) {
  return state.order.filter((n) => state.players[n] && state.players[n].alive);
}

// ---------------------------------------------------------------- stage setup
function newBridge(aliveList) {
  return {
    line: aliveList.slice(),
    cur: 0,
    rows: {},
    at: {},
    stepping: {},
    finished: false,
    lineRound: null,
  };
}
const newCrusher = () => ({
  ceiling: 5,
  holder: null,
  holdChosen: false,
  jam: false,
  door: false,
  crushed: false,
  escaped: false,
  deathsThisRound: 0,
});
const newDisc = (aliveList) => ({
  n: aliveList.length,
  openCount: Math.max(0, aliveList.length - 3),
  tiles: {},
  tilesPublic: false,
  open: [],
  swapped: false,
});
// Start footing: 3 (anchor 4, spent feather 1), minus the pit rope's price, never below 1.
function newLedge(aliveList, players, ropeCost = {}, spent = {}) {
  const footing = {};
  for (const n of aliveList) {
    const power = players[n] && players[n].power;
    let start = power === 'anchor' ? 4 : power === 'feather' && spent[n] === 'feather' ? 1 : 3;
    if (ropeCost[n]) start = Math.max(1, start - ropeCost[n]);
    footing[n] = start;
  }
  return { footing, shrinkIn: null, shrunk: 0 };
}

const newPit = (aliveList) => ({
  total: PIT_ROUNDS_DEFAULT,
  flood: 0,
  base: null,
  baseHow: null, // 'volunteer' | 'pushed'
  baseNew: false, // the latest reveal chose a new base
  order: aliveList.slice(), // stable basis for slots
  down: aliveList.slice(),
  sunk: [], // went under in the flood (their slots stay reserved)
  out: [], // in the order they got out
  ropeUsed: false,
  lifted: [],
  roped: null,
  rescued: null,
  rope: null, // { by, saved, cost } once thrown
  pushFail: null, // { by, target }
  floated: [], // saved from the flood by luck or the feather
});

const arrNames = (v, players) => (Array.isArray(v) ? v.filter((n) => typeof n === 'string' && players[n]) : []);
const oneName = (v, players) => (typeof v === 'string' && players[v] ? v : null);
// Move names from down to out, keeping the exit order.
const moveOut = (pit, names) => {
  const out = [...pit.out];
  for (const n of names) if (!out.includes(n)) out.push(n);
  return { ...pit, out, down: pit.down.filter((n) => !out.includes(n)), base: pit.base && out.includes(pit.base) ? null : pit.base };
};

// ---------------------------------------------------------------- reducer
export function reduce(s, ev, idx, derivedInfo) {
  if (!ev || typeof ev !== 'object') return { ...s, i: idx };
  const next = { ...s, i: idx, ev };
  const d = derivedInfo;

  switch (ev.type) {
    case 'game_start': {
      next.started = true;
      if (Array.isArray(ev.players)) {
        const players = { ...s.players };
        for (const p of ev.players) {
          if (p && p.name && players[p.name]) {
            players[p.name] = { ...players[p.name], model: p.model || players[p.name].model, power: p.power || players[p.name].power };
          }
        }
        next.players = players;
      }
      break;
    }

    case 'stage_start': {
      const stage = ev.stage;
      const alive = Array.isArray(ev.alive) && ev.alive.length ? ev.alive : aliveNames(s);
      next.stage = stage;
      next.phase = null;
      next.round = null;
      next.roundsTotal = null;
      next.note = ev.note || null;
      next.acts = {};
      next.speech = [];
      next.flash = null;
      next.stageIdx = STAGES.indexOf(stage);
      next.stageSurvivors = null;
      if (stage === 'bridge') next.bridge = newBridge(alive);
      else if (stage === 'crusher') next.crusher = newCrusher();
      else if (stage === 'pit') next.pit = newPit(alive);
      else if (stage === 'disc') next.disc = newDisc(alive);
      else if (stage === 'ledge') next.ledge = newLedge(alive, s.players, s.ropeCost, s.spent);
      break;
    }

    case 'round_start': {
      if (ev.stage && ev.stage !== s.stage && STAGES.includes(ev.stage)) next.stage = ev.stage;
      next.phase = ev.phase || null;
      next.round = toNum(ev.round);
      next.roundsTotal = toNum(ev.roundsTotal);
      next.acts = {};
      next.speech = [];
      next.flash = null;
      if (next.stage === 'bridge' && s.bridge) {
        const b = { ...s.bridge };
        const aliveSet = new Set(aliveNames(s));
        if (ev.phase === 'crossing') {
          b.cur = toNum(ev.round) || b.cur + 1;
          if (!d.hasLineReveal) {
            const arr = d.roundLine.get(idx);
            if (arr && arr.length) b.line = arr.filter((n) => aliveSet.has(n));
          }
        } else if (!d.hasLineReveal && ev.round === 1) {
          const arr = d.speechLine.get(idx);
          if (arr && arr.length >= 2) {
            const rest = b.line.filter((n) => !arr.includes(n));
            b.line = [...arr, ...rest].filter((n) => aliveSet.has(n));
          }
        }
        b.lineRound = null;
        next.bridge = b;
      } else if (next.stage === 'crusher' && s.crusher) {
        next.crusher = { ...s.crusher, holder: null, holdChosen: false, jam: false, door: false, deathsThisRound: 0 };
      } else if (next.stage === 'pit' && s.pit) {
        const total = toNum(ev.roundsTotal);
        next.pit = { ...s.pit, total: total || s.pit.total, baseNew: false, lifted: [], roped: null, rescued: null, pushFail: null, floated: [] };
      }
      break;
    }

    case 'thought':
    case 'say': {
      const text = String(ev.text == null ? '' : ev.text);
      const entry = {
        i: idx,
        kind: ev.type,
        name: ev.name,
        as: ev.type === 'say' && ev.forgedAs ? ev.forgedAs : ev.name,
        forgedAs: ev.type === 'say' ? ev.forgedAs || null : null,
        text,
      };
      next.speech = [...s.speech, entry].slice(-MAX_SPEECH);
      break;
    }

    case 'whisper': {
      const entry = {
        i: idx,
        kind: 'whisper',
        name: ev.from,
        as: ev.forgedAs || ev.from,
        forgedAs: ev.forgedAs || null,
        to: ev.to,
        text: String(ev.text == null ? '' : ev.text),
      };
      next.speech = [...s.speech, entry].slice(-MAX_SPEECH);
      break;
    }

    case 'action': {
      const name = ev.name;
      if (!name) break;
      const { verb, arg } = parseAction(ev.action);
      next.acts = { ...s.acts, [name]: { verb, arg, raw: String(ev.action), valid: ev.valid !== false, auto: !!ev.auto, note: ev.note || null, i: idx } };
      if (ev.valid === false) break; // invalid actions are shown but have no stage effect
      if (s.stage === 'bridge' && s.bridge) applyBridgeAction(next, s, name, verb, arg, ev, idx, d);
      else if (s.stage === 'crusher' && s.crusher) applyCrusherAction(next, s, name, verb, arg);
      else if (s.stage === 'disc' && s.disc) applyDiscAction(next, s, name, verb, arg);
      break;
    }

    case 'reveal':
      applyReveal(next, s, ev, idx);
      break;

    case 'ability_use': {
      const name = ev.name;
      next.spent = { ...s.spent, [name]: ev.power || true };
      next.flash = { kind: 'ability', name, power: ev.power, detail: ev.detail || '', i: idx };
      if (ev.power === 'wedge' && s.crusher) {
        next.crusher = { ...s.crusher, jam: true, door: true };
      } else if (ev.power === 'swap' && s.disc && !s.disc.swapped) {
        const target = d.swapTarget.get(idx);
        if (target && s.disc.tiles[name] != null && s.disc.tiles[target] != null) {
          const tiles = { ...s.disc.tiles };
          [tiles[name], tiles[target]] = [tiles[target], tiles[name]];
          next.disc = { ...s.disc, tiles, swapped: true };
        } else {
          next.disc = { ...s.disc, swapped: true };
        }
      } else if (ev.power === 'feather' && s.stage === 'ledge' && s.ledge) {
        next.ledge = { ...s.ledge, footing: { ...s.ledge.footing, [name]: 1 } };
      } else if (ev.power === 'feather' && s.stage === 'pit' && s.pit) {
        next.pit = { ...moveOut(s.pit, [name]), floated: [...s.pit.floated, name] };
        next.flash = { kind: 'pit', name, text: 'FLOATS OUT!', i: idx };
      } else if (ev.power === 'anchor' && s.stage === 'pit' && s.pit) {
        const by = /^(\S+) tried to push/.exec(String(ev.detail || ''));
        next.pit = { ...s.pit, pushFail: { by: by && by[1] !== name && s.players[by[1]] ? by[1] : null, target: name } };
        next.flash = { kind: 'pit', name, text: 'BOUNCES OFF!', i: idx };
      }
      break;
    }

    case 'lucky_save':
      next.flash = { kind: 'lucky', name: ev.name, why: ev.why || '', i: idx };
      if (s.stage === 'pit' && s.pit) next.pit = { ...moveOut(s.pit, [ev.name]), floated: [...s.pit.floated, ev.name] };
      break;

    case 'death':
      applyDeath(next, s, ev, idx);
      break;

    case 'stage_end': {
      const survivors = Array.isArray(ev.survivors) ? ev.survivors : aliveNames(s);
      next.stageSurvivors = survivors;
      next.flash = null;
      next.speech = [];
      next.acts = {};
      if ((ev.stage || s.stage) === 'bridge' && s.bridge) {
        next.bridge = { ...s.bridge, finished: true, line: survivors.slice(), stepping: {} };
      } else if ((ev.stage || s.stage) === 'crusher' && s.crusher) {
        next.crusher = { ...s.crusher, escaped: true, door: true };
      } else if ((ev.stage || s.stage) === 'pit' && s.pit) {
        // whoever is alive got out one way or another
        next.pit = { ...moveOut(s.pit, s.pit.down.filter((n) => s.players[n] && s.players[n].alive)), base: null };
      }
      break;
    }

    case 'game_end': {
      next.ended = true;
      next.stage = 'ended';
      next.phase = null;
      const places = Array.isArray(ev.places) ? ev.places : [];
      next.places = places;
      const players = { ...s.players };
      for (const p of places) {
        if (p && players[p.name] && typeof p.place === 'number') players[p.name] = { ...players[p.name], place: p.place };
      }
      next.players = players;
      const win = places.find((p) => p && p.place === 1);
      next.winner = win ? win.name : null;
      if (!next.winner) {
        const survivors = aliveNames(s);
        if (survivors.length === 1) next.winner = survivors[0];
      }
      break;
    }

    default:
      break; // unknown event types are ignored
  }

  const t = describeEvent(ev, next, s);
  if (t) {
    if (t.pub) next.caption = { text: t.pub, i: idx, kind: t.kind };
    const cutText = t.cut || t.pub;
    if (cutText) next.captionCut = { text: cutText, i: idx, kind: t.kind };
  }
  return next;
}

// ---------------------------------------------------------------- per-stage helpers (mutate `next` only)
function applyBridgeAction(next, s, name, verb, arg, ev, idx, d) {
  const b = { ...s.bridge };
  if (s.phase === 'crossing') {
    if (verb === 'step' && (arg === 'L' || arg === 'R')) {
      b.stepping = { ...b.stepping, [name]: { row: b.cur || (toNum(s.round) || 0), side: arg } };
    }
  } else if (!d.hasLineReveal && b.lineRound !== s.round) {
    // The real engine emits every waiting-room action in post-move line order.
    const roundIdx = findRoundStart(next);
    const arr = roundIdx >= 0 ? d.roundLine.get(roundIdx) : null;
    const aliveSet = new Set(aliveNames(s));
    if (arr && arr.length) {
      const rest = b.line.filter((n) => !arr.includes(n));
      b.line = [...arr, ...rest].filter((n) => aliveSet.has(n));
      b.lineRound = s.round;
    }
  }
  next.bridge = b;
}

// Index of the latest round_start at or before `idx` (stored on the state as we fold).
function findRoundStart(next) {
  return next.roundStartIdx == null ? -1 : next.roundStartIdx;
}

function applyCrusherAction(next, s, name, verb, arg) {
  const c = { ...s.crusher };
  const players = s.players;
  if (verb === 'hold_lever') {
    if (!c.holdChosen) {
      c.holder = name;
      c.holdChosen = true;
    }
    c.door = true;
  } else if (verb === 'push_lever' && arg && !c.holdChosen && !c.holder) {
    const t = players[arg];
    if (t && t.alive && t.power !== 'anchor') {
      c.holder = arg;
      c.door = true;
    }
  } else if (verb === 'jam_lever') {
    // takes effect on the matching ability_use event
  }
  next.crusher = c;
}

function applyDiscAction(next, s, name, verb, arg) {
  const dsc = { ...s.disc };
  if (verb === 'tile') {
    const k = toNum(arg);
    if (k != null && !dsc.tilesPublic) {
      dsc.tiles = { ...dsc.tiles, [name]: k };
    }
  }
  next.disc = dsc;
}

function applyReveal(next, s, ev, idx) {
  const data = ev.data;
  const what = ev.what;
  if (what === 'weak_pane' && s.bridge) {
    const row = toNum(data && data.row);
    const weak = data && (data.weak === 'L' || data.weak === 'R') ? data.weak : null;
    if (row != null && weak) {
      const b = { ...s.bridge, rows: { ...s.bridge.rows }, stepping: { ...s.bridge.stepping }, at: { ...s.bridge.at } };
      const by = Object.keys(b.stepping).find((n) => b.stepping[n].row === row && b.stepping[n].side === weak) || null;
      b.rows[row] = { weak, safe: other(weak), by };
      const front = b.line[0];
      if (front && s.players[front] && s.players[front].alive) b.at[front] = { row, side: other(weak) };
      b.stepping = {};
      next.bridge = b;
    }
  } else if (what === 'line' && s.bridge) {
    const arr = Array.isArray(data) ? data : data && Array.isArray(data.line) ? data.line : null;
    if (arr) {
      const aliveSet = new Set(aliveNames(s));
      next.bridge = { ...s.bridge, line: arr.filter((n) => aliveSet.has(n)) };
    }
  } else if (what === 'tiles' && s.disc) {
    const src = data && typeof data === 'object' ? (data.tiles && typeof data.tiles === 'object' ? data.tiles : data) : {};
    const tiles = {};
    for (const [k, v] of Object.entries(src)) {
      const kn = toNum(k);
      if (kn != null && typeof v === 'string') tiles[v] = kn;
      else if (typeof v === 'number' || (typeof v === 'string' && toNum(v) != null && s.players[k])) tiles[k] = toNum(v);
    }
    const open = toNum(data && data.openCount);
    next.disc = { ...s.disc, tiles: Object.keys(tiles).length ? tiles : s.disc.tiles, tilesPublic: true, openCount: open != null ? open : s.disc.openCount };
  } else if (what === 'trapdoors' && s.disc) {
    const list = Array.isArray(data) ? data : data && Array.isArray(data.open) ? data.open : [];
    next.disc = { ...s.disc, open: uniq([...s.disc.open, ...list.map(toNum).filter((v) => v != null)]), tilesPublic: true };
  } else if (what === 'ceiling' && s.crusher) {
    const h = toNum(data && typeof data === 'object' ? (data.ceiling != null ? data.ceiling : data.height) : data);
    // The engine names the lever holder and says whether the lever was jammed: trust it over our guess.
    const obj = data && typeof data === 'object' ? data : {};
    const holder = typeof obj.leverHolder === 'string' && s.players[obj.leverHolder] ? obj.leverHolder : s.crusher.holder;
    const jam = obj.jammed === true || s.crusher.jam;
    if (h != null || holder !== s.crusher.holder || jam !== s.crusher.jam) {
      next.crusher = {
        ...s.crusher,
        ceiling: h != null ? Math.max(0, Math.min(5, h)) : s.crusher.ceiling,
        holder,
        holdChosen: s.crusher.holdChosen || !!holder,
        jam,
        door: s.crusher.door || !!holder || jam,
      };
    }
  } else if (what === 'rope' && s.pit) {
    const by = oneName(data && data.by, s.players);
    if (by) {
      const cost = toNum(data.cost) || 1;
      next.pit = { ...s.pit, rope: { by, saved: oneName(data.saved, s.players), cost } };
      next.ropeCost = { ...s.ropeCost, [by]: (s.ropeCost[by] || 0) + cost };
      next.flash = { kind: 'pit', name: by, text: 'ROPE!', i: idx };
    }
  } else if (what === 'pit' && s.pit) {
    next.pit = foldPit(s, data);
    if (next.pit.baseNew) next.flash = { kind: 'pit', name: next.pit.base, text: next.pit.baseHow === 'pushed' ? 'SHOVED!' : 'STEP UP!', i: idx };
  } else if (what === 'footing' && s.ledge) {
    const src = data && typeof data === 'object' ? (data.footing && typeof data.footing === 'object' ? data.footing : data) : {};
    const footing = { ...s.ledge.footing };
    for (const [n, v] of Object.entries(src)) {
      const num = toNum(v);
      if (s.players[n] && num != null) footing[n] = num;
    }
    const shrinkIn = toNum(data && data.shrinkIn);
    const r = toNum(s.round) || 0;
    const shrank = r > 0 && (r % 2 === 0 || r >= 7);
    next.ledge = { ...s.ledge, footing, shrinkIn: shrinkIn != null ? shrinkIn : s.ledge.shrinkIn, shrunk: s.ledge.shrunk + (shrank ? 1 : 0) };
  }
  void idx;
}

// The pit reveal is the public view after a round; how the base was picked comes from the round's actions.
function foldPit(s, data) {
  const d = data && typeof data === 'object' ? data : {};
  const pit = s.pit;
  const pl = s.players;
  const base = oneName(d.base, pl);
  const lifted = arrNames(d.lifted, pl);
  const rescued = oneName(d.rescued, pl);
  const baseNew = !!base && base !== pit.base;
  const acts = Object.values(s.acts || {}).filter((a) => a && a.valid);
  const baseHow = !baseNew ? pit.baseHow : acts.some((a) => a.verb === 'push_base' && a.arg === base) && !acts.some((a) => a.verb === 'offer_back') ? 'pushed' : 'volunteer';
  // exit order: climbers, then the hauled-out base, then anyone else listed
  const out = [...pit.out];
  for (const n of [...lifted, ...(rescued ? [rescued] : []), ...arrNames(d.out, pl)]) if (!out.includes(n)) out.push(n);
  return {
    ...pit,
    total: toNum(s.roundsTotal) || pit.total,
    flood: toNum(d.flood) != null ? toNum(d.flood) : toNum(s.round) || pit.flood,
    base: base && !out.includes(base) ? base : null,
    baseHow: base ? baseHow : null,
    baseNew,
    down: arrNames(d.down, pl).filter((n) => !out.includes(n)),
    out,
    ropeUsed: d.ropeUsed === true || pit.ropeUsed,
    lifted,
    roped: oneName(d.roped, pl),
    rescued,
  };
}

function applyDeath(next, s, ev, idx) {
  const name = ev.name;
  const p = s.players[name];
  if (!p) return;
  const fate = { stage: ev.stage || s.stage, cause: ev.cause || null, style: ev.style || styleFor(ev.cause), i: idx };
  next.players = { ...s.players, [name]: { ...p, alive: false, fate, place: typeof ev.place === 'number' ? ev.place : p.place } };
  next.deaths = [...s.deaths, { name, stage: fate.stage, cause: fate.cause, style: fate.style, place: typeof ev.place === 'number' ? ev.place : null, i: idx }];
  next.flash = null;
  if (s.bridge) {
    const b = { ...s.bridge, line: s.bridge.line.filter((n) => n !== name), at: { ...s.bridge.at }, stepping: { ...s.bridge.stepping } };
    delete b.at[name];
    next.bridge = b;
  }
  if (s.crusher && fate.stage === 'crusher') {
    next.crusher = { ...s.crusher, crushed: true, deathsThisRound: s.crusher.deathsThisRound + 1 };
  }
  if (s.pit && fate.stage === 'pit') {
    next.pit = { ...s.pit, down: s.pit.down.filter((n) => n !== name), sunk: [...s.pit.sunk, name], base: s.pit.base === name ? null : s.pit.base };
  }
  if (s.disc && fate.style === 'chute') {
    const tile = s.disc.tiles[name];
    next.disc = { ...s.disc, open: tile != null ? uniq([...s.disc.open, tile]) : s.disc.open };
  }
}

function styleFor(cause) {
  return { glass: 'shatter', crusher: 'flatten', pit: 'sink', trapdoor: 'chute', ledge: 'tumble' }[cause] || 'shatter';
}

// ---------------------------------------------------------------- public API
export function stateAt(tape, i) {
  const events = Array.isArray(tape && tape.events) ? tape.events : [];
  const last = events.length - 1;
  const upto = Math.max(-1, Math.min(last, Number.isFinite(+i) ? Math.floor(+i) : -1));
  const d = derive(tape);
  let s = initial(tape);
  for (let k = 0; k <= upto; k++) {
    if (events[k] && events[k].type === 'round_start') s = { ...s, roundStartIdx: k };
    s = reduce(s, events[k], k, d);
  }
  return s;
}

// Scrubber markers: one per stage plus the result.
export function chapters(tape) {
  const out = [];
  const events = Array.isArray(tape && tape.events) ? tape.events : [];
  events.forEach((ev, idx) => {
    if (ev && ev.type === 'stage_start' && STAGES.includes(ev.stage)) out.push({ id: ev.stage, i: idx });
    else if (ev && ev.type === 'game_end') out.push({ id: 'results', i: idx });
  });
  if (events.length && (!out.length || out[0].i > 0)) out.unshift({ id: 'start', i: 0 });
  return out;
}

// Does stepping onto this event change anything the viewer can show?
export function isStepWorthy(ev, cut) {
  if (!ev) return false;
  switch (ev.type) {
    case 'thought':
    case 'whisper':
      return !!cut;
    case 'ability_use':
      return !!cut || ev.power === 'wedge' || ev.power === 'swap' || ev.power === 'feather';
    case 'action': {
      const { verb } = parseAction(ev.action);
      if (ev.valid === false) return !!cut;
      return !['hold', 'wait', 'stay', 'leave'].includes(verb) || ev.primary === true;
    }
    default:
      return true;
  }
}

// One pass over the tape: the description of every event (for the transcript).
export function timeline(tape) {
  const events = Array.isArray(tape && tape.events) ? tape.events : [];
  const d = derive(tape);
  let s = initial(tape);
  const lines = [];
  events.forEach((ev, idx) => {
    if (ev && ev.type === 'round_start') s = { ...s, roundStartIdx: idx };
    const prev = s;
    s = reduce(s, ev, idx, d);
    const t = ev ? describeEvent(ev, s, prev) : null;
    if (t && (t.pub || t.cut)) {
      lines.push({ i: idx, kind: t.kind, name: t.name || null, pub: t.pub || null, cut: t.cut || t.pub || null, style: t.style || null, stage: s.stage, round: s.round });
    }
  });
  return lines;
}
