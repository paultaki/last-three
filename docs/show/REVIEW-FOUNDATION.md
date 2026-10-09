# Foundation review

Reviewer: Claude Fable via the fixed grok-review courier, series 1913a08f-fec2-44f8-b829-82d2bbc5143d, review 58b77d26-8ef2-4131-8e13-3b90a3d6f002. No tools, no edits, 180-second limit.

## Reviewer output (punctuation normalized to ASCII)

VERDICT: FINDINGS:7

1. **Medium - web/show/src/app.js:10,23,32** - `updateURL()` calls `history.replaceState` on every `seek`, and `seek` runs on every `scrub` `oninput` tick and every autoplay advance. Safari (and WebKit-based browsers) throw `SecurityError` after >100 `replaceState` calls in 30 s; a single slider drag exceeds that. The throw happens inside `seek` after `paint()` but before `score.event` / flat-link update, surfaces as an uncaught exception from the `oninput` handler, and inside `loop` aborts that frame's `arena.render`. Throttle/debounce URL updates (e.g., on pointerup / when playback pauses) instead of per-seek.

2. **Low - web/show/src/app.js:39** - Keyboard transport ignores events when `document.activeElement.tagName` is `BUTTON`, `A`, or `SUMMARY`. Clicking any transport control (play/back/next/director) leaves focus on that button, so Space/ArrowLeft/ArrowRight/D stop working until the user clicks elsewhere. Also `document.activeElement` can be `null` -> TypeError. Only `INPUT`/`SELECT`/`TEXTAREA` (and the tape select) need excluding.

3. **Low - web/show/src/app.js:33** - Camera toggle calls `arena.render(elapsed/1000)`; `elapsed` is the playback-advance clock (reset to 0 on seek, frozen while paused), not `animationMs`. Toggling the camera while paused renders the event animation at t=0 for one frame, then the loop snaps back to `animationMs/1000` -> visible flicker/rewind. Use `animationMs/1000`.

4. **Low - web/show/src/model.js:19** - `step?.row||Math.max(0,b.cur-1-Math.floor(slot/2))` treats a legitimate `row === 0` as absent and substitutes a lane-derived row, mispositioning a player standing/stepping on the first pane after `cur` has advanced. Use `??`.

5. **Low - web/show/src/model.js:23** - `s.crusher.escaped||s.crusher.door` is used as a boolean. The sibling reducer sets (`pit.out`, `pit.lifted`) are arrays; if `crusher.escaped` is likewise an array it is truthy even when empty, so every living contestant is placed in the exit cluster from the first crusher event, and the `holder`/pre-escape layout never shows. Test 1 only asserts finiteness, so this is not caught.

6. **Low - web/show/src/app.js:34** - The Sound button is enabled before any tape finishes loading; `score.event(state)` with `state === undefined` throws inside `event(s)` on `s.ev`, is caught by the generic `catch`, and shows the misleading "Audio is unavailable in this browser" notice while leaving `enabled=true` and the aria state toggled. Guard on `state`/`metrics.ready`.

7. **Low (trust boundary) - web/show/src/model.js:27,38-39** - `positions()` and `presentation()` read `s.disc.tiles[n]`, `s.acts[name]`, `s.pit.lifted`/`rescued` regardless of `cut`. `visibleActor` hides non-step-worthy `ability_use`/`thought`/`whisper` actors, but if the reducer populates `acts` or `disc.tiles` from those same not-yet-public events, the public camera still shows the choice via position/pose before the recorded reveal. The privacy test only covers `visibleActor`, not positions/poses; gate these reads on `isStepWorthy`/`cut` or add a projection test that public positions/poses are unchanged across hidden events.

--- anomalies ---
none

## Codex adjudication

Accepted 1, 2, 3, 6, and the disc portion of 7. URL writes coalesce to at most two per second; sharing computes the current moment directly. Arrow and D shortcuts work after button focus while Space retains native focused-button activation. Camera uses animationMs. Audio guards missing state. Public disc figures wait around the rim until tilesPublic; the director may see choices. Regression coverage added.

Discarded 4 and 5. The real reducer uses bridge pane rows 1..8 and boolean crusher escaped. These invariants are now written in INVARIANTS.md and covered by tests. No evidence supports changing either data type assumption.
