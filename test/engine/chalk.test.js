// Rules v4: the chalk wall. Notes from earlier winners go in (config.chalk), the top three of this game
// may write one note each in an epilogue stage after the last obstacle, and the tape records both.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runGame, RULES_VERSION } from '../../src/engine.js';
import { runLedge } from '../../src/stages/ledge.js';
import { runChalk } from '../../src/stages/chalk.js';
import { CHALK_NOTE_LIMIT, ROPE_COST_FOOTING, chalkRules, commonText, sanitizeChalkNotes, sanitizeChalkText } from '../../src/rules.js';
import { createScriptedAgents } from '../../src/scripted.js';
import { validateTape } from '../../src/tape.js';
import { SEATS, fixedAgents, footingReveals, idle, ledgeGame, makeGame, makeOracle, ofType, powersWith, reply, spy } from './helpers.js';

const WALL_SENTENCE = 'On the waiting-room wall are messages scratched in chalk by earlier contestants who finished in the top three. Nobody can verify them: they may be honest, mistaken, or lies.';
const NOTES = [
  { text: 'Volunteer early on the bridge.', byPlace: 1 },
  { text: 'Never hold the lever.', byPlace: 3 },
];
const POWER_WORDS = /\b(glass_eye|wedge|feather|anchor|forger|map)\b/i;
const copy = (value) => JSON.parse(JSON.stringify(value));
const opposite = (side) => (side === 'L' ? 'R' : 'L');
const inChalk = (tape, type) => tape.events.filter((e) => e.stage === 'chalk' && (!type || e.type === type));

/** A full scripted game; the same seed and mix always give the same tape. */
const scripted = (seed, config = {}, kinds = ['random', 'saint', 'coward', 'liar', 'shover', 'random', 'saint', 'shover']) =>
  runGame({ seed, agents: createScriptedAgents(seed, kinds), config });

/** The epilogue on its own: Ash is the winner, Bex and Cole fell in 2nd and 3rd, everyone else is out. */
function epilogueGame({ agents, places = { Ash: 1, Bex: 2, Cole: 3 }, powers = {}, config = {} }) {
  const g = makeGame({ agents, powers, config, dead: SEATS.filter((n) => n !== 'Ash') });
  for (const [name, place] of Object.entries(places)) g.places.set(name, place);
  return g;
}
const writer = (text) => () => reply('write', { say: text });

// ---- sanitising ----------------------------------------------------------------------------

test('sanitising: control characters and newlines are cleaned, whitespace collapses, text is trimmed', () => {
  assert.equal(sanitizeChalkText('  Go\u0000 left\n\nalways\t\tleft \r\n'), 'Go left always left');
  assert.equal(sanitizeChalkText('a\u0007b\u007fc\u009fd'), 'abcd');
  assert.equal(sanitizeChalkText('line one line two'), 'line one line two');
  assert.equal(sanitizeChalkText('‮evil​ text﻿'), 'evil text', 'bidi and zero-width marks are dropped');
  assert.equal(sanitizeChalkText('lone \ud800 surrogate'), 'lone surrogate');
});

test('sanitising: text over the limit is cut to 140 characters and never splits a surrogate pair', () => {
  const cut = sanitizeChalkText('x'.repeat(500));
  assert.equal(cut.length, CHALK_NOTE_LIMIT);
  const emoji = sanitizeChalkText(`${'a'.repeat(139)}\u{1F600}`);
  assert.equal(emoji, 'a'.repeat(139), 'the half emoji is dropped');
  assert.ok(emoji.length <= CHALK_NOTE_LIMIT);
  assert.equal(sanitizeChalkText(`${'a'.repeat(138)} b`), `${'a'.repeat(138)} b`);
  assert.equal(sanitizeChalkText(`${'a'.repeat(139)}   b`), 'a'.repeat(139), 'a trailing gap after the cut is trimmed');
});

