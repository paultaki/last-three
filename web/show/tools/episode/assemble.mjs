// Cuts the rendered frames and the audio into the finished episode.
//
//   node web/show/tools/episode/assemble.mjs [--audio-only]
//
// Needs: frames/ from render.mjs, audio/voice/ from prep-audio.mjs, and the
// music and sfx files in audio/. Writes last-three-ep1.mp4 and .srt to OUT.
import fs from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { TAPE } from "./episode.mjs";
import { FPS, OUT, LEAD_MS, timeline } from "./plan.mjs";

const run = (args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });
const plan = timeline();
const total = (plan.at(-1).start + plan.at(-1).dur) / 1000;
const tape = JSON.parse(
  fs.readFileSync(new URL(`../../../tapes/${TAPE}.json`, import.meta.url), "utf8"),
);

const audioOnly = process.argv.includes("--audio-only");

// ── Picture ────────────────────────────────────────────────
fs.mkdirSync(OUT + "segments", { recursive: true });
for (const shot of audioOnly ? [] : plan) {
  const dir = OUT + `frames/${shot.id}/`;
  const have = fs.existsSync(dir) ? fs.readdirSync(dir).length : 0;
  if (have !== shot.frames) throw new Error(`${shot.id}: ${have}/${shot.frames} frames`);
  run([
    "-framerate", String(FPS), "-i", dir + "%05d.jpg",
    "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p",
    "-r", String(FPS), OUT + `segments/${shot.id}.mp4`,
  ]);
}
fs.writeFileSync(
  OUT + "segments/list.txt",
  plan.map((s) => `file '${s.id}.mp4'`).join("\n") + "\n",
);
if (!audioOnly)
  run(["-f", "concat", "-safe", "0", "-i", OUT + "segments/list.txt", "-c", "copy", OUT + "picture.mp4"]);

// ── Sound ──────────────────────────────────────────────────
const inputs = [],
  voice = [],
  fx = [],
  music = [];
const input = (file, extra = []) => {
  inputs.push(...extra, "-i", file);
  return inputs.filter((a) => a === "-i").length - 1;
};
for (const shot of plan) {
  if (shot.say) {
    const n = input(OUT + `audio/voice/${shot.id}.wav`);
    const kind = tape.events[shot.i]?.type;
    // Private thoughts sit in a small, close room so they never read as speech.
    const colour =
      kind === "thought" ? "highpass=f=180,aecho=0.8:0.6:35|70:0.22|0.12," : "";
    voice.push(`[${n}]${colour}adelay=${Math.round(shot.start + LEAD_MS)}:all=1[v${n}]`);
  }
  for (const s of shot.sfx ?? []) {
    const [id, at = 0] = s.split("@");
    const n = input(OUT + `audio/sfx/${id}.mp3`);
    const gain = { hit: 0.9, shatter: 0.9, slam: 0.9, win: 0.8, crowd: 0.5, tick: 0.6, glass: 0.6 }[id] ?? 0.7;
    fx.push(`[${n}]volume=${gain},adelay=${Math.round(shot.start + Number(at))}:all=1[f${n}]`);
  }
}
// Each cue runs until the next cue change; "stop" leaves silence.
const cues = plan.filter((s) => s.cue);
cues.forEach((shot, k) => {
  if (shot.cue === "stop") return;
  const from = shot.start / 1000,
    to = k + 1 < cues.length ? cues[k + 1].start / 1000 : total;
  const len = to - from;
  const n = input(OUT + `audio/music/${shot.cue}.mp3`, ["-stream_loop", "-1"]);
  music.push(
    `[${n}]atrim=0:${len.toFixed(3)},asetpts=N/SR/TB,afade=t=in:d=0.15,` +
      `afade=t=out:st=${Math.max(0, len - 0.5).toFixed(3)}:d=0.5,volume=0.2,` +
      `adelay=${Math.round(from * 1000)}:all=1[m${n}]`,
  );
});
const labels = (list) => list.map((f) => f.match(/\[(\w+)\]$/)[1]);
const vl = labels(voice),
  fl = labels(fx),
  ml = labels(music);
const graph = [
  ...voice,
  ...fx,
  ...music,
  `${vl.map((l) => `[${l}]`).join("")}amix=inputs=${vl.length}:normalize=0,asplit=2[vox][key]`,
  `${ml.map((l) => `[${l}]`).join("")}amix=inputs=${ml.length}:normalize=0[bed]`,
  `[bed][key]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=350[ducked]`,
  `${fl.map((l) => `[${l}]`).join("")}amix=inputs=${fl.length}:normalize=0[sfx]`,
  `[vox][ducked][sfx]amix=inputs=3:normalize=0,apad=whole_dur=${total.toFixed(3)},` +
    // Tame effect peaks so the master can reach -14 LUFS without clipping.
    `alimiter=limit=0.35:attack=3:release=60:level=false,` +
    `atrim=0:${total.toFixed(3)}[mix]`,
].join(";\n");
fs.writeFileSync(OUT + "mix.filter", graph);
run([
  ...inputs,
  "-filter_complex_script", OUT + "mix.filter",
  "-map", "[mix]", "-ar", "48000", "-c:a", "pcm_f32le", OUT + "premix.wav",
]);
// Two-pass master to YouTube's -14 LUFS.
const { stderr } = spawnSync("ffmpeg", [
  "-hide_banner", "-i", OUT + "premix.wav",
  "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-",
], { encoding: "utf8" });
const m = JSON.parse(stderr.slice(stderr.lastIndexOf("{")));
run([
  "-i", OUT + "premix.wav",
  "-af",
  `loudnorm=I=-14:TP=-1.5:LRA=11:linear=true:measured_I=${m.input_i}:` +
    `measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:` +
    `offset=${m.target_offset}`,
  "-ar", "48000", "-c:a", "pcm_s16le", OUT + "mix.wav",
]);

// ── Final ──────────────────────────────────────────────────
if (!audioOnly) run([
  "-i", OUT + "picture.mp4", "-i", OUT + "mix.wav",
  "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k",
  "-movflags", "+faststart", "-shortest", OUT + "last-three-ep1.mp4",
]);

// Captions for every spoken line, for YouTube's subtitle track.
const stamp = (ms) => {
  const t = new Date(Math.max(0, ms)).toISOString().slice(11, 23);
  return t.replace(".", ",");
};
const lengths = JSON.parse(fs.readFileSync(OUT + "audio/voice/durations.json", "utf8"));
const srt = plan
  .filter((s) => s.say)
  .map((s, k) => {
    const from = s.start + LEAD_MS,
      to = from + lengths[s.id] * 1000;
    const who = s.speaker === "N" ? "" : `${s.speaker.toUpperCase()}: `;
    return `${k + 1}\n${stamp(from)} --> ${stamp(to)}\n${who}${s.caption}\n`;
  })
  .join("\n");
fs.writeFileSync(OUT + "last-three-ep1.srt", srt);
console.log(
  audioOnly
    ? `Wrote ${OUT}mix.wav and .srt`
    : `Wrote ${OUT}last-three-ep1.mp4 (${total.toFixed(1)} s) and .srt`,
);
