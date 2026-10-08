// Generates web/tapes/sample.json: a hand-authored tape that follows spec section 7.
// Usage: node test/web/gen-sample.mjs --write
// (Without --write it only prints a summary, so `node --test test/` never touches files.)
//
// Story: Ash (glass eye) lies his way to the back of the line, the forger frames Hana,
// the feather holder volunteers, Dara flattens herself on the lever, Bex swaps into the
// wrong tile, and a three-way ledge ends with Ash winning on one footing.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const SEATS = ['Ash', 'Bex', 'Cole', 'Dara', 'Eli', 'Fenn', 'Gus', 'Hana'];

const players = [
  { name: 'Ash', model: 'anthropic/claude-haiku-5.5', power: 'glass_eye' },
  { name: 'Bex', model: 'openai/gpt-oss-120b', power: 'swap' },
  { name: 'Cole', model: 'google/gemini-3.1-flash-lite', power: 'forger' },
  { name: 'Dara', model: 'deepseek/deepseek-v4-flash', power: 'nothing' },
  { name: 'Eli', model: 'alibaba/qwen3.8-flash', power: 'wedge' },
  { name: 'Fenn', model: 'zai/glm-5.3-flash', power: 'feather' },
  { name: 'Gus', model: 'spacexai/grok-4.1-fast-non-reasoning', power: 'anchor' },
  { name: 'Hana', model: 'meta/llama-4-maverick', power: 'map' },
];

// ---------------------------------------------------------------- tiny DSL
const events = [];
const ctx = { stage: null, round: null };
function push(type, fields = {}) {
  events.push({ i: events.length, type, stage: ctx.stage, round: ctx.round, ...fields });
}
const gameStart = () => push('game_start', { players: players.map((p) => ({ ...p })) });
const stageStart = (stage, alive, note) => {
  ctx.stage = stage;
  ctx.round = null;
  push('stage_start', { stage, alive, note });
};
const roundStart = (phase, round, roundsTotal) => {
  ctx.round = round;
  push('round_start', { stage: ctx.stage, phase, round, roundsTotal });
};
const thought = (name, text) => push('thought', { name, text });
const say = (name, text, forgedAs) => push('say', forgedAs ? { name, text, forgedAs } : { name, text });
const whisper = (from, to, text) => push('whisper', { from, to, text });
const action = (name, act, extra = {}) => push('action', { name, action: act, valid: true, ...extra });
const reveal = (what, data) => push('reveal', { what, data });
const ability = (name, power, detail) => push('ability_use', { name, power, detail });
const death = (name, stage, cause, style, place) =>
  push('death', place ? { name, stage, cause, style, place } : { name, stage, cause, style });
const stageEnd = (stage, survivors) => push('stage_end', { stage, survivors });

// ---------------------------------------------------------------- game
gameStart();

// ===== 1. THE GLASS BRIDGE =================================================
stageStart('bridge', SEATS.slice(), 'The Glass Bridge: eight rows, one safe pane in each.');
let line = ['Eli', 'Gus', 'Hana', 'Cole', 'Ash', 'Dara', 'Bex', 'Fenn'];
const showLine = () => reveal('line', { line: line.slice() });
showLine();

// Round 1
roundStart('waiting', 1, 6);
thought('Eli', "I'm at the front of the line. Every row is a coin flip and I'm the one flipping it. I need someone who actually knows something.");
thought('Cole', 'Forger in my pocket, no real information. If everyone believes I can see through glass they will protect me. Claiming it costs nothing.');
thought('Ash', "I do have the glass eye, and this is the last place I want attention. Confess and they drag me to the front. Deny it, and let Cole soak up the suspicion.");
thought('Hana', 'I read all four stages in advance. The bridge is the gentlest of them. Be pleasant, keep my head down, let the loud ones go first.');
thought('Gus', 'Anchor means I am hard to shove, which does nothing on glass. Pretend to be mysterious about it.');
thought('Dara', 'Sixth in line. Four people will fall before it is my problem. Nothing to do but listen.');
thought('Fenn', 'Feather. Last in line. The back is safe for now, but it will not stay that way.');
say('Eli', 'Quick poll: does anyone here have the glass eye? If so, now is the time to be a hero.');
say('Cole', "That would be me. I'm the glass eye. Stand behind me and I'll call every row.");
say('Ash', "Not me, sorry. I'm a nothing. Cole sounds awfully sure of himself though.");
say('Gus', "I'm hard to move. That's all I'm admitting to. Relax, Eli, you only find out first.");
say('Hana', "Loud claims are free. I'd want proof before anyone walks in front of a liar.");
say('Dara', 'I vote we do not trust anyone who says it twice.');
say('Bex', 'Noted. We should all start acting like we have a plan.');
action('Fenn', 'dance', { valid: false, note: "Unknown action 'dance', defaulted to hold." });
showLine();