test('sanitising: non-strings, empties, bad places and non-array input are dropped; at most three notes survive', () => {
  assert.deepEqual(sanitizeChalkNotes(undefined), []);
  assert.deepEqual(sanitizeChalkNotes('a note'), []);
  assert.deepEqual(sanitizeChalkNotes({ text: 'x', byPlace: 1 }), []);
  const messy = [
    { text: 42, byPlace: 1 },
    null,
    'a string',
    { text: '   \n ', byPlace: 1 },
    { text: 'bad place', byPlace: 4 },
    { text: 'bad place too', byPlace: '2' },
    { text: 'no place' },
    { text: ' first\n', byPlace: 1 },
    { text: 'second', byPlace: 2 },
    { text: 'third', byPlace: 3 },
    { text: 'fourth', byPlace: 1 },
  ];
  assert.deepEqual(sanitizeChalkNotes(messy), [
    { text: 'first', byPlace: 1 },
    { text: 'second', byPlace: 2 },
    { text: 'third', byPlace: 3 },
  ]);
  const hostile = [{ get text() { throw new Error('boom'); }, byPlace: 1 }, { text: 'fine', byPlace: 2 }];
  assert.deepEqual(sanitizeChalkNotes(hostile), [{ text: 'fine', byPlace: 2 }]);
});

test('chalkShown on the tape is the sanitised list, and [] when there is no chalk', async () => {
  const none = await scripted(5);
  assert.deepEqual(none.chalkShown, []);
  assert.deepEqual((await scripted(5, { chalk: [] })).chalkShown, []);
  const dirty = await scripted(5, { chalk: [{ text: 'a\nb\u0000', byPlace: 2 }, { text: 9, byPlace: 1 }, { text: 'x'.repeat(400), byPlace: 3 }, { text: 'c', byPlace: 1 }, { text: 'd', byPlace: 1 }] });
  assert.equal(dirty.chalkShown.length, 3);
  assert.deepEqual(dirty.chalkShown[0], { text: 'a b', byPlace: 2 });
  assert.equal(dirty.chalkShown[1].text.length, CHALK_NOTE_LIMIT);
  assert.deepEqual(dirty.chalkShown[2], { text: 'c', byPlace: 1 });
  validateTape(dirty);
});

// ---- views and the chalk_read event --------------------------------------------------------

test('every view in every stage carries chalkWall; the common intro mentions the wall only when it is non-empty', async () => {
  for (const chalk of [undefined, NOTES]) {
    const views = [];
    const tape = await runGame({ seed: 4, agents: fixedAgents(spy(idle, views)), config: { chalk } });
    assert.ok(views.length > 50);
    const expected = chalk ?? [];
    for (const v of views) {
      assert.deepEqual(v.chalkWall, expected, `${v.you}/${v.stage}`);
      assert.equal(v.common.includes(WALL_SENTENCE), expected.length > 0, `${v.you}/${v.stage}`);
      if (!expected.length) assert.doesNotMatch(v.common, /chalk|wall/i, 'no mention at all without a wall');
    }
    assert.ok(new Set(views.map((v) => v.common)).size === 1, 'the common text is the same for everyone');
    assert.ok(views.some((v) => v.stage === 'chalk') && views.some((v) => v.stage === 'bridge') && views.some((v) => v.stage === 'ledge'));
    validateTape(tape);
  }
  assert.equal(commonText(SEATS), commonText(SEATS, false));
  assert.ok(commonText(SEATS, true).endsWith(WALL_SENTENCE));
});

test('a view cannot be used to change the wall: mutating chalkWall changes nothing for anyone else', async () => {
  const mutating = (view) => {
    view.chalkWall.push({ text: 'forged', byPlace: 1 });
    view.chalkWall[0].text = 'changed';
    return idle(view);
  };
  const clean = await runGame({ seed: 21, agents: fixedAgents(idle), config: { chalk: NOTES } });
  const dirty = await runGame({ seed: 21, agents: fixedAgents(mutating), config: { chalk: NOTES } });
  assert.equal(JSON.stringify(dirty), JSON.stringify(clean));
});

test('chalk_read comes right after game_start with null stage and round, and only when the wall is non-empty', async () => {
  const tape = await scripted(8, { chalk: NOTES });
  assert.equal(tape.events[0].type, 'game_start');
  assert.deepEqual(tape.events[1], { i: 1, type: 'chalk_read', stage: null, round: null, notes: NOTES });
  assert.equal(ofType(tape.events, 'chalk_read').length, 1);
  assert.deepEqual(tape.chalkShown, NOTES);
  const bare = await scripted(8);
  assert.equal(ofType(bare.events, 'chalk_read').length, 0);
  assert.equal(bare.events[1].type !== 'chalk_read', true);
});

// ---- the epilogue --------------------------------------------------------------------------

