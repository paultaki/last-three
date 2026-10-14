import { PACT_ROUNDS, pactRules, limitWords } from './rules.js';

export function pactActions(g, name, quiet = 'wait') {
  const others = g.aliveList().filter(n => n !== name);
  return [quiet,
    ...others.filter(n => !g.partners(name).includes(n)).map(n => `offer_pact:${n}`),
    ...others.filter(n => g.offers.get(n)?.has(name) && !g.partners(name).includes(n)).map(n => `accept_pact:${n}`),
  ];
}

export function resolvePacts(g, names, results) {
  // Legal acceptance was computed before any answers; unseen simultaneous offers cannot count.
  for (const name of names) {
    const action = results[name].action;
    if (action.startsWith('offer_pact:')) {
      const to = action.slice(11);
      if (g.partners(name).includes(to)) continue;
      if (!g.offers.has(name)) g.offers.set(name, new Set());
      g.offers.get(name).add(to);
      g.emit('pact_offer', { from: name, to });
    } else if (action.startsWith('accept_pact:')) {
      g.formPact(action.slice(12), name);
    }
  }
}

export async function runPacts(g, after, rounds = PACT_ROUNDS) {
  g.offers.clear();
  g.beginStage('pacts', `Pact window after ${after}.`);
  for (let round = 1; round <= rounds; round++) {
    g.beginRound('pacts', round, rounds);
    const names = g.aliveList();
    const results = await g.ask(names, name => ({
      phase: 'pacts', roundsTotal: rounds, stageState: { offers: [...g.offers].flatMap(([from, targets]) => [...targets].map(to => ({ from, to }))) },
      legalActions: pactActions(g, name), rules: pactRules(),
    }), () => 'wait');
    g.speak(names, results);
    g.emitActions(names, results);
    resolvePacts(g, names, results);
  }
  g.offers.clear();
  g.endStage();
}

export async function runOpening(g) {
  g.beginStage('opening', g.v6 ? 'Eight rivals. Only three will walk out.' : 'Eight rivals face the jury they will create.');
  g.beginRound('intro', 1, 1);
  const names = g.aliveList();
  const results = await g.ask(names, () => ({
    phase: 'intro', roundsTotal: 1, legalActions: ['speak'], allowBreak: false,
    rules: g.v6 ? 'Why are you here? Invent one sentence about what surviving means to you, at most 25 words in say.' : 'Why are you here? Invent one sentence about what the prize means to you, at most 25 words in say. Remember that the eliminated jury will rank the final three.',
  }), () => 'speak');
  g.think(names, results);
  g.emitActions(names, results);
  for (const name of names) g.emit('intro_motive', { name, text: limitWords(results[name].say) || '[silence]' });
  g.endStage();
}
