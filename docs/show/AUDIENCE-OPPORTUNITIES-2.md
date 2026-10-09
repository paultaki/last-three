# Second audience pass: 20 further opportunities

Based on the delivered 5:19 film, its exported proof frames, and tape 20261009-0025. These are further opportunities, distinct from the first pass's nine completed items and eleven deferred audio/asset ideas. Rank balances delight, performance, efficiency and simplicity. Selected work uses the existing rigs and recorded events; it adds no dialogue or inferred private motives.

| Rank | Further opportunity | Why it matters | Selection |
|---|---|---|---|
| 1 | Cut away bridge support posts during conversation coverage | Foreground steel currently obscures faces | Implemented |
| 2 | Put neutral LEFT / RIGHT lane markings on the bridge | Viewers can judge Cole's contradictory step spatially | Implemented |
| 3 | Give pleas, refusals, praise and taunts distinct body performances | The same arm wave cannot carry every conversation | Implemented |
| 4 | Separate internal thought and secret-message performances from public speaking | Characters should not appear to announce their private thoughts | Implemented |
| 5 | Give recorded power uses an explanatory beat and matching physical performance | Ash's resistance and Fenn's survival currently look unexplained | Implemented |
| 6 | Translate zero-footing reveals into a visible danger beat | A list of numbers is easy to miss before someone falls | Implemented |
| 7 | Make rejected actions explicit, with the recorded rule reason | The late invalid action otherwise looks like a successful choice | Implemented |
| 8 | Name all three finalists at their podiums and hold the finish | Tiny podium numbers do not establish who placed where | Implemented |
| 9 | Hold a consistent conversation axis across a full exchange | Reduces disorientation when speakers change | Deferred |
| 10 | Use deliberate over-the-shoulder coverage in alliance exchanges | Makes intimacy and distance easier to feel | Deferred |
| 11 | Show the Pit's human-step climb in a dedicated continuous shot | Explains how six people escape while the base stays behind | Deferred |
| 12 | Preview the disc's odds through visible tile counts | Makes the random danger immediately comprehensible | Deferred |
| 13 | Trace only previously revealed bridge crossings | Helps viewers reconstruct the path without revealing future safe panes | Deferred |
| 14 | Show full-body balance corrections as the ledge shrinks | Makes remaining space feel physically scarce | Deferred |
| 15 | Carry the camera across the crusher doorway with the escape | Improves spatial continuity between lever and safety | Deferred |
| 16 | Frame spoken demands with their concrete bargaining resource | Connects a threat or promise to its practical value | Deferred |
| 17 | Create an optional shorter editorial cut for the overview | Reduces repeated information when narration supplies context | Deferred |
| 18 | Export an editable narration cue sheet with verified video times | Makes recording the overview easier | Deferred |
| 19 | Provide a high-contrast alternative bubble theme for bright viewing | Improves readability on poor screens without changing the cut | Deferred |
| 20 | Add an editorial pause handle after key reveals | Gives an editor clean room to extend a narrator reaction | Deferred |

## Build plan and invariants

1. Add a small presentation-only performance/context module. All danger, invalid-action and power facts come from the current recorded event. Private performance is disabled outside Director mode.
2. Use existing bones for four public gesture types and quiet private poses. Keep Studio motion unchanged. Neutral bridge markings never encode future safety. Camera cutaways only affect film close coverage.
3. Add temporary context cards for visible power use, danger and rejected actions. Hold enough time to read. Keep earlier evidence cards and dialogue timing intact. Finale labels use authoritative recorded placements.
4. Verify the eight improvements with unit tests, rendered browser proofs, previous film/Studio gates and one critical integrated review checkpoint, followed by a local video export.

Tradeoff: reuse the current procedural rigs instead of adding facial animation or paid voices. This keeps load cost stable and leaves the silent film useful for Paul's narration. Public gestures are authored visual performances, not evidence of an unrecorded emotion.

## Verification map

| Improvement | Proof in the selected tape | Checks |
|---|---|---|
| Bridge cutaway | 201, 226, 269 | Conversation frames clear of bridge gantry; Studio retains it |
| Lane orientation | 201, 300 | Neutral row/LEFT/RIGHT labels only on visible panes |
| Public performance | 201 praise, 436 plea, 445 refusal, 499 taunt | Matching tape/actor; distinct finite poses |
| Private performance | 200 thought, 269 forged message, 509 whisper | Quiet poses and distinct leader patterns; hidden outside Director mode |
| Power explanation | 348/349 resistance, 489 feather | Reading time, visibility gate, persistent lift during later disc deaths |
| Danger result | 515 and 528 | Current recorded zero footing only; no future death lookup |
| Rejected move | 527 | Exact recorded reason, no invented reconciliation of its action/note |
| Named finish | 541 | Authoritative places, three names, 6.5-second hold, no early labels |

Primary gate: 413 tests, 113 tapes, all existing direction/film/Studio browser checks and the new performance suite at 1920/1280/390. Screenshots and skill-client action frames were inspected. Review and final video evidence are documented separately.
