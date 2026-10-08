// The Trapdoor Disc: numbered tiles in a ring, some of which drop out.
import { h, place } from './common.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const TILE_COLORS = ['#ffcf56', '#ff7a59', '#53c6a9', '#6aa7ff', '#c79bff', '#ff9ec7', '#9bd45a', '#f4a259'];

function sector(r0, r1, a0, a1) {
  const p = (r, a) => [100 + r * Math.cos(a), 100 + r * Math.sin(a)];
  const [x0, y0] = p(r1, a0);
  const [x1, y1] = p(r1, a1);
  const [x2, y2] = p(r0, a1);
  const [x3, y3] = p(r0, a0);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M${x0},${y0} A${r1},${r1} 0 ${large} 1 ${x1},${y1} L${x2},${y2} A${r0},${r0} 0 ${large} 0 ${x3},${y3} Z`;
}

function buildDisc(n) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 200 200');
  svg.setAttribute('class', 'disc-svg');
  svg.setAttribute('aria-hidden', 'true');
  const rim = document.createElementNS(SVG_NS, 'circle');
  rim.setAttribute('cx', 100);
  rim.setAttribute('cy', 100);
  rim.setAttribute('r', 98);
  rim.setAttribute('class', 'disc-rim');
  svg.append(rim);
  const tiles = [];
  for (let k = 1; k <= n; k++) {
    const a0 = -Math.PI / 2 + ((k - 1) * 2 * Math.PI) / n;
    const a1 = -Math.PI / 2 + (k * 2 * Math.PI) / n;
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'tile');
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', sector(8, 93, a0 + 0.012, a1 - 0.012));
    path.setAttribute('class', 'tile-face');
    path.style.fill = TILE_COLORS[(k - 1) % TILE_COLORS.length];
    const depth = document.createElementNS(SVG_NS, 'path');
    depth.setAttribute('d', sector(22, 82, a0 + 0.06, a1 - 0.06));
    depth.setAttribute('class', 'tile-depth');
    const mid = (a0 + a1) / 2;
    const text = document.createElementNS(SVG_NS, 'text');
    text.setAttribute('x', 100 + 84 * Math.cos(mid));
    text.setAttribute('y', 100 + 84 * Math.sin(mid) + 3.6);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('class', 'tile-no');
    text.textContent = String(k);
    g.append(path, depth, text);
    svg.append(g);
    tiles.push(g);
  }
  const hub = document.createElementNS(SVG_NS, 'circle');
  hub.setAttribute('cx', 100);
  hub.setAttribute('cy', 100);
  hub.setAttribute('r', 9);
  hub.setAttribute('class', 'disc-hub');
  svg.append(hub);
  return { svg, tiles };
}

export default {
  id: 'disc',

  mount(env) {
    const root = h('div', 'scene scene-disc');
    const wrap = h('div', 'disc-wrap');
    const R = env.portrait ? env.W * 0.455 : env.H * 0.43;
    const cx = env.W / 2;
    const cy = env.H * (env.portrait ? 0.5 : 0.52);
    place(wrap, ((cx - R) / env.W) * 100, ((cy - R) / env.H) * 100, ((2 * R) / env.W) * 100, ((2 * R) / env.H) * 100);
    root.append(wrap);
    return { root, wrap, R, cx, cy, built: 0, tiles: [] };
  },

  update(hd, state, env) {
    const dsc = state.disc;
    const pos = {};
    if (!dsc) return { pos, hud: { left: 'The Trapdoor Disc', right: '' } };
    if (hd.built !== dsc.n) {
      const { svg, tiles } = buildDisc(dsc.n);
      hd.wrap.replaceChildren(svg);
      hd.tiles = tiles;
      hd.built = dsc.n;
    }
    hd.tiles.forEach((g, idx) => g.classList.toggle('open', dsc.open.includes(idx + 1)));

    const alive = state.order.filter((n) => state.players[n].alive);
    const n = dsc.n;
    let waitK = 0;
    const rim = hd.R * 0.5;
    for (const name of alive) {
      const tile = dsc.tiles[name];
      if (tile != null && tile >= 1 && tile <= n) {
        const ang = -Math.PI / 2 + ((tile - 0.5) * 2 * Math.PI) / n;
        const px = hd.cx + rim * Math.cos(ang);
        const py = hd.cy + rim * Math.sin(ang) + env.u * 0.35;
        const over = dsc.open.includes(tile);
        pos[name] = { x: (px / env.W) * 100, y: (py / env.H) * 100, cls: over ? 'scared' : '', tile };
      } else {
        const k = waitK++;
        pos[name] = env.portrait
          ? { x: [16, 39, 61, 84][k % 4], y: k < 4 ? 12 : 94, cls: '' }
          : { x: k % 2 === 0 ? 9 : 91, y: 26 + Math.floor(k / 2) * 20, cls: '' };
      }
    }
    const phaseTxt = state.phase === 'swap' ? 'Round 2: swap or wait' : state.phase === 'pick' ? 'Round 1: pick a tile' : '';
    const opened = dsc.open.length;
    return {
      pos,
      hud: {
        left: 'The Trapdoor Disc',
        right: opened ? `${opened} trapdoor${opened > 1 ? 's' : ''} open` : `${n} tiles, ${dsc.openCount} will open`,
        sub: phaseTxt || (dsc.tilesPublic ? 'Tiles are set' : ''),
      },
    };
  },
};
