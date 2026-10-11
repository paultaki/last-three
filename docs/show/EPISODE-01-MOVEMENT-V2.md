# Episode 01, movement and detail pass (v2)

The film keeps the original 3:14 edit, voices and recorded outcomes. The earlier v1 exports remain in their original directory. New deliverables go into `docs/show/recordings/episode-v2/`.

## Pass 1: character performance

- Imported five real Quaternius animation clips onto all eight local Synty rigs: Idle_Loop, Idle_Talking_Loop, Walk_Loop, Walk_Formal_Loop and Swim_Idle_Loop.
- Idle cycles continue through the full shot instead of stopping at the base renderer's 2.8-second settle point. Different people have different phases and playback speeds.
- Public speakers gesture; private thoughts and whispers keep quieter body language. Listeners shift weight and track the current speaker. Falls trigger smaller staggered reactions, and the winner gets restrained celebration accents.
- Recorded bridge steps use a complete walking cycle tied to their existing travel distance. Eli, Gus and Hana take short staged retreat steps on the safe Pit deck during their rope refusals.
- Bex treads water only after her human-step support is no longer being shown. She turns and looks upward at actual deck occupants, including Dara during her whisper. Her pool cameras now show her face looking up and reaching toward the deck.
- Existing shove contact, crusher escape, human-step climbs and death trajectories retain their original choreography. Bex's original water-aware support height remains unchanged in all climb beats.

## Pass 2: scene detail

- Deterministic worn surface grain and scratches on concrete and painted structure.
- Wet deck patches, seams, rim fasteners, water-level marks, visible water inlet streams and full-time animated water highlights.
- Mechanical rods and warning trim on the crusher; fasteners attached to the actual glass panes and trapdoors.
- Ledge fittings follow the actual shrinking platform. Detail on opened panes/doors follows source visibility, with no visual clue to a safe bridge pane.
- Speech-bubble clearance now uses the animated head bone rather than an estimated standing head position.

All new pipework, wear and fittings are decorative set dressing. They introduce no new exit, foothold, power or recorded decision. Character performance is authored staging, as disclosed on the film's end card.

## Animation provenance

Creator: Quaternius. Local package: Universal Animation Library Standard, `Unreal-Godot/UAL1_Standard.glb`, the variant with root motion disabled. The vendor License.txt states CC0 1.0 Universal; README.txt identifies the package, author and root-motion variants. Source is retained unchanged under Paul's shared 3D library:

`/Users/paul/Development/Assets/Blender/Libraries/Collected by Source/Sources/Development/.media/afterlight-avatars/src/UAL/Universal Animation Library[Standard]/`

Retarget exporter: `web/show/tools/retarget-episode-motion.mjs`. It samples native source rotations at 30 Hz, transfers bind-relative world rotations to 22 matching target bones in hierarchy order and converts them back into target-local rotations. Runtime direct clip interpolants evaluate exact film time. Imported root X/Z translation is never used. Standing/walking soles are grounded using calibrated skeletal proxies. Pool movement has separate waterline placement and gaze.

Private generated motion bank: `web/show/assets/episode/motion.json`, 2.53 MB. Purchased cast and derived motion data remain ignored. No vendor original or shared-library asset was edited. No new paid voice, cloud render or resource was needed.

## Reproduce

1. Run `node web/show/tools/retarget-episode-motion.mjs '<local UAL GLB path>' web/show/assets/episode/motion.json`.
2. Run `node web/show/tools/build-episode.mjs` and start `node web/show/tools/serve.mjs`.
3. Set `LAST_THREE_OUTPUT=/Users/paul/Development/last-three/docs/show/recordings/episode-v2` for the movement check, capture and encoder tools.
4. `node web/show/tools/check-episode-life.mjs` checks upward gaze, bone normalization, foot grounding, continued long-shot movement and original human-step support heights.
5. `node web/show/tools/capture-episode.mjs --inspect` checks all shot frames and reverse seeks; omit `--inspect` to capture all 4,848 exact frames.
6. `python3 web/show/tools/encode-episode.py` checks captured timing and visual hashes against current assets and the unchanged verified soundtrack, then encodes both MP4s and performs strict full decoding.

