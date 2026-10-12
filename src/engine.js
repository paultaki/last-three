// The production engine runs rules v5. Historical tapes retain their original validator.
import { Game, SEATS } from './game.js';
import { runBridge } from './stages/bridge.js';
import { runCrusher } from './stages/crusher.js';
import { runPit } from './stages/pit.js';
import { runVote } from './stages/vote.js';
import { runJury } from './stages/jury.js';
import { runOpening, runPacts } from './social.js';
export { SEATS };
export const RULES_VERSION = 5;

export async function runGame({ seed, agents, config = {} }) {
  const g = new Game({ seed, agents, config: { ...config, rulesVersion: 5 } });
  const players = SEATS.map(name => ({ name, model: modelName(agents[name]) }));
  g.emit('game_start', { players });
  await runOpening(g);
  await runPacts(g, 'opening');
  for (const [name, run] of [['bridge', runBridge], ['crusher', runCrusher], ['pit', runPit], ['vote', runVote]]) {
    await run(g);
    await runPacts(g, name);
  }
  await runJury(g);
  if (g.alive.size !== 3 || g.places.size !== 3 || g.deaths.length !== 5) throw new Error('v5 final-three invariant broken');
  const places = SEATS.map(name => g.places.has(name) ? { name, place: g.places.get(name) }
    : { name, place: null, diedAt: g.deaths.find(d => d.name === name).stage });
  g.emit('game_end', { places: structuredClone(places) });
  return {
    version: 1, rulesVersion: RULES_VERSION,
    id: config.id ?? `20261008-${String(seed).padStart(4, '0')}`,
    createdAt: config.createdAt ?? '2026-10-08T00:00:00.000Z', seed, players, events: g.events,
    result: { places, deaths: g.deaths.map(({ name, stage, cause, style }) => ({ name, stage, cause, style })) },
    usage: sumUsage(agents),
  };
}

/** The agent's model label as a plain string; a hostile `model` can never throw here. */
function modelName(agent) {
  try {
    const model = agent.model;
    return model === undefined || model === null ? 'unknown' : String(model).slice(0, 200);
  } catch {
    return 'unknown';
  }
}

/** Agents may expose usage() (LLM agents do); scripted bots do not. */
function sumUsage(agents) {
  const total = { inputTokens: 0, outputTokens: 0, usd: 0, calls: 0 };
  for (const name of SEATS) {
    let usage;
    try {
      usage = agents[name].usage?.();
    } catch {
      continue;
    }
    for (const key of Object.keys(total)) {
      if (Number.isFinite(usage?.[key])) total[key] += usage[key];
    }
  }
  return total;
}
