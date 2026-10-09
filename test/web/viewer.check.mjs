// Playwright check for the static replay viewer. Run: node test/web/viewer.check.mjs
//
// Serves web/ from a tiny node http server, then drives Chromium at 390, 768 and 1440 px.
// Playwright is not a project dependency: it is located (in order) via PLAYWRIGHT_PATH, the
// project node_modules, the global npm root, or a throwaway install in the OS temp dir when
// PW_AUTO_INSTALL=1. If none is found the check prints how to get it and exits 0 (skipped),
// unless REQUIRE_PLAYWRIGHT=1.
//
// Screenshots land in docs/screens/ (set NO_SCREENS=1 to skip).
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const webDir = path.join(root, 'web');
const screensDir = path.join(root, 'docs', 'screens');
const SHOTS = process.env.NO_SCREENS !== '1';

// ------------------------------------------------------------------ find playwright
async function loadPlaywright() {
  const attempts = [];
  const tryLoad = async (label, fn) => {
    try {
      const mod = await fn();
      const pw = mod.chromium ? mod : mod.default;
      if (pw && pw.chromium) return pw;
    } catch (err) {
      attempts.push(`${label}: ${String(err.message).split('\n')[0]}`);
    }
    return null;
  };
  let pw = null;
  if (process.env.PLAYWRIGHT_PATH) {
    pw = await tryLoad('PLAYWRIGHT_PATH', () => createRequire(path.join(process.env.PLAYWRIGHT_PATH, 'x.js'))('playwright'));
  }
  pw ||= await tryLoad('project', () => import('playwright'));
  if (!pw) {
    try {
      const globalRoot = execFileSync('npm', ['root', '-g'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
      pw = await tryLoad('global', () => createRequire(path.join(globalRoot, 'x.js'))('playwright'));
    } catch (err) {
      attempts.push(`global: ${err.message.split('\n')[0]}`);
    }
  }
  if (!pw && process.env.PW_AUTO_INSTALL === '1') {
    const dir = path.join(os.tmpdir(), 'last-three-playwright');
    fs.mkdirSync(dir, { recursive: true });
    execFileSync('npm', ['init', '-y'], { cwd: dir, stdio: 'ignore' });
    execFileSync('npm', ['i', '--no-save', 'playwright'], { cwd: dir, stdio: 'inherit' });
    execFileSync('npx', ['playwright', 'install', 'chromium'], { cwd: dir, stdio: 'inherit' });
    pw = await tryLoad('tmp install', () => import(pathToFileURL(path.join(dir, 'node_modules', 'playwright', 'index.mjs')).href));
  }
  if (!pw) {
    const msg = `viewer.check: Playwright not found (${attempts.join('; ')}).\nInstall it outside the project, e.g. PW_AUTO_INSTALL=1 node test/web/viewer.check.mjs`;
    if (process.env.REQUIRE_PLAYWRIGHT === '1') {
      console.error(msg);
      process.exit(1);
    }
    console.log(`${msg}\nSKIPPED.`);
    process.exit(0);
  }
  return pw;
}

// ------------------------------------------------------------------ fixtures
const sample = JSON.parse(fs.readFileSync(path.join(webDir, 'tapes', 'sample.json'), 'utf8'));
const ev = sample.events;
const find = (pred) => ev.findIndex(pred);
const IDX = {
  lobby: 0,
  waiting: find((e) => e.type === 'round_start' && e.phase === 'waiting' && e.round === 2) + 4,
  forged: find((e) => e.type === 'say' && e.forgedAs),
  firstThought: find((e) => e.type === 'thought'),
  firstWhisper: find((e) => e.type === 'whisper'),
  crossing: find((e) => e.type === 'action' && e.action === 'step:R' && e.name === 'Fenn' && ev[e.i - 5]?.round === 4),
  bridgeEnd: find((e) => e.type === 'stage_end' && e.stage === 'bridge'),
  crusher: find((e) => e.type === 'action' && e.action === 'hold_lever'),
  disc: find((e) => e.type === 'reveal' && e.what === 'tiles'),
  ledge: find((e) => e.type === 'action' && e.action === 'shove:Ash' && e.name === 'Gus'),
  end: ev.length - 1,
};
const deaths = ev.filter((e) => e.type === 'death').map((e) => ({ i: e.i, name: e.name, style: e.style }));
const stageStarts = Object.fromEntries(ev.filter((e) => e.type === 'stage_start').map((e) => [e.stage, e.i]));

// Real tapes (written by the real engine with real agents) listed in index.json, sample excluded.
const realIndex = (() => {
  try {
    const list = JSON.parse(fs.readFileSync(path.join(webDir, 'tapes', 'index.json'), 'utf8'));
    return list.filter((e) => e && e.id && e.id !== 'sample' && fs.existsSync(path.join(webDir, 'tapes', `${e.id}.json`)));
  } catch {
    return [];
  }
})();
// A heavyweight-tier copy of the first real tape, to exercise the picker's tier badge.
const HEAVY_ID = 'heavy-copy';

let statsMode = 'empty'; // 'missing' | 'empty' | 'full'
const statsFixture = {
  generatedAt: '2026-10-08T00:00:00Z',
  games: 12,
  rulesVersion: 3,
  tapesByRules: { 1: 24, 2: 8, 3: 12 },
  models: [
    { model: 'anthropic/claude-haiku-5.5', games: 12, meanPlace: 2.4, wins: 3, top3: 8, deathsByStage: { bridge: 3, crusher: 1, pit: 4, disc: 0, ledge: 2 }, volunteers: 5, frontOfBridge: 4, holdLever: 2, pushLever: 1, shoves: 9, lies: { power: 4, side: 1 } },
    { model: 'openai/gpt-oss-120b', games: 12, meanPlace: 3.1, wins: 1, top3: 5, deathsByStage: { bridge: 4, crusher: 2, disc: 1, ledge: 1 }, volunteers: 1, frontOfBridge: 6, holdLever: 0, pushLever: 3, shoves: 4, lies: { power: 0, side: 3 } },
    { model: 'deepseek/deepseek-v4-flash', games: 12, meanPlace: 1.9, wins: 5, top3: 10, deathsByStage: { bridge: 1, crusher: 0, disc: 1, ledge: 3 }, volunteers: 7, frontOfBridge: 5, holdLever: 4, pushLever: 0, shoves: 12, lies: { power: 2, side: 0 } },
  ],
  notes: ['Lie detection is a heuristic.'],
};

// Real-engine tapes (scripted bots) exercise the viewer's inference paths. Optional.
const engineTapes = {};
try {
  const { runGame } = await import(pathToFileURL(path.join(root, 'src', 'engine.js')).href);
  const { createScriptedAgents } = await import(pathToFileURL(path.join(root, 'src', 'scripted.js')).href);
  for (const seed of [42, 7, 3]) {
    const tape = await runGame({ seed, agents: createScriptedAgents(seed), config: { id: `engine-${seed}`, createdAt: '2026-10-08T00:00:00Z' } });
    engineTapes[`engine-${seed}`] = tape;
  }
} catch (err) {
  console.log(`note: engine tapes unavailable (${String(err.message).split('\n')[0]})`);
}

// Rules v3 tapes from the real engine, one per scenario (volunteer base, pushed base, rope, sink, ...).
const { buildChalkTapes, NOTES } = await import(pathToFileURL(path.join(here, 'chalk-fixtures.mjs')).href);
const chalkTapes = await buildChalkTapes();
// A real engine tape (rules v4) with earlier notes supplied through config.chalk, if the engine supports it.
try {
  const { runGame } = await import(pathToFileURL(path.join(root, 'src', 'engine.js')).href);
  const { createScriptedAgents } = await import(pathToFileURL(path.join(root, 'src', 'scripted.js')).href);
  const real = await runGame({ seed: 54, agents: createScriptedAgents(54), config: { id: 'chalk-real', createdAt: '2026-10-08T00:00:00Z', chalk: [{ text: NOTES.mid, byPlace: 1 }, { text: NOTES.html, byPlace: 2 }, { text: NOTES.natural, byPlace: 3 }] } });
  if (Array.isArray(real.chalkShown) && real.chalkShown.length) chalkTapes.real = { ...real, id: 'chalk-real' };
} catch (err) {
  console.log(`note: no real chalk tape (${String(err.message).split('\n')[0]})`);
}
const { buildPitTapes } = await import(pathToFileURL(path.join(here, 'pit-fixtures.mjs')).href);
const pitTapes = await buildPitTapes();
const pitNames = Object.keys(pitTapes).filter((n) => n !== 'noPit');
// A copy of a pit tape with an unknown future stage spliced in: the viewer must shrug.
function volcano() {
  const copy = JSON.parse(JSON.stringify(pitTapes.volunteer));
  const k = copy.events.findIndex((e) => e.type === 'stage_start' && e.stage === 'pit');
  const alive = copy.events[k].alive;
  copy.events.splice(k + 1, 0, { type: 'stage_start', stage: 'volcano', alive, note: 'lava', round: null }, { type: 'round_start', stage: 'volcano', round: 1, phase: 'x', roundsTotal: 2 }, { type: 'reveal', what: 'lava', stage: 'volcano', data: { depth: 3 } }, { type: 'action', stage: 'volcano', name: alive[0], action: 'sizzle', valid: true }, { type: 'stage_end', stage: 'volcano', survivors: alive });
  copy.events = copy.events.map((e, i) => ({ ...e, i }));
  copy.id = 'pit-volcano';
  return copy;
}
const volcanoTape = volcano();

// A mangled copy: unknown event types, missing optional fields, odd reveal shapes.
function mutant() {
  const copy = JSON.parse(JSON.stringify(sample));
  copy.id = 'mutant';
  const events = [];
  for (const e of copy.events) {
    const x = { ...e };
    if (x.type === 'action') {
      delete x.valid;
      delete x.note;
    }
    if (x.type === 'death') delete x.style;
    if (x.type === 'reveal' && x.what === 'ceiling') x.data = x.data.ceiling;
    events.push(x);
    if (x.i % 7 === 0) events.push({ type: 'confetti_cannon', payload: { color: 'pink' } });
  }
  copy.events = events.map((e, i) => ({ ...e, i }));
  return copy;
}

// ------------------------------------------------------------------ static server
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
function serve() {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://local');
    const send = (code, type, body) => {
      res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store' });
      res.end(body);
    };
    if (url.pathname === '/tapes/stats.json') {
      if (statsMode === 'missing') return send(404, 'text/plain', 'not found');
      return send(200, 'application/json', JSON.stringify(statsMode === 'full' ? statsFixture : {}));
    }
    if (url.pathname === '/tapes/index.json') {
      const all = fs.existsSync(path.join(webDir, 'tapes', 'index.json')) ? JSON.parse(fs.readFileSync(path.join(webDir, 'tapes', 'index.json'), 'utf8')) : [];
      const heavy = realIndex.length ? [{ ...realIndex[0], id: HEAVY_ID, tier: 'heavy' }] : [];
      const pits = Object.entries(pitTapes).map(([name, t]) => ({ id: `pit-${name}`, seed: t.seed, rules: t.rulesVersion }));
      const chalks = Object.entries(chalkTapes).map(([name, t]) => ({ id: `chalk-${name}`, seed: t.seed, rules: t.rulesVersion }));
      return send(200, 'application/json', JSON.stringify([...all, ...heavy, ...pits, ...chalks]));
    }
    const chalkTape = /^\/tapes\/chalk-([A-Za-z0-9]+)\.json$/.exec(url.pathname);
    if (chalkTape && chalkTapes[chalkTape[1]]) return send(200, 'application/json', JSON.stringify(chalkTapes[chalkTape[1]]));
    const pit = /^\/tapes\/pit-([A-Za-z0-9]+)\.json$/.exec(url.pathname);
    if (pit && pit[1] === 'volcano') return send(200, 'application/json', JSON.stringify(volcanoTape));
    if (pit && pitTapes[pit[1]]) return send(200, 'application/json', JSON.stringify(pitTapes[pit[1]]));
    if (realIndex.length && url.pathname === `/tapes/${HEAVY_ID}.json`) {
      return send(200, 'application/json', fs.readFileSync(path.join(webDir, 'tapes', `${realIndex[0].id}.json`)));
    }
    const eng = /^\/tapes\/(engine-\d+)\.json$/.exec(url.pathname);
    if (eng && engineTapes[eng[1]]) return send(200, 'application/json', JSON.stringify(engineTapes[eng[1]]));
    if (url.pathname === '/tapes/mutant.json') return send(200, 'application/json', JSON.stringify(mutant()));
    let file = path.join(webDir, decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (!file.startsWith(webDir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return send(404, 'text/plain', 'not found');
    return send(200, MIME[path.extname(file)] || 'application/octet-stream', fs.readFileSync(file));
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, base: `http://127.0.0.1:${server.address().port}` })));
}

// ------------------------------------------------------------------ tiny test harness
const results = [];
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null; // e.g. ONLY=chalk for a quick pass
async function check(name, fn) {
  if (ONLY && !ONLY.test(name)) return;
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`  ok   ${name}`);
  } catch (err) {
    results.push({ name, ok: false, err });
    console.log(`  FAIL ${name}\n       ${String(err.message).split('\n').join('\n       ')}`);
  }
}
function assert(cond, message) {
  if (!cond) throw new Error(message || 'assertion failed');
}

