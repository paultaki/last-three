import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { runGame } from '../../src/engine.js';
import { createScriptedAgents } from '../../src/scripted.js';
import { validateTape } from '../../src/tape.js';
import { buildDossier } from '../../src/dossier.js';
import { computeStats } from '../../src/stats.js';

const base = await runGame({ seed: 1, agents: createScriptedAgents(1) });
const first = (t, type) => t.events.find(e => e.type === type);
const reject = (mutate, pattern) => {
  const t = structuredClone(base);
  mutate(t);
  assert.throws(() => validateTape(t), pattern);
};

test('v5 validator accepts the default game and all shipped historical tapes without mutation', () => {
  validateTape(base);
  const dir = new URL('../../web/tapes/', import.meta.url);
  const versions = new Set();
  let count = 0;
  for (const file of readdirSync(dir).filter(n => n.endsWith('.json') && !['index.json', 'stats.json'].includes(n))) {
    const tape = JSON.parse(readFileSync(new URL(file, dir), 'utf8'));
    validateTape(tape);
    versions.add(tape.rulesVersion ?? 1);
    count++;
  }
  assert.ok(count >= 113);
  for (const version of [1, 2, 3, 4]) assert.ok(versions.has(version));
  assert.ok([...versions].every(version => [1, 2, 3, 4, 5, 6].includes(version)));
});

test('v5 validator rejects legacy stages, assignments, bad visibility, and jury box leakage', () => {
  reject(t => { t.players[0].power = 'feather'; }, /no power/);
  reject(t => { first(t, 'say').forgedAs = 'Bex'; }, /removed mechanic/);
  reject(t => { first(t, 'stage_start').stage = 'ledge'; }, /bad stage/);
  reject(t => { first(t, 'thought').visibility = 'public'; }, /visibility/);
  reject(t => { first(t, 'jury_ballot').visibility = 'public'; }, /visibility/);
  reject(t => { first(t, 'say').spectators.push('Ash'); }, /spectators/);
  reject(t => { first(t, 'jury_box_enter').deathEvent = 0; }, /jury box/);
});

test('v5 validator rejects missing or duplicate camera lines and dead non-jury actions', () => {
  reject(t => { first(t, 'last_words').deathEvent = 0; }, /last_words/);
  reject(t => { first(t, 'last_words').text = Array(21).fill('x').join(' '); }, /line cap/);
  reject(t => { first(t, 'intro_motive').text = Array(26).fill('x').join(' '); }, /line cap/);
  reject(t => {
    const death = first(t, 'death');
    const at = t.events.findIndex(e => e.i > death.i && e.type === 'action' && e.phase !== 'last_words');
    t.events[at].name = death.name;
  }, /acts after dying/);
  reject(t => { first(t, 'last_words').name = t.result.places.find(p => p.place).name; }, /last_words/);
});

test('v5 validator rejects forged election tallies, self-votes and jury score/order tampering', () => {
  reject(t => { first(t, 'guide_elected').tallies.Ash += 100; }, /Election tally/);
  reject(t => { const e = first(t, 'vote_reveal'); e.target = e.name; }, /vote reveal/);
  reject(t => { first(t, 'jury_ballot').ranking = ['Ash', 'Ash', 'Ash']; }, /names|jury ballot/);
  reject(t => { first(t, 'jury_result').scores[first(t, 'jury_result').ranking[0]]++; }, /scoring/);
  reject(t => { first(t, 'jury_result').ranking.reverse(); }, /scoring/);
  reject(t => { t.result.places.find(p => p.place === 1).place = 3; }, /Result places/);
});

test('v5 dossier validator rejects private evidence edits and excess length', () => {
  reject(t => { first(t, 'jury_dossier').text += ' Fabricated evidence.'; }, /dossier/);
  reject(t => { first(t, 'jury_dossier').text = 'x'.repeat(16001); }, /dossier/);
  reject(t => { first(t, 'jury_dossier').sourceThrough--; }, /dossier/);
  reject(t => {
    const record = first(t, 'jury_dossier').text.split('\n').slice(1).map(line => JSON.parse(line)).find(e => e.type === 'thought');
    t.events[record.i].text = 'Altered private reasoning.';
  }, /dossier/);
});

