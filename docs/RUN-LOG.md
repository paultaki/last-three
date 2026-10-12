# Run log

Every real (spend-incurring) run is logged here with model roster, cost and notes.

| Date | What | Games | Cost (USD) | Notes |
|------|------|-------|-----------|-------|
| 2026-10-08 | First real game, 8 models (probe + one game, thrown away: model settings not yet fixed) | 1 + 1 stuck | 0.05 | Four models returned empty replies until hidden "thinking" was switched off |
| 2026-10-08 | Budget roster, rules v1 | 24 | 0.87 | web/tapes, rules 1 |
| 2026-10-08 | Budget roster, rules v2 | 24 | 0.84 | web/tapes, rules 2 |
| 2026-10-08 | Heavyweight roster, rules v2, first try | 8 | 2.4 | Discarded: a substitute model (gpt-5-nano) sat out almost every turn; quality gate added afterwards |
| 2026-10-08 | Heavyweight roster, rules v2 | 8 | 3.19 | web/tapes, rules 2 |

Ledger total at 2026-10-08 ~03:00 PDT: **$7.48** (cap used: $8.50; hard ceiling in code: $18). Ledger lives in `.ledger/spend.json` (not committed).
| 2026-10-08 | Budget roster, rules v3 (Pit + rivals prompt) | 24 | 1.13 | web/tapes, rules 3 |
| 2026-10-08 | Heavyweight roster, rules v3 | 5 kept (+1 discarded) | 2.92 | One game discarded by the quality gate (Grok 8/25 failed) |

Ledger total at 2026-10-08 ~16:30 PDT: **$11.53**. Spending stopped here; further runs need a decision.
| 2026-10-09 | Budget roster, rules v4 (chalk wall, rope cost 2) | 24 | ~1.4 | web/tapes, rules 4 |
| 2026-10-09 | Heavyweight roster, rules v4 | 3 kept (+5 discarded) | ~1.4 | Stopped by gateway HTTP 402: credits exhausted |

Ledger total at 2026-10-09 ~01:00 UTC: **$15.09**. The gateway then refused calls (credit balance). Budget available per Paul: $30; blocked on a credit top-up, not on code.


## 2026-10-12: rules v5 mixed roster, first ten games

These paid runs were completed before the Episode 02 analysis. Each game uses all eight models, shuffled across seats: Claude Haiku 5.5, gpt-oss-120b, Gemini 2.5 Flash-Lite, Grok 4.1 fast (non-reasoning), DeepSeek V4 Flash, Qwen 3.8 Flash, Kimi K2.6 and GLM 5.3 Flash. Per-game usage below is read directly from immutable tapes, not estimated from the handoff. Full gateway model IDs are in each tape.

| Date | Tape | Seed | Calls | Cost (USD) | Winner: seat / model |
|---|---|---:|---:|---:|---|
| 2026-10-12 | 20261012-0001 | 501 | 286 | 0.157787 | Cole / Kimi K2.6 |
| 2026-10-12 | 20261012-0002 | 502 | 196 | 0.105184 | Ash / Haiku 5.5 |
| 2026-10-12 | 20261012-0003 | 503 | 208 | 0.112017 | Gus / Qwen 3.8 Flash |
| 2026-10-12 | 20261012-0004 | 504 | 272 | 0.164424 | Gus / Grok 4.1 fast |
| 2026-10-12 | 20261012-0005 | 505 | 246 | 0.128238 | Dara / DeepSeek V4 Flash |
| 2026-10-12 | 20261012-0006 | 506 | 203 | 0.117119 | Fenn / Kimi K2.6 |
| 2026-10-12 | 20261012-0007 | 507 | 201 | 0.111157 | Hana / Kimi K2.6 |
| 2026-10-12 | 20261012-0008 | 508 | 195 | 0.104383 | Eli / Haiku 5.5 |
| 2026-10-12 | 20261012-0009 | 509 | 205 | 0.114105 | Bex / Haiku 5.5 |
| 2026-10-12 | 20261012-0010 | 510 | 236 | 0.118556 | Ash / Qwen 3.8 Flash |

Ten tape-attributed games: **$1.232970**, 2,248 recorded calls. Range: $0.104383-$0.164424 per game. Lifetime ledger read on 2026-10-12: **$16.32540931** (about $16.33). The gap from the prior rounded $15.09 baseline includes ledger activity not separately attributed here; do not silently assign it to these tapes. No extra paid games, auth refreshes or probes were made during analysis, so additional spend in this session is **$0**. The reported remaining gateway credit balance in the handoff was not checked live.


## 2026-10-12: ten more v5 drama scenarios after prompt clarification

Seeds 511-520, mixed roster unchanged, concurrency 3, per-game default cap $0.60, lifetime cap $18.50. Prompt revision `8890794` clarifies the current Bridge row and voiced, evidence-based jury responses. Ten played, zero failed/discarded, zero roster replacements. No original tape overwritten. Both new tests failed first; 476 tests and 123 existing tapes passed before paid dispatch, and 476 tests/133 tapes passed afterwards.

| Date | Tape | Seed | Calls | Cost (USD) | Winner: seat / model |
|---|---|---:|---:|---:|---|
| 2026-10-12 | 20261012-0011 | 511 | 202 | 0.114348 | Dara / Kimi K2.6 |
| 2026-10-12 | 20261012-0012 | 512 | 216 | 0.126906 | Hana / Kimi K2.6 |
| 2026-10-12 | 20261012-0013 | 513 | 311 | 0.178300 | Bex / Gemini Flash-Lite |
| 2026-10-12 | 20261012-0014 | 514 | 261 | 0.155263 | Eli / Haiku 5.5 |
| 2026-10-12 | 20261012-0015 | 515 | 266 | 0.154453 | Fenn / Haiku 5.5 |
| 2026-10-12 | 20261012-0016 | 516 | 206 | 0.116430 | Ash / Haiku 5.5 |
| 2026-10-12 | 20261012-0017 | 517 | 244 | 0.126127 | Fenn / GLM 5.3 Flash |
| 2026-10-12 | 20261012-0018 | 518 | 261 | 0.150443 | Cole / Kimi K2.6 |
| 2026-10-12 | 20261012-0019 | 519 | 310 | 0.171992 | Eli / DeepSeek V4 Flash |
| 2026-10-12 | 20261012-0020 | 520 | 211 | 0.117994 | Fenn / Kimi K2.6 |

Ten tape-attributed games: **$1.412256**, 2,488 calls. Ledger delta including probes and rounding: **$1.41253787**, 2,496 calls; the $0.00028187 difference from rounded tape usage is not assigned to an invented game. Lifetime ledger: **$17.73794718**. Budget headroom to the selected $18.50 cap: $0.762053. All game spending remains below Paul's existing $5 additional allowance. The separate Grok CLI review timed out before a verdict; any Grok CLI account usage is outside this gateway ledger and was not verified. No extra batch after seed 520, no push or animation.
