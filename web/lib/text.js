// Pure text helpers: names, captions and one-line descriptions of tape events.
// describeEvent(ev, next, prev) -> { pub, cut, kind, name } | null
//   pub: text shown when Director's cut is OFF (null = secret, hidden)
//   cut: text shown when Director's cut is ON (falls back to pub)

export const STAGE_TITLES = {
  bridge: 'The Glass Bridge',
  crusher: 'The Crusher Room',
  pit: 'The Pit',
  disc: 'The Trapdoor Disc',
  ledge: 'The Final Ledge',
  chalk: 'The Chalk Wall',
  opening: 'Meet the Contestants',
  pacts: 'Pact Time',
  lever: 'The Lever',
  cups: 'Poison Cups',
  jackets: 'Life Jackets',
  bomb: 'The Bomb',
  vault: 'The Vault',
};

export const STAGE_SHORT = { bridge: 'Bridge', crusher: 'Crusher', pit: 'Pit', disc: 'Disc', ledge: 'Ledge', chalk: 'Chalk', lever: 'Lever', cups: 'Cups', jackets: 'Jackets', bomb: 'Bomb', vault: 'Vault', results: 'Results', start: 'Start' };

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
  map: 'Knows the rules of every stage in advance.',
  feather: 'Survives the first deadly fall.',
  swap: 'Can swap disc tiles with someone, once.',
  anchor: 'Starts the ledge with extra footing.',
  forger: 'Can fake one message from someone else.',
  nothing: 'No power at all.',
};

// Bubbles show at most this many characters; the transcript and caption keep the full line.
export const BUBBLE_CAP = 140;
export function capText(text, max = BUBBLE_CAP) {
  const t = String(text == null ? '' : text).replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const sp = cut.lastIndexOf(' ');
  return `${(sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,;:.!?-]+$/, '')}\u2026`;
}

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

// Who left a note on the wall in an earlier game: only the place is known, never the player.
export const chalkBy = (place) => (place ? `by a ${ordinal(place)}-place finisher` : 'by an earlier finisher');

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
  sink: [
    (n) => `${n} was left in the pit`,
    (n) => `${n} was left in the pit to think it over`,
    (n) => `${n} was left in the pit, glub glub`,
  ],
  tumble: [
    (n) => `${n} cartwheeled into the dark`,
    (n) => `${n} tumbled off the ledge`,
    (n) => `${n} took a long, slow bow into the dark`,
  ],
  poison: [
    (n) => `${n} drank the wrong cup`,
    (n) => `${n} finished the drink and the game`,
    (n) => `${n} should have checked the cup`,
  ],
  drown: [
    (n) => `${n} went down with the ship`,
    (n) => `${n} sank without a jacket`,
    (n) => `${n} was left in the water`,
  ],
  blast: [
    (n) => `${n} was holding the bomb at the wrong second`,
    (n) => `${n} went up with the bomb`,
    (n) => `${n} caught the bomb, and the blast`,
  ],
  vault: [
    (n) => `${n} dropped through the vault floor`,
    (n) => `${n} lost the vault, and everything else`,
    (n) => `${n} fell for the split`,
  ],
};

