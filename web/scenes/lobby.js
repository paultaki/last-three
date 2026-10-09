// Opening scene: the eight contestants line up in front of three empty prize blocks.
// When earlier winners left notes, they hang on the back wall on a chalkboard.
import { h } from './common.js';
import { Board } from './chalkboard.js';
import { chalkBy } from '../lib/text.js';

// Board rectangles on the back wall (percent of the arena).
const WALL = { land: { x: 4, y: 8.5, w: 92, h: 29 }, port: { x: 3, y: 8.5, w: 94, h: 41 } };

export const wallNotes = (chalk) =>
  chalk && chalk.shown.length ? chalk.shown.map((n, k) => ({ key: `wall${k}`, text: n.text, tag: `— ${chalkBy(n.byPlace)}`, place: n.byPlace })) : [];

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
    const board = new Board();
    root.append(bunting, board.el, blocks);
    return { root, board, destroy: () => board.destroy() };
  },

  update(hd, state, env) {
    const pos = {};
    const names = state.order.filter((n) => state.players[n].alive);
    names.forEach((name, k) => {
      pos[name] = env.portrait
        ? { x: [17, 39, 61, 83][k % 4], y: k < 4 ? 66 : 88, cls: 'cheer', delay: k * 30 }
        : { x: 10.5 + k * (79 / Math.max(1, names.length - 1)), y: 80 + (k % 2) * 5, cls: 'cheer', delay: k * 30 };
    });
    const notes = wallNotes(state.chalk);
    const rect = notes.length ? (env.portrait ? WALL.port : WALL.land) : null;
    hd.root.classList.toggle('has-chalk', !!rect);
    hd.board.setRect(rect);
    hd.board.set(notes);
    return {
      pos,
      keep: rect ? [{ ...rect, wt: 12 }] : [],
      hud: { left: "Tonight's contestants", right: `${names.length} players, ${state.rules >= 3 ? 5 : 4} obstacles, 3 prizes`, sub: notes.length ? 'Read the chalk wall, then press play' : 'Press play to start the show' },
    };
  },
};
