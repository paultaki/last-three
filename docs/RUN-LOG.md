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
| 2026-10-09 | Heavyweight roster, rules v4 (Grok seat now 4.20 Reasoning; 4.1 Fast was HTTP 503 at the gateway) | 3 | 2.6 | web/tapes 0028-0030, rules 4; about $0.78 a game |
| 2026-10-09 | Frontier roster, rules v4 (new `--tier frontier`) | 3 kept (+3 discarded) | 8.5 | web/tapes 0031-0033, about $1.28 a game kept. Discards: one Opus 5.5 game refused by Anthropic's content filter (12/29 calls), one game killed mid-run, two cut by a per-game cap bug (fixed: cap keyed by attempt) |

Session ledger 2026-10-09 (cloud session, fresh `.ledger/`): **$11.11**, of which about $4.60 was probes, discards and the bug. Gateway `total_used` after this session: **$26.49** (balance $39.64 after Paul's top-up).
