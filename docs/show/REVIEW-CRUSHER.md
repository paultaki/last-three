# Crusher clipping correction review

Series: 332a51fe-15c1-45a0-8f2e-2ff2e3f6c97e
Round 1: 3b128fdc-cb10-43b6-bcca-50763ec9a2f6

## Verbatim reviewer output and courier anomalies

```text
VERDICT: FINDINGS:5

1. **Medium — web/show/src/film.js:100-102 vs web/show/src/scene.js:355-364** — `filmShot` switches to the side cutaway eye `[15,3,-1.8]` whenever `view.key==="crusher"` and dive/escaped, but the obstacle hiding in `Arena.render` is additionally gated on `this.mode === "cinema"`. The existing near-wall cutaway (`this.film && this.dialogue`) shows film shots are applied outside cinema mode. In any film mode that is not `cinema`, the camera sits outside the x=±6.5 room behind the restored right wall segment (x 4.8..6.5), post (x=5.8) and rails (x=6.2): the escape is filmed through solid geometry. Camera selection and prop restoration must share the same gate.

2. **Medium — web/show/src/model.js:221-229** — The new crusher block runs *after* the `flinch` assignment (lines 211-220) and unconditionally sets `pose="hold"` for the holder. Any valid `push_lever`/`shove` action whose target is the holder now loses its flinch reaction in the crusher stage (previously the hold came from the verb map before the flinch override). Same for the `walk` override clobbering `flinch` on anyone crossing z=-4.9 on an action beat.

3. **Low/Medium — web/show/src/model.js:66-69 + 134-136** — On the failed-dive reveal (`data.dive!==true`), `crusherCeiling` returns `0.66` if `c.crushed` is already set (the comment "A reveal announces the outcome; the following death beat performs impact" implies it is). On that beat the holder is still positioned at `[-4.3,0,-1.8]`, under the slab footprint, so the slab is drawn at 0.66 through the holder; the next death/flatten beat then snaps the slab back to 2.8 and re-slams. If `crushed` is set at the reveal, the reveal should keep the slab raised (treat impact as death-only); if not, the branch is dead and the comment misleading.

4. **Low — web/show/src/model.js:60-62/138, web/show/src/sets.js:589** — Survivors are now routed through the physical opening at x≈3.3,z=-6 on the dive reveal, but `r.door.position.y` is still `1.7` (closed) unless `s.crusher.door` is true, and the diff does not set/raise the door on `crusherDive`. If `door` is false on a dive beat the cast walks through the closed door mesh in the new gap, which is the same class of clip the task is meant to fix.

5. **Low — web/show/src/model.js:57-59, web/show/src/scene.js:343-355** — For ability survivors who first leave on `stage_end` (`escaped=true`, `escaping=true`), the slab jumps from the settled 0.66 (end of the prior flatten beat) to 2.8 at t=0 and slams a second time at 1.25. Needed to avoid walking through the slab, but it's an instantaneous pop and a second impact for an outcome already shown; at minimum the lift should animate rather than snap.

--- anomalies ---
none

```

## Adjudication

1. Discarded. The omitted caller in scene.js invokes filmShot only under film && cinema, matching the prop gate.
2. Accepted, medium. Moved the persistent crusher pose block before the current-event flinch override. Added a regression for Hana at event 346.
3. Discarded. The reducer sets crushed only on death, never on the preceding reveal. The conditional branch is used on later beats after an actual death.
4. Discarded. The reducer opens the door when the reveal records a holder or jammer; stage end also opens it.
5. Discarded for the reported saved-holder sequence. The engine emits ability saves before any deaths and never emits a flatten death for that saved holder. There is no prior collapsed slab to reopen on this path. Multi-victim room collapse remains part of the broader obstacle choreography audit, not proof claimed for this correction.

Missing-context invariants are recorded in web/show/REPLAY-INVARIANTS.md.

Primary verification: 400 tests, 113 tapes, 44-beat film browser check and studio browser checks at 390/768/1440. The clearance test samples the holder route and slab throughout the successful escape and failed-dive flattening. Purchased-cast screenshots and recordings remain local and ignored.

## Round 2

Review: 73bcb0f2-dd7e-4d7b-8945-cc7df85ee112

Verbatim reviewer output and anomalies:

