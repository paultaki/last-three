import * as T from "three";
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const protectedPoses=new Set(["shove","flinch","climb","hold","dodge","rescue","celebrate","shatter","chute","tumble","flatten","sink"]);
export function motionPlan(beat,actor,state,seat,time){
 if(!actor.visible||protectedPoses.has(actor.pose)||beat.kind==="end")return null;
 if(actor.name==="Bex"&&state.stage==="pit"){
  if(state.pit.base!=="Bex"||state.pit.out.length===0||["climb","climb-side"].includes(beat.kind)||beat.kind==="death")return null;
  return {clip:"Swim_Idle_Loop",weight:1,clock:time*.84+seat*.73,pool:true};
 }
 if(actor.pose==="base"||actor.pose==="brace")return null;
 if(actor.pose==="walk"){
  if(state.stage!=="bridge"||!(beat.kind==="action"))return null;
  const u=clamp((time-beat.start)/1.35),distance=Math.hypot(actor.position[0]-actor.from[0],actor.position[2]-actor.from[2]);
  return {clip:seat%2?"Walk_Formal_Loop":"Walk_Loop",weight:1-clamp((u-.78)/.22),distance:u*distance,progress:u,walk:true,clock:time*.83+seat*.731};
 }
 if(state.stage==="pit"&&state.pit.out.includes(actor.name)&&beat.focus===actor.name&&["eli-refusal","gus-refusal","hana-refusal"].includes(beat.id)){
  const u=clamp((time-beat.start)/1.05);
  return {clip:"Walk_Formal_Loop",weight:1-clamp((u-.65)/.35),distance:.4*u,progress:u,walk:true,retreat:true,clock:time*.83+seat*.731};
 }
 if(state.stage==="disc"&&beat.id==="disc-rule"){
  const u=clamp((time-beat.start-seat*.11)/.8);
  return {clip:seat%2?"Walk_Formal_Loop":"Walk_Loop",weight:1-clamp((u-.7)/.3),distance:.32*u,progress:u,walk:true,arrive:true,clock:time*.83+seat*.731};
 }
 const speaking=beat.focus===actor.name&&beat.kind==="speaker"&&beat.mode==="say";
 return {clip:speaking?"Idle_Talking_Loop":"Idle_Loop",weight:1,clock:time*(.77+(seat%4)*.083)+seat*.731};
}
export function poolLookTarget(beat,state,actors){
 const name=beat.to|| (beat.id==="bex-reaction"?"Hana":"Eli");
 const target=actors.find(a=>a.name===name&&a.visible&&state.pit.out.includes(a.name));
 return target?[target.position[0],target.position[1]+1.65,target.position[2]]:[0,4.45,-3.8];
}
export class EpisodeLife{
 constructor(arena,tape,library){
  this.arena=arena;this.tape=tape;this.clips=[];
  for(const [i,c]of arena.cast.entries()){
   const rows=library.actors[tape.players[i].name],clips={};
   for(const [name,row]of Object.entries(rows)){
    const tracks=Object.entries(row.tracks).map(([bone,values])=>{
     const binding=c.bones[bone];if(!binding)throw new Error(`Motion bone missing: ${bone}`);
     return {bone:binding.bone,interpolant:new T.QuaternionKeyframeTrack(`${bone}.quaternion`,row.times,values).createInterpolant()};
    });
    clips[name]={duration:row.duration,tracks,height:new T.NumberKeyframeTrack("height",row.times,row.heights).createInterpolant()};
   }
   this.clips.push(clips);
  }
 }
 pose(c,seat,plan){
  const clip=this.clips[seat][plan.clip],t=plan.walk?(plan.distance/1.25*clip.duration)%clip.duration:((plan.clock%clip.duration)+clip.duration)%clip.duration;
  const idle=this.clips[seat].Idle_Loop,it=((plan.clock%idle.duration)+idle.duration)%idle.duration;
  for(const [i,track]of clip.tracks.entries()){
   const q=new T.Quaternion().fromArray(track.interpolant.evaluate(t));
   if(plan.walk)track.bone.quaternion.fromArray(idle.tracks[i].interpolant.evaluate(it)).slerp(q,plan.weight);
   else track.bone.quaternion.slerp(q,plan.weight);
  }
  if(!plan.pool)c.puppet.position.y+=clip.height.evaluate(t)[0]*plan.weight+(plan.walk?idle.height.evaluate(it)[0]*(1-plan.weight):0);
  c.group.updateMatrixWorld(true);
  if(!plan.pool){
   const feet=["foot_l","foot_r","ball_l","ball_r"].map(name=>c.bones[name].bone.getWorldPosition(new T.Vector3()).y-(name.startsWith("ball")?.018:.06));
   c.puppet.position.y+=c.group.position.y-Math.min(...feet);c.group.updateMatrixWorld(true);
  }
 }
 aim(c,target,pool=false){
  const head=c.bones.head?.bone;if(!head)return null;
  c.group.updateMatrixWorld(true);const origin=head.getWorldPosition(new T.Vector3()),direction=new T.Vector3(...target).sub(origin).normalize();
  const body=c.group.getWorldQuaternion(new T.Quaternion()),local=direction.clone().applyQuaternion(body.clone().invert());
  const yaw=clamp(Math.atan2(local.x,local.z),pool?-.5:-.38,pool?.5:.38),pitch=clamp(-Math.atan2(local.y,Math.hypot(local.x,local.z)),pool?-.85:-.28,.3);
  const desired=body.multiply(new T.Quaternion().setFromEuler(new T.Euler(pitch,yaw,0,"YXZ")));
  head.quaternion.copy(head.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(desired));head.updateMatrixWorld(true);
  return {elevation:-pitch,alignment:clamp(new T.Vector3(0,0,1).applyQuaternion(head.getWorldQuaternion(new T.Quaternion())).dot(direction),-1,1)};
 }
 update(beat,state,local,time){
  const arena=this.arena,diagnostics=[];
  for(const [seat,a]of arena.view.actors.entries()){
   const c=arena.cast[seat],plan=motionPlan(beat,a,state,seat,time);
   if(!plan){
    if(a.visible&&a.pose==="celebrate"&&beat.kind!=="end"){
     const accent=Math.sin(time*1.6+seat*.73);c.puppet.position.y+=Math.abs(accent)*.025;
     arena.rotate(c,"spine_03",new T.Vector3(0,1,0),accent*.045);
     arena.rotate(c,"lowerarm_r",new T.Vector3(1,0,0),accent*.08);
    }
    continue;
   }
   if(plan.walk){
    if(plan.arrive){
     c.group.position.fromArray(a.position);c.group.position.z+=.32*(1-plan.progress);c.group.rotation.y=Math.PI;
    }else if(plan.retreat){
     c.group.position.fromArray(a.position);c.group.position.z+=.12-.4*plan.progress;
     const turn=clamp((plan.progress-.72)/.28);c.group.rotation.y=Math.PI+(.12-Math.PI)*turn*turn*(3-2*turn);
    }else{
     c.group.position.lerpVectors(new T.Vector3(...a.from),new T.Vector3(...a.position),plan.progress);
     c.group.rotation.y=Math.atan2(a.position[0]-a.from[0],a.position[2]-a.from[2]);
    }
   }
   if(plan.walk)diagnostics.push({name:a.name,clip:plan.clip,progress:plan.progress,retreat:!!plan.retreat});
   this.pose(c,seat,plan);
   if(beat.kind==="death"&&!a.active){
    const phase=clamp((local-.12-seat*.15)/1.2),reaction=Math.sin(phase*Math.PI);
    arena.rotate(c,"spine_03",new T.Vector3(1,0,0),-reaction*.09);
    arena.rotate(c,"upperarm_r",new T.Vector3(1,0,0),-reaction*(seat%3===0?.4:.12));
   }
   if(!plan.pool&&!plan.walk){
    // Different pauses and weight shifts per performer, with planted feet.
    const phase=Math.max(0,local-.2-seat*.19),pulse=Math.sin(phase*(.95+seat*.04));
    arena.rotate(c,"spine_01",new T.Vector3(0,0,1),pulse*(beat.focus===a.name?.035:.018));
    arena.rotate(c,"spine_03",new T.Vector3(0,1,0),pulse*(seat%2?.055:-.04));
    if(beat.mode==="thought"&&beat.focus===a.name){arena.rotate(c,"head",new T.Vector3(1,0,0),.08);arena.rotate(c,"lowerarm_r",new T.Vector3(1,0,0),-.45*Math.max(0,pulse));}
   }
   if(plan.pool){
    const target=poolLookTarget(beat,state,arena.view.actors);
    c.group.rotation.y=Math.atan2(target[0]-c.group.position.x,target[2]-c.group.position.z);
    // An upward reach is directed at the actual deck, not toward the viewer.
    if(beat.id==="bex-plea"||beat.id==="bex-whisper"){
     const reach=Math.sin(clamp(local/(beat.end-beat.start))*Math.PI);
     arena.rotate(c,"upperarm_r",new T.Vector3(1,0,0),-reach*.7);arena.rotate(c,"lowerarm_r",new T.Vector3(1,0,0),-reach*.45);
    }
    diagnostics.push({name:a.name,clip:plan.clip,gaze:this.aim(c,target,true)});
   }else if(!plan.walk){
    const focus=arena.view.actors.find(x=>x.name===beat.focus&&x.visible);
    const focalCast=focus?arena.cast[arena.view.actors.indexOf(focus)]:null;
    const target=beat.focus===a.name?[arena.camera.position.x,arena.camera.position.y,arena.camera.position.z]:focalCast?[focalCast.group.position.x,focalCast.group.position.y+1.7,focalCast.group.position.z]:null;
    if(target){
     const pause=.18+seat*.17,pulse=local>pause?Math.sin(clamp((local-pause)/1.4)*Math.PI):0;
     if(seat%3===0&&beat.focus!==a.name)arena.rotate(c,"spine_03",new T.Vector3(1,0,0),pulse*.045);
     this.aim(c,target);
    }
    diagnostics.push({name:a.name,clip:plan.clip,clock:plan.clock});
   }
  }
  return diagnostics;
 }
}
