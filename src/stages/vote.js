import { VOTE_CAMPAIGN_ROUNDS, voteRules, ballotReason } from '../rules.js';
import { pactActions, resolvePacts } from '../social.js';

export function reasonFor(result) {
  const reason = ballotReason(result.thought);
  if (reason) return reason;
  result.notes.push('missing private reason; engine fallback recorded');
  result.valid = false;
  return '[No reason supplied; engine default.]';
}

export async function runVote(g) {
  g.beginStage('vote', g.alive.size > 3 ? 'Every remaining contestant stands on a trapdoor.' : 'Three remain; no trapdoor vote is needed.');
  for (let elimination = 1; g.alive.size > 3; elimination++) {
    g.offers.clear();
    const names = g.aliveList();
    for (let round = 1; round <= VOTE_CAMPAIGN_ROUNDS; round++) {
      g.beginRound('campaign', round, VOTE_CAMPAIGN_ROUNDS);
      const results = await g.ask(names, name => ({
        phase: 'campaign', roundsTotal: VOTE_CAMPAIGN_ROUNDS, stageState: { elimination, offers: [...g.offers].flatMap(([from, targets]) => [...targets].map(to => ({ from, to }))) },
        legalActions: pactActions(g, name, 'campaign'), rules: voteRules('campaign'),
      }), () => 'campaign');
      g.speak(names, results);
      g.emitActions(names, results);
      resolvePacts(g, names, results);
    }
    g.offers.clear();
    let candidates = names, voters = names, tallies, tied, method;
    for (let ballot = 1; ballot <= 2; ballot++) {
      if (!voters.length) break;
      const phase = ballot === 1 ? 'ballot' : 'revote';
      g.beginRound(phase, ballot, 2);
      const results = await g.ask(voters, name => ({
        phase, roundsTotal: 2, stageState: { elimination, candidates, voters }, allowBreak: false,
        legalActions: candidates.filter(n => n !== name).map(n => `vote:${n}`), rules: voteRules(phase),
      }), (name, view) => g.rng.pick(view.legalActions));
      const reasons = Object.fromEntries(voters.map(n => [n, reasonFor(results[n])]));
      g.think(voters, results);
      g.emitActions(voters, results, {}, { visibility: 'private' });
      tallies = Object.fromEntries(candidates.map(n => [n, 0]));
      // All answers are frozen before seeded, sequential publication. No speech/whisper here.
      for (const name of g.rng.shuffle(voters)) {
        const target = results[name].action.slice(5);
        tallies[target]++;
        g.emit('vote_reveal', { name, target, reason: reasons[name], ballot, elimination });
        g.breakPact(name, target, 'vote');
      }
      const high = Math.max(...Object.values(tallies));
      tied = candidates.filter(n => tallies[n] === high);
      if (tied.length === 1) { method = ballot === 1 ? 'vote' : 'revote'; break; }
      candidates = tied;
      voters = names.filter(n => !tied.includes(n));
    }
    const name = tied.length === 1 ? tied[0] : g.rng.pick(tied);
    g.emit('vote_result', { name, tallies, tied, method: method ?? 'seeded', elimination });
    g.eliminate([name], { cause: 'trapdoor', style: 'chute', luckyWhy: 'the final three doors stay shut' });
    await g.finishEliminations();
  }
  g.endStage();
}
