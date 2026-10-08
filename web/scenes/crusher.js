// The Crusher Room: a descending slab, a lever, and a door that opens while someone holds it.
import { h, place, actLabel } from './common.js';

const LAND = {
  room: { x: 3, y: 5, w: 94, h: 90 },
  // bottom edge of the slab (% of arena) for ceiling height 0..5 (5 = fully raised)
  slabY: [88, 63, 50, 38, 27, 17],
  slot: (k) => ({ x: 22 + Math.floor(k / 2) * 14.5, y: [60, 85][k % 2] }),
  lever: { x: 6.5, y: 56, w: 7, h: 36 },
  holder: { x: 15, y: 84 },
  door: { x: 93, y: 55, w: 4, h: 38 },
  exitX: 107,
};
const PORT = {
  room: { x: 3, y: 4, w: 94, h: 93 },
  slabY: [90, 62, 48, 36, 26, 15],
  slot: (k, n) => {
    const cols = n > 6 ? 4 : 3;
    const xs = cols === 4 ? [18, 39, 61, 82] : [24, 50, 76];
    const ys = n > 6 ? [54, 72, 90] : [62, 86];
    return { x: xs[k % cols], y: ys[Math.floor(k / cols) % ys.length] };
  },
  lever: { x: 7, y: 60, w: 12, h: 30 },
  holder: { x: 28, y: 84 },
  door: { x: 87, y: 54, w: 9, h: 36 },
  exitX: 112,
};

export default {
  id: 'crusher',

  mount(env) {
    const g = env.portrait ? PORT : LAND;
    const root = h('div', 'scene scene-crusher');
    const room = place(h('div', 'room'), g.room.x, g.room.y, g.room.w, g.room.h);
    const floor = place(h('div', 'room-floor'), g.room.x, g.room.y + g.room.h * 0.55, g.room.w, g.room.h * 0.45);
    const slab = place(h('div', 'slab'), g.room.x, g.room.y, g.room.w, 10);
    slab.append(h('span', 'slab-label', 'CEILING'));
    const lever = place(h('div', 'lever'), g.lever.x, g.lever.y, g.lever.w, g.lever.h);
    lever.append(h('span', 'lever-base'), h('span', 'lever-stick'), h('span', 'lever-cap'));
    const door = place(h('div', 'door'), g.door.x, g.door.y, g.door.w, g.door.h);
    door.append(h('span', 'door-sign', 'EXIT'));
    root.append(room, floor, lever, door);
    const overlay = h('div', 'scene-overlay');
    overlay.append(slab);
    return { root, overlay, slab, lever, door, floor, room };
  },

  update(hd, state, env, ctx) {
    const g = env.portrait ? PORT : LAND;
    const c = state.crusher;
    const pos = {};
    if (!c) return { pos, hud: { left: 'The Crusher Room', right: '' } };
    const height = c.crushed ? 0 : c.ceiling;
    const bottom = g.slabY[Math.max(0, Math.min(5, Math.round(height)))];
    hd.slab.style.height = `${bottom - g.room.y}%`;
    hd.slab.classList.toggle('crushed', !!c.crushed);
    hd.lever.classList.toggle('held', !!c.holder && c.door && !c.jam);
    hd.lever.classList.toggle('jammed', !!c.jam);
    hd.door.classList.toggle('open', !!c.door);
    hd.room.classList.toggle('danger', height <= 1);

    const alive = state.order.filter((n) => state.players[n].alive);
    // keep dying figures in the room until their animation is done: they have no `pos`, the arena keeps the last one
    let k = 0;
    alive.forEach((name) => {
      const out = c.escaped || (c.door && name !== c.holder);
      const slot = g.slot(k++, alive.length);
      if (name === c.holder && c.door && !c.escaped && !c.jam) {
        pos[name] = { x: g.holder.x, y: g.holder.y, cls: 'hold' };
      } else if (out) {
        pos[name] = { x: g.exitX, y: slot.y, cls: 'run', delay: 60 * (k % 5) };
      } else {
        pos[name] = { ...slot, cls: height <= 2 ? 'hunch' : '' };
      }
      pos[name].act = actLabel(state.acts[name], ctx.cut);
    });

    const right = c.jam
      ? 'The lever is jammed open!'
      : c.door && c.holder
        ? `${c.holder} is holding the lever`
        : `Ceiling ${height} of 5${state.round ? `, round ${state.round} of ${state.roundsTotal || 5}` : ''}`;
    return { pos, hud: { left: 'The Crusher Room', right, sub: c.crushed ? 'Mind the ceiling' : 'The door opens only while someone holds the lever' } };
  },
};
