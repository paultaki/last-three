import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runGame } from '../../src/engine.js';
import { POWER_IDS, POWERS } from '../../src/powers.js';
import { createScriptedAgents } from '../../src/scripted.js';
import { SEATS, fixedAgents, idle, makeGame, ofType, powersWith, reply, spy } from './helpers.js';

const STAGES = ['bridge', 'crusher', 'disc', 'ledge'];
const PHASES = ['waiting', 'crossing', 'pick', 'swap', 'play'];
const isStrings = (a) => Array.isArray(a) && a.every((x) => typeof x === 'string');

/** Run several full scripted games and keep every view that was handed to every agent. */
async function collectViews(seeds = [1, 2, 3, 4, 5, 6]) {
  const all = [];
  for (const seed of seeds) {
    const scripted = createScriptedAgents(seed, ['random', 'saint', 'coward', 'shover', 'random', 'saint', 'coward', 'shover']);
    const agents = Object.fromEntries(Object.entries(scripted).map(([seat, a]) => [seat, { ...a, act: spy(a.act, all) }]));
    await runGame({ seed, agents });
  }
  return all;
}

test('every view has every field of spec section 5 with the right types', async () => {
  const views = await collectViews();
  assert.ok(views.length > 300);
  const common = views[0].common;
  const blurbs = JSON.stringify(views[0].powerBlurbs);
  for (const v of views) {
    assert.ok(SEATS.includes(v.you));
    assert.ok(POWER_IDS.includes(v.power.id) && typeof v.power.description === 'string' && v.power.description.length > 0);
    assert.equal(typeof v.powerSpent, 'boolean');
    assert.ok(STAGES.includes(v.stage) && PHASES.includes(v.phase));
    assert.ok(Number.isInteger(v.round) && v.round >= 1 && Number.isInteger(v.roundsTotal) && v.round <= v.roundsTotal);
    assert.ok(isStrings(v.alive) && v.alive.includes(v.you));
    assert.deepEqual(v.alive, SEATS.filter((s) => v.alive.includes(s)), 'alive is in seat order');
    assert.ok(v.dead.every((d) => SEATS.includes(d.name) && STAGES.includes(d.stage) && typeof d.cause === 'string' && !v.alive.includes(d.name)));
    assert.equal(v.alive.length + v.dead.length, 8, 'everyone is either alive or listed dead');
    assert.ok(isStrings(v.line) && v.line.every((n) => v.alive.includes(n)));
    assert.ok(v.stageState && typeof v.stageState === 'object' && !Array.isArray(v.stageState));
    assert.ok(isStrings(v.privateKnowledge) && isStrings(v.publicLog) && v.publicLog.length <= 40);
    assert.ok(Array.isArray(v.whispersToYou) && v.whispersToYou.every((w) => SEATS.includes(w.from) && typeof w.text === 'string'));
    assert.ok(typeof v.rules === 'string' && v.rules.length > 40);
    assert.ok(isStrings(v.legalActions) && v.legalActions.length > 0 && new Set(v.legalActions).size === v.legalActions.length);
    assert.equal(v.common, common);
    assert.equal(JSON.stringify(v.powerBlurbs), blurbs);
    assert.deepEqual(v.powerBlurbs, POWERS.map(({ id, blurb }) => ({ id, blurb })));
  }
});

test('stageState has the documented keys for each stage', async () => {
  const views = await collectViews();
  const keys = (stage) => [...new Set(views.filter((v) => v.stage === stage).flatMap((v) => Object.keys(v.stageState)))].sort();
  assert.deepEqual(keys('bridge'), ['front', 'rowsCrossed', 'wallRoundsLeft', 'weakPanesRevealed']);
  assert.deepEqual(keys('crusher'), ['ceiling', 'leverHolder']);
  assert.deepEqual(keys('disc'), ['openCount', 'tiles']);
  assert.deepEqual(keys('ledge'), ['footing', 'lastDefence', 'shrinkIn']);
  const crusher = views.filter((v) => v.stage === 'crusher');
  assert.ok(crusher.every((v) => Number.isInteger(v.stageState.ceiling) && v.stageState.ceiling >= 0 && v.stageState.ceiling <= 5));
  const ledge = views.filter((v) => v.stage === 'ledge');
  assert.ok(ledge.every((v) => Object.values(v.stageState.footing).every(Number.isInteger) && [1, 2].includes(v.stageState.shrinkIn)));
});

const POWER_WORDS = /\b(glass_eye|wedge|feather|anchor|forger|nothing|map)\b/i;

