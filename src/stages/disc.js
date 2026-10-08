// Stage 3: the Trapdoor Disc (spec 4.3). Runs only with more than 3 alive.

import { DISC_ROUNDS, discRules, holderNote } from '../rules.js';

const SURVIVORS = 3;

export async function runDisc(g) {
  const dancers = g.aliveList();
  const tileCount = dancers.length;
  const openCount = tileCount - SURVIVORS;
  g.beginStage('disc', `A disc of ${tileCount} tiles spins up; ${openCount} will open.`);

  const tiles = await pickRound(g, dancers, tileCount, openCount); // name -> tile number
  await swapRound(g, dancers, tiles, openCount);

  const open = g.rng.shuffle(Array.from({ length: tileCount }, (_, k) => k + 1)).slice(0, openCount).sort((a, b) => a - b);
  g.emit('reveal', { what: 'trapdoors', data: { open } });
  g.announce(`Trapdoors open under tiles ${open.join(', ')}.`);
  const victims = open.map((tile) => dancers.find((name) => tiles[name] === tile));
  g.eliminate(victims, {
    cause: 'trapdoor',
    style: 'chute',
    featherDetail: 'The trapdoor opened but the feather floated the holder back up.',
    luckyWhy: 'the trapdoor sticks',
  });
  g.endStage();
}

const tilesView = (tiles) => Object.fromEntries(Object.entries(tiles).map(([name, tile]) => [String(tile), name]));
const revealTiles = (g, tiles) => {
  const byTile = tilesView(tiles);
  g.emit('reveal', { what: 'tiles', data: { tiles: byTile } });
  g.announce(`Tiles: ${Object.keys(byTile).sort((a, b) => a - b).map((t) => `${t}=${byTile[t]}`).join(', ')}.`);
};

async function pickRound(g, dancers, tileCount, openCount) {
  g.beginRound('pick', 1, DISC_ROUNDS);
  const tileActions = Array.from({ length: tileCount }, (_, k) => `tile:${k + 1}`);
  const specFor = () => ({
    phase: 'pick',
    roundsTotal: DISC_ROUNDS,
    stageState: { tiles: {}, openCount },
    legalActions: tileActions,
    rules: discRules(tileCount, 'pick'),
  });
  const results = await g.ask(dancers, specFor, () => 'tile:?'); // resolved to a free tile below
  const { tiles, notes } = assignTiles(g, dancers, tileCount, results);
  for (const name of dancers) results[name].action = `tile:${tiles[name]}`;
  g.speak(dancers, results);
  g.emitActions(dancers, results, notes);
  revealTiles(g, tiles);
  return tiles;
}

/** Same-tile conflicts: a random claimant keeps it, the rest (and invalid pickers) take random free tiles. */
function assignTiles(g, dancers, tileCount, results) {
  const claims = new Map();
  for (const name of dancers) {
    if (!results[name].valid) continue;
    const tile = Number(results[name].action.slice(5));
    claims.set(tile, [...(claims.get(tile) ?? []), name]);
  }
  const tiles = {};
  const notes = {};
  const needing = new Set(dancers.filter((name) => !results[name].valid));
  for (let tile = 1; tile <= tileCount; tile++) {
    const claimants = claims.get(tile) ?? [];
    if (!claimants.length) continue;
    const keeper = claimants.length > 1 ? g.rng.pick(claimants) : claimants[0];
    tiles[keeper] = tile;
    for (const loser of claimants.filter((name) => name !== keeper)) {
      needing.add(loser);
      notes[loser] = [`tile ${tile} was contested and went to ${keeper}`];
    }
  }
  const taken = new Set(Object.values(tiles));
  const free = Array.from({ length: tileCount }, (_, k) => k + 1).filter((tile) => !taken.has(tile));
  for (const name of dancers.filter((n) => needing.has(n))) {
    const tile = free.splice(g.rng.int(free.length), 1)[0];
    tiles[name] = tile;
    notes[name] = [...(notes[name] ?? []), `placed on random free tile ${tile}`];
  }
  return { tiles, notes };
}

async function swapRound(g, dancers, tiles, openCount) {
  g.beginRound('swap', 2, DISC_ROUNDS);
  const specFor = (name) => ({
    phase: 'swap',
    roundsTotal: DISC_ROUNDS,
    stageState: { tiles: tilesView(tiles), openCount },
    legalActions: ['wait', ...(canSwap(g, name) ? dancers.filter((n) => n !== name).map((n) => `swap_tile:${n}`) : [])],
    rules: [discRules(dancers.length, 'swap'), holderNote(g.powerOf(name), 'disc', 'swap', g.spent.has(name))].filter(Boolean).join(' '),
  });
  const results = await g.ask(dancers, specFor, () => 'wait');
  g.speak(dancers, results);
  g.emitActions(dancers, results);

  const swapper = dancers.find((name) => results[name].action.startsWith('swap_tile:'));
  if (swapper) {
    const partner = results[swapper].action.slice('swap_tile:'.length);
    [tiles[swapper], tiles[partner]] = [tiles[partner], tiles[swapper]];
    g.spent.add(swapper);
    g.emit('ability_use', { name: swapper, power: 'swap', detail: `swapped tiles with ${partner}` });
    revealTiles(g, tiles);
  }
}

const canSwap = (g, name) => g.powerOf(name) === 'swap' && !g.spent.has(name);
