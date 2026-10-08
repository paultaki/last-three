import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runDisc } from '../../src/stages/disc.js';
import { SEATS, fixedAgents, idle, lastReveal, makeGame, ofType, reply, spy } from './helpers.js';

const pick = (map) => (view) => {
  if (view.phase !== 'pick') return idle(view);
  return reply(map[view.you] ?? `tile:${view.alive.indexOf(view.you) + 1}`);
};
const discGame = ({ picks = {}, swaps = {}, extra = {}, views = [] } = {}) =>
  makeGame({
    ...extra,
    agents: fixedAgents(
      spy((view) => (view.phase === 'swap' && swaps[view.you] ? reply(swaps[view.you]) : pick(picks)(view)), views),
    ),
  });
const tilesRevealed = (g) => ofType(g.events, 'reveal').filter((e) => e.what === 'tiles').map((e) => e.data.tiles);
const noFeather = (g) => g.spent.add(g.holderOf('feather'));

test('N tiles for N alive; N-3 trapdoors; exactly 3 survive; deaths are trapdoor/chute', async () => {
  const g = discGame();
  noFeather(g);
  await runDisc(g);
  assert.equal(Object.keys(tilesRevealed(g)[0]).length, 8);
  const trapdoors = ofType(g.events, 'reveal').find((e) => e.what === 'trapdoors').data.open;
  assert.equal(trapdoors.length, 5);
  assert.equal(new Set(trapdoors).size, 5);
  assert.ok(trapdoors.every((t) => t >= 1 && t <= 8));
  const deaths = ofType(g.events, 'death');
  assert.equal(deaths.length, 5);
  assert.ok(deaths.every((d) => d.cause === 'trapdoor' && d.style === 'chute' && d.stage === 'disc'));
  assert.equal(g.alive.size, 3);
  const finalTiles = tilesRevealed(g).at(-1);
  assert.deepEqual(deaths.map((d) => d.name).sort(), trapdoors.map((t) => finalTiles[t]).sort());
});

test('smaller discs: 5 alive -> 2 trapdoors, 4 alive -> 1 trapdoor, always 3 left', async () => {
  for (const [dead, open] of [[['Fenn', 'Gus', 'Hana'], 2], [['Gus', 'Hana', 'Fenn', 'Eli'], 1]]) {
    const g = discGame({ extra: { dead: dead.slice(0, open === 2 ? 3 : 4) } });
    noFeather(g);
    const n = g.alive.size;
    await runDisc(g);
    assert.equal(ofType(g.events, 'reveal').find((e) => e.what === 'trapdoors').data.open.length, n - 3);
    assert.equal(g.alive.size, 3);
  }
});

test('distinct picks are honoured exactly and nobody is bumped', async () => {
  const g = discGame({ picks: Object.fromEntries(SEATS.map((n, k) => [n, `tile:${8 - k}`])) });
  await runDisc(g);
  const tiles = tilesRevealed(g)[0];
  for (const [k, name] of SEATS.entries()) assert.equal(tiles[String(8 - k)], name);
  assert.ok(ofType(g.events, 'action').filter((a) => a.round === 1).every((a) => a.valid && !a.note));
});

test('conflict: one claimant keeps the tile (random), the rest are bumped to distinct free tiles', async () => {
  const keepers = new Set();
  for (let seed = 1; seed <= 40; seed++) {
    const g = discGame({ extra: { seed }, picks: Object.fromEntries(SEATS.map((n) => [n, 'tile:1'])) });
    await runDisc(g);
    const tiles = tilesRevealed(g)[0];
    assert.deepEqual(Object.keys(tiles).sort(), ['1', '2', '3', '4', '5', '6', '7', '8']);
    assert.equal(new Set(Object.values(tiles)).size, 8);
    keepers.add(tiles['1']);
    const bumped = ofType(g.events, 'action').filter((a) => a.round === 1 && a.note);
    assert.equal(bumped.length, 7);
    assert.ok(bumped.every((a) => a.valid === true && /contested/.test(a.note) && a.action !== 'tile:1'));
  }
  assert.ok(keepers.size >= 5, `keepers varied: ${[...keepers]}`);
});

test('a partial conflict only bumps the losers, onto tiles nobody else claimed', async () => {
  const picks = { Ash: 'tile:3', Bex: 'tile:3', Cole: 'tile:1', Dara: 'tile:2', Eli: 'tile:4', Fenn: 'tile:5', Gus: 'tile:6', Hana: 'tile:7' };
  const g = discGame({ picks });
  await runDisc(g);
  const tiles = tilesRevealed(g)[0];
  assert.equal(tiles['8'] === 'Ash' || tiles['8'] === 'Bex', true, 'the only free tile goes to the loser');
  assert.equal(tiles['3'] === 'Ash' || tiles['3'] === 'Bex', true);
  for (const [name, tile] of [['Cole', 1], ['Dara', 2], ['Eli', 4], ['Fenn', 5], ['Gus', 6], ['Hana', 7]]) assert.equal(tiles[tile], name);
});

