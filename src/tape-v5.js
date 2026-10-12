// V5 schema and event-derived invariants. V1-v4 validation remains in tape.js.
import { SEATS } from './game.js';
import { buildDossier } from './dossier.js';
import { JURY_DOSSIER_LIMIT, PACT_BREAK_REASONS, limitWords } from './rules.js';

const STAGES = ['opening', 'pacts', 'bridge', 'crusher', 'pit', 'vote', 'jury'];
const FLOW = ['opening', 'pacts', 'bridge', 'pacts', 'crusher', 'pacts', 'pit', 'pacts', 'vote', 'pacts', 'jury'];
const DEATH = { bridge: ['glass', 'shatter'], crusher: ['crusher', 'flatten'], pit: ['pit', 'sink'], vote: ['trapdoor', 'chute'] };
// Each field is typed below; name-bearing fields are checked against the roster.
const SHAPES = {
  game_start: { players: 'array' }, stage_start: { alive: 'names', note: 'string' },
  round_start: { phase: 'string', roundsTotal: 'number' }, stage_end: { survivors: 'names' }, game_end: { places: 'array' },
  action: { name: 'name', action: 'string', valid: 'boolean' }, thought: { name: 'name', text: 'string' },
  say: { name: 'name', text: 'string' }, whisper: { from: 'name', to: 'name', text: 'string' },
  death: { name: 'name', cause: 'string', style: 'string' }, lucky_save: { name: 'name', why: 'string' },
  reveal: { what: 'string', data: 'object' }, intro_motive: { name: 'name', text: 'string' },
  last_words: { name: 'name', text: 'string', deathEvent: 'number' }, jury_box_enter: { name: 'name', deathEvent: 'number' },
  pact_offer: { from: 'name', to: 'name' }, pact_formed: { members: 'names', offeredBy: 'name' },
  pact_broken: { members: 'names', by: 'name', reason: 'string' },
  life_debt: { debtor: 'name', creditor: 'name', reason: 'string' },
  guide_vote: { name: 'name', target: 'name', ballot: 'number' },
  guide_elected: { name: 'name', tallies: 'object', tied: 'names', method: 'string' },
  guide_call: { name: 'name', walker: 'name', row: 'number', side: 'string' },
  counter_call: { name: 'name', walker: 'name', row: 'number', side: 'string' },
  vote_reveal: { name: 'name', target: 'name', reason: 'string', ballot: 'number', elimination: 'number' },
  vote_result: { name: 'name', tallies: 'object', tied: 'names', method: 'string', elimination: 'number' },
  jury_dossier: { name: 'name', text: 'string', omitted: 'number', sourceThrough: 'number' },
  jury_question: { name: 'name', target: 'name', text: 'string' },
  jury_ballot: { name: 'name', ranking: 'names', reason: 'string' },
  jury_result: { ranking: 'names', scores: 'object', firsts: 'object', tieOrder: 'names' },
};
const fail = message => { throw new Error(message); };
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const sorted = a => [...a].sort();
const sameNames = (a, b) => Array.isArray(a) && a.length === new Set(a).size && equal(sorted(a), sorted(b));
const key = members => sorted(members).join(':');
const stripDeath = ({ name, stage, cause, style }) => ({ name, stage, cause, style });

