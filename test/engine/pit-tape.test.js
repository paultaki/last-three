// Tapes with a pit: validateTape accepts them and rejects the mutations that would make them lie.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runGame, SEATS } from '../../src/engine.js';
import { createScriptedAgents } from '../../src/scripted.js';
import { validateTape } from '../../src/tape.js';

const KINDS = ['random', 'saint', 'coward', 'liar', 'shover'];

async function findTape(wanted) {
  for (let seed = 1; seed <= 300; seed++) {
    const mix = SEATS.map((_, i) => KINDS[(seed * 7 + i * 3) % KINDS.length]);
    const tape = await runGame({ seed, agents: createScriptedAgents(seed, mix) });
    if (wanted(tape)) return tape;
  }
  throw new Error('no fuzz tape matched');
}

const pitDeaths = (t) => t.events.filter((e) => e.type === 'death' && e.stage === 'pit');
const tape = await findTape((t) => pitDeaths(t).length > 0 && t.events.some((e) => e.type === 'reveal' && e.what === 'rope'));

const rejects = (mutate, pattern) => {
  const copy = JSON.parse(JSON.stringify(tape));
  mutate(copy);
  assert.throws(() => validateTape(copy), pattern);
};

test('a tape with pit deaths, a rope and pit reveals validates', () => {
  validateTape(tape);
  assert.equal(tape.rulesVersion, 3);
  assert.ok(tape.events.some((e) => e.stage === 'pit' && e.type === 'reveal' && e.what === 'pit'));
  assert.ok(tape.result.deaths.some((d) => d.stage === 'pit' && d.cause === 'pit' && d.style === 'sink'));
});

test('a pit death with the wrong cause or style is rejected, so is a pit cause on another stage', () => {
  rejects((t) => { pitDeaths(t)[0].cause = 'crusher'; t.result.deaths.find((d) => d.stage === 'pit').cause = 'crusher'; }, /pit death must have cause pit and style sink/);
  rejects((t) => { pitDeaths(t)[0].style = 'tumble'; t.result.deaths.find((d) => d.stage === 'pit').style = 'tumble'; }, /cause pit and style sink/);
  rejects((t) => { const d = t.events.find((e) => e.type === 'death' && e.stage !== 'pit'); d.cause = 'pit'; d.style = 'sink'; }, /death must have cause/);
  rejects((t) => { pitDeaths(t)[0].cause = 'flood'; }, /unknown cause/);
});

test('a pit death cannot carry a place, and ledge-only places stay ledge-only', () => {
  rejects((t) => { pitDeaths(t)[0].place = 3; }, /only ledge deaths carry a place/);
});

test('the pit must start with more than three alive and leave at least three', () => {
  rejects((t) => { t.events.find((e) => e.type === 'stage_start' && e.stage === 'pit').alive.length = 3; }, /pit only runs with more than 3/);
  rejects((t) => {
    const end = t.events.find((e) => e.type === 'stage_end' && e.stage === 'pit');
    end.survivors = end.survivors.slice(0, 2);
  }, /(must leave at least 3|does not match who is alive)/);
});

test('reveals must be a known kind and any pit name must be a player', () => {
  rejects((t) => { t.events.find((e) => e.type === 'reveal' && e.what === 'pit').what = 'flood'; }, /unknown reveal/);
  rejects((t) => { t.events.find((e) => e.type === 'reveal' && e.what === 'pit').data.down.push('Zed'); }, /unknown player: Zed/);
  rejects((t) => { t.events.find((e) => e.type === 'reveal' && e.what === 'rope').data.by = 'Zed'; }, /unknown player: Zed/);
  rejects((t) => { t.events.find((e) => e.type === 'reveal' && e.what === 'pit').stage = 'sewer'; }, /bad stage/);
});

test('result.places can name pit as the stage a player died in, and only that', () => {
  const dead = pitDeaths(tape)[0].name;
  assert.equal(tape.result.places.find((p) => p.name === dead).diedAt, 'pit');
  rejects((t) => {
    t.result.places.find((p) => p.name === dead).diedAt = 'disc';
    t.events.at(-1).places.find((p) => p.name === dead).diedAt = 'disc';
  }, /diedAt differs from death stage/);
});
