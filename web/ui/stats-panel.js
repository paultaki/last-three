// Per-model stats table loaded from tapes/stats.json. Tolerates missing or odd shapes.
import { shortModel } from '../lib/text.js';

const norm = (k) => String(k).toLowerCase().replace(/[^a-z0-9]/g, '');
const ALIASES = {
  games: ['games', 'gamesplayed', 'n'],
  mean: ['meanplace', 'avgplace', 'averageplace', 'meanplacement', 'mean'],
  wins: ['wins', 'win', 'firsts'],
  bridge: ['bridgedeaths', 'deathsbridge', 'diedatbridge'],
  top3: ['top3', 'topthree', 'podiums'],
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

function stageDeaths(r, deaths, stage) {
  if (deaths && typeof deaths === 'object') return num(deaths[stage]);
  return num(r[`${stage}Deaths`]);
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
      top3: num(grab(r, 'top3')),
      crusher: stageDeaths(r, deaths, 'crusher'),
      // stats written before the Pit existed have no pit key: nobody died there, so that is a 0
      pit: stageDeaths(r, deaths, 'pit') ?? (deaths && typeof deaths === 'object' ? 0 : null),
      disc: stageDeaths(r, deaths, 'disc'),
      ledge: stageDeaths(r, deaths, 'ledge'),
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

// "Stats for rules v3 (6 games). Older rules: v1 24 games, v2 8 games, not counted here."
export function rulesLine(raw) {
  const v = Number(raw && raw.rulesVersion);
  if (!Number.isInteger(v) || v < 1) return null;
  const by = raw.tapesByRules && typeof raw.tapesByRules === 'object' ? raw.tapesByRules : {};
  const games = (n) => `${n} game${n === 1 ? '' : 's'}`;
  const n = Number.isFinite(Number(by[v])) ? Number(by[v]) : Number(raw.games);
  const older = Object.keys(by)
    .map(Number)
    .filter((k) => k !== v && by[k] > 0)
    .sort((a, b) => a - b)
    .map((k) => `v${k} ${games(by[k])}`);
  const head = `Stats for rules v${v}${Number.isFinite(n) ? ` (${games(n)})` : ''}.`;
  return older.length ? `${head} Older rules: ${older.join(', ')}, not counted here.` : head;
}

const COLUMNS = [
  { key: 'model', label: 'Model' },
  { key: 'games', label: 'Games' },
  { key: 'mean', label: 'Mean place', fmt: (v) => v.toFixed(2) },
  { key: 'wins', label: 'Wins' },
  { key: 'top3', label: 'Top 3', optional: true },
  { key: 'bridge', label: 'Out: bridge' },
  { key: 'crusher', label: 'Out: crusher', optional: true },
  { key: 'pit', label: 'Out: pit', title: 'Eliminated when the pit flooded', optional: true },
  { key: 'disc', label: 'Out: disc', optional: true },
  { key: 'ledge', label: 'Out: ledge', optional: true },
  { key: 'vol', label: 'Volunteers' },
  { key: 'liesPower', label: 'Lies: power' },
  { key: 'liesSide', label: 'Lies: side' },
  { key: 'front', label: 'Front', title: 'Games with at least one real step on the bridge', optional: true },
  { key: 'hold', label: 'Holds', title: 'Times they held the crusher lever', optional: true },
  { key: 'push', label: 'Pushes', title: 'Times they pushed someone onto the lever', optional: true },
  { key: 'shove', label: 'Shoves', title: 'Shoves on the ledge', optional: true },
];
const HIGHER_FIRST = new Set(['wins', 'games', 'top3', 'vol']);

export class StatsPanel {
  constructor(root) {
    this.root = root;
    this.body = root.querySelector('[data-stats-body]');
    this.rows = [];
    this.sort = { key: 'mean', dir: 1 };
  }

  setData(raw) {
    this.rows = normalizeStats(raw);
    this.meta = raw && typeof raw === 'object' ? { games: raw.games, generatedAt: raw.generatedAt, notes: Array.isArray(raw.notes) ? raw.notes : [], rules: rulesLine(raw) } : { notes: [] };
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
      const d = (typeof av === 'string' ? av.localeCompare(bv) : av - bv) * dir;
      // ties: more wins first, then name, so the order never looks random
      return d || (b.wins || 0) - (a.wins || 0) || a.model.localeCompare(b.model);
    });
    if (this.meta && this.meta.rules) {
      const line = document.createElement('p');
      line.className = 'stats-rules';
      line.textContent = this.meta.rules;
      this.body.append(line);
    }
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
      if (c.title) btn.title = c.title;
      btn.addEventListener('click', () => {
        this.sort = { key: c.key, dir: this.sort.key === c.key ? -this.sort.dir : HIGHER_FIRST.has(c.key) ? -1 : 1 };
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
      p.textContent = `Based on ${meta.games} recorded game${meta.games === 1 ? '' : 's'}${meta.generatedAt ? `, updated ${String(meta.generatedAt).slice(0, 10)}` : ''}.`;
      this.body.append(p);
    }
    const hint = document.createElement('p');
    hint.className = 'stats-scroll';
    hint.textContent = 'Swipe the table sideways for more columns.';
    wrap.after(hint);
    // The caveat stays visible; the file's own notes win when it has them.
    const notes = meta.notes.length ? meta.notes : ['Lie detection is a heuristic: it flags first-person power claims that contradict the true power and confident left/right safety claims that turn out wrong. An honest mistake counts the same as a lie.'];
    for (const text of notes) {
      const note = document.createElement('p');
      note.className = 'stats-note';
      note.textContent = String(text);
      this.body.append(note);
    }
  }
}
