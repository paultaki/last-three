// Node unit tests for the viewer's pure reducer (web/lib/state.js).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stateAt, aliveNames, chapters, isStepWorthy, timeline } from '../../web/lib/state.js';
import { normalizeStats, rulesLine } from '../../web/ui/stats-panel.js';
import { highlights } from '../../web/ui/highlights.js';
import { describeEvent, deathCaption } from '../../web/lib/text.js';
import { buildPitTapes } from './pit-fixtures.mjs';
import { buildChalkTapes, NOTES } from './chalk-fixtures.mjs';

const tapesDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'web', 'tapes');
const load = (id) => JSON.parse(fs.readFileSync(path.join(tapesDir, `${id}.json`), 'utf8'));
const sample = load('sample');
const idxOf = (pred) => sample.events.findIndex(pred);

test('stateAt is a pure function of (tape, i)', () => {
  const a = stateAt(sample, 120);
  const b = stateAt(sample, 120);
  assert.deepEqual(a, b);
  stateAt(sample, 250);
  assert.deepEqual(stateAt(sample, 120), a, 'folding further must not mutate the earlier result');
});

test('before the first event everyone is alive in the lobby', () => {
  const s = stateAt(sample, -1);
  assert.equal(s.stage, 'lobby');
  assert.equal(aliveNames(s).length, 8);
});

test('bridge: line, rows and deaths', () => {
  const afterVolunteer = stateAt(sample, idxOf((e) => e.type === 'reveal' && e.what === 'line' && e.data.line[0] === 'Fenn'));
  assert.equal(afterVolunteer.bridge.line[0], 'Fenn');
  const fenn = idxOf((e) => e.type === 'death' && e.name === 'Fenn');
  const s = stateAt(sample, fenn);
  assert.equal(s.players.Fenn.alive, false);
  assert.equal(s.players.Fenn.fate.style, 'shatter');
  assert.equal(s.bridge.line[0], 'Eli', 'next in line becomes the front');
  const after = stateAt(sample, fenn + 3);
  assert.equal(after.bridge.rows[4].by, 'Fenn');
  assert.equal(after.bridge.rows[4].weak, 'R');
  assert.equal(after.bridge.at.Eli.side, 'L');
});

test('feather bounce keeps the front alive but the pane is marked broken', () => {
  const i = idxOf((e) => e.type === 'reveal' && e.what === 'weak_pane' && e.data.row === 2);
  const s = stateAt(sample, i);
  assert.equal(s.players.Fenn.alive, true);
  assert.equal(s.bridge.rows[2].by, 'Fenn');
  assert.deepEqual(s.bridge.at.Fenn, { row: 2, side: 'R' });
});

test('crusher: holder inferred from the lever action, slab crushes on the flatten', () => {
  const hold = idxOf((e) => e.type === 'action' && e.action === 'hold_lever');
  const s = stateAt(sample, hold);
  assert.equal(s.crusher.holder, 'Dara');
  assert.equal(s.crusher.door, true);
  const dead = stateAt(sample, hold + 1);
  assert.equal(dead.players.Dara.fate.style, 'flatten');
  assert.equal(dead.crusher.crushed, true);
});

test('disc: bump, swap and chute deaths', () => {
  const tiles = idxOf((e) => e.type === 'reveal' && e.what === 'tiles');
  assert.equal(stateAt(sample, tiles).disc.tiles.Cole, 4);
  const swap = idxOf((e) => e.type === 'ability_use' && e.power === 'swap');
  const s = stateAt(sample, swap);
  assert.equal(s.disc.tiles.Bex, 2);
  assert.equal(s.disc.tiles.Hana, 3);
  const open = stateAt(sample, idxOf((e) => e.type === 'reveal' && e.what === 'trapdoors'));
  assert.deepEqual([...open.disc.open].sort(), [2, 4]);
  assert.equal(open.players.Bex.fate.style, 'chute');
});

test('ledge: footing, falls with places, winner', () => {
  const end = stateAt(sample, sample.events.length - 1);
  assert.equal(end.ended, true);
  assert.equal(end.winner, 'Ash');
  assert.equal(end.players.Gus.place, 3);
  assert.equal(end.players.Hana.place, 2);
  assert.equal(aliveNames(end).join(), 'Ash');
  assert.equal(end.deaths.length, 7);
});

test('captions never leak thoughts when the cut is off', () => {
  const t = idxOf((e) => e.type === 'thought');
  const s = stateAt(sample, t);
  assert.ok(!s.caption || !/thinks/.test(s.caption.text));
  assert.match(s.captionCut.text, /thinks/);
});

