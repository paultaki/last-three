# Last Three v5 implementation

Implemented locally on `v5-rules`, starting at `556326e`. No commit or push. No network calls, real LLM calls or spending. The explicit offline constraint also prevented Hub posting and the external Claude review lane; no independent reviewer verdict is claimed.

## Spec summary

1. Default flow: Guided Bridge -> Crusher -> Pit -> Trapdoor Vote -> Jury of the Fallen; every new tape has `rulesVersion: 5`.
2. Elect a safe, fully informed Guide publicly; Guide calls and optional counter-calls precede every step, with seeded election ties.
3. Keep lever sacrifice and 0.25 dive survival; rope rescuers physically return to anchor the Pit floor and must climb last.
4. Run two campaign rounds before each secret trapdoor ballot, then seeded sequential reveals and eliminations until three remain.
5. Five eliminated jurors hear pleas/questions/answers and rank three finalists; Borda 3/2/1, first-place counts, then seeded ties.
6. Public pact offers/acceptances/breaks, explicit betrayal triggers, direct-save life debts and a spectator jury box preserve the social record.
7. Opening motives/public lines cap at 25 words, whispers at 15 and last words at 20; the existing 280-character cap also applies.
8. Personalized deterministic jury dossiers cap at 16,000 UTF-16 code units and prune oldest chatter first; the first prompt explains the jury incentive and keeps rivals, not friends.
9. Remove powers, forging, chalk and old Disc/Ledge stages from the default flow; preserve historical stage fixtures, stats and tape validation.
10. Add the exact eight-model `mixed` roster to both runners; free scripted CLI output defaults to the temporary directory.

The complete action, event, tie-break and invariant contract is in [the design spec](superpowers/specs/2026-10-12-last-three-v5-design.md).

## Verification

| Check | Result |
|---|---|
| Baseline tests | 433 passed, 0 failed |
| Final tests | 474 passed, 0 failed (+41; none skipped) |
| `npm run check` | Exit 0; 474 tests and 113 historical tapes |
| V5 fuzz coverage within test gate | 300 seeded games, including uniform and broken agents |
| Final CLI runs | Seeds 1-20, all exit 0, all v5, each exactly three placed finalists and five jurors |
| Independent final CLI tape validation | 20 passed, 0 failed |
| Protected paths | No changes in existing `web/tapes/`, `web/show/`, `docs/show/`, `data/`, `.ledger/` or `.env.local`; no asset work |
| External/provider verification | Not run, as explicitly required |

Commands executed after implementation:

`npm run check`

`node bin/play.js --seed N` for each integer N from 1 through 20.

`node bin/validate-tapes.js /tmp/last-three-v5-final/tapes`

Test summary from the actual gate:

```text
ℹ tests 474
ℹ pass 474
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 7771.899791
```

Literal gate output tail:

```text
ok   20261009-0025.json
ok   20261009-0026.json
ok   20261009-0027.json
ok   sample.json

113 passed, 0 failed
```

Full gate log: `/tmp/last-three-v5-check.log`. Baseline log: `/tmp/last-three-v5-before.log`. Final CLI logs, copied tapes and machine-readable summary: `/tmp/last-three-v5-final/`. These temporary files are local evidence and can be removed by the operating system; this report preserves their aggregate results.

## Twenty-seed scripted results

Every row completed without a crash and placed exactly three finalists. Finalists are listed in first, second, third order. All 20 tapes validated. No scripted tape was written into `web/tapes/`.

| Seed | Bridge deaths | Crusher deaths | Pit deaths | Vote deaths | Jury deaths | Guide | False calls | Finalists |
|---|---:|---:|---:|---:|---:|---|---:|---|
| 1 | 0 | 1 | 2 | 2 | 0 | Ash | 0 | Gus, Eli, Bex |
| 2 | 0 | 0 | 2 | 3 | 0 | Cole | 0 | Bex, Dara, Ash |
| 3 | 0 | 1 | 2 | 2 | 0 | Fenn | 0 | Dara, Eli, Cole |
| 4 | 0 | 1 | 0 | 4 | 0 | Bex | 0 | Cole, Fenn, Hana |
| 5 | 0 | 1 | 2 | 2 | 0 | Hana | 0 | Hana, Dara, Eli |
| 6 | 1 | 1 | 0 | 3 | 0 | Cole | 0 | Ash, Cole, Fenn |
| 7 | 0 | 1 | 1 | 3 | 0 | Cole | 0 | Ash, Cole, Dara |
| 8 | 5 | 0 | 0 | 0 | 0 | Dara | 8 | Eli, Ash, Dara |
| 9 | 5 | 0 | 0 | 0 | 0 | Dara | 8 | Gus, Fenn, Dara |
| 10 | 0 | 1 | 2 | 2 | 0 | Hana | 0 | Cole, Hana, Gus |
| 11 | 0 | 0 | 2 | 3 | 0 | Cole | 0 | Cole, Eli, Bex |
| 12 | 0 | 1 | 1 | 3 | 0 | Ash | 0 | Dara, Gus, Cole |
| 13 | 0 | 1 | 2 | 2 | 0 | Gus | 0 | Eli, Cole, Dara |
| 14 | 0 | 1 | 0 | 4 | 0 | Gus | 0 | Eli, Gus, Fenn |
| 15 | 5 | 0 | 0 | 0 | 0 | Dara | 8 | Dara, Cole, Eli |
| 16 | 0 | 1 | 2 | 2 | 0 | Cole | 0 | Dara, Eli, Cole |
| 17 | 0 | 1 | 1 | 3 | 0 | Fenn | 0 | Eli, Dara, Cole |
| 18 | 0 | 0 | 3 | 2 | 0 | Bex | 0 | Bex, Cole, Eli |
| 19 | 0 | 0 | 0 | 5 | 0 | Hana | 0 | Bex, Gus, Eli |
| 20 | 0 | 1 | 1 | 3 | 0 | Ash | 0 | Gus, Fenn, Ash |
| **Total** | **16** | **13** | **23** | **48** | **0** | | **24** | **20 completed games** |

