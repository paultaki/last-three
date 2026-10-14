// Turns the shot list plus measured voice-line lengths into a timeline.
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { SHOTS, plain } from "./episode.mjs";

export const FPS = 24;
export const OUT =
  process.env.EPISODE_OUT ||
  fileURLToPath(new URL("../../../../docs/show/episode/", import.meta.url));
export const LEAD_MS = 120; // a breath before each voice line starts

export function durations() {
  const file = OUT + "audio/voice/durations.json";
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
}

// Each shot gets start/dur in ms, frame count, and the persistent counter.
export function timeline(lengths = durations()) {
  let t = 0,
    counter = null;
  return SHOTS.map((shot) => {
    if (shot.counter !== undefined) counter = shot.counter;
    let voice = 0;
    if (shot.say) {
      const seconds = lengths[shot.id] ?? (process.env.EPISODE_GUESS ? 2 : undefined);
      if (seconds === undefined) throw new Error(`No voice length for ${shot.id}`);
      voice = LEAD_MS + seconds * 1000 + (shot.pad ?? 250);
    }
    const dur = Math.round(Math.max(shot.hold ?? (shot.say ? 0 : 2000), voice));
    const frames = Math.max(1, Math.round((dur / 1000) * FPS));
    const entry = {
      ...shot,
      start: t,
      dur: (frames * 1000) / FPS,
      frames,
      counter,
      speaker: shot.say?.[0] ?? null,
      caption: shot.say ? plain(shot.say[1]) : null,
    };
    t += entry.dur;
    return entry;
  });
}
