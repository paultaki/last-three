# Pit film proof review

Series: `586723ea-376d-4e2c-9733-21b0e50cb8bc`.
Round 1: `f7857622-dcc6-426e-8c42-a06d8ee84d99`. Claude Fable, fixed safe courier, 180-second limit. Valid verdict: five findings, no anomalies.

All five findings were accepted. The sync-marker design was removed in favor of exact offline frame rendering, also fixing the independently observed screen-recording drift. Encoder output now explicitly requests and verifies 48 kHz audio. Audio starts and expected voice lengths come from the shared edit manifest; decoded lengths are checked before mixing. Peak reporting records the pre-limit value separately. Capture validates cross-event and same-event reverse seeks.

## Round 1 output, verbatim

```text
VERDICT: FINDINGS:5

1. **Medium — web/show/tools/encode-pit-proof.py L12-17 (sync-marker detection)**
   Detection scans the *entire* Playwright capture for near-white frames (`value > 245`) and demands they form one contiguous run of 2–12 frames. `recordVideo` starts at `newContext`/`newPage`, before `page.goto` in capture-pit-proof.mjs L17 — the initial `about:blank` is white. Any leading white frames make `white` non-contiguous (dark `#loading`/film frames sit between them and the marker), so the script raises "marker missing or ambiguous" and no MP4 is produced. Detection should only consider the white run that follows the first dark run (or the last white run), not every white frame in the file.

2. **Low — web/show/tools/encode-pit-proof.py L24 (`-af loudnorm` without `-ar`)**
   `loudnorm` resamples internally and emits 192 kHz; no `-ar 48000` follows, so ffmpeg auto-picks the nearest rate the AAC encoder supports (96 kHz). Deliverables carry 96 kHz AAC, which some hardware/browser decoders reject or mis-play. The ffprobe check (L28) never requests `sample_rate`, so this passes verification silently. Add `-ar 48000` after the filter.

3. **Low — web/show/tools/mix-pit-proof.py L12, L45-49 (voice timing contract)**
   `STARTS` is a hand-copied duplicate of `VOICES[].start` from pit-edit.js, and the actual decoded MP3 length (`len(data)/RATE`) is never compared to `VOICES[].duration` that the tests and CAPTIONS windows are authored against. If a stable MP3 is regenerated/trimmed or a start edited in one file only, subtitles and voice drift apart, clips can overlap, and the test suite (which only inspects pit-edit.js constants) still passes. Assert `abs(len(data)/RATE - VOICES.duration) < tol` and source starts from one place.

4. **Low — web/show/tools/mix-pit-proof.py L94-99 (`peak_before_final_normalization`)**
   The value is computed after `mix *= .92/peak` and after the final-second fade (L93), so the manifest field is mislabeled/wrong (always ≤ .92). Capture `peak` before normalizing and report that.

5. **Low — web/show/src/pit-proof.js L96, L120-121 and tools/capture-pit-proof.mjs L26-31 (determinism coverage)**
   Bex's bob (`c.group.position.y += …`) and the leave walk (`position.z -= …`) mutate group transforms in place each `draw`. This is only frame-deterministic if `Arena.render` rebuilds group transforms from state every call (the invariant states bone transforms are reset; group position is implied). The pixel-identical reverse-seek check only crosses events (13.5 → 32 → 13.5), which forces `setState` and masks any accumulation within a single event; multi-frame real-time playback inside one event (434: 3.3–12 s; 455: 33.7–40 s) and same-event seeks are unverified. Add a same-event reverse-seek (e.g. 4 → 11 → 4, or 20.8 → 21.9 → 20.8) to the determinism check.

--- anomalies ---
none
```
