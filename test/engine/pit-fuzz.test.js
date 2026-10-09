import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runGame } from '../../src/engine.js';
import { createScriptedAgents } from '../../src/scripted.js';
import { SEATS } from './helpers.js';
import { GAMES, chalkFor, checkTape } from './fuzz-helpers.js';

const KINDS = ['random', 'saint', 'coward', 'liar', 'shover'];

test(`pit fuzz: ${GAMES} mixed-bot games keep every invariant, at least 100 reach the pit, and every pit outcome shows up`, async () => {
  const seen = { pit: 0, volunteer: 0, pushed: 0, rescue: 0, flood: 0, floor: 0, feather: 0, early: 0 };
  for (let seed = 1; seed <= GAMES; seed++) {
    const mix = SEATS.map((_, i) => KINDS[(seed * 7 + i * 3) % KINDS.length]);
    const chalk = chalkFor(seed);
    const tape = await runGame({ seed, agents: createScriptedAgents(seed, mix), config: { chalk } });
    checkTape(tape, `seed ${seed} ${JSON.stringify(mix)}`, { chalk });
    const pit = tape.events.filter((e) => e.stage === 'pit');
    if (!pit.length) continue;
    seen.pit += 1;
    const reveals = pit.filter((e) => e.type === 'reveal' && e.what === 'pit');
    let before = null;
    for (const r of reveals) {
      if (r.data.base && !before) {
        const offered = pit.some((e) => e.type === 'action' && e.valid && e.round === r.round && e.action === 'offer_back');
        seen[offered ? 'volunteer' : 'pushed'] += 1;
      }
      before = r.data.base;
    }
    if (reveals.some((r) => r.data.rescued)) seen.rescue += 1;
    if (pit.some((e) => e.type === 'death')) seen.flood += 1;
    if (pit.some((e) => e.type === 'lucky_save')) seen.floor += 1;
    if (pit.some((e) => e.type === 'ability_use' && e.power === 'feather')) seen.feather += 1;
    if (pit.filter((e) => e.type === 'round_start').length < 5 && !pit.some((e) => e.type === 'death')) seen.early += 1;
  }
  assert.ok(seen.pit >= 100, `only ${seen.pit} games reached the pit`);
  for (const outcome of ['volunteer', 'pushed', 'rescue', 'flood', 'floor', 'feather', 'early']) {
    assert.ok(seen[outcome] > 0, `no game produced the pit outcome "${outcome}": ${JSON.stringify(seen)}`);
  }
});
