# Episode 01 review

Series: `e4bf435b-7675-43d2-9d20-0b18e9527159`.
Round 1: `d6f7a98d-9eee-4ee3-915b-8c516b5f9428`, Claude Fable through the fixed safe no-tools courier, 180-second limit. Valid verdict, three reported findings, no anomalies.

Adjudication: two low findings accepted. Full processed PCM lengths now determine voice windows; the mixer retains every sample and verifies within one sample. The naive container-duration truncation was removed entirely. Capture hashes its actual runtime timing and encode requires matching capture, soundtrack and canonical timeline hashes. All frames and exports are regenerated against that timeline.

One medium finding discarded because it omits an existing scene contract: Arena.render resets effects visibility every call (scene.js line 947). Episode post-render Pit suppression therefore cannot leak. The contract is written in REPLAY-INVARIANTS.md, and seven deterministic checks now include bridge/disc deaths returned to after the Pit sink.

Corrective review remains pending at this checkpoint.

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
