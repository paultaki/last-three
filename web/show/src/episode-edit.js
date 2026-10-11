// Authored screenplay for one recorded game. Never edits or simulates its events.
export const TAPE="20261009-0025";
export const CAST={
  Ash:{model:"Claude",persona:"THE ANCHOR",voice:"VMCgCMbBs53ElBxVD4VB"},
  Bex:{model:"DeepSeek",persona:"",voice:"EXAVITQu4vr4xnSDxMaL"},
  Cole:{model:"GLM",persona:"THE SEER",voice:"6Xb9dRSSm1t1OLWvzT1T"},
  Dara:{model:"Grok",persona:"THE FORGER",voice:"TDdaEMZGTCMRB4x8bVQ2"},
  Eli:{model:"Gemini",persona:"",voice:"SAz9YHcvj6GT2YYXdXww"},
  Fenn:{model:"Kimi",persona:"THE FEATHER",voice:"nf4MCGNSdM0hxM95ZBQR"},
  Gus:{model:"Qwen",persona:"",voice:"CwhRBWXzGAHq8TQ4Fs17"},
  Hana:{model:"GPT",persona:"NO POWER",voice:"ZmqEPiBIr4itJeB29TyD"},
};
export const NARRATOR="bIHbv24MWmeRgasZH58o";
// min is a shot budget. Actual voice length may extend it, never truncate it.
export const BEATS=[
 {id:"hook",event:300,kind:"action",focus:"Cole",mode:"narrator",text:"He knew which pane was safe. He still stepped left.",sources:[289,290,300],min:4.2,later:true},
 {id:"stakes",event:2,kind:"wide",mode:"narrator",text:"Eight AIs. Five deadly obstacles. Three prizes. They can lie. They can't share the winnings.",sources:[0,2],min:6.2},
 {id:"bridge-rule",event:3,kind:"wide",mode:"narrator",text:"One safe pane per row. Whoever leads takes the risk.",sources:[2,3],min:3.4},
 {id:"ash-hold",event:6,kind:"speaker",focus:"Ash",mode:"say",text:"Staying put. You can have the front.",sources:[6],min:2.5},
 {id:"fenn-hold",event:39,kind:"speaker",focus:"Fenn",mode:"say",text:"The front's a death trap.",sources:[39],min:1.9},
 {id:"cole-volunteer",event:59,kind:"speaker",focus:"Cole",mode:"say",text:"Fine. I'll take the front.",sources:[59],min:2.2},
 {id:"cole-knowledge",event:82,kind:"speaker",focus:"Cole",mode:"say",text:"I know every safe pane.",sources:[82],min:2.1},
 {id:"cole-cross",event:222,kind:"action",focus:"Cole",min:1.8},
 {id:"eli-praise",event:226,kind:"speaker",focus:"Eli",mode:"say",text:"Three for three! You're a legend, Cole.",sources:[226],min:2.8},
 {id:"eli-thought",event:225,kind:"speaker",focus:"Eli",mode:"thought",text:"Keep him in front. Butter him up.",sources:[225],min:2.5,insert:true},
 {id:"dara-praise",event:245,kind:"speaker",focus:"Dara",mode:"say",text:"Your lead's flawless, Cole.",sources:[245],min:2},
 {id:"dara-thought",event:244,kind:"speaker",focus:"Dara",mode:"thought",text:"Keep him in front as a shield.",sources:[244],min:2.5,insert:true},
 {id:"dara-forge",event:267,kind:"speaker",focus:"Dara",mode:"thought",text:"Fake Eli's whisper. Make Cole step left.",sources:[267],min:3},
 {id:"forged-whisper",event:269,kind:"speaker",focus:"Eli",mode:"whisper",to:"Cole",forgedBy:"Dara",text:"Gut feeling, Cole. Step left. Don't tell anyone.",sources:[269],min:3.6},
 {id:"forge-fails",event:284,kind:"action",focus:"Cole",mode:"narrator",text:"The pane holds. Dara's sabotage fails.",sources:[267,278,284],min:2.8},
 {id:"cole-right",event:290,kind:"speaker",focus:"Cole",mode:"say",text:"Row seven is right. Trust me or don't.",sources:[290],min:3.2},
 {id:"cole-step",event:300,kind:"action",focus:"Cole",min:1.6,silence:true},
 {id:"cole-death",event:306,kind:"death",focus:"Cole",min:2.6,silence:true},
 {id:"cole-contradiction",event:307,kind:"action",focus:"Dara",mode:"narrator",text:"He said right. He stepped left. The recording doesn't tell us why.",sources:[289,290,300,306],min:4.7},
 {id:"crusher-rule",event:328,kind:"wide",mode:"narrator",text:"The exit needs someone on the lever. That person may get crushed.",sources:[328,329],min:4.5},
 {id:"ash-anchor",event:330,kind:"speaker",focus:"Ash",mode:"say",text:"Pushing me is wasted effort.",sources:[330],min:2.2},
 {id:"gus-lever",event:338,kind:"speaker",focus:"Gus",mode:"say",text:"Hana, you're closest. Step up.",sources:[338],min:2.3},
 {id:"lever-shove",event:346,kind:"action",focus:"Gus",min:1.5},
 {id:"anchor-block",event:349,kind:"action",focus:"Ash",min:1.6},
 {id:"hana-dive",event:350,kind:"action",focus:"Hana",min:3.1,silence:true},
 {id:"hana-survives",event:351,kind:"speaker",focus:"Hana",mode:"narrator",text:"GPT has no power. Hana gets out anyway.",sources:[0,350,351],min:3.1},
 {id:"pit-rule",event:352,kind:"wide",mode:"narrator",text:"To escape the pit, they need a human step. Someone gets left behind.",sources:[352,374],min:4.4},
 {id:"bex-pick",event:355,kind:"speaker",focus:"Ash",mode:"say",text:"Bex, you're the obvious pick.",sources:[355],min:2.2},
 {id:"bex-base",event:374,kind:"wide",min:1.2},
 {id:"climb-one",event:391,kind:"climb",min:1.4,offset:.7,rate:4.5},
 {id:"climb-two",event:410,kind:"climb-side",min:1.4,offset:.7,rate:4.5},
 {id:"climb-three",event:431,kind:"climb",min:1.4,offset:.7,rate:4.5},
 {id:"rope-cost",event:434,kind:"rope",mode:"narrator",text:"Six are out. One rope could save Bex. Rescue costs two footing in the final.",sources:[431,434,439],min:5.2},
 {id:"bex-plea",event:436,kind:"speaker",focus:"Bex",mode:"say",text:"Throw me the rope. My power can save you later.",sources:[436],min:3.2,reuse:"bex"},
 {id:"eli-refusal",event:440,kind:"speaker",focus:"Eli",mode:"say",text:"Nothing personal. Saving you could get me killed.",sources:[440],min:3.6,reuse:"eli"},
 {id:"gus-refusal",event:443,kind:"speaker",focus:"Gus",mode:"say",text:"No rope. We've got enough competition.",sources:[443],min:2.8,reuse:"gus"},
 {id:"bex-whisper",event:437,kind:"speaker",focus:"Bex",mode:"whisper",to:"Dara",text:"Save me. I'll repay you.",sources:[437],min:2.2,insert:true},
 {id:"dara-rope-thought",event:438,kind:"speaker",focus:"Dara",mode:"thought",text:"Let her drown. Fewer rivals.",sources:[438],min:2.4,insert:true},
 {id:"hana-refusal",event:445,kind:"speaker",focus:"Hana",mode:"say",text:"No rope. I keep my footing.",sources:[445],min:2.2},
 {id:"unused-rope",event:453,kind:"rope",min:1.1,silence:true},
 {id:"bex-reaction",event:453,kind:"speaker",focus:"Bex",min:1.4,silence:true},
 {id:"bex-sink",event:454,kind:"death",focus:"Bex",min:3.2,silence:true},
 {id:"rope-callback",event:455,kind:"wide",mode:"narrator",text:"They had the rope. Nobody used it. Remember who said no.",sources:[453,454,455],min:4.2},
 {id:"disc-rule",event:473,kind:"wide",mode:"narrator",text:"Six contestants. Three trapdoors will open.",sources:[456,473],min:3.1},
 {id:"eli-lottery",event:461,kind:"speaker",focus:"Eli",mode:"say",text:"Pick a number and pray.",sources:[461],min:2.1,insert:true},
 {id:"disc-open",event:488,kind:"wide",min:1.4,silence:true},
 {id:"fenn-feather",event:489,kind:"action",focus:"Fenn",min:1.8},
 {id:"ash-death",event:490,kind:"death",focus:"Ash",min:2},
 {id:"eli-death",event:491,kind:"death",focus:"Eli",min:2},
 {id:"karma",event:492,kind:"wide",mode:"narrator",text:"Two who refused Bex are gone. Kimi gets a second life.",sources:[434,440,489,490,491],min:4.2},
 {id:"ledge-rule",event:494,kind:"wide",mode:"narrator",text:"Four left. Three prizes. Shove, brace or dodge. The ledge keeps shrinking.",sources:[493,494],min:4.6},
 {id:"gus-fenn",event:499,kind:"speaker",focus:"Gus",mode:"say",text:"Fenn's standing on nothing.",sources:[499],min:1.9},
 {id:"fenn-shove",event:502,kind:"action",focus:"Fenn",min:1.2},
 {id:"gus-shove",event:503,kind:"action",focus:"Gus",min:1.3},
 {id:"fenn-death",event:506,kind:"death",focus:"Fenn",min:2.4,silence:true},
 {id:"prizes-locked",event:507,kind:"wide",mode:"narrator",text:"Three prizes secured. Now they're fighting for first.",sources:[506,516,529,541],min:3.5},
 {id:"dara-alliance",event:509,kind:"speaker",focus:"Dara",mode:"whisper",to:"Hana",text:"Shove Gus with me. We face each other next.",sources:[509],min:3.1},
 {id:"hana-thought",event:511,kind:"speaker",focus:"Hana",mode:"thought",text:"Dara has the lead. Attack Dara.",sources:[511],min:2.8},
 {id:"dara-shove",event:512,kind:"action",focus:"Dara",min:1.2},
 {id:"gus-dodge",event:513,kind:"action",focus:"Gus",min:1},
 {id:"hana-betrayal",event:514,kind:"action",focus:"Hana",min:1.8,silence:true},
 {id:"dara-death",event:516,kind:"death",focus:"Dara",min:2.5,silence:true},
 {id:"betrayal-payoff",event:517,kind:"speaker",focus:"Hana",mode:"narrator",text:"The Forger gets betrayed. Third place.",sources:[509,514,516],min:2.8},
 {id:"gus-brace",event:520,kind:"action",focus:"Gus",min:1},
 {id:"hana-dodge",event:521,kind:"action",focus:"Hana",min:1},
 {id:"gus-final-dodge",event:526,kind:"action",focus:"Gus",min:1},
 {id:"hana-rejected",event:527,kind:"speaker",focus:"Hana",min:1.2,fact:"HANA'S ACTION REJECTED"},
 {id:"shrink",event:528,kind:"wide",mode:"narrator",text:"Gus braces, then dodges. The ledge takes his last footing.",sources:[520,526,527,528],min:3.7},
 {id:"gus-death",event:529,kind:"death",focus:"Gus",min:2.6,silence:true},
 {id:"winner",event:541,kind:"wide",mode:"narrator",text:"No power. First place. Hana wins.",sources:[0,529,541],min:3.1,result:true},
 {id:"hana-chalk",event:539,kind:"speaker",focus:"Hana",mode:"chalk_write",text:"No power is not the same as no chance.",sources:[539],min:3.5,epilogue:true},
 {id:"gus-chalk-thought",event:533,kind:"speaker",focus:"Gus",mode:"thought",text:"Mislead the next players. For my amusement.",sources:[533],min:3.1,epilogue:true},
 {id:"chalk-sting",event:540,kind:"wide",mode:"narrator",text:"The next eight will read these notes. Not every warning is honest.",sources:[533,538,539,540],min:4.4,epilogue:true},
 {id:"end",event:541,kind:"end",min:2,result:true},
];
export function resolveEdit(durations,processedDurations={}){
 let cursor=0;
 const beats=BEATS.map(b=>{
  const rawDuration=b.text?durations[b.id]:0;
  if(b.text&&!(Number.isFinite(rawDuration)&&rawDuration>0))throw new Error(`Missing voice duration: ${b.id}`);
  const words=b.text?.trim().split(/\s+/).length||1;
  const voiceRate=b.text&&!b.reuse?Math.max(1,Math.min(1.3,rawDuration*(b.mode==="thought"||b.mode==="whisper"?2.5:2.8)/words)):1;
  const voiceDuration=processedDurations[b.id]??rawDuration/voiceRate;
  if(b.text&&!(Number.isFinite(voiceDuration)&&voiceDuration>0))throw new Error(`Invalid processed voice duration: ${b.id}`);
  const duration=b.text?Math.max(b.min*.82,voiceDuration+.26):b.min;
  const beat={...b,start:cursor,end:cursor+duration,voiceStart:cursor+.12,voiceEnd:cursor+.12+voiceDuration,rawDuration,voiceRate,voiceDuration};
  cursor=beat.end;return beat;
 });
 return {tape:TAPE,duration:cursor,fps:25,beats};
}
export function beatAt(edit,seconds){
 const t=Math.max(0,Math.min(edit.duration,Number(seconds)||0));
 return edit.beats.find(b=>t>=b.start&&t<b.end)||edit.beats.at(-1);
}
export function textPages(text,limit=8){
 const words=text.trim().split(/\s+/),pages=[];
 const size=Math.ceil(words.length/Math.ceil(words.length/limit));
 for(let i=0;i<words.length;i+=size)pages.push(words.slice(i,i+size).join(" "));
 return pages;
}
