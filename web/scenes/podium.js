// Final scene: the podium. Places 1 to 3 stand on their blocks; confetti rains.
import { h } from './common.js';
import { ordinal } from '../lib/text.js';

export default {
  id: 'podium',

  mount(env) {
    const root = h('div', 'scene scene-podium');
    root.classList.toggle('portrait', env.portrait);
    const blocks = h('div', 'podium-blocks');
    const nodes = {};
    for (const n of [2, 1, 3]) {
      const b = h('div', `podium p${n}`);
      b.append(h('span', 'podium-no', ordinal(n)));
      nodes[n] = b;
      blocks.append(b);
    }
    const rain = h('div', 'confetti-rain');
    for (let k = 0; k < 22; k++) {
      const piece = h('i');
      piece.style.left = `${(k * 37) % 100}%`;
      piece.style.animationDelay = `${(k % 7) * 0.45}s`;
      piece.style.setProperty('--i', k % 6);
      rain.append(piece);
    }
    const spots = h('div', 'spots');
    for (let k = 0; k < 3; k++) spots.append(h('i'));
    const bunting = h('div', 'bunting');
    for (let k = 0; k < 12; k++) bunting.append(h('i'));
    root.append(spots, bunting, rain, blocks);
    return { root, nodes };
  },

  update(hd, state, env) {
    const pos = {};
    const placed = state.order
      .filter((n) => typeof state.players[n].place === 'number')
      .sort((a, b) => state.players[a].place - state.players[b].place);
    const feet = env.portrait
      ? { 1: { x: 50, y: 56 }, 2: { x: 21, y: 66 }, 3: { x: 79, y: 72 } }
      : { 1: { x: 50, y: 53 }, 2: { x: 29, y: 63 }, 3: { x: 71, y: 70 } };
    for (const name of placed) {
      const p = state.players[name].place;
      if (feet[p]) pos[name] = { ...feet[p], cls: p === 1 ? 'cheer crown' : 'cheer' };
    }
    if (!placed.length) {
      state.order
        .filter((n) => state.players[n].alive)
        .forEach((name, k) => {
          pos[name] = { x: 20 + k * 20, y: 70, cls: 'cheer' };
        });
    }
    const winner = state.winner;
    return {
      pos,
      scale: env.portrait ? 1.1 : 1.35,
      hud: {
        left: winner ? `${winner} wins!` : 'Game over',
        right: placed.map((n) => `${ordinal(state.players[n].place)} ${n}`).join('   '),
        sub: 'Results are below the arena',
      },
    };
  },
};
