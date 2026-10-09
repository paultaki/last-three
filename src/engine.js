// runGame({ seed, agents, config }) -> tape. Orchestrates the five stages in order (spec section 4).
//
// config (all optional): id, createdAt (fixed defaults keep tapes byte-reproducible; callers that
// want real timestamps pass one), agentTimeoutMs, and two test hooks: powers (seat -> power id)
// and ledgeMaxRounds. config.chalk is up to three earlier winners' notes ({text, byPlace}); the
// engine cleans them, shows them to every agent, and records them on the tape as chalkShown.

import { Game, SEATS } from './game.js';
import { runBridge } from './stages/bridge.js';
import { runCrusher } from './stages/crusher.js';
import { runPit } from './stages/pit.js';
import { runDisc } from './stages/disc.js';
import { runLedge } from './stages/ledge.js';
import { runChalk } from './stages/chalk.js';

export { SEATS };

/** Bumped whenever the rules change in a way that makes old tapes incomparable. v2: Wedge dive, no repeated ledge defence. v3: the Pit and its rope, the landed-shoves ledge tie-break, rivals wording. v4: the chalk wall (notes from earlier winners, and an epilogue where the top three write one), rope cost 2. */
export const RULES_VERSION = 4;

const DEFAULT_DATE = '20261008';
const DEFAULT_CREATED_AT = '2026-10-08T00:00:00.000Z';

/** Stage order and preconditions (spec section 4). Bridge always runs. */
const STAGES = [
  { run: runBridge, canRun: () => true },
  { run: runCrusher, canRun: (g) => g.alive.size > 3 },
  { run: runPit, canRun: (g) => g.alive.size > 3 },
  { run: runDisc, canRun: (g) => g.alive.size > 3 },
  { run: runLedge, canRun: (g) => g.alive.size >= 2 },
];

export async function runGame({ seed, agents, config = {} }) {
  const g = new Game({ seed, agents, config });
  const players = SEATS.map((name) => ({
    name,
    model: modelName(agents[name]),
    power: g.powerOf(name),
  }));
  g.emit('game_start', { players });
  if (g.chalk.length) g.emit('chalk_read', { notes: structuredClone(g.chalk) });

  for (const stage of STAGES) {
    if (g.alive.size <= 1) break; // exactly one left: they are 1st and the game is over
    if (stage.canRun(g)) await stage.run(g);
  }

  if (g.alive.size !== 1) {
    throw new Error(`engine invariant broken: ${g.alive.size} agents alive at the end of the game`);
  }
  const [winner] = g.alive;
  g.places.set(winner, 1);
  await runChalk(g); // the epilogue never changes places or deaths

  const places = SEATS.map((name) => {
    const place = g.places.get(name) ?? null;
    if (place) return { name, place };
    return { name, place: null, diedAt: g.deaths.find((d) => d.name === name).stage };
  });
  g.emit('game_end', { places: structuredClone(places) });

  return {
    version: 1,
    rulesVersion: RULES_VERSION,
    id: config.id ?? `${DEFAULT_DATE}-${String(seed).padStart(4, '0')}`,
    seed,
    createdAt: config.createdAt ?? DEFAULT_CREATED_AT,
    players,
    chalkShown: structuredClone(g.chalk),
    chalkWritten: structuredClone(g.chalkWritten),
    events: g.events,
    result: {
      places,
      deaths: g.deaths.map(({ name, stage, cause, style }) => ({ name, stage, cause, style })),
    },
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
