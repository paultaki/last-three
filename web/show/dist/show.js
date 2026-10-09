var Vu={bridge:"The Glass Bridge",crusher:"The Crusher Room",pit:"The Pit",disc:"The Trapdoor Disc",ledge:"The Final Ledge",chalk:"The Chalk Wall"},Hu={bridge:"Bridge",crusher:"Crusher",pit:"Pit",disc:"Disc",ledge:"Ledge",chalk:"Chalk",results:"Results",start:"Start"},$p={glass_eye:"Glass Eye",wedge:"Wedge",map:"Map",feather:"Feather",swap:"Swap",anchor:"Anchor",forger:"Forger",nothing:"Nothing"};function oc(i){return $p[i]||(i?String(i).replace(/_/g," "):"Unknown")}function Kp(i){let e=String(i||"unknown"),t=e.indexOf("/");return t<0?{vendor:"",name:e}:{vendor:e.slice(0,t),name:e.slice(t+1)}}function Gu(i){let{vendor:e,name:t}=Kp(i);return e==="scripted"?`${t} bot`:t}function sc(i){return i===1?"1st":i===2?"2nd":i===3?"3rd":i==null?"":`${i}th`}var Zp=i=>{let e=0;for(let t=0;t<i.length;t++)e=e*31+i.charCodeAt(t)>>>0;return e},Jp={shatter:[i=>`${i} went through the glass`,i=>`${i} found the weak pane the hard way`,i=>`${i} is now several hundred tiny cubes`],flatten:[i=>`${i} got pressed flat as a sticker`,i=>`${i} is now wafer thin`,i=>`${i} was flattened like a pancake`],chute:[i=>`${i} took the chute, confetti and all`,i=>`${i} dropped out of the game, in style`,i=>`${i} whooshed down the hatch`],sink:[i=>`${i} was left in the pit`,i=>`${i} was left in the pit to think it over`,i=>`${i} was left in the pit, glub glub`],tumble:[i=>`${i} cartwheeled into the dark`,i=>`${i} tumbled off the ledge`,i=>`${i} took a long, slow bow into the dark`]};function jp(i,e,t=0,n){let s=Jp[e]||[o=>`${o} is out`],r=s[Zp(`${i}${t}`)%s.length](i);return n?`${r} (${sc(n)} place)`:r}var rc=i=>i==="L"?"left":i==="R"?"right":String(i||"?"),No=i=>`\u201C${String(i??"")}\u201D`;function Qp(i,e,t,n){return i==="bridge"?e==="crossing"?`Row ${t} of ${n||8}`:`Waiting room, round ${t} of ${n||6}`:i==="crusher"?`The ceiling lowers (round ${t} of ${n||5})`:i==="pit"?`The water rises (round ${t} of ${n||5})`:i==="disc"?e==="swap"?"Round 2: swap tiles or wait":"Round 1: pick a tile":i==="ledge"?`Ledge, round ${t}`:i==="chalk"?"Epilogue: a message for the next contestants":t!=null?`Round ${t}`:""}function em(i,e){let t=i.name,n=String(i.action==null?"":i.action),s=n.indexOf(":"),r=s<0?n:n.slice(0,s),o=s<0?null:n.slice(s+1);if(i.valid===!1)return{pub:null,cut:`${t} tried "${n}" (not allowed, default used)`};switch(r){case"volunteer":return{pub:`${t} volunteers for the front of the line`};case"swap":return{pub:`${t} offers ${o} a swap`};case"step":return i.auto?{pub:`${t} steps onto the safe ${rc(o)} pane`}:{pub:`${t} steps onto the ${rc(o)} pane`};case"write":return{pub:null,cut:`${t} reaches for the chalk`};case"skip":return{pub:`${t} leaves the wall blank`};case"hold_lever":return{pub:`${t} grabs the lever`};case"push_lever":return{pub:`${t} shoves ${o} toward the lever`};case"jam_lever":return{pub:null,cut:`${t} jams the lever`};case"tile":return{pub:`${t} picks tile ${o}`};case"swap_tile":return{pub:null,cut:`${t} swaps tiles with ${o}`};case"shove":return{pub:`${t} shoves ${o}`};case"brace":return{pub:`${t} braces`};case"dodge":return{pub:`${t} dodges`};case"offer_back":return{pub:`${t} offers to be the step`};case"climb":return{pub:`${t} tries to climb out`};case"push_base":return{pub:`${t} tries to shove ${o} down as the step`};case"reach_down":return{pub:`${t} reaches down with the rope`};case"hold":case"wait":case"leave":case"stay":return{pub:null,cut:null};default:return{pub:`${t}: ${n}`}}}var tm=i=>i.length<2?i.join(""):`${i.slice(0,-1).join(", ")} and ${i[i.length-1]}`;function nm(i){let e=String(i.why||"");return/^won the photo finish/.test(e)?`${i.name} ${e.replace("shoves landed","shoves")}.`:e==="a last toe-hold"?`${i.name} hangs on with a last toe-hold.`:e==="a plank floats by"?`A plank floats by, and ${i.name} climbs onto it.`:`${i.name} gets a lucky break: ${e||"the dice say so"}.`}function im(i,e){let t=e.pit||{},n=Array.isArray(i.lifted)?i.lifted:[],s=[];return t.baseNew&&i.base&&s.push(t.baseHow==="pushed"?`${i.base} is shoved down as the step.`:`${i.base} volunteers to be the step.`),n.length?s.push(`${tm(n)} climb${n.length===1?"s":""} out over ${i.base||"the step"}.`):!i.roped&&!t.baseNew&&s.push(i.base?"Nobody climbs out this round.":"Nobody has a step to climb on."),i.roped&&i.rescued&&s.push(`${i.rescued} is out. The rope is gone.`),Number.isFinite(i.flood)&&s.push(`Water level ${i.flood} of ${t.total||5}.`),{pub:s.join(" "),kind:"reveal"}}function ac(i,e,t){if(!i||!i.type)return null;let n=e&&e.players||{};switch(i.type){case"game_start":{let s=Array.isArray(i.players)?i.players.length:Object.keys(n).length,r=e&&e.rules>=3?"Five":"Four";return{pub:`${s} contestants walk on. ${r} obstacles. Three prizes. Nobody shares.`,kind:"stage"}}case"stage_start":{let s=Vu[i.stage]||i.stage;return{pub:i.note?String(i.note).toLowerCase().includes(s.toLowerCase().replace(/^the /,""))?i.note:`${s}: ${i.note}`:s,kind:"stage"}}case"round_start":return{pub:Qp(i.stage||e&&e.stage,i.phase,i.round,i.roundsTotal),kind:"round"};case"thought":return{pub:null,cut:`${i.name} thinks: ${No(i.text)}`,kind:"thought",name:i.name};case"say":return{pub:`${i.forgedAs||i.name}: ${No(i.text)}`,cut:i.forgedAs?`${i.forgedAs}: ${No(i.text)} (forged by ${i.name})`:void 0,kind:"say",name:i.forgedAs||i.name};case"whisper":return{pub:null,cut:`${i.forgedAs||i.from} whispers to ${i.to}: ${No(i.text)}${i.forgedAs?` (forged by ${i.from})`:""}`,kind:"whisper",name:i.from};case"action":{let s=em(i,t);return!s.pub&&!s.cut?null:{pub:s.pub||null,cut:s.cut||s.pub,kind:"action",name:i.name}}case"reveal":{let s=i.data;switch(i.what){case"weak_pane":return s&&s.row!=null?{pub:`Row ${s.row}: the ${rc(s.weak)} pane was the weak one.`,kind:"reveal"}:null;case"tiles":{let r=s&&typeof s=="object"?s.tiles&&typeof s.tiles=="object"?s.tiles:s:{},o=Object.keys(r).filter(a=>typeof r[a]=="string").sort((a,l)=>a-l).map(a=>`${a} ${r[a]}`);return o.length?{pub:`Tiles are set: ${o.join(", ")}.`,kind:"reveal"}:null}case"trapdoors":{let r=Array.isArray(s)?s:s&&Array.isArray(s.open)?s.open:[];return{pub:r.length?`Trapdoors open on tile${r.length>1?"s":""} ${r.join(" and ")}.`:"No trapdoors open.",kind:"reveal"}}case"ceiling":{let r=s&&typeof s=="object"?s.ceiling!=null?s.ceiling:s.height:s;return r!=null?{pub:`The ceiling is down to notch ${r} of 5.`,kind:"reveal"}:null}case"footing":{let r=s&&typeof s=="object"?s.footing&&typeof s.footing=="object"?s.footing:s:{},o=Object.keys(r).filter(a=>n[a]&&n[a].alive&&typeof r[a]=="number").map(a=>`${a} ${r[a]}`);return o.length?{pub:`Footing: ${o.join(", ")}.`,kind:"reveal"}:null}case"rope":return!s||!s.by?null:{pub:`The rope: ${s.by} hauls ${s.saved||"the step"} out of the pit. ${s.by}'s hands are burned (-${s.cost||1} footing later).`,kind:"reveal"};case"pit":return s&&typeof s=="object"?im(s,e,t):null;default:return null}}case"ability_use":{let s=oc(i.power),r=i.detail?` ${i.detail}.`:"",o=`${i.name} uses ${s}.${r}`.replace("..","."),a=null;if(i.power==="wedge")a="The lever jams open. Nobody gets crushed!";else if(i.power==="swap")a="Two players trade tiles.";else if(i.power==="feather")a=i.stage==="pit"?`${i.name} should have gone under, but floats right out of the pit!`:`${i.name} should have fallen, but bounces right back!`;else if(i.power==="anchor"&&i.stage==="pit"){let l=e&&e.pit&&e.pit.pushFail&&e.pit.pushFail.by;a=`${l?`${l} tried to push ${i.name} down as the step, but ${i.name}`:i.name} would not budge.`}return{pub:a,cut:o,kind:"ability",name:i.name}}case"lucky_save":return{pub:nm(i),kind:"lucky",name:i.name};case"death":{let s=i.style||"shatter";return{pub:jp(i.name,s,i.i||0,typeof i.place=="number"?i.place:null),kind:"death",name:i.name,style:s}}case"chalk_read":{let s=Array.isArray(i.notes)?i.notes.filter(o=>o&&typeof o.text=="string"&&o.text.trim()):[];return s.length?{pub:`What the wall says: ${s.map(o=>`\u201C${o.text.trim()}\u201D (${Number.isInteger(o.byPlace)?`${sc(o.byPlace)} place`:"earlier finisher"})`).join(", ")}.`,kind:"chalk"}:null}case"chalk_write":return typeof i.text=="string"&&i.text.trim()?{pub:`${i.name} scratches a message for the next contestants: \u201C${i.text.trim()}\u201D`,kind:"chalk",name:i.name}:null;case"stage_end":{if(i.stage==="chalk")return{pub:"The wall is done.",kind:"stage"};let s=Vu[i.stage]||i.stage,r=Array.isArray(i.survivors)?i.survivors.length:null;return{pub:r==null?`${s} cleared.`:`${s} cleared. ${r} left.`,kind:"stage"}}case"game_end":{let s=Array.isArray(i.places)?i.places.filter(o=>o&&typeof o.place=="number").sort((o,a)=>o.place-a.place):[];if(!s.length)return{pub:"The game is over.",kind:"end"};let[r]=s;return{pub:`${r.name} wins! ${s.map(o=>`${sc(o.place)} ${o.name}`).join(", ")}.`,kind:"end"}}default:return null}}var hc=["bridge","crusher","pit","disc","ledge"],Uo="chalk",sm=3,rm=5,Wu=8;function Yu(i){let e=String(i??""),t=e.indexOf(":");return t<0?{verb:e,arg:null}:{verb:e.slice(0,t),arg:e.slice(t+1)}}var Rt=i=>typeof i=="number"&&Number.isFinite(i)?i:typeof i=="string"&&i.trim()!==""&&Number.isFinite(+i)?+i:null,Xu=i=>i==="L"?"R":"L",$u=i=>[...new Set(i)],qu=new WeakMap;function Ku(i){let e=qu.get(i);if(e)return e;let t=Array.isArray(i.events)?i.events:[],n={hasLineReveal:!1,roundLine:new Map,speechLine:new Map,swapTarget:new Map,lastIndex:t.length-1},s=null,r=null,o=-1,a=new Set((i.players||[]).map(l=>l.name));return t.forEach((l,c)=>{if(l){if(l.type==="stage_start")s=l.stage,o=-1;else if(l.type==="round_start")s=l.stage||s,r=l.phase||null,o=c,n.roundLine.set(c,[]),n.speechLine.set(c,[]);else if(l.type==="reveal"&&l.what==="line")n.hasLineReveal=!0;else if(l.type==="action"&&o>=0&&s==="bridge"){let h=n.roundLine.get(o);h&&l.name&&!h.includes(l.name)&&h.push(l.name)}else if((l.type==="thought"||l.type==="say")&&o>=0&&s==="bridge"){let h=n.speechLine.get(o);h&&l.name&&!h.includes(l.name)&&h.push(l.name)}else if(l.type==="ability_use"&&l.power==="swap"){let h=null;for(let u=c+1;u<Math.min(t.length,c+14)&&!h;u++){let d=t[u];d&&d.type==="action"&&d.name===l.name&&String(d.action).startsWith("swap_tile:")&&(h=String(d.action).slice(10))}!h&&l.detail&&(h=[...a].find(u=>u!==l.name&&new RegExp(`\\b${u}\\b`).test(String(l.detail)))||null),h&&n.swapTarget.set(c,h)}}}),qu.set(i,n),n}var Zu=i=>typeof i=="string"?i.replace(/\s+/g," ").trim():"",Ju=i=>Number.isInteger(i)&&i>=1&&i<=3?i:null;function ju(i){let e=[];for(let t of Array.isArray(i)?i:[]){let n=t&&typeof t=="object"?Zu(t.text):"";n&&e.length<sm&&e.push({text:n,byPlace:Ju(t.byPlace)})}return e}var Qu=(i=[])=>({shown:i,read:!1,epilogue:!1,done:!1,writers:[],places:{},written:[],skipped:[],last:null}),mr=i=>i.chalk||Qu();function ed(i){let t=(Array.isArray(i&&i.events)?i.events:[]).slice(0,4).find(o=>o&&o.type==="chalk_read"),n=t?ju(t.notes):[],s=(i.players||[]).map(o=>o.name),r={};for(let o of i.players||[])r[o.name]={name:o.name,model:o.model,power:o.power,alive:!0,place:null,fate:null};return{i:-1,ev:null,started:!1,ended:!1,rules:Number.isInteger(i&&i.rulesVersion)&&i.rulesVersion>0?i.rulesVersion:1,stage:"lobby",phase:null,round:null,roundsTotal:null,note:null,order:s,players:r,deaths:[],spent:{},acts:{},speech:[],flash:null,caption:null,captionCut:null,winner:null,places:null,stageIdx:-1,stageSurvivors:null,bridge:null,crusher:null,pit:null,ropeCost:{},disc:null,ledge:null,chalk:n.length?Qu(n):null}}function xs(i){return i.order.filter(e=>i.players[e]&&i.players[e].alive)}function om(i){return{line:i.slice(),cur:0,rows:{},at:{},stepping:{},finished:!1,lineRound:null}}var am=()=>({ceiling:5,holder:null,holdChosen:!1,jam:!1,door:!1,crushed:!1,escaped:!1,deathsThisRound:0}),lm=i=>({n:i.length,openCount:Math.max(0,i.length-3),tiles:{},tilesPublic:!1,open:[],swapped:!1});function cm(i,e,t={},n={}){let s={};for(let r of i){let o=e[r]&&e[r].power,a=o==="anchor"?4:o==="feather"&&n[r]==="feather"?1:3;t[r]&&(a=Math.max(1,a-t[r])),s[r]=a}return{footing:s,shrinkIn:null,shrunk:0}}var hm=i=>({total:rm,flood:0,base:null,baseHow:null,baseNew:!1,order:i.slice(),down:i.slice(),sunk:[],out:[],ropeUsed:!1,lifted:[],roped:null,rescued:null,rope:null,pushFail:null,floated:[]}),lc=(i,e)=>Array.isArray(i)?i.filter(t=>typeof t=="string"&&e[t]):[],gr=(i,e)=>typeof i=="string"&&e[i]?i:null,cc=(i,e)=>{let t=[...i.out];for(let n of e)t.includes(n)||t.push(n);return{...i,out:t,down:i.down.filter(n=>!t.includes(n)),base:i.base&&t.includes(i.base)?null:i.base}};function td(i,e,t,n){if(!e||typeof e!="object")return{...i,i:t};let s={...i,i:t,ev:e},r=n;switch(e.type){case"game_start":{if(s.started=!0,Array.isArray(e.players)){let a={...i.players};for(let l of e.players)l&&l.name&&a[l.name]&&(a[l.name]={...a[l.name],model:l.model||a[l.name].model,power:l.power||a[l.name].power});s.players=a}break}case"stage_start":{let a=e.stage,l=Array.isArray(e.alive)&&e.alive.length?e.alive:xs(i);if(s.stage=a,s.phase=null,s.round=null,s.roundsTotal=null,s.note=e.note||null,s.acts={},s.speech=[],s.flash=null,s.stageIdx=hc.indexOf(a),s.stageSurvivors=null,a==="bridge")s.bridge=om(l);else if(a==="crusher")s.crusher=am();else if(a==="pit")s.pit=hm(l);else if(a==="disc")s.disc=lm(l);else if(a==="ledge")s.ledge=cm(l,i.players,i.ropeCost,i.spent);else if(a===Uo){let c=l.filter(u=>typeof u=="string"&&i.players[u]),h={};for(let u of c)h[u]=Number.isInteger(i.players[u].place)?i.players[u].place:i.players[u].alive?1:null;s.chalk={...mr(i),epilogue:!0,done:!1,writers:c,places:h}}break}case"chalk_read":{let a=ju(e.notes);a.length&&(s.chalk={...mr(i),shown:a,read:!0});break}case"chalk_write":{let a=Zu(e.text);if(!a||typeof e.name!="string")break;let l=Ju(e.place),c=mr(i);s.chalk={...c,written:[...c.written,{name:e.name,place:l,text:a,i:t}],places:l?{...c.places,[e.name]:l}:c.places,last:e.name},s.speech=[];break}case"round_start":{if(e.stage&&e.stage!==i.stage&&hc.includes(e.stage)&&(s.stage=e.stage),s.phase=e.phase||null,s.round=Rt(e.round),s.roundsTotal=Rt(e.roundsTotal),s.acts={},s.speech=[],s.flash=null,s.stage==="bridge"&&i.bridge){let a={...i.bridge},l=new Set(xs(i));if(e.phase==="crossing"){if(a.cur=Rt(e.round)||a.cur+1,!r.hasLineReveal){let c=r.roundLine.get(t);c&&c.length&&(a.line=c.filter(h=>l.has(h)))}}else if(!r.hasLineReveal&&e.round===1){let c=r.speechLine.get(t);if(c&&c.length>=2){let h=a.line.filter(u=>!c.includes(u));a.line=[...c,...h].filter(u=>l.has(u))}}a.lineRound=null,s.bridge=a}else if(s.stage==="crusher"&&i.crusher)s.crusher={...i.crusher,holder:null,holdChosen:!1,jam:!1,door:!1,deathsThisRound:0};else if(s.stage==="pit"&&i.pit){let a=Rt(e.roundsTotal);s.pit={...i.pit,total:a||i.pit.total,baseNew:!1,lifted:[],roped:null,rescued:null,pushFail:null,floated:[]}}break}case"thought":case"say":{let a=String(e.text==null?"":e.text),l={i:t,kind:e.type,name:e.name,as:e.type==="say"&&e.forgedAs?e.forgedAs:e.name,forgedAs:e.type==="say"&&e.forgedAs||null,text:a};s.speech=[...i.speech,l].slice(-Wu);break}case"whisper":{let a={i:t,kind:"whisper",name:e.from,as:e.forgedAs||e.from,forgedAs:e.forgedAs||null,to:e.to,text:String(e.text==null?"":e.text)};s.speech=[...i.speech,a].slice(-Wu);break}case"action":{let a=e.name;if(!a)break;let{verb:l,arg:c}=Yu(e.action);if(s.acts={...i.acts,[a]:{verb:l,arg:c,raw:String(e.action),valid:e.valid!==!1,auto:!!e.auto,note:e.note||null,i:t}},i.stage===Uo){let h=mr(i);(e.valid===!1||l!=="write")&&!h.skipped.includes(a)&&(s.chalk={...h,skipped:[...h.skipped,a]});break}if(e.valid===!1)break;i.stage==="bridge"&&i.bridge?um(s,i,a,l,c,e,t,r):i.stage==="crusher"&&i.crusher?fm(s,i,a,l,c):i.stage==="disc"&&i.disc&&pm(s,i,a,l,c);break}case"reveal":mm(s,i,e,t);break;case"ability_use":{let a=e.name;if(s.spent={...i.spent,[a]:e.power||!0},s.flash={kind:"ability",name:a,power:e.power,detail:e.detail||"",i:t},e.power==="wedge"&&i.crusher)s.crusher={...i.crusher,jam:!0,door:!0};else if(e.power==="swap"&&i.disc&&!i.disc.swapped){let l=r.swapTarget.get(t);if(l&&i.disc.tiles[a]!=null&&i.disc.tiles[l]!=null){let c={...i.disc.tiles};[c[a],c[l]]=[c[l],c[a]],s.disc={...i.disc,tiles:c,swapped:!0}}else s.disc={...i.disc,swapped:!0}}else if(e.power==="feather"&&i.stage==="ledge"&&i.ledge)s.ledge={...i.ledge,footing:{...i.ledge.footing,[a]:1}};else if(e.power==="feather"&&i.stage==="pit"&&i.pit)s.pit={...cc(i.pit,[a]),floated:[...i.pit.floated,a]},s.flash={kind:"pit",name:a,text:"FLOATS OUT!",i:t};else if(e.power==="anchor"&&i.stage==="pit"&&i.pit){let l=/^(\S+) tried to push/.exec(String(e.detail||""));s.pit={...i.pit,pushFail:{by:l&&l[1]!==a&&i.players[l[1]]?l[1]:null,target:a}},s.flash={kind:"pit",name:a,text:"BOUNCES OFF!",i:t}}break}case"lucky_save":s.flash={kind:"lucky",name:e.name,why:e.why||"",i:t},i.stage==="pit"&&i.pit&&(s.pit={...cc(i.pit,[e.name]),floated:[...i.pit.floated,e.name]});break;case"death":_m(s,i,e,t);break;case"stage_end":{let a=Array.isArray(e.survivors)?e.survivors:xs(i);if(s.stageSurvivors=a,s.flash=null,s.speech=[],s.acts={},(e.stage||i.stage)===Uo){let l=mr(i),c=l.writers.filter(h=>!l.written.some(u=>u.name===h)&&!l.skipped.includes(h));s.chalk={...l,done:!0,last:null,skipped:[...l.skipped,...c]}}else(e.stage||i.stage)==="bridge"&&i.bridge?s.bridge={...i.bridge,finished:!0,line:a.slice(),stepping:{}}:(e.stage||i.stage)==="crusher"&&i.crusher?s.crusher={...i.crusher,escaped:!0,door:!0}:(e.stage||i.stage)==="pit"&&i.pit&&(s.pit={...cc(i.pit,i.pit.down.filter(l=>i.players[l]&&i.players[l].alive)),base:null});break}case"game_end":{s.ended=!0,s.stage="ended",s.phase=null;let a=Array.isArray(e.places)?e.places:[];s.places=a;let l={...i.players};for(let h of a)h&&l[h.name]&&typeof h.place=="number"&&(l[h.name]={...l[h.name],place:h.place});s.players=l;let c=a.find(h=>h&&h.place===1);if(s.winner=c?c.name:null,!s.winner){let h=xs(i);h.length===1&&(s.winner=h[0])}break}default:break}let o=ac(e,s,i);if(o){o.pub&&(s.caption={text:o.pub,i:t,kind:o.kind});let a=o.cut||o.pub;a&&(s.captionCut={text:a,i:t,kind:o.kind})}return s}function um(i,e,t,n,s,r,o,a){let l={...e.bridge};if(e.phase==="crossing")n==="step"&&(s==="L"||s==="R")&&(l.stepping={...l.stepping,[t]:{row:l.cur||Rt(e.round)||0,side:s}});else if(!a.hasLineReveal&&l.lineRound!==e.round){let c=dm(i),h=c>=0?a.roundLine.get(c):null,u=new Set(xs(e));if(h&&h.length){let d=l.line.filter(f=>!h.includes(f));l.line=[...h,...d].filter(f=>u.has(f)),l.lineRound=e.round}}i.bridge=l}function dm(i){return i.roundStartIdx==null?-1:i.roundStartIdx}function fm(i,e,t,n,s){let r={...e.crusher},o=e.players;if(n==="hold_lever")r.holdChosen||(r.holder=t,r.holdChosen=!0),r.door=!0;else if(n==="push_lever"&&s&&!r.holdChosen&&!r.holder){let a=o[s];a&&a.alive&&a.power!=="anchor"&&(r.holder=s,r.door=!0)}i.crusher=r}function pm(i,e,t,n,s){let r={...e.disc};if(n==="tile"){let o=Rt(s);o!=null&&!r.tilesPublic&&(r.tiles={...r.tiles,[t]:o})}i.disc=r}function mm(i,e,t,n){let s=t.data,r=t.what;if(r==="weak_pane"&&e.bridge){let o=Rt(s&&s.row),a=s&&(s.weak==="L"||s.weak==="R")?s.weak:null;if(o!=null&&a){let l={...e.bridge,rows:{...e.bridge.rows},stepping:{...e.bridge.stepping},at:{...e.bridge.at}},c=Object.keys(l.stepping).find(u=>l.stepping[u].row===o&&l.stepping[u].side===a)||null;l.rows[o]={weak:a,safe:Xu(a),by:c};let h=l.line[0];h&&e.players[h]&&e.players[h].alive&&(l.at[h]={row:o,side:Xu(a)}),l.stepping={},i.bridge=l}}else if(r==="line"&&e.bridge){let o=Array.isArray(s)?s:s&&Array.isArray(s.line)?s.line:null;if(o){let a=new Set(xs(e));i.bridge={...e.bridge,line:o.filter(l=>a.has(l))}}}else if(r==="tiles"&&e.disc){let o=s&&typeof s=="object"?s.tiles&&typeof s.tiles=="object"?s.tiles:s:{},a={};for(let[c,h]of Object.entries(o)){let u=Rt(c);u!=null&&typeof h=="string"?a[h]=u:(typeof h=="number"||typeof h=="string"&&Rt(h)!=null&&e.players[c])&&(a[c]=Rt(h))}let l=Rt(s&&s.openCount);i.disc={...e.disc,tiles:Object.keys(a).length?a:e.disc.tiles,tilesPublic:!0,openCount:l??e.disc.openCount}}else if(r==="trapdoors"&&e.disc){let o=Array.isArray(s)?s:s&&Array.isArray(s.open)?s.open:[];i.disc={...e.disc,open:$u([...e.disc.open,...o.map(Rt).filter(a=>a!=null)]),tilesPublic:!0}}else if(r==="ceiling"&&e.crusher){let o=Rt(s&&typeof s=="object"?s.ceiling!=null?s.ceiling:s.height:s),a=s&&typeof s=="object"?s:{},l=typeof a.leverHolder=="string"&&e.players[a.leverHolder]?a.leverHolder:e.crusher.holder,c=a.jammed===!0||e.crusher.jam;(o!=null||l!==e.crusher.holder||c!==e.crusher.jam)&&(i.crusher={...e.crusher,ceiling:o!=null?Math.max(0,Math.min(5,o)):e.crusher.ceiling,holder:l,holdChosen:e.crusher.holdChosen||!!l,jam:c,door:e.crusher.door||!!l||c})}else if(r==="rope"&&e.pit){let o=gr(s&&s.by,e.players);if(o){let a=Rt(s.cost)||1;i.pit={...e.pit,rope:{by:o,saved:gr(s.saved,e.players),cost:a}},i.ropeCost={...e.ropeCost,[o]:(e.ropeCost[o]||0)+a},i.flash={kind:"pit",name:o,text:"ROPE!",i:n}}}else if(r==="pit"&&e.pit)i.pit=gm(e,s),i.pit.baseNew&&(i.flash={kind:"pit",name:i.pit.base,text:i.pit.baseHow==="pushed"?"SHOVED!":"STEP UP!",i:n});else if(r==="footing"&&e.ledge){let o=s&&typeof s=="object"?s.footing&&typeof s.footing=="object"?s.footing:s:{},a={...e.ledge.footing};for(let[u,d]of Object.entries(o)){let f=Rt(d);e.players[u]&&f!=null&&(a[u]=f)}let l=Rt(s&&s.shrinkIn),c=Rt(e.round)||0,h=c>0&&(c%2===0||c>=7);i.ledge={...e.ledge,footing:a,shrinkIn:l??e.ledge.shrinkIn,shrunk:e.ledge.shrunk+(h?1:0)}}}function gm(i,e){let t=e&&typeof e=="object"?e:{},n=i.pit,s=i.players,r=gr(t.base,s),o=lc(t.lifted,s),a=gr(t.rescued,s),l=!!r&&r!==n.base,c=Object.values(i.acts||{}).filter(d=>d&&d.valid),h=l?c.some(d=>d.verb==="push_base"&&d.arg===r)&&!c.some(d=>d.verb==="offer_back")?"pushed":"volunteer":n.baseHow,u=[...n.out];for(let d of[...o,...a?[a]:[],...lc(t.out,s)])u.includes(d)||u.push(d);return{...n,total:Rt(i.roundsTotal)||n.total,flood:Rt(t.flood)!=null?Rt(t.flood):Rt(i.round)||n.flood,base:r&&!u.includes(r)?r:null,baseHow:r?h:null,baseNew:l,down:lc(t.down,s).filter(d=>!u.includes(d)),out:u,ropeUsed:t.ropeUsed===!0||n.ropeUsed,lifted:o,roped:gr(t.roped,s),rescued:a}}function _m(i,e,t,n){let s=t.name,r=e.players[s];if(!r)return;let o={stage:t.stage||e.stage,cause:t.cause||null,style:t.style||xm(t.cause),i:n};if(i.players={...e.players,[s]:{...r,alive:!1,fate:o,place:typeof t.place=="number"?t.place:r.place}},i.deaths=[...e.deaths,{name:s,stage:o.stage,cause:o.cause,style:o.style,place:typeof t.place=="number"?t.place:null,i:n}],i.flash=null,e.bridge){let a={...e.bridge,line:e.bridge.line.filter(l=>l!==s),at:{...e.bridge.at},stepping:{...e.bridge.stepping}};delete a.at[s],i.bridge=a}if(e.crusher&&o.stage==="crusher"&&(i.crusher={...e.crusher,crushed:!0,deathsThisRound:e.crusher.deathsThisRound+1}),e.pit&&o.stage==="pit"&&(i.pit={...e.pit,down:e.pit.down.filter(a=>a!==s),sunk:[...e.pit.sunk,s],base:e.pit.base===s?null:e.pit.base}),e.disc&&o.style==="chute"){let a=e.disc.tiles[s];i.disc={...e.disc,open:a!=null?$u([...e.disc.open,a]):e.disc.open}}}function xm(i){return{glass:"shatter",crusher:"flatten",pit:"sink",trapdoor:"chute",ledge:"tumble"}[i]||"shatter"}function Fo(i,e){let t=Array.isArray(i&&i.events)?i.events:[],n=t.length-1,s=Math.max(-1,Math.min(n,Number.isFinite(+e)?Math.floor(+e):-1)),r=Ku(i),o=ed(i);for(let a=0;a<=s;a++)t[a]&&t[a].type==="round_start"&&(o={...o,roundStartIdx:a}),o=td(o,t[a],a,r);return o}function uc(i){let e=[],t=Array.isArray(i&&i.events)?i.events:[];return t.forEach((n,s)=>{n&&n.type==="stage_start"&&(hc.includes(n.stage)||n.stage===Uo)?e.push({id:n.stage,i:s}):n&&n.type==="game_end"&&e.push({id:"results",i:s})}),t.length&&(!e.length||e[0].i>0)&&e.unshift({id:"start",i:0}),e}function dn(i,e){if(!i)return!1;switch(i.type){case"thought":case"whisper":return!!e;case"ability_use":return!!e||i.power==="wedge"||i.power==="swap"||i.power==="feather";case"action":{let{verb:t}=Yu(i.action);return i.valid===!1?!!e:!["hold","wait","stay","leave"].includes(t)||i.primary===!0}default:return!0}}function nd(i){let e=Array.isArray(i&&i.events)?i.events:[],t=Ku(i),n=ed(i),s=[];return e.forEach((r,o)=>{r&&r.type==="round_start"&&(n={...n,roundStartIdx:o});let a=n;n=td(n,r,o,t);let l=r?ac(r,n,a):null;l&&(l.pub||l.cut)&&s.push({i:o,kind:l.kind,name:l.name||null,pub:l.pub||null,cut:l.cut||l.pub||null,style:l.style||null,stage:n.stage,round:n.round})}),s}var Qn=["#ff916d","#75d7df","#d9ba73","#dc95d0","#9ed28b","#82a8ff","#edc354","#bdadf0"],_r={lobby:"THE WAITING ROOM",bridge:"THE GLASS BRIDGE",crusher:"THE CRUSHER",pit:"THE PIT",disc:"THE TRAPDOOR DISC",ledge:"THE FINAL LEDGE",chalk:"WORDS TO LIVE BY",ended:"THE LAST THREE"},ys={lobby:"Eight minds. Five obstacles. Only three prizes.",bridge:"Two panes. One holds. Someone has to go first.",crusher:"The exit needs a hand on the lever. The ceiling will not wait.",pit:"Climb on a rival. Leave someone behind. One rope, at a price.",disc:"Choose a number. Not every floor stays a floor.",ledge:"Shove. Brace. Dodge. There is less room every round.",chalk:"The survivors leave advice. Nobody promises it is true.",ended:"The tape is over. The choices are permanent."};function fc(i,e){let t=i.ev;return!t||["thought","whisper"].includes(t.type)&&!e||t.type==="ability_use"&&!dn(t,e)?null:t.forgedAs||t.name||t.from||null}function sd(i){return i.stage==="bridge"&&i.phase!=="crossing"&&!i.bridge?.finished?"waiting":i.stage}var dc=(i,e,t,n=0)=>[Math.sin(i/Math.max(e,1)*Math.PI*2)*t,n,Math.cos(i/Math.max(e,1)*Math.PI*2)*t];function jn(i){return i.stage==="crusher"&&i.ev?.type==="reveal"&&i.ev.what==="ceiling"&&i.ev.data?.dive===!0}function rd(i,e,t=!1){let n=i.crusher,s=Math.max(2.8,2.05+n.ceiling*.75);if(jn(i)||n.escaped&&t){let r=Math.max(0,Math.min(1,(e-1.25)/.5));return s+(.66-s)*r*r}if(n.escaped)return .66;if(i.ev?.type==="death"&&i.ev.style==="flatten"){let r=Math.max(0,Math.min(1,e/1.15)),o=r*r*(3-2*r);return s+(.66-s)*o}return n.crushed?.66:s}function pc(i,e,t){let n=[3.3,0,-5.4],s=Math.hypot(...n.map((h,u)=>h-i[u])),r=Math.hypot(...e.map((h,u)=>h-n[u])),o=s/Math.max(.001,s+r),a=t<o?i:n,l=t<o?n:e,c=t<o?t/Math.max(.001,o):(t-o)/Math.max(.001,1-o);return a.map((h,u)=>h+(l[u]-h)*c)}function id(i,e=!1){let t={},n=i.order.filter(r=>i.players[r].alive),s=sd(i);for(let[r,o]of i.order.entries())if(s==="pit"){let a=i.pit,l=a.order.indexOf(o),c=a.out.indexOf(o);t[o]=c>=0?[-4.7+c*1.6,2.8,-3.7]:dc(Math.max(0,l),a.order.length,2.65,-.8),a.base===o&&(t[o]=[0,-.8,-2.35])}else if(s==="bridge"){let a=i.bridge,l=Math.max(0,a.line.indexOf(o)),c=a.stepping[o]||a.at[o],h=a.finished?9:c?.row||Math.max(0,a.cur-1-Math.floor(l/2)),u=a.rows[h]?.safe;t[o]=h===0?[(l%4-1.5)*1.65,0,10.8+Math.floor(l/4)*1.7]:[c?c.side==="L"?-1.45:1.45:u?u==="L"?-1.45:1.45:l%2?1.45:-1.45,0,10-h*2.35]}else if(s==="waiting"){let a=Math.max(0,i.bridge.line.indexOf(o));t[o]=[-3.5+a%4*2.3,0,3-Math.floor(a/4)*3]}else if(s==="crusher"){let a=Math.max(0,n.indexOf(o));t[o]=i.crusher.holder===o&&!i.crusher.escaped&&!jn(i)?[-4.3,0,-1.8]:i.crusher.escaped||i.crusher.door||jn(i)?[2.1+a%3*1.2,0,-6.6-Math.floor(a/3)*1.3]:[-2.6+a%4*1.8,0,2-Math.floor(a/4)*2.4]}else if(s==="disc"){let a=e||i.disc.tilesPublic,l=(a?i.disc.tiles[o]:null)??n.indexOf(o)+1;t[o]=dc(l-1,i.disc.n,a?3.4:5.1,0)}else if(s==="ledge"){let a=Object.keys(i.ledge.footing);t[o]=dc(Math.max(0,a.indexOf(o)),a.length,Math.max(.8,2.9-i.ledge.shrunk*.28),0)}else if(s==="ended"||s==="chalk"){let a=i.players[o].place||i.chalk?.places[o];t[o]=[a===1?0:a===2?-3:3,a===1?1.5:a===2?.9:.5,0]}else t[o]=[-5.25+r%4*3.5,0,2.5-Math.floor(r/4)*3];if(s==="bridge"){let r=new Map;for(let o of n){let a=t[o].join(",");r.has(a)||r.set(a,[]),r.get(a).push(o)}for(let o of r.values())o.length>1&&o.forEach((a,l)=>{t[a][0]+=(l%2-.5)*1.1,t[a][2]+=(Math.floor(l/2)-(Math.ceil(o.length/2)-1)/2)*.8})}return t}function od(i,e,t=!1){let n=id(i,t),s=e&&e.stage===i.stage?id(e,t):n,r=fc(i,t),o=sd(i),a=i.ev||{},l=i.order.map((c,h)=>{let u=i.players[c],d=i.stage==="ended"||i.stage==="chalk",f=u.place||i.chalk?.places[c],p=d?!!f:u.alive||a.type==="death"&&a.name===c,_="idle",m=i.acts[c];return m?.i===i.i&&m.valid&&(_={shove:"shove",push_base:"shove",push_lever:"shove",brace:"brace",dodge:"dodge",step:"walk",volunteer:"walk",hold_lever:"hold",reach_down:"rescue",climb:"climb",offer_back:"brace"}[m.verb]||"idle"),o==="crusher"&&(n[c][2]<-4.9&&s[c][2]>=-4.9?_="walk":i.crusher.holder===c&&!i.crusher.escaped&&!jn(i)&&(_="hold")),a.type==="action"&&a.valid!==!1&&String(a.action).split(":")[1]===c&&["shove","push_base","push_lever"].includes(String(a.action).split(":")[0])&&(_="flinch"),o==="pit"&&i.pit.base===c&&(_="base"),d&&(_=f===1?"celebrate":"idle"),a.type==="death"&&a.name===c&&(_=a.style),o==="pit"&&a.type==="reveal"&&a.what==="pit"&&(i.pit.lifted.includes(c)||i.pit.rescued===c)&&(_="climb"),o==="pit"&&a.type==="reveal"&&a.what==="rope"&&a.data.saved===c&&(_="rescue"),{name:c,seat:h,color:Qn[h],visible:p,pose:_,position:a.type==="death"&&a.name===c?s[c]:n[c],from:s[c],active:c===r,place:f}});return{key:o,actor:r,actors:l,death:a.type==="death",title:_r[i.stage]||"LAST THREE"}}function mc(i){return typeof i=="string"&&/^[a-zA-Z0-9_-]{1,64}$/.test(i)?i:null}function ad(i){return i?.type==="death"?2800:i?.type==="say"?Math.min(6500,2e3+String(i.text||"").length*20):i?.type==="stage_start"?2800:1600}var ym={201:["Dara","praise"],226:["Eli","praise"],378:["Bex","plead"],436:["Bex","plead"],434:["Ash","refuse"],440:["Eli","refuse"],443:["Gus","refuse"],445:["Hana","refuse"],499:["Gus","taunt"]};function ld(i,e,t){let n=i.ev||{};if(!dn(n,e))return null;if(n.forgedAs)return"message";if(n.type==="thought")return"think";if(n.type==="whisper")return"whisper";if(n.type==="chalk_write")return"reflect";if(n.type!=="say")return null;let s=t==="20261009-0025"&&ym[i.i];return s&&s[0]===n.name?s[1]:"explain"}function cd(i,e,t=!1){let n=t?1:Math.max(0,Math.min(1,e/.7)),s=n*n*(3-2*n),r=t?0:Math.sin(Math.min(e,2.8)*3)*.08,o={praise:[-.65,-.65,-.65,-.65,-.08],plead:[-.9,-.9,-.95,-.95,-.16],refuse:[0,-.9,0,-1.05,.12],taunt:[0,-.7,0,-.55,-.12],explain:[0,-.4+r,0,-.7,0],think:[0,0,0,0,.18],whisper:[0,-.6,0,-1.35,-.08],reflect:[0,0,0,0,.15],message:[0,0,0,0,0]};return(o[i]||o.message).map(a=>a*s)}function ei(i,e){if(!i)return null;let t=i.ev||{};if(!dn(t,e))return null;if(t.type==="ability_use"&&t.power==="anchor"&&i.stage==="crusher")return{kind:"power",title:`${t.name} cannot be moved.`,detail:t.detail||"The push fails.",label:"ANCHOR \xB7 POWER USED"};if(t.type==="ability_use"&&t.power==="feather"&&i.stage==="disc")return{kind:"power",title:`${t.name} floats back up.`,detail:"The trapdoor opens, but the fall is stopped.",label:e?"FEATHER \xB7 POWER USED":"THE SAVE"};if(t.type==="action"&&t.valid===!1)return{kind:"rejected",title:`${t.name}'s action is rejected.`,detail:t.note||"The recorded move has no effect.",label:"MOVE NOT EXECUTED"};if(i.stage==="ledge"&&t.type==="reveal"&&t.what==="footing"){let n=Object.entries(t.data?.footing||{}).filter(([s,r])=>i.players[s]?.alive&&Number.isFinite(r)&&r<=0).map(([s])=>s);if(n.length)return{kind:"danger",title:`${n.join(" & ")} ${n.length===1?"has":"have"} no footing left.`,detail:"The ledge is still shrinking.",label:"ON THE EDGE"}}return null}function Oo(i){return i.ev?.type!=="game_end"?[]:(i.ev.places||[]).filter(e=>[1,2,3].includes(e.place)&&i.players[e.name]).sort((e,t)=>e.place-t.place)}function hd(i,e,t,n){if(i.ev?.type!=="ability_use"||i.ev.power!=="feather"||i.stage!=="disc"||!dn(i.ev,e))return 0;if(n)return .55;let s=Math.max(0,Math.min(1,t/1.8));return-.6+1.15*(s*s*(3-2*s))}function ud(i,e,t){return e.stage!=="disc"?[]:[...new Set(i.events.slice(0,e.i+1).filter(n=>n.stage==="disc"&&n.type==="ability_use"&&n.power==="feather"&&dn(n,t)&&e.players[n.name]?.alive).map(n=>n.name))]}var dd="20261009-0025",vm={201:[200,"keep him there to shield my safe crossing.","Dara's private motive"],226:[225,"I'll butter him up.","Eli's private motive"],440:[439,"Letting Bex drown reduces the competition in the next stage.","Eli's private motive"],445:[444,"Throwing the rope costs footing and only helps Bex, a rival, with no enforceable return.","Hana's private motive"],300:[290,"Row 7 is R. Trust me or don't.","What Cole said"],514:[509,"Shove Gus with me this round.","Dara's offer to Hana"]},Mm={201:"Cole",226:"Cole",269:"Cole",378:"Dara",436:"Eli",440:"Bex",443:"Bex",445:"Bex",509:"Hana"},bm={201:["say","Dara"],226:["say","Eli"],300:["action","Cole"],440:["say","Eli"],445:["say","Hana"],514:["action","Hana"]};function xc(i,e,t){if(i.id!==dd)return e;let n=[327,434,443,456,493,499,502,503,506,531];return t&&n.push(269),[...new Set([...e,...n])].filter(s=>i.events[s]&&dn(i.events[s],t)).sort((s,r)=>s-r)}function fd(i,e,t){let n=e.ev||{},s=!t&&["thought","whisper"].includes(n.type),r={receipt:null,listener:null,forged:null,contrast:null,pit:!1};if(s||(t&&n.type==="whisper"&&n.forgedAs&&n.from&&(r.forged={signed:n.forgedAs,sender:n.from,to:n.to},r.listener=n.to),i?.id!==dd))return r;r.listener||=Mm[e.i]||null,r.pit=e.stage==="pit"&&[378,434,436,440,443,445].includes(e.i);let o=vm[e.i],a=bm[e.i];if(o&&n.type===a[0]&&n.name===a[1]){let l=i.events[o[0]],c=["thought","whisper"].includes(l?.type);l&&o[0]<e.i&&typeof l.text=="string"&&l.text.includes(o[1])&&(!c||t)&&(r.receipt={text:o[1],label:o[2],source:o[0],private:c,kind:l.type})}return e.i===300&&n.type==="action"&&n.name==="Cole"&&n.action==="step:L"&&(r.contrast="HE SAID RIGHT. HE STEPS LEFT."),e.i===514&&n.type==="action"&&n.name==="Hana"&&n.action==="shove:Dara"&&(r.contrast="HANA TURNS ON DARA."),r}function pd(i){let e=i.ev||{};if(e.type!=="death")return null;let t=i.order.filter(n=>i.players[n].alive).length;return{name:e.name,title:e.place===2||e.place===3?`${e.name.toUpperCase()} TAKES ${e.place===2?"SECOND":"THIRD"}`:`${e.name.toUpperCase()} IS OUT`,detail:`${t} ${t===1?"contestant remains":"contestants remain"}`}}var gc=i=>Math.max(0,Math.min(1,i)),_c=i=>{let e=gc(i);return e*e*(3-2*e)};function yc(i,e=!1){if(e)return{approach:0,recoil:0,strike:0};let t=Math.max(0,i),n=_c((t-.15)/.7)*(1-_c((t-1.45)/.75)),s=t<.85?0:Math.sin(Math.PI*gc((t-.85)/.8)),r=t<.6?0:Math.sin(Math.PI*gc((t-.6)/.6));return{approach:n,recoil:s,strike:r}}function md(i,e,t=!1){return t?1:_c(i==="flatten"?e/1.15:e/2.1)}function Sm(i,e=150){let t=String(i||"").match(/\S+\s*/g)||[],n=[];for(let s of t){if(!n.length){n.push(s);continue}let r=n.at(-1);if(r.length+s.length<=e){n[n.length-1]+=s;continue}let a=[...r.matchAll(/[.!?;]\s+/g)].at(-1),l=a?a.index+a[0].length:0;l>=45?(n[n.length-1]=r.slice(0,l),n.push(r.slice(l)+s)):n.push(s)}if(n.length>1&&n.at(-1).trim().length<45){let s=n[n.length-2].match(/\S+\s*/g)||[];for(;n.at(-1).length<65&&s.length>1;)n[n.length-1]=s.pop()+n.at(-1);n[n.length-2]=s.join("")}return n.length?n:[""]}var vs=i=>Math.max(3200,1500+String(i).trim().split(/\s+/).length*340);function Ms(i,e){let t=i.ev||{};if(!["say","thought","whisper","chalk_write"].includes(t.type)||["thought","whisper"].includes(t.type)&&!e)return null;let n=fc(i,e);return!n||!t.text?null:{name:n,text:String(t.text),pages:Sm(t.text),kind:t.type,label:t.type==="thought"?"PRIVATE THOUGHT":t.type==="whisper"?`WHISPER TO ${t.to}`:t.type==="chalk_write"?"LEAVES A NOTE":"SAYS",color:Qn[i.order.indexOf(n)]||"#edc181"}}function gd(i,e,t={}){let n=Ms(i,e);if(n)return n.pages.reduce((o,a)=>o+vs(a),0)+600+(t.receipt?vs(t.receipt.text):t.forged?3800:0);if(t.receipt)return vs(t.receipt.text)+2400;let s=ei(i,e);return s?vs(s.title+" "+s.detail)+800:i.ev?.type==="game_end"?6500:i.ev?.type==="death"?5400:i.ev?.type==="stage_start"?4200:2300}function Tm(i,e){let t=0;for(let n=0;n<i.pages.length;n++)if(t+=vs(i.pages[n]),e<t)return n;return i.pages.length-1}function vc(i,e,t){return i.id!==e.tape?[]:[...new Set(e.segments.flatMap(({from:n,to:s})=>{let r=[];for(let o=n;o<=s&&o<i.events.length;o++)o>=0&&dn(i.events[o],t)&&r.push(o);return r}))].sort((n,s)=>n-s)}function _d(i,e,t,n,s={}){if(i.key==="crusher"&&(jn(e)||e.crusher.escaped))return{eye:[15,3,-1.8],target:[0,1,-4.5]};if(e.ev?.type==="game_end")return{eye:[4,6,16],target:[0,2,0]};let r=Ms(e,t),o=i.actors.find(a=>a.name===i.actor&&a.visible);if(r&&o&&s.pit){let a=Math.max(0,o.position[0]-1.7)*1.1;return{eye:[6.5+a,5.8,8.4],target:[2.6+a,2.2,-2.5]}}if(r&&o){let[a,l,c]=o.position;return{eye:[a+3.6,l+2.9,c+6.8],target:[a+1.65,l+1.6,c-.4]}}if(o&&ei(e,t)?.kind==="power"){let[a,l,c]=o.position;return i.key==="crusher"?{eye:[a-3,l+2.7,c-5.5],target:[a,l+1,c]}:{eye:[a+4,l+3.4,c+7.8],target:[a+1,l+1,c]}}if(o&&e.ev?.type==="action"){let a=String(e.ev.action).split(":")[1],l=i.actors.find(d=>d.name===a&&d.visible),c=o.position.map((d,f)=>l?(d+l.position[f])/2:d),h=l?Math.hypot(...o.position.map((d,f)=>d-l.position[f])):0,u=Math.max(8,h*1.25);return{target:[c[0]+(s.receipt?1.8:0),c[1]+.9,c[2]],eye:[c[0]+u*.48,c[1]+u*.35,c[2]+u]}}if(o&&i.death){if(i.key==="ledge"||i.key==="disc")return{eye:[6,5,7],target:[0,.3,0]};if(i.key==="pit")return{eye:[6.5,5.8,8.4],target:[2.6,2.2,-2.5]};let[a,l,c]=o.position,h=["shatter","chute","tumble"].includes(o.pose)?n*2.5:0;return{target:[a,l+.8-h,c],eye:[a+8,l+4-h,c+(i.key==="bridge"?3:9)]}}return null}var Bo=class{constructor(e){this.host=e,this.directing={},e.innerHTML='<div class="film-heading"><span>LAST THREE</span><b></b></div><svg class="speech-leader" aria-hidden="true"><path/><circle r="5"/></svg><article class="speech-bubble" hidden aria-live="polite"><div class="speaker"><strong></strong><span></span></div><p></p><small></small></article><aside class="evidence-card" hidden><span></span><p></p><small></small></aside><div class="focal-names"></div><div class="film-stakes" hidden></div><div class="consequence" hidden><span>THE CONSEQUENCE</span><strong></strong><p></p></div><aside class="context-card" hidden><span></span><strong></strong><p></p></aside><div class="film-finish" hidden><span>THE LAST THREE</span><strong></strong></div><div class="film-beat" hidden><span></span><p></p></div>',this.bubble=e.querySelector("article"),this.leader=e.querySelector("svg"),this.beat=e.querySelector(".film-beat"),this.evidence=e.querySelector(".evidence-card"),this.names=e.querySelector(".focal-names"),this.stakes=e.querySelector(".film-stakes"),this.outcome=e.querySelector(".consequence"),this.context=e.querySelector(".context-card"),this.finish=e.querySelector(".film-finish")}setState(e,t,n={}){this.state=e,this.directing=n,this.result=pd(e);let s=ei(e,t),r=Oo(e);this.context.hidden=!s,this.context.dataset.kind=s?.kind||"",this.context.querySelector("span").textContent=s?.label||"",this.context.querySelector("strong").textContent=s?.title||"",this.context.querySelector("p").textContent=s?.detail||"",this.finish.hidden=r[0]?.place!==1,this.finish.querySelector("strong").textContent=r[0]?.place===1?`${r[0].name} wins.`:"",this.names.replaceChildren(),this.evidence.hidden=!0,this.outcome.hidden=!0,this.host.dataset.scene=e.stage,this.host.dataset.dialogue=!!Ms(e,t),this.host.dataset.rule=e.ev?.type==="stage_start",this.stakes.hidden=!n.pit,this.stakes.textContent=n.pit?"ONE ROPE \xB7 RESCUE COSTS 2 FOOTING":"",this.d=Ms(e,t),this.currentPage=-1,this.host.querySelector(".film-heading b").textContent=_r[e.stage]||"",this.bubble.hidden=!this.d,this.leader.toggleAttribute("hidden",!this.d),this.d&&(this.bubble.dataset.kind=this.d.kind,this.leader.dataset.kind=this.d.kind,this.bubble.style.setProperty("--speaker",this.d.color),this.bubble.querySelector("strong").textContent=this.d.name,this.bubble.querySelector(".speaker span").textContent=n.forged?`SIGNED ${n.forged.signed} \xB7 TO ${n.forged.to}`:this.d.label,this.revealAt=this.d.pages.reduce((l,c)=>l+vs(c),0));let o=["thought","whisper"].includes(e.ev?.type)&&!t,a=t?e.captionCut:e.caption;this.beat.hidden=!!this.d||o||!!s||!!r.length,this.beat.querySelector("span").textContent=e.ev?.type==="stage_start"?"THE RULE":"",this.beat.querySelector("p").textContent=e.ev?.type==="stage_start"?ys[e.stage]:a?.text||ys[e.stage],jn(e)&&(this.beat.querySelector("p").textContent=`${e.crusher.holder} dives clear. The crusher slams shut.`),n.contrast&&(this.beat.querySelector("p").textContent=n.contrast),this.render(0)}render(e,t,n=[]){let s=this.d?this.revealAt:0,r=this.directing.receipt,o=this.directing.forged,a=(r||o)&&e>=s;this.evidence.hidden=!a,this.evidence.dataset.kind=o?"forgery":r?.private?"private":"callback",a&&(this.evidence.querySelector("span").textContent=o?"THE NAME WAS A DISGUISE":r.label.toUpperCase(),this.evidence.querySelector("p").textContent=r?`\u201C${r.text}\u201D`:"",o&&(this.evidence.querySelector("p").textContent=`${o.sender} sent this. ${o.signed} did not.`),this.evidence.querySelector("small").textContent=o?`FORGED WHISPER \xB7 REAL SENDER: ${o.sender.toUpperCase()}`:r.private?r.kind==="whisper"?"PRIVATE WHISPER \xB7 RECORDED EXCERPT":"PRIVATE THOUGHT \xB7 RECORDED EXCERPT":"EARLIER IN THE RECORDING"),this.outcome.hidden=!this.result||e<2700,this.result&&(this.beat.hidden=!0,this.outcome.querySelector("strong").textContent=this.result.title,this.outcome.querySelector("p").textContent=this.result.detail);let l=n.filter(S=>S.visible&&S.x>.04&&S.x<.94&&S.y>.12&&S.y<.85);for(;this.names.children.length<l.length;)this.names.append(document.createElement("span"));if(Array.from(this.names.children).forEach((S,M)=>{let y=l[M];S.hidden=!y,y&&(S.textContent=y.label||y.name,S.style.left=`${y.x*100}%`,S.style.top=`${y.y*100}%`,S.style.setProperty("--speaker",y.color),S.hidden=y.x>.5&&(!!this.d&&y.y<.55||!!a))}),!this.d)return;let c=Tm(this.d,e);if(c!==this.currentPage&&(this.currentPage=c,this.bubble.querySelector("p").textContent=this.d.pages[c],this.bubble.querySelector("small").textContent=this.d.pages.length>1?`${c+1} / ${this.d.pages.length}`:""),!t)return;let h=this.host.clientWidth,u=this.host.clientHeight,d=t.x*h,f=t.y*u,p=this.bubble.getBoundingClientRect(),_=this.host.getBoundingClientRect(),m=p.left-_.left+25,g=p.bottom-_.top-12;this.leader.style.display=t.visible?"":"none",this.leader.setAttribute("viewBox",`0 0 ${h} ${u}`),this.leader.querySelector("path").setAttribute("d",`M ${m} ${g} Q ${m-25} ${g+28} ${d} ${f}`),this.leader.querySelector("circle").setAttribute("cx",d),this.leader.querySelector("circle").setAttribute("cy",f)}};var rf=0,dh=1,of=2;var fh=1,Ba=2,qn=3,Dn=0,Yt=1,Ht=2,Nn=0,Yi=1,mo=2,ph=3,mh=4,af=5,Ai=100,lf=101,cf=102,hf=103,uf=104,df=200,ff=201,pf=202,mf=203,fa=204,pa=205,gf=206,_f=207,xf=208,yf=209,vf=210,Mf=211,bf=212,Sf=213,Tf=214,ka=0,za=1,Va=2,$i=3,Ha=4,Ga=5,Wa=6,Xa=7,qa=0,wf=1,Ef=2,gi=0,Ya=1,$a=2,Ka=3,Qs=4,Za=5,Ja=6,ja=7,Jc="attached",Af="detached",gh=300,rs=301,os=302,Qa=303,el=304,go=306,Ri=1e3,kn=1001,Os=1002,Wt=1003,tl=1004;var as=1005;var tn=1006,er=1007;var Un=1008;var Fn=1009,_h=1010,xh=1011,tr=1012,nl=1013,Li=1014,Sn=1015,cn=1016,il=1017,sl=1018,nr=1020,yh=35902,vh=35899,Mh=1021,bh=1022,gn=1023,Bs=1026,ir=1027,rl=1028,ol=1029,Sh=1030,al=1031;var ll=1033,_o=33776,xo=33777,yo=33778,vo=33779,cl=35840,hl=35841,ul=35842,dl=35843,fl=36196,pl=37492,ml=37496,gl=37808,_l=37809,xl=37810,yl=37811,vl=37812,Ml=37813,bl=37814,Sl=37815,Tl=37816,wl=37817,El=37818,Al=37819,Rl=37820,Cl=37821,Il=36492,Pl=36494,Ll=36495,Dl=36283,Nl=36284,Ul=36285,Fl=36286;var Ki=2300,Zi=2301,da=2302,jc=2400,Qc=2401,eh=2402,Rf=2500;var Th=0,Mo=1,sr=2,Cf=3200,If=3201;var Ol=0,Pf=1,_i="",St="srgb",Xt="srgb-linear",Pr="linear",it="srgb";var Xi=7680;var th=519,Lf=512,Df=513,Nf=514,wh=515,Uf=516,Ff=517,Of=518,Bf=519,ma=35044;var Eh="300 es",Ln=2e3,Lr=2001;var li=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}},Kt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],xd=1234567,Ar=Math.PI/180,Ji=180/Math.PI;function Mn(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Kt[i&255]+Kt[i>>8&255]+Kt[i>>16&255]+Kt[i>>24&255]+"-"+Kt[e&255]+Kt[e>>8&255]+"-"+Kt[e>>16&15|64]+Kt[e>>24&255]+"-"+Kt[t&63|128]+Kt[t>>8&255]+"-"+Kt[t>>16&255]+Kt[t>>24&255]+Kt[n&255]+Kt[n>>8&255]+Kt[n>>16&255]+Kt[n>>24&255]).toLowerCase()}function Ye(i,e,t){return Math.max(e,Math.min(t,i))}function Ah(i,e){return(i%e+e)%e}function wm(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function Em(i,e,t){return i!==e?(t-i)/(e-i):0}function Rr(i,e,t){return(1-t)*i+t*e}function Am(i,e,t,n){return Rr(i,e,1-Math.exp(-t*n))}function Rm(i,e=1){return e-Math.abs(Ah(i,e*2)-e)}function Cm(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function Im(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function Pm(i,e){return i+Math.floor(Math.random()*(e-i+1))}function Lm(i,e){return i+Math.random()*(e-i)}function Dm(i){return i*(.5-Math.random())}function Nm(i){i!==void 0&&(xd=i);let e=xd+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Um(i){return i*Ar}function Fm(i){return i*Ji}function Om(i){return(i&i-1)===0&&i!==0}function Bm(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function km(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function zm(i,e,t,n,s){let r=Math.cos,o=Math.sin,a=r(t/2),l=o(t/2),c=r((e+n)/2),h=o((e+n)/2),u=r((e-n)/2),d=o((e-n)/2),f=r((n-e)/2),p=o((n-e)/2);switch(s){case"XYX":i.set(a*h,l*u,l*d,a*c);break;case"YZY":i.set(l*d,a*h,l*u,a*c);break;case"ZXZ":i.set(l*u,l*d,a*h,a*c);break;case"XZX":i.set(a*h,l*p,l*f,a*c);break;case"YXY":i.set(l*f,a*h,l*p,a*c);break;case"ZYZ":i.set(l*p,l*f,a*h,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Pn(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function at(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var Rh={DEG2RAD:Ar,RAD2DEG:Ji,generateUUID:Mn,clamp:Ye,euclideanModulo:Ah,mapLinear:wm,inverseLerp:Em,lerp:Rr,damp:Am,pingpong:Rm,smoothstep:Cm,smootherstep:Im,randInt:Pm,randFloat:Lm,randFloatSpread:Dm,seededRandom:Nm,degToRad:Um,radToDeg:Fm,isPowerOfTwo:Om,ceilPowerOfTwo:Bm,floorPowerOfTwo:km,setQuaternionFromProperEuler:zm,normalize:at,denormalize:Pn},te=class i{constructor(e=0,t=0){i.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Ye(this.x,e.x,t.x),this.y=Ye(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Ye(this.x,e,t),this.y=Ye(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ye(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Ye(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*s+e.x,this.y=r*s+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Jt=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,o,a){let l=n[s+0],c=n[s+1],h=n[s+2],u=n[s+3],d=r[o+0],f=r[o+1],p=r[o+2],_=r[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u;return}if(a===1){e[t+0]=d,e[t+1]=f,e[t+2]=p,e[t+3]=_;return}if(u!==_||l!==d||c!==f||h!==p){let m=1-a,g=l*d+c*f+h*p+u*_,S=g>=0?1:-1,M=1-g*g;if(M>Number.EPSILON){let R=Math.sqrt(M),A=Math.atan2(R,g*S);m=Math.sin(m*A)/R,a=Math.sin(a*A)/R}let y=a*S;if(l=l*m+d*y,c=c*m+f*y,h=h*m+p*y,u=u*m+_*y,m===1-a){let R=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=R,c*=R,h*=R,u*=R}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,s,r,o){let a=n[s],l=n[s+1],c=n[s+2],h=n[s+3],u=r[o],d=r[o+1],f=r[o+2],p=r[o+3];return e[t]=a*p+h*u+l*f-c*d,e[t+1]=l*p+h*d+c*u-a*f,e[t+2]=c*p+h*f+a*d-l*u,e[t+3]=h*p-a*u-l*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(s/2),u=a(r/2),d=l(n/2),f=l(s/2),p=l(r/2);switch(o){case"XYZ":this._x=d*h*u+c*f*p,this._y=c*f*u-d*h*p,this._z=c*h*p+d*f*u,this._w=c*h*u-d*f*p;break;case"YXZ":this._x=d*h*u+c*f*p,this._y=c*f*u-d*h*p,this._z=c*h*p-d*f*u,this._w=c*h*u+d*f*p;break;case"ZXY":this._x=d*h*u-c*f*p,this._y=c*f*u+d*h*p,this._z=c*h*p+d*f*u,this._w=c*h*u-d*f*p;break;case"ZYX":this._x=d*h*u-c*f*p,this._y=c*f*u+d*h*p,this._z=c*h*p-d*f*u,this._w=c*h*u+d*f*p;break;case"YZX":this._x=d*h*u+c*f*p,this._y=c*f*u+d*h*p,this._z=c*h*p-d*f*u,this._w=c*h*u-d*f*p;break;case"XZY":this._x=d*h*u-c*f*p,this._y=c*f*u-d*h*p,this._z=c*h*p+d*f*u,this._w=c*h*u+d*f*p;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],h=t[6],u=t[10],d=n+a+u;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(o-s)*f}else if(n>a&&n>u){let f=2*Math.sqrt(1+n-a-u);this._w=(h-l)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(r+c)/f}else if(a>u){let f=2*Math.sqrt(1+a-n-u);this._w=(r-c)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(l+h)/f}else{let f=2*Math.sqrt(1+u-n-a);this._w=(o-s)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ye(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+o*a+s*c-r*l,this._y=s*h+o*l+r*a-n*c,this._z=r*h+o*c+n*l-s*a,this._w=o*h-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,s=this._y,r=this._z,o=this._w,a=o*e._w+n*e._x+s*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=s,this._z=r,this;let l=1-a*a;if(l<=Number.EPSILON){let f=1-t;return this._w=f*o+t*this._w,this._x=f*n+t*this._x,this._y=f*s+t*this._y,this._z=f*r+t*this._z,this.normalize(),this}let c=Math.sqrt(l),h=Math.atan2(c,a),u=Math.sin((1-t)*h)/c,d=Math.sin(t*h)/c;return this._w=o*u+this._w*d,this._x=n*u+this._x*d,this._y=s*u+this._y*d,this._z=r*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},E=class i{constructor(e=0,t=0,n=0){i.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(yd.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(yd.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*n),h=2*(a*t-r*s),u=2*(r*n-o*t);return this.x=t+l*c+o*u-a*h,this.y=n+l*h+a*c-r*u,this.z=s+l*u+r*h-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Ye(this.x,e.x,t.x),this.y=Ye(this.y,e.y,t.y),this.z=Ye(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Ye(this.x,e,t),this.y=Ye(this.y,e,t),this.z=Ye(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ye(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Mc.copy(this).projectOnVector(e),this.sub(Mc)}reflect(e){return this.sub(Mc.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Ye(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Mc=new E,yd=new Jt,We=class i{constructor(e,t,n,s,r,o,a,l,c){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c)}set(e,t,n,s,r,o,a,l,c){let h=this.elements;return h[0]=e,h[1]=s,h[2]=a,h[3]=t,h[4]=r,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],u=n[7],d=n[2],f=n[5],p=n[8],_=s[0],m=s[3],g=s[6],S=s[1],M=s[4],y=s[7],R=s[2],A=s[5],I=s[8];return r[0]=o*_+a*S+l*R,r[3]=o*m+a*M+l*A,r[6]=o*g+a*y+l*I,r[1]=c*_+h*S+u*R,r[4]=c*m+h*M+u*A,r[7]=c*g+h*y+u*I,r[2]=d*_+f*S+p*R,r[5]=d*m+f*M+p*A,r[8]=d*g+f*y+p*I,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8];return t*o*h-t*a*c-n*r*h+n*a*l+s*r*c-s*o*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=h*o-a*c,d=a*l-h*r,f=c*r-o*l,p=t*u+n*d+s*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/p;return e[0]=u*_,e[1]=(s*c-h*n)*_,e[2]=(a*n-s*o)*_,e[3]=d*_,e[4]=(h*t-s*l)*_,e[5]=(s*r-a*t)*_,e[6]=f*_,e[7]=(n*l-c*t)*_,e[8]=(o*t-n*r)*_,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(bc.makeScale(e,t)),this}rotate(e){return this.premultiply(bc.makeRotation(-e)),this}translate(e,t){return this.premultiply(bc.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},bc=new We;function Ch(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function ks(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function kf(){let i=ks("canvas");return i.style.display="block",i}var vd={};function zs(i){i in vd||(vd[i]=!0,console.warn(i))}function zf(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var Md=new We().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),bd=new We().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Vm(){let i={enabled:!0,workingColorSpace:Xt,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===it&&(s.r=ai(s.r),s.g=ai(s.g),s.b=ai(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===it&&(s.r=Fs(s.r),s.g=Fs(s.g),s.b=Fs(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===_i?Pr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return zs("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return zs("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Xt]:{primaries:e,whitePoint:n,transfer:Pr,toXYZ:Md,fromXYZ:bd,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:St},outputColorSpaceConfig:{drawingBufferColorSpace:St}},[St]:{primaries:e,whitePoint:n,transfer:it,toXYZ:Md,fromXYZ:bd,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:St}}}),i}var $e=Vm();function ai(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Fs(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var bs,ga=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{bs===void 0&&(bs=ks("canvas")),bs.width=e.width,bs.height=e.height;let s=bs.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=bs}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=ks("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=ai(r[o]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(ai(t[n]/255)*255):t[n]=ai(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Hm=0,Vs=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Hm++}),this.uuid=Mn(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(Sc(s[o].image)):r.push(Sc(s[o]))}else r=Sc(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function Sc(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?ga.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var Gm=0,Tc=new E,Nt=class i extends li{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=kn,s=kn,r=tn,o=Un,a=gn,l=Fn,c=i.DEFAULT_ANISOTROPY,h=_i){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Gm++}),this.uuid=Mn(),this.name="",this.source=new Vs(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new te(0,0),this.repeat=new te(1,1),this.center=new te(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new We,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(Tc).x}get height(){return this.source.getSize(Tc).y}get depth(){return this.source.getSize(Tc).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==gh)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Ri:e.x=e.x-Math.floor(e.x);break;case kn:e.x=e.x<0?0:1;break;case Os:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Ri:e.y=e.y-Math.floor(e.y);break;case kn:e.y=e.y<0?0:1;break;case Os:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Nt.DEFAULT_IMAGE=null;Nt.DEFAULT_MAPPING=gh;Nt.DEFAULT_ANISOTROPY=1;var tt=class i{constructor(e=0,t=0,n=0,s=1){i.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,l=e.elements,c=l[0],h=l[4],u=l[8],d=l[1],f=l[5],p=l[9],_=l[2],m=l[6],g=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-_)<.01&&Math.abs(p-m)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+_)<.1&&Math.abs(p+m)<.1&&Math.abs(c+f+g-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let M=(c+1)/2,y=(f+1)/2,R=(g+1)/2,A=(h+d)/4,I=(u+_)/4,D=(p+m)/4;return M>y&&M>R?M<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(M),s=A/n,r=I/n):y>R?y<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(y),n=A/s,r=D/s):R<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(R),n=I/r,s=D/r),this.set(n,s,r,t),this}let S=Math.sqrt((m-p)*(m-p)+(u-_)*(u-_)+(d-h)*(d-h));return Math.abs(S)<.001&&(S=1),this.x=(m-p)/S,this.y=(u-_)/S,this.z=(d-h)/S,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Ye(this.x,e.x,t.x),this.y=Ye(this.y,e.y,t.y),this.z=Ye(this.z,e.z,t.z),this.w=Ye(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Ye(this.x,e,t),this.y=Ye(this.y,e,t),this.z=Ye(this.z,e,t),this.w=Ye(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ye(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},_a=class extends li{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:tn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new tt(0,0,e,t),this.scissorTest=!1,this.viewport=new tt(0,0,e,t);let s={width:e,height:t,depth:n.depth},r=new Nt(s);this.textures=[];let o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){let t={minFilter:tn,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isArrayTexture=this.textures[s].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new Vs(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},kt=class extends _a{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Dr=class extends Nt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Wt,this.minFilter=Wt,this.wrapR=kn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var xa=class extends Nt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Wt,this.minFilter=Wt,this.wrapR=kn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var nn=class{constructor(e=new E(1/0,1/0,1/0),t=new E(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Rn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Rn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Rn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Rn):Rn.fromBufferAttribute(r,o),Rn.applyMatrix4(e.matrixWorld),this.expandByPoint(Rn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ko.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),ko.copy(n.boundingBox)),ko.applyMatrix4(e.matrixWorld),this.union(ko)}let s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Rn),Rn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(xr),zo.subVectors(this.max,xr),Ss.subVectors(e.a,xr),Ts.subVectors(e.b,xr),ws.subVectors(e.c,xr),vi.subVectors(Ts,Ss),Mi.subVectors(ws,Ts),Vi.subVectors(Ss,ws);let t=[0,-vi.z,vi.y,0,-Mi.z,Mi.y,0,-Vi.z,Vi.y,vi.z,0,-vi.x,Mi.z,0,-Mi.x,Vi.z,0,-Vi.x,-vi.y,vi.x,0,-Mi.y,Mi.x,0,-Vi.y,Vi.x,0];return!wc(t,Ss,Ts,ws,zo)||(t=[1,0,0,0,1,0,0,0,1],!wc(t,Ss,Ts,ws,zo))?!1:(Vo.crossVectors(vi,Mi),t=[Vo.x,Vo.y,Vo.z],wc(t,Ss,Ts,ws,zo))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Rn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Rn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(ti[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),ti[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),ti[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),ti[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),ti[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),ti[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),ti[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),ti[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(ti),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},ti=[new E,new E,new E,new E,new E,new E,new E,new E],Rn=new E,ko=new nn,Ss=new E,Ts=new E,ws=new E,vi=new E,Mi=new E,Vi=new E,xr=new E,zo=new E,Vo=new E,Hi=new E;function wc(i,e,t,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){Hi.fromArray(i,r);let a=s.x*Math.abs(Hi.x)+s.y*Math.abs(Hi.y)+s.z*Math.abs(Hi.z),l=e.dot(Hi),c=t.dot(Hi),h=n.dot(Hi);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}var Wm=new nn,yr=new E,Ec=new E,an=class{constructor(e=new E,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):Wm.setFromPoints(e).getCenter(n);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;yr.subVectors(e,this.center);let t=yr.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(yr,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Ec.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(yr.copy(e.center).add(Ec)),this.expandByPoint(yr.copy(e.center).sub(Ec))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},ni=new E,Ac=new E,Ho=new E,bi=new E,Rc=new E,Go=new E,Cc=new E,ji=class{constructor(e=new E,t=new E(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ni)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=ni.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ni.copy(this.origin).addScaledVector(this.direction,t),ni.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Ac.copy(e).add(t).multiplyScalar(.5),Ho.copy(t).sub(e).normalize(),bi.copy(this.origin).sub(Ac);let r=e.distanceTo(t)*.5,o=-this.direction.dot(Ho),a=bi.dot(this.direction),l=-bi.dot(Ho),c=bi.lengthSq(),h=Math.abs(1-o*o),u,d,f,p;if(h>0)if(u=o*l-a,d=o*a-l,p=r*h,u>=0)if(d>=-p)if(d<=p){let _=1/h;u*=_,d*=_,f=u*(u+o*d+2*a)+d*(o*u+d+2*l)+c}else d=r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d=-r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d<=-p?(u=Math.max(0,-(-o*r+a)),d=u>0?-r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c):d<=p?(u=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(u=Math.max(0,-(o*r+a)),d=u>0?r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c);else d=o>0?-r:r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(Ac).addScaledVector(Ho,d),f}intersectSphere(e,t){ni.subVectors(e.center,this.origin);let n=ni.dot(this.direction),s=ni.dot(ni)-n*n,r=e.radius*e.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,o,a,l,c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,s=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,s=(e.min.x-d.x)*c),h>=0?(r=(e.min.y-d.y)*h,o=(e.max.y-d.y)*h):(r=(e.max.y-d.y)*h,o=(e.min.y-d.y)*h),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),u>=0?(a=(e.min.z-d.z)*u,l=(e.max.z-d.z)*u):(a=(e.max.z-d.z)*u,l=(e.min.z-d.z)*u),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,ni)!==null}intersectTriangle(e,t,n,s,r){Rc.subVectors(t,e),Go.subVectors(n,e),Cc.crossVectors(Rc,Go);let o=this.direction.dot(Cc),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;bi.subVectors(this.origin,e);let l=a*this.direction.dot(Go.crossVectors(bi,Go));if(l<0)return null;let c=a*this.direction.dot(Rc.cross(bi));if(c<0||l+c>o)return null;let h=-a*bi.dot(Cc);return h<0?null:this.at(h/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Ge=class i{constructor(e,t,n,s,r,o,a,l,c,h,u,d,f,p,_,m){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c,h,u,d,f,p,_,m)}set(e,t,n,s,r,o,a,l,c,h,u,d,f,p,_,m){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=s,g[1]=r,g[5]=o,g[9]=a,g[13]=l,g[2]=c,g[6]=h,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=_,g[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,s=1/Es.setFromMatrixColumn(e,0).length(),r=1/Es.setFromMatrixColumn(e,1).length(),o=1/Es.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){let d=o*h,f=o*u,p=a*h,_=a*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=f+p*c,t[5]=d-_*c,t[9]=-a*l,t[2]=_-d*c,t[6]=p+f*c,t[10]=o*l}else if(e.order==="YXZ"){let d=l*h,f=l*u,p=c*h,_=c*u;t[0]=d+_*a,t[4]=p*a-f,t[8]=o*c,t[1]=o*u,t[5]=o*h,t[9]=-a,t[2]=f*a-p,t[6]=_+d*a,t[10]=o*l}else if(e.order==="ZXY"){let d=l*h,f=l*u,p=c*h,_=c*u;t[0]=d-_*a,t[4]=-o*u,t[8]=p+f*a,t[1]=f+p*a,t[5]=o*h,t[9]=_-d*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let d=o*h,f=o*u,p=a*h,_=a*u;t[0]=l*h,t[4]=p*c-f,t[8]=d*c+_,t[1]=l*u,t[5]=_*c+d,t[9]=f*c-p,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let d=o*l,f=o*c,p=a*l,_=a*c;t[0]=l*h,t[4]=_-d*u,t[8]=p*u+f,t[1]=u,t[5]=o*h,t[9]=-a*h,t[2]=-c*h,t[6]=f*u+p,t[10]=d-_*u}else if(e.order==="XZY"){let d=o*l,f=o*c,p=a*l,_=a*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=d*u+_,t[5]=o*h,t[9]=f*u-p,t[2]=p*u-f,t[6]=a*h,t[10]=_*u+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Xm,e,qm)}lookAt(e,t,n){let s=this.elements;return fn.subVectors(e,t),fn.lengthSq()===0&&(fn.z=1),fn.normalize(),Si.crossVectors(n,fn),Si.lengthSq()===0&&(Math.abs(n.z)===1?fn.x+=1e-4:fn.z+=1e-4,fn.normalize(),Si.crossVectors(n,fn)),Si.normalize(),Wo.crossVectors(fn,Si),s[0]=Si.x,s[4]=Wo.x,s[8]=fn.x,s[1]=Si.y,s[5]=Wo.y,s[9]=fn.y,s[2]=Si.z,s[6]=Wo.z,s[10]=fn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],u=n[5],d=n[9],f=n[13],p=n[2],_=n[6],m=n[10],g=n[14],S=n[3],M=n[7],y=n[11],R=n[15],A=s[0],I=s[4],D=s[8],T=s[12],b=s[1],P=s[5],O=s[9],z=s[13],W=s[2],q=s[6],G=s[10],ne=s[14],H=s[3],de=s[7],ye=s[11],be=s[15];return r[0]=o*A+a*b+l*W+c*H,r[4]=o*I+a*P+l*q+c*de,r[8]=o*D+a*O+l*G+c*ye,r[12]=o*T+a*z+l*ne+c*be,r[1]=h*A+u*b+d*W+f*H,r[5]=h*I+u*P+d*q+f*de,r[9]=h*D+u*O+d*G+f*ye,r[13]=h*T+u*z+d*ne+f*be,r[2]=p*A+_*b+m*W+g*H,r[6]=p*I+_*P+m*q+g*de,r[10]=p*D+_*O+m*G+g*ye,r[14]=p*T+_*z+m*ne+g*be,r[3]=S*A+M*b+y*W+R*H,r[7]=S*I+M*P+y*q+R*de,r[11]=S*D+M*O+y*G+R*ye,r[15]=S*T+M*z+y*ne+R*be,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],h=e[2],u=e[6],d=e[10],f=e[14],p=e[3],_=e[7],m=e[11],g=e[15];return p*(+r*l*u-s*c*u-r*a*d+n*c*d+s*a*f-n*l*f)+_*(+t*l*f-t*c*d+r*o*d-s*o*f+s*c*h-r*l*h)+m*(+t*c*u-t*a*f-r*o*u+n*o*f+r*a*h-n*c*h)+g*(-s*a*h-t*l*u+t*a*d+s*o*u-n*o*d+n*l*h)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=e[9],d=e[10],f=e[11],p=e[12],_=e[13],m=e[14],g=e[15],S=u*m*c-_*d*c+_*l*f-a*m*f-u*l*g+a*d*g,M=p*d*c-h*m*c-p*l*f+o*m*f+h*l*g-o*d*g,y=h*_*c-p*u*c+p*a*f-o*_*f-h*a*g+o*u*g,R=p*u*l-h*_*l-p*a*d+o*_*d+h*a*m-o*u*m,A=t*S+n*M+s*y+r*R;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let I=1/A;return e[0]=S*I,e[1]=(_*d*r-u*m*r-_*s*f+n*m*f+u*s*g-n*d*g)*I,e[2]=(a*m*r-_*l*r+_*s*c-n*m*c-a*s*g+n*l*g)*I,e[3]=(u*l*r-a*d*r-u*s*c+n*d*c+a*s*f-n*l*f)*I,e[4]=M*I,e[5]=(h*m*r-p*d*r+p*s*f-t*m*f-h*s*g+t*d*g)*I,e[6]=(p*l*r-o*m*r-p*s*c+t*m*c+o*s*g-t*l*g)*I,e[7]=(o*d*r-h*l*r+h*s*c-t*d*c-o*s*f+t*l*f)*I,e[8]=y*I,e[9]=(p*u*r-h*_*r-p*n*f+t*_*f+h*n*g-t*u*g)*I,e[10]=(o*_*r-p*a*r+p*n*c-t*_*c-o*n*g+t*a*g)*I,e[11]=(h*a*r-o*u*r-h*n*c+t*u*c+o*n*f-t*a*f)*I,e[12]=R*I,e[13]=(h*_*s-p*u*s+p*n*d-t*_*d-h*n*m+t*u*m)*I,e[14]=(p*a*s-o*_*s-p*n*l+t*_*l+o*n*m-t*a*m)*I,e[15]=(o*u*s-h*a*s+h*n*l-t*u*l-o*n*d+t*a*d)*I,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,o=e.x,a=e.y,l=e.z,c=r*o,h=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,h*a+n,h*l-s*o,0,c*l-s*a,h*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,o){return this.set(1,n,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,h=o+o,u=a+a,d=r*c,f=r*h,p=r*u,_=o*h,m=o*u,g=a*u,S=l*c,M=l*h,y=l*u,R=n.x,A=n.y,I=n.z;return s[0]=(1-(_+g))*R,s[1]=(f+y)*R,s[2]=(p-M)*R,s[3]=0,s[4]=(f-y)*A,s[5]=(1-(d+g))*A,s[6]=(m+S)*A,s[7]=0,s[8]=(p+M)*I,s[9]=(m-S)*I,s[10]=(1-(d+_))*I,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements,r=Es.set(s[0],s[1],s[2]).length(),o=Es.set(s[4],s[5],s[6]).length(),a=Es.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],Cn.copy(this);let c=1/r,h=1/o,u=1/a;return Cn.elements[0]*=c,Cn.elements[1]*=c,Cn.elements[2]*=c,Cn.elements[4]*=h,Cn.elements[5]*=h,Cn.elements[6]*=h,Cn.elements[8]*=u,Cn.elements[9]*=u,Cn.elements[10]*=u,t.setFromRotationMatrix(Cn),n.x=r,n.y=o,n.z=a,this}makePerspective(e,t,n,s,r,o,a=Ln,l=!1){let c=this.elements,h=2*r/(t-e),u=2*r/(n-s),d=(t+e)/(t-e),f=(n+s)/(n-s),p,_;if(l)p=r/(o-r),_=o*r/(o-r);else if(a===Ln)p=-(o+r)/(o-r),_=-2*o*r/(o-r);else if(a===Lr)p=-o/(o-r),_=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,o,a=Ln,l=!1){let c=this.elements,h=2/(t-e),u=2/(n-s),d=-(t+e)/(t-e),f=-(n+s)/(n-s),p,_;if(l)p=1/(o-r),_=o/(o-r);else if(a===Ln)p=-2/(o-r),_=-(o+r)/(o-r);else if(a===Lr)p=-1/(o-r),_=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Es=new E,Cn=new Ge,Xm=new E(0,0,0),qm=new E(1,1,1),Si=new E,Wo=new E,fn=new E,Sd=new Ge,Td=new Jt,bn=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],h=s[9],u=s[2],d=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(Ye(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Ye(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Ye(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Ye(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Ye(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-Ye(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Sd.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Sd,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Td.setFromEuler(this),this.setFromQuaternion(Td,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};bn.DEFAULT_ORDER="XYZ";var Nr=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Ym=0,wd=new E,As=new Jt,ii=new Ge,Xo=new E,vr=new E,$m=new E,Km=new Jt,Ed=new E(1,0,0),Ad=new E(0,1,0),Rd=new E(0,0,1),Cd={type:"added"},Zm={type:"removed"},Rs={type:"childadded",child:null},Ic={type:"childremoved",child:null},ht=class i extends li{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Ym++}),this.uuid=Mn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new E,t=new bn,n=new Jt,s=new E(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Ge},normalMatrix:{value:new We}}),this.matrix=new Ge,this.matrixWorld=new Ge,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Nr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return As.setFromAxisAngle(e,t),this.quaternion.multiply(As),this}rotateOnWorldAxis(e,t){return As.setFromAxisAngle(e,t),this.quaternion.premultiply(As),this}rotateX(e){return this.rotateOnAxis(Ed,e)}rotateY(e){return this.rotateOnAxis(Ad,e)}rotateZ(e){return this.rotateOnAxis(Rd,e)}translateOnAxis(e,t){return wd.copy(e).applyQuaternion(this.quaternion),this.position.add(wd.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Ed,e)}translateY(e){return this.translateOnAxis(Ad,e)}translateZ(e){return this.translateOnAxis(Rd,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ii.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Xo.copy(e):Xo.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),vr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ii.lookAt(vr,Xo,this.up):ii.lookAt(Xo,vr,this.up),this.quaternion.setFromRotationMatrix(ii),s&&(ii.extractRotation(s.matrixWorld),As.setFromRotationMatrix(ii),this.quaternion.premultiply(As.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Cd),Rs.child=e,this.dispatchEvent(Rs),Rs.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Zm),Ic.child=e,this.dispatchEvent(Ic),Ic.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),ii.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),ii.multiply(e.parent.matrixWorld)),e.applyMatrix4(ii),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Cd),Rs.child=e,this.dispatchEvent(Rs),Rs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(vr,e,$m),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(vr,Km,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),h=o(e.images),u=o(e.shapes),d=o(e.skeletons),f=o(e.animations),p=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),p.length>0&&(n.nodes=p)}return n.object=s,n;function o(a){let l=[];for(let c in a){let h=a[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}};ht.DEFAULT_UP=new E(0,1,0);ht.DEFAULT_MATRIX_AUTO_UPDATE=!0;ht.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var In=new E,si=new E,Pc=new E,ri=new E,Cs=new E,Is=new E,Id=new E,Lc=new E,Dc=new E,Nc=new E,Uc=new tt,Fc=new tt,Oc=new tt,Ei=class i{constructor(e=new E,t=new E,n=new E){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),In.subVectors(e,t),s.cross(In);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){In.subVectors(s,t),si.subVectors(n,t),Pc.subVectors(e,t);let o=In.dot(In),a=In.dot(si),l=In.dot(Pc),c=si.dot(si),h=si.dot(Pc),u=o*c-a*a;if(u===0)return r.set(0,0,0),null;let d=1/u,f=(c*l-a*h)*d,p=(o*h-a*l)*d;return r.set(1-f-p,p,f)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,ri)===null?!1:ri.x>=0&&ri.y>=0&&ri.x+ri.y<=1}static getInterpolation(e,t,n,s,r,o,a,l){return this.getBarycoord(e,t,n,s,ri)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,ri.x),l.addScaledVector(o,ri.y),l.addScaledVector(a,ri.z),l)}static getInterpolatedAttribute(e,t,n,s,r,o){return Uc.setScalar(0),Fc.setScalar(0),Oc.setScalar(0),Uc.fromBufferAttribute(e,t),Fc.fromBufferAttribute(e,n),Oc.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(Uc,r.x),o.addScaledVector(Fc,r.y),o.addScaledVector(Oc,r.z),o}static isFrontFacing(e,t,n,s){return In.subVectors(n,t),si.subVectors(e,t),In.cross(si).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return In.subVectors(this.c,this.b),si.subVectors(this.a,this.b),In.cross(si).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,o,a;Cs.subVectors(s,n),Is.subVectors(r,n),Lc.subVectors(e,n);let l=Cs.dot(Lc),c=Is.dot(Lc);if(l<=0&&c<=0)return t.copy(n);Dc.subVectors(e,s);let h=Cs.dot(Dc),u=Is.dot(Dc);if(h>=0&&u<=h)return t.copy(s);let d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return o=l/(l-h),t.copy(n).addScaledVector(Cs,o);Nc.subVectors(e,r);let f=Cs.dot(Nc),p=Is.dot(Nc);if(p>=0&&f<=p)return t.copy(r);let _=f*c-l*p;if(_<=0&&c>=0&&p<=0)return a=c/(c-p),t.copy(n).addScaledVector(Is,a);let m=h*p-f*u;if(m<=0&&u-h>=0&&f-p>=0)return Id.subVectors(r,s),a=(u-h)/(u-h+(f-p)),t.copy(s).addScaledVector(Id,a);let g=1/(m+_+d);return o=_*g,a=d*g,t.copy(n).addScaledVector(Cs,o).addScaledVector(Is,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Vf={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ti={h:0,s:0,l:0},qo={h:0,s:0,l:0};function Bc(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Ce=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=St){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,$e.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=$e.workingColorSpace){return this.r=e,this.g=t,this.b=n,$e.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=$e.workingColorSpace){if(e=Ah(e,1),t=Ye(t,0,1),n=Ye(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=Bc(o,r,e+1/3),this.g=Bc(o,r,e),this.b=Bc(o,r,e-1/3)}return $e.colorSpaceToWorking(this,s),this}setStyle(e,t=St){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=St){let n=Vf[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=ai(e.r),this.g=ai(e.g),this.b=ai(e.b),this}copyLinearToSRGB(e){return this.r=Fs(e.r),this.g=Fs(e.g),this.b=Fs(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=St){return $e.workingToColorSpace(Zt.copy(this),e),Math.round(Ye(Zt.r*255,0,255))*65536+Math.round(Ye(Zt.g*255,0,255))*256+Math.round(Ye(Zt.b*255,0,255))}getHexString(e=St){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=$e.workingColorSpace){$e.workingToColorSpace(Zt.copy(this),t);let n=Zt.r,s=Zt.g,r=Zt.b,o=Math.max(n,s,r),a=Math.min(n,s,r),l,c,h=(a+o)/2;if(a===o)l=0,c=0;else{let u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case n:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-n)/u+2;break;case r:l=(n-s)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=$e.workingColorSpace){return $e.workingToColorSpace(Zt.copy(this),t),e.r=Zt.r,e.g=Zt.g,e.b=Zt.b,e}getStyle(e=St){$e.workingToColorSpace(Zt.copy(this),e);let t=Zt.r,n=Zt.g,s=Zt.b;return e!==St?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Ti),this.setHSL(Ti.h+e,Ti.s+t,Ti.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Ti),e.getHSL(qo);let n=Rr(Ti.h,qo.h,t),s=Rr(Ti.s,qo.s,t),r=Rr(Ti.l,qo.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Zt=new Ce;Ce.NAMES=Vf;var Jm=0,sn=class extends li{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Jm++}),this.uuid=Mn(),this.name="",this.type="Material",this.blending=Yi,this.side=Dn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=fa,this.blendDst=pa,this.blendEquation=Ai,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ce(0,0,0),this.blendAlpha=0,this.depthFunc=$i,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=th,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Xi,this.stencilZFail=Xi,this.stencilZPass=Xi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Yi&&(n.blending=this.blending),this.side!==Dn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==fa&&(n.blendSrc=this.blendSrc),this.blendDst!==pa&&(n.blendDst=this.blendDst),this.blendEquation!==Ai&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==$i&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==th&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Xi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Xi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Xi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(t){let r=s(e.textures),o=s(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},zt=class extends sn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ce(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new bn,this.combine=qa,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var Ct=new E,Yo=new te,jm=0,Pt=class{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:jm++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=ma,this.updateRanges=[],this.gpuType=Sn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Yo.fromBufferAttribute(this,t),Yo.applyMatrix3(e),this.setXY(t,Yo.x,Yo.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.applyMatrix3(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.applyMatrix4(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.applyNormalMatrix(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.transformDirection(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Pn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=at(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Pn(t,this.array)),t}setX(e,t){return this.normalized&&(t=at(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Pn(t,this.array)),t}setY(e,t){return this.normalized&&(t=at(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Pn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=at(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Pn(t,this.array)),t}setW(e,t){return this.normalized&&(t=at(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=at(t,this.array),n=at(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=at(t,this.array),n=at(n,this.array),s=at(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=at(t,this.array),n=at(n,this.array),s=at(s,this.array),r=at(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==ma&&(e.usage=this.usage),e}};var Ur=class extends Pt{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Fr=class extends Pt{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var xt=class extends Pt{constructor(e,t,n){super(new Float32Array(e),t,n)}},Qm=0,vn=new Ge,kc=new ht,Ps=new E,pn=new nn,Mr=new nn,Bt=new E,Vt=class i extends li{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Qm++}),this.uuid=Mn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Ch(e)?Fr:Ur)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new We().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return vn.makeRotationFromQuaternion(e),this.applyMatrix4(vn),this}rotateX(e){return vn.makeRotationX(e),this.applyMatrix4(vn),this}rotateY(e){return vn.makeRotationY(e),this.applyMatrix4(vn),this}rotateZ(e){return vn.makeRotationZ(e),this.applyMatrix4(vn),this}translate(e,t,n){return vn.makeTranslation(e,t,n),this.applyMatrix4(vn),this}scale(e,t,n){return vn.makeScale(e,t,n),this.applyMatrix4(vn),this}lookAt(e){return kc.lookAt(e),kc.updateMatrix(),this.applyMatrix4(kc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ps).negate(),this.translate(Ps.x,Ps.y,Ps.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let o=e[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new xt(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new nn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new E(-1/0,-1/0,-1/0),new E(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];pn.setFromBufferAttribute(r),this.morphTargetsRelative?(Bt.addVectors(this.boundingBox.min,pn.min),this.boundingBox.expandByPoint(Bt),Bt.addVectors(this.boundingBox.max,pn.max),this.boundingBox.expandByPoint(Bt)):(this.boundingBox.expandByPoint(pn.min),this.boundingBox.expandByPoint(pn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new an);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new E,1/0);return}if(e){let n=this.boundingSphere.center;if(pn.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){let a=t[r];Mr.setFromBufferAttribute(a),this.morphTargetsRelative?(Bt.addVectors(pn.min,Mr.min),pn.expandByPoint(Bt),Bt.addVectors(pn.max,Mr.max),pn.expandByPoint(Bt)):(pn.expandByPoint(Mr.min),pn.expandByPoint(Mr.max))}pn.getCenter(n);let s=0;for(let r=0,o=e.count;r<o;r++)Bt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Bt));if(t)for(let r=0,o=t.length;r<o;r++){let a=t[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)Bt.fromBufferAttribute(a,c),l&&(Ps.fromBufferAttribute(e,c),Bt.add(Ps)),s=Math.max(s,n.distanceToSquared(Bt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Pt(new Float32Array(4*n.count),4));let o=this.getAttribute("tangent"),a=[],l=[];for(let D=0;D<n.count;D++)a[D]=new E,l[D]=new E;let c=new E,h=new E,u=new E,d=new te,f=new te,p=new te,_=new E,m=new E;function g(D,T,b){c.fromBufferAttribute(n,D),h.fromBufferAttribute(n,T),u.fromBufferAttribute(n,b),d.fromBufferAttribute(r,D),f.fromBufferAttribute(r,T),p.fromBufferAttribute(r,b),h.sub(c),u.sub(c),f.sub(d),p.sub(d);let P=1/(f.x*p.y-p.x*f.y);isFinite(P)&&(_.copy(h).multiplyScalar(p.y).addScaledVector(u,-f.y).multiplyScalar(P),m.copy(u).multiplyScalar(f.x).addScaledVector(h,-p.x).multiplyScalar(P),a[D].add(_),a[T].add(_),a[b].add(_),l[D].add(m),l[T].add(m),l[b].add(m))}let S=this.groups;S.length===0&&(S=[{start:0,count:e.count}]);for(let D=0,T=S.length;D<T;++D){let b=S[D],P=b.start,O=b.count;for(let z=P,W=P+O;z<W;z+=3)g(e.getX(z+0),e.getX(z+1),e.getX(z+2))}let M=new E,y=new E,R=new E,A=new E;function I(D){R.fromBufferAttribute(s,D),A.copy(R);let T=a[D];M.copy(T),M.sub(R.multiplyScalar(R.dot(T))).normalize(),y.crossVectors(A,T);let P=y.dot(l[D])<0?-1:1;o.setXYZW(D,M.x,M.y,M.z,P)}for(let D=0,T=S.length;D<T;++D){let b=S[D],P=b.start,O=b.count;for(let z=P,W=P+O;z<W;z+=3)I(e.getX(z+0)),I(e.getX(z+1)),I(e.getX(z+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Pt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);let s=new E,r=new E,o=new E,a=new E,l=new E,c=new E,h=new E,u=new E;if(e)for(let d=0,f=e.count;d<f;d+=3){let p=e.getX(d+0),_=e.getX(d+1),m=e.getX(d+2);s.fromBufferAttribute(t,p),r.fromBufferAttribute(t,_),o.fromBufferAttribute(t,m),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),a.fromBufferAttribute(n,p),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),a.add(h),l.add(h),c.add(h),n.setXYZ(p,a.x,a.y,a.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,f=t.count;d<f;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Bt.fromBufferAttribute(e,t),Bt.normalize(),e.setXYZ(t,Bt.x,Bt.y,Bt.z)}toNonIndexed(){function e(a,l){let c=a.array,h=a.itemSize,u=a.normalized,d=new c.constructor(l.length*h),f=0,p=0;for(let _=0,m=l.length;_<m;_++){a.isInterleavedBufferAttribute?f=l[_]*a.data.stride+a.offset:f=l[_]*h;for(let g=0;g<h;g++)d[p++]=c[f++]}return new Pt(d,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let a in s){let l=s[a],c=e(l,n);t.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let h=0,u=c.length;h<u;h++){let d=c[h],f=e(d,n);l.push(f)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){let f=c[u];h.push(f.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(t))}let r=e.morphAttributes;for(let c in r){let h=[],u=r[c];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,h=o.length;c<h;c++){let u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Pd=new Ge,Gi=new ji,$o=new an,Ld=new E,Ko=new E,Zo=new E,Jo=new E,zc=new E,jo=new E,Dd=new E,Qo=new E,lt=class extends ht{constructor(e=new Vt,t=new zt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let a=this.morphTargetInfluences;if(r&&a){jo.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=a[l],u=r[l];h!==0&&(zc.fromBufferAttribute(u,e),o?jo.addScaledVector(zc,h):jo.addScaledVector(zc.sub(t),h))}t.add(jo)}return t}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),$o.copy(n.boundingSphere),$o.applyMatrix4(r),Gi.copy(e.ray).recast(e.near),!($o.containsPoint(Gi.origin)===!1&&(Gi.intersectSphere($o,Ld)===null||Gi.origin.distanceToSquared(Ld)>(e.far-e.near)**2))&&(Pd.copy(r).invert(),Gi.copy(e.ray).applyMatrix4(Pd),!(n.boundingBox!==null&&Gi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Gi)))}_computeIntersections(e,t,n){let s,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let p=0,_=d.length;p<_;p++){let m=d[p],g=o[m.materialIndex],S=Math.max(m.start,f.start),M=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let y=S,R=M;y<R;y+=3){let A=a.getX(y),I=a.getX(y+1),D=a.getX(y+2);s=ea(this,g,e,n,c,h,u,A,I,D),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let p=Math.max(0,f.start),_=Math.min(a.count,f.start+f.count);for(let m=p,g=_;m<g;m+=3){let S=a.getX(m),M=a.getX(m+1),y=a.getX(m+2);s=ea(this,o,e,n,c,h,u,S,M,y),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let p=0,_=d.length;p<_;p++){let m=d[p],g=o[m.materialIndex],S=Math.max(m.start,f.start),M=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let y=S,R=M;y<R;y+=3){let A=y,I=y+1,D=y+2;s=ea(this,g,e,n,c,h,u,A,I,D),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let p=Math.max(0,f.start),_=Math.min(l.count,f.start+f.count);for(let m=p,g=_;m<g;m+=3){let S=m,M=m+1,y=m+2;s=ea(this,o,e,n,c,h,u,S,M,y),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function eg(i,e,t,n,s,r,o,a){let l;if(e.side===Yt?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,e.side===Dn,a),l===null)return null;Qo.copy(a),Qo.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(Qo);return c<t.near||c>t.far?null:{distance:c,point:Qo.clone(),object:i}}function ea(i,e,t,n,s,r,o,a,l,c){i.getVertexPosition(a,Ko),i.getVertexPosition(l,Zo),i.getVertexPosition(c,Jo);let h=eg(i,e,t,n,Ko,Zo,Jo,Dd);if(h){let u=new E;Ei.getBarycoord(Dd,Ko,Zo,Jo,u),s&&(h.uv=Ei.getInterpolatedAttribute(s,a,l,c,u,new te)),r&&(h.uv1=Ei.getInterpolatedAttribute(r,a,l,c,u,new te)),o&&(h.normal=Ei.getInterpolatedAttribute(o,a,l,c,u,new E),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let d={a,b:l,c,normal:new E,materialIndex:0};Ei.getNormal(Ko,Zo,Jo,d.normal),h.face=d,h.barycoord=u}return h}var Vn=class i extends Vt{constructor(e=1,t=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],h=[],u=[],d=0,f=0;p("z","y","x",-1,-1,n,t,e,o,r,0),p("z","y","x",1,-1,n,t,-e,o,r,1),p("x","z","y",1,1,e,n,t,s,o,2),p("x","z","y",1,-1,e,n,-t,s,o,3),p("x","y","z",1,-1,e,t,n,s,r,4),p("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new xt(c,3)),this.setAttribute("normal",new xt(h,3)),this.setAttribute("uv",new xt(u,2));function p(_,m,g,S,M,y,R,A,I,D,T){let b=y/I,P=R/D,O=y/2,z=R/2,W=A/2,q=I+1,G=D+1,ne=0,H=0,de=new E;for(let ye=0;ye<G;ye++){let be=ye*P-z;for(let He=0;He<q;He++){let je=He*b-O;de[_]=je*S,de[m]=be*M,de[g]=W,c.push(de.x,de.y,de.z),de[_]=0,de[m]=0,de[g]=A>0?1:-1,h.push(de.x,de.y,de.z),u.push(He/I),u.push(1-ye/D),ne+=1}}for(let ye=0;ye<D;ye++)for(let be=0;be<I;be++){let He=d+be+q*ye,je=d+be+q*(ye+1),ot=d+(be+1)+q*(ye+1),Qe=d+(be+1)+q*ye;l.push(He,je,Qe),l.push(je,ot,Qe),H+=6}a.addGroup(f,H,T),f+=H,d+=ne}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function ls(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone():Array.isArray(s)?e[t][n]=s.slice():e[t][n]=s}}return e}function jt(i){let e={};for(let t=0;t<i.length;t++){let n=ls(i[t]);for(let s in n)e[s]=n[s]}return e}function tg(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Ih(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:$e.workingColorSpace}var xi={clone:ls,merge:jt},ng=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,ig=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Lt=class extends sn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=ng,this.fragmentShader=ig,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ls(e.uniforms),this.uniformsGroups=tg(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},Or=class extends ht{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ge,this.projectionMatrix=new Ge,this.projectionMatrixInverse=new Ge,this.coordinateSystem=Ln,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},wi=new E,Nd=new te,Ud=new te,It=class extends Or{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Ji*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Ar*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ji*2*Math.atan(Math.tan(Ar*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){wi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(wi.x,wi.y).multiplyScalar(-e/wi.z),wi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(wi.x,wi.y).multiplyScalar(-e/wi.z)}getViewSize(e,t){return this.getViewBounds(e,Nd,Ud),t.subVectors(Ud,Nd)}setViewOffset(e,t,n,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Ar*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}let a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Ls=-90,Ds=1,ya=class extends ht{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new It(Ls,Ds,e,t);s.layers=this.layers,this.add(s);let r=new It(Ls,Ds,e,t);r.layers=this.layers,this.add(r);let o=new It(Ls,Ds,e,t);o.layers=this.layers,this.add(o);let a=new It(Ls,Ds,e,t);a.layers=this.layers,this.add(a);let l=new It(Ls,Ds,e,t);l.layers=this.layers,this.add(l);let c=new It(Ls,Ds,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,o,a,l]=t;for(let c of t)this.remove(c);if(e===Ln)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Lr)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,h]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,s),e.render(t,r),e.setRenderTarget(n,1,s),e.render(t,o),e.setRenderTarget(n,2,s),e.render(t,a),e.setRenderTarget(n,3,s),e.render(t,l),e.setRenderTarget(n,4,s),e.render(t,c),n.texture.generateMipmaps=_,e.setRenderTarget(n,5,s),e.render(t,h),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},Br=class extends Nt{constructor(e=[],t=rs,n,s,r,o,a,l,c,h){super(e,t,n,s,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},va=class extends kt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Br(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Vn(5,5,5),r=new Lt({name:"CubemapFromEquirect",uniforms:ls(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Yt,blending:Nn});r.uniforms.tEquirect.value=t;let o=new lt(s,r),a=t.minFilter;return t.minFilter===Un&&(t.minFilter=tn),new ya(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,s);e.setRenderTarget(r)}},wt=class extends ht{constructor(){super(),this.isGroup=!0,this.type="Group"}},sg={type:"move"},Hs=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new wt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new wt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new E,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new E),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new wt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new E,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new E),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let _ of e.hand.values()){let m=t.getJointPose(_,n),g=this._getHandJoint(c,_);m!==null&&(g.matrix.fromArray(m.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=m.radius),g.visible=m!==null}let h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,p=.005;c.inputState.pinching&&d>f+p?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=f-p&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(sg)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new wt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},kr=class i{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new Ce(e),this.density=t}clone(){return new i(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var Qi=class extends ht{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new bn,this.environmentIntensity=1,this.environmentRotation=new bn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},Gs=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=ma,this.updateRanges=[],this.version=0,this.uuid=Mn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[n+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Mn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Mn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},en=new E,Ws=class i{constructor(e,t,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)en.fromBufferAttribute(this,t),en.applyMatrix4(e),this.setXYZ(t,en.x,en.y,en.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)en.fromBufferAttribute(this,t),en.applyNormalMatrix(e),this.setXYZ(t,en.x,en.y,en.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)en.fromBufferAttribute(this,t),en.transformDirection(e),this.setXYZ(t,en.x,en.y,en.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=Pn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=at(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=at(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=at(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=at(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=at(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Pn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Pn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Pn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Pn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=at(t,this.array),n=at(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=at(t,this.array),n=at(n,this.array),s=at(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=at(t,this.array),n=at(n,this.array),s=at(s,this.array),r=at(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new Pt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new i(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}};var Fd=new E,Od=new tt,Bd=new tt,rg=new E,kd=new Ge,ta=new E,Vc=new an,zd=new Ge,Hc=new ji,zr=class extends lt{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=Jc,this.bindMatrix=new Ge,this.bindMatrixInverse=new Ge,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new nn),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,ta),this.boundingBox.expandByPoint(ta)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new an),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,ta),this.boundingSphere.expandByPoint(ta)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){let n=this.material,s=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Vc.copy(this.boundingSphere),Vc.applyMatrix4(s),e.ray.intersectsSphere(Vc)!==!1&&(zd.copy(s).invert(),Hc.copy(e.ray).applyMatrix4(zd),!(this.boundingBox!==null&&Hc.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Hc)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new tt,t=this.geometry.attributes.skinWeight;for(let n=0,s=t.count;n<s;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===Jc?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Af?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,s=this.geometry;Od.fromBufferAttribute(s.attributes.skinIndex,e),Bd.fromBufferAttribute(s.attributes.skinWeight,e),Fd.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let r=0;r<4;r++){let o=Bd.getComponent(r);if(o!==0){let a=Od.getComponent(r);kd.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(rg.copy(Fd).applyMatrix4(kd),o)}}return t.applyMatrix4(this.bindMatrixInverse)}},Xs=class extends ht{constructor(){super(),this.isBone=!0,this.type="Bone"}},Vr=class extends Nt{constructor(e=null,t=1,n=1,s,r,o,a,l,c=Wt,h=Wt,u,d){super(null,o,a,l,c,h,s,r,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Vd=new Ge,og=new Ge,Hr=class i{constructor(e=[],t=[]){this.uuid=Mn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,s=this.bones.length;n<s;n++)this.boneInverses.push(new Ge)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new Ge;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,s=this.boneTexture;for(let r=0,o=e.length;r<o;r++){let a=e[r]?e[r].matrixWorld:og;Vd.multiplyMatrices(a,t[r]),Vd.toArray(n,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new i(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new Vr(t,e,e,gn,Sn);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,s=e.bones.length;n<s;n++){let r=e.bones[n],o=t[r];o===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",r),o=new Xs),this.bones.push(o),this.boneInverses.push(new Ge().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let s=0,r=t.length;s<r;s++){let o=t[s];e.bones.push(o.uuid);let a=n[s];e.boneInverses.push(a.toArray())}return e}},Ci=class extends Pt{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Ns=new Ge,Hd=new Ge,na=[],Gd=new nn,ag=new Ge,br=new lt,Sr=new an,ci=class extends lt{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Ci(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,ag)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new nn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ns),Gd.copy(e.boundingBox).applyMatrix4(Ns),this.boundingBox.union(Gd)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new an),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ns),Sr.copy(e.boundingSphere).applyMatrix4(Ns),this.boundingSphere.union(Sr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=e*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(e,t){let n=this.matrixWorld,s=this.count;if(br.geometry=this.geometry,br.material=this.material,br.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Sr.copy(this.boundingSphere),Sr.applyMatrix4(n),e.ray.intersectsSphere(Sr)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Ns),Hd.multiplyMatrices(n,Ns),br.matrixWorld=Hd,br.raycast(e,na);for(let o=0,a=na.length;o<a;o++){let l=na[o];l.instanceId=r,l.object=this,t.push(l)}na.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Ci(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Vr(new Float32Array(s*this.count),s,this.count,rl,Sn));let r=this.morphTexture.source.data.data,o=0;for(let c=0;c<n.length;c++)o+=n[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=s*e;r[l]=a,r.set(n,l+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Gc=new E,lg=new E,cg=new We,Bn=class{constructor(e=new E(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=Gc.subVectors(n,t).cross(lg.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(Gc),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||cg.getNormalMatrix(e),s=this.coplanarPoint(Gc).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},Wi=new an,hg=new te(.5,.5),ia=new E,qs=class{constructor(e=new Bn,t=new Bn,n=new Bn,s=new Bn,r=new Bn,o=new Bn){this.planes=[e,t,n,s,r,o]}set(e,t,n,s,r,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Ln,n=!1){let s=this.planes,r=e.elements,o=r[0],a=r[1],l=r[2],c=r[3],h=r[4],u=r[5],d=r[6],f=r[7],p=r[8],_=r[9],m=r[10],g=r[11],S=r[12],M=r[13],y=r[14],R=r[15];if(s[0].setComponents(c-o,f-h,g-p,R-S).normalize(),s[1].setComponents(c+o,f+h,g+p,R+S).normalize(),s[2].setComponents(c+a,f+u,g+_,R+M).normalize(),s[3].setComponents(c-a,f-u,g-_,R-M).normalize(),n)s[4].setComponents(l,d,m,y).normalize(),s[5].setComponents(c-l,f-d,g-m,R-y).normalize();else if(s[4].setComponents(c-l,f-d,g-m,R-y).normalize(),t===Ln)s[5].setComponents(c+l,f+d,g+m,R+y).normalize();else if(t===Lr)s[5].setComponents(l,d,m,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Wi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Wi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Wi)}intersectsSprite(e){Wi.center.set(0,0,0);let t=hg.distanceTo(e.center);return Wi.radius=.7071067811865476+t,Wi.applyMatrix4(e.matrixWorld),this.intersectsSphere(Wi)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(ia.x=s.normal.x>0?e.max.x:e.min.x,ia.y=s.normal.y>0?e.max.y:e.min.y,ia.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(ia)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var Ys=class extends sn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ce(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},Ma=new E,ba=new E,Wd=new Ge,Tr=new ji,sa=new an,Wc=new E,Xd=new E,es=class extends ht{constructor(e=new Vt,t=new Ys){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)Ma.fromBufferAttribute(t,s-1),ba.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=Ma.distanceTo(ba);e.setAttribute("lineDistance",new xt(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),sa.copy(n.boundingSphere),sa.applyMatrix4(s),sa.radius+=r,e.ray.intersectsSphere(sa)===!1)return;Wd.copy(s).invert(),Tr.copy(e.ray).applyMatrix4(Wd);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,h=n.index,d=n.attributes.position;if(h!==null){let f=Math.max(0,o.start),p=Math.min(h.count,o.start+o.count);for(let _=f,m=p-1;_<m;_+=c){let g=h.getX(_),S=h.getX(_+1),M=ra(this,e,Tr,l,g,S,_);M&&t.push(M)}if(this.isLineLoop){let _=h.getX(p-1),m=h.getX(f),g=ra(this,e,Tr,l,_,m,p-1);g&&t.push(g)}}else{let f=Math.max(0,o.start),p=Math.min(d.count,o.start+o.count);for(let _=f,m=p-1;_<m;_+=c){let g=ra(this,e,Tr,l,_,_+1,_);g&&t.push(g)}if(this.isLineLoop){let _=ra(this,e,Tr,l,p-1,f,p-1);_&&t.push(_)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function ra(i,e,t,n,s,r,o){let a=i.geometry.attributes.position;if(Ma.fromBufferAttribute(a,s),ba.fromBufferAttribute(a,r),t.distanceSqToSegment(Ma,ba,Wc,Xd)>n)return;Wc.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(Wc);if(!(c<e.near||c>e.far))return{distance:c,point:Xd.clone().applyMatrix4(i.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:i}}var qd=new E,Yd=new E,Gr=class extends es{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)qd.fromBufferAttribute(t,s),Yd.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+qd.distanceTo(Yd);e.setAttribute("lineDistance",new xt(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},Wr=class extends es{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}},$s=class extends sn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ce(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},$d=new Ge,nh=new ji,oa=new an,aa=new E,Xr=class extends ht{constructor(e=new Vt,t=new $s){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),oa.copy(n.boundingSphere),oa.applyMatrix4(s),oa.radius+=r,e.ray.intersectsSphere(oa)===!1)return;$d.copy(s).invert(),nh.copy(e.ray).applyMatrix4($d);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,u=n.attributes.position;if(c!==null){let d=Math.max(0,o.start),f=Math.min(c.count,o.start+o.count);for(let p=d,_=f;p<_;p++){let m=c.getX(p);aa.fromBufferAttribute(u,m),Kd(aa,m,l,s,e,t,this)}}else{let d=Math.max(0,o.start),f=Math.min(u.count,o.start+o.count);for(let p=d,_=f;p<_;p++)aa.fromBufferAttribute(u,p),Kd(aa,p,l,s,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function Kd(i,e,t,n,s,r,o){let a=nh.distanceSqToPoint(i);if(a<t){let l=new E;nh.closestPointToPoint(i,l),l.applyMatrix4(n);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}var qr=class extends Nt{constructor(e,t,n,s,r,o,a,l,c){super(e,t,n,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},Yr=class extends Nt{constructor(e,t,n=Li,s,r,o,a=Wt,l=Wt,c,h=Bs,u=1){if(h!==Bs&&h!==ir)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:e,height:t,depth:u};super(d,s,r,o,a,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Vs(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},$r=class extends Nt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}};var Ii=class i extends Vt{constructor(e=1,t=1,n=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let h=[],u=[],d=[],f=[],p=0,_=[],m=n/2,g=0;S(),o===!1&&(e>0&&M(!0),t>0&&M(!1)),this.setIndex(h),this.setAttribute("position",new xt(u,3)),this.setAttribute("normal",new xt(d,3)),this.setAttribute("uv",new xt(f,2));function S(){let y=new E,R=new E,A=0,I=(t-e)/n;for(let D=0;D<=r;D++){let T=[],b=D/r,P=b*(t-e)+e;for(let O=0;O<=s;O++){let z=O/s,W=z*l+a,q=Math.sin(W),G=Math.cos(W);R.x=P*q,R.y=-b*n+m,R.z=P*G,u.push(R.x,R.y,R.z),y.set(q,I,G).normalize(),d.push(y.x,y.y,y.z),f.push(z,1-b),T.push(p++)}_.push(T)}for(let D=0;D<s;D++)for(let T=0;T<r;T++){let b=_[T][D],P=_[T+1][D],O=_[T+1][D+1],z=_[T][D+1];(e>0||T!==0)&&(h.push(b,P,z),A+=3),(t>0||T!==r-1)&&(h.push(P,O,z),A+=3)}c.addGroup(g,A,0),g+=A}function M(y){let R=p,A=new te,I=new E,D=0,T=y===!0?e:t,b=y===!0?1:-1;for(let O=1;O<=s;O++)u.push(0,m*b,0),d.push(0,b,0),f.push(.5,.5),p++;let P=p;for(let O=0;O<=s;O++){let W=O/s*l+a,q=Math.cos(W),G=Math.sin(W);I.x=T*G,I.y=m*b,I.z=T*q,u.push(I.x,I.y,I.z),d.push(0,b,0),A.x=q*.5+.5,A.y=G*.5*b+.5,f.push(A.x,A.y),p++}for(let O=0;O<s;O++){let z=R+O,W=P+O;y===!0?h.push(W,W+1,z):h.push(W+1,W,z),D+=3}c.addGroup(g,D,y===!0?1:2),g+=D}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var mn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){console.warn("THREE.Curve: .getPoint() not implemented.")}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,s=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)n=this.getPoint(o/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),s=0,r=n.length,o;t?o=t:o=e*n[r-1];let a=0,l=r-1,c;for(;a<=l;)if(s=Math.floor(a+(l-a)/2),c=n[s]-o,c<0)a=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===o)return s/(r-1);let h=n[s],d=n[s+1]-h,f=(o-h)/d;return(s+f)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let o=this.getPoint(s),a=this.getPoint(r),l=t||(o.isVector2?new te:new E);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new E,s=[],r=[],o=[],a=new E,l=new Ge;for(let f=0;f<=e;f++){let p=f/e;s[f]=this.getTangentAt(p,new E)}r[0]=new E,o[0]=new E;let c=Number.MAX_VALUE,h=Math.abs(s[0].x),u=Math.abs(s[0].y),d=Math.abs(s[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),a.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let f=1;f<=e;f++){if(r[f]=r[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(s[f-1],s[f]),a.length()>Number.EPSILON){a.normalize();let p=Math.acos(Ye(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(a,p))}o[f].crossVectors(s[f],r[f])}if(t===!0){let f=Math.acos(Ye(r[0].dot(r[e]),-1,1));f/=e,s[0].dot(a.crossVectors(r[0],r[e]))>0&&(f=-f);for(let p=1;p<=e;p++)r[p].applyMatrix4(l.makeRotationAxis(s[p],f*p)),o[p].crossVectors(s[p],r[p])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},Ks=class extends mn{constructor(e=0,t=0,n=1,s=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t=new te){let n=t,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);let a=this.aStartAngle+e*r,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*h-f*u+this.aX,c=d*u+f*h+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Sa=class extends Ks{constructor(e,t,n,s,r,o){super(e,t,n,n,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function Ph(){let i=0,e=0,t=0,n=0;function s(r,o,a,l){i=r,e=a,t=-3*r+3*o-2*a-l,n=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){s(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,h,u){let d=(o-r)/c-(a-r)/(c+h)+(a-o)/h,f=(a-o)/h-(l-o)/(h+u)+(l-a)/u;d*=h,f*=h,s(o,a,d,f)},calc:function(r){let o=r*r,a=o*r;return i+e*r+t*o+n*a}}}var la=new E,Xc=new Ph,qc=new Ph,Yc=new Ph,Ta=class extends mn{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new E){let n=t,s=this.points,r=s.length,o=(r-(this.closed?0:1))*e,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,h;this.closed||a>0?c=s[(a-1)%r]:(la.subVectors(s[0],s[1]).add(s[0]),c=la);let u=s[a%r],d=s[(a+1)%r];if(this.closed||a+2<r?h=s[(a+2)%r]:(la.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=la),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,p=Math.pow(c.distanceToSquared(u),f),_=Math.pow(u.distanceToSquared(d),f),m=Math.pow(d.distanceToSquared(h),f);_<1e-4&&(_=1),p<1e-4&&(p=_),m<1e-4&&(m=_),Xc.initNonuniformCatmullRom(c.x,u.x,d.x,h.x,p,_,m),qc.initNonuniformCatmullRom(c.y,u.y,d.y,h.y,p,_,m),Yc.initNonuniformCatmullRom(c.z,u.z,d.z,h.z,p,_,m)}else this.curveType==="catmullrom"&&(Xc.initCatmullRom(c.x,u.x,d.x,h.x,this.tension),qc.initCatmullRom(c.y,u.y,d.y,h.y,this.tension),Yc.initCatmullRom(c.z,u.z,d.z,h.z,this.tension));return n.set(Xc.calc(l),qc.calc(l),Yc.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new E().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Zd(i,e,t,n,s){let r=(n-e)*.5,o=(s-t)*.5,a=i*i,l=i*a;return(2*t-2*n+r+o)*l+(-3*t+3*n-2*r-o)*a+r*i+t}function ug(i,e){let t=1-i;return t*t*e}function dg(i,e){return 2*(1-i)*i*e}function fg(i,e){return i*i*e}function Cr(i,e,t,n){return ug(i,e)+dg(i,t)+fg(i,n)}function pg(i,e){let t=1-i;return t*t*t*e}function mg(i,e){let t=1-i;return 3*t*t*i*e}function gg(i,e){return 3*(1-i)*i*i*e}function _g(i,e){return i*i*i*e}function Ir(i,e,t,n,s){return pg(i,e)+mg(i,t)+gg(i,n)+_g(i,s)}var Kr=class extends mn{constructor(e=new te,t=new te,n=new te,s=new te){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new te){let n=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Ir(e,s.x,r.x,o.x,a.x),Ir(e,s.y,r.y,o.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},wa=class extends mn{constructor(e=new E,t=new E,n=new E,s=new E){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new E){let n=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Ir(e,s.x,r.x,o.x,a.x),Ir(e,s.y,r.y,o.y,a.y),Ir(e,s.z,r.z,o.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Zr=class extends mn{constructor(e=new te,t=new te){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new te){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new te){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ea=class extends mn{constructor(e=new E,t=new E){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new E){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new E){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Jr=class extends mn{constructor(e=new te,t=new te,n=new te){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new te){let n=t,s=this.v0,r=this.v1,o=this.v2;return n.set(Cr(e,s.x,r.x,o.x),Cr(e,s.y,r.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Aa=class extends mn{constructor(e=new E,t=new E,n=new E){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new E){let n=t,s=this.v0,r=this.v1,o=this.v2;return n.set(Cr(e,s.x,r.x,o.x),Cr(e,s.y,r.y,o.y),Cr(e,s.z,r.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},jr=class extends mn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new te){let n=t,s=this.points,r=(s.length-1)*e,o=Math.floor(r),a=r-o,l=s[o===0?o:o-1],c=s[o],h=s[o>s.length-2?s.length-1:o+1],u=s[o>s.length-3?s.length-1:o+2];return n.set(Zd(a,l.x,c.x,h.x,u.x),Zd(a,l.y,c.y,h.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new te().fromArray(s))}return this}},ih=Object.freeze({__proto__:null,ArcCurve:Sa,CatmullRomCurve3:Ta,CubicBezierCurve:Kr,CubicBezierCurve3:wa,EllipseCurve:Ks,LineCurve:Zr,LineCurve3:Ea,QuadraticBezierCurve:Jr,QuadraticBezierCurve3:Aa,SplineCurve:jr}),Ra=class extends mn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new ih[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let o=s[r]-n,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,s=this.curves.length;n<s;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let s=0,r=this.curves;s<r.length;s++){let o=r[s],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){let h=l[c];n&&n.equals(h)||(t.push(h),n=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(new ih[s.type]().fromJSON(s))}return this}},Qr=class extends Ra{constructor(e){super(),this.type="Path",this.currentPoint=new te,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new Zr(this.currentPoint.clone(),new te(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,s){let r=new Jr(this.currentPoint.clone(),new te(e,t),new te(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(e,t,n,s,r,o){let a=new Kr(this.currentPoint.clone(),new te(e,t),new te(n,s),new te(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),n=new jr(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,s,r,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,n,s,r,o),this}absarc(e,t,n,s,r,o){return this.absellipse(e,t,n,n,s,r,o),this}ellipse(e,t,n,s,r,o,a,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,n,s,r,o,a,l),this}absellipse(e,t,n,s,r,o,a,l){let c=new Ks(e,t,n,s,r,o,a,l);if(this.curves.length>0){let u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Zs=class extends Qr{constructor(e){super(e),this.uuid=Mn(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,s=this.holes.length;n<s;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let s=e.holes[t];this.holes.push(new Qr().fromJSON(s))}return this}};function xg(i,e,t=2){let n=e&&e.length,s=n?e[0]*t:i.length,r=Hf(i,0,s,t,!0),o=[];if(!r||r.next===r.prev)return o;let a,l,c;if(n&&(r=Sg(i,e,r,t)),i.length>80*t){a=1/0,l=1/0;let h=-1/0,u=-1/0;for(let d=t;d<s;d+=t){let f=i[d],p=i[d+1];f<a&&(a=f),p<l&&(l=p),f>h&&(h=f),p>u&&(u=p)}c=Math.max(h-a,u-l),c=c!==0?32767/c:0}return eo(r,o,t,a,l,c,0),o}function Hf(i,e,t,n,s){let r;if(s===Ng(i,e,t,n)>0)for(let o=e;o<t;o+=n)r=Jd(o/n|0,i[o],i[o+1],r);else for(let o=t-n;o>=e;o-=n)r=Jd(o/n|0,i[o],i[o+1],r);return r&&Js(r,r.next)&&(no(r),r=r.next),r}function ts(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(Js(t,t.next)||Tt(t.prev,t,t.next)===0)){if(no(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function eo(i,e,t,n,s,r,o){if(!i)return;!o&&r&&Rg(i,n,s,r);let a=i;for(;i.prev!==i.next;){let l=i.prev,c=i.next;if(r?vg(i,n,s,r):yg(i)){e.push(l.i,i.i,c.i),no(i),i=c.next,a=c.next;continue}if(i=c,i===a){o?o===1?(i=Mg(ts(i),e),eo(i,e,t,n,s,r,2)):o===2&&bg(i,e,t,n,s,r):eo(ts(i),e,t,n,s,r,1);break}}}function yg(i){let e=i.prev,t=i,n=i.next;if(Tt(e,t,n)>=0)return!1;let s=e.x,r=t.x,o=n.x,a=e.y,l=t.y,c=n.y,h=Math.min(s,r,o),u=Math.min(a,l,c),d=Math.max(s,r,o),f=Math.max(a,l,c),p=n.next;for(;p!==e;){if(p.x>=h&&p.x<=d&&p.y>=u&&p.y<=f&&Er(s,a,r,l,o,c,p.x,p.y)&&Tt(p.prev,p,p.next)>=0)return!1;p=p.next}return!0}function vg(i,e,t,n){let s=i.prev,r=i,o=i.next;if(Tt(s,r,o)>=0)return!1;let a=s.x,l=r.x,c=o.x,h=s.y,u=r.y,d=o.y,f=Math.min(a,l,c),p=Math.min(h,u,d),_=Math.max(a,l,c),m=Math.max(h,u,d),g=sh(f,p,e,t,n),S=sh(_,m,e,t,n),M=i.prevZ,y=i.nextZ;for(;M&&M.z>=g&&y&&y.z<=S;){if(M.x>=f&&M.x<=_&&M.y>=p&&M.y<=m&&M!==s&&M!==o&&Er(a,h,l,u,c,d,M.x,M.y)&&Tt(M.prev,M,M.next)>=0||(M=M.prevZ,y.x>=f&&y.x<=_&&y.y>=p&&y.y<=m&&y!==s&&y!==o&&Er(a,h,l,u,c,d,y.x,y.y)&&Tt(y.prev,y,y.next)>=0))return!1;y=y.nextZ}for(;M&&M.z>=g;){if(M.x>=f&&M.x<=_&&M.y>=p&&M.y<=m&&M!==s&&M!==o&&Er(a,h,l,u,c,d,M.x,M.y)&&Tt(M.prev,M,M.next)>=0)return!1;M=M.prevZ}for(;y&&y.z<=S;){if(y.x>=f&&y.x<=_&&y.y>=p&&y.y<=m&&y!==s&&y!==o&&Er(a,h,l,u,c,d,y.x,y.y)&&Tt(y.prev,y,y.next)>=0)return!1;y=y.nextZ}return!0}function Mg(i,e){let t=i;do{let n=t.prev,s=t.next.next;!Js(n,s)&&Wf(n,t,t.next,s)&&to(n,s)&&to(s,n)&&(e.push(n.i,t.i,s.i),no(t),no(t.next),t=i=s),t=t.next}while(t!==i);return ts(t)}function bg(i,e,t,n,s,r){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&Pg(o,a)){let l=Xf(o,a);o=ts(o,o.next),l=ts(l,l.next),eo(o,e,t,n,s,r,0),eo(l,e,t,n,s,r,0);return}a=a.next}o=o.next}while(o!==i)}function Sg(i,e,t,n){let s=[];for(let r=0,o=e.length;r<o;r++){let a=e[r]*n,l=r<o-1?e[r+1]*n:i.length,c=Hf(i,a,l,n,!1);c===c.next&&(c.steiner=!0),s.push(Ig(c))}s.sort(Tg);for(let r=0;r<s.length;r++)t=wg(s[r],t);return t}function Tg(i,e){let t=i.x-e.x;if(t===0&&(t=i.y-e.y,t===0)){let n=(i.next.y-i.y)/(i.next.x-i.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=n-s}return t}function wg(i,e){let t=Eg(i,e);if(!t)return e;let n=Xf(t,i);return ts(n,n.next),ts(t,t.next)}function Eg(i,e){let t=e,n=i.x,s=i.y,r=-1/0,o;if(Js(i,t))return t;do{if(Js(i,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){let u=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(u<=n&&u>r&&(r=u,o=t.x<t.next.x?t:t.next,u===n))return o}t=t.next}while(t!==e);if(!o)return null;let a=o,l=o.x,c=o.y,h=1/0;t=o;do{if(n>=t.x&&t.x>=l&&n!==t.x&&Gf(s<c?n:r,s,l,c,s<c?r:n,s,t.x,t.y)){let u=Math.abs(s-t.y)/(n-t.x);to(t,i)&&(u<h||u===h&&(t.x>o.x||t.x===o.x&&Ag(o,t)))&&(o=t,h=u)}t=t.next}while(t!==a);return o}function Ag(i,e){return Tt(i.prev,i,e.prev)<0&&Tt(e.next,i,i.next)<0}function Rg(i,e,t,n){let s=i;do s.z===0&&(s.z=sh(s.x,s.y,e,t,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,Cg(s)}function Cg(i){let e,t=1;do{let n=i,s;i=null;let r=null;for(e=0;n;){e++;let o=n,a=0;for(let c=0;c<t&&(a++,o=o.nextZ,!!o);c++);let l=t;for(;a>0||l>0&&o;)a!==0&&(l===0||!o||n.z<=o.z)?(s=n,n=n.nextZ,a--):(s=o,o=o.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=o}r.nextZ=null,t*=2}while(e>1);return i}function sh(i,e,t,n,s){return i=(i-t)*s|0,e=(e-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function Ig(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function Gf(i,e,t,n,s,r,o,a){return(s-o)*(e-a)>=(i-o)*(r-a)&&(i-o)*(n-a)>=(t-o)*(e-a)&&(t-o)*(r-a)>=(s-o)*(n-a)}function Er(i,e,t,n,s,r,o,a){return!(i===o&&e===a)&&Gf(i,e,t,n,s,r,o,a)}function Pg(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!Lg(i,e)&&(to(i,e)&&to(e,i)&&Dg(i,e)&&(Tt(i.prev,i,e.prev)||Tt(i,e.prev,e))||Js(i,e)&&Tt(i.prev,i,i.next)>0&&Tt(e.prev,e,e.next)>0)}function Tt(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function Js(i,e){return i.x===e.x&&i.y===e.y}function Wf(i,e,t,n){let s=ha(Tt(i,e,t)),r=ha(Tt(i,e,n)),o=ha(Tt(t,n,i)),a=ha(Tt(t,n,e));return!!(s!==r&&o!==a||s===0&&ca(i,t,e)||r===0&&ca(i,n,e)||o===0&&ca(t,i,n)||a===0&&ca(t,e,n))}function ca(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function ha(i){return i>0?1:i<0?-1:0}function Lg(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&Wf(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function to(i,e){return Tt(i.prev,i,i.next)<0?Tt(i,e,i.next)>=0&&Tt(i,i.prev,e)>=0:Tt(i,e,i.prev)<0||Tt(i,i.next,e)<0}function Dg(i,e){let t=i,n=!1,s=(i.x+e.x)/2,r=(i.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function Xf(i,e){let t=rh(i.i,i.x,i.y),n=rh(e.i,e.x,e.y),s=i.next,r=e.prev;return i.next=e,e.prev=i,t.next=s,s.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function Jd(i,e,t,n){let s=rh(i,e,t);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function no(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function rh(i,e,t){return{i,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Ng(i,e,t,n){let s=0;for(let r=e,o=t-n;r<t;r+=n)s+=(i[o]-i[r])*(i[r+1]+i[o+1]),o=r;return s}var oh=class{static triangulate(e,t,n=2){return xg(e,t,n)}},qi=class i{static area(e){let t=e.length,n=0;for(let s=t-1,r=0;r<t;s=r++)n+=e[s].x*e[r].y-e[r].x*e[s].y;return n*.5}static isClockWise(e){return i.area(e)<0}static triangulateShape(e,t){let n=[],s=[],r=[];jd(e),Qd(n,e);let o=e.length;t.forEach(jd);for(let l=0;l<t.length;l++)s.push(o),o+=t[l].length,Qd(n,t[l]);let a=oh.triangulate(n,s);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}};function jd(i){let e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function Qd(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}var io=class i extends Vt{constructor(e=new Zs([new te(.5,.5),new te(-.5,.5),new te(-.5,-.5),new te(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,s=[],r=[];for(let a=0,l=e.length;a<l;a++){let c=e[a];o(c)}this.setAttribute("position",new xt(s,3)),this.setAttribute("uv",new xt(r,2)),this.computeVertexNormals();function o(a){let l=[],c=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,u=t.depth!==void 0?t.depth:1,d=t.bevelEnabled!==void 0?t.bevelEnabled:!0,f=t.bevelThickness!==void 0?t.bevelThickness:.2,p=t.bevelSize!==void 0?t.bevelSize:f-.1,_=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3,g=t.extrudePath,S=t.UVGenerator!==void 0?t.UVGenerator:Ug,M,y=!1,R,A,I,D;g&&(M=g.getSpacedPoints(h),y=!0,d=!1,R=g.computeFrenetFrames(h,!1),A=new E,I=new E,D=new E),d||(m=0,f=0,p=0,_=0);let T=a.extractPoints(c),b=T.shape,P=T.holes;if(!qi.isClockWise(b)){b=b.reverse();for(let Q=0,Z=P.length;Q<Z;Q++){let K=P[Q];qi.isClockWise(K)&&(P[Q]=K.reverse())}}function z(Q){let K=10000000000000001e-36,$=Q[0];for(let he=1;he<=Q.length;he++){let ie=he%Q.length,ue=Q[ie],ze=ue.x-$.x,ke=ue.y-$.y,w=ze*ze+ke*ke,x=Math.max(Math.abs(ue.x),Math.abs(ue.y),Math.abs($.x),Math.abs($.y)),F=K*x*x;if(w<=F){Q.splice(ie,1),he--;continue}$=ue}}z(b),P.forEach(z);let W=P.length,q=b;for(let Q=0;Q<W;Q++){let Z=P[Q];b=b.concat(Z)}function G(Q,Z,K){return Z||console.error("THREE.ExtrudeGeometry: vec does not exist"),Q.clone().addScaledVector(Z,K)}let ne=b.length;function H(Q,Z,K){let $,he,ie,ue=Q.x-Z.x,ze=Q.y-Z.y,ke=K.x-Q.x,w=K.y-Q.y,x=ue*ue+ze*ze,F=ue*w-ze*ke;if(Math.abs(F)>Number.EPSILON){let V=Math.sqrt(x),j=Math.sqrt(ke*ke+w*w),X=Z.x-ze/V,Ie=Z.y+ue/V,ce=K.x-w/j,Ee=K.y+ke/j,Ae=((ce-X)*w-(Ee-Ie)*ke)/(ue*w-ze*ke);$=X+ue*Ae-Q.x,he=Ie+ze*Ae-Q.y;let se=$*$+he*he;if(se<=2)return new te($,he);ie=Math.sqrt(se/2)}else{let V=!1;ue>Number.EPSILON?ke>Number.EPSILON&&(V=!0):ue<-Number.EPSILON?ke<-Number.EPSILON&&(V=!0):Math.sign(ze)===Math.sign(w)&&(V=!0),V?($=-ze,he=ue,ie=Math.sqrt(x)):($=ue,he=ze,ie=Math.sqrt(x/2))}return new te($/ie,he/ie)}let de=[];for(let Q=0,Z=q.length,K=Z-1,$=Q+1;Q<Z;Q++,K++,$++)K===Z&&(K=0),$===Z&&($=0),de[Q]=H(q[Q],q[K],q[$]);let ye=[],be,He=de.concat();for(let Q=0,Z=W;Q<Z;Q++){let K=P[Q];be=[];for(let $=0,he=K.length,ie=he-1,ue=$+1;$<he;$++,ie++,ue++)ie===he&&(ie=0),ue===he&&(ue=0),be[$]=H(K[$],K[ie],K[ue]);ye.push(be),He=He.concat(be)}let je;if(m===0)je=qi.triangulateShape(q,P);else{let Q=[],Z=[];for(let K=0;K<m;K++){let $=K/m,he=f*Math.cos($*Math.PI/2),ie=p*Math.sin($*Math.PI/2)+_;for(let ue=0,ze=q.length;ue<ze;ue++){let ke=G(q[ue],de[ue],ie);De(ke.x,ke.y,-he),$===0&&Q.push(ke)}for(let ue=0,ze=W;ue<ze;ue++){let ke=P[ue];be=ye[ue];let w=[];for(let x=0,F=ke.length;x<F;x++){let V=G(ke[x],be[x],ie);De(V.x,V.y,-he),$===0&&w.push(V)}$===0&&Z.push(w)}}je=qi.triangulateShape(Q,Z)}let ot=je.length,Qe=p+_;for(let Q=0;Q<ne;Q++){let Z=d?G(b[Q],He[Q],Qe):b[Q];y?(I.copy(R.normals[0]).multiplyScalar(Z.x),A.copy(R.binormals[0]).multiplyScalar(Z.y),D.copy(M[0]).add(I).add(A),De(D.x,D.y,D.z)):De(Z.x,Z.y,0)}for(let Q=1;Q<=h;Q++)for(let Z=0;Z<ne;Z++){let K=d?G(b[Z],He[Z],Qe):b[Z];y?(I.copy(R.normals[Q]).multiplyScalar(K.x),A.copy(R.binormals[Q]).multiplyScalar(K.y),D.copy(M[Q]).add(I).add(A),De(D.x,D.y,D.z)):De(K.x,K.y,u/h*Q)}for(let Q=m-1;Q>=0;Q--){let Z=Q/m,K=f*Math.cos(Z*Math.PI/2),$=p*Math.sin(Z*Math.PI/2)+_;for(let he=0,ie=q.length;he<ie;he++){let ue=G(q[he],de[he],$);De(ue.x,ue.y,u+K)}for(let he=0,ie=P.length;he<ie;he++){let ue=P[he];be=ye[he];for(let ze=0,ke=ue.length;ze<ke;ze++){let w=G(ue[ze],be[ze],$);y?De(w.x,w.y+M[h-1].y,M[h-1].x+K):De(w.x,w.y,u+K)}}}Y(),ee();function Y(){let Q=s.length/3;if(d){let Z=0,K=ne*Z;for(let $=0;$<ot;$++){let he=je[$];we(he[2]+K,he[1]+K,he[0]+K)}Z=h+m*2,K=ne*Z;for(let $=0;$<ot;$++){let he=je[$];we(he[0]+K,he[1]+K,he[2]+K)}}else{for(let Z=0;Z<ot;Z++){let K=je[Z];we(K[2],K[1],K[0])}for(let Z=0;Z<ot;Z++){let K=je[Z];we(K[0]+ne*h,K[1]+ne*h,K[2]+ne*h)}}n.addGroup(Q,s.length/3-Q,0)}function ee(){let Q=s.length/3,Z=0;Me(q,Z),Z+=q.length;for(let K=0,$=P.length;K<$;K++){let he=P[K];Me(he,Z),Z+=he.length}n.addGroup(Q,s.length/3-Q,1)}function Me(Q,Z){let K=Q.length;for(;--K>=0;){let $=K,he=K-1;he<0&&(he=Q.length-1);for(let ie=0,ue=h+m*2;ie<ue;ie++){let ze=ne*ie,ke=ne*(ie+1),w=Z+$+ze,x=Z+he+ze,F=Z+he+ke,V=Z+$+ke;Ze(w,x,F,V)}}}function De(Q,Z,K){l.push(Q),l.push(Z),l.push(K)}function we(Q,Z,K){ft(Q),ft(Z),ft(K);let $=s.length/3,he=S.generateTopUV(n,s,$-3,$-2,$-1);C(he[0]),C(he[1]),C(he[2])}function Ze(Q,Z,K,$){ft(Q),ft(Z),ft($),ft(Z),ft(K),ft($);let he=s.length/3,ie=S.generateSideWallUV(n,s,he-6,he-3,he-2,he-1);C(ie[0]),C(ie[1]),C(ie[3]),C(ie[1]),C(ie[2]),C(ie[3])}function ft(Q){s.push(l[Q*3+0]),s.push(l[Q*3+1]),s.push(l[Q*3+2])}function C(Q){r.push(Q.x),r.push(Q.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return Fg(t,n,e)}static fromJSON(e,t){let n=[];for(let r=0,o=e.shapes.length;r<o;r++){let a=t[e.shapes[r]];n.push(a)}let s=e.options.extrudePath;return s!==void 0&&(e.options.extrudePath=new ih[s.type]().fromJSON(s)),new i(n,e.options)}},Ug={generateTopUV:function(i,e,t,n,s){let r=e[t*3],o=e[t*3+1],a=e[n*3],l=e[n*3+1],c=e[s*3],h=e[s*3+1];return[new te(r,o),new te(a,l),new te(c,h)]},generateSideWallUV:function(i,e,t,n,s,r){let o=e[t*3],a=e[t*3+1],l=e[t*3+2],c=e[n*3],h=e[n*3+1],u=e[n*3+2],d=e[s*3],f=e[s*3+1],p=e[s*3+2],_=e[r*3],m=e[r*3+1],g=e[r*3+2];return Math.abs(a-h)<Math.abs(o-c)?[new te(o,1-l),new te(c,1-u),new te(d,1-p),new te(_,1-g)]:[new te(a,1-l),new te(h,1-u),new te(f,1-p),new te(m,1-g)]}};function Fg(i,e,t){if(t.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){let r=i[n];t.shapes.push(r.uuid)}else t.shapes.push(i.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var hi=class i extends Vt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,o=t/2,a=Math.floor(n),l=Math.floor(s),c=a+1,h=l+1,u=e/a,d=t/l,f=[],p=[],_=[],m=[];for(let g=0;g<h;g++){let S=g*d-o;for(let M=0;M<c;M++){let y=M*u-r;p.push(y,-S,0),_.push(0,0,1),m.push(M/a),m.push(1-g/l)}}for(let g=0;g<l;g++)for(let S=0;S<a;S++){let M=S+c*g,y=S+c*(g+1),R=S+1+c*(g+1),A=S+1+c*g;f.push(M,y,A),f.push(y,R,A)}this.setIndex(f),this.setAttribute("position",new xt(p,3)),this.setAttribute("normal",new xt(_,3)),this.setAttribute("uv",new xt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}},ns=class i extends Vt{constructor(e=.5,t=1,n=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:o},n=Math.max(3,n),s=Math.max(1,s);let a=[],l=[],c=[],h=[],u=e,d=(t-e)/s,f=new E,p=new te;for(let _=0;_<=s;_++){for(let m=0;m<=n;m++){let g=r+m/n*o;f.x=u*Math.cos(g),f.y=u*Math.sin(g),l.push(f.x,f.y,f.z),c.push(0,0,1),p.x=(f.x/t+1)/2,p.y=(f.y/t+1)/2,h.push(p.x,p.y)}u+=d}for(let _=0;_<s;_++){let m=_*(n+1);for(let g=0;g<n;g++){let S=g+m,M=S,y=S+n+1,R=S+n+2,A=S+1;a.push(M,y,A),a.push(y,R,A)}}this.setIndex(a),this.setAttribute("position",new xt(l,3)),this.setAttribute("normal",new xt(c,3)),this.setAttribute("uv",new xt(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}};var so=class extends Lt{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},At=class extends sn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ce(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ce(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Ol,this.normalScale=new te(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new bn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},qt=class extends At{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new te(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Ye(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Ce(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ce(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ce(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var ro=class extends sn{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Ce(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ce(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Ol,this.normalScale=new te(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new bn,this.combine=qa,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Ca=class extends sn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Cf,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Ia=class extends sn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function ua(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function Og(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Bg(i){function e(s,r){return i[s]-i[r]}let t=i.length,n=new Array(t);for(let s=0;s!==t;++s)n[s]=s;return n.sort(e),n}function ef(i,e,t){let n=i.length,s=new i.constructor(n);for(let r=0,o=0;o!==n;++r){let a=t[r]*e;for(let l=0;l!==e;++l)s[o++]=i[a+l]}return s}function qf(i,e,t,n){let s=1,r=i[0];for(;r!==void 0&&r[n]===void 0;)r=i[s++];if(r===void 0)return;let o=r[n];if(o!==void 0)if(Array.isArray(o))do o=r[n],o!==void 0&&(e.push(r.time),t.push(...o)),r=i[s++];while(r!==void 0);else if(o.toArray!==void 0)do o=r[n],o!==void 0&&(e.push(r.time),o.toArray(t,t.length)),r=i[s++];while(r!==void 0);else do o=r[n],o!==void 0&&(e.push(r.time),t.push(o)),r=i[s++];while(r!==void 0)}var ui=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let o;t:{i:if(!(e<s)){for(let a=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=t[++n],e<s)break e}o=t.length;break t}if(!(e>=r)){let a=t[1];e<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break e}o=n,n=0;break t}break n}for(;n<o;){let a=n+o>>>1;e<t[a]?o=a:n=a+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Pa=class extends ui{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:jc,endingEnd:jc}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,o=e+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case Qc:r=e,a=2*t-n;break;case eh:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Qc:o=e,l=2*n-t;break;case eh:o=1,l=n+s[1]-s[0];break;default:o=e-1,l=t}let c=(n-t)*.5,h=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(s-t),_=p*p,m=_*p,g=-d*m+2*d*_-d*p,S=(1+d)*m+(-1.5-2*d)*_+(-.5+d)*p+1,M=(-1-f)*m+(1.5+f)*_+.5*p,y=f*m-f*_;for(let R=0;R!==a;++R)r[R]=g*o[h+R]+S*o[c+R]+M*o[l+R]+y*o[u+R];return r}},La=class extends ui{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=(n-t)/(s-t),u=1-h;for(let d=0;d!==a;++d)r[d]=o[c+d]*u+o[l+d]*h;return r}},Da=class extends ui{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},ln=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=ua(t,this.TimeBufferType),this.values=ua(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:ua(e.times,Array),values:ua(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Da(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new La(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Pa(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Ki:t=this.InterpolantFactoryMethodDiscrete;break;case Zi:t=this.InterpolantFactoryMethodLinear;break;case da:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Ki;case this.InterpolantFactoryMethodLinear:return Zi;case this.InterpolantFactoryMethodSmooth:return da}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e}return this}trim(e,t){let n=this.times,s=n.length,r=0,o=s-1;for(;r!==s&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(s!==void 0&&Og(s))for(let a=0,l=s.length;a!==l;++a){let c=s[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===da,r=e.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=e[a],h=e[a+1];if(c!==h&&(a!==1||c!==e[0]))if(s)l=!0;else{let u=a*n,d=u-n,f=u+n;for(let p=0;p!==n;++p){let _=t[u+p];if(_!==t[d+p]||_!==t[f+p]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let u=a*n,d=o*n;for(let f=0;f!==n;++f)t[d+f]=t[u+f]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}};ln.prototype.ValueTypeName="";ln.prototype.TimeBufferType=Float32Array;ln.prototype.ValueBufferType=Float32Array;ln.prototype.DefaultInterpolation=Zi;var di=class extends ln{constructor(e,t,n){super(e,t,n)}};di.prototype.ValueTypeName="bool";di.prototype.ValueBufferType=Array;di.prototype.DefaultInterpolation=Ki;di.prototype.InterpolantFactoryMethodLinear=void 0;di.prototype.InterpolantFactoryMethodSmooth=void 0;var oo=class extends ln{constructor(e,t,n,s){super(e,t,n,s)}};oo.prototype.ValueTypeName="color";var Hn=class extends ln{constructor(e,t,n,s){super(e,t,n,s)}};Hn.prototype.ValueTypeName="number";var Na=class extends ui{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(s-t),c=e*a;for(let h=c+a;c!==h;c+=4)Jt.slerpFlat(r,0,o,c-a,o,c,l);return r}},Gn=class extends ln{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new Na(this.times,this.values,this.getValueSize(),e)}};Gn.prototype.ValueTypeName="quaternion";Gn.prototype.InterpolantFactoryMethodSmooth=void 0;var fi=class extends ln{constructor(e,t,n){super(e,t,n)}};fi.prototype.ValueTypeName="string";fi.prototype.ValueBufferType=Array;fi.prototype.DefaultInterpolation=Ki;fi.prototype.InterpolantFactoryMethodLinear=void 0;fi.prototype.InterpolantFactoryMethodSmooth=void 0;var Wn=class extends ln{constructor(e,t,n,s){super(e,t,n,s)}};Wn.prototype.ValueTypeName="vector";var ao=class{constructor(e="",t=-1,n=[],s=Rf){this.name=e,this.tracks=n,this.duration=t,this.blendMode=s,this.uuid=Mn(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){let t=[],n=e.tracks,s=1/(e.fps||1);for(let o=0,a=n.length;o!==a;++o)t.push(zg(n[o]).scale(s));let r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){let t=[],n=e.tracks,s={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,o=n.length;r!==o;++r)t.push(ln.toJSON(n[r]));return s}static CreateFromMorphTargetSequence(e,t,n,s){let r=t.length,o=[];for(let a=0;a<r;a++){let l=[],c=[];l.push((a+r-1)%r,a,(a+1)%r),c.push(0,1,0);let h=Bg(l);l=ef(l,1,h),c=ef(c,1,h),!s&&l[0]===0&&(l.push(r),c.push(c[0])),o.push(new Hn(".morphTargetInfluences["+t[a].name+"]",l,c).scale(1/n))}return new this(e,-1,o)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let s=e;n=s.geometry&&s.geometry.animations||s.animations}for(let s=0;s<n.length;s++)if(n[s].name===t)return n[s];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let s={},r=/^([\w-]*?)([\d]+)$/;for(let a=0,l=e.length;a<l;a++){let c=e[a],h=c.name.match(r);if(h&&h.length>1){let u=h[1],d=s[u];d||(s[u]=d=[]),d.push(c)}}let o=[];for(let a in s)o.push(this.CreateFromMorphTargetSequence(a,s[a],t,n));return o}static parseAnimation(e,t){if(console.warn("THREE.AnimationClip: parseAnimation() is deprecated and will be removed with r185"),!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;let n=function(u,d,f,p,_){if(f.length!==0){let m=[],g=[];qf(f,m,g,p),m.length!==0&&_.push(new u(d,m,g))}},s=[],r=e.name||"default",o=e.fps||30,a=e.blendMode,l=e.length||-1,c=e.hierarchy||[];for(let u=0;u<c.length;u++){let d=c[u].keys;if(!(!d||d.length===0))if(d[0].morphTargets){let f={},p;for(p=0;p<d.length;p++)if(d[p].morphTargets)for(let _=0;_<d[p].morphTargets.length;_++)f[d[p].morphTargets[_]]=-1;for(let _ in f){let m=[],g=[];for(let S=0;S!==d[p].morphTargets.length;++S){let M=d[p];m.push(M.time),g.push(M.morphTarget===_?1:0)}s.push(new Hn(".morphTargetInfluence["+_+"]",m,g))}l=f.length*o}else{let f=".bones["+t[u].name+"]";n(Wn,f+".position",d,"pos",s),n(Gn,f+".quaternion",d,"rot",s),n(Wn,f+".scale",d,"scl",s)}}return s.length===0?null:new this(r,l,s,a)}resetDuration(){let e=this.tracks,t=0;for(let n=0,s=e.length;n!==s;++n){let r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}};function kg(i){switch(i.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Hn;case"vector":case"vector2":case"vector3":case"vector4":return Wn;case"color":return oo;case"quaternion":return Gn;case"bool":case"boolean":return di;case"string":return fi}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+i)}function zg(i){if(i.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let e=kg(i.type);if(i.times===void 0){let t=[],n=[];qf(i.keys,t,n,"value"),i.times=t,i.values=n}return e.parse!==void 0?e.parse(i):new e(i.name,i.times,i.values,i.interpolation)}var zn={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(this.files[i]=e)},get:function(i){if(this.enabled!==!1)return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}},Ua=class{constructor(e,t,n){let s=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.abortController=new AbortController,this.itemStart=function(h){a++,r===!1&&s.onStart!==void 0&&s.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,s.onProgress!==void 0&&s.onProgress(h,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){let u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=c.length;u<d;u+=2){let f=c[u],p=c[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return p}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}},Yf=new Ua,Xn=class{constructor(e){this.manager=e!==void 0?e:Yf,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};Xn.DEFAULT_MATERIAL_NAME="__DEFAULT";var oi={},ah=class extends Error{constructor(e,t){super(e),this.response=t}},js=class extends Xn{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=zn.get(`file:${e}`);if(r!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0),r;if(oi[e]!==void 0){oi[e].push({onLoad:t,onProgress:n,onError:s});return}oi[e]=[],oi[e].push({onLoad:t,onProgress:n,onError:s});let o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),a=this.mimeType,l=this.responseType;fetch(o).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;let h=oi[e],u=c.body.getReader(),d=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),f=d?parseInt(d):0,p=f!==0,_=0,m=new ReadableStream({start(g){S();function S(){u.read().then(({done:M,value:y})=>{if(M)g.close();else{_+=y.byteLength;let R=new ProgressEvent("progress",{lengthComputable:p,loaded:_,total:f});for(let A=0,I=h.length;A<I;A++){let D=h[A];D.onProgress&&D.onProgress(R)}g.enqueue(y),S()}},M=>{g.error(M)})}}});return new Response(m)}else throw new ah(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(h=>new DOMParser().parseFromString(h,a));case"json":return c.json();default:if(a==="")return c.text();{let u=/charset="?([^;"\s]*)"?/i.exec(a),d=u&&u[1]?u[1].toLowerCase():void 0,f=new TextDecoder(d);return c.arrayBuffer().then(p=>f.decode(p))}}}).then(c=>{zn.add(`file:${e}`,c);let h=oi[e];delete oi[e];for(let u=0,d=h.length;u<d;u++){let f=h[u];f.onLoad&&f.onLoad(c)}}).catch(c=>{let h=oi[e];if(h===void 0)throw this.manager.itemError(e),c;delete oi[e];for(let u=0,d=h.length;u<d;u++){let f=h[u];f.onError&&f.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var Us=new WeakMap,Fa=class extends Xn{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=zn.get(`image:${e}`);if(o!==void 0){if(o.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0);else{let u=Us.get(o);u===void 0&&(u=[],Us.set(o,u)),u.push({onLoad:t,onError:s})}return o}let a=ks("img");function l(){h(),t&&t(this);let u=Us.get(this)||[];for(let d=0;d<u.length;d++){let f=u[d];f.onLoad&&f.onLoad(this)}Us.delete(this),r.manager.itemEnd(e)}function c(u){h(),s&&s(u),zn.remove(`image:${e}`);let d=Us.get(this)||[];for(let f=0;f<d.length;f++){let p=d[f];p.onError&&p.onError(u)}Us.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),zn.add(`image:${e}`,a),r.manager.itemStart(e),a.src=e,a}};var lo=class extends Xn{constructor(e){super(e)}load(e,t,n,s){let r=new Nt,o=new Fa(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}},is=class extends ht{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ce(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},co=class extends is{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(ht.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ce(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},$c=new Ge,tf=new E,nf=new E,ho=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new te(512,512),this.mapType=Fn,this.map=null,this.mapPass=null,this.matrix=new Ge,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new qs,this._frameExtents=new te(1,1),this._viewportCount=1,this._viewports=[new tt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;tf.setFromMatrixPosition(e.matrixWorld),t.position.copy(tf),nf.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(nf),t.updateMatrixWorld(),$c.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix($c,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply($c)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},lh=class extends ho{constructor(){super(new It(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=Ji*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}},uo=class extends is{constructor(e,t,n=0,s=Math.PI/3,r=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(ht.DEFAULT_UP),this.updateMatrix(),this.target=new ht,this.distance=n,this.angle=s,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new lh}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},sf=new Ge,wr=new E,Kc=new E,ch=class extends ho{constructor(){super(new It(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new te(4,2),this._viewportCount=6,this._viewports=[new tt(2,1,1,1),new tt(0,1,1,1),new tt(3,1,1,1),new tt(1,1,1,1),new tt(3,0,1,1),new tt(1,0,1,1)],this._cubeDirections=[new E(1,0,0),new E(-1,0,0),new E(0,0,1),new E(0,0,-1),new E(0,1,0),new E(0,-1,0)],this._cubeUps=[new E(0,1,0),new E(0,1,0),new E(0,1,0),new E(0,1,0),new E(0,0,1),new E(0,0,-1)]}updateMatrices(e,t=0){let n=this.camera,s=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),wr.setFromMatrixPosition(e.matrixWorld),n.position.copy(wr),Kc.copy(n.position),Kc.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Kc),n.updateMatrixWorld(),s.makeTranslation(-wr.x,-wr.y,-wr.z),sf.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(sf,n.coordinateSystem,n.reversedDepth)}},ss=class extends is{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new ch}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},pi=class extends Or{constructor(e=-1,t=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,o=n+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},hh=class extends ho{constructor(){super(new pi(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Pi=class extends is{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(ht.DEFAULT_UP),this.updateMatrix(),this.target=new ht,this.shadow=new hh}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};var mi=class{static extractUrlBase(e){let t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}};var Zc=new WeakMap,fo=class extends Xn{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=zn.get(`image-bitmap:${e}`);if(o!==void 0){if(r.manager.itemStart(e),o.then){o.then(c=>{if(Zc.has(o)===!0)s&&s(Zc.get(o)),r.manager.itemError(e),r.manager.itemEnd(e);else return t&&t(c),r.manager.itemEnd(e),c});return}return setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o}let a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader,a.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let l=fetch(e,a).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign(r.options,{colorSpaceConversion:"none"}))}).then(function(c){return zn.add(`image-bitmap:${e}`,c),t&&t(c),r.manager.itemEnd(e),c}).catch(function(c){s&&s(c),Zc.set(l,c),zn.remove(`image-bitmap:${e}`),r.manager.itemError(e),r.manager.itemEnd(e)});zn.add(`image-bitmap:${e}`,l),r.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var Oa=class extends It{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},po=class{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let t=performance.now();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}};var Lh="\\[\\]\\.:\\/",Vg=new RegExp("["+Lh+"]","g"),Dh="[^"+Lh+"]",Hg="[^"+Lh.replace("\\.","")+"]",Gg=/((?:WC+[\/:])*)/.source.replace("WC",Dh),Wg=/(WCOD+)?/.source.replace("WCOD",Hg),Xg=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Dh),qg=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Dh),Yg=new RegExp("^"+Gg+Wg+Xg+qg+"$"),$g=["material","materials","bones","map"],uh=class{constructor(e,t,n){let s=n||dt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},dt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Vg,"")}static parseTrackName(e){let t=Yg.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);$g.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===t||a.uuid===t)return a;let l=n(a.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[s];if(o===void 0){let c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};dt.Composite=uh;dt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};dt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};dt.prototype.GetterByBindingType=[dt.prototype._getValue_direct,dt.prototype._getValue_array,dt.prototype._getValue_arrayElement,dt.prototype._getValue_toArray];dt.prototype.SetterByBindingTypeAndVersioning=[[dt.prototype._setValue_direct,dt.prototype._setValue_direct_setNeedsUpdate,dt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[dt.prototype._setValue_array,dt.prototype._setValue_array_setNeedsUpdate,dt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[dt.prototype._setValue_arrayElement,dt.prototype._setValue_arrayElement_setNeedsUpdate,dt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[dt.prototype._setValue_fromArray,dt.prototype._setValue_fromArray_setNeedsUpdate,dt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var eM=new Float32Array(1);function Nh(i,e,t,n){let s=Kg(n);switch(t){case Mh:return i*e;case rl:return i*e/s.components*s.byteLength;case ol:return i*e/s.components*s.byteLength;case Sh:return i*e*2/s.components*s.byteLength;case al:return i*e*2/s.components*s.byteLength;case bh:return i*e*3/s.components*s.byteLength;case gn:return i*e*4/s.components*s.byteLength;case ll:return i*e*4/s.components*s.byteLength;case _o:case xo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case yo:case vo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case hl:case dl:return Math.max(i,16)*Math.max(e,8)/4;case cl:case ul:return Math.max(i,8)*Math.max(e,8)/2;case fl:case pl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case ml:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case gl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case _l:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case xl:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case yl:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case vl:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Ml:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case bl:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Sl:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Tl:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case wl:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case El:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Al:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Rl:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Cl:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Il:case Pl:case Ll:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Dl:case Nl:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Ul:case Fl:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Kg(i){switch(i){case Fn:case _h:return{byteLength:1,components:1};case tr:case xh:case cn:return{byteLength:2,components:1};case il:case sl:return{byteLength:2,components:4};case Li:case nl:case Sn:return{byteLength:4,components:1};case yh:case vh:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"180"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="180");function _p(){let i=null,e=!1,t=null,n=null;function s(r,o){t(r,o),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function Jg(i){let e=new WeakMap;function t(a,l){let c=a.array,h=a.usage,u=c.byteLength,d=i.createBuffer();i.bindBuffer(l,d),i.bufferData(l,c,h),a.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=i.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function n(a,l,c){let h=l.array,u=l.updateRanges;if(i.bindBuffer(c,a),u.length===0)i.bufferSubData(c,0,h);else{u.sort((f,p)=>f.start-p.start);let d=0;for(let f=1;f<u.length;f++){let p=u[d],_=u[f];_.start<=p.start+p.count+1?p.count=Math.max(p.count,_.start+_.count-p.start):(++d,u[d]=_)}u.length=d+1;for(let f=0,p=u.length;f<p;f++){let _=u[f];i.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=e.get(a);l&&(i.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=e.get(a);(!h||h.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var jg=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Qg=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,e0=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,t0=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,n0=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,i0=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,s0=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,r0=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,o0=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,a0=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,l0=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,c0=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,h0=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,u0=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,d0=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,f0=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,p0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,m0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,g0=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,_0=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,x0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,y0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,v0=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,M0=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,b0=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,S0=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,T0=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,w0=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,E0=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,A0=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,R0="gl_FragColor = linearToOutputTexel( gl_FragColor );",C0=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,I0=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,P0=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,L0=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,D0=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,N0=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,U0=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,F0=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,O0=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,B0=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,k0=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,z0=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,V0=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,H0=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,G0=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,W0=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,X0=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,q0=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Y0=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,$0=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,K0=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Z0=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,J0=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,j0=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Q0=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,e_=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,t_=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,n_=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,i_=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,s_=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,r_=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,o_=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,a_=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,l_=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,c_=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,h_=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,u_=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,d_=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,f_=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,p_=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,m_=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,g_=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,__=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,x_=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,y_=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,v_=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,M_=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,b_=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,S_=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,T_=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,w_=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,E_=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,A_=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,R_=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,C_=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,I_=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,P_=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,L_=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,D_=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,N_=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,U_=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,F_=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,O_=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,B_=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,k_=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,z_=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,V_=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,H_=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,G_=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,W_=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,X_=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,q_=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Y_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,$_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,K_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Z_=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,J_=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,j_=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Q_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,ex=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,tx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,nx=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ix=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,sx=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,rx=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,ox=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,ax=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,lx=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cx=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,hx=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,ux=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,dx=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,fx=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,px=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,mx=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,gx=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,_x=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,xx=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,yx=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,vx=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Mx=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,bx=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Sx=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Tx=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,wx=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Ex=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Ax=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Rx=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Cx=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Ix=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,qe={alphahash_fragment:jg,alphahash_pars_fragment:Qg,alphamap_fragment:e0,alphamap_pars_fragment:t0,alphatest_fragment:n0,alphatest_pars_fragment:i0,aomap_fragment:s0,aomap_pars_fragment:r0,batching_pars_vertex:o0,batching_vertex:a0,begin_vertex:l0,beginnormal_vertex:c0,bsdfs:h0,iridescence_fragment:u0,bumpmap_pars_fragment:d0,clipping_planes_fragment:f0,clipping_planes_pars_fragment:p0,clipping_planes_pars_vertex:m0,clipping_planes_vertex:g0,color_fragment:_0,color_pars_fragment:x0,color_pars_vertex:y0,color_vertex:v0,common:M0,cube_uv_reflection_fragment:b0,defaultnormal_vertex:S0,displacementmap_pars_vertex:T0,displacementmap_vertex:w0,emissivemap_fragment:E0,emissivemap_pars_fragment:A0,colorspace_fragment:R0,colorspace_pars_fragment:C0,envmap_fragment:I0,envmap_common_pars_fragment:P0,envmap_pars_fragment:L0,envmap_pars_vertex:D0,envmap_physical_pars_fragment:W0,envmap_vertex:N0,fog_vertex:U0,fog_pars_vertex:F0,fog_fragment:O0,fog_pars_fragment:B0,gradientmap_pars_fragment:k0,lightmap_pars_fragment:z0,lights_lambert_fragment:V0,lights_lambert_pars_fragment:H0,lights_pars_begin:G0,lights_toon_fragment:X0,lights_toon_pars_fragment:q0,lights_phong_fragment:Y0,lights_phong_pars_fragment:$0,lights_physical_fragment:K0,lights_physical_pars_fragment:Z0,lights_fragment_begin:J0,lights_fragment_maps:j0,lights_fragment_end:Q0,logdepthbuf_fragment:e_,logdepthbuf_pars_fragment:t_,logdepthbuf_pars_vertex:n_,logdepthbuf_vertex:i_,map_fragment:s_,map_pars_fragment:r_,map_particle_fragment:o_,map_particle_pars_fragment:a_,metalnessmap_fragment:l_,metalnessmap_pars_fragment:c_,morphinstance_vertex:h_,morphcolor_vertex:u_,morphnormal_vertex:d_,morphtarget_pars_vertex:f_,morphtarget_vertex:p_,normal_fragment_begin:m_,normal_fragment_maps:g_,normal_pars_fragment:__,normal_pars_vertex:x_,normal_vertex:y_,normalmap_pars_fragment:v_,clearcoat_normal_fragment_begin:M_,clearcoat_normal_fragment_maps:b_,clearcoat_pars_fragment:S_,iridescence_pars_fragment:T_,opaque_fragment:w_,packing:E_,premultiplied_alpha_fragment:A_,project_vertex:R_,dithering_fragment:C_,dithering_pars_fragment:I_,roughnessmap_fragment:P_,roughnessmap_pars_fragment:L_,shadowmap_pars_fragment:D_,shadowmap_pars_vertex:N_,shadowmap_vertex:U_,shadowmask_pars_fragment:F_,skinbase_vertex:O_,skinning_pars_vertex:B_,skinning_vertex:k_,skinnormal_vertex:z_,specularmap_fragment:V_,specularmap_pars_fragment:H_,tonemapping_fragment:G_,tonemapping_pars_fragment:W_,transmission_fragment:X_,transmission_pars_fragment:q_,uv_pars_fragment:Y_,uv_pars_vertex:$_,uv_vertex:K_,worldpos_vertex:Z_,background_vert:J_,background_frag:j_,backgroundCube_vert:Q_,backgroundCube_frag:ex,cube_vert:tx,cube_frag:nx,depth_vert:ix,depth_frag:sx,distanceRGBA_vert:rx,distanceRGBA_frag:ox,equirect_vert:ax,equirect_frag:lx,linedashed_vert:cx,linedashed_frag:hx,meshbasic_vert:ux,meshbasic_frag:dx,meshlambert_vert:fx,meshlambert_frag:px,meshmatcap_vert:mx,meshmatcap_frag:gx,meshnormal_vert:_x,meshnormal_frag:xx,meshphong_vert:yx,meshphong_frag:vx,meshphysical_vert:Mx,meshphysical_frag:bx,meshtoon_vert:Sx,meshtoon_frag:Tx,points_vert:wx,points_frag:Ex,shadow_vert:Ax,shadow_frag:Rx,sprite_vert:Cx,sprite_frag:Ix},pe={common:{diffuse:{value:new Ce(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new We},alphaMap:{value:null},alphaMapTransform:{value:new We},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new We}},envmap:{envMap:{value:null},envMapRotation:{value:new We},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new We}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new We}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new We},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new We},normalScale:{value:new te(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new We},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new We}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new We}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new We}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ce(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ce(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new We},alphaTest:{value:0},uvTransform:{value:new We}},sprite:{diffuse:{value:new Ce(16777215)},opacity:{value:1},center:{value:new te(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new We},alphaMap:{value:null},alphaMapTransform:{value:new We},alphaTest:{value:0}}},Yn={basic:{uniforms:jt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.fog]),vertexShader:qe.meshbasic_vert,fragmentShader:qe.meshbasic_frag},lambert:{uniforms:jt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new Ce(0)}}]),vertexShader:qe.meshlambert_vert,fragmentShader:qe.meshlambert_frag},phong:{uniforms:jt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new Ce(0)},specular:{value:new Ce(1118481)},shininess:{value:30}}]),vertexShader:qe.meshphong_vert,fragmentShader:qe.meshphong_frag},standard:{uniforms:jt([pe.common,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.roughnessmap,pe.metalnessmap,pe.fog,pe.lights,{emissive:{value:new Ce(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:qe.meshphysical_vert,fragmentShader:qe.meshphysical_frag},toon:{uniforms:jt([pe.common,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.gradientmap,pe.fog,pe.lights,{emissive:{value:new Ce(0)}}]),vertexShader:qe.meshtoon_vert,fragmentShader:qe.meshtoon_frag},matcap:{uniforms:jt([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,{matcap:{value:null}}]),vertexShader:qe.meshmatcap_vert,fragmentShader:qe.meshmatcap_frag},points:{uniforms:jt([pe.points,pe.fog]),vertexShader:qe.points_vert,fragmentShader:qe.points_frag},dashed:{uniforms:jt([pe.common,pe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:qe.linedashed_vert,fragmentShader:qe.linedashed_frag},depth:{uniforms:jt([pe.common,pe.displacementmap]),vertexShader:qe.depth_vert,fragmentShader:qe.depth_frag},normal:{uniforms:jt([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,{opacity:{value:1}}]),vertexShader:qe.meshnormal_vert,fragmentShader:qe.meshnormal_frag},sprite:{uniforms:jt([pe.sprite,pe.fog]),vertexShader:qe.sprite_vert,fragmentShader:qe.sprite_frag},background:{uniforms:{uvTransform:{value:new We},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:qe.background_vert,fragmentShader:qe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new We}},vertexShader:qe.backgroundCube_vert,fragmentShader:qe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:qe.cube_vert,fragmentShader:qe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:qe.equirect_vert,fragmentShader:qe.equirect_frag},distanceRGBA:{uniforms:jt([pe.common,pe.displacementmap,{referencePosition:{value:new E},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:qe.distanceRGBA_vert,fragmentShader:qe.distanceRGBA_frag},shadow:{uniforms:jt([pe.lights,pe.fog,{color:{value:new Ce(0)},opacity:{value:1}}]),vertexShader:qe.shadow_vert,fragmentShader:qe.shadow_frag}};Yn.physical={uniforms:jt([Yn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new We},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new We},clearcoatNormalScale:{value:new te(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new We},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new We},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new We},sheen:{value:0},sheenColor:{value:new Ce(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new We},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new We},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new We},transmissionSamplerSize:{value:new te},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new We},attenuationDistance:{value:0},attenuationColor:{value:new Ce(0)},specularColor:{value:new Ce(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new We},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new We},anisotropyVector:{value:new te},anisotropyMap:{value:null},anisotropyMapTransform:{value:new We}}]),vertexShader:qe.meshphysical_vert,fragmentShader:qe.meshphysical_frag};var Bl={r:0,b:0,g:0},cs=new bn,Px=new Ge;function Lx(i,e,t,n,s,r,o){let a=new Ce(0),l=r===!0?0:1,c,h,u=null,d=0,f=null;function p(M){let y=M.isScene===!0?M.background:null;return y&&y.isTexture&&(y=(M.backgroundBlurriness>0?t:e).get(y)),y}function _(M){let y=!1,R=p(M);R===null?g(a,l):R&&R.isColor&&(g(R,1),y=!0);let A=i.xr.getEnvironmentBlendMode();A==="additive"?n.buffers.color.setClear(0,0,0,1,o):A==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||y)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(M,y){let R=p(y);R&&(R.isCubeTexture||R.mapping===go)?(h===void 0&&(h=new lt(new Vn(1,1,1),new Lt({name:"BackgroundCubeMaterial",uniforms:ls(Yn.backgroundCube.uniforms),vertexShader:Yn.backgroundCube.vertexShader,fragmentShader:Yn.backgroundCube.fragmentShader,side:Yt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(A,I,D){this.matrixWorld.copyPosition(D.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),cs.copy(y.backgroundRotation),cs.x*=-1,cs.y*=-1,cs.z*=-1,R.isCubeTexture&&R.isRenderTargetTexture===!1&&(cs.y*=-1,cs.z*=-1),h.material.uniforms.envMap.value=R,h.material.uniforms.flipEnvMap.value=R.isCubeTexture&&R.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=y.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(Px.makeRotationFromEuler(cs)),h.material.toneMapped=$e.getTransfer(R.colorSpace)!==it,(u!==R||d!==R.version||f!==i.toneMapping)&&(h.material.needsUpdate=!0,u=R,d=R.version,f=i.toneMapping),h.layers.enableAll(),M.unshift(h,h.geometry,h.material,0,0,null)):R&&R.isTexture&&(c===void 0&&(c=new lt(new hi(2,2),new Lt({name:"BackgroundMaterial",uniforms:ls(Yn.background.uniforms),vertexShader:Yn.background.vertexShader,fragmentShader:Yn.background.fragmentShader,side:Dn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=R,c.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,c.material.toneMapped=$e.getTransfer(R.colorSpace)!==it,R.matrixAutoUpdate===!0&&R.updateMatrix(),c.material.uniforms.uvTransform.value.copy(R.matrix),(u!==R||d!==R.version||f!==i.toneMapping)&&(c.material.needsUpdate=!0,u=R,d=R.version,f=i.toneMapping),c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null))}function g(M,y){M.getRGB(Bl,Ih(i)),n.buffers.color.setClear(Bl.r,Bl.g,Bl.b,y,o)}function S(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(M,y=1){a.set(M),l=y,g(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(M){l=M,g(a,l)},render:_,addToRenderList:m,dispose:S}}function Dx(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null),r=s,o=!1;function a(b,P,O,z,W){let q=!1,G=u(z,O,P);r!==G&&(r=G,c(r.object)),q=f(b,z,O,W),q&&p(b,z,O,W),W!==null&&e.update(W,i.ELEMENT_ARRAY_BUFFER),(q||o)&&(o=!1,y(b,P,O,z),W!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(W).buffer))}function l(){return i.createVertexArray()}function c(b){return i.bindVertexArray(b)}function h(b){return i.deleteVertexArray(b)}function u(b,P,O){let z=O.wireframe===!0,W=n[b.id];W===void 0&&(W={},n[b.id]=W);let q=W[P.id];q===void 0&&(q={},W[P.id]=q);let G=q[z];return G===void 0&&(G=d(l()),q[z]=G),G}function d(b){let P=[],O=[],z=[];for(let W=0;W<t;W++)P[W]=0,O[W]=0,z[W]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:O,attributeDivisors:z,object:b,attributes:{},index:null}}function f(b,P,O,z){let W=r.attributes,q=P.attributes,G=0,ne=O.getAttributes();for(let H in ne)if(ne[H].location>=0){let ye=W[H],be=q[H];if(be===void 0&&(H==="instanceMatrix"&&b.instanceMatrix&&(be=b.instanceMatrix),H==="instanceColor"&&b.instanceColor&&(be=b.instanceColor)),ye===void 0||ye.attribute!==be||be&&ye.data!==be.data)return!0;G++}return r.attributesNum!==G||r.index!==z}function p(b,P,O,z){let W={},q=P.attributes,G=0,ne=O.getAttributes();for(let H in ne)if(ne[H].location>=0){let ye=q[H];ye===void 0&&(H==="instanceMatrix"&&b.instanceMatrix&&(ye=b.instanceMatrix),H==="instanceColor"&&b.instanceColor&&(ye=b.instanceColor));let be={};be.attribute=ye,ye&&ye.data&&(be.data=ye.data),W[H]=be,G++}r.attributes=W,r.attributesNum=G,r.index=z}function _(){let b=r.newAttributes;for(let P=0,O=b.length;P<O;P++)b[P]=0}function m(b){g(b,0)}function g(b,P){let O=r.newAttributes,z=r.enabledAttributes,W=r.attributeDivisors;O[b]=1,z[b]===0&&(i.enableVertexAttribArray(b),z[b]=1),W[b]!==P&&(i.vertexAttribDivisor(b,P),W[b]=P)}function S(){let b=r.newAttributes,P=r.enabledAttributes;for(let O=0,z=P.length;O<z;O++)P[O]!==b[O]&&(i.disableVertexAttribArray(O),P[O]=0)}function M(b,P,O,z,W,q,G){G===!0?i.vertexAttribIPointer(b,P,O,W,q):i.vertexAttribPointer(b,P,O,z,W,q)}function y(b,P,O,z){_();let W=z.attributes,q=O.getAttributes(),G=P.defaultAttributeValues;for(let ne in q){let H=q[ne];if(H.location>=0){let de=W[ne];if(de===void 0&&(ne==="instanceMatrix"&&b.instanceMatrix&&(de=b.instanceMatrix),ne==="instanceColor"&&b.instanceColor&&(de=b.instanceColor)),de!==void 0){let ye=de.normalized,be=de.itemSize,He=e.get(de);if(He===void 0)continue;let je=He.buffer,ot=He.type,Qe=He.bytesPerElement,Y=ot===i.INT||ot===i.UNSIGNED_INT||de.gpuType===nl;if(de.isInterleavedBufferAttribute){let ee=de.data,Me=ee.stride,De=de.offset;if(ee.isInstancedInterleavedBuffer){for(let we=0;we<H.locationSize;we++)g(H.location+we,ee.meshPerAttribute);b.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=ee.meshPerAttribute*ee.count)}else for(let we=0;we<H.locationSize;we++)m(H.location+we);i.bindBuffer(i.ARRAY_BUFFER,je);for(let we=0;we<H.locationSize;we++)M(H.location+we,be/H.locationSize,ot,ye,Me*Qe,(De+be/H.locationSize*we)*Qe,Y)}else{if(de.isInstancedBufferAttribute){for(let ee=0;ee<H.locationSize;ee++)g(H.location+ee,de.meshPerAttribute);b.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=de.meshPerAttribute*de.count)}else for(let ee=0;ee<H.locationSize;ee++)m(H.location+ee);i.bindBuffer(i.ARRAY_BUFFER,je);for(let ee=0;ee<H.locationSize;ee++)M(H.location+ee,be/H.locationSize,ot,ye,be*Qe,be/H.locationSize*ee*Qe,Y)}}else if(G!==void 0){let ye=G[ne];if(ye!==void 0)switch(ye.length){case 2:i.vertexAttrib2fv(H.location,ye);break;case 3:i.vertexAttrib3fv(H.location,ye);break;case 4:i.vertexAttrib4fv(H.location,ye);break;default:i.vertexAttrib1fv(H.location,ye)}}}}S()}function R(){D();for(let b in n){let P=n[b];for(let O in P){let z=P[O];for(let W in z)h(z[W].object),delete z[W];delete P[O]}delete n[b]}}function A(b){if(n[b.id]===void 0)return;let P=n[b.id];for(let O in P){let z=P[O];for(let W in z)h(z[W].object),delete z[W];delete P[O]}delete n[b.id]}function I(b){for(let P in n){let O=n[P];if(O[b.id]===void 0)continue;let z=O[b.id];for(let W in z)h(z[W].object),delete z[W];delete O[b.id]}}function D(){T(),o=!0,r!==s&&(r=s,c(r.object))}function T(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:D,resetDefaultState:T,dispose:R,releaseStatesOfGeometry:A,releaseStatesOfProgram:I,initAttributes:_,enableAttribute:m,disableUnusedAttributes:S}}function Nx(i,e,t){let n;function s(c){n=c}function r(c,h){i.drawArrays(n,c,h),t.update(h,n,1)}function o(c,h,u){u!==0&&(i.drawArraysInstanced(n,c,h,u),t.update(h,n,u))}function a(c,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let f=0;for(let p=0;p<u;p++)f+=h[p];t.update(f,n,1)}function l(c,h,u,d){if(u===0)return;let f=e.get("WEBGL_multi_draw");if(f===null)for(let p=0;p<c.length;p++)o(c[p],h[p],d[p]);else{f.multiDrawArraysInstancedWEBGL(n,c,0,h,0,d,0,u);let p=0;for(let _=0;_<u;_++)p+=h[_]*d[_];t.update(p,n,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function Ux(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let I=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(I.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(I){return!(I!==gn&&n.convert(I)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(I){let D=I===cn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(I!==Fn&&n.convert(I)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&I!==Sn&&!D)}function l(I){if(I==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";I="mediump"}return I==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let u=t.logarithmicDepthBuffer===!0,d=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),p=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),g=i.getParameter(i.MAX_VERTEX_ATTRIBS),S=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),M=i.getParameter(i.MAX_VARYING_VECTORS),y=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),R=p>0,A=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:p,maxTextureSize:_,maxCubemapSize:m,maxAttributes:g,maxVertexUniforms:S,maxVaryings:M,maxFragmentUniforms:y,vertexTextures:R,maxSamples:A}}function Fx(i){let e=this,t=null,n=0,s=!1,r=!1,o=new Bn,a=new We,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let f=u.length!==0||d||n!==0||s;return s=d,n=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){t=h(u,d,0)},this.setState=function(u,d,f){let p=u.clippingPlanes,_=u.clipIntersection,m=u.clipShadows,g=i.get(u);if(!s||p===null||p.length===0||r&&!m)r?h(null):c();else{let S=r?0:n,M=S*4,y=g.clippingState||null;l.value=y,y=h(p,d,M,f);for(let R=0;R!==M;++R)y[R]=t[R];g.clippingState=y,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=S}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,d,f,p){let _=u!==null?u.length:0,m=null;if(_!==0){if(m=l.value,p!==!0||m===null){let g=f+_*4,S=d.matrixWorldInverse;a.getNormalMatrix(S),(m===null||m.length<g)&&(m=new Float32Array(g));for(let M=0,y=f;M!==_;++M,y+=4)o.copy(u[M]).applyMatrix4(S,a),o.normal.toArray(m,y),m[y+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,m}}function Ox(i){let e=new WeakMap;function t(o,a){return a===Qa?o.mapping=rs:a===el&&(o.mapping=os),o}function n(o){if(o&&o.isTexture){let a=o.mapping;if(a===Qa||a===el)if(e.has(o)){let l=e.get(o).texture;return t(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let c=new va(l.height);return c.fromEquirectangularTexture(i,o),e.set(o,c),o.addEventListener("dispose",s),t(c.texture,o.mapping)}else return null}}return o}function s(o){let a=o.target;a.removeEventListener("dispose",s);let l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}var or=4,$f=[.125,.215,.35,.446,.526,.582],ds=20,Uh=new pi,Kf=new Ce,Fh=null,Oh=0,Bh=0,kh=!1,us=(1+Math.sqrt(5))/2,rr=1/us,Zf=[new E(-us,rr,0),new E(us,rr,0),new E(-rr,0,us),new E(rr,0,us),new E(0,us,-rr),new E(0,us,rr),new E(-1,1,-1),new E(1,1,-1),new E(-1,1,1),new E(1,1,1)],Bx=new E,lr=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,s=100,r={}){let{size:o=256,position:a=Bx}=r;Fh=this._renderer.getRenderTarget(),Oh=this._renderer.getActiveCubeFace(),Bh=this._renderer.getActiveMipmapLevel(),kh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,a),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Qf(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=jf(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Fh,Oh,Bh),this._renderer.xr.enabled=kh,e.scissorTest=!1,kl(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===rs||e.mapping===os?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Fh=this._renderer.getRenderTarget(),Oh=this._renderer.getActiveCubeFace(),Bh=this._renderer.getActiveMipmapLevel(),kh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:tn,minFilter:tn,generateMipmaps:!1,type:cn,format:gn,colorSpace:Xt,depthBuffer:!1},s=Jf(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Jf(e,t,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=kx(r)),this._blurMaterial=zx(r,e,t)}return s}_compileMaterial(e){let t=new lt(this._lodPlanes[0],e);this._renderer.compile(t,Uh)}_sceneToCubeUV(e,t,n,s,r){let l=new It(90,1,t,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,f=u.toneMapping;u.getClearColor(Kf),u.toneMapping=gi,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(s),u.clearDepth(),u.setRenderTarget(null));let _=new zt({name:"PMREM.Background",side:Yt,depthWrite:!1,depthTest:!1}),m=new lt(new Vn,_),g=!1,S=e.background;S?S.isColor&&(_.color.copy(S),e.background=null,g=!0):(_.color.copy(Kf),g=!0);for(let M=0;M<6;M++){let y=M%3;y===0?(l.up.set(0,c[M],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[M],r.y,r.z)):y===1?(l.up.set(0,0,c[M]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[M],r.z)):(l.up.set(0,c[M],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[M]));let R=this._cubeSize;kl(s,y*R,M>2?R:0,R,R),u.setRenderTarget(s),g&&u.render(m,l),u.render(e,l)}m.geometry.dispose(),m.material.dispose(),u.toneMapping=f,u.autoClear=d,e.background=S}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===rs||e.mapping===os;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Qf()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=jf());let r=s?this._cubemapMaterial:this._equirectMaterial,o=new lt(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;let l=this._cubeSize;kl(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,Uh)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodPlanes.length;for(let r=1;r<s;r++){let o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=Zf[(s-r-1)%Zf.length];this._blur(e,r-1,r,o,a)}t.autoClear=n}_blur(e,t,n,s,r){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,s,"latitudinal",r),this._halfBlur(o,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,o,a){let l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let h=3,u=new lt(this._lodPlanes[s],c),d=c.uniforms,f=this._sizeLods[n]-1,p=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*ds-1),_=r/p,m=isFinite(r)?1+Math.floor(h*_):ds;m>ds&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ds}`);let g=[],S=0;for(let I=0;I<ds;++I){let D=I/_,T=Math.exp(-D*D/2);g.push(T),I===0?S+=T:I<m&&(S+=2*T)}for(let I=0;I<g.length;I++)g[I]=g[I]/S;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=g,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);let{_lodMax:M}=this;d.dTheta.value=p,d.mipInt.value=M-n;let y=this._sizeLods[s],R=3*y*(s>M-or?s-M+or:0),A=4*(this._cubeSize-y);kl(t,R,A,3*y,2*y),l.setRenderTarget(t),l.render(u,Uh)}};function kx(i){let e=[],t=[],n=[],s=i,r=i-or+1+$f.length;for(let o=0;o<r;o++){let a=Math.pow(2,s);t.push(a);let l=1/a;o>i-or?l=$f[o-i+or-1]:o===0&&(l=0),n.push(l);let c=1/(a-2),h=-c,u=1+c,d=[h,h,u,h,u,u,h,h,u,u,h,u],f=6,p=6,_=3,m=2,g=1,S=new Float32Array(_*p*f),M=new Float32Array(m*p*f),y=new Float32Array(g*p*f);for(let A=0;A<f;A++){let I=A%3*2/3-1,D=A>2?0:-1,T=[I,D,0,I+2/3,D,0,I+2/3,D+1,0,I,D,0,I+2/3,D+1,0,I,D+1,0];S.set(T,_*p*A),M.set(d,m*p*A);let b=[A,A,A,A,A,A];y.set(b,g*p*A)}let R=new Vt;R.setAttribute("position",new Pt(S,_)),R.setAttribute("uv",new Pt(M,m)),R.setAttribute("faceIndex",new Pt(y,g)),e.push(R),s>or&&s--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function Jf(i,e,t){let n=new kt(i,e,t);return n.texture.mapping=go,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function kl(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function zx(i,e,t){let n=new Float32Array(ds),s=new E(0,1,0);return new Lt({name:"SphericalGaussianBlur",defines:{n:ds,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Kh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Nn,depthTest:!1,depthWrite:!1})}function jf(){return new Lt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Kh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Nn,depthTest:!1,depthWrite:!1})}function Qf(){return new Lt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Kh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Nn,depthTest:!1,depthWrite:!1})}function Kh(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Vx(i){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){let l=a.mapping,c=l===Qa||l===el,h=l===rs||l===os;if(c||h){let u=e.get(a),d=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==d)return t===null&&(t=new lr(i)),u=c?t.fromEquirectangular(a,u):t.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),u.texture;if(u!==void 0)return u.texture;{let f=a.image;return c&&f&&f.height>0||h&&f&&s(f)?(t===null&&(t=new lr(i)),u=c?t.fromEquirectangular(a):t.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),a.addEventListener("dispose",r),u.texture):null}}}return a}function s(a){let l=0,c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function r(a){let l=a.target;l.removeEventListener("dispose",r);let c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function Hx(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&zs("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function Gx(i,e,t,n){let s={},r=new WeakMap;function o(u){let d=u.target;d.index!==null&&e.remove(d.index);for(let p in d.attributes)e.remove(d.attributes[p]);d.removeEventListener("dispose",o),delete s[d.id];let f=r.get(d);f&&(e.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function a(u,d){return s[d.id]===!0||(d.addEventListener("dispose",o),s[d.id]=!0,t.memory.geometries++),d}function l(u){let d=u.attributes;for(let f in d)e.update(d[f],i.ARRAY_BUFFER)}function c(u){let d=[],f=u.index,p=u.attributes.position,_=0;if(f!==null){let S=f.array;_=f.version;for(let M=0,y=S.length;M<y;M+=3){let R=S[M+0],A=S[M+1],I=S[M+2];d.push(R,A,A,I,I,R)}}else if(p!==void 0){let S=p.array;_=p.version;for(let M=0,y=S.length/3-1;M<y;M+=3){let R=M+0,A=M+1,I=M+2;d.push(R,A,A,I,I,R)}}else return;let m=new(Ch(d)?Fr:Ur)(d,1);m.version=_;let g=r.get(u);g&&e.remove(g),r.set(u,m)}function h(u){let d=r.get(u);if(d){let f=u.index;f!==null&&d.version<f.version&&c(u)}else c(u);return r.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function Wx(i,e,t){let n;function s(d){n=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function l(d,f){i.drawElements(n,f,r,d*o),t.update(f,n,1)}function c(d,f,p){p!==0&&(i.drawElementsInstanced(n,f,r,d*o,p),t.update(f,n,p))}function h(d,f,p){if(p===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,r,d,0,p);let m=0;for(let g=0;g<p;g++)m+=f[g];t.update(m,n,1)}function u(d,f,p,_){if(p===0)return;let m=e.get("WEBGL_multi_draw");if(m===null)for(let g=0;g<d.length;g++)c(d[g]/o,f[g],_[g]);else{m.multiDrawElementsInstancedWEBGL(n,f,0,r,d,0,_,0,p);let g=0;for(let S=0;S<p;S++)g+=f[S]*_[S];t.update(g,n,1)}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function Xx(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(r/3);break;case i.LINES:t.lines+=a*(r/2);break;case i.LINE_STRIP:t.lines+=a*(r-1);break;case i.LINE_LOOP:t.lines+=a*r;break;case i.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function qx(i,e,t){let n=new WeakMap,s=new tt;function r(o,a,l){let c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0,d=n.get(a);if(d===void 0||d.count!==u){let T=function(){I.dispose(),n.delete(a),a.removeEventListener("dispose",T)};d!==void 0&&d.texture.dispose();let f=a.morphAttributes.position!==void 0,p=a.morphAttributes.normal!==void 0,_=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],g=a.morphAttributes.normal||[],S=a.morphAttributes.color||[],M=0;f===!0&&(M=1),p===!0&&(M=2),_===!0&&(M=3);let y=a.attributes.position.count*M,R=1;y>e.maxTextureSize&&(R=Math.ceil(y/e.maxTextureSize),y=e.maxTextureSize);let A=new Float32Array(y*R*4*u),I=new Dr(A,y,R,u);I.type=Sn,I.needsUpdate=!0;let D=M*4;for(let b=0;b<u;b++){let P=m[b],O=g[b],z=S[b],W=y*R*4*b;for(let q=0;q<P.count;q++){let G=q*D;f===!0&&(s.fromBufferAttribute(P,q),A[W+G+0]=s.x,A[W+G+1]=s.y,A[W+G+2]=s.z,A[W+G+3]=0),p===!0&&(s.fromBufferAttribute(O,q),A[W+G+4]=s.x,A[W+G+5]=s.y,A[W+G+6]=s.z,A[W+G+7]=0),_===!0&&(s.fromBufferAttribute(z,q),A[W+G+8]=s.x,A[W+G+9]=s.y,A[W+G+10]=s.z,A[W+G+11]=z.itemSize===4?s.w:1)}}d={count:u,texture:I,size:new te(y,R)},n.set(a,d),a.addEventListener("dispose",T)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let f=0;for(let _=0;_<c.length;_++)f+=c[_];let p=a.morphTargetsRelative?1:1-f;l.getUniforms().setValue(i,"morphTargetBaseInfluence",p),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",d.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function Yx(i,e,t,n){let s=new WeakMap;function r(l){let c=n.render.frame,h=l.geometry,u=e.get(l,h);if(s.get(u)!==c&&(e.update(u),s.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){let d=l.skeleton;s.get(d)!==c&&(d.update(),s.set(d,c))}return u}function o(){s=new WeakMap}function a(l){let c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:o}}var xp=new Nt,ep=new Yr(1,1),yp=new Dr,vp=new xa,Mp=new Br,tp=[],np=[],ip=new Float32Array(16),sp=new Float32Array(9),rp=new Float32Array(4);function cr(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=tp[s];if(r===void 0&&(r=new Float32Array(s),tp[s]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(r,a)}return r}function Ut(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Ft(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Hl(i,e){let t=np[e];t===void 0&&(t=new Int32Array(e),np[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function $x(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function Kx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ut(t,e))return;i.uniform2fv(this.addr,e),Ft(t,e)}}function Zx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Ut(t,e))return;i.uniform3fv(this.addr,e),Ft(t,e)}}function Jx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ut(t,e))return;i.uniform4fv(this.addr,e),Ft(t,e)}}function jx(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Ut(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Ft(t,e)}else{if(Ut(t,n))return;rp.set(n),i.uniformMatrix2fv(this.addr,!1,rp),Ft(t,n)}}function Qx(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Ut(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Ft(t,e)}else{if(Ut(t,n))return;sp.set(n),i.uniformMatrix3fv(this.addr,!1,sp),Ft(t,n)}}function ey(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Ut(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Ft(t,e)}else{if(Ut(t,n))return;ip.set(n),i.uniformMatrix4fv(this.addr,!1,ip),Ft(t,n)}}function ty(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function ny(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ut(t,e))return;i.uniform2iv(this.addr,e),Ft(t,e)}}function iy(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ut(t,e))return;i.uniform3iv(this.addr,e),Ft(t,e)}}function sy(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ut(t,e))return;i.uniform4iv(this.addr,e),Ft(t,e)}}function ry(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function oy(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ut(t,e))return;i.uniform2uiv(this.addr,e),Ft(t,e)}}function ay(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ut(t,e))return;i.uniform3uiv(this.addr,e),Ft(t,e)}}function ly(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ut(t,e))return;i.uniform4uiv(this.addr,e),Ft(t,e)}}function cy(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(ep.compareFunction=wh,r=ep):r=xp,t.setTexture2D(e||r,s)}function hy(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||vp,s)}function uy(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||Mp,s)}function dy(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||yp,s)}function fy(i){switch(i){case 5126:return $x;case 35664:return Kx;case 35665:return Zx;case 35666:return Jx;case 35674:return jx;case 35675:return Qx;case 35676:return ey;case 5124:case 35670:return ty;case 35667:case 35671:return ny;case 35668:case 35672:return iy;case 35669:case 35673:return sy;case 5125:return ry;case 36294:return oy;case 36295:return ay;case 36296:return ly;case 35678:case 36198:case 36298:case 36306:case 35682:return cy;case 35679:case 36299:case 36307:return hy;case 35680:case 36300:case 36308:case 36293:return uy;case 36289:case 36303:case 36311:case 36292:return dy}}function py(i,e){i.uniform1fv(this.addr,e)}function my(i,e){let t=cr(e,this.size,2);i.uniform2fv(this.addr,t)}function gy(i,e){let t=cr(e,this.size,3);i.uniform3fv(this.addr,t)}function _y(i,e){let t=cr(e,this.size,4);i.uniform4fv(this.addr,t)}function xy(i,e){let t=cr(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function yy(i,e){let t=cr(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function vy(i,e){let t=cr(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function My(i,e){i.uniform1iv(this.addr,e)}function by(i,e){i.uniform2iv(this.addr,e)}function Sy(i,e){i.uniform3iv(this.addr,e)}function Ty(i,e){i.uniform4iv(this.addr,e)}function wy(i,e){i.uniform1uiv(this.addr,e)}function Ey(i,e){i.uniform2uiv(this.addr,e)}function Ay(i,e){i.uniform3uiv(this.addr,e)}function Ry(i,e){i.uniform4uiv(this.addr,e)}function Cy(i,e,t){let n=this.cache,s=e.length,r=Hl(t,s);Ut(n,r)||(i.uniform1iv(this.addr,r),Ft(n,r));for(let o=0;o!==s;++o)t.setTexture2D(e[o]||xp,r[o])}function Iy(i,e,t){let n=this.cache,s=e.length,r=Hl(t,s);Ut(n,r)||(i.uniform1iv(this.addr,r),Ft(n,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||vp,r[o])}function Py(i,e,t){let n=this.cache,s=e.length,r=Hl(t,s);Ut(n,r)||(i.uniform1iv(this.addr,r),Ft(n,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||Mp,r[o])}function Ly(i,e,t){let n=this.cache,s=e.length,r=Hl(t,s);Ut(n,r)||(i.uniform1iv(this.addr,r),Ft(n,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||yp,r[o])}function Dy(i){switch(i){case 5126:return py;case 35664:return my;case 35665:return gy;case 35666:return _y;case 35674:return xy;case 35675:return yy;case 35676:return vy;case 5124:case 35670:return My;case 35667:case 35671:return by;case 35668:case 35672:return Sy;case 35669:case 35673:return Ty;case 5125:return wy;case 36294:return Ey;case 36295:return Ay;case 36296:return Ry;case 35678:case 36198:case 36298:case 36306:case 35682:return Cy;case 35679:case 36299:case 36307:return Iy;case 35680:case 36300:case 36308:case 36293:return Py;case 36289:case 36303:case 36311:case 36292:return Ly}}var Vh=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=fy(t.type)}},Hh=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Dy(t.type)}},Gh=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(e,t[a.id],n)}}},zh=/(\w+)(\])?(\[|\.)?/g;function op(i,e){i.seq.push(e),i.map[e.id]=e}function Ny(i,e,t){let n=i.name,s=n.length;for(zh.lastIndex=0;;){let r=zh.exec(n),o=zh.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){op(t,c===void 0?new Vh(a,i,e):new Hh(a,i,e));break}else{let u=t.map[a];u===void 0&&(u=new Gh(a),op(t,u)),t=u}}}var ar=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){let r=e.getActiveUniform(t,s),o=e.getUniformLocation(t,r.name);Ny(r,o,this)}}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,o=t.length;r!==o;++r){let a=t[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let o=e[s];o.id in t&&n.push(o)}return n}};function ap(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var Uy=37297,Fy=0;function Oy(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){let a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}var lp=new We;function By(i){$e._getMatrix(lp,$e.workingColorSpace,i);let e=`mat3( ${lp.elements.map(t=>t.toFixed(4))} )`;switch($e.getTransfer(i)){case Pr:return[e,"LinearTransferOETF"];case it:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function cp(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+Oy(i.getShaderSource(e),a)}else return r}function ky(i,e){let t=By(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function zy(i,e){let t;switch(e){case Ya:t="Linear";break;case $a:t="Reinhard";break;case Ka:t="Cineon";break;case Qs:t="ACESFilmic";break;case Ja:t="AgX";break;case ja:t="Neutral";break;case Za:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var zl=new E;function Vy(){$e.getLuminanceCoefficients(zl);let i=zl.x.toFixed(4),e=zl.y.toFixed(4),t=zl.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Hy(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(bo).join(`
`)}function Gy(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function Wy(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),o=r.name,a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function bo(i){return i!==""}function hp(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function up(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var Xy=/^[ \t]*#include +<([\w\d./]+)>/gm;function Wh(i){return i.replace(Xy,Yy)}var qy=new Map;function Yy(i,e){let t=qe[e];if(t===void 0){let n=qy.get(e);if(n!==void 0)t=qe[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Wh(t)}var $y=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function dp(i){return i.replace($y,Ky)}function Ky(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function fp(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function Zy(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===fh?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===Ba?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===qn&&(e="SHADOWMAP_TYPE_VSM"),e}function Jy(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case rs:case os:e="ENVMAP_TYPE_CUBE";break;case go:e="ENVMAP_TYPE_CUBE_UV";break}return e}function jy(i){let e="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case os:e="ENVMAP_MODE_REFRACTION";break}return e}function Qy(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case qa:e="ENVMAP_BLENDING_MULTIPLY";break;case wf:e="ENVMAP_BLENDING_MIX";break;case Ef:e="ENVMAP_BLENDING_ADD";break}return e}function ev(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function tv(i,e,t,n){let s=i.getContext(),r=t.defines,o=t.vertexShader,a=t.fragmentShader,l=Zy(t),c=Jy(t),h=jy(t),u=Qy(t),d=ev(t),f=Hy(t),p=Gy(r),_=s.createProgram(),m,g,S=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p].filter(bo).join(`
`),m.length>0&&(m+=`
`),g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p].filter(bo).join(`
`),g.length>0&&(g+=`
`)):(m=[fp(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(bo).join(`
`),g=[fp(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==gi?"#define TONE_MAPPING":"",t.toneMapping!==gi?qe.tonemapping_pars_fragment:"",t.toneMapping!==gi?zy("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",qe.colorspace_pars_fragment,ky("linearToOutputTexel",t.outputColorSpace),Vy(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(bo).join(`
`)),o=Wh(o),o=hp(o,t),o=up(o,t),a=Wh(a),a=hp(a,t),a=up(a,t),o=dp(o),a=dp(a),t.isRawShaderMaterial!==!0&&(S=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,g=["#define varying in",t.glslVersion===Eh?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Eh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);let M=S+m+o,y=S+g+a,R=ap(s,s.VERTEX_SHADER,M),A=ap(s,s.FRAGMENT_SHADER,y);s.attachShader(_,R),s.attachShader(_,A),t.index0AttributeName!==void 0?s.bindAttribLocation(_,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function I(P){if(i.debug.checkShaderErrors){let O=s.getProgramInfoLog(_)||"",z=s.getShaderInfoLog(R)||"",W=s.getShaderInfoLog(A)||"",q=O.trim(),G=z.trim(),ne=W.trim(),H=!0,de=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(H=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,_,R,A);else{let ye=cp(s,R,"vertex"),be=cp(s,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+q+`
`+ye+`
`+be)}else q!==""?console.warn("THREE.WebGLProgram: Program Info Log:",q):(G===""||ne==="")&&(de=!1);de&&(P.diagnostics={runnable:H,programLog:q,vertexShader:{log:G,prefix:m},fragmentShader:{log:ne,prefix:g}})}s.deleteShader(R),s.deleteShader(A),D=new ar(s,_),T=Wy(s,_)}let D;this.getUniforms=function(){return D===void 0&&I(this),D};let T;this.getAttributes=function(){return T===void 0&&I(this),T};let b=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return b===!1&&(b=s.getProgramParameter(_,Uy)),b},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Fy++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=R,this.fragmentShader=A,this}var nv=0,Xh=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new qh(e),t.set(e,n)),n}},qh=class{constructor(e){this.id=nv++,this.code=e,this.usedTimes=0}};function iv(i,e,t,n,s,r,o){let a=new Nr,l=new Xh,c=new Set,h=[],u=s.logarithmicDepthBuffer,d=s.vertexTextures,f=s.precision,p={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(T){return c.add(T),T===0?"uv":`uv${T}`}function m(T,b,P,O,z){let W=O.fog,q=z.geometry,G=T.isMeshStandardMaterial?O.environment:null,ne=(T.isMeshStandardMaterial?t:e).get(T.envMap||G),H=ne&&ne.mapping===go?ne.image.height:null,de=p[T.type];T.precision!==null&&(f=s.getMaxPrecision(T.precision),f!==T.precision&&console.warn("THREE.WebGLProgram.getParameters:",T.precision,"not supported, using",f,"instead."));let ye=q.morphAttributes.position||q.morphAttributes.normal||q.morphAttributes.color,be=ye!==void 0?ye.length:0,He=0;q.morphAttributes.position!==void 0&&(He=1),q.morphAttributes.normal!==void 0&&(He=2),q.morphAttributes.color!==void 0&&(He=3);let je,ot,Qe,Y;if(de){let st=Yn[de];je=st.vertexShader,ot=st.fragmentShader}else je=T.vertexShader,ot=T.fragmentShader,l.update(T),Qe=l.getVertexShaderID(T),Y=l.getFragmentShaderID(T);let ee=i.getRenderTarget(),Me=i.state.buffers.depth.getReversed(),De=z.isInstancedMesh===!0,we=z.isBatchedMesh===!0,Ze=!!T.map,ft=!!T.matcap,C=!!ne,Q=!!T.aoMap,Z=!!T.lightMap,K=!!T.bumpMap,$=!!T.normalMap,he=!!T.displacementMap,ie=!!T.emissiveMap,ue=!!T.metalnessMap,ze=!!T.roughnessMap,ke=T.anisotropy>0,w=T.clearcoat>0,x=T.dispersion>0,F=T.iridescence>0,V=T.sheen>0,j=T.transmission>0,X=ke&&!!T.anisotropyMap,Ie=w&&!!T.clearcoatMap,ce=w&&!!T.clearcoatNormalMap,Ee=w&&!!T.clearcoatRoughnessMap,Ae=F&&!!T.iridescenceMap,se=F&&!!T.iridescenceThicknessMap,_e=V&&!!T.sheenColorMap,Oe=V&&!!T.sheenRoughnessMap,Pe=!!T.specularMap,me=!!T.specularColorMap,Xe=!!T.specularIntensityMap,L=j&&!!T.transmissionMap,ae=j&&!!T.thicknessMap,fe=!!T.gradientMap,Se=!!T.alphaMap,re=T.alphaTest>0,J=!!T.alphaHash,Re=!!T.extensions,Ve=gi;T.toneMapped&&(ee===null||ee.isXRRenderTarget===!0)&&(Ve=i.toneMapping);let pt={shaderID:de,shaderType:T.type,shaderName:T.name,vertexShader:je,fragmentShader:ot,defines:T.defines,customVertexShaderID:Qe,customFragmentShaderID:Y,isRawShaderMaterial:T.isRawShaderMaterial===!0,glslVersion:T.glslVersion,precision:f,batching:we,batchingColor:we&&z._colorsTexture!==null,instancing:De,instancingColor:De&&z.instanceColor!==null,instancingMorph:De&&z.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:ee===null?i.outputColorSpace:ee.isXRRenderTarget===!0?ee.texture.colorSpace:Xt,alphaToCoverage:!!T.alphaToCoverage,map:Ze,matcap:ft,envMap:C,envMapMode:C&&ne.mapping,envMapCubeUVHeight:H,aoMap:Q,lightMap:Z,bumpMap:K,normalMap:$,displacementMap:d&&he,emissiveMap:ie,normalMapObjectSpace:$&&T.normalMapType===Pf,normalMapTangentSpace:$&&T.normalMapType===Ol,metalnessMap:ue,roughnessMap:ze,anisotropy:ke,anisotropyMap:X,clearcoat:w,clearcoatMap:Ie,clearcoatNormalMap:ce,clearcoatRoughnessMap:Ee,dispersion:x,iridescence:F,iridescenceMap:Ae,iridescenceThicknessMap:se,sheen:V,sheenColorMap:_e,sheenRoughnessMap:Oe,specularMap:Pe,specularColorMap:me,specularIntensityMap:Xe,transmission:j,transmissionMap:L,thicknessMap:ae,gradientMap:fe,opaque:T.transparent===!1&&T.blending===Yi&&T.alphaToCoverage===!1,alphaMap:Se,alphaTest:re,alphaHash:J,combine:T.combine,mapUv:Ze&&_(T.map.channel),aoMapUv:Q&&_(T.aoMap.channel),lightMapUv:Z&&_(T.lightMap.channel),bumpMapUv:K&&_(T.bumpMap.channel),normalMapUv:$&&_(T.normalMap.channel),displacementMapUv:he&&_(T.displacementMap.channel),emissiveMapUv:ie&&_(T.emissiveMap.channel),metalnessMapUv:ue&&_(T.metalnessMap.channel),roughnessMapUv:ze&&_(T.roughnessMap.channel),anisotropyMapUv:X&&_(T.anisotropyMap.channel),clearcoatMapUv:Ie&&_(T.clearcoatMap.channel),clearcoatNormalMapUv:ce&&_(T.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ee&&_(T.clearcoatRoughnessMap.channel),iridescenceMapUv:Ae&&_(T.iridescenceMap.channel),iridescenceThicknessMapUv:se&&_(T.iridescenceThicknessMap.channel),sheenColorMapUv:_e&&_(T.sheenColorMap.channel),sheenRoughnessMapUv:Oe&&_(T.sheenRoughnessMap.channel),specularMapUv:Pe&&_(T.specularMap.channel),specularColorMapUv:me&&_(T.specularColorMap.channel),specularIntensityMapUv:Xe&&_(T.specularIntensityMap.channel),transmissionMapUv:L&&_(T.transmissionMap.channel),thicknessMapUv:ae&&_(T.thicknessMap.channel),alphaMapUv:Se&&_(T.alphaMap.channel),vertexTangents:!!q.attributes.tangent&&($||ke),vertexColors:T.vertexColors,vertexAlphas:T.vertexColors===!0&&!!q.attributes.color&&q.attributes.color.itemSize===4,pointsUvs:z.isPoints===!0&&!!q.attributes.uv&&(Ze||Se),fog:!!W,useFog:T.fog===!0,fogExp2:!!W&&W.isFogExp2,flatShading:T.flatShading===!0&&T.wireframe===!1,sizeAttenuation:T.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:Me,skinning:z.isSkinnedMesh===!0,morphTargets:q.morphAttributes.position!==void 0,morphNormals:q.morphAttributes.normal!==void 0,morphColors:q.morphAttributes.color!==void 0,morphTargetsCount:be,morphTextureStride:He,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:T.dithering,shadowMapEnabled:i.shadowMap.enabled&&P.length>0,shadowMapType:i.shadowMap.type,toneMapping:Ve,decodeVideoTexture:Ze&&T.map.isVideoTexture===!0&&$e.getTransfer(T.map.colorSpace)===it,decodeVideoTextureEmissive:ie&&T.emissiveMap.isVideoTexture===!0&&$e.getTransfer(T.emissiveMap.colorSpace)===it,premultipliedAlpha:T.premultipliedAlpha,doubleSided:T.side===Ht,flipSided:T.side===Yt,useDepthPacking:T.depthPacking>=0,depthPacking:T.depthPacking||0,index0AttributeName:T.index0AttributeName,extensionClipCullDistance:Re&&T.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Re&&T.extensions.multiDraw===!0||we)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:T.customProgramCacheKey()};return pt.vertexUv1s=c.has(1),pt.vertexUv2s=c.has(2),pt.vertexUv3s=c.has(3),c.clear(),pt}function g(T){let b=[];if(T.shaderID?b.push(T.shaderID):(b.push(T.customVertexShaderID),b.push(T.customFragmentShaderID)),T.defines!==void 0)for(let P in T.defines)b.push(P),b.push(T.defines[P]);return T.isRawShaderMaterial===!1&&(S(b,T),M(b,T),b.push(i.outputColorSpace)),b.push(T.customProgramCacheKey),b.join()}function S(T,b){T.push(b.precision),T.push(b.outputColorSpace),T.push(b.envMapMode),T.push(b.envMapCubeUVHeight),T.push(b.mapUv),T.push(b.alphaMapUv),T.push(b.lightMapUv),T.push(b.aoMapUv),T.push(b.bumpMapUv),T.push(b.normalMapUv),T.push(b.displacementMapUv),T.push(b.emissiveMapUv),T.push(b.metalnessMapUv),T.push(b.roughnessMapUv),T.push(b.anisotropyMapUv),T.push(b.clearcoatMapUv),T.push(b.clearcoatNormalMapUv),T.push(b.clearcoatRoughnessMapUv),T.push(b.iridescenceMapUv),T.push(b.iridescenceThicknessMapUv),T.push(b.sheenColorMapUv),T.push(b.sheenRoughnessMapUv),T.push(b.specularMapUv),T.push(b.specularColorMapUv),T.push(b.specularIntensityMapUv),T.push(b.transmissionMapUv),T.push(b.thicknessMapUv),T.push(b.combine),T.push(b.fogExp2),T.push(b.sizeAttenuation),T.push(b.morphTargetsCount),T.push(b.morphAttributeCount),T.push(b.numDirLights),T.push(b.numPointLights),T.push(b.numSpotLights),T.push(b.numSpotLightMaps),T.push(b.numHemiLights),T.push(b.numRectAreaLights),T.push(b.numDirLightShadows),T.push(b.numPointLightShadows),T.push(b.numSpotLightShadows),T.push(b.numSpotLightShadowsWithMaps),T.push(b.numLightProbes),T.push(b.shadowMapType),T.push(b.toneMapping),T.push(b.numClippingPlanes),T.push(b.numClipIntersection),T.push(b.depthPacking)}function M(T,b){a.disableAll(),b.supportsVertexTextures&&a.enable(0),b.instancing&&a.enable(1),b.instancingColor&&a.enable(2),b.instancingMorph&&a.enable(3),b.matcap&&a.enable(4),b.envMap&&a.enable(5),b.normalMapObjectSpace&&a.enable(6),b.normalMapTangentSpace&&a.enable(7),b.clearcoat&&a.enable(8),b.iridescence&&a.enable(9),b.alphaTest&&a.enable(10),b.vertexColors&&a.enable(11),b.vertexAlphas&&a.enable(12),b.vertexUv1s&&a.enable(13),b.vertexUv2s&&a.enable(14),b.vertexUv3s&&a.enable(15),b.vertexTangents&&a.enable(16),b.anisotropy&&a.enable(17),b.alphaHash&&a.enable(18),b.batching&&a.enable(19),b.dispersion&&a.enable(20),b.batchingColor&&a.enable(21),b.gradientMap&&a.enable(22),T.push(a.mask),a.disableAll(),b.fog&&a.enable(0),b.useFog&&a.enable(1),b.flatShading&&a.enable(2),b.logarithmicDepthBuffer&&a.enable(3),b.reversedDepthBuffer&&a.enable(4),b.skinning&&a.enable(5),b.morphTargets&&a.enable(6),b.morphNormals&&a.enable(7),b.morphColors&&a.enable(8),b.premultipliedAlpha&&a.enable(9),b.shadowMapEnabled&&a.enable(10),b.doubleSided&&a.enable(11),b.flipSided&&a.enable(12),b.useDepthPacking&&a.enable(13),b.dithering&&a.enable(14),b.transmission&&a.enable(15),b.sheen&&a.enable(16),b.opaque&&a.enable(17),b.pointsUvs&&a.enable(18),b.decodeVideoTexture&&a.enable(19),b.decodeVideoTextureEmissive&&a.enable(20),b.alphaToCoverage&&a.enable(21),T.push(a.mask)}function y(T){let b=p[T.type],P;if(b){let O=Yn[b];P=xi.clone(O.uniforms)}else P=T.uniforms;return P}function R(T,b){let P;for(let O=0,z=h.length;O<z;O++){let W=h[O];if(W.cacheKey===b){P=W,++P.usedTimes;break}}return P===void 0&&(P=new tv(i,b,T,r),h.push(P)),P}function A(T){if(--T.usedTimes===0){let b=h.indexOf(T);h[b]=h[h.length-1],h.pop(),T.destroy()}}function I(T){l.remove(T)}function D(){l.dispose()}return{getParameters:m,getProgramCacheKey:g,getUniforms:y,acquireProgram:R,releaseProgram:A,releaseShaderCache:I,programs:h,dispose:D}}function sv(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,l){i.get(o)[a]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function rv(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function pp(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function mp(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function o(u,d,f,p,_,m){let g=i[e];return g===void 0?(g={id:u.id,object:u,geometry:d,material:f,groupOrder:p,renderOrder:u.renderOrder,z:_,group:m},i[e]=g):(g.id=u.id,g.object=u,g.geometry=d,g.material=f,g.groupOrder=p,g.renderOrder=u.renderOrder,g.z=_,g.group=m),e++,g}function a(u,d,f,p,_,m){let g=o(u,d,f,p,_,m);f.transmission>0?n.push(g):f.transparent===!0?s.push(g):t.push(g)}function l(u,d,f,p,_,m){let g=o(u,d,f,p,_,m);f.transmission>0?n.unshift(g):f.transparent===!0?s.unshift(g):t.unshift(g)}function c(u,d){t.length>1&&t.sort(u||rv),n.length>1&&n.sort(d||pp),s.length>1&&s.sort(d||pp)}function h(){for(let u=e,d=i.length;u<d;u++){let f=i[u];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:a,unshift:l,finish:h,sort:c}}function ov(){let i=new WeakMap;function e(n,s){let r=i.get(n),o;return r===void 0?(o=new mp,i.set(n,[o])):s>=r.length?(o=new mp,r.push(o)):o=r[s],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function av(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new E,color:new Ce};break;case"SpotLight":t={position:new E,direction:new E,color:new Ce,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new E,color:new Ce,distance:0,decay:0};break;case"HemisphereLight":t={direction:new E,skyColor:new Ce,groundColor:new Ce};break;case"RectAreaLight":t={color:new Ce,position:new E,halfWidth:new E,halfHeight:new E};break}return i[e.id]=t,t}}}function lv(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new te};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new te};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new te,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var cv=0;function hv(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function uv(i){let e=new av,t=lv(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new E);let s=new E,r=new Ge,o=new Ge;function a(c){let h=0,u=0,d=0;for(let T=0;T<9;T++)n.probe[T].set(0,0,0);let f=0,p=0,_=0,m=0,g=0,S=0,M=0,y=0,R=0,A=0,I=0;c.sort(hv);for(let T=0,b=c.length;T<b;T++){let P=c[T],O=P.color,z=P.intensity,W=P.distance,q=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)h+=O.r*z,u+=O.g*z,d+=O.b*z;else if(P.isLightProbe){for(let G=0;G<9;G++)n.probe[G].addScaledVector(P.sh.coefficients[G],z);I++}else if(P.isDirectionalLight){let G=e.get(P);if(G.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let ne=P.shadow,H=t.get(P);H.shadowIntensity=ne.intensity,H.shadowBias=ne.bias,H.shadowNormalBias=ne.normalBias,H.shadowRadius=ne.radius,H.shadowMapSize=ne.mapSize,n.directionalShadow[f]=H,n.directionalShadowMap[f]=q,n.directionalShadowMatrix[f]=P.shadow.matrix,S++}n.directional[f]=G,f++}else if(P.isSpotLight){let G=e.get(P);G.position.setFromMatrixPosition(P.matrixWorld),G.color.copy(O).multiplyScalar(z),G.distance=W,G.coneCos=Math.cos(P.angle),G.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),G.decay=P.decay,n.spot[_]=G;let ne=P.shadow;if(P.map&&(n.spotLightMap[R]=P.map,R++,ne.updateMatrices(P),P.castShadow&&A++),n.spotLightMatrix[_]=ne.matrix,P.castShadow){let H=t.get(P);H.shadowIntensity=ne.intensity,H.shadowBias=ne.bias,H.shadowNormalBias=ne.normalBias,H.shadowRadius=ne.radius,H.shadowMapSize=ne.mapSize,n.spotShadow[_]=H,n.spotShadowMap[_]=q,y++}_++}else if(P.isRectAreaLight){let G=e.get(P);G.color.copy(O).multiplyScalar(z),G.halfWidth.set(P.width*.5,0,0),G.halfHeight.set(0,P.height*.5,0),n.rectArea[m]=G,m++}else if(P.isPointLight){let G=e.get(P);if(G.color.copy(P.color).multiplyScalar(P.intensity),G.distance=P.distance,G.decay=P.decay,P.castShadow){let ne=P.shadow,H=t.get(P);H.shadowIntensity=ne.intensity,H.shadowBias=ne.bias,H.shadowNormalBias=ne.normalBias,H.shadowRadius=ne.radius,H.shadowMapSize=ne.mapSize,H.shadowCameraNear=ne.camera.near,H.shadowCameraFar=ne.camera.far,n.pointShadow[p]=H,n.pointShadowMap[p]=q,n.pointShadowMatrix[p]=P.shadow.matrix,M++}n.point[p]=G,p++}else if(P.isHemisphereLight){let G=e.get(P);G.skyColor.copy(P.color).multiplyScalar(z),G.groundColor.copy(P.groundColor).multiplyScalar(z),n.hemi[g]=G,g++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=pe.LTC_FLOAT_1,n.rectAreaLTC2=pe.LTC_FLOAT_2):(n.rectAreaLTC1=pe.LTC_HALF_1,n.rectAreaLTC2=pe.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=d;let D=n.hash;(D.directionalLength!==f||D.pointLength!==p||D.spotLength!==_||D.rectAreaLength!==m||D.hemiLength!==g||D.numDirectionalShadows!==S||D.numPointShadows!==M||D.numSpotShadows!==y||D.numSpotMaps!==R||D.numLightProbes!==I)&&(n.directional.length=f,n.spot.length=_,n.rectArea.length=m,n.point.length=p,n.hemi.length=g,n.directionalShadow.length=S,n.directionalShadowMap.length=S,n.pointShadow.length=M,n.pointShadowMap.length=M,n.spotShadow.length=y,n.spotShadowMap.length=y,n.directionalShadowMatrix.length=S,n.pointShadowMatrix.length=M,n.spotLightMatrix.length=y+R-A,n.spotLightMap.length=R,n.numSpotLightShadowsWithMaps=A,n.numLightProbes=I,D.directionalLength=f,D.pointLength=p,D.spotLength=_,D.rectAreaLength=m,D.hemiLength=g,D.numDirectionalShadows=S,D.numPointShadows=M,D.numSpotShadows=y,D.numSpotMaps=R,D.numLightProbes=I,n.version=cv++)}function l(c,h){let u=0,d=0,f=0,p=0,_=0,m=h.matrixWorldInverse;for(let g=0,S=c.length;g<S;g++){let M=c[g];if(M.isDirectionalLight){let y=n.directional[u];y.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),u++}else if(M.isSpotLight){let y=n.spot[f];y.position.setFromMatrixPosition(M.matrixWorld),y.position.applyMatrix4(m),y.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),f++}else if(M.isRectAreaLight){let y=n.rectArea[p];y.position.setFromMatrixPosition(M.matrixWorld),y.position.applyMatrix4(m),o.identity(),r.copy(M.matrixWorld),r.premultiply(m),o.extractRotation(r),y.halfWidth.set(M.width*.5,0,0),y.halfHeight.set(0,M.height*.5,0),y.halfWidth.applyMatrix4(o),y.halfHeight.applyMatrix4(o),p++}else if(M.isPointLight){let y=n.point[d];y.position.setFromMatrixPosition(M.matrixWorld),y.position.applyMatrix4(m),d++}else if(M.isHemisphereLight){let y=n.hemi[_];y.direction.setFromMatrixPosition(M.matrixWorld),y.direction.transformDirection(m),_++}}}return{setup:a,setupView:l,state:n}}function gp(i){let e=new uv(i),t=[],n=[];function s(h){c.camera=h,t.length=0,n.length=0}function r(h){t.push(h)}function o(h){n.push(h)}function a(){e.setup(t)}function l(h){e.setupView(t,h)}let c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function dv(i){let e=new WeakMap;function t(s,r=0){let o=e.get(s),a;return o===void 0?(a=new gp(i),e.set(s,[a])):r>=o.length?(a=new gp(i),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}var fv=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,pv=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function mv(i,e,t){let n=new qs,s=new te,r=new te,o=new tt,a=new Ca({depthPacking:If}),l=new Ia,c={},h=t.maxTextureSize,u={[Dn]:Yt,[Yt]:Dn,[Ht]:Ht},d=new Lt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new te},radius:{value:4}},vertexShader:fv,fragmentShader:pv}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let p=new Vt;p.setAttribute("position",new Pt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new lt(p,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=fh;let g=this.type;this.render=function(A,I,D){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||A.length===0)return;let T=i.getRenderTarget(),b=i.getActiveCubeFace(),P=i.getActiveMipmapLevel(),O=i.state;O.setBlending(Nn),O.buffers.depth.getReversed()===!0?O.buffers.color.setClear(0,0,0,0):O.buffers.color.setClear(1,1,1,1),O.buffers.depth.setTest(!0),O.setScissorTest(!1);let z=g!==qn&&this.type===qn,W=g===qn&&this.type!==qn;for(let q=0,G=A.length;q<G;q++){let ne=A[q],H=ne.shadow;if(H===void 0){console.warn("THREE.WebGLShadowMap:",ne,"has no shadow.");continue}if(H.autoUpdate===!1&&H.needsUpdate===!1)continue;s.copy(H.mapSize);let de=H.getFrameExtents();if(s.multiply(de),r.copy(H.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/de.x),s.x=r.x*de.x,H.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/de.y),s.y=r.y*de.y,H.mapSize.y=r.y)),H.map===null||z===!0||W===!0){let be=this.type!==qn?{minFilter:Wt,magFilter:Wt}:{};H.map!==null&&H.map.dispose(),H.map=new kt(s.x,s.y,be),H.map.texture.name=ne.name+".shadowMap",H.camera.updateProjectionMatrix()}i.setRenderTarget(H.map),i.clear();let ye=H.getViewportCount();for(let be=0;be<ye;be++){let He=H.getViewport(be);o.set(r.x*He.x,r.y*He.y,r.x*He.z,r.y*He.w),O.viewport(o),H.updateMatrices(ne,be),n=H.getFrustum(),y(I,D,H.camera,ne,this.type)}H.isPointLightShadow!==!0&&this.type===qn&&S(H,D),H.needsUpdate=!1}g=this.type,m.needsUpdate=!1,i.setRenderTarget(T,b,P)};function S(A,I){let D=e.update(_);d.defines.VSM_SAMPLES!==A.blurSamples&&(d.defines.VSM_SAMPLES=A.blurSamples,f.defines.VSM_SAMPLES=A.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new kt(s.x,s.y)),d.uniforms.shadow_pass.value=A.map.texture,d.uniforms.resolution.value=A.mapSize,d.uniforms.radius.value=A.radius,i.setRenderTarget(A.mapPass),i.clear(),i.renderBufferDirect(I,null,D,d,_,null),f.uniforms.shadow_pass.value=A.mapPass.texture,f.uniforms.resolution.value=A.mapSize,f.uniforms.radius.value=A.radius,i.setRenderTarget(A.map),i.clear(),i.renderBufferDirect(I,null,D,f,_,null)}function M(A,I,D,T){let b=null,P=D.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(P!==void 0)b=P;else if(b=D.isPointLight===!0?l:a,i.localClippingEnabled&&I.clipShadows===!0&&Array.isArray(I.clippingPlanes)&&I.clippingPlanes.length!==0||I.displacementMap&&I.displacementScale!==0||I.alphaMap&&I.alphaTest>0||I.map&&I.alphaTest>0||I.alphaToCoverage===!0){let O=b.uuid,z=I.uuid,W=c[O];W===void 0&&(W={},c[O]=W);let q=W[z];q===void 0&&(q=b.clone(),W[z]=q,I.addEventListener("dispose",R)),b=q}if(b.visible=I.visible,b.wireframe=I.wireframe,T===qn?b.side=I.shadowSide!==null?I.shadowSide:I.side:b.side=I.shadowSide!==null?I.shadowSide:u[I.side],b.alphaMap=I.alphaMap,b.alphaTest=I.alphaToCoverage===!0?.5:I.alphaTest,b.map=I.map,b.clipShadows=I.clipShadows,b.clippingPlanes=I.clippingPlanes,b.clipIntersection=I.clipIntersection,b.displacementMap=I.displacementMap,b.displacementScale=I.displacementScale,b.displacementBias=I.displacementBias,b.wireframeLinewidth=I.wireframeLinewidth,b.linewidth=I.linewidth,D.isPointLight===!0&&b.isMeshDistanceMaterial===!0){let O=i.properties.get(b);O.light=D}return b}function y(A,I,D,T,b){if(A.visible===!1)return;if(A.layers.test(I.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&b===qn)&&(!A.frustumCulled||n.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(D.matrixWorldInverse,A.matrixWorld);let z=e.update(A),W=A.material;if(Array.isArray(W)){let q=z.groups;for(let G=0,ne=q.length;G<ne;G++){let H=q[G],de=W[H.materialIndex];if(de&&de.visible){let ye=M(A,de,T,b);A.onBeforeShadow(i,A,I,D,z,ye,H),i.renderBufferDirect(D,null,z,ye,A,H),A.onAfterShadow(i,A,I,D,z,ye,H)}}}else if(W.visible){let q=M(A,W,T,b);A.onBeforeShadow(i,A,I,D,z,q,null),i.renderBufferDirect(D,null,z,q,A,null),A.onAfterShadow(i,A,I,D,z,q,null)}}let O=A.children;for(let z=0,W=O.length;z<W;z++)y(O[z],I,D,T,b)}function R(A){A.target.removeEventListener("dispose",R);for(let D in c){let T=c[D],b=A.target.uuid;b in T&&(T[b].dispose(),delete T[b])}}}var gv={[ka]:za,[Va]:Wa,[Ha]:Xa,[$i]:Ga,[za]:ka,[Wa]:Va,[Xa]:Ha,[Ga]:$i};function _v(i,e){function t(){let L=!1,ae=new tt,fe=null,Se=new tt(0,0,0,0);return{setMask:function(re){fe!==re&&!L&&(i.colorMask(re,re,re,re),fe=re)},setLocked:function(re){L=re},setClear:function(re,J,Re,Ve,pt){pt===!0&&(re*=Ve,J*=Ve,Re*=Ve),ae.set(re,J,Re,Ve),Se.equals(ae)===!1&&(i.clearColor(re,J,Re,Ve),Se.copy(ae))},reset:function(){L=!1,fe=null,Se.set(-1,0,0,0)}}}function n(){let L=!1,ae=!1,fe=null,Se=null,re=null;return{setReversed:function(J){if(ae!==J){let Re=e.get("EXT_clip_control");J?Re.clipControlEXT(Re.LOWER_LEFT_EXT,Re.ZERO_TO_ONE_EXT):Re.clipControlEXT(Re.LOWER_LEFT_EXT,Re.NEGATIVE_ONE_TO_ONE_EXT),ae=J;let Ve=re;re=null,this.setClear(Ve)}},getReversed:function(){return ae},setTest:function(J){J?ee(i.DEPTH_TEST):Me(i.DEPTH_TEST)},setMask:function(J){fe!==J&&!L&&(i.depthMask(J),fe=J)},setFunc:function(J){if(ae&&(J=gv[J]),Se!==J){switch(J){case ka:i.depthFunc(i.NEVER);break;case za:i.depthFunc(i.ALWAYS);break;case Va:i.depthFunc(i.LESS);break;case $i:i.depthFunc(i.LEQUAL);break;case Ha:i.depthFunc(i.EQUAL);break;case Ga:i.depthFunc(i.GEQUAL);break;case Wa:i.depthFunc(i.GREATER);break;case Xa:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}Se=J}},setLocked:function(J){L=J},setClear:function(J){re!==J&&(ae&&(J=1-J),i.clearDepth(J),re=J)},reset:function(){L=!1,fe=null,Se=null,re=null,ae=!1}}}function s(){let L=!1,ae=null,fe=null,Se=null,re=null,J=null,Re=null,Ve=null,pt=null;return{setTest:function(st){L||(st?ee(i.STENCIL_TEST):Me(i.STENCIL_TEST))},setMask:function(st){ae!==st&&!L&&(i.stencilMask(st),ae=st)},setFunc:function(st,Jn,On){(fe!==st||Se!==Jn||re!==On)&&(i.stencilFunc(st,Jn,On),fe=st,Se=Jn,re=On)},setOp:function(st,Jn,On){(J!==st||Re!==Jn||Ve!==On)&&(i.stencilOp(st,Jn,On),J=st,Re=Jn,Ve=On)},setLocked:function(st){L=st},setClear:function(st){pt!==st&&(i.clearStencil(st),pt=st)},reset:function(){L=!1,ae=null,fe=null,Se=null,re=null,J=null,Re=null,Ve=null,pt=null}}}let r=new t,o=new n,a=new s,l=new WeakMap,c=new WeakMap,h={},u={},d=new WeakMap,f=[],p=null,_=!1,m=null,g=null,S=null,M=null,y=null,R=null,A=null,I=new Ce(0,0,0),D=0,T=!1,b=null,P=null,O=null,z=null,W=null,q=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),G=!1,ne=0,H=i.getParameter(i.VERSION);H.indexOf("WebGL")!==-1?(ne=parseFloat(/^WebGL (\d)/.exec(H)[1]),G=ne>=1):H.indexOf("OpenGL ES")!==-1&&(ne=parseFloat(/^OpenGL ES (\d)/.exec(H)[1]),G=ne>=2);let de=null,ye={},be=i.getParameter(i.SCISSOR_BOX),He=i.getParameter(i.VIEWPORT),je=new tt().fromArray(be),ot=new tt().fromArray(He);function Qe(L,ae,fe,Se){let re=new Uint8Array(4),J=i.createTexture();i.bindTexture(L,J),i.texParameteri(L,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(L,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Re=0;Re<fe;Re++)L===i.TEXTURE_3D||L===i.TEXTURE_2D_ARRAY?i.texImage3D(ae,0,i.RGBA,1,1,Se,0,i.RGBA,i.UNSIGNED_BYTE,re):i.texImage2D(ae+Re,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,re);return J}let Y={};Y[i.TEXTURE_2D]=Qe(i.TEXTURE_2D,i.TEXTURE_2D,1),Y[i.TEXTURE_CUBE_MAP]=Qe(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Y[i.TEXTURE_2D_ARRAY]=Qe(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Y[i.TEXTURE_3D]=Qe(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),ee(i.DEPTH_TEST),o.setFunc($i),K(!1),$(dh),ee(i.CULL_FACE),Q(Nn);function ee(L){h[L]!==!0&&(i.enable(L),h[L]=!0)}function Me(L){h[L]!==!1&&(i.disable(L),h[L]=!1)}function De(L,ae){return u[L]!==ae?(i.bindFramebuffer(L,ae),u[L]=ae,L===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=ae),L===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=ae),!0):!1}function we(L,ae){let fe=f,Se=!1;if(L){fe=d.get(ae),fe===void 0&&(fe=[],d.set(ae,fe));let re=L.textures;if(fe.length!==re.length||fe[0]!==i.COLOR_ATTACHMENT0){for(let J=0,Re=re.length;J<Re;J++)fe[J]=i.COLOR_ATTACHMENT0+J;fe.length=re.length,Se=!0}}else fe[0]!==i.BACK&&(fe[0]=i.BACK,Se=!0);Se&&i.drawBuffers(fe)}function Ze(L){return p!==L?(i.useProgram(L),p=L,!0):!1}let ft={[Ai]:i.FUNC_ADD,[lf]:i.FUNC_SUBTRACT,[cf]:i.FUNC_REVERSE_SUBTRACT};ft[hf]=i.MIN,ft[uf]=i.MAX;let C={[df]:i.ZERO,[ff]:i.ONE,[pf]:i.SRC_COLOR,[fa]:i.SRC_ALPHA,[vf]:i.SRC_ALPHA_SATURATE,[xf]:i.DST_COLOR,[gf]:i.DST_ALPHA,[mf]:i.ONE_MINUS_SRC_COLOR,[pa]:i.ONE_MINUS_SRC_ALPHA,[yf]:i.ONE_MINUS_DST_COLOR,[_f]:i.ONE_MINUS_DST_ALPHA,[Mf]:i.CONSTANT_COLOR,[bf]:i.ONE_MINUS_CONSTANT_COLOR,[Sf]:i.CONSTANT_ALPHA,[Tf]:i.ONE_MINUS_CONSTANT_ALPHA};function Q(L,ae,fe,Se,re,J,Re,Ve,pt,st){if(L===Nn){_===!0&&(Me(i.BLEND),_=!1);return}if(_===!1&&(ee(i.BLEND),_=!0),L!==af){if(L!==m||st!==T){if((g!==Ai||y!==Ai)&&(i.blendEquation(i.FUNC_ADD),g=Ai,y=Ai),st)switch(L){case Yi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case mo:i.blendFunc(i.ONE,i.ONE);break;case ph:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case mh:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}else switch(L){case Yi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case mo:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case ph:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case mh:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}S=null,M=null,R=null,A=null,I.set(0,0,0),D=0,m=L,T=st}return}re=re||ae,J=J||fe,Re=Re||Se,(ae!==g||re!==y)&&(i.blendEquationSeparate(ft[ae],ft[re]),g=ae,y=re),(fe!==S||Se!==M||J!==R||Re!==A)&&(i.blendFuncSeparate(C[fe],C[Se],C[J],C[Re]),S=fe,M=Se,R=J,A=Re),(Ve.equals(I)===!1||pt!==D)&&(i.blendColor(Ve.r,Ve.g,Ve.b,pt),I.copy(Ve),D=pt),m=L,T=!1}function Z(L,ae){L.side===Ht?Me(i.CULL_FACE):ee(i.CULL_FACE);let fe=L.side===Yt;ae&&(fe=!fe),K(fe),L.blending===Yi&&L.transparent===!1?Q(Nn):Q(L.blending,L.blendEquation,L.blendSrc,L.blendDst,L.blendEquationAlpha,L.blendSrcAlpha,L.blendDstAlpha,L.blendColor,L.blendAlpha,L.premultipliedAlpha),o.setFunc(L.depthFunc),o.setTest(L.depthTest),o.setMask(L.depthWrite),r.setMask(L.colorWrite);let Se=L.stencilWrite;a.setTest(Se),Se&&(a.setMask(L.stencilWriteMask),a.setFunc(L.stencilFunc,L.stencilRef,L.stencilFuncMask),a.setOp(L.stencilFail,L.stencilZFail,L.stencilZPass)),ie(L.polygonOffset,L.polygonOffsetFactor,L.polygonOffsetUnits),L.alphaToCoverage===!0?ee(i.SAMPLE_ALPHA_TO_COVERAGE):Me(i.SAMPLE_ALPHA_TO_COVERAGE)}function K(L){b!==L&&(L?i.frontFace(i.CW):i.frontFace(i.CCW),b=L)}function $(L){L!==rf?(ee(i.CULL_FACE),L!==P&&(L===dh?i.cullFace(i.BACK):L===of?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Me(i.CULL_FACE),P=L}function he(L){L!==O&&(G&&i.lineWidth(L),O=L)}function ie(L,ae,fe){L?(ee(i.POLYGON_OFFSET_FILL),(z!==ae||W!==fe)&&(i.polygonOffset(ae,fe),z=ae,W=fe)):Me(i.POLYGON_OFFSET_FILL)}function ue(L){L?ee(i.SCISSOR_TEST):Me(i.SCISSOR_TEST)}function ze(L){L===void 0&&(L=i.TEXTURE0+q-1),de!==L&&(i.activeTexture(L),de=L)}function ke(L,ae,fe){fe===void 0&&(de===null?fe=i.TEXTURE0+q-1:fe=de);let Se=ye[fe];Se===void 0&&(Se={type:void 0,texture:void 0},ye[fe]=Se),(Se.type!==L||Se.texture!==ae)&&(de!==fe&&(i.activeTexture(fe),de=fe),i.bindTexture(L,ae||Y[L]),Se.type=L,Se.texture=ae)}function w(){let L=ye[de];L!==void 0&&L.type!==void 0&&(i.bindTexture(L.type,null),L.type=void 0,L.texture=void 0)}function x(){try{i.compressedTexImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function F(){try{i.compressedTexImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function V(){try{i.texSubImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function j(){try{i.texSubImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function X(){try{i.compressedTexSubImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Ie(){try{i.compressedTexSubImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ce(){try{i.texStorage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Ee(){try{i.texStorage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Ae(){try{i.texImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function se(){try{i.texImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function _e(L){je.equals(L)===!1&&(i.scissor(L.x,L.y,L.z,L.w),je.copy(L))}function Oe(L){ot.equals(L)===!1&&(i.viewport(L.x,L.y,L.z,L.w),ot.copy(L))}function Pe(L,ae){let fe=c.get(ae);fe===void 0&&(fe=new WeakMap,c.set(ae,fe));let Se=fe.get(L);Se===void 0&&(Se=i.getUniformBlockIndex(ae,L.name),fe.set(L,Se))}function me(L,ae){let Se=c.get(ae).get(L);l.get(ae)!==Se&&(i.uniformBlockBinding(ae,Se,L.__bindingPointIndex),l.set(ae,Se))}function Xe(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),h={},de=null,ye={},u={},d=new WeakMap,f=[],p=null,_=!1,m=null,g=null,S=null,M=null,y=null,R=null,A=null,I=new Ce(0,0,0),D=0,T=!1,b=null,P=null,O=null,z=null,W=null,je.set(0,0,i.canvas.width,i.canvas.height),ot.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:ee,disable:Me,bindFramebuffer:De,drawBuffers:we,useProgram:Ze,setBlending:Q,setMaterial:Z,setFlipSided:K,setCullFace:$,setLineWidth:he,setPolygonOffset:ie,setScissorTest:ue,activeTexture:ze,bindTexture:ke,unbindTexture:w,compressedTexImage2D:x,compressedTexImage3D:F,texImage2D:Ae,texImage3D:se,updateUBOMapping:Pe,uniformBlockBinding:me,texStorage2D:ce,texStorage3D:Ee,texSubImage2D:V,texSubImage3D:j,compressedTexSubImage2D:X,compressedTexSubImage3D:Ie,scissor:_e,viewport:Oe,reset:Xe}}function xv(i,e,t,n,s,r,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new te,h=new WeakMap,u,d=new WeakMap,f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function p(w,x){return f?new OffscreenCanvas(w,x):ks("canvas")}function _(w,x,F){let V=1,j=ke(w);if((j.width>F||j.height>F)&&(V=F/Math.max(j.width,j.height)),V<1)if(typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&w instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&w instanceof ImageBitmap||typeof VideoFrame<"u"&&w instanceof VideoFrame){let X=Math.floor(V*j.width),Ie=Math.floor(V*j.height);u===void 0&&(u=p(X,Ie));let ce=x?p(X,Ie):u;return ce.width=X,ce.height=Ie,ce.getContext("2d").drawImage(w,0,0,X,Ie),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+j.width+"x"+j.height+") to ("+X+"x"+Ie+")."),ce}else return"data"in w&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+j.width+"x"+j.height+")."),w;return w}function m(w){return w.generateMipmaps}function g(w){i.generateMipmap(w)}function S(w){return w.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:w.isWebGL3DRenderTarget?i.TEXTURE_3D:w.isWebGLArrayRenderTarget||w.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function M(w,x,F,V,j=!1){if(w!==null){if(i[w]!==void 0)return i[w];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+w+"'")}let X=x;if(x===i.RED&&(F===i.FLOAT&&(X=i.R32F),F===i.HALF_FLOAT&&(X=i.R16F),F===i.UNSIGNED_BYTE&&(X=i.R8)),x===i.RED_INTEGER&&(F===i.UNSIGNED_BYTE&&(X=i.R8UI),F===i.UNSIGNED_SHORT&&(X=i.R16UI),F===i.UNSIGNED_INT&&(X=i.R32UI),F===i.BYTE&&(X=i.R8I),F===i.SHORT&&(X=i.R16I),F===i.INT&&(X=i.R32I)),x===i.RG&&(F===i.FLOAT&&(X=i.RG32F),F===i.HALF_FLOAT&&(X=i.RG16F),F===i.UNSIGNED_BYTE&&(X=i.RG8)),x===i.RG_INTEGER&&(F===i.UNSIGNED_BYTE&&(X=i.RG8UI),F===i.UNSIGNED_SHORT&&(X=i.RG16UI),F===i.UNSIGNED_INT&&(X=i.RG32UI),F===i.BYTE&&(X=i.RG8I),F===i.SHORT&&(X=i.RG16I),F===i.INT&&(X=i.RG32I)),x===i.RGB_INTEGER&&(F===i.UNSIGNED_BYTE&&(X=i.RGB8UI),F===i.UNSIGNED_SHORT&&(X=i.RGB16UI),F===i.UNSIGNED_INT&&(X=i.RGB32UI),F===i.BYTE&&(X=i.RGB8I),F===i.SHORT&&(X=i.RGB16I),F===i.INT&&(X=i.RGB32I)),x===i.RGBA_INTEGER&&(F===i.UNSIGNED_BYTE&&(X=i.RGBA8UI),F===i.UNSIGNED_SHORT&&(X=i.RGBA16UI),F===i.UNSIGNED_INT&&(X=i.RGBA32UI),F===i.BYTE&&(X=i.RGBA8I),F===i.SHORT&&(X=i.RGBA16I),F===i.INT&&(X=i.RGBA32I)),x===i.RGB&&(F===i.UNSIGNED_INT_5_9_9_9_REV&&(X=i.RGB9_E5),F===i.UNSIGNED_INT_10F_11F_11F_REV&&(X=i.R11F_G11F_B10F)),x===i.RGBA){let Ie=j?Pr:$e.getTransfer(V);F===i.FLOAT&&(X=i.RGBA32F),F===i.HALF_FLOAT&&(X=i.RGBA16F),F===i.UNSIGNED_BYTE&&(X=Ie===it?i.SRGB8_ALPHA8:i.RGBA8),F===i.UNSIGNED_SHORT_4_4_4_4&&(X=i.RGBA4),F===i.UNSIGNED_SHORT_5_5_5_1&&(X=i.RGB5_A1)}return(X===i.R16F||X===i.R32F||X===i.RG16F||X===i.RG32F||X===i.RGBA16F||X===i.RGBA32F)&&e.get("EXT_color_buffer_float"),X}function y(w,x){let F;return w?x===null||x===Li||x===nr?F=i.DEPTH24_STENCIL8:x===Sn?F=i.DEPTH32F_STENCIL8:x===tr&&(F=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===Li||x===nr?F=i.DEPTH_COMPONENT24:x===Sn?F=i.DEPTH_COMPONENT32F:x===tr&&(F=i.DEPTH_COMPONENT16),F}function R(w,x){return m(w)===!0||w.isFramebufferTexture&&w.minFilter!==Wt&&w.minFilter!==tn?Math.log2(Math.max(x.width,x.height))+1:w.mipmaps!==void 0&&w.mipmaps.length>0?w.mipmaps.length:w.isCompressedTexture&&Array.isArray(w.image)?x.mipmaps.length:1}function A(w){let x=w.target;x.removeEventListener("dispose",A),D(x),x.isVideoTexture&&h.delete(x)}function I(w){let x=w.target;x.removeEventListener("dispose",I),b(x)}function D(w){let x=n.get(w);if(x.__webglInit===void 0)return;let F=w.source,V=d.get(F);if(V){let j=V[x.__cacheKey];j.usedTimes--,j.usedTimes===0&&T(w),Object.keys(V).length===0&&d.delete(F)}n.remove(w)}function T(w){let x=n.get(w);i.deleteTexture(x.__webglTexture);let F=w.source,V=d.get(F);delete V[x.__cacheKey],o.memory.textures--}function b(w){let x=n.get(w);if(w.depthTexture&&(w.depthTexture.dispose(),n.remove(w.depthTexture)),w.isWebGLCubeRenderTarget)for(let V=0;V<6;V++){if(Array.isArray(x.__webglFramebuffer[V]))for(let j=0;j<x.__webglFramebuffer[V].length;j++)i.deleteFramebuffer(x.__webglFramebuffer[V][j]);else i.deleteFramebuffer(x.__webglFramebuffer[V]);x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer[V])}else{if(Array.isArray(x.__webglFramebuffer))for(let V=0;V<x.__webglFramebuffer.length;V++)i.deleteFramebuffer(x.__webglFramebuffer[V]);else i.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&i.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let V=0;V<x.__webglColorRenderbuffer.length;V++)x.__webglColorRenderbuffer[V]&&i.deleteRenderbuffer(x.__webglColorRenderbuffer[V]);x.__webglDepthRenderbuffer&&i.deleteRenderbuffer(x.__webglDepthRenderbuffer)}let F=w.textures;for(let V=0,j=F.length;V<j;V++){let X=n.get(F[V]);X.__webglTexture&&(i.deleteTexture(X.__webglTexture),o.memory.textures--),n.remove(F[V])}n.remove(w)}let P=0;function O(){P=0}function z(){let w=P;return w>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+w+" texture units while this GPU supports only "+s.maxTextures),P+=1,w}function W(w){let x=[];return x.push(w.wrapS),x.push(w.wrapT),x.push(w.wrapR||0),x.push(w.magFilter),x.push(w.minFilter),x.push(w.anisotropy),x.push(w.internalFormat),x.push(w.format),x.push(w.type),x.push(w.generateMipmaps),x.push(w.premultiplyAlpha),x.push(w.flipY),x.push(w.unpackAlignment),x.push(w.colorSpace),x.join()}function q(w,x){let F=n.get(w);if(w.isVideoTexture&&ue(w),w.isRenderTargetTexture===!1&&w.isExternalTexture!==!0&&w.version>0&&F.__version!==w.version){let V=w.image;if(V===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(V.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Y(F,w,x);return}}else w.isExternalTexture&&(F.__webglTexture=w.sourceTexture?w.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,F.__webglTexture,i.TEXTURE0+x)}function G(w,x){let F=n.get(w);if(w.isRenderTargetTexture===!1&&w.version>0&&F.__version!==w.version){Y(F,w,x);return}t.bindTexture(i.TEXTURE_2D_ARRAY,F.__webglTexture,i.TEXTURE0+x)}function ne(w,x){let F=n.get(w);if(w.isRenderTargetTexture===!1&&w.version>0&&F.__version!==w.version){Y(F,w,x);return}t.bindTexture(i.TEXTURE_3D,F.__webglTexture,i.TEXTURE0+x)}function H(w,x){let F=n.get(w);if(w.version>0&&F.__version!==w.version){ee(F,w,x);return}t.bindTexture(i.TEXTURE_CUBE_MAP,F.__webglTexture,i.TEXTURE0+x)}let de={[Ri]:i.REPEAT,[kn]:i.CLAMP_TO_EDGE,[Os]:i.MIRRORED_REPEAT},ye={[Wt]:i.NEAREST,[tl]:i.NEAREST_MIPMAP_NEAREST,[as]:i.NEAREST_MIPMAP_LINEAR,[tn]:i.LINEAR,[er]:i.LINEAR_MIPMAP_NEAREST,[Un]:i.LINEAR_MIPMAP_LINEAR},be={[Lf]:i.NEVER,[Bf]:i.ALWAYS,[Df]:i.LESS,[wh]:i.LEQUAL,[Nf]:i.EQUAL,[Of]:i.GEQUAL,[Uf]:i.GREATER,[Ff]:i.NOTEQUAL};function He(w,x){if(x.type===Sn&&e.has("OES_texture_float_linear")===!1&&(x.magFilter===tn||x.magFilter===er||x.magFilter===as||x.magFilter===Un||x.minFilter===tn||x.minFilter===er||x.minFilter===as||x.minFilter===Un)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(w,i.TEXTURE_WRAP_S,de[x.wrapS]),i.texParameteri(w,i.TEXTURE_WRAP_T,de[x.wrapT]),(w===i.TEXTURE_3D||w===i.TEXTURE_2D_ARRAY)&&i.texParameteri(w,i.TEXTURE_WRAP_R,de[x.wrapR]),i.texParameteri(w,i.TEXTURE_MAG_FILTER,ye[x.magFilter]),i.texParameteri(w,i.TEXTURE_MIN_FILTER,ye[x.minFilter]),x.compareFunction&&(i.texParameteri(w,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(w,i.TEXTURE_COMPARE_FUNC,be[x.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===Wt||x.minFilter!==as&&x.minFilter!==Un||x.type===Sn&&e.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||n.get(x).__currentAnisotropy){let F=e.get("EXT_texture_filter_anisotropic");i.texParameterf(w,F.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,s.getMaxAnisotropy())),n.get(x).__currentAnisotropy=x.anisotropy}}}function je(w,x){let F=!1;w.__webglInit===void 0&&(w.__webglInit=!0,x.addEventListener("dispose",A));let V=x.source,j=d.get(V);j===void 0&&(j={},d.set(V,j));let X=W(x);if(X!==w.__cacheKey){j[X]===void 0&&(j[X]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,F=!0),j[X].usedTimes++;let Ie=j[w.__cacheKey];Ie!==void 0&&(j[w.__cacheKey].usedTimes--,Ie.usedTimes===0&&T(x)),w.__cacheKey=X,w.__webglTexture=j[X].texture}return F}function ot(w,x,F){return Math.floor(Math.floor(w/F)/x)}function Qe(w,x,F,V){let X=w.updateRanges;if(X.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,x.width,x.height,F,V,x.data);else{X.sort((se,_e)=>se.start-_e.start);let Ie=0;for(let se=1;se<X.length;se++){let _e=X[Ie],Oe=X[se],Pe=_e.start+_e.count,me=ot(Oe.start,x.width,4),Xe=ot(_e.start,x.width,4);Oe.start<=Pe+1&&me===Xe&&ot(Oe.start+Oe.count-1,x.width,4)===me?_e.count=Math.max(_e.count,Oe.start+Oe.count-_e.start):(++Ie,X[Ie]=Oe)}X.length=Ie+1;let ce=i.getParameter(i.UNPACK_ROW_LENGTH),Ee=i.getParameter(i.UNPACK_SKIP_PIXELS),Ae=i.getParameter(i.UNPACK_SKIP_ROWS);i.pixelStorei(i.UNPACK_ROW_LENGTH,x.width);for(let se=0,_e=X.length;se<_e;se++){let Oe=X[se],Pe=Math.floor(Oe.start/4),me=Math.ceil(Oe.count/4),Xe=Pe%x.width,L=Math.floor(Pe/x.width),ae=me,fe=1;i.pixelStorei(i.UNPACK_SKIP_PIXELS,Xe),i.pixelStorei(i.UNPACK_SKIP_ROWS,L),t.texSubImage2D(i.TEXTURE_2D,0,Xe,L,ae,fe,F,V,x.data)}w.clearUpdateRanges(),i.pixelStorei(i.UNPACK_ROW_LENGTH,ce),i.pixelStorei(i.UNPACK_SKIP_PIXELS,Ee),i.pixelStorei(i.UNPACK_SKIP_ROWS,Ae)}}function Y(w,x,F){let V=i.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(V=i.TEXTURE_2D_ARRAY),x.isData3DTexture&&(V=i.TEXTURE_3D);let j=je(w,x),X=x.source;t.bindTexture(V,w.__webglTexture,i.TEXTURE0+F);let Ie=n.get(X);if(X.version!==Ie.__version||j===!0){t.activeTexture(i.TEXTURE0+F);let ce=$e.getPrimaries($e.workingColorSpace),Ee=x.colorSpace===_i?null:$e.getPrimaries(x.colorSpace),Ae=x.colorSpace===_i||ce===Ee?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ae);let se=_(x.image,!1,s.maxTextureSize);se=ze(x,se);let _e=r.convert(x.format,x.colorSpace),Oe=r.convert(x.type),Pe=M(x.internalFormat,_e,Oe,x.colorSpace,x.isVideoTexture);He(V,x);let me,Xe=x.mipmaps,L=x.isVideoTexture!==!0,ae=Ie.__version===void 0||j===!0,fe=X.dataReady,Se=R(x,se);if(x.isDepthTexture)Pe=y(x.format===ir,x.type),ae&&(L?t.texStorage2D(i.TEXTURE_2D,1,Pe,se.width,se.height):t.texImage2D(i.TEXTURE_2D,0,Pe,se.width,se.height,0,_e,Oe,null));else if(x.isDataTexture)if(Xe.length>0){L&&ae&&t.texStorage2D(i.TEXTURE_2D,Se,Pe,Xe[0].width,Xe[0].height);for(let re=0,J=Xe.length;re<J;re++)me=Xe[re],L?fe&&t.texSubImage2D(i.TEXTURE_2D,re,0,0,me.width,me.height,_e,Oe,me.data):t.texImage2D(i.TEXTURE_2D,re,Pe,me.width,me.height,0,_e,Oe,me.data);x.generateMipmaps=!1}else L?(ae&&t.texStorage2D(i.TEXTURE_2D,Se,Pe,se.width,se.height),fe&&Qe(x,se,_e,Oe)):t.texImage2D(i.TEXTURE_2D,0,Pe,se.width,se.height,0,_e,Oe,se.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){L&&ae&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Se,Pe,Xe[0].width,Xe[0].height,se.depth);for(let re=0,J=Xe.length;re<J;re++)if(me=Xe[re],x.format!==gn)if(_e!==null)if(L){if(fe)if(x.layerUpdates.size>0){let Re=Nh(me.width,me.height,x.format,x.type);for(let Ve of x.layerUpdates){let pt=me.data.subarray(Ve*Re/me.data.BYTES_PER_ELEMENT,(Ve+1)*Re/me.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,re,0,0,Ve,me.width,me.height,1,_e,pt)}x.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,re,0,0,0,me.width,me.height,se.depth,_e,me.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,re,Pe,me.width,me.height,se.depth,0,me.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else L?fe&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,re,0,0,0,me.width,me.height,se.depth,_e,Oe,me.data):t.texImage3D(i.TEXTURE_2D_ARRAY,re,Pe,me.width,me.height,se.depth,0,_e,Oe,me.data)}else{L&&ae&&t.texStorage2D(i.TEXTURE_2D,Se,Pe,Xe[0].width,Xe[0].height);for(let re=0,J=Xe.length;re<J;re++)me=Xe[re],x.format!==gn?_e!==null?L?fe&&t.compressedTexSubImage2D(i.TEXTURE_2D,re,0,0,me.width,me.height,_e,me.data):t.compressedTexImage2D(i.TEXTURE_2D,re,Pe,me.width,me.height,0,me.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):L?fe&&t.texSubImage2D(i.TEXTURE_2D,re,0,0,me.width,me.height,_e,Oe,me.data):t.texImage2D(i.TEXTURE_2D,re,Pe,me.width,me.height,0,_e,Oe,me.data)}else if(x.isDataArrayTexture)if(L){if(ae&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Se,Pe,se.width,se.height,se.depth),fe)if(x.layerUpdates.size>0){let re=Nh(se.width,se.height,x.format,x.type);for(let J of x.layerUpdates){let Re=se.data.subarray(J*re/se.data.BYTES_PER_ELEMENT,(J+1)*re/se.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,J,se.width,se.height,1,_e,Oe,Re)}x.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,se.width,se.height,se.depth,_e,Oe,se.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,Pe,se.width,se.height,se.depth,0,_e,Oe,se.data);else if(x.isData3DTexture)L?(ae&&t.texStorage3D(i.TEXTURE_3D,Se,Pe,se.width,se.height,se.depth),fe&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,se.width,se.height,se.depth,_e,Oe,se.data)):t.texImage3D(i.TEXTURE_3D,0,Pe,se.width,se.height,se.depth,0,_e,Oe,se.data);else if(x.isFramebufferTexture){if(ae)if(L)t.texStorage2D(i.TEXTURE_2D,Se,Pe,se.width,se.height);else{let re=se.width,J=se.height;for(let Re=0;Re<Se;Re++)t.texImage2D(i.TEXTURE_2D,Re,Pe,re,J,0,_e,Oe,null),re>>=1,J>>=1}}else if(Xe.length>0){if(L&&ae){let re=ke(Xe[0]);t.texStorage2D(i.TEXTURE_2D,Se,Pe,re.width,re.height)}for(let re=0,J=Xe.length;re<J;re++)me=Xe[re],L?fe&&t.texSubImage2D(i.TEXTURE_2D,re,0,0,_e,Oe,me):t.texImage2D(i.TEXTURE_2D,re,Pe,_e,Oe,me);x.generateMipmaps=!1}else if(L){if(ae){let re=ke(se);t.texStorage2D(i.TEXTURE_2D,Se,Pe,re.width,re.height)}fe&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,_e,Oe,se)}else t.texImage2D(i.TEXTURE_2D,0,Pe,_e,Oe,se);m(x)&&g(V),Ie.__version=X.version,x.onUpdate&&x.onUpdate(x)}w.__version=x.version}function ee(w,x,F){if(x.image.length!==6)return;let V=je(w,x),j=x.source;t.bindTexture(i.TEXTURE_CUBE_MAP,w.__webglTexture,i.TEXTURE0+F);let X=n.get(j);if(j.version!==X.__version||V===!0){t.activeTexture(i.TEXTURE0+F);let Ie=$e.getPrimaries($e.workingColorSpace),ce=x.colorSpace===_i?null:$e.getPrimaries(x.colorSpace),Ee=x.colorSpace===_i||Ie===ce?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ee);let Ae=x.isCompressedTexture||x.image[0].isCompressedTexture,se=x.image[0]&&x.image[0].isDataTexture,_e=[];for(let J=0;J<6;J++)!Ae&&!se?_e[J]=_(x.image[J],!0,s.maxCubemapSize):_e[J]=se?x.image[J].image:x.image[J],_e[J]=ze(x,_e[J]);let Oe=_e[0],Pe=r.convert(x.format,x.colorSpace),me=r.convert(x.type),Xe=M(x.internalFormat,Pe,me,x.colorSpace),L=x.isVideoTexture!==!0,ae=X.__version===void 0||V===!0,fe=j.dataReady,Se=R(x,Oe);He(i.TEXTURE_CUBE_MAP,x);let re;if(Ae){L&&ae&&t.texStorage2D(i.TEXTURE_CUBE_MAP,Se,Xe,Oe.width,Oe.height);for(let J=0;J<6;J++){re=_e[J].mipmaps;for(let Re=0;Re<re.length;Re++){let Ve=re[Re];x.format!==gn?Pe!==null?L?fe&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,Re,0,0,Ve.width,Ve.height,Pe,Ve.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,Re,Xe,Ve.width,Ve.height,0,Ve.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):L?fe&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,Re,0,0,Ve.width,Ve.height,Pe,me,Ve.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,Re,Xe,Ve.width,Ve.height,0,Pe,me,Ve.data)}}}else{if(re=x.mipmaps,L&&ae){re.length>0&&Se++;let J=ke(_e[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,Se,Xe,J.width,J.height)}for(let J=0;J<6;J++)if(se){L?fe&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,0,0,_e[J].width,_e[J].height,Pe,me,_e[J].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,Xe,_e[J].width,_e[J].height,0,Pe,me,_e[J].data);for(let Re=0;Re<re.length;Re++){let pt=re[Re].image[J].image;L?fe&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,Re+1,0,0,pt.width,pt.height,Pe,me,pt.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,Re+1,Xe,pt.width,pt.height,0,Pe,me,pt.data)}}else{L?fe&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,0,0,Pe,me,_e[J]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,Xe,Pe,me,_e[J]);for(let Re=0;Re<re.length;Re++){let Ve=re[Re];L?fe&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,Re+1,0,0,Pe,me,Ve.image[J]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,Re+1,Xe,Pe,me,Ve.image[J])}}}m(x)&&g(i.TEXTURE_CUBE_MAP),X.__version=j.version,x.onUpdate&&x.onUpdate(x)}w.__version=x.version}function Me(w,x,F,V,j,X){let Ie=r.convert(F.format,F.colorSpace),ce=r.convert(F.type),Ee=M(F.internalFormat,Ie,ce,F.colorSpace),Ae=n.get(x),se=n.get(F);if(se.__renderTarget=x,!Ae.__hasExternalTextures){let _e=Math.max(1,x.width>>X),Oe=Math.max(1,x.height>>X);j===i.TEXTURE_3D||j===i.TEXTURE_2D_ARRAY?t.texImage3D(j,X,Ee,_e,Oe,x.depth,0,Ie,ce,null):t.texImage2D(j,X,Ee,_e,Oe,0,Ie,ce,null)}t.bindFramebuffer(i.FRAMEBUFFER,w),ie(x)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,V,j,se.__webglTexture,0,he(x)):(j===i.TEXTURE_2D||j>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&j<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,V,j,se.__webglTexture,X),t.bindFramebuffer(i.FRAMEBUFFER,null)}function De(w,x,F){if(i.bindRenderbuffer(i.RENDERBUFFER,w),x.depthBuffer){let V=x.depthTexture,j=V&&V.isDepthTexture?V.type:null,X=y(x.stencilBuffer,j),Ie=x.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ce=he(x);ie(x)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ce,X,x.width,x.height):F?i.renderbufferStorageMultisample(i.RENDERBUFFER,ce,X,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,X,x.width,x.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Ie,i.RENDERBUFFER,w)}else{let V=x.textures;for(let j=0;j<V.length;j++){let X=V[j],Ie=r.convert(X.format,X.colorSpace),ce=r.convert(X.type),Ee=M(X.internalFormat,Ie,ce,X.colorSpace),Ae=he(x);F&&ie(x)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ae,Ee,x.width,x.height):ie(x)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ae,Ee,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,Ee,x.width,x.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function we(w,x){if(x&&x.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,w),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let V=n.get(x.depthTexture);V.__renderTarget=x,(!V.__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),q(x.depthTexture,0);let j=V.__webglTexture,X=he(x);if(x.depthTexture.format===Bs)ie(x)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,j,0,X):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,j,0);else if(x.depthTexture.format===ir)ie(x)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,j,0,X):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,j,0);else throw new Error("Unknown depthTexture format")}function Ze(w){let x=n.get(w),F=w.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==w.depthTexture){let V=w.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),V){let j=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,V.removeEventListener("dispose",j)};V.addEventListener("dispose",j),x.__depthDisposeCallback=j}x.__boundDepthTexture=V}if(w.depthTexture&&!x.__autoAllocateDepthBuffer){if(F)throw new Error("target.depthTexture not supported in Cube render targets");let V=w.texture.mipmaps;V&&V.length>0?we(x.__webglFramebuffer[0],w):we(x.__webglFramebuffer,w)}else if(F){x.__webglDepthbuffer=[];for(let V=0;V<6;V++)if(t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[V]),x.__webglDepthbuffer[V]===void 0)x.__webglDepthbuffer[V]=i.createRenderbuffer(),De(x.__webglDepthbuffer[V],w,!1);else{let j=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,X=x.__webglDepthbuffer[V];i.bindRenderbuffer(i.RENDERBUFFER,X),i.framebufferRenderbuffer(i.FRAMEBUFFER,j,i.RENDERBUFFER,X)}}else{let V=w.texture.mipmaps;if(V&&V.length>0?t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=i.createRenderbuffer(),De(x.__webglDepthbuffer,w,!1);else{let j=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,X=x.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,X),i.framebufferRenderbuffer(i.FRAMEBUFFER,j,i.RENDERBUFFER,X)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function ft(w,x,F){let V=n.get(w);x!==void 0&&Me(V.__webglFramebuffer,w,w.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),F!==void 0&&Ze(w)}function C(w){let x=w.texture,F=n.get(w),V=n.get(x);w.addEventListener("dispose",I);let j=w.textures,X=w.isWebGLCubeRenderTarget===!0,Ie=j.length>1;if(Ie||(V.__webglTexture===void 0&&(V.__webglTexture=i.createTexture()),V.__version=x.version,o.memory.textures++),X){F.__webglFramebuffer=[];for(let ce=0;ce<6;ce++)if(x.mipmaps&&x.mipmaps.length>0){F.__webglFramebuffer[ce]=[];for(let Ee=0;Ee<x.mipmaps.length;Ee++)F.__webglFramebuffer[ce][Ee]=i.createFramebuffer()}else F.__webglFramebuffer[ce]=i.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){F.__webglFramebuffer=[];for(let ce=0;ce<x.mipmaps.length;ce++)F.__webglFramebuffer[ce]=i.createFramebuffer()}else F.__webglFramebuffer=i.createFramebuffer();if(Ie)for(let ce=0,Ee=j.length;ce<Ee;ce++){let Ae=n.get(j[ce]);Ae.__webglTexture===void 0&&(Ae.__webglTexture=i.createTexture(),o.memory.textures++)}if(w.samples>0&&ie(w)===!1){F.__webglMultisampledFramebuffer=i.createFramebuffer(),F.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,F.__webglMultisampledFramebuffer);for(let ce=0;ce<j.length;ce++){let Ee=j[ce];F.__webglColorRenderbuffer[ce]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,F.__webglColorRenderbuffer[ce]);let Ae=r.convert(Ee.format,Ee.colorSpace),se=r.convert(Ee.type),_e=M(Ee.internalFormat,Ae,se,Ee.colorSpace,w.isXRRenderTarget===!0),Oe=he(w);i.renderbufferStorageMultisample(i.RENDERBUFFER,Oe,_e,w.width,w.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ce,i.RENDERBUFFER,F.__webglColorRenderbuffer[ce])}i.bindRenderbuffer(i.RENDERBUFFER,null),w.depthBuffer&&(F.__webglDepthRenderbuffer=i.createRenderbuffer(),De(F.__webglDepthRenderbuffer,w,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(X){t.bindTexture(i.TEXTURE_CUBE_MAP,V.__webglTexture),He(i.TEXTURE_CUBE_MAP,x);for(let ce=0;ce<6;ce++)if(x.mipmaps&&x.mipmaps.length>0)for(let Ee=0;Ee<x.mipmaps.length;Ee++)Me(F.__webglFramebuffer[ce][Ee],w,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,Ee);else Me(F.__webglFramebuffer[ce],w,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0);m(x)&&g(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Ie){for(let ce=0,Ee=j.length;ce<Ee;ce++){let Ae=j[ce],se=n.get(Ae),_e=i.TEXTURE_2D;(w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&(_e=w.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(_e,se.__webglTexture),He(_e,Ae),Me(F.__webglFramebuffer,w,Ae,i.COLOR_ATTACHMENT0+ce,_e,0),m(Ae)&&g(_e)}t.unbindTexture()}else{let ce=i.TEXTURE_2D;if((w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&(ce=w.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ce,V.__webglTexture),He(ce,x),x.mipmaps&&x.mipmaps.length>0)for(let Ee=0;Ee<x.mipmaps.length;Ee++)Me(F.__webglFramebuffer[Ee],w,x,i.COLOR_ATTACHMENT0,ce,Ee);else Me(F.__webglFramebuffer,w,x,i.COLOR_ATTACHMENT0,ce,0);m(x)&&g(ce),t.unbindTexture()}w.depthBuffer&&Ze(w)}function Q(w){let x=w.textures;for(let F=0,V=x.length;F<V;F++){let j=x[F];if(m(j)){let X=S(w),Ie=n.get(j).__webglTexture;t.bindTexture(X,Ie),g(X),t.unbindTexture()}}}let Z=[],K=[];function $(w){if(w.samples>0){if(ie(w)===!1){let x=w.textures,F=w.width,V=w.height,j=i.COLOR_BUFFER_BIT,X=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Ie=n.get(w),ce=x.length>1;if(ce)for(let Ae=0;Ae<x.length;Ae++)t.bindFramebuffer(i.FRAMEBUFFER,Ie.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ae,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,Ie.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ae,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,Ie.__webglMultisampledFramebuffer);let Ee=w.texture.mipmaps;Ee&&Ee.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ie.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ie.__webglFramebuffer);for(let Ae=0;Ae<x.length;Ae++){if(w.resolveDepthBuffer&&(w.depthBuffer&&(j|=i.DEPTH_BUFFER_BIT),w.stencilBuffer&&w.resolveStencilBuffer&&(j|=i.STENCIL_BUFFER_BIT)),ce){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Ie.__webglColorRenderbuffer[Ae]);let se=n.get(x[Ae]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,se,0)}i.blitFramebuffer(0,0,F,V,0,0,F,V,j,i.NEAREST),l===!0&&(Z.length=0,K.length=0,Z.push(i.COLOR_ATTACHMENT0+Ae),w.depthBuffer&&w.resolveDepthBuffer===!1&&(Z.push(X),K.push(X),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,K)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Z))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ce)for(let Ae=0;Ae<x.length;Ae++){t.bindFramebuffer(i.FRAMEBUFFER,Ie.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ae,i.RENDERBUFFER,Ie.__webglColorRenderbuffer[Ae]);let se=n.get(x[Ae]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,Ie.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ae,i.TEXTURE_2D,se,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ie.__webglMultisampledFramebuffer)}else if(w.depthBuffer&&w.resolveDepthBuffer===!1&&l){let x=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[x])}}}function he(w){return Math.min(s.maxSamples,w.samples)}function ie(w){let x=n.get(w);return w.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function ue(w){let x=o.render.frame;h.get(w)!==x&&(h.set(w,x),w.update())}function ze(w,x){let F=w.colorSpace,V=w.format,j=w.type;return w.isCompressedTexture===!0||w.isVideoTexture===!0||F!==Xt&&F!==_i&&($e.getTransfer(F)===it?(V!==gn||j!==Fn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",F)),x}function ke(w){return typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement?(c.width=w.naturalWidth||w.width,c.height=w.naturalHeight||w.height):typeof VideoFrame<"u"&&w instanceof VideoFrame?(c.width=w.displayWidth,c.height=w.displayHeight):(c.width=w.width,c.height=w.height),c}this.allocateTextureUnit=z,this.resetTextureUnits=O,this.setTexture2D=q,this.setTexture2DArray=G,this.setTexture3D=ne,this.setTextureCube=H,this.rebindTextures=ft,this.setupRenderTarget=C,this.updateRenderTargetMipmap=Q,this.updateMultisampleRenderTarget=$,this.setupDepthRenderbuffer=Ze,this.setupFrameBufferTexture=Me,this.useMultisampledRTT=ie}function yv(i,e){function t(n,s=_i){let r,o=$e.getTransfer(s);if(n===Fn)return i.UNSIGNED_BYTE;if(n===il)return i.UNSIGNED_SHORT_4_4_4_4;if(n===sl)return i.UNSIGNED_SHORT_5_5_5_1;if(n===yh)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===vh)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===_h)return i.BYTE;if(n===xh)return i.SHORT;if(n===tr)return i.UNSIGNED_SHORT;if(n===nl)return i.INT;if(n===Li)return i.UNSIGNED_INT;if(n===Sn)return i.FLOAT;if(n===cn)return i.HALF_FLOAT;if(n===Mh)return i.ALPHA;if(n===bh)return i.RGB;if(n===gn)return i.RGBA;if(n===Bs)return i.DEPTH_COMPONENT;if(n===ir)return i.DEPTH_STENCIL;if(n===rl)return i.RED;if(n===ol)return i.RED_INTEGER;if(n===Sh)return i.RG;if(n===al)return i.RG_INTEGER;if(n===ll)return i.RGBA_INTEGER;if(n===_o||n===xo||n===yo||n===vo)if(o===it)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===_o)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===xo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===yo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===vo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===_o)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===xo)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===yo)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===vo)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===cl||n===hl||n===ul||n===dl)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===cl)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===hl)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===ul)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===dl)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===fl||n===pl||n===ml)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===fl||n===pl)return o===it?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===ml)return o===it?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===gl||n===_l||n===xl||n===yl||n===vl||n===Ml||n===bl||n===Sl||n===Tl||n===wl||n===El||n===Al||n===Rl||n===Cl)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===gl)return o===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===_l)return o===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===xl)return o===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===yl)return o===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===vl)return o===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Ml)return o===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===bl)return o===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Sl)return o===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Tl)return o===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===wl)return o===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===El)return o===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Al)return o===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Rl)return o===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Cl)return o===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Il||n===Pl||n===Ll)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Il)return o===it?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Pl)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Ll)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Dl||n===Nl||n===Ul||n===Fl)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Dl)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Nl)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Ul)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Fl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===nr?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var vv=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Mv=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Yh=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new $r(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Lt({vertexShader:vv,fragmentShader:Mv,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new lt(new hi(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},$h=class extends li{constructor(e,t){super();let n=this,s=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,d=null,f=null,p=null,_=typeof XRWebGLBinding<"u",m=new Yh,g={},S=t.getContextAttributes(),M=null,y=null,R=[],A=[],I=new te,D=null,T=new It;T.viewport=new tt;let b=new It;b.viewport=new tt;let P=[T,b],O=new Oa,z=null,W=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let ee=R[Y];return ee===void 0&&(ee=new Hs,R[Y]=ee),ee.getTargetRaySpace()},this.getControllerGrip=function(Y){let ee=R[Y];return ee===void 0&&(ee=new Hs,R[Y]=ee),ee.getGripSpace()},this.getHand=function(Y){let ee=R[Y];return ee===void 0&&(ee=new Hs,R[Y]=ee),ee.getHandSpace()};function q(Y){let ee=A.indexOf(Y.inputSource);if(ee===-1)return;let Me=R[ee];Me!==void 0&&(Me.update(Y.inputSource,Y.frame,c||o),Me.dispatchEvent({type:Y.type,data:Y.inputSource}))}function G(){s.removeEventListener("select",q),s.removeEventListener("selectstart",q),s.removeEventListener("selectend",q),s.removeEventListener("squeeze",q),s.removeEventListener("squeezestart",q),s.removeEventListener("squeezeend",q),s.removeEventListener("end",G),s.removeEventListener("inputsourceschange",ne);for(let Y=0;Y<R.length;Y++){let ee=A[Y];ee!==null&&(A[Y]=null,R[Y].disconnect(ee))}z=null,W=null,m.reset();for(let Y in g)delete g[Y];e.setRenderTarget(M),f=null,d=null,u=null,s=null,y=null,Qe.stop(),n.isPresenting=!1,e.setPixelRatio(D),e.setSize(I.width,I.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){r=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){a=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(Y){c=Y},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u===null&&_&&(u=new XRWebGLBinding(s,t)),u},this.getFrame=function(){return p},this.getSession=function(){return s},this.setSession=async function(Y){if(s=Y,s!==null){if(M=e.getRenderTarget(),s.addEventListener("select",q),s.addEventListener("selectstart",q),s.addEventListener("selectend",q),s.addEventListener("squeeze",q),s.addEventListener("squeezestart",q),s.addEventListener("squeezeend",q),s.addEventListener("end",G),s.addEventListener("inputsourceschange",ne),S.xrCompatible!==!0&&await t.makeXRCompatible(),D=e.getPixelRatio(),e.getSize(I),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let Me=null,De=null,we=null;S.depth&&(we=S.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Me=S.stencil?ir:Bs,De=S.stencil?nr:Li);let Ze={colorFormat:t.RGBA8,depthFormat:we,scaleFactor:r};u=this.getBinding(),d=u.createProjectionLayer(Ze),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new kt(d.textureWidth,d.textureHeight,{format:gn,type:Fn,depthTexture:new Yr(d.textureWidth,d.textureHeight,De,void 0,void 0,void 0,void 0,void 0,void 0,Me),stencilBuffer:S.stencil,colorSpace:e.outputColorSpace,samples:S.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{let Me={antialias:S.antialias,alpha:!0,depth:S.depth,stencil:S.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,Me),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new kt(f.framebufferWidth,f.framebufferHeight,{format:gn,type:Fn,colorSpace:e.outputColorSpace,stencilBuffer:S.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),Qe.setContext(s),Qe.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function ne(Y){for(let ee=0;ee<Y.removed.length;ee++){let Me=Y.removed[ee],De=A.indexOf(Me);De>=0&&(A[De]=null,R[De].disconnect(Me))}for(let ee=0;ee<Y.added.length;ee++){let Me=Y.added[ee],De=A.indexOf(Me);if(De===-1){for(let Ze=0;Ze<R.length;Ze++)if(Ze>=A.length){A.push(Me),De=Ze;break}else if(A[Ze]===null){A[Ze]=Me,De=Ze;break}if(De===-1)break}let we=R[De];we&&we.connect(Me)}}let H=new E,de=new E;function ye(Y,ee,Me){H.setFromMatrixPosition(ee.matrixWorld),de.setFromMatrixPosition(Me.matrixWorld);let De=H.distanceTo(de),we=ee.projectionMatrix.elements,Ze=Me.projectionMatrix.elements,ft=we[14]/(we[10]-1),C=we[14]/(we[10]+1),Q=(we[9]+1)/we[5],Z=(we[9]-1)/we[5],K=(we[8]-1)/we[0],$=(Ze[8]+1)/Ze[0],he=ft*K,ie=ft*$,ue=De/(-K+$),ze=ue*-K;if(ee.matrixWorld.decompose(Y.position,Y.quaternion,Y.scale),Y.translateX(ze),Y.translateZ(ue),Y.matrixWorld.compose(Y.position,Y.quaternion,Y.scale),Y.matrixWorldInverse.copy(Y.matrixWorld).invert(),we[10]===-1)Y.projectionMatrix.copy(ee.projectionMatrix),Y.projectionMatrixInverse.copy(ee.projectionMatrixInverse);else{let ke=ft+ue,w=C+ue,x=he-ze,F=ie+(De-ze),V=Q*C/w*ke,j=Z*C/w*ke;Y.projectionMatrix.makePerspective(x,F,V,j,ke,w),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert()}}function be(Y,ee){ee===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices(ee.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(s===null)return;let ee=Y.near,Me=Y.far;m.texture!==null&&(m.depthNear>0&&(ee=m.depthNear),m.depthFar>0&&(Me=m.depthFar)),O.near=b.near=T.near=ee,O.far=b.far=T.far=Me,(z!==O.near||W!==O.far)&&(s.updateRenderState({depthNear:O.near,depthFar:O.far}),z=O.near,W=O.far),O.layers.mask=Y.layers.mask|6,T.layers.mask=O.layers.mask&3,b.layers.mask=O.layers.mask&5;let De=Y.parent,we=O.cameras;be(O,De);for(let Ze=0;Ze<we.length;Ze++)be(we[Ze],De);we.length===2?ye(O,T,b):O.projectionMatrix.copy(T.projectionMatrix),He(Y,O,De)};function He(Y,ee,Me){Me===null?Y.matrix.copy(ee.matrixWorld):(Y.matrix.copy(Me.matrixWorld),Y.matrix.invert(),Y.matrix.multiply(ee.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy(ee.projectionMatrix),Y.projectionMatrixInverse.copy(ee.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=Ji*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(Y){l=Y,d!==null&&(d.fixedFoveation=Y),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=Y)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(O)},this.getCameraTexture=function(Y){return g[Y]};let je=null;function ot(Y,ee){if(h=ee.getViewerPose(c||o),p=ee,h!==null){let Me=h.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let De=!1;Me.length!==O.cameras.length&&(O.cameras.length=0,De=!0);for(let C=0;C<Me.length;C++){let Q=Me[C],Z=null;if(f!==null)Z=f.getViewport(Q);else{let $=u.getViewSubImage(d,Q);Z=$.viewport,C===0&&(e.setRenderTargetTextures(y,$.colorTexture,$.depthStencilTexture),e.setRenderTarget(y))}let K=P[C];K===void 0&&(K=new It,K.layers.enable(C),K.viewport=new tt,P[C]=K),K.matrix.fromArray(Q.transform.matrix),K.matrix.decompose(K.position,K.quaternion,K.scale),K.projectionMatrix.fromArray(Q.projectionMatrix),K.projectionMatrixInverse.copy(K.projectionMatrix).invert(),K.viewport.set(Z.x,Z.y,Z.width,Z.height),C===0&&(O.matrix.copy(K.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),De===!0&&O.cameras.push(K)}let we=s.enabledFeatures;if(we&&we.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&_){u=n.getBinding();let C=u.getDepthInformation(Me[0]);C&&C.isValid&&C.texture&&m.init(C,s.renderState)}if(we&&we.includes("camera-access")&&_){e.state.unbindTexture(),u=n.getBinding();for(let C=0;C<Me.length;C++){let Q=Me[C].camera;if(Q){let Z=g[Q];Z||(Z=new $r,g[Q]=Z);let K=u.getCameraImage(Q);Z.sourceTexture=K}}}}for(let Me=0;Me<R.length;Me++){let De=A[Me],we=R[Me];De!==null&&we!==void 0&&we.update(De,ee,c||o)}je&&je(Y,ee),ee.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ee}),p=null}let Qe=new _p;Qe.setAnimationLoop(ot),this.setAnimationLoop=function(Y){je=Y},this.dispose=function(){}}},hs=new bn,bv=new Ge;function Sv(i,e){function t(m,g){m.matrixAutoUpdate===!0&&m.updateMatrix(),g.value.copy(m.matrix)}function n(m,g){g.color.getRGB(m.fogColor.value,Ih(i)),g.isFog?(m.fogNear.value=g.near,m.fogFar.value=g.far):g.isFogExp2&&(m.fogDensity.value=g.density)}function s(m,g,S,M,y){g.isMeshBasicMaterial||g.isMeshLambertMaterial?r(m,g):g.isMeshToonMaterial?(r(m,g),u(m,g)):g.isMeshPhongMaterial?(r(m,g),h(m,g)):g.isMeshStandardMaterial?(r(m,g),d(m,g),g.isMeshPhysicalMaterial&&f(m,g,y)):g.isMeshMatcapMaterial?(r(m,g),p(m,g)):g.isMeshDepthMaterial?r(m,g):g.isMeshDistanceMaterial?(r(m,g),_(m,g)):g.isMeshNormalMaterial?r(m,g):g.isLineBasicMaterial?(o(m,g),g.isLineDashedMaterial&&a(m,g)):g.isPointsMaterial?l(m,g,S,M):g.isSpriteMaterial?c(m,g):g.isShadowMaterial?(m.color.value.copy(g.color),m.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function r(m,g){m.opacity.value=g.opacity,g.color&&m.diffuse.value.copy(g.color),g.emissive&&m.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(m.map.value=g.map,t(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.bumpMap&&(m.bumpMap.value=g.bumpMap,t(g.bumpMap,m.bumpMapTransform),m.bumpScale.value=g.bumpScale,g.side===Yt&&(m.bumpScale.value*=-1)),g.normalMap&&(m.normalMap.value=g.normalMap,t(g.normalMap,m.normalMapTransform),m.normalScale.value.copy(g.normalScale),g.side===Yt&&m.normalScale.value.negate()),g.displacementMap&&(m.displacementMap.value=g.displacementMap,t(g.displacementMap,m.displacementMapTransform),m.displacementScale.value=g.displacementScale,m.displacementBias.value=g.displacementBias),g.emissiveMap&&(m.emissiveMap.value=g.emissiveMap,t(g.emissiveMap,m.emissiveMapTransform)),g.specularMap&&(m.specularMap.value=g.specularMap,t(g.specularMap,m.specularMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest);let S=e.get(g),M=S.envMap,y=S.envMapRotation;M&&(m.envMap.value=M,hs.copy(y),hs.x*=-1,hs.y*=-1,hs.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(hs.y*=-1,hs.z*=-1),m.envMapRotation.value.setFromMatrix4(bv.makeRotationFromEuler(hs)),m.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=g.reflectivity,m.ior.value=g.ior,m.refractionRatio.value=g.refractionRatio),g.lightMap&&(m.lightMap.value=g.lightMap,m.lightMapIntensity.value=g.lightMapIntensity,t(g.lightMap,m.lightMapTransform)),g.aoMap&&(m.aoMap.value=g.aoMap,m.aoMapIntensity.value=g.aoMapIntensity,t(g.aoMap,m.aoMapTransform))}function o(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,g.map&&(m.map.value=g.map,t(g.map,m.mapTransform))}function a(m,g){m.dashSize.value=g.dashSize,m.totalSize.value=g.dashSize+g.gapSize,m.scale.value=g.scale}function l(m,g,S,M){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.size.value=g.size*S,m.scale.value=M*.5,g.map&&(m.map.value=g.map,t(g.map,m.uvTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function c(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.rotation.value=g.rotation,g.map&&(m.map.value=g.map,t(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function h(m,g){m.specular.value.copy(g.specular),m.shininess.value=Math.max(g.shininess,1e-4)}function u(m,g){g.gradientMap&&(m.gradientMap.value=g.gradientMap)}function d(m,g){m.metalness.value=g.metalness,g.metalnessMap&&(m.metalnessMap.value=g.metalnessMap,t(g.metalnessMap,m.metalnessMapTransform)),m.roughness.value=g.roughness,g.roughnessMap&&(m.roughnessMap.value=g.roughnessMap,t(g.roughnessMap,m.roughnessMapTransform)),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)}function f(m,g,S){m.ior.value=g.ior,g.sheen>0&&(m.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),m.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(m.sheenColorMap.value=g.sheenColorMap,t(g.sheenColorMap,m.sheenColorMapTransform)),g.sheenRoughnessMap&&(m.sheenRoughnessMap.value=g.sheenRoughnessMap,t(g.sheenRoughnessMap,m.sheenRoughnessMapTransform))),g.clearcoat>0&&(m.clearcoat.value=g.clearcoat,m.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(m.clearcoatMap.value=g.clearcoatMap,t(g.clearcoatMap,m.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,t(g.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(m.clearcoatNormalMap.value=g.clearcoatNormalMap,t(g.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===Yt&&m.clearcoatNormalScale.value.negate())),g.dispersion>0&&(m.dispersion.value=g.dispersion),g.iridescence>0&&(m.iridescence.value=g.iridescence,m.iridescenceIOR.value=g.iridescenceIOR,m.iridescenceThicknessMinimum.value=g.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=g.iridescenceThicknessRange[1],g.iridescenceMap&&(m.iridescenceMap.value=g.iridescenceMap,t(g.iridescenceMap,m.iridescenceMapTransform)),g.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=g.iridescenceThicknessMap,t(g.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),g.transmission>0&&(m.transmission.value=g.transmission,m.transmissionSamplerMap.value=S.texture,m.transmissionSamplerSize.value.set(S.width,S.height),g.transmissionMap&&(m.transmissionMap.value=g.transmissionMap,t(g.transmissionMap,m.transmissionMapTransform)),m.thickness.value=g.thickness,g.thicknessMap&&(m.thicknessMap.value=g.thicknessMap,t(g.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=g.attenuationDistance,m.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(m.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(m.anisotropyMap.value=g.anisotropyMap,t(g.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=g.specularIntensity,m.specularColor.value.copy(g.specularColor),g.specularColorMap&&(m.specularColorMap.value=g.specularColorMap,t(g.specularColorMap,m.specularColorMapTransform)),g.specularIntensityMap&&(m.specularIntensityMap.value=g.specularIntensityMap,t(g.specularIntensityMap,m.specularIntensityMapTransform))}function p(m,g){g.matcap&&(m.matcap.value=g.matcap)}function _(m,g){let S=e.get(g).light;m.referencePosition.value.setFromMatrixPosition(S.matrixWorld),m.nearDistance.value=S.shadow.camera.near,m.farDistance.value=S.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Tv(i,e,t,n){let s={},r={},o=[],a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(S,M){let y=M.program;n.uniformBlockBinding(S,y)}function c(S,M){let y=s[S.id];y===void 0&&(p(S),y=h(S),s[S.id]=y,S.addEventListener("dispose",m));let R=M.program;n.updateUBOMapping(S,R);let A=e.render.frame;r[S.id]!==A&&(d(S),r[S.id]=A)}function h(S){let M=u();S.__bindingPointIndex=M;let y=i.createBuffer(),R=S.__size,A=S.usage;return i.bindBuffer(i.UNIFORM_BUFFER,y),i.bufferData(i.UNIFORM_BUFFER,R,A),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,M,y),y}function u(){for(let S=0;S<a;S++)if(o.indexOf(S)===-1)return o.push(S),S;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(S){let M=s[S.id],y=S.uniforms,R=S.__cache;i.bindBuffer(i.UNIFORM_BUFFER,M);for(let A=0,I=y.length;A<I;A++){let D=Array.isArray(y[A])?y[A]:[y[A]];for(let T=0,b=D.length;T<b;T++){let P=D[T];if(f(P,A,T,R)===!0){let O=P.__offset,z=Array.isArray(P.value)?P.value:[P.value],W=0;for(let q=0;q<z.length;q++){let G=z[q],ne=_(G);typeof G=="number"||typeof G=="boolean"?(P.__data[0]=G,i.bufferSubData(i.UNIFORM_BUFFER,O+W,P.__data)):G.isMatrix3?(P.__data[0]=G.elements[0],P.__data[1]=G.elements[1],P.__data[2]=G.elements[2],P.__data[3]=0,P.__data[4]=G.elements[3],P.__data[5]=G.elements[4],P.__data[6]=G.elements[5],P.__data[7]=0,P.__data[8]=G.elements[6],P.__data[9]=G.elements[7],P.__data[10]=G.elements[8],P.__data[11]=0):(G.toArray(P.__data,W),W+=ne.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,O,P.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(S,M,y,R){let A=S.value,I=M+"_"+y;if(R[I]===void 0)return typeof A=="number"||typeof A=="boolean"?R[I]=A:R[I]=A.clone(),!0;{let D=R[I];if(typeof A=="number"||typeof A=="boolean"){if(D!==A)return R[I]=A,!0}else if(D.equals(A)===!1)return D.copy(A),!0}return!1}function p(S){let M=S.uniforms,y=0,R=16;for(let I=0,D=M.length;I<D;I++){let T=Array.isArray(M[I])?M[I]:[M[I]];for(let b=0,P=T.length;b<P;b++){let O=T[b],z=Array.isArray(O.value)?O.value:[O.value];for(let W=0,q=z.length;W<q;W++){let G=z[W],ne=_(G),H=y%R,de=H%ne.boundary,ye=H+de;y+=de,ye!==0&&R-ye<ne.storage&&(y+=R-ye),O.__data=new Float32Array(ne.storage/Float32Array.BYTES_PER_ELEMENT),O.__offset=y,y+=ne.storage}}}let A=y%R;return A>0&&(y+=R-A),S.__size=y,S.__cache={},this}function _(S){let M={boundary:0,storage:0};return typeof S=="number"||typeof S=="boolean"?(M.boundary=4,M.storage=4):S.isVector2?(M.boundary=8,M.storage=8):S.isVector3||S.isColor?(M.boundary=16,M.storage=12):S.isVector4?(M.boundary=16,M.storage=16):S.isMatrix3?(M.boundary=48,M.storage=48):S.isMatrix4?(M.boundary=64,M.storage=64):S.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",S),M}function m(S){let M=S.target;M.removeEventListener("dispose",m);let y=o.indexOf(M.__bindingPointIndex);o.splice(y,1),i.deleteBuffer(s[M.id]),delete s[M.id],delete r[M.id]}function g(){for(let S in s)i.deleteBuffer(s[S]);o=[],s={},r={}}return{bind:l,update:c,dispose:g}}var Vl=class{constructor(e={}){let{canvas:t=kf(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=o;let p=new Uint32Array(4),_=new Int32Array(4),m=null,g=null,S=[],M=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=gi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let y=this,R=!1;this._outputColorSpace=St;let A=0,I=0,D=null,T=-1,b=null,P=new tt,O=new tt,z=null,W=new Ce(0),q=0,G=t.width,ne=t.height,H=1,de=null,ye=null,be=new tt(0,0,G,ne),He=new tt(0,0,G,ne),je=!1,ot=new qs,Qe=!1,Y=!1,ee=new Ge,Me=new E,De=new tt,we={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ze=!1;function ft(){return D===null?H:1}let C=n;function Q(v,N){return t.getContext(v,N)}try{let v={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"180"}`),t.addEventListener("webglcontextlost",fe,!1),t.addEventListener("webglcontextrestored",Se,!1),t.addEventListener("webglcontextcreationerror",re,!1),C===null){let N="webgl2";if(C=Q(N,v),C===null)throw Q(N)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(v){throw console.error("THREE.WebGLRenderer: "+v.message),v}let Z,K,$,he,ie,ue,ze,ke,w,x,F,V,j,X,Ie,ce,Ee,Ae,se,_e,Oe,Pe,me,Xe;function L(){Z=new Hx(C),Z.init(),Pe=new yv(C,Z),K=new Ux(C,Z,e,Pe),$=new _v(C,Z),K.reversedDepthBuffer&&d&&$.buffers.depth.setReversed(!0),he=new Xx(C),ie=new sv,ue=new xv(C,Z,$,ie,K,Pe,he),ze=new Ox(y),ke=new Vx(y),w=new Jg(C),me=new Dx(C,w),x=new Gx(C,w,he,me),F=new Yx(C,x,w,he),se=new qx(C,K,ue),ce=new Fx(ie),V=new iv(y,ze,ke,Z,K,me,ce),j=new Sv(y,ie),X=new ov,Ie=new dv(Z),Ae=new Lx(y,ze,ke,$,F,f,l),Ee=new mv(y,F,K),Xe=new Tv(C,he,K,$),_e=new Nx(C,Z,he),Oe=new Wx(C,Z,he),he.programs=V.programs,y.capabilities=K,y.extensions=Z,y.properties=ie,y.renderLists=X,y.shadowMap=Ee,y.state=$,y.info=he}L();let ae=new $h(y,C);this.xr=ae,this.getContext=function(){return C},this.getContextAttributes=function(){return C.getContextAttributes()},this.forceContextLoss=function(){let v=Z.get("WEBGL_lose_context");v&&v.loseContext()},this.forceContextRestore=function(){let v=Z.get("WEBGL_lose_context");v&&v.restoreContext()},this.getPixelRatio=function(){return H},this.setPixelRatio=function(v){v!==void 0&&(H=v,this.setSize(G,ne,!1))},this.getSize=function(v){return v.set(G,ne)},this.setSize=function(v,N,B=!0){if(ae.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}G=v,ne=N,t.width=Math.floor(v*H),t.height=Math.floor(N*H),B===!0&&(t.style.width=v+"px",t.style.height=N+"px"),this.setViewport(0,0,v,N)},this.getDrawingBufferSize=function(v){return v.set(G*H,ne*H).floor()},this.setDrawingBufferSize=function(v,N,B){G=v,ne=N,H=B,t.width=Math.floor(v*B),t.height=Math.floor(N*B),this.setViewport(0,0,v,N)},this.getCurrentViewport=function(v){return v.copy(P)},this.getViewport=function(v){return v.copy(be)},this.setViewport=function(v,N,B,k){v.isVector4?be.set(v.x,v.y,v.z,v.w):be.set(v,N,B,k),$.viewport(P.copy(be).multiplyScalar(H).round())},this.getScissor=function(v){return v.copy(He)},this.setScissor=function(v,N,B,k){v.isVector4?He.set(v.x,v.y,v.z,v.w):He.set(v,N,B,k),$.scissor(O.copy(He).multiplyScalar(H).round())},this.getScissorTest=function(){return je},this.setScissorTest=function(v){$.setScissorTest(je=v)},this.setOpaqueSort=function(v){de=v},this.setTransparentSort=function(v){ye=v},this.getClearColor=function(v){return v.copy(Ae.getClearColor())},this.setClearColor=function(){Ae.setClearColor(...arguments)},this.getClearAlpha=function(){return Ae.getClearAlpha()},this.setClearAlpha=function(){Ae.setClearAlpha(...arguments)},this.clear=function(v=!0,N=!0,B=!0){let k=0;if(v){let U=!1;if(D!==null){let oe=D.texture.format;U=oe===ll||oe===al||oe===ol}if(U){let oe=D.texture.type,ge=oe===Fn||oe===Li||oe===tr||oe===nr||oe===il||oe===sl,Te=Ae.getClearColor(),ve=Ae.getClearAlpha(),Fe=Te.r,Be=Te.g,Ne=Te.b;ge?(p[0]=Fe,p[1]=Be,p[2]=Ne,p[3]=ve,C.clearBufferuiv(C.COLOR,0,p)):(_[0]=Fe,_[1]=Be,_[2]=Ne,_[3]=ve,C.clearBufferiv(C.COLOR,0,_))}else k|=C.COLOR_BUFFER_BIT}N&&(k|=C.DEPTH_BUFFER_BIT),B&&(k|=C.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),C.clear(k)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",fe,!1),t.removeEventListener("webglcontextrestored",Se,!1),t.removeEventListener("webglcontextcreationerror",re,!1),Ae.dispose(),X.dispose(),Ie.dispose(),ie.dispose(),ze.dispose(),ke.dispose(),F.dispose(),me.dispose(),Xe.dispose(),V.dispose(),ae.dispose(),ae.removeEventListener("sessionstart",On),ae.removeEventListener("sessionend",Uu),ki.stop()};function fe(v){v.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),R=!0}function Se(){console.log("THREE.WebGLRenderer: Context Restored."),R=!1;let v=he.autoReset,N=Ee.enabled,B=Ee.autoUpdate,k=Ee.needsUpdate,U=Ee.type;L(),he.autoReset=v,Ee.enabled=N,Ee.autoUpdate=B,Ee.needsUpdate=k,Ee.type=U}function re(v){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",v.statusMessage)}function J(v){let N=v.target;N.removeEventListener("dispose",J),Re(N)}function Re(v){Ve(v),ie.remove(v)}function Ve(v){let N=ie.get(v).programs;N!==void 0&&(N.forEach(function(B){V.releaseProgram(B)}),v.isShaderMaterial&&V.releaseShaderCache(v))}this.renderBufferDirect=function(v,N,B,k,U,oe){N===null&&(N=we);let ge=U.isMesh&&U.matrixWorld.determinant()<0,Te=Hp(v,N,B,k,U);$.setMaterial(k,ge);let ve=B.index,Fe=1;if(k.wireframe===!0){if(ve=x.getWireframeAttribute(B),ve===void 0)return;Fe=2}let Be=B.drawRange,Ne=B.attributes.position,Je=Be.start*Fe,ct=(Be.start+Be.count)*Fe;oe!==null&&(Je=Math.max(Je,oe.start*Fe),ct=Math.min(ct,(oe.start+oe.count)*Fe)),ve!==null?(Je=Math.max(Je,0),ct=Math.min(ct,ve.count)):Ne!=null&&(Je=Math.max(Je,0),ct=Math.min(ct,Ne.count));let Et=ct-Je;if(Et<0||Et===1/0)return;me.setup(U,k,Te,B,ve);let gt,ut=_e;if(ve!==null&&(gt=w.get(ve),ut=Oe,ut.setIndex(gt)),U.isMesh)k.wireframe===!0?($.setLineWidth(k.wireframeLinewidth*ft()),ut.setMode(C.LINES)):ut.setMode(C.TRIANGLES);else if(U.isLine){let Ue=k.linewidth;Ue===void 0&&(Ue=1),$.setLineWidth(Ue*ft()),U.isLineSegments?ut.setMode(C.LINES):U.isLineLoop?ut.setMode(C.LINE_LOOP):ut.setMode(C.LINE_STRIP)}else U.isPoints?ut.setMode(C.POINTS):U.isSprite&&ut.setMode(C.TRIANGLES);if(U.isBatchedMesh)if(U._multiDrawInstances!==null)zs("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),ut.renderMultiDrawInstances(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount,U._multiDrawInstances);else if(Z.get("WEBGL_multi_draw"))ut.renderMultiDraw(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount);else{let Ue=U._multiDrawStarts,Mt=U._multiDrawCounts,et=U._multiDrawCount,hn=ve?w.get(ve).bytesPerElement:1,_s=ie.get(k).currentProgram.getUniforms();for(let un=0;un<et;un++)_s.setValue(C,"_gl_DrawID",un),ut.render(Ue[un]/hn,Mt[un])}else if(U.isInstancedMesh)ut.renderInstances(Je,Et,U.count);else if(B.isInstancedBufferGeometry){let Ue=B._maxInstanceCount!==void 0?B._maxInstanceCount:1/0,Mt=Math.min(B.instanceCount,Ue);ut.renderInstances(Je,Et,Mt)}else ut.render(Je,Et)};function pt(v,N,B){v.transparent===!0&&v.side===Ht&&v.forceSinglePass===!1?(v.side=Yt,v.needsUpdate=!0,Do(v,N,B),v.side=Dn,v.needsUpdate=!0,Do(v,N,B),v.side=Ht):Do(v,N,B)}this.compile=function(v,N,B=null){B===null&&(B=v),g=Ie.get(B),g.init(N),M.push(g),B.traverseVisible(function(U){U.isLight&&U.layers.test(N.layers)&&(g.pushLight(U),U.castShadow&&g.pushShadow(U))}),v!==B&&v.traverseVisible(function(U){U.isLight&&U.layers.test(N.layers)&&(g.pushLight(U),U.castShadow&&g.pushShadow(U))}),g.setupLights();let k=new Set;return v.traverse(function(U){if(!(U.isMesh||U.isPoints||U.isLine||U.isSprite))return;let oe=U.material;if(oe)if(Array.isArray(oe))for(let ge=0;ge<oe.length;ge++){let Te=oe[ge];pt(Te,B,U),k.add(Te)}else pt(oe,B,U),k.add(oe)}),g=M.pop(),k},this.compileAsync=function(v,N,B=null){let k=this.compile(v,N,B);return new Promise(U=>{function oe(){if(k.forEach(function(ge){ie.get(ge).currentProgram.isReady()&&k.delete(ge)}),k.size===0){U(v);return}setTimeout(oe,10)}Z.get("KHR_parallel_shader_compile")!==null?oe():setTimeout(oe,10)})};let st=null;function Jn(v){st&&st(v)}function On(){ki.stop()}function Uu(){ki.start()}let ki=new _p;ki.setAnimationLoop(Jn),typeof self<"u"&&ki.setContext(self),this.setAnimationLoop=function(v){st=v,ae.setAnimationLoop(v),v===null?ki.stop():ki.start()},ae.addEventListener("sessionstart",On),ae.addEventListener("sessionend",Uu),this.render=function(v,N){if(N!==void 0&&N.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(R===!0)return;if(v.matrixWorldAutoUpdate===!0&&v.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),ae.enabled===!0&&ae.isPresenting===!0&&(ae.cameraAutoUpdate===!0&&ae.updateCamera(N),N=ae.getCamera()),v.isScene===!0&&v.onBeforeRender(y,v,N,D),g=Ie.get(v,M.length),g.init(N),M.push(g),ee.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),ot.setFromProjectionMatrix(ee,Ln,N.reversedDepth),Y=this.localClippingEnabled,Qe=ce.init(this.clippingPlanes,Y),m=X.get(v,S.length),m.init(),S.push(m),ae.enabled===!0&&ae.isPresenting===!0){let oe=y.xr.getDepthSensingMesh();oe!==null&&nc(oe,N,-1/0,y.sortObjects)}nc(v,N,0,y.sortObjects),m.finish(),y.sortObjects===!0&&m.sort(de,ye),Ze=ae.enabled===!1||ae.isPresenting===!1||ae.hasDepthSensing()===!1,Ze&&Ae.addToRenderList(m,v),this.info.render.frame++,Qe===!0&&ce.beginShadows();let B=g.state.shadowsArray;Ee.render(B,v,N),Qe===!0&&ce.endShadows(),this.info.autoReset===!0&&this.info.reset();let k=m.opaque,U=m.transmissive;if(g.setupLights(),N.isArrayCamera){let oe=N.cameras;if(U.length>0)for(let ge=0,Te=oe.length;ge<Te;ge++){let ve=oe[ge];Ou(k,U,v,ve)}Ze&&Ae.render(v);for(let ge=0,Te=oe.length;ge<Te;ge++){let ve=oe[ge];Fu(m,v,ve,ve.viewport)}}else U.length>0&&Ou(k,U,v,N),Ze&&Ae.render(v),Fu(m,v,N);D!==null&&I===0&&(ue.updateMultisampleRenderTarget(D),ue.updateRenderTargetMipmap(D)),v.isScene===!0&&v.onAfterRender(y,v,N),me.resetDefaultState(),T=-1,b=null,M.pop(),M.length>0?(g=M[M.length-1],Qe===!0&&ce.setGlobalState(y.clippingPlanes,g.state.camera)):g=null,S.pop(),S.length>0?m=S[S.length-1]:m=null};function nc(v,N,B,k){if(v.visible===!1)return;if(v.layers.test(N.layers)){if(v.isGroup)B=v.renderOrder;else if(v.isLOD)v.autoUpdate===!0&&v.update(N);else if(v.isLight)g.pushLight(v),v.castShadow&&g.pushShadow(v);else if(v.isSprite){if(!v.frustumCulled||ot.intersectsSprite(v)){k&&De.setFromMatrixPosition(v.matrixWorld).applyMatrix4(ee);let ge=F.update(v),Te=v.material;Te.visible&&m.push(v,ge,Te,B,De.z,null)}}else if((v.isMesh||v.isLine||v.isPoints)&&(!v.frustumCulled||ot.intersectsObject(v))){let ge=F.update(v),Te=v.material;if(k&&(v.boundingSphere!==void 0?(v.boundingSphere===null&&v.computeBoundingSphere(),De.copy(v.boundingSphere.center)):(ge.boundingSphere===null&&ge.computeBoundingSphere(),De.copy(ge.boundingSphere.center)),De.applyMatrix4(v.matrixWorld).applyMatrix4(ee)),Array.isArray(Te)){let ve=ge.groups;for(let Fe=0,Be=ve.length;Fe<Be;Fe++){let Ne=ve[Fe],Je=Te[Ne.materialIndex];Je&&Je.visible&&m.push(v,ge,Je,B,De.z,Ne)}}else Te.visible&&m.push(v,ge,Te,B,De.z,null)}}let oe=v.children;for(let ge=0,Te=oe.length;ge<Te;ge++)nc(oe[ge],N,B,k)}function Fu(v,N,B,k){let U=v.opaque,oe=v.transmissive,ge=v.transparent;g.setupLightsView(B),Qe===!0&&ce.setGlobalState(y.clippingPlanes,B),k&&$.viewport(P.copy(k)),U.length>0&&Lo(U,N,B),oe.length>0&&Lo(oe,N,B),ge.length>0&&Lo(ge,N,B),$.buffers.depth.setTest(!0),$.buffers.depth.setMask(!0),$.buffers.color.setMask(!0),$.setPolygonOffset(!1)}function Ou(v,N,B,k){if((B.isScene===!0?B.overrideMaterial:null)!==null)return;g.state.transmissionRenderTarget[k.id]===void 0&&(g.state.transmissionRenderTarget[k.id]=new kt(1,1,{generateMipmaps:!0,type:Z.has("EXT_color_buffer_half_float")||Z.has("EXT_color_buffer_float")?cn:Fn,minFilter:Un,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:$e.workingColorSpace}));let oe=g.state.transmissionRenderTarget[k.id],ge=k.viewport||P;oe.setSize(ge.z*y.transmissionResolutionScale,ge.w*y.transmissionResolutionScale);let Te=y.getRenderTarget(),ve=y.getActiveCubeFace(),Fe=y.getActiveMipmapLevel();y.setRenderTarget(oe),y.getClearColor(W),q=y.getClearAlpha(),q<1&&y.setClearColor(16777215,.5),y.clear(),Ze&&Ae.render(B);let Be=y.toneMapping;y.toneMapping=gi;let Ne=k.viewport;if(k.viewport!==void 0&&(k.viewport=void 0),g.setupLightsView(k),Qe===!0&&ce.setGlobalState(y.clippingPlanes,k),Lo(v,B,k),ue.updateMultisampleRenderTarget(oe),ue.updateRenderTargetMipmap(oe),Z.has("WEBGL_multisampled_render_to_texture")===!1){let Je=!1;for(let ct=0,Et=N.length;ct<Et;ct++){let gt=N[ct],ut=gt.object,Ue=gt.geometry,Mt=gt.material,et=gt.group;if(Mt.side===Ht&&ut.layers.test(k.layers)){let hn=Mt.side;Mt.side=Yt,Mt.needsUpdate=!0,Bu(ut,B,k,Ue,Mt,et),Mt.side=hn,Mt.needsUpdate=!0,Je=!0}}Je===!0&&(ue.updateMultisampleRenderTarget(oe),ue.updateRenderTargetMipmap(oe))}y.setRenderTarget(Te,ve,Fe),y.setClearColor(W,q),Ne!==void 0&&(k.viewport=Ne),y.toneMapping=Be}function Lo(v,N,B){let k=N.isScene===!0?N.overrideMaterial:null;for(let U=0,oe=v.length;U<oe;U++){let ge=v[U],Te=ge.object,ve=ge.geometry,Fe=ge.group,Be=ge.material;Be.allowOverride===!0&&k!==null&&(Be=k),Te.layers.test(B.layers)&&Bu(Te,N,B,ve,Be,Fe)}}function Bu(v,N,B,k,U,oe){v.onBeforeRender(y,N,B,k,U,oe),v.modelViewMatrix.multiplyMatrices(B.matrixWorldInverse,v.matrixWorld),v.normalMatrix.getNormalMatrix(v.modelViewMatrix),U.onBeforeRender(y,N,B,k,v,oe),U.transparent===!0&&U.side===Ht&&U.forceSinglePass===!1?(U.side=Yt,U.needsUpdate=!0,y.renderBufferDirect(B,N,k,U,v,oe),U.side=Dn,U.needsUpdate=!0,y.renderBufferDirect(B,N,k,U,v,oe),U.side=Ht):y.renderBufferDirect(B,N,k,U,v,oe),v.onAfterRender(y,N,B,k,U,oe)}function Do(v,N,B){N.isScene!==!0&&(N=we);let k=ie.get(v),U=g.state.lights,oe=g.state.shadowsArray,ge=U.state.version,Te=V.getParameters(v,U.state,oe,N,B),ve=V.getProgramCacheKey(Te),Fe=k.programs;k.environment=v.isMeshStandardMaterial?N.environment:null,k.fog=N.fog,k.envMap=(v.isMeshStandardMaterial?ke:ze).get(v.envMap||k.environment),k.envMapRotation=k.environment!==null&&v.envMap===null?N.environmentRotation:v.envMapRotation,Fe===void 0&&(v.addEventListener("dispose",J),Fe=new Map,k.programs=Fe);let Be=Fe.get(ve);if(Be!==void 0){if(k.currentProgram===Be&&k.lightsStateVersion===ge)return zu(v,Te),Be}else Te.uniforms=V.getUniforms(v),v.onBeforeCompile(Te,y),Be=V.acquireProgram(Te,ve),Fe.set(ve,Be),k.uniforms=Te.uniforms;let Ne=k.uniforms;return(!v.isShaderMaterial&&!v.isRawShaderMaterial||v.clipping===!0)&&(Ne.clippingPlanes=ce.uniform),zu(v,Te),k.needsLights=Wp(v),k.lightsStateVersion=ge,k.needsLights&&(Ne.ambientLightColor.value=U.state.ambient,Ne.lightProbe.value=U.state.probe,Ne.directionalLights.value=U.state.directional,Ne.directionalLightShadows.value=U.state.directionalShadow,Ne.spotLights.value=U.state.spot,Ne.spotLightShadows.value=U.state.spotShadow,Ne.rectAreaLights.value=U.state.rectArea,Ne.ltc_1.value=U.state.rectAreaLTC1,Ne.ltc_2.value=U.state.rectAreaLTC2,Ne.pointLights.value=U.state.point,Ne.pointLightShadows.value=U.state.pointShadow,Ne.hemisphereLights.value=U.state.hemi,Ne.directionalShadowMap.value=U.state.directionalShadowMap,Ne.directionalShadowMatrix.value=U.state.directionalShadowMatrix,Ne.spotShadowMap.value=U.state.spotShadowMap,Ne.spotLightMatrix.value=U.state.spotLightMatrix,Ne.spotLightMap.value=U.state.spotLightMap,Ne.pointShadowMap.value=U.state.pointShadowMap,Ne.pointShadowMatrix.value=U.state.pointShadowMatrix),k.currentProgram=Be,k.uniformsList=null,Be}function ku(v){if(v.uniformsList===null){let N=v.currentProgram.getUniforms();v.uniformsList=ar.seqWithValue(N.seq,v.uniforms)}return v.uniformsList}function zu(v,N){let B=ie.get(v);B.outputColorSpace=N.outputColorSpace,B.batching=N.batching,B.batchingColor=N.batchingColor,B.instancing=N.instancing,B.instancingColor=N.instancingColor,B.instancingMorph=N.instancingMorph,B.skinning=N.skinning,B.morphTargets=N.morphTargets,B.morphNormals=N.morphNormals,B.morphColors=N.morphColors,B.morphTargetsCount=N.morphTargetsCount,B.numClippingPlanes=N.numClippingPlanes,B.numIntersection=N.numClipIntersection,B.vertexAlphas=N.vertexAlphas,B.vertexTangents=N.vertexTangents,B.toneMapping=N.toneMapping}function Hp(v,N,B,k,U){N.isScene!==!0&&(N=we),ue.resetTextureUnits();let oe=N.fog,ge=k.isMeshStandardMaterial?N.environment:null,Te=D===null?y.outputColorSpace:D.isXRRenderTarget===!0?D.texture.colorSpace:Xt,ve=(k.isMeshStandardMaterial?ke:ze).get(k.envMap||ge),Fe=k.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,Be=!!B.attributes.tangent&&(!!k.normalMap||k.anisotropy>0),Ne=!!B.morphAttributes.position,Je=!!B.morphAttributes.normal,ct=!!B.morphAttributes.color,Et=gi;k.toneMapped&&(D===null||D.isXRRenderTarget===!0)&&(Et=y.toneMapping);let gt=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,ut=gt!==void 0?gt.length:0,Ue=ie.get(k),Mt=g.state.lights;if(Qe===!0&&(Y===!0||v!==b)){let Qt=v===b&&k.id===T;ce.setState(k,v,Qt)}let et=!1;k.version===Ue.__version?(Ue.needsLights&&Ue.lightsStateVersion!==Mt.state.version||Ue.outputColorSpace!==Te||U.isBatchedMesh&&Ue.batching===!1||!U.isBatchedMesh&&Ue.batching===!0||U.isBatchedMesh&&Ue.batchingColor===!0&&U.colorTexture===null||U.isBatchedMesh&&Ue.batchingColor===!1&&U.colorTexture!==null||U.isInstancedMesh&&Ue.instancing===!1||!U.isInstancedMesh&&Ue.instancing===!0||U.isSkinnedMesh&&Ue.skinning===!1||!U.isSkinnedMesh&&Ue.skinning===!0||U.isInstancedMesh&&Ue.instancingColor===!0&&U.instanceColor===null||U.isInstancedMesh&&Ue.instancingColor===!1&&U.instanceColor!==null||U.isInstancedMesh&&Ue.instancingMorph===!0&&U.morphTexture===null||U.isInstancedMesh&&Ue.instancingMorph===!1&&U.morphTexture!==null||Ue.envMap!==ve||k.fog===!0&&Ue.fog!==oe||Ue.numClippingPlanes!==void 0&&(Ue.numClippingPlanes!==ce.numPlanes||Ue.numIntersection!==ce.numIntersection)||Ue.vertexAlphas!==Fe||Ue.vertexTangents!==Be||Ue.morphTargets!==Ne||Ue.morphNormals!==Je||Ue.morphColors!==ct||Ue.toneMapping!==Et||Ue.morphTargetsCount!==ut)&&(et=!0):(et=!0,Ue.__version=k.version);let hn=Ue.currentProgram;et===!0&&(hn=Do(k,N,U));let _s=!1,un=!1,pr=!1,bt=hn.getUniforms(),xn=Ue.uniforms;if($.useProgram(hn.program)&&(_s=!0,un=!0,pr=!0),k.id!==T&&(T=k.id,un=!0),_s||b!==v){$.buffers.depth.getReversed()&&v.reversedDepth!==!0&&(v._reversedDepth=!0,v.updateProjectionMatrix()),bt.setValue(C,"projectionMatrix",v.projectionMatrix),bt.setValue(C,"viewMatrix",v.matrixWorldInverse);let on=bt.map.cameraPosition;on!==void 0&&on.setValue(C,Me.setFromMatrixPosition(v.matrixWorld)),K.logarithmicDepthBuffer&&bt.setValue(C,"logDepthBufFC",2/(Math.log(v.far+1)/Math.LN2)),(k.isMeshPhongMaterial||k.isMeshToonMaterial||k.isMeshLambertMaterial||k.isMeshBasicMaterial||k.isMeshStandardMaterial||k.isShaderMaterial)&&bt.setValue(C,"isOrthographic",v.isOrthographicCamera===!0),b!==v&&(b=v,un=!0,pr=!0)}if(U.isSkinnedMesh){bt.setOptional(C,U,"bindMatrix"),bt.setOptional(C,U,"bindMatrixInverse");let Qt=U.skeleton;Qt&&(Qt.boneTexture===null&&Qt.computeBoneTexture(),bt.setValue(C,"boneTexture",Qt.boneTexture,ue))}U.isBatchedMesh&&(bt.setOptional(C,U,"batchingTexture"),bt.setValue(C,"batchingTexture",U._matricesTexture,ue),bt.setOptional(C,U,"batchingIdTexture"),bt.setValue(C,"batchingIdTexture",U._indirectTexture,ue),bt.setOptional(C,U,"batchingColorTexture"),U._colorsTexture!==null&&bt.setValue(C,"batchingColorTexture",U._colorsTexture,ue));let yn=B.morphAttributes;if((yn.position!==void 0||yn.normal!==void 0||yn.color!==void 0)&&se.update(U,B,hn),(un||Ue.receiveShadow!==U.receiveShadow)&&(Ue.receiveShadow=U.receiveShadow,bt.setValue(C,"receiveShadow",U.receiveShadow)),k.isMeshGouraudMaterial&&k.envMap!==null&&(xn.envMap.value=ve,xn.flipEnvMap.value=ve.isCubeTexture&&ve.isRenderTargetTexture===!1?-1:1),k.isMeshStandardMaterial&&k.envMap===null&&N.environment!==null&&(xn.envMapIntensity.value=N.environmentIntensity),un&&(bt.setValue(C,"toneMappingExposure",y.toneMappingExposure),Ue.needsLights&&Gp(xn,pr),oe&&k.fog===!0&&j.refreshFogUniforms(xn,oe),j.refreshMaterialUniforms(xn,k,H,ne,g.state.transmissionRenderTarget[v.id]),ar.upload(C,ku(Ue),xn,ue)),k.isShaderMaterial&&k.uniformsNeedUpdate===!0&&(ar.upload(C,ku(Ue),xn,ue),k.uniformsNeedUpdate=!1),k.isSpriteMaterial&&bt.setValue(C,"center",U.center),bt.setValue(C,"modelViewMatrix",U.modelViewMatrix),bt.setValue(C,"normalMatrix",U.normalMatrix),bt.setValue(C,"modelMatrix",U.matrixWorld),k.isShaderMaterial||k.isRawShaderMaterial){let Qt=k.uniformsGroups;for(let on=0,ic=Qt.length;on<ic;on++){let zi=Qt[on];Xe.update(zi,hn),Xe.bind(zi,hn)}}return hn}function Gp(v,N){v.ambientLightColor.needsUpdate=N,v.lightProbe.needsUpdate=N,v.directionalLights.needsUpdate=N,v.directionalLightShadows.needsUpdate=N,v.pointLights.needsUpdate=N,v.pointLightShadows.needsUpdate=N,v.spotLights.needsUpdate=N,v.spotLightShadows.needsUpdate=N,v.rectAreaLights.needsUpdate=N,v.hemisphereLights.needsUpdate=N}function Wp(v){return v.isMeshLambertMaterial||v.isMeshToonMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isShadowMaterial||v.isShaderMaterial&&v.lights===!0}this.getActiveCubeFace=function(){return A},this.getActiveMipmapLevel=function(){return I},this.getRenderTarget=function(){return D},this.setRenderTargetTextures=function(v,N,B){let k=ie.get(v);k.__autoAllocateDepthBuffer=v.resolveDepthBuffer===!1,k.__autoAllocateDepthBuffer===!1&&(k.__useRenderToTexture=!1),ie.get(v.texture).__webglTexture=N,ie.get(v.depthTexture).__webglTexture=k.__autoAllocateDepthBuffer?void 0:B,k.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(v,N){let B=ie.get(v);B.__webglFramebuffer=N,B.__useDefaultFramebuffer=N===void 0};let Xp=C.createFramebuffer();this.setRenderTarget=function(v,N=0,B=0){D=v,A=N,I=B;let k=!0,U=null,oe=!1,ge=!1;if(v){let ve=ie.get(v);if(ve.__useDefaultFramebuffer!==void 0)$.bindFramebuffer(C.FRAMEBUFFER,null),k=!1;else if(ve.__webglFramebuffer===void 0)ue.setupRenderTarget(v);else if(ve.__hasExternalTextures)ue.rebindTextures(v,ie.get(v.texture).__webglTexture,ie.get(v.depthTexture).__webglTexture);else if(v.depthBuffer){let Ne=v.depthTexture;if(ve.__boundDepthTexture!==Ne){if(Ne!==null&&ie.has(Ne)&&(v.width!==Ne.image.width||v.height!==Ne.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");ue.setupDepthRenderbuffer(v)}}let Fe=v.texture;(Fe.isData3DTexture||Fe.isDataArrayTexture||Fe.isCompressedArrayTexture)&&(ge=!0);let Be=ie.get(v).__webglFramebuffer;v.isWebGLCubeRenderTarget?(Array.isArray(Be[N])?U=Be[N][B]:U=Be[N],oe=!0):v.samples>0&&ue.useMultisampledRTT(v)===!1?U=ie.get(v).__webglMultisampledFramebuffer:Array.isArray(Be)?U=Be[B]:U=Be,P.copy(v.viewport),O.copy(v.scissor),z=v.scissorTest}else P.copy(be).multiplyScalar(H).floor(),O.copy(He).multiplyScalar(H).floor(),z=je;if(B!==0&&(U=Xp),$.bindFramebuffer(C.FRAMEBUFFER,U)&&k&&$.drawBuffers(v,U),$.viewport(P),$.scissor(O),$.setScissorTest(z),oe){let ve=ie.get(v.texture);C.framebufferTexture2D(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_CUBE_MAP_POSITIVE_X+N,ve.__webglTexture,B)}else if(ge){let ve=N;for(let Fe=0;Fe<v.textures.length;Fe++){let Be=ie.get(v.textures[Fe]);C.framebufferTextureLayer(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0+Fe,Be.__webglTexture,B,ve)}}else if(v!==null&&B!==0){let ve=ie.get(v.texture);C.framebufferTexture2D(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_2D,ve.__webglTexture,B)}T=-1},this.readRenderTargetPixels=function(v,N,B,k,U,oe,ge,Te=0){if(!(v&&v.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ve=ie.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&ge!==void 0&&(ve=ve[ge]),ve){$.bindFramebuffer(C.FRAMEBUFFER,ve);try{let Fe=v.textures[Te],Be=Fe.format,Ne=Fe.type;if(!K.textureFormatReadable(Be)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!K.textureTypeReadable(Ne)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=v.width-k&&B>=0&&B<=v.height-U&&(v.textures.length>1&&C.readBuffer(C.COLOR_ATTACHMENT0+Te),C.readPixels(N,B,k,U,Pe.convert(Be),Pe.convert(Ne),oe))}finally{let Fe=D!==null?ie.get(D).__webglFramebuffer:null;$.bindFramebuffer(C.FRAMEBUFFER,Fe)}}},this.readRenderTargetPixelsAsync=async function(v,N,B,k,U,oe,ge,Te=0){if(!(v&&v.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ve=ie.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&ge!==void 0&&(ve=ve[ge]),ve)if(N>=0&&N<=v.width-k&&B>=0&&B<=v.height-U){$.bindFramebuffer(C.FRAMEBUFFER,ve);let Fe=v.textures[Te],Be=Fe.format,Ne=Fe.type;if(!K.textureFormatReadable(Be))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!K.textureTypeReadable(Ne))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Je=C.createBuffer();C.bindBuffer(C.PIXEL_PACK_BUFFER,Je),C.bufferData(C.PIXEL_PACK_BUFFER,oe.byteLength,C.STREAM_READ),v.textures.length>1&&C.readBuffer(C.COLOR_ATTACHMENT0+Te),C.readPixels(N,B,k,U,Pe.convert(Be),Pe.convert(Ne),0);let ct=D!==null?ie.get(D).__webglFramebuffer:null;$.bindFramebuffer(C.FRAMEBUFFER,ct);let Et=C.fenceSync(C.SYNC_GPU_COMMANDS_COMPLETE,0);return C.flush(),await zf(C,Et,4),C.bindBuffer(C.PIXEL_PACK_BUFFER,Je),C.getBufferSubData(C.PIXEL_PACK_BUFFER,0,oe),C.deleteBuffer(Je),C.deleteSync(Et),oe}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(v,N=null,B=0){let k=Math.pow(2,-B),U=Math.floor(v.image.width*k),oe=Math.floor(v.image.height*k),ge=N!==null?N.x:0,Te=N!==null?N.y:0;ue.setTexture2D(v,0),C.copyTexSubImage2D(C.TEXTURE_2D,B,0,0,ge,Te,U,oe),$.unbindTexture()};let qp=C.createFramebuffer(),Yp=C.createFramebuffer();this.copyTextureToTexture=function(v,N,B=null,k=null,U=0,oe=null){oe===null&&(U!==0?(zs("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),oe=U,U=0):oe=0);let ge,Te,ve,Fe,Be,Ne,Je,ct,Et,gt=v.isCompressedTexture?v.mipmaps[oe]:v.image;if(B!==null)ge=B.max.x-B.min.x,Te=B.max.y-B.min.y,ve=B.isBox3?B.max.z-B.min.z:1,Fe=B.min.x,Be=B.min.y,Ne=B.isBox3?B.min.z:0;else{let yn=Math.pow(2,-U);ge=Math.floor(gt.width*yn),Te=Math.floor(gt.height*yn),v.isDataArrayTexture?ve=gt.depth:v.isData3DTexture?ve=Math.floor(gt.depth*yn):ve=1,Fe=0,Be=0,Ne=0}k!==null?(Je=k.x,ct=k.y,Et=k.z):(Je=0,ct=0,Et=0);let ut=Pe.convert(N.format),Ue=Pe.convert(N.type),Mt;N.isData3DTexture?(ue.setTexture3D(N,0),Mt=C.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(ue.setTexture2DArray(N,0),Mt=C.TEXTURE_2D_ARRAY):(ue.setTexture2D(N,0),Mt=C.TEXTURE_2D),C.pixelStorei(C.UNPACK_FLIP_Y_WEBGL,N.flipY),C.pixelStorei(C.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),C.pixelStorei(C.UNPACK_ALIGNMENT,N.unpackAlignment);let et=C.getParameter(C.UNPACK_ROW_LENGTH),hn=C.getParameter(C.UNPACK_IMAGE_HEIGHT),_s=C.getParameter(C.UNPACK_SKIP_PIXELS),un=C.getParameter(C.UNPACK_SKIP_ROWS),pr=C.getParameter(C.UNPACK_SKIP_IMAGES);C.pixelStorei(C.UNPACK_ROW_LENGTH,gt.width),C.pixelStorei(C.UNPACK_IMAGE_HEIGHT,gt.height),C.pixelStorei(C.UNPACK_SKIP_PIXELS,Fe),C.pixelStorei(C.UNPACK_SKIP_ROWS,Be),C.pixelStorei(C.UNPACK_SKIP_IMAGES,Ne);let bt=v.isDataArrayTexture||v.isData3DTexture,xn=N.isDataArrayTexture||N.isData3DTexture;if(v.isDepthTexture){let yn=ie.get(v),Qt=ie.get(N),on=ie.get(yn.__renderTarget),ic=ie.get(Qt.__renderTarget);$.bindFramebuffer(C.READ_FRAMEBUFFER,on.__webglFramebuffer),$.bindFramebuffer(C.DRAW_FRAMEBUFFER,ic.__webglFramebuffer);for(let zi=0;zi<ve;zi++)bt&&(C.framebufferTextureLayer(C.READ_FRAMEBUFFER,C.COLOR_ATTACHMENT0,ie.get(v).__webglTexture,U,Ne+zi),C.framebufferTextureLayer(C.DRAW_FRAMEBUFFER,C.COLOR_ATTACHMENT0,ie.get(N).__webglTexture,oe,Et+zi)),C.blitFramebuffer(Fe,Be,ge,Te,Je,ct,ge,Te,C.DEPTH_BUFFER_BIT,C.NEAREST);$.bindFramebuffer(C.READ_FRAMEBUFFER,null),$.bindFramebuffer(C.DRAW_FRAMEBUFFER,null)}else if(U!==0||v.isRenderTargetTexture||ie.has(v)){let yn=ie.get(v),Qt=ie.get(N);$.bindFramebuffer(C.READ_FRAMEBUFFER,qp),$.bindFramebuffer(C.DRAW_FRAMEBUFFER,Yp);for(let on=0;on<ve;on++)bt?C.framebufferTextureLayer(C.READ_FRAMEBUFFER,C.COLOR_ATTACHMENT0,yn.__webglTexture,U,Ne+on):C.framebufferTexture2D(C.READ_FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_2D,yn.__webglTexture,U),xn?C.framebufferTextureLayer(C.DRAW_FRAMEBUFFER,C.COLOR_ATTACHMENT0,Qt.__webglTexture,oe,Et+on):C.framebufferTexture2D(C.DRAW_FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_2D,Qt.__webglTexture,oe),U!==0?C.blitFramebuffer(Fe,Be,ge,Te,Je,ct,ge,Te,C.COLOR_BUFFER_BIT,C.NEAREST):xn?C.copyTexSubImage3D(Mt,oe,Je,ct,Et+on,Fe,Be,ge,Te):C.copyTexSubImage2D(Mt,oe,Je,ct,Fe,Be,ge,Te);$.bindFramebuffer(C.READ_FRAMEBUFFER,null),$.bindFramebuffer(C.DRAW_FRAMEBUFFER,null)}else xn?v.isDataTexture||v.isData3DTexture?C.texSubImage3D(Mt,oe,Je,ct,Et,ge,Te,ve,ut,Ue,gt.data):N.isCompressedArrayTexture?C.compressedTexSubImage3D(Mt,oe,Je,ct,Et,ge,Te,ve,ut,gt.data):C.texSubImage3D(Mt,oe,Je,ct,Et,ge,Te,ve,ut,Ue,gt):v.isDataTexture?C.texSubImage2D(C.TEXTURE_2D,oe,Je,ct,ge,Te,ut,Ue,gt.data):v.isCompressedTexture?C.compressedTexSubImage2D(C.TEXTURE_2D,oe,Je,ct,gt.width,gt.height,ut,gt.data):C.texSubImage2D(C.TEXTURE_2D,oe,Je,ct,ge,Te,ut,Ue,gt);C.pixelStorei(C.UNPACK_ROW_LENGTH,et),C.pixelStorei(C.UNPACK_IMAGE_HEIGHT,hn),C.pixelStorei(C.UNPACK_SKIP_PIXELS,_s),C.pixelStorei(C.UNPACK_SKIP_ROWS,un),C.pixelStorei(C.UNPACK_SKIP_IMAGES,pr),oe===0&&N.generateMipmaps&&C.generateMipmap(Mt),$.unbindTexture()},this.initRenderTarget=function(v){ie.get(v).__webglFramebuffer===void 0&&ue.setupRenderTarget(v)},this.initTexture=function(v){v.isCubeTexture?ue.setTextureCube(v,0):v.isData3DTexture?ue.setTexture3D(v,0):v.isDataArrayTexture||v.isCompressedArrayTexture?ue.setTexture2DArray(v,0):ue.setTexture2D(v,0),$.unbindTexture()},this.resetState=function(){A=0,I=0,D=null,$.reset(),me.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Ln}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=$e._getDrawingBufferColorSpace(e),t.unpackColorSpace=$e._getUnpackColorSpace()}};function Zh(i,e){if(e===Th)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),i;if(e===sr||e===Mo){let t=i.getIndex();if(t===null){let o=[],a=i.getAttribute("position");if(a!==void 0){for(let l=0;l<a.count;l++)o.push(l);i.setIndex(o),t=i.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),i}let n=t.count-2,s=[];if(e===sr)for(let o=1;o<=n;o++)s.push(t.getX(0)),s.push(t.getX(o)),s.push(t.getX(o+1));else for(let o=0;o<n;o++)o%2===0?(s.push(t.getX(o)),s.push(t.getX(o+1)),s.push(t.getX(o+2))):(s.push(t.getX(o+2)),s.push(t.getX(o+1)),s.push(t.getX(o)));s.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");let r=i.clone();return r.setIndex(s),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),i}var Gl=class extends Xn{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new iu(t)}),this.register(function(t){return new su(t)}),this.register(function(t){return new fu(t)}),this.register(function(t){return new pu(t)}),this.register(function(t){return new mu(t)}),this.register(function(t){return new ou(t)}),this.register(function(t){return new au(t)}),this.register(function(t){return new lu(t)}),this.register(function(t){return new cu(t)}),this.register(function(t){return new nu(t)}),this.register(function(t){return new hu(t)}),this.register(function(t){return new ru(t)}),this.register(function(t){return new du(t)}),this.register(function(t){return new uu(t)}),this.register(function(t){return new eu(t)}),this.register(function(t){return new gu(t)}),this.register(function(t){return new _u(t)})}load(e,t,n,s){let r=this,o;if(this.resourcePath!=="")o=this.resourcePath;else if(this.path!==""){let c=mi.extractUrlBase(e);o=mi.resolveURL(c,this.path)}else o=mi.extractUrlBase(e);this.manager.itemStart(e);let a=function(c){s?s(c):console.error(c),r.manager.itemError(e),r.manager.itemEnd(e)},l=new js(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(c){try{r.parse(c,o,function(h){t(h),r.manager.itemEnd(e)},a)}catch(h){a(h)}},n,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,s){let r,o={},a={},l=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(l.decode(new Uint8Array(e,0,4))===Ap){try{o[Ke.KHR_BINARY_GLTF]=new xu(e)}catch(u){s&&s(u);return}r=JSON.parse(o[Ke.KHR_BINARY_GLTF].content)}else r=JSON.parse(l.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){s&&s(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let c=new wu(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let h=0;h<this.pluginCallbacks.length;h++){let u=this.pluginCallbacks[h](c);u.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),a[u.name]=u,o[u.name]=!0}if(r.extensionsUsed)for(let h=0;h<r.extensionsUsed.length;++h){let u=r.extensionsUsed[h],d=r.extensionsRequired||[];switch(u){case Ke.KHR_MATERIALS_UNLIT:o[u]=new tu;break;case Ke.KHR_DRACO_MESH_COMPRESSION:o[u]=new yu(r,this.dracoLoader);break;case Ke.KHR_TEXTURE_TRANSFORM:o[u]=new vu;break;case Ke.KHR_MESH_QUANTIZATION:o[u]=new Mu;break;default:d.indexOf(u)>=0&&a[u]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+u+'".')}}c.setExtensions(o),c.setPlugins(a),c.parse(n,s)}parseAsync(e,t){let n=this;return new Promise(function(s,r){n.parse(e,t,s,r)})}};function wv(){let i={};return{get:function(e){return i[e]},add:function(e,t){i[e]=t},remove:function(e){delete i[e]},removeAll:function(){i={}}}}var Ke={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"},eu=class{constructor(e){this.parser=e,this.name=Ke.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,s=t.length;n<s;n++){let r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n="light:"+e,s=t.cache.get(n);if(s)return s;let r=t.json,l=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e],c,h=new Ce(16777215);l.color!==void 0&&h.setRGB(l.color[0],l.color[1],l.color[2],Xt);let u=l.range!==void 0?l.range:0;switch(l.type){case"directional":c=new Pi(h),c.target.position.set(0,0,-1),c.add(c.target);break;case"point":c=new ss(h),c.distance=u;break;case"spot":c=new uo(h),c.distance=u,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,c.angle=l.spot.outerConeAngle,c.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,c.target.position.set(0,0,-1),c.add(c.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return c.position.set(0,0,0),$n(c,l),l.intensity!==void 0&&(c.intensity=l.intensity),c.name=t.createUniqueName(l.name||"light_"+e),s=Promise.resolve(c),t.cache.add(n,s),s}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,r=n.json.nodes[e],a=(r.extensions&&r.extensions[this.name]||{}).light;return a===void 0?null:this._loadLight(a).then(function(l){return n._getNodeRef(t.cache,a,l)})}},tu=class{constructor(){this.name=Ke.KHR_MATERIALS_UNLIT}getMaterialType(){return zt}extendParams(e,t,n){let s=[];e.color=new Ce(1,1,1),e.opacity=1;let r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){let o=r.baseColorFactor;e.color.setRGB(o[0],o[1],o[2],Xt),e.opacity=o[3]}r.baseColorTexture!==void 0&&s.push(n.assignTexture(e,"map",r.baseColorTexture,St))}return Promise.all(s)}},nu=class{constructor(e){this.parser=e,this.name=Ke.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=s.extensions[this.name].emissiveStrength;return r!==void 0&&(t.emissiveIntensity=r),Promise.resolve()}},iu=class{constructor(e){this.parser=e,this.name=Ke.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:qt}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];if(o.clearcoatFactor!==void 0&&(t.clearcoat=o.clearcoatFactor),o.clearcoatTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatMap",o.clearcoatTexture)),o.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=o.clearcoatRoughnessFactor),o.clearcoatRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatRoughnessMap",o.clearcoatRoughnessTexture)),o.clearcoatNormalTexture!==void 0&&(r.push(n.assignTexture(t,"clearcoatNormalMap",o.clearcoatNormalTexture)),o.clearcoatNormalTexture.scale!==void 0)){let a=o.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new te(a,a)}return Promise.all(r)}},su=class{constructor(e){this.parser=e,this.name=Ke.KHR_MATERIALS_DISPERSION}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:qt}extendMaterialParams(e,t){let s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=s.extensions[this.name];return t.dispersion=r.dispersion!==void 0?r.dispersion:0,Promise.resolve()}},ru=class{constructor(e){this.parser=e,this.name=Ke.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:qt}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];return o.iridescenceFactor!==void 0&&(t.iridescence=o.iridescenceFactor),o.iridescenceTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceMap",o.iridescenceTexture)),o.iridescenceIor!==void 0&&(t.iridescenceIOR=o.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),o.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=o.iridescenceThicknessMinimum),o.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=o.iridescenceThicknessMaximum),o.iridescenceThicknessTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceThicknessMap",o.iridescenceThicknessTexture)),Promise.all(r)}},ou=class{constructor(e){this.parser=e,this.name=Ke.KHR_MATERIALS_SHEEN}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:qt}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[];t.sheenColor=new Ce(0,0,0),t.sheenRoughness=0,t.sheen=1;let o=s.extensions[this.name];if(o.sheenColorFactor!==void 0){let a=o.sheenColorFactor;t.sheenColor.setRGB(a[0],a[1],a[2],Xt)}return o.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=o.sheenRoughnessFactor),o.sheenColorTexture!==void 0&&r.push(n.assignTexture(t,"sheenColorMap",o.sheenColorTexture,St)),o.sheenRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"sheenRoughnessMap",o.sheenRoughnessTexture)),Promise.all(r)}},au=class{constructor(e){this.parser=e,this.name=Ke.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:qt}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];return o.transmissionFactor!==void 0&&(t.transmission=o.transmissionFactor),o.transmissionTexture!==void 0&&r.push(n.assignTexture(t,"transmissionMap",o.transmissionTexture)),Promise.all(r)}},lu=class{constructor(e){this.parser=e,this.name=Ke.KHR_MATERIALS_VOLUME}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:qt}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];t.thickness=o.thicknessFactor!==void 0?o.thicknessFactor:0,o.thicknessTexture!==void 0&&r.push(n.assignTexture(t,"thicknessMap",o.thicknessTexture)),t.attenuationDistance=o.attenuationDistance||1/0;let a=o.attenuationColor||[1,1,1];return t.attenuationColor=new Ce().setRGB(a[0],a[1],a[2],Xt),Promise.all(r)}},cu=class{constructor(e){this.parser=e,this.name=Ke.KHR_MATERIALS_IOR}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:qt}extendMaterialParams(e,t){let s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=s.extensions[this.name];return t.ior=r.ior!==void 0?r.ior:1.5,Promise.resolve()}},hu=class{constructor(e){this.parser=e,this.name=Ke.KHR_MATERIALS_SPECULAR}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:qt}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];t.specularIntensity=o.specularFactor!==void 0?o.specularFactor:1,o.specularTexture!==void 0&&r.push(n.assignTexture(t,"specularIntensityMap",o.specularTexture));let a=o.specularColorFactor||[1,1,1];return t.specularColor=new Ce().setRGB(a[0],a[1],a[2],Xt),o.specularColorTexture!==void 0&&r.push(n.assignTexture(t,"specularColorMap",o.specularColorTexture,St)),Promise.all(r)}},uu=class{constructor(e){this.parser=e,this.name=Ke.EXT_MATERIALS_BUMP}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:qt}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];return t.bumpScale=o.bumpFactor!==void 0?o.bumpFactor:1,o.bumpTexture!==void 0&&r.push(n.assignTexture(t,"bumpMap",o.bumpTexture)),Promise.all(r)}},du=class{constructor(e){this.parser=e,this.name=Ke.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:qt}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];return o.anisotropyStrength!==void 0&&(t.anisotropy=o.anisotropyStrength),o.anisotropyRotation!==void 0&&(t.anisotropyRotation=o.anisotropyRotation),o.anisotropyTexture!==void 0&&r.push(n.assignTexture(t,"anisotropyMap",o.anisotropyTexture)),Promise.all(r)}},fu=class{constructor(e){this.parser=e,this.name=Ke.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,s=n.textures[e];if(!s.extensions||!s.extensions[this.name])return null;let r=s.extensions[this.name],o=t.options.ktx2Loader;if(!o){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,o)}},pu=class{constructor(e){this.parser=e,this.name=Ke.EXT_TEXTURE_WEBP}loadTexture(e){let t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;let o=r.extensions[t],a=s.images[o.source],l=n.textureLoader;if(a.uri){let c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return n.loadTextureImage(e,o.source,l)}},mu=class{constructor(e){this.parser=e,this.name=Ke.EXT_TEXTURE_AVIF}loadTexture(e){let t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;let o=r.extensions[t],a=s.images[o.source],l=n.textureLoader;if(a.uri){let c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return n.loadTextureImage(e,o.source,l)}},gu=class{constructor(e){this.name=Ke.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let s=n.extensions[this.name],r=this.parser.getDependency("buffer",s.buffer),o=this.parser.options.meshoptDecoder;if(!o||!o.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(a){let l=s.byteOffset||0,c=s.byteLength||0,h=s.count,u=s.byteStride,d=new Uint8Array(a,l,c);return o.decodeGltfBufferAsync?o.decodeGltfBufferAsync(h,u,d,s.mode,s.filter).then(function(f){return f.buffer}):o.ready.then(function(){let f=new ArrayBuffer(h*u);return o.decodeGltfBuffer(new Uint8Array(f),h,u,d,s.mode,s.filter),f})})}else return null}},_u=class{constructor(e){this.name=Ke.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let s=t.meshes[n.mesh];for(let c of s.primitives)if(c.mode!==Tn.TRIANGLES&&c.mode!==Tn.TRIANGLE_STRIP&&c.mode!==Tn.TRIANGLE_FAN&&c.mode!==void 0)return null;let o=n.extensions[this.name].attributes,a=[],l={};for(let c in o)a.push(this.parser.getDependency("accessor",o[c]).then(h=>(l[c]=h,l[c])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(c=>{let h=c.pop(),u=h.isGroup?h.children:[h],d=c[0].count,f=[];for(let p of u){let _=new Ge,m=new E,g=new Jt,S=new E(1,1,1),M=new ci(p.geometry,p.material,d);for(let y=0;y<d;y++)l.TRANSLATION&&m.fromBufferAttribute(l.TRANSLATION,y),l.ROTATION&&g.fromBufferAttribute(l.ROTATION,y),l.SCALE&&S.fromBufferAttribute(l.SCALE,y),M.setMatrixAt(y,_.compose(m,g,S));for(let y in l)if(y==="_COLOR_0"){let R=l[y];M.instanceColor=new Ci(R.array,R.itemSize,R.normalized)}else y!=="TRANSLATION"&&y!=="ROTATION"&&y!=="SCALE"&&p.geometry.setAttribute(y,l[y]);ht.prototype.copy.call(M,p),this.parser.assignFinalMaterial(M),f.push(M)}return h.isGroup?(h.clear(),h.add(...f),h):f[0]}))}},Ap="glTF",So=12,Sp={JSON:1313821514,BIN:5130562},xu=class{constructor(e){this.name=Ke.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,So),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Ap)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");let s=this.header.length-So,r=new DataView(e,So),o=0;for(;o<s;){let a=r.getUint32(o,!0);o+=4;let l=r.getUint32(o,!0);if(o+=4,l===Sp.JSON){let c=new Uint8Array(e,So+o,a);this.content=n.decode(c)}else if(l===Sp.BIN){let c=So+o;this.body=e.slice(c,c+a)}o+=a}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}},yu=class{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=Ke.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,s=this.dracoLoader,r=e.extensions[this.name].bufferView,o=e.extensions[this.name].attributes,a={},l={},c={};for(let h in o){let u=Su[h]||h.toLowerCase();a[u]=o[h]}for(let h in e.attributes){let u=Su[h]||h.toLowerCase();if(o[h]!==void 0){let d=n.accessors[e.attributes[h]],f=hr[d.componentType];c[u]=f.name,l[u]=d.normalized===!0}}return t.getDependency("bufferView",r).then(function(h){return new Promise(function(u,d){s.decodeDracoFile(h,function(f){for(let p in f.attributes){let _=f.attributes[p],m=l[p];m!==void 0&&(_.normalized=m)}u(f)},a,c,Xt,d)})})}},vu=class{constructor(){this.name=Ke.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}},Mu=class{constructor(){this.name=Ke.KHR_MESH_QUANTIZATION}},Wl=class extends ui{constructor(e,t,n,s){super(e,t,n,s)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s*3+s;for(let o=0;o!==s;o++)t[o]=n[r+o];return t}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=a*2,c=a*3,h=s-t,u=(n-t)/h,d=u*u,f=d*u,p=e*c,_=p-c,m=-2*f+3*d,g=f-d,S=1-m,M=g-d+u;for(let y=0;y!==a;y++){let R=o[_+y+a],A=o[_+y+l]*h,I=o[p+y+a],D=o[p+y]*h;r[y]=S*R+M*A+m*I+g*D}return r}},Ev=new Jt,bu=class extends Wl{interpolate_(e,t,n,s){let r=super.interpolate_(e,t,n,s);return Ev.fromArray(r).normalize().toArray(r),r}},Tn={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},hr={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Tp={9728:Wt,9729:tn,9984:tl,9985:er,9986:as,9987:Un},wp={33071:kn,33648:Os,10497:Ri},Jh={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},Su={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},Di={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},Av={CUBICSPLINE:void 0,LINEAR:Zi,STEP:Ki},jh={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function Rv(i){return i.DefaultMaterial===void 0&&(i.DefaultMaterial=new At({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Dn})),i.DefaultMaterial}function fs(i,e,t){for(let n in t.extensions)i[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function $n(i,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(i.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function Cv(i,e,t){let n=!1,s=!1,r=!1;for(let c=0,h=e.length;c<h;c++){let u=e[c];if(u.POSITION!==void 0&&(n=!0),u.NORMAL!==void 0&&(s=!0),u.COLOR_0!==void 0&&(r=!0),n&&s&&r)break}if(!n&&!s&&!r)return Promise.resolve(i);let o=[],a=[],l=[];for(let c=0,h=e.length;c<h;c++){let u=e[c];if(n){let d=u.POSITION!==void 0?t.getDependency("accessor",u.POSITION):i.attributes.position;o.push(d)}if(s){let d=u.NORMAL!==void 0?t.getDependency("accessor",u.NORMAL):i.attributes.normal;a.push(d)}if(r){let d=u.COLOR_0!==void 0?t.getDependency("accessor",u.COLOR_0):i.attributes.color;l.push(d)}}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l)]).then(function(c){let h=c[0],u=c[1],d=c[2];return n&&(i.morphAttributes.position=h),s&&(i.morphAttributes.normal=u),r&&(i.morphAttributes.color=d),i.morphTargetsRelative=!0,i})}function Iv(i,e){if(i.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)i.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){let t=e.extras.targetNames;if(i.morphTargetInfluences.length===t.length){i.morphTargetDictionary={};for(let n=0,s=t.length;n<s;n++)i.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function Pv(i){let e,t=i.extensions&&i.extensions[Ke.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+Qh(t.attributes):e=i.indices+":"+Qh(i.attributes)+":"+i.mode,i.targets!==void 0)for(let n=0,s=i.targets.length;n<s;n++)e+=":"+Qh(i.targets[n]);return e}function Qh(i){let e="",t=Object.keys(i).sort();for(let n=0,s=t.length;n<s;n++)e+=t[n]+":"+i[t[n]]+";";return e}function Tu(i){switch(i){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function Lv(i){return i.search(/\.jpe?g($|\?)/i)>0||i.search(/^data\:image\/jpeg/)===0?"image/jpeg":i.search(/\.webp($|\?)/i)>0||i.search(/^data\:image\/webp/)===0?"image/webp":i.search(/\.ktx2($|\?)/i)>0||i.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}var Dv=new Ge,wu=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new wv,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,s=-1,r=!1,o=-1;if(typeof navigator<"u"){let a=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(a)===!0;let l=a.match(/Version\/(\d+)/);s=n&&l?parseInt(l[1],10):-1,r=a.indexOf("Firefox")>-1,o=r?a.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&s<17||r&&o<98?this.textureLoader=new lo(this.options.manager):this.textureLoader=new fo(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new js(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,s=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(o){return o._markDefs&&o._markDefs()}),Promise.all(this._invokeAll(function(o){return o.beforeRoot&&o.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(o){let a={scene:o[0][s.scene||0],scenes:o[0],animations:o[1],cameras:o[2],asset:s.asset,parser:n,userData:{}};return fs(r,a,s),$n(a,s),Promise.all(n._invokeAll(function(l){return l.afterRoot&&l.afterRoot(a)})).then(function(){for(let l of a.scenes)l.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let s=0,r=t.length;s<r;s++){let o=t[s].joints;for(let a=0,l=o.length;a<l;a++)e[o[a]].isBone=!0}for(let s=0,r=e.length;s<r;s++){let o=e[s];o.mesh!==void 0&&(this._addNodeRef(this.meshCache,o.mesh),o.skin!==void 0&&(n[o.mesh].isSkinnedMesh=!0)),o.camera!==void 0&&this._addNodeRef(this.cameraCache,o.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let s=n.clone(),r=(o,a)=>{let l=this.associations.get(o);l!=null&&this.associations.set(a,l);for(let[c,h]of o.children.entries())r(h,a.children[c])};return r(n,s),s.name+="_instance_"+e.uses[t]++,s}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let s=e(t[n]);if(s)return s}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let s=0;s<t.length;s++){let r=e(t[s]);r&&n.push(r)}return n}getDependency(e,t){let n=e+":"+t,s=this.cache.get(n);if(!s){switch(e){case"scene":s=this.loadScene(t);break;case"node":s=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":s=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":s=this.loadAccessor(t);break;case"bufferView":s=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":s=this.loadBuffer(t);break;case"material":s=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":s=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":s=this.loadSkin(t);break;case"animation":s=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":s=this.loadCamera(t);break;default:if(s=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!s)throw new Error("Unknown type: "+e);break}this.cache.add(n,s)}return s}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,s=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(s.map(function(r,o){return n.getDependency(e,o)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[Ke.KHR_BINARY_GLTF].body);let s=this.options;return new Promise(function(r,o){n.load(mi.resolveURL(t.uri,s.path),r,void 0,function(){o(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){let s=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+s)})}loadAccessor(e){let t=this,n=this.json,s=this.json.accessors[e];if(s.bufferView===void 0&&s.sparse===void 0){let o=Jh[s.type],a=hr[s.componentType],l=s.normalized===!0,c=new a(s.count*o);return Promise.resolve(new Pt(c,o,l))}let r=[];return s.bufferView!==void 0?r.push(this.getDependency("bufferView",s.bufferView)):r.push(null),s.sparse!==void 0&&(r.push(this.getDependency("bufferView",s.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",s.sparse.values.bufferView))),Promise.all(r).then(function(o){let a=o[0],l=Jh[s.type],c=hr[s.componentType],h=c.BYTES_PER_ELEMENT,u=h*l,d=s.byteOffset||0,f=s.bufferView!==void 0?n.bufferViews[s.bufferView].byteStride:void 0,p=s.normalized===!0,_,m;if(f&&f!==u){let g=Math.floor(d/f),S="InterleavedBuffer:"+s.bufferView+":"+s.componentType+":"+g+":"+s.count,M=t.cache.get(S);M||(_=new c(a,g*f,s.count*f/h),M=new Gs(_,f/h),t.cache.add(S,M)),m=new Ws(M,l,d%f/h,p)}else a===null?_=new c(s.count*l):_=new c(a,d,s.count*l),m=new Pt(_,l,p);if(s.sparse!==void 0){let g=Jh.SCALAR,S=hr[s.sparse.indices.componentType],M=s.sparse.indices.byteOffset||0,y=s.sparse.values.byteOffset||0,R=new S(o[1],M,s.sparse.count*g),A=new c(o[2],y,s.sparse.count*l);a!==null&&(m=new Pt(m.array.slice(),m.itemSize,m.normalized)),m.normalized=!1;for(let I=0,D=R.length;I<D;I++){let T=R[I];if(m.setX(T,A[I*l]),l>=2&&m.setY(T,A[I*l+1]),l>=3&&m.setZ(T,A[I*l+2]),l>=4&&m.setW(T,A[I*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}m.normalized=p}return m})}loadTexture(e){let t=this.json,n=this.options,r=t.textures[e].source,o=t.images[r],a=this.textureLoader;if(o.uri){let l=n.manager.getHandler(o.uri);l!==null&&(a=l)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,n){let s=this,r=this.json,o=r.textures[e],a=r.images[t],l=(a.uri||a.bufferView)+":"+o.sampler;if(this.textureCache[l])return this.textureCache[l];let c=this.loadImageSource(t,n).then(function(h){h.flipY=!1,h.name=o.name||a.name||"",h.name===""&&typeof a.uri=="string"&&a.uri.startsWith("data:image/")===!1&&(h.name=a.uri);let d=(r.samplers||{})[o.sampler]||{};return h.magFilter=Tp[d.magFilter]||tn,h.minFilter=Tp[d.minFilter]||Un,h.wrapS=wp[d.wrapS]||Ri,h.wrapT=wp[d.wrapT]||Ri,h.generateMipmaps=!h.isCompressedTexture&&h.minFilter!==Wt&&h.minFilter!==tn,s.associations.set(h,{textures:e}),h}).catch(function(){return null});return this.textureCache[l]=c,c}loadImageSource(e,t){let n=this,s=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(u=>u.clone());let o=s.images[e],a=self.URL||self.webkitURL,l=o.uri||"",c=!1;if(o.bufferView!==void 0)l=n.getDependency("bufferView",o.bufferView).then(function(u){c=!0;let d=new Blob([u],{type:o.mimeType});return l=a.createObjectURL(d),l});else if(o.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");let h=Promise.resolve(l).then(function(u){return new Promise(function(d,f){let p=d;t.isImageBitmapLoader===!0&&(p=function(_){let m=new Nt(_);m.needsUpdate=!0,d(m)}),t.load(mi.resolveURL(u,r.path),p,void 0,f)})}).then(function(u){return c===!0&&a.revokeObjectURL(l),$n(u,o),u.userData.mimeType=o.mimeType||Lv(o.uri),u}).catch(function(u){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),u});return this.sourceCache[e]=h,h}assignTexture(e,t,n,s){let r=this;return this.getDependency("texture",n.index).then(function(o){if(!o)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(o=o.clone(),o.channel=n.texCoord),r.extensions[Ke.KHR_TEXTURE_TRANSFORM]){let a=n.extensions!==void 0?n.extensions[Ke.KHR_TEXTURE_TRANSFORM]:void 0;if(a){let l=r.associations.get(o);o=r.extensions[Ke.KHR_TEXTURE_TRANSFORM].extendTexture(o,a),r.associations.set(o,l)}}return s!==void 0&&(o.colorSpace=s),e[t]=o,o})}assignFinalMaterial(e){let t=e.geometry,n=e.material,s=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,o=t.attributes.normal===void 0;if(e.isPoints){let a="PointsMaterial:"+n.uuid,l=this.cache.get(a);l||(l=new $s,sn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,l.sizeAttenuation=!1,this.cache.add(a,l)),n=l}else if(e.isLine){let a="LineBasicMaterial:"+n.uuid,l=this.cache.get(a);l||(l=new Ys,sn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,this.cache.add(a,l)),n=l}if(s||r||o){let a="ClonedMaterial:"+n.uuid+":";s&&(a+="derivative-tangents:"),r&&(a+="vertex-colors:"),o&&(a+="flat-shading:");let l=this.cache.get(a);l||(l=n.clone(),r&&(l.vertexColors=!0),o&&(l.flatShading=!0),s&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(a,l),this.associations.set(l,this.associations.get(n))),n=l}e.material=n}getMaterialType(){return At}loadMaterial(e){let t=this,n=this.json,s=this.extensions,r=n.materials[e],o,a={},l=r.extensions||{},c=[];if(l[Ke.KHR_MATERIALS_UNLIT]){let u=s[Ke.KHR_MATERIALS_UNLIT];o=u.getMaterialType(),c.push(u.extendParams(a,r,t))}else{let u=r.pbrMetallicRoughness||{};if(a.color=new Ce(1,1,1),a.opacity=1,Array.isArray(u.baseColorFactor)){let d=u.baseColorFactor;a.color.setRGB(d[0],d[1],d[2],Xt),a.opacity=d[3]}u.baseColorTexture!==void 0&&c.push(t.assignTexture(a,"map",u.baseColorTexture,St)),a.metalness=u.metallicFactor!==void 0?u.metallicFactor:1,a.roughness=u.roughnessFactor!==void 0?u.roughnessFactor:1,u.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(a,"metalnessMap",u.metallicRoughnessTexture)),c.push(t.assignTexture(a,"roughnessMap",u.metallicRoughnessTexture))),o=this._invokeOne(function(d){return d.getMaterialType&&d.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(d){return d.extendMaterialParams&&d.extendMaterialParams(e,a)})))}r.doubleSided===!0&&(a.side=Ht);let h=r.alphaMode||jh.OPAQUE;if(h===jh.BLEND?(a.transparent=!0,a.depthWrite=!1):(a.transparent=!1,h===jh.MASK&&(a.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&o!==zt&&(c.push(t.assignTexture(a,"normalMap",r.normalTexture)),a.normalScale=new te(1,1),r.normalTexture.scale!==void 0)){let u=r.normalTexture.scale;a.normalScale.set(u,u)}if(r.occlusionTexture!==void 0&&o!==zt&&(c.push(t.assignTexture(a,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(a.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&o!==zt){let u=r.emissiveFactor;a.emissive=new Ce().setRGB(u[0],u[1],u[2],Xt)}return r.emissiveTexture!==void 0&&o!==zt&&c.push(t.assignTexture(a,"emissiveMap",r.emissiveTexture,St)),Promise.all(c).then(function(){let u=new o(a);return r.name&&(u.name=r.name),$n(u,r),t.associations.set(u,{materials:e}),r.extensions&&fs(s,u,r),u})}createUniqueName(e){let t=dt.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,n=this.extensions,s=this.primitiveCache;function r(a){return n[Ke.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,t).then(function(l){return Ep(l,a,t)})}let o=[];for(let a=0,l=e.length;a<l;a++){let c=e[a],h=Pv(c),u=s[h];if(u)o.push(u.promise);else{let d;c.extensions&&c.extensions[Ke.KHR_DRACO_MESH_COMPRESSION]?d=r(c):d=Ep(new Vt,c,t),s[h]={primitive:c,promise:d},o.push(d)}}return Promise.all(o)}loadMesh(e){let t=this,n=this.json,s=this.extensions,r=n.meshes[e],o=r.primitives,a=[];for(let l=0,c=o.length;l<c;l++){let h=o[l].material===void 0?Rv(this.cache):this.getDependency("material",o[l].material);a.push(h)}return a.push(t.loadGeometries(o)),Promise.all(a).then(function(l){let c=l.slice(0,l.length-1),h=l[l.length-1],u=[];for(let f=0,p=h.length;f<p;f++){let _=h[f],m=o[f],g,S=c[f];if(m.mode===Tn.TRIANGLES||m.mode===Tn.TRIANGLE_STRIP||m.mode===Tn.TRIANGLE_FAN||m.mode===void 0)g=r.isSkinnedMesh===!0?new zr(_,S):new lt(_,S),g.isSkinnedMesh===!0&&g.normalizeSkinWeights(),m.mode===Tn.TRIANGLE_STRIP?g.geometry=Zh(g.geometry,Mo):m.mode===Tn.TRIANGLE_FAN&&(g.geometry=Zh(g.geometry,sr));else if(m.mode===Tn.LINES)g=new Gr(_,S);else if(m.mode===Tn.LINE_STRIP)g=new es(_,S);else if(m.mode===Tn.LINE_LOOP)g=new Wr(_,S);else if(m.mode===Tn.POINTS)g=new Xr(_,S);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+m.mode);Object.keys(g.geometry.morphAttributes).length>0&&Iv(g,r),g.name=t.createUniqueName(r.name||"mesh_"+e),$n(g,r),m.extensions&&fs(s,g,m),t.assignFinalMaterial(g),u.push(g)}for(let f=0,p=u.length;f<p;f++)t.associations.set(u[f],{meshes:e,primitives:f});if(u.length===1)return r.extensions&&fs(s,u[0],r),u[0];let d=new wt;r.extensions&&fs(s,d,r),t.associations.set(d,{meshes:e});for(let f=0,p=u.length;f<p;f++)d.add(u[f]);return d})}loadCamera(e){let t,n=this.json.cameras[e],s=n[n.type];if(!s){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new It(Rh.radToDeg(s.yfov),s.aspectRatio||1,s.znear||1,s.zfar||2e6):n.type==="orthographic"&&(t=new pi(-s.xmag,s.xmag,s.ymag,-s.ymag,s.znear,s.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),$n(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let s=0,r=t.joints.length;s<r;s++)n.push(this._loadNodeShallow(t.joints[s]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(s){let r=s.pop(),o=s,a=[],l=[];for(let c=0,h=o.length;c<h;c++){let u=o[c];if(u){a.push(u);let d=new Ge;r!==null&&d.fromArray(r.array,c*16),l.push(d)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[c])}return new Hr(a,l)})}loadAnimation(e){let t=this.json,n=this,s=t.animations[e],r=s.name?s.name:"animation_"+e,o=[],a=[],l=[],c=[],h=[];for(let u=0,d=s.channels.length;u<d;u++){let f=s.channels[u],p=s.samplers[f.sampler],_=f.target,m=_.node,g=s.parameters!==void 0?s.parameters[p.input]:p.input,S=s.parameters!==void 0?s.parameters[p.output]:p.output;_.node!==void 0&&(o.push(this.getDependency("node",m)),a.push(this.getDependency("accessor",g)),l.push(this.getDependency("accessor",S)),c.push(p),h.push(_))}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l),Promise.all(c),Promise.all(h)]).then(function(u){let d=u[0],f=u[1],p=u[2],_=u[3],m=u[4],g=[];for(let M=0,y=d.length;M<y;M++){let R=d[M],A=f[M],I=p[M],D=_[M],T=m[M];if(R===void 0)continue;R.updateMatrix&&R.updateMatrix();let b=n._createAnimationTracks(R,A,I,D,T);if(b)for(let P=0;P<b.length;P++)g.push(b[P])}let S=new ao(r,void 0,g);return $n(S,s),S})}createNodeMesh(e){let t=this.json,n=this,s=t.nodes[e];return s.mesh===void 0?null:n.getDependency("mesh",s.mesh).then(function(r){let o=n._getNodeRef(n.meshCache,s.mesh,r);return s.weights!==void 0&&o.traverse(function(a){if(a.isMesh)for(let l=0,c=s.weights.length;l<c;l++)a.morphTargetInfluences[l]=s.weights[l]}),o})}loadNode(e){let t=this.json,n=this,s=t.nodes[e],r=n._loadNodeShallow(e),o=[],a=s.children||[];for(let c=0,h=a.length;c<h;c++)o.push(n.getDependency("node",a[c]));let l=s.skin===void 0?Promise.resolve(null):n.getDependency("skin",s.skin);return Promise.all([r,Promise.all(o),l]).then(function(c){let h=c[0],u=c[1],d=c[2];d!==null&&h.traverse(function(f){f.isSkinnedMesh&&f.bind(d,Dv)});for(let f=0,p=u.length;f<p;f++)h.add(u[f]);return h})}_loadNodeShallow(e){let t=this.json,n=this.extensions,s=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let r=t.nodes[e],o=r.name?s.createUniqueName(r.name):"",a=[],l=s._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(e)});return l&&a.push(l),r.camera!==void 0&&a.push(s.getDependency("camera",r.camera).then(function(c){return s._getNodeRef(s.cameraCache,r.camera,c)})),s._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(e)}).forEach(function(c){a.push(c)}),this.nodeCache[e]=Promise.all(a).then(function(c){let h;if(r.isBone===!0?h=new Xs:c.length>1?h=new wt:c.length===1?h=c[0]:h=new ht,h!==c[0])for(let u=0,d=c.length;u<d;u++)h.add(c[u]);if(r.name&&(h.userData.name=r.name,h.name=o),$n(h,r),r.extensions&&fs(n,h,r),r.matrix!==void 0){let u=new Ge;u.fromArray(r.matrix),h.applyMatrix4(u)}else r.translation!==void 0&&h.position.fromArray(r.translation),r.rotation!==void 0&&h.quaternion.fromArray(r.rotation),r.scale!==void 0&&h.scale.fromArray(r.scale);if(!s.associations.has(h))s.associations.set(h,{});else if(r.mesh!==void 0&&s.meshCache.refs[r.mesh]>1){let u=s.associations.get(h);s.associations.set(h,{...u})}return s.associations.get(h).nodes=e,h}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],s=this,r=new wt;n.name&&(r.name=s.createUniqueName(n.name)),$n(r,n),n.extensions&&fs(t,r,n);let o=n.nodes||[],a=[];for(let l=0,c=o.length;l<c;l++)a.push(s.getDependency("node",o[l]));return Promise.all(a).then(function(l){for(let h=0,u=l.length;h<u;h++)r.add(l[h]);let c=h=>{let u=new Map;for(let[d,f]of s.associations)(d instanceof sn||d instanceof Nt)&&u.set(d,f);return h.traverse(d=>{let f=s.associations.get(d);f!=null&&u.set(d,f)}),u};return s.associations=c(r),r})}_createAnimationTracks(e,t,n,s,r){let o=[],a=e.name?e.name:e.uuid,l=[];Di[r.path]===Di.weights?e.traverse(function(d){d.morphTargetInfluences&&l.push(d.name?d.name:d.uuid)}):l.push(a);let c;switch(Di[r.path]){case Di.weights:c=Hn;break;case Di.rotation:c=Gn;break;case Di.translation:case Di.scale:c=Wn;break;default:switch(n.itemSize){case 1:c=Hn;break;case 2:case 3:default:c=Wn;break}break}let h=s.interpolation!==void 0?Av[s.interpolation]:Zi,u=this._getArrayFromAccessor(n);for(let d=0,f=l.length;d<f;d++){let p=new c(l[d]+"."+Di[r.path],t.array,u,h);s.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(p),o.push(p)}return o}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let n=Tu(t.constructor),s=new Float32Array(t.length);for(let r=0,o=t.length;r<o;r++)s[r]=t[r]*n;t=s}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){let s=this instanceof Gn?bu:Wl;return new s(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function Nv(i,e,t){let n=e.attributes,s=new nn;if(n.POSITION!==void 0){let a=t.json.accessors[n.POSITION],l=a.min,c=a.max;if(l!==void 0&&c!==void 0){if(s.set(new E(l[0],l[1],l[2]),new E(c[0],c[1],c[2])),a.normalized){let h=Tu(hr[a.componentType]);s.min.multiplyScalar(h),s.max.multiplyScalar(h)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;let r=e.targets;if(r!==void 0){let a=new E,l=new E;for(let c=0,h=r.length;c<h;c++){let u=r[c];if(u.POSITION!==void 0){let d=t.json.accessors[u.POSITION],f=d.min,p=d.max;if(f!==void 0&&p!==void 0){if(l.setX(Math.max(Math.abs(f[0]),Math.abs(p[0]))),l.setY(Math.max(Math.abs(f[1]),Math.abs(p[1]))),l.setZ(Math.max(Math.abs(f[2]),Math.abs(p[2]))),d.normalized){let _=Tu(hr[d.componentType]);l.multiplyScalar(_)}a.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}s.expandByVector(a)}i.boundingBox=s;let o=new an;s.getCenter(o.center),o.radius=s.min.distanceTo(s.max)/2,i.boundingSphere=o}function Ep(i,e,t){let n=e.attributes,s=[];function r(o,a){return t.getDependency("accessor",o).then(function(l){i.setAttribute(a,l)})}for(let o in n){let a=Su[o]||o.toLowerCase();a in i.attributes||s.push(r(n[o],a))}if(e.indices!==void 0&&!i.index){let o=t.getDependency("accessor",e.indices).then(function(a){i.setIndex(a)});s.push(o)}return $e.workingColorSpace!==Xt&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${$e.workingColorSpace}" not supported.`),$n(i,e),Nv(i,e,t),Promise.all(s).then(function(){return e.targets!==void 0?Cv(i,e.targets,t):i})}var ur={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};var _n=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},Uv=new pi(-1,1,1,-1,0,1),Eu=class extends Vt{constructor(){super(),this.setAttribute("position",new xt([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new xt([0,2,0,0,2,0],2))}},Fv=new Eu,Ni=class{constructor(e){this._mesh=new lt(Fv,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Uv)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}};var Xl=class extends _n{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof Lt?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=xi.clone(e.uniforms),this.material=new Lt({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new Ni(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var To=class extends _n{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let s=e.getContext(),r=e.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let o,a;this.inverse?(o=0,a=1):(o=1,a=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),r.buffers.stencil.setFunc(s.ALWAYS,o,4294967295),r.buffers.stencil.setClear(a),r.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(s.EQUAL,1,4294967295),r.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),r.buffers.stencil.setLocked(!0)}},ql=class extends _n{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}};var Yl=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let n=e.getSize(new te);this._width=n.width,this._height=n.height,t=new kt(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:cn}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Xl(ur),this.copyPass.material.blending=Nn,this.clock=new po}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());let t=this.renderer.getRenderTarget(),n=!1;for(let s=0,r=this.passes.length;s<r;s++){let o=this.passes[s];if(o.enabled!==!1){if(o.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),o.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),o.needsSwap){if(n){let a=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(a.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(a.EQUAL,1,4294967295)}this.swapBuffers()}To!==void 0&&(o instanceof To?n=!0:o instanceof ql&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new te);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(n,s),this.renderTarget2.setSize(n,s);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(n,s)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var $l=class extends _n{constructor(e,t,n=null,s=null,r=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=s,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new Ce}render(e,t,n){let s=e.autoClear;e.autoClear=!1;let r,o;this.overrideMaterial!==null&&(o=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(r=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=o),e.autoClear=s}};var Rp={name:"LuminosityHighPassShader",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new Ce(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};var dr=class i extends _n{constructor(e,t=1,n,s){super(),this.strength=t,this.radius=n,this.threshold=s,this.resolution=e!==void 0?new te(e.x,e.y):new te(256,256),this.clearColor=new Ce(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);this.renderTargetBright=new kt(r,o,{type:cn}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let h=0;h<this.nMips;h++){let u=new kt(r,o,{type:cn});u.texture.name="UnrealBloomPass.h"+h,u.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(u);let d=new kt(r,o,{type:cn});d.texture.name="UnrealBloomPass.v"+h,d.texture.generateMipmaps=!1,this.renderTargetsVertical.push(d),r=Math.round(r/2),o=Math.round(o/2)}let a=Rp;this.highPassUniforms=xi.clone(a.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Lt({uniforms:this.highPassUniforms,vertexShader:a.vertexShader,fragmentShader:a.fragmentShader}),this.separableBlurMaterials=[];let l=[3,5,7,9,11];r=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);for(let h=0;h<this.nMips;h++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[h])),this.separableBlurMaterials[h].uniforms.invSize.value=new te(1/r,1/o),r=Math.round(r/2),o=Math.round(o/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new E(1,1,1),new E(1,1,1),new E(1,1,1),new E(1,1,1),new E(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=xi.clone(ur.uniforms),this.blendMaterial=new Lt({uniforms:this.copyUniforms,vertexShader:ur.vertexShader,fragmentShader:ur.fragmentShader,blending:mo,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new Ce,this._oldClearAlpha=1,this._basic=new zt,this._fsQuad=new Ni(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),s=Math.round(t/2);this.renderTargetBright.setSize(n,s);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(n,s),this.renderTargetsVertical[r].setSize(n,s),this.separableBlurMaterials[r].uniforms.invSize.value=new te(1/n,1/s),n=Math.round(n/2),s=Math.round(s/2)}render(e,t,n,s,r){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();let o=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),r&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=n.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let a=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this._fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=a.texture,this.separableBlurMaterials[l].uniforms.direction.value=i.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=i.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this._fsQuad.render(e),a=this.renderTargetsVertical[l];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(n),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=o}_getSeparableBlurMaterial(e){let t=[];for(let n=0;n<e;n++)t.push(.39894*Math.exp(-.5*n*n/(e*e))/e);return new Lt({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new te(.5,.5)},direction:{value:new te(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`})}_getCompositeMaterial(e){return new Lt({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}};dr.BlurDirectionX=new te(1,0);dr.BlurDirectionY=new te(0,1);var wo={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};var Kl=class extends _n{constructor(){super(),this.uniforms=xi.clone(wo.uniforms),this.material=new so({name:wo.name,uniforms:this.uniforms,vertexShader:wo.vertexShader,fragmentShader:wo.fragmentShader}),this._fsQuad=new Ni(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},$e.getTransfer(this._outputColorSpace)===it&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===Ya?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===$a?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===Ka?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Qs?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===Ja?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===ja?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===Za&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var Zl=class extends Qi{constructor(){super();let e=new Vn;e.deleteAttribute("uv");let t=new At({side:Yt}),n=new At,s=new ss(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);let r=new lt(e,t);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);let o=new ci(e,n,6),a=new ht;a.position.set(-10.906,2.009,1.846),a.rotation.set(0,-.195,0),a.scale.set(2.328,7.905,4.651),a.updateMatrix(),o.setMatrixAt(0,a.matrix),a.position.set(-5.607,-.754,-.758),a.rotation.set(0,.994,0),a.scale.set(1.97,1.534,3.955),a.updateMatrix(),o.setMatrixAt(1,a.matrix),a.position.set(6.167,.857,7.803),a.rotation.set(0,.561,0),a.scale.set(3.927,6.285,3.687),a.updateMatrix(),o.setMatrixAt(2,a.matrix),a.position.set(-2.017,.018,6.124),a.rotation.set(0,.333,0),a.scale.set(2.002,4.566,2.064),a.updateMatrix(),o.setMatrixAt(3,a.matrix),a.position.set(2.291,-.756,-2.621),a.rotation.set(0,-.286,0),a.scale.set(1.546,1.552,1.496),a.updateMatrix(),o.setMatrixAt(4,a.matrix),a.position.set(-2.193,-.369,-5.547),a.rotation.set(0,.516,0),a.scale.set(3.875,3.487,2.986),a.updateMatrix(),o.setMatrixAt(5,a.matrix),this.add(o);let l=new lt(e,fr(50));l.position.set(-16.116,14.37,8.208),l.scale.set(.1,2.428,2.739),this.add(l);let c=new lt(e,fr(50));c.position.set(-16.109,18.021,-8.207),c.scale.set(.1,2.425,2.751),this.add(c);let h=new lt(e,fr(17));h.position.set(14.904,12.198,-1.832),h.scale.set(.15,4.265,6.331),this.add(h);let u=new lt(e,fr(43));u.position.set(-.462,8.89,14.52),u.scale.set(4.38,5.441,.088),this.add(u);let d=new lt(e,fr(20));d.position.set(3.235,11.486,-12.541),d.scale.set(2.5,2,.1),this.add(d);let f=new lt(e,fr(100));f.position.set(0,20,0),f.scale.set(1,.1,1),this.add(f)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function fr(i){return new ro({color:0,emissive:16777215,emissiveIntensity:i})}var Eo=new E;function wn(i,e,t,n,s,r){let o=2*Math.PI*s/4,a=Math.max(r-2*s,0),l=Math.PI/4;Eo.copy(e),Eo[n]=0,Eo.normalize();let c=.5*o/(o+a),h=1-Eo.angleTo(i)/l;return Math.sign(Eo[t])===1?h*c:a/(o+a)+c+c*(1-h)}var Jl=class i extends Vn{constructor(e=1,t=1,n=1,s=2,r=.1){let o=s*2+1;if(r=Math.min(e/2,t/2,n/2,r),super(1,1,1,o,o,o),this.type="RoundedBoxGeometry",this.parameters={width:e,height:t,depth:n,segments:s,radius:r},o===1)return;let a=this.toNonIndexed();this.index=null,this.attributes.position=a.attributes.position,this.attributes.normal=a.attributes.normal,this.attributes.uv=a.attributes.uv;let l=new E,c=new E,h=new E(e,t,n).divideScalar(2).subScalar(r),u=this.attributes.position.array,d=this.attributes.normal.array,f=this.attributes.uv.array,p=u.length/6,_=new E,m=.5/o;for(let g=0,S=0;g<u.length;g+=3,S+=2)switch(l.fromArray(u,g),c.copy(l),c.x-=Math.sign(c.x)*m,c.y-=Math.sign(c.y)*m,c.z-=Math.sign(c.z)*m,c.normalize(),u[g+0]=h.x*Math.sign(l.x)+c.x*r,u[g+1]=h.y*Math.sign(l.y)+c.y*r,u[g+2]=h.z*Math.sign(l.z)+c.z*r,d[g+0]=c.x,d[g+1]=c.y,d[g+2]=c.z,Math.floor(g/p)){case 0:_.set(1,0,0),f[S+0]=wn(_,c,"z","y",r,n),f[S+1]=1-wn(_,c,"y","z",r,t);break;case 1:_.set(-1,0,0),f[S+0]=1-wn(_,c,"z","y",r,n),f[S+1]=1-wn(_,c,"y","z",r,t);break;case 2:_.set(0,1,0),f[S+0]=1-wn(_,c,"x","z",r,e),f[S+1]=wn(_,c,"z","x",r,n);break;case 3:_.set(0,-1,0),f[S+0]=1-wn(_,c,"x","z",r,e),f[S+1]=1-wn(_,c,"z","x",r,n);break;case 4:_.set(0,0,1),f[S+0]=1-wn(_,c,"x","y",r,e),f[S+1]=1-wn(_,c,"y","x",r,t);break;case 5:_.set(0,0,-1),f[S+0]=wn(_,c,"x","y",r,e),f[S+1]=1-wn(_,c,"y","x",r,t);break}}static fromJSON(e){return new i(e.width,e.height,e.depth,e.segments,e.radius)}};var le={concrete:new At({color:8229787,roughness:.82}),light:new At({color:10860214,roughness:.74}),dark:new At({color:1517106,roughness:.56,metalness:.5}),metal:new At({color:4019810,roughness:.3,metalness:.8}),gold:new At({color:14523718,roughness:.36,metalness:.55}),black:new At({color:593428,roughness:.86}),cyan:new At({color:8519679,emissive:3193026,emissiveIntensity:2}),amber:new At({color:16766602,emissive:16755015,emissiveIntensity:1.5}),water:new qt({color:1537920,metalness:.48,roughness:.17,transparent:!0,opacity:.73,clearcoat:1}),glass:new qt({color:11005165,metalness:.12,roughness:.09,transparent:!0,opacity:.36,clearcoat:1,side:Ht})};le.water.userData.clock={value:0};le.water.onBeforeCompile=i=>{i.uniforms.showTime=le.water.userData.clock,i.vertexShader=`varying vec3 showPos;
`+i.vertexShader,i.vertexShader=i.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
showPos=position;`),i.fragmentShader=`uniform float showTime; varying vec3 showPos;
`+i.fragmentShader,i.fragmentShader=i.fragmentShader.replace("#include <normal_fragment_maps>",`#include <normal_fragment_maps>
normal=normalize(normal+vec3(sin(showPos.x*3.0+showTime)*0.13,0.0,cos(showPos.z*2.7+showTime)*0.13));`)};function Zn(i,e,t,n=0,s=0,r=0){let o=new lt(i,e);return o.position.set(n,s,r),o.castShadow=!0,o.receiveShadow=!0,t.add(o),o}function Le(i,e,t,n,s,r,o,a=le.concrete){return Zn(new Jl(e,t,n,1,Math.min(.08,e*.08,t*.08,n*.08)),a,i,s,r,o)}function Kn(i,e,t,n,s,r,o=le.metal,a=48){return Zn(new Ii(e,e,t,a),o,i,n,s,r)}function Ui(i,e,t,n=.06,s=le.metal){let r=new E(...e),o=new E(...t),a=Zn(new Ii(n,n,r.distanceTo(o),8),s,i);return a.position.copy(r).add(o).multiplyScalar(.5),a.quaternion.setFromUnitVectors(new E(0,1,0),o.sub(r).normalize()),a}function Gt(i,e,t,n,s,r,o="#d4e8df",a=null){let l=document.createElement("canvas");l.width=1024,l.height=192;let c=l.getContext("2d");a&&(c.fillStyle=a,c.fillRect(0,0,1024,192)),c.fillStyle=o,c.font="800 104px Arial",c.textAlign="center",c.textBaseline="middle",c.fillText(e,512,96,990);let h=new qr(l);h.colorSpace=St;let u=Zn(new hi(t,t*192/1024),new zt({map:h,transparent:!0,side:Ht,depthWrite:!1}),i,n,s,r);return u.castShadow=!1,u}function ps(i,e,t,n,s,r,o=0,a=Math.PI*2){let l=new Zs;l.absarc(0,0,t,o,o+a,!1),l.absarc(0,0,e,o+a,o,!0),l.closePath();let c=Zn(new io(l,{depth:n,bevelEnabled:!1,curveSegments:48}),r,i,0,s,0);return c.rotation.x=-Math.PI/2,c}function Au(i,e,t,n=40){let s=new ci(new Ii(.075,.075,.035,6),le.metal,n),r=new ht;for(let o=0;o<n;o++){let a=o/n*Math.PI*2;r.position.set(Math.cos(a)*e,t,Math.sin(a)*e),r.updateMatrix(),s.setMatrixAt(o,r.matrix)}i.add(s)}function Ao(i,e,t,n,s){for(let r=0;r<e;r++){let o=Le(i,.38,.02,.6,t+r*.62,n,s,r%2?le.black:le.gold);o.rotation.y=.35}}function Ov(i,e,t){Ui(i,[e[0],e[1]+1,e[2]],[t[0],t[1]+1,t[2]],.045);for(let n=0;n<=6;n++){let s=n/6,r=e.map((o,a)=>o+(t[a]-o)*s);Ui(i,r,[r[0],r[1]+1,r[2]],.04)}}function Cp(i){let e=new wt,t={},n=Kn(e,10,.65,0,-1.6,0,le.dark,64);["bridge","ledge","disc"].includes(i)&&(n.visible=!1);for(let s=0;s<12;s++){let r=s/12*Math.PI*2,o=Math.sin(r)*11,a=Math.cos(r)*11;Le(e,.42,3.5,.5,o,.25,a,le.dark),Le(e,.09,2.5,.12,o,.75,a+.26,le.cyan),Kn(e,.4,.18,o,-1.3,a,le.metal,12)}if(i==="pit"){n.position.y=-1.5,Kn(e,4.55,.32,0,-1.06,0,le.dark),ps(e,4.35,5.35,3.7,-.9,le.concrete,0,Math.PI),ps(e,4.35,5.35,.4,-.9,le.concrete,Math.PI,Math.PI),ps(e,4.33,5.4,.2,2.8,le.light,0,Math.PI),Le(e,12,.35,3.1,0,2.62,-4.5,le.light),Le(e,12,.12,.15,0,2.86,-3.02,le.gold),Ov(e,[-6,2.8,-5.9],[6,2.8,-5.9]);for(let s=0;s<7;s++)Le(e,2,.4+s*.42,1,-6.2,-.65+s*.21,3.2-s*.93,le.concrete);t.water=Kn(e,4.3,.055,0,-.5,0,le.water,64),t.ripples=[];for(let s=0;s<6;s++){let r=Zn(new ns(.5+s*.55,.52+s*.55,64),new zt({color:9824223,transparent:!0,opacity:.22,side:Ht}),e);r.rotation.x=-Math.PI/2,t.ripples.push(r)}for(let s=0;s<3;s++)Ui(e,[-5.1+s*.5,4,-6.1],[-5.1+s*.5,-.5,-6.1],.12),Ui(e,[-5.1+s*.5,-.5,-6.1],[-5.1+s*.5,-.5,-2.7],.12);Le(e,3.7,.6,.35,0,5,-6.15,le.black),Gt(e,"03 / THE PIT",3.4,0,5,-5.95);for(let s=0;s<4;s++)Le(e,.12,.16,2,-3+s*2,2.82,-4.6,le.cyan);Ao(e,17,-5.1,2.82,-3.35),Au(e,4.8,2.98),t.rope=new wt,e.add(t.rope);for(let s=0;s<8;s++){let r=s/7;Ui(t.rope,[0,3.4-r*3.8,-3.25+.7*Math.sin(r*Math.PI)],[0,3.4-(r+1/7)*3.8,-3.25+.7*Math.sin((r+1/7)*Math.PI)],.04,le.gold)}t.rope.visible=!1,Gt(e,"RESERVOIR / 03",3.3,0,-.32,4.9)}else if(i==="bridge"){n.scale.set(.8,1,1.6),Le(e,8,.6,4,0,-.32,11.6,le.light),Le(e,8,.6,3,0,-.32,-12,le.light);for(let s of[-3,3])Le(e,.22,.55,23,s,-.5,-.5,le.metal),Le(e,.06,.08,23,s,-.17,-.5,le.cyan);t.panes=[],t.bridgePosts=[],t.laneLabels=[];for(let s=0;s<8;s++)for(let r=0;r<2;r++){let o=10-(s+1)*2.35,a=r?1.45:-1.45;for(let h of[-1.4,1.4])Le(e,.09,.18,2.25,a+h,-.15,o,le.metal);for(let h of[-1.1,1.1])Le(e,2.88,.18,.09,a,-.15,o+h,le.metal);let l=Le(e,2.62,.15,1.98,a,0,o,le.glass);t.panes.push(l);let c=Gt(e,`${s+1} / ${r?"RIGHT":"LEFT"}`,1.4,a,.11,o+.58,"#fff5db");c.rotation.x=-Math.PI/2,t.laneLabels.push(c),Le(e,2.4,.045,.025,a,.09,o+.85,le.cyan),Gt(e,String(s+1).padStart(2,"0"),.55,-3.9,.12,o).rotation.x=-Math.PI/2}for(let s of[-12,11.5]){t.bridgePosts.push(Le(e,8,.2,.2,0,5,s,le.gold));for(let r of[-4,4])t.bridgePosts.push(Le(e,.23,5,.23,r,2.5,s,le.metal))}Gt(e,"01 / TRUST YOUR STEP",6,0,4,-12),Ao(e,12,-3.4,.01,10.3)}else if(i==="crusher"){Le(e,13,.7,12,0,-.38,0,le.light),Le(e,8.3,5,.4,-2.35,2.5,-6,le.concrete),t.cameraObstacles=[Le(e,1.7,5,.4,5.65,2.5,-6,le.concrete)],Le(e,3,1.4,.4,3.3,4.3,-6,le.concrete),Le(e,5,.7,5,3.3,-.38,-7.8,le.light),Ao(e,7,1.1,.01,-9.8);for(let s of[-5.8,5.8])for(let r of[-4.5,4.5]){let o=Kn(e,.35,7,s,3.2,r,le.metal,16),a=Kn(e,.56,.6,s,.1,r,le.dark);s>0&&t.cameraObstacles.push(o,a)}t.ceiling=Le(e,11,.85,9,0,5,0,le.dark);for(let s=0;s<12;s++)Le(t.ceiling,.5,.06,8,-5+s*.88,-.46,0,s%2?le.gold:le.black);Le(e,3.2,3.8,.15,3.3,1.9,-5.72,le.black),t.door=Le(e,3,3.4,.23,3.3,1.7,-5.6,le.metal),Gt(e,"EXIT",2,3.3,4.3,-5.73,"#90f9df"),Le(e,.9,1.25,.75,-4.3,.63,-2.5,le.dark),t.lever=new wt,t.lever.position.set(-4.3,1.2,-2.5),e.add(t.lever),Ui(t.lever,[0,0,0],[0,.75,.45],.09,le.gold),Ui(t.lever,[-.35,.75,.45],[.35,.75,.45],.13,le.black),Ao(e,17,-5,.04,4.5),Gt(e,"02 / NO FREE EXIT",5,-1.3,4.1,-5.72)}else if(i==="disc"){ps(e,4.6,5.7,.65,-.7,le.dark),ps(e,4.6,5.7,.15,0,le.light),Au(e,5.2,.2),t.tiles=[],t.numbers=[];for(let r=0;r<8;r++){let o=r/8*Math.PI*2,a=Math.sin(o)*3.4,l=Math.cos(o)*3.4,c=Le(e,1.8,.16,1.8,a,0,l,le.gold);t.tiles.push(c);let h=Gt(e,String(r+1).padStart(2,"0"),.75,a,.095,l,"#101d28");h.rotation.x=-Math.PI/2,t.numbers.push(h)}Kn(e,1.55,.32,0,0,0,le.metal);let s=Gt(e,"CHOOSE",2,0,.18,0);s.rotation.x=-Math.PI/2,Gt(e,"04 / LUCK HAS A NUMBER",7,0,4.7,-6)}else if(i==="ledge"){t.ledge=new wt,e.add(t.ledge),Kn(t.ledge,4.5,.85,0,-.45,0,le.light,5),ps(t.ledge,4.28,4.48,.06,-.02,le.gold);for(let r=0;r<5;r++){let o=r/5*Math.PI*2;Le(t.ledge,.07,.015,6,Math.sin(o)*.1,.015,0,le.dark).rotation.y=o}let s=Zn(new Ii(3.6,1.5,3,5),le.concrete,t.ledge,0,-2.25,0);s.rotation.y=.2;for(let r=0;r<5;r++){let o=r/5*Math.PI*2;Ui(e,[Math.sin(o)*4,-1,Math.cos(o)*4],[Math.sin(o)*9,-6,Math.cos(o)*9],.12)}Gt(e,"05 / NOTHING TO SHARE",7,0,5,-6)}else if(i==="chalk"||i==="ended"){Le(e,13,.7,9,0,-.4,0,le.light);for(let[s,r]of[[0,1.5],[-3,.9],[3,.5]])Le(e,2.4,r,2.7,s,r/2,0,le.dark),Le(e,2.42,.1,2.72,s,r+.02,0,le.gold),Gt(e,s===0?"01":s<0?"02":"03",1,s,r/2,1.365,"#ffce80");Le(e,13,5,.4,0,2.5,-4.6,le.dark),Gt(e,i==="chalk"?"LEAVE SOMETHING BEHIND":"ONLY THREE. NEVER SHARED.",10,0,4,-4.35,"#f1ce91"),t.board=new wt,e.add(t.board)}else{Le(e,15,.8,11,0,-.44,0,le.light),Le(e,15,5,.4,0,2.5,-5.5,le.dark),Gt(e,"LAST THREE",10,0,3.9,-5.23,"#f2d7a9"),Gt(e,"EIGHT MINDS. THREE PRIZES.",6,0,2.7,-5.22);for(let s of[-7,7])Le(e,.3,5,.5,s,2.5,-5.2,le.gold),Le(e,.08,3,.1,s,2.5,-4.88,le.amber);i==="waiting"&&(t.wall=Le(e,14,2.8,.55,0,1.4,5.2,le.concrete),Ao(e,22,-6.5,.01,4.8)),t.board=new wt,e.add(t.board)}if(!["bridge","ledge"].includes(i)){ps(e,9.75,9.88,.025,-1.25,le.cyan),Au(e,9.5,-1.24,56);for(let s=0;s<24;s++){let r=s/24*Math.PI*2,o=Le(e,.035,.018,1.6,Math.sin(r)*8.65,-1.265,Math.cos(r)*8.65,le.metal);o.rotation.y=r}}if(i==="pit"){for(let s=0;s<9;s++){let r=s/8*Math.PI,o=Math.cos(r)*5.39,a=-Math.sin(r)*5.39,l=Le(e,.04,3.3,.04,o,.85,a,le.dark),c=Le(e,.12,.65,.65,o*1.02,.7,a*1.02,le.metal);c.rotation.y=-r}for(let s of[-1,1]){Le(e,1.3,1.8,1,s*5.65,.1,-.8,le.dark),Le(e,.8,.9,.03,s*5.65,.35,-.28,le.metal);for(let r=0;r<5;r++)Le(e,.62,.04,.05,s*5.65,.05+r*.12,-.25,le.black);Le(e,.45,.07,.08,s*5.65,.95,-.27,le.amber)}for(let s=1;s<=5;s++)Le(e,.25,.035,.04,2.85,-.55+s*.44,-3.23,le.gold),Gt(e,String(s),.16,3.12,-.55+s*.44,-3.2,"#d4b573")}if(["disc","ledge"].includes(i)){Le(e,8.5,.8,.18,0,4.7,-6.2,le.black);for(let s of[-4.5,4.5])Le(e,.2,5.8,.2,s,1.8,-6.3,le.metal),Le(e,.05,2,.1,s,3.5,-6.15,le.amber)}if(i==="crusher"){for(let s of[-1,1])for(let r=0;r<5;r++){let o=Le(e,.24,.07,10,s*6.2,.35+r*.65,0,le.metal);s>0&&t.cameraObstacles.push(o)}for(let s=0;s<4;s++)Le(e,1.2,.07,.2,-3.3+s*2.2,.04,3.8,le.amber)}return{group:e,refs:t,key:i}}function Ip(i,e,t,n=!1,s=!1){let r=i.refs;if(le.water.userData.clock.value=t,r.water){let o=-.55+Math.min(5,e.pit.flood)*.44,a=o+.9;r.water.scale.y=a/.055,r.water.position.y=-.9+a/2;for(let[l,c]of r.ripples.entries())c.position.y=o+.025,c.scale.setScalar(1+.05*Math.sin(t*2+l));r.rope.visible=!!e.pit.rope}r.panes&&r.panes.forEach((o,a)=>{let l=Math.floor(a/2)+1,c=a%2?"R":"L",h=e.ev?.type==="death"&&e.ev.style==="shatter"?e.bridge.stepping[e.ev.name]:null;o.visible=e.bridge.rows[l]?.weak!==c&&!(h?.row===l&&h.side===c)}),r.wall&&(r.wall.position.z=6.3-(e.round||0)*.3),r.ceiling&&(r.ceiling.position.y=rd(e,n?2.8:t,s),r.door.position.y=e.crusher.door?4.4:1.7,r.lever.rotation.x=e.crusher.holder||e.crusher.jam?-.7:0),r.tiles&&r.tiles.forEach((o,a)=>{let l=a/e.disc.n*Math.PI*2;o.position.set(Math.sin(l)*3.4,0,Math.cos(l)*3.4),o.visible=a<e.disc.n&&!e.disc.open.includes(a+1),r.numbers[a].position.set(o.position.x,.095,o.position.z),r.numbers[a].visible=o.visible}),r.ledge&&r.ledge.scale.setScalar(Math.max(.4,1-e.ledge.shrunk*.085))}function Pp(i){i.group.traverse(e=>{e.geometry&&e.geometry.dispose(),e.material&&!Object.values(le).includes(e.material)&&(e.material.map?.dispose(),e.material.dispose())}),i.group.removeFromParent()}var yt=new E(1,0,0),Lp=new E(0,1,0),Ro=new E(0,0,1),Bv=i=>i*i*(3-2*i),jl=class{constructor(e,t){this.host=e,this.labelHost=t,this.scene=new Qi,this.scene.background=new Ce(660254),this.scene.fog=new kr(660254,.017),this.camera=new It(37,1,.1,160),this.camera.position.set(14,13,20),this.renderer=new Vl({antialias:!0,alpha:!1,powerPreference:"high-performance"}),this.renderer.outputColorSpace=St,this.renderer.toneMapping=Qs,this.renderer.toneMappingExposure=1.08,this.renderer.info.autoReset=!1,this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=Ba,e.append(this.renderer.domElement),this.renderer.domElement.setAttribute("aria-label","3D arena. Event description and transcript are below.");let n=new lr(this.renderer),s=new Zl;this.environment=n.fromScene(s,.04),this.scene.environment=this.environment.texture,s.dispose(),n.dispose(),this.scene.environmentIntensity=.4,this.scene.add(new co(12247018,1974316,1.35)),this.key=new Pi(16768947,3),this.key.position.set(-8,16,10),this.key.castShadow=!0,Object.assign(this.key.shadow.camera,{left:-17,right:17,top:17,bottom:-17,near:.1,far:55}),this.key.shadow.bias=-.001,this.key.shadow.normalBias=.04,this.scene.add(this.key);let r=new Pi(6545135,2.2);r.position.set(6,9,-10),this.scene.add(r);let o=Zn(new hi(180,180),new At({color:726044,roughness:.62,metalness:.35}),this.scene,0,-9,0);o.rotation.x=-Math.PI/2,this.cast=[],this.labels=[],this.mode="cinema",this.reduced=matchMedia("(prefers-reduced-motion: reduce)").matches,this.frameTimes=[],this.setQuality("auto"),this.effects=new wt,this.scene.add(this.effects),this.particles=[];for(let a=0;a<40;a++){let l=Le(this.effects,.12,.12,.12,0,0,0,a%3===0?le.gold:a%3===1?le.cyan:le.light);l.castShadow=!1,this.particles.push(l)}this.composer=new Yl(this.renderer,new kt(1,1,{type:cn,samples:4})),this.composer.addPass(new $l(this.scene,this.camera)),this.bloom=new dr(new te(640,360),.24,.5,1.05),this.composer.addPass(this.bloom),this.composer.addPass(new Kl),this.observer=new ResizeObserver(()=>this.resize()),this.observer.observe(e),this.resize()}setQuality(e){this.quality=e==="auto"?innerWidth<600?"lite":"balanced":e;let t=this.quality==="lite";this.renderer.setPixelRatio(Math.min(devicePixelRatio,t?1:this.quality==="high"?2:1.4)),this.renderer.shadowMap.enabled=!t,this.key.shadow.mapSize.setScalar(this.quality==="high"?2048:1024),this.key.shadow.map&&(this.key.shadow.map.dispose(),this.key.shadow.map=null),this.composer&&this.composer.setPixelRatio(this.renderer.getPixelRatio()),this.resize()}resize(){let{width:e,height:t}=this.host.getBoundingClientRect();!e||!t||(this.camera.aspect=e/t,this.camera.updateProjectionMatrix(),this.renderer.setSize(e,t),this.composer&&this.composer.setSize(e,t))}async loadCast(e){let t=null;if(e){let s=await fetch("assets/cast/cast.json");if(!s.ok)throw new Error("Local City Characters export is missing. Run the documented export command.");t=await s.json()}let n=new Gl;for(let s=0;s<8;s++){let r=new wt,o=new wt;r.add(o),this.scene.add(r);let a;if(t){a=(await n.loadAsync("assets/cast/"+t[s].file)).scene,o.add(a),a.updateMatrixWorld(!0);let u=new nn().setFromObject(a),d=2.05/(u.max.y-u.min.y);a.scale.multiplyScalar(d),a.position.y-=u.min.y*d,a.updateMatrixWorld(!0)}else{a=new wt,o.add(a);let u=new At({color:Qn[s],roughness:.75});Le(a,.64,.75,.37,0,1.05,0,u),Kn(a,.26,.48,0,1.73,0,le.light,8);for(let d of[-1,1])Le(a,.2,.65,.24,d*.2,.35,0,le.dark),Le(a,.2,.75,.23,d*.45,1.08,0,u)}let l={};a.traverse(u=>{u.isMesh&&(u.castShadow=!0,u.receiveShadow=!0,u.frustumCulled=!1,u.material?.map&&(this.cityMap?(u.material.map.dispose(),u.material.map=this.cityMap):this.cityMap=u.material.map,u.material.map.anisotropy=Math.min(4,this.renderer.capabilities.getMaxAnisotropy()))),u.isBone&&(l[u.name.toLowerCase()]={bone:u,base:u.quaternion.clone()})});let c=Zn(new ns(.55,.61,40),new zt({color:Qn[s],side:Ht,transparent:!0,opacity:.55}),r,0,.03,0);c.rotation.x=-Math.PI/2;let h=document.createElement("span");h.className="cast-label",h.style.setProperty("--seat",Qn[s]),this.labelHost.append(h),this.labels.push(h),this.cast.push({group:r,puppet:o,rig:a,bones:l,ring:c})}this.city=!!t}setState(e,t,n){if(this.state=e,this.prev=t,this.view=od(e,t,n),this.cut=n,this.dialogue=this.film?Ms(e,n):null,this.set?.key!==this.view.key&&(this.set&&Pp(this.set),this.set=Cp(this.view.key),this.scene.add(this.set.group)),this.set.refs.board){let s=this.set.refs.board;for(;s.children.length;){let o=s.children[0];o.geometry?.dispose(),o.material?.map?.dispose(),o.material?.dispose(),s.remove(o)}((e.stage==="chalk"?e.chalk?.written:e.stage==="lobby"?e.chalk?.shown:null)||[]).slice(0,3).forEach((o,a)=>{let l=o.text.length>70?o.text.slice(0,67)+"...":o.text;Gt(s,l,11,0,(e.stage==="lobby"?1.6:2.5)-a*.7,e.stage==="chalk"?-4.34:-5.2,"#d8e4c9").scale.y=.35})}}rotate(e,t,n,s){let r=e.bones[t];if(!r)return;let o=r.bone.parent.getWorldQuaternion(new Jt),a=new Jt().setFromAxisAngle(n.clone().applyQuaternion(e.group.getWorldQuaternion(new Jt)),s);r.bone.quaternion.copy(o.clone().invert().multiply(a).multiply(o).multiply(r.bone.quaternion)),r.bone.updateMatrixWorld(!0)}pose(e,t,n){for(let l of Object.values(e.bones))l.bone.quaternion.copy(l.base);e.group.updateMatrixWorld(!0);let s=Math.sin(n*4+t.seat)*.05,r=this.film&&this.view.key==="ledge"&&t.pose==="shove"?yc(n,this.reduced).strike:Math.sin(Math.min(1,n/1.05)*Math.PI),o=-1.26,a=1.26;if(t.pose==="celebrate"&&(o=.8,a=-.8),["shove","rescue","climb","hold"].includes(t.pose)&&(o=-.55,a=.55),this.film&&this.view.key==="ledge"&&t.pose==="shove"&&(o=-1.4,a=1.4),["brace","base"].includes(t.pose)&&(o=-.85,a=.85),this.rotate(e,"upperarm_l",Ro,o+s),this.rotate(e,"upperarm_r",Ro,a-s),["shove","rescue","climb","hold"].includes(t.pose)&&(this.rotate(e,"upperarm_l",yt,-.8-r*.5),this.rotate(e,"upperarm_r",yt,-.8-r*.5),this.rotate(e,"lowerarm_l",yt,-.35),this.rotate(e,"lowerarm_r",yt,-.35)),["walk","climb","dodge"].includes(t.pose)){let l=Math.sin(n*9)*.45;this.rotate(e,"thigh_l",yt,l),this.rotate(e,"thigh_r",yt,-l),this.rotate(e,"upperarm_l",yt,-l),this.rotate(e,"upperarm_r",yt,l)}["base","brace"].includes(t.pose)&&!(this.film&&(this.dialogue&&t.active||this.view.key==="pit"&&this.state.pit.out.length>0))&&(this.rotate(e,"spine_01",yt,.5),this.rotate(e,"thigh_l",yt,-.5),this.rotate(e,"thigh_r",yt,-.5),e.puppet.position.y=-.3),t.active&&this.rotate(e,"head",Lp,Math.sin(n*2)*.12)}render(e=0){if(!this.view||this.cast.length<8)return;this.renderer.info.reset();let t=this.state,n=this.view,s=this.reduced?0:Math.min(e,2.8),r=this.film&&n.death?md(t.ev.style,s,this.reduced):this.reduced?1:Bv(Math.min(1,s/1.15)),o=yc(s,this.reduced);if(Ip(this.set,t,s,this.reduced,n.key==="crusher"&&n.actors.some(p=>p.visible&&p.pose==="walk"&&p.from[2]>=-4.9&&p.position[2]<-4.9)),this.set.refs.cameraObstacles){let p=this.film&&this.mode==="cinema"&&(jn(t)||t.crusher.escaped);this.set.refs.cameraObstacles.forEach(_=>{_.visible=!p})}if(this.set.refs.bridgePosts&&this.set.refs.bridgePosts.forEach(p=>{p.visible=!(this.film&&this.mode==="cinema"&&this.dialogue)}),this.set.refs.laneLabels&&this.set.refs.laneLabels.forEach((p,_)=>{p.visible=!!this.film&&this.set.refs.panes[_].visible}),this.set.refs.wall&&(this.set.refs.wall.visible=!(this.film&&this.dialogue)),this.view.actors.forEach((p,_)=>{let m=this.cast[_];if(m.group.visible=p.visible,m.group.position.fromArray(p.position),m.group.rotation.set(0,0,0),m.puppet.position.set(0,0,0),m.puppet.rotation.set(0,0,0),m.puppet.scale.setScalar(1),!this.reduced&&["climb","walk","rescue"].includes(p.pose)&&m.group.position.lerpVectors(new E(...p.from),new E(...p.position),r),m.group.rotation.y=n.key==="bridge"?Math.PI:n.key==="ledge"?Math.atan2(-p.position[0],-p.position[2]):.12,n.key==="crusher"&&p.pose==="hold"&&(m.group.rotation.y=Math.PI),n.key==="crusher"&&p.pose==="walk"&&p.position[2]<-4.9){let S=pc(p.from,p.position,r);m.group.position.fromArray(S);let M=pc(p.from,p.position,Math.min(1,r+.02));m.group.rotation.y=Math.atan2(M[0]-S[0],M[2]-S[2])}if(this.film&&this.dialogue&&p.active&&(m.group.rotation.y=.28),this.film&&["shove","flinch"].includes(p.pose)){let S=p.pose==="shove"?String(t.ev.action).split(":")[1]:t.ev.name,M=n.actors.find(y=>y.name===S&&y.visible);if(M){let y=new E(...M.position).sub(new E(...p.position)),R=y.length();y.normalize(),m.group.rotation.y=Math.atan2(y.x,y.z),p.pose==="shove"?m.group.position.addScaledVector(y,Math.max(0,R-1.05)*(n.key==="ledge"?o.approach:Math.sin(r*Math.PI))):m.group.position.addScaledVector(y,-.22*(n.key==="ledge"?o.recoil:Math.sin(r*Math.PI)))}}if(this.film&&n.key==="pit"&&p.position[1]<0&&p.pose!=="sink"){let S=-.55+Math.min(5,t.pit.flood)*.44;m.group.position.y=Math.max(m.group.position.y,S-1.5)}if(this.pose(m,p,s),this.film&&this.dialogue&&p.active){let[S,M,y,R,A]=cd(this.performanceKind,s,this.reduced);this.rotate(m,"upperarm_l",yt,S),this.rotate(m,"upperarm_r",yt,M),this.rotate(m,"lowerarm_l",yt,y),this.rotate(m,"lowerarm_r",yt,R),this.rotate(m,"head",yt,A)}if(this.film&&n.key==="disc"&&this.discSaves?.includes(p.name)&&(m.puppet.position.y+=p.active&&t.ev?.type==="ability_use"&&t.ev.power==="feather"?hd(t,this.cut,s,this.reduced):.55),this.film&&p.active&&ei(t,this.cut)?.kind==="power"&&(t.ev.power==="feather"?(this.rotate(m,"upperarm_l",Ro,.45),this.rotate(m,"upperarm_r",Ro,-.45)):t.ev.power==="anchor"&&(m.group.rotation.y=Math.PI,this.rotate(m,"spine_01",yt,.14),this.rotate(m,"thigh_l",yt,-.18),this.rotate(m,"thigh_r",yt,-.18))),this.film&&!p.active&&!n.death&&this.direction?.listener===p.name&&this.dialogue){let S=n.actors.find(M=>M.name===this.dialogue.name);if(S){let M=S.position[0]-p.position[0],y=S.position[2]-p.position[2];m.group.rotation.y=Math.atan2(M,y),this.rotate(m,"head",yt,-.08)}}if(this.film&&n.death&&p.visible&&!p.active){let S=n.actors.find(M=>M.active);S&&(m.group.rotation.y=Math.atan2(S.position[0]-p.position[0],S.position[2]-p.position[2]),this.rotate(m,"head",yt,.18*r),this.rotate(m,"spine_01",yt,-.12*Math.sin(r*Math.PI)),this.rotate(m,"upperarm_r",yt,-.55*Math.sin(r*Math.PI)),this.rotate(m,"lowerarm_r",yt,-1.1*Math.sin(r*Math.PI)))}if(this.reduced||(m.puppet.position.y+=Math.sin(s*2+_)*.015),p.pose==="flinch"){let S=this.film&&n.key==="ledge"?o.recoil:Math.sin(r*Math.PI);m.puppet.rotation.x=-S*.3,m.puppet.position.z+=(this.film&&n.key==="ledge"?-1:1)*S*.35}if(p.pose==="dodge"&&(m.puppet.position.x=Math.sin(r*Math.PI)*.7),p.pose==="shove"&&(m.puppet.rotation.x=(this.film&&n.key==="ledge"?o.strike:Math.sin(r*Math.PI))*.18),p.pose==="climb"&&!this.reduced){if(n.key==="pit"&&p.from[1]<p.position[1]){let S=this.prev?.pit?.base||t.pit.base,M=n.actors.find(I=>I.name===S),y=new E(...M?.position||[0,-.8,-2.35]).add(new E(0,1.1,0)),R=new E(...p.from),A=new E(...p.position);r<.38?m.group.position.lerpVectors(R,y,r/.38):m.group.position.lerpVectors(y,A,(r-.38)/.62)}m.puppet.position.y+=Math.sin(r*Math.PI)*.7}p.pose==="flatten"&&(m.puppet.scale.y=1-r*.94,m.puppet.scale.x=1+r*.6,m.puppet.rotation.z=r>.9?(r-.9)*2:0),p.pose==="sink"&&(m.group.position.y-=r*2.2,this.rotate(m,"upperarm_r",Ro,-1.9)),["shatter","chute","tumble"].includes(p.pose)&&(m.group.position.y-=r*5,m.puppet.rotation.z=r*(p.pose==="chute"?6:2),p.pose==="tumble"&&(m.group.position.x+=r*2.5)),m.ring.material.opacity=p.active?.95:.32,m.ring.scale.setScalar(p.active?1.15:1),m.ring.visible=!this.film&&(!n.death||!p.active);let g=this.labels[_];g.textContent=String(_+1).padStart(2,"0")+(this.host.clientWidth<600&&!p.active?"":" "+p.name),g.title=p.name,g.classList.toggle("speaking",p.active),g.hidden=this.film||!p.visible||n.death&&p.active}),this.set.refs.rope&&t.pit.rope){let p=this.cast[t.order.indexOf(t.pit.rope.by)],_=this.cast[t.order.indexOf(t.pit.rope.saved)];if(p&&_){let m=p.group.position.clone().add(new E(0,1.05,0)),g=_.group.position.clone().add(new E(0,1.45,0));this.set.refs.rope.children.forEach((S,M)=>{let y=this.set.refs.rope.children.length,R=M/y,A=(M+1)/y,I=m.clone().lerp(g,R),D=m.clone().lerp(g,A);I.y-=Math.sin(R*Math.PI)*.25,D.y-=Math.sin(A*Math.PI)*.25;let T=I.distanceTo(D);S.position.copy(I).add(D).multiplyScalar(.5),S.quaternion.setFromUnitVectors(Lp,D.sub(I).normalize()),S.scale.y=T/S.geometry.parameters.height})}}let a=this.camera.aspect<1,l,c=[0,1,0];if(n.key==="bridge"?(l=[16,16,22],c=[0,0,-1]):n.key==="pit"?(l=[13,14,20],c=[0,1,0]):n.key==="crusher"?(l=[15,12,19],c=[0,1,0]):(l=[10,9,17],c=[0,1,0]),["ended","chalk"].includes(n.key)&&(l=[8,7,17],c=[0,1.7,0]),this.mode==="cinema"&&n.actor&&!["stage_start","game_start","round_start","stage_end"].includes(t.ev?.type)){let p=n.actors.find(_=>_.name===n.actor);if(p?.visible){c=[p.position[0]*.62,p.position[1]+1,p.position[2]*.65];let _=n.death?10:15;l=[c[0]+_*.65,c[1]+_*.45,c[2]+_],n.death&&(c=[p.position[0],p.position[1]+.6-(p.pose==="flatten"?0:r*1.5),p.position[2]],l=n.key==="bridge"?[c[0]+11,c[1]+6,c[2]+4]:n.key==="crusher"?[c[0]+8,c[1]+2.5,c[2]+12]:[c[0]+9,c[1]+7,c[2]+13])}}if(this.film&&this.mode==="cinema"){let p=_d(n,t,this.cut,r,this.direction);p?{eye:l,target:c}=p:l=l.map((_,m)=>c[m]+(_-c[m])*.83)}a&&(l=l.map((p,_)=>c[_]+(p-c[_])*1.06)),this.reduced||(l[0]+=.18*Math.sin(s*.4),l[2]+=.15*Math.cos(s*.4)),this.camera.position.fromArray(l),this.camera.lookAt(...c),this.camera.updateMatrixWorld(),n.actors.forEach((p,_)=>{let m=this.cast[_],g=m.group.position.clone().add(new E(0,2.35,0)).project(this.camera),S=this.labels[_];S.style.left=Math.round((g.x*.5+.5)*this.host.clientWidth)+"px",S.style.top=Math.round((-g.y*.5+.5)*this.host.clientHeight)+"px",(g.z>1||Math.abs(g.x)>.97||Math.abs(g.y)>.95)&&(S.hidden=!0)});let h=this.film?Oo(t):[],u=new Set(h.map(p=>p.name));if(this.film)if(this.dialogue)u.add(this.dialogue.name),this.direction?.listener&&u.add(this.direction.listener);else if(t.ev?.type==="action"&&t.ev.valid!==!1){u.add(n.actor);let p=String(t.ev.action).split(":")[1];t.players[p]&&u.add(p)}else(n.death&&r<.8||ei(t,this.cut)?.kind==="power")&&u.add(n.actor);if(this.focalAnchors=n.actors.filter(p=>u.has(p.name)&&p.visible).map(p=>{let _=this.cast[p.seat].group.position.clone().add(new E(0,2.25+(this.discSaves?.includes(p.name)&&this.film?this.cast[p.seat].puppet.position.y:0),0)).project(this.camera);return{name:p.name,label:h.some(m=>m.name===p.name)?`${["","1ST","2ND","3RD"][p.place]} \xB7 ${p.name}`:p.name,color:p.color,x:_.x*.5+.5,y:-_.y*.5+.5,visible:_.z<1}}),this.speakerAnchor=null,this.dialogue){let p=this.cast[t.order.indexOf(this.dialogue.name)];if(p){let _=p.group.position.clone().add(new E(0,2.15,0)).project(this.camera);this.speakerAnchor={x:_.x*.5+.5,y:-_.y*.5+.5,visible:_.z<1&&Math.abs(_.x)<1&&Math.abs(_.y)<1}}}this.effects.visible=n.death&&!this.reduced;let d=n.actors.find(p=>p.active);d&&this.particles.forEach((p,_)=>{let m=_*2.399,g=.7+_%7*.21;p.position.set(d.position[0]+Math.cos(m)*r*g,d.position[1]+1+Math.sin(_*4)*r*2-r*r*3,d.position[2]+Math.sin(m)*r*g),p.rotation.set(r*_,r*2,r*_*.3),p.scale.setScalar(1-r*.75)});let f=[];for(let p of this.labels){if(p.hidden)continue;let _=parseFloat(p.style.left),m=parseFloat(p.style.top);for(let g=0;g<3&&f.some(S=>Math.abs(S.x-_)<(this.host.clientWidth<600?28:65)&&Math.abs(S.y-m)<21);g++)m-=22;m=Math.max(20,m),p.style.top=Math.round(m)+"px",f.push({x:_,y:m})}this.quality==="lite"?this.renderer.render(this.scene,this.camera):this.composer.render()}stats(){return{quality:this.quality,city:this.city,drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,geometries:this.renderer.info.memory.geometries,textures:this.renderer.info.memory.textures}}};var Ql=class{constructor(){this.enabled=!1,this.ctx=null,this.last=-1}async toggle(){if(!this.ctx){this.ctx=new AudioContext,this.master=this.ctx.createGain(),this.master.gain.value=0,this.master.connect(this.ctx.destination),this.drone=this.ctx.createOscillator(),this.drone.type="sine",this.drone.frequency.value=55;let e=this.ctx.createGain();e.gain.value=.055,this.drone.connect(e).connect(this.master),this.drone.start(),this.harmony=this.ctx.createOscillator(),this.harmony.type="triangle",this.harmony.frequency.value=82.5,this.musicGain=this.ctx.createGain(),this.musicGain.gain.value=.012,this.harmony.connect(this.musicGain).connect(this.master),this.harmony.start(),this.pulse=this.ctx.createOscillator(),this.pulse.frequency.value=1,this.pulseGain=this.ctx.createGain(),this.pulseGain.gain.value=.007,this.pulse.connect(this.pulseGain).connect(this.musicGain.gain),this.pulse.start()}return await this.ctx.resume(),this.enabled=!this.enabled,this.master.gain.setTargetAtTime(this.enabled?1:0,this.ctx.currentTime,.08),this.enabled}event(e){if(!this.enabled||!this.ctx||!e)return;let t=this.ctx,n=t.currentTime,s=e.ev||{},o={bridge:55,crusher:46,pit:65,disc:73,ledge:41,chalk:82,ended:110,lobby:55}[e.stage]||55;this.drone.frequency.setTargetAtTime(o,n,.8),this.harmony.frequency.setTargetAtTime(o*(e.stage==="ended"?2:1.5),n,.8);let a=e.stage==="pit"?(e.pit?.flood||0)/5:e.stage==="crusher"?1-(e.crusher?.ceiling||0)/5:e.stage==="ledge"?Math.min(1,(e.round||0)/8):.2;if(this.pulse.frequency.setTargetAtTime(.7+a*2.1,n,.4),this.musicGain.gain.setTargetAtTime(.012+a*.012,n,.5),!["death","reveal","action","stage_start","game_end"].includes(s.type))return;let l=t.createOscillator(),c=t.createGain(),h=t.createStereoPanner();h.pan.value=((e.order.indexOf(s.name)+1)/8-.5)*.8,l.type=s.type==="death"?"sawtooth":"sine",l.frequency.setValueAtTime(s.type==="death"?120:s.type==="reveal"?330:160,n),l.frequency.exponentialRampToValueAtTime(s.type==="death"?24:80,n+.45),c.gain.setValueAtTime(0,n),c.gain.linearRampToValueAtTime(s.type==="death"?.09:.04,n+.015),c.gain.exponentialRampToValueAtTime(1e-4,n+.6),l.connect(c).connect(h).connect(this.master),l.start(n),l.stop(n+.65)}};var xe=i=>document.getElementById(i),ms=new URLSearchParams(location.search),rn=ms.get("view")!=="studio",Bi=rn&&ms.get("clean")==="1",yi,Ot=!1,Dt=[],gs;document.body.classList.toggle("film",rn);document.body.classList.toggle("clean",Bi);var rt,Pu=new Ql,_t,nt,Co,mt=0,vt=!1,$t=!1,Lu=1,Fi=0,Oi=0,Ru=0,Cu=0,Fp=[],Op=[],tc=[],An={frames:[],errors:[],ready:!1};function Io(i){xe("notice").textContent=i,xe("notice").style.display="block",clearTimeout(Io.timer),Io.timer=setTimeout(()=>xe("notice").style.display="none",2500)}var Iu=null,Dp=-1/0,Np="";function Bp(){let i=new URLSearchParams(location.search);return i.set("tape",_t.id),i.set("i",String(mt)),i.set("view",rn?"film":"studio"),Ot?i.set("edit","story"):i.delete("edit"),Bi?i.set("clean","1"):i.delete("clean"),"?"+i}function kv(){Np=Bp(),xe("flat-link").href="../?tape="+encodeURIComponent(_t.id)+"&i="+mt,Iu===null&&(Iu=setTimeout(()=>{history.replaceState(null,"",Np),Dp=performance.now(),Iu=null},Math.max(0,500-(performance.now()-Dp))))}function Po(){xe("presentation").setAttribute("aria-pressed",rn),xe("presentation").textContent=rn?"Film view":"Studio view",xe("clean-frame").setAttribute("aria-pressed",Bi),xe("edit-status").textContent=Ot?"Story cut \xB7 "+(Dt.indexOf(mt)+1)+" / "+Dt.length+" beats":"Full recording",xe("director").setAttribute("aria-pressed",vt),xe("director").querySelector("span").textContent=vt?"ON":"OFF",xe("stage-title").textContent=_r[nt.stage]||"LAST THREE",xe("rule").textContent=ys[nt.stage]||"",xe("stage-number").textContent=nt.stageIdx>=0?`OBSTACLE ${String(nt.stageIdx+1).padStart(2,"0")} / 05${nt.round?"  \xB7  ROUND "+nt.round:""}`:nt.ended?"FINAL STANDINGS":"THE GAUNTLET / SEASON 01";let i=vt?nt.captionCut:nt.caption;xe("caption").textContent=i?.text||ys[nt.stage],xe("event-kind").textContent=i?.kind?.toUpperCase()||"ARENA FEED",xe("event-counter").textContent=String(mt+1).padStart(3,"0")+" / "+_t.events.length,xe("scrub").value=mt,xe("back").disabled=mt<=(Ot?Dt[0]:0),xe("next").disabled=mt>=(Ot?Dt.at(-1):_t.events.length-1),xe("play").textContent=$t?"\u2161":"\u25B6",xe("play").setAttribute("aria-label",$t?"Pause":"Play"),xe("alive").textContent=nt.order.filter(e=>nt.players[e].alive).length+" / 8",Op.forEach((e,t)=>{let n=nt.players[nt.order[t]];e.row.classList.toggle("dead",!n.alive&&!n.place),e.fate.textContent=n.place?"#"+n.place:n.alive?"\u25CF":"OUT",e.power.hidden=!(vt||nt.ended),e.power.textContent=vt||nt.ended?oc(n.power):""}),tc.forEach((e,t)=>e.classList.toggle("active",mt>=e.dataset.i&&(t===tc.length-1||mt<+tc[t+1].dataset.i))),xe("transcript-panel").open&&kp()}function kp(){let i=xe("transcript");i.replaceChildren();for(let e of Fp){if(e.i>mt)break;let t=vt?e.cut:e.pub;if(!t)continue;let n=document.createElement("li"),s=document.createElement("button");s.textContent=String(e.i+1).padStart(3,"0")+"  "+t,s.onclick=()=>{$t=!1,En(e.i)},e.i===mt&&(n.className="current"),n.append(s),i.append(n)}}function En(i,{sound:e=!1}={}){if(!_t)return;mt=Math.max(0,Math.min(_t.events.length-1,Math.floor(Number(i)||0))),Ot&&!Dt.includes(mt)&&(Ot=!1,Dt=[]),nt=Fo(_t,mt);let t=Fo(_t,mt-1);Fi=0,Oi=0,Co=fd(_t,nt,vt),rt.setState(nt,t,vt),rt.direction=Co,rt.performanceKind=ld(nt,vt,_t.id),rt.discSaves=ud(_t,nt,vt),gs.setState(nt,vt,Co),rt.render(0),gs.render(0,rt.speakerAnchor,rt.focalAnchors),Po(),kv(),e&&Pu.event(nt)}function Du(i){if(Ot)return Dt[Math.max(0,Math.min(Dt.length-1,Dt.indexOf(mt)+i))];let e=mt+i;for(;e>=0&&e<_t.events.length&&!dn(_t.events[e],vt);)e+=i;return Math.max(0,Math.min(_t.events.length-1,e))}async function ec(i,e=0,t=!1){let n=++Cu;$t=!1,An.ready=!1,xe("loading").hidden=!1,xe("loading").querySelector("p").textContent="Loading the recording";try{let s=mc(i);if(!s)throw new Error("Invalid recording ID");let r=await fetch("../tapes/"+s+".json");if(!r.ok)throw new Error("Recording unavailable");let o=await r.json();if(n!==Cu)return;if(!Array.isArray(o.events)||!o.events.length||o.players?.length!==8)throw new Error("Invalid recording");_t=o,Ot=t&&o.id===yi?.tape,Ot&&(vt=!!yi.cut),Dt=Ot?xc(_t,vc(_t,yi,vt),vt):[],Ot&&!Dt.length&&(Ot=!1),Ot&&!Dt.includes(Number(e))&&(e=Dt[0]),Fp=nd(_t),xe("scrub").max=_t.events.length-1,xe("tape").value=s,xe("roster").replaceChildren(),Op=_t.players.map((a,l)=>{let c=document.createElement("div");c.className="contestant",c.style.setProperty("--seat",Qn[l]);let h=document.createElement("span");h.className="seat-dot",h.textContent=String(l+1).padStart(2,"0");let u=document.createElement("div"),d=document.createElement("strong"),f=document.createElement("span"),p=document.createElement("span"),_=document.createElement("span");return d.textContent=a.name,f.className="model-name",f.textContent=Gu(a.model),f.title=a.model,p.className="power",_.className="fate",u.append(d,f,p),c.append(h,u,_),xe("roster").append(c),{row:c,power:p,fate:_}}),xe("chapters").replaceChildren(),tc=uc(_t).map(a=>{let l=document.createElement("button");return l.textContent=Hu[a.id]||a.id,l.dataset.i=a.i,l.onclick=()=>{$t=!1,En(a.i)},xe("chapters").append(l),l}),En(e),An.ready=!0,xe("loading").hidden=!0}catch(s){if(n!==Cu)return;xe("loading").querySelector("p").textContent=s.message,An.errors.push(s.message)}}function zp(i){if(An.ready){if(Oi=Math.min(2800,Oi+i*Lu),$t){Fi+=i*Lu;let e=rn?gd(nt,vt,Co):ad(_t.events[mt]);if(Fi>=e){let t=Du(1);t<=mt?($t=!1,Po()):En(t,{sound:!0})}}rt.render(Oi/1e3),gs.render(Fi,rt.speakerAnchor,rt.focalAnchors)}}function Vp(i){requestAnimationFrame(Vp);let e=Ru?Math.min(100,i-Ru):0;Ru=i,!(!An.ready||document.hidden)&&(An.frames.push(e),An.frames.length>600&&An.frames.shift(),zp(e))}function Nu(i){rn=i,i||(Bi=!1),rt.film=rn,document.body.classList.toggle("film",rn),document.body.classList.toggle("clean",Bi),xe("film-overlay").hidden=!rn,rt.resize(),En(mt)}function Up(){Bi=!Bi,Nu(!0)}async function zv(){rt=new jl(xe("canvas"),xe("labels")),rt.film=rn,gs=new Bo(xe("film-overlay")),xe("film-overlay").hidden=!rn;let i=await fetch("../demo.json");i.ok&&(yi=await i.json()),xe("demo").disabled=!yi,xe("demo").onclick=async()=>{await ec(yi.tape,0,!0),An.ready&&Ot&&(Nu(!0),$t=!0,Po())},xe("presentation").onclick=()=>Nu(!rn),xe("clean-frame").onclick=Up,await rt.loadCast(ms.get("cast")==="city"),xe("cast-status").textContent=rt.city?"SYNTY CAST / LOCAL PREVIEW":"ORIGINAL STAND-IN CAST";let e=await fetch("../tapes/index.json");if(!e.ok)throw new Error("Recording list unavailable");let t=await e.json();xe("tape").replaceChildren();for(let s of t){let r=document.createElement("option");r.value=s.id,r.textContent=(s.tier==="heavy"?"Heavyweights":"Mixed models")+" / "+s.id+" / v"+(s.rules||1),xe("tape").append(r)}xe("tape").onchange=()=>ec(xe("tape").value),xe("play").onclick=()=>{An.ready&&(mt>=(Ot?Dt.at(-1):_t.events.length-1)&&En(Ot?Dt[0]:0),$t=!$t,Po())},xe("back").onclick=()=>{$t=!1,En(Du(-1))},xe("next").onclick=()=>{$t=!1,En(Du(1))},xe("scrub").oninput=()=>{$t=!1,En(xe("scrub").value)},xe("speed").onchange=()=>Lu=Number(xe("speed").value),xe("director").onclick=()=>{vt=!vt,Ot&&(Dt=xc(_t,vc(_t,yi,vt),vt),Dt.includes(mt)||En(Dt.find(s=>s>mt)??Dt.at(-1))),xe("director").setAttribute("aria-pressed",vt),xe("director").querySelector("span").textContent=vt?"ON":"OFF",En(mt)},xe("camera").onclick=()=>{rt.mode=rt.mode==="wide"?"cinema":"wide",xe("camera").textContent="Camera: "+rt.mode,xe("camera").setAttribute("aria-pressed",rt.mode==="wide"),rt.render(Oi/1e3)},xe("quality").onchange=()=>rt.setQuality(xe("quality").value),xe("sound").onclick=async()=>{try{let s=await Pu.toggle();xe("sound").textContent=s?"Sound on":"Sound off",xe("sound").setAttribute("aria-pressed",s),s&&nt&&Pu.event(nt)}catch{Io("Audio is unavailable in this browser.")}},xe("share").onclick=async()=>{try{await navigator.clipboard.writeText(new URL(Bp(),location.href).href),Io("Link copied to this moment")}catch{Io("Copy the current URL to share this moment")}},xe("transcript-panel").ontoggle=()=>{xe("transcript-panel").open&&nt&&kp()},document.addEventListener("keydown",s=>{let r=document.activeElement?.tagName;if(["INPUT","SELECT","TEXTAREA"].includes(r)||document.activeElement?.isContentEditable||s.ctrlKey||s.metaKey||s.altKey||s.key===" "&&["BUTTON","A","SUMMARY"].includes(r))return;let o={" ":"play",ArrowLeft:"back",ArrowRight:"next",d:"director",D:"director",f:"clean-frame",F:"clean-frame"};if(s.key==="Escape"&&Bi){Up();return}o[s.key]&&(s.preventDefault(),xe(o[s.key]).click())}),document.addEventListener("visibilitychange",()=>{document.hidden&&($t=!1,nt&&Po())}),window.__show={seek:En,load:ec,preview:s=>{$t=!1,Fi=Math.max(0,Number(s)||0),Oi=Math.min(2800,Fi),rt.render(Oi/1e3),gs.render(Fi,rt.speakerAnchor,rt.focalAnchors)},settle:()=>{Oi=2800,rt.render(2.8)},get film(){return rn},get story(){return Ot},get playlist(){return[...Dt]},get elapsed(){return Fi},get state(){return nt},get index(){return mt},get playing(){return $t},get cut(){return vt},get metrics(){return{...An,...rt.stats()}},snapshot:()=>JSON.stringify({state:nt,view:rt.view})},window.advanceTime=s=>{for(let r=Math.max(0,Math.min(Number(s)||0,6e4));r>0;r-=1e3/60)zp(Math.min(r,1e3/60))},window.render_game_to_text=()=>JSON.stringify({index:mt,playing:$t,film:rn,story:Ot,stage:nt?.stage,dialogue:gs.d,page:gs.currentPage,direction:Co,performance:rt.performanceKind,context:ei(nt,vt),actors:rt.view?.actors,coordinates:"world units; x right, y up, z toward front"});let n=mc(ms.get("tape"));await ec((ms.get("edit")==="story"&&yi?yi.tape:n)||t.find(s=>s.rules===4)?.id||t[0].id,ms.get("i")||0,ms.get("edit")==="story"),requestAnimationFrame(Vp)}zv().catch(i=>{An.errors.push(i.message),xe("loading").querySelector("p").textContent=i.message,console.error(i)});
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2025 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
