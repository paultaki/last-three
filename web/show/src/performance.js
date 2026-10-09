import { isStepWorthy } from "./model.js";

// These are presentation choices, not claims about an unrecorded emotion.
const publicGestures = {
  201: ["Dara", "praise"],
  226: ["Eli", "praise"],
  378: ["Bex", "plead"],
  436: ["Bex", "plead"],
  434: ["Ash", "refuse"],
  440: ["Eli", "refuse"],
  443: ["Gus", "refuse"],
  445: ["Hana", "refuse"],
  499: ["Gus", "taunt"],
};
export function performanceKind(s, cut, tapeId) {
  const e = s.ev || {};
  if (!isStepWorthy(e, cut)) return null;
  // A forged message does not make the impersonated person physically speak.
  if (e.forgedAs) return "message";
  if (e.type === "thought") return "think";
  if (e.type === "whisper") return "whisper";
  if (e.type === "chalk_write") return "reflect";
  if (e.type !== "say") return null;
  const authored = tapeId === "20261009-0025" && publicGestures[s.i];
  return authored && authored[0] === e.name ? authored[1] : "explain";
}
export function gesturePose(kind, seconds, reduced = false) {
  const u = reduced ? 1 : Math.max(0, Math.min(1, seconds / 0.7));
  const settle = u * u * (3 - 2 * u);
  const pulse = reduced ? 0 : Math.sin(Math.min(seconds, 2.8) * 3) * 0.08;
  const poses = {
    praise: [-0.65, -0.65, -0.65, -0.65, -0.08],
    plead: [-0.9, -0.9, -0.95, -0.95, -0.16],
    refuse: [0, -0.9, 0, -1.05, 0.12],
    taunt: [0, -0.7, 0, -0.55, -0.12],
    explain: [0, -0.4 + pulse, 0, -0.7, 0],
    think: [0, 0, 0, 0, 0.18],
    whisper: [0, -0.6, 0, -1.35, -0.08],
    reflect: [0, 0, 0, 0, 0.15],
    message: [0, 0, 0, 0, 0],
  };
  return (poses[kind] || poses.message).map((x) => x * settle);
}
export function contextBeat(s, cut) {
  if (!s) return null;
  const e = s.ev || {};
  if (!isStepWorthy(e, cut)) return null;
  if (e.type === "ability_use" && e.power === "anchor" && s.stage === "crusher")
    return {
      kind: "power",
      title: `${e.name} cannot be moved.`,
      detail: e.detail || "The push fails.",
      label: "ANCHOR · POWER USED",
    };
  if (e.type === "ability_use" && e.power === "feather" && s.stage === "disc")
    return {
      kind: "power",
      title: `${e.name} floats back up.`,
      detail: "The trapdoor opens, but the fall is stopped.",
      label: cut ? "FEATHER · POWER USED" : "THE SAVE",
    };
  if (e.type === "action" && e.valid === false)
    return {
      kind: "rejected",
      title: `${e.name}'s action is rejected.`,
      detail: e.note || "The recorded move has no effect.",
      label: "MOVE NOT EXECUTED",
    };
  if (s.stage === "ledge" && e.type === "reveal" && e.what === "footing") {
    const names = Object.entries(e.data?.footing || {})
      .filter(
        ([name, value]) =>
          s.players[name]?.alive && Number.isFinite(value) && value <= 0,
      )
      .map(([name]) => name);
    if (names.length)
      return {
        kind: "danger",
        title: `${names.join(" & ")} ${names.length === 1 ? "has" : "have"} no footing left.`,
        detail: "The ledge is still shrinking.",
        label: "ON THE EDGE",
      };
  }
  return null;
}
export function finalists(s) {
  if (s.ev?.type !== "game_end") return [];
  return (s.ev.places || [])
    .filter((p) => [1, 2, 3].includes(p.place) && s.players[p.name])
    .sort((a, b) => a.place - b.place);
}
export function powerLift(s, cut, seconds, reduced) {
  if (
    s.ev?.type !== "ability_use" ||
    s.ev.power !== "feather" ||
    s.stage !== "disc" ||
    !isStepWorthy(s.ev, cut)
  )
    return 0;
  if (reduced) return 0.55;
  const u = Math.max(0, Math.min(1, seconds / 1.8));
  return -0.6 + 1.15 * (u * u * (3 - 2 * u));
}

export function discSaves(tape, s, cut) {
  if (s.stage !== "disc") return [];
  return [
    ...new Set(
      tape.events
        .slice(0, s.i + 1)
        .filter(
          (e) =>
            e.stage === "disc" &&
            e.type === "ability_use" &&
            e.power === "feather" &&
            isStepWorthy(e, cut) &&
            s.players[e.name]?.alive,
        )
        .map((e) => e.name),
    ),
  ];
}
