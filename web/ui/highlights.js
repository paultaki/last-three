// Auto-detected moments for a tape, as jump buttons. Pure detection (highlights) plus a tiny renderer.
// `pub` is the label with Director's cut off: it never names a power or says who forged a message.
import { powerName } from '../lib/text.js';

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
  events.forEach((e, k) => {
    if (!e) return;
    const i = Number.isFinite(e.i) ? e.i : k;
    if ((e.type === 'say' || e.type === 'whisper') && e.forgedAs && forged < 2) {
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
    } else if (e.type === 'lucky_save' && lucky < 1) {
      lucky++;
      add(i, 4, `${e.name} hangs on by a toe-hold`);
    }
  });

  const picked = found.sort((a, b) => a.rank - b.rank || a.i - b.i).slice(0, MAX);
  return picked.sort((a, b) => a.i - b.i);
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
