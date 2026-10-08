// Last Three replay viewer: loads a tape, then renders stateAt(tape, i). Nothing else is simulated.
import { stateAt, chapters, isStepWorthy } from './lib/state.js';
import { STAGE_SHORT, shortModel } from './lib/text.js';
import { Arena } from './scenes/arena.js';
import { Transcript } from './ui/transcript.js';
import { Cast } from './ui/cast.js';
import { renderResults } from './ui/results.js';
import { StatsPanel } from './ui/stats-panel.js';

const $ = (id) => document.getElementById(id);
const reducedQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false, addEventListener() {} };

const els = {
  picker: $('tape-picker'),
  meta: $('tape-meta'),
  error: $('load-error'),
  empty: $('empty'),
  player: $('player'),
  arena: $('arena'),
  hud: $('stage-hud'),
  now: $('now'),
  back: $('btn-back'),
  play: $('btn-play'),
  playText: $('play-text'),
  fwd: $('btn-fwd'),
  speed: $('speed'),
  scrub: $('scrubber'),
  scrubLabel: $('scrub-label'),
  ticks: $('ticks'),
  chapters: $('chapters'),
  cut: $('btn-cut'),
  share: $('btn-share'),
  shareStatus: $('share-status'),
  results: $('results'),
  cast: $('cast'),
  transcript: $('transcript'),
  transcriptScroll: $('transcript-scroll'),
  stats: $('stats'),
};

const app = {
  index: [],
  tapeId: null,
  tape: null,
  idx: 0,
  playing: false,
  speed: 1,
  cut: false,
  timer: 0,
  chapterList: [],
  chapterButtons: [],
  state: null,
};

const arena = new Arena(els.arena, els.hud);
const castUi = new Cast(els.cast);
const transcript = new Transcript(els.transcript, els.transcriptScroll, (i) => {
  pause();
  goto(i, { animate: false });
});
const statsPanel = new StatsPanel(els.stats);

const safeId = (id) => (/^[A-Za-z0-9._-]+$/.test(String(id)) ? String(id) : null);
const lastIndex = () => (app.tape ? app.tape.events.length - 1 : 0);
const reduced = () => reducedQuery.matches;

// ------------------------------------------------------------------ loading
async function getJson(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
}

function showError(message) {
  els.error.textContent = message;
  els.error.hidden = !message;
}

function validTape(tape) {
  return tape && Array.isArray(tape.players) && tape.players.length > 0 && Array.isArray(tape.events) && tape.events.length > 0;
}

function describeEntry(e) {
  const when = e.createdAt ? new Date(e.createdAt).toISOString().slice(0, 10) : '';
  const winner = e.winner ? `${e.winner} wins` : 'no winner';
  return `${e.id} • ${winner}${when ? ` • ${when}` : ''}`;
}

function fillPicker(selected) {
  els.picker.replaceChildren();
  const entries = app.index.slice();
  if (selected && !entries.some((e) => e.id === selected)) entries.push({ id: selected });
  for (const e of entries) {
    const opt = document.createElement('option');
    opt.value = e.id;
    opt.textContent = describeEntry(e);
    els.picker.append(opt);
  }
  els.picker.disabled = entries.length === 0;
  if (selected) els.picker.value = selected;
}

async function loadTape(id, startAt = 0) {
  pause();
  const safe = safeId(id);
  if (!safe) {
    showError(`"${id}" is not a valid tape id.`);
    return;
  }
  try {
    const tape = await getJson(`tapes/${encodeURIComponent(safe)}.json`);
    if (!validTape(tape)) throw new Error('This tape has no players or events.');
    showError('');
    app.tape = tape;
    app.tapeId = safe;
    app.idx = 0;
    els.player.hidden = false;
    els.empty.hidden = true;
    arena.setTape(tape);
    arena.setCut(app.cut);
    castUi.setTape(tape);
    transcript.setTape(tape);
    setupScrubber(tape);
    fillPicker(safe);
    const entry = app.index.find((e) => e.id === safe);
    const models = new Set(tape.players.map((p) => shortModel(p.model)));
    const when = tape.createdAt ? new Date(tape.createdAt).toISOString().slice(0, 10) : '';
    els.meta.textContent = `${tape.events.length} events, ${models.size} different models${when ? `, recorded ${when}` : ''}${entry && entry.usd != null ? `, $${Number(entry.usd).toFixed(2)}` : ''}`;
    goto(startAt, { animate: false });
  } catch (err) {
    showError(`Could not load tape "${safe}": ${err.message}`);
    els.now.textContent = 'This tape could not be loaded.';
  }
}

