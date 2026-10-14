// Offline copies only. Retarget CC0 Quaternius rotations onto the local Synty rigs.
import fs from "node:fs/promises";
import * as T from "three";
const [sourcePath,outputPath]=process.argv.slice(2);
if(!sourcePath||!outputPath)throw new Error("Usage: node retarget-episode-motion.mjs source.glb output.json");
const clips=["Idle_Loop","Idle_Talking_Loop","Walk_Loop","Walk_Formal_Loop","Swim_Idle_Loop"];
const names=["pelvis","spine_01","spine_02","spine_03","neck_01","head","clavicle_l","upperarm_l","lowerarm_l","hand_l","clavicle_r","upperarm_r","lowerarm_r","hand_r","thigh_l","calf_l","foot_l","ball_l","thigh_r","calf_r","foot_r","ball_r"];
async function skeleton(path){
 const buffer=await fs.readFile(path),length=buffer.readUInt32LE(12),json=JSON.parse(buffer.subarray(20,20+length)),binary=buffer.subarray(28+length);
 const nodes=json.nodes.map(n=>{
  const o=new T.Object3D();o.name=n.name||"";
  if(n.matrix)o.applyMatrix4(new T.Matrix4().fromArray(n.matrix));
  else {o.position.fromArray(n.translation||[0,0,0]);o.quaternion.fromArray(n.rotation||[0,0,0,1]);o.scale.fromArray(n.scale||[1,1,1]);}
  return o;
 });
 json.nodes.forEach((n,i)=>(n.children||[]).forEach(k=>nodes[i].add(nodes[k])));
 const root=new T.Group();nodes.filter(n=>!n.parent).forEach(n=>root.add(n));root.updateMatrixWorld(true);
 const rest=nodes.map(n=>({position:n.position.clone(),quaternion:n.quaternion.clone(),scale:n.scale.clone(),world:n.getWorldQuaternion(new T.Quaternion())}));
 const byName=new Map(nodes.map((n,i)=>[n.name.toLowerCase(),i]));
 function accessor(index){
  const a=json.accessors[index],v=json.bufferViews[a.bufferView];
  if(a.componentType!==5126||a.sparse)throw new Error("Motion exporter requires dense float accessors");
  const size={SCALAR:1,VEC3:3,VEC4:4}[a.type],stride=v.byteStride||size*4,out=[];
  if(!size)throw new Error("Unexpected motion accessor");
  for(let i=0;i<a.count;i++)for(let k=0;k<size;k++)out.push(binary.readFloatLE((v.byteOffset||0)+(a.byteOffset||0)+i*stride+k*4));
  return out;
 }
 const reset=()=>nodes.forEach((n,i)=>{n.position.copy(rest[i].position);n.quaternion.copy(rest[i].quaternion);n.scale.copy(rest[i].scale);});
 return {json,nodes,root,rest,byName,accessor,reset};
}
const source=await skeleton(sourcePath),mixer=new T.AnimationMixer(source.root),result={source:"Quaternius Universal Animation Library Standard",license:"CC0-1.0",sampleRate:30,actors:{}};
const sourceClips=new Map();
for(const name of clips){
 const animation=source.json.animations.find(a=>a.name===name);if(!animation)throw new Error(`Missing clip ${name}`);
 const tracks=animation.channels.map(channel=>{
  const sampler=animation.samplers[channel.sampler];if(sampler.interpolation&&sampler.interpolation!=="LINEAR")throw new Error("Unsupported interpolation");
  const target=source.nodes[channel.target.node],path=channel.target.path,times=source.accessor(sampler.input),values=source.accessor(sampler.output);
  return path==="rotation"?new T.QuaternionKeyframeTrack(`${target.uuid}.quaternion`,times,values):new T.VectorKeyframeTrack(`${target.uuid}.${path==="translation"?"position":"scale"}`,times,values);
 });
 sourceClips.set(name,new T.AnimationClip(name,-1,tracks));
}
for(const actor of ["Ash","Bex","Cole","Dara","Eli","Fenn","Gus","Hana"]){
 const target=await skeleton(new URL(`../assets/cast/${actor}.glb`,import.meta.url));
 const rows={};
 for(const name of clips){
  mixer.stopAllAction();source.reset();
  const clip=sourceClips.get(name),action=mixer.clipAction(clip);action.setLoop(T.LoopOnce,1);action.clampWhenFinished=true;action.play();
  const frames=Math.ceil(clip.duration*30),times=Array.from({length:frames+1},(_,i)=>Math.min(i/30,clip.duration)),tracks=Object.fromEntries(names.map(n=>[n,[]])),heights=[];
  const pelvis=source.nodes[source.byName.get("pelvis")],restPelvis=pelvis.getWorldPosition(new T.Vector3());
  for(const time of times){
   mixer.setTime(time);source.root.updateMatrixWorld(true);target.reset();target.root.updateMatrixWorld(true);
   heights.push(Number(((pelvis.getWorldPosition(new T.Vector3()).y-restPelvis.y)*1.2).toFixed(6)));
   for(const bone of names){
    const si=source.byName.get(bone),ti=target.byName.get(bone);if(si===undefined||ti===undefined)throw new Error(`Missing bone ${bone}`);
    const delta=source.nodes[si].getWorldQuaternion(new T.Quaternion()).multiply(source.rest[si].world.clone().invert());
    const desired=delta.multiply(target.rest[ti].world),node=target.nodes[ti];
    node.quaternion.copy(node.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(desired)).normalize();
    node.updateMatrixWorld(true);tracks[bone].push(...node.quaternion.toArray().map(v=>Number(v.toFixed(7))));
   }
  }
  rows[name]={duration:clip.duration,times,tracks,heights};action.stop();
 }
 result.actors[actor]=rows;
}
await fs.writeFile(outputPath,JSON.stringify(result));
console.log(JSON.stringify({actors:8,clips:clips.length,bytes:(await fs.stat(outputPath)).size}));
