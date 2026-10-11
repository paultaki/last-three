import {chromium}from "playwright";
import fs from "node:fs/promises";
import {fileURLToPath}from "node:url";
import {createHash}from "node:crypto";
const out=fileURLToPath(new URL("../../../docs/show/recordings/episode-v1/",import.meta.url));
await fs.mkdir(out+"screens/",{recursive:true});
const reportName=process.argv.includes("--inspect")?"inspection.json":"capture.json";
await fs.rm(out+reportName,{force:true});
const browser=await chromium.launch({headless:true,channel:"chrome"});
const timingBytes=await fs.readFile(new URL("../assets/episode/timing.json",import.meta.url));
const timingHash=createHash("sha256").update(timingBytes).digest("hex");
const ctx=await browser.newContext({viewport:{width:1920,height:1080}}),page=await ctx.newPage(),errors=[];
page.on("pageerror",e=>errors.push(e.message));page.on("console",m=>{if(m.type()==="error")errors.push(m.text());});
try{
 const cdp=await ctx.newCDPSession(page),{windowId}=await cdp.send("Browser.getWindowForTarget");
 await cdp.send("Browser.setWindowBounds",{windowId,bounds:{width:1920,height:1166}});
 await page.goto("http://127.0.0.1:8843/last-three/show/episode.html");await page.waitForFunction(()=>window.__episode?.ready);
 const edit=await page.evaluate(()=>__episode.edit),proof=[],frameIssues=[];
 if(JSON.stringify(edit)!==JSON.stringify(JSON.parse(timingBytes)))throw new Error("Timing changed during capture startup");
 for(const b of edit.beats){
  const t=b.text?(b.voiceStart+b.voiceEnd)/2:(b.start+b.end)/2;
  const state=await page.evaluate(t=>__episode.seek(t),t);
  await page.screenshot({path:out+`screens/${b.id}.png`});proof.push(state);
 }
 const determinism=[];
 for(const id of ["eli-praise","bex-plea","bex-sink","hana-betrayal","hana-chalk","cole-death","eli-death"]){
  const b=edit.beats.find(b=>b.id===id),first=b.start+.4,other=b.end-.1;
  await page.evaluate(t=>__episode.seek(t),first);const before=await page.screenshot();
  await page.evaluate(t=>__episode.seek(t),other);await page.evaluate(t=>__episode.seek(t),first);const after=await page.screenshot();
  if(!before.equals(after))throw new Error(`Same-event seek mismatch: ${id}`);
  await page.evaluate(()=>__episode.seek(0));await page.evaluate(t=>__episode.seek(t),first);const back=await page.screenshot();
  if(!before.equals(back))throw new Error(`Cross-event seek mismatch: ${id}`);
  const sink=edit.beats.find(b=>b.id==="bex-sink");await page.evaluate(t=>__episode.seek(t),sink.start+1);
  await page.evaluate(t=>__episode.seek(t),first);const afterSink=await page.screenshot();
  if(!before.equals(afterSink))throw new Error(`Post-sink seek mismatch: ${id}`);
  determinism.push(id);
 }
 if(!process.argv.includes("--inspect")){
  await fs.mkdir(out+"frames/",{recursive:true});const count=Math.ceil(edit.duration*edit.fps);
  for(let i=0;i<count;i++){
   const state=await page.evaluate(t=>__episode.seek(t),i/edit.fps);
   if(state.blockedHeads.length)frameIssues.push({frame:i,...state});
   await page.screenshot({path:out+`frames/${String(i).padStart(5,"0")}.jpg`,type:"jpeg",quality:95});
   if(i%250===0)console.log(`Captured ${i}/${count} episode frames`);
  }
 }
 errors.push(...await page.evaluate(()=>__episode.errors));
 const report={timingHash,duration:edit.duration,fps:edit.fps,frameCount:Math.ceil(edit.duration*edit.fps),frames:out+"frames/%05d.jpg",errors,determinism,proof,frameIssues};
 await fs.writeFile(out+reportName,JSON.stringify(report,null,2));
 const blocked=proof.filter(p=>p.blockedHeads.length);
 console.log(JSON.stringify({duration:edit.duration,shots:proof.length,errors,blocked,frameIssues,determinism}));
 if(errors.length||blocked.length||frameIssues.length)process.exitCode=1;
}finally{await browser.close();}
