import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  direction,
  directedList,
  contactBeat,
  deathProgress,
  consequence,
} from "../../web/show/src/direction.js";
import {
  editList,
  filmDuration,
  dialogue,
  readingTime,
} from "../../web/show/src/film.js";
import { stateAt } from "../../web/show/src/model.js";
const tape = JSON.parse(
  fs.readFileSync(
    new URL("../../web/tapes/20261009-0025.json", import.meta.url),
  ),
);
const demo = JSON.parse(
  fs.readFileSync(new URL("../../web/demo.json", import.meta.url)),
);
test("every motive/callback is an exact prior quote with source type and privacy", () => {
  for (const i of [201, 226, 440, 445, 300, 514]) {
    const s = stateAt(tape, i),
      d = direction(tape, s, true),
      r = d.receipt;
    assert(r);
    assert(r.source < i);
    assert(tape.events[r.source].text.includes(r.text));
    assert.equal(r.kind, tape.events[r.source].type);
    if (r.private) assert.equal(direction(tape, s, false).receipt, null);
    const broken = structuredClone(tape);
    broken.events[r.source].text = "changed";
    assert.equal(direction(broken, s, true).receipt, null);
  }
  assert.equal(
    direction({ ...tape, id: "other" }, stateAt(tape, 201), true).receipt,
    null,
  );
});
test("forged identity is disclosed separately, only in director mode", () => {
  const s = stateAt(tape, 269);
  assert.equal(dialogue(s, true).name, "Eli");
  assert.deepEqual(direction(tape, s, true).forged, {
    signed: "Eli",
    sender: "Dara",
    to: "Cole",
  });
  assert.deepEqual(direction(tape, s, false), {
    receipt: null,
    listener: null,
    forged: null,
    contrast: null,
    pit: false,
  });
});
test("directed cut restores every stage and elimination without private leaks", () => {
  const full = directedList(tape, editList(tape, demo, true), true),
    pub = directedList(tape, editList(tape, demo, false), false);
  for (const e of tape.events.filter((e) =>
    ["death", "stage_start"].includes(e.type),
  ))
    assert(full.includes(e.i), `missing ${e.type}:${e.i}`);
  assert(full.includes(269));
  assert(!pub.includes(269));
  assert(
    !pub.some((i) => ["thought", "whisper"].includes(tape.events[i].type)),
  );
  assert.equal(new Set(full).size, full.length);
  assert.deepEqual(
    full,
    [...full].sort((a, b) => a - b),
  );
});
test("receipts have their own reading time after the public line", () => {
  const s = stateAt(tape, 440),
    d = direction(tape, s, true);
  assert.equal(
    filmDuration(s, true, d),
    filmDuration(s, true) + readingTime(d.receipt.text),
  );
  const forged = stateAt(tape, 269);
  assert.equal(
    filmDuration(forged, true, direction(tape, forged, true)),
    filmDuration(forged, true) + 3800,
  );
});
test("contact arrives before recoil; reduced motion is settled and finite", () => {
  for (let t = 0; t < 0.85; t += 0.01) assert.equal(contactBeat(t).recoil, 0);
  assert.equal(contactBeat(0.85).approach, 1);
  assert(contactBeat(1).recoil > 0);
  for (const n of Object.values(contactBeat(3))) assert(Math.abs(n) < 1e-12);
  assert.deepEqual(contactBeat(1, true), { approach: 0, recoil: 0, strike: 0 });
  for (let t = 0; t < 4; t += 0.01)
    for (const n of Object.values(contactBeat(t))) assert(n >= 0 && n <= 1);
  assert.equal(deathProgress("flatten", 1.15), 1);
  assert.equal(deathProgress("tumble", 0), 0);
  assert.equal(deathProgress("tumble", 2.8), 1);
});
test("consequence names and survivor counts come from current recorded death only", () => {
  assert.equal(consequence(stateAt(tape, 515)), null);
  assert.deepEqual(consequence(stateAt(tape, 516)), {
    name: "Dara",
    title: "DARA TAKES THIRD",
    detail: "2 contestants remain",
  });
});

test("added story indices use the same public visibility gate as the original cut", () => {
  const changed = structuredClone(tape);
  changed.events[327] = {
    ...changed.events[327],
    type: "thought",
    name: "Hana",
    text: "secret",
  };
  const list = directedList(changed, editList(changed, demo, false), false);
  assert(!list.includes(327));
});


test("early placements do not claim a podium finish", () => {
  const s = stateAt(tape, 516);
  for (const place of [1, 4, 5, 6, 7, 8, null]) {
    assert.equal(consequence({...s, ev: {...s.ev, place}}).title, "DARA IS OUT");
  }
});
