# Audience direction review

Series: be08c383-e577-4c1e-a76e-368ef79a6469
Round 1: 9d3e6232-d094-49a6-a51a-2e386e044989

## Verbatim reviewer output and anomalies

```text
VERDICT: FINDINGS:5

1. **Medium — web/show/src/film.js, `render()` (`if (this.result) { this.beat.hidden = true; … }`)**
   On every death event the caption beat is force-hidden at ms=0 regardless of time, while `this.outcome.hidden = !this.result || ms < 2700`. Result: for the first 2700 ms of the 5400 ms death beat nothing is displayed, and the death caption (`caption?.text` written in `setState`) never appears at all. The invariant says the consequence *title* waits 2700 ms; the diff makes the beat hide immediately instead of being replaced at 2700 ms. Reverse seek into 0–2700 ms shows a blank frame.

2. **Medium — web/show/src/scene.js, shove position block (`Math.max(0, distance - 1.05) * (v.key === "ledge" ? contact.approach : …)` and the `-0.22 * (v.key === "ledge" ? contact.recoil : …)` branch)**
   These two substitutions are gated only on `v.key === "ledge"`, whereas the sibling flinch/shove-rotation edits below and the `pose()` strike edit are explicitly gated on `this.film &&`. Unless the enclosing (unshown) block is already film-gated, studio (`view=studio`, `film=false`) ledge shoves now use the authored contact curve instead of `sin(p·π)`, violating "Studio uses existing camera/motion." Add `this.film &&` to match the other branches.

3. **Low — web/show/src/direction.js, `directedList()` (`.filter((i) => tape.events[i])`)**
   Added indices bypass `isStepWorthy(tape.events[i], cut)`, which `editList` applies to everything else. Story `nextIndex` walks the playlist verbatim, so if any of 327/434/443/456/493/499/502/503/506/531 is a thought/whisper, non-Director playback stops on it for 2300 ms with bubble and beat both hidden (`hiddenPrivate`) — a blank frame. 269 is hand-gated, showing the list depends on manual knowledge rather than the existing filter; filter additions with `isStepWorthy` to make the gate structural.

4. **Low — web/show/src/film.js, `FilmOverlay` constructor / `render()` (`const evidence = this.directing.receipt`)**
   `this.directing` is only assigned in `setState`; the constructor does not initialize it. Previously `render` was safe before `setState` (`if (!this.d) return`). Now any `render` before the first `setState` (e.g. `window.__show.preview()` called before `load` resolves, or a load that fails before `seek`) throws `TypeError` on `undefined.receipt`. Initialize `this.directing = {}` in the constructor.

5. **Low — web/show/src/scene.js `render()` + web/show/src/direction.js `deathProgress()`**
   For film death views `p` changes from `ease(Math.min(1, t / 1.15))` to `smooth(seconds / 1.15)` for `flatten`. Duration matches, but the curve is now smoothstep; unless `ease` is already smoothstep (not visible in the packet), the victim's flatten no longer tracks the crusher ceiling mid-animation, contrary to "deathProgress keeps flatten timing identical to crusher ceiling." Use the same `ease` for the flatten branch.

--- anomalies ---
none

```

## Adjudication

1. Discarded: the intentionally uncaptioned fall is not a blank video frame. Geometry, motion and initial focal names remain visible. The delayed result avoids announcing the outcome before the fall and is covered by an explicit browser check.
2. Discarded: the enclosing block already requires this.film. Studio motion is unchanged.
3. Accepted, low: directedList now applies isStepWorthy to all entries, including additions. Added a modified-tape public-visibility regression.
4. Accepted, low: initialize directing in the FilmOverlay constructor. Browser test now calls render before setState on a fresh overlay.
5. Discarded: ease is already t*t*(3-2*t), identical to the new helper. Flatten and slab remain synchronized.

Missing context is documented in web/show/REPLAY-INVARIANTS.md. Codex additionally corrected the ledge recoil translation to move away from the attacker (local forward faces the attacker) and lowered the arms into a forward shove pose, then inspected a fresh rendered action frame. A second review follows the green gate and checkpoint.

## Round 2

Review: 00e1942a-990b-4220-a9a1-944d668f2cf4

```text
VERDICT: FINDINGS:3

1. **Low — web/show/src/film.js:~255 (`render`, focal-name clearance)**
   `el.hidden = !!this.d && n.x > 0.5 && n.y < 0.55;` only clears names when a dialogue bubble exists. For action states with a receipt (index 300, 514) the evidence card renders at top 15% in the right column (per the CSS invariant), but `this.d` is null so no clearance applies; a focal name projected at x>0.5, y 0.12–0.55 is drawn over the "EARLIER IN THE RECORDING" card. The inline comment claims names are kept "clear of dialogue/evidence cards", but the condition never consults `this.evidence.hidden`. Scenario: Hana/Dara anchors during 514 overlap the quote text at 1280/390 widths.

2. **Low — web/show/src/direction.js:~104 (`consequence`)**
   `e.place === 2 ? "SECOND" : "THIRD"` labels every truthy `place` other than 2 as THIRD. If the reducer records `place` for any elimination other than the last two (e.g. 4–8), the consequence title becomes "X TAKES THIRD" for an early death. Should gate on `e.place <= 3` (else fall through to "IS OUT").

3. **Low — web/show/src/direction.js:~61 (forged sender detection)**
   `if (cut && e.type === "whisper" && e.forgedAs && e.from)` requires `e.from`. The stated projection contract is "visibleActor returns forgedAs before name/from", i.e. whisper events may carry the real author under `name` rather than `from`. For such events the disclosure (`forged`, `listener`, 3800 ms hold, "THE NAME WAS A DISGUISE" card) silently never fires in Director cut, leaving the forged signature shown as if genuine. Use the same fallback as `visibleActor` (`e.from ?? e.name`).

--- anomalies ---
none
```

