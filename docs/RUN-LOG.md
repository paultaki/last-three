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


## 2026-10-12 PDT: twenty more unchanged-prompt v5 scenarios

Paul requested another batch. Seeds 521-540, mixed roster unchanged, prompt revision 8890794, concurrency 3, per-game cap $0.60, lifetime cap $21.30. Twenty completed, zero failed/discarded, zero roster substitutions. Identifiers use the UTC date 20261013. The pre-run gate passed 476 tests/133 tapes; the final gate passed 476 tests/153 tapes. No code, prompt, rule, original tape or film asset changed.

| Local date | Tape | Seed | Calls | Cost (USD) | Winner: seat / model |
|---|---|---:|---:|---:|---|
| 2026-10-12 | 20261013-0001 | 521 | 254 | 0.157269 | Hana / Qwen 3.8 Flash |
| 2026-10-12 | 20261013-0002 | 522 | 254 | 0.135981 | Fenn / GLM 5.3 Flash |
| 2026-10-12 | 20261013-0003 | 523 | 227 | 0.135542 | Bex / DeepSeek V4 Flash |
| 2026-10-12 | 20261013-0004 | 524 | 204 | 0.114521 | Bex / Kimi K2.6 |
| 2026-10-12 | 20261013-0005 | 525 | 251 | 0.150895 | Fenn / Haiku 5.5 |
| 2026-10-12 | 20261013-0006 | 526 | 251 | 0.148495 | Ash / Haiku 5.5 |
| 2026-10-12 | 20261013-0007 | 527 | 211 | 0.118901 | Eli / Qwen 3.8 Flash |
| 2026-10-12 | 20261013-0008 | 528 | 293 | 0.169873 | Hana / DeepSeek V4 Flash |
| 2026-10-12 | 20261013-0009 | 529 | 196 | 0.112383 | Eli / Kimi K2.6 |
| 2026-10-12 | 20261013-0010 | 530 | 246 | 0.122903 | Fenn / Qwen 3.8 Flash |
| 2026-10-12 | 20261013-0011 | 531 | 273 | 0.155563 | Hana / DeepSeek V4 Flash |
| 2026-10-12 | 20261013-0012 | 532 | 245 | 0.139814 | Dara / Kimi K2.6 |
| 2026-10-12 | 20261013-0013 | 533 | 298 | 0.172001 | Hana / GLM 5.3 Flash |
| 2026-10-12 | 20261013-0014 | 534 | 198 | 0.108835 | Eli / GLM 5.3 Flash |
| 2026-10-12 | 20261013-0015 | 535 | 208 | 0.111750 | Eli / DeepSeek V4 Flash |
| 2026-10-12 | 20261013-0016 | 536 | 324 | 0.192088 | Hana / Kimi K2.6 |
| 2026-10-12 | 20261013-0017 | 537 | 302 | 0.170486 | Gus / Kimi K2.6 |
| 2026-10-12 | 20261013-0018 | 538 | 203 | 0.111833 | Gus / GLM 5.3 Flash |
| 2026-10-12 | 20261013-0019 | 539 | 204 | 0.110290 | Bex / DeepSeek V4 Flash |
| 2026-10-12 | 20261013-0020 | 540 | 251 | 0.153341 | Gus / GLM 5.3 Flash |

Twenty tape-attributed games: **$2.792764**, 4,893 calls. Ledger delta including eight probes and rounding: **$2.79303536**, 4,901 calls. Difference from rounded tape usage: $0.00027136. Lifetime ledger: **$20.53098254**. Headroom to the chosen $21.30 cap: $0.76901746; headroom to the original $5 additional allowance: $0.79442677. Combined ten-plus-twenty new-game ledger spend: **$4.20557323**. No auth refresh, extra batch, new review dispatch, push, merge or animation was performed in this batch.

## 2026-10-12 PDT: GPT Luna compatibility checks and mixed-roster change

Paul requested replacing a less recognizable contestant with GPT Luna. Replaced gpt-oss-120b in future `mixed` games with `openai/gpt-5.6-luna`; the other seven models are unchanged. The live gateway catalog supports reasoning off and low effort. These checks used the existing adapter's `reasoning: {enabled: false}`, the existing 800-token limit, actual stage prompts from a free scripted game, and a $21.00 lifetime ledger cap with a $0.04 check-bucket cap. No complete paid game or new tape was produced.

