// Local silent 1080p capture for narration. Licensed cast output remains ignored.
import { chromium } from "playwright";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
const output = fileURLToPath(
  new URL("../../../docs/show/recordings/", import.meta.url),
);
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  recordVideo: { dir: output, size: { width: 1920, height: 1080 } },
});
const started = performance.now();
const page = await context.newPage();
// The capture surface must fit the emulated viewport plus Chrome's window frame.
// Without this, local macOS Chrome clips 86 pixels and pads the video grey.
const cdp = await context.newCDPSession(page);
const { windowId } = await cdp.send("Browser.getWindowForTarget");
await cdp.send("Browser.setWindowBounds", {
  windowId,
  bounds: { width: 1920, height: 1166 },
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  await page.goto(
    "http://127.0.0.1:8843/last-three/show/?cast=city&tape=20261009-0025&edit=story&clean=1",
  );
  await page.waitForFunction(() => window.__show?.metrics.ready);
  const leadSeconds = (performance.now() - started) / 1000;
  await page.evaluate(() => {
    const started = performance.now();
    window.__captureBeats = [{ i: __show.index, seconds: 0 }];
    window.__captureTimer = setInterval(() => {
      if (window.__captureBeats.at(-1).i !== __show.index)
        window.__captureBeats.push({
          i: __show.index,
          seconds: (performance.now() - started) / 1000,
        });
    }, 50);
  });
  await page.keyboard.press("Space");
  await page.waitForFunction(() => __show.playing);
  await page.waitForFunction(
    () => !__show.playing && __show.index === __show.playlist.at(-1),
    {},
    { timeout: 600000 },
  );
  await page.waitForTimeout(1500);
  const metrics = await page.evaluate(() => __show.metrics);
  const beats = await page.evaluate(() => {
    clearInterval(window.__captureTimer);
    return window.__captureBeats;
  });
  const video = page.video();
  await context.close();
  const source = await video.path();
  fs.writeFileSync(
    output + "film-capture.json",
    JSON.stringify(
      {
        source,
        leadSeconds,
        width: 1920,
        height: 1080,
        errors,
        metrics,
        beats,
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ source, leadSeconds, errors }));
  if (errors.length) process.exitCode = 1;
} finally {
  await browser.close();
}
