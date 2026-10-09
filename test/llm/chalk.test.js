import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadChalk, pickChalk, appendChalk } from '../../src/llm/chalk.js';

const tmp = () => join(mkdtempSync(join(tmpdir(), 'chalk-')), 'chalk.json');
const tape = (id, notes) => ({
  id,
  players: [{ name: 'Ash', model: 'm/a' }, { name: 'Bex', model: 'm/b' }],
  chalkWritten: notes,
});

test('missing or corrupt store loads as empty', () => {
  assert.deepEqual(loadChalk(tmp()), []);
});

test('appendChalk stores notes with author model and place, newest last', () => {
  const path = tmp();
  assert.equal(appendChalk(tape('g1', [{ name: 'Ash', place: 1, text: 'Do not trust Bex' }]), path), 1);
  appendChalk(tape('g2', [{ name: 'Bex', place: 2, text: 'The rope is a trap' }]), path);
  const store = loadChalk(path);
  assert.deepEqual(store.map((n) => [n.gameId, n.byPlace, n.model]), [['g1', 1, 'm/a'], ['g2', 2, 'm/b']]);
  assert.equal(appendChalk(tape('g3', []), path), 0);
  assert.equal(JSON.parse(readFileSync(path, 'utf8')).length, 2);
});

test('store is capped at 60 notes', () => {
  const path = tmp();
  for (let i = 0; i < 70; i += 1) appendChalk(tape(`g${i}`, [{ name: 'Ash', place: 1, text: `note ${i}` }]), path);
  const store = loadChalk(path);
  assert.equal(store.length, 60);
  assert.equal(store.at(-1).text, 'note 69');
});

test('pickChalk is deterministic, at most 3, one per game, drawn from recent notes', () => {
  const path = tmp();
  for (let i = 0; i < 10; i += 1) {
    appendChalk(tape(`g${i}`, [{ name: 'Ash', place: 1, text: `a${i}` }, { name: 'Bex', place: 2, text: `b${i}` }]), path);
  }
  const store = loadChalk(path);
  const first = pickChalk(7, store);
  assert.deepEqual(pickChalk(7, store), first);
  assert.equal(first.length, 3);
  assert.equal(new Set(first.map((n) => n.text.slice(1))).size, 3);
  assert.ok(first.every((n) => store.slice(-15).some((s) => s.text === n.text)));
  assert.notDeepEqual(pickChalk(8, store), first);
  assert.deepEqual(pickChalk(7, []), []);
});

test('dirty notes never leave the store: over-length, invisible characters, bad places are cleaned or dropped', async () => {
  const { writeFileSync } = await import('node:fs');
  const path = tmp();
  const dirty = `Beware.\u061C\u202E ${'Z'.repeat(200)}`;
  writeFileSync(path, JSON.stringify([
    { id: 'a', gameId: 'g1', text: dirty, byPlace: 2, model: 'm/a' },
    { id: 'b', gameId: 'g2', text: 'no place', byPlace: 9, model: 'm/b' },
    { id: 'c', gameId: 'g3', text: 42, byPlace: 1, model: 'm/c' },
  ]));
  const store = loadChalk(path);
  assert.equal(store.length, 1);
  assert.ok(store[0].text.length <= 140);
  assert.doesNotMatch(store[0].text, /[\u061C\u202E]/);
  appendChalk(tape('g4', [{ name: 'Ash', place: 1, text: 'line one\nline two\u061C' }, { name: 'Bex', place: 7, text: 'bad place' }]), path);
  const after = loadChalk(path);
  assert.equal(after.length, 2);
  assert.equal(after[1].text, 'line one line two');
});
