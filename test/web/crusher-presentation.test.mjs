import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  stateAt,
  positions,
  presentation,
  crusherCeiling,
  crusherEscapePoint,
} from "../../web/show/src/model.js";
const tape = JSON.parse(
  fs.readFileSync(
    new URL("../../web/tapes/20261009-0025.json", import.meta.url),
  ),
);
const before = stateAt(tape, 349),
  reveal = stateAt(tape, 350),
  ended = stateAt(tape, 351);
test("Hana follows the recorded successful dive and remains outside at stage end", () => {
  const a = presentation(reveal, before).actors.find((a) => a.name === "Hana");
  assert.equal(a.pose, "walk");
  assert(a.position[2] < -6);
  assert.deepEqual(positions(ended).Hana, a.position);
  assert.equal(positions(before).Hana[0], -4.3);
  for (let t = 0; t <= 2.8; t += 0.01) {
    const q = Math.min(1, t / 1.15),
      p = q * q * (3 - 2 * q);
    const [x, y, z] = crusherEscapePoint(a.from, a.position, p);
    if (Math.abs(x) < 5.9 && Math.abs(z) < 4.9)
      assert(
        crusherCeiling(reveal, t) - 0.49 > y + 2.05,
        `slab intersects Hana at ${t}`,
      );
    if (z > -6.5 && z < -5.5)
      assert(x > 2.2 && x < 4.4, `route misses doorway at ${t}`);
  }
  assert(Math.abs(crusherCeiling(reveal, 2.8) - 0.66) < 1e-9);
});
test("a failed dive stays at the lever until its recorded death; flattening fits below the slab", () => {
  const fail = {
    ...reveal,
    ev: { ...reveal.ev, data: { ...reveal.ev.data, dive: false } },
  };
  assert.equal(positions(fail).Hana[0], -4.3);
  assert(crusherCeiling(fail, 2.8) > 2.5);
  const dead = {
    ...fail,
    ev: { type: "death", name: "Hana", style: "flatten" },
  };
  for (let t = 0; t < 2; t += 0.01) {
    const q = Math.min(1, t / 1.15),
      p = q * q * (3 - 2 * q);
    assert(crusherCeiling(dead, t) - 0.49 >= 2.05 * (1 - 0.94 * p));
  }
});

test("a shove target at the lever reacts instead of freezing in the hold pose", () => {
  const s = stateAt(tape, 346);
  const a = presentation(s, stateAt(tape, 345)).actors.find(
    (a) => a.name === "Hana",
  );
  assert.equal(s.crusher.holder, "Hana");
  assert.equal(a.pose, "flinch");
});
