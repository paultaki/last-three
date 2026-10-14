import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { stateAt } from "../../web/show/src/model.js";
import { dialogue } from "../../web/show/src/film.js";
import { direction } from "../../web/show/src/direction.js";
import { episode, setEpisode } from "../../web/show/src/line-override.js";
import { SHOTS, TAPE } from "../../web/show/tools/episode/episode.mjs";

const tape = JSON.parse(
  fs.readFileSync(new URL(`../../web/tapes/${TAPE}.json`, import.meta.url)),
);

test("without an episode the recorded line and receipts are shown", () => {
  assert.equal(episode.active, false);
  const s = stateAt(tape, 226);
  assert.equal(dialogue(s, true).text, tape.events[226].text);
  assert(direction(tape, s, true).receipt);
});

test("an episode swaps the bubble text and drops recorded-excerpt cards", () => {
  setEpisode({ lines: { 226: "Three for three!" } });
  const s = stateAt(tape, 226);
  const d = dialogue(s, true);
  assert.equal(d.text, "Three for three!");
  assert.equal(d.name, "Eli");
  assert.equal(direction(tape, s, true).receipt, null);
  // Untouched events keep their recorded words.
  assert.equal(dialogue(stateAt(tape, 290), true).text, tape.events[290].text);
});

test("every episode bubble sits on a dialogue event of the feature tape", () => {
  for (const shot of SHOTS.filter((s) => s.bubble)) {
    const e = tape.events[shot.i];
    assert(
      ["say", "thought", "whisper", "chalk_write"].includes(e?.type),
      `${shot.id} points at ${e?.type}`,
    );
    if (shot.say && shot.say[0] !== "N" && !e.forgedAs)
      assert.equal(shot.say[0], e.name ?? e.from, `${shot.id} speaker`);
  }
});