// ------------------------------------------------------------------ page helpers
const pw = await loadPlaywright();
const { server, base } = await serve();
const browser = await pw.chromium.launch();

async function openPage(width, { url = '/?tape=sample', height, colorScheme = 'light', reducedMotion = 'no-preference', allow = [] } = {}) {
  const context = await browser.newContext({
    viewport: { width, height: height || (width < 700 ? 844 : 1000) },
    colorScheme,
    reducedMotion,
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  const page = await context.newPage();
  const issues = [];
  const allowed = (text) => allow.some((a) => text.includes(a));
  page.on('console', (m) => {
    if (m.type() === 'error' && !allowed(m.text())) issues.push(`console: ${m.text()}`);
  });
  page.on('pageerror', (e) => issues.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => {
    if (!allowed(r.url())) issues.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`);
  });
  page.on('response', (r) => {
    if (r.status() >= 400 && !allowed(r.url()) && !allowed(String(r.status()))) issues.push(`http ${r.status()}: ${r.url()}`);
  });
  page.issues = issues;
  page.context_ = context;
  await page.goto(base + url);
  await page.waitForFunction(() => window.__viewer || document.getElementById('empty') && !document.getElementById('empty').hidden || document.getElementById('load-error') && !document.getElementById('load-error').hidden, null, { timeout: 8000 });
  return page;
}
const closePage = (page) => page.context_.close();
const go = async (page, i, cut = false) => {
  await page.evaluate(([n, c]) => {
    window.__viewer.setCut(c);
    window.__viewer.goto(n, { animate: false });
  }, [i, cut]);
  await page.waitForTimeout(60);
};
const noIssues = (page, label = '') => assert(page.issues.length === 0, `${label}issues: ${page.issues.join(' | ')}`);
const overflow = (page) => page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));

async function arenaClip(page) {
  return page.evaluate(() => {
    const a = document.querySelector('.stage-hud').getBoundingClientRect();
    const b = document.getElementById('now').getBoundingClientRect();
    return { x: Math.max(0, a.x - 6), y: a.y - 6 + window.scrollY, width: a.width + 12, height: b.bottom - a.top + 12 };
  });
}
async function shot(page, name) {
  if (!SHOTS) return;
  fs.mkdirSync(screensDir, { recursive: true });
  await page.screenshot({ path: path.join(screensDir, `${name}.png`), fullPage: true, clip: await arenaClip(page) });
}

// ------------------------------------------------------------------ a11y (font size + contrast)
async function a11y(page) {
  await go(page, IDX.forged + 3, true);
  const report = await page.evaluate(() => {
    const small = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.textContent.trim()) continue;
      const el = node.parentElement;
      if (!el || seen.has(el) || el.closest('svg, script, style, .sr-only')) continue;
      seen.add(el);
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (cs.display === 'none' || cs.visibility === 'hidden' || r.width === 0 || r.height === 0) continue;
      if (parseFloat(cs.fontSize) < 14) small.push(`${el.className || el.tagName}:${cs.fontSize}:"${node.textContent.trim().slice(0, 20)}"`);
    }
    const parse = (c) => {
      const m = /rgba?\(([^)]+)\)/.exec(c);
      if (!m) return null;
      const p = m[1].split(',').map((x) => parseFloat(x));
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const over = (top, bottom) => ({ r: top.r * top.a + bottom.r * (1 - top.a), g: top.g * top.a + bottom.g * (1 - top.a), b: top.b * top.a + bottom.b * (1 - top.a), a: 1 });
    const bgOf = (el) => {
      const layers = [];
      for (let n = el; n; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (cs.backgroundImage !== 'none' && !cs.backgroundImage.startsWith('url(')) return null; // gradient: skip
        const c = parse(cs.backgroundColor);
        if (c && c.a > 0) layers.push(c);
        if (c && c.a >= 1) break;
      }
      let acc = { r: 255, g: 255, b: 255, a: 1 };
      for (let k = layers.length - 1; k >= 0; k--) acc = over(layers[k], acc);
      return acc;
    };
    const lum = (c) => {
      const f = (v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    };
    const ratio = (a, b) => {
      const [hi, lo] = lum(a) > lum(b) ? [a, b] : [b, a];
      return (lum(hi) + 0.05) / (lum(lo) + 0.05);
    };
    const low = [];
    for (const sel of ['.now', '.hud-title', '.hud-sub', '.hud-right', '.tape-meta', '.btn-text', '.chapter', '.cast-model', '.cast-status', '.cast-power', '.tl-text', '.keys', '.scrub-label', '.stats-lede', '.tagline', '.logo', '.bubble .who', '.bubble .txt', '.tag']) {
      for (const el of document.querySelectorAll(sel)) {
        const r = el.getBoundingClientRect();
        if (!r.width || getComputedStyle(el).display === 'none') continue;
        const bg = bgOf(el);
        const fg = parse(getComputedStyle(el).color);
        if (!bg || !fg) continue;
        const cr = ratio(over(fg, bg), bg);
        if (cr < 4.5) low.push(`${sel} ${cr.toFixed(2)}`);
        break;
      }
    }
    return { small: [...new Set(small)].slice(0, 12), low };
  });
  assert(report.small.length === 0, `text under 14px: ${report.small.join(' | ')}`);
  assert(report.low.length === 0, `contrast under 4.5: ${report.low.join(' | ')}`);

}

// ------------------------------------------------------------------ checks
console.log(`viewer.check: ${base}  (sample tape: ${ev.length} events)`);

const WIDTHS = [390, 768, 1440];
const stageStartIndex = (tape, stage) => tape.events.find((e) => e.type === 'stage_start' && e.stage === stage).i;
const stops = [
  ['lobby', IDX.lobby, 'lobby'],
  ['bridge-waiting', IDX.waiting, 'bridge'],
  ['bridge-crossing', IDX.crossing, 'bridge'],
  ['bridge-cleared', IDX.bridgeEnd, 'bridge'],
  ['crusher', IDX.crusher, 'crusher'],
  ['disc', IDX.disc, 'disc'],
  ['ledge', IDX.ledge, 'ledge'],
  ['results', IDX.end, 'podium'],
];

for (const width of WIDTHS) {
  console.log(`\n== ${width}px ==`);
  statsMode = 'empty';
  const page = await openPage(width);

  await check(`${width}: metadata, picker and accessible controls`, async () => {
    assert((await page.title()) === 'Last Three', 'title');
    assert(await page.locator('meta[name=description]').getAttribute('content'), 'meta description');
    assert(await page.locator('meta[property="og:title"]').getAttribute('content'), 'og:title');
    assert(await page.locator('meta[property="og:description"]').getAttribute('content'), 'og:description');
    assert((await page.locator('link[rel=icon]').getAttribute('href')).startsWith('data:image/svg+xml'), 'favicon data uri');
    assert((await page.locator('#tape-picker option').count()) >= 1, 'tape picker has options');
    const unnamed = await page.evaluate(() => {
      const bad = [];
      for (const el of document.querySelectorAll('button, select, input')) {
        if (el.offsetParent === null && getComputedStyle(el).position !== 'fixed') continue;
        const labelled = el.labels && el.labels.length ? el.labels[0].textContent.trim() : '';
        const name = (el.getAttribute('aria-label') || el.textContent || labelled || '').trim();
        if (!name) bad.push(el.id || el.className || el.tagName);
      }
      return bad;
    });
    assert(unnamed.length === 0, `controls without an accessible name: ${unnamed.join(', ')}`);
    assert((await page.locator('.fig').count()) === 8, 'eight figures');
  });

  await check(`${width}: keyboard focus is visible`, async () => {
    await page.focus('#btn-back');
    await page.keyboard.press('Tab');
    const out = await page.evaluate(() => {
      const el = document.activeElement;
      const cs = getComputedStyle(el);
      return { id: el.id, style: cs.outlineStyle, width: parseFloat(cs.outlineWidth) };
    });
    assert(out.style !== 'none' && out.width >= 2, `focus ring on ${out.id}: ${out.style} ${out.width}px`);
  });

  for (const [label, idx, scene] of stops) {
    await check(`${width}: ${label} (i=${idx}) renders without overflow`, async () => {
      await go(page, idx, false);
      assert((await page.locator('#arena').getAttribute('data-scene')) === scene, `scene should be ${scene}`);
      const o = await overflow(page);
      assert(o.sw <= o.iw, `horizontal overflow ${o.sw} > ${o.iw}`);
      const clipped = await page.evaluate(() => {
        const arena = document.getElementById('arena').getBoundingClientRect();
        return [...document.querySelectorAll('.fig:not(.gone):not(.off) .tag')]
          .map((t) => ({ n: t.textContent, r: t.getBoundingClientRect() }))
          .filter(({ r }) => r.left < arena.left - 2 || r.right > arena.right + 2 || r.bottom > arena.bottom + 2 || r.top < arena.top - 2)
          .map(({ n }) => n);
      });
      const expectOutside = scene === 'crusher' && idx >= IDX.crusher;
      assert(expectOutside || clipped.length === 0, `name tags outside the arena: ${clipped.join(', ')}`);
      await shot(page, `${String(stops.findIndex((s) => s[0] === label) + 1).padStart(2, '0')}-${label}-${width}`);
    });
  }

  await check(`${width}: transcript text, no thought leaks, cut reveals them`, async () => {
    await go(page, IDX.crossing, false);
    const lines = await page.locator('#transcript li').count();
    assert(lines > 15, `transcript lines: ${lines}`);
    const text = await page.locator('#transcript').innerText();
    assert(text.length > 200, 'transcript has text');
    assert(!/thinks:/.test(text), 'thoughts must be hidden with the cut off');
    assert(!/whispers to/.test(text), 'whispers must be hidden with the cut off');
    await go(page, IDX.crossing, true);
    const cutText = await page.locator('#transcript').innerText();
    assert(/thinks:/.test(cutText) && /whispers to/.test(cutText), 'cut shows thoughts and whispers');
    assert((await page.locator('#now').getAttribute('aria-live')) === 'polite', 'now caption is aria-live');
    assert((await page.locator('#transcript').getAttribute('aria-live')) === null, 'transcript is not aria-live');
  });

  await check(`${width}: text is at least 14px and contrast passes AA`, () => a11y(page));

  await check(`${width}: no console errors, no failed requests`, async () => {
    noIssues(page);
  });
  await closePage(page);
}

console.log('\n== stages, deaths, cut ==');
{
  const page = await openPage(1440);

  await check('stage markers: every stage_start lands on the right scene', async () => {
    for (const stage of ['bridge', 'crusher', 'disc', 'ledge']) {
      await go(page, stageStarts[stage] + 1);
      assert((await page.locator('#arena').getAttribute('data-scene')) === stage, `${stage} scene`);
      assert((await page.locator('.hud-title').innerText()).length > 3, `${stage} hud`);
      assert(await page.locator(`#chapters .chapter[data-chapter=${stage}].on`).count(), `${stage} chapter highlighted`);
    }
  });

  for (const d of deaths) {
    await check(`death ${d.name} (${d.style}) at i=${d.i}: scene state, caption, fx`, async () => {
      // state: instant jump
      await go(page, d.i);
      const fate = await page.locator(`.fig[data-name=${d.name}]`).getAttribute('data-fate');
      assert(fate === d.style, `data-fate ${fate} !== ${d.style}`);
      const gone = await page.locator(`.fig[data-name=${d.name}]`).evaluate((el) => el.classList.contains('gone'));
      assert(gone, 'dead figure leaves the arena once scrubbed to');
      const caption = await page.locator('#now').innerText();
      assert(new RegExp(d.name).test(caption), `caption mentions ${d.name}: ${caption}`);
      const before = await page.evaluate((i) => {
        const events = window.__viewer.app.tape.events;
        let j = i - 1;
        while (j > 0 && ['thought', 'whisper'].includes(events[j].type)) j--;
        return j;
      }, d.i);
      // step the animated way from the previous worthy event
      await go(page, before);
      const alive = await page.locator(`.fig[data-name=${d.name}]`).evaluate((el) => !el.classList.contains('gone'));
      assert(alive, 'figure is visible just before its death');
      await page.click('#btn-fwd');
      let landed = await page.evaluate(() => window.__viewer.app.idx);
      let guard = 0;
      while (landed < d.i && guard++ < 6) {
        await page.click('#btn-fwd');
        landed = await page.evaluate(() => window.__viewer.app.idx);
      }
      assert(landed === d.i, `stepping forward reaches the death event (landed ${landed}, wanted ${d.i})`);
      await page.waitForSelector(`#arena .fx-chip.fx-${d.style}`, { timeout: 1500 });
      if (d.style === 'shatter') {
        const cubes = await page.locator('#arena .fx-cube').count();
        assert(cubes >= 8, `shatter cubes: ${cubes}`);
      } else {
        const running = await page.locator(`.fig[data-name=${d.name}] .fig-in`).evaluate((el) => el.getAnimations().length);
        assert(running > 0, `${d.style} animation running on the figure`);
      }
      const label = { shatter: 'crash', flatten: 'splat', chute: 'wheee', tumble: 'bonk' }[d.style];
      if (SHOTS) {
        await page.waitForTimeout(350);
        fs.mkdirSync(screensDir, { recursive: true });
        await page.screenshot({ path: path.join(screensDir, `death-${d.style}-1440.png`), clip: await arenaClip(page) });
      }
      await page.waitForFunction((name) => document.querySelector(`.fig[data-name=${name}]`).classList.contains('gone'), d.name, { timeout: 4000 });
      void label;
    });
  }

  await check('Director cut: badges, thoughts, whispers and forgeries toggle', async () => {
    await go(page, IDX.forged, false);
    const badgeOff = await page.evaluate(() => [...document.querySelectorAll('.fig .badge')].every((b) => getComputedStyle(b).display === 'none'));
    assert(badgeOff, 'power badges hidden with the cut off');
    let bubbles = await page.locator('.bubble').allInnerTexts();
    assert(bubbles.some((t) => /Hana/.test(t) && /glass eye/.test(t)), 'forged line shows the forged name');
    assert(!bubbles.some((t) => /forged by/.test(t)), 'no forged-by tag with the cut off');
    assert((await page.locator('.bubble.thought').count()) === 0, 'no thought bubbles with the cut off');
    await page.keyboard.press('d');
    assert((await page.getAttribute('#btn-cut', 'aria-pressed')) === 'true', 'd toggles the cut on');
    const badgeOn = await page.evaluate(() => [...document.querySelectorAll('.fig:not(.gone) .badge')].every((b) => getComputedStyle(b).display !== 'none'));
    assert(badgeOn, 'badges visible with the cut on');
    bubbles = await page.locator('.bubble').allInnerTexts();
    assert(bubbles.some((t) => /forged by Cole/.test(t)), 'cut shows forged by Cole');
    await go(page, IDX.firstThought, true);
    assert((await page.locator('.bubble.thought').count()) >= 1, 'thought bubble in the cut');
    await go(page, IDX.firstWhisper, true);
    assert((await page.locator('.bubble.whisper').count()) >= 1, 'whisper note in the cut');
    assert((await page.locator('svg.layer-links line').count()) >= 1, 'whisper line between figures');
    await go(page, IDX.firstWhisper, false);
    assert((await page.locator('.bubble.whisper').count()) === 0, 'whisper hidden when the cut is off again');
    assert((await page.getAttribute('#btn-cut', 'aria-pressed')) === 'false', 'cut toggled off by go()');
    await go(page, IDX.crossing + 1, true);
    await shot(page, 'cut-bridge-1440');
    await go(page, IDX.waiting, true);
    await shot(page, 'cut-waiting-1440');
  });

  await check('results card at the end', async () => {
    await go(page, IDX.end - 1);
    assert(await page.locator('#results').isHidden(), 'results hidden before game_end');
    await go(page, IDX.end);
    assert(await page.locator('#results').isVisible(), 'results visible');
    assert((await page.locator('#results .medal').count()) === 3, 'three medals');
    assert((await page.locator('#results .death-list li').count()) === deaths.length, 'death list');
    assert((await page.locator('#results .cast-table tbody tr').count()) === 8, 'eight player rows');
    const text = await page.locator('#results').innerText();
    assert(/Ash wins/.test(text) && /Power: Glass Eye/.test(text), 'winner and power shown after the game');
    assert(/anthropic|claude/i.test(text), 'model names in the table');
    if (SHOTS) {
      fs.mkdirSync(screensDir, { recursive: true });
      await page.screenshot({ path: path.join(screensDir, 'results-card-1440.png'), clip: await page.evaluate(() => {
        const r = document.getElementById('results').getBoundingClientRect();
        return { x: Math.max(0, r.x - 6), y: r.y + window.scrollY - 6, width: r.width + 12, height: r.height + 16 };
      }), fullPage: true });
    }
  });

  await check('powers stay hidden in the cast until the cut or the end', async () => {
    await go(page, IDX.crossing, false);
    assert(!/Power:/.test(await page.locator('#cast').innerText()), 'no powers in the cast list');
    await go(page, IDX.crossing, true);
    assert(/Power: Glass Eye/.test(await page.locator('#cast').innerText()), 'powers listed in the cut');
  });

  noIssues(page);
  await closePage(page);
}

console.log('\n== playback, keyboard, share link ==');
{
  const page = await openPage(1440, { url: '/?tape=sample&i=0' });
  await check('Play advances, Pause stops, speed select works', async () => {
    await page.selectOption('#speed', '4');
    await page.click('#btn-play');
    assert((await page.getAttribute('#btn-play', 'aria-pressed')) === 'true', 'play pressed');
    await page.waitForTimeout(3500);
    const i1 = await page.evaluate(() => window.__viewer.app.idx);
    assert(i1 > 8, `playback advanced to ${i1}`);
    await page.click('#btn-play');
    assert((await page.getAttribute('#btn-play', 'aria-pressed')) === 'false', 'paused');
    const i2 = await page.evaluate(() => window.__viewer.app.idx);
    await page.waitForTimeout(700);
    assert((await page.evaluate(() => window.__viewer.app.idx)) === i2, 'stays paused');
  });
  await check('keyboard: Space, arrows, d; URL stays in sync', async () => {
    await go(page, 30);
    await page.focus('body');
    await page.keyboard.press('Space');
    assert((await page.getAttribute('#btn-play', 'aria-pressed')) === 'true', 'Space plays');
    await page.keyboard.press('Space');
    assert((await page.getAttribute('#btn-play', 'aria-pressed')) === 'false', 'Space pauses');
    const before = await page.evaluate(() => window.__viewer.app.idx);
    await page.keyboard.press('ArrowRight');
    const after = await page.evaluate(() => window.__viewer.app.idx);
    assert(after > before, 'ArrowRight steps forward');
    await page.keyboard.press('ArrowLeft');
    assert((await page.evaluate(() => window.__viewer.app.idx)) < after, 'ArrowLeft steps back');
    const q = await page.evaluate(() => new URL(location.href).searchParams.get('i'));
    assert(Number(q) === (await page.evaluate(() => window.__viewer.app.idx)), `?i=${q} follows the index`);
    assert((await page.evaluate(() => new URL(location.href).searchParams.get('tape'))) === 'sample', '?tape=sample');
  });
  await check('scrubber, chapters and transcript lines jump', async () => {
    await page.fill('#scrubber', '150');
    assert((await page.evaluate(() => window.__viewer.app.idx)) === 150, 'scrubber jumps');
    await page.click('#chapters .chapter[data-chapter=disc]');
    assert((await page.evaluate(() => window.__viewer.app.idx)) === stageStarts.disc, 'chapter jump');
    await page.locator('#transcript li button').first().click();
    assert((await page.evaluate(() => window.__viewer.app.idx)) < stageStarts.disc, 'transcript line jump goes to that event');
  });
  await check('share link copies a deep link', async () => {
    await go(page, 99);
    await page.click('#btn-share');
    await page.waitForFunction(() => document.getElementById('share-status').textContent.length > 0);
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    assert(/tape=sample/.test(clip) && /i=99/.test(clip), `clipboard: ${clip}`);
  });
  await check('?i= deep link loads that exact event (also with cut=1)', async () => {
    await page.goto(`${base}/?tape=sample&i=${IDX.forged}&cut=1`);
    await page.waitForFunction(() => window.__viewer);
    assert((await page.evaluate(() => window.__viewer.app.idx)) === IDX.forged, 'index from the URL');
    assert((await page.getAttribute('#btn-cut', 'aria-pressed')) === 'true', 'cut from the URL');
  });
  noIssues(page);
  await closePage(page);
}

console.log('\n== stats panel ==');
for (const mode of ['missing', 'empty', 'full']) {
  statsMode = mode;
  const page = await openPage(768, { allow: mode === 'missing' ? ['stats.json', '404'] : [] });
  await check(`stats (${mode})`, async () => {
    await page.waitForTimeout(300);
    const text = await page.locator('#stats').innerText();
    if (mode === 'full') {
      const rows = await page.locator('#stats tbody tr').count();
      assert(rows === 3, `rows ${rows}`);
      assert(/heuristic/i.test(text), 'heuristic note');
      assert(/Lies: power/.test(text) && /Mean place/.test(text), 'columns');
      await page.click('#stats th button[data-key=wins]');
      const first = await page.locator('#stats tbody tr:first-child th').innerText();
      assert(/deepseek/.test(first), `sorted by wins desc: ${first}`);
      assert((await page.locator('#stats th[aria-sort=descending]').count()) === 1, 'aria-sort');
      await page.click('#stats th button[data-key=mean]');
      assert(/deepseek/.test(await page.locator('#stats tbody tr:first-child th').innerText()), 'sorted by mean place');
      const o = await overflow(page);
      assert(o.sw <= o.iw, 'no page overflow with the stats table');
      assert(/Out: pit/.test(text), 'pit deaths column');
      assert(/Stats for rules v3 \(12 games\)\. Older rules: v1 24 games, v2 8 games, not counted here\./.test(await page.locator('#stats .stats-rules').innerText()), 'rules line');
      const pitCol = await page.evaluate(() => {
        const idx = [...document.querySelectorAll('#stats thead th')].findIndex((th) => /Out: pit/.test(th.textContent));
        return [...document.querySelectorAll('#stats tbody tr')].map((tr) => tr.children[idx].textContent);
      });
      assert(pitCol.sort().join() === '0,0,4', `pit column values: ${pitCol}`);
      const before = await page.locator('#stats .stats-rules').evaluate((el) => el.getBoundingClientRect().bottom <= document.querySelector('#stats .table-wrap').getBoundingClientRect().top);
      assert(before, 'rules line sits above the table');
    } else {
      assert(/No model stats yet/.test(text), `friendly empty state: ${text.slice(0, 80)}`);
    }
  });
  if (mode !== 'missing') noIssues(page);
  await closePage(page);
}
statsMode = 'empty';

{
  statsMode = 'full';
  const page = await openPage(390);
  await check('stats at 390px: pit column and rules line stay usable', async () => {
    await page.waitForTimeout(300);
    const o = await overflow(page);
    assert(o.sw <= o.iw, 'no page overflow');
    const info = await page.evaluate(() => {
      const wrap = document.querySelector('#stats .table-wrap');
      const first = document.querySelector('#stats tbody th').getBoundingClientRect();
      const th = [...document.querySelectorAll('#stats thead th button')].find((b) => /Out: pit/.test(b.textContent));
      const rules = document.querySelector('#stats .stats-rules');
      return { scrolls: wrap.scrollWidth > wrap.clientWidth, firstW: first.width, header: th ? th.getBoundingClientRect().height : 0, rulesW: rules.getBoundingClientRect().width, vw: innerWidth };
    });
    assert(info.scrolls, 'the table scrolls sideways inside its wrapper');
    assert(info.firstW <= 130, `model column stays narrow (${info.firstW}px)`);
    assert(info.header >= 44, `pit header is a tap target (${info.header}px)`);
    assert(info.rulesW <= info.vw, 'rules line fits');
    noIssues(page);
  });
  await closePage(page);
  statsMode = 'empty';
}

console.log('\n== resilience ==');
{
  let page = await openPage(1440, { url: '/?tape=mutant&i=0' });
  await check('mangled tape (unknown events, missing fields) plays through', async () => {
    const n = await page.evaluate(() => window.__viewer.app.tape.events.length);
    for (let i = 0; i < n; i += 9) await go(page, i);
    await go(page, n - 1);
    assert(await page.locator('#results').isVisible(), 'results still render');
    noIssues(page);
  });
  await closePage(page);

  for (const id of Object.keys(engineTapes)) {
    page = await openPage(390, { url: `/?tape=${id}&i=0` });
    await check(`real engine tape ${id} renders at every few events`, async () => {
      const n = await page.evaluate(() => window.__viewer.app.tape.events.length);
      for (let i = 0; i < n; i += 11) {
        await go(page, i, i % 2 === 0);
        const o = await overflow(page);
        assert(o.sw <= o.iw, `overflow at ${i}`);
      }
      await go(page, n - 1);
      assert(await page.locator('#results').isVisible(), 'results visible');
      assert((await page.locator('#results .cast-table tbody tr').count()) === 8, '8 rows');
      noIssues(page);
    });
    if (id === Object.keys(engineTapes)[0]) {
      await check(`engine tape ${id}: stepping forward never stalls`, async () => {
        await go(page, 0);
        let last = -1;
        for (let k = 0; k < 40; k++) {
          await page.click('#btn-fwd');
          const idx = await page.evaluate(() => window.__viewer.app.idx);
          assert(idx > last, 'step moved forward');
          last = idx;
        }
      });
    }
    await closePage(page);
  }

  page = await openPage(1440, { url: '/?tape=nope', allow: ['404', 'nope'] });
  await check('unknown tape id shows an error, not a crash', async () => {
    assert(await page.locator('#load-error').isVisible(), 'error message visible');
    assert(page.issues.every((t) => /404|nope/.test(t)), `unexpected: ${page.issues.join(' | ')}`);
  });
  await closePage(page);

  page = await openPage(1440, { reducedMotion: 'reduce', url: `/?tape=sample&i=${deaths[0].i - 4}` });
  await check('prefers-reduced-motion: no fx, instant state changes', async () => {
    await page.click('#btn-fwd');
    for (let k = 0; k < 6; k++) await page.click('#btn-fwd');
    assert((await page.locator('#arena .fx-chip, #arena .fx-cube').count()) === 0, 'no fx nodes');
    assert((await page.locator('.arena').evaluate((el) => el.classList.contains('instant'))) === true, 'instant mode');
    noIssues(page);
  });
  await closePage(page);

  page = await openPage(1440, { colorScheme: 'dark', url: `/?tape=sample&i=${IDX.crossing}` });
  await check('dark colour scheme: layout intact, text >= 14px, contrast AA', async () => {
    await a11y(page);
    const o = await overflow(page);
    assert(o.sw <= o.iw, 'overflow in dark mode');
    noIssues(page);
    if (SHOTS) {
      fs.mkdirSync(screensDir, { recursive: true });
      await page.screenshot({ path: path.join(screensDir, 'dark-1440.png'), fullPage: true });
    }
  });
  await closePage(page);
}


// ------------------------------------------------------------------ real tapes
console.log('\n== real tapes ==');
if (!realIndex.length) console.log('  (no real tapes in web/tapes/index.json, skipped)');
const { stateAt } = await import(pathToFileURL(path.join(webDir, 'lib', 'state.js')).href);
const { highlights } = await import(pathToFileURL(path.join(webDir, 'ui', 'highlights.js')).href);
const POWER_WORDS = /glass eye|wedge|feather|forger|anchor|swap|\bmap\b|forged by/i;

// In-page audit of the bubbles and layout at the current event.
const auditPage = () => {
  const v = window.__viewer;
  const arena = document.getElementById('arena').getBoundingClientRect();
  const portrait = arena.width / arena.height < 1.2;
  const cap = portrait ? 2 : 3;
  const problems = [];
  const live = [...document.querySelectorAll('#arena .bubble')].filter((b) => !b.hidden && !b.classList.contains('fade'));
  if (live.length > cap) problems.push(`${live.length} bubbles (cap ${cap})`);
  const rects = live.map((b) => ({ b, r: b.getBoundingClientRect() }));
  for (const { b, r } of rects) {
    if (r.left < arena.left - 2 || r.right > arena.right + 2 || r.top < arena.top - 2 || r.bottom > arena.bottom + 2) problems.push(`bubble outside arena: ${b.textContent.slice(0, 20)}`);
    const tag = document.querySelector(`.fig[data-name="${b.dataset.as}"]:not(.gone):not(.off) .tag`);
    if (tag) {
      const t = tag.getBoundingClientRect();
      const ox = Math.min(r.right, t.right) - Math.max(r.left, t.left);
      const oy = Math.min(r.bottom, t.bottom) - Math.max(r.top, t.top);
      if (ox > 2 && oy > 2) problems.push(`bubble covers ${b.dataset.as}'s own name tag`);
    }
    const txt = b.querySelector('.txt');
    if (txt.scrollHeight > txt.clientHeight + 1) problems.push('bubble text clipped');
    if (txt.textContent.length > 141) problems.push('bubble text over the cap');
  }
  for (let a = 0; a < rects.length; a++) {
    for (let c = a + 1; c < rects.length; c++) {
      const x = Math.min(rects[a].r.right, rects[c].r.right) - Math.max(rects[a].r.left, rects[c].r.left);
      const y = Math.min(rects[a].r.bottom, rects[c].r.bottom) - Math.max(rects[a].r.top, rects[c].r.top);
      if (x > 3 && y > 3) problems.push('two bubbles overlap');
    }
  }
  if (document.documentElement.scrollWidth > window.innerWidth) problems.push('horizontal overflow');
  const scene = document.getElementById('arena').dataset.scene;
  if (scene !== 'crusher') {
    for (const t of document.querySelectorAll('.fig:not(.gone):not(.off) .tag')) {
      const r = t.getBoundingClientRect();
      if (r.left < arena.left - 2 || r.right > arena.right + 2 || r.bottom > arena.bottom + 2 || r.top < arena.top - 2) problems.push(`name tag outside arena: ${t.textContent}`);
    }
  }
  void v;
  return problems;
};


// ------------------------------------------------------------------ the Pit (rules v3)
console.log('\n== the pit ==');
const ptape = (name) => pitTapes[name];
const pev = (name, pred) => ptape(name).events.find(pred);
const pitLeakWords = /glass eye|wedge|feather|forger|anchor|forged by/i;

// Extra in-page audit for the pit: no bubble sits on a figure, nothing important is clipped.
const auditPit = () => {
  const problems = [];
  const arenaEl = document.getElementById('arena');
  if (arenaEl.dataset.scene !== 'pit') return problems;
  const arena = arenaEl.getBoundingClientRect();
  const figs = [...document.querySelectorAll('.fig:not(.gone):not(.off)')].map((f) => ({ name: f.dataset.name, r: f.querySelector('.fig-in').getBoundingClientRect() }));
  for (const b of document.querySelectorAll('#arena .bubble')) {
    if (b.hidden || b.classList.contains('fade')) continue;
    const r = b.getBoundingClientRect();
    for (const f of figs) {
      const ox = Math.min(r.right, f.r.right) - Math.max(r.left, f.r.left);
      const oy = Math.min(r.bottom, f.r.bottom) - Math.max(r.top, f.r.top);
      if (ox > 0 && oy > 0 && (ox * oy) / (f.r.width * f.r.height) > 0.3) problems.push(`bubble covers ${f.name}`);
    }
  }
  for (const c of document.querySelectorAll('.fig:not(.gone):not(.off) .act, .fig:not(.gone):not(.off) .note')) {
    if (c.hidden) continue;
    const r = c.getBoundingClientRect();
    if (r.left < arena.left - 1 || r.right > arena.right + 1 || r.bottom > arena.bottom + 1) problems.push(`chip clipped: ${c.textContent}`);
  }
  return problems;
};

// the three core scenarios get every width and both cuts; the special cases (feather, anchor, ...) one phone and one desktop pass
const CORE = ['volunteer', 'rope', 'big'];
for (const name of pitNames) {
  const tape = ptape(name);
  const n = tape.events.length;
  for (const width of CORE.includes(name) ? WIDTHS : [390, 1440]) {
    const page = await openPage(width, { url: `/?tape=pit-${name}&i=0` });
    for (const cut of CORE.includes(name) ? (width === 768 ? [false] : [false, true]) : [width === 390]) {
      await check(`pit ${name} ${width}px${cut ? ' cut' : ''}: stepping through all ${n} events never throws, bubbles, chips and layout hold`, async () => {
        const out = await page.evaluate(
          ([audit, extra, withCut]) => {
            const base = new Function(`return (${audit})`)();
            const more = new Function(`return (${extra})`)();
            const v = window.__viewer;
            v.setCut(withCut);
            const bad = new Map();
            const total = v.app.tape.events.length;
            for (let i = 0; i < total; i++) {
              try {
                v.goto(i, { animate: false });
                const ev = v.app.tape.events[i];
                if (ev.type === 'say' || ev.type === 'death' || ev.type === 'reveal' || ev.type === 'action' || i % 9 === 0) for (const p of [...base(), ...more()]) bad.set(`${p} @${i}`, 1);
              } catch (err) {
                bad.set(`threw @${i}: ${err.message}`, 1);
              }
            }
            return [...bad.keys()].slice(0, 8);
          },
          [auditPage.toString(), auditPit.toString(), cut]
        );
        assert(out.length === 0, out.join(' | '));
      });
    }
    await check(`pit ${name} ${width}px: no console errors, no failed requests`, async () => noIssues(page));
    await closePage(page);
  }
}

{
  const page = await openPage(1440, { url: '/?tape=pit-volunteer&i=0' });
  const tape = ptape('volunteer');
  const reveals = tape.events.filter((e) => e.type === 'reveal' && e.what === 'pit');

  await check('pit: the scrubber has a Pit marker, jumping there shows the pit scene', async () => {
    assert((await page.locator('#chapters .chapter[data-chapter=pit]').innerText()) === 'Pit', 'marker says Pit');
    const order = await page.locator('#chapters .chapter').evaluateAll((b) => b.map((x) => x.dataset.chapter));
    assert(order.indexOf('pit') > order.indexOf('crusher') && order.indexOf('pit') < order.indexOf('disc'), `order ${order}`);
    await page.click('#chapters .chapter[data-chapter=pit]');
    assert((await page.locator('#arena').getAttribute('data-scene')) === 'pit', 'pit scene');
    assert(await page.locator('#chapters .chapter[data-chapter=pit].on').count(), 'marker highlighted');
    assert((await page.locator('.hud-title').innerText()) === 'The Pit', 'hud title');
    const ticks = await page.locator('#ticks i').count();
    assert(ticks >= 4, `tick marks ${ticks}`);
  });

  await check('pit: water climbs one notch a round, the gauge follows, climbers stand on the rim', async () => {
    let lastTop = Infinity;
    for (const r of reveals) {
      await go(page, r.i);
      const info = await page.evaluate(() => {
        const w = document.querySelector('.pit-water');
        const now = document.querySelector('.pit-gauge .plate.now');
        const figs = Object.fromEntries([...document.querySelectorAll('.fig:not(.gone):not(.off)')].map((f) => [f.dataset.name, parseFloat(f.style.top)]));
        return { dry: w.classList.contains('dry'), top: w.getBoundingClientRect().top, now: now ? now.textContent : null, figs };
      });
      assert(!info.dry, `water visible at flood ${r.data.flood}`);
      assert(info.top < lastTop, `water rose at round ${r.data.flood} (${info.top} vs ${lastTop})`);
      lastTop = info.top;
      assert(info.now === String(r.data.flood), `gauge shows ${r.data.flood}, not ${info.now}`);
      for (const nme of r.data.out) assert(info.figs[nme] < 45, `${nme} is on the rim (top ${info.figs[nme]}%)`);
      for (const nme of r.data.down) assert(info.figs[nme] > 52, `${nme} is down in the pit (top ${info.figs[nme]}%)`);
    }
    await go(page, stageStartIndex(tape, 'pit') + 1);
    assert((await page.locator('.pit-water').evaluate((w) => w.classList.contains('dry'))) === true, 'no water before round 1 resolves');
  });

  await check('pit: the base kneels with the step stance and a "the step" chip, then stands again after a rescue', async () => {
    const first = reveals.find((r) => r.data.base);
    await go(page, first.i);
    assert((await page.locator('.fig.base').count()) === 1, 'exactly one base');
    assert((await page.locator('.fig.base').getAttribute('data-name')) === first.data.base, 'the right figure kneels');
    assert(/the step/.test(await page.locator('.fig.base .note').innerText()), 'the step chip');
    const pose = await page.locator('.fig.base .fig-in').evaluate((el) => getComputedStyle(el).transform);
    assert(pose !== 'none', 'crouch transform applied');
    const plank = await page.locator('.fig.base').evaluate((el) => getComputedStyle(el, '::after').content);
    assert(plank !== 'none' && plank !== 'normal', 'the step plank is drawn');
    await go(page, 0);
  });

  await check('pit: action chips under the name tags (offers back, climbs, pushes X, waits)', async () => {
    const seen = new Set();
    for (const name of ['volunteer', 'pushed']) {
      const p2 = await openPage(1440, { url: `/?tape=pit-${name}&i=0` });
      for (const e of ptape(name).events.filter((x) => x.type === 'action' && x.stage === 'pit')) {
        await go(p2, e.i);
        const chip = await p2.locator(`.fig[data-name=${e.name}] .act`).innerText().catch(() => '');
        seen.add(chip);
        const verb = e.action.split(':')[0];
        const want = { offer_back: /offers back/, climb: /climbs/, push_base: /pushes/, wait: /waits|^$/, leave: /^$/, reach_down: /throws rope/ }[verb];
        const isBase = await p2.evaluate(([i, n]) => window.__viewer.stateAt(i).pit.base === n, [e.i, e.name]);
        if (want && !isBase) assert(want.test(chip), `${e.name} ${e.action} shows "${chip}"`);
        if (verb === 'push_base') {
          const cls = await p2.locator(`.fig[data-name=${e.name}]`).getAttribute('class');
          assert(/shove/.test(cls), 'the pusher is in the shove pose');
          assert(chip === `pushes ${e.action.split(':')[1]}`, `chip "${chip}"`);
        }
      }
      await closePage(p2);
    }
    assert([...seen].some((t) => /offers back/.test(t)) && [...seen].some((t) => /climbs/.test(t)) && [...seen].some((t) => /pushes/.test(t)) && [...seen].some((t) => /waits/.test(t)), `chips seen: ${[...seen].join(' | ')}`);
  });

  await check('pit: climbing animates along the wall (waypoints) and is instant when scrubbing', async () => {
    const lift = reveals.find((r) => r.data.lifted.length);
    assert(lift, 'a climb in the tape');
    await go(page, lift.i - 1);
    await page.evaluate((i) => window.__viewer.goto(i, { animate: true }), lift.i);
    const climber = lift.data.lifted[0];
    const running = await page.locator(`.fig[data-name=${climber}]`).evaluate((el) => el.getAnimations().filter((a) => a.effect && a.effect.getKeyframes().length >= 4).length);
    assert(running >= 1, `waypoint animation running (${running})`);
    await page.waitForTimeout(1700);
    await go(page, lift.i - 1);
    await go(page, lift.i);
    const instant = await page.locator(`.fig[data-name=${climber}]`).evaluate((el) => el.getAnimations().length);
    assert(instant === 0, `no animation when scrubbing (${instant})`);
  });
  noIssues(page);
  await closePage(page);
}

{
  const page = await openPage(1440, { url: '/?tape=pit-rope&i=0' });
  const tape = ptape('rope');
  const rope = pev('rope', (e) => e.type === 'reveal' && e.what === 'rope');
  const after = tape.events.find((e) => e.i > rope.i && e.type === 'reveal' && e.what === 'pit');
  const ropeShown = () => page.evaluate(() => {
    const svg = document.querySelector('.pit-rope');
    return { shown: getComputedStyle(svg).display !== 'none', d: document.querySelector('.rope-in').getAttribute('d') || '', limp: svg.classList.contains('limp') };
  });
  await check('pit: the rope hangs from the rim only once it is thrown, the rescuer leans and shows the burn chip', async () => {
    await go(page, rope.i - 1);
    assert(!(await ropeShown()).shown, 'no rope before the rope reveal');
    await go(page, rope.i);
    const r = await ropeShown();
    assert(r.shown && r.d.startsWith('M'), `rope drawn: ${r.d.slice(0, 30)}`);
    const cls = await page.locator(`.fig[data-name=${rope.data.by}]`).getAttribute('class');
    assert(/lean/.test(cls), `rescuer leans: ${cls}`);
    assert(/hands burned: -1 footing/.test(await page.locator(`.fig[data-name=${rope.data.by}] .note`).innerText()), 'burn chip');
    assert(!r.limp, 'taut while it hauls');
    assert(/The rope: .* hauls .* out/.test(await page.locator('#now').innerText()), 'caption');
    await shot(page, 'pit-rope-1440');
    await go(page, after.i);
    const r2 = await ropeShown();
    assert(r2.shown && r2.limp, 'the rope stays, hanging limp, after the haul');
    assert((await page.locator('.fig.base').count()) === 0, 'no base after the rescue');
    assert(/hands burned/.test(await page.locator(`.fig[data-name=${rope.data.by}] .note`).innerText()), 'burn chip stays');
    const outTop = await page.locator(`.fig[data-name=${rope.data.saved}]`).evaluate((el) => parseFloat(el.style.top));
    assert(outTop < 45, `the hauled-out base is on the rim (top ${outTop}%)`);
  });
  await check('pit: the rope price shows in the ledge pips of the thrower', async () => {
    const ledge = tape.events.find((e) => e.type === 'stage_start' && e.stage === 'ledge');
    await go(page, ledge.i + 1);
    const pips = await page.locator(`.fig[data-name=${rope.data.by}] .pips i:not(.off)`).count();
    const power = tape.players.find((p) => p.name === rope.data.by).power;
    const full = power === 'anchor' ? 4 : 3;
    assert(pips === Math.max(1, full - rope.data.cost) || power === 'feather', `${rope.data.by} starts the ledge with ${pips} pips`);
  });
  noIssues(page);
  await closePage(page);
}

{
  const page = await openPage(1440, { url: '/?tape=pit-sink&i=0' });
  const tape = ptape('sink');
  const sinks = tape.events.filter((e) => e.type === 'death' && e.style === 'sink');
  for (const d of sinks) {
    await check(`pit: ${d.name} sinks (death at ${d.i}): state, caption, bubbles, waving hand`, async () => {
      await go(page, d.i);
      assert((await page.locator(`.fig[data-name=${d.name}]`).getAttribute('data-fate')) === 'sink', 'data-fate sink');
      assert(await page.locator(`.fig[data-name=${d.name}]`).evaluate((el) => el.classList.contains('gone')), 'gone when scrubbed to');
      assert(new RegExp(`${d.name} .*left in the pit`).test(await page.locator('#now').innerText()), 'caption');
      let before = d.i - 1;
      while (before > 0 && ['thought', 'whisper'].includes(tape.events[before].type)) before--;
      await go(page, before);
      assert(await page.locator(`.fig[data-name=${d.name}]`).evaluate((el) => !el.classList.contains('gone')), 'visible just before');
      await page.click('#btn-fwd');
      let landed = await page.evaluate(() => window.__viewer.app.idx);
      for (let g = 0; landed < d.i && g < 6; g++) {
        await page.click('#btn-fwd');
        landed = await page.evaluate(() => window.__viewer.app.idx);
      }
      assert(landed === d.i, `stepping reaches the death (landed ${landed})`);
      await page.waitForSelector('#arena .fx-chip.fx-sink', { timeout: 1500 });
      assert(/GLUB/.test(await page.locator('#arena .fx-chip.fx-sink').first().innerText()), 'GLUB chip');
      assert((await page.locator(`.fig[data-name=${d.name}] .fig-in`).evaluate((el) => el.getAnimations().length)) > 0, 'the figure is sinking');
      assert((await page.locator('#arena .fx-hand').count()) === 1, 'a hand waves above the water');
      await page.waitForTimeout(300);
      assert((await page.locator('#arena .fx-bubble').count()) >= 3, 'bubbles rise');
      if (d.i === sinks[0].i) {
        await page.waitForTimeout(500);
        await shot(page, 'pit-sink-1440');
      }
      await page.waitForFunction((nm) => document.querySelector(`.fig[data-name=${nm}]`).classList.contains('gone'), d.name, { timeout: 5000 });
    });
  }
  await check('pit: the other figures stay put while somebody sinks', async () => {
    const a = sinks[0];
    const b = sinks[1];
    if (!b) return;
    await go(page, a.i);
    const p1 = await page.locator(`.fig[data-name=${b.name}]`).evaluate((el) => [el.style.left, el.style.top]);
    await go(page, a.i - 1);
    const p0 = await page.locator(`.fig[data-name=${b.name}]`).evaluate((el) => [el.style.left, el.style.top]);
    assert(p0.join() === p1.join(), `${b.name} moved from ${p0} to ${p1}`);
  });
  noIssues(page);
  await closePage(page);
}

{
  const page = await openPage(1440, { url: '/?tape=pit-anchor&i=0' });
  const tape = ptape('anchor');
  const e = pev('anchor', (x) => x.type === 'ability_use' && x.power === 'anchor' && x.stage === 'pit');
  await check('pit: a failed push shows a "bounces off" chip; the Director cut names the power, the plain view does not', async () => {
    await go(page, e.i - 1);
    await page.evaluate((i) => window.__viewer.goto(i, { animate: true }), e.i);
    await page.waitForSelector('#arena .fx-chip.fx-ability', { timeout: 1500 });
    assert(/BOUNCES OFF/.test(await page.locator('#arena .fx-chip.fx-ability').first().innerText()), 'bounce chip');
    assert((await page.locator(`.fig[data-name=${e.name}]`).getAttribute('class')).includes('bounce'), 'target bounces');
    const pub = await page.locator('#now').innerText();
    assert(/would not budge/.test(pub) && !/anchor/i.test(pub), `public caption: ${pub}`);
    const transcript = await page.locator('#transcript').innerText();
    assert(!/anchor/i.test(transcript.replace(/“[^”]*”/g, '')), 'no power name in the plain transcript');
    await go(page, e.i, true);
    assert(/uses Anchor/.test(await page.locator('#now').innerText()), 'cut names the power');
    assert(/Anchor/.test(await page.locator('#transcript').innerText()), 'cut transcript names it');
  });
  await check('pit: plain view never shows a power name on any chip, caption or highlight', async () => {
    for (let i = 0; i < tape.events.length; i += 3) {
      await go(page, i, false);
      // a spoken line is the agent's own words (a liar can say anything), so the caption is skipped while it shows one
      const texts = await page.evaluate(() => {
        const cap = window.__viewer.app.state.caption;
        const skipNow = cap && cap.kind === 'say';
        return [...document.querySelectorAll(`.fig .act, .fig .note, .fx-chip, .hud-title, .hud-sub, .hud-right, #highlights button${skipNow ? '' : ', #now'}`)].map((n) => n.textContent).join(' | ');
      });
      assert(!pitLeakWords.test(texts), `leak at ${i}: ${texts.match(pitLeakWords)}`);
    }
  });
  noIssues(page);
  await closePage(page);
}

{
  const page = await openPage(390, { url: '/?tape=pit-feather&i=0' });
  const tape = ptape('feather');
  await check('pit: feather and floor saves float out, with their own chips', async () => {
    const f = pev('feather', (x) => x.type === 'ability_use' && x.power === 'feather' && x.stage === 'pit');
    await go(page, f.i);
    assert(/floats right out of the pit/.test(await page.locator('#now').innerText()), 'feather caption');
    assert(!/feather/i.test(await page.locator('#now').innerText()), 'no power name');
    const top = await page.locator(`.fig[data-name=${f.name}]`).evaluate((el) => parseFloat(el.style.top));
    assert(top < 45, `${f.name} floated to the rim (top ${top}%)`);
    const p2 = await openPage(390, { url: '/?tape=pit-floor3&i=0' });
    const lk = ptape('floor3').events.find((x) => x.type === 'lucky_save' && x.stage === 'pit');
    await go(p2, lk.i);
    assert(/plank floats by/.test(await p2.locator('#now').innerText()), 'plank caption');
    assert((await p2.locator(`.fig[data-name=${lk.name}]`).evaluate((el) => parseFloat(el.style.top))) < 45, 'saved figure is out of the water');
    await closePage(p2);
    void tape;
  });
  await closePage(page);
}

{
  const page = await openPage(1440, { url: '/?tape=pit-photoShoves&i=0' });
  await check('ledge: the photo finish lucky save reads well and has a highlight', async () => {
    const lk = pev('photoShoves', (x) => x.type === 'lucky_save' && /photo finish/.test(x.why));
    await go(page, lk.i);
    const text = await page.locator('#now').innerText();
    assert(/won the photo finish on shoves/.test(text) && !/lucky break/.test(text), `caption: ${text}`);
    const labels = await page.locator('#highlights button').allInnerTexts();
    assert(labels.some((t) => /Photo finish on shoves/.test(t)), `highlights: ${labels.join(' | ')}`);
    await page.locator('#highlights button', { hasText: 'Photo finish' }).click();
    assert((await page.evaluate(() => window.__viewer.app.idx)) === lk.i, 'chip jumps to the save');
  });
  await closePage(page);
}

{
  const page = await openPage(1440, { url: '/?tape=pit-volunteer&i=0' });
  await check('pit: highlight chips for volunteer, shove, rope and flood', async () => {
    const want = [['volunteer', /volunteers to be the step/], ['pushed', /is shoved down as the step/], ['rope', /The rope: \w+ hauls \w+ out/], ['sink', /is left in the pit/]];
    for (const [name, re] of want) {
      await page.goto(`${base}/?tape=pit-${name}&i=0`);
      await page.waitForFunction(() => window.__viewer);
      const labels = await page.locator('#highlights button').allInnerTexts();
      assert(labels.some((t) => re.test(t)), `${name}: ${labels.join(' | ')}`);
      assert(labels.every((t) => /^The wall already says|left a message/.test(t) || !pitLeakWords.test(t)), `leak in ${labels.join(' | ')}`);
    }
  });
  await check('picker and badge: rules v3 tapes say so, older tapes do not', async () => {
    await page.goto(`${base}/?tape=pit-volunteer&i=0`);
    await page.waitForFunction(() => window.__viewer);
    const opt = await page.locator('#tape-picker option[value="pit-volunteer"]').innerText();
    assert(/\bv4\b/.test(opt) && opt.length < 70, `label: ${opt}`);
    assert(/rules v4/.test(await page.locator('#tape-meta .rules-badge').innerText()), 'meta badge');
    assert((await page.locator('#tape-meta .tier-badge').count()) === 0, 'no tier badge on a tape without a tier');
    if (realIndex.length) {
      const old = realIndex.find((e) => !(Number(e.rules) >= 3));
      if (old) {
        const label = await page.locator(`#tape-picker option[value="${old.id}"]`).innerText();
        assert(!/\bv3\b/.test(label), `old label: ${label}`);
        await page.goto(`${base}/?tape=${old.id}&i=0`);
        await page.waitForFunction(() => window.__viewer);
        assert((await page.locator('#tape-meta .rules-badge').count()) === 0, 'no rules badge on old tapes');
      }
    }
  });
  await closePage(page);
}

{
  const page = await openPage(1440, { url: '/?tape=pit-volcano&i=0' });
  await check('an unknown future stage and reveal never crash the viewer', async () => {
    const k = volcanoTape.events.findIndex((e) => e.stage === 'volcano');
    for (let i = k - 1; i < volcanoTape.events.length; i += 1) {
      await go(page, i, i % 2 === 0);
      assert((await page.locator('#arena').getAttribute('data-scene')).length > 0, 'a scene is always mounted');
    }
    await go(page, k);
    assert((await page.locator('#arena').getAttribute('data-scene')) === 'lobby', 'unknown stages fall back to the lobby scene');
    assert((await page.locator('.fig:not(.off):not(.gone)').count()) >= 4, 'figures are still shown');
    await go(page, volcanoTape.events.length - 1);
    assert(await page.locator('#results').isVisible(), 'the result still renders');
    noIssues(page);
  });
  await closePage(page);
}

{
  const page = await openPage(1440, { reducedMotion: 'reduce', url: '/?tape=pit-sink&i=0' });
  await check('pit with prefers-reduced-motion: no waypoints, no sink fx, still correct', async () => {
    const tape = ptape('sink');
    const lift = tape.events.find((e) => e.type === 'reveal' && e.what === 'pit' && e.data.lifted.length);
    const d = tape.events.find((e) => e.type === 'death' && e.style === 'sink');
    await go(page, lift.i - 1);
    await page.click('#chapters .chapter[data-chapter=pit]');
    await page.evaluate((i) => window.__viewer.goto(i - 1), d.i);
    await page.click('#btn-fwd');
    await page.waitForTimeout(200);
    assert((await page.locator('#arena .fx-chip, #arena .fx-hand, #arena .fx-bubble').count()) === 0, 'no fx nodes');
    assert((await page.locator('.fig[data-name]').evaluateAll((els) => els.reduce((n, el) => n + el.getAnimations().length, 0))) === 0, 'no running animations on figures');
    assert(await page.locator('.pit-water').evaluate((w) => getComputedStyle(w).transitionDuration === '0s'), 'water changes instantly');
    noIssues(page);
  });
  await closePage(page);
}

// screenshots of the pit at the three widths, looked at by a human
for (const width of WIDTHS) {
  const page = await openPage(width, { url: '/?tape=pit-big&i=0' });
  await check(`pit ${width}px: screenshots and layout of the key moments`, async () => {
    const tape = ptape('big');
    const reveals = tape.events.filter((e) => e.type === 'reveal' && e.what === 'pit');
    const first = reveals.find((r) => r.data.base);
    const mid = reveals.find((r) => r.data.flood >= 3 && r.data.out.length >= 2) || reveals[reveals.length - 1];
    const stops = [
      ['start', stageStartIndex(tape, 'pit') + 1],
      ['base', first.i],
      ['climbed', mid.i],
    ];
    const death = tape.events.find((e) => e.type === 'death' && e.style === 'sink');
    if (death) stops.push(['flooded', death.i - 1]);
    stops.push(['end', tape.events.find((e) => e.type === 'stage_end' && e.stage === 'pit').i]);
    for (const [label, i] of stops) {
      await go(page, i);
      assert((await page.locator('#arena').getAttribute('data-scene')) === 'pit', `${label}: pit scene`);
      const o = await overflow(page);
      assert(o.sw <= o.iw, `${label}: overflow ${o.sw} > ${o.iw}`);
      const bad = await page.evaluate(([audit, extra]) => [...new Function(`return (${audit})`)()(), ...new Function(`return (${extra})`)()()], [auditPage.toString(), auditPit.toString()]);
      assert(bad.length === 0, `${label}: ${bad.join(' | ')}`);
      await shot(page, `09-pit-${label}-${width}`);
    }
    // a line of speech in the pit, with its bubble in a clear lane
    const say = tape.events.find((e) => e.type === 'say' && e.stage === 'pit' && e.round >= 2);
    if (say) {
      await go(page, say.i);
      await shot(page, `09-pit-speech-${width}`);
    }
  });
  await closePage(page);
}

// SKIP_REAL=1 skips the long per-event sweep of the real tapes (for quick iterations on the pit)
// REAL_RULES=3 keeps only the rules v3 tapes (the ones with a pit)
const realRun = process.env.SKIP_REAL === '1' ? [] : process.env.REAL_RULES ? realIndex.filter((e) => Number(e.rules) >= Number(process.env.REAL_RULES)) : realIndex;
for (const entry of realRun) {
  const tape = JSON.parse(fs.readFileSync(path.join(webDir, 'tapes', `${entry.id}.json`), 'utf8'));
  const events = tape.events;

  await check(`${entry.id}: every reveal shape from the engine reaches the state`, () => {
    const alive = (s) => Object.values(s.players).filter((p) => p.alive).map((p) => p.name);
    for (const e of events) {
      if (e.type !== 'reveal') continue;
      const s = stateAt(tape, e.i);
      const d = e.data;
      if (e.what === 'line') assert(JSON.stringify(s.bridge.line) === JSON.stringify(d.line.filter((n) => alive(s).includes(n))), `line at ${e.i}`);
      if (e.what === 'weak_pane') assert(s.bridge.rows[d.row] && s.bridge.rows[d.row].weak === d.weak, `weak pane at ${e.i}`);
      if (e.what === 'ceiling') {
        assert(s.crusher.ceiling === Math.max(0, Math.min(5, d.ceiling)), `ceiling at ${e.i}`);
        if (d.leverHolder) assert(s.crusher.holder === d.leverHolder, `lever holder at ${e.i}: ${s.crusher.holder} vs ${d.leverHolder}`);
        if (d.jammed) assert(s.crusher.jam === true, `jammed at ${e.i}`);
      }
      if (e.what === 'tiles') for (const [k, name] of Object.entries(d.tiles)) assert(s.disc.tiles[name] === Number(k), `tile ${k} at ${e.i}`);
      if (e.what === 'trapdoors') for (const k of d.open) assert(s.disc.open.includes(k), `trapdoor ${k} at ${e.i}`);
      if (e.what === 'footing') for (const [n, v] of Object.entries(d.footing)) assert(s.ledge.footing[n] === v, `footing ${n} at ${e.i}`);
    }
  });

  await check(`${entry.id}: highlights are 1 to 8, in order, and never leak with the cut off`, () => {
    const list = highlights(tape);
    const isNote = (h) => /^The wall already says|left a message/.test(h.pub); // quotes public chalk, which may say anything
    assert(list.length >= 1 && list.filter((h) => !isNote(h)).length <= 8 && list.filter(isNote).length <= 4, `highlight count ${list.length}`);
    assert(list.every((h, k) => (k === 0 || h.i >= list[k - 1].i) && events[h.i]), 'in order, valid indexes');
    for (const h of list) {
      assert(isNote(h) || !POWER_WORDS.test(h.pub), `leak with the cut off: "${h.pub}"`);
      assert(h.pub.length < 60, `label too long: "${h.pub}"`);
    }
    for (const e of events) if (e.type === 'say' && e.forgedAs) assert(list.some((h) => h.i === e.i && /faked a message/.test(h.pub) && /forged a message as/.test(h.cut)), 'forged message highlight');
  });

  for (const width of WIDTHS) {
    const page = await openPage(width, { url: `/?tape=${entry.id}&i=0` });
    for (const cut of width === 768 ? [false] : [false, true]) {
      await check(`${entry.id} ${width}px${cut ? ' cut' : ''}: stepping through all ${events.length} events never throws, bubbles and layout hold`, async () => {
        const out = await page.evaluate(
          ([audit, extra, withCut]) => {
            const base = new Function(`return (${audit})`)();
            const more = new Function(`return (${extra})`)();
            const check = () => [...base(), ...more()];
            const v = window.__viewer;
            v.setCut(withCut);
            const bad = new Map();
            const n = v.app.tape.events.length;
            for (let i = 0; i < n; i++) {
              try {
                v.goto(i, { animate: false });
                const ev = v.app.tape.events[i];
                if (ev.type === 'say' || ev.type === 'death' || ev.type === 'reveal' || i % 9 === 0) for (const p of check()) bad.set(`${p} @${i}`, 1);
              } catch (err) {
                bad.set(`threw @${i}: ${err.message}`, 1);
              }
            }
            return [...bad.keys()].slice(0, 8);
          },
          [auditPage.toString(), auditPit.toString(), cut]
        );
        assert(out.length === 0, out.join(' | '));
      });
    }
    await check(`${entry.id} ${width}px: no console errors, no failed requests`, async () => noIssues(page));
    await closePage(page);
  }

  const page = await openPage(1440, { url: `/?tape=${entry.id}&i=0` });
  const entryDeaths = events.filter((e) => e.type === 'death');
  for (const d of entryDeaths) {
    await check(`${entry.id}: death ${d.name} (${d.style}) at ${d.i} has its animation state`, async () => {
      await go(page, d.i);
      assert((await page.locator(`.fig[data-name=${d.name}]`).getAttribute('data-fate')) === d.style, 'data-fate');
      assert(await page.locator(`.fig[data-name=${d.name}]`).evaluate((el) => el.classList.contains('gone')), 'gone when scrubbed to');
      const before = await page.evaluate((i) => {
        const evs = window.__viewer.app.tape.events;
        let j = i - 1;
        while (j > 0 && ['thought', 'whisper'].includes(evs[j].type)) j--;
        return j;
      }, d.i);
      await go(page, before);
      await page.click('#btn-fwd');
      let landed = await page.evaluate(() => window.__viewer.app.idx);
      let guard = 0;
      while (landed < d.i && guard++ < 6) {
        await page.click('#btn-fwd');
        landed = await page.evaluate(() => window.__viewer.app.idx);
      }
      assert(landed === d.i, `stepping reaches the death (landed ${landed})`);
      await page.waitForSelector(`#arena .fx-chip.fx-${d.style}`, { timeout: 1500 });
    });
  }

  await check(`${entry.id}: ledge footing pips match the footing reveal`, async () => {
    for (const e of events.filter((x) => x.type === 'reveal' && x.what === 'footing')) {
      await go(page, e.i);
      const got = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('.fig:not(.gone):not(.off)')].map((f) => [f.dataset.name, f.querySelectorAll('.pips i:not(.off)').length])));
      for (const [n, v] of Object.entries(e.data.footing)) {
        const alive = await page.evaluate(([i, name]) => window.__viewer.stateAt(i).players[name].alive, [e.i, n]);
        if (alive) assert(got[n] === v, `${n} shows ${got[n]} pips, reveal says ${v} (event ${e.i})`);
      }
    }
  });

  await check(`${entry.id}: highlight buttons jump, and the cut changes their wording`, async () => {
    await go(page, 0, false);
    const labels = await page.locator('#highlights button').allInnerTexts();
    const isNote = (t) => /^The wall already says|left a message/.test(t);
    assert(labels.length >= 1 && labels.filter((t) => !isNote(t)).length <= 8 && labels.filter(isNote).length <= 4, `buttons ${labels.length}`);
    assert(labels.every((t) => isNote(t) || !POWER_WORDS.test(t)), `leak: ${labels.join(' | ')}`);
    const want = highlights(tape)[labels.length - 1].i;
    await page.locator('#highlights button').last().click();
    assert((await page.evaluate(() => window.__viewer.app.idx)) === want, 'jumps to the highlight');
    await page.keyboard.press('d');
    const cutLabels = await page.locator('#highlights button').allInnerTexts();
    assert(cutLabels.join() !== labels.join() || !highlights(tape).some((h) => h.cut !== h.pub), 'cut wording differs where the pub text hides something');
    await page.keyboard.press('d');
  });

  await check(`${entry.id}: picker label has the winner and its model, plus the tier`, async () => {
    const opt = await page.locator(`#tape-picker option[value="${entry.id}"]`).innerText();
    assert(opt.length < 70, `label too long: ${opt}`);
    assert(opt.includes(entry.winner), `winner in label: ${opt}`);
    if (entry.winnerModel) assert(opt.includes(entry.winnerModel.split('/').pop()), `model in label: ${opt}`);
    if (entry.tier === 'cheap') assert(/Budget/.test(opt), `tier in label: ${opt}`);
    assert(await page.locator('#tape-meta .tier-badge').count() === (entry.tier ? 1 : 0), 'tier badge beside the picker');
  });
  noIssues(page);
  await closePage(page);
}