The v2 audio directory points to the verified original soundtrack, and timing/audio manifests are copied unchanged from v1. Do not run the voice mixer against that shared audio directory. Capture rejects changed visual inputs during its run; encoding rejects stale bundle/HTML/motion hashes. Both browser tools select ANGLE SwiftShader explicitly because the hardware backend stalled during this render session. The final capture starts from frame zero, overwrites all frames and uses a single rendering backend. A bounded screenshot timeout retry re-seeks the exact frame. Speech-bubble boxes snap to capture pixels. Chrome's software DOM compositor still varies 14 antialiased corner pixels in a repeated full screenshot, despite identical bone states and overlay geometry. The determinism gate therefore compares exact canvas pixel bytes plus all film overlay DOM markup across each reverse seek. It has no tolerance for character/set pixel changes or film overlay content/state changes. The legacy replay name-label container is always display:none in the film and is excluded; its offscreen projections use the base camera before the final film FOV. Every pair also requires changed canvas pixels at a different time, preventing an empty drawing buffer from producing a false pass. This does not claim byte-identical full-page screenshots. Full-page frames still receive face/bubble clearance checks.

Four independent software-rendering browsers capture disjoint contiguous frame ranges after the inspection gate. Every frame is sought by absolute time. All workers must finish; an aggregate failure prevents the capture manifest. The encoder checks complete gap-free ranges, visual hashes, audio hashes and every JPEG, then performs strict full MP4 decoding. Set LAST_THREE_CAPTURE_WORKERS=1 for a serial capture.

## Movement verification

- 429 tests and 113 authoritative tapes pass.
- 26 pool-gaze samples point Bex upward toward the deck, with alignment above 0.9.
- 42 skeletal sole checks stay within 4 cm of their support surface; sampled rotations remain normalized.
- All eight characters continue moving past the base renderer settle cap. Six scene samples contain 8, 8, 8, 4, 7 and 8 moving actors respectively.
- All four human-step setup/climb beats preserve Bex's original water-aware support height.
- Canvas readback was visually inspected and changes with character motion.

Short local previews are in the v2 recording directory: opening-preview-720p.mp4 (12 seconds), pool-preview-720p.mp4 (5.2 seconds) and movement-comparison-720p.mp4 (8 seconds; original left, updated right). Each passes strict decoding.

The required Claude review timed out at 180 seconds without a verdict. Its row auto-closed as stopped; no retry or fallback was run. See REVIEW-EPISODE-01-MOVEMENT-V2.md for verbatim courier output and reliability metrics. This is not an independent CLEAN review.

Final capture: all 4,848 frames, 74 shot inspections and seven same-event/cross-event/post-sink checks pass. There are zero render errors, zero projected-head bubble overlaps and zero screenshot retries. Four contiguous ranges each contain exactly 1,212 frames. Current bundle, HTML and motion-bank hashes match the final capture. The original timing and soundtrack hashes remain unchanged.

Both complete exports pass strict decoding: 193.92 seconds, 25 fps, H.264 video, 48 kHz AAC audio and faststart MP4 structure.

| File in episode-v2 | Resolution | Status |
| --- | --- | --- |
| last-three-episode-01-1080p.mp4 | Native 1920 x 1080 | Full decode passed |
| last-three-episode-01-720p.mp4 | 1280 x 720 review copy | Full decode passed |

The encoded Eli, Bex and ledge frames were visually inspected after export. Delivery evidence is in delivery.json, capture.json and movement-proof.json. The original v1 exports remain available. This is a verified local delivery, ready for Paul's creative review. Nothing was uploaded or pushed.

## Practical limits

The visual style remains the existing low-poly cast. Facial textures and lip sync are unchanged. Foot checks use skeletal sole proxies rather than continuous mesh collision simulation. Every visible core movement still follows the authoritative recorded game; the new small gestures and safe-deck retreats are film performance.
