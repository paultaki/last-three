import * as T from "three";
import {mats,box,bar,mesh} from "./sets.js";
function surfaceTexture(){
 const canvas=document.createElement("canvas");canvas.width=canvas.height=256;
 const ctx=canvas.getContext("2d"),data=ctx.createImageData(256,256);let seed=20261011;
 const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
 for(let p=0;p<data.data.length;p+=4){const v=230+Math.floor(random()*24);data.data[p]=data.data[p+1]=data.data[p+2]=v;data.data[p+3]=255;}
 ctx.putImageData(data,0,0);ctx.strokeStyle="#a1a5a322";
 for(let i=0;i<110;i++){const x=random()*256,y=random()*256;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+random()*22,y+(random()-.5)*5);ctx.stroke();}
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(3,3);texture.anisotropy=4;return texture;
}
export class EpisodeDetail{
 constructor(arena){this.arena=arena;this.owner=null;this.clock={value:0};this.streams=[];this.warn=[];}
 build(){
  const arena=this.arena,set=arena.set;this.owner=set;this.streams=[];this.warn=[];
  const texture=surfaceTexture(),clones=new Map();
  set.group.traverse(o=>{
   if(!o.isMesh||![mats.concrete,mats.light,mats.dark].includes(o.material))return;
   if(!clones.has(o.material)){const m=o.material.clone();m.map=texture;m.roughness=Math.min(1,m.roughness+.08);clones.set(o.material,m);}
   o.material=clones.get(o.material);
  });
  const group=new T.Group();group.name="Film surface and mechanical detail";set.group.add(group);
  const metal=new T.MeshStandardMaterial({color:0x74848b,metalness:.78,roughness:.48});
  const dark=new T.MeshStandardMaterial({color:0x1b3036,roughness:.94});
  const wet=new T.MeshStandardMaterial({color:0x103b42,transparent:true,opacity:.18,roughness:.38,depthWrite:false});
  const bolts=(parent,points)=>{
   const inst=new T.InstancedMesh(new T.CylinderGeometry(.038,.045,.025,6),metal,points.length),matrix=new T.Matrix4();
   for(const [i,p]of points.entries()){matrix.makeTranslation(...p);inst.setMatrixAt(i,matrix);}inst.castShadow=true;parent.add(inst);
  };
  if(set.key==="pit"){
   for(let x=-5.5;x<6;x+=1.5)box(group,.013,.004,2.7,x,2.798,-4.5,dark);
   for(let z of [-3.6,-4.5,-5.4])box(group,11.5,.004,.014,0,2.798,z,dark);
   bolts(group,Array.from({length:20},(_,i)=>[-5.5+i*.58,2.94,-3.04]));
   for(let i=0;i<9;i++)box(group,.23,.017,.023,-4.02,-.5+i*.32,-1.55,metal);
   // Wet patches stay on the deck and are decorative, not extra footholds.
   for(let i=0;i<7;i++){
    const patch=mesh(new T.CircleGeometry(.22+(i%3)*.13,18),wet,group,-4.5+i*1.4,2.801,-3.45-(i%2)*.65);
    patch.rotation.x=-Math.PI/2;patch.scale.y=.5;
   }
   for(let side of [-1,1]){
    bar(group,[side*3.65,2.12,-2.2],[side*3.35,2.12,-1.95],.055,metal);
    const stream=mesh(new T.CylinderGeometry(.017,.035,1,8),new T.MeshPhysicalMaterial({color:0x97d6d8,transparent:true,opacity:.32,roughness:.24}),group);
    this.streams.push({mesh:stream,x:side*3.35,z:-1.95,offset:side});
   }
  }
  if(set.key==="bridge"){
   for(const pane of set.refs.panes)bolts(pane,[[-1.18,.10,-.85],[1.18,.10,-.85],[-1.18,.10,.85],[1.18,.10,.85]]);
   for(let x of [-3.2,3.2])for(let z=-11;z<10;z+=2.35)box(group,.2,.12,.7,x,-.48,z,metal);
  }
  if(set.key==="crusher"){
   for(let side of [-1,1]){
    for(let z of [-3.6,2.8]){
     bar(group,[side*5.5,.1,z],[side*5.5,5.4,z],.13,metal);
     for(let y of [.5,1.7,2.9,4.1])box(group,.34,.06,.31,side*5.5,y,z,dark);
    }
   }
   const ceiling=set.refs.ceiling;
   bolts(ceiling,[[-4.7,-.45,-3.7],[4.7,-.45,-3.7],[-4.7,-.45,3.7],[4.7,-.45,3.7]]);
   const warning=new T.MeshStandardMaterial({color:0xe1a744,emissive:0xbe6429,emissiveIntensity:.48,roughness:.65});
   box(ceiling,10,.05,.06,0,-.4,4.45,warning);this.warn.push(warning);
  }
  if(set.key==="disc")for(const tile of set.refs.tiles){
   bolts(tile,[[-.72,.09,-.72],[.72,.09,-.72],[-.72,.09,.72],[.72,.09,.72]]);
   box(tile,1.6,.012,.025,0,.09,-.79,dark);box(tile,1.6,.012,.025,0,.09,.79,dark);
  }
  if(set.key==="ledge"){
   const ledge=set.refs.ledge;
   bolts(ledge,Array.from({length:32},(_,i)=>[Math.sin(i/32*Math.PI*2)*4.22,.025,Math.cos(i/32*Math.PI*2)*4.22]));
   for(let i=0;i<10;i++){const a=i/10*Math.PI*2;bar(ledge,[Math.sin(a)*4.1,-.17,Math.cos(a)*4.1],[Math.sin(a)*3.75,-1.2,Math.cos(a)*3.75],.045,metal);}
  }
 }
 update(state,time){
  if(this.owner!==this.arena.set)this.build();this.clock.value=time;
  const water=this.arena.set.refs.water;
  if(water&&water.material.userData.filmWaves!==true){
   const material=water.material;material.opacity=.91;material.transmission=.08;material.roughness=.34;material.clearcoat=.45;
   material.userData.filmWaves=true;
   const clock=this.clock;
   material.onBeforeCompile=shader=>{
    shader.uniforms.filmTime=clock;
    shader.vertexShader="varying vec3 filmWaterPos;\n"+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace("#include <begin_vertex>","#include <begin_vertex>\nfilmWaterPos=position;");
    shader.fragmentShader="uniform float filmTime; varying vec3 filmWaterPos;\n"+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace("#include <normal_fragment_maps>","#include <normal_fragment_maps>\nnormal=normalize(normal+vec3(sin(filmWaterPos.x*5.2+filmTime*1.7)*.075,cos(filmWaterPos.z*4.1-filmTime*1.3)*.035,cos(filmWaterPos.z*5.6+filmTime)*.06));");
   };material.needsUpdate=true;
  }
  const surface=-.55+Math.min(5,state.pit?.flood||0)*.44;
  for(const stream of this.streams){
   const length=2.12-surface;stream.mesh.visible=length>.02;stream.mesh.position.set(stream.x,surface+length/2,stream.z);stream.mesh.scale.set(.87+.12*Math.sin(time*8+stream.offset),length,1);
  }
  for(const warning of this.warn)warning.emissiveIntensity=.48+.08*Math.sin(time*2.7);
 }
}