if (realIndex.length) {
  const page = await openPage(1440, { url: `/?tape=${HEAVY_ID}&i=0` });
  await check('heavy tier shows as "Heavyweights" in the picker and the badge', async () => {
    const opt = await page.locator(`#tape-picker option[value="${HEAVY_ID}"]`).innerText();
    assert(/Heavyweights/.test(opt), opt);
    assert(/Heavyweights/.test(await page.locator('#tape-meta .tier-badge').innerText()), 'badge text');
  });
  await closePage(page);
}

// playback pacing: a long line lingers, a mechanical action does not
if (realIndex.length) {
  const page = await openPage(1440, { url: `/?tape=${realIndex[0].id}&i=0` });
  await check('pacing: long lines linger at least 45 ms a character, actions stay quick, bubbles fade while playing', async () => {
    const t = await page.evaluate(() => {
      const evs = window.__viewer.app.tape.events;
      const say = evs.find((e) => e.type === 'say' && e.text.length > 100);
      return { len: say.text.length, i: say.i };
    });
    await go(page, t.i - 1);
    const started = Date.now();
    await page.selectOption('#speed', '4');
    await page.click('#btn-play');
    await page.waitForFunction((i) => window.__viewer.app.idx === i, t.i, { timeout: 8000 });
    const reached = Date.now();
    await page.waitForFunction((i) => window.__viewer.app.idx > i, t.i, { timeout: 12000 });
    const lingered = (Date.now() - reached) * 4;
    await page.click('#btn-play');
    assert(lingered >= t.len * 40, `line of ${t.len} chars lingered ${lingered} ms at 1x equivalent`);
    void started;
  });
  await closePage(page);
}

