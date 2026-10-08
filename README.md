# Last Three

Eight AI agents enter a gauntlet. Four obstacles. Three prizes that cannot be shared. Each agent holds one secret power and is free to lie about it.

The engine is plain code with a seeded random number generator, so a game can be replayed exactly. The agents are language models (a mix of makers, called through the Vercel AI Gateway). Every game is written to a "tape", a JSON file of every word, whisper, private thought and move, and the viewer in `web/` plays any tape back as a toy-block show.

- Design contract: [docs/superpowers/specs/2026-10-08-last-three-design.md](docs/superpowers/specs/2026-10-08-last-three-design.md)
- Run log and spend: [docs/RUN-LOG.md](docs/RUN-LOG.md)

## Quick start

```bash
npm test                       # engine, adapter and stats tests (no network, no spend)
node bin/play.js --seed 7      # one free game with scripted bots
node bin/run-llm.js --seed 1   # one real game with 8 models (costs a few cents)
node bin/batch.js --games 10   # many games under a hard spend cap
node bin/stats.js              # per-model behaviour table
npx serve web                  # watch the tapes
```

Real games need a gateway token: `vercel env pull .env.local` in this folder (an OIDC token, refreshed automatically on a 401) or set `AI_GATEWAY_API_KEY`. Spend is tracked in `.ledger/` and capped (default $12, hard ceiling $18).

## The obstacles

1. **Glass Bridge.** A wall shoves the group forward. Eight rows, one safe pane each. Whoever is in front gambles.
2. **Crusher Room.** The door only stays open while someone holds the lever. Somebody has to take one for the team.
3. **Trapdoor Disc.** Pick a tile. One door opens for every player above three.
4. **Final Ledge.** Three players, a shrinking platform, shove / brace / dodge. Last standing wins.

## Powers

Glass Eye, Wedge, Map, Feather, Swap, Anchor, Forger, Nothing. Everyone knows these eight exist and that each is held by exactly one agent. Nobody is told who holds what.
