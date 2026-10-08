// Pure text helpers: names, captions and one-line descriptions of tape events.
// describeEvent(ev, next, prev) -> { pub, cut, kind, name } | null
//   pub: text shown when Director's cut is OFF (null = secret, hidden)
//   cut: text shown when Director's cut is ON (falls back to pub)

export const STAGE_TITLES = {
  bridge: 'The Glass Bridge',
  crusher: 'The Crusher Room',
  disc: 'The Trapdoor Disc',
  ledge: 'The Final Ledge',
};

export const STAGE_SHORT = { bridge: 'Bridge', crusher: 'Crusher', disc: 'Disc', ledge: 'Ledge', results: 'Results', start: 'Start' };

export const POWER_NAMES = {
  glass_eye: 'Glass Eye',
  wedge: 'Wedge',
  map: 'Map',
  feather: 'Feather',
  swap: 'Swap',
  anchor: 'Anchor',
  forger: 'Forger',
  nothing: 'Nothing',
};

export const POWER_BLURBS = {
  glass_eye: 'Sees the safe pane in every bridge row.',
  wedge: 'Can jam the crusher lever open, once.',
  map: 'Knows the rules of all four stages in advance.',
  feather: 'Survives the first deadly fall.',
  swap: 'Can swap disc tiles with someone, once.',
  anchor: 'Starts the ledge with extra footing.',
  forger: 'Can fake one message from someone else.',
  nothing: 'No power at all.',
};

export function powerName(id) {
  return POWER_NAMES[id] || (id ? String(id).replace(/_/g, ' ') : 'Unknown');
}

export function modelParts(model) {
  const s = String(model || 'unknown');
  const k = s.indexOf('/');
  if (k < 0) return { vendor: '', name: s };
  return { vendor: s.slice(0, k), name: s.slice(k + 1) };
}

export function shortModel(model) {
  const { vendor, name } = modelParts(model);
  return vendor === 'scripted' ? `${name} bot` : name;
}

export function ordinal(n) {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return n == null ? '' : `${n}th`;
}

const hash = (str) => {
  let h = 0;
  for (let k = 0; k < str.length; k++) h = (h * 31 + str.charCodeAt(k)) >>> 0;
  return h;
};

const DEATH_LINES = {
  shatter: [
    (n) => `${n} went through the glass`,
    (n) => `${n} found the weak pane the hard way`,
    (n) => `${n} is now several hundred tiny cubes`,
  ],
  flatten: [
    (n) => `${n} got pressed flat as a sticker`,
    (n) => `${n} is now wafer thin`,
    (n) => `${n} was flattened like a pancake`,
  ],
  chute: [
    (n) => `${n} took the chute, confetti and all`,
    (n) => `${n} dropped out of the game, in style`,
    (n) => `${n} whooshed down the hatch`,
  ],
  tumble: [
    (n) => `${n} cartwheeled into the pit`,
    (n) => `${n} tumbled off the ledge`,
    (n) => `${n} took a long, slow bow into the pit`,
  ],
};

export const DEATH_ONOMATOPOEIA = { shatter: 'CRASH!', flatten: 'SPLAT!', chute: 'WHEEE!', tumble: 'BONK!' };

export function deathCaption(name, style, key = 0, place) {
  const list = DEATH_LINES[style] || [(n) => `${n} is out`];
  const base = list[hash(`${name}${key}`) % list.length](name);
  return place ? `${base} (${ordinal(place)} place)` : base;
}

const side = (s) => (s === 'L' ? 'left' : s === 'R' ? 'right' : String(s || '?'));
const q = (t) => `“${String(t == null ? '' : t)}”`;

export function roundLabel(stage, phase, round, total) {
  if (stage === 'bridge') {
    if (phase === 'crossing') return `Row ${round} of ${total || 8}`;
    return `Waiting room, round ${round} of ${total || 6}`;
  }
  if (stage === 'crusher') return `The ceiling lowers (round ${round} of ${total || 5})`;
  if (stage === 'disc') return phase === 'swap' ? 'Round 2: swap tiles or wait' : 'Round 1: pick a tile';
  if (stage === 'ledge') return `Ledge, round ${round}`;
  return round != null ? `Round ${round}` : '';
}

function actionText(ev, state) {
  const name = ev.name;
  const raw = String(ev.action == null ? '' : ev.action);
  const k = raw.indexOf(':');
  const verb = k < 0 ? raw : raw.slice(0, k);
  const arg = k < 0 ? null : raw.slice(k + 1);
  if (ev.valid === false) {
    return { pub: null, cut: `${name} tried "${raw}" (not allowed, default used)` };
  }
  switch (verb) {
    case 'volunteer':
      return { pub: `${name} volunteers for the front of the line` };
    case 'swap':
      return { pub: `${name} offers ${arg} a swap` };
    case 'step':
      return ev.auto
        ? { pub: `${name} steps onto the safe ${side(arg)} pane` }
        : { pub: `${name} steps onto the ${side(arg)} pane` };
    case 'hold_lever':
      return { pub: `${name} grabs the lever` };
    case 'push_lever':
      return { pub: `${name} shoves ${arg} toward the lever` };
    case 'jam_lever':
      return { pub: null, cut: `${name} jams the lever` };
    case 'tile':
      return { pub: `${name} picks tile ${arg}` };
    case 'swap_tile':
      return { pub: null, cut: `${name} swaps tiles with ${arg}` };
    case 'shove':
      return { pub: `${name} shoves ${arg}` };
    case 'brace':
      return { pub: `${name} braces` };
    case 'dodge':
      return { pub: `${name} dodges` };
    case 'hold':
    case 'wait':
    case 'stay':
      return { pub: null, cut: null };
    default:
      void state;
      return { pub: `${name}: ${raw}` };
  }
}