test('forged say shows the forged name publicly and the sender in the cut', () => {
  const i = idxOf((e) => e.type === 'say' && e.forgedAs);
  const s = stateAt(sample, i);
  assert.match(s.caption.text, /^Hana:/);
  assert.match(s.captionCut.text, /forged by Cole/);
  assert.equal(s.speech.at(-1).as, 'Hana');
});

test('chapters cover all four stages and the result', () => {
  assert.deepEqual(chapters(sample).map((c) => c.id), ['start', 'bridge', 'crusher', 'disc', 'ledge', 'results']);
});

test('isStepWorthy skips secrets unless the cut is on', () => {
  assert.equal(isStepWorthy({ type: 'thought' }, false), false);
  assert.equal(isStepWorthy({ type: 'thought' }, true), true);
  assert.equal(isStepWorthy({ type: 'action', action: 'hold' }, false), false);
  assert.equal(isStepWorthy({ type: 'death' }, false), true);
});

for (const id of ['42', '7']) {
  const file = path.join(tapesDir, `${id}.json`);
  if (!fs.existsSync(file)) continue;
  test(`engine tape ${id}: every index folds without throwing and ends consistently`, () => {
    const tape = load(id);
    for (let i = -1; i < tape.events.length; i += 1) stateAt(tape, i);
    const end = stateAt(tape, tape.events.length - 1);
    assert.equal(end.ended, true);
    assert.ok(aliveNames(end).length <= 3);
  });
}

// ---------------------------------------------------------------- the Pit (rules v3)
const pitTapes = await buildPitTapes();
const SECRET = /glass eye|wedge|feather|forger|anchor|forged by/i;
const pitOf = (tape) => tape.events.filter((e) => e.stage === 'pit');

test('chapters: the pit sits between the crusher and the disc', () => {
  const ids = chapters(pitTapes.volunteer).map((c) => c.id);
  assert.deepEqual(ids.slice(0, 5), ['start', 'bridge', 'crusher', 'pit', 'disc'].slice(0, 5));
  assert.ok(ids.includes('pit') && ids.indexOf('pit') > ids.indexOf('crusher'));
  assert.ok(!chapters(sample).some((c) => c.id === 'pit'), 'old tapes have no pit marker');
});

test('old tapes keep working: no pit state, rules default to 1', () => {
  const end = stateAt(sample, sample.events.length - 1);
  assert.equal(end.pit, null);
  assert.equal(end.rules, 1);
  assert.equal(stateAt(sample, 0).rules, 1);
  assert.equal(stateAt(pitTapes.volunteer, 0).rules, 4);
  assert.match(stateAt(pitTapes.volunteer, 0).caption.text, /Five obstacles/);
  assert.match(stateAt(sample, 0).caption.text, /Four obstacles/);
});

for (const [name, tape] of Object.entries(pitTapes)) {
  test(`pit tape ${name}: every index folds, ends consistently, never leaks a power with the cut off`, () => {
    for (let i = -1; i < tape.events.length; i += 1) {
      const s = stateAt(tape, i);
      if (s.caption && s.caption.kind !== 'say') assert.ok(!SECRET.test(s.caption.text), `caption leaks at ${i}: ${s.caption.text}`);
      for (const line of s.speech) assert.ok(line.kind !== 'say' || !line.forgedAs || !/forged by/.test(line.text));
    }
    const end = stateAt(tape, tape.events.length - 1);
    assert.equal(end.ended, true);
    assert.ok(aliveNames(end).length <= 3);
    for (const line of timeline(tape)) if (line.pub && line.kind !== 'say') assert.ok(!SECRET.test(line.pub), `transcript leak: ${line.pub}`);
  });
}

for (const name of ['volunteer', 'pushed', 'rope', 'sink', 'floor3', 'feather', 'anchor', 'big']) {
  test(`pit tape ${name}: the folded pit follows each engine reveal`, () => {
    const tape = pitTapes[name];
    assert.ok(tape, `scenario ${name} exists`);
    let sawBase = false;
    for (const e of tape.events) {
      if (e.type !== 'reveal' || e.what !== 'pit') continue;
      const s = stateAt(tape, e.i);
      const d = e.data;
      assert.equal(s.pit.flood, d.flood);
      assert.equal(s.pit.base, d.base);
      assert.deepEqual([...s.pit.down].sort(), [...d.down].sort());
      assert.deepEqual([...s.pit.out].sort(), [...d.out].sort());
      assert.equal(s.pit.ropeUsed, d.ropeUsed);
      assert.deepEqual(s.pit.lifted, d.lifted);
      assert.equal(s.pit.roped, d.roped);
      assert.equal(s.pit.rescued, d.rescued);
      if (d.base) sawBase = true;
      if (d.base && d.base !== stateAt(tape, e.i - 1).pit.base) assert.ok(['volunteer', 'pushed'].includes(s.pit.baseHow), 'how the base was chosen');
    }
    if (name === 'volunteer' || name === 'pushed') assert.ok(sawBase);
  });
}