test('the epilogue asks exactly the placed agents, once, in seat order, after the last obstacle', async () => {
  const views = [];
  const tape = await runGame({ seed: 9, agents: fixedAgents(spy(idle, views)) });
  const placed = tape.result.places.filter((p) => p.place !== null);
  assert.equal(placed.length, 3);
  const chalkViews = views.filter((v) => v.stage === 'chalk');
  assert.deepEqual(chalkViews.map((v) => v.you), SEATS.filter((s) => placed.some((p) => p.name === s)));
  for (const v of chalkViews) {
    assert.equal(v.phase, 'write');
    assert.equal(v.round, 1);
    assert.equal(v.roundsTotal, 1);
    assert.deepEqual(v.legalActions, ['write', 'skip']);
    assert.equal(v.rules, chalkRules(placed.find((p) => p.name === v.you).place));
    assert.deepEqual(v.stageState, { place: placed.find((p) => p.name === v.you).place });
  }
  const start = inChalk(tape, 'stage_start')[0];
  assert.deepEqual(start.alive, chalkViews.map((v) => v.you));
  assert.deepEqual(inChalk(tape, 'stage_end')[0].survivors, start.alive);
  const types = inChalk(tape).map((e) => e.type);
  assert.deepEqual(types.slice(0, 2), ['stage_start', 'round_start']);
  assert.equal(types.at(-1), 'stage_end');
  assert.equal(tape.events.at(-1).type, 'game_end');
  assert.equal(tape.events.at(-2), inChalk(tape, 'stage_end')[0]);
  validateTape(tape);
});

test('the rules text is exactly the spec words with the place filled in, and names no power', () => {
  assert.equal(
    chalkRules(2),
    'The game is over and you finished in place 2. You may scratch ONE message (at most 140 characters) on the chalk wall for future contestants. You will never meet them and nothing you write changes your result. Put the message in "say". Write whatever you like: a warning, advice, a lie, a taunt. Choose skip to write nothing.',
  );
  assert.doesNotMatch(chalkRules(1), POWER_WORDS);
});

test('a lone survivor is placed 1st, is the only one asked, and can write', async () => {
  const { oracle, learn } = makeOracle();
  const policy = (view) => {
    learn(view);
    if (view.stage === 'chalk') return reply('write', { say: 'I walked it alone.' });
    if (view.stage === 'bridge' && view.phase === 'crossing' && view.legalActions.includes('step:L')) {
      const safe = oracle.safe[view.round - 1];
      return reply(`step:${view.alive.length > 1 ? opposite(safe) : safe}`);
    }
    if (view.stage === 'bridge') return reply(view.legalActions.includes('hold') ? 'hold' : 'wait');
    return idle(view);
  };
  const tape = await runGame({ seed: 7, agents: fixedAgents(policy), config: { powers: powersWith({ Ash: 'glass_eye' }) } });
  validateTape(tape);
  assert.deepEqual(ofType(tape.events, 'stage_start').map((e) => e.stage), ['bridge', 'chalk']);
  const winner = tape.result.places.find((p) => p.place === 1).name;
  assert.equal(tape.result.places.filter((p) => p.place !== null).length, 1);
  assert.deepEqual(inChalk(tape, 'stage_start')[0].alive, [winner]);
  assert.deepEqual(tape.chalkWritten, [{ name: winner, place: 1, text: 'I walked it alone.' }]);
});

test('with four on the ledge the first faller has no place and does not write', async () => {
  const fighters = ['Ash', 'Bex', 'Cole', 'Dara'];
  const asked = [];
  const g = ledgeGame({ fighters, powers: { Ash: 'nothing', Bex: 'map', Cole: 'wedge', Dara: 'anchor' } });
  g.agents = fixedAgents((view) => {
    if (view.stage === 'chalk') {
      asked.push(view.you);
      return reply('write', { say: `note from ${view.you}` });
    }
    return reply(view.legalActions.includes('brace') ? 'brace' : 'dodge');
  });
  await runLedge(g);
  const [winner] = g.alive;
  g.places.set(winner, 1);
  const unplaced = g.deaths.filter((d) => !g.places.has(d.name)).map((d) => d.name);
  assert.equal(unplaced.length, 1, 'the 4th place faller has place null');
  await runChalk(g);
  assert.equal(asked.length, 3);
  assert.ok(!asked.includes(unplaced[0]));
  assert.deepEqual(g.chalkWritten.map((w) => w.place).sort(), [1, 2, 3]);
  assert.ok(g.chalkWritten.every((w) => w.name !== unplaced[0]));
});