function setupScrubber(tape) {
  const last = tape.events.length - 1;
  els.scrub.max = String(last);
  els.scrub.value = '0';
  app.chapterList = chapters(tape);
  els.ticks.replaceChildren();
  els.chapters.replaceChildren();
  app.chapterButtons = [];
  for (const c of app.chapterList) {
    if (c.id !== 'start') {
      const tick = document.createElement('i');
      tick.style.left = `${last ? (c.i / last) * 100 : 0}%`;
      els.ticks.append(tick);
    }
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chapter';
    btn.dataset.chapter = c.id;
    btn.textContent = STAGE_SHORT[c.id] || c.id;
    btn.setAttribute('aria-label', `Jump to ${STAGE_SHORT[c.id] || c.id}`);
    btn.addEventListener('click', () => {
      pause();
      goto(c.i, { animate: false });
    });
    els.chapters.append(btn);
    app.chapterButtons.push(btn);
  }
}

// ------------------------------------------------------------------ rendering
function goto(i, { animate = false } = {}) {
  if (!app.tape) return;
  const last = lastIndex();
  const idx = Math.max(0, Math.min(last, Math.floor(Number.isFinite(+i) ? +i : 0)));
  app.idx = idx;
  const state = stateAt(app.tape, idx);
  app.state = state;
  const doAnimate = animate && !reduced();
  arena.render(state, { animate: doAnimate, speed: app.speed });
  transcript.update(idx, app.cut);
  castUi.update(state, app.cut);
  renderResults(els.results, state, app.tape);
  const resultsTitle = els.results.querySelector('.results-title');
  if (resultsTitle) resultsTitle.id = 'results-h';
  const cap = app.cut ? state.captionCut : state.caption;
  els.now.textContent = cap ? cap.text : idx === 0 && !state.started ? 'Press Play to start the show.' : 'Press Play to start the show.';
  els.scrub.value = String(idx);
  els.scrub.setAttribute('aria-valuetext', `Event ${idx + 1} of ${last + 1}`);
  els.scrubLabel.textContent = `Event ${idx + 1} of ${last + 1}`;
  els.back.disabled = idx <= 0;
  els.fwd.disabled = idx >= last;
  const current = state.ended ? 'results' : state.stage === 'lobby' ? 'start' : state.stage;
  app.chapterButtons.forEach((b) => {
    const on = b.dataset.chapter === current;
    b.classList.toggle('on', on);
    if (on) b.setAttribute('aria-current', 'true');
    else b.removeAttribute('aria-current');
  });
  syncUrl();
}

function shareUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set('tape', app.tapeId || '');
  url.searchParams.set('i', String(app.idx));
  if (app.cut) url.searchParams.set('cut', '1');
  else url.searchParams.delete('cut');
  return url;
}

function syncUrl() {
  try {
    window.history.replaceState(null, '', shareUrl());
  } catch {
    /* some sandboxes forbid history changes; the viewer still works */
  }
}

// ------------------------------------------------------------------ playback
function nextWorthy(from, dir) {
  const events = app.tape.events;
  const last = events.length - 1;
  let j = from + dir;
  while (j > 0 && j < last && !isStepWorthy(events[j], app.cut)) j += dir;
  return Math.max(0, Math.min(last, j));
}

function dwell(ev) {
  if (!ev) return 400;
  const len = (ev.text || '').length;
  switch (ev.type) {
    case 'say':
      return Math.min(3400, 900 + len * 34);
    case 'thought':
    case 'whisper':
      return app.cut ? Math.min(3000, 800 + len * 30) : 30;
    case 'death':
      return 2600;
    case 'stage_start':
      return 2000;
    case 'stage_end':
      return 1200;
    case 'round_start':
      return 700;
    case 'reveal':
      return ev.what === 'weak_pane' ? 1000 : 750;
    case 'ability_use':
      return app.cut ? 1500 : 1300;
    case 'lucky_save':
      return 1800;
    case 'game_start':
      return 1600;
    case 'game_end':
      return 1500;
    case 'action':
      return ev.auto ? 700 : 620;
    default:
      return 500;
  }
}

function schedule() {
  clearTimeout(app.timer);
  if (!app.playing) return;
  const ev = app.tape.events[app.idx];
  const wait = Math.max(120, dwell(ev) / app.speed);
  app.timer = setTimeout(tick, wait);
}

