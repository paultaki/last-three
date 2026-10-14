// Film-only causal timing. All assignments and outcomes come from the recorded tape.
import * as T from "three";
import {box,mats} from "./sets.js";
const clamp=x=>Math.max(0,Math.min(1,x));
export function fallPose(style,seconds,origin){
 const t=Math.max(0,seconds),edge=style==="tumble"?clamp(t/.48):0;
 const flight=Math.max(0,t-(style==="tumble"?.48:.24));
 const distance=style==="tumble"?edge*1.8+flight*.8:0;
 const radius=Math.hypot(origin[0],origin[2])||1;
 return {point:[origin[0]+origin[0]/radius*distance,origin[1]-4.905*flight*flight,origin[2]+origin[2]/radius*distance],lean:style==="tumble"?edge*.55+Math.min(.35,flight*.25):Math.min(.32,flight*.22),flight};
}
export function shrinkProgress(beat,local){return clamp((local-(beat.voiceDuration||0)*.48)/.8);}
export function shutterAngle(seconds){return clamp((seconds-.18)/.48)*Math.PI*.49;}
export function brokenPanes(tape,event){
 const result=[];
 for(const e of tape.events.slice(0,event+1))if(e.type==="death"&&e.style==="shatter"){
  const step=tape.events.slice(0,e.i).reverse().find(x=>x.type==="action"&&x.name===e.name&&x.action?.startsWith("step:"));
  if(step)result.push({row:step.round,side:step.action.split(":")[1],event:e.i,name:e.name});
 }
 return result;
}
export class EpisodeStaging{
 constructor(arena,tape,edit){this.arena=arena;this.tape=tape;this.edit=edit;this.owner=null;this.shards=[];}
 build(){
  const set=this.arena.set;this.owner=set;this.shards=[];
  if(set.key==="disc")for(let i=0;i<6;i++){
   const a=i/6*Math.PI*2,x=Math.sin(a)*3.4,z=Math.cos(a)*3.4;
   for(const d of [-1,1]){box(set.group,2,.16,.09,x,-.08,z+d*.96,mats.metal);box(set.group,.09,.16,1.84,x+d*.96,-.08,z,mats.metal);}
  }
  if(set.key==="bridge"){
   const material=new T.MeshPhysicalMaterial({color:0xc4f6ff,transparent:true,opacity:.7,roughness:.07,metalness:.15,side:T.DoubleSide});
   // A deterministic tessellation of the actual 2.62 x 1.98 pane, not confetti at head height.
   for(let x=0;x<6;x++)for(let z=0;z<4;z++)for(let half=0;half<2;half++){
    const x0=-1.31+x*2.62/6,z0=-.99+z*1.98/4,w=2.62/6,d=1.98/4;
    const points=half?[[x0+w,z0],[x0+w,z0+d],[x0,z0+d]]:[[x0,z0],[x0+w,z0],[x0,z0+d]];
    const cx=points.reduce((n,p)=>n+p[0],0)/3,cz=points.reduce((n,p)=>n+p[1],0)/3;
    const geometry=new T.BufferGeometry();geometry.setAttribute("position",new T.Float32BufferAttribute(points.flatMap(p=>[p[0]-cx,0,p[1]-cz]),3));geometry.computeVertexNormals();
    const mesh=new T.Mesh(geometry,material);set.group.add(mesh);this.shards.push({mesh,x:cx,z:cz,index:this.shards.length});
   }
  }
 }
 falling(c,style,elapsed,origin){
  const pose=fallPose(style,elapsed,origin);c.group.position.fromArray(pose.point);
  c.puppet.position.set(0,0,0);c.puppet.rotation.set(pose.lean,0,Math.sin(elapsed*2.3)*Math.min(.17,pose.flight*.1));
  if(style==="tumble")c.group.rotation.y=Math.atan2(origin[0],origin[2]);
  for(const side of ["l","r"]){
   this.arena.rotate(c,`upperarm_${side}`,new T.Vector3(1,0,0),-.9*Math.min(1,pose.flight*2+.15));
   this.arena.rotate(c,`lowerarm_${side}`,new T.Vector3(1,0,0),-.6);
   this.arena.rotate(c,`thigh_${side}`,new T.Vector3(1,0,0),side==="l"?-.3:.16);
   this.arena.rotate(c,`calf_${side}`,new T.Vector3(1,0,0),.45);
  }
  c.group.visible=pose.point[1]>-14;
 }
 update(beat,state,local,time,previous){
  if(this.owner!==this.arena.set)this.build();
  const arena=this.arena,refs=arena.set.refs;
  if(beat.id==="shrink"){
   const u=shrinkProgress(beat,local),from=previous.ledge.shrunk,to=state.ledge.shrunk;
   refs.ledge.scale.setScalar(Math.max(.4,1-(from+(to-from)*u)*.085));
  }
  if(state.stage==="disc"){
   const opening=this.edit.beats.find(b=>b.id==="disc-open"),elapsed=time-opening.start;
   refs.tiles.forEach((tile,i)=>{
    const a=i/state.disc.n*Math.PI*2,angle=state.disc.open.includes(i+1)?shutterAngle(elapsed):0;
    tile.rotation.x=angle;tile.position.set(Math.sin(a)*3.4,-.9*Math.sin(angle),Math.cos(a)*3.4-.9*(1-Math.cos(angle)));
    tile.visible=i<state.disc.n;refs.numbers[i].visible=i<state.disc.n&&angle<.5;
   });
   if(state.disc.open.length){
    for(const a of arena.view.actors){
     const c=arena.cast[a.seat],tile=state.disc.tiles[a.name];
     if(!state.disc.open.includes(tile))continue;
     if(a.name==="Fenn"){
      c.group.visible=true;c.group.position.fromArray(a.position);c.puppet.position.set(0,0,0);c.puppet.rotation.set(0,0,0);
      // Catch occurs in the same drop, then a sustained levitation over the open hatch.
      const q=Math.max(0,elapsed-.24);c.group.position.y=q<.5?-1.8*Math.sin(q/.5*Math.PI):.32+.045*Math.sin(time*2.2);
      arena.rotate(c,"upperarm_l",new T.Vector3(0,0,1),.55);arena.rotate(c,"upperarm_r",new T.Vector3(0,0,1),-.55);
     }else this.falling(c,"chute",elapsed,a.position);
    }
   }
  }
  if(state.stage==="bridge"&&refs.panes){
   this.shards.forEach(s=>s.mesh.visible=false);
   refs.panes.forEach((p,i)=>{p.visible=true;refs.laneLabels[i].visible=true;});
   for(const broken of brokenPanes(this.tape,beat.event)){
    const index=(broken.row-1)*2+(broken.side==="R"?1:0),pane=refs.panes[index];
    const elapsed=beat.event===broken.event?local:99;
    pane.visible=elapsed<.24;refs.laneLabels[index].visible=pane.visible;
    if(beat.event===broken.event){
     for(const shard of this.shards){const q=Math.max(0,elapsed-.24),speed=.3+(shard.index%7)*.065;
      shard.mesh.visible=elapsed>=.24&&q<1.9;
      shard.mesh.position.set(pane.position.x+shard.x*(1+speed*q),.02-4.905*q*q,pane.position.z+shard.z*(1+speed*q));
      shard.mesh.rotation.set(q*(shard.index%5-2),q*(shard.index%3-1),q*(shard.index%7-3));
     }
    }
   }
  }
  if(beat.kind==="death"&&["shatter","tumble"].includes(state.ev?.style)){
   const a=arena.view.actors.find(a=>a.name===beat.focus);this.falling(arena.cast[a.seat],state.ev.style,local,a.position);arena.effects.visible=false;
  }
  if(state.stage==="chalk"&&beat.focus&&["chalk_write","thought"].includes(beat.mode)){
   const a=arena.view.actors.find(a=>a.name===beat.focus),c=arena.cast[a.seat];
   arena.cast.forEach((other,i)=>{if(i!==a.seat)other.group.visible=false;});
   c.group.position.set(beat.focus==="Gus"?-2:1.6,0,-3.55);c.group.rotation.y=beat.mode==="chalk_write"?Math.PI:.4;
   if(beat.mode==="chalk_write"){
    arena.pose(c,{...a,pose:"idle"},0);
    arena.rotate(c,"upperarm_r",new T.Vector3(1,0,0),-1.45);arena.rotate(c,"lowerarm_r",new T.Vector3(1,0,0),-.25);
    arena.rotate(c,"hand_r",new T.Vector3(0,0,1),Math.sin(time*6)*.08);
   }
  }
  // Public/private dialogue has different body language. Only real whispers stage a pair.
  if(beat.mode==="whisper"&&!beat.forgedBy){
   const a=arena.view.actors.find(a=>a.name===beat.focus),b=arena.view.actors.find(a=>a.name===beat.to);
   if(a&&b){const ca=arena.cast[a.seat],cb=arena.cast[b.seat];
    if(state.stage==="ledge"){
     const mid=new T.Vector3(...a.position).add(new T.Vector3(...b.position)).multiplyScalar(.5);
     ca.group.position.copy(mid).add(new T.Vector3(-.58,0,0));cb.group.position.copy(mid).add(new T.Vector3(.58,0,0));
    }
    ca.group.rotation.y=Math.atan2(cb.group.position.x-ca.group.position.x,cb.group.position.z-ca.group.position.z);
    cb.group.rotation.y=Math.atan2(ca.group.position.x-cb.group.position.x,ca.group.position.z-cb.group.position.z);
    arena.rotate(ca,"spine_03",new T.Vector3(1,0,0),.1);arena.rotate(ca,"lowerarm_r",new T.Vector3(1,0,0),-1.1);
   }
  }
 }
}
