# Last Three

Eight AI agents enter a lethal gauntlet. Three survive. The five eliminated contestants become the jury and rank the final three for prizes that cannot be shared.

The default engine uses **rules v5**: Guided Bridge -> Crusher -> Pit -> Trapdoor Vote -> Jury of the Fallen. It is plain JavaScript (Node >=20, ESM, no dependencies), with seeded randomness and a complete JSON event tape. Real agents use the Vercel AI Gateway; scripted bots run entirely offline.

- Rules and implementation decisions: [v5 design spec](docs/superpowers/specs/2026-10-12-last-three-v5-design.md)
- Historical real-game findings: [docs/FINDINGS.md](docs/FINDINGS.md)
- Paid-run history: [docs/RUN-LOG.md](docs/RUN-LOG.md)
- Historical v1-v4 replays: https://www.thecriticalfew.com/last-three/

The existing viewer and film layer are historical v1-v4 consumers. Their v5 adaptation is a separate phase. Existing tapes remain unchanged and still validate.

## Free local play

```bash
npm test
npm run check
node bin/play.js --seed 7
node bin/play.js --seed 7 --out /tmp/last-three-7.json
```

Without `--out`, scripted tapes go to the system temporary directory under `last-three-scripted/`. They are not added to the published tape collection. The engine's default ID and timestamp are fixed for deterministic tests; the CLI supplies a real creation timestamp.

## Rules v5

1. **Guided Bridge.** Elect a safe Guide who privately knows all eight safe panes. They call a side before each walker steps. They can lie; others can counter-call.
2. **Crusher.** One contestant holds the lever so everyone else escapes. The holder risks the dive. Others may push someone onto the lever.
3. **Pit.** A human step lets rivals climb out. Throwing the single rope returns the rescuer to the floor to anchor it. They must climb out last and can drown.
4. **Trapdoor Vote.** Two campaign rounds, then secret votes revealed one at a time with reasons. Eliminate one contestant per ballot until three remain.
5. **Jury of the Fallen.** Final pleas, juror questions and answers, then private rankings. Borda 3/2/1, most first-place votes, then seeded luck determine places.

Public wristband pacts record agreement and betrayal. Life debts record direct saves. Each contestant states a motive; every eliminated contestant gets last words and enters the jury box. Jurors receive a bounded dossier of public events and relevant private thoughts and whispers. At least three survive every hazard. New games have no powers, message forgery or chalk wall.

## Real games (cost money)

```bash
node bin/run-llm.js --seed 1 --tier mixed
node bin/batch.js --games 10 --tier mixed --cap 2
```

The `mixed` roster now uses GPT-5.6 Luna in place of gpt-oss-120b, with reasoning requested off through the existing gateway adapter. Historical tapes preserve the roster that actually played.

Available tiers: `cheap`, `mixed`, `heavy`, `premium`; one-game runs also accept eight comma-separated `--models`. Gateway credentials and spend caps use the existing adapter and ledger. No paid calls are needed for the verification gate. `bin/stats.js` compares only tapes of the selected rules version (latest by default).
