# Replay presentation invariants

The tape and `web/lib/state.js` are authoritative. The 3D layer must not invent outcomes.

## Crusher review context

- `Arena` calls `filmShot` only inside `this.film && this.mode === "cinema"`. Crusher camera cutaway props use exactly that gate plus the matching dive/escaped condition.
- `crusher.crushed` becomes true only on a recorded crusher death in `applyDeath`. A ceiling reveal does not set it. The room ends after a holder or jammer dive attempt; there is no subsequent reveal after that holder's death.
- `applyReveal` opens `crusher.door` when it records a holder or jam. The stage-end reducer also opens the door. A valid holder/jammer dive therefore cannot route through a closed door.
- `Game.eliminate` resolves feather/lucky saves before emitting deaths. A saved holder has no flatten death beat before stage end, so its escape begins under the raised roof. Multi-victim room-collapse choreography is a separate case from the selected holder-escape sequence.
- A current recorded shove reaction overrides the persistent lever-holding pose. Death poses override both.
- Successful crusher dives are immediately followed by crusher stage_end in supported tapes. The regression suite asserts this over every tape; adding intermediate events requires persisting the visual escape state first.
