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
    "http://127.0.0.1:8843/last-three/show/?cast=city&tape=20261009-0025&edit=story&clean=1&i=82",
  );
  await page.waitForFunction(() => window.__show?.metrics.ready);
  assert(await page.evaluate(() => __show.film && __show.story && __show.cut));
  const frame = await page.locator("#viewport").boundingBox();
  assert.equal(frame.width / frame.height, 16 / 9);
  assert.equal(await page.locator(".transport").isVisible(), false);
  const list = await page.evaluate(() => __show.playlist);
  for (const i of list) {
    await page.evaluate((i) => {
      __show.seek(i);
      __show.settle();
    }, i);
    const bubble = page.locator(".speech-bubble");
    if (await bubble.isVisible()) {
      const b = await bubble.boundingBox();
      assert(
        b.x >= 0 && b.y >= 0 && b.x + b.width <= 1920 && b.y + b.height <= 1080,
        `bubble bounds ${i}`,
      );
      assert.equal(
        await bubble.evaluate((e) => e.scrollHeight <= e.clientHeight),
        true,
      );
    } else
      assert.equal(
        await page.locator(".speech-leader").isVisible(),
        false,
        `orphan leader ${i}`,
      );
    if ([82, 200, 201, 290, 436, 440, 445, 509, 514, 539, 541].includes(i))
      await page.screenshot({ path: `docs/show/screens/film-${i}.png` });
  }
  await page.evaluate(() => __show.seek(200));
  const before = await page.locator("#viewport").screenshot();
  await page.evaluate(() => {
    __show.seek(440);
    __show.seek(200);
    __show.settle();
  });
  assert(
    before.equals(await page.locator("#viewport").screenshot()),
    "deterministic film shot",
  );
  await page.keyboard.press("d");
  assert.equal(
    await page.locator(".speech-bubble").getAttribute("data-kind"),
    "say",
    "public cut moves to the next public beat",
  );
  assert(
    !(await page.locator(".speech-bubble p").textContent()).includes("shield"),
  );
  assert.equal(await page.evaluate(() => __show.cut), false);
  await page.keyboard.press("Escape");
  assert(await page.locator(".transport").isVisible());
  await page.locator("#demo").click();
  await page.waitForFunction(() => __show.playing && __show.story);
  await page.locator("#play").click();
  assert.equal(await page.evaluate(() => __show.playing), false);
  await page.evaluate(() => __show.seek(200));
  await page.locator("#play").click();
  await page.evaluate(() => advanceTime(12000));
  assert.equal(await page.evaluate(() => __show.index), 200);
  assert(
    (await page.locator(".speech-bubble small").textContent()).startsWith("2"),
  );
  await page.locator("#play").click();
  const frozen = await page.locator(".speech-bubble p").textContent();
  await page.evaluate(() => advanceTime(6000));
  assert.equal(await page.locator(".speech-bubble p").textContent(), frozen);
  await page.evaluate(() => __show.seek(__show.playlist.at(-1)));
  await page.locator("#back").click();
  await page.locator("#play").click();
  await page.evaluate(() => advanceTime(10000));
  assert.equal(await page.evaluate(() => __show.index), 541);
  assert.equal(await page.evaluate(() => __show.playing), false);
  await page.locator("#play").click();
  assert.equal(await page.evaluate(() => __show.index), 0);
  await page.locator("#play").click();
  await page.locator("#presentation").click();
  assert.equal(await page.evaluate(() => __show.film), false);
  await page.locator("#presentation").click();
  await page.keyboard.press("f");
  assert.equal(await page.locator(".transport").isVisible(), false);
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.evaluate(() => __show.seek(440));
  await page.screenshot({ path: "docs/show/screens/film-workbench.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  assert(await page.evaluate(() => document.body.scrollWidth <= innerWidth));
  assert.deepEqual(errors, []);
  const report = {
    checkedBeats: list.length,
    widths: [1920, 1280, 390],
    errors,
    checks: [
      "16:9 clean frame",
      "dialogue bounds",
      "private thought removal",
      "no orphan tails",
      "reverse seek pixels",
      "reading pagination",
      "pause",
      "story end and restart",
      "studio toggle",
      "F and Escape",
      "no overflow",
    ],
  };
  fs.writeFileSync(
    "docs/show/film-results.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(report);
} finally {
  await browser.close();
}