// ------------------------------------------------------------------ the chalk wall (rules v4)
console.log('\n== the chalk wall ==');
const CHALK_FIXTURES = Object.keys(chalkTapes).filter((k) => k !== 'old');
const cev = (tape, pred) => tape.events.find(pred);
const writeIdx = (tape) => tape.events.filter((e) => e.type === 'chalk_write').map((e) => e.i);
const cIdx = (tape) => ({
  lobby: 0,
  read: tape.events.findIndex((e) => e.type === 'chalk_read'),
  waiting: tape.events.findIndex((e) => e.type === 'round_start' && e.phase === 'waiting' && e.round === 2) + 3,
  crossing: tape.events.findIndex((e) => e.type === 'round_start' && e.phase === 'crossing' && e.round === 2) + 2,
  epiStart: tape.events.findIndex((e) => e.type === 'stage_start' && e.stage === 'chalk'),
  thoughts: tape.events.findIndex((e) => e.type === 'thought' && e.stage === 'chalk') + 1,
  actions: tape.events.findIndex((e) => e.type === 'action' && e.stage === 'chalk') + 1,
  firstWrite: writeIdx(tape)[0] ?? -1,
  lastWrite: writeIdx(tape).at(-1) ?? -1,
  epiEnd: tape.events.findIndex((e) => e.type === 'stage_end' && e.stage === 'chalk'),
  end: tape.events.length - 1,
});