export function validateV5Tape(tape) {
  if (!Array.isArray(tape.players) || tape.players.length !== 8) fail('Must have exactly 8 players');
  if (!sameNames(tape.players.map(p => p?.name), SEATS)) fail('V5 roster must have eight distinct known seats');
  if (tape.players.some(p => typeof p.model !== 'string' || !p.model || 'power' in p)) fail('V5 players need models and no power');
  if ('chalkShown' in tape || 'chalkWritten' in tape) fail('V5 has no chalk fields');
  const events = tape.events;
  if (!Array.isArray(events) || !events.length) fail('Events must be a non-empty array');
  if (events[0]?.type !== 'game_start' || events.at(-1)?.type !== 'game_end') fail('First/last event must be game_start/game_end');
  if (!equal(events[0].players, tape.players)) fail('game_start players differ from tape.players');
  const dead = new Map(), box = [], lastWords = new Set(), motives = new Set(), pacts = new Map(), offers = new Set();
  const starts = [], ballots = [], dossiers = new Set();
  let active = null, finalists = null, juryResult = null, guide = null, juryStart = null;
  const calls = new Map();
  const living = () => SEATS.filter(n => !dead.has(n));
  const actionsBefore = e => events.slice(0, e.i).filter(a => a.type === 'action' && a.stage === e.stage && a.phase === e.phase && a.round === e.round);
  const actionFor = (e, name, action) => actionsBefore(e).findLast(a => a.name === name && a.action === action);
  for (const [i, e] of events.entries()) {
    if (!e || e.i !== i) fail(`Event ${i} missing or invalid i (must be contiguous)`);
    const shape = SHAPES[e.type];
    if (!shape) fail(`Event ${i} unknown type: ${e.type}`);
    if (!('stage' in e) || !('round' in e)) fail(`Event ${i} must carry stage and round keys`);
    if (e.stage !== null && !STAGES.includes(e.stage)) fail(`Event ${i} bad stage`);
    if (e.round !== null && (!Number.isInteger(e.round) || e.round < 1)) fail(`Event ${i} bad round`);
    if ('forgedAs' in e || 'power' in e) fail(`Event ${i} removed mechanic`);
    for (const [field, type] of Object.entries(shape)) {
      const value = e[field];
      if (type === 'name') { if (!SEATS.includes(value)) fail(`Event ${i} unknown player: ${value}`); }
      else if (type === 'names') { if (!Array.isArray(value) || value.some(n => !SEATS.includes(n)) || new Set(value).size !== value.length) fail(`Event ${i} invalid ${field} names`); }
      else if (type === 'array') { if (!Array.isArray(value)) fail(`Event ${i} ${field} must be array`); }
      else if (type === 'object') { if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`Event ${i} ${field} must be object`); }
      else if (typeof value !== type || (type === 'number' && !Number.isFinite(value))) fail(`Event ${i} invalid ${field}`);
    }
    const secret = ['thought', 'whisper', 'jury_dossier', 'jury_ballot'].includes(e.type) || (e.type === 'action' && ['ballot', 'revote', 'ranking'].includes(e.phase));
    if (e.visibility !== (secret ? 'private' : 'public')) fail(`Event ${i} invalid visibility`);
    if (e.type === 'jury_box_enter') {
      if (!dead.has(e.name) || box.includes(e.name) || e.deathEvent !== dead.get(e.name).i) fail('Invalid jury box entry');
      box.push(e.name);
    }
    if (!secret && !equal(e.spectators, box)) fail(`Event ${i} spectators do not match jury box`);
    if (secret && 'spectators' in e) fail(`Event ${i} private event has spectators`);
    if (e.type === 'stage_start') {
      if (active || e.round !== null || !sameNames(e.alive, living())) fail('stage_start alive does not match who is alive');
      active = e.stage; starts.push(active); offers.clear();
      if (active === 'jury') { finalists = living(); juryStart = e.i; if (finalists.length !== 3 || box.length !== 5) fail('Jury needs three finalists and five jurors'); }
    } else if (e.type === 'stage_end') {
      if (active !== e.stage || !sameNames(e.survivors, living())) fail('stage_end survivors do not match who is alive');
      active = null;
    } else if (!['game_start', 'game_end'].includes(e.type) && e.stage !== active) fail(`Event ${i} outside its stage`);
    if (e.type === 'round_start' && (e.round === null || !Number.isInteger(e.roundsTotal) || e.roundsTotal < e.round)) fail('Invalid round bounds');
    const actor = e.type === 'whisper' ? e.from : ['action', 'thought', 'say', 'guide_vote', 'guide_call', 'counter_call', 'intro_motive'].includes(e.type) ? e.name : null;
    if (actor && dead.has(actor) && !(['action', 'thought'].includes(e.type) && e.phase === 'last_words') && !(e.stage === 'jury' && ['question', 'ranking'].includes(e.phase) && e.type !== 'say')) fail(`Event ${i} ${actor} acts after dying`);
    if (e.type === 'whisper' && (dead.has(e.to) || e.from === e.to || ['ballot', 'revote', 'ranking'].includes(e.phase))) fail('Illegal whisper');
    const cap = e.type === 'last_words' ? 20 : e.type === 'whisper' ? 15 : 25;
    if (['say', 'whisper', 'intro_motive', 'last_words', 'jury_question'].includes(e.type) && (!e.text || limitWords(e.text, cap) !== e.text)) fail(`Event ${i} text exceeds line cap`);
    if (e.type === 'death') {
      if (dead.has(e.name) || living().length <= 3 || !equal([e.cause, e.style], DEATH[e.stage]) || 'place' in e) fail('Invalid v5 death or survivor floor');
      dead.set(e.name, e);
    }
    if (e.type === 'lucky_save' && dead.has(e.name)) fail('lucky_save for dead agent');
    if (e.type === 'last_words') {
      if (!dead.has(e.name) || lastWords.has(e.name) || e.deathEvent !== dead.get(e.name).i || e.stage !== dead.get(e.name).stage) fail('Invalid last_words');
      lastWords.add(e.name);
    }
    if (e.type === 'intro_motive') {
      if (e.stage !== 'opening' || motives.has(e.name)) fail('Invalid intro_motive');
      motives.add(e.name);
    }
    if (e.type === 'pact_offer') {
      if (!['pacts', 'vote'].includes(e.stage) || e.from === e.to || dead.has(e.from) || dead.has(e.to) || !actionFor(e, e.from, `offer_pact:${e.to}`)) fail('Invalid pact offer');
      offers.add(`${e.from}:${e.to}`);
    }
    if (e.type === 'pact_formed') {
      const [a, b] = e.members, other = e.members.find(n => n !== e.offeredBy);
      if (e.members.length !== 2 || !e.members.includes(e.offeredBy) || dead.has(a) || dead.has(b) || pacts.has(key(e.members)) || !offers.has(`${e.offeredBy}:${other}`) || !actionFor(e, other, `accept_pact:${e.offeredBy}`)) fail('Invalid pact formation');
      pacts.set(key(e.members), e.members);
    }
    if (e.type === 'pact_broken') {
      if (!pacts.has(key(e.members)) || !e.members.includes(e.by) || !PACT_BREAK_REASONS.includes(e.reason)) fail('Invalid pact break');
      const target = e.members.find(n => n !== e.by);
      if (e.reason === 'explicit' && !actionFor(e, e.by, `break_pact:${target}`)) fail('Pact break without explicit action');
      if (['push_lever', 'push_base'].includes(e.reason) && !actionFor(e, e.by, `${e.reason}:${target}`)) fail('Pact break without push');
      if (e.reason === 'vote' && !events.slice(0, i).some(v => v.type === 'vote_reveal' && v.name === e.by && v.target === target && v.i > i - 3)) fail('Pact break without vote');
      if (e.reason === 'false_guide_call') {
        const call = calls.get(e.round);
        const weak = events.find(v => v.type === 'reveal' && v.what === 'weak_pane' && v.data.row === e.round);
        if (!call || call.name !== e.by || call.walker !== target || call.side !== weak?.data.weak) fail('Pact break without false Guide call');
      }
      pacts.delete(key(e.members));
    }
    if (e.type === 'guide_elected') {
      if (e.stage !== 'bridge' || guide) fail('Invalid Guide election');
      validateElection(e, events.filter(v => v.type === 'guide_vote'), SEATS, true);
      guide = e.name;
    }
    if (e.type === 'guide_vote' && !actionFor(e, e.name, `guide_vote:${e.target}`)) fail('Guide vote without action');
    if (e.type === 'guide_call' || e.type === 'counter_call') {
      if (e.stage !== 'bridge' || !['L', 'R'].includes(e.side) || e.row !== e.round || e.row < 1 || e.row > 8 || e.walker === guide) fail('Invalid bridge call');
      if (e.type === 'guide_call') {
        if (e.name !== guide || calls.has(e.row)) fail('Invalid Guide call');
        calls.set(e.row, e);
      } else if (!calls.has(e.row)) fail('Counter-call before Guide');
    }
    if (e.type === 'vote_reveal') {
      if (e.stage !== 'vote' || e.name === e.target || dead.has(e.name) || dead.has(e.target) || !e.reason || !actionFor(e, e.name, `vote:${e.target}`)) fail('Invalid vote reveal');
    }
    if (e.type === 'vote_result') {
      if (e.stage !== 'vote') fail('Vote result outside vote');
      const reveals = events.filter(v => v.type === 'vote_reveal' && v.elimination === e.elimination);
      validateElection(e, reveals, living(), false);
      const subsequent = events.slice(i + 1).find(v => v.type === 'death');
      if (!subsequent || subsequent.name !== e.name || subsequent.stage !== 'vote') fail('Vote result must eliminate its target');
    }
    if (e.type === 'jury_dossier') {
      if (e.stage !== 'jury' || !box.includes(e.name) || dossiers.has(e.name) || e.text.length > JURY_DOSSIER_LIMIT || e.sourceThrough !== juryStart) fail('Invalid jury dossier');
      const expected = buildDossier(events.slice(0, juryStart + 1), e.name, finalists);
      if (!equal({ text: e.text, omitted: e.omitted, sourceThrough: e.sourceThrough }, expected)) fail('Jury dossier does not match evidence');
      dossiers.add(e.name);
    }
    if (e.type === 'jury_question' && (e.stage !== 'jury' || !box.includes(e.name) || !finalists.includes(e.target) || events.slice(0, i).some(v => v.type === 'jury_question' && v.name === e.name))) fail('Invalid jury question');
    if (e.type === 'jury_ballot') {
      if (e.stage !== 'jury' || !box.includes(e.name) || ballots.some(b => b.name === e.name) || !sameNames(e.ranking, finalists) || !e.reason || !actionFor(e, e.name, `rank:${e.ranking.join('>')}`)) fail('Invalid jury ballot');
      ballots.push(e);
    }
    if (e.type === 'jury_result') {
      if (juryResult || e.stage !== 'jury' || ballots.length !== 5 || !sameNames(e.ranking, finalists) || !sameNames(e.tieOrder, finalists)) fail('Invalid jury result');
      const scores = Object.fromEntries(finalists.map(n => [n, 0])), firsts = Object.fromEntries(finalists.map(n => [n, 0]));
      for (const b of ballots) { b.ranking.forEach((n, k) => { scores[n] += 3 - k; }); firsts[b.ranking[0]]++; }
      const ranking = [...finalists].sort((a, b) => scores[b] - scores[a] || firsts[b] - firsts[a] || e.tieOrder.indexOf(a) - e.tieOrder.indexOf(b));
      if (!equal(e.scores, scores) || !equal(e.firsts, firsts) || !equal(e.ranking, ranking)) fail('Jury scoring or ranking differs from ballots');
      juryResult = e;
    }
    if (e.type === 'reveal') validateReveal(e, events, living(), guide);
    if (e.type === 'life_debt') validateDebt(e, events);
  }
  if (active || !equal(starts, FLOW)) fail('Incorrect v5 stage sequence');
  if (events.filter(e => e.type === 'game_start').length !== 1 || events.filter(e => e.type === 'game_end').length !== 1) fail('Exactly one game_start/game_end required');
  if (dead.size !== 5 || lastWords.size !== 5 || motives.size !== 8 || dossiers.size !== 5 || !juryResult || calls.size !== 8) fail('Incomplete v5 lifecycle');
  const expectedPlaces = SEATS.map(name => dead.has(name) ? { name, place: null, diedAt: dead.get(name).stage } : { name, place: juryResult.ranking.indexOf(name) + 1 });
  if (!equal(tape.result?.places, expectedPlaces) || !equal(events.at(-1).places, expectedPlaces)) fail('Result places differ from jury ranking');
  if (!equal(tape.result?.deaths, [...dead.values()].map(stripDeath))) fail('result.deaths does not match death events');
}

