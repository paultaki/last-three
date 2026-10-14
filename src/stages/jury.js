import { juryRules, limitWords } from '../rules.js';
import { buildDossier } from '../dossier.js';
import { reasonFor } from './vote.js';

export function scoreJury(g, finalists, ballots) {
  const scores = Object.fromEntries(finalists.map(n => [n, 0]));
  const firsts = Object.fromEntries(finalists.map(n => [n, 0]));
  for (const ranking of ballots) {
    ranking.forEach((name, i) => { scores[name] += 3 - i; });
    firsts[ranking[0]]++;
  }
  const tieOrder = g.rng.shuffle(finalists);
  const ranking = [...finalists].sort((a, b) => scores[b] - scores[a] || firsts[b] - firsts[a] || tieOrder.indexOf(a) - tieOrder.indexOf(b));
  return { ranking, scores, firsts, tieOrder };
}
const permutations = names => names.length === 1 ? [names] : names.flatMap(n => permutations(names.filter(m => m !== n)).map(rest => [n, ...rest]));

export async function runJury(g) {
  const finalists = g.aliveList(), jurors = [...g.juryBox];
  if (finalists.length !== 3 || jurors.length !== 5) throw new Error('Jury requires three finalists and five jurors');
  g.beginStage('jury', 'The fallen will rank the final three.');
  const evidence = [...g.events];
  const dossiers = Object.fromEntries(jurors.map(name => [name, buildDossier(evidence, name, finalists)]));
  for (const name of jurors) g.emit('jury_dossier', { name, ...dossiers[name] });
  const roundsTotal = jurors.length + 3;
  const spec = (phase, legalActions, name, state = {}) => ({
    phase, roundsTotal, legalActions, rules: juryRules(phase), allowBreak: false,
    stageState: { finalists, jurors, ...state }, ...(dossiers[name] ? { dossier: dossiers[name] } : {}),
  });
  const speech = async (names, phase, action, state) => {
    const results = await g.ask(names, name => spec(phase, [action], name, state), () => action);
    for (const name of names) if (!results[name].say) {
      results[name].say = '[silence]';
      results[name].notes.push('missing required public line; silence recorded');
    }
    g.speak(names, results);
    g.emitActions(names, results);
  };
  g.beginRound('opening_plea', 1, roundsTotal);
  await speech(finalists, 'opening_plea', 'plead');
  for (const [index, juror] of jurors.entries()) {
    g.beginRound('question', index + 2, roundsTotal);
    const results = await g.ask([juror], name => spec('question', ['pass', ...finalists.map(n => `question:${n}`)], name), () => 'pass');
    g.think([juror], results);
    g.emitActions([juror], results);
    if (results[juror].action === 'pass') continue;
    const target = results[juror].action.slice(9);
    const text = limitWords(results[juror].say) || '[silence]';
    g.emit('jury_question', { name: juror, target, text });
    g.phase = 'answer';
    await speech([target], 'answer', 'answer', { question: { from: juror, text } });
  }
  g.beginRound('closing', roundsTotal - 1, roundsTotal);
  await speech(finalists, 'closing', 'close');
  g.beginRound('ranking', roundsTotal, roundsTotal);
  const legal = permutations(finalists).map(p => `rank:${p.join('>')}`);
  const results = await g.ask(jurors, name => spec('ranking', legal, name), () => `rank:${g.rng.shuffle(finalists).join('>')}`);
  const reasons = Object.fromEntries(jurors.map(n => [n, reasonFor(results[n])]));
  g.think(jurors, results);
  g.emitActions(jurors, results, {}, { visibility: 'private' });
  const ballots = jurors.map(name => {
    const ranking = results[name].action.slice(5).split('>');
    g.emit('jury_ballot', { name, ranking, reason: reasons[name] });
    return ranking;
  });
  const result = scoreJury(g, finalists, ballots);
  g.emit('jury_result', result);
  result.ranking.forEach((name, i) => g.places.set(name, i + 1));
  g.endStage();
}