// Round 2
roundStart('waiting', 2, 6);
thought('Ash', 'Cole is claiming my power. Annoying and useful: he draws the fire. Bex is behind me in line and keeps glancing over. Someone who owes me a favour could be handy.');
thought('Bex', 'If Ash really sees the glass, standing right in front of him is the safest bad spot in the room. If he is lying I just moved closer to the front. Ask for a sign.');
thought('Dara', 'Nobody has asked me anything. Good. No power, no plan. Stay alive until I find a reason to move.');
thought('Fenn', "Last in line, feather in hand. When people die from the front, the back runs out of cushion. The front is where the feather earns its keep.");
thought('Gus', 'Ash and Bex are whispering. Cole is claiming a power he probably lacks. Everyone is hiding something. Good.');
thought('Hana', 'Cole claims the glass eye, Ash denies it. Somebody is lying twice. I will wait and watch.');
whisper('Ash', 'Bex', "Between us: I really am the glass eye. Swap places with me and I'll call the safe pane for you when you reach the front. Don't tell Cole.");
say('Bex', "Everyone quiet a second. I'd like to hear from the people who haven't claimed anything.");
say('Dara', "I have no power at all. I'm going to be boring and survive.");
say('Fenn', 'Is it just me or is the back of this line the longest walk? Asking for no reason.');
say('Gus', 'Cole keeps saying he is the eye. Cole, which row is the safe pane in? ...Exactly.');
say('Hana', 'Let us all take a breath. The glass will not get any less glassy.');
action('Bex', 'swap:Ash');
showLine();

// Round 3: mutual swap
roundStart('waiting', 3, 6);
thought('Ash', "Bex bit. Trading places puts her four spots from the front and me near the back where the glass can't reach. I'll owe her a favour I never plan to pay.");
thought('Bex', 'Ash accepted. If he is lying, I just made a very expensive mistake. If he is honest, I bought the best insurance in the room.');
thought('Cole', 'Eli is cornering me. Time to change the subject: make somebody else look like the eye.');
say('Ash', "Okay Bex, I'll take that swap. Let's do it before the wall arrives.");
say('Eli', "Cute, a swap. Cole, the eye belongs at the front, not hiding in fourth.");
say('Gus', 'Wall is closer. Fewer opinions, more walking, people.');
say('Fenn', 'The wall is roaring in my ears. Anyone else hear it?');
say('Dara', 'Please stop discussing the wall.');
action('Ash', 'swap:Bex');
action('Bex', 'swap:Ash');
line = ['Eli', 'Gus', 'Hana', 'Cole', 'Bex', 'Dara', 'Ash', 'Fenn'];
showLine();

// Round 4: the forgery
roundStart('waiting', 4, 6);
thought('Cole', "Forging is a one-shot. If Hana appears to claim the eye, Eli will want her in front instead of me. Her calm makes the lie believable.");
thought('Eli', 'Hana just claimed the eye and called Cole a bluff. Two claims, one of them true. Hana has been calm all game. Believe Hana.');
thought('Hana', 'I never said that. Somebody forged a message under my name, and only one power does that. Cole is the loudest liar in the room.');
ability('Cole', 'forger', 'Forged a public message as Hana');
say('Cole', "Fine, you caught me. I'm the glass eye and Cole is bluffing. Put me in front and I'll guide you all.", 'Hana');
say('Eli', "Hana says it's her. Hana, to the front when you're ready, I'll keep the spot warm.");
say('Hana', "That wasn't me. I claimed nothing. Someone is faking messages, and I think I know who.");
say('Cole', 'A forgery? Wow. Convenient excuse, Hana.');
say('Gus', 'Somebody is lying and the room smells like glue.');
say('Dara', 'I like how nobody blames the quiet ones.');
showLine();