test('only a valid write with a non-empty message becomes a note; skip, empty write and garbage do not', async () => {
  const agents = fixedAgents(writer('ignored'), {
    Ash: writer('  Trust\nno one  '),
    Bex: () => reply('skip', { say: 'this must not be written' }),
    Cole: () => reply('write', { say: '   ' }),
  });
  const g = epilogueGame({ agents });
  await runChalk(g);
  assert.deepEqual(g.chalkWritten, [{ name: 'Ash', place: 1, text: 'Trust no one' }]);
  const actions = ofType(g.events, 'action');
  assert.deepEqual(actions.map((a) => [a.name, a.action, a.valid]), [['Ash', 'write', true], ['Bex', 'skip', true], ['Cole', 'write', true]]);
  assert.match(actions[1].note, /say is only used with write/);
  assert.match(actions[2].note, /nothing was written/);
  assert.deepEqual(ofType(g.events, 'chalk_write').map(({ name, place, text }) => ({ name, place, text })), g.chalkWritten);
});

test('a note over 140 characters is cut, not rejected', async () => {
  const g = epilogueGame({ agents: fixedAgents(writer('y'.repeat(250))) });
  await runChalk(g);
  assert.equal(g.chalkWritten.length, 3);
  assert.ok(g.chalkWritten.every((w) => w.text.length === CHALK_NOTE_LIMIT));
});

test('garbage and throwing agents default to skip with valid:false and write nothing', async () => {
  const bad = {
    throws: () => { throw new Error('boom'); },
    rejects: async () => { throw new Error('async boom'); },
    undefinedReply: () => undefined,
    text: () => 'attack at dawn',
    illegal: () => ({ action: 'scribble', say: 'a note' }),
    number: () => ({ action: 7, say: 'a note' }),
    getter: () => ({ get action() { throw new Error('getter boom'); } }),
  };
  for (const [label, act] of Object.entries(bad)) {
    const g = epilogueGame({ agents: fixedAgents(idle, { Ash: act, Bex: act }), powers: {} });
    await runChalk(g);
    const actions = ofType(g.events, 'action');
    for (const name of ['Ash', 'Bex']) {
      const a = actions.find((x) => x.name === name);
      assert.equal(a.action, 'skip', label);
      assert.equal(a.valid, false, label);
      assert.ok(a.note, label);
    }
    assert.deepEqual(g.chalkWritten, [], `${label}: the broken agents write nothing, and idle's write has no message`);
    assert.equal(actions.length, 3, `${label}: only the three placed agents were asked`);
  }
});

test('whisper and forge are ignored in the epilogue: no say, whisper or ability_use events, nothing delivered, forge not spent', async () => {
  const sneaky = (view) => reply('write', {
    say: 'a real note',
    whisper: { to: view.you === 'Ash' ? 'Bex' : 'Ash', text: 'psst' },
    forge: { as: 'Ash', to: 'all', text: 'forged line' },
  });
  const g = epilogueGame({ agents: fixedAgents(sneaky), powers: { Bex: 'forger' } });
  await runChalk(g);
  const types = new Set(g.events.map((e) => e.type));
  for (const banned of ['say', 'whisper', 'ability_use', 'lucky_save', 'death', 'reveal']) assert.ok(!types.has(banned), banned);
  assert.ok(!g.spent.has('Bex'), 'the forge is not spent');
  assert.deepEqual(g.chalkWritten.map((w) => w.text), ['a real note', 'a real note', 'a real note']);
  assert.ok(ofType(g.events, 'action').every((a) => /whisper and forge are ignored/.test(a.note)));
  assert.equal(g.log.length, 0, 'nothing reaches the public log');
  assert.ok([...g.inbox.values()].every((box) => box.length === 0), 'no whisper is delivered');
});

test('dead and unplaced agents never act in the epilogue, and the epilogue never changes places, deaths or the alive set', async () => {
  for (const seed of [1, 2, 3, 4, 5, 6]) {
    const tape = await scripted(seed, { chalk: NOTES });
    const placed = tape.result.places.filter((p) => p.place !== null).map((p) => p.name);
    for (const e of inChalk(tape)) {
      if (e.name !== undefined) assert.ok(placed.includes(e.name), `seed ${seed}: ${e.type} by ${e.name}`);
    }
    assert.equal(inChalk(tape, 'death').length, 0);
    const obstacleEnd = tape.events.filter((e) => e.type === 'stage_end' && e.stage !== 'chalk').at(-1);
    assert.deepEqual(tape.events.at(-1).places, tape.result.places);
    const alive = SEATS.filter((s) => !ofType(tape.events, 'death').some((d) => d.name === s));
    assert.deepEqual(obstacleEnd.survivors, alive, 'the last obstacle left the one survivor, and the epilogue killed nobody');
    validateTape(tape);
  }
});

