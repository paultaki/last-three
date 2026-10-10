import { isStepWorthy } from "../../lib/state.js";
// Editorial context comes from earlier recorded events, never invented dialogue.
export const FEATURE_TAPE = "20261009-0025";
const receipts = {
  201: [
    200,
    "keep him there to shield my safe crossing.",
    "Dara's private motive",
  ],
  226: [225, "I'll butter him up.", "Eli's private motive"],
  440: [
    439,
    "Letting Bex drown reduces the competition in the next stage.",
    "Eli's private motive",
  ],
  445: [
    444,
    "Throwing the rope costs footing and only helps Bex, a rival, with no enforceable return.",
    "Hana's private motive",
  ],
  300: [290, "Row 7 is R. Trust me or don't.", "What Cole said"],
  514: [509, "Shove Gus with me this round.", "Dara's offer to Hana"],
};
const targets = {
  201: "Cole",
  226: "Cole",
  269: "Cole",
  378: "Dara",
  436: "Eli",
  434: "Bex",
  440: "Bex",
  443: "Bex",
  445: "Bex",
  509: "Hana",
};
const expected = {
  201: ["say", "Dara"],
  226: ["say", "Eli"],
  300: ["action", "Cole"],
  440: ["say", "Eli"],
  445: ["say", "Hana"],
  514: ["action", "Hana"],
};
export function directedList(tape, base, cut) {
  if (tape.id !== FEATURE_TAPE) return base;
  // Stage geography and every elimination remain visible. Private material stays gated.
  const additions = [
    327, 391, 410, 431, 434, 443, 456, 493, 499, 502, 503, 506, 531,
  ];
  if (cut) additions.push(269);
  return [...new Set([...base, ...additions])]
    .filter((i) => tape.events[i] && isStepWorthy(tape.events[i], cut))
    .sort((a, b) => a - b);
}
export function direction(tape, s, cut) {
  const e = s.ev || {};
  const hidden = !cut && ["thought", "whisper"].includes(e.type);
  const result = {
    receipt: null,
    listener: null,
    forged: null,
    contrast: null,
    pit: false,
  };
  if (hidden) return result;
  if (cut && e.type === "whisper" && e.forgedAs && e.from) {
    result.forged = { signed: e.forgedAs, sender: e.from, to: e.to };
    result.listener = e.to;
  }
  if (tape?.id !== FEATURE_TAPE) return result;
  result.listener ||= targets[s.i] || null;
  result.pit =
    s.stage === "pit" && [378, 434, 436, 440, 443, 445].includes(s.i);
  const r = receipts[s.i],
    match = expected[s.i];
  if (r && e.type === match[0] && e.name === match[1]) {
    const source = tape.events[r[0]];
    const privateSource = ["thought", "whisper"].includes(source?.type);
    if (
      source &&
      r[0] < s.i &&
      typeof source.text === "string" &&
      source.text.includes(r[1]) &&
      (!privateSource || cut)
    )
      result.receipt = {
        text: r[1],
        label: r[2],
        source: r[0],
        private: privateSource,
        kind: source.type,
      };
  }
  if (
    s.i === 300 &&
    e.type === "action" &&
    e.name === "Cole" &&
    e.action === "step:L"
  )
    result.contrast = "HE SAID RIGHT. HE STEPS LEFT.";
  if (
    s.i === 514 &&
    e.type === "action" &&
    e.name === "Hana" &&
    e.action === "shove:Dara"
  )
    result.contrast = "HANA TURNS ON DARA.";
  return result;
}
export function consequence(s) {
  const e = s.ev || {};
  if (e.type !== "death") return null;
  const remaining = s.order.filter((n) => s.players[n].alive).length;
  return {
    name: e.name,
    title:
      e.place === 2 || e.place === 3
        ? `${e.name.toUpperCase()} TAKES ${e.place === 2 ? "SECOND" : "THIRD"}`
        : `${e.name.toUpperCase()} IS OUT`,
    detail: `${remaining} ${remaining === 1 ? "contestant remains" : "contestants remain"}`,
  };
}
export const clamp01 = (n) => Math.max(0, Math.min(1, n));
const smooth = (n) => {
  const p = clamp01(n);
  return p * p * (3 - 2 * p);
};
// An authored contact beat: approach, contact at .85s, recoil, then recover.
export function contactBeat(seconds, reduced = false) {
  if (reduced) return { approach: 0, recoil: 0, strike: 0 };
  const t = Math.max(0, seconds);
  const approach = smooth((t - 0.15) / 0.7) * (1 - smooth((t - 1.45) / 0.75));
  const recoil = t < 0.85 ? 0 : Math.sin(Math.PI * clamp01((t - 0.85) / 0.8));
  const strike = t < 0.6 ? 0 : Math.sin(Math.PI * clamp01((t - 0.6) / 0.6));
  return { approach, recoil, strike };
}
export function deathProgress(style, seconds, reduced = false) {
  if (reduced) return 1;
  // Crusher impact already shares its timing with the slab.
  return smooth(style === "flatten" ? seconds / 1.15 : seconds / 2.1);
}
