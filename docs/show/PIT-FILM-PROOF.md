# The Rope: Pit film proof

2026-10-10. A separate 40-second editorial proof for YouTube. Original game recordings, engine, replay reducer and existing viewer remain unchanged.

## Watch

- Local 1080p film: `docs/show/recordings/pit-proof/the-rope-1080p.mp4`
- Smaller 720p film: `docs/show/recordings/pit-proof/the-rope-720p.mp4`

These outputs contain the previously selected purchased cast and stay local and ignored. This is a proof of editorial pace and emotional coverage, not the completed full episode or a public upload.

## Creative treatment

Three rapid climb-pair shots condense the recorded escape. One wide shows six contestants safe and Bex alone. A coiled rope makes the unused rescue option visible. Close-ups cover Bex's offer, Eli's risk argument and Gus's competition argument. Low angles show the safe contestants from inside the Pit. An unused-rope insert and a silent reaction precede the recorded departure and sink. Empty water receives the final narration and a brief end card.

The voices are synthetic performances using existing ElevenLabs voices: Will for narration, Sarah for Bex, River for Eli, Roger for Gus. No voice cloning. The exported film discloses condensed dialogue and AI voices. Character poses and gestures are authored staging; these do not establish new private motives. Facial animation and lip sync are not included in this proof.

Music and effects are original local synthesis: a bass tension pulse, restrained drone, water ambience, climbing splashes, departure footsteps, sink sound and short closing notes. The music stops at 26.4 seconds and stays silent until 33.7; water remains audible. Voice windows reserve room in the score and reduce its level.

## Source fidelity

Tape: `web/tapes/20261009-0025.json`. Public speech is adapted, not quoted verbatim. No private thoughts are turned into spoken dialogue.

| Film line or fact | Source events | Treatment |
| --- | --- | --- |
| Six climb out using Bex as the base | 391, 410, 431 | Condensed recorded climb pairs |
| Rescue costs two footing | Rules v4, public Pit rule | Mechanic explained in narration and rope insert |
| Bex: Throw me the rope. My power can save you later. | 436 | Preserves her rescue request and claim about her power, without verifying that claim |
| Eli: Nothing personal. Saving you could get me killed. | 440 | Preserves his stated risk; does not claim the penalty guarantees death |
| Gus: No rope. We've got enough competition. | 443 | Preserves his refusal and competitive motive |
| Departures, unused rope, Bex sinks | 446-455 | Recorded choices and consequence; no invented rescue attempt |
| Six escaped. Zero came back. | 453-455 | Editorial summary of no rescue |

Stable voices live in the ignored `docs/show/recordings/pit-proof/audio/` directory as `narrator.mp3`, `bex.mp3`, `eli.mp3`, `gus.mp3`, `ending.mp3`. The edit manifest in `web/show/src/pit-edit.js` records voice windows, subtitles and event references.

## Local production

1. `node web/show/tools/build-pit-proof.mjs`
2. Start `node web/show/tools/serve.mjs` if no local server is running.
3. `node web/show/tools/capture-pit-proof.mjs`
4. With the five stable voice files present: `python3 web/show/tools/mix-pit-proof.py` (NumPy required).
5. `python3 web/show/tools/encode-pit-proof.py`

The separate `pit-proof.html` is a local production surface, not a public player. The finished MP4 is the deliverable. Capture and encode diagnostics, audio manifest and inspected shot frames live beside the ignored film outputs.

## Validation and limits

The repository gate passed 422 tests and 113 tape validations. The source checks cover edit continuity, chronological source events, public speaker attribution and non-overlapping voice/subtitle windows. Chrome shot inspection and reverse-seek pixel equality cover presentation determinism.

The first screen recording showed timing drift during encoded-frame inspection, despite correct source shot timing. Final production uses exact offline frame sampling rather than wall-clock screen recording. Export verification includes dimensions, duration, audio/video streams, complete decode and MP4 fast-start. See the delivery diagnostics for the actual final results.

The soundtrack is a proof mix, not a final commissioned score. Subtitle breaks are authored and are not claimed to be automatic word alignment. Existing low-poly faces remain static. Final taste and creative acceptance belong to Paul.
