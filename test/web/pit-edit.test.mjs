import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {DURATION,SHOTS,VOICES,CAPTIONS,shotAt} from "../../web/show/src/pit-edit.js";
const tape=JSON.parse(fs.readFileSync(new URL("../../web/tapes/20261009-0025.json",import.meta.url)));
test("Pit film has a contiguous bounded edit using chronological recorded events",()=>{
  assert.ok(DURATION>=30&&DURATION<=45);
  assert.equal(SHOTS[0].start,0);
  assert.equal(SHOTS.at(-1).end,DURATION);
  SHOTS.forEach((s,i)=>{
    assert.ok(s.end>s.start);
    assert.equal(tape.events[s.event].stage,"pit");
    if(i){assert.equal(s.start,SHOTS[i-1].end);assert.ok(s.event>=SHOTS[i-1].event);}
    assert.equal(shotAt(s.start),s);
  });
});
test("Adapted voices refer to public speech by the same recorded speaker",()=>{
  for(const v of VOICES){
    assert.ok(v.start>=0&&v.start+v.duration<=DURATION);
    for(const index of v.sources)assert.ok(tape.events[index]);
    if(v.mode==="adaptation"){
      const e=tape.events[v.sources[0]];
      assert.equal(e.type,"say");assert.equal(e.name.toLowerCase(),v.id);
      const shots=SHOTS.filter(s=>s.event===v.sources[0]);
      assert.ok(shots.some(s=>v.start>=s.start&&v.start+v.duration<=s.end));
    }
  }
  assert.equal(tape.events[453].data.ropeUsed,false);
  assert.equal(tape.events[454].name,"Bex");
  assert.equal(tape.events[454].style,"sink");
});
test("Subtitle and voice windows remain inside the edit and do not overlap",()=>{
  for(const list of [CAPTIONS,VOICES])list.forEach((c,i)=>{
    const end=c.end??c.start+c.duration;
    assert.ok(end>c.start&&end<=DURATION);
    if(i)assert.ok(c.start>=(list[i-1].end??list[i-1].start+list[i-1].duration));
  });
});
