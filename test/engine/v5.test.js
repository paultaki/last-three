import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game, SEATS } from '../../src/game.js';
import { runGame } from '../../src/engine.js';
import { runBridge } from '../../src/stages/bridge.js';
import { runCrusher } from '../../src/stages/crusher.js';
import { runPit } from '../../src/stages/pit.js';
import { runVote } from '../../src/stages/vote.js';
import { runJury, scoreJury } from '../../src/stages/jury.js';
import { runPacts } from '../../src/social.js';
import { buildDossier } from '../../src/dossier.js';
import { JURY_DOSSIER_LIMIT } from '../../src/rules.js';
import { createScriptedAgents } from '../../src/scripted.js';
import { validateTape } from '../../src/tape.js';
import { fixedAgents, reply } from './helpers.js';

const events = (g, type) => g.events.filter(e => e.type === type);
const idle = v => reply(v.legalActions[0]);
const game = (policy = idle, seed = 1, alive = SEATS) => {
  const g = new Game({ seed, agents: fixedAgents(policy) });
  g.alive = new Set(alive);
  return g;
};
const bridgePolicy = v => {
  if (v.phase === 'guide_vote' || v.phase === 'guide_revote') return reply('guide_vote:Ash');
  if (v.phase === 'guide_call') return reply(`call:${v.privateKnowledge[v.round - 1].slice(-1)}`);
  if (v.phase === 'crossing') return reply(`step:${v.stageState.guideCall}`);
  return idle(v);
};

test('v5 truthful Guide is safe, privately knows all panes and calls before the walker', async () => {
  const views = [];
  const g = game(v => { views.push(v); return bridgePolicy(v); });
  await runBridge(g);
  assert.equal(g.alive.size, 8);
  assert.equal(events(g, 'guide_elected')[0].name, 'Ash');
  assert.equal(events(g, 'guide_call').length, 8);
  for (const v of views) {
    assert.equal(v.privateKnowledge.length, v.you === 'Ash' && v.phase !== 'campaign' && !v.phase.startsWith('guide_v') ? 8 : 0);
    assert.ok(!v.line.includes('Ash'));
    if (v.phase === 'crossing') assert.ok(['L', 'R'].includes(v.stageState.guideCall));
    if (v.phase === 'counter_call' && v.you === v.stageState.front) assert.ok(v.publicLog.some(l => l.includes('guide_call')));
  }
  assert.ok(events(g, 'action').filter(e => e.action.startsWith('step:')).every(e => e.name !== 'Ash'));
});

test('v5 Guide tie: public re-vote, then deterministic seeded choice among tied only', async () => {
  const run = async seed => {
    const g = game(v => {
      if (v.phase === 'guide_vote' || v.phase === 'guide_revote') return reply(`guide_vote:${SEATS.indexOf(v.you) % 2 ? 'Bex' : 'Ash'}`);
      if (v.phase === 'guide_call') return reply(`call:${v.privateKnowledge[v.round - 1].slice(-1)}`);
      return v.phase === 'crossing' ? reply(`step:${v.stageState.guideCall}`) : idle(v);
    }, seed);
    await runBridge(g);
    return g;
  };
  const a = await run(7), b = await run(7);
  assert.deepEqual(a.events, b.events);
  assert.equal(events(a, 'guide_vote').length, 16);
  assert.equal(events(a, 'guide_elected')[0].method, 'seeded');
  assert.ok(['Ash', 'Bex'].includes(a.guide));
});

test('v5 false Guide call breaks a walker pact; counter-call reaches walker before decision', async () => {
  const g = game(v => {
    if (v.phase === 'guide_call') return reply(`call:${v.privateKnowledge[v.round - 1].endsWith('L') ? 'R' : 'L'}`);
    if (v.phase === 'counter_call') return reply('counter:L');
    if (v.phase === 'waiting' && v.you === 'Bex') return reply('volunteer');
    return bridgePolicy(v);
  });
  g.formPact('Ash', 'Bex');
  await runBridge(g);
  assert.equal(events(g, 'pact_broken')[0].reason, 'false_guide_call');
  assert.equal(events(g, 'pact_broken')[0].by, 'Ash');
  assert.ok(events(g, 'counter_call').length > 0);
  assert.equal(g.alive.size, 3);
  assert.equal(events(g, 'last_words').length, 5);
  assert.ok(g.alive.has('Ash'));
});