export function describeEvent(ev, next, prev) {
  if (!ev || !ev.type) return null;
  const players = (next && next.players) || {};
  switch (ev.type) {
    case 'game_start': {
      const n = Array.isArray(ev.players) ? ev.players.length : Object.keys(players).length;
      return { pub: `${n} contestants walk on. Four obstacles. Three prizes. Nobody shares.`, kind: 'stage' };
    }
    case 'stage_start': {
      const title = STAGE_TITLES[ev.stage] || ev.stage;
      return { pub: ev.note ? (String(ev.note).toLowerCase().includes(title.toLowerCase().replace(/^the /, '')) ? ev.note : `${title}: ${ev.note}`) : title, kind: 'stage' };
    }
    case 'round_start':
      return { pub: roundLabel(ev.stage || (next && next.stage), ev.phase, ev.round, ev.roundsTotal), kind: 'round' };
    case 'thought':
      return { pub: null, cut: `${ev.name} thinks: ${q(ev.text)}`, kind: 'thought', name: ev.name };
    case 'say':
      return {
        pub: `${ev.forgedAs || ev.name}: ${q(ev.text)}`,
        cut: ev.forgedAs ? `${ev.forgedAs}: ${q(ev.text)} (forged by ${ev.name})` : undefined,
        kind: 'say',
        name: ev.forgedAs || ev.name,
      };
    case 'whisper':
      return { pub: null, cut: `${ev.forgedAs || ev.from} whispers to ${ev.to}: ${q(ev.text)}${ev.forgedAs ? ` (forged by ${ev.from})` : ''}`, kind: 'whisper', name: ev.from };
    case 'action': {
      const t = actionText(ev, prev);
      if (!t.pub && !t.cut) return null;
      return { pub: t.pub || null, cut: t.cut || t.pub, kind: 'action', name: ev.name };
    }
    case 'reveal': {
      const d = ev.data;
      switch (ev.what) {
        case 'weak_pane':
          return d && d.row != null ? { pub: `Row ${d.row}: the ${side(d.weak)} pane was the weak one.`, kind: 'reveal' } : null;
        case 'tiles': {
          const src = d && typeof d === 'object' ? (d.tiles && typeof d.tiles === 'object' ? d.tiles : d) : {};
          const parts = Object.keys(src)
            .filter((k) => typeof src[k] === 'string')
            .sort((a, b) => a - b)
            .map((k) => `${k} ${src[k]}`);
          return parts.length ? { pub: `Tiles are set: ${parts.join(', ')}.`, kind: 'reveal' } : null;
        }
        case 'trapdoors': {
          const list = Array.isArray(d) ? d : d && Array.isArray(d.open) ? d.open : [];
          return { pub: list.length ? `Trapdoors open on tile${list.length > 1 ? 's' : ''} ${list.join(' and ')}.` : 'No trapdoors open.', kind: 'reveal' };
        }
        case 'ceiling': {
          const h = d && typeof d === 'object' ? (d.ceiling != null ? d.ceiling : d.height) : d;
          return h != null ? { pub: `The ceiling is down to notch ${h} of 5.`, kind: 'reveal' } : null;
        }
        case 'footing': {
          const src = d && typeof d === 'object' ? (d.footing && typeof d.footing === 'object' ? d.footing : d) : {};
          const parts = Object.keys(src)
            .filter((n) => players[n] && players[n].alive && typeof src[n] === 'number')
            .map((n) => `${n} ${src[n]}`);
          return parts.length ? { pub: `Footing: ${parts.join(', ')}.`, kind: 'reveal' } : null;
        }
        default:
          return null;
      }
    }
    case 'ability_use': {
      const pName = powerName(ev.power);
      const detail = ev.detail ? ` ${ev.detail}.` : '';
      const cut = `${ev.name} uses ${pName}.${detail}`.replace('..', '.');
      let pub = null;
      if (ev.power === 'wedge') pub = 'The lever jams open. Nobody gets crushed!';
      else if (ev.power === 'swap') pub = 'Two players trade tiles.';
      else if (ev.power === 'feather') pub = `${ev.name} should have fallen, but bounces right back!`;
      return { pub, cut, kind: 'ability', name: ev.name };
    }
    case 'lucky_save':
      return { pub: `${ev.name} gets a lucky break: ${ev.why || 'the dice say so'}.`, kind: 'lucky', name: ev.name };
    case 'death': {
      const style = ev.style || 'shatter';
      return { pub: deathCaption(ev.name, style, ev.i || 0, typeof ev.place === 'number' ? ev.place : null), kind: 'death', name: ev.name, style };
    }
    case 'stage_end': {
      const title = STAGE_TITLES[ev.stage] || ev.stage;
      const n = Array.isArray(ev.survivors) ? ev.survivors.length : null;
      return { pub: n == null ? `${title} cleared.` : `${title} cleared. ${n} left.`, kind: 'stage' };
    }
    case 'game_end': {
      const places = Array.isArray(ev.places) ? ev.places.filter((p) => p && typeof p.place === 'number').sort((a, b) => a.place - b.place) : [];
      if (!places.length) return { pub: 'The game is over.', kind: 'end' };
      const [first] = places;
      return { pub: `${first.name} wins! ${places.map((p) => `${ordinal(p.place)} ${p.name}`).join(', ')}.`, kind: 'end' };
    }
    default:
      return null;
  }
}
