import * as T from "three";
import { Arena } from "./scene.js";
import { stateAt } from "./model.js";
import { direction } from "./direction.js";
import { performanceKind } from "./performance.js";
import { DURATION, TAPE, SHOTS, CAPTIONS, shotAt } from "./pit-edit.js";

// Isolated capture surface, not a new game or a replacement replay viewer.
const $ = id => document.getElementById(id);
const arena = new Arena($("canvas"), $("labels"));
arena.film = true;
arena.setQuality("high");
arena.renderer.setPixelRatio(1);
arena.resize();
arena.scene.environmentIntensity = .24;
arena.key.intensity = 2.5;
arena.key.color.set(0xffe8cd);
arena.key.position.set(-4, 12, 6);
arena.renderer.toneMappingExposure = .95;
arena.scene.fog.density = .009;
const rim = new T.DirectionalLight(0x69dfe6, 2);
rim.position.set(3, 7, -7);
arena.scene.add(rim);
const bexFill = new T.PointLight(0xa8e4e9, 7, 8, 2);
bexFill.position.set(0, 3, .5);
arena.scene.add(bexFill);

const tapeResponse = await fetch(`../tapes/${TAPE}.json`);
if (!tapeResponse.ok) throw new Error("Proof tape could not be loaded");
const tape = await tapeResponse.json();
await arena.loadCast(true);
const states = new Map(SHOTS.map(s => [s.event, stateAt(tape, s.event)]));
const previous = new Map(SHOTS.map(s => [s.event, stateAt(tape, s.event - 1)]));

// A coiled, unused rope. This never enables the reducer's deployed rescue rope.
const rope = new T.Group();
rope.position.set(1.45, 2.99, -3.22);
arena.scene.add(rope);
const ropeMaterial = new T.MeshStandardMaterial({ color: 0xe8ba72, roughness: .9 });
for (let j = 0; j < 5; j++) {
  const ring = new T.Mesh(new T.TorusGeometry(.25 + j * .055, .028, 6, 48), ropeMaterial);
  ring.rotation.x = Math.PI / 2;
  ring.scale.y = .75;
  ring.position.y = j * .012;
  ring.castShadow = true;
  rope.add(ring);
}
const tail = new T.Mesh(new T.CylinderGeometry(.029,.029,.7,8), ropeMaterial);
tail.rotation.z = Math.PI/2;
tail.position.set(.6,.025,.1);
tail.castShadow = true;
rope.add(tail);