function validateElection(result, votes, living, guide) {
  let candidates = living, voters = living, tied, tallies, method;
  for (let ballot = 1; ballot <= 2; ballot++) {
    const cast = votes.filter(v => v.ballot === ballot);
    if (!voters.length) { if (cast.length) fail('Ineligible runoff votes'); break; }
    if (!sameNames(cast.map(v => v.name), voters)) fail('Missing, duplicate or ineligible votes');
    tallies = Object.fromEntries(candidates.map(n => [n, 0]));
    for (const vote of cast) {
      if (!candidates.includes(vote.target)) fail('Vote target outside tied candidates');
      tallies[vote.target]++;
    }
    const high = Math.max(...Object.values(tallies));
    tied = candidates.filter(n => tallies[n] === high);
    if (tied.length === 1) {
      if (votes.some(v => v.ballot > ballot)) fail('Unnecessary runoff');
      method = ballot === 1 ? 'vote' : 'revote'; break;
    }
    candidates = tied;
    voters = guide ? living : living.filter(n => !tied.includes(n));
  }
  if (!equal(result.tallies, tallies) || !equal(result.tied, tied) || !tied.includes(result.name) || result.method !== (method ?? 'seeded')) fail('Election tally or tie-break mismatch');
}

function validateReveal(e, events, living, guide) {
  const d = e.data;
  if (!['line', 'weak_pane', 'ceiling', 'pit', 'rope'].includes(e.what)) fail('Unknown v5 reveal');
  if (e.what === 'line' && (e.stage !== 'bridge' || !sameNames(d.line, living.filter(n => n !== guide)))) fail('Invalid bridge line');
  if (e.what === 'weak_pane' && (e.stage !== 'bridge' || d.row !== e.round || !['L', 'R'].includes(d.weak))) fail('Invalid weak pane');
  if (e.what === 'ceiling' && (e.stage !== 'crusher' || !Number.isInteger(d.ceiling) || d.ceiling < 0 || d.ceiling > 5 || (d.leverHolder !== null && !living.includes(d.leverHolder)))) fail('Invalid ceiling');
  if (e.what !== 'pit' && e.what !== 'rope') return;
  if (e.stage !== 'pit' || e.round < 1 || e.round > 5) fail('Invalid pit reveal stage/round');
  const before = events.slice(0, e.i).findLast(v => v.type === 'reveal' && v.what === 'pit');
  const cast = events.find(v => v.type === 'stage_start' && v.stage === 'pit').alive;
  const prev = before?.data ?? { down: cast, out: [], base: null, anchor: null, ropeUsed: false };
  if (e.what === 'rope') {
    if (!equal(Object.keys(d).sort(), ['anchor', 'by', 'saved']) || d.anchor !== d.by || d.saved !== prev.base || !prev.out.includes(d.by) || prev.ropeUsed) fail('Invalid rope anchor rescue');
    const reach = events.slice(0, e.i).some(v => v.type === 'action' && v.stage === 'pit' && v.round === e.round && v.name === d.by && v.action === 'reach_down' && v.valid);
    if (!reach || events.slice(0, e.i).some(v => v.type === 'reveal' && v.what === 'rope')) fail('Rope needs one valid reach_down');
    const after = events.slice(e.i + 1).find(v => v.type === 'reveal' && v.what === 'pit');
    if (!after || after.round !== e.round || after.data.roped !== d.by || after.data.rescued !== d.saved || after.data.anchor !== d.by) fail('Rope and pit reveal differ');
    return;
  }
  if (!Array.isArray(d.down) || !Array.isArray(d.out) || !sameNames([...d.down, ...d.out], cast) || d.flood !== e.round || typeof d.ropeUsed !== 'boolean' || (prev.ropeUsed && !d.ropeUsed)) fail('Invalid pit partition');
  if ((d.base !== null && !d.down.includes(d.base)) || (d.anchor !== null && !d.down.includes(d.anchor)) || (d.base && d.anchor)) fail('Pit base/anchor must be on floor');
  if (!Array.isArray(d.lifted) || d.lifted.length > 2 || new Set(d.lifted).size !== d.lifted.length || d.lifted.some(n => !prev.down.includes(n) || !d.out.includes(n) || n === prev.base || n === prev.anchor)) fail('Invalid pit lifts');
  if (d.liftsPerRound !== 2) fail('Invalid lift capacity');
  if (d.anchorOut !== null && (d.anchorOut !== prev.anchor || prev.down.length !== 1 || d.anchor !== null || !d.out.includes(d.anchorOut) || !events.slice(0, e.i).some(v => v.type === 'action' && v.stage === 'pit' && v.round === e.round && v.name === d.anchorOut && v.action === 'climb_last'))) fail('Anchor must climb last in later round');
  if (d.roped !== null || d.rescued !== null) {
    const rope = events.slice(0, e.i).find(v => v.type === 'reveal' && v.what === 'rope' && v.round === e.round);
    if (!rope || rope.data.by !== d.roped || rope.data.saved !== d.rescued || !d.down.includes(d.roped) || !d.out.includes(d.rescued) || d.base !== null || !d.ropeUsed) fail('Pit rescue without matching rope');
  }
}

