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
