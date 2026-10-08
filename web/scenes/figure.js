// A blocky toy contestant: stud-topped cube head, rounded-box body, name tag.
import { h } from './common.js';
import { iconSvg } from '../lib/icons.js';
import { powerName } from '../lib/text.js';

export class Figure {
  constructor(player, seatIndex) {
    this.name = player.name;
    this.power = player.power;
    this.mode = 'alive'; // alive | gone
    this.last = { x: 50, y: 50 };
    this.tilt = (((seatIndex * 7) % 5) - 2) * 0.9;

    const el = h('div', 'fig');
    el.dataset.name = player.name;
    el.style.setProperty('--c', `var(--seat-${seatIndex % 8})`);
    el.style.setProperty('--tilt', `${this.tilt}deg`);
    const inner = h('div', 'fig-in');
    inner.append(h('span', 'shadow'), h('span', 'leg l'), h('span', 'leg r'));
    const body = h('span', 'body');
    body.append(h('span', 'letter', player.name.slice(0, 1).toUpperCase()));
    const head = h('span', 'head');
    head.append(h('i', 'eye l'), h('i', 'eye r'), h('i', 'mouth'));
    const badge = h('span', 'badge');
    badge.innerHTML = iconSvg(player.power);
    badge.title = powerName(player.power);
    inner.append(h('span', 'arm l'), h('span', 'arm r'), body, head, badge, h('span', 'crown'));
    const pips = h('span', 'pips');
    const tag = h('span', 'tag');
    this.num = h('span', 'num');
    tag.append(this.num, document.createTextNode(player.name));
    this.act = h('span', 'act');
    el.append(inner, pips, tag, this.act);
    this.el = el;
    this.inner = inner;
    this.pips = pips;
    this.badge = badge;
    this.tag = tag;
  }

  setPips(n, max) {
    if (n == null) {
      if (this.pips.childElementCount) this.pips.replaceChildren();
      this.pips.hidden = true;
      return;
    }
    this.pips.hidden = false;
    const shown = Math.max(max, n);
    if (this.pips.childElementCount !== shown) {
      this.pips.replaceChildren(...Array.from({ length: shown }, () => h('i')));
    }
    [...this.pips.children].forEach((pip, k) => pip.classList.toggle('off', k >= n));
    this.pips.setAttribute('aria-hidden', 'true');
  }

  setNum(n) {
    this.num.textContent = n == null ? '' : String(n);
    this.num.hidden = n == null;
  }

  setAct(text) {
    this.act.textContent = text || '';
    this.act.hidden = !text;
  }

  cancelAnimations() {
    for (const a of this.inner.getAnimations()) a.cancel();
  }
}