test('v5 pacts require public offer then acceptance; explicit break is public', async () => {
  const g = game(v => reply(v.round === 1 && v.you === 'Ash' ? 'offer_pact:Bex' : v.round === 2 && v.you === 'Bex' ? 'accept_pact:Ash' : 'wait'));
  await runPacts(g, 'opening');
  assert.equal(events(g, 'pact_offer').length, 1);
  assert.deepEqual(events(g, 'pact_formed')[0].members, ['Ash', 'Bex']);
  g.agents = fixedAgents(v => reply(v.you === 'Ash' ? 'break_pact:Bex' : 'wait'));
  await runPacts(g, 'bridge');
  assert.equal(events(g, 'pact_broken')[0].reason, 'explicit');
  assert.equal(events(g, 'pact_broken')[0].visibility, 'public');
});

test('v5 lever push breaks even when volunteer wins; every escapee owes holder', async () => {
  const g = game(v => reply(v.you === 'Ash' ? 'push_lever:Bex' : v.you === 'Cole' ? 'hold_lever' : 'stay'));
  g.formPact('Ash', 'Bex');
  await runCrusher(g);
  assert.equal(events(g, 'pact_broken')[0].reason, 'push_lever');
  assert.deepEqual(events(g, 'life_debt').map(e => [e.debtor, e.creditor, e.reason]), SEATS.filter(n => n !== 'Cole').map(n => [n, 'Cole', 'lever']));
  assert.ok(!events(g, 'action').some(e => e.action === 'jam_lever'));
});

test('v5 crusher deadline keeps at least three, five last words, spectators receive public only', async () => {
  const received = [];
  const g = game(v => reply(v.phase === 'last_words' ? 'speak' : 'stay', { say: 'You will answer for this.' }));
  for (const a of Object.values(g.agents)) a.observe = e => received.push(e);
  await runCrusher(g);
  assert.equal(g.alive.size, 3);
  assert.equal(events(g, 'last_words').length, 5);
  assert.equal(events(g, 'jury_box_enter').length, 5);
  assert.ok(received.length && received.every(e => e.visibility === 'public'));
});

const rescuePolicy = throwRound => v => {
  if (v.phase === 'last_words') return reply('speak');
  if (v.you === 'Ash' && v.legalActions.includes('offer_back')) return reply('offer_back');
  if (v.you === 'Dara' && v.round === 1) return reply('wait');
  if (v.you === 'Bex' && v.round === throwRound) return reply('reach_down');
  return reply(['climb_last', 'climb', 'leave', 'wait'].find(a => v.legalActions.includes(a)) ?? 'wait');
};

test('v5 early rope: rescuer anchors on floor then climbs last in a later round', async () => {
  const g = game(rescuePolicy(2), 2, SEATS.slice(0, 4));
  await runPit(g);
  const rope = events(g, 'reveal').find(e => e.what === 'rope');
  assert.deepEqual(rope.data, { by: 'Bex', saved: 'Ash', anchor: 'Bex' });
  const pits = events(g, 'reveal').filter(e => e.what === 'pit');
  assert.ok(pits[1].data.down.includes('Bex'));
  assert.equal(pits.at(-1).data.anchorOut, 'Bex');
  assert.equal(pits.at(-1).round, 3);
  assert.equal(g.alive.size, 4);
  assert.ok(events(g, 'life_debt').some(e => e.debtor === 'Ash' && e.creditor === 'Bex' && e.reason === 'rope'));
});

test('v5 late rope drowns the anchor without a save when three are already out', async () => {
  const g = game(rescuePolicy(5), 2, SEATS.slice(0, 4));
  await runPit(g);
  assert.deepEqual(events(g, 'death').map(e => e.name), ['Bex']);
  assert.equal(events(g, 'lucky_save').length, 0);
  assert.equal(events(g, 'last_words').length, 1);
});

test('v5 pushing pit partner breaks pact, climbing incurs debt; rope refusal does not', async () => {
  const g = game(v => reply(v.round === 1 && v.you === 'Bex' ? 'push_base:Ash' : v.legalActions.includes('climb') ? 'climb' : v.legalActions[0]), 2, SEATS.slice(0, 4));
  g.formPact('Ash', 'Bex');
  g.formPact('Ash', 'Cole');
  await runPit(g);
  assert.deepEqual(events(g, 'pact_broken').map(e => [e.by, e.reason]), [['Bex', 'push_base']]);
  assert.equal(events(g, 'life_debt').filter(e => e.reason === 'step').length, 3);
});

