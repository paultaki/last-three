# Episode 01 review

Series: `e4bf435b-7675-43d2-9d20-0b18e9527159`.
Round 1: `d6f7a98d-9eee-4ee3-915b-8c516b5f9428`, Claude Fable through the fixed safe no-tools courier, 180-second limit. Valid verdict, three reported findings, no anomalies.

Adjudication: two low findings accepted. Full processed PCM lengths now determine voice windows; the mixer retains every sample and verifies within one sample. The naive container-duration truncation was removed entirely. Capture hashes its actual runtime timing and encode requires matching capture, soundtrack and canonical timeline hashes. All frames and exports are regenerated against that timeline.

One medium finding discarded because it omits an existing scene contract: Arena.render resets effects visibility every call (scene.js line 947). Episode post-render Pit suppression therefore cannot leak. The contract is written in REPLAY-INVARIANTS.md, and seven deterministic checks now include bridge/disc deaths returned to after the Pit sink.

Round 2: `4ae346cb-6d6a-4205-ba84-82f800127d1d`, fresh corrective context in the same series. VERDICT: CLEAN, no anomalies. Both rows are closed. Fix commit: `84b89b3`.

## Round 1 output, verbatim

```text
VERDICT: FINDINGS:3

1. **Medium — web/show/src/episode.js:54** (`if(beat.id==="bex-sink")arena.effects.visible=false;`)
   One-way state leak. `arena.effects.visible` is cleared when any `bex-sink` frame is drawn and is never restored by `draw()`, while every other author-owned visibility flag (`wakes`, `bubbles`, `rope.visible`, `c.ring.visible`) is explicitly reset per draw and the stated `Arena.render` invariant only covers group/bone transforms, not visibility. Failure scenario in `capture-episode.mjs`: the proof pass (lines 14–18) visits `bex-sink` before the sequential frame loop (lines 29–35) starts at frame 0, so every encoded frame—including bridge/crusher/disc beats before the pit—renders with effects hidden, diverging from the proof screenshots taken earlier in the same session. The determinism pairs (lines 19–27) cannot detect this because all five run *after* the proof pass has already flipped the flag, so "before" and "after" are both captured in the leaked state. Output depends on seek history, violating the deterministic-rendering contract.

2. **Low — web/show/tools/mix-episode.py:60** (`data = np.pad(data[:planned], ...)`)
   Hard truncation to `planned = round(voiceDuration*RATE)` after accepting up to `.12s` of `measured` overshoot (line 57). The overshoot is assumed to be filter padding, but `rawDuration` comes from ffprobe container metadata (tolerance `.05s`, line 51) and the atempo output can legitimately exceed `voiceDuration` because of that estimate error; in that case the tail of the final word is cut and a 5 ms fade (240 samples, line 64) is applied over the cut. No check that the discarded samples are actually silent (e.g. `np.abs(data[planned:]).max()` below the `.012` gate already used on line 62). Data-loss risk on spoken tails, invisible to the manifest.

3. **Low — web/show/tools/encode-episode.py:12–19 / web/show/tools/capture-episode.mjs:37**
   Stale-capture gate is incomplete. `capture.json` records only `duration/fps/frameCount`, not a timing hash or beat table, and encode verifies capture against audio solely by `frameCount == audio['frames']` (line 19) and frame-file existence (line 21–22). Scenario: `timing.json` is regenerated with redistributed beat windows but the same ceil(duration·25) frame count (e.g. voice-rate changes that rebalance within the budget); `mix-episode.py` and `audio-manifest.json` update, the old `frames/*.jpg` and `capture.json` remain, and encode muxes the previous video against the new soundtrack with no assertion failing. Fix is contract-level: have capture emit `sha256(timing.json)` (it already has `edit`) and assert it equals `audio['timing_hash']` in encode.

--- anomalies ---
none
```

## Round 2 output, verbatim

```text
VERDICT: CLEAN

Verified against the stated round‑1 fixes:

- **Processed duration / tails** — `resolve-episode.mjs` computes `voiceRate` from ffprobe source duration only (so provisional and final rates are identical), decodes the full `atempo` output at 48 kHz mono f32, and `processed[b.id]=pcm.length/4/48000` is the exact sample count. `resolveEdit` guarantees `voiceEnd = start+.12+voiceDuration ≤ start+voiceDuration+.26 ≤ end`, so every window fits its shot. `mix-episode.py` repeats the identical ffmpeg command (JS and Python both emit shortest round‑trip float strings for rates in [1,1.3], so the `atempo=` argument is byte‑identical), asserts `|measured−voiceDuration| < 1/RATE`, and `add()` can only truncate past track end, which cannot occur since `n = frames*1920 ≥ edit.duration*RATE`. Fades scale amplitude only; length unchanged.
- **Timing hash contract** — `resolve-episode.mjs` writes the same `body` to both `timing.json` copies. Capture hashes the runtime copy and additionally asserts `JSON.stringify(__episode.edit) === JSON.stringify(JSON.parse(timingBytes))`, so hashed bytes describe the frames actually seeked. Encode requires `OUT/timing.json == assets/timing.json`, `sha256 == audio.timing_hash == capture.timingHash`, plus `mix.wav` content hash, `frameCount == audio.frames` (both `ceil(duration*fps)` on the same double), and per‑frame file existence.
- **Return‑from‑sink checks** — seven beats including `cole-death` (bridge) and `eli-death` (disc) each perform same‑event, cross‑event (via `seek(0)`), and post‑`bex-sink` reverse seeks with byte‑equal screenshot comparison; `determinism.length == 7` is enforced in encode.
- **Tests / edit integrity** — insert/epilogue/`later` ordering assertions cover every backwards event step in `BEATS`; all seven death beats map to tape deaths; `textPages` partition is lossless and bounded.

No correctness, security, data‑loss, concurrency, or contract defects found in the scoped diff.

--- anomalies ---
none
```

## Reviewer reliability snapshot

Claude Fable global lane statistics captured 2026-10-10. These are across projects, not just this film. Rates are fractions. This series had two valid verdicts, two accepted fixes, one discarded existing-contract assumption, and zero timeouts.

| Metric | Last seven days | Lifetime |
| --- | --- | --- |
| Catch rate among valid verdicts | 0.6034 | 0.6117 |
| Actionable findings per finished dispatch | 0.4747 | 0.4689 |
| Bugs per closed review | 1.2847 | 1.335 |
| Provisional precision | 0.7735 | 0.7557 |
| Dispatch verdict rate | 0.7867 | 0.7665 |
| End-to-end verdict rate | 0.7431 | 0.66 |
| Brief validation failures | 8 | 121 |
| Oversized packet failures | 14 | 45 |
| Timeout rate | 0.1787 | 0.1488 |
| Loop count | 0 | 0 |
| Stale pending rows | 3 | 11 |
| Retry dispatches | 137 | 383 |
| Double-timeout series | 0 | 0 |