test('pit: a volunteer beats a push, and a pushed base is called pushed', () => {
  for (const [name, how] of [['volunteer', 'volunteer'], ['pushed', 'pushed']]) {
    const tape = pitTapes[name];
    const reveal = tape.events.find((e) => e.type === 'reveal' && e.what === 'pit' && e.data.base);
    const s = stateAt(tape, reveal.i);
    assert.equal(s.pit.baseHow, how, name);
    assert.equal(s.pit.baseNew, true);
    const cap = s.caption.text;
    assert.match(cap, how === 'pushed' ? /shoved down as the step/ : /volunteers to be the step/);
  }
});

test('pit: the rope reveal is folded, hauls the base out and costs the thrower ledge footing', () => {
  const tape = pitTapes.rope;
  const rope = tape.events.find((e) => e.type === 'reveal' && e.what === 'rope');
  const at = stateAt(tape, rope.i);
  assert.deepEqual(at.pit.rope, { by: rope.data.by, saved: rope.data.saved, cost: rope.data.cost });
  assert.equal(at.pit.ropeUsed, false, 'the rope is only spent at the round reveal');
  assert.match(at.caption.text, /^The rope: /);
  const after = stateAt(tape, rope.i + 1);
  assert.equal(after.pit.ropeUsed, true);
  assert.ok(after.pit.out.includes(rope.data.saved));
  assert.equal(after.pit.base, null);
  const ledge = tape.events.find((e) => e.type === 'stage_start' && e.stage === 'ledge');
  const l = stateAt(tape, ledge.i);
  const power = tape.players.find((p) => p.name === rope.data.by).power;
  const full = power === 'anchor' ? 4 : power === 'feather' && l.spent[rope.data.by] ? 1 : 3;
  assert.equal(l.ledge.footing[rope.data.by], Math.max(1, full - rope.data.cost), 'the rope price shows in the ledge pips');
});

test('pit: sink deaths are folded, the flood caption is funny, and nobody is left down', () => {
  const tape = pitTapes.sink;
  const deaths = tape.events.filter((e) => e.type === 'death' && e.style === 'sink');
  assert.ok(deaths.length >= 1);
  for (const d of deaths) {
    const s = stateAt(tape, d.i);
    assert.equal(s.players[d.name].alive, false);
    assert.equal(s.players[d.name].fate.style, 'sink');
    assert.equal(s.players[d.name].fate.cause, 'pit');
    assert.ok(!s.pit.down.includes(d.name));
    assert.ok(s.pit.sunk.includes(d.name));
    assert.match(s.caption.text, /was left in the pit/);
  }
  const end = tape.events.find((e) => e.type === 'stage_end' && e.stage === 'pit');
  assert.equal(stateAt(tape, end.i).pit.down.length, 0);
  assert.match(deathCaption('Ash', 'sink', 1), /Ash was left in the pit/);
});

test('pit: feather and floor saves float out instead of dying', () => {
  for (const [name, text] of [['feather', /floats right out of the pit/], ['floor3', /plank floats by/]]) {
    const tape = pitTapes[name];
    const e = tape.events.find((x) => x.stage === 'pit' && (x.type === 'lucky_save' || (x.type === 'ability_use' && x.power === 'feather')));
    const s = stateAt(tape, e.i);
    assert.ok(s.players[e.name].alive, `${name}: saved player is alive`);
    assert.ok(s.pit.out.includes(e.name), `${name}: saved player is out of the pit`);
    assert.ok(s.pit.floated.includes(e.name));
    assert.match(s.caption.text, text);
    assert.ok(s.flash && s.flash.i === e.i);
  }
});