test('chalkWritten equals the chalk_write events, in seat order, with and without a wall', async () => {
  const withWall = await scripted(12, { chalk: NOTES });
  const without = await scripted(12);
  for (const tape of [withWall, without]) {
    const writes = inChalk(tape, 'chalk_write');
    assert.deepEqual(tape.chalkWritten, writes.map(({ name, place, text }) => ({ name, place, text })));
    const order = writes.map((w) => SEATS.indexOf(w.name));
    assert.deepEqual(order, [...order].sort((a, b) => a - b));
    assert.ok(tape.chalkWritten.every((w) => w.text.length > 0 && w.text.length <= CHALK_NOTE_LIMIT));
  }
});

test('scripted bots answer the epilogue from their own view, with or without a wall', () => {
  const epilogueView = (chalkWall) => ({ you: 'Ash', stage: 'chalk', phase: 'write', round: 1, roundsTotal: 1, stageState: { place: 2 }, legalActions: ['write', 'skip'], chalkWall, alive: ['Bex'], power: { id: 'nothing' } });
  for (const chalkWall of [[], NOTES]) {
    const answer = (kind) => createScriptedAgents(3, kind).Ash.act(epilogueView(chalkWall));
    for (const kind of ['saint', 'liar', 'shover']) {
      const r = answer(kind);
      assert.equal(r.action, 'write', kind);
      assert.ok(r.say && r.say.length > 0 && r.say.length <= CHALK_NOTE_LIMIT, `${kind} writes a short note`);
    }
    assert.equal(answer('coward').action, 'skip');
    assert.ok(['write', 'skip'].includes(answer('random').action));
    assert.ok(answer('saint').say.startsWith('Honest advice'));
    assert.notEqual(answer('saint').say, answer('liar').say);
  }
  // the random bot sometimes writes and sometimes skips
  const seen = new Set();
  for (let seed = 1; seed <= 30; seed++) seen.add(createScriptedAgents(seed, 'random').Ash.act(epilogueView([])).action);
  assert.deepEqual([...seen].sort(), ['skip', 'write']);
});

// ---- determinism ---------------------------------------------------------------------------

test('same seed, same agents and same chalk input give byte-identical tapes; the chalk input does not change play before the epilogue', async () => {
  const a = await scripted(33, { chalk: NOTES });
  const b = await scripted(33, { chalk: NOTES });
  assert.equal(JSON.stringify(a), JSON.stringify(b));
  const c = await scripted(33);
  assert.notEqual(JSON.stringify(a), JSON.stringify(c));
  const obstacles = (t) => JSON.stringify(t.events.filter((e) => e.type !== 'chalk_read' && e.stage !== 'chalk' && e.type !== 'game_end').map(({ i, ...rest }) => rest));
  assert.equal(obstacles(a), obstacles(c), 'scripted bots ignore the wall, so the obstacles play out the same');
});

// ---- the validator -------------------------------------------------------------------------

test('rulesVersion is 4 and the tape always carries chalkShown and chalkWritten', async () => {
  assert.equal(RULES_VERSION, 4);
  const tape = await scripted(2);
  assert.equal(tape.rulesVersion, 4);
  assert.deepEqual(Object.keys(tape).filter((k) => k.startsWith('chalk')), ['chalkShown', 'chalkWritten']);
  assert.ok(Array.isArray(tape.chalkShown) && Array.isArray(tape.chalkWritten));
});

/** A seeded game where at least two notes were written and a wall was shown. */
const goodTape = await (async () => {
  for (let seed = 1; seed < 200; seed++) {
    const tape = await scripted(seed, { chalk: NOTES }, ['saint', 'liar', 'shover', 'saint', 'liar', 'shover', 'saint', 'liar']);
    if (tape.chalkWritten.length >= 2) return tape;
  }
  throw new Error('no seed produced two notes');
})();

const rejects = (mutate, pattern) => {
  const t = copy(goodTape);
  mutate(t);
  assert.throws(() => validateTape(t), pattern);
};