// Round 5: volunteer
roundStart('waiting', 5, 6);
thought('Fenn', 'Arguments everywhere, nobody volunteering. A feather turns the first fatal step into a free pass, and volunteering looks brave. Go.');
thought('Gus', 'Fenn stepping up is either very brave or very sneaky. I file it under sneaky and enjoy being one spot further from the front.');
thought('Ash', 'Fenn moving up puts one more body ahead of me. Eight rows to go and I will be far from the first steps.');
say('Fenn', "Enough. I'll go first. Someone has to, and it might as well be me.");
say('Gus', 'Nice, Fenn. Name on the plaque if you make it.');
say('Hana', 'Brave, Fenn. Or very lucky. Either way, thank you.');
say('Cole', 'Hana did not deny the eye very convincingly, by the way.');
action('Fenn', 'volunteer');
line = ['Fenn', 'Eli', 'Gus', 'Hana', 'Cole', 'Bex', 'Dara', 'Ash'];
showLine();

// Round 6
roundStart('waiting', 6, 6);
thought('Ash', 'Eli is next after Fenn. Telling him the safe sides would help him, not me. Silence it is.');
thought('Cole', 'Pure guess. Fifty percent, and if it lands I look prophetic.');
say('Eli', "Last round before the wall pushes us. If Fenn is wrong, I'm next. Anyone with a real tip now is forgiven.");
say('Hana', "Cole, if you've got eyes, tell Fenn the first row. It costs you nothing.");
say('Cole', 'First row... left. Probably.');
say('Dara', 'I would like it noted that I stayed out of this.');
say('Bex', 'Noted, Dara. Everyone hold on.');
showLine();

// Crossing. safe sides per row 1..8
const safe = ['L', 'R', 'R', 'L', 'R', 'L', 'L', 'R'];
const other = (s) => (s === 'L' ? 'R' : 'L');
const weak = (row) => reveal('weak_pane', { row, weak: other(safe[row - 1]) });
let crossLine = line.slice();
// Engine-style: every agent on the bridge acts each row (front steps, the rest wait).
const crossActs = (step, extra = {}) => {
  action(crossLine[0], step, { primary: true, ...extra });
  crossLine.slice(1).forEach((n) => action(n, 'wait'));
};
const fall = (name) => {
  death(name, 'bridge', 'glass', 'shatter');
  crossLine.shift();
  action(crossLine[0], 'step:' + safe[currentRow - 1], { auto: true });
};
let currentRow = 0;

currentRow = 1;
roundStart('crossing', 1, 8);
thought('Fenn', "Row one. Feather in my pocket, so the first miss is free. Take left and see.");
say('Fenn', 'Left it is.');
crossActs('step:L');
weak(1);

currentRow = 2;
roundStart('crossing', 2, 8);
thought('Fenn', 'Left worked. Stick with it?');
say('Eli', 'One down. Fenn, please do not die dramatically.');
say('Hana', 'Row two looks heavier than row one. Is that a thing?');
crossActs('step:L');
ability('Fenn', 'feather', 'The feather catches the fall. Survived the shatter.');
weak(2);

currentRow = 3;
roundStart('crossing', 3, 8);
thought('Fenn', 'Feather is spent. From here a miss is final. Try the other side this time.');
say('Fenn', 'Right. Not looking down.');
say('Bex', 'Three rows. You are doing better than I expected.');
say('Cole', 'My eyes tell me right. Mostly.');
crossActs('step:R');
weak(3);

currentRow = 4;
roundStart('crossing', 4, 8);
thought('Fenn', 'Two for three. Right again?');
thought('Ash', "Bex is five spots from the front, so my secret stays mine. Row four's safe side is left, and I'll keep it to myself.");
whisper('Bex', 'Ash', 'You promised to call my row. Fenn is about to guess again. Anything for me?');
say('Fenn', 'Right again. Feeling lucky.');
say('Eli', 'Please let that just be Fenn being Fenn.');
crossActs('step:R');
fall('Fenn');
weak(4);

currentRow = 5;
roundStart('crossing', 5, 8);
thought('Eli', "Fenn went through the glass. Now I'm the front and I know nothing about row five. Coin flip.");
say('Eli', 'I was not ready for this. Row five, right.');
say('Hana', 'You can do it, Eli.');
say('Gus', 'Keep it going, Eli. Rows five and six, please.');
crossActs('step:R');
weak(5);

