# Audience direction delivery, 2026-10-09

Twenty opportunities ranked in AUDIENCE-OPPORTUNITIES.md; the selected nine are implemented. No recorded dialogue, thoughts, game outcomes or legacy 2D edit changed.

## Local outputs

- Full film: recordings/video-first-story.mp4. H.264, 1920x1080, 25 fps, 319.12 seconds (5:19), silent for narration.
- Three-moment preview: recordings/audience-highlights.mp4. Same format, 39.36 seconds. Forged whisper, Eli's rescue refusal/private motive, Hana's betrayal/contact/aftermath.
- Interactive local version: http://127.0.0.1:8843/last-three/show/?cast=city&tape=20261009-0025&edit=story . F hides controls, Escape restores them, Space plays.

## Verification

- npm run check: 408 tests passed, 113 tapes validated.
- Film checks: all 55 selected beats, reading pagination, privacy, pause/end/restart, reverse seeks, clean-frame controls, bounds at 1920/1280/390.
- Direction checks: reveal after reading, exact earlier quotes, source type, private sender/receipt removal, evidence and name clearance, delayed consequence, reverse pixels, safe overlay initialization.
- Studio checks: unchanged controls and tape projection at 390/768/1440, purchased City cast loaded.
- Final uninterrupted capture completed with no page errors. ffprobe confirms output dimensions, duration and video-only stream. Highlight decode completed without errors.
- Inspected exported frames and contact sheets for forgery reveal, refusal/motive, shove contact, delayed aftermath, crusher survivors outside the slab, and winner podium. Preview start, both joins and final frame were inspected separately.
- Three bounded review rounds at the integrated checkpoint: four low findings accepted and fixed, four assumptions discarded with repository invariants. Final corrective delta verdict CLEAN. Full output/adjudication and aggregate reviewer metrics in REVIEW-AUDIENCE.md.

## Capture notes

The browser recording timestamps drift from the wall-clock beat telemetry. The highlight cuts were checked against actual encoded frames, not inferred solely from event seconds. The full film retains uninterrupted browser playback. Purchased-cast videos, stills and GLBs remain local/ignored. No public upload or push.

This pass does not add voiced dialogue, facial lip sync or a final sound mix. Those remain among the eleven ranked future opportunities. Browser viewport checks are not physical phone testing.