test('pit: a failed push on an anchor is public as "would not budge" but never names the power', () => {
  const tape = pitTapes.anchor;
  const e = tape.events.find((x) => x.type === 'ability_use' && x.power === 'anchor' && x.stage === 'pit');
  const s = stateAt(tape, e.i);
  assert.match(s.caption.text, /would not budge/);
  assert.ok(!/anchor/i.test(s.caption.text));
  assert.match(s.captionCut.text, /uses Anchor/);
  assert.equal(s.pit.pushFail.target, e.name);
  assert.ok(s.pit.pushFail.by && s.pit.pushFail.by !== e.name);
  assert.equal(s.flash.text, 'BOUNCES OFF!');
});

test('pit: stepping skips quiet waits and leaves', () => {
  assert.equal(isStepWorthy({ type: 'action', action: 'leave' }, false), false);
  assert.equal(isStepWorthy({ type: 'action', action: 'wait' }, false), false);
  assert.equal(isStepWorthy({ type: 'action', action: 'climb' }, false), true);
  assert.equal(isStepWorthy({ type: 'action', action: 'push_base:Cole' }, false), true);
});

test('highlights: pit and tie-break moments, with no power leaks', () => {
  const label = (tape) => highlights(tape).map((h) => h.pub).join(' | ');
  assert.match(label(pitTapes.volunteer), /volunteers to be the step/);
  assert.match(label(pitTapes.pushed), /is shoved down as the step/);
  assert.match(label(pitTapes.rope), /The rope: \w+ hauls \w+ out/);
  assert.match(label(pitTapes.sink), /is left in the pit/);
  assert.match(label(pitTapes.photoShoves), /Photo finish on shoves/);
  assert.match(label(pitTapes.photoFooting), /Photo finish on footing/);
  assert.match(highlights(pitTapes.photoShoves).find((h) => /Photo finish/.test(h.pub)).cut, /wins a photo finish on shoves landed/);
  for (const tape of Object.values(pitTapes)) {
    const list = highlights(tape);
    const chalkExtras = list.filter((h) => /^The wall already says|left a message/.test(h.pub)).length; // up to 1 + 3 on top of the 8
    assert.ok(list.length >= 1 && list.length - chalkExtras <= 8 && chalkExtras <= 4);
    for (const h of list) {
      assert.ok(!SECRET.test(h.pub), `leak: ${h.pub}`);
      assert.ok(h.pub.length < 60, `too long: ${h.pub}`);
    }
  }
});

test('lucky_save captions read well for the new reasons', () => {
  const cap = (why) => describeEvent({ type: 'lucky_save', name: 'Ash', why }, { players: {} }, {}).pub;
  assert.match(cap('won the photo finish on footing'), /^Ash won the photo finish on footing/);
  assert.match(cap('won the photo finish on shoves landed'), /photo finish on shoves/);
  assert.match(cap('a last toe-hold'), /last toe-hold/);
  assert.match(cap('a plank floats by'), /plank/);
  assert.match(cap('the glass holds'), /lucky break: the glass holds/);
});

test('stats panel: pit deaths default to 0 in old stats, rules line and older rules', () => {
  const old = normalizeStats({ models: [{ model: 'a/b', games: 3, meanPlace: 2, wins: 1, deathsByStage: { bridge: 1, crusher: 0, disc: 1, ledge: 0 } }] });
  assert.equal(old[0].pit, 0);
  const next = normalizeStats({ models: [{ model: 'a/b', games: 3, deathsByStage: { bridge: 1, crusher: 0, pit: 2, disc: 1, ledge: 0 } }] });
  assert.equal(next[0].pit, 2);
  assert.equal(normalizeStats({ models: [{ model: 'a/b', games: 1 }] })[0].pit, null, 'no deaths object at all stays unknown');
  assert.equal(rulesLine({}), null);
  assert.equal(rulesLine({ rulesVersion: 3, games: 6, tapesByRules: { 1: 24, 2: 8, 3: 6 } }), 'Stats for rules v3 (6 games). Older rules: v1 24 games, v2 8 games, not counted here.');
  assert.equal(rulesLine({ rulesVersion: 2, games: 8, tapesByRules: { 2: 8 } }), 'Stats for rules v2 (8 games).');
  assert.equal(rulesLine({ rulesVersion: 3, games: 1, tapesByRules: { 2: 8, 3: 1 } }), 'Stats for rules v3 (1 game). Older rules: v2 8 games, not counted here.');
});

