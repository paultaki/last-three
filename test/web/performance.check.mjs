import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(
  new URL("../../web/show/package.json", import.meta.url),
);
const { chromium } = require("playwright");
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const errors = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    reducedMotion: "reduce",
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(
    "http://127.0.0.1:8843/last-three/show/?cast=city&tape=20261009-0025&edit=story&clean=1",
  );
  await page.waitForFunction(() => window.__show?.metrics.ready);
  await page.evaluate(async () => {
    const { FilmOverlay } = await import("/last-three/show/src/film.js");
    const host = document.createElement("div"),
      overlay = new FilmOverlay(host);
    __show.seek(541);
    const s = structuredClone(__show.state);
    s.ev.places = s.ev.places.filter((p) => p.place !== 1);
    overlay.setState(s, true);
    if (
      !host.querySelector(".film-finish").hidden ||
      host.querySelector(".film-finish strong").textContent
    )
      throw new Error("runner-up announced as winner");
  });
  const preview = async (i, ms = 1800) =>
    page.evaluate(
      ({ i, ms }) => {
        __show.seek(i);
        __show.preview(ms);
      },
      { i, ms },
    );
  for (const width of [1920, 1280, 390]) {
    await page.setViewportSize({
      width,
      height: width === 390 ? 844 : (width * 9) / 16,
    });
    for (const i of [348, 349, 489, 515, 527, 528, 541]) {
      await preview(i);
      const selector = i === 541 ? ".film-finish" : ".context-card";
      assert(await page.locator(selector).isVisible());
      assert.equal(await page.locator(".film-beat").isVisible(), false);
      const box = await page.locator(selector).boundingBox(),
        frame = await page.locator("#viewport").boundingBox();
      assert(
        box.x >= frame.x &&
          box.y >= frame.y &&
          box.x + box.width <= frame.x + frame.width + 1 &&
          box.y + box.height <= frame.y + frame.height + 1,
        `bounds ${width}:${i}`,
      );
    }
    const names = await page
      .locator(".focal-names span:visible")
      .allTextContents();
    assert.deepEqual([...names].sort(), [
      "1ST · Hana",
      "2ND · Gus",
      "3RD · Dara",
    ]);
  }
  await page.setViewportSize({ width: 1920, height: 1080 });
  await preview(527);
  assert(
    (await page.locator(".context-card p").textContent()).includes(
      "dodge not allowed twice",
    ),
  );
  await page.keyboard.press("d");
  for (const i of [348, 527]) {
    await preview(i);
    assert.equal(await page.locator(".context-card").isVisible(), false);
  }
  await preview(489);
  assert(await page.locator(".context-card").isVisible());
  await preview(200);
  assert.equal(
    JSON.parse(await page.evaluate(() => render_game_to_text())).performance,
    null,
  );
  await page.keyboard.press("d");
  for (const i of [
    200, 201, 226, 269, 300, 348, 436, 445, 489, 490, 515, 527, 541,
  ]) {
    await preview(i);
    const first = await page.locator("#viewport").screenshot();
    await preview(2);
    await preview(i);
    assert(
      first.equals(await page.locator("#viewport").screenshot()),
      `reverse ${i}`,
    );
    await page.screenshot({ path: `docs/show/screens/audience2-${i}.png` });
  }
  assert.deepEqual(errors, []);
  const results = {
    widths: [1920, 1280, 390],
    errors,
    checks: [
      "context and finale bounds",
      "private power/rejection visibility",
      "public feather save",
      "three named finalists",
      "recorded rejection reason",
      "private performance removal",
      "reverse seek pixels",
    ],
  };
  fs.writeFileSync(
    "docs/show/performance-results.json",
    JSON.stringify(results, null, 2) + "\n",
  );
  console.log(results);
} finally {
  await browser.close();
}
