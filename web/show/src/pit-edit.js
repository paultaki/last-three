// Separate authored film edit. The recorded events and reducer are never changed.
export const DURATION = 40;
export const TAPE = "20261009-0025";
export const SHOTS = [
  { start: 0, end: 1.1, event: 391, kind: "climb", offset: 0.7, rate: 5.3 },
  { start: 1.1, end: 2.2, event: 410, kind: "climb-side", offset: 0.7, rate: 5.3 },
  { start: 2.2, end: 3.3, event: 431, kind: "climb", offset: 0.7, rate: 5.3 },
  { start: 3.3, end: 5.05, event: 434, kind: "wide" },
  { start: 5.05, end: 6.7, event: 434, kind: "rope" },
  { start: 6.7, end: 9.4, event: 434, kind: "up" },
  { start: 9.4, end: 12, event: 434, kind: "wide" },
  { start: 12, end: 15.8, event: 436, kind: "bex", performance: "plea" },
  { start: 15.8, end: 17.2, event: 436, kind: "up" },
  { start: 17.2, end: 20.8, event: 440, kind: "eli", performance: "refusal" },
  { start: 20.8, end: 22.1, event: 440, kind: "bex", performance: "reaction" },
  { start: 22.1, end: 24.9, event: 443, kind: "gus", performance: "refusal" },
  { start: 24.9, end: 26.4, event: 443, kind: "rope" },
  { start: 26.4, end: 28.6, event: 445, kind: "bex", performance: "reaction" },
  { start: 28.6, end: 30.5, event: 453, kind: "wide", performance: "leave" },
  { start: 30.5, end: 33.7, event: 454, kind: "sink", offset: 0, rate: 0.875 },
  { start: 33.7, end: 37.3, event: 455, kind: "empty" },
  { start: 37.3, end: 40, event: 455, kind: "end" },
];
export const VOICES = [
  { id: "narrator", start: 0.2, duration: 8.96, text: "Six contestants escaped on Bex's shoulders. Now she's alone. There's one rope. But saving her costs them balance in the final.", sources: [391,410,431], mode: "narration" },
  { id: "bex", start: 12.2, duration: 2.8, text: "Throw me the rope. My power can save you later.", sources: [436], mode: "adaptation" },
  { id: "eli", start: 17.45, duration: 3.28, text: "Nothing personal. Saving you could get me killed.", sources: [440], mode: "adaptation" },
  { id: "gus", start: 22.2, duration: 2.4, text: "No rope. We've got enough competition.", sources: [443], mode: "adaptation" },
  { id: "ending", start: 33.8, duration: 3.28, text: "They had the rope. Nobody used it.", sources: [453,454,455], mode: "narration" },
];
export const CAPTIONS = [
  { start: .2, end: 3.3, name: "", text: "Six escaped on Bex's shoulders." },
  { start: 3.3, end: 5.05, name: "", text: "Now she's alone." },
  { start: 5.05, end: 6.7, name: "", text: "There's one rope." },
  { start: 6.7, end: 9.4, name: "", text: "Saving her costs balance in the final." },
  { start: 12.2, end: 13.5, name: "BEX", text: "Throw me the rope." },
  { start: 13.5, end: 15.2, name: "BEX", text: "My power can save you later." },
  { start: 17.45, end: 18.75, name: "ELI", text: "Nothing personal." },
  { start: 18.75, end: 20.8, name: "ELI", text: "Saving you could get me killed." },
  { start: 22.2, end: 23.05, name: "GUS", text: "No rope." },
  { start: 23.05, end: 24.8, name: "GUS", text: "We've got enough competition." },
  { start: 33.8, end: 35.6, name: "", text: "They had the rope." },
  { start: 35.6, end: 37.2, name: "", text: "Nobody used it." },
];
export function shotAt(seconds) {
  const t = Math.max(0, Math.min(DURATION, Number(seconds) || 0));
  return SHOTS.find(s => t >= s.start && t < s.end) || SHOTS.at(-1);
}
