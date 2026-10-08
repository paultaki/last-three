import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runGame } from '../../src/engine.js';
import { POWER_IDS } from '../../src/powers.js';
import { makeRng } from '../../src/rng.js';
import { BOT_KINDS, createScriptedAgents } from '../../src/scripted.js';
import { validateTape } from '../../src/tape.js';
import { SEATS } from './helpers.js';

const GAMES = 300;
const DEATH_STYLE = { bridge: ['glass', 'shatter'], crusher: ['crusher', 'flatten'], disc: ['trapdoor', 'chute'], ledge: ['ledge', 'tumble'] };
const STAGE_ORDER = ['bridge', 'crusher', 'disc', 'ledge'];

/** Seeded mixes so any failure reproduces: some games are uniform, some mixed, some include `broken`. */
function mixFor(seed, rng) {
  if (seed % 10 === 0) return BOT_KINDS[(seed / 10) % BOT_KINDS.length];
  return SEATS.map(() => BOT_KINDS[rng.int(seed % 3 === 0 ? BOT_KINDS.length : BOT_KINDS.length - 1)]);
}

function checkRoundOrdering(tape, label) {
  const seat = (name) => SEATS.indexOf(name);
  let round = [];
  const flush = () => {
    const talk = round.filter((e) => ['thought', 'say', 'whisper'].includes(e.type));
    const acts = round.filter((e) => e.type === 'action' && !e.auto);
    const firstAction = round.findIndex((e) => e.type === 'action');
    const lastTalk = round.map((e) => ['thought', 'say', 'whisper'].includes(e.type)).lastIndexOf(true);
    if (firstAction !== -1) assert.ok(lastTalk < firstAction, `${label}: speech after an action in one round`);
    for (const type of ['thought', 'say']) {
      const who = talk.filter((e) => e.type === type && !e.forgedAs).map((e) => seat(e.name));
      assert.deepEqual(who, [...who].sort((a, b) => a - b), `${label}: ${type} not in seat order`);
    }
    const doers = acts.map((e) => seat(e.name));
    assert.deepEqual(doers, [...doers].sort((a, b) => a - b), `${label}: actions not in seat order`);
    round = [];
  };
  for (const e of tape.events) {
    if (e.type === 'round_start') flush();
    round.push(e);
  }
  flush();
}

function checkTape(tape, label) {
  validateTape(tape);

  // events: strictly increasing indices, stage/round keys everywhere
  tape.events.forEach((e, k) => {
    assert.equal(e.i, k, `${label}: event index`);
    assert.ok('stage' in e && 'round' in e, `${label}: event ${k} (${e.type}) lacks stage/round`);
  });

  // powers assigned exactly once
  assert.deepEqual(tape.players.map((p) => p.power).sort(), [...POWER_IDS].sort(), `${label}: powers`);

  // deaths carry stage/cause/style consistently
  const deaths = tape.events.filter((e) => e.type === 'death');
  for (const d of deaths) {
    assert.deepEqual([d.cause, d.style], DEATH_STYLE[d.stage], `${label}: death ${d.name}`);
    if (d.stage !== 'ledge') assert.equal(d.place, undefined, `${label}: only ledge deaths carry a place`);
  }

  // nobody speaks, thinks, whispers or acts after their own death
  const diedAt = new Map(deaths.map((d) => [d.name, d.i]));
  for (const e of tape.events) {
    const who = e.type === 'whisper' ? e.from : e.name;
    if (['thought', 'say', 'whisper', 'action', 'ability_use'].includes(e.type) && diedAt.has(who)) {
      assert.ok(e.i < diedAt.get(who), `${label}: ${who} emitted ${e.type} after dying`);
    }
  }

  // places: at most 3, unique, within 1..3, only ledge reachers or a lone survivor
  const placed = tape.result.places.filter((p) => p.place !== null);
  assert.ok(placed.length >= 1 && placed.length <= 3, `${label}: ${placed.length} places`);
  assert.equal(new Set(placed.map((p) => p.place)).size, placed.length);
  assert.ok(placed.every((p) => p.place >= 1 && p.place <= 3));
  const stages = tape.events.filter((e) => e.type === 'stage_start').map((e) => e.stage);
  const ledgeDead = new Set(deaths.filter((d) => d.stage === 'ledge').map((d) => d.name));
  const survivors = SEATS.filter((s) => !diedAt.has(s));
  assert.equal(survivors.length, 1, `${label}: exactly one survivor`);
  for (const p of placed) {
    assert.ok(ledgeDead.has(p.name) || (p.name === survivors[0] && p.place === 1), `${label}: ${p.name} should not have place ${p.place}`);
  }
  if (!stages.includes('ledge')) assert.equal(placed.length, 1, `${label}: lone survivor only`);
  for (const p of tape.result.places.filter((x) => x.place === null)) assert.ok(STAGE_ORDER.includes(p.diedAt));

  // stages run in order and respect their preconditions
  assert.deepEqual(stages, STAGE_ORDER.filter((s) => stages.includes(s)));
  for (const e of tape.events.filter((x) => x.type === 'stage_start')) {
    if (e.stage === 'crusher' || e.stage === 'disc') assert.ok(e.alive.length > 3, `${label}: ${e.stage} with ${e.alive.length}`);
    if (e.stage === 'ledge') assert.ok(e.alive.length >= 2);
  }
  assert.ok(tape.events.filter((e) => e.type === 'lucky_save').every((e) => !diedAt.has(e.name) || e.i < diedAt.get(e.name)));

  // within each round: thought/say/whisper first, in seat order, then actions in seat order
  checkRoundOrdering(tape, label);

  // JSON round trip
  assert.deepEqual(JSON.parse(JSON.stringify(tape)), tape, `${label}: not JSON round-trippable`);
}

test(`fuzz: ${GAMES} games over seeds and random bot mixes (some include broken agents) keep every invariant`, async () => {
  const started = Date.now();
  const pick = makeRng(20261008);
  for (let seed = 1; seed <= GAMES; seed++) {
    const kinds = mixFor(seed, pick);
    const label = `seed ${seed} ${JSON.stringify(kinds)}`;
    const tape = await runGame({ seed, agents: createScriptedAgents(seed, kinds) });
    checkTape(tape, label);
  }
  const seconds = (Date.now() - started) / 1000;
  assert.ok(seconds < 20, `fuzz took ${seconds}s`);
});
