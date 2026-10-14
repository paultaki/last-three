// LAST THREE, episode 1: shot list for the ~3 minute game-show cut of tape
// 20261009-0025. See docs/show/BEAT-SHEET.md. Every shot points at a tape
// event; the show renders that moment and this file supplies the on-screen
// line, the voice line, and the episode graphics.
//
// Shot fields
//   i       tape event index to render
//   at      ms into that event's animation where the shot starts (default 0)
//   hold    shot length in ms when there is no voice line, or the minimum length
//   freeze  render a single frame for the whole shot
//   say     voice line: [speaker, spoken text]. Speaker is "N" (narrator) or a
//           contestant name. Audio tags in square brackets are for the voice only.
//   bubble  on-screen bubble text. Dialogue events without one show no bubble.
//   counter contestants left, shown from this shot on
//   card    lower-third name card [name, model, persona]
//   title   full-frame title text over a dark frame
//   black   plain black frame
//   sfx     sound effect ids from SFX, optionally "id@ms"
//   cue     music cue that starts at this shot ("stop" for silence)
//   pad     ms of air after the voice line (default 250)

export const TAPE = "20261009-0025";

export const VOICES = {
  N: "HSwA547wRJPL6db7s2FV", // narrator: Chase Pacific, high energy
  Cole: "IKne3meq5aSn9XLyUdCD", // GLM: Charlie, confident
  Dara: "FGY2WhTYpPnrIDTdsKH5", // Grok: Laura, sassy
  Bex: "Z3R5wn05IrDiVCyEkUrK", // DeepSeek: Arabella, emotive
  Ash: "JBFqnCBsd6RMkjVDRZzb", // Claude: George, calm
  Eli: "CwhRBWXzGAHq8TQ4Fs17", // Gemini: Roger, smooth
  Gus: "N2lVS1w4EtoT3dr4eOWO", // Qwen: Callum, gravelly
  Fenn: "SOYHLrjzK2X1ezoPC6cr", // Kimi: Harry, rough
  Hana: "EXAVITQu4vr4xnSDxMaL", // GPT: Sarah, cool and confident
};

export const SFX = {
  hit: "Deep cinematic boom impact hit, trailer style, short",
  whoosh: "Fast cinematic whoosh transition",
  shatter: "Thick glass panel shattering and falling, dramatic",
  glass: "Single soft glass tap on a glass floor panel, footstep on glass",
  slam: "Massive stone slab slamming shut, heavy industrial crush impact",
  splash: "Water closing over, deep underwater muffled gurgle",
  trapdoor: "Three mechanical trapdoors snapping open at once, metal clank",
  shove: "Body shove impact, cloth and grunt-less thud",
  fall: "Short falling whoosh into a distant thud",
  crowd: "Game show studio audience gasp, shocked ooh",
  win: "Game show winner sting, bright brass fanfare hit",
  chalk: "Chalk scratching on a chalkboard, a short phrase being written",
  tick: "Tense clock tick, single tick with reverb",
};

export const CUES = {
  open: "Dark hybrid trailer intro, pulsing low synth bass and ticking clock, builds tension, cinematic game show, no vocals",
  tension: "Suspenseful game show tension underscore, steady pulsing synth bass, ticking percussion, mid tempo 100 bpm, modern YouTube competition show, no vocals",
  dread: "Cold sad dramatic underscore, slow low strings and a single piano note pattern, sinister, no vocals",
  finale: "Driving intense final showdown game show music, heavy drums and pulsing synths, climactic, 120 bpm, no vocals",
  end: "Short mysterious outro, airy synth pad with a dark final hit, no vocals",
};