test('v5 vote locks ballots, re-votes only non-tied, and sequentially reduces five to three', async () => {
  const views = [];
  const g = game(v => {
    views.push(v);
    if (v.phase === 'ballot') return reply(`vote:${v.you === 'Ash' ? 'Bex' : 'Ash'}`, { thought: 'Ash is my strongest rival. I want the prize.' });
    if (v.phase === 'revote') return reply(v.legalActions[0], { thought: 'This breaks the tie.' });
    return idle(v);
  }, 8, SEATS.slice(0, 5));
  g.formPact('Ash', 'Bex');
  await runVote(g);
  assert.equal(events(g, 'vote_result').length, 2);
  assert.equal(g.alive.size, 3);
  assert.equal(events(g, 'death').length, 2);
  assert.equal(events(g, 'pact_broken')[0].reason, 'vote');
  const first = views.filter(v => v.phase === 'ballot' && v.stageState.elimination === 1);
  assert.ok(first.every(v => !v.publicLog.some(l => l.includes('vote_reveal'))));
  assert.ok(events(g, 'vote_reveal').every(e => e.reason.split('.').filter(Boolean).length === 1));
  assert.ok(views.filter(v => v.phase === 'ballot' && v.stageState.elimination === 2).every(v => !v.alive.includes('Ash')));
});

test('v5 vote tie with all tied skips empty runoff and uses seeded tie-break', async () => {
  const run = async seed => {
    const g = game(v => v.phase === 'ballot' ? reply(`vote:${v.alive[(v.alive.indexOf(v.you) + 1) % v.alive.length]}`, { thought: 'A rival must go.' }) : idle(v), seed, SEATS.slice(0, 4));
    await runVote(g);
    return g;
  };
  const a = await run(9), b = await run(9);
  assert.deepEqual(a.events, b.events);
  assert.equal(events(a, 'vote_result')[0].method, 'seeded');
  assert.equal(events(a, 'vote_reveal').length, 4);
});

test('v5 jury Borda count, first-place tie-break, and seeded final tie', () => {
  const finalists = ['Ash', 'Bex', 'Cole'];
  const g = game();
  const result = scoreJury(g, finalists, [
    ['Ash', 'Bex', 'Cole'], ['Ash', 'Bex', 'Cole'], ['Bex', 'Cole', 'Ash'], ['Cole', 'Bex', 'Ash'],
  ]);
  assert.deepEqual(result.scores, { Ash: 8, Bex: 9, Cole: 7 });
  assert.equal(result.ranking[0], 'Bex');
  const tie = scoreJury(game(), finalists, [['Ash', 'Bex', 'Cole'], ['Ash', 'Bex', 'Cole'], ['Bex', 'Cole', 'Ash']]);
  assert.equal(tie.scores.Ash, tie.scores.Bex);
  assert.equal(tie.ranking[0], 'Ash');
  const ranks = [['Ash', 'Bex', 'Cole'], ['Bex', 'Cole', 'Ash'], ['Cole', 'Ash', 'Bex']];
  assert.deepEqual(scoreJury(game(idle, 8), finalists, ranks), scoreJury(game(idle, 8), finalists, ranks));
});

test('v5 dossier includes concerning private evidence, omits unrelated secrets and caps deterministically', () => {
  const tape = [
    { i: 0, type: 'thought', name: 'Dara', text: 'Private unrelated.', visibility: 'private' },
    { i: 1, type: 'whisper', from: 'Dara', to: 'Eli', text: 'Ash is lying.', visibility: 'private' },
    { i: 2, type: 'thought', name: 'Ash', text: 'I lied.', visibility: 'private' },
  ];
  const small = buildDossier(tape, 'Hana', ['Ash', 'Bex', 'Cole']);
  assert.ok(!small.text.includes('Private unrelated'));
  assert.ok(small.text.includes('Ash is lying') && small.text.includes('I lied'));
  for (let i = 3; i < 500; i++) tape.push({ i, type: 'say', name: 'Dara', text: 'chatter '.repeat(35), visibility: 'public' });
  tape.push({ i: 500, type: 'pact_broken', by: 'Ash', members: ['Ash', 'Hana'], reason: 'vote', visibility: 'public' });
  const a = buildDossier(tape, 'Hana', ['Ash', 'Bex', 'Cole']);
  assert.ok(a.text.length <= JURY_DOSSIER_LIMIT && a.omitted > 0);
  assert.ok(a.text.includes('pact_broken') && a.text.includes('I lied'));
  assert.deepEqual(a, buildDossier(tape, 'Hana', ['Ash', 'Bex', 'Cole']));
});

