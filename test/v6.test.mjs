import test from 'node:test';
import assert from 'node:assert/strict';
import { runGame } from '../src/engine-v6.js';
import { createScriptedAgents } from '../src/scripted.js';
import { validateTape } from '../src/tape.js';
import { V6_ROTATIONS } from '../bin/batch.js';

const KINDS = ['random', 'saint', 'coward', 'liar', 'shover', 'random', 'liar', 'shover'];
const play = (seed, order) => runGame({ seed, agents: createScriptedAgents(seed, KINDS), config: { order } });

test('v6 games always end with exactly three survivors and validate', async () => {
  for (let seed = 1; seed <= 24; seed++) {
    const tape = await play(seed, V6_ROTATIONS[seed % V6_ROTATIONS.length]);
    assert.equal(tape.rulesVersion, 6);
    assert.equal(tape.result.survivors.length, 3);
    assert.equal(tape.result.deaths.length, 5);
    validateTape(tape);
  }
});

test('v6 is deterministic for a seed and order', async () => {
  const a = await play(7, V6_ROTATIONS[1]);
  const b = await play(7, V6_ROTATIONS[1]);
  assert.deepEqual(a.events, b.events);
});

test('v6 has no jury, votes or powers', async () => {
  const tape = await play(3);
  const types = new Set(tape.events.map(e => e.type));
  for (const banned of ['jury_box_enter', 'jury_ballot', 'vote_reveal', 'ability_use']) assert(!types.has(banned), banned);
});

test('every v6 room that runs with more than three alive kills someone', async () => {
  for (let seed = 1; seed <= 12; seed++) {
    const tape = await play(seed, V6_ROTATIONS[seed % V6_ROTATIONS.length]);
    let alive = 8, stage = null, before = 8;
    for (const e of tape.events) {
      if (e.type === 'stage_start') { stage = e.stage; before = alive; }
      if (e.type === 'death') alive--;
      if (e.type === 'stage_end' && ['lever', 'cups', 'jackets', 'bomb'].includes(stage) && before > 3)
        assert(alive < before, `seed ${seed}: ${stage} killed nobody`);
    }
  }
});

test('the lever holder always dies and pushers carry the grudge', async () => {
  const tape = await play(2, ['lever', 'cups', 'jackets', 'bomb', 'vault', 'bridge']);
  const reveal = tape.events.find(e => e.type === 'reveal' && e.data?.what === undefined && e.what === 'lever' && e.data.holder);
  const death = tape.events.find(e => e.type === 'death' && e.stage === 'lever');
  assert.equal(death.name, reveal.data.holder);
  for (const pusher of reveal.data.volunteers.length ? [] : reveal.data.pushes[reveal.data.holder])
    assert(tape.result.grudges.some(x => x.by === pusher && x.victim === death.name && x.how === 'push_lever'));
});

test('poison cup secrets stay private and the victim holds the poison', async () => {
  const tape = await play(4, ['cups', 'lever', 'jackets', 'bomb', 'vault', 'bridge']);
  const poured = tape.events.find(e => e.type === 'cup_poured');
  assert.equal(poured.visibility, 'private');
  const reveal = tape.events.find(e => e.type === 'reveal' && e.what === 'cups');
  assert.equal(tape.events.find(e => e.type === 'death' && e.stage === 'cups').name, reveal.data.victim);
});
