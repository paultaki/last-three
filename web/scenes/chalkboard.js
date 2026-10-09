// The chalkboard prop: a slate with wood frame and handwritten notes, shared by the lobby, the
// waiting room and the epilogue. Note text only ever goes in through textContent (it is text from
// models and earlier games, never markup). Font size shrinks (never under 14px) until everything
// fits; only if that is not enough are the notes shortened (the transcript keeps the full text).
import { h } from './common.js';
import { capText } from '../lib/text.js';

const SIZES = [26, 24, 22, 20, 18, 17, 16, 15, 14];

export class Board {
  // bySlot: epilogue layout, where a note's place (1st, 2nd, 3rd) decides where it sits
  constructor({ bySlot = false } = {}) {
    this.el = h('div', `chalk-board${bySlot ? ' by-slot' : ''}`);
    this.el.hidden = true;
    this.el.setAttribute('aria-hidden', 'true');
    this.box = h('div', 'chalk-notes');
    this.el.append(this.box);
    this.recs = new Map(); // key -> { node, typed, rest, full, text, timer }
  }

  // Put the board in a rectangle of the arena (percentages) and show or hide it.
  setRect(r) {
    this.el.hidden = !r;
    if (!r) return;
    Object.assign(this.el.style, { left: `${r.x}%`, top: `${r.y}%`, width: `${r.w}%`, height: `${r.h}%` });
  }

  // notes: [{ key, text, tag, place, seat, current }]. typeKey: the note to scratch in now (if any).
  set(notes, { typeKey = null, perChar = 28, hint = 'THE CHALK WALL' } = {}) {
    const live = new Set(notes.map((n) => n.key));
    for (const [key, rec] of this.recs) {
      if (!live.has(key)) {
        clearTimeout(rec.timer);
        rec.node.remove();
        this.recs.delete(key);
      }
    }
    const fresh = [];
    for (const n of notes) {
      let rec = this.recs.get(n.key);
      if (!rec) {
        rec = this.build(n);
        this.recs.set(n.key, rec);
        this.box.append(rec.node);
        fresh.push(rec);
      }
      rec.node.classList.toggle('current', !!n.current);
      if (rec.timer && n.key !== typeKey) this.finish(rec); // another line took over, or the viewer jumped
    }
    this.el.classList.toggle('blank', notes.length === 0);
    this.el.dataset.hint = hint;
    this.box.style.setProperty('--n', String(Math.max(1, notes.length)));
    this.fit();
    for (const rec of fresh) if (rec.key === typeKey) this.type(rec, perChar);
  }

  build(n) {
    const node = h('figure', 'chalk-note');
    node.dataset.place = String(n.place || 0);
    if (n.seat != null) node.style.setProperty('--c', `var(--seat-${n.seat % 8})`);
    node.style.setProperty('--rot', `${[-0.9, 0.7, -0.5][this.recs.size % 3]}deg`);
    const p = h('p', 'chalk-text');
    const typed = h('span', 'ct-typed', n.text);
    const rest = h('span', 'ct-rest', '');
    p.append(typed, rest);
    const by = h('figcaption', 'chalk-by');
    if (n.seat != null) by.append(h('i', 'chalk-dot'));
    by.append(document.createTextNode(n.tag || ''));
    node.append(p, by);
    return { key: n.key, node, p, typed, rest, full: n.text, text: n.text, timer: 0 };
  }

  show(rec, text) {
    rec.text = text;
    rec.typed.textContent = text;
    rec.rest.textContent = '';
    rec.node.title = text === rec.full ? '' : rec.full;
  }

  // Largest chalk that fits, then tighter spacing, then shorter notes.
  fit() {
    if (!this.el.isConnected || !this.recs.size || !this.box.clientHeight) return;
    const over = () => this.box.scrollHeight > this.box.clientHeight + 1;
    this.el.classList.add('measuring'); // the slight tilt would count as overflow
    try {
      for (const rec of this.recs.values()) if (!rec.timer) this.show(rec, rec.full);
      this.el.classList.remove('tight');
      for (const px of SIZES) {
        this.el.style.setProperty('--cfs', `${px}px`);
        if (!over()) return;
      }
      this.el.classList.add('tight');
      // shorten whichever note is tallest, a little at a time
      const caps = new Map([...this.recs.values()].map((r) => [r, r.full.length]));
      while (over()) {
        const [rec] = [...caps].filter(([r, c]) => c > 24 && !r.timer).sort((a, b) => b[0].p.offsetHeight - a[0].p.offsetHeight)[0] || [];
        if (!rec) break;
        caps.set(rec, caps.get(rec) - 8);
        this.show(rec, capText(rec.full, caps.get(rec)));
      }
    } finally {
      this.el.classList.remove('measuring');
    }
  }

  // Scratch the note in one stroke at a time. The unwritten rest keeps its space (hidden), so nothing reflows.
  type(rec, perChar) {
    const text = rec.text;
    const step = Math.max(1, Math.round(28 / Math.max(6, perChar)));
    let n = 0;
    rec.node.classList.add('typing');
    rec.typed.textContent = '';
    rec.rest.textContent = text;
    const tick = () => {
      n = Math.min(text.length, n + step);
      rec.typed.textContent = text.slice(0, n);
      rec.rest.textContent = text.slice(n);
      if (n >= text.length) this.finish(rec);
      else rec.timer = setTimeout(tick, 28);
    };
    rec.timer = setTimeout(tick, 120);
  }

  finish(rec) {
    clearTimeout(rec.timer);
    rec.timer = 0;
    rec.node.classList.remove('typing');
    this.show(rec, rec.text);
  }

  destroy() {
    for (const rec of this.recs.values()) clearTimeout(rec.timer);
  }
}
