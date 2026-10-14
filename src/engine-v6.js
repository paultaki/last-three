// Rules v6: survival of the fittest. Rooms run in order until three remain; extra lever rounds
// settle it if the rooms run out first. No jury, no votes: the last three alive win.
import { Game, SEATS } from './game.js';
import { V6_ROOMS } from './rules.js';
import { runBridge } from './stages/bridge.js';
import { runLever, runCups, runJackets, runBomb, runVault } from './stages/v6.js';
import { runOpening, runPacts } from './social.js';
export { SEATS };
export const RULES_VERSION = 6;

const ROOMS = { bridge: runBridge, lever: runLever, cups: runCups, jackets: runJackets, bomb: runBomb, vault: runVault };

export async function runGame({ seed, agents, config = {} }) {
  const order = config.order ?? V6_ROOMS;
  for (const room of order) if (!ROOMS[room]) throw new Error(`Unknown v6 room: ${room}`);
  const g = new Game({ seed, agents, config: { ...config, rulesVersion: 6 } });
  const players = SEATS.map(name => ({ name, model: modelName(agents[name]) }));
  g.emit('game_start', { players, order: [...order] });
  await runOpening(g);
  await runPacts(g, 'opening');
  for (const room of order) {
    if (g.alive.size <= 3) break;
    await ROOMS[room](g);
    if (g.alive.size > 3) await runPacts(g, room);
  }
  while (g.alive.size > 3) await runLever(g, { sudden: true });
  const survivors = g.aliveList();
  const places = SEATS.map(name => (g.alive.has(name) ? { name, place: 1 }
    : { name, place: null, diedAt: g.deaths.find(d => d.name === name).stage }));
  g.emit('game_end', { survivors, places: structuredClone(places), grudges: structuredClone(g.grudges) });
  return {
    version: 1, rulesVersion: RULES_VERSION,
    id: config.id ?? `20261014-${String(seed).padStart(4, '0')}`,
    createdAt: config.createdAt ?? '2026-10-14T00:00:00.000Z', seed, order: [...order], players, events: g.events,
    result: { survivors, places, deaths: g.deaths.map(({ name, stage, cause, style }) => ({ name, stage, cause, style })), grudges: g.grudges },
    usage: sumUsage(agents),
  };
}

function modelName(agent) {
  try {
    const model = agent.model;
    return model === undefined || model === null ? 'unknown' : String(model).slice(0, 200);
  } catch {
    return 'unknown';
  }
}

function sumUsage(agents) {
  const total = { inputTokens: 0, outputTokens: 0, usd: 0, calls: 0 };
  for (const name of SEATS) {
    let usage;
    try { usage = agents[name].usage?.(); } catch { continue; }
    for (const key of Object.keys(total)) if (Number.isFinite(usage?.[key])) total[key] += usage[key];
  }
  return total;
}
