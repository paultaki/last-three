import { chromium } from "playwright";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { DURATION, SHOTS } from "../src/pit-edit.js";
const output=fileURLToPath(new URL("../../../docs/show/recordings/pit-proof/",import.meta.url));
await fs.mkdir(output+"screens/",{recursive:true});
await fs.mkdir(output+"frames/",{recursive:true});
const browser=await chromium.launch({headless:true,channel:"chrome"});
const context=await browser.newContext({viewport:{width:1920,height:1080}});
const page=await context.newPage();
const errors=[];
page.on("pageerror",e=>errors.push(e.message));
page.on("console",m=>{if(m.type()==="error")errors.push(m.text());});
try {
  const cdp=await context.newCDPSession(page);
  const {windowId}=await cdp.send("Browser.getWindowForTarget");
  await cdp.send("Browser.setWindowBounds",{windowId,bounds:{width:1920,height:1166}});
  await page.goto("http://127.0.0.1:8843/last-three/show/pit-proof.html");
  await page.waitForFunction(()=>window.__pitProof?.ready);
  const proof=[];
  for(const shot of SHOTS){
    const t=(shot.start+shot.end)/2;
    const state=await page.evaluate(t=>__pitProof.seek(t),t);
    await page.screenshot({path:output+`screens/${String(shot.start).padStart(4,"0")}-${shot.kind}.png`});
    proof.push(state);
  }
  // Both cross-event and same-event checks exercise repeated transform rebuilding.
  for(const [first,other] of [[13.5,32],[4,11],[13.5,14.2],[29,30]]){
    await page.evaluate(t=>__pitProof.seek(t),first);
    const before=await page.screenshot();
    await page.evaluate(t=>__pitProof.seek(t),other);
    await page.evaluate(t=>__pitProof.seek(t),first);
    const after=await page.screenshot();
    if(!before.equals(after))throw new Error(`Reverse seek changed the film frame at ${first}`);
  }
  // Frame time is the edit time. Browser recording timestamps are not used.
  const fps=25,frameCount=Math.round(DURATION*fps);
  for(let frame=0;frame<frameCount;frame++){
    await page.evaluate(t=>__pitProof.seek(t),frame/fps);
    await page.screenshot({path:output+`frames/${String(frame).padStart(4,"0")}.jpg`,type:"jpeg",quality:95});
    if(frame%100===0)console.log(`Captured ${frame}/${frameCount} exact frames`);
  }
  errors.push(...await page.evaluate(()=>__pitProof.errors));
  await context.close();
  const frames=output+"frames/%04d.jpg";
  await fs.writeFile(output+"capture.json",JSON.stringify({frames,fps,frameCount,duration:DURATION,width:1920,height:1080,errors,reverseSeekEqual:true,sameEventSeekEqual:true,proof},null,2));
  console.log(JSON.stringify({frames,frameCount,errors,reverseSeekEqual:true,sameEventSeekEqual:true}));
  if(errors.length)process.exitCode=1;
} finally {await browser.close();}
