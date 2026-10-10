import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
const { chromium } = createRequire(
  new URL("../../web/show/package.json", import.meta.url),
)("playwright");
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const errors = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(
    "http://127.0.0.1:8843/last-three/show/?cast=city&tape=20261009-0025&edit=story&clean=1",
  );
  await page.waitForFunction(() => window.__show?.metrics.ready);
  assert(await page.evaluate(() => __show.hook));
  assert.equal(await page.locator(".consequence").isVisible(), false);
  assert.equal(await page.locator(".evidence-card").isVisible(), false);
  await page.keyboard.press("Escape");
  assert(await page.evaluate(() => __show.hook));
  await page.keyboard.press("f");
  await page.keyboard.press("Space");
  await page.evaluate(() => advanceTime(3000));
  assert(await page.evaluate(() => __show.hook));
  await page.keyboard.press("Space");
  const elapsed = await page.evaluate(() => __show.elapsed);
  await page.evaluate(() => advanceTime(2000));
  assert.equal(await page.evaluate(() => __show.elapsed), elapsed);
  await page.keyboard.press("Space");
  await page.evaluate(() => advanceTime(3100));
  assert.equal(await page.evaluate(() => __show.hook), false);
  assert.equal(await page.evaluate(() => __show.index), 0);
  const preview = async (i, ms) =>
    page.evaluate(
      ({ i, ms }) => {
        __show.seek(i);
        __show.preview(ms);
      },
      { i, ms },
    );
  const data = async () =>
    JSON.parse(await page.evaluate(() => render_game_to_text()));
  await preview(391, 0);
  await page.keyboard.press("Space");
  await page.evaluate(() => advanceTime(1000));
  await page.keyboard.press("Space");
  const held = (await data()).stagedActors;
  await page.evaluate(() => advanceTime(2000));
  assert.deepEqual(
    (await data()).stagedActors,
    held,
    "pause freezes body motion",
  );
  // Close speech and the silent listener are separate compositions after reading.
  await preview(440, 2000);
  const speaker = (await data()).camera;
  await preview(440, 18000);
  const listener = await data();
  assert.notDeepEqual(listener.camera, speaker);
  assert.equal(
    listener.stagedActors.find((a) => a.name === "Bex").facing,
    0.28,
  );
  for (const [i, ms, kind] of [
    [346, 900, "shove"],
    [347, 2300, "lever"],
    [391, 2000, "rim"],
  ]) {
    await preview(i, ms);
    const contacts = (await data()).contactErrors.filter(
      (c) => c.kind === kind,
    );
    assert.equal(contacts.length, 2);
    assert(
      contacts.every((c) => c.error < 0.12),
      `${kind} reach`,
    );
  }
  await preview(391, 2000);
  let d = await data();
  assert(d.stagedActors.find((a) => a.name === "Fenn").position[1] > 0);
  assert(d.stagedActors.find((a) => a.name === "Gus").position[1] < 0);
  await preview(391, 6500);
  d = await data();
  for (const name of ["Fenn", "Gus"])
    assert.equal(d.stagedActors.find((a) => a.name === name).position[1], 2.8);
  await page.evaluate(() => __show.load("20261009-0014", 410, false));
  await preview(410, 1000);
  const rope = (await data()).contactErrors.filter((c) => c.kind === "rope");
  assert.equal(rope.length, 2);
  assert(
    rope.every((c) => c.error < 0.12),
    "rope reach",
  );
  await page.screenshot({ path: "docs/show/screens/polish-rope.png" });
  await page.evaluate(() => __show.load("20261009-0025", 0, true));
  // Identical elapsed-time previews must reconstruct motion regardless of seek history.
  await page.emulateMedia({ reducedMotion: "reduce" });
  // Arena snapshots reduced-motion at initialization; reload to apply it.
  await page.reload();
  await page.waitForFunction(() => window.__show?.metrics.ready);
  for (const i of [226, 346, 350, 391, 410, 431, 436, 440, 514]) {
    await preview(i, 2000);
    const before = await page.locator("#viewport").screenshot();
    await preview(541, 0);
    await preview(i, 2000);
    assert(
      before.equals(await page.locator("#viewport").screenshot()),
      `reverse ${i}`,
    );
    await page.screenshot({ path: `docs/show/screens/polish-${i}.png` });
  }
  await page.keyboard.press("d");
  assert.equal(await page.evaluate(() => __show.hook), false);
  await preview(200, 20000);
  assert.equal(await page.locator(".speech-bubble").isVisible(), false);
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    "docs/show/cinematography-results.json",
    JSON.stringify(
      {
        errors,
        checks: [
          "hook pause/resume/clean controls and return to beginning",
          "listener after reading",
          "pause freezes body motion",
          "wrist reach for shove/lever/rim/rope",
          "staggered recorded climbs",
          "reverse pixels",
          "public privacy",
        ],
      },
      null,
      2,
    ) + "\n",
  );
  console.log("Cinematography browser checks passed");
} finally {
  await browser.close();
}
