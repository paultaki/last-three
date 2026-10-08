// Second-opinion review fixes: forger anonymity, timeout liveness, hostile responses, forge
// destinations, ledge ranking text and the bridge line reveals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runGame } from '../../src/engine.js';
import { runBridge } from '../../src/stages/bridge.js';
import { ledgeRules, mapKnowledge } from '../../src/rules.js';
import { validateTape } from '../../src/tape.js';
import { fixedAgents, idle, makeGame, ofType, powersWith, reply, spy, SEATS } from './helpers.js';

const helpersUrl = new URL('./helpers.js', import.meta.url).href;
const engineUrl = new URL('../../src/engine.js', import.meta.url).href;

async function playRound1(policy, { forger = 'Dara', seed = 3 } = {}) {
  const views = [];
  const tape = await runGame({
    seed,
    agents: fixedAgents(spy(policy, views)),
    config: { powers: powersWith({ [forger]: 'forger' }) },
  });
  return { tape, views };
}

const round1Only = (fn) => (view) => (view.stage === 'bridge' && view.phase === 'waiting' && view.round === 1 ? fn(view) : idle(view));

// ---- 1. forger anonymity ---------------------------------------------------------------

test('a forged public line is delivered in the slot of the forged name, so Dara\'s slot reveals nothing', async () => {
  const policy = round1Only((view) => reply('hold', {
    say: `marker-${view.you}`,
    forge: view.you === 'Dara' ? { as: 'Hana', to: 'all', text: 'forged-line' } : null,
  }));
  const { views } = await playRound1(policy);
  const seen = views.find((v) => v.you === 'Ash' && v.round === 2 && v.phase === 'waiting').publicLog.filter((l) => /marker|forged/.test(l));
  // Exactly what the log would be if Hana had said both lines herself.
  const asIfHana = [...SEATS.map((n) => `${n}: marker-${n}`), 'Hana: forged-line'];
  assert.deepEqual(seen, asIfHana);
});

test('a forged line goes right after the genuine line of the name it was forged as, and before later seats', async () => {
  const policy = round1Only((view) => reply('hold', {
    say: `marker-${view.you}`,
    forge: view.you === 'Hana' ? { as: 'Bex', to: 'all', text: 'forged-line' } : null,
  }));
  const { views } = await playRound1(policy, { forger: 'Hana' });
  const seen = views.find((v) => v.you === 'Ash' && v.round === 2 && v.phase === 'waiting').publicLog.filter((l) => /marker|forged/.test(l));
  assert.deepEqual(seen, ['Ash: marker-Ash', 'Bex: marker-Bex', 'Bex: forged-line', ...SEATS.slice(2).map((n) => `${n}: marker-${n}`)]);
});

test('a forged line as an agent who stayed silent sits in that agent\'s slot', async () => {
  const policy = round1Only((view) => reply('hold', {
    say: view.you === 'Cole' ? null : `marker-${view.you}`,
    forge: view.you === 'Hana' ? { as: 'Cole', to: 'all', text: 'forged-line' } : null,
  }));
  const { views } = await playRound1(policy, { forger: 'Hana' });
  const seen = views.find((v) => v.you === 'Ash' && v.round === 2 && v.phase === 'waiting').publicLog.filter((l) => /marker|forged/.test(l));
  assert.deepEqual(seen, ['Ash: marker-Ash', 'Bex: marker-Bex', 'Cole: forged-line', ...['Dara', 'Eli', 'Fenn', 'Gus', 'Hana'].map((n) => `${n}: marker-${n}`)]);
});

