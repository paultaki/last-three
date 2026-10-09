# Second audience pass review

Series: 436fd89d-0f0d-43a5-8017-b7eb7a525b0a
Review: a3314fab-cf79-42bb-bb88-b13a27a06db7

## Verbatim output and anomalies

```text
VERDICT: FINDINGS:4

1. **Medium — web/show/src/scene.js:~718** (`label: podium.some(...) ? \`${["","1ST","2ND","3RD"][a.place]} · ${a.name}\` : a.name`)
   Failure: the podium ordinal is read from `a.place` on the *view actor*, not from the `finalists()` entry (built from `game_end.places`) that was just used to decide membership. If view actors do not carry a `place` field (nothing in this diff adds one; `finalists` is the only source), the label renders as `"undefined · Ash"`. Even if actors do carry a player-state `place`, this contradicts the invariant that finalists/placings are authoritative from `game_end.places` only. Fix: `podium.find(p => p.name === a.name).place`.

2. **Low — web/show/src/film.js:~215** (`podium.length ? \`${podium[0].name} wins.\` : ""`)
   Failure: `finalists()` filters to places 1–3 that exist in `s.players` and sorts ascending; `podium[0]` is then assumed to be place 1. If the place-1 entry is absent/filtered (name not in `s.players`, or a tape where `places` only has 2/3), the finale card names the runner-up as winner. Should assert `podium[0].place === 1`.

3. **Low — web/show/src/app.js:~497** (`context: contextBeat(state, cut)` inside `render_game_to_text`)
   Failure: `render_game_to_text` is installed before `await load(...)` completes and is written null-tolerant elsewhere (`state?.stage`, `arena.view?.actors`), but `contextBeat` dereferences `s.ev` unguarded, so a harness call while `state` is still undefined throws `TypeError` instead of returning the diagnostic JSON. Previously this function could not throw in that window.

4. **Low — web/show/src/scene.js:~488** (`c.puppet.position.y += a.active && s.ev?.type === "ability_use" ? powerLift(...) : 0.55`)
   Failure: a contestant already in `discSaves` (saved earlier in disc) who is the active actor of a later disc `ability_use` that is *not* feather gets `powerLift` → `0` for that step, so they visibly drop from the 0.55 hover to the floor and pop back up on the next event. This violates "lifting persists after a recorded save until scene ends." Condition should also require `s.ev.power === "feather"` before deferring to `powerLift`.

--- anomalies ---
none
```

## Adjudication

1. Discarded: model.js presentation already supplies a.place, and the game_end reducer populates it from authoritative event placements. All three names and ordinals were rendered and browser-asserted. Recorded this existing invariant in REPLAY-INVARIANTS.md.
2. Accepted, low: the winner card visibility and text now require the first sorted placement to be exactly 1. Added a browser regression with only runner-up placements.
3. Accepted, low: contextBeat returns null before dereferencing an absent state. Added undefined/null diagnostics regressions.
4. Accepted, low: defer to powerLift only for the actual feather ability event, preserving the held lift for later abilities.

The initial optional ev read still fell through to s.stage because isStepWorthy accepts unknown event types by default. The new null/undefined regression caught that incomplete guard. The corrected early state guard is followed by the full gate and a fresh scoped review. The reviewed recording is unchanged for all events in the selected tape: a valid winner exists, state is loaded before capture, and Fenn has no subsequent non-feather disc ability. Export QA still checks actual encoded frames.

## Round 2

Review: 2ed73395-fb7b-45b6-b87d-8f398af64f90

```text
VERDICT: CLEAN

Reviewed the three-hunk corrective delta in checkpoint 24c034f against the stated invariants.

- `web/show/src/film.js:204-207` — winner card now keys both `hidden` and text on `podium[0]?.place === 1`. Optional chaining makes the empty-podium case (`undefined !== 1`) correctly hide the card with empty text; pre-`game_end` states (where `finalists` returns nothing) cannot leak a winner. Round-2 note confirms `place` is populated by model.presentation / reducer from `game_end.places`, and the three-width name/ordinal assertions pass, so the strict numeric comparison is exercised.
- `web/show/src/performance.js:45` — `if (!s) return null;` precedes the only dereference (`s.ev`). Harmless for `FilmOverlay.setState` (which already dereferences `state.stage` unconditionally) and protects the `Arena` render-path caller. No privacy change: `isStepWorthy` still gates every branch.
- `web/show/src/scene.js:488-491` — persistent disc hover now only runs `powerLift` when the active event is an actual `feather` `ability_use`; any other `ability_use` by a previously-saved contestant holds the `.55` offset instead of re-triggering the lift animation. `s.ev?.type` short-circuits before `s.ev.power`, so no null dereference. Seek-determinism and the "arena resets puppet transforms before authored offsets" invariant are unaffected since the branch still adds to `position.y` after the reset.

