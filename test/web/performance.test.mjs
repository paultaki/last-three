import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { stateAt } from "../../web/show/src/model.js";
import {
  performanceKind,
  gesturePose,
  contextBeat,
  finalists,
  discSaves,
  powerLift,
} from "../../web/show/src/performance.js";
import { filmDuration, readingTime } from "../../web/show/src/film.js";
const tape = JSON.parse(
  fs.readFileSync(
    new URL("../../web/tapes/20261009-0025.json", import.meta.url),
  ),
);
const at = (i) => stateAt(tape, i);
test("authored gestures belong to the selected recording and right visible actor", () => {
  for (const [i, kind] of [
    [201, "praise"],
    [436, "plead"],
    [445, "refuse"],
    [499, "taunt"],
    [200, "think"],
    [509, "whisper"],
    [269, "message"],
  ]) {
    assert.equal(performanceKind(at(i), true, tape.id), kind);
  }
  assert.equal(performanceKind(at(201), true, "other"), "explain");
  assert.equal(
    performanceKind(
      { ...at(201), ev: { ...at(201).ev, name: "Cole" } },
      true,
      tape.id,
    ),
    "explain",
  );
  for (const i of [200, 269, 509])
    assert.equal(performanceKind(at(i), false, tape.id), null);
});
test("gestures settle deterministically with reduced motion and differ by performance", () => {
  const kinds = [
    "praise",
    "plead",
    "refuse",
    "taunt",
    "think",
    "whisper",
    "message",
  ];
  assert.equal(
    new Set(kinds.map((k) => JSON.stringify(gesturePose(k, 1)))).size,
    kinds.length,
  );
  for (const k of kinds) {
    assert.deepEqual(gesturePose(k, 0, true), gesturePose(k, 90, true));
    for (let t = 0; t < 3; t += 0.1)
      assert(gesturePose(k, t).every(Number.isFinite));
  }
  assert(gesturePose("message", 2).every((x) => x === 0));
});
test("power and rejected action cards honor existing visibility, contain recorded facts and get reading time", () => {
  for (const i of [348, 349, 489, 527, 515, 528]) {
    const s = at(i),
      c = contextBeat(s, true);
    assert(c);
    assert(filmDuration(s, true) >= readingTime(c.title + " " + c.detail));
  }
  assert.equal(contextBeat(at(348), false), null);
  assert.equal(contextBeat(at(527), false), null);
  assert.equal(contextBeat(at(527), true).detail, tape.events[527].note);
  assert.equal(contextBeat(at(489), false).label, "THE SAVE");
  assert.equal(contextBeat(at(514), true), null, "no future footing result");
  assert(contextBeat(at(515), true).title.includes("Dara"));
  assert(contextBeat(at(528), true).title.includes("Gus"));
});
test("feather survival persists across disc death beats, never before recorded save or into next stage", () => {
  assert.deepEqual(discSaves(tape, at(488), true), []);
  for (const i of [489, 490, 491])
    assert.deepEqual(discSaves(tape, at(i), true), ["Fenn"]);
  assert.deepEqual(discSaves(tape, at(493), true), []);
  assert(
    powerLift(at(489), true, 1.8, false) > powerLift(at(489), true, 0, false),
  );
  assert.equal(powerLift(at(489), true, 0, true), 0.55);
});
test("finalists and finish hold appear only after authoritative game end", () => {
  assert.deepEqual(finalists(at(539)), []);
  assert.deepEqual(
    finalists(at(541)).map((p) => [p.name, p.place]),
    [
      ["Hana", 1],
      ["Gus", 2],
      ["Dara", 3],
    ],
  );
  assert.equal(filmDuration(at(541), true), 6500);
});
