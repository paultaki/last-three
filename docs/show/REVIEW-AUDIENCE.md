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
