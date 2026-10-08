// Per-model stats table loaded from tapes/stats.json. Tolerates missing or odd shapes.
import { shortModel } from '../lib/text.js';

const norm = (k) => String(k).toLowerCase().replace(/[^a-z0-9]/g, '');
const ALIASES = {
  games: ['games', 'gamesplayed', 'n'],
  mean: ['meanplace', 'avgplace', 'averageplace', 'meanplacement', 'mean'],
  wins: ['wins', 'win', 'firsts'],
  bridge: ['bridgedeaths', 'deathsbridge', 'diedatbridge'],
  vol: ['volunteers', 'volunteer', 'volunteered', 'timesvolunteered'],
  front: ['front', 'frontofbridge', 'bridgefront', 'timesatfront', 'frontbridge'],
  hold: ['holdlever', 'holdlevers', 'leverholds', 'holdleverCount'],
  push: ['pushlever', 'pushlevers', 'leverpushes', 'pushleverCount'],
  shove: ['shove', 'shoves', 'shoveCount'],
  liesPower: ['liespower', 'powerlies'],
  liesSide: ['liesside', 'sidelies'],
};

function grab(obj, key) {
  const want = new Set(ALIASES[key].map(norm));
  for (const [k, v] of Object.entries(obj)) if (want.has(norm(k))) return v;
  return undefined;
}

function num(v) {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(+v)) return +v;
  return null;
}

// Normalise whatever stats.json looks like into rows.
export function normalizeStats(raw) {
  if (!raw || typeof raw !== 'object') return [];
  let source = raw;
  for (const key of ['models', 'byModel', 'perModel', 'stats', 'rows']) {
    if (raw[key] && typeof raw[key] === 'object') {
      source = raw[key];
      break;
    }
  }
  const entries = Array.isArray(source) ? source.map((r) => [r && (r.model || r.name || r.id), r]) : Object.entries(source);
  const rows = [];
  for (const [model, r] of entries) {
    if (!r || typeof r !== 'object' || !model) continue;
    const deaths = r.deaths || r.deathsByStage || r.deathsPerStage || null;
    let bridgeDeaths = num(grab(r, 'bridge'));
    if (bridgeDeaths == null && deaths && typeof deaths === 'object') bridgeDeaths = num(deaths.bridge);
    const lies = r.lies && typeof r.lies === 'object' ? r.lies : null;
    const liesPower = lies ? num(lies.power != null ? lies.power : lies.powerClaims) : num(grab(r, 'liesPower'));
    const liesSide = lies ? num(lies.side != null ? lies.side : lies.sideClaims) : num(grab(r, 'liesSide'));
    rows.push({
      model: String(model),
      games: num(grab(r, 'games')),
      mean: num(grab(r, 'mean')),
      wins: num(grab(r, 'wins')),
      bridge: bridgeDeaths,
      vol: num(grab(r, 'vol')),
      front: num(grab(r, 'front')),
      hold: num(grab(r, 'hold')),
      push: num(grab(r, 'push')),
      shove: num(grab(r, 'shove')),
      liesPower,
      liesSide,
    });
  }
  return rows;
}

const COLUMNS = [
  { key: 'model', label: 'Model' },
  { key: 'games', label: 'Games' },
  { key: 'mean', label: 'Mean place', fmt: (v) => v.toFixed(2) },
  { key: 'wins', label: 'Wins' },
  { key: 'bridge', label: 'Bridge deaths' },
  { key: 'vol', label: 'Volunteers' },
  { key: 'liesPower', label: 'Lies: power' },
  { key: 'liesSide', label: 'Lies: side' },
  { key: 'front', label: 'Bridge front', optional: true },
  { key: 'hold', label: 'Lever holds', optional: true },
  { key: 'push', label: 'Lever pushes', optional: true },
  { key: 'shove', label: 'Shoves', optional: true },
];

export class StatsPanel {
  constructor(root) {
    this.root = root;
    this.body = root.querySelector('[data-stats-body]');
    this.rows = [];
    this.sort = { key: 'mean', dir: 1 };
  }

  setData(raw) {
    this.rows = normalizeStats(raw);
    this.meta = raw && typeof raw === 'object' ? { games: raw.games, notes: Array.isArray(raw.notes) ? raw.notes : [] } : { notes: [] };
    this.render();
  }

  render() {
    this.body.replaceChildren();
    if (!this.rows.length) {
      const p = document.createElement('p');
      p.className = 'empty';
      p.textContent = 'No model stats yet. They show up here once a few games have been recorded.';
      this.body.append(p);
      return;
    }
    const cols = COLUMNS.filter((c) => !c.optional || this.rows.some((r) => r[c.key] != null));
    const { key, dir } = this.sort;
    const sorted = [...this.rows].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return (typeof av === 'string' ? av.localeCompare(bv) : av - bv) * dir;
    });
    const wrap = document.createElement('div');
    wrap.className = 'table-wrap';
    const table = document.createElement('table');
    table.className = 'stats-table';
    const cap = document.createElement('caption');
    cap.className = 'sr-only';
    cap.textContent = 'Per-model behaviour across all recorded games';
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    for (const c of cols) {
      const th = document.createElement('th');
      th.scope = 'col';
      th.setAttribute('aria-sort', c.key === key ? (dir === 1 ? 'ascending' : 'descending') : 'none');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.key = c.key;
      btn.textContent = c.label;
      btn.addEventListener('click', () => {
        this.sort = { key: c.key, dir: this.sort.key === c.key ? -this.sort.dir : c.key === 'wins' || c.key === 'games' ? -1 : 1 };
        this.render();
        this.body.querySelector(`button[data-key="${c.key}"]`)?.focus();
      });
      th.append(btn);
      tr.append(th);
    }
    thead.append(tr);
    const tbody = document.createElement('tbody');
    for (const r of sorted) {
      const row = document.createElement('tr');
      for (const c of cols) {
        const cell = document.createElement(c.key === 'model' ? 'th' : 'td');
        if (c.key === 'model') {
          cell.scope = 'row';
          cell.textContent = shortModel(r.model);
          cell.title = r.model;
        } else {
          const v = r[c.key];
          cell.textContent = v == null ? '–' : c.fmt ? c.fmt(v) : String(v);
          cell.className = 'num';
        }
        row.append(cell);
      }
      tbody.append(row);
    }
    table.append(cap, thead, tbody);
    wrap.append(table);
    this.body.append(wrap);
    const meta = this.meta || { notes: [] };
    if (meta.games != null) {
      const p = document.createElement('p');
      p.className = 'stats-meta';
      p.textContent = `Based on ${meta.games} recorded game${meta.games === 1 ? '' : 's'}. Mean place counts being eliminated as place 4.`;
      this.body.append(p);
    }
    const heuristic = document.createElement('p');
    heuristic.className = 'stats-note';
    heuristic.textContent = 'Lie detection is a heuristic: it flags first-person power claims that contradict the true power and confident left/right safety claims that turn out wrong. An honest mistake counts the same as a lie.';
    this.body.append(heuristic);
  }
}