// Character-local water response, rather than concentric rings across the whole set.
const wakes = Array.from({ length: 4 }, () => {
  const m = new T.MeshBasicMaterial({color:0x83d6da,transparent:true,opacity:.1,side:T.DoubleSide,depthWrite:false});
  const ring = new T.Mesh(new T.RingGeometry(.48,.495,64),m);
  ring.rotation.x = -Math.PI/2;
  arena.scene.add(ring);
  return ring;
});
const bubbles = Array.from({length:12},(_,i)=>{
  const bubble=new T.Mesh(new T.SphereGeometry(.018+(i%3)*.009,8,6),new T.MeshBasicMaterial({color:0x9bcbd0,transparent:true,opacity:.45}));
  arena.scene.add(bubble);return bubble;
});
const X = new T.Vector3(1,0,0), Y = new T.Vector3(0,1,0), Z = new T.Vector3(0,0,1);
let time = 0, activeEvent = -1, playing = false, started = 0, frameHandle = 0;
const errors = [];
window.addEventListener("error", e => errors.push(e.message));
const clamp = x => Math.max(0,Math.min(1,x));
const actor = name => arena.cast[tape.players.findIndex(p => p.name === name)];
function aim(name, height = 1.4) {
  return actor(name).group.position.clone().add(new T.Vector3(0,height,0));
}
function draw(seconds) {
  time = Math.max(0,Math.min(DURATION,Number(seconds)||0));
  const shot = shotAt(time), local = time - shot.start;
  const state = states.get(shot.event), prev = previous.get(shot.event);
  if (activeEvent !== shot.event) {
    arena.setState(state, prev, true);
    arena.direction = direction(state, prev, true);
    arena.performanceKind = performanceKind(state, true);
    activeEvent = shot.event;
  }
  const animation = (shot.offset ?? 2.8) + local * (shot.rate ?? .3);
  arena.render(animation, animation * 1000);
  arena.set.refs.ripples?.forEach(r => r.visible = false);
  if (!arena.proofWater) {
    arena.proofWater = arena.set.refs.water.material.clone();
    arena.set.refs.water.material = arena.proofWater;
    arena.proofWater.transmission = .12;
    arena.proofWater.color.set(0x207b85);
    arena.proofWater.roughness = .24;
  }
  const bex = actor("Bex");
  arena.effects.visible=false;
  const surface = -.55 + Math.min(5,state.pit.flood)*.44;
  for (const [i,c] of arena.cast.entries()) {
    c.ring.visible = false;
    if (!c.group.visible) continue;
    const name = tape.players[i].name;
    const inWater = !state.pit.out.includes(name);
    if (name === "Bex" && shot.kind === "sink") {
      const u=clamp(local/(shot.end-shot.start));
      c.group.position.y=surface-1.5-1.8*u*u;
      c.group.rotation.y=.1;
      arena.rotate(c,"upperarm_r",X,-2.7*(1-clamp((local-2)/1.2)));
      arena.rotate(c,"lowerarm_r",X,-.3);
      arena.rotate(c,"head",X,-.08);
    } else if (inWater && name === "Bex") {
      const pulse = Math.sin(local*3.2);
      c.group.position.y += .045*pulse;
      c.group.rotation.y = .1;
      arena.rotate(c,"upperarm_l",X,-.25 + .05*pulse);
      arena.rotate(c,"upperarm_r",X,-.25 - .05*pulse);
      arena.rotate(c,"lowerarm_l",X,-.55);
      arena.rotate(c,"lowerarm_r",X,-.55);
      arena.rotate(c,"head",X,-.10);
      if (shot.performance === "plea") {
        arena.rotate(c,"upperarm_r",X,-.45*Math.sin(clamp(local/1.2)*Math.PI/2));
        arena.rotate(c,"head",Y,-.07);
      }
      if (shot.performance === "reaction") {
        arena.rotate(c,"head",X,.16*clamp(local/1.5));
        arena.rotate(c,"spine_01",X,.07*clamp(local/1.5));
      }
    } else if (state.pit.out.includes(name) && !["climb","climb-side"].includes(shot.kind)) {
      // Face the trapped contestant. Departures are recorded at events 446..452.
      c.group.rotation.y = Math.atan2(-c.group.position.x,-2.35-c.group.position.z);
      arena.rotate(c,"head",X,.16);
      if (shot.performance === "leave") {
        c.group.rotation.y += Math.PI*clamp(local/1.2);
        c.group.position.z -= .45*clamp(local/1.9);
        arena.rotate(c,"thigh_l",X,.10*Math.sin(local*5));
        arena.rotate(c,"thigh_r",X,-.10*Math.sin(local*5));
      }
      if ((shot.kind === "eli" && name === "Eli") || (shot.kind === "gus" && name === "Gus")) {
        c.group.rotation.y = .15;
        arena.rotate(c,"head",Y,-.12);
        arena.rotate(c,"upperarm_r",Z,-.12*Math.sin(clamp(local/.8)*Math.PI));
      }
    }
  }
  bubbles.forEach((bubble,i)=>{
    const u=local*.4+i*.17;
    bubble.visible=shot.kind==="sink"&&local>.8;
    bubble.position.set(Math.sin(i*2.4)*.23,surface-.3+(u%1)*.35,-2.35+Math.cos(i*2.4)*.23);
  });
  wakes.forEach((ring,i) => {
    const phase = ((local*.32+i*.25)%1+1)%1;
    ring.visible = shot.kind !== "empty" && shot.kind !== "end";
    ring.position.set(bex.group.position.x,surface+.015+i*.001,bex.group.position.z);
    ring.scale.setScalar(.8+phase*2.3);
    ring.material.opacity = (1-phase)*.17;
  });
  let eye, target, fov = 37;
  const drift = clamp(local/(shot.end-shot.start));
  const b = aim("Bex",1.65);
  if (shot.kind === "climb") { eye=[5.7,4.7,4.8]; target=[0,1.65,-2.8]; fov=42; }
  else if (shot.kind === "climb-side") { eye=[-5.6,3.8,2.9]; target=[0,1.45,-2.8]; fov=42; }
  else if (shot.kind === "wide") { eye=[8.5-drift*.3,7.6,10.6]; target=[0,2,-2.9]; fov=42; }
  else if (shot.kind === "rope") { eye=[2.65,4.2,-1.5]; target=[1.42,3.02,-3.23]; fov=29; }
  else if (shot.kind === "up") { eye=[0,1.65,-1.8]; target=[-.4,4.2,-4.3]; fov=61; }
  else if (shot.kind === "eli" || shot.kind === "gus") {
    const p = aim(shot.kind === "eli" ? "Eli" : "Gus",1.5);
    target=p.toArray(); eye=[p.x+.5,p.y+.15,p.z+3.2-drift*.18]; fov=34;
  } else if (shot.kind === "empty" || shot.kind === "end") {
    eye=[.8,2.35,1.4];target=[0,1.64,-2.35];fov=42;
  } else { target=b.toArray(); eye=[b.x+.5,b.y+.06,b.z+2.65-drift*.16]; fov=37; }
  if (shot.kind === "sink") {
    // Keep the frame at the waterline so the recorded sink exits the picture.
    target=[0,1.75,-2.35]; eye=[.55,1.94,.6]; fov=42;
  }
  arena.camera.fov=fov;
  arena.camera.position.fromArray(eye);
  arena.camera.lookAt(...target);
  arena.camera.updateProjectionMatrix();
  arena.scene.updateMatrixWorld(true);
  arena.composer.render();
  const cap=CAPTIONS.find(c=>time>=c.start&&time<c.end);
  $("speaker").textContent=cap?.name||"";
  $("caption-text").textContent=cap?.text||"";
  $("fact").textContent=shot.kind === "rope" ? (time<12 ? "ONE ROPE\nRESCUE COSTS 2 FOOTING" : "STILL UNUSED") : shot.kind==="wide"&&time<12 ? "6 OUT\n1 LEFT" : "";
  $("fact").style.fontSize=shot.kind === "rope"?"2.1vw":"3vw";
  $("chapter").textContent=time<3.3?"THE ESCAPE / CONDENSED":"03 / THE PIT";
  $("end").style.opacity=shot.kind==="end"?clamp(local/.35):0;
  return {time,event:shot.event,shot:shot.kind,water:state.pit.flood,ropeUsed:state.pit.ropeUsed};
}
function loop(now) {
  if (!playing) return;
  draw((now-started)/1000);
  if (time >= DURATION) { playing=false; return; }
  frameHandle=requestAnimationFrame(loop);
}
window.__pitProof={
  ready:true,errors,duration:DURATION,shots:SHOTS,
  seek(t){playing=false;cancelAnimationFrame(frameHandle);return draw(t);},
  play(){cancelAnimationFrame(frameHandle);playing=true;started=performance.now();frameHandle=requestAnimationFrame(loop);},
  get playing(){return playing;},get time(){return time;},
  snapshot(){return {time,event:activeEvent,actors:arena.cast.map((c,i)=>({name:tape.players[i].name,visible:c.group.visible,position:c.group.position.toArray()})),camera:arena.camera.position.toArray(),state:states.get(activeEvent)};}
};
$("loading").remove();
draw(0);
