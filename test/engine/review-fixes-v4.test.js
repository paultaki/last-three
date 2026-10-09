// Second-opinion review fixes for rules v4: chalk_write lifecycle and exact shapes, one sanitiser
// charset for the engine and the validator, and rope reveals that must be backed by a reach_down.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runGame, SEATS } from '../../src/engine.js';
import * as rules from '../../src/rules.js';
import { ROPE_COST_FOOTING, sanitizeChalkNotes, sanitizeChalkText } from '../../src/rules.js';
import { createScriptedAgents } from '../../src/scripted.js';
import { validateTape } from '../../src/tape.js';
import { fixedAgents, idle, reply } from './helpers.js';

const KINDS = ['random', 'saint', 'coward', 'liar', 'shover'];
const NOTES = [
  { text: 'Volunteer early on the bridge.', byPlace: 1 },
  { text: 'Never hold the lever.', byPlace: 3 },
];
const copy = (value) => JSON.parse(JSON.stringify(value));
const renumber = (tape) => tape.events.forEach((e, k) => { e.i = k; });
const insertAfter = (tape, event, extra) => {
  tape.events.splice(tape.events.indexOf(event) + 1, 0, { i: 0, ...extra });
  renumber(tape);
};
const insertBefore = (tape, event, extra) => {
  tape.events.splice(tape.events.indexOf(event), 0, { i: 0, ...extra });
  renumber(tape);
};
const inChalk = (tape, type) => tape.events.filter((e) => e.stage === 'chalk' && (!type || e.type === type));

async function findTape(wanted, { chalk } = {}) {
  for (let seed = 1; seed <= 300; seed++) {
    const mix = SEATS.map((_, i) => KINDS[(seed * 7 + i * 3) % KINDS.length]);
    const tape = await runGame({ seed, agents: createScriptedAgents(seed, mix), config: chalk ? { chalk } : {} });
    if (wanted(tape)) return tape;
  }
  throw new Error('no fuzz tape matched');
}

const placedOf = (t) => t.result.places.filter((p) => p.place !== null).map((p) => p.name);
const goodTape = await findTape((t) => inChalk(t, 'chalk_write').length >= 2 && placedOf(t).length === 3, { chalk: NOTES });

const rejects = (source, mutate, pattern) => {
  const t = copy(source);
  mutate(t);
  assert.throws(() => validateTape(t), pattern);
};
const idxOf = (t, type) => t.events.findIndex((e) => e.stage === 'chalk' && e.type === type);

// ---- finding 1: chalk_write lifecycle and exact shapes --------------------------------------

test('the unmutated chalk tape validates', () => {
  validateTape(goodTape);
});

test('F1: a chalk_write outside the epilogue is rejected, whoever writes it', () => {
  const unplaced = goodTape.result.places.find((p) => p.place === null).name;
  const winner = goodTape.result.places.find((p) => p.place === 1).name;
  const bridge = goodTape.events.find((e) => e.stage === 'bridge' && e.type === 'round_start');
  for (const [who, place] of [[unplaced, 1], [winner, 1], [unplaced, null]]) {
    rejects(goodTape, (t) => {
      insertAfter(t, t.events.find((e) => e.i === bridge.i), { type: 'chalk_write', stage: 'bridge', round: 1, name: who, place, text: 'sneaky' });
    }, /chalk_write/);
  }
});

test('F1: a dead agent cannot chalk_write mid-game; only the epilogue lets the placed dead write', () => {
  const dead = goodTape.events.find((e) => e.type === 'death');
  rejects(goodTape, (t) => {
    insertAfter(t, t.events.find((e) => e.i === dead.i), { type: 'chalk_write', stage: dead.stage, round: 1, name: dead.name, place: 1, text: 'from beyond' });
  }, /chalk_write/);
  validateTape(goodTape);
});

test('F1: a chalk_write in the ledge stage is rejected even for a placed agent', () => {
  const ledgeEvent = goodTape.events.findLast((e) => e.stage === 'ledge') ?? goodTape.events.findLast((e) => e.stage === 'bridge');
  const winner = goodTape.result.places.find((p) => p.place === 1).name;
  rejects(goodTape, (t) => {
    insertAfter(t, t.events.find((e) => e.i === ledgeEvent.i), { type: 'chalk_write', stage: ledgeEvent.stage, round: 1, name: winner, place: 1, text: 'early' });
  }, /chalk_write/);
});

