# Review invariants

- The existing reducer is authoritative. Crusher `escaped` and `door` are booleans, not arrays. Pit `out` is an array. Do not infer one stage's shapes from another.
- Bridge pane rows are 1 through 8. Zero is the entrance platform, not a valid recorded pane.
- `say.forgedAs` is the apparent public speaker; private event names must not drive the public camera.
- Disc action choices do not move public figures to their selected tiles until `tilesPublic`; director mode may show those choices.
- Reached-ledge finalists can be dead and still have a valid podium place. The podium and chalk epilogue must show them.
- Presentation clocks cannot change tape outcomes. A settled event has the same projected positions and camera after forward or backward seeking.
- Source models and private cast exports are ignored. Do not add them or screenshots containing those assets to public Git without publication clearance.

## Video presentation

- Film view is the default. Studio is available with `view=studio`; clean frame affects composition, never tape state.
- `web/demo.json` remains the shared editorial source. The film player derives a sorted, unique, visibility-filtered event list and stops at its last beat. Loading another tape exits the edit.
- Dialogue uses current event text only, with `textContent`. Hidden private events cannot leave a stale speech bubble. Director thoughts and whispers have explicit labels. Forged public speech follows the visible identity.
- A speaking passage is never truncated. Its hold is proportional to word count, and pause freezes its current page. Tape text is quoted verbatim, including any original punctuation.
- Bridge contestants sharing a known-safe pane receive small standing offsets on that same pane. Film wall cutaways and treading-water height are staging changes, not changed recorded outcomes.
