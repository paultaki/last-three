// Speech, thought and whisper bubbles. At most a few at a time, placed by a grid search that keeps
// them off every figure and name tag, with a thin leader line back to the speaker's head.
import { h } from './common.js';

const MARGIN = 4;
const STEP = 12;
const SVG_NS = 'http://www.w3.org/2000/svg';

const overlapArea = (a, b) => Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// How long a bubble stays up while the show is playing (ms at 1x).
export const fadeMs = (text) => 2600 + 70 * String(text || '').length;

export class Bubbles {
  constructor(layer, svg) {
    this.layer = layer;
    this.svg = svg;
    this.nodes = new Map(); // key -> { node, faded, timer, rect }
  }

  clear() {
    for (const rec of this.nodes.values()) {
      clearTimeout(rec.timer);
      rec.node.remove();
    }
    this.nodes.clear();
    this.svg.replaceChildren();
  }

  // Show everything again and stop the fade timers (paused, scrubbed or resized).
  pin() {
    for (const rec of this.nodes.values()) {
      clearTimeout(rec.timer);
      rec.timer = 0;
      rec.faded = false;
      rec.node.classList.remove('fade');
    }
  }

  // items oldest -> newest: [{key, kind, seat, as, name, to, text, forgedAs}]
  // anchors: name -> {x, top, feet} in px. u: figure unit in px.
  render(items, anchors, env, { animate, cut, u, fade, speed = 1, keep = [], figWeight = 14, lift = 0, wide = false }) {
    const live = new Set(items.map((it) => it.key));
    for (const [key, rec] of this.nodes) {
      if (!live.has(key)) {
        clearTimeout(rec.timer);
        rec.node.remove();
        this.nodes.delete(key);
      }
    }
    if (!fade) this.pin();
    const maxW = env.portrait ? Math.min(wide ? 380 : 310, env.W - 2 * MARGIN - 6) : Math.min(290, Math.max(200, env.W * 0.34));
    const placed = [];
    const lines = [];
    // Faces, bodies and name tags the bubbles must not cover.
    const hw = Math.max(u * 0.62, 38);
    const obstacles = Object.entries(anchors)
      .map(([name, a]) => ({ name, tagTop: a.feet - u * 0.1, wt: figWeight, l: a.x - hw, r: a.x + hw, t: a.top - u * 0.35, b: a.feet + u * 1.25 }))
      .concat(keep);

    // newest first so the line being read gets the best spot
    for (const it of [...items].reverse()) {
      const speaker = anchors[it.as] || anchors[it.name];
      let rec = this.nodes.get(it.key);
      if (!speaker) {
        if (rec) rec.node.hidden = true;
        continue;
      }
      if (!rec) {
        const node = this.build(it, cut);
        node.style.maxWidth = `${maxW}px`;
        if (animate) node.classList.add('pop');
        this.layer.append(node);
        rec = { node, faded: false, timer: 0, rect: null };
        this.nodes.set(it.key, rec);
      }
      const node = rec.node;
      node.style.maxWidth = `${maxW}px`;
      if (fade && !rec.faded && !rec.timer) {
        rec.timer = setTimeout(() => {
          rec.faded = true;
          rec.timer = 0;
          node.classList.add('fade');
        }, fadeMs(it.text) / Math.max(0.5, speed));
      }
      if (rec.faded) continue; // takes no space once it has faded
      node.hidden = false;
      node.style.left = '0px';
      node.style.top = '0px';
      node.style.width = '';
      // Pin the width one hair wider than measured (never narrower: that would re-wrap), then read the height.
      const w = Math.ceil(node.getBoundingClientRect().width);
      node.style.width = `${w}px`;
      const hgt = node.offsetHeight;
      const best = this.pick(rec, w, hgt, speaker, it, obstacles, placed, env, lift);
      const top = best.t;
      const left = best.l;
      node.style.left = `${left}px`;
      node.style.top = `${top}px`;
      rec.rect = { l: left, t: top };
      placed.push({ l: left, r: left + w, t: top, b: top + hgt });
      this.leader(node, { l: left, r: left + w, t: top, b: top + hgt }, speaker, u);
      if (it.kind === 'whisper' && it.to && anchors[it.to] && anchors[it.name]) {
        const a = anchors[it.name];
        const b = anchors[it.to];
        lines.push({ x1: a.x, y1: a.top + u * 0.45, x2: b.x, y2: b.top + u * 0.45 });
      }
    }
    this.svg.setAttribute('viewBox', `0 0 ${env.W} ${env.H}`);
    this.svg.replaceChildren(
      ...lines.map((l) => {
        const line = document.createElementNS(SVG_NS, 'line');
        line.setAttribute('x1', l.x1);
        line.setAttribute('y1', l.y1);
        line.setAttribute('x2', l.x2);
        line.setAttribute('y2', l.y2);
        return line;
      })
    );
  }

