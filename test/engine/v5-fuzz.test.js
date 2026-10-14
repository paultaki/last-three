import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runGame } from '../../src/engine.js';
import { createScriptedAgents, BOT_KINDS } from '../../src/scripted.js';
import { validateTape } from '../../src/tape.js';
import { computeStats } from '../../src/stats.js';
import { makeRng } from '../../src/rng.js';

test('v5 fuzz: 300 seeded games with mixed, uniform and broken bots preserve lifecycle and tape invariants', async () => {
  const rng = makeRng(5001);
  const seen = { rope: 0, drownedAnchor: 0, guideLie: 0, vote: 0, runoff: 0, pitFloor: 0, broken: 0 };
  for (let seed = 1; seed <= 300; seed++) {
    const mix = seed % 10 === 0 ? BOT_KINDS[(seed / 10) % BOT_KINDS.length] : Array.from({ length: 8 }, () => rng.pick(BOT_KINDS));
    const t = await runGame({ seed, agents: createScriptedAgents(seed, mix) });
    try { validateTape(t); } catch (err) { throw new Error(`seed ${seed}, ${JSON.stringify(mix)}: ${err.message}`); }
    assert.equal(t.result.places.filter(p => p.place).length, 3);
    const models = computeStats([t]).models;
    seen.rope += models.reduce((n, m) => n + m.ropeThrows, 0);
    seen.drownedAnchor += models.reduce((n, m) => n + m.anchorDrownings, 0);
    seen.guideLie += models.reduce((n, m) => n + m.guideLies, 0);
    seen.vote += t.events.filter(e => e.type === 'vote_result').length;
    seen.runoff += t.events.filter(e => e.type === 'vote_reveal' && e.ballot === 2).length;
    seen.pitFloor += t.events.filter(e => e.type === 'lucky_save' && e.stage === 'pit').length;
    seen.broken += t.events.filter(e => e.type === 'action' && !e.valid).length;
    assert.ok(t.events.filter(e => e.type === 'stage_end').every(e => e.survivors.length >= 3));
  }
  for (const [kind, count] of Object.entries(seen)) assert.ok(count > 0, `never exercised ${kind}`);
});