test('validateTape accepts a v4 tape, and old tapes with no chalk at all', () => {
  validateTape(goodTape);
  const old = copy(goodTape);
  delete old.chalkShown;
  delete old.chalkWritten;
  old.rulesVersion = 3;
  old.events = old.events.filter((e) => e.stage !== 'chalk' && e.type !== 'chalk_read').map((e, i) => ({ ...e, i }));
  validateTape(old);
  const noFields = copy(goodTape);
  delete noFields.chalkShown;
  delete noFields.chalkWritten;
  validateTape(noFields);
});

test('validateTape rejects chalk mutations', () => {
  const [w1] = inChalk(goodTape, 'chalk_write');
  const unplaced = goodTape.result.places.find((p) => p.place === null).name;
  const idx = (t, type) => t.events.findIndex((e) => e.stage === 'chalk' && e.type === type);
  rejects((t) => { t.events[idx(t, 'chalk_write')].name = unplaced; }, /not placed|chalk_write by/);
  rejects((t) => { t.events[idx(t, 'chalk_write')].place = w1.place === 1 ? 2 : 1; }, /has place/);
  rejects((t) => { t.events[idx(t, 'chalk_write')].text = 'z'.repeat(141); }, /text must be 1-140/);
  rejects((t) => { t.events[idx(t, 'chalk_write')].text = '   '; }, /text must be 1-140/);
  rejects((t) => { t.events[idx(t, 'chalk_write')].text = 5; }, /chalk_write text|must be a string/);
  rejects((t) => { t.events[idx(t, 'stage_start')].alive = t.events[idx(t, 'stage_start')].alive.slice(1); }, /exactly the placed agents/);
  rejects((t) => { t.events[idx(t, 'stage_start')].alive = [...SEATS]; }, /exactly the placed agents/);
  rejects((t) => { t.events[idx(t, 'stage_end')].survivors = [t.result.places.find((p) => p.place === 1).name]; }, /exactly the placed agents/);
  rejects((t) => { t.chalkWritten = t.chalkWritten.slice(1); }, /chalkWritten does not match/);
  rejects((t) => { t.chalkWritten[0].text = 'different'; }, /chalkWritten does not match/);
  rejects((t) => { t.chalkWritten = 'none'; }, /chalkWritten must be an array/);
  rejects((t) => { t.chalkShown = []; }, /chalkShown does not match/);
  rejects((t) => { t.chalkShown[0].text = 'edited'; }, /chalkShown does not match/);
  rejects((t) => { t.events[1].notes[0].byPlace = 4; t.chalkShown[0].byPlace = 4; }, /byPlace must be 1-3/);
  rejects((t) => { t.events[1].notes[0].text = 'q'.repeat(141); t.chalkShown[0].text = 'q'.repeat(141); }, /text must be 1-140/);
  rejects((t) => { t.events[1].notes.push(...copy(t.events[1].notes), ...copy(t.events[1].notes)); t.chalkShown = copy(t.events[1].notes); }, /at most 3 notes/);
  rejects((t) => { [t.events[1], t.events[2]] = [t.events[2], t.events[1]]; t.events.forEach((e, i) => { e.i = i; }); }, /right after game_start/);
  rejects((t) => { t.events[1].stage = 'bridge'; }, /null stage and round/);
  rejects((t) => { const e = t.events[idx(t, 'chalk_write')]; t.events.splice(t.events.indexOf(e), 0, { ...copy(e), i: e.i }); t.events.forEach((x, i) => { x.i = i; }); }, /writes twice/);
  rejects((t) => { const k = idx(t, 'action'); t.events[k].action = 'skip'; }, /without a write action/);
  rejects((t) => { const k = idx(t, 'action'); t.events[k].action = 'scribble'; }, /write or skip/);
  rejects((t) => { const k = idx(t, 'action'); t.events[k].valid = false; }, /invalid chalk action|without a write action/);
  rejects((t) => { const k = idx(t, 'round_start'); t.events.splice(k + 1, 0, { i: 0, type: 'say', stage: 'chalk', round: 1, name: 'Ash', text: 'hi' }); t.events.forEach((x, i) => { x.i = i; }); }, /not allowed in the chalk epilogue/);
  rejects((t) => { t.events[idx(t, 'round_start')].round = 2; }, /chalk round must be 1/);
  rejects((t) => { t.events.splice(t.events.length - 1, 0, { i: 0, type: 'round_start', stage: 'ledge', round: 1, phase: 'play', roundsTotal: 20 }); t.events.forEach((x, i) => { x.i = i; }); }, /after the last obstacle/);
  rejects((t) => { const k = idx(t, 'thought'); const who = SEATS.find((n) => t.result.places.find((p) => p.name === n).place === null); t.events[k >= 0 ? k : idx(t, 'action')].name = who; }, /not placed/);
});

