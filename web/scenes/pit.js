// The Pit: a deep shaft seen from the side. The water climbs a notch a round, the base kneels at the
// bottom as a step, climbers go over its back and up the wall to the rim, one rope can haul the base out.
import { h, place, actLabel } from './common.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const UNDER_FEET = 74; // px kept free under a figure's feet for its name tag and an action chip

// Design numbers, in % of the arena. `rim` lists where the figures who are out stand, in the order they get out.
const LAND = {
  surface: 31,
  bottom: 94,
  floor: 88.6,
  shaft: { x: 22, w: 56 },
  waterTop: 43,
  rim: [10, 90, 21, 79, 33, 67, 45, 55].map((x) => ({ x, y: 31 })),
  gap: 13,
  backRise: 29,
  rowCap: 5,
};
const PORT = {
  surface: 43,
  bottom: 92,
  floor: 85.6,
  shaft: { x: 4, w: 92 },
  waterTop: 49,
  rim: [30.5, 69.5, 14, 86, 50].map((x) => ({ x, y: 43 })).concat([28, 72, 50].map((x) => ({ x, y: 31 }))),
  gap: 21,
  backRise: 26,
  rowCap: 4,
};

// Squeeze the floor up when the arena is short, so the chips under the figures stay inside it.
function geom(env) {
  const g = env.portrait ? PORT : LAND;
  const floor = Math.min(g.floor, 100 - (UNDER_FEET / env.H) * 100);
  return { ...g, floor, bottom: Math.max(floor + 3, Math.min(g.bottom, floor + 5.5)) };
}

// Water line (% of arena height) at a flood notch; notch 0 is the floor.
const levelY = (g, flood, total) => g.bottom - (Math.max(0, Math.min(total, flood)) / total) * (g.bottom - g.waterTop);

// Down in the pit: a centred front row that always has a place for the base, and a second row above it.
function floorSlots(g, order, base) {
  const slots = {};
  const others = order.filter((n) => n !== base);
  const front = others.slice(0, base ? g.rowCap - 1 : g.rowCap);
  const back = others.slice(front.length);
  if (base) front.splice(Math.floor(front.length / 2), 0, base);
  const row = (names, y) => names.forEach((name, k) => (slots[name] = { x: 50 + (k - (names.length - 1) / 2) * g.gap, y }));
  row(front, g.floor);
  row(back, g.floor - g.backRise);
  return slots;
}

const svgEl = (tag, cls) => {
  const n = document.createElementNS(SVG_NS, tag);
  n.setAttribute('class', cls);
  return n;
};

