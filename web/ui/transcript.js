// The transcript: real, clickable text for every event up to the current index.
import { timeline } from '../lib/state.js';

const upperBound = (arr, idx) => {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid].i <= idx) lo = mid + 1;
    else hi = mid;
  }
  return lo;
};

export class Transcript {
  constructor(list, scroller, onJump) {
    this.list = list;
    this.scroller = scroller;
    this.onJump = onJump;
    this.lines = [];
    this.pub = [];
    this.cutLines = [];
    this.count = 0;
    this.cut = false;
    this.seat = {};
    list.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-i]');
      if (btn) this.onJump(Number(btn.dataset.i));
    });
  }

  setTape(tape) {
    this.lines = timeline(tape);
    this.pub = this.lines.filter((l) => l.pub);
    this.cutLines = this.lines.filter((l) => l.cut);
    this.seat = {};
    (tape.players || []).forEach((p, k) => (this.seat[p.name] = k % 8));
    this.list.replaceChildren();
    this.count = 0;
  }

  build(line, cut) {
    const li = document.createElement('li');
    li.className = `tl tl-${line.kind}`;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.i = String(line.i);
    const text = cut ? line.cut : line.pub;
    if (line.name != null && this.seat[line.name] != null && ['say', 'thought', 'whisper', 'action', 'death', 'ability', 'lucky', 'chalk'].includes(line.kind)) {
      const chip = document.createElement('span');
      chip.className = 'tl-chip';
      chip.style.setProperty('--c', `var(--seat-${this.seat[line.name]})`);
      chip.setAttribute('aria-hidden', 'true');
      chip.textContent = line.name.slice(0, 1);
      btn.append(chip);
    }
    const span = document.createElement('span');
    span.className = 'tl-text';
    span.textContent = text;
    btn.append(span);
    if (line.kind === 'death' && line.style) li.dataset.style = line.style;
    li.append(btn);
    return li;
  }

  update(index, cut) {
    const list = cut ? this.cutLines : this.pub;
    const k = upperBound(list, index);
    if (cut !== this.cut) {
      this.list.replaceChildren();
      this.count = 0;
      this.cut = cut;
    }
    const before = this.count;
    if (k > this.count) {
      const frag = document.createDocumentFragment();
      for (let n = this.count; n < k; n++) frag.append(this.build(list[n], cut));
      this.list.append(frag);
    } else if (k < this.count) {
      for (let n = this.count; n > k; n--) this.list.lastElementChild.remove();
    }
    this.count = k;
    for (const li of this.list.querySelectorAll('[aria-current]')) li.removeAttribute('aria-current');
    const last = this.list.lastElementChild;
    if (last) last.setAttribute('aria-current', 'step');
    if (k !== before || before === 0) this.scroller.scrollTop = this.scroller.scrollHeight;
  }
}
