# Episode 01: story and visual language v3

A separate local story draft, preserving the original game, contestants, decisions and results. Engine, reducer and tape files are unchanged. Earlier v1 and v2 videos/audio remain untouched.

## What changed

- Actual Claude, DeepSeek, GLM/Z.ai, Grok, Gemini, Kimi, Qwen and OpenAI marks identify every speaking model. The pinned Lobe Icons SVG files, source URLs, hashes and MIT package license are in `web/show/assets/logos/`. Brand marks retain their respective ownership.
- Public speech has a white speech bubble and PUBLIC CHAT label. Private thoughts have a lavender cloud with three thought dots, PRIVATE THOUGHT and ONLY WE HEAR THIS. Real whispers have a cyan dashed bubble, both names, recipient-only text and two-person coverage. The pool whisper preserves Bex below and Dara above. Dara's forged Eli message is red, explicitly FAKE MESSAGE, framed on the forger rather than portraying Eli as its author.
- Rules explain what viewers are about to see. Footing is introduced as balance points. The final game's score panel shows the actual recorded scores. The ledge shrinks every two rounds; the last shrink animates with its one-point score cost.
- The chalk wall is introduced before the bridge. The ending shows the game-over invitation, Hana's advice, Gus's misleading claim, his private motive and the narrator's explanation. Gus writes that the crusher lever kills its holder, even though Hana escaped it.
- Six numbered trapdoor platforms each visibly support one contestant before the release. Three hinge downward together. Ash and Eli fall in the same drop. Fenn's single recorded feather catches him and sustains a visible float over his open hatch. Brief elimination cards do not restart either fall.
- Glass breaks at the death shot's contact cue, fragments originate from a tessellated pane at floor height and accelerate downward, and the broken pane remains missing. Unbroken panes remain intact, even when the weak side is revealed. Ledge falls cross the platform edge before gravity lowers the body, with restrained body tilt instead of spinning standing poses.
- Short staggered platform arrivals, independent weight shifts and quiet thought body language extend v2's retargeted walking/talking/swimming work. Chalk-writing coverage turns the author toward the actual wall.

## Story order and evidence

The script remains `web/show/src/episode-edit.js`, with explicit source event indices for every voiced line. The cold open is LATER. Early chalk setup is event 1 (`chalk_read`), shown as an insert after the stakes. Private inserts and the game-over chalk epilogue remain labelled.

Important receipts: trapdoor assignments at 473, opening tiles 1/3/4 at 488, Fenn's feather at 489, Ash/Eli eliminations at 490/491, initial ledge balance at 494, Fenn's loss at 505/506, Dara's zero balance at 515/516, final shrink at 528 and Gus's elimination at 529. Chalk invitation at 531, Gus's intention at 533, actual written warning at 538 and Hana's advice at 539.

Cole's left step still has no invented explanation. Dara's forgery fails on row six; Cole's later contradictory row-seven step is a separate event. Footing is a game score, not missing floor. Private knowledge and forged messages are explicitly distinguished from public facts.

## Draft audio and delivery boundary

The playable draft uses existing contestant clips plus temporary offline macOS narration. Two changed Gus lines also have temporary offline voice. Its stamp explicitly says STORY DRAFT / TEMPORARY LOCAL NARRATION. No paid speech request has been made in this pass. Ten replacement ElevenLabs jobs (805 text characters) are prepared in the ignored local output folder; their paid authorization is pending. Those jobs include the original narrator identity and original Gus voice identity.

Temporary narration is for judging clarity and pacing. It is not the final voice delivery. No public upload, push, cloud renderer or new resource is part of this pass.

The tradeoff favors first-time comprehension while retaining short shots: redundant praise is removed and repeated trapdoor aftermath is shortened. The draft measures 201.56 seconds, about 3:22, compared with v2's 3:14.

## Reproduction

Set `LAST_THREE_OUTPUT` to the absolute v3 output directory for resolve, mixing, capture and encoding. Timing and audio manifests measure every processed sample and preserve complete voice windows. Capture checks compiled scene, HTML, motion bank and all eight logo hashes. Full exports require complete frame ranges, exact reverse-seek proof, no render errors, no head/bubble overlaps, strict full decode, 25 fps, 48 kHz audio and faststart.

Recordings, voices, cast and motion bank remain local and ignored. Source changes are local commits only.