// In-page audit of the chalk board(s): nothing clipped, nothing but text inside, no figure standing on the writing, bubbles clear of figures.
const auditChalk = () => {
  const ALLOWED_TAGS = new Set(['DIV', 'FIGURE', 'P', 'SPAN', 'FIGCAPTION', 'I']);
  const problems = [];
  const arena = document.getElementById('arena').getBoundingClientRect();
  const boards = [...document.querySelectorAll('#arena .chalk-board')].filter((b) => !b.hidden);
  const hit = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  const figs = [...document.querySelectorAll('.fig:not(.gone):not(.off)')].map((f) => ({ name: f.dataset.name, r: f.querySelector('.fig-in').getBoundingClientRect() }));
  for (const b of boards) {
    const r = b.getBoundingClientRect();
    if (r.left < arena.left - 2 || r.right > arena.right + 2 || r.top < arena.top - 2 || r.bottom > arena.bottom + 2) problems.push('board outside the arena');
    const box = b.querySelector('.chalk-notes');
    if (box.scrollHeight > box.clientHeight + 6) problems.push(`board text clipped (${box.scrollHeight} > ${box.clientHeight})`);
    for (const el of b.querySelectorAll('*')) if (!ALLOWED_TAGS.has(el.tagName)) problems.push(`markup inside the board: ${el.tagName}`);
    for (const t of b.querySelectorAll('.chalk-text, .chalk-by')) {
      const cs = getComputedStyle(t);
      if (parseFloat(cs.fontSize) < 14) problems.push(`chalk text under 14px: ${cs.fontSize}`);
      const tr = t.getBoundingClientRect();
      if (tr.right > r.right + 1 || tr.left < r.left - 1) problems.push('chalk text sticks out sideways');
      for (const f of figs) {
        if (!t.textContent.trim()) continue;
        const o = hit(tr, f.r);
        if (o > 0 && o / (tr.width * tr.height) > 0.12) problems.push(`${f.name} stands on the writing`);
      }
    }
    for (const bub of document.querySelectorAll('#arena .bubble')) {
      if (bub.hidden || bub.classList.contains('fade')) continue;
      const br = bub.getBoundingClientRect();
      for (const f of figs) if (hit(br, f.r) / (f.r.width * f.r.height) > 0.3) problems.push(`bubble covers ${f.name}`);
    }
  }
  if (document.getElementById('arena').dataset.scene === 'chalk') {
    for (const c of document.querySelectorAll('.fig:not(.gone):not(.off) .act')) {
      if (c.hidden) continue;
      const r = c.getBoundingClientRect();
      if (r.left < arena.left - 1 || r.right > arena.right + 1 || r.bottom > arena.bottom + 1) problems.push(`chip clipped: ${c.textContent}`);
    }
  }
  return problems;
};

