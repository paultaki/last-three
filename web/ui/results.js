// Results card, shown once the tape reaches game_end.
import { powerName, shortModel, ordinal, STAGE_TITLES, deathCaption, chalkBy } from '../lib/text.js';

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

// Notes are public: the earlier ones are only tagged by place, this game's by author and final place.
function chalkSection(root, state, seat) {
  const c = state.chalk;
  if (!c || (!c.shown.length && !c.epilogue)) return;
  root.append(el('h3', null, 'The chalk wall'));
  if (c.shown.length) {
    root.append(el('p', 'chalk-sub', 'On the wall when the game began'));
    const old = el('ul', 'chalk-results');
    for (const n of c.shown) {
      const li = el('li');
      li.append(el('q', null, n.text), el('span', 'by', chalkBy(n.byPlace)));
      old.append(li);
    }
    root.append(old);
  }
  if (!c.epilogue) return;
  root.append(el('p', 'chalk-sub', 'Left on the wall by this game\u2019s finishers'));
  if (!c.written.length) {
    root.append(el('p', null, 'Nobody left a message.'));
    return;
  }
  const mine = el('ul', 'chalk-results');
  for (const w of c.written) {
    const li = el('li');
    li.style.setProperty('--c', `var(--seat-${(seat[w.name] || 0) % 8})`);
    const place = state.players[w.name] && state.players[w.name].place;
    li.append(el('q', null, w.text), el('span', 'by', `${w.name}, ${ordinal(place || w.place)} place`));
    mine.append(li);
  }
  root.append(mine);
}

export function renderResults(root, state, tape) {
  root.replaceChildren();
  if (!state.ended) {
    root.hidden = true;
    return;
  }
  root.hidden = false;
  const seat = {};
  (tape.players || []).forEach((p, k) => (seat[p.name] = k % 8));

  root.append(el('h2', 'results-title', state.winner ? `${state.winner} wins!` : 'Game over'));

  const medals = el('ol', 'medals');
  const placed = state.order
    .filter((n) => typeof state.players[n].place === 'number')
    .sort((a, b) => state.players[a].place - state.players[b].place);
  for (const name of placed) {
    const p = state.players[name];
    const li = el('li', `medal place-${p.place}`);
    const disc = el('span', 'medal-disc', String(p.place));
    disc.setAttribute('aria-hidden', 'true');
    const text = el('span', 'medal-text');
    const who = el('b', 'medal-name', name);
    who.style.setProperty('--c', `var(--seat-${seat[name] % 8})`);
    text.append(el('span', 'medal-place', `${ordinal(p.place)} place`), who, el('span', 'medal-model', shortModel(p.model)), el('span', 'medal-power', `Power: ${powerName(p.power)}`));
    li.append(disc, text);
    medals.append(li);
  }
  if (!placed.length) medals.append(el('li', 'medal', 'Nobody finished in the top three.'));
  root.append(medals);

  chalkSection(root, state, seat);

  root.append(el('h3', null, 'Who went where'));
  const deaths = el('ol', 'death-list');
  for (const d of state.deaths) {
    const li = el('li', `death-${d.style || 'x'}`);
    li.dataset.style = d.style || '';
    li.append(el('span', 'death-text', deathCaption(d.name, d.style, d.i, d.place)), el('span', 'death-where', `${STAGE_TITLES[d.stage] || d.stage}, ${d.cause || 'unknown cause'}`));
    deaths.append(li);
  }
  if (!state.deaths.length) deaths.append(el('li', null, 'Nobody was eliminated.'));
  root.append(deaths);

  root.append(el('h3', null, 'The eight players'));
  const wrap = el('div', 'table-wrap');
  const table = el('table', 'cast-table');
  table.append(el('caption', 'sr-only', 'Each player with model, power and fate'));
  const thead = el('thead');
  const head = el('tr');
  for (const t of ['Player', 'Model', 'Power', 'Fate']) {
    const th = el('th', null, t);
    th.scope = 'col';
    head.append(th);
  }
  thead.append(head);
  table.append(thead);
  const body = el('tbody');
  for (const name of state.order) {
    const p = state.players[name];
    const tr = el('tr');
    const th = el('th', null, name);
    th.scope = 'row';
    let fate = 'Alive';
    if (p.place) fate = `${ordinal(p.place)} place`;
    else if (p.fate) fate = `Out at ${STAGE_TITLES[p.fate.stage] || p.fate.stage} (${p.fate.cause})`;
    const modelCell = el('td', 'mono', shortModel(p.model));
    modelCell.title = p.model || '';
    tr.append(th, modelCell, el('td', null, powerName(p.power)), el('td', null, fate));
    body.append(tr);
  }
  table.append(body);
  wrap.append(table);
  root.append(wrap);
}
