import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runGame } from '../../src/engine.js';
import { runBridge } from '../../src/stages/bridge.js';
import { fixedAgents, idle, makeGame, ofType, powersWith, reply, spy } from './helpers.js';

const opposite = (side) => (side === 'L' ? 'R' : 'L');

async function playIdle(powers, { seed = 3, policy = idle } = {}) {
  const views = [];
  const tape = await runGame({ seed, agents: fixedAgents(spy(policy, views)), config: { powers: powersWith(powers) } });
  return { tape, views };
}

test('glass_eye: only the holder is told the safe side of all 8 rows, and the rows are correct', async () => {
  const { tape, views } = await playIdle({ Cole: 'glass_eye' });
  const safeRows = ofType(tape.events, 'reveal').filter((e) => e.what === 'weak_pane').map((e) => opposite(e.data.weak));
  for (const v of views) {
    const rows = v.privateKnowledge.filter((k) => /safe side/.test(k));
    if (v.you === 'Cole' && v.stage === 'bridge') {
      assert.equal(rows.length, 8);
      safeRows.forEach((side, k) => assert.equal(rows[k], `Row ${k + 1} safe side: ${side}`));
    } else {
      assert.equal(rows.length, 0, `${v.you} in ${v.stage} must not see safe sides`);
    }
  }
});

test('map: the holder gets the rules of all four stages at the start; nobody else gets any', async () => {
  const { views } = await playIdle({ Fenn: 'map' });
  const first = views.find((v) => v.you === 'Fenn');
  assert.equal(first.privateKnowledge.length, 4);
  ['bridge', 'crusher', 'disc', 'ledge'].forEach((stage, k) => assert.match(first.privateKnowledge[k], new RegExp(`Stage ${k + 1} rules \\(${stage}`)));
  assert.ok(views.filter((v) => v.you !== 'Fenn').every((v) => !v.privateKnowledge.some((k) => /^Stage \d rules/.test(k))));
  assert.match(first.privateKnowledge[0], /volunteer/);
  assert.match(first.privateKnowledge[3], /footing/i);
});

const forgeEveryRound = (forge) => (view) => (view.you === 'Dara' && view.stage === 'bridge' && view.phase === 'waiting' ? reply('hold', { forge: forge(view) }) : idle(view));

test('forger: a public forgery is delivered exactly once as the forged name; the tape keeps the real sender', async () => {
  const { tape, views } = await playIdle({ Dara: 'forger' }, { policy: forgeEveryRound(() => ({ as: 'Cole', to: 'all', text: 'I will go first, follow me.' })) });
  const forged = ofType(tape.events, 'say').filter((e) => e.forgedAs);
  assert.deepEqual(forged.map((e) => [e.name, e.forgedAs, e.round]), [['Dara', 'Cole', 1]]);
  const used = ofType(tape.events, 'ability_use').filter((e) => e.power === 'forger');
  assert.equal(used.length, 1);
  const ash = views.filter((v) => v.you === 'Ash');
  const lines = ash.flatMap((v) => v.publicLog).filter((l) => l.includes('follow me'));
  assert.deepEqual(lines, ['Cole: I will go first, follow me.']);
  const later = ofType(tape.events, 'action').filter((a) => a.name === 'Dara' && a.round >= 2 && a.stage === 'bridge' && a.note);
  assert.ok(later.some((a) => /forge ignored: the forge is already spent/.test(a.note)));
  assert.equal(views.find((v) => v.you === 'Dara' && v.round === 6 && v.phase === 'waiting').powerSpent, true);
});

test('forger: a forged whisper reaches only its recipient, who sees the forged name', async () => {
  const { tape, views } = await playIdle({ Dara: 'forger' }, { policy: forgeEveryRound(() => ({ as: 'Cole', to: 'Eli', text: 'Meet me at the front.' })) });
  const whispers = ofType(tape.events, 'whisper');
  assert.deepEqual(whispers.map((w) => [w.from, w.to, w.forgedAs]), [['Dara', 'Eli', 'Cole']]);
  const received = views.flatMap((v) => v.whispersToYou.map((w) => [v.you, w.from, w.text]));
  assert.deepEqual(received, [['Eli', 'Cole', 'Meet me at the front.']]);
  assert.ok(!views.flatMap((v) => v.publicLog).some((l) => l.includes('Meet me')));
});