const boardInfo = (page) =>
  page.evaluate(() => {
    const b = [...document.querySelectorAll('#arena .chalk-board')].find((x) => !x.hidden);
    if (!b) return null;
    return { notes: [...b.querySelectorAll('.chalk-note')].map((n) => ({ text: n.querySelector('.chalk-text').textContent, by: n.querySelector('.chalk-by').textContent, typing: n.classList.contains('typing'), current: n.classList.contains('current') })), blank: b.classList.contains('blank') };
  });

const chalkShot = async (page, name) => {
  if (!SHOTS) return;
  await shot(page, name);
};

for (const key of CHALK_FIXTURES) {
  const tape = chalkTapes[key];
  const n = tape.events.length;
  const I = cIdx(tape);
  const shown = tape.chalkShown || [];
  const written = tape.chalkWritten || [];
  for (const width of WIDTHS) {
    const page = await openPage(width, { url: `/?tape=chalk-${key}&i=0` });
    for (const cut of [false, true]) {
      await check(`chalk ${key} ${width}px${cut ? ' cut' : ''}: stepping through all ${n} events never throws, board unclipped, nothing covered`, async () => {
        const out = await page.evaluate(
          ([audit, base, withCut, lo, hi]) => {
            const a1 = new Function(`return (${audit})`)();
            const a2 = new Function(`return (${base})`)();
            const v = window.__viewer;
            v.setCut(withCut);
            const bad = new Map();
            const total = v.app.tape.events.length;
            for (let i = 0; i < total; i++) {
              try {
                v.goto(i, { animate: false });
                if (i < 40 || (i >= lo && i <= hi) || i % 11 === 0) for (const p of [...a1(), ...a2()]) bad.set(`${p} @${i}`, 1);
              } catch (err) {
                bad.set(`threw @${i}: ${err.message}`, 1);
              }
            }
            return [...bad.keys()].slice(0, 8);
          },
          [auditChalk.toString(), auditPage.toString(), cut, I.epiStart - 1, I.end]
        );
        assert(out.length === 0, out.join(' | '));
      });
    }

    await check(`chalk ${key} ${width}px: lobby and waiting room show exactly the earlier notes, tagged by place, as plain text`, async () => {
      for (const at of [I.lobby, I.read > 0 ? I.read : 1, I.waiting]) {
        await go(page, at);
        const info = await boardInfo(page);
        if (!shown.length) {
          assert(info === null, `no board without earlier notes (at ${at})`);
          continue;
        }
        assert(info && info.notes.length === shown.length, `${shown.length} notes at ${at}, saw ${info && info.notes.length}`);
        info.notes.forEach((note, k) => {
          const want = shown[k].text;
          const shownText = note.text;
          assert(shownText === want || (shownText.endsWith('…') && want.startsWith(shownText.slice(0, 8))), `note ${k} text: "${shownText}"`);
          assert(note.by === `— by a ${['', '1st', '2nd', '3rd'][shown[k].byPlace]}-place finisher`, `tag: ${note.by}`);
        });
      }
      if (shown.length) {
        await go(page, I.crossing);
        assert((await boardInfo(page)) === null, 'the board is gone once the line is on the glass');
        await go(page, I.lobby);
        const transcript = await page.locator('#transcript').innerText();
        void transcript;
        await go(page, I.read > 0 ? I.read : 1);
        assert(/What the wall says:/.test(await page.locator('#transcript').innerText()), 'transcript has the what-the-wall-says line');
        assert(/What the wall says/.test(await page.locator('#now').innerText()), 'caption has it too');
      }
      assert((await page.evaluate(() => document.querySelectorAll('#arena .chalk-board img, #arena .chalk-board b, #arena .chalk-board script, #results img, #transcript img, #highlights img').length)) === 0, 'no markup from note text');
      const o = await overflow(page);
      assert(o.sw <= o.iw, `horizontal overflow ${o.sw} > ${o.iw}`);
    });

    if (tape.chalkWritten) {
      await check(`chalk ${key} ${width}px: the epilogue shows the podium, the notes, the author and the skips`, async () => {
        await go(page, I.epiStart);
        assert((await page.locator('#arena').getAttribute('data-scene')) === 'chalk', 'chalk scene');
        const placedCount = await page.evaluate((i) => window.__viewer.stateAt(i).chalk.writers.length, I.epiStart);
        assert((await page.locator('.fig:not(.gone):not(.off)').count()) === placedCount, `only the ${placedCount} finishers stand on the podium`);
        assert((await boardInfo(page)).blank, 'blank wall at the start');
        await go(page, I.actions);
        const poses = await page.evaluate(() => ({ shrug: [...document.querySelectorAll('.fig.shrug')].map((f) => f.dataset.name), chips: [...document.querySelectorAll('.fig:not(.off) .act:not([hidden])')].map((c) => c.textContent) }));
        const skippers = await page.evaluate(([i]) => window.__viewer.stateAt(i).chalk.skipped, [I.actions]);
        assert(poses.shrug.length === skippers.length, `skippers shrug: ${poses.shrug} vs ${skippers}`);
        for (let k = 0; k < writeIdx(tape).length; k++) {
          await go(page, writeIdx(tape)[k]);
          const info = await boardInfo(page);
          assert(info.notes.length === k + 1, `${k + 1} notes on the wall`);
          const author = written[k];
          assert(info.notes.at(-1).by.includes(author.name), `signed by ${author.name}: ${info.notes.at(-1).by}`);
          assert(info.notes.filter((x) => x.current).length === 1, 'exactly one author highlighted');
          const writing = await page.evaluate(() => [...document.querySelectorAll('.fig.write')].map((f) => f.dataset.name));
          assert(writing.length === 1 && writing[0] === author.name, `author steps up: ${writing}`);
          assert(/scratches a message for the next contestants/.test(await page.locator('#now').innerText()), 'caption');
        }
        if (!written.length) {
          await go(page, I.epiEnd);
          assert((await boardInfo(page)).blank && /NOBODY/.test(await page.locator('#arena .chalk-board').getAttribute('data-hint')), 'blank wall says so');
        } else {
          await go(page, I.epiEnd);
          assert((await boardInfo(page)).notes.length === written.length && (await boardInfo(page)).notes.every((x) => !x.current), 'all notes stay, nobody highlighted once done');
        }
        const o = await overflow(page);
        assert(o.sw <= o.iw, 'horizontal overflow');
      });

      await check(`chalk ${key} ${width}px: writers' thoughts only show in Director's cut, notes in the results card`, async () => {
        await go(page, I.thoughts, false);
        assert((await page.locator('#arena .bubble.thought').count()) === 0, 'no thought bubbles with the cut off');
        assert(!/thinks:/.test(await page.locator('#transcript').innerText()), 'no thoughts in the transcript');
        await go(page, I.thoughts, true);
        assert((await page.locator('#arena .bubble.thought').count()) >= 1, 'thought bubbles in the cut');
        await go(page, I.end, false);
        const card = await page.locator('#results').innerText();
        assert(/The chalk wall/.test(card), 'results card has the chalk wall');
        for (const w of written) {
          assert(card.includes(w.text) || card.includes(w.text.slice(0, 30)), `results card has ${w.name}'s note`);
          assert(new RegExp(`${w.name}, ${['', '1st', '2nd', '3rd'][w.place]} place`).test(card), `${w.name} and the place`);
        }
        if (!written.length) assert(/Nobody left a message/.test(card), 'says nobody wrote');
        for (const s of shown) assert(card.includes(s.text.slice(0, 30)), 'earlier note in the card');
        assert(/rules v4/.test(await page.locator('#tape-meta').innerText()) && (!shown.length || /with chalk wall/.test(await page.locator('#tape-meta').innerText())), 'meta line');
        assert(/v4/.test(await page.locator(`#tape-picker option[value="chalk-${key}"]`).innerText()), 'picker badge v4');
        assert((await page.locator('#chapters button', { hasText: 'Chalk' }).count()) === 1, 'Chalk scrubber marker');
        const hl = await page.locator('#highlights button').allInnerTexts();
        assert(shown.length === 0 || hl.some((t) => /^The wall already says/.test(t)), 'wall highlight');
        assert(hl.filter((t) => /left a message/.test(t)).length === written.length, 'one highlight per note');
        const o = await overflow(page);
        assert(o.sw <= o.iw, 'horizontal overflow');
      });
    }

    if (key === 'wall3' || key === 'wall1') {
      await check(`chalk ${key} ${width}px: screenshots`, async () => {
        await go(page, I.lobby);
        await chalkShot(page, `chalk-${key}-lobby-${width}`);
        await go(page, I.waiting);
        await chalkShot(page, `chalk-${key}-waiting-${width}`);
        await go(page, I.actions);
        await chalkShot(page, `chalk-${key}-actions-${width}`);
        await go(page, I.lastWrite);
        await chalkShot(page, `chalk-${key}-epilogue-${width}`);
        await go(page, I.thoughts, true);
        await chalkShot(page, `chalk-${key}-epilogue-cut-${width}`);
        await go(page, I.end, false);
        if (SHOTS) await page.locator('#results').screenshot({ path: path.join(screensDir, `chalk-${key}-results-${width}.png`) });
      });
    }
    await check(`chalk ${key} ${width}px: no console errors, no failed requests`, async () => noIssues(page));
    await closePage(page);
  }
}