test('v5 full scripted game is deterministic, bounded, no removed mechanics, exactly three places', async () => {
  for (let seed = 1; seed <= 20; seed++) {
    const a = await runGame({ seed, agents: createScriptedAgents(seed) });
    const b = await runGame({ seed, agents: createScriptedAgents(seed) });
    assert.deepEqual(a, b);
    validateTape(a);
    assert.equal(a.rulesVersion, 5);
    assert.deepEqual(a.result.places.filter(p => p.place).map(p => p.place).sort(), [1, 2, 3]);
    assert.equal(a.result.deaths.length, 5);
    assert.equal(events(a, 'intro_motive').length, 8);
    assert.equal(events(a, 'last_words').length, 5);
    assert.equal(events(a, 'jury_ballot').length, 5);
    assert.ok(!a.players.some(p => 'power' in p));
    assert.ok(!a.events.some(e => ['ledge', 'disc', 'chalk'].includes(e.stage) || e.type === 'ability_use' || e.forgedAs));
  }
});

test('v5 Guide runoff can resolve by votes without random selection', async () => {
  const g = game(v => {
    if (v.phase === 'guide_vote') return reply(`guide_vote:${SEATS.indexOf(v.you) % 2 ? 'Bex' : 'Ash'}`);
    if (v.phase === 'guide_revote') return reply('guide_vote:Bex');
    return bridgePolicy(v);
  });
  await runBridge(g);
  assert.equal(g.guide, 'Bex');
  assert.equal(events(g, 'guide_elected')[0].method, 'revote');
});

for (const tiedAgain of [false, true]) test(`v5 trapdoor runoff is restricted to non-tied voters, remaining tie=${tiedAgain}`, async () => {
  const views = [];
  const g = game(v => {
    views.push(v);
    if (v.phase === 'ballot') return reply(`vote:${['Ash', 'Bex'].includes(v.you) ? 'Cole' : 'Ash'}`, { thought: 'This rival should fall.' });
    if (v.phase === 'revote') return reply(`vote:${tiedAgain && v.you === 'Dara' ? 'Cole' : 'Ash'}`, { thought: 'I have made my choice.' });
    return idle(v);
  }, 14, SEATS.slice(0, 4));
  await runVote(g);
  const runoff = views.filter(v => v.phase === 'revote');
  assert.deepEqual(runoff.map(v => v.you), ['Bex', 'Dara']);
  assert.ok(runoff.every(v => v.legalActions.join() === 'vote:Ash,vote:Cole'));
  assert.equal(events(g, 'vote_result')[0].method, tiedAgain ? 'seeded' : 'revote');
  if (!tiedAgain) assert.equal(events(g, 'death')[0].name, 'Ash');
});

test('v5 offers cannot be accepted before heard, do not survive a window, and allow multiple partners', async () => {
  const g = game(v => reply(v.you === 'Ash' ? 'offer_pact:Bex' : v.you === 'Bex' ? 'accept_pact:Ash' : 'wait'));
  await runPacts(g, 'opening');
  assert.equal(events(g, 'action').find(e => e.name === 'Bex' && e.round === 1).valid, false);
  assert.equal(events(g, 'pact_formed').length, 1);
  assert.ok(g.formPact('Ash', 'Cole'));
  assert.ok(!g.formPact('Cole', 'Ash'));
  assert.deepEqual(g.partners('Ash'), ['Bex', 'Cole']);
  g.breakPact('Bex', 'Ash', 'explicit');
  g.agents = fixedAgents(v => reply(v.you === 'Bex' ? 'accept_pact:Ash' : 'wait'));
  await runPacts(g, 'bridge');
  assert.equal(events(g, 'pact_formed').length, 2, 'expired offer cannot form another pact');
});

