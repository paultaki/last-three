import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validateTape } from '../../src/tape.js';

const run = (script, ...args) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'last-three-'));

test('bin/play.js writes a valid tape and prints places and deaths', () => {
  const dir = tmp();
  const out = path.join(dir, 'nested', 'game.json');
  const result = run('bin/play.js', '--seed', '12', '--kinds', 'saint,coward,liar,shover', '--out', out, '--id', 'cli-test');
  assert.equal(result.status, 0, result.stderr);
  const tape = JSON.parse(fs.readFileSync(out, 'utf8'));
  validateTape(tape);
  assert.equal(tape.id, 'cli-test');
  assert.equal(tape.seed, 12);
  assert.match(result.stdout, /Places:\n {2}1\. /);
  assert.match(result.stdout, /Deaths by stage:/);
  assert.notEqual(tape.createdAt, '2026-10-08T00:00:00.000Z', 'play.js stamps real time');
});

test('bin/play.js rejects bad options with a message and non-zero exit', () => {
  const unknownKind = run('bin/play.js', '--seed', '1', '--kinds', 'wizard', '--out', path.join(tmp(), 'x.json'));
  assert.notEqual(unknownKind.status, 0);
  assert.match(unknownKind.stderr, /Unknown bot kind/);
  assert.notEqual(run('bin/play.js', '--seed', 'abc').status, 0);
  assert.notEqual(run('bin/play.js', '--bogus', '1').status, 0);
});

test('bin/validate-tapes.js passes good tapes, skips index/stats, and fails on a broken one', () => {
  const dir = tmp();
  for (const seed of [1, 2]) {
    assert.equal(run('bin/play.js', '--seed', String(seed), '--out', path.join(dir, `${seed}.json`)).status, 0);
  }
  fs.writeFileSync(path.join(dir, 'index.json'), '[]');
  fs.writeFileSync(path.join(dir, 'stats.json'), '{}');
  const good = run('bin/validate-tapes.js', dir);
  assert.equal(good.status, 0, good.stderr);
  assert.match(good.stdout, /2 passed, 0 failed/);

  const tape = JSON.parse(fs.readFileSync(path.join(dir, '1.json'), 'utf8'));
  tape.events.find((e) => e.type === 'say' || e.type === 'action').round = 'x';
  fs.writeFileSync(path.join(dir, 'broken.json'), JSON.stringify(tape));
  const bad = run('bin/validate-tapes.js', dir);
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /FAIL broken.json/);
});

test('bin/validate-tapes.js on the shipped web/tapes passes', () => {
  const result = run('bin/validate-tapes.js');
  assert.equal(result.status, 0, result.stderr);
});
