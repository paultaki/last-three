# Video-first presentation

The show now defaults to a clean 16:9 composition designed for a narrated YouTube overview.

- Larger cast coverage and one speaker at a time.
- High-contrast speech bubbles with the speaker's name, a clear pointer, and comfortable reading holds. Long lines split into complete, verbatim passages where possible.
- Private thoughts use a dark gold treatment. Whispers are explicitly labelled. Public view preserves the original privacy rules.
- Shoves move the actor toward the target; camera coverage includes both characters. Deaths retain the recorded outcome.
- All playback, roster, event-count and graphics controls sit outside the clean recording frame. F enters it; Escape restores controls.
- The shared curated edit supplies 44 selected events. Nominal reading time is 196.54 seconds. Browser capture can be longer when frame production stalls; exported duration is reported separately.
- Existing tapes, engine rules, and the legacy viewer are unchanged.

## Open locally

[Film preview](http://127.0.0.1:8843/last-three/show/?cast=city&tape=20261009-0025&edit=story&i=440)

Use **Play the story cut** to start from the beginning. **Film view** toggles studio controls. The double-click launcher opens the curated film.

## Verification

395 tests and 113 validated tapes. Rendered film checks cover all 44 selected events, full-HD bubble bounds, private/public switching, pagination and pause, end/restart, reverse seek, keyboard controls and narrow-window overflow. The existing studio checks pass at 390, 768 and 1440 pixels. The film remains a landscape composition on narrow devices.

[Review record](REVIEW-FILM.md): the critical Claude review timed out at 180 seconds without a verdict. No retry or fallback. This work has primary verification, not independent reviewer approval.

[Asset restrictions](../ASSET-LICENSES.md) still apply. Purchased-cast exports, screenshots and videos remain local and ignored by git. No production push or public upload.

## Saved preview

`docs/show/recordings/video-first-story.mp4`: 1920 x 1080, 25 fps, 216.56 seconds (3:37 rounded), silent, about 64 MB. Full curated playback captured locally. The exported opening, dialogue, shove and epilogue frames were inspected after correcting Chrome's window-frame crop. There were no browser errors. This is a narration-ready local preview, not a published final edit.