### Adjudication

1. Accepted, low: names now yield the right column whenever evidence is visible, including action callbacks. Added browser bounding-box assertions at all three widths.
2. Accepted, low: only numeric placements 2 and 3 receive podium wording; every other value uses IS OUT. Regression covers early places.
3. Discarded: valid whisper events require `from` (src/tape.js EVENT_SHAPES); name is the speaker field for other event types. The shared visibleActor fallback is not a whisper schema. This contract is now explicit in REPLAY-INVARIANTS.md.

## Round 3

Review: 521fff83-f567-4ca7-9b7f-db838a4d7d3b

```text
VERDICT: CLEAN

Reviewed both hunks in the HEAD checkpoint (no staged/unstaged delta).

**direction.js:112** — `consequence` now emits podium titles only for `e.place === 2 || e.place === 3`; any other truthy/undefined `place` falls through to `IS OUT`. This closes the prior bug where any non-2 truthy place rendered "TAKES THIRD". Strict equality is consistent with the stated numeric-place invariant; no tape/reducer mutation involved.

**film.js:277** — `el.hidden = n.x > 0.5 && ((!!this.d && n.y < 0.55) || !!showEvidence);`
- With no dialogue and no evidence, the expression reduces to `false` → original visibility preserved.
- With dialogue and no evidence, it reduces to the prior `n.x > 0.5 && n.y < 0.55` → bubble clearance unchanged.
- With evidence visible (dialogue card at top 57% or action card at top 15%), the whole right column is hidden, matching the stated intent that focal names yield to evidence. Left-column names are never affected.
- The earlier `el.hidden = !n; if (!n) return;` guard still runs first, so unused spans stay hidden and the override only applies to populated entries.

Non-blocking observations (not findings): `showEvidence` is referenced but its definition is outside the diff; the round-3 context asserts it is the existing evidence-visibility flag computed before the name loop, and the rendered privacy/bounds tests are stated green. No timing, seek-determinism, privacy-gate, or data-contract surface is touched by this delta.

--- anomalies ---
none
```

Adjudication: clean on the final corrective delta; no findings discarded. Across this series, four low findings were accepted and fixed, four assumptions rejected with written invariants, no pending findings.

## Reviewer reliability snapshot

Seven days (all projects, Claude Fable):
```json
{
  "reviewer": "claude-fable-5",
  "window_days": 7,
  "rows": 403,
  "dispatches": 381,
  "closed_reviews": 295,
  "found_reviews": 175,
  "clean_reviews": 120,
  "verbatim_fix_rows_excluded": 0,
  "stopped_reviews_excluded": 83,
  "preflight_rejected": 22,
  "pending": 3,
  "stale_pending": 3,
  "real_bugs": 371,
  "catch_rate": 0.5932,
  "bugs_per_closed_review": 1.2576,
  "discarded_rows": 295,
  "discarded_findings": 103,
  "precision": 0.7827,
  "precision_status": "ready",
  "operations": {
    "finished_dispatches": 378,
    "finished_attempts": 400,
    "end_to_end_verdict_rate": 0.7375,
    "verdict_rate": 0.7804,
    "actionable_finding_dispatch_rate": 0.463,
    "stopped_rate": 0.2196,
    "timeout_reviews": 74,
    "timeout_rate": 0.1958,
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
    "timed_rows": 377,
    "duration_ms_median": 93232,
    "duration_ms_p95": 180333
  },
  "series": {
    "coverage_rows": 381,
    "coverage_rate": 1.0,
    "series_count": 246,
    "retry_dispatches": 135,
    "series_with_retry": 102,
    "double_timeout_series": 0
  },
  "execution_modes": {
    "pipelined": 49,
    "serial": 332
  }
}
```

Lifetime (all projects, Claude Fable):
```json
{
  "reviewer": "claude-fable-5",
  "window_days": null,
  "rows": 1178,
  "dispatches": 1013,
  "closed_reviews": 769,
  "found_reviews": 468,
  "clean_reviews": 301,
  "verbatim_fix_rows_excluded": 0,
  "stopped_reviews_excluded": 233,
  "preflight_rejected": 165,
  "pending": 11,
  "stale_pending": 11,
  "real_bugs": 1020,
  "catch_rate": 0.6086,
  "bugs_per_closed_review": 1.3264,
  "discarded_rows": 769,
  "discarded_findings": 326,
  "precision": 0.7578,
  "precision_status": "ready",
  "operations": {
    "finished_dispatches": 1002,
    "finished_attempts": 1167,
    "end_to_end_verdict_rate": 0.659,
    "verdict_rate": 0.7675,
    "actionable_finding_dispatch_rate": 0.4671,
    "stopped_rate": 0.2325,
    "timeout_reviews": 150,
    "timeout_rate": 0.1497,
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
    "timed_rows": 982,
    "duration_ms_median": 86836,
    "duration_ms_p95": 180345
  },
  "series": {
    "coverage_rows": 1013,
    "coverage_rate": 1.0,
    "series_count": 639,
    "retry_dispatches": 374,
    "series_with_retry": 271,
    "double_timeout_series": 0
  },
  "execution_modes": {
    "pipelined": 146,
    "serial": 867
  }
}
```
