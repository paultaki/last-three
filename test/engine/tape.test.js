import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runGame } from '../../src/engine.js';
import { createScriptedAgents } from '../../src/scripted.js';
import { validateTape } from '../../src/tape.js';

const base = await runGame({ seed: 3, agents: createScriptedAgents(3, ['saint', 'liar', 'coward', 'shover', 'random', 'random', 'saint', 'liar']) });
const clone = () => structuredClone(base);
const rejects = (mutate, pattern) => {
  const tape = clone();
  mutate(tape);
  assert.throws(() => validateTape(tape), pattern);
};
const firstOf = (tape, type) => tape.events.findIndex((e) => e.type === type);
const deathOfStage = (tape, stage) => tape.events.find((e) => e.type === 'death' && e.stage === stage);

test('a real engine tape validates, and so does its JSON round trip', () => {
  validateTape(base);
  validateTape(JSON.parse(JSON.stringify(base)));
});

test('header problems are rejected', () => {
  rejects((t) => { t.version = 2; }, /Bad version/);
  rejects((t) => { delete t.id; }, /id/);
  rejects((t) => { t.seed = 1.5; }, /Seed/);
  rejects((t) => { t.createdAt = ''; }, /createdAt/);
  rejects((t) => { t.players.pop(); }, /exactly 8 players/);
  rejects((t) => { t.players[1].power = t.players[0].power; }, /Duplicate power/);
  rejects((t) => { t.players[1].power = 'telepathy'; }, /Unknown power/);
  rejects((t) => { t.players[1].name = t.players[0].name; }, /Duplicate player name/);
});

test('event problems are rejected: indices, types, stage/round keys, names, required fields', () => {
  rejects((t) => { t.events[5].i = t.events[4].i; }, /not strictly increasing/);
  rejects((t) => { t.events[2].type = 'explosion'; }, /unknown type/);
  rejects((t) => { delete t.events[3].stage; }, /stage and round keys/);
  rejects((t) => { delete t.events[3].round; }, /stage and round keys/);
  rejects((t) => { t.events[firstOf(t, 'say')].name = 'Zed'; }, /unknown player/);
  rejects((t) => { delete t.events[firstOf(t, 'action')].action; }, /missing action/);
  rejects((t) => { t.events[firstOf(t, 'round_start')].round = null; }, /needs a round/);
  rejects((t) => { t.events[firstOf(t, 'stage_start')].stage = 'swamp'; }, /bad stage/);
  rejects((t) => { t.events.pop(); }, /Last event must be game_end/);
  rejects((t) => { t.events.shift(); }, /First event must be game_start/);
});

test('death problems are rejected: no stage, unknown cause or style, double death, place on a non-ledge death', () => {
  rejects((t) => { deathOfStage(t, 'bridge').stage = null; }, /needs a stage/);
  rejects((t) => { deathOfStage(t, 'bridge').cause = 'boredom'; }, /unknown cause/);
  rejects((t) => { deathOfStage(t, 'bridge').style = 'poof'; }, /unknown style/);
  rejects((t) => { deathOfStage(t, 'bridge').place = 2; }, /only ledge deaths carry a place/);
  rejects((t) => {
    const d = t.events.find((e) => e.type === 'death');
    t.events.splice(t.events.indexOf(d) + 1, 0, { ...d, i: d.i + 0.5 });
  }, /missing or invalid i|dies twice/);
});

test('a dead agent may not act, speak or be lucky-saved afterwards', () => {
  rejects((t) => {
    const d = t.events.find((e) => e.type === 'death');
    const at = t.events.indexOf(d) + 1;
    t.events.splice(at, 0, { i: 0, type: 'say', stage: d.stage, round: d.round, name: d.name, text: 'ghost' });
    t.events.forEach((e, k) => { e.i = k; });
  }, /acts after dying/);
  rejects((t) => {
    const d = t.events.find((e) => e.type === 'death');
    t.events.splice(t.events.indexOf(d) + 1, 0, { i: 0, type: 'lucky_save', stage: d.stage, round: d.round, name: d.name, why: 'x' });
    t.events.forEach((e, k) => { e.i = k; });
  }, /lucky_save for dead agent/);
});

/** Rewrite places everywhere they are recorded: result, game_end and ledge death events. */
function setPlaces(tape, assignment) {
  const fix = (entry) => {
    if (!(entry.name in assignment)) return;
    const place = assignment[entry.name];
    entry.place = place;
    if (place === null) entry.diedAt = deathStage(tape, entry.name);
    else delete entry.diedAt;
  };
  tape.result.places.forEach(fix);
  tape.events.at(-1).places.forEach(fix);
  for (const e of tape.events.filter((x) => x.type === 'death' && x.name in assignment && x.stage === 'ledge')) {
    if (assignment[e.name] === null) delete e.place;
    else e.place = assignment[e.name];
  }
}
const deathStage = (tape, name) => tape.events.find((e) => e.type === 'death' && e.name === name)?.stage;
const byPlace = (tape, place) => tape.result.places.find((p) => p.place === place).name;

test('the sample tape has three places on the ledge', () => {
  assert.deepEqual(base.result.places.filter((p) => p.place).map((p) => p.place).sort(), [1, 2, 3]);
});

test('places must be contiguous from 1, unique, within 1-3', () => {
  const [p2, p3] = [byPlace(base, 2), byPlace(base, 3)];
  rejects((t) => setPlaces(t, { [p2]: null }), /Places must be contiguous from 1, got 1,3/);
  rejects((t) => setPlaces(t, { [p3]: 2 }), /Duplicate place assignment: 2/);
  rejects((t) => setPlaces(t, { [p3]: 4 }), /Place must be 1-3 or null, got 4/);
  rejects((t) => { t.result.places.pop(); }, /Every player must appear/);
  rejects((t) => { t.result.places[1].name = t.result.places[0].name; }, /listed twice/);
});

test('game_end and result.deaths must agree with the rest of the tape', () => {
  rejects((t) => { t.events.at(-1).places.find((p) => p.place === null).diedAt = 'crusher'; }, /game_end places differ/);
  rejects((t) => { t.result.deaths.pop(); }, /result.deaths does not match/);
  rejects((t) => { t.result.deaths[0].cause = 'ledge'; }, /result.deaths does not match/);
});

test('an agent that died before the ledge cannot hold a place', () => {
  const early = base.result.places.find((p) => p.diedAt === 'bridge').name;
  rejects((t) => setPlaces(t, { [early]: 3, [byPlace(t, 3)]: null }), new RegExp(`Agent ${early} died before ledge but has place 3`));
});

test('exactly one agent survives and takes 1st', () => {
  rejects((t) => {
    const i = t.events.findIndex((e) => e.type === 'death' && e.stage === 'bridge');
    const [removed] = t.events.splice(i, 1);
    t.result.deaths = t.result.deaths.filter((d) => d.name !== removed.name);
    t.result.places.find((p) => p.name === removed.name).diedAt = 'bridge';
    t.events.forEach((e, k) => { e.i = k; });
    t.events.at(-1).places = structuredClone(t.result.places);
  }, /Exactly one agent must survive, found 2/);
});
