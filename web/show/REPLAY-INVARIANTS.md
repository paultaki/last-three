# Replay presentation invariants

The tape and `web/lib/state.js` are authoritative. The 3D layer must not invent outcomes.

## Crusher review context

- `Arena` calls `filmShot` only inside `this.film && this.mode === "cinema"`. Crusher camera cutaway props use exactly that gate plus the matching dive/escaped condition.
- `crusher.crushed` becomes true only on a recorded crusher death in `applyDeath`. A ceiling reveal does not set it. The room ends after a holder or jammer dive attempt; there is no subsequent reveal after that holder's death.
- `applyReveal` opens `crusher.door` when it records a holder or jam. The stage-end reducer also opens the door. A valid holder/jammer dive therefore cannot route through a closed door.
- `Game.eliminate` resolves feather/lucky saves before emitting deaths. A saved holder has no flatten death beat before stage end, so its escape begins under the raised roof. Multi-victim room-collapse choreography is a separate case from the selected holder-escape sequence.
- A current recorded shove reaction overrides the persistent lever-holding pose. Death poses override both.
- Successful crusher dives are immediately followed by crusher stage_end in supported tapes. The regression suite asserts this over every tape; adding intermediate events requires persisting the visual escape state first.

## Audience direction

- During a death beat the 3D action is deliberately uncaptioned until the consequence card appears at 2700 ms. This avoids announcing a result before the fall; it is not a blank video frame. Focal names remain during the initial part of the action.
- The shove position block in Arena is already enclosed by `this.film && ["shove", "flinch"].includes(a.pose)`. Its contact curve never changes Studio motion.
- Arena's `ease(t) = t*t*(3-2*t)` is the same smoothstep used by deathProgress and the crusher slab, including flatten timing at 1.15 seconds.
- Every directed playlist entry passes isStepWorthy with the current Director setting. Private receipts and forged sender disclosures require Director mode.
- All editorial quote receipts are exact prior source excerpts. Whisper callbacks are labelled as whispers; Cole's right/left contradiction does not assert intent. Reaction gestures are staging, not invented recorded thoughts.

- Valid whisper events require `from` and `to` (src/tape.js EVENT_SHAPES). `name` identifies speakers in say/thought events. The common visibleActor fallback spans different event types; it does not permit a whisper without `from`. Forged-whisper disclosure uses the required real sender field.
- Names in the right column yield to a visible evidence card, including action callbacks without dialogue. Only placements 2 and 3 get podium labels; other death events say IS OUT.

- Presentation actors already carry `place` from reducer players (model.js presentation). The game_end reducer writes authoritative event placements to those players. Finalist name/ordinal rendering uses that same projected result; it is not an absent actor field. Browser proof asserts all three exact ordinals/names. Missing place 1 never permits a runner-up winner headline.
- Context diagnostics may run before initial load and return null then. Disc save lift stays at its held height on later non-feather ability events; only the actual feather-use event animates the lift.