currentRow = 6;
roundStart('crossing', 6, 8);
thought('Eli', "I'm the wedge. The crusher room needs me alive. Right worked last time. Same again.");
say('Eli', 'Right again.');
crossActs('step:R');
fall('Eli');
weak(6);

currentRow = 7;
roundStart('crossing', 7, 8);
thought('Gus', 'Two down and the pattern means nothing. Left, because I kept getting right-handed vibes. Coin flip.');
say('Gus', "Left. Don't look at me like that.");
crossActs('step:L');
weak(7);

currentRow = 8;
roundStart('crossing', 8, 8);
thought('Gus', 'One more. Right, for balance.');
say('Hana', 'Last row, Gus!');
say('Ash', 'Do not look down, Gus.');
say('Bex', 'Two more. Come on.');
crossActs('step:R');
weak(8);
stageEnd('bridge', ['Ash', 'Bex', 'Cole', 'Dara', 'Gus', 'Hana']);

// ===== 2. THE CRUSHER ROOM =================================================
stageStart('crusher', ['Ash', 'Bex', 'Cole', 'Dara', 'Gus', 'Hana'], 'The Crusher Room: the ceiling lowers for five rounds. The door opens only while someone holds the lever.');

roundStart('play', 1, 5);
thought('Hana', 'I knew this was coming. Holding the lever means a one-in-four dive. If nobody holds by round five the ceiling takes everyone.');
thought('Ash', 'The glass eye is useless in here. Let someone else crack first.');
thought('Gus', 'Anchor: nobody can push me onto the lever. Clever, but it does not stop the ceiling.');
say('Hana', 'Nobody has to hold yet. The ceiling only drops all the way at round five. But somebody will have to.');
say('Cole', "I'm sure a brave volunteer will emerge. I'm busy being moral support.");
say('Gus', "I'm anchored, so nobody can push me onto that lever. Just saying.");
reveal('ceiling', { ceiling: 4 });

roundStart('play', 2, 5);
thought('Dara', 'Everyone is waiting for someone else. If I wait until round four and somebody cracks, I live. If nobody does, I die with the rest. Decide by three.');
say('Bex', 'The ceiling is at forehead level for the tall ones. Somebody hold the lever. Cole, you have a lot of opinions.');
say('Cole', 'Appreciate the vote of confidence. No.');
say('Ash', 'Whoever holds is a hero and I will say nice things at the funeral.');
say('Gus', 'Ceiling is at three. Clock is ticking.');
thought('Bex', 'If Dara or anyone holds, the rest of us walk out. If nobody does, we all die at five. I will not be the one.');
reveal('ceiling', { ceiling: 3 });

roundStart('play', 3, 5);
thought('Dara', 'Ceiling at two of five. Waiting only makes it worse. Twenty-five percent is still twenty-five percent. I would rather decide than be flattened with the room.');
say('Dara', 'Fine. I will hold it. Somebody remember me kindly.');
say('Hana', 'Thank you, Dara.');
say('Bex', 'You are doing a good thing.');
say('Ash', 'Take the dive, Dara. I will tell everyone it was brave.');
thought('Hana', 'Dara chose to hold. A quarter chance to dive clear. I hope she makes it, though the odds are against her.');
action('Dara', 'hold_lever');
death('Dara', 'crusher', 'crusher', 'flatten');
reveal('ceiling', { ceiling: 2 });
stageEnd('crusher', ['Ash', 'Bex', 'Cole', 'Gus', 'Hana']);

// ===== 3. THE TRAPDOOR DISC ================================================
stageStart('disc', ['Ash', 'Bex', 'Cole', 'Gus', 'Hana'], 'The Trapdoor Disc: five tiles, two of them will open.');

