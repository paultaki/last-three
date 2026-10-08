// Cartoon death effects. No blood: cubes burst, stickers peel, confetti flies.
import { h } from './common.js';
import { DEATH_ONOMATOPOEIA } from '../lib/text.js';

const rnd = (a, b) => a + Math.random() * (b - a);
const CONFETTI = ['#ff4d6d', '#ffc233', '#2ec4b6', '#4d8dff', '#b07cff', '#ffffff'];

function chip(layer, text, x, y, cls = '') {
  const c = h('div', `fx-chip ${cls}`, text);
  c.style.left = `${x}%`;
  c.style.top = `${y}%`;
  layer.append(c);
  const a = c.animate(
    [
      { transform: 'translate(-50%,-50%) scale(.3) rotate(-8deg)', opacity: 0 },
      { transform: 'translate(-50%,-90%) scale(1.15) rotate(3deg)', opacity: 1, offset: 0.2 },
      { transform: 'translate(-50%,-110%) scale(1) rotate(-2deg)', opacity: 1, offset: 0.7 },
      { transform: 'translate(-50%,-140%) scale(.9)', opacity: 0 },
    ],
    { duration: 1300, easing: 'ease-out', fill: 'forwards' }
  );
  a.finished.then(() => c.remove(), () => c.remove());
}

export function popChip(layer, text, x, y, cls) {
  chip(layer, text, x, y, cls);
}

