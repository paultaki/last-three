# Episode 01 production

A 3:14 local video cut of the recorded game. 74 authored shots, 44 voice clips, all five obstacles and all seven eliminations. Speech bubbles carry contestant dialogue; dark thought bubbles identify private motives; whispers name their recipient and forged messages identify the forger. Only the narrator uses bottom captions. Original local music and effects support the action, with brief music pauses at key consequences.

## Watch

- `docs/show/recordings/episode-v1/last-three-episode-01-1080p.mp4`: full 1920x1080 master.
- `docs/show/recordings/episode-v1/last-three-episode-01-720p.mp4`: smaller review copy.

The source map is `docs/show/EPISODE-01-SOURCE-MAP.md`. All dialogue is condensed from the original tape, with deliberate editorial inserts labelled separately from the timeline. The screenplay is `web/show/src/episode-edit.js`. The earlier approved 40-second Pit proof is retained separately.

## Reproduce locally

Requires the existing local purchased cast, stable generated MP3 voices, Node show dependencies, Chrome, ffmpeg/ffprobe and Python NumPy. No cloud renderer or new resource is needed.

1. Place the 44 voice MP3s under `docs/show/recordings/episode-v1/audio/`, using each voiced beat's id as its filename. Voice IDs live in the screenplay. The three approved Pit clips are reused unchanged. Source jobs and original measured lengths are retained in the local output directory.
2. `node web/show/tools/resolve-episode.mjs` measures source clips and complete processed PCM, then writes the shared edit timeline to the local output and `web/show/assets/episode/timing.json`.
3. `node web/show/tools/build-episode.mjs` builds the separate film renderer.
4. `node web/show/tools/serve.mjs` starts the local rendering server on port 8843.
5. `python3 web/show/tools/mix-episode.py` builds the exact frame-length 48 kHz soundtrack. New voices are sped up with pitch-preserving tempo adjustment where needed, capped at 1.3. The source and complete processed lengths are checked before mixing; no processed audio tail is truncated. Original Pit voice rates remain 1.
6. `node web/show/tools/capture-episode.mjs --inspect` checks every shot and seven reverse-seek pairs, including returns from the Pit sink. Without `--inspect`, it renders all 4,848 frames at exact `frame/25` times and checks every frame for bubbles covering projected heads.
7. `python3 web/show/tools/encode-episode.py` requires matching capture/soundtrack timing hashes, checks frame and soundtrack consistency, makes both exports, verifies dimensions/fps/audio/duration/fast-start structure, and fully decodes each file with strict error handling.
8. `npm run check` verifies the engine and all authoritative tapes alongside the new editorial source tests.

## Limits

This is the first full voiced edit for creative review. Faces are static and there is no lip sync. Text pages use balanced word counts within each measured voice window, not phoneme-level alignment. The bubble check uses projected head positions with margins, not an occlusion-aware face detector. Licensed character assets, generated voices and video recordings remain local and ignored. No public upload or push is part of this delivery.

## Verification

426 tests and 113 authoritative tapes pass. All 74 authored shots and 4,848 exact frames pass browser error and projected-head bubble checks. Seven same-event, cross-event and post-sink return pairs are pixel-identical. Final audio measures -16.2 LUFS and -2.0 dB true peak. Both 193.92-second exports pass a strict complete decode, dimension/fps/48 kHz checks and MP4 faststart inspection. Round 1 accepted two low safeguards and discarded one existing-renderer-contract assumption; corrective review returned CLEAN. Both rows are closed; verbatim outputs and lane metrics are in REVIEW-EPISODE-01.md.