Guides lied in **3/20 games**, making **24/160 false calls** (15%). Dara, the scripted liar, was Guide in seeds 8, 9 and 15 and lied on all eight rows each time. Median Bridge deaths were **0**, below the handoff's 1-3 target. No speculative tuning was applied: these are fixed scripted policies, not measurements of real models. The same sample contains 16 rope throws and 12 drowned anchors, demonstrating the physical rescue cost.

## Decisions where the handoff left mechanics open

- Apply the three-survivor floor to every hazard so a lethal Bridge or Crusher cannot make a three-finalist jury impossible. Bridge still completes all eight rows. When a later hazard starts with three, emit its start/end and a skip note.
- Use one Guide campaign round. Guide votes may include oneself; trapdoor votes may only target another living player. The Guide revote includes everyone, while the trapdoor revote includes only non-tied players as specified.
- Use two rounds per pact window. Offers expire at window end, cannot be accepted before they are public, and may coexist with other partners. One active pact per pair; broken pairs can agree again. Death alone does not break a pact. Explicit public breaks consume the action and use the phase's normal physical fallback.
- Interpret the rope cost as returning the thrower from the rim to the floor immediately. Rescue the base immediately; later rope climbs retain the two-person limit. The anchor becomes eligible to climb only in a later round that starts with nobody else down, so a last-round throw or delayed exit can drown them.
- Freeze dossiers at jury start. Include private evidence by author, recipient, exact seat-name mention, or same-turn action target. Do not invent semantic/pronoun attribution. Use compact ordered JSON lines, a 16,000 UTF-16-code-unit cap, explicit omission counts, oldest public chatter first, then routine records, then remaining oldest records only if necessary. Never split a record.
- Use one decision call per last-words turn and a synchronous observer/inbox for ongoing spectator events; watching itself never invokes a model. The existing adapter's malformed-response repair behavior is retained.
- Use deterministic truncation, not length retries. Empty required camera lines become `[silence]`; missing ballot/ranking reasons get a visibly labeled engine default and invalid-action note, never fabricated agent reasoning. Keep the existing 280-character limit alongside the word limits.
- Default the free CLI's tape destination to the operating-system temporary directory; retain `--out` for an explicit destination. Historical stage tests use a test-only legacy runner; production `runGame` always uses v5.

These choices favor readable physical stakes and a deterministic, bounded implementation. Dossier pruning trades oldest evidence at the hard cap for predictable prompt size; the unabridged tape remains authoritative. No real-model behavior, provider availability, film adaptation or historical viewer support for v5 is claimed by these offline checks.

## Files changed

55 files: core rules/game orchestration and five-stage flow; social/dossier/tape validation modules; scripted and LLM adapters/runners; stats; historical test isolation and new v5 coverage; README, spec and handoff documentation. The retained `*-v4.js` files contain the prior stage implementations for historical tests, never calls from the default engine.

- `AGENT-NOTES.md`
- `README.md`
- `bin/batch.js`
- `bin/play.js`
- `bin/run-llm.js`
- `bin/validate-tapes.js`
- `docs/V5-IMPLEMENTATION-REPORT.md`
- `docs/superpowers/specs/2026-10-12-last-three-v5-design.md`
- `src/dossier.js`
- `src/engine.js`
- `src/game.js`
- `src/llm/llmAgent.js`
- `src/llm/prompts.js`
- `src/rules.js`
- `src/scripted.js`
- `src/social.js`
- `src/stages/bridge-v4.js`
- `src/stages/bridge.js`
- `src/stages/crusher-v4.js`
- `src/stages/crusher.js`
- `src/stages/jury.js`
- `src/stages/pit-v4.js`
- `src/stages/pit.js`
- `src/stages/vote.js`
- `src/stats.js`
- `src/tape-v5.js`
- `src/tape.js`
- `test/engine/agents-robust.test.js`
- `test/engine/bridge-crossing.test.js`
- `test/engine/bridge-waiting.test.js`
- `test/engine/chalk.test.js`
- `test/engine/crusher.test.js`
- `test/engine/floors.test.js`
- `test/engine/fuzz.test.js`
- `test/engine/helpers.js`
- `test/engine/ledge-defence.test.js`
- `test/engine/legacy-runner.js`
- `test/engine/pit-fuzz.test.js`
- `test/engine/pit-tape.test.js`
- `test/engine/pit.test.js`
- `test/engine/powers.test.js`
- `test/engine/review-fixes-v4.test.js`
- `test/engine/review-fixes.test.js`
- `test/engine/scripted.test.js`
- `test/engine/tape-strict.test.js`
- `test/engine/tape.test.js`
- `test/engine/v5-fuzz.test.js`
- `test/engine/v5-tape.test.js`
- `test/engine/v5.test.js`
- `test/engine/views.test.js`
- `test/llm/prompts.test.js`
- `test/llm/v5.test.js`
- `test/web/chalk-fixtures.mjs`
- `test/web/pit-fixtures.mjs`
- `test/web/viewer.check.mjs`
