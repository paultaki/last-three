// The arena: owns the figure sprites, bubbles and fx, and swaps scene decor per stage.
import { h, measure } from './common.js';
import { Figure } from './figure.js';
import { Bubbles } from './bubbles.js';
import { playDeath, popChip } from './fx.js';
import { powerName, capText } from '../lib/text.js';
import lobby from './lobby.js';
import bridge from './bridge.js';
import crusher from './crusher.js';
import pit from './pit.js';
import disc from './disc.js';
import ledge from './ledge.js';
import podium from './podium.js';

const SCENES = { lobby, bridge, crusher, pit, disc, ledge, podium };
const SVG_NS = 'http://www.w3.org/2000/svg';
const MAX_BUBBLES = 3;
const MAX_BUBBLES_NARROW = 2; // a phone screen has no room for a third without covering faces

export class Arena {
  constructor(root, hud) {
    this.root = root;
    this.hud = hud;
    this.sceneLayer = h('div', 'layer layer-scene');
    this.figLayer = h('div', 'layer layer-figs');
    this.overLayer = h('div', 'layer layer-over');
    this.linkSvg = document.createElementNS(SVG_NS, 'svg');
    this.linkSvg.setAttribute('class', 'layer layer-links');
    this.linkSvg.setAttribute('aria-hidden', 'true');
    this.fxLayer = h('div', 'layer layer-fx');
    this.bubbleLayer = h('div', 'layer layer-bubbles');
    root.replaceChildren(this.sceneLayer, this.figLayer, this.overLayer, this.linkSvg, this.fxLayer, this.bubbleLayer);
    this.bubbles = new Bubbles(this.bubbleLayer, this.linkSvg);
    this.figures = new Map();
    this.seats = new Map();
    this.sceneId = null;
    this.handle = null;
    this.prev = null;
    this.lastState = null;
    this.lastOpts = {};
    this.lastFlash = -1;
    this.cut = false;
    this.envKey = '';
    this.env = measure(root);
    if (typeof ResizeObserver !== 'undefined') {
      let frame = 0;
      this.observer = new ResizeObserver(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => this.onResize());
      });
      this.observer.observe(root);
    }
  }

  setTape(tape) {
    this.figLayer.replaceChildren();
    this.fxLayer.replaceChildren();
    this.bubbles.clear();
    this.figures.clear();
    this.prev = null;
    this.lastState = null;
    this.sceneId = null;
    this.lastFlash = -1;
    (tape.players || []).forEach((p, k) => {
      const fig = new Figure(p, k);
      this.figures.set(p.name, fig);
      this.seats.set(p.name, k % 8);
      this.figLayer.append(fig.el);
    });
  }

  setCut(cut) {
    this.cut = !!cut;
    this.root.classList.toggle('cut', this.cut);
  }

  onResize() {
    this.env = measure(this.root);
    if (this.lastState) this.render(this.lastState, { animate: false, speed: 1, force: true });
  }

  sceneFor(state) {
    if (state.ended) return 'podium';
    return SCENES[state.stage] ? state.stage : 'lobby';
  }

  render(state, opts = {}) {
    const animate = !!opts.animate;
    const speed = opts.speed || 1;
    this.lastState = state;
    this.lastOpts = opts;
    const env = (this.env = measure(this.root));
    const key = `${Math.round(env.W)}x${Math.round(env.H)}`;
    this.root.classList.toggle('instant', !animate);
    this.root.style.setProperty('--move', animate ? `${Math.max(140, 560 / speed)}ms` : '0ms');
    this.root.classList.toggle('cut', this.cut);
    this.root.classList.toggle('portrait', env.portrait);

    const sceneId = this.sceneFor(state);
    const changed = sceneId !== this.sceneId;
    if (changed || key !== this.envKey || opts.force) {
      this.mountScene(sceneId, env, animate && changed);
      this.envKey = key;
    }
    this.root.dataset.scene = sceneId;
    const layout = SCENES[sceneId].update(this.handle, state, env, { cut: this.cut });
    const pos = layout.pos || {};
    if (layout.dropIn && animate && changed) {
      // new arrivals fall in from above the arena
      for (const [name, L] of Object.entries(pos)) {
        const fig = this.figures.get(name);
        if (!fig) continue;
        Object.assign(fig.el.style, { transition: 'none', left: `${L.x}%`, top: '-14%' });
        void fig.el.offsetWidth;
        fig.el.style.transition = '';
        fig.last = { x: L.x, y: -14 };
      }
    }
    const uf = env.u * (layout.scale || 1);
    this.root.style.setProperty('--u', `${uf}px`);
    this.uf = uf;
    this.waterY = layout.waterY != null ? layout.waterY : null;
    this.bub = layout.bubbles || {}; // per-scene bubble tuning: figWeight, lift, wide, budget, cap
    this.speed = speed;
    const prev = this.prev;
    const anchors = {};

    for (const [name, fig] of this.figures) {
      const player = state.players[name];
      if (!player) continue;
      const L = pos[name];
      const onPodium = sceneId === 'podium' && !!L;
      if (!player.alive && !onPodium) {
        this.killFigure(name, fig, player, prev, animate, speed, env, anchors);
        continue;
      }
      this.reviveFigure(fig);
      if (!L) {
        fig.el.classList.add('off');
        continue;
      }
      fig.el.classList.remove('off');
      this.placeFigure(fig, L, animate, env);
      if (L.x >= 0 && L.x <= 100) anchors[name] = { x: (L.x / 100) * env.W, top: (L.y / 100) * env.H - uf * 1.95, feet: (L.y / 100) * env.H };
    }

    // pose / state classes
    const speakingNow = state.speech.length && state.speech[state.speech.length - 1].i === state.i ? state.speech[state.speech.length - 1] : null;
    for (const [name, fig] of this.figures) {
      const L = pos[name] || {};
      const tokens = ['fig'];
      if (L.cls) tokens.push(...String(L.cls).split(' ').filter(Boolean));
      if (speakingNow && speakingNow.as === name && speakingNow.kind !== 'whisper') tokens.push('talk');
      if (L.face === 'l') tokens.push('face-l');
      if (fig.mode === 'gone') tokens.push('gone');
      if (fig.el.classList.contains('off')) tokens.push('off');
      fig.el.className = tokens.join(' ');
      const player = state.players[name];
      if (player && player.fate) fig.el.dataset.fate = player.fate.style || '';
      else delete fig.el.dataset.fate;
      fig.setPips(L.pips != null && player.alive ? L.pips : null, 4);
      fig.setNum(L.num != null && player.alive ? L.num : null);
      fig.setAct(player.alive || sceneId === 'podium' ? L.act : '');
      fig.setNote(player.alive ? L.note : '');
    }

    this.keep = (layout.keep || []).map((k) => ({ name: null, wt: k.wt || 9, l: (k.x / 100) * env.W, r: ((k.x + k.w) / 100) * env.W, t: (k.y / 100) * env.H, b: ((k.y + k.h) / 100) * env.H }));
    this.renderBubbles(state, anchors, env, animate, !!opts.fade, speed);
    this.renderFlash(state, anchors, animate);
    this.renderHud(layout.hud, state);
    this.prev = state;
  }

  mountScene(id, env, fade) {
    const scene = SCENES[id];
    this.sceneLayer.replaceChildren();
    this.handle = scene.mount(env);
    this.handle.root.classList.add('layer-fill');
    if (fade) this.handle.root.classList.add('enter');
    this.sceneLayer.append(this.handle.root);
    this.overLayer.replaceChildren();
    if (this.handle.overlay) this.overLayer.append(this.handle.overlay);
    this.sceneId = id;
  }

  placeFigure(fig, L, animate, env) {
    const moved = Math.abs(fig.last.x - L.x) > 1.2 || Math.abs(fig.last.y - L.y) > 1.2;
    fig.el.style.left = `${L.x}%`;
    fig.el.style.top = `${L.y}%`;
    fig.el.style.zIndex = String(Math.round(L.y * 10));
    fig.el.style.transitionDelay = animate && L.delay ? `${L.delay}ms` : '0ms';
    if (animate && moved && !this.root.classList.contains('reduced')) {
      fig.inner.animate(
        [{ transform: 'translateY(0)' }, { transform: `translateY(${-env.u * 0.28}px)` }, { transform: 'translateY(0)' }],
        { duration: 420, easing: 'ease-out' }
      );
    }
    if (animate && moved && L.via && L.via.length && !this.root.classList.contains('reduced')) {
      // A climb or a haul: follow the waypoints (the final position is already in the style).
      const pt = (v) => ({ left: `${v.x}%`, top: `${v.y}%` });
      const dur = Math.max(500, 1500 / (this.speed || 1));
      fig.el.animate([pt(fig.last), ...L.via.map(pt), pt(L)], { duration: dur, easing: 'ease-in-out' });
    }
    fig.last = { x: L.x, y: L.y };
  }

  reviveFigure(fig) {
    if (fig.mode === 'alive') return;
    fig.cancelAnimations();
    fig.inner.style.visibility = '';
    fig.mode = 'alive';
  }

  killFigure(name, fig, player, prev, animate, speed, env, anchors) {
    if (fig.mode === 'gone') return;
    if (fig.mode === 'dying') {
      anchors[name] = { x: (fig.last.x / 100) * env.W, top: (fig.last.y / 100) * env.H - (this.uf || env.u) * 1.95, feet: (fig.last.y / 100) * env.H };
      return;
    }
    const wasAlive = prev && prev.players[name] && prev.players[name].alive;
    const style = (player.fate && player.fate.style) || 'shatter';
    if (animate && wasAlive && !fig.el.classList.contains('off')) {
      fig.mode = 'dying';
      anchors[name] = { x: (fig.last.x / 100) * env.W, top: (fig.last.y / 100) * env.H - (this.uf || env.u) * 1.95, feet: (fig.last.y / 100) * env.H };
      const done = playDeath(style, fig, this.fxLayer, { ...env, u: this.uf || env.u, waterY: this.waterY }, speed);
      Promise.resolve(done).then(
        () => {
          if (fig.mode === 'dying') fig.mode = 'gone';
          fig.el.classList.add('gone');
        },
        () => {
          if (fig.mode === 'dying') fig.mode = 'gone';
        }
      );
    } else {
      fig.cancelAnimations();
      fig.mode = 'gone';
    }
  }

  renderBubbles(state, anchors, env, animate, fade, speed) {
    // Newest speakers first: only lines whose speaker is on screen count towards the cap.
    let items = state.speech
      .filter((s) => (s.kind === 'say' || this.cut) && (anchors[s.as] || anchors[s.name]))
      .slice(env.portrait ? -MAX_BUBBLES_NARROW : -MAX_BUBBLES)
      .map((s) => ({ key: `${s.i}${this.cut ? 'c' : ''}`, kind: s.kind, seat: this.seats.get(s.as) ?? this.seats.get(s.name) ?? 0, name: s.name, as: s.as, to: s.to, text: capText(s.text, this.bub.cap), forgedAs: s.forgedAs }));
    if (this.bub.budget) {
      // little free room: older lines go once the text outgrows the budget
      let used = 0;
      items = items.reduceRight((keep, it) => ((used += it.text.length) <= this.bub.budget || !keep.length ? [it, ...keep] : keep), []);
    }
    this.bubbles.render(items, anchors, env, { animate, cut: this.cut, u: this.uf || env.u, fade, speed, keep: this.keep || [], ...this.bub });
  }

  // Paused or scrubbed: bring faded bubbles back so nothing is lost while reading.
  pinBubbles() {
    this.bubbles.pin();
    if (this.lastState) this.render(this.lastState, { animate: false, speed: this.lastOpts.speed || 1 });
  }

  renderFlash(state, anchors, animate) {
    const f = state.flash;
    if (!f || f.i === this.lastFlash) {
      if (!f) this.lastFlash = -1;
      return;
    }
    this.lastFlash = f.i;
    if (!animate) return;
    const fig = this.figures.get(f.name);
    if (!fig) return;
    const text = f.kind === 'pit' ? f.text : f.kind === 'lucky' ? 'LUCKY!' : f.power === 'feather' ? 'BOING!' : f.power === 'wedge' ? 'JAMMED!' : f.power === 'swap' ? 'SWAP!' : this.cut ? powerName(f.power).toUpperCase() : null;
    if (text) popChip(this.fxLayer, text, fig.last.x, fig.last.y - 14, 'fx-ability');
  }

  renderHud(hud, state) {
    if (!this.hud) return;
    const h1 = hud || {};
    this.hud.querySelector('.hud-title').textContent = h1.left || '';
    this.hud.querySelector('.hud-sub').textContent = h1.sub || '';
    this.hud.querySelector('.hud-right').textContent = h1.right || '';
    const alive = state.order.filter((n) => state.players[n].alive);
    this.root.setAttribute('aria-label', `Arena. ${h1.left || ''}. ${h1.right || ''}. Standing: ${alive.join(', ') || 'nobody'}.`);
  }
}