test('a chalk stage can never carry a death, and a chalk event is not an obstacle stage for deaths or places', () => {
  rejects((t) => {
    const e = t.events[t.events.findIndex((x) => x.stage === 'chalk' && x.type === 'stage_end')];
    t.events.splice(t.events.indexOf(e), 0, { i: 0, type: 'death', stage: 'chalk', round: 1, name: 'Ash', cause: 'ledge', style: 'tumble' });
    t.events.forEach((x, i) => { x.i = i; });
  }, /chalk death must have cause|not allowed in the chalk epilogue/);
});

// ---- information hiding --------------------------------------------------------------------

test('information hiding: epilogue views carry the same public wall for everyone and no other agent\'s power', async () => {
  const views = [];
  const powers = powersWith({ Gus: 'glass_eye', Hana: 'map', Ash: 'forger' });
  const tape = await runGame({ seed: 8, agents: fixedAgents(spy(idle, views)), config: { powers, chalk: NOTES } });
  const powerOf = Object.fromEntries(tape.players.map((p) => [p.name, p.power]));
  const chalkViews = views.filter((v) => v.stage === 'chalk');
  assert.ok(chalkViews.length >= 1);
  for (const v of chalkViews) {
    assert.equal(v.power.id, powerOf[v.you]);
    assert.deepEqual(v.chalkWall, NOTES);
    const { power, powerBlurbs, privateKnowledge, rules, common, publicLog, ...rest } = v;
    assert.doesNotMatch(JSON.stringify(rest), POWER_WORDS, `${v.you}: ${JSON.stringify(rest).match(POWER_WORDS)}`);
    assert.doesNotMatch(rules, POWER_WORDS);
    assert.ok(publicLog.every((line) => !POWER_WORDS.test(line)), 'the public log names no power');
    assert.doesNotMatch(JSON.stringify(rest), new RegExp(Object.entries(powerOf).filter(([n]) => n !== v.you).map(([, p]) => p).filter((p) => p !== 'nothing').join('|')));
    if (v.you !== 'Hana') assert.deepEqual(privateKnowledge, [], 'only the map holder has stage knowledge');
    assert.deepEqual(v.alive.filter((n) => n !== v.you).length, v.alive.length - (v.alive.includes(v.you) ? 1 : 0));
  }
  assert.ok(new Set(chalkViews.map((v) => JSON.stringify(v.chalkWall))).size === 1);
  const all = JSON.stringify(inChalk(tape));
  assert.doesNotMatch(all, POWER_WORDS, 'the epilogue events leak no power');
});

// ---- rope cost 2 ---------------------------------------------------------------------------

test('rope cost is 2 footing, never below 1 at the ledge start, and it stacks with the anchor', async () => {
  assert.equal(ROPE_COST_FOOTING, 2);
  const start = async (powers, ropeCost, spent = []) => {
    const g = ledgeGame({ powers });
    for (const [name, cost] of Object.entries(ropeCost)) g.ropeCost.set(name, cost);
    for (const name of spent) g.spent.add(name);
    await runLedge(g);
    return footingReveals(g)[0];
  };
  assert.deepEqual(await start({ Ash: 'nothing', Bex: 'map', Cole: 'wedge' }, { Ash: ROPE_COST_FOOTING }), { Ash: 1, Bex: 3, Cole: 3 });
  assert.deepEqual(await start({ Ash: 'anchor', Bex: 'map', Cole: 'wedge' }, { Ash: ROPE_COST_FOOTING }), { Ash: 2, Bex: 3, Cole: 3 }, 'anchor 4 - 2');
  assert.deepEqual(await start({ Ash: 'feather', Bex: 'map', Cole: 'wedge' }, { Ash: ROPE_COST_FOOTING }, ['Ash']), { Ash: 1, Bex: 3, Cole: 3 }, 'a spent feather starts at 1 and stays there');
  assert.deepEqual(await start({ Ash: 'nothing', Bex: 'map', Cole: 'wedge' }, {}), { Ash: 3, Bex: 3, Cole: 3 });
});