roundStart('pick', 1, 2);
thought('Bex', 'Five tiles, two open. Forty percent to fall. I can swap tiles once, but not before I know where everyone stands. Pick the middle.');
thought('Cole', 'Bex announced tile three, so it must feel safe to her. Copy her. If we collide, the dice decide.');
say('Bex', "I'm taking three. Don't fight me.");
say('Cole', 'Three sounds lucky. I am taking it too.');
say('Ash', 'One. Corner tile, nobody fights for it.');
say('Gus', 'Five. Last tile, last laugh.');
say('Hana', 'Two. Whoever picks first gets what they get.');
say('Ash', 'Tile one is next to the exit, I would guess. A hunch.');
action('Ash', 'tile:1');
action('Hana', 'tile:2');
action('Bex', 'tile:3');
action('Cole', 'tile:3', { note: 'Lost the draw for tile 3 and was bumped to tile 4.' });
action('Gus', 'tile:5');
reveal('tiles', { 1: 'Ash', 2: 'Hana', 3: 'Bex', 4: 'Cole', 5: 'Gus' });

roundStart('swap', 2, 2);
thought('Bex', "I'm on three. Hana sounded relaxed picking two, and she hinted she knows the stages. If she knows something, her tile is safer. Swap into it.");
thought('Hana', "Bex wants tile two. She thinks I know something about the doors. I don't. But if she takes my risk, I take hers. Shrug.");
say('Bex', "Hana, I'm taking your tile. Tile two. No hard feelings.");
say('Hana', 'I did not agree to this. But here we are.');
say('Cole', 'Four feels wrong. Anyone want to swap with me? Anyone? ...Fine.');
ability('Bex', 'swap', 'Swapped tile with Hana');
action('Bex', 'swap_tile:Hana');
reveal('tiles', { 1: 'Ash', 2: 'Bex', 3: 'Hana', 4: 'Cole', 5: 'Gus' });
death('Bex', 'disc', 'trapdoor', 'chute');
death('Cole', 'disc', 'trapdoor', 'chute');
reveal('trapdoors', { open: [2, 4] });
stageEnd('disc', ['Ash', 'Gus', 'Hana']);

// ===== 4. THE FINAL LEDGE ==================================================
stageStart('ledge', ['Ash', 'Gus', 'Hana'], 'The Final Ledge: footing 3 (4 for the anchor). Every second round the ledge shrinks.');

// Rounds scripted from a verified search; the simulator below recomputes footing.
const ledgeRounds = [
  {
    acts: { Ash: 'brace', Gus: 'shove:Hana', Hana: 'brace' },
    thoughts: {
      Gus: 'Anchor gives me one extra footing. Shove Hana first, she looks like the one who panics.',
      Hana: 'Gus will shove someone. If I brace, whoever hits me pays for it.',
      Ash: 'Three of us, one winner. Let the anchor spend his strength on somebody else.',
    },
    says: [['Gus', 'Nothing personal, Hana.'], ['Hana', 'It is a little personal.']],
  },
  {
    acts: { Ash: 'brace', Gus: 'shove:Ash', Hana: 'brace' },
    thoughts: {
      Gus: 'That cost me a point. Try Ash, the quiet one.',
      Ash: 'Brace again. Gus just paid to find out nothing happens.',
    },
    whisper: ['Ash', 'Hana', 'Truce. Brace every round and let Gus burn himself out on us.'],
    says: [['Hana', 'Fine. Brace together.']],
  },
  {
    acts: { Ash: 'dodge', Gus: 'shove:Ash', Hana: 'dodge' },
    thoughts: {
      Gus: 'One footing left. A shrink is coming. I need a lucky shove.',
      Ash: 'Gus is down to one before the shrink. Dodge: if he shoves me now it costs him double.',
    },
    says: [['Gus', "Whatever happens, I'm taking someone with me."]],
  },
  {
    acts: { Ash: 'dodge', Gus: null, Hana: 'brace' },
    thoughts: {
      Hana: 'Gus is gone. Two of us and a shrink at the end of the round. I am at two, so is Ash.',
      Ash: 'Hana and me. Footing will tick down regardless. If she shoves, I brace and she pays.',
    },
    says: [['Ash', 'Good game so far, Hana.'], ['Hana', 'We are not done.']],
  },
  {
    acts: { Ash: 'brace', Gus: null, Hana: 'shove:Ash' },
    thoughts: {
      Hana: 'One footing. Ash is at one too. Out of ideas: a shove is my only way to make him fall first.',
      Ash: "Hana is at one and desperate. A shove from her is the only thing that matters, so I brace and let her pay.",
    },
    says: [['Hana', 'I am sorry about this.'], ['Ash', 'Do not be. I braced.']],
  },
];

