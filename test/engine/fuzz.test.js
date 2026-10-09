import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runGame } from '../../src/engine.js';
import { makeRng } from '../../src/rng.js';
import { createScriptedAgents } from '../../src/scripted.js';
import { GAMES, chalkFor, checkTape, mixFor } from './fuzz-helpers.js';

test(`fuzz: ${GAMES} games over seeds and random bot mixes (some include broken agents) keep every invariant`, async () => {
  const started = Date.now();
  const pick = makeRng(20261008);
  for (let seed = 1; seed <= GAMES; seed++) {
    const kinds = mixFor(seed, pick);
    const label = `seed ${seed} ${JSON.stringify(kinds)}`;
    const chalk = chalkFor(seed);
    const tape = await runGame({ seed, agents: createScriptedAgents(seed, kinds), config: { chalk } });
    checkTape(tape, label, { chalk });
  }
  const seconds = (Date.now() - started) / 1000;
  assert.ok(seconds < 20, `fuzz took ${seconds}s`);
});
