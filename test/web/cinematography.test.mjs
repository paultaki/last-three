import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { stateAt, presentation } from "../../web/show/src/model.js";
import { direction, directedList } from "../../web/show/src/direction.js";
import {
  filmDuration,
  dialogue,
  readingTime,
  editList,
} from "../../web/show/src/film.js";
import {
  blockFilm,
  climbPose,
  climbNames,
  climbDuration,
  coverage,
  hookIndex,
} from "../../web/show/src/cinematography.js";
const tape = JSON.parse(fs.readFileSync("web/tapes/20261009-0025.json"));
const demo = JSON.parse(fs.readFileSync("web/demo.json"));
const state = (i) => stateAt(tape, i);
test("film blocking is pure and moves only escaped Pit actors to safe deck marks", () => {
  const s = state(431),
    prev = state(430),
    v = presentation(s, prev, true),
    frozen = JSON.stringify(v);
  const b = blockFilm(v, s, prev);
  assert.equal(JSON.stringify(v), frozen);
  for (const a of b.actors) {
    if (!s.pit.out.includes(a.name))
      assert.deepEqual(a.position, v.actors[a.seat].position);
    else {
      assert.equal(a.position[1], 2.8);
      assert(a.position[2] < -3.02 && a.position[2] > -5.9);
    }
  }
  assert.equal(
    new Set(
      b.actors
        .filter((a) => s.pit.out.includes(a.name))
        .map((a) => a.position.join(",")),
    ).size,
    6,
  );
  const bridge = state(226),
    bv = presentation(bridge, state(225), true);
  assert.strictEqual(blockFilm(bv, bridge, state(225)), bv);
});
test("all three recorded Pit climbs are included without inventing who escapes", () => {
  const list = directedList(tape, editList(tape, demo, true), true);
  for (const i of [391, 410, 431]) {
    assert(list.includes(i));
    const s = state(i),
      v = blockFilm(presentation(s, state(i - 1), true), s, state(i - 1));
    const names = climbNames(s);
    assert.deepEqual(names, s.ev.data.lifted);
    assert.equal(filmDuration(s, true), climbDuration(s));
    const [a, b] = names.map((n) => v.actors.find((a) => a.name === n));
    assert.equal(climbPose(s, a, 2, false).moving, true);
    assert.equal(climbPose(s, b, 2, false).u, 0);
    for (const actor of [a, b]) {
      assert.deepEqual(climbPose(s, actor, 8, false).point, actor.position);
      assert.deepEqual(climbPose(s, actor, 0, true).point, actor.position);
    }
    assert.equal(
      climbPose(
        s,
        v.actors.find((a) => a.name === s.pit.base),
        3,
        false,
      ),
      null,
    );
  }
});
test("crusher shove retains the attacker until contact instead of walking through exit", () => {
  const s = state(346),
    prev = state(345),
    v = presentation(s, prev, true),
    b = blockFilm(v, s, prev);
  const gus = b.actors.find((a) => a.name === "Gus");
  assert.equal(gus.pose, "shove");
  assert.deepEqual(gus.position, gus.from);
  assert.equal(b.actors.find((a) => a.name === "Hana").pose, "flinch");
  assert.equal(s.crusher.holder, "Hana");
  assert.equal(prev.crusher.holder, null);
});
test("listener coverage waits for every word and the entire private receipt", () => {
  const s = state(440),
    d = direction(tape, s, true),
    read = dialogue(s, true).pages.reduce((n, p) => n + readingTime(p), 0);
  const receipt = readingTime(d.receipt.text);
  assert.equal(coverage(s, d, read, 0), "establish");
  assert.equal(coverage(s, d, read, 1200), "speaker");
  assert.equal(coverage(s, d, read, read + receipt - 1), "speaker");
  assert.equal(coverage(s, d, read, read + receipt + 200), "listener");
  assert(filmDuration(s, true, d) >= read + receipt + 1600);
  for (const i of [200, 269, 509])
    assert.equal(
      coverage(state(i), direction(tape, state(i), true), 1000, 30000),
      "speaker",
    );
});
test("the hook is explicitly limited to the selected Director edit and verified action", () => {
  assert.equal(hookIndex(tape, true), 514);
  assert.equal(hookIndex(tape, false), null);
  assert.equal(hookIndex({ ...tape, id: "other" }, true), null);
  const altered = structuredClone(tape);
  altered.events[514].valid = false;
  assert.equal(hookIndex(altered, true), null);
});