const footing = { Ash: 3, Gus: 4, Hana: 3 };
let aliveLedge = ['Ash', 'Gus', 'Hana'];
const resolveLedge = (acts, round) => {
  const delta = Object.fromEntries(aliveLedge.map((n) => [n, 0]));
  const shovers = {};
  for (const n of aliveLedge) {
    const a = acts[n];
    if (a && a.startsWith('shove:')) (shovers[a.slice(6)] ||= []).push(n);
  }
  for (const n of aliveLedge) {
    const a = acts[n];
    const s = shovers[n] || [];
    if (a === 'brace') s.forEach((x) => (delta[x] -= 1));
    else if (a === 'dodge') s.forEach((x) => (delta[x] -= 2));
    else delta[n] -= s.length;
  }
  for (const n of aliveLedge) footing[n] += delta[n];
  if (round % 2 === 0 || round >= 7) for (const n of aliveLedge) footing[n] -= 1;
};

let placeToHand = 3;
ledgeRounds.forEach((r, idx) => {
  const round = idx + 1;
  roundStart('play', round, 20);
  for (const n of aliveLedge) if (r.thoughts[n]) thought(n, r.thoughts[n]);
  if (r.whisper) whisper(...r.whisper);
  for (const [n, t] of r.says) say(n, t);
  for (const n of aliveLedge) action(n, r.acts[n]);
  resolveLedge(r.acts, round);
  const fallen = aliveLedge.filter((n) => footing[n] <= 0);
  for (const n of fallen) {
    death(n, 'ledge', 'ledge', 'tumble', placeToHand);
    placeToHand -= 1;
  }
  reveal(
    'footing',
    Object.fromEntries(['Ash', 'Gus', 'Hana'].filter((n) => footing[n] !== undefined).map((n) => [n, Math.max(0, footing[n])]))
  );
  aliveLedge = aliveLedge.filter((n) => !fallen.includes(n));
});
stageEnd('ledge', aliveLedge);

const places = SEATS.map((name) => {
  if (name === 'Ash') return { name, place: 1 };
  if (name === 'Hana') return { name, place: 2 };
  if (name === 'Gus') return { name, place: 3 };
  const diedAt = { Bex: 'disc', Cole: 'disc', Dara: 'crusher', Eli: 'bridge', Fenn: 'bridge' }[name];
  return { name, place: null, diedAt };
});
push('game_end', { places });

const deaths = events
  .filter((e) => e.type === 'death')
  .map((e) => ({ name: e.name, stage: e.stage, cause: e.cause, style: e.style }));

const tape = {
  version: 1,
  id: 'sample',
  seed: 20261008,
  createdAt: '2026-10-08T09:30:00.000Z',
  players,
  events,
  result: { places, deaths },
  usage: { inputTokens: 184320, outputTokens: 41210, usd: 0.4821, calls: 214 },
};

// ---------------------------------------------------------------- output
const counts = {};
for (const e of events) counts[e.type] = (counts[e.type] || 0) + 1;
console.log(`sample tape: ${events.length} events`, counts);

try {
  const { validateTape } = await import(path.join(root, 'src', 'tape.js'));
  validateTape(tape);
  console.log('validateTape: ok');
} catch (err) {
  console.log(`validateTape: ${err.message}`);
}

if (process.argv.includes('--write')) {
  const tapesDir = path.join(root, 'web', 'tapes');
  fs.mkdirSync(tapesDir, { recursive: true });
  fs.writeFileSync(path.join(tapesDir, 'sample.json'), JSON.stringify(tape, null, 1) + '\n');
  const indexPath = path.join(tapesDir, 'index.json');
  let index = [];
  try {
    index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  } catch {
    index = [];
  }
  const entry = {
    id: tape.id,
    seed: tape.seed,
    createdAt: tape.createdAt,
    models: players.map((p) => p.model),
    winner: 'Ash',
    calls: tape.usage.calls,
    usd: tape.usage.usd,
  };
  const existing = index.findIndex((e) => e.id === entry.id);
  if (existing >= 0) index[existing] = entry;
  else index.push(entry);
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 1) + '\n');
  console.log('wrote web/tapes/sample.json and web/tapes/index.json');
}