export const DEATH_ONOMATOPOEIA = { shatter: 'CRASH!', flatten: 'SPLAT!', chute: 'WHEEE!', tumble: 'BONK!', sink: 'GLUB!', poison: 'GULP!', drown: 'GLUB!', blast: 'BOOM!', vault: 'CLANG!' };

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
  if (stage === 'pit') return `The water rises (round ${round} of ${total || 5})`;
  if (stage === 'disc') return phase === 'swap' ? 'Round 2: swap tiles or wait' : 'Round 1: pick a tile';
  if (stage === 'ledge') return `Ledge, round ${round}`;
  if (stage === 'chalk') return 'Epilogue: a message for the next contestants';
  if (stage === 'opening' || stage === 'pacts') return null;
  if (stage === 'lever') return round === total ? `Last round: someone must take the lever` : `The ceiling drops (round ${round} of ${total || 3})`;
  if (stage === 'cups') return phase === 'pour' ? 'The pourer chooses a cup' : 'Swap cups, or drink';
  if (stage === 'jackets') return `Night ${round} of ${total || 3}`;
  if (stage === 'bomb') return `Pass ${round}`;
  if (stage === 'vault') return phase === 'choose' ? 'Split or steal?' : `The others talk (round ${round} of ${total || 2})`;
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
  const stage = ev.stage || (state && state.stage);
  if (stage === 'cups' && verb === 'swap') return { pub: null, cut: `${name} reaches for ${arg}'s cup` };
  if (stage === 'jackets' && verb === 'steal') return { pub: null, cut: `${name} creeps toward ${arg}'s jacket` };
  if (stage === 'jackets' && verb === 'guard') return { pub: null, cut: `${name} stays awake to guard their jacket` };
  if (stage === 'vault' && (verb === 'split' || verb === 'steal')) return { pub: null, cut: `${name} picks ${verb.toUpperCase()}` };
  switch (verb) {
    case 'offer_pact':
      return { pub: `${name} offers ${arg} a pact` };
    case 'accept_pact':
    case 'break_pact':
    case 'speak':
    case 'drink':
    case 'sleep':
    case 'pass':
      return { pub: null, cut: null }; // their own events say what happened
    case 'volunteer':
      return { pub: `${name} volunteers for the front of the line` };
    case 'swap':
      return { pub: `${name} offers ${arg} a swap` };
    case 'step':
      return ev.auto
        ? { pub: `${name} steps onto the safe ${side(arg)} pane` }
        : { pub: `${name} steps onto the ${side(arg)} pane` };
    case 'write':
      return { pub: null, cut: `${name} reaches for the chalk` }; // the chalk_write line says what was written
    case 'skip':
      return { pub: `${name} leaves the wall blank` };
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
    case 'offer_back':
      return { pub: `${name} offers to be the step` };
    case 'climb':
      return { pub: `${name} tries to climb out` };
    case 'push_base':
      return { pub: `${name} tries to shove ${arg} down as the step` };
    case 'reach_down':
      return { pub: `${name} reaches down with the rope` };
    case 'hold':
    case 'wait':
    case 'leave':
    case 'stay':
      return { pub: null, cut: null };
    default:
      void state;
      return { pub: `${name}: ${raw}` };
  }
}

const joinNames = (list) => (list.length < 2 ? list.join('') : `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`);

function luckyText(ev) {
  const why = String(ev.why || '');
  if (/^won the photo finish/.test(why)) return `${ev.name} ${why.replace('shoves landed', 'shoves')}.`;
  if (why === 'a last toe-hold') return `${ev.name} hangs on with a last toe-hold.`;
  if (why === 'a plank floats by') return `A plank floats by, and ${ev.name} climbs onto it.`;
  return `${ev.name} gets a lucky break: ${why || 'the dice say so'}.`;
}

// One pit round resolved: who became the step (and how), who climbed out, and the water level.
function describePit(d, next) {
  const p = next.pit || {};
  const lifted = Array.isArray(d.lifted) ? d.lifted : [];
  const parts = [];
  if (p.baseNew && d.base) parts.push(p.baseHow === 'pushed' ? `${d.base} is shoved down as the step.` : `${d.base} volunteers to be the step.`);
  if (lifted.length) parts.push(`${joinNames(lifted)} climb${lifted.length === 1 ? 's' : ''} out over ${d.base || 'the step'}.`);
  else if (!d.roped && !p.baseNew) parts.push(d.base ? 'Nobody climbs out this round.' : 'Nobody has a step to climb on.');
  if (d.roped && d.rescued) parts.push(`${d.rescued} is out. The rope is gone.`);
  if (Number.isFinite(d.flood)) parts.push(`Water level ${d.flood} of ${p.total || 5}.`);
  return { pub: parts.join(' '), kind: 'reveal' };
}

