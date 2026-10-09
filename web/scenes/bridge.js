// The Glass Bridge: waiting room with a wall, then eight rows of two glass panes.
import { h, place, actLabel } from './common.js';
import { Board } from './chalkboard.js';
import { wallNotes } from './lobby.js';

const ROWS = 8;

// Landscape: the bridge runs left to right, lane L on top. Portrait: bottom to top, L on the left.
const LAND = {
  start: { x: 1, y: 8, w: 33, h: 84 },
  span: { x: 35.5, y: 8, w: 45, h: 84 },
  goal: { x: 82, y: 8, w: 17, h: 84 },
  lane: { L: 33, R: 69 },
  paneH: 31,
  rowC: (r) => 35.5 + (r - 0.5) * (45 / ROWS),
  paneW: 4.4,
  slot: (k) => ({ x: [29, 18.5, 8][k % 3], y: [33, 60, 87][Math.floor(k / 3) % 3] }),
  goalSlot: (k) => ({ x: [86.5, 94][k % 2], y: [38, 62, 86][Math.floor(k / 2) % 3] }),
  wallRight: (p) => 2.8 + 2.6 * p,
};
const PORT = {
  start: { x: 2, y: 52, w: 96, h: 47 },
  span: { x: 18, y: 11, w: 64, h: 40 },
  goal: { x: 3, y: 1, w: 94, h: 9 },
  goalDone: { x: 3, y: 14, w: 94, h: 84 },
  lane: { L: 38, R: 62 },
  paneH: 4.2,
  rowC: (r) => 50.5 - (r - 0.5) * (38.5 / ROWS),
  paneW: 21,
  slot: (k) => ({ x: [39, 61, 17, 83][k % 4], y: [67, 89][Math.floor(k / 4) % 2] }),
  goalSlot: (k) => ({ x: [22, 50, 78][k % 3], y: [48, 80][Math.floor(k / 3) % 2] }),
  wallTop: (p) => 100 - 3.6 * p,
};

// While the line waits, the chalk wall hangs over the empty glass (landscape) or the far end (portrait).
const BOARD = { land: { x: 36, y: 8.5, w: 33, h: 83 }, port: { x: 3, y: 1.5, w: 94, h: 48.5 } };

const sideWord = (s) => (s === 'L' ? 'left' : 'right');

function root_finish(hd, g, env, b) {
  const done = env.portrait && b.finished;
  hd.root.classList.toggle('finished', !!done);
  const r = done ? g.goalDone : g.goal;
  place(hd.goal, r.x, r.y, r.w, r.h);
}