function validateDebt(e, events) {
  if (e.debtor === e.creditor || !['lever', 'step', 'rope'].includes(e.reason)) fail('Invalid life debt');
  if (e.reason === 'lever') {
    const lever = events.slice(0, e.i).findLast(v => v.type === 'reveal' && v.what === 'ceiling');
    if (e.stage !== 'crusher' || lever?.data.leverHolder !== e.creditor) fail('Life debt without lever save');
  } else {
    if (e.stage !== 'pit') fail('Pit debt outside pit');
    const pit = events.slice(e.i + 1).find(v => v.type === 'reveal' && v.what === 'pit' && v.round === e.round);
    const prior = events.slice(0, e.i).findLast(v => v.type === 'reveal' && v.what === 'pit');
    const rope = events.slice(0, e.i).findLast(v => v.type === 'reveal' && v.what === 'rope');
    if (!pit) fail('Life debt without pit save');
    if (e.reason === 'step' && (!pit.data.lifted.includes(e.debtor) || (prior?.data.base ?? pit.data.base ?? rope?.data.saved) !== e.creditor)) fail('Life debt without step save');
    if (e.reason === 'rope' && !(rope?.data.by === e.creditor && (rope.data.saved === e.debtor || pit.data.lifted.includes(e.debtor)))) fail('Life debt without rope save');
  }
  if (events.slice(0, e.i).some(v => v.type === 'life_debt' && v.stage === e.stage && v.reason === e.reason && v.debtor === e.debtor && v.creditor === e.creditor)) fail('Duplicate life debt');
}
