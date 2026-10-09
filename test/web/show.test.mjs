import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  stateAt,
  presentation,
  positions,
  visibleActor,
  safeTapeId,
} from "../../web/show/src/model.js";
const tape = JSON.parse(
  fs.readFileSync(
    new URL("../../web/tapes/20261009-0016.json", import.meta.url),
  ),
);
test("every rules-v4 projection is finite and reproducible after a reverse seek", () => {
  for (let i = 0; i < tape.events.length; i++) {
    const s = stateAt(tape, i),
      prev = stateAt(tape, i - 1),
      v = presentation(s, prev);
    for (const a of v.actors) {
      assert(a.position.every(Number.isFinite));
      assert(a.from.every(Number.isFinite));
    }
    assert.deepEqual(v, presentation(stateAt(tape, i), stateAt(tape, i - 1)));
  }
});
test("public camera does not identify private speech or unrevealed abilities", () => {
  for (let i = 0; i < tape.events.length; i++) {
    const e = tape.events[i],
      s = stateAt(tape, i);
    if (["thought", "whisper"].includes(e.type)) {
      assert.equal(visibleActor(s, false), null);
      assert(visibleActor(s, true));
    }
  }
});
test("forged public speaker uses the presented identity", () => {
  assert.equal(
    visibleActor({ ev: { type: "say", name: "Ash", forgedAs: "Bex" } }, false),
    "Bex",
  );
});
test("rope rescue costs and positions come from the tape", () => {
  const t = JSON.parse(
    fs.readFileSync(
      new URL("../../web/tapes/20261008-0057.json", import.meta.url),
    ),
  );
  const i = t.events.findIndex((e) => e.type === "reveal" && e.what === "rope");
  assert(i >= 0);
  const s = stateAt(t, i);
  assert.equal(s.ropeCost[t.events[i].data.by], t.events[i].data.cost);
  const j = t.events.findIndex(
    (e, k) => k > i && e.type === "reveal" && e.what === "pit",
  );
  const after = stateAt(t, j);
  assert(after.pit.out.includes(t.events[i].data.saved));
  assert.equal(positions(after)[t.events[i].data.saved][1], 2.8);
});
test("death remains visible for its cinematic beat but disappears on the next event", () => {
  const i = tape.events.findIndex((e) => e.type === "death"),
    name = tape.events[i].name;
  assert(
    presentation(stateAt(tape, i), stateAt(tape, i - 1)).actors.find(
      (a) => a.name === name,
    ).visible,
  );
  assert(
    !presentation(stateAt(tape, i + 1), stateAt(tape, i)).actors.find(
      (a) => a.name === name,
    ).visible,
  );
});
test("podium follows the recorded places including eliminated finalists", () => {
  const s = stateAt(tape, tape.events.length - 1),
    v = presentation(s, stateAt(tape, tape.events.length - 2));
  assert.deepEqual(
    v.actors
      .filter((a) => a.visible)
      .map((a) => a.name)
      .sort(),
    s.places
      .filter((p) => p.place)
      .map((p) => p.name)
      .sort(),
  );
  assert.equal(v.actors.find((a) => a.place === 1).position[0], 0);
});
test("tape IDs cannot traverse or inject URLs", () => {
  for (const id of [
    "../sample",
    "/etc/passwd",
    "https://a",
    "a?i=2",
    "",
    "%2e",
  ])
    assert.equal(safeTapeId(id), null);
  assert.equal(safeTapeId(tape.id), tape.id);
});
test("public disc position is unchanged by private tile choices until tiles reveal", () => {
  const i = tape.events.findIndex(
    (e) =>
      e.stage === "disc" && e.type === "action" && e.action.startsWith("tile:"),
  );
  assert(i > 0);
  const s = stateAt(tape, i),
    before = stateAt(tape, i - 1);
  assert.deepEqual(positions(s), positions(before));
});
test("crusher escaped is a boolean, bridge pane row indices start at one", () => {
  const c = stateAt(
    tape,
    tape.events.findIndex(
      (e) => e.type === "stage_start" && e.stage === "crusher",
    ),
  );
  assert.equal(typeof c.crusher.escaped, "boolean");
  assert.equal(c.crusher.escaped, false);
  for (const e of tape.events.filter((e) => e.what === "weak_pane"))
    assert(e.data.row >= 1);
});
test("bridge entrance has eight separate standing positions", () => {
  const i = tape.events.findIndex(
    (e) => e.type === "round_start" && e.phase === "crossing",
  );
  const p = positions(stateAt(tape, i));
  assert.equal(new Set(Object.values(p).map((a) => a.join(","))).size, 8);
});