test('information hiding: no field reveals another agent\'s power, safe sides, or later-stage rules', async () => {
  const views = [];
  const tape = await runGame({ seed: 8, agents: fixedAgents(spy(idle, views)), config: { powers: powersWith({ Gus: 'glass_eye', Hana: 'map' }) } });
  const powerOf = Object.fromEntries(tape.players.map((p) => [p.name, p.power]));
  for (const v of views) {
    assert.equal(v.power.id, powerOf[v.you]);
    const { power, powerBlurbs, privateKnowledge, rules, ...rest } = v;
    assert.doesNotMatch(JSON.stringify(rest), POWER_WORDS, `${v.you}/${v.stage}: ${JSON.stringify(rest).match(POWER_WORDS)}`);
    assert.doesNotMatch(rules, /\b(glass_eye|wedge|feather|anchor|forger|nothing)\b/i);
    if (v.you !== 'Gus') assert.ok(!privateKnowledge.some((k) => /safe side/.test(k)));
    if (v.you !== 'Hana') assert.ok(!privateKnowledge.some((k) => /Stage \d rules/.test(k)));
    if (v.stage === 'bridge') assert.doesNotMatch(rules, /crusher|trapdoor|ledge|lever|footing/i);
    if (v.stage === 'crusher') assert.doesNotMatch(rules, /trapdoor|ledge|footing|glass/i);
    if (v.stage === 'disc') assert.doesNotMatch(rules, /ledge|footing|lever|glass/i);
    if (v.stage === 'ledge') assert.doesNotMatch(rules, /trapdoor|lever|glass pane/i);
    assert.doesNotMatch(v.common, /bridge|crusher|disc|ledge|lever|trapdoor/i);
    if (v.stage === 'bridge') assert.ok(v.stageState.weakPanesRevealed.length <= 8 && v.stageState.weakPanesRevealed.length === v.stageState.rowsCrossed);
  }
  const holderViews = views.filter((v) => v.you === 'Gus' && v.stage === 'bridge');
  assert.ok(holderViews.length > 0 && holderViews.every((v) => v.privateKnowledge.filter((k) => /safe side/.test(k)).length === 8));
});

test('rules mention a power-specific action only to its holder', async () => {
  const views = [];
  await runGame({ seed: 14, agents: fixedAgents(spy(idle, views)), config: { powers: powersWith({ Cole: 'wedge', Eli: 'swap' }) } });
  for (const v of views) {
    assert.equal(/jam_lever/.test(v.rules), v.you === 'Cole' && v.stage === 'crusher', `${v.you} ${v.stage}`);
    assert.equal(/swap_tile/.test(v.rules), v.you === 'Eli' && v.phase === 'swap', `${v.you} ${v.stage} ${v.phase}`);
  }
});

test('an agent that mutates the view it is handed cannot change the game', async () => {
  const mutating = (view) => {
    const response = idle(view);
    view.legalActions.length = 0;
    view.alive.push('Zed');
    view.power.id = 'forger';
    view.stageState = null;
    view.line.reverse();
    view.publicLog.push('forged line');
    view.dead.push({ name: 'Ash', stage: 'bridge', cause: 'glass' });
    return response;
  };
  const clean = await runGame({ seed: 21, agents: fixedAgents(idle) });
  const dirty = await runGame({ seed: 21, agents: fixedAgents(mutating) });
  assert.equal(JSON.stringify(dirty), JSON.stringify(clean));
});

test('publicLog carries only what happened since that agent\'s last ask; whispers arrive once, next round', async () => {
  const views = [];
  const chatty = (view) => reply(idle(view).action, {
    say: `r${view.round}-${view.stage}-${view.phase}-${view.you}`,
    whisper: view.you === 'Bex' && view.round === 1 && view.phase === 'waiting' ? { to: 'Ash', text: 'psst' } : null,
  });
  const g = makeGame({ agents: fixedAgents(spy(chatty, views)) });
  const { runBridge } = await import('../../src/stages/bridge.js');
  await runBridge(g);
  const ash = views.filter((v) => v.you === 'Ash' && v.phase === 'waiting');
  assert.deepEqual(ash[0].publicLog.filter((l) => l.includes('r1-')), [], 'round 1 view predates round 1 speech');
  assert.ok(ash[1].publicLog.includes('Bex: r1-bridge-waiting-Bex'));
  assert.ok(!ash[2].publicLog.includes('Bex: r1-bridge-waiting-Bex'), 'lines are not repeated');
  assert.deepEqual(ash.map((v) => v.whispersToYou.length), [0, 1, 0, 0, 0, 0]);
  assert.deepEqual(ash[1].whispersToYou, [{ from: 'Bex', text: 'psst' }]);
  assert.ok(views.filter((v) => v.you !== 'Ash').every((v) => v.whispersToYou.length === 0));
});

test('publicLog is capped at the last 40 lines', () => {
  const g = makeGame();
  for (let k = 0; k < 100; k++) g.announce(`line ${k}`);
  const view = g.view('Ash', { phase: 'waiting', roundsTotal: 6, legalActions: ['hold'], rules: 'x' });
  assert.equal(view.publicLog.length, 40);
  assert.equal(view.publicLog[0], 'line 60');
  assert.equal(view.publicLog.at(-1), 'line 99');
  assert.deepEqual(g.view('Ash', { phase: 'waiting', roundsTotal: 6, legalActions: ['hold'], rules: 'x' }).publicLog, []);
});

test('deaths appear in the public log and in view.dead', async () => {
  const views = [];
  const tape = await runGame({ seed: 3, agents: fixedAgents(spy(idle, views)) });
  const first = ofType(tape.events, 'death')[0];
  const after = views.find((v) => v.dead.some((d) => d.name === first.name));
  assert.deepEqual(after.dead[0], { name: first.name, stage: first.stage, cause: first.cause });
  assert.ok(views.some((v) => v.publicLog.some((l) => l.startsWith(first.name))));
});