test('whispers reach the recipient in apparent-sender order too; a forged whisper hides the forger\'s slot', async () => {
  const policy = round1Only((view) => reply('hold', {
    whisper: view.you === 'Eli' ? null : { to: 'Eli', text: `w-${view.you}` },
    forge: view.you === 'Dara' ? { as: 'Ash', to: 'Eli', text: 'w-forged' } : null,
  }));
  const { views, tape } = await playRound1(policy);
  const eli = views.find((v) => v.you === 'Eli' && v.round === 2 && v.phase === 'waiting');
  assert.deepEqual(eli.whispersToYou.map((w) => [w.from, w.text]), [
    ['Ash', 'w-Ash'],
    ['Ash', 'w-forged'],
    ...['Bex', 'Cole', 'Dara', 'Fenn', 'Gus', 'Hana'].map((n) => [n, `w-${n}`]),
  ]);
  // The tape (a spectator record) still names the real sender.
  assert.deepEqual(ofType(tape.events, 'whisper').filter((w) => w.forgedAs).map((w) => [w.from, w.forgedAs]), [['Dara', 'Ash']]);
});

// ---- 2. timeout liveness ---------------------------------------------------------------

test('a never-resolving agent cannot make the process exit early: the timeout timer keeps it alive', () => {
  const script = `
    import { runGame } from ${JSON.stringify(engineUrl)};
    import { fixedAgents, idle } from ${JSON.stringify(helpersUrl)};
    const agents = fixedAgents(idle, { Dara: () => new Promise(() => {}) });
    const tape = await runGame({ seed: 3, agents, config: { agentTimeoutMs: 50 } });
    process.stdout.write(JSON.stringify({ events: tape.events.length, id: tape.id }));
  `;
  const run = spawnSync(process.execPath, ['--input-type=module', '-e', script], { encoding: 'utf8', timeout: 60_000 });
  assert.equal(run.status, 0, `exit code ${run.status}, stderr: ${run.stderr}`);
  const out = JSON.parse(run.stdout);
  assert.ok(out.events > 50 && out.id);
});

// ---- 3. hostile responses --------------------------------------------------------------

const thrower = (value) => () => {
  throw value;
};
const revoked = () => {
  const { proxy, revoke } = Proxy.revocable({}, {});
  revoke();
  return proxy;
};
const hostileProxy = () => new Proxy({}, {
  get() { throw new Error('proxy get'); },
  has() { throw new Error('proxy has'); },
  ownKeys() { throw new Error('proxy ownKeys'); },
  getPrototypeOf() { throw new Error('proxy proto'); },
  getOwnPropertyDescriptor() { throw new Error('proxy descriptor'); },
});
const circular = () => {
  const r = { action: 'hold', say: 'loop' };
  r.self = r;
  r.forge = { as: 'Ash', to: 'all', text: 'x', loop: r };
  r.whisper = { to: 'Ash', text: 'y', loop: r };
  return r;
};
let flip = 0;
const shapeShifter = () => ({
  action: 'hold',
  forge: {
    as: 'Ash',
    get to() {
      flip += 1;
      return flip % 2 ? 'all' : { trim: 'no' };
    },
    text: 'shifty',
  },
});

const HOSTILE = {
  'throws a prototype-less object': { act: thrower(Object.create(null)), invalid: true },
  'rejects with a prototype-less object': { act: () => Promise.reject(Object.create(null)), invalid: true },
  'throws a symbol': { act: thrower(Symbol('boom')), invalid: true },
  'throws a hostile proxy': { act: thrower(hostileProxy()), invalid: true },
  'throws a revoked proxy': { act: thrower(revoked()), invalid: true },
  'throws undefined': { act: thrower(undefined), invalid: true },
  'returns a hostile proxy': { act: hostileProxy, invalid: true },
  'returns a revoked proxy': { act: revoked, invalid: true },
  'returns an object with a throwing say getter': {
    act: () => ({ action: 'hold', get say() { throw new Error('say getter'); } }),
    invalid: false,
  },
  'returns an object with a throwing action getter': { act: () => ({ get action() { throw new Error('act getter'); } }), invalid: true },
  'returns a circular object': { act: circular, invalid: false },
  'returns a huge string field': { act: () => ({ action: 'hold', say: 'x'.repeat(5_000_000), thought: 'y'.repeat(5_000_000), whisper: { to: 'Ash', text: 'z'.repeat(5_000_000) } }), invalid: false },
  'returns a huge action string': { act: () => ({ action: 'h'.repeat(5_000_000) }), invalid: true },
  'returns a forge.to getter that changes on every read': { act: shapeShifter, invalid: false },
  'returns numbers where strings belong': { act: () => ({ action: 'hold', say: 5, thought: {}, whisper: { to: 1, text: 2 }, forge: { as: 3, to: 4, text: 5 } }), invalid: false },
};

