import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createLedger, SpendCapError, HARD_CEILING_USD, parsePriceTable } from '../../src/llm/ledger.js';

const prices = { 'm/a': { input: 1e-6, output: 5e-6 } };
const fresh = (opts = {}) => {
  const dir = mkdtempSync(join(tmpdir(), 'ledger-'));
  return { dir, path: join(dir, 'spend.json'), make: (o = {}) => createLedger({ path: join(dir, 'spend.json'), prices, warn: () => {}, ...opts, ...o }) };
};

test('record accumulates totals, per-model and per-game breakdowns', () => {
  const { make } = fresh();
  const ledger = make();
  ledger.record('m/a', 1000, 200, 'g1'); // 0.001 + 0.001
  ledger.record('m/a', 1000, 200, 'g2');
  const t = ledger.totals();
  assert.ok(Math.abs(t.usd - 0.004) < 1e-12);
  assert.equal(t.calls, 2);
  assert.equal(t.inputTokens, 2000);
  assert.equal(t.byModel['m/a'].calls, 2);
  assert.ok(Math.abs(ledger.gameTotals('g1').usd - 0.002) < 1e-12);
  assert.equal(ledger.gameTotals('nope').calls, 0);
});

test('totals persist across ledger instances', () => {
  const { make, path } = fresh();
  make().record('m/a', 1_000_000, 0, 'g');
  assert.ok(existsSync(path));
  assert.ok(Math.abs(make().totals().usd - 1) < 1e-9);
});

test('assertCanSpend throws SpendCapError past the total cap', () => {
  const { make } = fresh();
  const ledger = make({ capUsd: 1 });
  ledger.record('m/a', 900_000, 0, 'g'); // $0.90
  assert.doesNotThrow(() => ledger.assertCanSpend(0.05));
  assert.throws(() => ledger.assertCanSpend(0.2), (e) => e instanceof SpendCapError && e.scope === 'total');
});

test('cap is clamped to the hard ceiling', () => {
  const { make } = fresh();
  const ledger = make({ capUsd: 500 });
  assert.equal(ledger.cap, HARD_CEILING_USD);
  assert.equal(HARD_CEILING_USD, 18);
  assert.throws(() => ledger.assertCanSpend(19), SpendCapError);
});

test('default cap is $12', () => {
  assert.equal(fresh().make().cap, 12);
});

test('per-game cap trips only for the game that exceeds it', () => {
  const { make } = fresh();
  const ledger = make({ perGameCapUsd: 0.01 });
  ledger.record('m/a', 8000, 0, 'g1'); // $0.008
  assert.throws(() => ledger.assertCanSpend(0.005, 'g1'), (e) => e.scope === 'game');
  assert.doesNotThrow(() => ledger.assertCanSpend(0.005, 'g2'));
});

test('unknown model uses $1/M in, $5/M out and warns once', () => {
  const warnings = [];
  const { make } = fresh();
  const ledger = make({ warn: (m) => warnings.push(m) });
  const usd = ledger.record('x/unknown', 1_000_000, 1_000_000, 'g');
  ledger.record('x/unknown', 1, 1, 'g');
  assert.ok(Math.abs(usd - 6) < 1e-9);
  assert.equal(warnings.length, 1);
});

test('parsePriceTable reads per-token string prices', () => {
  const table = parsePriceTable({ data: [{ id: 'a/b', pricing: { input: '0.000001', output: '0.000005' } }, { id: 'no-price' }] });
  assert.deepEqual(table, { 'a/b': { input: 1e-6, output: 5e-6 } });
});

test('ready() fetches the price table once and caches it for 24 h', async () => {
  const { dir } = fresh();
  let fetches = 0;
  const fetchImpl = async () => (fetches++, { ok: true, json: async () => ({ data: [{ id: 'm/z', pricing: { input: '0.000002', output: '0.00001' } }] }) });
  const opts = { path: join(dir, 'spend.json'), fetchImpl, warn: () => {} };
  const a = createLedger(opts);
  await a.ready();
  assert.ok(Math.abs(a.costOf('m/z', 1_000_000, 0) - 2) < 1e-9);
  const b = createLedger(opts);
  await b.ready();
  assert.equal(fetches, 1);
  const stale = createLedger({ ...opts, now: () => Date.now() + 25 * 3600 * 1000 });
  await stale.ready();
  assert.equal(fetches, 2);
});

test('price fetch failure falls back to the stale cache without throwing', async () => {
  const { dir } = fresh();
  writeFileSync(join(dir, 'prices.json'), JSON.stringify({ fetchedAt: 0, prices: { 'm/c': { input: 3e-6, output: 3e-6 } } }));
  const ledger = createLedger({ path: join(dir, 'spend.json'), fetchImpl: async () => { throw new Error('offline'); }, warn: () => {} });
  await ledger.ready();
  assert.ok(Math.abs(ledger.costOf('m/c', 1_000_000, 0) - 3) < 1e-9);
  assert.ok(readFileSync(join(dir, 'prices.json'), 'utf8').includes('m/c'));
});
