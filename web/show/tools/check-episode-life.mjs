import {chromium} from "playwright";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
const out=process.env.LAST_THREE_OUTPUT;if(!out)throw new Error("Set LAST_THREE_OUTPUT for this movement proof");
const browser=await chromium.launch({headless:true,channel:"chrome",args:["--use-angle=swiftshader"]}),page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[];
page.on("pageerror",e=>errors.push(e.message));page.on("console",m=>{if(m.type()==="error")errors.push(m.text());});
try{
 await page.goto("http://127.0.0.1:8843/last-three/show/episode.html");await page.waitForFunction(()=>window.__episode?.ready);
 const edit=await page.evaluate(()=>__episode.edit),gazes=[],movement=[],feet=[];
 for(const id of ["bex-plea","bex-whisper","bex-reaction"]){
  const beat=edit.beats.find(b=>b.id===id);
  for(let local=.2;local<beat.end-beat.start;local+=.25){
   const shot=await page.evaluate(t=>__episode.seek(t),beat.start+local),bex=shot.motion.find(m=>m.name==="Bex");
   assert.ok(bex?.gaze&&bex.gaze.elevation>.4&&bex.gaze.alignment>.9,`${id}: Bex must look up toward the deck`);gazes.push({id,local,...bex.gaze});
  }
 }
 const longBeat=edit.beats.find(b=>b.id==="stakes"),longFirst={};
 await page.evaluate(t=>__episode.seek(t),longBeat.start+4.1);
 for(const name of ["Ash","Bex","Cole","Dara","Eli","Fenn","Gus","Hana"])longFirst[name]=await page.evaluate(n=>__episode.rigSnapshot(n),name);
 await page.evaluate(t=>__episode.seek(t),longBeat.start+5.1);
 let continued=0;
 for(const [name,before]of Object.entries(longFirst)){
  const after=await page.evaluate(n=>__episode.rigSnapshot(n),name);
  const delta=["spine_03","thigh_l","upperarm_r"].reduce((sum,bone)=>sum+after.bones[bone].quaternion.reduce((s,x,i)=>s+(x-before.bones[bone].quaternion[i])**2,0),0);
  if(delta>1e-5)continued++;
 }
 assert.ok(continued>=6,"Movement must continue after the legacy 2.8-second settle cap");
 for(const id of ["bex-base","climb-one","climb-two","climb-three"]){
  const beat=edit.beats.find(b=>b.id===id);await page.evaluate(t=>__episode.seek(t),beat.start+.5);
  const snapshot=await page.evaluate(()=>__episode.rigSnapshot("Bex"));
  const flood=await page.evaluate(()=>__episode.snapshot().state.pit.flood),expected=Math.max(-.8,-.55+Math.min(5,flood)*.44-1.5);
  assert.ok(Math.abs(snapshot.position[1]-expected)<1e-6,`${id}: preserve the original water-aware human-step support height`);
 }
 for(const id of ["stakes","ash-hold","eli-praise","ledge-rule","eli-refusal","cole-step"]){
  const beat=edit.beats.find(b=>b.id===id),a=await page.evaluate(t=>__episode.seek(t),beat.start+.2),first={};
  for(const m of a.motion)first[m.name]=await page.evaluate(name=>__episode.rigSnapshot(name),m.name);
  const b=await page.evaluate(t=>__episode.seek(t),Math.min(beat.end-.1,beat.start+.8));
  let changed=0;
  for(const m of b.motion){
   const after=await page.evaluate(name=>__episode.rigSnapshot(name),m.name),before=first[m.name];if(!before)continue;
   const delta=Object.entries(after.bones).reduce((sum,[bone,value])=>sum+value.quaternion.reduce((s,x,i)=>s+(x-before.bones[bone].quaternion[i])**2,0),0);
   if(delta>1e-5)changed++;
   for(const bone of Object.values(after.bones))assert.ok(Math.abs(Math.hypot(...bone.quaternion)-1)<1e-4,"Retargeted bone quaternion must remain normalized");
   if(m.clip!=="Swim_Idle_Loop"){
    const floor=Math.min(...["foot_l","foot_r","ball_l","ball_r"].map(name=>after.bones[name].position[1]-(name.startsWith("ball")?.018:.06)));
    assert.ok(Math.abs(floor-after.position[1])<.04,`${id}/${m.name}: planted foot floats or penetrates`);feet.push({id,name:m.name,error:Math.abs(floor-after.position[1])});
   }
  }
  assert.ok(changed>=2,`${id}: scene must contain independent character motion`);movement.push({id,changed});
 }
 assert.deepEqual(errors,[]);
 const report={gaze_samples:gazes,movement,continued_after_settle_cap:continued,foot_checks:feet,errors};await fs.writeFile(out+"/movement-proof.json",JSON.stringify(report,null,2));
 console.log(JSON.stringify({gaze_samples:gazes.length,movement,continued_after_settle_cap:continued,foot_checks:feet.length,errors}));
}finally{await browser.close();}
