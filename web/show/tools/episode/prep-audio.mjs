// Tightens the raw voice lines: trims silence at both ends and speeds them up
// a touch (pitch kept). Writes audio/voice/<id>.wav and audio/voice/durations.json,
// which the timeline uses.
import fs from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { SHOTS } from "./episode.mjs";
import { OUT } from "./plan.mjs";

export const RATE = { N: 1.2, default: 1.08 };
const src = OUT + "audio/lines/",
  dst = OUT + "audio/voice/";
fs.mkdirSync(dst, { recursive: true });
const trim =
  "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03," +
  "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse";
// Integrated loudness of a file after a filter, in LUFS (loudnorm reports on stderr).
export function loudness(file, filter = "anull") {
  const { stderr } = spawnSync("ffmpeg", [
    "-hide_banner", "-i", file, "-af", `${filter},loudnorm=print_format=json`,
    "-f", "null", "-",
  ], { encoding: "utf8" });
  return Number(JSON.parse(stderr.slice(stderr.lastIndexOf("{"))).input_i);
}
const lengths = {};
for (const shot of SHOTS.filter((s) => s.say)) {
  const rate = RATE[shot.say[0]] ?? RATE.default;
  const out = dst + shot.id + ".wav";
  const shape = `${trim},atempo=${rate}`;
  // Every line lands at the same loudness; whispered lines sit a little lower.
  const target = /\[whispers\]/.test(shot.say[1]) ? -21 : -19;
  const gain = target - loudness(src + shot.id + ".mp3", shape);
  execFileSync("ffmpeg", [
    "-v", "error", "-y", "-i", src + shot.id + ".mp3",
    "-af", `${shape},volume=${gain.toFixed(2)}dB,alimiter=limit=0.89`,
    "-ar", "48000", "-ac", "1", out,
  ]);
  lengths[shot.id] = Number(
    execFileSync("ffprobe", [
      "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out,
    ]).toString(),
  );
}
fs.writeFileSync(dst + "durations.json", JSON.stringify(lengths, null, 2));
const total = Object.values(lengths).reduce((a, b) => a + b, 0);
console.log(`${Object.keys(lengths).length} lines, ${total.toFixed(1)} s of voice`);
