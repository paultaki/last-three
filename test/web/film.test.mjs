import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  passages,
  dialogue,
  pageAt,
  readingTime,
  filmDuration,
  editList,
  filmShot,
} from "../../web/show/src/film.js";
import { stateAt, presentation } from "../../web/show/src/model.js";
const tape = JSON.parse(
  fs.readFileSync(
    new URL("../../web/tapes/20261009-0025.json", import.meta.url),
  ),
);
const demo = JSON.parse(
  fs.readFileSync(new URL("../../web/demo.json", import.meta.url)),
);
test("film pages retain all recorded words and do not strand tiny endings", () => {
  for (const e of tape.events.filter((e) => e.text)) {
    const pages = passages(e.text);
    assert.equal(pages.join(""), e.text);
    assert(pages.every((p) => p.length <= 150));
    if (pages.length > 1) assert(pages.at(-1).trim().length >= 45);
  }
});
test("film never represents hidden thoughts as speech or reveals forged identity", () => {
  const s = stateAt(tape, 200);
  assert.equal(dialogue(s, false), null);
  assert.equal(dialogue(s, true).label, "PRIVATE THOUGHT");
  const w = stateAt(tape, 509);
  assert.equal(dialogue(w, false), null);
  assert.equal(dialogue(w, true).label, "WHISPER TO Hana");
  const forged = {
    ...s,
    ev: { type: "say", name: "Dara", forgedAs: "Hana", text: "Hello" },
  };
  assert.equal(dialogue(forged, false).name, "Hana");
});
test("speech gets complete reading time and stable page boundaries", () => {
  const s = stateAt(tape, 200),
    d = dialogue(s, true);
  assert.equal(pageAt(d, 0), 0);
  assert.equal(pageAt(d, readingTime(d.pages[0])), 1);
  assert.equal(pageAt(d, filmDuration(s, true)), d.pages.length - 1);
  assert.equal(
    filmDuration(s, true),
    d.pages.reduce((n, p) => n + readingTime(p), 0) + 600,
  );
});
test("story cut is bounded to the selected tape and event ranges", () => {
  assert.deepEqual(editList({ ...tape, id: "another" }, demo, true), []);
  const full = editList(tape, demo, true),
    pub = editList(tape, demo, false);
  assert.equal(full[0], 0);
  assert.equal(full.at(-1), 541);
  assert(!pub.includes(200));
  assert(full.includes(200));
  assert.equal(new Set(full).size, full.length);
  assert(
    full.every((i) => demo.segments.some((s) => i >= s.from && i <= s.to)),
  );
  for (const i of full) {
    const s = stateAt(tape, i),
      v = presentation(s, stateAt(tape, i - 1), true);
    const shot = filmShot(v, s, true, 0.5);
    if (shot) assert([...shot.eye, ...shot.target].every(Number.isFinite));
  }
});
