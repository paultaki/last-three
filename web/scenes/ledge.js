// The Final Ledge: a shrinking platform over a pit; footing pips above each head.
import { h, place, actLabel } from './common.js';

const LAND = { plat: { x: 15, y: 38, w: 70, h: 34 }, feetY: 60, spread: 24 };
const PORT = { plat: { x: 5, y: 40, w: 90, h: 26 }, feetY: 58, spread: 30 };

export default {
  id: 'ledge',

  mount(env) {
    const g = env.portrait ? PORT : LAND;
    const root = h('div', 'scene scene-ledge');
    const pit = h('div', 'pit');
    const plat = place(h('div', 'ledge-plat'), g.plat.x, g.plat.y, g.plat.w, g.plat.h);
    plat.append(h('span', 'ledge-top'), h('span', 'ledge-front'));
    root.append(pit, plat);
    return { root, plat, pit };
  },

  update(hd, state, env, ctx) {
    const g = env.portrait ? PORT : LAND;
    const l = state.ledge;
    const pos = {};
    if (!l) return { pos, hud: { left: 'The Final Ledge', right: '' } };
    const f = Math.max(0.55, 1 - 0.07 * (l.shrunk || 0));
    const w = g.plat.w * f;
    const x = g.plat.x + (g.plat.w - w) / 2;
    place(hd.plat, x, g.plat.y, w, g.plat.h);

    const alive = state.order.filter((n) => state.players[n].alive);
    const m = Math.max(1, alive.length);
    const spread = Math.min(g.spread * f, (w * 0.8) / Math.max(1, m - 1 || 1));
    const xs = {};
    alive.forEach((name, k) => {
      xs[name] = 50 + (k - (m - 1) / 2) * (m > 1 ? spread : 0);
    });
    for (const name of alive) {
      const act = state.acts[name];
      let px = xs[name];
      let cls = '';
      if (act && act.valid !== false) {
        if (act.verb === 'shove' && xs[act.arg] != null) {
          px += Math.sign(xs[act.arg] - px) * 5;
          cls = 'shove';
        } else if (act.verb === 'brace') cls = 'brace';
        else if (act.verb === 'dodge') cls = 'dodge';
      }
      pos[name] = { x: px, y: g.feetY, cls, pips: l.footing[name], act: actLabel(act, ctx.cut), face: xs[act && act.arg] != null && xs[act.arg] < xs[name] ? 'l' : 'r' };
    }
    const r = state.round || 1;
    const nextShrink = r % 2 === 0 || r >= 7 ? r : r + 1;
    return {
      pos,
      scale: env.portrait ? 1.15 : 1.3,
      hud: {
        left: 'The Final Ledge',
        right: `Round ${r}, ${alive.length} standing`,
        sub: `The ledge shrinks at the end of round ${nextShrink}`,
      },
    };
  },
};