No correctness, security, data-loss, concurrency, or contract regressions found in the delta.

--- anomalies ---
none
```

Adjudication: clean corrective delta, zero discarded. Series closed with three low findings fixed in24c034f and one unsupported actor-field assumption discarded with an invariant.

## Reviewer reliability snapshot

Seven days, all projects:
```json
{
  "reviewer": "claude-fable-5",
  "window_days": 7,
  "rows": 405,
  "dispatches": 383,
  "closed_reviews": 297,
  "found_reviews": 176,
  "clean_reviews": 121,
  "verbatim_fix_rows_excluded": 0,
  "stopped_reviews_excluded": 83,
  "preflight_rejected": 22,
  "pending": 3,
  "stale_pending": 3,
  "real_bugs": 374,
  "catch_rate": 0.5926,
  "bugs_per_closed_review": 1.2593,
  "discarded_rows": 297,
  "discarded_findings": 104,
  "precision": 0.7824,
  "precision_status": "ready",
  "operations": {
    "finished_dispatches": 380,
    "finished_attempts": 402,
    "end_to_end_verdict_rate": 0.7388,
    "verdict_rate": 0.7816,
    "actionable_finding_dispatch_rate": 0.4632,
    "stopped_rate": 0.2184,
    "timeout_reviews": 74,
    "timeout_rate": 0.1947,
    "loop_reviews": 0,
    "failure_counts": {
      "courier_error": 3,
      "nonzero_exit": 6,
      "timeout": 74
    },
    "preflight_failure_counts": {
      "brief_validation": 8,
      "packet_too_large": 14
    },
    "timed_rows": 379,
    "duration_ms_median": 93232,
    "duration_ms_p95": 180333
  },
  "series": {
    "coverage_rows": 383,
    "coverage_rate": 1.0,
    "series_count": 247,
    "retry_dispatches": 136,
    "series_with_retry": 103,
    "double_timeout_series": 0
  },
  "execution_modes": {
    "pipelined": 49,
    "serial": 334
  }
}
```

Lifetime, all projects:
```json
{
  "reviewer": "claude-fable-5",
  "window_days": null,
  "rows": 1180,
  "dispatches": 1015,
  "closed_reviews": 771,
  "found_reviews": 469,
  "clean_reviews": 302,
  "verbatim_fix_rows_excluded": 0,
  "stopped_reviews_excluded": 233,
  "preflight_rejected": 165,
  "pending": 11,
  "stale_pending": 11,
  "real_bugs": 1023,
  "catch_rate": 0.6083,
  "bugs_per_closed_review": 1.3268,
  "discarded_rows": 771,
  "discarded_findings": 327,
  "precision": 0.7578,
  "precision_status": "ready",
  "operations": {
    "finished_dispatches": 1004,
    "finished_attempts": 1169,
    "end_to_end_verdict_rate": 0.6595,
    "verdict_rate": 0.7679,
    "actionable_finding_dispatch_rate": 0.4671,
    "stopped_rate": 0.2321,
    "timeout_reviews": 150,
    "timeout_rate": 0.1494,
    "loop_reviews": 0,
    "failure_counts": {
      "authentication": 1,
      "courier_error": 8,
      "incomplete_packet": 1,
      "interrupted": 1,
      "nonzero_exit": 55,
      "other": 5,
      "packet_too_large": 12,
      "timeout": 150
    },
    "preflight_failure_counts": {
      "brief_validation": 121,
      "packet_too_large": 44
    },
    "timed_rows": 984,
    "duration_ms_median": 87004,
    "duration_ms_p95": 180345
  },
  "series": {
    "coverage_rows": 1015,
    "coverage_rate": 1.0,
    "series_count": 640,
    "retry_dispatches": 375,
    "series_with_retry": 272,
    "double_timeout_series": 0
  },
  "execution_modes": {
    "pipelined": 146,
    "serial": 869
  }
}
```