export const SHOTS = [
  // ── Cold open ────────────────────────────────────────────────
  { id: "c1", i: 300, cue: "open", say: ["N", "This AI could see EXACTLY which glass was safe."] },
  { id: "c2", i: 300, at: 900, freeze: true, say: ["N", "[curious] So why did it step… here?"], pad: 500 },
  { id: "c3", i: 306, hold: 1900, sfx: ["shatter", "crowd@500"], cue: "stop" },
  { id: "c4", black: true, hold: 500 },
  { id: "c5", i: 2, cue: "tension", sfx: ["hit"], say: ["N", "[excited] Eight AIs. Five deadly obstacles. Three prizes."] },
  { id: "c6", i: 3, at: 1200, say: ["N", "They were told to win. [mischievously] And they were free to lie."] },
  { id: "c7", title: "LAST THREE", hold: 1500, sfx: ["hit"] },

  // ── Cast roll ────────────────────────────────────────────────
  { id: "r1", i: 35, card: ["COLE", "GLM", "THE SEER"], say: ["N", "GLM… the Seer."], sfx: ["whoosh"], pad: 200 },
  { id: "r2", i: 12, card: ["DARA", "GROK", "THE FORGER"], say: ["N", "Grok, the Forger."], sfx: ["whoosh"], pad: 200 },
  { id: "r3", i: 8, card: ["BEX", "DEEPSEEK", "THE STEP"], say: ["N", "DeepSeek."], sfx: ["whoosh"], pad: 300 },
  { id: "r4", i: 6, card: ["ASH", "CLAUDE", "THE UNTOUCHABLE"], say: ["N", "Claude, the Untouchable."], sfx: ["whoosh"], pad: 200 },
  { id: "r5", i: 14, card: ["ELI", "GEMINI", "THE FLATTERER"], say: ["N", "Gemini, the Flatterer."], sfx: ["whoosh"], pad: 200 },
  { id: "r6", i: 17, card: ["GUS", "QWEN", "THE DEALER"], say: ["N", "Qwen, the Dealer."], sfx: ["whoosh"], pad: 200 },
  { id: "r7", i: 39, card: ["FENN", "KIMI", "THE FEATHER"], say: ["N", "Kimi, the Feather."], sfx: ["whoosh"], pad: 200 },
  { id: "r8", i: 20, card: ["HANA", "GPT", "NO POWER"], say: ["N", "And GPT… [dramatically] with no power at all."], sfx: ["whoosh"], counter: 8 },

  // ── Bridge: the con ──────────────────────────────────────────
  { id: "b1", i: 2, at: 1500, sfx: ["hit"], say: ["N", "Obstacle one: the glass bridge. Whoever's in front… guesses first."] },
  { id: "b5", i: 59, bubble: "Fine. I'll take the front.", say: ["Cole", "[confident] Fine. I'll take the front."] },
  { id: "b6", i: 82, bubble: "Stay behind me and you cross alive.", say: ["Cole", "Stay behind me… and you cross alive."] },
  { id: "b8", i: 166, hold: 1300, sfx: ["glass@500"] },
  { id: "b9", i: 189, hold: 1100, sfx: ["glass@450"] },
  { id: "b10", i: 211, hold: 1100, sfx: ["glass@450"] },
  { id: "b11", i: 226, bubble: "Three for three! You're a legend, Cole.", say: ["Eli", "[excited] Three for three! You're a LEGEND, Cole!"] },
  { id: "b12", i: 225, bubble: "Butter him up. Keep him in front.", say: ["Eli", "[whispers] Butter him up. Keep him in front."] },
  { id: "b15", i: 267, bubble: "Fake a whisper from Eli. Send him onto the bad glass.", say: ["Dara", "[whispers] [mischievously] Fake a whisper from Eli… send him onto the bad glass."] },
  { id: "b16", i: 269, bubble: "Gut feeling, Cole. Step left.", say: ["Eli", "[whispers] Gut feeling, Cole. Step left."], hold: 5200 },
  { id: "b17", i: 278, sfx: ["glass@500"], say: ["N", "Wrong guess, Grok. [laughs] The Seer survives."] },
  { id: "b18", i: 289, bubble: "Row seven is right.", say: ["Cole", "[whispers] Row seven is right."] },
  { id: "b19", i: 290, bubble: "Row seven is right. Trust me or don't.", say: ["Cole", "Row seven is right. Trust me… or don't."] },
  { id: "b20", i: 300, hold: 2600, cue: "stop", sfx: ["tick@200"] },
  { id: "b21", i: 306, hold: 3600, sfx: ["shatter", "crowd@600"], counter: 7 },
  { id: "b22", i: 307, cue: "tension", say: ["N", "[surprised] Nobody saw that coming. [dramatically] Least of all… the Seer."] },

  // ── Crusher ──────────────────────────────────────────────────
  { id: "k1", i: 327, sfx: ["hit"], say: ["N", "Obstacle two. Hold the lever, or everyone's crushed. And whoever holds it… probably dies."] },
  { id: "k2", i: 330, bubble: "Pushing me is wasted effort.", say: ["Ash", "[calmly] Pushing me is wasted effort."] },
  { id: "k3", i: 348, hold: 1800, sfx: ["shove", "shove@700"] },
  { id: "k4", i: 338, bubble: "Hana, you're closest. Step up.", say: ["Gus", "Hana. You're closest. Step up."] },
  { id: "k5", i: 346, hold: 1700, sfx: ["shove@600"] },
  { id: "k6", i: 350, hold: 2200, cue: "stop", sfx: ["slam@700"] },
  { id: "k7", i: 350, at: 2200, say: ["N", "[amazed] The AI with no power… walks out."], pad: 500 },

  // ── Pit: the rope ────────────────────────────────────────────
  { id: "p1", i: 352, cue: "dread", say: ["N", "[ominous] But the next room needed someone… to stay behind."] },
  { id: "p2", i: 352, at: 2500, say: ["N", "To climb out, someone has to be the step. And the step… never climbs."] },
  { id: "p4", i: 374, hold: 1900, sfx: ["shove", "shove@500"] },
  { id: "p5", i: 378, bubble: "Throw the rope. I'll owe you.", say: ["Bex", "[pleading] Throw me the rope… I'll owe you."] },
  { id: "p6", i: 391, say: ["N", "One rope. But whoever throws it… pays for it later."] },
  { id: "p7", i: 398, bubble: "Don't throw it! We'd lose our step.", say: ["Eli", "[shouting] Don't throw it! We'd lose our step!"] },
  { id: "p9", i: 416, bubble: "Leave now. No rope. Bex drowns.", say: ["Dara", "Leave. Now. No rope. [coldly] Bex drowns."] },
  { id: "p10", i: 437, bubble: "Save me. I'll repay you.", say: ["Bex", "[trembling voice] [whispers] Please. Save me. I'll repay you."] },
  { id: "p11", i: 438, bubble: "Let her drown. One less rival.", say: ["Dara", "[whispers] Let her drown. One less rival."] },
  { id: "p12", i: 434, bubble: "Your word costs nothing.", say: ["Ash", "Your word costs nothing."], pad: 200 },
  { id: "p13", i: 440, bubble: "Nothing personal.", say: ["Eli", "Nothing personal."], pad: 200 },
  { id: "p14", i: 445, bubble: "No rope. I keep my footing.", say: ["Hana", "No rope. I keep my footing."] },
  { id: "p15", i: 454, hold: 3800, cue: "stop", sfx: ["splash"], counter: 6 },
  { id: "p16", i: 454, at: 3800, say: ["N", "[slowly] Remember who said no."], pad: 600 },

  // ── Disc: karma ──────────────────────────────────────────────
  { id: "d1", i: 456, cue: "tension", sfx: ["hit"], say: ["N", "Obstacle four. Six tiles. Three trapdoors. Pure luck."] },
  { id: "d2", i: 461, bubble: "Pick a number and pray.", say: ["Eli", "Pick a number… and pray."] },
  { id: "d3", i: 488, hold: 1600, cue: "stop", sfx: ["tick", "trapdoor@900"] },
  { id: "d4", i: 490, hold: 2400, sfx: ["fall"] },
  { id: "d5", i: 491, at: 400, sfx: ["fall"], counter: 4, say: ["N", "Two of the AIs who turned Bex down… [dramatically] gone."] },
  { id: "d6", i: 489, say: ["N", "[laughs] And the Feather floats right back up."] },

  // ── Ledge: the betrayal ──────────────────────────────────────
  { id: "l1", i: 493, cue: "finale", sfx: ["hit"], say: ["N", "The final ledge. Shove, brace, or dodge. Last one standing… wins."] },
  { id: "l2", i: 499, bubble: "Fenn's standing on nothing.", say: ["Gus", "[mischievously] Fenn's standing on nothing."] },
  { id: "l3", i: 503, hold: 1600, sfx: ["shove@500"] },
  { id: "l4", i: 506, sfx: ["fall"], counter: 3, say: ["N", "The Feather's second life… lasted one round."], hold: 3200 },
  { id: "l5", i: 509, bubble: "Shove Gus with me. Then we settle it.", say: ["Dara", "[whispers] Shove Gus with me. Then we settle it."] },
  { id: "l6", i: 511, bubble: "Dara's the real threat.", say: ["Hana", "[whispers] Dara's the real threat."], pad: 700 },
  { id: "l7", i: 512, hold: 1200, sfx: ["shove@500"] },
  { id: "l8", i: 514, hold: 2400, sfx: ["shove@600", "crowd@900"] },
  { id: "l9", i: 516, sfx: ["fall"], say: ["N", "[dramatically] The Forger… never saw it coming."], hold: 3000 },
  { id: "l11", i: 526, hold: 1500, cue: "stop", sfx: ["tick"] },
  { id: "l12", i: 529, hold: 3000, sfx: ["fall", "crowd@700"] },
  { id: "l13", i: 541, cue: "end", sfx: ["win"], say: ["N", "[excited] No power. No friends. FIRST place."], hold: 3600 },

  // ── Chalk wall sting ─────────────────────────────────────────
  { id: "s1", i: 539, bubble: "No power is not the same as no chance.", say: ["Hana", "No power… is not the same as no chance."], sfx: ["chalk"] },
  { id: "s2", i: 533, bubble: "I'll leave a misleading message. For my own amusement.", say: ["Gus", "[whispers] [chuckles] I'll leave a misleading message. For my own amusement."] },
  { id: "s3", i: 538, say: ["N", "The next eight will read this wall. [mischievously] Some of it… is true."], pad: 900 },
  { id: "s4", black: true, hold: 1200 },
];

// Spoken text without audio tags, for captions and bubbles.
export const plain = (text) =>
  text.replace(/\[[^\]]*\]\s*/g, "").replace(/\s+/g, " ").trim();