| Prompt | Legal reply | Input / output tokens | Reasoning tokens | Calls | Project ledger estimate (USD) |
|---|---|---:|---:|---:|---:|
| Bridge Guide call | call:L | 2,533 / 47 | 0 | 1 | 0.0005630 |
| Pit play | leave | 1,399 / 47 | 0 | 1 | 0.0003362 |
| Jury question | question:Cole, with a voiced question | 7,719 / 73 | 0 | 1 | 0.0016314 |

All three returned HTTP 200 and stop completion, with no retries or repairs. Ledger bucket `luna-compat-20261013`: **$0.0025306**, three calls. Lifetime project ledger: **$20.53351314**. Remaining original additional allowance by the project ledger: **$0.79189617**. Raw usage reports BYOK, zero gateway credit cost and **$0.0031127** total upstream inference cost, including cache creation pricing. The project ledger estimate is not an invoice or confirmed gateway credit debit. No credentials were printed or committed.

The updated roster assertion failed before the implementation change; `npm run check` then passed **476 tests and 153 tapes**. All forty existing v5 games preserve their original recorded cast. New seeds begin at 541. Reasoning low was not enabled or tested. No rule, prompt, existing tape, film asset, push or merge changed.


## 2026-10-12 PDT: ten GPT Luna mixed-roster v5 games

Paul explicitly requested ten games after the Luna replacement. The previous additional allowance had $0.79189617 left; this new request was run under a separate **$2.50 maximum ledger delta**, lifetime cap $23.03351314, per-game cap $0.60, concurrency 3. Seeds 541-550, roster commit `12bd594`, unchanged v5 engine and prompt revision `8890794`. All eight intended models passed probes; no reserve substitution was permitted. Ten completed, zero failed/discarded. UTC identifiers 20261013-0021 through 0030. No complete paid game was run in the preceding compatibility check.

| Local date | Tape | Seed | Calls | Tape ledger estimate (USD) | Winner: seat / model |
|---|---|---:|---:|---:|---|
| 2026-10-12 | 20261013-0021 | 541 | 190 | 0.107644 | Ash / GLM 5.3 Flash |
| 2026-10-12 | 20261013-0022 | 542 | 263 | 0.162617 | Cole / GLM 5.3 Flash |
| 2026-10-12 | 20261013-0023 | 543 | 267 | 0.161892 | Eli / Kimi K2.6 |
| 2026-10-12 | 20261013-0024 | 544 | 274 | 0.168846 | Bex / GPT-5.6 Luna |
| 2026-10-12 | 20261013-0025 | 545 | 284 | 0.145382 | Hana / Grok 4.1 fast |
| 2026-10-12 | 20261013-0026 | 546 | 248 | 0.135139 | Cole / GPT-5.6 Luna |
| 2026-10-12 | 20261013-0027 | 547 | 252 | 0.148737 | Hana / Kimi K2.6 |
| 2026-10-12 | 20261013-0028 | 548 | 270 | 0.171135 | Dara / Grok 4.1 fast |
| 2026-10-12 | 20261013-0029 | 549 | 327 | 0.195296 | Gus / Grok 4.1 fast |
| 2026-10-12 | 20261013-0030 | 550 | 191 | 0.105668 | Fenn / Haiku 5.5 |

Ten tapes: **$1.502356**, 2,566 calls. Ledger delta including eight probes and rounding: **$1.50262440**, 2,574 calls. Difference from rounded tape usage: $0.00026840. Lifetime ledger: **$22.03613754**; batch headroom to its selected cap: $0.99737560.

The fetch audit reports **$1.46462628 gateway cost** for the other models and **$0.15025375 upstream inference cost for Luna's BYOK calls**, total **$1.61488003** in reported costs. Luna has zero gateway credit cost and 299 BYOK requests. The project ledger uses catalog token prices and is an estimate, not an invoice or complete account-billing reconciliation. Both reported estimates remain below this batch's $2.50 ceiling. All 2,574 HTTP responses were 200; no auth refresh was observed. Luna had reasoning disabled in every request, zero reported reasoning tokens, zero missing reasoning fields and 299 stop completions.