```text
VERDICT: FINDINGS:2

1. Low — web/show/src/model.js, `crusherCeiling` lines ~53-56 and ~62 (dive / flatten branches start at constant `2.8`). Failure scenario: a dive reveal or flatten death that occurs while `c.ceiling` still makes `raised = max(2.8, 2.05 + c.ceiling*0.75) > 2.8` (e.g. ceiling=3 → 4.3) causes the slab to snap from its current raised height down to 2.8 on the first frame of the event, then hold/slam from there. Why the diff causes it: the previous frame rendered `raised`, but both the `crusherDive(s) || (c.escaped && escaping)` branch and the `death/flatten` branch hard-code the start height as `2.8` instead of `raised`, so continuity is only preserved when the dive happens at the lowest ceiling step. Clearance is still satisfied (bottom ≥2.31 > 2.05), so this is a visible pop rather than a clip. Starting both curves at `raised` fixes it without changing timing.

2. Low — web/show/src/model.js `positions` (crusher branch, `s.crusher.holder === n && !s.crusher.escaped && !crusherDive(s)`) and `presentation` crusher block; web/show/src/sets.js `crusherCeiling`. Failure scenario: any event rendered between the dive reveal and its `stage_end` (caption, ability/feather emission, thought/whisper) makes `crusherDive(s)` false while `escaped` is still false, so the holder teleports back to the hold mark `[-4.3,0,-1.8]` with pose `hold`, the slab pops back up to `raised`, and then at `stage_end` the holder re-walks out and the slab slams a second time. Why the diff causes it: the staging keys off the transient `s.ev` rather than any persisted state (reducer does not persist dive, per invariants), so correctness depends on strict reveal→stage_end adjacency that the tapes happen to satisfy today but no invariant enforces. If adjacency is intentional, it should be asserted in the sampling test (e.g. no crusher event between a `dive=true` reveal and `stage_end`) so a future tape can't reintroduce the standing-through-the-slab defect.

No issues found with the committed correction itself: the crusher block now precedes the flinch override so a shoved holder correctly renders `flinch` (and `death` still wins last); `cameraObstacles` are toggled every frame and restored outside `film && mode==="cinema"`; the dive/`escaped&&escaping` ceiling hold at 2.8 until 1.25s exceeds the 1.15s walk completion; the doorway route (gap x 1.8–4.8 at z −6, route points at x≈2.7–3.9) and exit slots (z ≤ −6.6, behind the wall, unique per `living` index) are consistent with the new geometry; reduced motion settles both actor (`p=1`) and slab (`seconds=2.8`).

--- anomalies ---
none

```

Accepted both low findings. Applied the exact prescriptions: use raised as the start of both slam curves, and assert successful-dive-to-stage-end adjacency across the supported tapes. The selected film uses ceiling=0, so its curve and export are unchanged by the curve correction. Added a raised-height regression. No third dispatch: verbatim-fix exemption after a green gate; no risky surface.


## Export proof

Local ignored outputs: docs/show/recordings/video-first-story.mp4 (1920x1080, 25 fps, 226.32 seconds) and crusher-corrected.mp4 (8 seconds, full-video 97-105 seconds). Browser capture reported no errors. Exported frames verify the escape, closed slab, stage end and final podium.

## Reviewer lane reliability

These are lane-wide metrics, not project findings.

### Seven days

```json
{
  "reviewer": "claude-fable-5",
  "window_days": 7,
  "rows": 403,
  "dispatches": 381,
  "closed_reviews": 294,
  "found_reviews": 174,
  "clean_reviews": 120,
  "verbatim_fix_rows_excluded": 0,
  "stopped_reviews_excluded": 83,
  "preflight_rejected": 22,
  "pending": 4,
  "stale_pending": 3,
  "real_bugs": 365,
  "catch_rate": 0.5918,
  "bugs_per_closed_review": 1.2415,
  "discarded_rows": 294,
  "discarded_findings": 97,
  "precision": 0.79,
  "precision_status": "ready",
  "operations": {
    "finished_dispatches": 377,
    "finished_attempts": 399,
    "end_to_end_verdict_rate": 0.7368,
    "verdict_rate": 0.7798,
    "actionable_finding_dispatch_rate": 0.4615,
    "stopped_rate": 0.2202,
    "timeout_reviews": 74,
    "timeout_rate": 0.1963,
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
    "duration_ms_median": 92469,
    "duration_ms_p95": 180333
  },
  "series": {
    "coverage_rows": 381,
    "coverage_rate": 1.0,
    "series_count": 248,
    "retry_dispatches": 133,
    "series_with_retry": 102,
    "double_timeout_series": 0
  },
  "execution_modes": {
    "pipelined": 47,
    "serial": 334
  }
}

```

### Lifetime

```json
{
  "reviewer": "claude-fable-5",
  "window_days": null,
  "rows": 1173,
  "dispatches": 1008,
  "closed_reviews": 763,
  "found_reviews": 464,
  "clean_reviews": 299,
  "verbatim_fix_rows_excluded": 0,
  "stopped_reviews_excluded": 233,
  "preflight_rejected": 165,
  "pending": 12,
  "stale_pending": 11,
  "real_bugs": 1010,
  "catch_rate": 0.6081,
  "bugs_per_closed_review": 1.3237,
  "discarded_rows": 763,
  "discarded_findings": 319,
  "precision": 0.76,
  "precision_status": "ready",
  "operations": {
    "finished_dispatches": 996,
    "finished_attempts": 1161,
    "end_to_end_verdict_rate": 0.6572,
    "verdict_rate": 0.7661,
    "actionable_finding_dispatch_rate": 0.4659,
    "stopped_rate": 0.2339,
    "timeout_reviews": 150,
    "timeout_rate": 0.1506,
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
    "timed_rows": 977,
    "duration_ms_median": 86836,
    "duration_ms_p95": 180345
  },
  "series": {
    "coverage_rows": 1008,
    "coverage_rate": 1.0,
    "series_count": 638,
    "retry_dispatches": 370,
    "series_with_retry": 269,
    "double_timeout_series": 0
  },
  "execution_modes": {
    "pipelined": 144,
    "serial": 864
  }
}

```