test('unknown future stages and reveals never crash the reducer', () => {
  const tape = JSON.parse(JSON.stringify(pitTapes.volunteer));
  const k = tape.events.findIndex((e) => e.type === 'stage_start' && e.stage === 'pit');
  tape.events.splice(k + 1, 0, { type: 'stage_start', stage: 'volcano', alive: tape.events[k].alive, note: 'lava', round: null }, { type: 'reveal', what: 'lava', data: { depth: 3 } }, { type: 'round_start', stage: 'volcano', round: 1, phase: 'x', roundsTotal: 2 }, { type: 'death', name: tape.events[k].alive[0], stage: 'volcano', cause: 'lava', style: 'melt' }, { type: 'stage_end', stage: 'volcano', survivors: [] });
  tape.events = tape.events.map((e, i) => ({ ...e, i }));
  for (let i = -1; i < tape.events.length; i += 1) stateAt(tape, i);
  assert.equal(stateAt(tape, k + 1).stage, 'volcano');
  assert.ok(timeline(tape).length > 10);
  assert.deepEqual(chapters(tape).map((c) => c.id).includes('volcano'), false, 'unknown stages get no scrubber marker');
});

// ---------------------------------------------------------------- the chalk wall (rules v4)
const chalk = await buildChalkTapes();
const lastOf = (tape) => tape.events.length - 1;
const idxType = (tape, type, n = 0) => tape.events.filter((e) => e.type === type)[n].i;

test('chalk: wall with 0, 1 and 3 earlier notes folds from the start', () => {
  assert.equal(stateAt(chalk.wall0, 0).chalk, null, 'no earlier notes: no wall before the epilogue');
  assert.equal(stateAt(chalk.wall1, 0).chalk.shown.length, 1);
  assert.equal(stateAt(chalk.wall3, 0).chalk.shown.length, 3);
  assert.equal(stateAt(chalk.wall1, 0).chalk.read, false, 'hung up, not yet read');
  const read = idxType(chalk.wall3, 'chalk_read');
  const s = stateAt(chalk.wall3, read);
  assert.equal(s.chalk.read, true);
  assert.deepEqual(s.chalk.shown.map((n) => n.byPlace), [1, 2, 3]);
  assert.match(s.caption.text, /^What the wall says: /);
  assert.match(s.caption.text, /1st place/);
  assert.equal(s.captionCut.text, s.caption.text, 'notes are public: the cut says the same');
});

test('chalk: epilogue folds writers, places, notes and skips', () => {
  const t = chalk.wall1;
  const start = stateAt(t, t.events.find((e) => e.type === 'stage_start' && e.stage === 'chalk').i);
  assert.equal(start.stage, 'chalk');
  assert.equal(start.chalk.epilogue, true);
  assert.equal(start.chalk.writers.length, 3);
  assert.deepEqual(Object.values(start.chalk.places).sort(), [1, 2, 3]);
  const acts = stateAt(t, t.events.findIndex((e) => e.type === 'action' && e.stage === 'chalk') + 2);
  assert.equal(acts.chalk.skipped.length, 1, 'the planned skip shows as soon as the action lands');
  const w1 = stateAt(t, idxType(t, 'chalk_write', 0));
  assert.equal(w1.chalk.written.length, 1);
  assert.equal(w1.chalk.last, w1.chalk.written[0].name);
  assert.deepEqual(w1.speech, [], 'thoughts clear once the wall is what is on screen');
  assert.match(w1.caption.text, /scratches a message for the next contestants/);
  const end = stateAt(t, t.events.find((e) => e.type === 'stage_end' && e.stage === 'chalk').i);
  assert.equal(end.chalk.done, true);
  assert.equal(end.chalk.last, null);
  assert.equal(end.chalk.written.length, 2);
  assert.equal(stateAt(t, lastOf(t)).ended, true);
  assert.equal(stateAt(t, lastOf(t)).chalk.written.length, 2);
});

test('chalk: lone survivor writes alone, and everyone skipping leaves a blank wall', () => {
  const lone = chalk.lone;
  assert.ok(lone, 'a lone-survivor base tape exists');
  const s = stateAt(lone, lone.events.find((e) => e.type === 'stage_end' && e.stage === 'chalk').i);
  assert.equal(s.chalk.writers.length, 1);
  assert.equal(s.chalk.places[s.chalk.writers[0]], 1);
  assert.equal(s.chalk.written.length, 1);
  const skip = stateAt(chalk.skip, chalk.skip.events.find((e) => e.type === 'stage_end' && e.stage === 'chalk').i);
  assert.equal(skip.chalk.written.length, 0);
  assert.equal(skip.chalk.skipped.length, 3);
  assert.equal(skip.caption.text, 'The wall is done.');
});