export default {
  id: 'pit',

  mount(env) {
    const g = geom(env);
    const root = h('div', `scene scene-pit${env.portrait ? ' portrait' : ''}`);
    const sky = place(h('div', 'pit-sky'), 0, 0, 100, g.surface + 4);
    sky.append(h('i', 'pit-sun'), h('i', 'pit-cloud c1'), h('i', 'pit-cloud c2'));
    const lawn = (x, w) => place(h('div', 'pit-lawn'), x, g.surface - 0.1, w, 3.2);
    const gauge = place(h('div', 'pit-gauge'), g.shaft.x + (env.portrait ? 2 : 0.9), g.surface, 5, g.bottom - g.surface);
    const plates = [1, 2, 3, 4, 5].map((k) => gauge.appendChild(h('span', 'plate', String(k))));
    root.append(
      sky,
      place(h('div', 'pit-far'), 0, g.surface - 3.5, 100, 3.6),
      place(h('div', 'pit-earth'), 0, g.surface, 100, 100 - g.surface),
      place(h('div', 'pit-shaft'), g.shaft.x, g.surface, g.shaft.w, g.bottom - g.surface),
      place(h('div', 'pit-floor'), g.shaft.x, g.floor + 0.8, g.shaft.w, g.bottom - g.floor - 0.8),
      lawn(0, g.shaft.x),
      lawn(g.shaft.x + g.shaft.w, 100 - g.shaft.x - g.shaft.w),
      gauge
    );

    // overlay: the water covers the figures standing in it; the rope hangs in front of them
    const water = place(h('div', 'pit-water'), g.shaft.x, g.bottom, g.shaft.w, 0);
    water.append(h('i', 'wave'));
    const ropeSvg = svgEl('svg', 'pit-rope');
    ropeSvg.setAttribute('aria-hidden', 'true');
    const ropeOut = svgEl('path', 'rope-line rope-out');
    const ropeIn = svgEl('path', 'rope-line rope-in');
    const knot = svgEl('circle', 'rope-knot');
    knot.setAttribute('r', 6);
    ropeSvg.append(ropeOut, ropeIn, knot);
    const overlay = h('div', 'scene-overlay');
    overlay.append(water, ropeSvg);
    return { root, overlay, water, ropeSvg, ropeOut, ropeIn, knot, plates };
  },

  update(hd, state, env, ctx) {
    const g = geom(env);
    const p = state.pit;
    const pos = {};
    if (!p) return { pos, hud: { left: 'The Pit', right: '' } };
    const total = p.total || 5;
    const wy = levelY(g, p.flood, total);
    const scale = env.portrait ? 0.92 : 1; // a touch smaller on a phone, to leave room for speech above the rim
    const uf = env.u * scale;
    const pctU = (uf / env.H) * 100;
    const px = (x, y) => [(x / 100) * env.W, (y / 100) * env.H];

    hd.water.classList.toggle('dry', p.flood <= 0);
    hd.water.classList.toggle('high', p.flood >= total);
    hd.water.style.top = `${wy}%`;
    hd.water.style.height = `${g.bottom - wy}%`;
    hd.plates.forEach((plate, k) => {
      const lv = ((k + 1) / 5) * total;
      plate.style.top = `${((levelY(g, lv, total) - g.surface) / (g.bottom - g.surface)) * 100}%`;
      plate.classList.toggle('on', p.flood >= lv - 0.01);
      plate.classList.toggle('now', Math.abs(p.flood - lv) < 0.01);
    });

    const alive = new Set(state.order.filter((n) => state.players[n].alive));
    const base = p.base && alive.has(p.base) ? p.base : null;
    const slots = floorSlots(g, p.order.filter((n) => p.down.includes(n) || p.sunk.includes(n)), base);
    const rim = {};
    p.out.filter((n) => alive.has(n)).forEach((n, k) => (rim[n] = g.rim[Math.min(k, g.rim.length - 1)]));
    const rescuer = p.rope ? p.rope.by : null;
    const baseAt = base ? slots[base] : null;

    for (const name of state.order) {
      if (!alive.has(name)) continue;
      const act = state.acts[name];
      const live = act && act.valid !== false;
      const label = actLabel(act, ctx.cut, 'pit');
      if (rim[name]) {
        const o = rim[name];
        const L = { x: o.x, y: o.y, cls: 'out', act: act && act.verb === 'reach_down' ? label : '', face: o.x > 50 ? 'l' : 'r' };
        if (p.lifted.includes(name)) {
          // over the base's back, up the wall on this side, out over the rim
          const wallX = o.x < 50 ? g.shaft.x + 2.2 : g.shaft.x + g.shaft.w - 2.2;
          const back = baseAt || { x: 50, y: g.floor };
          L.cls = 'out cheer';
          L.via = [{ x: back.x, y: back.y - pctU * 0.85 }, { x: wallX, y: g.surface + (g.floor - g.surface) * 0.45 }, { x: wallX, y: g.surface + 1 }];
        } else if (p.rescued === name) {
          L.cls = 'out cheer';
          L.via = [{ x: (rim[rescuer] || o).x, y: g.surface + (g.floor - g.surface) * 0.4 }];
        }
        if (name === rescuer) {
          L.cls += o.x < (baseAt ? baseAt.x : 50) ? ' lean' : ' lean face-l';
          L.note = 'hands burned: -1 footing';
        }
        pos[name] = L;
      } else if (slots[name]) {
        const s = slots[name];
        const L = { x: s.x, y: s.y, cls: '', act: name === base ? '' : label };
        if (state.round == null) L.delay = 70 * p.order.indexOf(name); // the fall at the start of the stage, one after another
        if (name === base) {
          L.cls = p.baseNew && p.baseHow === 'pushed' ? 'base shoved' : 'base';
          L.note = 'the step';
        } else if (live && act.verb === 'push_base' && slots[act.arg]) {
          L.cls = 'shove';
          L.face = slots[act.arg].x < s.x ? 'l' : 'r';
          L.x = s.x + Math.sign(slots[act.arg].x - s.x) * 1.4;
        } else if (live && (act.verb === 'climb' || act.verb === 'offer_back')) L.cls = 'reach';
        if (p.pushFail && p.pushFail.target === name) L.cls = `${L.cls} bounce`.trim();
        pos[name] = L;
      }
    }

    // the rope: taut to the base while it hauls, hanging down the wall afterwards
    const ropeOn = !!(p.rope && rim[rescuer]);
    hd.ropeSvg.style.display = ropeOn ? '' : 'none';
    hd.ropeSvg.setAttribute('viewBox', `0 0 ${env.W} ${env.H}`);
    if (ropeOn) {
      const o = rim[rescuer];
      const dir = o.x < (baseAt ? baseAt.x : 50) ? 1 : -1;
      const [x0, y0] = px(o.x, o.y);
      const hx = x0 + dir * uf * 0.5;
      const hy = y0 - uf * 0.8;
      let d;
      let ex;
      let ey;
      if (!p.ropeUsed && baseAt) {
        [ex, ey] = px(baseAt.x, baseAt.y);
        ey -= uf * 0.55;
        d = `M${hx},${hy} Q${(hx + ex) / 2},${(hy + ey) / 2 + uf * 0.15} ${ex},${ey}`;
      } else {
        ex = hx + dir * uf * 0.15;
        ey = px(0, g.surface + (g.floor - g.surface) * 0.5)[1];
        d = `M${hx},${hy} Q${hx - dir * uf * 0.35},${(hy + ey) / 2} ${ex},${ey}`;
      }
      hd.ropeIn.setAttribute('d', d);
      hd.ropeOut.setAttribute('d', d);
      hd.knot.setAttribute('cx', ex);
      hd.knot.setAttribute('cy', ey);
      hd.ropeSvg.classList.toggle('limp', !!p.ropeUsed);
    }

    const down = p.down.filter((n) => alive.has(n)).length;
    const sub = p.flood >= total
      ? 'The water has covered the pit.'
      : base
        ? `${base} is the step. ${p.ropeUsed ? 'The rope is gone.' : 'One rope, one use.'}`
        : p.ropeUsed
          ? 'The rope is gone. Whoever is left needs a new step.'
          : 'Nobody is the step yet. Climbing needs someone to stand on.';
    return {
      pos,
      waterY: wy,
      scale,
      dropIn: true,
      bubbles: {
        figWeight: 60, // speech keeps off the figures and gathers in the sky above the rim
        lift: env.portrait ? 45 : 0,
        wide: true, // fewer lines on a phone, so a bubble in the sky stays above the heads
        budget: env.portrait ? 110 : env.W < 900 ? 260 : 0, // little room: an older line goes once the text outgrows this
        cap: env.portrait ? 96 : env.W < 900 ? 110 : undefined,
      },
      hud: { left: 'The Pit', right: `Water ${Math.min(total, p.flood)} of ${total}, ${down} down`, sub },
    };
  },
};