function tick() {
  if (!app.playing) return;
  if (app.idx >= lastIndex()) {
    pause();
    return;
  }
  goto(nextWorthy(app.idx, 1), { animate: true });
  if (app.idx >= lastIndex()) {
    // let the final event land, then stop
    app.timer = setTimeout(pause, Math.max(200, dwell(app.tape.events[app.idx]) / app.speed));
    return;
  }
  schedule();
}

function setPlayingUi() {
  els.play.setAttribute('aria-pressed', String(app.playing));
  els.play.setAttribute('aria-label', app.playing ? 'Pause' : 'Play');
  els.playText.textContent = app.playing ? 'Pause' : 'Play';
  els.play.querySelector('.ic-play').hidden = app.playing;
  els.play.querySelector('.ic-pause').hidden = !app.playing;
}

function play() {
  if (!app.tape) return;
  if (app.idx >= lastIndex()) goto(0, { animate: false });
  app.playing = true;
  setPlayingUi();
  // first step comes quickly so the button feels responsive
  clearTimeout(app.timer);
  app.timer = setTimeout(tick, 250);
}

function pause() {
  app.playing = false;
  clearTimeout(app.timer);
  setPlayingUi();
}

function step(dir) {
  if (!app.tape) return;
  pause();
  goto(nextWorthy(app.idx, dir), { animate: dir > 0 });
}

function setCut(on) {
  app.cut = !!on;
  els.cut.setAttribute('aria-pressed', String(app.cut));
  arena.setCut(app.cut);
  if (app.tape) goto(app.idx, { animate: false });
}

// ------------------------------------------------------------------ events
els.play.addEventListener('click', () => (app.playing ? pause() : play()));
els.back.addEventListener('click', () => step(-1));
els.fwd.addEventListener('click', () => step(1));
els.speed.addEventListener('change', () => {
  app.speed = Number(els.speed.value) || 1;
  if (app.playing) schedule();
});
els.scrub.addEventListener('input', () => {
  pause();
  goto(Number(els.scrub.value), { animate: false });
});
els.cut.addEventListener('click', () => setCut(!app.cut));
els.picker.addEventListener('change', () => loadTape(els.picker.value, 0));
els.share.addEventListener('click', async () => {
  const url = shareUrl().toString();
  let msg = 'Link copied';
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    msg = 'Copy this address: ' + url;
  }
  els.shareStatus.textContent = msg;
  clearTimeout(els.share._t);
  els.share._t = setTimeout(() => (els.shareStatus.textContent = ''), 4000);
});

document.addEventListener('keydown', (e) => {
  if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
  const t = e.target;
  const tag = t && t.tagName;
  const typing = tag === 'SELECT' || tag === 'TEXTAREA' || (tag === 'INPUT' && t.type !== 'range');
  if (typing) return;
  if (e.key === 'd' || e.key === 'D') {
    e.preventDefault();
    setCut(!app.cut);
  } else if (e.key === ' ' || e.code === 'Space') {
    if (tag === 'BUTTON' || tag === 'A' || tag === 'SUMMARY') return; // native activation
    e.preventDefault();
    app.playing ? pause() : play();
  } else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && tag !== 'INPUT') {
    e.preventDefault();
    step(e.key === 'ArrowRight' ? 1 : -1);
  }
});

reducedQuery.addEventListener?.('change', () => {
  els.arena.classList.toggle('reduced', reduced());
});

// ------------------------------------------------------------------ boot
async function boot() {
  els.arena.classList.toggle('reduced', reduced());
  setPlayingUi();
  const params = new URLSearchParams(window.location.search);
  app.cut = params.get('cut') === '1';
  els.cut.setAttribute('aria-pressed', String(app.cut));

  const statsPromise = getJson('tapes/stats.json').catch(() => ({}));
  try {
    const list = await getJson('tapes/index.json');
    app.index = Array.isArray(list) ? list.filter((e) => e && e.id) : [];
  } catch {
    app.index = [];
  }
  statsPromise.then((s) => statsPanel.setData(s));

  const wanted = params.get('tape') || (app.index[0] && app.index[0].id) || null;
  if (!wanted) {
    els.picker.replaceChildren(new Option('No tapes yet', ''));
    els.picker.disabled = true;
    els.player.hidden = true;
    els.empty.hidden = false;
    els.meta.textContent = '';
    return;
  }
  const start = Number.parseInt(params.get('i') || '0', 10);
  await loadTape(wanted, Number.isFinite(start) ? start : 0);
  window.__viewer = { app, goto, stateAt: (i) => stateAt(app.tape, i), setCut };
}

boot();
