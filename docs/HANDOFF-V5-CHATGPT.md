# Handoff: Last Three, rules v5 ("maximum drama" redesign)

Copy everything below the line into ChatGPT / Codex. It is self-contained.

---

You are taking over **Last Three**, a project at `/Users/paul/Development/last-three` (GitHub `paultaki`, deploys to https://www.thecriticalfew.com/last-three/ on every push to `main`). Paul (the owner) has approved a redesign called **rules v5**. Your job: write the v5 rules spec, implement it in the engine, prove it with free scripted games, then run a small paid test batch so Paul can see whether the new games produce the scenes he wants. Do not touch the film/animation layer yet.

## What the project is

Eight AI agents (different model makers, called through the Vercel AI Gateway) run a lethal gauntlet. Only three get a prize. The engine is plain JavaScript (Node ≥20, ESM, no dependencies) with a seeded RNG, so every game is reproducible. Every game is written to a **tape** (JSON event log of every public line, whisper, private thought and move) in `web/tapes/`. A viewer and a 3D "show" in `web/` and `web/show/` replay tapes as a film. The point of the show is to reveal how LLMs behave when they want to win at all costs: what they say out loud vs. what they privately think.

Read first, in this order: `README.md`, `docs/FINDINGS.md` (what 112 real games showed), `docs/RUN-LOG.md` (spend), `AGENT-NOTES.md` (newest entries on top), `src/rules.js`, `src/game.js`, `src/stages/*.js`, `src/powers.js`, `src/llm/prompts.js`.

Key code facts:
- `src/rules.js`: all plain-language rules text plus tuning constants. It is the single source of what agents are told.
- `src/game.js`: game state, speech/whisper/forge delivery, eliminations, `emit()` for every event, per-agent views.
- `src/engine.js`: runs the stage sequence. `src/stages/` has one file per obstacle (`bridge.js`, `crusher.js`, `pit.js`, `disc.js`, `ledge.js`, `chalk.js`), 45–173 lines each.
- `src/llm/`: prompts, gateway client, spend ledger (`.ledger/`, gitignored, capped), quality gate that discards degenerate games.
- `bin/play.js` runs free scripted-bot games, `bin/run-llm.js` one real game, `bin/batch.js` many games under a spend cap, `bin/stats.js` per-model stats, `bin/validate-tapes.js` tape validation.
- Tests: `npm test` (node --test). `npm run check` = tests + tape validation. Currently 433 tests and 113 tapes pass. Keep that green.

## Current state of the repo (important)

- You are on branch `codex/pit-film-proof`, which is **9 commits ahead of `main` and not pushed**. It holds all the Episode 01 film work. `origin/main` = local `main`.
- `docs/show/recordings/` (7.3 GB of renders), `web/show/assets/cast/` and `web/show/assets/episode/` (purchased Synty models) are gitignored and local only. Never commit them, never publish them.
- Create a new branch for v5 from `codex/pit-film-proof`, e.g. `v5-rules`. **Ask Paul before pushing anything** (a push to `main` redeploys the public site).
- The 112 existing tapes (rules v1–v4) and Episode 01 (built from tape `20261009-0025`, rules v4) must keep working. Never edit or delete existing tapes. Stats already compare only tapes with the same `rulesVersion`.

## Why v5

Paul's verdict after watching Episode 01:
- **The Pit is the best scene** (a player pleads for the rope; the others say aloud or think why they won't help, then walk away one by one while she drowns). It works because it has: one visible victim with time running out, a public choice by a named person, a gap between spoken words and private thoughts, and a slow visible consequence. Every v5 game must pass that test.
- **Trapdoor Disc is out:** a private pick then fate. No decisions, lies, alliances or betrayal.
- **Final Ledge is out:** shove/brace/dodge against an invisible footing number. Audiences can't follow it and it is hard to animate well. FINDINGS also shows about a third of finals were still coin flips.
- **Glass Bridge is reworked:** keep the set, remove the luck.
- **Powers are removed entirely** (Glass Eye, Wedge, Map, Feather, Swap, Anchor, Forger, Nothing). They need narration to explain, and the information powers barely mattered (Glass Eye won 3 of 56). Each new game carries its own built-in secret instead.
- **The chalk wall is cut:** it only makes sense across games, and an episode is one game.
- **All numeric HUDs are cut** (footing, scores, power panels). Every stake must be visible as a body, a band, a seat or a door.

## The approved v5 lineup (emotional arc: trust → sacrifice → abandonment → betrayal → reckoning)

1. **The Guided Bridge** (8 players). Rework of `bridge.js`.
   - Before crossing, players campaign and then vote publicly for a **Guide** (tie: re-vote among tied, then seeded RNG). The Guide stands on the far platform, is safe from the bridge, and privately sees every safe pane.
   - Line-order waiting room stays (wall pushes the line forward, volunteer/swap). The front walker crosses row by row as today.
   - Every row, the Guide must publicly call `L` or `R` (a spoken action, with private reasoning). The walker then steps. Anyone may also shout a counter-call. A broken pane is revealed to all, and the next walker takes the safe pane automatically, as today.
   - The Guide may lie to send a rival through the glass. That is the scene.
   - Tuning target: median 1–3 bridge deaths across a batch. If truthful Guides make the bridge bloodless, tuning knobs to measure (in this order): the Guide sees only N of 8 rows; the Guide must call within a time/round limit; the Guide's own seat for later stages depends on how many crossed. Report what you measured, don't guess.
2. **The Crusher Room** (~6 players). Keep `crusher.js`; remove the Wedge jam (it was a power). It becomes purely who holds the lever and who gets pushed onto it. Keep the dive-survival chance unless the batch shows a problem.
3. **The Pit** (~5 players). Keep `pit.js` (human step, one rope, rising water, keep at least three alive). Two forced changes:
   - The rope's old cost was footing on the Ledge, which no longer exists. **New cost:** the thrower must anchor the rope from the pit floor and climbs out last, so a slow rescue can drown the rescuer too. A physical, visible cost.
   - Remove the Feather save (it was a power).
4. **The Trapdoor Vote** (replaces `disc.js`; same trapdoor set so the film can reuse it). Everyone stands on a trapdoor. Two campaign rounds (public talk, whispers, pact offers), then a **secret vote** with a mandatory one-sentence private reason. Votes are revealed one at a time in seeded order, each with the voter's reason. Most votes drops. Tie: re-vote among tied by the non-tied; still tied → seeded RNG. Repeat one vote per player above three (5 players = two sequential votes).
5. **The Jury of the Fallen** (replaces `ledge.js`; final three).
   - Every eliminated player is a juror. Before deliberating, each juror receives a deterministic **jury dossier** built by the engine from the tape: every public event, plus every private thought and whisper that concerns that juror or a finalist (the "the dead see everything" reveal). Cap its length (summarise or truncate oldest public chatter first) so it fits budget-model contexts; document the cap.
   - Each finalist gives an opening plea. Each juror may ask one question to one finalist, who answers. Each finalist gives a closing line.
   - Each juror privately ranks the three finalists with a one-sentence reason. Score with a Borda count (3/2/1). Ties: most first-place votes, then seeded RNG. Places 1–3 come from that.
   - **Tell every agent from the very first prompt that a jury of the eliminated will decide the final ranking.** This is the core incentive: ruthless play now has a cost later. It is the central experiment of v5.

## New systems that make the drama readable

1. **Jury box.** Eliminated players are not removed from the game state. They become spectators in a gallery and receive public events live (they can't act until the jury stage). The engine records it so the film can cut to them.
2. **Pacts (wristbands).** At game start and between every stage, any two living players may publicly agree a pact (offer + accept, both public). Engine events: `pact_formed`, `pact_broken`. A pact breaks when the engine detects betrayal against the partner: voting against them, `push_lever` targeting them, a false Guide call while they're the walker, pushing them down as the pit step (keep the list explicit and tested; refusing to throw the rope is cold but not a break). Also allow an explicit public `break_pact`. Broken pacts are announced publicly and appear in the jury dossier.
3. **Life debts.** When one player's action directly saves another, the engine emits a public `life_debt` event ("Ana owes Gus her life"): lever holder → everyone who escaped; rope thrower → the rescued; human step → each player who climbed on them. Shown to everyone and in the jury dossier. The trapdoor vote then asks whether you'll vote out the person who saved you.
4. **Last words.** On every elimination, one model call: a final line to camera, ≤ 20 words. Event `last_words`.
5. **Why I'm here.** In the opening, each contestant states in one sentence (≤ 25 words) what the prize means to them. The model invents it. Event `intro_motive`.
6. **Film-friendly lines.** Cap public lines at ~25 words and whispers at ~15 (truncate or re-ask, matching how the code already handles bad replies). Keep the "rivals, not friends" instruction from v3/v4.

Deferred (do **not** build now): "the host's offer" (secret immunity deal before the vote). It's an episode-2 twist.

## Rules for how you work

- **Spec first.** Write `docs/superpowers/specs/2026-10-12-last-three-v5-design.md` covering everything above: exact actions per stage, event types and fields, tie-breaks, constants, the pact-break list, life-debt triggers, dossier construction and cap, prompt changes, what's removed. Show Paul the spec summary before writing engine code if anything above is ambiguous. Otherwise proceed.
- **Versioning.** New tapes carry `rulesVersion: 5`. Old stages may stay in the repo for reference, but the v5 game flow must not call them, and v5 prompts must never mention powers or chalk. Update `bin/validate-tapes.js` and `src/stats.js` to accept v5 events. All 112 existing tapes must still validate.
- **Determinism.** Everything hidden derives from the seed. Same seed + same replies = identical tape. Add determinism tests for the new stages.
- **TDD.** Add tests per stage like the existing `test/engine/*.test.js` (tie-breaks, pact breaks, life debts, dossier cap, jury scoring, the "keep at least three alive" floor). Update scripted bots in `src/scripted.js` so `node bin/play.js --seed N` plays a full v5 game for free. Run fuzz tests.
- **Gate:** `npm run check` green before any paid run.
- **Spending.**
  1. First run ~20 free scripted games across seeds and confirm every stage completes and the floor holds.
  2. Then run 12 games on the **budget roster** with a hard cap of $2 (`bin/batch.js` has spend caps; the ledger is `.ledger/spend.json`).
  3. Last recorded state: the gateway returned HTTP 402 (out of credits) at ~$15.09 of a $30 budget. Credits may have been topped up since; check with one cheap call first. If it's still 402, stop and tell Paul. Only he can top up, in the Vercel dashboard.
  4. Gateway auth: `vercel env pull .env.local` (OIDC token) or `AI_GATEWAY_API_KEY`. Never print or commit secrets.
  5. Log every paid run in `docs/RUN-LOG.md`.
- **Do not touch** `web/show/` film code, Episode 01 media, existing tapes, or the gitignored asset folders. The film adaptation is a later phase.

## What "done" looks like for this phase

1. The v5 spec doc is committed on `v5-rules`.
2. Engine, prompts, stats and validation are implemented; tests are green; scripted v5 games play end to end.
3. 12 budget-roster v5 tapes are in `web/tapes/`, and a new "Rules v5" section in `docs/FINDINGS.md` reports, with tape links (`?tape=<id>&i=<event>`):
   - bridge deaths per game, and how often the Guide lied (a call contradicting the known safe pane);
   - pacts formed vs. broken, and who broke them;
   - how often someone voted out a player they owed a life debt to;
   - rope throws vs. refusals; how many rescuers drowned anchoring;
   - whether jurors cited specific earlier betrayals, and whether the most ruthless finalist won or lost the jury;
   - whether knowing about the jury up front changed Pit behavior vs. v4 (pushes vs. volunteers, rope use);
   - the 5–10 most dramatic moments, ranked, with event links. These seed the next episode.
4. Append an entry to the top of `AGENT-NOTES.md` (format: `## YYYY-MM-DD · <your agent name>` with **Did / Why / Next / Watch out** bullets), and commit it with the work.
5. Report to Paul: a headline verdict first, then a short scannable summary. Paul has aphantasia, so where structure matters (stage flow, who-betrayed-whom), give a table or diagram rather than a paragraph describing it. Don't use em dashes in prose written for Paul.

## After this phase (not now)

Animate v5 for Episode 02: reuse the trapdoor set for the vote, build the jury gallery set, wristband props for pacts (snapping on betrayal), and a last-words shot per elimination. Plan that only after Paul has reviewed the v5 findings.
