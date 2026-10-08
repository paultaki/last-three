// Speech, thought and whisper bubbles with collision avoidance (against each other and against faces).
import { h } from './common.js';

const GAP = 10;
const MARGIN = 4;

const overlapArea = (a, b) => Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));

export class Bubbles {
  constructor(layer, svg) {
    this.layer = layer;
    this.svg = svg;
    this.nodes = new Map();
  }

  clear() {
    for (const n of this.nodes.values()) n.remove();
    this.nodes.clear();
    this.svg.replaceChildren();
  }

  // items oldest -> newest: [{key, kind, as, name, to, text, forgedAs}]
  // anchors: name -> {x, top, feet} in px. u: figure unit in px.
  render(items, anchors, env, { animate, cut, u }) {
    const keep = new Set(items.map((it) => it.key));
    for (const [key, node] of this.nodes) {
      if (!keep.has(key)) {
        node.remove();
        this.nodes.delete(key);
      }
    }
    const maxW = Math.min(240, Math.max(150, env.W * 0.42));
    const placed = [];
    const lines = [];
    // Faces and bodies the bubbles should not cover.
    const obstacles = Object.entries(anchors).map(([name, a]) => ({ name, l: a.x - u * 0.5, r: a.x + u * 0.5, t: a.top, b: a.feet - u * 0.3 }));

    // newest first so the line you are reading gets the best spot
    for (const it of [...items].reverse()) {
      const speaker = anchors[it.as] || anchors[it.name];
      let node = this.nodes.get(it.key);
      if (!speaker) {
        if (node) node.hidden = true;
        continue;
      }
      if (!node) {
        node = this.build(it, cut);
        node.style.maxWidth = `${maxW}px`;
        if (animate) node.classList.add('pop');
        this.layer.append(node);
        this.nodes.set(it.key, node);
      }
      node.hidden = false;
      node.style.left = '0px';
      node.style.top = '0px';
      node.style.width = '';
      const w = node.offsetWidth;
      const hgt = node.offsetHeight;
      const cx = speaker.x;
      const left = Math.max(MARGIN, Math.min(env.W - w - MARGIN, cx - w / 2));
      const own = it.as;
      const options = [];
      for (let level = 0; level < 3; level++) options.push({ top: speaker.top - hgt - GAP - level * (hgt + 6), below: false, left, pen: level * 500 });
      options.push({ top: speaker.feet + 36, below: true, left, pen: 700 });
      // beside the head
      options.push({ top: speaker.top - hgt * 0.2, below: false, left: Math.min(env.W - w - MARGIN, cx + u * 0.7), side: true });
      options.push({ top: speaker.top - hgt * 0.2, below: false, left: Math.max(MARGIN, cx - u * 0.7 - w), side: true });
      let best = null;
      for (const opt of options) {
        const rect = { l: opt.left, r: opt.left + w, t: opt.top, b: opt.top + hgt };
        let cost = 0;
        if (rect.t < MARGIN) cost += (MARGIN - rect.t) * w * 3;
        if (rect.b > env.H - MARGIN) cost += (rect.b - (env.H - MARGIN)) * w * 3;
        for (const p of placed) cost += overlapArea(rect, p) * 4;
        for (const ob of obstacles) if (ob.name !== own) cost += overlapArea(rect, ob) * 0.6;
        cost += opt.pen || 0;
        if (opt.side) cost += 900;
        if (!best || cost < best.cost - 1) best = { ...opt, cost, rect };
        if (cost === 0) break;
      }
      node.style.width = `${w}px`;
      const top = Math.max(MARGIN, Math.min(env.H - hgt - MARGIN, best.top));
      const l = best.left;
      node.style.left = `${l}px`;
      node.style.top = `${top}px`;
      node.style.setProperty('--tail', `${Math.max(14, Math.min(w - 14, cx - l))}px`);
      node.classList.toggle('below', !!best.below);
      node.classList.toggle('side', !!best.side);
      placed.push({ l, r: l + w, t: top, b: top + hgt });

      if (it.kind === 'whisper' && it.to && anchors[it.to] && anchors[it.name]) {
        const a = anchors[it.name];
        const b = anchors[it.to];
        lines.push({ x1: a.x, y1: a.top + u * 0.45, x2: b.x, y2: b.top + u * 0.45 });
      }
    }
    this.svg.setAttribute('viewBox', `0 0 ${env.W} ${env.H}`);
    this.svg.replaceChildren(
      ...lines.map((l) => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', l.x1);
        line.setAttribute('y1', l.y1);
        line.setAttribute('x2', l.x2);
        line.setAttribute('y2', l.y2);
        return line;
      })
    );
  }

  build(it, cut) {
    const node = h('div', `bubble ${it.kind}`);
    const who = it.kind === 'whisper' ? `${it.as} whispers to ${it.to}` : it.as;
    node.append(h('b', 'who', who), h('span', 'txt', it.text));
    if (it.forgedAs && cut) node.append(h('small', 'forge', `forged by ${it.name}`));
    return node;
  }
}