test('chalk: HTML characters stay plain text in state, captions and highlights', () => {
  const t = chalk.html;
  const s = stateAt(t, lastOf(t));
  assert.equal(s.chalk.shown[0].text, NOTES.html);
  assert.ok(s.chalk.written.some((w) => w.text === NOTES.html));
  assert.ok(timeline(t).some((l) => l.pub && l.pub.includes('<img src=x')), 'transcript carries the raw characters (it renders them with textContent)');
});

test('chalk: scrubber marker only when the epilogue exists; old tapes are untouched', () => {
  assert.ok(chapters(chalk.wall1).some((c) => c.id === 'chalk'));
  const ids = chapters(chalk.wall1).map((c) => c.id);
  assert.ok(ids.indexOf('chalk') > ids.indexOf('ledge') && ids.indexOf('chalk') < ids.indexOf('results'));
  const old = chalk.old;
  assert.ok(!chapters(old).some((c) => c.id === 'chalk'));
  assert.ok(!chapters(sample).some((c) => c.id === 'chalk'));
  for (let i = -1; i < old.events.length; i += 3) assert.equal(stateAt(old, i).chalk, null);
  assert.equal(stateAt(sample, lastOf(sample)).chalk, null);
  assert.deepEqual(highlights(old).filter((h) => /wall|message/.test(h.pub)), []);
  assert.equal(stateAt(old, 0).rules, 3);
});

test('chalk: highlights are neutral, jumpable and the same with the cut on', () => {
  const list = highlights(chalk.wall3);
  const wall = list.find((h) => /^The wall already says: /.test(h.pub));
  assert.ok(wall, 'wall highlight');
  assert.equal(wall.i, idxType(chalk.wall3, 'chalk_read'));
  assert.match(wall.pub, /\(\+2 more\)$/);
  const left = list.filter((h) => / left a message: /.test(h.pub));
  assert.equal(left.length, 3);
  for (const h of [wall, ...left]) {
    assert.equal(h.cut, h.pub);
    assert.ok(h.pub.length < 80, `short enough: ${h.pub}`);
    assert.ok(!SECRET.test(h.pub));
    assert.equal(chalk.wall3.events[h.i].type.startsWith('chalk'), true);
  }
  assert.equal(highlights(chalk.skip).filter((h) => / left a message/.test(h.pub)).length, 0);
});

test('chalk: every index folds, stepping never throws, no power leaks in captions or the transcript', () => {
  for (const [name, t] of Object.entries(chalk)) {
    for (let i = -1; i < t.events.length; i++) {
      const s = stateAt(t, i);
      if (s.caption && s.caption.kind !== 'say' && s.caption.kind !== 'chalk') assert.ok(!SECRET.test(s.caption.text), `${name} caption @${i}`);
    }
    for (const l of timeline(t)) if (l.kind !== 'say' && l.kind !== 'chalk' && l.pub) assert.ok(!SECRET.test(l.pub), `${name}: ${l.pub}`);
    const end = stateAt(t, lastOf(t));
    assert.equal(end.ended, true);
  }
  for (const [type, step] of [['chalk_read', true], ['chalk_write', true], ['thought', false]]) {
    const ev = chalk.wall1.events.find((e) => e.type === type && (type !== 'thought' || e.stage === 'chalk'));
    assert.equal(isStepWorthy(ev, false), step, type);
  }
});

test('chalk: junk chalk events never crash the reducer', () => {
  const t = JSON.parse(JSON.stringify(chalk.wall1));
  const k = t.events.findIndex((e) => e.type === 'chalk_read');
  t.events.splice(k, 1, { type: 'chalk_read', stage: null, round: null, notes: [null, 5, { text: 7 }, { text: '  ', byPlace: 1 }, { text: 'ok', byPlace: 9 }, { text: 'a' }, { text: 'b' }, { text: 'c' }] });
  const w = t.events.findIndex((e) => e.type === 'chalk_write');
  t.events.splice(w, 0, { type: 'chalk_write', stage: 'chalk', round: 1 }, { type: 'chalk_write', stage: 'chalk', round: 1, name: 'Nobody', text: 'x', place: 'first' }, { type: 'chalk_future', stage: 'chalk' });
  t.events = t.events.map((e, i) => ({ ...e, i }));
  for (let i = -1; i < t.events.length; i++) stateAt(t, i);
  assert.equal(stateAt(t, 0).chalk.shown.length, 3, 'at most three usable notes');
  assert.equal(stateAt(t, 0).chalk.shown[0].byPlace, null);
  assert.ok(timeline(t).length > 10);
  assert.ok(highlights(t).length >= 1);
});