  // Lowest-cost spot on a grid: no overlap with figures (least of all the speaker's own tag),
  // no overlap with other bubbles, and as close to the speaker's head as that allows.
  pick(rec, w, hgt, speaker, it, obstacles, placed, env, lift = 0) {
    const own = it.as;
    const hx = speaker.x;
    const hy = speaker.top + 4;
    const maxL = Math.max(MARGIN, env.W - w - MARGIN);
    const maxT = Math.max(MARGIN, env.H - hgt - MARGIN);
    // Hard rules weigh far more than preferences: never cover your own name tag, never sit on another bubble.
    const cost = (l, t) => {
      const r = { l, r: l + w, t, b: t + hgt };
      let c = 0;
      let hard = 0;
      for (const ob of obstacles) {
        if (ob.name === own) {
          const tag = overlapArea(r, { l: ob.l, r: ob.r, t: ob.tagTop, b: ob.b });
          hard += tag;
          c += tag * 3000;
        }
        c += overlapArea(r, ob) * (ob.name === own ? Math.max(20, ob.wt * 0.7) : ob.wt);
      }
      for (const p of placed) {
        const o = overlapArea(r, p);
        hard += o;
        c += o * 6000;
      }
      const dx = hx < r.l ? r.l - hx : hx > r.r ? hx - r.r : 0;
      const dy = hy < r.t ? r.t - hy : hy > r.b ? hy - r.b : 0;
      c += Math.hypot(dx, dy) * 40 + t * lift; // lift: a scene with a clear band at the top pulls bubbles up into it
      return { c, hard };
    };
    let best = null;
    const consider = (l, t, bonus = 1) => {
      const k = cost(l, t);
      const c = k.c * bonus;
      if (bonus < 1 && k.hard > 0) return;
      if (!best || c < best.c) best = { c, l, t };
    };
    const xs = [];
    for (let x = MARGIN; x <= maxL; x += STEP) xs.push(x);
    xs.push(clamp(hx - w / 2, MARGIN, maxL), maxL);
    for (let t = MARGIN; t <= maxT; t += STEP) for (const l of xs) consider(l, t);
    consider(clamp(hx - w / 2, MARGIN, maxL), clamp(speaker.top - hgt - 12, MARGIN, maxT));
    if (rec.rect) consider(clamp(rec.rect.l, MARGIN, maxL), clamp(rec.rect.t, MARGIN, maxT), 0.8); // stay put when it is as good
    return best;
  }

  // A thin line from the bubble's nearest edge to the speaker's head.
  leader(node, r, speaker, u) {
    node.querySelector('svg')?.remove();
    const hx = speaker.x;
    const hy = speaker.top + u * 0.15;
    const sx = clamp(hx, r.l, r.r);
    const sy = clamp(hy, r.t, r.b);
    if (Math.hypot(hx - sx, hy - sy) < 8) return;
    // child coordinates start at the padding box, inside the 3px border
    const ox = r.l + 3;
    const oy = r.t + 3;
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'leader');
    svg.setAttribute('aria-hidden', 'true');
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', sx - ox);
    line.setAttribute('y1', sy - oy);
    line.setAttribute('x2', hx - ox);
    line.setAttribute('y2', hy - oy);
    const dot = document.createElementNS(SVG_NS, 'circle');
    dot.setAttribute('cx', hx - ox);
    dot.setAttribute('cy', hy - oy);
    dot.setAttribute('r', 5);
    svg.append(line, dot);
    node.append(svg);
  }

  build(it, cut) {
    const node = h('div', `bubble ${it.kind}`);
    node.style.setProperty('--c', `var(--seat-${it.seat})`);
    node.dataset.as = it.as;
    const who = h('b', 'who');
    who.append(h('i', 'dot'), document.createTextNode(it.kind === 'whisper' ? `${it.as} whispers to ${it.to}` : it.as));
    node.append(who, h('span', 'txt', it.text));
    if (it.forgedAs && cut) node.append(h('small', 'forge', `forged by ${it.name}`));
    return node;
  }
}