test('F1: the epilogue stage_start alive and stage_end survivors must be in seat order', () => {
  rejects(goodTape, (t) => { t.events[idxOf(t, 'stage_start')].alive.reverse(); }, /seat order/);
  rejects(goodTape, (t) => { t.events[idxOf(t, 'stage_end')].survivors.reverse(); }, /seat order/);
});

test('F1: chalk_write events must follow seat order', () => {
  rejects(goodTape, (t) => {
    const writes = t.events.filter((e) => e.stage === 'chalk' && e.type === 'chalk_write');
    const [a, b] = [t.events.indexOf(writes[0]), t.events.indexOf(writes[1])];
    [t.events[a], t.events[b]] = [t.events[b], t.events[a]];
    renumber(t);
    t.chalkWritten.reverse();
  }, /seat order/);
});

test('F1: no smuggled keys on notes, chalk_read, chalk_write or chalkWritten', () => {
  rejects(goodTape, (t) => { t.chalkShown[0].extra = 1; t.events[1].notes[0].extra = 1; }, /exactly/);
  rejects(goodTape, (t) => { t.events[1].notes[0].extra = 1; t.chalkShown[0].extra = 1; }, /exactly/);
  rejects(goodTape, (t) => { t.events[1].extra = 'x'; }, /exactly/);
  rejects(goodTape, (t) => { t.events[idxOf(t, 'chalk_write')].extra = 'x'; }, /exactly/);
  rejects(goodTape, (t) => { t.chalkWritten[0].extra = 'x'; }, /exactly/);
  rejects(goodTape, (t) => { const w = t.events[idxOf(t, 'chalk_write')]; w.forgedAs = 'Ash'; }, /unknown player|exactly/);
});

// ---- finding 2: one charset ----------------------------------------------------------------

const HIDDEN = {
  'arabic letter mark U+061C': '؜',
  'mongolian vowel separator U+180E': '᠎',
  'inhibit symmetric swapping U+206A': '⁪',
  'activate symmetric swapping U+206B': '⁫',
  'inhibit arabic form shaping U+206C': '⁬',
  'activate arabic form shaping U+206D': '⁭',
  'national digit shapes U+206E': '⁮',
  'nominal digit shapes U+206F': '⁯',
  'zero width space': '​',
  'right-to-left mark': '‏',
  'bidi override': '‮',
  'bidi isolate': '⁧',
  'word joiner': '⁠',
  BOM: '﻿',
  'soft hyphen': '­',
  'lone high surrogate': '\ud800',
  'lone low surrogate': '\udc00',
};

test('F2: the sanitiser strips every invisible and bidi control character', () => {
  for (const [label, ch] of Object.entries(HIDDEN)) {
    assert.equal(sanitizeChalkText(`go${ch}left`), 'goleft', label);
    assert.equal(sanitizeChalkText(`${ch}${ch}`), '', label);
  }
  assert.equal(sanitizeChalkText('a ؜ b'), 'a b');
});

test('F2: sanitising is idempotent, so a clean note stays clean', () => {
  let seed = 12345;
  const next = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed;
  };
  const pool = ['a', 'b', ' ', '\n', '\t', '\u0085', '؜', '᠎', '⁫', '‮', '​', '\ud83d', '\ude00', '\u{1F600}', '﻿', '­', '\u0000', ' ', 'é'];
  for (let n = 0; n < 4000; n++) {
    const len = next() % 700;
    let s = '';
    for (let k = 0; k < len; k++) s += pool[next() % pool.length];
    const once = sanitizeChalkText(s);
    assert.equal(sanitizeChalkText(once), once, JSON.stringify(s.slice(0, 40)));
    assert.ok(once.length <= rules.CHALK_NOTE_LIMIT);
  }
});

test('F2: the engine never writes an invisible character into chalkWritten', async () => {
  for (const [label, ch] of [['U+061C', '؜'], ['U+180E', '᠎'], ['U+206A', '⁪'], ['U+206F', '⁯']]) {
    const agents = fixedAgents((view) => (view.legalActions.includes('write') ? reply('write', { say: `Go${ch} left${ch}` }) : idle(view)));
    const tape = await runGame({ seed: 3, agents });
    assert.ok(tape.chalkWritten.length > 0, label);
    for (const note of tape.chalkWritten) assert.equal(note.text, 'Go left', label);
    assert.ok(tape.chalkWritten.every((n) => !/[؜᠎⁪-⁯]/.test(n.text)), label);
    validateTape(tape);
  }
});

