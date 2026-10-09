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
    new FilmOverlay(document.createElement("div")).render(0);
  });
  const preview = async (i, ms) =>
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
    for (const i of [201, 226, 269, 300, 440, 445, 514]) {
      await preview(i, 0);
      if ([201, 226, 269, 440, 445].includes(i))
        assert.equal(await page.locator(".evidence-card").isVisible(), false);
      await preview(i, 30000);
      assert(await page.locator(".evidence-card").isVisible());
      const box = await page.locator(".evidence-card").boundingBox(),
        frame = await page.locator("#viewport").boundingBox();
      assert(
        box.x >= frame.x &&
          box.y >= frame.y &&
          box.x + box.width <= frame.x + frame.width + 1 &&
          box.y + box.height <= frame.y + frame.height + 1,
        `evidence bounds ${width}:${i}`,
      );
      for (const name of await page.locator(".focal-names span:visible").all()) {
        const n = await name.boundingBox();
        const overlaps = n.x < box.x + box.width && n.x + n.width > box.x &&
          n.y < box.y + box.height && n.y + n.height > box.y;
        assert(!overlaps, `name/evidence overlap ${width}:${i}`);
      }
      if (await page.locator(".speech-bubble").isVisible()) {
        const bubble = await page.locator(".speech-bubble").boundingBox();
        assert(bubble.y + bubble.height <= box.y, `card overlap ${width}:${i}`);
      }
    }
  }
  await page.setViewportSize({ width: 1920, height: 1080 });
  await preview(269, 30000);
  assert(
    (await page.locator(".evidence-card p").textContent()).includes(
      "Dara sent this. Eli did not.",
    ),
  );
  await page.keyboard.press("d");
  await preview(269, 30000);
  assert.equal(await page.locator(".evidence-card").isVisible(), false);
  assert.equal(await page.locator(".speech-bubble").isVisible(), false);
  await preview(440, 30000);
  assert.equal(await page.locator(".evidence-card").isVisible(), false);
  await page.keyboard.press("d");
  await preview(514, 30000);
  assert(
    (await page.locator(".evidence-card small").textContent()).includes(
      "WHISPER",
    ),
  );
  const before = await page.locator("#viewport").screenshot();
  await preview(269, 30000);
  await preview(514, 30000);
  assert(
    before.equals(await page.locator("#viewport").screenshot()),
    "receipt reverse seek",
  );
  await preview(516, 0);
  assert.equal(await page.locator(".consequence").isVisible(), false);
  assert.equal(await page.locator(".film-beat").isVisible(), false);
  await preview(516, 3000);
  assert(
    (await page.locator(".consequence strong").textContent()).includes(
      "DARA TAKES THIRD",
    ),
  );
  assert(
    (await page.locator(".consequence p").textContent()).includes(
      "2 contestants",
    ),
  );
  for (const i of [201, 226, 269, 300, 436, 440, 514, 516, 327]) {
    await preview(i, 30000);
    await page.screenshot({ path: `docs/show/screens/audience-${i}.png` });
  }
  assert.deepEqual(errors, []);
  const result = {
    widths: [1920, 1280, 390],
    errors,
    checks: [
      "reading-before-reveal",
      "evidence bounds",
      "no bubble overlap",
      "no name/evidence overlap",
      "forged identity privacy",
      "private receipt removal",
      "whisper attribution",
      "reverse seek pixels",
      "delayed consequence",
    ],
  };
  fs.writeFileSync(
    "docs/show/direction-results.json",
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(result);
} finally {
  await browser.close();
}