export function describeEvent(ev, next, prev) {
  if (!ev || !ev.type) return null;
  const players = (next && next.players) || {};
  switch (ev.type) {
    case 'game_start': {
      const n = Array.isArray(ev.players) ? ev.players.length : Object.keys(players).length;
      if (next && next.rules >= 6) return { pub: `${n} contestants walk on. Only three walk out.`, kind: 'stage' };
      const count = next && next.rules >= 3 ? 'Five' : 'Four';
      return { pub: `${n} contestants walk on. ${count} obstacles. Three prizes. Nobody shares.`, kind: 'stage' };
    }
    case 'stage_start': {
      const title = STAGE_TITLES[ev.stage] || ev.stage;
      if (ev.stage === 'pacts') return { pub: 'Pact time. Who do you trust now?', kind: 'stage' };
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
        case 'rope': {
          if (!d || !d.by) return null;
          return { pub: `The rope: ${d.by} hauls ${d.saved || 'the step'} out of the pit. ${d.by}'s hands are burned (-${d.cost || 1} footing later).`, kind: 'reveal' };
        }
        case 'pit':
          return d && typeof d === 'object' ? describePit(d, next, prev) : null;
        case 'lever': {
          if (!d || !d.holder) return { pub: 'Nobody takes the lever. The ceiling keeps coming.', kind: 'reveal' };
          const pushers = d.pushes && Array.isArray(d.pushes[d.holder]) ? d.pushes[d.holder] : [];
          const volunteered = Array.isArray(d.volunteers) && d.volunteers.includes(d.holder);
          return { pub: volunteered ? `${d.holder} takes the lever. Everyone else lives.` : `${joinNames(pushers)} shove${pushers.length === 1 ? 's' : ''} ${d.holder} onto the lever.`, kind: 'reveal' };
        }
        case 'pourer':
          return d && d.pourer ? { pub: `${d.pourer} pours the drinks. One cup is poison, and only ${d.pourer} knows which.`, kind: 'reveal' } : null;
        case 'cups': {
          if (!d || !d.victim) return null;
          if (d.victim === d.poisoned) return { pub: `The poison was in ${d.victim}'s cup all along.`, kind: 'reveal' };
          return { pub: `The poison was poured for ${d.poisoned}. After the swaps, ${d.victim} is holding it.`, kind: 'reveal' };
        }
        case 'jackets': {
          if (!d) return null;
          const t = d.theft;
          if (!d.night) return d.without ? { pub: `${d.without} has no life jacket.`, kind: 'reveal' } : null;
          if (t && t.guarded) return { pub: `Night ${d.night}: ${t.thief} reaches for ${t.victim}'s jacket, but ${t.victim} is awake.`, kind: 'reveal' };
          if (t) return { pub: `Night ${d.night}: ${t.thief} steals ${t.victim}'s jacket in the dark!`, kind: 'reveal' };
          return { pub: `Night ${d.night}: nobody steals. ${d.without} still has no jacket.`, kind: 'reveal' };
        }
        case 'bomb':
          if (d && d.exploded) return { pub: `BOOM. ${d.passedBy ? `${d.passedBy} passed it, and the` : 'The'} bomb goes off on ${d.exploded}.`, kind: 'reveal' };
          return d && d.holder ? { pub: `${d.holder} starts with the bomb. Only the holder sees the timer.`, kind: 'reveal' } : null;
        case 'vault_pair': {
          const pair = d && Array.isArray(d.pair) ? d.pair : [];
          if (pair.length < 2) return null;
          const why = d.why === 'revenge' ? ` ${pair[1]} hurt ${pair[0]} earlier.` : d.why === 'most_blood' ? ` ${pair[0]} has the most blood on their hands.` : '';
          return { pub: `${pair[0]} and ${pair[1]} face off at the vault.${why}`, kind: 'reveal' };
        }
        case 'vault': {
          const c = d && d.choices && typeof d.choices === 'object' ? d.choices : {};
          const names = Object.keys(c);
          if (names.length !== 2) return null;
          const stealers = names.filter((n) => c[n] === 'steal');
          if (!stealers.length) return { pub: 'Both split. Both walk away.', kind: 'reveal' };
          if (stealers.length === 2) return { pub: 'Both steal. The vault takes them both.', kind: 'reveal' };
          return { pub: `${stealers[0]} steals. ${names.find((n) => n !== stealers[0])} trusted them.`, kind: 'reveal' };
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
      else if (ev.power === 'feather') pub = ev.stage === 'pit' ? `${ev.name} should have gone under, but floats right out of the pit!` : `${ev.name} should have fallen, but bounces right back!`;
      else if (ev.power === 'anchor' && ev.stage === 'pit') {
        const by = next && next.pit && next.pit.pushFail && next.pit.pushFail.by;
        pub = `${by ? `${by} tried to push ${ev.name} down as the step, but ${ev.name}` : ev.name} would not budge.`;
      }
      return { pub, cut, kind: 'ability', name: ev.name };
    }
    case 'lucky_save':
      return { pub: luckyText(ev), kind: 'lucky', name: ev.name };
    case 'intro_motive':
      return typeof ev.text === 'string' && ev.text.trim() ? { pub: `${ev.name}: ${q(ev.text.trim())}`, kind: 'say', name: ev.name } : null;
    case 'last_words':
      return typeof ev.text === 'string' && ev.text.trim() ? { pub: `${ev.name}'s last words: ${q(ev.text.trim())}`, kind: 'say', name: ev.name } : null;
    case 'pact_formed': {
      const m = Array.isArray(ev.members) ? ev.members : [];
      return m.length === 2 ? { pub: `${m[0]} and ${m[1]} shake on a pact.`, kind: 'pact' } : null;
    }
    case 'pact_broken': {
      const m = Array.isArray(ev.members) ? ev.members : [];
      const other = m.find((n) => n !== ev.by);
      if (!ev.by || !other) return null;
      return { pub: ev.reason === 'explicit' ? `${ev.by} breaks the pact with ${other}.` : `${ev.by} betrayed a partner. The pact with ${other} is over.`, kind: 'pact', name: ev.by };
    }
    case 'grudge':
      return { pub: null, cut: `${ev.victim} has a score to settle with ${ev.by}.`, kind: 'pact', name: ev.victim };
    case 'cup_poured':
      return { pub: null, cut: `${ev.name} secretly poisons ${ev.target}'s cup.`, kind: 'secret', name: ev.name };
    case 'cup_swap':
      return { pub: `${ev.name} swaps cups with ${ev.with}.`, kind: 'action', name: ev.name };
    case 'bomb_pass':
      return { pub: `${ev.from} passes the bomb to ${ev.to}.`, kind: 'action', name: ev.from };
    case 'death': {
      const style = ev.style || 'shatter';
      return { pub: deathCaption(ev.name, style, ev.i || 0, typeof ev.place === 'number' ? ev.place : null), kind: 'death', name: ev.name, style };
    }
    case 'chalk_read': {
      const notes = Array.isArray(ev.notes) ? ev.notes.filter((n) => n && typeof n.text === 'string' && n.text.trim()) : [];
      if (!notes.length) return null;
      const parts = notes.map((n) => `\u201c${n.text.trim()}\u201d (${Number.isInteger(n.byPlace) ? `${ordinal(n.byPlace)} place` : 'earlier finisher'})`);
      return { pub: `What the wall says: ${parts.join(', ')}.`, kind: 'chalk' };
    }
    case 'chalk_write':
      return typeof ev.text === 'string' && ev.text.trim() ? { pub: `${ev.name} scratches a message for the next contestants: \u201c${ev.text.trim()}\u201d`, kind: 'chalk', name: ev.name } : null;
    case 'stage_end': {
      if (ev.stage === 'chalk') return { pub: 'The wall is done.', kind: 'stage' };
      if (ev.stage === 'opening' || ev.stage === 'pacts') return null;
      const title = STAGE_TITLES[ev.stage] || ev.stage;
      const n = Array.isArray(ev.survivors) ? ev.survivors.length : null;
      return { pub: n == null ? `${title} cleared.` : `${title} cleared. ${n} left.`, kind: 'stage' };
    }
    case 'game_end': {
      const places = Array.isArray(ev.places) ? ev.places.filter((p) => p && typeof p.place === 'number').sort((a, b) => a.place - b.place) : [];
      if (!places.length) return { pub: 'The game is over.', kind: 'end' };
      const firsts = places.filter((p) => p.place === 1);
      if (firsts.length > 1) return { pub: `${joinNames(firsts.map((p) => p.name))} are the last three.`, kind: 'end' };
      const [first] = places;
      return { pub: `${first.name} wins! ${places.map((p) => `${ordinal(p.place)} ${p.name}`).join(', ')}.`, kind: 'end' };
    }
    default:
      return null;
  }
}