test('F2: the validator rejects a chalk text the sanitiser would change', () => {
  const dirty = {
    'a bidi mark': 'Go؜ left',
    'a newline': 'Go\nleft',
    'a tab': 'Go\tleft',
    'a trailing space': 'Go left ',
    'a leading space': ' Go left',
    'a double space': 'Go  left',
    'a zero-width space': 'Go​ left',
    'a U+206B': 'Go⁫ left',
    'a lone surrogate': 'Go\ud800 left',
    'a soft hyphen': 'Go­ left',
    'a control character': 'Go\u0007 left',
  };
  for (const [label, text] of Object.entries(dirty)) {
    assert.notEqual(sanitizeChalkText(text), text, label);
    rejects(goodTape, (t) => {
      t.events[idxOf(t, 'chalk_write')].text = text;
      t.chalkWritten[0].text = text;
    }, /sanitis|clean/, `chalk_write ${label}`);
    rejects(goodTape, (t) => {
      t.events[1].notes[0].text = text;
      t.chalkShown[0].text = text;
    }, /sanitis|clean/, `chalk_read ${label}`);
  }
});

test('F2: an over-length chalk_write that otherwise looks clean is still rejected', () => {
  rejects(goodTape, (t) => {
    const text = 'x'.repeat(141);
    t.events[idxOf(t, 'chalk_write')].text = text;
    t.chalkWritten[0].text = text;
  }, /1-140/);
});

test('F2: every legitimately produced note validates, including ones with unusual but clean text', async () => {
  const text = 'Éclair 🙂 日本語: go left, then right!';
  assert.equal(sanitizeChalkText(text), text);
  const agents = fixedAgents((view) => (view.legalActions.includes('write') ? reply('write', { say: text }) : idle(view)));
  const tape = await runGame({ seed: 5, agents, config: { chalk: [{ text, byPlace: 2 }] } });
  assert.ok(tape.chalkWritten.every((n) => n.text === text));
  validateTape(tape);
});

// ---- finding 3: rope reveals need a reach_down ---------------------------------------------

const hasRope = (t) => t.events.some((e) => e.type === 'reveal' && e.what === 'rope');
const pitReveals = (t) => t.events.filter((e) => e.type === 'reveal' && e.what === 'pit');
const ropeTape = await findTape(hasRope);
// A pit round after round 1 where somebody was already out and a base stood at the start, but no rope was thrown.
const pitSetup = (t) => pitReveals(t).find((r, k, all) => r.round > 1 && !hasRope(t) && all[k - 1]?.data.base && all[k - 1].data.out.length > 0);
const plainTape = await findTape((t) => !hasRope(t) && pitSetup(t));

const ropeOf = (t) => t.events.find((e) => e.type === 'reveal' && e.what === 'rope');

test('F3: a genuine rope tape still validates, and its rope has the matching reach_down and pit reveal', () => {
  validateTape(ropeTape);
  const rope = ropeOf(ropeTape);
  assert.equal(rope.data.cost, ROPE_COST_FOOTING);
  assert.ok(ropeTape.events.some((e) => e.type === 'action' && e.name === rope.data.by && e.action === 'reach_down' && e.round === rope.round && e.stage === 'pit'));
});

test('F3: inserting a rope reveal into a tape that had none is rejected', () => {
  const target = pitSetup(plainTape);
  const idx = plainTape.events.indexOf(target);
  const prev = plainTape.events.slice(0, idx).findLast((e) => e.type === 'reveal' && e.what === 'pit');
  const by = prev.data.out[0];
  const saved = prev.data.base;
  // Crude insertion: the rope reveal alone.
  rejects(plainTape, (t) => {
    insertBefore(t, t.events.find((e) => e.i === target.i), { type: 'reveal', stage: 'pit', round: target.round, what: 'rope', data: { by, saved, cost: ROPE_COST_FOOTING } });
  }, /rope/);
  // Careful insertion: the pit reveal agrees too, only the reach_down is missing.
  rejects(plainTape, (t) => {
    const reveal = t.events.find((e) => e.i === target.i);
    reveal.data.roped = by;
    reveal.data.rescued = saved;
    reveal.data.base = null;
    reveal.data.ropeUsed = true;
    reveal.data.out = [...new Set([...reveal.data.out, saved])];
    reveal.data.down = reveal.data.down.filter((n) => n !== saved);
    insertBefore(t, reveal, { type: 'reveal', stage: 'pit', round: target.round, what: 'rope', data: { by, saved, cost: ROPE_COST_FOOTING } });
  }, /reach_down/);
});

