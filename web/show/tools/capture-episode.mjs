import {chromium}from "playwright";
import fs from "node:fs/promises";
import {fileURLToPath}from "node:url";
import {createHash}from "node:crypto";
const out=process.env.LAST_THREE_OUTPUT?process.env.LAST_THREE_OUTPUT.replace(/\/$/,"")+"/":fileURLToPath(new URL("../../../docs/show/recordings/episode-v1/",import.meta.url));
await fs.mkdir(out+"screens/",{recursive:true});
const reportName=process.argv.includes("--inspect")?"inspection.json":"capture.json";
await fs.rm(out+reportName,{force:true});
const launch=()=>chromium.launch({headless:true,channel:"chrome",args:["--use-angle=swiftshader"]});
const browser=await launch();
const timingBytes=await fs.readFile(new URL("../assets/episode/timing.json",import.meta.url));
const timingHash=createHash("sha256").update(timingBytes).digest("hex");
const visualInputs={};
for(const path of ["web/show/dist/episode.js","web/show/episode.html","web/show/assets/episode/motion.json"]){
 const file=new URL("../../../"+path,import.meta.url);visualInputs[path]=createHash("sha256").update(await fs.readFile(file)).digest("hex");
}
const ctx=await browser.newContext({viewport:{width:1920,height:1080}}),page=await ctx.newPage(),errors=[];
page.on("pageerror",e=>{errors.push(e.message);console.error(e.message);});page.on("console",m=>{if(m.type()==="error")errors.push(m.text());});
try{
 console.log("Capture browser ready; loading episode");await page.goto("http://127.0.0.1:8843/last-three/show/episode.html",{waitUntil:"domcontentloaded",timeout:60000});console.log("Document loaded; waiting for cast");await page.waitForFunction(()=>window.__episode?.ready,{},{timeout:120000});console.log("Episode ready");
 const edit=await page.evaluate(()=>__episode.edit),proof=[],frameIssues=[],captureRetries=[];
 if(JSON.stringify(edit)!==JSON.stringify(JSON.parse(timingBytes)))throw new Error("Timing changed during capture startup");
 for(const b of edit.beats){
  const t=b.text?(b.voiceStart+b.voiceEnd)/2:(b.start+b.end)/2;
  const state=await page.evaluate(t=>__episode.seek(t),t);
  await page.screenshot({path:out+`screens/${b.id}.png`});proof.push(state);
 }
 const determinism=[];
 const seekProof=t=>page.evaluate(t=>{
  __episode.seek(t);const overlay=document.querySelector("main").cloneNode(true);
  // Legacy replay labels are always display:none in the film and project before its final camera FOV.
  overlay.querySelector("#labels").remove();
  return JSON.stringify({pixels:document.querySelector("canvas").toDataURL(),overlay:overlay.innerHTML});
 },t);
 for(const id of ["eli-praise","bex-plea","bex-sink","hana-betrayal","hana-chalk","cole-death","eli-death"]){
  const b=edit.beats.find(b=>b.id===id),first=b.start+.4,other=b.end-.1;
  const before=await seekProof(first);
  const different=await seekProof(other);
  if(JSON.parse(before).pixels===JSON.parse(different).pixels)throw new Error(`Canvas did not reflect motion: ${id}`);
  const after=await seekProof(first);
  if(before!==after)throw new Error(`Same-event seek mismatch: ${id}`);
  await page.evaluate(()=>__episode.seek(0));const back=await seekProof(first);
  if(before!==back)throw new Error(`Cross-event seek mismatch: ${id}`);
  const sink=edit.beats.find(b=>b.id==="bex-sink");await page.evaluate(t=>__episode.seek(t),sink.start+1);
  const afterSink=await seekProof(first);
  if(before!==afterSink)throw new Error(`Post-sink seek mismatch: ${id}`);
  determinism.push(id);
 }
 const frameRanges=[];
 if(!process.argv.includes("--inspect")){
  await fs.mkdir(out+"frames/",{recursive:true});const count=Math.ceil(edit.duration*edit.fps);
  const workers=Number(process.env.LAST_THREE_CAPTURE_WORKERS||4);
  if(!Number.isInteger(workers)||workers<1||workers>4)throw new Error("Capture workers must be 1 through 4");
  const ranges=Array.from({length:workers},(_,worker)=>({worker,start:Math.floor(count*worker/workers),end:Math.floor(count*(worker+1)/workers)}));
  const results=await Promise.allSettled(ranges.map(async range=>{
   const owned=range.worker!==0,workerBrowser=owned?await launch():browser;
   try{
    const target=owned?await workerBrowser.newPage({viewport:{width:1920,height:1080}}):page;
    if(owned){
     target.on("pageerror",e=>errors.push(e.message));target.on("console",m=>{if(m.type()==="error")errors.push(m.text());});
     await target.goto("http://127.0.0.1:8843/last-three/show/episode.html",{waitUntil:"domcontentloaded",timeout:60000});
     await target.waitForFunction(()=>window.__episode?.ready,{},{timeout:120000});
     if(JSON.stringify(await target.evaluate(()=>__episode.edit))!==JSON.stringify(edit))throw new Error("Worker timing mismatch");
    }
    let captured=0;
    for(let i=range.start;i<range.end;i++){
     const state=await target.evaluate(t=>__episode.seek(t),i/edit.fps);
     if(state.blockedHeads.length)frameIssues.push({frame:i,...state});
     const options={path:out+`frames/${String(i).padStart(5,"0")}.jpg`,type:"jpeg",quality:95,timeout:10000};
     try{await target.screenshot(options);}catch(error){
      if(error.name!=="TimeoutError")throw error;
      captureRetries.push(i);await target.evaluate(t=>__episode.seek(t),i/edit.fps);await target.screenshot(options);
     }
     captured++;if(captured%250===0)console.log(`Worker ${range.worker}: ${captured}/${range.end-range.start} frames`);
    }
    errors.push(...await target.evaluate(()=>__episode.errors));
    frameRanges.push({...range,captured});
   }finally{if(owned)await workerBrowser.close();}
  }));
  const failures=results.filter(r=>r.status==="rejected");if(failures.length)throw new AggregateError(failures.map(r=>r.reason),"Frame capture failed");
  if(frameRanges.reduce((n,r)=>n+r.captured,0)!==count)throw new Error("Incomplete frame capture");
  frameRanges.sort((a,b)=>a.start-b.start);frameIssues.sort((a,b)=>a.frame-b.frame);captureRetries.sort((a,b)=>a-b);
 }
 errors.push(...await page.evaluate(()=>__episode.errors));
 for(const [path,hash]of Object.entries(visualInputs))if(createHash("sha256").update(await fs.readFile(new URL("../../../"+path,import.meta.url))).digest("hex")!==hash)throw new Error("Visual input changed during capture: "+path);
 const report={renderer:"ANGLE SwiftShader",timingHash,visualInputs,captureRetries,frameRanges,determinismType:"exact-canvas-pixels-and-overlay-DOM",duration:edit.duration,fps:edit.fps,frameCount:Math.ceil(edit.duration*edit.fps),frames:out+"frames/%05d.jpg",errors,determinism,proof,frameIssues};
 await fs.writeFile(out+reportName,JSON.stringify(report,null,2));
 const blocked=proof.filter(p=>p.blockedHeads.length);
 console.log(JSON.stringify({duration:edit.duration,shots:proof.length,errors,blocked,frameIssues,determinism}));
 if(errors.length||blocked.length||frameIssues.length)process.exitCode=1;
}catch(error){console.error(error);throw error;}finally{await browser.close();}