test('v5 explicit break consumes a turn and uses a safe physical fallback', async () => {
  const g = game(v => reply(v.you === 'Bex' ? 'hold_lever' : v.you === 'Ash' ? 'break_pact:Bex' : 'stay'));
  g.formPact('Ash', 'Bex');
  await runCrusher(g);
  const broken = events(g, 'pact_broken');
  assert.deepEqual(broken.map(e => [e.by, e.reason]), [['Ash', 'explicit']]);
  assert.ok(events(g, 'action').some(e => e.name === 'Ash' && e.action === 'break_pact:Bex' && e.valid));
});

test('v5 rope also saves later climbers; anchor cannot climb while another remains at round start', async () => {
  const views = [];
  const g = game(v => {
    views.push(v);
    if (v.round === 1 && v.you === 'Dara') return reply('wait');
    if (v.round === 1 && v.you === 'Eli') return reply('wait');
    if (v.round <= 2 && v.you === 'Fenn') return reply('wait');
    return rescuePolicy(2)(v);
  }, 2, SEATS.slice(0, 6));
  await runPit(g);
  assert.ok(events(g, 'life_debt').some(e => e.debtor === 'Fenn' && e.creditor === 'Bex' && e.reason === 'rope'));
  assert.deepEqual(views.find(v => v.you === 'Bex' && v.round === 3).legalActions, ['wait']);
  assert.ok(events(g, 'reveal').find(e => e.what === 'pit' && e.round === 4).data.anchorOut === 'Bex');
  assert.equal(g.alive.size, 6);
});

test('v5 pit floor always keeps three even when nobody climbs', async () => {
  const g = game(v => reply(v.phase === 'last_words' ? 'speak' : 'wait'));
  await runPit(g);
  assert.equal(g.alive.size, 3);
  assert.equal(events(g, 'lucky_save').length, 3);
  assert.equal(events(g, 'death').length, 5);
  assert.equal(events(g, 'last_words').length, 5);
});

test('v5 jury asks each fallen player once, answers immediately, and places all finalists alive', async () => {
  const views = [];
  const g = game(v => {
    views.push(v);
    if (v.phase === 'question') return reply('question:Ash', { say: 'Who did you betray?' });
    if (v.phase === 'ranking') return reply('rank:Cole>Ash>Bex', { thought: 'Cole earned my respect.' });
    return reply(v.legalActions[0], { say: 'I made a choice.' });
  });
  g.stage = 'vote'; g.round = 1;
  for (const name of SEATS.slice(3)) g.kill(name, { cause: 'trapdoor', style: 'chute' });
  await g.finishEliminations();
  g.stage = null;
  await runJury(g);
  const questions = views.filter(v => v.phase === 'question');
  assert.deepEqual(questions.map(v => v.you), SEATS.slice(3));
  assert.ok(questions.every(v => v.dossier.text.length > 0 && v.juryBox.includes(v.you)));
  const testimony = views.filter(v => ['question', 'answer'].includes(v.phase));
  assert.deepEqual(testimony.map(v => v.phase), Array(5).fill(['question', 'answer']).flat());
  assert.ok(views.filter(v => v.alive.includes(v.you)).every(v => !v.dossier));
  assert.equal(g.alive.size, 3);
  assert.deepEqual([...g.places], [['Cole', 1], ['Ash', 2], ['Bex', 3]]);
});

test('v5 invalid ballot reasons and rankings default deterministically and disclose missing reasons', async () => {
  const g = game(v => reply(v.phase === 'ballot' ? 'vote:self' : v.legalActions[0]), 4, SEATS.slice(0, 4));
  await runVote(g);
  assert.ok(events(g, 'vote_reveal').every(e => /No reason supplied/.test(e.reason)));
  assert.ok(events(g, 'action').filter(e => e.phase === 'ballot').every(e => !e.valid && /engine fallback/.test(e.note)));
});

test('v5 all line caps truncate words including intros, whispers and last words', async () => {
  const text = Array(40).fill('word').join(' ');
  const g = game(v => reply(v.legalActions[0], { say: text, thought: text, whisper: { to: v.you === 'Ash' ? 'Bex' : 'Ash', text } }));
  const { runOpening } = await import('../../src/social.js');
  await runOpening(g);
  await runCrusher(g);
  assert.ok(events(g, 'intro_motive').every(e => e.text.split(' ').length === 25));
  assert.ok(events(g, 'say').every(e => e.text.split(' ').length === 25));
  assert.ok(events(g, 'whisper').every(e => e.text.split(' ').length === 15));
  assert.ok(events(g, 'last_words').every(e => e.text.split(' ').length === 20));
});

