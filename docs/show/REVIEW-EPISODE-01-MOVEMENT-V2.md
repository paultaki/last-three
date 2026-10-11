# Episode 01 movement v2 review

Series: `33fc8526-7786-4d5a-aa2e-d2453d440a6b`. Review: `5e551731-629e-429b-b9d1-22d2f3a83eef`.

Claude Fable ran through the fixed safe, no-tools courier with the 180-second limit. The animation/detail packet covered episode.js, episode-life.js, episode-detail.js, retarget-episode-motion.mjs and episode-life.test.mjs after 429 tests, 113 tapes and the movement browser gate passed. The reviewer timed out without output or a verdict. The courier auto-closed the row as stopped (timeout). No retry or fallback was run.

The full diff exceeds the courier's 40KB limit, so disjoint animation and capture/export packets were planned in the same series. The first dispatch timeout terminated the series. The capture/export packet was not dispatched, and neither scope has an independent review verdict. This is not a CLEAN review. Primary capture/export verification continues independently.

## Courier output, verbatim

```text

--- anomalies ---
- Claude review timed out after the bounded 180-second budget; no verdict was produced
--- ledger ---
auto-closed as stopped (timeout)

```

## Reviewer reliability snapshot

Claude Fable global aggregate statistics, 2026-10-11. Rates are fractions. This series contributes one stopped timeout and no valid verdict.

| Metric | Last seven days | Lifetime |
| --- | --- | --- |
| Catch rate among valid verdicts | 0.6117 | 0.6104 |
| Actionable findings per finished dispatch | 0.4665 | 0.4668 |
| Bugs per closed review | 1.3114 | 1.3275 |
| Provisional precision | 0.7633 | 0.7535 |
| Dispatch verdict rate | 0.7626 | 0.7647 |
| End-to-end verdict rate | 0.7091 | 0.658 |
| Brief validation failures | 9 | 122 |
| Oversized packet failures | 18 | 49 |
| Timeout rate | 0.2011 | 0.1528 |
| Loop count | 0 | 0 |
| Stale pending rows | 3 | 11 |
| Retry dispatches | 130 | 392 |
| Double-timeout series | 0 | 0 |
