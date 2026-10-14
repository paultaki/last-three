import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {motionPlan,poolLookTarget} from "../../web/show/src/episode-life.js";
import {BEATS} from "../../web/show/src/episode-edit.js";
import {stateAt,presentation} from "../../web/show/src/model.js";
import {blockFilm} from "../../web/show/src/cinematography.js";
const tape=JSON.parse(fs.readFileSync(new URL("../../web/tapes/20261009-0025.json",import.meta.url)));
test("Imported movement never replaces recorded contact, dives, climbs or death poses",()=>{
 const protectedPoses=new Set(["shove","flinch","climb","hold","dodge","rescue","celebrate","shatter","chute","tumble","flatten","sink","brace"]);
 let protectedCount=0;
 for(const b of BEATS){const s=stateAt(tape,b.event),v=blockFilm(presentation(s,stateAt(tape,b.event-1),true),s,stateAt(tape,b.event-1));
  for(const [i,a]of v.actors.entries())if(!a.visible||protectedPoses.has(a.pose)){assert.equal(motionPlan(b,a,s,i,b.start||0),null);protectedCount++;}
 }
 assert.ok(protectedCount>30);
});
test("Idle clocks differ between characters, and safe-deck retreats are tightly scoped",()=>{
 const b={id:"ordinary",kind:"speaker",focus:"Ash",mode:"say",start:10},s={stage:"bridge"};
 const a={visible:true,name:"Ash",pose:"idle"},other={...a,name:"Bex"};
 assert.equal(motionPlan(b,a,s,0,11).clip,"Idle_Talking_Loop");
 const first=motionPlan(b,other,s,1,11),second=motionPlan(b,{...other,name:"Dara"},s,3,11);
 assert.notEqual(first.clock,second.clock);assert.notEqual(first.clock,motionPlan(b,other,s,1,12).clock);
 const pit={stage:"pit",pit:{out:["Eli"],base:"Bex"}},eli={...a,name:"Eli"};
 assert.equal(motionPlan({...b,id:"eli-refusal",focus:"Eli"},eli,pit,4,11).retreat,true);
 assert.equal(motionPlan({...b,id:"ordinary",focus:"Eli"},eli,pit,4,11).retreat,undefined);
 assert.equal(motionPlan({...b,id:"eli-refusal",focus:"Eli"},eli,{...pit,pit:{...pit.pit,out:[]}},4,11).retreat,undefined);
});
test("Bex looks up at actual deck occupants and swimming cannot override human-step climbs",()=>{
 for(const id of ["bex-plea","bex-whisper","bex-reaction"]){const b=BEATS.find(b=>b.id===id),s=stateAt(tape,b.event),v=blockFilm(presentation(s,stateAt(tape,b.event-1),true),s,stateAt(tape,b.event-1));
  const target=poolLookTarget(b,s,v.actors);assert.ok(target[1]>3);
  const plan=motionPlan(b,v.actors[1],s,1,20);assert.equal(plan.clip,"Swim_Idle_Loop");
  assert.equal(motionPlan({...b,kind:"climb"},v.actors[1],s,1,20),null);
  if(b.to){const receiver=v.actors.find(a=>a.name===b.to);assert.equal(target[0],receiver.position[0]);assert.equal(target[2],receiver.position[2]);}
 }
});