for (const [label, { act, invalid }] of Object.entries(HOSTILE)) {
  test(`a response/error that ${label} cannot abort the game`, async () => {
    const powers = powersWith({ Cole: 'forger' });
    const tape = await runGame({ seed: 8, agents: fixedAgents(idle, { Cole: act }), config: { powers } });
    validateTape(tape);
    assert.equal(tape.events.at(-1).type, 'game_end');
    const cole = ofType(tape.events, 'action').filter((a) => a.name === 'Cole' && !a.auto);
    assert.ok(cole.length >= 6);
    if (invalid) assert.ok(cole.every((a) => a.valid === false && typeof a.note === 'string' && a.note.length > 0));
    for (const e of tape.events) {
      if ('text' in e) assert.ok(e.text.length <= 280);
      if (e.note) assert.ok(e.note.length < 2000);
    }
  });
}

test('the forge.to that changes on every read is read exactly once and never crashes', async () => {
  flip = 0;
  const tape = await runGame({ seed: 8, agents: fixedAgents(idle, { Cole: shapeShifter }), config: { powers: powersWith({ Cole: 'forger' }) } });
  validateTape(tape);
  const forged = ofType(tape.events, 'say').filter((e) => e.forgedAs);
  assert.ok(forged.length <= 1);
});

test('a model whose name cannot be turned into a string cannot abort the game either', async () => {
  const agents = fixedAgents(idle);
  agents.Ash = { ...agents.Ash, model: Object.create(null) };
  const tape = await runGame({ seed: 1, agents });
  validateTape(tape);
  assert.equal(typeof tape.players[0].model, 'string');
});

// ---- 4. forge destinations -------------------------------------------------------------

test('a forge with a missing, null, numeric, object or array destination is rejected and does not spend the forge', async () => {
  const attempts = [
    { as: 'Cole', text: 'no destination' },
    { as: 'Cole', to: null, text: 'null destination' },
    { as: 'Cole', to: 7, text: 'number destination' },
    { as: 'Cole', to: { name: 'Eli' }, text: 'object destination' },
    { as: 'Cole', to: ['all'], text: 'array destination' },
    { as: 'Cole', to: 'all', text: 'finally' },
  ];
  const policy = (view) => (view.you === 'Dara' && view.stage === 'bridge' && view.phase === 'waiting' ? reply('hold', { forge: attempts[view.round - 1] }) : idle(view));
  const { tape } = await playRound1(policy);
  const actions = ofType(tape.events, 'action').filter((a) => a.name === 'Dara' && a.stage === 'bridge').slice(0, 6); // the six waiting rounds
  assert.deepEqual(actions.map((a) => a.forgeRejected === true), [true, true, true, true, true, false]);
  assert.ok(actions.slice(0, 5).every((a) => a.valid === true && /forge ignored: /.test(a.note)), 'the action itself stays valid, with a clear note');
  assert.ok(!('forgeRejected' in actions[5]));
  assert.equal(ofType(tape.events, 'ability_use').filter((e) => e.power === 'forger').length, 1, 'only the last attempt spent the forge');
  assert.deepEqual(ofType(tape.events, 'say').filter((e) => e.forgedAs).map((e) => [e.round, e.text]), [[6, 'finally']]);
  assert.equal(ofType(tape.events, 'whisper').length, 0, 'no rejected forge turned into a broadcast or a whisper');
});

