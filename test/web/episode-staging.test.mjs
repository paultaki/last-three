import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {fallPose,shutterAngle,brokenPanes} from "../../web/show/src/episode-staging.js";
import {BEATS} from "../../web/show/src/episode-edit.js";
const tape=JSON.parse(fs.readFileSync(new URL("../../web/tapes/20261009-0025.json",import.meta.url)));
test("Falls wait for floor release and accelerate, rather than easing a standing avatar down",()=>{
 for(const style of ["chute","shatter"]){
  const start=[1.45,0,-6.45];assert.deepEqual(fallPose(style,.2,start).point,start);
  const a=fallPose(style,.5,start),b=fallPose(style,.8,start),c=fallPose(style,1.1,start);
  assert.ok(a.point[1]>b.point[1]&&b.point[1]>c.point[1]);assert.ok(b.point[1]-c.point[1]>a.point[1]-b.point[1]);
  assert.equal(c.point[0],start[0]);assert.equal(c.point[2],start[2]);assert.ok(c.lean<.4);
 }
 const edge=fallPose("tumble",.48,[2.9,0,0]);assert.equal(edge.point[1],0);assert.ok(edge.point[0]>4.5);
 assert.ok(fallPose("tumble",.8,[2.9,0,0]).point[1]<0);
});
test("Shutters hinge before full fall and broken glass persists in later recorded events",()=>{
 assert.equal(shutterAngle(.1),0);assert.ok(shutterAngle(.24)>0);assert.equal(shutterAngle(3),shutterAngle(20));
 assert.deepEqual(brokenPanes(tape,300),[]);const gone=brokenPanes(tape,306);assert.deepEqual(gone,[{row:7,side:"L",event:306,name:"Cole"}]);assert.deepEqual(brokenPanes(tape,327),gone);
});
test("Chalk deception has setup, actual written claim, private motive, then explanation",()=>{
 const ids=BEATS.map(b=>b.id);assert.ok(ids.indexOf("chalk-setup")<ids.indexOf("bridge-rule"));
 assert.ok(ids.indexOf("chalk-intro")<ids.indexOf("gus-chalk"));assert.ok(ids.indexOf("gus-chalk")<ids.indexOf("gus-chalk-thought"));
 const claim=BEATS.find(b=>b.id==="gus-chalk");assert.equal(claim.sources[0],538);assert.match(tape.events[538].text,/crusher lever kills you/);
 assert.match(BEATS.find(b=>b.id==="ledge-rule").text,/Every two rounds/);
});
test("The bridge's waiting-room scene has no panes and remains renderable",async()=>{
 const {EpisodeStaging}=await import("../../web/show/src/episode-staging.js");
 const arena={set:{key:"waiting",refs:{}},view:{actors:[]}};const staging=new EpisodeStaging(arena,tape,{beats:[]});
 assert.doesNotThrow(()=>staging.update({event:2},{stage:"bridge"},0,0));
});
