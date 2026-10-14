import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {BEATS,CAST,resolveEdit,beatAt,textPages} from "../../web/show/src/episode-edit.js";
const tape=JSON.parse(fs.readFileSync(new URL("../../web/tapes/20261009-0025.json",import.meta.url)));
test("Episode preserves speech, private thoughts and forged whisper attribution",()=>{
 for(const b of BEATS){
  assert.ok(tape.events[b.event]);
  if(b.text){
   assert.ok(b.sources.length);
   b.sources.forEach(i=>assert.ok(tape.events[i]));
   if(b.mode!=="narrator"){
    const e=tape.events[b.sources[0]];
    assert.equal(e.type,b.mode);
    assert.equal(e.name||e.forgedAs||e.from,b.focus);
    if(b.mode==="whisper"){assert.equal(e.to,b.to);assert.equal(e.forgedAs?e.from:undefined,b.forgedBy);}
   }
  }
 }
 for(const [name,p] of Object.entries(CAST))assert.ok(tape.players.find(x=>x.name===name).model.toLowerCase().includes(p.model.toLowerCase()));
});
test("All recorded eliminations and the final duel are represented",()=>{
 const deaths=tape.events.filter(e=>e.type==="death");
 assert.equal(deaths.length,7);
 for(const e of deaths)assert.ok(BEATS.some(b=>b.event===e.i&&b.kind==="death"&&b.focus===e.name));
 const ids=BEATS.map(b=>b.id);
 assert.ok(ids.indexOf("forge-fails")<ids.indexOf("cole-right"));
 assert.ok(ids.indexOf("gus-brace")<ids.indexOf("gus-final-dodge"));
 assert.ok(ids.indexOf("gus-final-dodge")<ids.indexOf("hana-rejected"));
 assert.ok(ids.indexOf("hana-rejected")<ids.indexOf("shrink"));
 assert.match(BEATS.find(b=>b.id==="cole-contradiction").text,/doesn't tell us why/);
});
test("Timeline includes complete bounded voice windows and explicit editorial inserts",()=>{
 const durations=Object.fromEntries(BEATS.filter(b=>b.text).map(b=>[b.id,b.text.split(/\s+/).length/2.8]));
 const edit=resolveEdit(durations);
 assert.equal(edit.beats[0].start,0);assert.equal(edit.beats.at(-1).end,edit.duration);
 for(const [i,b]of edit.beats.entries()){
  assert.ok(b.end>b.start);assert.equal(beatAt(edit,b.start),b);
  assert.ok(b.voiceRate>=1&&b.voiceRate<=1.3);
  if(b.text){assert.ok(b.voiceStart>=b.start);assert.ok(b.voiceEnd<=b.end);}
  if(b.reuse)assert.equal(b.voiceRate,1);
  if(i){const prev=edit.beats[i-1];assert.equal(b.start,prev.end);if(b.event<prev.event)assert.ok(b.insert||b.epilogue||prev.later);}
 }
 assert.throws(()=>resolveEdit({}),/Missing voice duration/);
 assert.throws(()=>resolveEdit({...durations,hook:Infinity}),/Missing voice duration/);
 const measured=resolveEdit(durations,{hook:durations.hook+.017});
 assert.equal(measured.beats[0].voiceDuration,durations.hook+.017);
 assert.ok(measured.beats[0].voiceEnd<=measured.beats[0].end);
 assert.throws(()=>resolveEdit(durations,{hook:NaN}),/Invalid processed voice duration/);
 assert.equal(beatAt(edit,edit.duration),edit.beats.at(-1));
});
test("Bubble pages stay short without losing or orphaning the final word",()=>{
 for(const b of BEATS.filter(b=>b.text)){
  const pages=textPages(b.text);
  assert.equal(pages.join(" "),b.text);
  pages.forEach(p=>assert.ok(p.split(" ").length<=8));
  if(pages.length>1)assert.ok(pages.at(-1).split(" ").length>=3);
 }
});