test('forging to oneself, to the name forged as, or to a dead agent is rejected and flagged', async () => {
  const attempts = [
    { as: 'Cole', to: 'Dara', text: 'x' },
    { as: 'Cole', to: 'Cole', text: 'x' },
    { as: 'Cole', to: 'Nobody', text: 'x' },
  ];
  const policy = (view) => (view.you === 'Dara' && view.stage === 'bridge' && view.phase === 'waiting' && view.round <= 3 ? reply('hold', { forge: attempts[view.round - 1] }) : idle(view));
  const { tape } = await playRound1(policy);
  const actions = ofType(tape.events, 'action').filter((a) => a.name === 'Dara' && a.stage === 'bridge').slice(0, 3);
  assert.ok(actions.every((a) => a.forgeRejected === true));
  assert.equal(ofType(tape.events, 'ability_use').filter((e) => e.power === 'forger').length, 0);
});

test('a forge object from a non-forger is flagged as rejected too', async () => {
  const policy = (view) => (view.you === 'Eli' && view.round === 1 && view.phase === 'waiting' ? reply('hold', { forge: { as: 'Cole', to: 'all', text: 'boo' } }) : idle(view));
  const { tape } = await playRound1(policy);
  const action = ofType(tape.events, 'action').find((a) => a.name === 'Eli' && a.round === 1);
  assert.equal(action.forgeRejected, true);
});

// ---- 5. ledge ranking text -------------------------------------------------------------

const words = (text) => text.split(/\s+/).filter(Boolean).length;

test('the ledge rules explain how simultaneous falls and the round-20 collapse are ranked', () => {
  for (const shrink of [1, 2]) {
    const text = ledgeRules(shrink);
    assert.match(text, /first to fall (is placed|places) lowest/i);
    assert.match(text, /same round[^.]*lowest footing falls first/i);
    assert.match(text, /ties[^.]*random/i);
    assert.match(text, /everyone would fall (at once|in the same round)[^.]*highest footing/i);
    assert.match(text, /round 20[^.]*collapse|collapse[^.]*round 20/i);
    assert.match(text, /collapse[^.]*footing/i);
    assert.ok(words(text) <= 250, `ledge rules are ${words(text)} words`);
  }
});

test('the map holder\'s copy of the ledge rules carries the ranking rules', () => {
  const ledge = mapKnowledge()[4];
  assert.match(ledge, /lowest footing falls first/i);
  assert.match(ledge, /highest footing/i);
  assert.match(ledge, /round 20/i);
});

test('the ledge view an agent receives states the ranking rules', async () => {
  const views = [];
  const g = makeGame({ agents: fixedAgents(spy(idle, views)), dead: ['Dara', 'Eli', 'Fenn', 'Gus', 'Hana'] });
  g.stage = 'ledge';
  const { runLedge } = await import('../../src/stages/ledge.js');
  await runLedge(g);
  assert.match(views[0].rules, /lowest footing falls first/i);
});

// ---- 7. bridge line reveals ------------------------------------------------------------

test('the bridge emits a line reveal before round 1, after each waiting round, and at the start of crossing', async () => {
  const g = makeGame({ seed: 5 });
  await runBridge(g);
  const events = g.events;
  const firstRound = events.findIndex((e) => e.type === 'round_start');
  const firstCrossing = events.findIndex((e) => e.type === 'round_start' && e.phase === 'crossing');
  const lines = events.map((e, k) => ({ e, k })).filter(({ e }) => e.type === 'reveal' && e.what === 'line');

  assert.ok(lines[0].k < firstRound, 'one before the first waiting round');
  const afterWaiting = lines.filter(({ k }) => k > firstRound && k < firstCrossing);
  assert.equal(afterWaiting.length, 7, 'one after each of the 6 waiting rounds, plus the crossing-start line');
  const last = afterWaiting.at(-1);
  assert.ok(events.slice(last.k + 1, firstCrossing).every((e) => e.type !== 'round_start'), 'the last one sits right before the first crossing round');
  for (const { e } of lines) {
    assert.deepEqual(Object.keys(e.data), ['line']);
    assert.equal(new Set(e.data.line).size, 8);
  }
  assert.deepEqual(last.e.data.line, afterWaiting.at(-2).e.data.line, 'the crossing starts with the line the waiting room left');
  assert.equal(last.e.stage, 'bridge');
});
