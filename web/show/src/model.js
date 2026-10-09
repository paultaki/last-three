// Presentation is a projection of the original reducer. Never simulate game outcomes.
import { stateAt, chapters, isStepWorthy } from "../../lib/state.js";
export { stateAt, chapters, isStepWorthy };
export const COLORS = [
  "#ff916d",
  "#75d7df",
  "#d9ba73",
  "#dc95d0",
  "#9ed28b",
  "#82a8ff",
  "#edc354",
  "#bdadf0",
];
export const TITLES = {
  lobby: "THE WAITING ROOM",
  bridge: "THE GLASS BRIDGE",
  crusher: "THE CRUSHER",
  pit: "THE PIT",
  disc: "THE TRAPDOOR DISC",
  ledge: "THE FINAL LEDGE",
  chalk: "WORDS TO LIVE BY",
  ended: "THE LAST THREE",
};
export const RULES = {
  lobby: "Eight minds. Five obstacles. Only three prizes.",
  bridge: "Two panes. One holds. Someone has to go first.",
  crusher: "The exit needs a hand on the lever. The ceiling will not wait.",
  pit: "Climb on a rival. Leave someone behind. One rope, at a price.",
  disc: "Choose a number. Not every floor stays a floor.",
  ledge: "Shove. Brace. Dodge. There is less room every round.",
  chalk: "The survivors leave advice. Nobody promises it is true.",
  ended: "The tape is over. The choices are permanent.",
};
export function visibleActor(s, cut) {
  const e = s.ev;
  if (!e) return null;
  if (["thought", "whisper"].includes(e.type) && !cut) return null;
  if (e.type === "ability_use" && !isStepWorthy(e, cut)) return null;
  return e.forgedAs || e.name || e.from || null;
}
export function sceneKey(s) {
  return s.stage === "bridge" && s.phase !== "crossing" && !s.bridge?.finished
    ? "waiting"
    : s.stage;
}
const ring = (i, n, r, y = 0) => [
  Math.sin((i / Math.max(n, 1)) * Math.PI * 2) * r,
  y,
  Math.cos((i / Math.max(n, 1)) * Math.PI * 2) * r,
];
export function crusherDive(s) {
  return (
    s.stage === "crusher" &&
    s.ev?.type === "reveal" &&
    s.ev.what === "ceiling" &&
    s.ev.data?.dive === true
  );
}
export function crusherCeiling(s, seconds, escaping = false) {
  const c = s.crusher;
  const raised = Math.max(2.8, 2.05 + c.ceiling * 0.75);
  if (crusherDive(s) || (c.escaped && escaping)) {
    // The holder clears the slab at 1.15s. Only then may it slam down.
    const q = Math.max(0, Math.min(1, (seconds - 1.25) / 0.5));
    return 2.8 + (0.66 - 2.8) * q * q;
  }
  if (c.escaped) return 0.66;
  if (s.ev?.type === "death" && s.ev.style === "flatten") {
    const q = Math.max(0, Math.min(1, seconds / 1.15));
    const p = q * q * (3 - 2 * q);
    return 2.8 + (0.66 - 2.8) * p;
  }
  // A reveal announces the outcome; the following death beat performs impact.
  return c.crushed ? 0.66 : raised;
}
export function crusherEscapePoint(from, to, progress) {
  const doorway = [3.3, 0, -5.4];
  const first = Math.hypot(...doorway.map((n, i) => n - from[i]));
  const second = Math.hypot(...to.map((n, i) => n - doorway[i]));
  const split = first / Math.max(0.001, first + second);
  const left = progress < split ? from : doorway;
  const right = progress < split ? doorway : to;
  const p =
    progress < split
      ? progress / Math.max(0.001, split)
      : (progress - split) / Math.max(0.001, 1 - split);
  return left.map((n, i) => n + (right[i] - n) * p);
}
export function positions(s, cut = false) {
  const out = {};
  const living = s.order.filter((n) => s.players[n].alive);
  const key = sceneKey(s);
  for (const [i, n] of s.order.entries()) {
    if (key === "pit") {
      const p = s.pit,
        slot = p.order.indexOf(n);
      const escaped = p.out.indexOf(n);
      out[n] =
        escaped >= 0
          ? [-4.7 + escaped * 1.6, 2.8, -3.7]
          : ring(Math.max(0, slot), p.order.length, 2.65, -0.8);
      if (p.base === n) out[n] = [0, -0.8, -2.35];
    } else if (key === "bridge") {
      const b = s.bridge,
        slot = Math.max(0, b.line.indexOf(n));
      const step = b.stepping[n] || b.at[n];
      const row = b.finished
        ? 9
        : step?.row || Math.max(0, b.cur - 1 - Math.floor(slot / 2));
      const known = b.rows[row]?.safe;
      out[n] =
        row === 0
          ? [((slot % 4) - 1.5) * 1.65, 0, 10.8 + Math.floor(slot / 4) * 1.7]
          : [
              step
                ? step.side === "L"
                  ? -1.45
                  : 1.45
                : known
                  ? known === "L"
                    ? -1.45
                    : 1.45
                  : slot % 2
                    ? 1.45
                    : -1.45,
              0,
              10 - row * 2.35,
            ];
    } else if (key === "waiting") {
      const ix = Math.max(0, s.bridge.line.indexOf(n));
      out[n] = [-3.5 + (ix % 4) * 2.3, 0, 3 - Math.floor(ix / 4) * 3];
    } else if (key === "crusher") {
      const ix = Math.max(0, living.indexOf(n));
      out[n] =
        s.crusher.holder === n && !s.crusher.escaped && !crusherDive(s)
          ? [-4.3, 0, -1.8]
          : s.crusher.escaped || s.crusher.door || crusherDive(s)
            ? [2.1 + (ix % 3) * 1.2, 0, -6.6 - Math.floor(ix / 3) * 1.3]
            : [-2.6 + (ix % 4) * 1.8, 0, 2 - Math.floor(ix / 4) * 2.4];
    } else if (key === "disc") {
      const known = cut || s.disc.tilesPublic;
      const tile = (known ? s.disc.tiles[n] : null) ?? living.indexOf(n) + 1;
      out[n] = ring(tile - 1, s.disc.n, known ? 3.4 : 5.1, 0);
    } else if (key === "ledge") {
      const names = Object.keys(s.ledge.footing);
      out[n] = ring(
        Math.max(0, names.indexOf(n)),
        names.length,
        Math.max(0.8, 2.9 - s.ledge.shrunk * 0.28),
        0,
      );
    } else if (key === "ended" || key === "chalk") {
      const place = s.players[n].place || s.chalk?.places[n];
      out[n] = [
        place === 1 ? 0 : place === 2 ? -3 : 3,
        place === 1 ? 1.5 : place === 2 ? 0.9 : 0.5,
        0,
      ];
    } else out[n] = [-5.25 + (i % 4) * 3.5, 0, 2.5 - Math.floor(i / 4) * 3];
  }
  // Two followers can share a known-safe pane. Give each a distinct standing spot.
  if (key === "bridge") {
    const groups = new Map();
    for (const n of living) {
      const key = out[n].join(",");
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(n);
    }
    for (const names of groups.values())
      if (names.length > 1) {
        names.forEach((n, i) => {
          out[n][0] += ((i % 2) - 0.5) * 1.1;
          out[n][2] +=
            (Math.floor(i / 2) - (Math.ceil(names.length / 2) - 1) / 2) * 0.8;
        });
      }
  }
  return out;
}
export function presentation(s, previous, cut = false) {
  const pos = positions(s, cut),
    before =
      previous && previous.stage === s.stage ? positions(previous, cut) : pos;
  const actor = visibleActor(s, cut),
    key = sceneKey(s),
    e = s.ev || {};
  const actors = s.order.map((name, seat) => {
    const p = s.players[name];
    const winner = s.stage === "ended" || s.stage === "chalk";
    const place = p.place || s.chalk?.places[name];
    let visible = winner
      ? !!place
      : p.alive || (e.type === "death" && e.name === name);
    let pose = "idle";
    const a = s.acts[name];
    if (a?.i === s.i && a.valid)
      pose =
        {
          shove: "shove",
          push_base: "shove",
          push_lever: "shove",
          brace: "brace",
          dodge: "dodge",
          step: "walk",
          volunteer: "walk",
          hold_lever: "hold",
          reach_down: "rescue",
          climb: "climb",
          offer_back: "brace",
        }[a.verb] || "idle";
    if (key === "crusher") {
      if (pos[name][2] < -4.9 && before[name][2] >= -4.9) pose = "walk";
      else if (
        s.crusher.holder === name &&
        !s.crusher.escaped &&
        !crusherDive(s)
      )
        pose = "hold";
    }
    if (
      e.type === "action" &&
      e.valid !== false &&
      String(e.action).split(":")[1] === name &&
      ["shove", "push_base", "push_lever"].includes(
        String(e.action).split(":")[0],
      )
    )
      pose = "flinch";
    if (key === "pit" && s.pit.base === name) pose = "base";
    if (winner) pose = place === 1 ? "celebrate" : "idle";
    if (e.type === "death" && e.name === name) pose = e.style;
    if (
      key === "pit" &&
      e.type === "reveal" &&
      e.what === "pit" &&
      (s.pit.lifted.includes(name) || s.pit.rescued === name)
    )
      pose = "climb";
    if (
      key === "pit" &&
      e.type === "reveal" &&
      e.what === "rope" &&
      e.data.saved === name
    )
      pose = "rescue";
    return {
      name,
      seat,
      color: COLORS[seat],
      visible,
      pose,
      position:
        e.type === "death" && e.name === name ? before[name] : pos[name],
      from: before[name],
      active: name === actor,
      place,
    };
  });
  return {
    key,
    actor,
    actors,
    death: e.type === "death",
    title: TITLES[s.stage] || "LAST THREE",
  };
}
export function safeTapeId(id) {
  return typeof id === "string" && /^[a-zA-Z0-9_-]{1,64}$/.test(id) ? id : null;
}
export function duration(e) {
  return e?.type === "death"
    ? 2800
    : e?.type === "say"
      ? Math.min(6500, 2000 + String(e.text || "").length * 20)
      : e?.type === "stage_start"
        ? 2800
        : 1600;
}
