# Episode 01 v3 second-opinion review

The independent review produced no verdict. The primary checks remain the evidence for this local draft. No independent CLEAN claim is made.

Series: `be3d701f-da22-4fee-9e2a-08190a36dd5b`.
Preflight `49c162e2-5675-48e9-a2b7-2c6cfe68559c` rejected the packet above 40,000 bytes without dispatch. The one allowed narrowed preflight retry used a new id `42950945-3d35-4d8a-8c0d-bf000fe5b395`. That dispatch ended with nonzero exit because Claude's weekly limit was exhausted. The courier auto-closed the row as stopped. This ends the series: no further packet, retry, fallback or fresh series to evade the failure.

## Verbatim courier output

```text
You've hit your weekly limit · resets Oct 13 at 4am (America/Los_Angeles)

--- anomalies ---
- Claude reviewer exited nonzero (1); no valid verdict was produced
--- ledger ---
auto-closed as stopped (nonzero_exit)
```

## Current reviewer metrics

```json
{
  "reviewer": "claude-fable-5",
  "window_days": 7,
  "rows": 381,
  "dispatches": 353,
  "closed_reviews": 263,
  "found_reviews": 163,
  "clean_reviews": 100,
  "verbatim_fix_rows_excluded": 0,
  "stopped_reviews_excluded": 87,
  "preflight_rejected": 28,
  "pending": 3,
  "stale_pending": 3,
  "real_bugs": 347,
  "catch_rate": 0.6198,
  "bugs_per_closed_review": 1.3194,
  "discarded_rows": 263,
  "discarded_findings": 107,
  "precision": 0.7643,
  "precision_status": "ready",
  "operations": {
    "finished_dispatches": 350,
    "finished_attempts": 378,
    "end_to_end_verdict_rate": 0.6958,
    "verdict_rate": 0.7514,
    "actionable_finding_dispatch_rate": 0.4657,
    "stopped_rate": 0.2486,
    "timeout_reviews": 72,
    "timeout_rate": 0.2057,
    "loop_reviews": 0,
    "failure_counts": {
      "courier_error": 3,
      "nonzero_exit": 12,
      "timeout": 72
    },
    "preflight_failure_counts": {
      "brief_validation": 9,
      "packet_too_large": 19
    },
    "timed_rows": 349,
    "duration_ms_median": 100367,
    "duration_ms_p95": 180340
  },
  "series": {
    "coverage_rows": 353,
    "coverage_rate": 1.0,
    "series_count": 227,
    "retry_dispatches": 128,
    "series_with_retry": 94,
    "double_timeout_series": 0
  },
  "execution_modes": {
    "pipelined": 54,
    "serial": 299
  }
}
```