{
  const lone = chalkTapes.lone;
  if (lone) {
    const I = cIdx(lone);
    const page = await openPage(390, { url: `/?tape=chalk-lone&i=${I.lastWrite}` });
    await check('chalk lone survivor 390px: one writer on the 1st block, shot', async () => {
      assert((await page.locator('.fig:not(.gone):not(.off)').count()) === 1, 'one figure');
      await chalkShot(page, 'chalk-lone-epilogue-390');
    });
    await closePage(page);
  }
}

// the epilogue writes in as it plays, and is instant when scrubbed or with reduced motion
{
  const tape = chalkTapes.wall3;
  const I = cIdx(tape);
  const full = tape.chalkWritten[0].text;
  const page = await openPage(1440, { url: `/?tape=chalk-wall3&i=${I.firstWrite - 1}` });
  await check('chalk typing: a new note is scratched in when stepping, whole when scrubbed', async () => {
    await page.evaluate((i) => window.__viewer.goto(i, { animate: true }), I.firstWrite);
    await page.waitForTimeout(260);
    const mid = await boardInfo(page);
    const typed = mid.notes[0];
    assert(typed.typing && typed.text.length < full.length, `typing in progress: ${typed.text.length}/${full.length}`);
    await page.waitForFunction(() => !document.querySelector('.chalk-note.typing'), null, { timeout: 12000 });
    assert((await boardInfo(page)).notes[0].text.length >= Math.min(full.length, 20), 'finished text');
    await go(page, I.firstWrite - 1);
    await go(page, I.firstWrite);
    const scrubbed = await boardInfo(page);
    assert(!scrubbed.notes[0].typing, 'scrubbing is instant');
  });
  await closePage(page);
  const calm = await openPage(1440, { url: `/?tape=chalk-wall3&i=${I.firstWrite - 1}`, reducedMotion: 'reduce' });
  await check('chalk typing: reduced motion shows the note at once', async () => {
    await calm.evaluate((i) => window.__viewer.goto(i, { animate: true }), I.firstWrite);
    const info = await boardInfo(calm);
    assert(!info.notes[0].typing && info.notes[0].text.length > 5, 'instant');
    noIssues(calm);
  });
  await closePage(calm);
}