test('forger: forging as yourself, a dead agent, with bad text or a bad recipient is ignored and does not spend the forge', async () => {
  const attempts = [
    { as: 'Dara', to: 'all', text: 'x' },
    { as: 'Nobody', to: 'all', text: 'x' },
    { as: 'Cole', to: 'all', text: '' },
    { as: 'Cole', to: 'Dara', text: 'x' },
    { as: 'Cole', to: 'Cole', text: 'x' },
    { as: 'Cole', to: 'all', text: 'finally' },
  ];
  const { tape } = await playIdle({ Dara: 'forger' }, { policy: forgeEveryRound((view) => attempts[view.round - 1]) });
  const notes = ofType(tape.events, 'action').filter((a) => a.name === 'Dara' && a.round <= 5 && a.stage === 'bridge').map((a) => a.note);
  assert.equal(notes.filter((n) => /forge ignored/.test(n)).length, 5);
  assert.deepEqual(ofType(tape.events, 'say').filter((e) => e.forgedAs).map((e) => [e.round, e.text]), [[6, 'finally']]);
});

test('forge from anyone except the forger holder is ignored and logged', async () => {
  const { tape } = await playIdle({ Dara: 'nothing', Eli: 'forger' }, { policy: (v) => (v.you === 'Dara' ? reply('hold', { forge: { as: 'Cole', to: 'all', text: 'boo' } }) : idle(v)) });
  assert.equal(ofType(tape.events, 'say').filter((e) => e.forgedAs).length, 0);
  assert.equal(ofType(tape.events, 'ability_use').filter((e) => e.power === 'forger').length, 0);
  const note = ofType(tape.events, 'action').find((a) => a.name === 'Dara' && a.round === 1).note;
  assert.match(note, /forge ignored: you are not the forger/);
});

test('feather: cancels the first elimination anywhere and not the second', async () => {
  const g = makeGame({ powers: { Gus: 'feather' } });
  g.stage = 'bridge';
  const first = g.eliminate(['Gus'], { cause: 'glass', style: 'shatter', featherDetail: 'caught' });
  assert.deepEqual([first.died, first.saved], [[], ['Gus']]);
  assert.ok(g.alive.has('Gus') && g.spent.has('Gus'));
  g.stage = 'disc';
  const second = g.eliminate(['Gus'], { cause: 'trapdoor', style: 'chute', featherDetail: 'caught' });
  assert.deepEqual(second.died, ['Gus']);
  assert.ok(!g.alive.has('Gus'));
  assert.equal(ofType(g.events, 'ability_use').length, 1);
});

test('feather beats the floor rule: the holder is saved by the feather and no lucky_save is spent', async () => {
  const g = makeGame({ powers: { Gus: 'feather' }, dead: ['Bex', 'Cole', 'Dara', 'Eli', 'Fenn', 'Hana'] });
  g.stage = 'crusher';
  const result = g.eliminate(['Ash', 'Gus'], { cause: 'crusher', style: 'flatten', featherDetail: 'caught', luckyWhy: 'luck' });
  assert.deepEqual([result.died, result.saved], [['Ash'], ['Gus']]);
  assert.equal(ofType(g.events, 'lucky_save').length, 0);
});

test('lucky_save does not spend anyone\'s feather', async () => {
  const g = makeGame({ powers: { Gus: 'feather' }, dead: ['Bex', 'Cole', 'Dara', 'Eli', 'Fenn', 'Gus', 'Hana'] });
  g.stage = 'crusher';
  const result = g.eliminate(['Ash'], { cause: 'crusher', style: 'flatten', featherDetail: 'caught', luckyWhy: 'a crate jams the ceiling' });
  assert.deepEqual(result.saved, ['Ash']);
  assert.equal(ofType(g.events, 'lucky_save').length, 1);
  assert.equal(g.spent.size, 0);
});

test('powerSpent in the view turns true after the power is used', async () => {
  const views = [];
  const g = makeGame({ powers: { Hana: 'feather' }, agents: fixedAgents(spy(idle, views)) });
  await runBridge(g);
  assert.ok(views.filter((v) => v.you === 'Hana').every((v) => v.powerSpent === false));
  g.spent.add('Hana');
  assert.equal(g.view('Hana', { phase: 'x', legalActions: [], rules: '' }).powerSpent, true);
});
