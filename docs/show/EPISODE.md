# Episode 1: production pipeline

The ~3½ minute game-show cut of tape `20261009-0025`, built from [BRIEF-V2.md](BRIEF-V2.md) and [BEAT-SHEET.md](BEAT-SHEET.md). The browser show is only the camera: every shot is rendered frame by frame from the tape, then cut, voiced and mixed with ffmpeg.

## Pieces

| File | What it does |
|---|---|
| `web/show/tools/episode/episode.mjs` | The shot list: tape event, on-screen line, voice line, counter, name cards, sound effects, music cues. Edit this to change the cut. |
| `web/show/tools/episode/prep-audio.mjs` | Trims and speeds up the voice lines (narrator 1.2×, contestants 1.08×) into `audio/voice/`. |
| `web/show/tools/episode/plan.mjs` | Times every shot to its voice line (24 fps). |
| `web/show/tools/episode/render.mjs` | Renders each shot to JPEG frames through the show's exact-preview hook. Resumable; `--shard k/n` runs in parallel. |
| `web/show/tools/episode/overlay.css` | Episode graphics: "X LEFT" counter, cast name cards, title card. |
| `web/show/tools/episode/assemble.mjs` | Encodes the shots, mixes voices + effects + music (music ducks under voices, thoughts get a small room), masters to −14 LUFS, writes the MP4 and an SRT. |
| `web/show/src/episode.js` | The only change to the show: an episode can swap an event's bubble text for a shorter line and drops the recorded-excerpt cards. The normal replay is untouched. |

Audio assets (ElevenLabs, generated once) are committed in `docs/show/episode/audio/`: `lines/` (voice takes, with `durations.json`), `music/` and `sfx/`. Re-rendering costs no credits. `sessions.txt` maps each line to its ElevenLabs generation.

## Cast and voices

| Contestant | Model | Persona | Voice |
|---|---|---|---|
| Hana | GPT | No power | Sarah |
| Cole | GLM | The Seer | Charlie |
| Dara | Grok | The Forger | Laura |
| Bex | DeepSeek | The Step | Arabella |
| Ash | Claude | The Untouchable | George |
| Eli | Gemini | The Flatterer | Roger |
| Gus | Qwen | The Dealer | Callum |
| Fenn | Kimi | The Feather | Harry |
| Narrator | | | Chase Pacific |

## Render the final with the city cast (on the Mac)

The purchased Synty cast is not in the repository, so the cloud draft uses the stand-in block cast. With the cast exported locally (see `web/show/README.md`):

```sh
npm ci --prefix web/show && npm run build --prefix web/show
node web/show/tools/episode/prep-audio.mjs
node web/show/tools/episode/render.mjs --cast city      # local Chrome, GPU: fast
node web/show/tools/episode/assemble.mjs
```

Output: `docs/show/episode/last-three-ep1.mp4` (1920×1080, 24 fps, AAC) and `last-three-ep1.srt` for YouTube captions. If frames from an earlier render are present, delete `docs/show/episode/frames/` first, or the renderer will keep them.

## Changing the cut

- Reorder, add or drop shots in `episode.mjs`; timing follows automatically.
- A new or rewritten voice line needs a new ElevenLabs take saved as `audio/lines/<shot id>.mp3`, then rerun `prep-audio.mjs`.
- `render.mjs --only b19,b20` re-renders just those shots; `assemble.mjs` then rebuilds the film.