Pre-batch gate: 476 tests / 153 tapes. Post-batch gate: **476 tests / 163 tapes**. Existing tape bytes and protected paths are unchanged; no rule or prompt changes, extra games, new review dispatch, push, merge or animation. Total v5 games: 50. New seeds begin at 551.


## 2026-10-12 games, documented 2026-10-13: twenty more of the same brand cast

Paul requested twenty games and one recognizable logo per maker. Same roster as seeds 541-550, roster commit `12bd594`, unchanged prompt revision `8890794` and rules v5. Seeds 551-570, concurrency 3, per-game cap $0.60, separate $4.50 maximum ledger delta, lifetime cap $26.53613754. All eight probes passed; substitutions were not permitted. Twenty completed, zero failed/discarded. Public labels use brands, while tapes retain exact model IDs.

| Local start date | Tape | Seed | Calls | Tape ledger estimate (USD) | Winner: seat / brand |
|---|---|---:|---:|---:|---|
| 2026-10-12 | 20261013-0031 | 551 | 193 | 0.113383 | Fenn / DeepSeek |
| 2026-10-12 | 20261013-0032 | 552 | 196 | 0.123189 | Bex / Qwen |
| 2026-10-12 | 20261013-0033 | 553 | 241 | 0.136666 | Ash / DeepSeek |
| 2026-10-12 | 20261013-0034 | 554 | 269 | 0.158216 | Dara / Grok |
| 2026-10-12 | 20261013-0035 | 555 | 337 | 0.209373 | Cole / GLM |
| 2026-10-12 | 20261013-0036 | 556 | 266 | 0.163647 | Fenn / Claude |
| 2026-10-12 | 20261013-0037 | 557 | 296 | 0.183305 | Bex / GLM |
| 2026-10-12 | 20261013-0038 | 558 | 284 | 0.173452 | Cole / GLM |
| 2026-10-12 | 20261013-0039 | 559 | 189 | 0.109323 | Hana / Grok |
| 2026-10-12 | 20261013-0040 | 560 | 203 | 0.125244 | Bex / Kimi |
| 2026-10-12 | 20261013-0041 | 561 | 264 | 0.157061 | Hana / DeepSeek |
| 2026-10-12 | 20261013-0042 | 562 | 277 | 0.164112 | Hana / GLM |
| 2026-10-12 | 20261013-0043 | 563 | 200 | 0.122107 | Cole / ChatGPT |
| 2026-10-12 | 20261013-0044 | 564 | 234 | 0.143820 | Dara / Kimi |
| 2026-10-12 | 20261013-0045 | 565 | 266 | 0.169136 | Hana / GLM |
| 2026-10-12 | 20261013-0046 | 566 | 257 | 0.153009 | Cole / DeepSeek |
| 2026-10-12 | 20261013-0047 | 567 | 197 | 0.110600 | Ash / DeepSeek |
| 2026-10-12 | 20261013-0048 | 568 | 205 | 0.123778 | Bex / Kimi |
| 2026-10-12 | 20261013-0049 | 569 | 230 | 0.142831 | Cole / ChatGPT |
| 2026-10-12 | 20261013-0050 | 570 | 297 | 0.179721 | Eli / Kimi |

Twenty tape-attributed games: **$2.961973**, 4,901 calls. Ledger delta including eight probes and rounding: **$2.96224191**, 4,909 calls. Difference from rounded tape totals: $0.00026891. Lifetime ledger **$24.99837945**; headroom to the selected cap: $1.53775809.

Fetch audit: **$2.85273486 reported gateway cost** plus **$0.30330660 upstream inference estimate for 606 ChatGPT BYOK requests**, combined **$3.15604146**. Metadata sums and the catalog-price ledger are estimates rather than an invoice. ChatGPT reported zero gateway credit cost, zero reasoning tokens, reasoning disabled and stop completion on all 606 requests; no missing reasoning fields. Every HTTP response was 200; no auth refresh observed. Seven GLM format failures after repair still consume tokens and are included in the totals.

Gate before: 476 tests / 163 tapes; gate after: **476 tests / 183 tapes**. All old tape bytes and source film/assets/data paths remain unchanged. No extra games, cast substitution, reasoning change, new rule or prompt, review dispatch, push, merge or animation. Total real v5 games **70**; next seed **571**. A separate eight-brand logo preview and verified SVG copies were created outside the protected film folders.