export default {
  id: 'bridge',

  mount(env) {
    const g = env.portrait ? PORT : LAND;
    const root = h('div', 'scene scene-bridge');
    root.classList.toggle('portrait', env.portrait);
    const start = place(h('div', 'plat plat-start'), g.start.x, g.start.y, g.start.w, g.start.h);
    const goal = place(h('div', 'plat plat-goal'), g.goal.x, g.goal.y, g.goal.w, g.goal.h);
    goal.append(h('span', 'plat-label', 'FINISH'));
    const span = place(h('div', 'span'), g.span.x, g.span.y, g.span.w, g.span.h);
    const panes = {};
    const nums = [];
    for (let r = 1; r <= ROWS; r++) {
      const no = h('span', 'rowno', String(r));
      if (env.portrait) place(no, g.span.x - 4.5, g.rowC(r) - 1.8);
      else place(no, g.rowC(r) - 1, g.span.y + 1.2);
      nums.push(no);
      for (const side of ['L', 'R']) {
        const pane = h('div', 'pane');
        const pw = env.portrait ? g.paneW : g.paneW;
        const ph = g.paneH;
        if (env.portrait) place(pane, g.lane[side] - pw / 2, g.rowC(r) - ph / 2, pw, ph);
        else place(pane, g.rowC(r) - pw / 2, g.lane[side] - ph / 2, pw, ph);
        pane.dataset.row = r;
        pane.dataset.side = side;
        panes[`${r}${side}`] = pane;
        root.append(pane);
      }
    }
    const wall = h('div', 'wall');
    wall.append(h('span', 'wall-face', 'WALL'));
    root.prepend(start, goal, span);
    const board = new Board();
    root.append(...nums, board.el, wall);
    return { root, panes, wall, start, goal, nums, board, destroy: () => board.destroy() };
  },

  update(hd, state, env, ctx) {
    const g = env.portrait ? PORT : LAND;
    const b = state.bridge;
    const pos = {};
    const cutMode = ctx.cut;
    if (!b) return { pos, hud: { left: 'The Glass Bridge', right: '' } };

    // panes
    for (let r = 1; r <= ROWS; r++) {
      const info = b.rows[r];
      for (const side of ['L', 'R']) {
        const pane = hd.panes[`${r}${side}`];
        const weak = info && info.weak === side;
        const safe = info && info.safe === side;
        pane.classList.toggle('broken', !!(weak && info.by));
        pane.classList.toggle('weak', !!(weak && !info.by));
        pane.classList.toggle('safe', !!safe);
        const stepped = Object.values(b.stepping).some((s) => s.row === r && s.side === side);
        pane.classList.toggle('stepped', stepped);
        pane.classList.toggle('current', state.phase === 'crossing' && b.cur === r && !info);
      }
    }

    const crossing = state.phase === 'crossing' || (b.cur > 0 && !b.finished && state.phase !== 'waiting');
    const p = state.roundsTotal && state.phase === 'waiting' ? Math.min(1, (state.round || 0) / state.roundsTotal) : crossing || b.finished ? 1 : 0;
    root_finish(hd, g, env, b);
    // wall
    hd.wall.hidden = b.finished;
    if (env.portrait) {
      hd.wall.style.cssText = `left:${g.start.x}%;width:${g.start.w}%;top:${g.wallTop(p)}%;height:${100 - g.wallTop(p)}%`;
    } else {
      const right = g.wallRight(p);
      hd.wall.style.cssText = `left:${g.start.x + 0.4}%;top:${g.start.y}%;height:${g.start.h}%;width:${right - g.start.x - 0.4}%`;
    }

    // the chalk wall, only while everyone is still in the waiting room
    const notes = wallNotes(state.chalk);
    const showWall = notes.length > 0 && !crossing && !b.finished;
    const boardRect = showWall ? (env.portrait ? BOARD.port : BOARD.land) : null;
    hd.board.setRect(boardRect);
    hd.board.set(showWall ? notes : []);

    // figures
    const line = b.line;
    const onGlass = new Set([...Object.keys(b.at), ...Object.keys(b.stepping)].filter((n) => line.includes(n) || n === line[0]));
    const queue = line.filter((n) => !onGlass.has(n));
    const paneFeet = (row, side) =>
      env.portrait ? { x: g.lane[side], y: g.rowC(row) + 1.6 } : { x: g.rowC(row), y: g.lane[side] + 8 };
    if (b.finished) {
      line.forEach((name, k) => {
        pos[name] = { ...g.goalSlot(k), cls: 'cheer' };
      });
    } else {
      queue.forEach((name, k) => {
        pos[name] = { ...g.slot(k), num: k + 1 + (onGlass.size ? onGlass.size : 0), cls: crossing ? 'wait' : '' };
      });
      for (const name of onGlass) {
        const st = b.stepping[name];
        const at = st || b.at[name];
        if (!at || !state.players[name] || !state.players[name].alive) continue;
        pos[name] = { ...paneFeet(at.row, at.side), num: 1, cls: 'front' };
      }
    }
    // line numbers in the waiting room: front is 1
    if (!crossing && !b.finished) line.forEach((name, k) => pos[name] && (pos[name].num = k + 1));
    for (const name of Object.keys(pos)) {
      const act = state.acts[name];
      pos[name].act = actLabel(act, cutMode);
    }

    const alive = state.order.filter((n) => state.players[n].alive).length;
    let right = '';
    let sub = '';
    if (b.finished) {
      right = `Bridge cleared: ${line.length} left`;
    } else if (crossing) {
      right = `Row ${b.cur || 1} of ${ROWS}`;
      sub = `${alive} on the bridge${line[0] ? `, ${line[0]} in front` : ''}`;
    } else {
      const left = Math.max(0, (state.roundsTotal || 6) - (state.round || 0));
      right = `Waiting room, round ${state.round || 1} of ${state.roundsTotal || 6}`;
      sub = left ? `The wall arrives in ${left} round${left > 1 ? 's' : ''}` : 'The wall pushes everyone onto the glass';
    }
    void sideWord;
    // row numbers should stay readable
    const keepOut = env.portrait ? [{ x: g.span.x - 6, y: g.span.y, w: 6, h: g.span.h }] : [{ x: g.span.x, y: g.span.y, w: g.span.w, h: 5 }];
    // while crossing, the panes carry the story: keep speech off them where there is room
    if (crossing && !b.finished) keepOut.push({ x: g.span.x, y: g.span.y, w: g.span.w, h: g.span.h, wt: 4 });
    if (boardRect) keepOut.push({ ...boardRect, wt: 6 });
    return { pos, keep: keepOut, hud: { left: 'The Glass Bridge', right, sub } };
  },
};