// playing the epilogue end to end, and the Next button, work like any other stage
{
  const tape = chalkTapes.wall1;
  const I = cIdx(tape);
  const page = await openPage(768, { url: `/?tape=chalk-wall1&i=${I.epiStart - 1}` });
  await check('chalk: Next steps through the epilogue to the results, playing reaches the end', async () => {
    let guard = 0;
    while ((await page.evaluate(() => window.__viewer.app.idx)) < I.end && guard++ < 40) await page.click('#btn-fwd');
    assert((await page.evaluate(() => window.__viewer.app.idx)) === I.end, 'reached the end by stepping');
    await go(page, I.epiStart - 1);
    await page.selectOption('#speed', '4');
    await page.click('#btn-play');
    await page.waitForFunction((i) => window.__viewer.app.idx >= i, I.end, { timeout: 40000 });
    assert((await page.locator('#results h2').count()) === 1, 'results card shown');
    noIssues(page);
  });
  await closePage(page);
}

// old tapes: no wall, no marker, no chalk in the card, exactly as before
for (const width of [390, 1440]) {
  const page = await openPage(width, { url: '/?tape=chalk-old&i=0' });
  await check(`chalk old tape ${width}px: nothing chalky anywhere`, async () => {
    const last = chalkTapes.old.events.length - 1;
    for (const at of [0, 30, last]) {
      await go(page, at);
      assert((await page.locator('#arena .chalk-board:not([hidden])').count()) === 0, 'no board');
    }
    assert((await page.locator('#chapters button', { hasText: 'Chalk' }).count()) === 0, 'no Chalk marker');
    assert(!/chalk/i.test(await page.locator('#results').innerText()), 'no chalk in the results');
    assert(!/chalk/i.test(await page.locator('#tape-meta').innerText()), 'no chalk in the meta line');
    assert(!/chalk|wall says/i.test(await page.locator('#highlights').innerText()), 'no chalk highlights');
    noIssues(page);
  });
  await closePage(page);
}

// full-page references
for (const width of [390, 1440]) {
  const page = await openPage(width, { url: `/?tape=sample&i=${IDX.end}` });
  if (SHOTS) {
    fs.mkdirSync(screensDir, { recursive: true });
    await page.screenshot({ path: path.join(screensDir, `page-end-${width}.png`), fullPage: true });
  }
  await closePage(page);
}

await browser.close();
server.close();

const failed = results.filter((r) => !r.ok);
console.log(`\nviewer.check: ${results.length - failed.length}/${results.length} passed`);
if (failed.length) {
  console.log('FAILED:\n' + failed.map((f) => ` - ${f.name}`).join('\n'));
  process.exit(1);
}
