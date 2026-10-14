// Renders every shot of the episode to numbered JPEG frames, frame-exact.
//
//   node web/show/tools/episode/render.mjs [--cast city] [--only c1,b20]
//        [--shard 1/2] [--size 1920x1080]
//
// Frames land in docs/show/episode/frames/<shot>/. Finished shots are skipped,
// so an interrupted render resumes. Uses local Chrome when present, else the
// bundled Chromium with software WebGL.
import { chromium } from "playwright";
import fs from "node:fs";
import http from "node:http";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { TAPE, SHOTS } from "./episode.mjs";
import { FPS, OUT, timeline } from "./plan.mjs";

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .join(" ")
    .split("--")
    .filter(Boolean)
    .map((a) => a.trim().split(/\s+/)),
);
const [W, H] = (args.size || "1920x1080").split("x").map(Number);
const only = args.only ? new Set(args.only.split(",")) : null;
const [shardK, shardN] = (args.shard || "1/1").split("/").map(Number);
const city = args.cast === "city";
const BASE = "http://127.0.0.1:8843/last-three/show/";

const up = () =>
  new Promise((ok) =>
    http.get(BASE, (r) => ok(r.statusCode === 200)).on("error", () => ok(false)),
  );
let server = null;
if (!(await up())) {
  server = spawn(
    process.execPath,
    [fileURLToPath(new URL("../serve.mjs", import.meta.url))],
    { stdio: "ignore" },
  );
  for (let i = 0; i < 50 && !(await up()); i++)
    await new Promise((r) => setTimeout(r, 200));
}

const plan = timeline();
const lines = Object.fromEntries(
  SHOTS.filter((s) => s.bubble && s.i !== undefined).map((s) => [s.i, s.bubble]),
);
const todo = plan.filter(
  (s, n) =>
    (!only || only.has(s.id)) &&
    n % shardN === shardK - 1 &&
    !(
      fs.existsSync(OUT + `frames/${s.id}`) &&
      fs.readdirSync(OUT + `frames/${s.id}`).length === s.frames
    ),
);
console.log(`${todo.length} shots to render, ${todo.reduce((n, s) => n + s.frames, 0)} frames`);

async function launch() {
  try {
    return await chromium.launch({ channel: "chrome" });
  } catch {
    return chromium.launch({
      args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
    });
  }
}
const browser = await launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(`${BASE}?tape=${TAPE}&i=2&clean=1${city ? "&cast=city" : ""}`);
await page.waitForFunction(() => window.__show?.metrics.ready, null, {
  timeout: 120000,
});
await page.evaluate((lines) => {
  __show.director(true);
  __show.episode({ lines });
}, lines);
await page.addStyleTag({ path: fileURLToPath(new URL("overlay.css", import.meta.url)) });
await page.evaluate(() => {
  const el = document.createElement("div");
  el.id = "ep";
  el.innerHTML = `
    <div class="ep-counter"><b></b><span>LEFT</span></div>
    <div class="ep-card"><strong></strong><span class="ep-model"></span><em></em></div>
    <div class="ep-title"><h1>LAST THREE</h1><p>8 AIs · 5 OBSTACLES · 3 PRIZES</p></div>
    <div class="ep-black"></div>`;
  document.body.append(el);
  const q = (s) => el.querySelector(s);
  const ease = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
  window.__ep = (shot, ms) => {
    document.body.classList.toggle("ep-nobubble", !shot.bubble);
    q(".ep-black").hidden = !shot.black;
    q(".ep-title").hidden = !shot.title;
    q(".ep-title").style.setProperty("--grow", 1 + 0.04 * (ms / shot.dur));
    const counter = shot.counter;
    q(".ep-counter").hidden = counter === null || !!shot.black || !!shot.title;
    q(".ep-counter b").textContent = counter === 3 ? "FINAL" : counter;
    q(".ep-counter span").textContent = counter === 3 ? "THREE" : "LEFT";
    const pop = shot.counterChanged ? 1 + 0.5 * (1 - ease(ms / 600)) : 1;
    q(".ep-counter").style.setProperty("--pop", pop);
    q(".ep-counter").classList.toggle("flash", shot.counterChanged && ms < 900);
    q(".ep-card").hidden = !shot.card;
    if (shot.card) {
      q(".ep-card strong").textContent = shot.card[0];
      q(".ep-card .ep-model").textContent = shot.card[1];
      q(".ep-card em").textContent = shot.card[2];
      q(".ep-card").style.setProperty("--in", ease(ms / 260));
    }
  };
});

let previousCounter = null;
for (const entry of plan) {
  entry.counterChanged = entry.counter !== null && entry.counter !== previousCounter;
  previousCounter = entry.counter;
}
const started = Date.now();
let done = 0;
for (const shot of todo) {
  const dir = OUT + `frames/${shot.id}/`;
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  if (shot.i !== undefined) await page.evaluate((i) => __show.seek(i), shot.i);
  const still = shot.freeze || shot.black || shot.title;
  for (let k = 0; k < shot.frames; k++) {
    const file = dir + String(k + 1).padStart(5, "0") + ".jpg";
    if (still && k > 0) {
      fs.copyFileSync(dir + "00001.jpg", file);
      continue;
    }
    const ms = (k * 1000) / FPS;
    await page.evaluate(
      ([shot, at, ms]) => {
        if (shot.i !== undefined) __show.preview(at + ms);
        __ep(shot, ms);
      },
      [shot, shot.at ?? 0, ms],
    );
    await page.screenshot({ path: file, type: "jpeg", quality: 92 });
    done++;
  }
  const rate = (Date.now() - started) / Math.max(1, done);
  console.log(`${shot.id}: ${shot.frames} frames (${(rate / 1000).toFixed(2)} s/frame)`);
}
await browser.close();
server?.kill();
if (errors.length) {
  console.error("Page errors:", errors);
  process.exitCode = 1;
}
