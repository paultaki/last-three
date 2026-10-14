import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { stateAt, chapters, timeline } from '../../web/lib/state.js';

const tape = JSON.parse(fs.readFileSync(new URL('../../web/tapes/sample-v6.json', import.meta.url)));
const at = (type, what) => tape.events.findIndex(e => e.type === type && (!what || e.what === what));

test('every v6 room is a chapter', () => {
  assert.deepEqual(chapters(tape).map(c => c.id), ['start', 'lever', 'cups', 'jackets', 'bomb', 'vault', 'results']);
});

test('the cups follow swaps and keep the poison secret until the reveal', () => {
  const before = stateAt(tape, at('reveal', 'cups') - 1);
  const reveal = tape.events[at('reveal', 'cups')].data;
  assert.equal(before.cups.poisonPublic, false);
  const holder = Object.keys(before.cups.cupOf).find(n => before.cups.cupOf[n] === reveal.poisoned);
  assert.equal(holder, reveal.victim);
  assert.equal(stateAt(tape, at('reveal', 'cups')).cups.poisonPublic, true);
});

test('jackets, bomb and vault state match their reveals', () => {
  const lastNight = tape.events.filter(e => e.type === 'reveal' && e.what === 'jackets').at(-1);
  assert.equal(stateAt(tape, lastNight.i).jackets.without, lastNight.data.without);
  const boom = tape.events[at('reveal', 'bomb') >= 0 ? tape.events.findLastIndex(e => e.type === 'reveal' && e.what === 'bomb') : -1];
  assert.equal(stateAt(tape, boom.i).bomb.holder, boom.data.exploded);
  const vault = tape.events[at('reveal', 'vault')];
  assert.deepEqual(stateAt(tape, vault.i).vault.choices, vault.data.choices);
});

test('captions never show a hidden v6 move publicly', () => {
  for (const line of timeline(tape)) {
    const e = tape.events[line.i];
    if (e.type === 'cup_poured' || (e.type === 'action' && ['guard', 'steal', 'split'].includes(String(e.action).split(':')[0])))
      assert.equal(line.pub, null, `event ${line.i}`);
  }
  const end = timeline(tape).at(-1);
  assert.match(end.pub, /are the last three/);
});
