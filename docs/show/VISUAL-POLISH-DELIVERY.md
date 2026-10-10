# Visual polish delivery, 2026-10-09

All eight approved improvements in [VISUAL-POLISH.md](VISUAL-POLISH.md) are implemented: closer conversations, action cutaways, varied safe-deck blocking, listener coverage, body/prop contact, a cold open, the recorded Pit climbs and deliberate shot rhythm.

## Watch

- [Mobile film](recordings/visual-polish-mobile.mp4): 1280x720, 21.94 MB.
- [Full film](recordings/visual-polish-film.mp4): 1920x1080, 107.21 MB.
- Both: 398.76 seconds (6:39), H.264, 25 fps, yuv420p, silent for narration, fast-start MP4.
- [Local interactive film](http://127.0.0.1:8843/last-three/show/?cast=city&tape=20261009-0025&edit=story). F hides controls, Escape restores them, Space plays or pauses.

These are new versioned filenames. Earlier audience-pass exports remain available under their original names.

## Verification

- 419 tests and 113 tape validations passed.
- Five browser suites passed: film, direction, performance, Studio and cinematography. Checks include all 58 film beats; widths of 1920/1280/390; privacy; complete reading windows; listener timing; named finish; deterministic reverse seeks; exact diagnostic previews; opening pause/resume/return; body-motion pause; contact reach; sequential climb order.
- The supplied skill client was run with the installed Playwright/Chrome resolution adaptation. Its rendered plea, climb, shove and paused-hook frames were inspected.
- The uninterrupted capture reached all 58 beats and the final event 541 with no page errors. Source checkpoint: 0887c71.
- Actual recorded frames/contact sheets were inspected for the hook and return to the beginning, crusher staging and escape clearance, three climb pairs, plea/reply coverage and named podium. Encoded full-film and mobile frames were inspected separately.
- ffprobe confirms both formats and durations. Both MP4s place the moov atom before media for fast-start playback. The complete mobile file decoded without errors.
- No physical-phone session was run. The mobile artifact is the landscape 720p encoding, not a portrait recrop.

## Review state

The bounded independent reviewer timed out after 180 seconds without a verdict. The courier closed the row as stopped; no retry or fallback. No clean-review claim is made. [Review record and metrics](REVIEW-VISUAL-POLISH.md).

The twelve unselected polishing ideas remain a future backlog. No voices, facial rigs, new paid assets or additional effects were added. Recorded dialogue and outcomes are unchanged. Purchased-cast exports remain local and ignored; no public upload or push.
