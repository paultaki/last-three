// The epilogue (rules v4): not an obstacle. After the last obstacle, every agent who finished in
// place 1, 2 or 3 may scratch one note on the chalk wall for future contestants. Nothing here can
// change a place, a death or the alive set.

import { SEATS } from '../game.js';
import { chalkRules, sanitizeChalkText } from '../rules.js';

const ACTIONS = ['write', 'skip'];

export async function runChalk(g) {
  const placed = SEATS.filter((name) => g.places.has(name));
  if (!placed.length) return;
  g.beginStage('chalk', 'The game is over. The top three finishers may each leave one message on the chalk wall.', placed);
  g.beginRound('write', 1, 1);
  const specFor = (name) => ({
    phase: 'write',
    roundsTotal: 1,
    stageState: { place: g.places.get(name) },
    legalActions: [...ACTIONS],
    rules: chalkRules(g.places.get(name)),
  });
  const results = await g.ask(placed, specFor, () => 'skip');
  const extraNotes = {};
  const written = [];
  for (const name of placed) {
    const r = results[name];
    const notes = [];
    if (r.whisper || r.forge) notes.push('whisper and forge are ignored in the epilogue');
    if (r.action === 'write') {
      const text = sanitizeChalkText(r.say);
      if (text) written.push({ name, place: g.places.get(name), text });
      else notes.push('write without a message in "say": nothing was written');
    } else if (r.say && r.valid) {
      notes.push('say is only used with write: nothing was written');
    }
    if (notes.length) extraNotes[name] = notes;
  }
  g.think(placed, results);
  g.emitActions(placed, results, extraNotes);
  for (const note of written) {
    g.emit('chalk_write', note);
    g.chalkWritten.push({ ...note });
  }
  g.endStage(placed);
}
