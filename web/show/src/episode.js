import * as T from "three";
import {Arena} from "./scene.js";
import {stateAt,TITLES} from "./model.js";
import {direction} from "./direction.js";
import {performanceKind} from "./performance.js";
import {CAST,beatAt,textPages} from "./episode-edit.js";
import {EpisodeLife} from "./episode-life.js";
import {EpisodeDetail} from "./episode-detail.js";
const $=id=>document.getElementById(id),clamp=x=>Math.max(0,Math.min(1,x));
const arena=new Arena($("canvas"),$("labels"));
arena.film=true;arena.setQuality("high");arena.renderer.setPixelRatio(1);arena.resize();
arena.scene.environmentIntensity=.28;arena.key.intensity=2.5;arena.key.position.set(-4,12,6);
arena.renderer.toneMappingExposure=.98;arena.scene.fog.density=.012;
const rim=new T.DirectionalLight(0x69dfe6,1.7);rim.position.set(3,7,-7);arena.scene.add(rim);
const fetchJSON=async url=>{const r=await fetch(url);if(!r.ok)throw new Error(`Failed to load ${url}`);return r.json();};
const edit=await fetchJSON("assets/episode/timing.json");
const tape=await fetchJSON(`../tapes/${edit.tape}.json`);
await arena.loadCast(true);
const life=new EpisodeLife(arena,tape,await fetchJSON("assets/episode/motion.json"));
const detail=new EpisodeDetail(arena);
const states=new Map(edit.beats.map(b=>[b.event,stateAt(tape,b.event)]));
const prevs=new Map(edit.beats.map(b=>[b.event,stateAt(tape,b.event-1)]));
const X=new T.Vector3(1,0,0),Y=new T.Vector3(0,1,0);
const rope=new T.Group();rope.position.set(1.45,2.99,-3.22);arena.scene.add(rope);
const rm=new T.MeshStandardMaterial({color:0xd9af6a,roughness:.9});
for(let i=0;i<5;i++){const ring=new T.Mesh(new T.TorusGeometry(.25+i*.055,.028,6,48),rm);ring.rotation.x=Math.PI/2;ring.scale.y=.75;ring.position.y=i*.012;ring.castShadow=true;rope.add(ring);}
const tail=new T.Mesh(new T.CylinderGeometry(.028,.028,.7,8),rm);tail.rotation.z=Math.PI/2;tail.position.set(.6,.02,.1);rope.add(tail);
const wakes=Array.from({length:4},()=>{const m=new T.MeshBasicMaterial({color:0x83d6da,transparent:true,opacity:.1,side:T.DoubleSide,depthWrite:false});const r=new T.Mesh(new T.RingGeometry(.48,.495,64),m);r.rotation.x=-Math.PI/2;arena.scene.add(r);return r;});
const bubbles=Array.from({length:12},(_,i)=>{const b=new T.Mesh(new T.SphereGeometry(.018+(i%3)*.009,8,6),new T.MeshBasicMaterial({color:0x9bcbd0,transparent:true,opacity:.45}));arena.scene.add(b);return b;});
const actor=name=>arena.cast[tape.players.findIndex(p=>p.name===name)];
let active=-1,time=0;
const errors=[];window.addEventListener("error",e=>errors.push(e.message));
const waterMaterials=new WeakMap();
function pitPerformance(beat,s,local){
 const bex=actor("Bex"),surface=-.55+Math.min(5,s.pit.flood)*.44;
 arena.set.refs.ripples?.forEach(r=>r.visible=false);
 const water=arena.set.refs.water;
 if(!waterMaterials.has(water)){
  const mat=water.material.clone();mat.transmission=.12;mat.color.set(0x207b85);mat.roughness=.24;water.material=mat;waterMaterials.set(water,mat);
 }
 for(const [i,c] of arena.cast.entries()){
  const name=tape.players[i].name;if(!c.group.visible)continue;
  if(name==="Bex"&&s.pit.base==="Bex"&&(["climb","climb-side"].includes(beat.kind)||s.pit.out.length===0))continue;
  if(name==="Bex"&&beat.kind==="death"){
   const u=clamp(local/(beat.end-beat.start));c.group.position.y=surface-1.5-1.8*u*u;c.group.rotation.y=.1;
   arena.rotate(c,"upperarm_r",X,-2.7*(1-clamp((local-2)/1.2)));
  }else if(name==="Bex"&&s.pit.base==="Bex"){
   const pulse=Math.sin(time*2.1);c.group.position.y=surface-1.6+.035*pulse;c.group.rotation.y=Math.PI;
   arena.rotate(c,"upperarm_l",X,-.25+.05*pulse);arena.rotate(c,"upperarm_r",X,-.25-.05*pulse);
   arena.rotate(c,"lowerarm_l",X,-.55);arena.rotate(c,"lowerarm_r",X,-.55);arena.rotate(c,"head",X,-.1);
   if(beat.id==="bex-plea")arena.rotate(c,"upperarm_r",X,-.45*clamp(local/1.2));
  }else if(s.pit.out.includes(name)&&!["climb","climb-side"].includes(beat.kind)){
   c.group.rotation.y=Math.atan2(-c.group.position.x,-2.35-c.group.position.z);arena.rotate(c,"head",X,.16);
  }
 }
 wakes.forEach((r,i)=>{const p=((local*.32+i*.25)%1+1)%1;r.visible=s.players.Bex.alive||beat.id==="bex-sink";r.position.set(0,surface+.016+i*.001,-2.35);r.scale.setScalar(.8+p*2.3);r.material.opacity=(1-p)*.17;});
 bubbles.forEach((b,i)=>{const u=local*.4+i*.17;b.visible=beat.id==="bex-sink"&&local>.8;b.position.set(Math.sin(i*2.4)*.23,surface-.3+(u%1)*.35,-2.35+Math.cos(i*2.4)*.23);});
 if(beat.id==="bex-sink")arena.effects.visible=false;
}
function cameraFor(beat,s,local){
 let eye,target,fov=37;
 const key=arena.view.key,focus=beat.focus?actor(beat.focus):null;
 const progress=clamp(local/(beat.end-beat.start));
 if(beat.kind==="speaker"&&focus){
  const p=focus.group.position.clone().add(new T.Vector3(0,1.5,0));
  eye=[p.x+.55,p.y+.17,p.z+4.25-progress*.18];target=[p.x+.8,p.y,p.z];fov=37;
  if(key==="pit"&&beat.focus==="Bex"){eye=beat.id==="bex-reaction"?[2.4,3.15,-2.8]:[-1.7,3.1,-2.85];target=[.5,-.55+Math.min(5,s.pit.flood)*.44+.35,-2.35];fov=43;}
  else focus.group.rotation.y=.12;
  if(beat.mode==="thought"){arena.rotate(focus,"head",X,.10);arena.rotate(focus,"head",Y,-.13);}
 }else if(beat.kind==="rope"){eye=[2.65,4.2,-1.5];target=[1.42,3.02,-3.23];fov=29;}
 else if(beat.kind==="climb"){eye=[5.7,4.7,4.8];target=[0,1.65,-2.8];fov=42;}
 else if(beat.kind==="climb-side"){eye=[-5.6,3.8,2.9];target=[0,1.45,-2.8];fov=42;}
 else if(beat.id==="bex-sink"){eye=[.55,1.94,.6];target=[0,1.75,-2.35];fov=42;}
 else if(beat.kind==="wide"){
  if(key==="waiting"){eye=[9,8,15];target=[0,1.2,1];fov=43;}
  else if(key==="bridge"){eye=[10,10,13];target=[0,0,-1];fov=48;}
  else if(key==="crusher"){eye=[12,8,13];target=[0,1,-1];fov=43;}
  else if(key==="pit"){eye=[8.5,7.6,10.6];target=[0,2,-2.9];fov=42;}
  else if(key==="disc"){eye=[8,8,12];target=[0,.6,0];fov=43;}
  else if(key==="ledge"){eye=[6.8,5.5,9];target=[0,.6,0];fov=43;}
  else if(key==="chalk"){eye=[7,6,14];target=[0,1.7,0];fov=43;}
  else {eye=[4,5,14];target=[0,2,0];fov=42;}
 }
 if(eye){arena.camera.fov=fov;arena.camera.position.fromArray(eye);arena.camera.lookAt(...target);arena.camera.updateProjectionMatrix();}
 else {arena.camera.fov=37;arena.camera.updateProjectionMatrix();}
 arena.camera.updateMatrixWorld();
}
function overlay(beat,s,local){
 const voiced=time>=beat.voiceStart&&time<beat.voiceEnd;
 const pages=beat.text?textPages(beat.text):[];
 const part=voiced?Math.min(pages.length-1,Math.floor((time-beat.voiceStart)/beat.voiceDuration*pages.length)):0;
 const text=voiced?pages[part]:"";
 $("caption").textContent=beat.mode==="narrator"?text:"";
 const bubble=$("bubble");bubble.hidden=!voiced||beat.mode==="narrator";
 bubble.dataset.mode=beat.mode||"say";
 $("bubble-text").textContent=text;
 $("bubble-label").textContent=beat.focus?`${beat.focus.toUpperCase()} / ${CAST[beat.focus].model.toUpperCase()}`:"";
 $("bubble-detail").textContent=beat.mode==="thought"?"PRIVATE THOUGHT":beat.mode==="whisper"?`${beat.forgedBy?"FORGED BY "+beat.forgedBy.toUpperCase()+" · ":""}WHISPER TO ${beat.to.toUpperCase()}`:beat.mode==="chalk_write"?"LEAVES A NOTE":"SAYS";
 bubble.style.opacity=String(voiced?clamp((time-beat.voiceStart)/.12):0);
 const living=Object.values(s.players).filter(p=>p.alive).length;
 $("chapter-name").textContent=beat.later?"LATER":beat.epilogue?"AFTER THE GAME":TITLES[s.stage]||"THE RESULT";
 $("counter").textContent=beat.later?"":beat.result?"HANA / FIRST PLACE":beat.epilogue?"THE CHALK WALL":s.stage==="ledge"&&living<=3?"FIGHT FOR FIRST":`${living} LEFT`;
 let fact=beat.fact||"";
 if(beat.id==="stakes")fact="8 AIs\n5 OBSTACLES\n3 PRIZES";
 if(beat.id==="rope-cost")fact="ONE ROPE\nRESCUE COSTS 2 FOOTING";
 if(beat.id==="unused-rope")fact="STILL UNUSED";
 if(beat.id==="cole-step")fact="SAID RIGHT.\nSTEPS LEFT.";
 if(beat.id==="forged-whisper")fact="DARA'S FORGERY";
 if(beat.id==="shrink")fact="GUS: 0 FOOTING\nHANA: 1 FOOTING";
 if(beat.id==="winner")fact="HANA WINS.";
 $("fact").textContent=fact;
 const identity=$("identity");identity.replaceChildren();
 if(beat.focus&&beat.kind==="speaker"){
  const p=CAST[beat.focus],name=document.createElement("strong");name.textContent=beat.focus;identity.append(name,`${p.model}${p.persona?" / "+p.persona:""}`);
 }
 $("end").style.opacity=beat.kind==="end"?String(clamp(local/.3)):"0";
 // Verify bubble geometry does not cover any visible head, including listeners.
 const heads=[];
 for(const [i,c]of arena.cast.entries())if(c.group.visible){
  const v=(c.bones.head?.bone.getWorldPosition(new T.Vector3())||c.group.position.clone().add(new T.Vector3(0,1.85,0))).project(arena.camera);
  if(v.z<1&&Math.abs(v.x)<1&&Math.abs(v.y)<1)heads.push({name:tape.players[i].name,x:(v.x*.5+.5)*innerWidth,y:(-v.y*.5+.5)*innerHeight});
 }
 // Reserve enough height for any eight-word page, so the bubble stays still
 // within a line instead of jumping when its text page changes.
 // Snap the bubble box to capture pixels so cached corner rasterization is stable.
 bubble.style.left=`${Math.round(innerWidth*.57)}px`;bubble.style.width=`${Math.round(innerWidth*.36)}px`;
 bubble.style.minHeight=`${Math.round(innerHeight*.22)}px`;
 bubble.style.borderRadius=`${Math.round(innerWidth*(beat.mode==="thought"?.026:.0115))}px`;
 const hits=rect=>heads.filter(p=>p.x>=rect.left-35&&p.x<=rect.right+35&&p.y>=rect.top-55&&p.y<=rect.bottom+55);
 let blocked=[];
 if(!bubble.hidden){
  for(const top of [28,57,14,69]){
   bubble.style.top=`${Math.round(innerHeight*top/100)}px`;
   blocked=hits(bubble.getBoundingClientRect());if(!blocked.length)break;
  }
 }
 return {bubbleMode:!bubble.hidden?beat.mode:null,bubbleText:text,blockedHeads:blocked.map(p=>p.name)};
}
function draw(seconds){
 time=Math.max(0,Math.min(edit.duration,Number(seconds)||0));const beat=beatAt(edit,time),local=time-beat.start;
 const s=states.get(beat.event),prev=prevs.get(beat.event);
 if(active!==beat.event){arena.setState(s,prev,true);active=beat.event;}
 arena.direction=direction(tape,s,true);arena.performanceKind=performanceKind(s,true);
 const animation=beat.offset!==undefined?beat.offset+local*(beat.rate||1):beat.kind==="action"||beat.kind==="death"?Math.min(local,2.8):2.8+local*.2;
 arena.render(animation,animation*1000);
 rope.visible=s.stage==="pit";
 wakes.forEach(r=>r.visible=false);bubbles.forEach(b=>b.visible=false);
 if(s.stage==="pit")pitPerformance(beat,s,local);
 arena.cast.forEach(c=>c.ring.visible=false);
 cameraFor(beat,s,local);const motion=life.update(beat,s,local,time);detail.update(s,time);arena.scene.updateMatrixWorld(true);arena.composer.render();
 return {time,id:beat.id,event:beat.event,stage:s.stage,camera:arena.camera.position.toArray(),motion,...overlay(beat,s,local)};
}
window.__episode={ready:true,edit,errors,seek:draw,snapshot:()=>({time,event:active,state:states.get(active)}),rigSnapshot:name=>{
 const c=actor(name);if(!c)return null;c.group.updateMatrixWorld(true);
 return {position:c.group.position.toArray(),puppet:c.puppet.position.toArray(),bones:Object.fromEntries(Object.entries(c.bones).filter(([n])=>["head","spine_03","thigh_l","calf_l","foot_l","foot_r","ball_l","ball_r","upperarm_r","lowerarm_r"].includes(n)).map(([n,b])=>[n,{quaternion:b.bone.quaternion.toArray(),position:b.bone.getWorldPosition(new T.Vector3()).toArray()}]))};
}};
$("loading").remove();draw(0);
