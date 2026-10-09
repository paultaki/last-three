# LAST THREE 3D show delivery

Double-click `web/show/Open Show.command` to start/reopen the preview.

Local preview: http://127.0.0.1:8843/last-three/show/?cast=city&tape=20261009-0016&i=373

## Implemented

- All five obstacle sets, waiting room/lobby, chalk epilogue and results podium.
- Eight selected Synty characters with real skinned rigs, original bone performances, consistent seat colours and tags.
- Tape-driven positions, mechanisms, glass breaks, lever, rising water, human step, rope, trapdoors, ledge shrink and five cartoon elimination beats.
- Cinematic and wide camera modes, event-local motion, responsive presentation, captions, director-only thoughts and powers, transcript, deep links and shared moment links.
- Playback, pause, visible-event step forward/back, exact scrub, speed, chapter jump, keyboard and reduced motion.
- Original synthesized stage tones, tension pulse and stereo action hits. Audio creates no context until clicked, and mute was browser-tested.
- Soft shadows, beveled set edges, water normal detail, restrained bloom and three quality presets. Only the active stage geometry is mounted.

## Evidence

- Actual repository npm run check: 391 tests passed and 113 tapes validated. The earlier invalid untracked demo blocker was resolved by the concurrent legacy-viewer work; this build did not edit its tape.
- Browser checks at 390, 768 and 1440 px: no console errors, no horizontal overflow, stage snapshots with pixel-equal reverse seeks, controls, public/director visibility, asynchronous tape switching, rope rescue and all 512 events of the v4 fixture.
- Local scene screenshots and a 38.4-second scene reel are under ignored docs/show/screens and docs/show/recordings. The reel is an edited sequence of replay positions, not an uninterrupted full game. It has no recorded audio track.
- Eight private character GLBs total about 3.5 MB. The full tested viewer loaded about 4.35 MB decoded content. Auto quality uses Lite at 390 px and Balanced at 768/1440. Local headless Chrome median frames were about 16.7 ms; see browser-results.json for exact run data.
- No physical phone, Safari or Firefox performance claim. Chrome viewport emulation is not device QA.

## Review

Foundation review reported seven findings: five accepted and fixed, two rejected against verified reducer invariants. Details in REVIEW-FOUNDATION.md. The final integrated/confirmation review timed out at the required 180-second limit and produced no verdict. It was automatically closed as stopped; no retry or silent fallback was used. Final visual corrections were self-verified and remain without a completed second opinion.

## Scope and release limits

- No engine, tape format or agent behavior changed. No paid model calls. No production push for this show.
- Synty Store source and converted assets remain private and ignored; user confirmed store provenance. Clarify public distribution and current AI-related product restrictions before releasing the purchased cast. The committed viewer defaults to original stand-in figures.
- The purchased pack includes no animations. Current motions are procedural bone performances; there is no imported motion-capture library, facial lip sync or voiced dialogue.
- Quality work includes bloom and tone mapping; hero depth of field is not implemented. Geometry compression and KTX2 transcoding were deferred because measured initial bytes are already far below the 20 MB budget. Those are departures from the original brief, not claimed completed features.
- The 2D viewer is linked from the show. A backlink into the legacy viewer was not added because that viewer was being changed concurrently by its owner.