test('F3: a rope reveal needs its reach_down: removed, by someone else, or invalid', () => {
  const rope = ropeOf(ropeTape);
  const reach = (t) => t.events.find((e) => e.type === 'action' && e.name === rope.data.by && e.action === 'reach_down' && e.round === rope.round && e.stage === 'pit');
  rejects(ropeTape, (t) => { reach(t).action = 'leave'; }, /reach_down/);
  rejects(ropeTape, (t) => { reach(t).valid = false; }, /reach_down/);
  rejects(ropeTape, (t) => { reach(t).name = t.players.map((p) => p.name).find((n) => n !== rope.data.by && n !== rope.data.saved); }, /reach_down|rope/);
  rejects(ropeTape, (t) => { reach(t).round = rope.round - 1; }, /reach_down/);
});

test('F3: the rope reveal must agree with the pit state around it', () => {
  const rope = ropeOf(ropeTape);
  const others = ropeTape.players.map((p) => p.name).filter((n) => n !== rope.data.by && n !== rope.data.saved);
  rejects(ropeTape, (t) => { ropeOf(t).data.cost = ROPE_COST_FOOTING + 1; }, /cost/);
  rejects(ropeTape, (t) => { ropeOf(t).data.cost = 0; }, /cost/);
  rejects(ropeTape, (t) => { ropeOf(t).data.saved = others[0]; }, /rope|saved|base/);
  rejects(ropeTape, (t) => { ropeOf(t).data.by = rope.data.saved; }, /rope|reach_down|out/);
  rejects(ropeTape, (t) => { ropeOf(t).data.extra = 1; }, /exactly|rope/);
  rejects(ropeTape, (t) => {
    const reveal = t.events.slice(t.events.indexOf(ropeOf(t))).find((e) => e.type === 'reveal' && e.what === 'pit');
    reveal.data.roped = others[0];
  }, /rope|roped/);
  rejects(ropeTape, (t) => {
    const reveal = t.events.slice(t.events.indexOf(ropeOf(t))).find((e) => e.type === 'reveal' && e.what === 'pit');
    reveal.data.rescued = others[0];
  }, /rope|rescued/);
  rejects(ropeTape, (t) => {
    const reveal = t.events.slice(t.events.indexOf(ropeOf(t))).find((e) => e.type === 'reveal' && e.what === 'pit');
    reveal.data.roped = null;
    reveal.data.rescued = null;
  }, /rope|roped/);
});

test('F3: at most one rope reveal per tape, and none in round 1', () => {
  rejects(ropeTape, (t) => {
    const rope = ropeOf(t);
    insertAfter(t, t.events.find((e) => e.i === rope.i), copy({ ...rope, i: 0 }));
  }, /one rope|rope/);
  rejects(ropeTape, (t) => { ropeOf(t).round = 1; }, /rope|reach_down/);
  rejects(ropeTape, (t) => { ropeOf(t).stage = 'crusher'; }, /rope|stage/);
});

test('F3: a pit reveal that claims a rescue without a rope reveal is rejected', () => {
  const target = pitSetup(plainTape);
  rejects(plainTape, (t) => {
    const reveal = t.events.find((e) => e.i === target.i);
    reveal.data.roped = reveal.data.down[0];
    reveal.data.rescued = reveal.data.down[0];
  }, /rope/);
});

// ---- finding 4: the exports the chalk store imports -------------------------------------------

test('F4: sanitizeChalkText and sanitizeChalkNotes are exported with the documented behaviour', () => {
  assert.equal(typeof sanitizeChalkText, 'function');
  assert.equal(typeof sanitizeChalkNotes, 'function');
  assert.equal(sanitizeChalkText(undefined), '');
  assert.equal(sanitizeChalkText({}), '');
  assert.deepEqual(sanitizeChalkNotes([
    { text: 42, byPlace: 1 },
    { text: '؜', byPlace: 1 },
    { text: 'half', byPlace: 1.5 },
    { text: 'zero', byPlace: 0 },
    { text: 'four', byPlace: 4 },
    { text: 'ok؜ one', byPlace: 1 },
    { text: 'two', byPlace: 2 },
    { text: 'three', byPlace: 3 },
    { text: 'four', byPlace: 3 },
  ]), [
    { text: 'ok one', byPlace: 1 },
    { text: 'two', byPlace: 2 },
    { text: 'three', byPlace: 3 },
  ]);
  assert.equal(rules.isCleanChalkText('fine'), true);
  assert.equal(rules.isCleanChalkText('not؜ fine'), false);
  assert.equal(rules.isCleanChalkText(''), false);
  assert.equal(rules.isCleanChalkText(7), false);
});