test('v5 rope validation rejects waived cost, second rope, or climbing the anchor before everyone else', async () => {
  let ropeTape;
  for (let seed = 1; seed <= 30 && !ropeTape; seed++) {
    const t = await runGame({ seed, agents: createScriptedAgents(seed, 'saint') });
    if (t.events.some(e => e.type === 'reveal' && e.what === 'rope')) ropeTape = t;
  }
  assert.ok(ropeTape);
  const check = (mutate, pattern) => {
    const t = structuredClone(ropeTape);
    mutate(t);
    assert.throws(() => validateTape(t), pattern);
  };
  const rope = t => t.events.find(e => e.type === 'reveal' && e.what === 'rope');
  check(t => { rope(t).data.cost = 0; }, /rope/);
  check(t => { rope(t).data.anchor = null; }, /rope/);
  check(t => { t.events.find(e => e.type === 'action' && e.stage === 'pit' && e.name === rope(t).data.by && e.round === rope(t).round).action = 'leave'; }, /reach_down/);
  check(t => {
    const r = rope(t), pit = t.events.find(e => e.i > r.i && e.type === 'reveal' && e.what === 'pit');
    pit.data.anchor = null;
  }, /Rope and pit/);
});

test('v5 stats count exact Guide lies, public betrayals, creditor votes and drowned anchors', () => {
  const players = ['Ash', 'Bex', 'Cole'].map(name => ({ name, model: name }));
  const tape = { rulesVersion: 5, players, result: { places: players.map((p, i) => ({ name: p.name, place: i === 0 ? null : i })) }, events: [
    { type: 'guide_call', name: 'Ash', row: 1, side: 'L' },
    { type: 'guide_call', name: 'Ash', row: 2, side: 'L' },
    { type: 'reveal', stage: 'bridge', what: 'weak_pane', data: { row: 1, weak: 'L' } },
    { type: 'reveal', stage: 'bridge', what: 'weak_pane', data: { row: 2, weak: 'R' } },
    { type: 'pact_formed', members: ['Ash', 'Bex'] },
    { type: 'pact_broken', by: 'Bex' },
    { type: 'life_debt', debtor: 'Bex', creditor: 'Ash', reason: 'rope' },
    { type: 'vote_reveal', name: 'Bex', target: 'Ash' },
    { type: 'reveal', what: 'rope', data: { by: 'Ash', saved: 'Bex', anchor: 'Ash' } },
    { type: 'death', stage: 'pit', name: 'Ash' },
    { type: 'say', name: 'Cole', text: 'I have a feather.' },
  ] };
  const rows = Object.fromEntries(computeStats([tape]).models.map(r => [r.model, r]));
  assert.deepEqual([rows.Ash.guideCalls, rows.Ash.guideLies, rows.Ash.ropeThrows, rows.Ash.anchorDrownings, rows.Ash.livesSaved], [2, 1, 1, 1, 1]);
  assert.deepEqual([rows.Bex.pactsBroken, rows.Bex.votesAgainstCreditor, rows.Bex.lifeDebts], [1, 1, 1]);
  assert.equal(rows.Cole.lies.power, 0, 'no legacy power heuristic on v5');
  assert.equal(rows.Ash.deathsByStage.pit, 1);
});

test('v5 chronological dossier is stable after pruning all chatter and large private records', () => {
  const events = Array.from({ length: 300 }, (_, i) => ({ i, type: 'thought', name: 'Ash', text: `entry-${i} ` + 'x'.repeat(270), visibility: 'private' }));
  const d = buildDossier(events, 'Hana', ['Ash', 'Bex', 'Cole']);
  assert.ok(d.omitted > 0 && d.text.length <= 16000);
  assert.ok(d.text.indexOf('entry-298') < d.text.indexOf('entry-299'));
  assert.equal(d.sourceThrough, 299);
});
