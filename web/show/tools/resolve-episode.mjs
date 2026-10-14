import fs from "node:fs/promises";
import {execFileSync} from "node:child_process";
import {BEATS,resolveEdit} from "../src/episode-edit.js";
const out=process.env.LAST_THREE_OUTPUT?new URL("file://"+process.env.LAST_THREE_OUTPUT.replace(/\/$/,"")+"/"):new URL("../../../docs/show/recordings/episode-v1/",import.meta.url),durations={};
for(const b of BEATS.filter(b=>b.text)){
 const file=new URL(`audio/${b.id}.mp3`,out);
 durations[b.id]=Number(execFileSync("ffprobe",["-v","error","-show_entries","format=duration","-of","default=nw=1:nk=1",file.pathname],{encoding:"utf8"}).trim());
}
const provisional=resolveEdit(durations),processed={};
for(const b of provisional.beats.filter(b=>b.text)){
 const file=new URL(`audio/${b.id}.mp3`,out);
 const pcm=execFileSync("ffmpeg",["-v","error","-xerror","-i",file.pathname,"-af",`atempo=${b.voiceRate}`,"-f","f32le","-ar","48000","-ac","1","-"],{maxBuffer:16*1024*1024});
 processed[b.id]=pcm.length/4/48000;
}
const edit=resolveEdit(durations,processed);
try{await fs.access(new URL("temporary-voices.json",out));edit.audioStatus="temporary-local-draft";}catch(error){if(error.code!=="ENOENT")throw error;}
const body=JSON.stringify(edit,null,2)+"\n";
await fs.writeFile(new URL("timing.json",out),body);
const runtime=new URL("../assets/episode/",import.meta.url);await fs.mkdir(runtime,{recursive:true});
await fs.writeFile(new URL("timing.json",runtime),body);
console.log(JSON.stringify({duration:edit.duration,shots:edit.beats.length,voices:Object.keys(durations).length}));
