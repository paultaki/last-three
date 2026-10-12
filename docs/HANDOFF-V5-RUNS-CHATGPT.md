# Handoff 2: Last Three v5 is built; analyze the first 10 games and find an Episode 02

Copy everything below the line into ChatGPT / Codex.

---

You are picking up **Last Three** at `/Users/paul/Development/last-three`, branch `v5-rules`. Read `docs/HANDOFF-V5-CHATGPT.md` first: it describes the project and the approved rules v5 redesign (Guided Bridge → Crusher → Pit → Trapdoor Vote → Jury of the Fallen, no powers, no chalk wall, plus pacts, life debts, jury box, last words, intro motives). Then read `docs/superpowers/specs/2026-10-12-last-three-v5-design.md` (the spec) and `docs/V5-IMPLEMENTATION-REPORT.md` (decisions Codex made).

## State right now

- **v5 is implemented** (by Codex) and is the default game flow. `npm run check` passes: 474 tests, all 113 historical tapes validate. Twenty free scripted games completed. 
- **All of that work is uncommitted** in the working tree on `v5-rules` (HEAD `556326e` holds only the first handoff doc). First action: review `git status`, then commit it on `v5-rules` with a clear message. **Do not push** and do not merge to `main` without Paul's yes (pushing `main` redeploys the public site).
- **10 real games have been played** with the `mixed` roster (Claude Haiku 5.5, gpt-oss-120b, Gemini 2.5 Flash-Lite, Grok 4.1 fast, DeepSeek V4 Flash, Qwen 3.8 Flash, Kimi K2.6, GLM 5.3 Flash): tapes `web/tapes/20261012-0001.json` … `20261012-0010.json`, seeds 501–510. Cost was about $0.11–0.16 per game, $1.23 total. Winners: Cole/Kimi, Ash, Gus, Gus, Dara, Fenn, Hana, Eli, Bex, Ash. Game 0001 had two bridge deaths. Nobody has analyzed them yet.
- **Spend:** the ledger (`.ledger/spend.json`) is at **$16.33 lifetime**. The gateway shows about **$37.5** of credits left. `--cap` is a cap on the **lifetime ledger total**, not per run, so to allow $X more set `--cap` to (current total + X). Paul approved running more games if needed to find a great one. Stay under about $5 more without asking him.
- Gateway auth: `.env.local` holds a short-lived Vercel OIDC token. If calls return 401, run `vercel env pull .env.local --yes`. Never print or commit secrets.

## Commands

```bash
npm run check                                                        # gate
node bin/run-llm.js --seed 511 --tier mixed --cap 18                 # one real game (~5 min)
node bin/batch.js --games 10 --start-seed 511 --tier mixed --cap 18.5 --concurrency 3
node bin/stats.js                                                    # per-model stats
```

Use new seeds (511 and up). Never edit or delete existing tapes.

## Your task

1. **Commit** the v5 work (see above). Run `npm run check` first.
2. **Analyze the 10 tapes** (write helper scripts under a temp dir, not in the repo). Produce:
   - **A. Per-game table:** winner (seat + model), eliminations by stage, Guide (seat + model) and number of false calls, pacts formed/broken, life debts, rope throws vs refusals and drowned anchors, and whether the most ruthless finalist won or lost the jury.
   - **B. Aggregates, one line each:** median bridge deaths; how often Guides lied; pacts formed vs broken and by which models; votes cast against someone in a life debt with the voter; rope throws vs refusals; whether jurors cited specific earlier betrayals in their reasons (count + example); the most ruthless model and how the jury treated it.
   - **C. Top 8 dramatic moments,** ranked. Give the link `?tape=<id>&i=<event index>`, who (seat + model), one line on what happened, and short verbatim quotes. Prioritize public "say" vs private "thought" contradictions, pleas that get ignored, betrayals of pact partners, voting out a savior, and jurors punishing the ruthless.
   - **D. The top 3 games to animate as Episode 02,** each with a 3–5 line arc (opening → betrayal → abandonment → vote → jury verdict), and why it wins.
   - **E. Bugs/anomalies:** stages that never kill, empty or default juror reasons, models failing to reply, truncated lines, events that look wrong.
3. **If no game is a standout** (e.g. Guides never lie, no pleas, the jury never cites betrayals), say exactly what's missing. Propose at most two small rule/prompt tweaks, implement them test-first with `npm run check` green, then run 10–20 more games with new seeds and repeat the analysis. Report what changed and why. Stay within the spend limit above.
4. **Write it up:** add a "Rules v5" section to `docs/FINDINGS.md` (A–E condensed, with tape links), add the paid runs to `docs/RUN-LOG.md`, and add an entry at the top of `AGENT-NOTES.md` (`## YYYY-MM-DD · <agent>` with **Did / Why / Next / Watch out**). Commit on `v5-rules`. Don't push.
5. **Report to Paul:** lead with a one-line verdict ("Game X is the episode" or "no standout yet, here's why"), then the top 3 games and top moments as tables. Paul has aphantasia, so use tables or diagrams, not paragraphs describing structure. Don't use em dashes.

## Don't touch

`web/show/`, `docs/show/`, Episode 01 media, `data/`, the gitignored asset folders (`web/show/assets/cast/`, `web/show/assets/episode/`, `docs/show/recordings/`), or any existing tape. Animation of Episode 02 is a later phase, after Paul picks the game.
