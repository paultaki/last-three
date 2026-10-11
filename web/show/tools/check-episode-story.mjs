// Render-level checks against the real episode, not a duplicated scene fixture.
import {chromium} from "playwright";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
const out=process.env.LAST_THREE_OUTPUT;if(!out)throw new Error("Set LAST_THREE_OUTPUT");
const browser=await chromium.launch({channel:"chrome",headless:true,args:["--use-angle=swiftshader"]});
const page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[];
page.on("pageerror",e=>errors.push(e.message));
try{
 await page.goto("http://127.0.0.1:8843/last-three/show/episode.html");await page.waitForFunction(()=>window.__episode?.ready,{},{timeout:120000});
 const seek=async(id,offset)=>page.evaluate(({id,offset})=>{const b=__episode.edit.beats.find(b=>b.id===id);__episode.seek(b.start+offset);return __episode.snapshot();},{id,offset});
 const before=await seek("disc-open",.1);assert.equal(before.tiles.filter(t=>t.visible&&t.angle===0).length,6);
 for(const c of before.cast.filter(c=>c.visible)){const tile=before.tiles[c.name==="Ash"?0:c.name==="Dara"?1:c.name==="Eli"?2:c.name==="Fenn"?3:c.name==="Gus"?4:5];assert.ok(Math.hypot(c.position[0]-tile.position[0],c.position[2]-tile.position[2])<.55,c.name);}
 const released=await seek("disc-open",.6);assert.equal(released.tiles.filter(t=>t.angle>.8).length,3);
 for(const name of ["Ash","Eli"])assert.ok(released.cast.find(c=>c.name===name).position[1]<-.5);
 const saved=await seek("fenn-feather",.8);assert.ok(saved.cast.find(c=>c.name==="Fenn").position[1]>.2);
 assert.ok(saved.cast.filter(c=>["Ash","Eli"].includes(c.name)).every(c=>!c.visible));
 const glass=[];for(const [id,t]of [["cole-death",.1],["cole-death",.4],["cole-contradiction",.4]])glass.push((await seek(id,t)).panes[12]);assert.deepEqual(glass,[true,false,false]);
 await seek("ledge-rule",1);assert.equal(await page.locator("#balance").isVisible(),false);assert.equal(await page.locator("#mechanic").isVisible(),true);await page.screenshot({path:out+"/screens/verified-ledge-rule.png"});
 const chalk=await seek("gus-chalk",1);assert.deepEqual(chalk.cast.filter(c=>c.visible).map(c=>c.name),["Gus"]);await page.screenshot({path:out+"/screens/verified-gus-chalk.png"});
 const channels=[];for(const id of ["eli-praise","eli-thought","dara-alliance","forged-whisper"]){await page.evaluate(id=>{const b=__episode.edit.beats.find(b=>b.id===id);__episode.seek((b.voiceStart+b.voiceEnd)/2);},id);channels.push(await page.evaluate(()=>({mode:document.getElementById("bubble").dataset.mode,label:document.getElementById("bubble-channel").textContent,logo:document.getElementById("bubble-logo").complete&&document.getElementById("bubble-logo").naturalWidth>0})));}
 assert.deepEqual(channels.map(c=>c.mode),["say","thought","whisper","forged"]);assert.ok(channels.every(c=>c.logo));assert.equal(errors.length,0);
 const report={errors,six_supported_platforms:true,three_hinged_doors:true,simultaneous_falls:true,one_feather_save:true,persistent_glass_hole:glass,channels};await fs.writeFile(out+"/story-proof.json",JSON.stringify(report,null,2)+"\n");console.log(JSON.stringify(report));
}finally{await browser.close();}