function burstCubes(layer, env, x, y, color, speed) {
  const total = 14;
  const dur = 1250 / speed;
  for (let k = 0; k < total; k++) {
    const size = env.u * rnd(0.14, 0.3);
    const cube = h('i', 'fx-cube');
    cube.style.width = cube.style.height = `${size}px`;
    cube.style.left = `${x}%`;
    cube.style.top = `${y - 5}%`;
    cube.style.background = k % 3 === 0 ? 'var(--ink)' : color;
    layer.append(cube);
    const dx = rnd(-1.3, 1.3) * env.u;
    const up = rnd(0.4, 1.5) * env.u;
    const fall = rnd(2.2, 4) * env.u;
    const rot = rnd(-540, 540);
    const a = cube.animate(
      [
        { transform: 'translate(-50%,-50%) rotate(0deg)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx * 0.6}px), calc(-50% - ${up}px)) rotate(${rot / 2}deg)`, opacity: 1, offset: 0.3 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${fall}px)) rotate(${rot}deg)`, opacity: 0 },
      ],
      { duration: dur * rnd(0.85, 1.15), easing: 'cubic-bezier(.3,.6,.5,1)', fill: 'forwards' }
    );
    a.finished.then(() => cube.remove(), () => cube.remove());
  }
}

function confettiBurst(layer, env, x, y, speed) {
  for (let k = 0; k < 22; k++) {
    const piece = h('i', 'fx-confetti');
    piece.style.left = `${x}%`;
    piece.style.top = `${y - 4}%`;
    piece.style.background = CONFETTI[k % CONFETTI.length];
    layer.append(piece);
    const dx = rnd(-2.2, 2.2) * env.u;
    const up = rnd(1.2, 3.2) * env.u;
    const a = piece.animate(
      [
        { transform: 'translate(-50%,-50%) rotate(0deg)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx * 0.6}px), calc(-50% - ${up}px)) rotate(200deg)`, opacity: 1, offset: 0.4 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${up * 0.3}px)) rotate(520deg)`, opacity: 0 },
      ],
      { duration: rnd(900, 1500) / speed, easing: 'ease-out', fill: 'forwards' }
    );
    a.finished.then(() => piece.remove(), () => piece.remove());
  }
}

// Sinking: bubbles rise, a hand waves above the waterline, the figure slips under and its tag goes with it.
function sinkFx(fig, layer, env, x, y, sp) {
  const u = env.u;
  const wy = env.waterY != null ? env.waterY : y - 14; // % of the arena
  const dur = 2500 / sp;
  const rise = ((y - wy) / 100) * env.H;
  for (let k = 0; k < 9; k++) {
    const b = h('i', 'fx-bubble');
    b.style.width = b.style.height = `${u * rnd(0.14, 0.3)}px`;
    b.style.left = `${x + rnd(-3, 3)}%`;
    b.style.top = `${y - 6}%`;
    layer.append(b);
    const a = b.animate(
      [
        { transform: 'translate(-50%,0) scale(.4)', opacity: 0 },
        { transform: `translate(calc(-50% + ${rnd(-8, 8)}px), ${-rise * 0.5}px)`, opacity: 0.95, offset: 0.5 },
        { transform: `translate(calc(-50% + ${rnd(-10, 10)}px), ${-rise - u * 0.3}px) scale(1.2)`, opacity: 0 },
      ],
      { duration: dur * rnd(0.6, 1), delay: (k * 170) / sp, easing: 'ease-out', fill: 'both' }
    );
    a.finished.then(() => b.remove(), () => b.remove());
  }
  const hand = h('div', 'fx-hand');
  Object.assign(hand.style, { left: `${x}%`, top: `${wy}%`, width: `${u * 0.5}px`, height: `${u * 1.1}px` });
  hand.style.setProperty('--c', `var(--seat-${seatOf(fig)})`);
  hand.append(h('i', 'arm'), h('i', 'palm'));
  layer.append(hand);
  const wave = (deg, offset, opacity = 1) => ({ transform: `translate(-50%,-100%) rotate(${deg}deg)`, opacity, offset });
  const w = hand.animate(
    [{ transform: 'translate(-50%,-4%)', opacity: 0 }, wave(-16, 0.15), wave(18, 0.3), wave(-18, 0.45), wave(18, 0.6), wave(-8, 0.78), { transform: 'translate(-50%,-4%)', opacity: 0 }],
    { duration: dur, easing: 'ease-in-out', fill: 'both' }
  );
  w.finished.then(() => hand.remove(), () => hand.remove());
  for (const part of [fig.tag, fig.act, fig.note]) part.animate([{ opacity: 1 }, { opacity: 1, offset: 0.45 }, { opacity: 0 }], { duration: dur, fill: 'forwards' });
  return fig.inner.animate(
    [
      { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
      { transform: `translateY(${-u * 0.3}px) rotate(-5deg)`, offset: 0.25 },
      { transform: `translateY(${u * 0.05}px) rotate(5deg)`, offset: 0.5 },
      { transform: `translateY(${u * 1.5}px)`, opacity: 0.2 },
    ],
    { duration: dur, easing: 'ease-in-out', fill: 'forwards' }
  ).finished;
}

// Plays the death style and resolves when the figure may be hidden.
export function playDeath(style, fig, layer, env, speed = 1) {
  const x = fig.last.x;
  const y = fig.last.y;
  const u = env.u;
  const sp = Math.max(0.5, speed);
  chip(layer, DEATH_ONOMATOPOEIA[style] || 'OOPS!', x, y - 9, `fx-${style}`);
  if (style === 'flatten') {
    const a = fig.inner.animate(
      [
        { transform: 'scale(1,1)', opacity: 1 },
        { transform: 'scale(1.5,.09)', opacity: 1, offset: 0.16 },
        { transform: 'scale(1.5,.09)', opacity: 1, offset: 0.5 },
        { transform: `translate(${u * 1.6}px,${u * 0.05}px) rotate(14deg) scale(1.4,.09)`, opacity: 0 },
      ],
      { duration: 1700 / sp, easing: 'ease-in-out', fill: 'forwards' }
    );
    return a.finished;
  }
  if (style === 'sink') return sinkFx(fig, layer, env, x, y, sp);
  if (style === 'chute') {
    confettiBurst(layer, env, x, y, sp);
    const a = fig.inner.animate(
      [
        { transform: 'translateY(0) rotate(0deg) scale(1)', opacity: 1 },
        { transform: `translateY(${-u * 0.5}px) rotate(260deg) scale(1.05)`, opacity: 1, offset: 0.25 },
        { transform: `translateY(${u * 0.9}px) rotate(1080deg) scale(.05)`, opacity: 0 },
      ],
      { duration: 1300 / sp, easing: 'ease-in', fill: 'forwards' }
    );
    return a.finished;
  }
  if (style === 'tumble') {
    const dir = fig.last.x >= 50 ? 1 : -1;
    const a = fig.inner.animate(
      [
        { transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 1 },
        { transform: `translate(${dir * u * 1.2}px,${-u * 0.9}px) rotate(${dir * 270}deg) scale(1)`, opacity: 1, offset: 0.3 },
        { transform: `translate(${dir * u * 2.4}px,${u * 3.2}px) rotate(${dir * 900}deg) scale(.3)`, opacity: 0 },
      ],
      { duration: 1500 / sp, easing: 'cubic-bezier(.35,.1,.7,.6)', fill: 'forwards' }
    );
    return a.finished;
  }
  // shatter: the figure bursts into cubes at once
  burstCubes(layer, env, x, y, `var(--seat-${seatOf(fig)})`, sp);
  fig.inner.style.visibility = 'hidden';
  return new Promise((resolve) => setTimeout(resolve, 80));
}

function seatOf(fig) {
  const m = /seat-(\d+)/.exec(fig.el.style.getPropertyValue('--c') || '');
  return m ? m[1] : 0;
}

export function sparkle(layer, x, y) {
  confettiBurst(layer, { u: 40 }, x, y, 1);
}
