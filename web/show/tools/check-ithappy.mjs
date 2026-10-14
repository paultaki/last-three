// Loads the ithappy cast in a real browser and saves four check shots to docs/show/screens/
// (ignored): standing line-up, a speaking close-up, a private thought, and a fall.
//   npm run serve --prefix web/show   (in another terminal)
//   node web/show/tools/check-ithappy.mjs
import { chromium } from "playwright";
import fs from "node:fs";
const out = new URL("../../../docs/show/screens/", import.meta.url);
fs.mkdirSync(out, { recursive: true });
let browser;
try { browser = await chromium.launch({ channel: "chrome" }); } catch { browser = await chromium.launch(); }
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
for (const [name, i] of [["lineup", 3], ["speech", 226], ["thought", 225], ["fall", 306], ["lever", 346]]) {
  await page.goto(`http://127.0.0.1:8843/last-three/show/?cast=ithappy&tape=20261009-0025&i=${i}&clean=1`);
  await page.waitForFunction(() => window.__show?.metrics.ready, null, { timeout: 120000 });
  await page.keyboard.press("d");
  await page.evaluate(() => __show.preview(1800));
  await page.screenshot({ path: new URL(`ithappy-${name}.png`, out).pathname });
  console.log("saved", `docs/show/screens/ithappy-${name}.png`);
}
console.log(errors.length ? `Page errors: ${errors.join(" | ")}` : "No page errors.");
await browser.close();