test('v5 eliminated spectators receive all later public events and cannot act in hazards', async () => {
  const observed = [];
  const g = game();
  g.agents.Hana.observe = e => { observed.push(structuredClone(e)); e.type = 'corrupted'; };
  g.stage = 'bridge'; g.round = 1;
  g.kill('Hana', { cause: 'glass', style: 'shatter' });
  await g.finishEliminations();
  const first = g.events.length;
  g.emit('thought', { name: 'Ash', text: 'Do not show this yet.' });
  g.emit('whisper', { from: 'Ash', to: 'Bex', text: 'Private.' });
  g.emit('say', { name: 'Ash', text: 'You can hear this.' });
  assert.deepEqual(observed.filter(e => e.i >= first).map(e => e.type), ['say']);
  assert.ok(g.spectatorInbox.get('Hana').includes(g.events.at(-1).i));
  assert.equal(g.events.at(-1).type, 'say');
  await assert.rejects(g.ask(['Hana'], () => ({ phase: 'crossing', legalActions: ['step:L'] }), () => 'step:L'), /Spectator/);
});

test('v5 dossier associates unnamed private intent with that turn target only', () => {
  const tape = [
    { i: 0, type: 'round_start', phase: 'ballot', visibility: 'public' },
    { i: 1, type: 'thought', name: 'Dara', phase: 'ballot', text: 'They deserve it.', visibility: 'private' },
    { i: 2, type: 'action', name: 'Dara', phase: 'ballot', action: 'vote:Ash', visibility: 'private' },
    { i: 3, type: 'round_start', phase: 'ballot', visibility: 'public' },
    { i: 4, type: 'thought', name: 'Dara', phase: 'ballot', text: 'Unrelated later secret.', visibility: 'private' },
    { i: 5, type: 'action', name: 'Dara', phase: 'ballot', action: 'vote:Eli', visibility: 'private' },
  ];
  const d = buildDossier(tape, 'Hana', ['Ash', 'Bex', 'Cole']);
  assert.ok(d.text.includes('They deserve it'));
  assert.ok(!d.text.includes('Unrelated later secret'));
});

test('v5 silent finalists still have recorded pleas, answers and closing lines; last-word thoughts stay private', async () => {
  const t = await runGame({ seed: 1, agents: fixedAgents(v => reply(v.legalActions[0], { thought: 'I keep my reasons private.' })) });
  const pleas = t.events.filter(e => e.type === 'say' && ['opening_plea', 'closing'].includes(e.phase));
  assert.equal(pleas.length, 6);
  assert.ok(pleas.every(e => e.text === '[silence]'));
  const finalThoughts = t.events.filter(e => e.type === 'thought' && e.phase === 'last_words');
  assert.equal(finalThoughts.length, 5);
  assert.ok(finalThoughts.every(e => e.visibility === 'private'));
  validateTape(t);
});

test('v5 waiting order keeps mutual swaps then seat-ordered volunteers, with Guide excluded', async () => {
  const views = [];
  let initial;
  const g = game(v => {
    views.push(v);
    if (v.phase === 'waiting' && v.round === 1) {
      initial ??= [...v.line];
      if (v.you === 'Bex') return reply('swap:Cole');
      if (v.you === 'Cole') return reply('swap:Bex');
      if (v.you === 'Dara' || v.you === 'Hana') return reply('volunteer');
    }
    return bridgePolicy(v);
  });
  await runBridge(g);
  const expected = [...initial];
  const a = expected.indexOf('Bex'), b = expected.indexOf('Cole');
  [expected[a], expected[b]] = [expected[b], expected[a]];
  for (const name of ['Dara', 'Hana']) { expected.splice(expected.indexOf(name), 1); expected.unshift(name); }
  assert.deepEqual(views.find(v => v.phase === 'waiting' && v.round === 2).line, expected);
  const firstCounters = views.filter(v => v.phase === 'counter_call' && v.round === 1);
  assert.deepEqual(firstCounters.map(v => v.you), SEATS, 'anyone may counter-call');
});
