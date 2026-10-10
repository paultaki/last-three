// Film-only blocking. Recorded membership, positions on hazards and outcomes remain authoritative.
const clamp = (x) => Math.max(0, Math.min(1, x));
const smooth = (x) => {
  const u = clamp(x);
  return u * u * (3 - 2 * u);
};
const mix = (a, b, u) => a.map((x, i) => x + (b[i] - x) * u);
const pitMarks = [
  [-4.6, 2.8, -4.8],
  [-3.1, 2.8, -3.5],
  [-1.3, 2.8, -4.9],
  [0.5, 2.8, -3.6],
  [2.5, 2.8, -4.7],
  [4.3, 2.8, -3.5],
];
export function pitMark(s, name, fallback) {
  if (s?.stage !== "pit" || !s.pit.out.includes(name)) return [...fallback];
  const order = s.pit.order.filter((n) => n !== s.pit.base);
  return [...(pitMarks[order.indexOf(name)] || fallback)];
}
export function blockFilm(view, s, prev) {
  if (
    view.key === "crusher" &&
    s.ev?.type === "action" &&
    s.ev.valid !== false &&
    s.ev.action?.startsWith("push_lever:") &&
    s.crusher.holder === s.ev.action.split(":")[1] &&
    prev?.crusher.holder !== s.crusher.holder
  ) {
    return {
      ...view,
      actors: view.actors.map((a) =>
        a.name === s.ev.name
          ? { ...a, position: [...a.from], pose: "shove" }
          : a.name === s.crusher.holder
            ? a
            : { ...a, position: [...a.from], pose: "idle" },
      ),
    };
  }
  if (view.key !== "pit") return view;
  return {
    ...view,
    actors: view.actors.map((a) => ({
      ...a,
      position: pitMark(s, a.name, a.position),
      from: pitMark(prev, a.name, a.from),
    })),
  };
}
export function climbNames(s) {
  if (s?.stage !== "pit" || s.ev?.type !== "reveal" || s.ev.what !== "pit")
    return [];
  return (s.ev.data.lifted || []).filter(
    (n) => s.pit.out.includes(n) && s.players[n]?.alive,
  );
}
export function climbDuration(s) {
  const n = climbNames(s).length;
  return n ? 2200 + n * 2500 : 0;
}
export function climbPose(s, actor, seconds, reduced) {
  const names = climbNames(s),
    slot = names.indexOf(actor.name);
  if (slot < 0 || actor.from[1] >= actor.position[1]) return null;
  const u = reduced ? 1 : clamp((seconds - 0.7 - slot * 2.5) / 2.5);
  // Approach the human step, weight it, reach the rim, then plant on the deck.
  const step = [0, 0.12, -2.35],
    rim = [0, 2.8, -3.28];
  const point =
    u < 0.3
      ? mix(actor.from, step, smooth(u / 0.3))
      : u < 0.76
        ? mix(step, rim, smooth((u - 0.3) / 0.46))
        : mix(rim, actor.position, smooth((u - 0.76) / 0.24));
  return {
    point,
    u,
    moving: u > 0 && u < 1,
    crouch:
      u > 0.24 && u < 0.82 ? Math.sin(((u - 0.24) / 0.58) * Math.PI) * 0.24 : 0,
  };
}
export function reactionAllowed(s, directing) {
  return s?.ev?.type === "say" && !s.ev.forgedAs && !!directing?.listener;
}
export function coverage(s, directing, readMs, ms) {
  if (!reactionAllowed(s, directing)) return "speaker";
  const receiptMs = directing.receipt
    ? Math.max(
        3200,
        1500 + directing.receipt.text.trim().split(/\s+/).length * 340,
      )
    : 0;
  if (ms >= readMs + receiptMs + 200) return "listener";
  return ms < 1100 ? "establish" : "speaker";
}
// No event outcome, quoted text or private receipt is shown in the cold open.
export function hookIndex(tape, cut) {
  if (!cut || tape?.id !== "20261009-0025") return null;
  const e = tape.events[514];
  return e?.type === "action" &&
    e.name === "Hana" &&
    e.action === "shove:Dara" &&
    e.valid !== false
    ? 514
    : null;
}
export const HOOK_MS = 5800;
