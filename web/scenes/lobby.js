// Opening scene: the eight contestants line up in front of three empty prize blocks.
import { h, place } from './common.js';

export default {
  id: 'lobby',

  mount(env) {
    const root = h('div', 'scene scene-lobby');
    root.classList.toggle('portrait', env.portrait);
    const blocks = h('div', 'prize-blocks');
    [['2', 'second'], ['1', 'first'], ['3', 'third']].forEach(([n, cls]) => {
      const b = h('div', `prize ${cls}`);
      b.append(h('span', 'prize-no', n));
      blocks.append(b);
    });
    const bunting = h('div', 'bunting');
    for (let k = 0; k < 12; k++) bunting.append(h('i'));
    root.append(bunting, blocks);
    return { root };
  },

  update(hd, state, env) {
    const pos = {};
    const names = state.order.filter((n) => state.players[n].alive);
    names.forEach((name, k) => {
      pos[name] = env.portrait
        ? { x: [17, 39, 61, 83][k % 4], y: k < 4 ? 66 : 88, cls: 'cheer', delay: k * 30 }
        : { x: 10.5 + k * (79 / Math.max(1, names.length - 1)), y: 80 + (k % 2) * 5, cls: 'cheer', delay: k * 30 };
    });
    return {
      pos,
      hud: { left: "Tonight's contestants", right: `${names.length} players, 4 obstacles, 3 prizes`, sub: 'Press play to start the show' },
    };
  },
};