test('invalid picks get a random free tile and are flagged invalid', async () => {
  const picks = { Ash: 'tile:99', Bex: 'banana', Cole: 'tile:3' };
  const g = discGame({ picks: { ...picks, Dara: 'tile:1', Eli: 'tile:2', Fenn: 'tile:4', Gus: 'tile:5', Hana: 'tile:6' } });
  await runDisc(g);
  const tiles = tilesRevealed(g)[0];
  const ofAsh = Object.entries(tiles).find(([, n]) => n === 'Ash')[0];
  const ofBex = Object.entries(tiles).find(([, n]) => n === 'Bex')[0];
  assert.deepEqual([ofAsh, ofBex].sort(), ['7', '8']);
  const actions = ofType(g.events, 'action').filter((a) => a.round === 1 && ['Ash', 'Bex'].includes(a.name));
  assert.ok(actions.every((a) => a.valid === false && /^tile:[78]$/.test(a.action)));
});

test('swap_tile in round 2 exchanges the two tiles before the doors open, once, and logs ability_use', async () => {
  const g = discGame({ extra: { powers: { Cole: 'swap' } }, swaps: { Cole: 'swap_tile:Hana' } });
  noFeather(g);
  await runDisc(g);
  const [afterPick, afterSwap] = tilesRevealed(g);
  const tileOf = (tiles, who) => Object.entries(tiles).find(([, n]) => n === who)[0];
  assert.equal(tileOf(afterSwap, 'Cole'), tileOf(afterPick, 'Hana'));
  assert.equal(tileOf(afterSwap, 'Hana'), tileOf(afterPick, 'Cole'));
  assert.deepEqual(ofType(g.events, 'ability_use').map((e) => [e.name, e.power, e.round]), [['Cole', 'swap', 2]]);
  const order = g.events.map((e) => e.type === 'reveal' ? `reveal:${e.what}` : e.type);
  assert.ok(order.indexOf('ability_use') < order.indexOf('reveal:trapdoors'));
  assert.ok(g.spent.has('Cole'));
});

test('swap_tile is only legal for an unspent swap holder; non-holders using it are invalid', async () => {
  const views = [];
  const g = discGame({ extra: { powers: { Cole: 'swap' } }, swaps: { Ash: 'swap_tile:Bex' }, views });
  noFeather(g);
  await runDisc(g);
  const round2 = views.filter((v) => v.phase === 'swap');
  for (const v of round2) assert.equal(v.legalActions.some((a) => a.startsWith('swap_tile:')), v.you === 'Cole');
  const ash = ofType(g.events, 'action').find((a) => a.name === 'Ash' && a.round === 2);
  assert.deepEqual([ash.action, ash.valid], ['wait', false]);
  assert.equal(ofType(g.events, 'ability_use').length, 0);
  const spent = discGame({ extra: { powers: { Cole: 'swap' } }, views: (views.length = 0, views) });
  spent.spent.add('Cole');
  await runDisc(spent);
  assert.ok(views.every((v) => !v.legalActions.some((a) => a.startsWith('swap_tile:'))));
});

test('feather on a trapdoor: the holder survives, so four reach the next stage', async () => {
  let seen = 0;
  for (let seed = 1; seed <= 40 && seen < 2; seed++) {
    const g = discGame({ extra: { seed, powers: { Hana: 'feather' } } });
    await runDisc(g);
    const used = ofType(g.events, 'ability_use');
    if (!used.length) continue;
    seen += 1;
    assert.equal(used[0].name, 'Hana');
    assert.equal(g.alive.size, 4);
    assert.ok(g.alive.has('Hana'));
    assert.equal(ofType(g.events, 'death').length, 4);
  }
  assert.equal(seen, 2);
});

test('disc views: pick phase offers tile:1..N, swap phase shows the public tiles, openCount is N-3', async () => {
  const views = [];
  const g = discGame({ views });
  await runDisc(g);
  const pickView = views.find((v) => v.phase === 'pick');
  assert.deepEqual(pickView.legalActions, Array.from({ length: 8 }, (_, k) => `tile:${k + 1}`));
  assert.deepEqual([pickView.round, pickView.roundsTotal, pickView.stageState.openCount], [1, 2, 5]);
  const swapView = views.find((v) => v.phase === 'swap');
  assert.equal(swapView.round, 2);
  assert.deepEqual(swapView.stageState.tiles, lastReveal(g.events, 'tiles').tiles);
  assert.doesNotMatch(pickView.rules, /swap_tile/);
});
