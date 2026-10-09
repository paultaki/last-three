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

Primary verification: 398 tests, 113 tapes, 44-beat film browser check and studio browser checks at 390/768/1440. The clearance test samples the holder route and slab throughout the successful escape and failed-dive flattening. Purchased-cast screenshots and recordings remain local and ignored.

Round 2 pending after the fix checkpoint.
