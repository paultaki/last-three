# Film presentation review

The video-first change used a new review series for the new user request. The implementation passed the repository gate and rendered browser checks before dispatch.

- Series: 059aceb9-1f95-4926-b50a-e5ea53d476d9
- Review: b05e3554-4121-42c9-8969-a4eeb420b6f5
- Reviewer: Claude Fable, fixed safe/no-tools courier, serial, 180 seconds.
- Scope: film.js, app.js, scene.js, model.js.
- Result: stopped. No verdict. No retry or fallback.

Verbatim courier output:

```text
--- anomalies ---
- Claude review timed out after the bounded 180-second budget; no verdict was produced
--- ledger ---
auto-closed as stopped (timeout)
```

Primary evidence: 395 tests and 113 validated tapes; film checks cover 44 selected beats, speech bounds, privacy, pagination, pause, end/restart, clean-frame controls, and identical settled film pixels after reverse seek. Studio checks pass at 390/768/1440, allowing at most 0.01% pixels with <=32/channel difference for Chrome label-edge antialiasing (observed 17 pixels, maximum 25). This is not independent review approval.

After the stopped review, export inspection prompted a small chalk-board text spacing correction and a local recorder window-bounds correction. Verification was rerun; the review series remains stopped.

## Reviewer lane reliability at delivery

These are lane-wide metrics, not findings against this project.

### Seven days

```json
{
  "reviewer": "claude-fable-5",
  "window_days": 7,
  "rows": 400,
  "dispatches": 378,
  "closed_reviews": 293,
  "found_reviews": 172,
  "clean_reviews": 121,
  "verbatim_fix_rows_excluded": 0,
  "stopped_reviews_excluded": 82,
  "preflight_rejected": 22,
  "pending": 3,
  "stale_pending": 3,
  "real_bugs": 360,
  "catch_rate": 0.587,
  "bugs_per_closed_review": 1.2287,
  "discarded_rows": 293,
  "discarded_findings": 93,
  "precision": 0.7947,
  "precision_status": "ready",
  "operations": {
    "finished_dispatches": 375,
    "finished_attempts": 397,
    "end_to_end_verdict_rate": 0.738,
    "verdict_rate": 0.7813,
    "actionable_finding_dispatch_rate": 0.4587,
    "stopped_rate": 0.2187,
    "timeout_reviews": 73,
    "timeout_rate": 0.1947,
    "loop_reviews": 0,
    "failure_counts": {
      "courier_error": 3,
      "nonzero_exit": 6,
      "timeout": 73
    },
    "preflight_failure_counts": {
      "brief_validation": 8,
      "packet_too_large": 14
    },
    "timed_rows": 374,
    "duration_ms_median": 91164,
    "duration_ms_p95": 180333
  },
  "series": {
    "coverage_rows": 378,
    "coverage_rate": 1.0,
    "series_count": 246,
    "retry_dispatches": 132,
    "series_with_retry": 101,
    "double_timeout_series": 0
  },
  "execution_modes": {
    "pipelined": 47,
    "serial": 331
  }
}
```

### Lifetime

```json
{
  "reviewer": "claude-fable-5",
  "window_days": null,
  "rows": 1167,
  "dispatches": 1002,
  "closed_reviews": 759,
  "found_reviews": 460,
  "clean_reviews": 299,
  "verbatim_fix_rows_excluded": 0,
  "stopped_reviews_excluded": 232,
  "preflight_rejected": 165,
  "pending": 11,
  "stale_pending": 11,
  "real_bugs": 1000,
  "catch_rate": 0.6061,
  "bugs_per_closed_review": 1.3175,
  "discarded_rows": 759,
  "discarded_findings": 314,
  "precision": 0.761,
  "precision_status": "ready",
  "operations": {
    "finished_dispatches": 991,
    "finished_attempts": 1156,
    "end_to_end_verdict_rate": 0.6566,
    "verdict_rate": 0.7659,
    "actionable_finding_dispatch_rate": 0.4642,
    "stopped_rate": 0.2341,
    "timeout_reviews": 149,
    "timeout_rate": 0.1504,
    "loop_reviews": 0,
    "failure_counts": {
      "authentication": 1,
      "courier_error": 8,
      "incomplete_packet": 1,
      "interrupted": 1,
      "nonzero_exit": 55,
      "other": 5,
      "packet_too_large": 12,
      "timeout": 149
    },
    "preflight_failure_counts": {
      "brief_validation": 121,
      "packet_too_large": 44
    },
    "timed_rows": 971,
    "duration_ms_median": 85967,
    "duration_ms_p95": 180346
  },
  "series": {
    "coverage_rows": 1002,
    "coverage_rate": 1.0,
    "series_count": 634,
    "retry_dispatches": 368,
    "series_with_retry": 267,
    "double_timeout_series": 0
  },
  "execution_modes": {
    "pipelined": 144,
    "serial": 858
  }
}
```
