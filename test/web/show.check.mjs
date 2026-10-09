// Browser acceptance for the 3D viewer, including deployment under a subpath.
import assert from "node:assert/strict";
import fs from "node:fs";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(
  new URL("../../web/show/package.json", import.meta.url),
);
const { chromium } = require("playwright");
const server = spawn(process.execPath, ["web/show/tools/serve.mjs"], {
  env: { ...process.env, PORT: "8857" },
  stdio: "pipe",
});
await new Promise((resolve, reject) => {
  server.stdout.once("data", resolve);
  server.once("error", reject);
  server.once("exit", (c) => reject(new Error("Server exited " + c)));
});
const browser = await chromium.launch({
  headless: true,
  channel: process.env.SHOW_BROWSER || "chrome",
});
const tape = JSON.parse(fs.readFileSync("web/tapes/20261009-0016.json"));
const city = process.env.SHOW_CITY === "1";
const screenshots = "docs/show/screens";
fs.mkdirSync(screenshots, { recursive: true });
const results = [];
try {
  for (const width of process.env.SHOW_WIDTH
    ? [Number(process.env.SHOW_WIDTH)]
    : [390, 768, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 1100 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto(
      `http://127.0.0.1:8857/last-three/show/?view=studio&tape=${tape.id}${city ? "&cast=city" : ""}`,
    );
    await page.waitForFunction(() => window.__show?.metrics.ready);
    assert.equal(
      await page.locator("body").evaluate((el) => el.scrollWidth <= innerWidth),
      true,
      `overflow ${width}`,
    );
    const stages = [
      "lobby",
      "bridge",
      "crusher",
      "pit",
      "disc",
      "ledge",
      "chalk",
      "ended",
    ];
    for (const stage of stages) {
      let i =
        stage === "lobby"
          ? 0
          : stage === "ended"
            ? tape.events.length - 1
            : tape.events.findIndex(
                (e) => e.type === "stage_start" && e.stage === stage,
              );
      if (stage === "bridge")
        i = tape.events.findIndex(
          (e) => e.type === "round_start" && e.phase === "crossing",
        );
      if (stage === "pit")
        i = tape.events.findIndex(
          (e) => e.type === "reveal" && e.what === "pit",
        );
      if (stage === "disc")
        i = tape.events.findIndex(
          (e) => e.type === "reveal" && e.what === "tiles",
        );
      if (stage === "chalk")
        i = tape.events.findIndex((e) => e.type === "chalk_write");
      await page.evaluate((i) => {
        __show.seek(i);
        __show.settle();
      }, i);
      const before = await page.evaluate(() => __show.snapshot());
      // Compare the rendered scene without browser-composited label edges.
      await page.locator("#labels").evaluate((el) => {
        el.style.visibility = "hidden";
      });
      const frameBefore = await page.locator("#viewport").screenshot();
      await page.evaluate(() => {
        __show.seek(0);
        __show.seek(12);
      });
      await page.evaluate((i) => {
        __show.seek(i);
        __show.settle();
      }, i);
      assert.equal(
        await page.evaluate(() => __show.snapshot()),
        before,
        `seek determinism ${stage}`,
      );
      const frameAfter = await page.locator("#viewport").screenshot();
      await page.locator("#labels").evaluate((el) => {
        el.style.visibility = "";
      });
      // Chrome can rasterize a tiny label edge differently after a layer rebuild.
      // Keep the structural comparison strict: at most 0.01% pixels, <=32/channel.
      let difference = { pixels: 0, max: 0, total: 1 };
      if (!frameBefore.equals(frameAfter)) {
        difference = await page.evaluate(
          async ([a, b]) => {
            const decode = async (base64) => {
              const img = new Image();
              img.src = "data:image/png;base64," + base64;
              await img.decode();
              const canvas = document.createElement("canvas");
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0);
              return ctx.getImageData(0, 0, img.width, img.height).data;
            };
            const left = await decode(a),
              right = await decode(b);
            if (left.length !== right.length)
              return { pixels: Infinity, max: Infinity, total: 1 };
            let pixels = 0,
              max = 0;
            for (let i = 0; i < left.length; i += 4) {
              let d = 0;
              for (let j = 0; j < 4; j++)
                d = Math.max(d, Math.abs(left[i + j] - right[i + j]));
              if (d) pixels++;
              max = Math.max(max, d);
            }
            return { pixels, max, total: left.length / 4 };
          },
          [frameBefore.toString("base64"), frameAfter.toString("base64")],
        );
      }
      assert(
        difference.pixels / difference.total <= 0.0001 && difference.max <= 32,
        `settled frame differs after reverse seek: ${stage}/${width}: ${JSON.stringify(difference)}`,
      );
      await page.screenshot({
        path: `${screenshots}/${stage}-${width}.png`,
        fullPage: true,
      });
    }
    const thought = tape.events.findIndex((e) => e.type === "thought");
    await page.evaluate((i) => __show.seek(i), thought);
    assert(
      !(await page.locator("#caption").innerText()).includes(
        tape.events[thought].text,
      ),
      "private thought leaked",
    );
    assert.equal(await page.locator(".power:not([hidden])").count(), 0);
    await page.locator("#director").click();
    assert(
      (await page.locator("#caption").innerText()).includes(
        tape.events[thought].text,
      ),
    );
    await page.locator("#director").click();
    await page.locator("#transcript-panel summary").click();
    assert(
      !(await page.locator("#transcript").innerText()).includes(
        tape.events[thought].text,
      ),
    );
    await page.locator("#scrub").fill("408");
    assert.equal(await page.evaluate(() => __show.index), 408);
    await page.locator("#next").click();
    const keyAt = await page.evaluate(() => __show.index);
    await page.keyboard.press("ArrowRight");
    assert(
      (await page.evaluate(() => __show.index)) > keyAt,
      "keyboard after button focus",
    );
    assert((await page.evaluate(() => __show.index)) > 408);
    await page.locator("#play").click();
    await page.waitForTimeout(180);
    assert.equal(await page.evaluate(() => __show.playing), true);
    await page.locator("#play").click();
    const at = await page.evaluate(() => __show.index);
    await page.waitForTimeout(200);
    assert.equal(await page.evaluate(() => __show.index), at);
    await page.locator("#quality").selectOption("lite");
    assert.equal(await page.evaluate(() => __show.metrics.quality), "lite");
    await page.locator("#camera").click();
    assert.equal(
      await page.locator("#camera").getAttribute("aria-pressed"),
      "true",
    );
    await page.locator("#quality").selectOption("auto");
    await page.evaluate(() => {
      __show.seek(408);
      __show.settle();
      __show.metrics.frames.length = 0;
    });
    await page.waitForTimeout(2200);
    const m = await page.evaluate(() => __show.metrics),
      frames = m.frames.filter((v) => v > 0).sort((a, b) => a - b);
    const p95 = frames[Math.floor(frames.length * 0.95)];
    assert(p95 < 100, `severe frame stall ${width}: ${p95}`);
    const bytes = await page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .reduce((n, r) => n + r.decodedBodySize, 0),
    );
    assert(bytes < 20 * 1024 * 1024, `20 MB budget exceeded: ${bytes}`);
    assert.deepEqual(errors, [], `browser errors ${width}`);
    results.push({
      width,
      quality: m.quality,
      city,
      bytes,
      p95ms: p95,
      medianMs: frames[Math.floor(frames.length / 2)],
      drawCalls: m.drawCalls,
      triangles: m.triangles,
    });
    await context.close();
  }
  // Real rope tape and all event transitions, plus no stale completion after overlapping loads.
  const p = await browser.newPage();
  await p.goto(
    `http://127.0.0.1:8857/last-three/show/?view=studio&tape=20261008-0057${city ? "&cast=city" : ""}`,
  );
  await p.waitForFunction(() => window.__show?.metrics.ready);
  const rope = JSON.parse(
    fs.readFileSync("web/tapes/20261008-0057.json"),
  ).events.findIndex((e) => e.what === "rope");
  await p.evaluate((i) => {
    __show.seek(i);
    __show.settle();
  }, rope);
  assert(await p.evaluate(() => !!__show.state.pit.rope));
  await p.screenshot({ path: `${screenshots}/rope.png` });
  await p.evaluate(async () => {
    await Promise.all([
      __show.load("20261009-0001"),
      __show.load("20261009-0016"),
    ]);
  });
  await p.waitForURL((url) => url.searchParams.get("tape") === "20261009-0016");
  await p.evaluate(() => {
    window.urlWrites = 0;
    const replace = history.replaceState.bind(history);
    history.replaceState = (...args) => {
      window.urlWrites++;
      return replace(...args);
    };
    for (let i = 0; i < 512; i++) __show.seek(i);
  });
  assert(
    (await p.evaluate(() => window.urlWrites)) < 5,
    "URL writer must coalesce rapid seeks",
  );
  assert(await p.evaluate(() => __show.state.ended));
  await p.close();
  fs.writeFileSync(
    "docs/show/browser-results.json",
    JSON.stringify(
      {
        date: "2026-10-08",
        browser: "Chrome headless on local Mac",
        physicalPhoneVerified: false,
        results,
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
  server.kill();
}
