// Epilogue (rules v4): the podium with the finishers, and a chalk wall behind it. Whoever chooses to
// write steps up and scratches a message; whoever skips shrugs. Nothing here changes a result.
import { h, actLabel } from './common.js';
import { Board } from './chalkboard.js';
import { ordinal } from '../lib/text.js';

const LAND = { board: { x: 5, y: 7, w: 90, h: 30 }, feet: { 1: { x: 50, y: 60 }, 2: { x: 29, y: 69 }, 3: { x: 71, y: 75 } }, up: 4.5, scale: 1 };
const PORT = { board: { x: 3, y: 6.5, w: 94, h: 46 }, feet: { 1: { x: 50, y: 70 }, 2: { x: 21, y: 77 }, 3: { x: 79, y: 81 } }, up: 4, scale: 1 };

export default {
  id: 'chalk',

  mount(env) {
    const root = h('div', 'scene scene-podium scene-chalk');
    root.classList.toggle('portrait', env.portrait);
    const blocks = h('div', 'podium-blocks');
    for (const n of [2, 1, 3]) {
      const b = h('div', `podium p${n}`);
      b.append(h('span', 'podium-no', ordinal(n)));
      blocks.append(b);
    }
    const spots = h('div', 'spots');
    for (let k = 0; k < 3; k++) spots.append(h('i'));
    const bunting = h('div', 'bunting');
    for (let k = 0; k < 12; k++) bunting.append(h('i'));
    const board = new Board({ bySlot: true });
    root.append(spots, bunting, board.el, blocks);
    return { root, board, destroy: () => board.destroy() };
  },

  update(hd, state, env, ctx) {
    const g = env.portrait ? PORT : LAND;
    const c = state.chalk || { writers: [], places: {}, written: [], skipped: [], last: null, done: false };
    const pos = {};
    const taken = new Set();
    for (const name of c.writers) {
      let p = c.places[name];
      if (!g.feet[p] || taken.has(p)) p = [1, 2, 3].find((x) => !taken.has(x)) || 1; // unknown or clashing place: first free block
      taken.add(p);
      const writing = c.last === name && !c.done;
      const skipped = c.skipped.includes(name);
      const f = g.feet[p];
      pos[name] = {
        x: f.x,
        y: f.y - (writing ? g.up : 0),
        cls: writing ? 'write' : skipped ? 'shrug' : p === 1 ? 'cheer crown' : 'cheer',
        act: c.written.length ? '' : actLabel(state.acts[name], ctx.cut, 'chalk'), // the chips are the decision; the notes tell the rest
      };
    }

    const seat = (name) => Math.max(0, state.order.indexOf(name));
    const notes = c.written.map((w) => ({
      key: `w${w.i}`,
      text: w.text,
      tag: `— ${w.name}, ${w.place ? `${ordinal(w.place)} place` : 'finisher'}`,
      place: w.place,
      seat: seat(w.name),
      current: c.last === w.name && !c.done,
    }));
    const typing = ctx.animate && !ctx.reduced && state.ev && state.ev.type === 'chalk_write' ? `w${state.i}` : null;
    hd.board.setRect(g.board);
    hd.board.set(notes, { typeKey: typing, perChar: 28 / Math.max(0.5, ctx.speed || 1), hint: c.done ? 'NOBODY LEFT A MESSAGE' : 'THE CHALK WALL' });

    const n = c.writers.length;
    return {
      pos,
      scale: g.scale,
      keep: [{ ...g.board, wt: 2 }], // thoughts come while the wall is still blank
      hud: {
        left: 'The Chalk Wall',
        right: `${n} finisher${n === 1 ? '' : 's'} may leave a message`,
        sub: c.last && !c.done ? `${c.last} is writing` : 'A note for the next contestants',
      },
    };
  },
};
