// Cast list: seat colour, name, model, and a live status line for each contestant.
import { powerName, shortModel, ordinal, STAGE_TITLES } from '../lib/text.js';

const CAUSE = { glass: 'went through the glass', crusher: 'got flattened', pit: 'left in the pit', trapdoor: 'took the chute', ledge: 'fell off the ledge' };

export class Cast {
  constructor(list) {
    this.list = list;
    this.rows = new Map();
  }

  setTape(tape) {
    this.rows.clear();
    this.list.replaceChildren();
    (tape.players || []).forEach((p, k) => {
      const li = document.createElement('li');
      li.className = 'cast-row';
      li.style.setProperty('--c', `var(--seat-${k % 8})`);
      const sw = document.createElement('span');
      sw.className = 'cast-swatch';
      sw.setAttribute('aria-hidden', 'true');
      sw.textContent = p.name.slice(0, 1);
      const body = document.createElement('span');
      body.className = 'cast-body';
      const name = document.createElement('b');
      name.textContent = p.name;
      const model = document.createElement('span');
      model.className = 'cast-model';
      model.textContent = shortModel(p.model);
      model.title = p.model || '';
      const status = document.createElement('span');
      status.className = 'cast-status';
      const power = document.createElement('span');
      power.className = 'cast-power';
      body.append(name, model, status, power);
      li.append(sw, body);
      this.list.append(li);
      this.rows.set(p.name, { li, status, power });
    });
  }

  update(state, cut) {
    const showPower = cut || state.ended;
    for (const [name, row] of this.rows) {
      const p = state.players[name];
      if (!p) continue;
      let text = 'still in it';
      if (p.place) text = `${ordinal(p.place)} place`;
      else if (!p.alive && p.fate) text = `out: ${CAUSE[p.fate.cause] || 'eliminated'} (${STAGE_TITLES[p.fate.stage] || p.fate.stage})`;
      row.status.textContent = text;
      row.li.classList.toggle('out', !p.alive && !p.place);
      row.li.classList.toggle('winner', p.place === 1);
      row.power.hidden = !showPower;
      row.power.textContent = showPower ? `Power: ${powerName(p.power)}${state.spent[name] ? ' (used)' : ''}` : '';
    }
  }
}
