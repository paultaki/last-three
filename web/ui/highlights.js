// Auto-detected moments for a tape, as jump buttons. Pure detection (highlights) plus a tiny renderer.
// `pub` is the label with Director's cut off: it never names a power or says who forged a message.
import { powerName, capText } from '../lib/text.js';

const MAX = 8;

export function highlights(tape) {
  const events = Array.isArray(tape && tape.events) ? tape.events : [];
  const found = [];
  const add = (i, rank, pub, cut) => found.push({ i, rank, pub, cut: cut || pub });
  const deaths = events.filter((e) => e && e.type === 'death');
  const roundOf = (e) => (e && e.round != null ? e.round : -1);

  if (deaths[0]) {
    const d = deaths[0];
    add(d.i, 1, d.cause === 'glass' ? `${d.name} falls first` : `${d.name} is out first`);
  }
  const discDeath = deaths.find((d) => d.stage === 'disc');
  if (discDeath) add(discDeath.i, 5, 'The trapdoors open');

  let forged = 0;
  let lucky = 0;
  let shoves = 0;
  let pitLeft = 0;
  let pitBase = null;
  let pitActs = [];
  events.forEach((e, k) => {
    if (!e) return;
    const i = Number.isFinite(e.i) ? e.i : k;
    if (e.type === 'round_start' && e.stage === 'pit') pitActs = [];
    if (e.type === 'action' && e.stage === 'pit' && e.valid !== false) pitActs.push(String(e.action));
    if (e.type === 'reveal' && e.what === 'pit' && e.data && typeof e.data === 'object') {
      const base = typeof e.data.base === 'string' ? e.data.base : null;
      if (base && base !== pitBase) {
        const pushed = !pitActs.includes('offer_back') && pitActs.includes(`push_base:${base}`);
        add(i, 3, pushed ? `${base} is shoved down as the step` : `${base} volunteers to be the step`);
      }
      pitBase = base;
    } else if (e.type === 'reveal' && e.what === 'rope' && e.data && e.data.by) {
      add(i, 2, `The rope: ${e.data.by} hauls ${e.data.saved || 'the step'} out`);
    } else if (e.type === 'death' && e.stage === 'pit' && pitLeft < 1) {
      pitLeft++;
      add(i, 3, `${e.name} is left in the pit`);
    } else if (e.type === 'lucky_save' && /^won the photo finish/.test(String(e.why))) {
      const what = /footing/.test(e.why) ? 'footing' : 'shoves';
      add(i, 2, `Photo finish on ${what}`, `${e.name} wins a photo finish on ${what}${what === 'shoves' ? ' landed' : ''}`);
    } else if ((e.type === 'say' || e.type === 'whisper') && e.forgedAs && forged < 2) {
      forged++;
      add(i, 2, 'Someone faked a message', `${e.name || e.from} forged a message as ${e.forgedAs}`);
    } else if (e.type === 'ability_use' && e.power === 'feather') {
      add(i, 3, `${e.name} survives a deadly drop`, `${e.name}'s ${powerName('feather')} saves them`);
    } else if (e.type === 'ability_use' && e.power === 'wedge') {
      add(i, 3, 'The lever is jammed open', `${e.name} jams the lever (${powerName('wedge')})`);
    } else if (e.type === 'action' && e.valid !== false && String(e.action) === 'hold_lever') {
      const died = deaths.some((d) => d.stage === 'crusher' && d.name === e.name);
      if (died) add(i, 3, `${e.name} sacrifices at the lever`);
      else if (!events.some((x) => x && x.type === 'ability_use' && x.power === 'wedge' && x.stage === 'crusher')) add(i, 4, `${e.name} holds the lever`);
    } else if (e.type === 'action' && e.valid !== false && String(e.action).startsWith('shove:') && shoves < 2) {
      const target = String(e.action).slice(6);
      const fell = deaths.find((d) => d.stage === 'ledge' && d.name === target && roundOf(d) >= roundOf(e) && roundOf(d) <= roundOf(e) + 1);
      if (fell) {
        shoves++;
        add(i, 3, `${e.name} shoves ${target} off the ledge`);
      }
    } else if (e.type === 'lucky_save' && e.stage !== 'pit' && lucky < 1) {
      lucky++;
      add(i, 4, `${e.name} hangs on by a toe-hold`);
    }
  });

  const picked = found.sort((a, b) => a.rank - b.rank || a.i - b.i).slice(0, MAX);
  // the chalk wall (rules v4): notes are public, so these labels are the same with the cut on
  const quote = (t) => `\u201c${capText(t, 24)}\u201d`;
  const chalk = [];
  const read = events.find((e) => e && e.type === 'chalk_read' && Array.isArray(e.notes) && e.notes.some((n) => n && typeof n.text === 'string' && n.text.trim()));
  if (read) {
    const notes = read.notes.filter((n) => n && typeof n.text === 'string' && n.text.trim());
    const rd = `The wall already says: ${quote(notes[0].text)}${notes.length > 1 ? ` (+${notes.length - 1} more)` : ''}`;
    chalk.push({ i: Number.isFinite(read.i) ? read.i : events.indexOf(read), pub: rd, cut: rd });
  }
  events.forEach((e, k) => {
    if (e && e.type === 'chalk_write' && typeof e.text === 'string' && e.text.trim() && e.name) {
      const lm = `${e.name} left a message: ${quote(e.text)}`;
      chalk.push({ i: Number.isFinite(e.i) ? e.i : k, pub: lm, cut: lm });
    }
  });
  return [...picked, ...chalk].sort((a, b) => a.i - b.i);
}

export class Highlights {
  constructor(root, onJump) {
    this.root = root;
    this.onJump = onJump;
    this.items = [];
  }

  setTape(tape) {
    this.items = highlights(tape);
    this.render(false);
  }

  render(cut) {
    this.root.replaceChildren();
    this.root.hidden = this.items.length === 0;
    if (!this.items.length) return;
    const label = document.createElement('span');
    label.className = 'hl-label';
    label.textContent = 'Highlights';
    this.root.append(label);
    for (const it of this.items) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chapter hl';
      btn.textContent = cut ? it.cut : it.pub;
      btn.setAttribute('aria-label', `Jump to: ${btn.textContent}`);
      btn.addEventListener('click', () => this.onJump(it.i));
      this.root.append(btn);
    }
  }
}
