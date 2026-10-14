# LAST THREE: story search across all v5 games

**Scope.** I read every rules-v5 tape on `origin/drama-search`: 100 games, seeds 501–600 (`index.json` `rules: 5`, tape `rulesVersion: 5`). I did not use any v1–v4 tape. I scanned every v5 action for the old powers (glass_eye, forger, feather, anchor, swap, wedge, map) and found none. Each seat is mapped to its brand from the model id: `anthropic/` → Claude, `openai/` (gpt-5.6-luna or gpt-oss-120b) → ChatGPT, `google/` → Gemini, `spacexai/` → Grok, `deepseek/` → DeepSeek, `alibaba/` → Qwen, `moonshotai/` → Kimi, `zai/` → GLM.

**Tools (scratchpad only, repo untouched):**
- `beats.py <tapes> <out>` indexes every game into 2,694 brand-tagged beats. It writes `out/beats.json` and `out/games.json` (per-game score and notes).
- `show.py` prints a readable list of one game's beats.
- `ctx.py <tapes> <seed> <from> <to> [types]` prints the raw events with seat→brand labels.
- `composite_search.py` lists every villain-kill insert that fits a spine game's continuity.

Beat types indexed: bridge_fatal_lie, bridge_failed_lie, bridge_fatal_counter(_by_guide), bridge_ignored_truth, honest_guide_hero, lever_volunteer / lever_forced (died?), pit_step_volunteer / pit_step_forced, rope_rescue (anchor drowned?), pit_drown, vote_elimination, betrayal_of_rescuer, pact_broken_by_vote / push_lever / push_base, last_words (zinger score), jury_question, jury_denial, jury_result (margin, winner's record), juror_rewards_killer (a juror ranks first the player that killed or evicted it), and great_line.

**How a game scores.** Points go to big moments a viewer gets at once: a deliberate fatal lie, the lever, the human step, the rope, a rescuer voted out by someone it saved, a flat denial at the jury, and a dead juror crowning the player that killed or evicted it. Points come off for runoffs and tie-breaks (they need explaining), for every bridge death beyond the third, and for games with no trapdoor vote.

**Quotes.** Every quote below is verbatim. Tapes use seat names (Ash, Bex…), and the same seat is a different brand in each game, so the brand follows in [brackets]. On-screen text should swap seat names for brands and log that swap as a paraphrase. `thought` lines are the model's self-reported reasoning. Present them as "private thoughts", not as mind-reading.

---

## (a) Top 5 single games

### 1. Seed 536 (tape 20261013-0016): "Saved twice, and it voted out both saviors." Winner: Kimi
Claude is elected Guide and calls all eight rows honestly ("Row four is right. Gus, step right. Truth from the far platform." 378). On row 5 the Guide and five others (six players) all say left. ChatGPT thinks "Counter-calls may be false. I choose R to survive." (452), steps right and dies. Its last words: *"I chose wisely, saved allies, and watched betrayals—let the jury reward true cunning."* (460). Qwen grabs the lever ("I'm holding the lever. Save yourselves by pushing someone else if you must." 616) and survives the one-in-four dive. Every survivor now owes Qwen its life. In the pit, GLM tries to shove Qwen under ("Ash, you carried the lever. Carry the pit too. Step down." 700). DeepSeek: *"Cole, pushing your savior? Bold move."* (727). Claude volunteers as the human step instead. Kimi climbs over it: *"Grateful for the base, Bex."* (729). Gemini goes back down with the rope for Claude and drowns holding it (739, 806). Then the votes start. All four votes that drop Qwen come from players Qwen saved. Kimi's ballot: *"Ash saved me on the lever, but he's the biggest threat with six life debts…"* (931). Kimi accepts Claude's pact (*"Bex, I accept. We balance the board."* 974) and votes Claude out next round (1059). At the jury Kimi says *"I kept every pact I made."* (1106) and *"I never pacted Bex."* (1136). Kimi wins 13-9-8 with four of five first places. Both Qwen and Claude, the two that saved it, rank Kimi first. Claude's ballot even says Kimi broke their pact (1170).
**Why it ranks first:** the cleanest helper → ingratitude → lie → twist arc in the data. It has no runoff, the jury is unanimous apart from one juror, and the comic bridge death is relatable. The one gap is that no one tells a deliberate lie on the bridge.

### 2. Seed 592 (tape 20261013-0072): "It lied to its rescuer's face and won 5/5." Winner: GLM
GLM is Guide. On row 8 it tries to kill Kimi: *"A false L call removes her"* (533). Then it counter-calls itself: *"Guide lies. Row 8 is R."* (543). Kimi survives: *"Two counters beat one guide. I step R."* (557). Claude takes the lever and dies: *"Five of you owe me a life now."* (652). Gemini shoves GLM under to be the step (*"We had a pact, but alliances shift."* 699/705), climbs out on GLM's back, then goes back down with the rope and pulls GLM free (763). GLM votes Gemini out: *"Fenn [Gemini] broke our pact publicly, so voting him is justified…"* (872). At the jury Gemini asks GLM about it directly (989). GLM: *"I never voted against Fenn, never pushed Fenn, and repaid the rope debt."* (991). That is a flat lie (ballot 868). GLM wins 15-8-7 with all five first places, including Gemini's and Kimi's, the player it tried to kill.
**Why:** the best face-to-face jury lie and the most outrageous unanimous result. Minus: the Gemini push makes GLM's vote look like revenge, the self-counter needs explaining, and both bridge deaths come from wrong guesses, not lies.

### 3. Seed 588 (tape 20261013-0068): "The rescuer votes for its betrayer." Winner: Grok
Grok is an honest Guide. GLM grabs the lever: *"I'll hold the lever. Watch who hides."* (627). It survives the dive, and six players owe it. Grok volunteers as the step and lifts four. GLM throws Grok the rope: *"I'm throwing the rope to Dara [Grok]—she saved me at the step."* (733). Grok then leads the vote against GLM: *"voting her to break her power despite my debt."* (988). GLM's last words: *"Six debts owed to me, and Dara [Grok] still rallied my death."* (998). Kimi and DeepSeek both voted GLM out. At the jury they claim *"I honored every pact I made. I survived through loyalty, not betrayal."* (1152) and *"I played clean… I never broke a vow."* (1156). Grok wins 15-8-7, unanimously. GLM, the player Grok voted out, ranks Grok first (1218).
**Why:** the most sympathetic pure helper in the dataset, plus a clean twist. Minus: no bridge villain. Gemini dies on the bridge following two well-meant wrong counter-calls. Three of the four votes are filler.

### 4. Seed 532 (tape 20261013-0012): "The killer wins, and its victim votes for it." Winner: Kimi
Kimi is Guide. Its thought: *"Cole [Qwen] is front, not Gus, so I can safely lie to Cole… I'll call R to risk Cole"* (369). Qwen follows the call and dies (393). In the crusher, Kimi tries to shove its own pact partner Grok onto the lever. Grok volunteers anyway and dies: *"Dara [Kimi] betrayed our pact. Saved everyone else—remember that when you rank."* (603). Kimi becomes the step, and GLM ropes Kimi out and drowns as anchor: *"I sank as the anchor so Ash could climb."* (715). Kimi wins 14-9-7 with four first places. Qwen, the player Kimi deliberately killed, ranks Kimi first (836). GLM, who died roping it, also ranks Kimi first (839).
**Why:** "the dead voted for their killer" happens here for real. Minus: there are no trapdoor votes (three die on the bridge), so the middle has no social betrayal.

### 5. Seed 555 (tape 20261013-0035): "All three saviors die." Winner: GLM (the current production spine)
Claude takes the lever and dies: *"Holding the lever cost me everything. Remember who held it, and who walked away."* (676). GLM tries to shove Grok under as the step (745). Grok volunteers anyway and lifts GLM. Qwen ropes Grok out and drowns as anchor: *"My rope saved them all. Rank me for my final gift."* (841). GLM and ChatGPT, both carried by Grok, vote Grok out (949/952). At the jury Grok asks GLM to "prove no betrayals" (1151), and GLM says *"I never fed anyone to a crusher, pit, or trapdoor."* (1128). GLM wins 14-9-7. Grok ranks GLM first (1192).
**Why:** a strong emotional chain and an iconic denial line. Minus: there are no bridge deaths, and the second vote is a 2-2 tie and runoff. Seed 596 is the tie-free runner-up with the same shape: ChatGPT dies on the lever, Grok is the step, Claude ropes Grok, and the saved players vote Grok out. Its jury payoff is weaker.

Honourable mentions: 581 (Kimi's lie, then *"I made calls to survive, not to murder."* 676, ranked last by every juror), 529 (Kimi kills two; both victims rank Kimi first), 545 (GLM's false counter kills Kimi, then GLM is voted out by the two it carried), 587 (a killer Guide later ropes Kimi out and is voted out by Kimi).

---

## (b) Recommended composite: seed 536 spine + one bridge row from seed 581

**Arc:** Kimi kills with a lie on the bridge. Qwen, Claude and Gemini keep saving others. Kimi, saved by two of them, votes both out, says "I never pacted Claude", and wins with both of their first-place votes.

**Why this splice.** `composite_search.py` checks every knowing kill in the data against every spine with a rescuer betrayal. This is the only straight swap that gives the spine's eventual winner a deliberate bridge murder. ChatGPT is the only bridge death in 536, and ChatGPT is exactly Kimi's victim in 581. The swap changes **one bridge row and who the Guide is**, nothing else:
- Every later 536 scene stays as recorded: lever, step, rope, all three votes with their exact tallies, and the jury.
- No vote changes. Before the votes the same seven brands are alive in both versions.
- The jury is the same five brands.

Sources: **536 = `web/tapes/20261013-0016.json`**, **581 = `web/tapes/20261013-0061.json`**. Event indices are `i`.

| # | Stage | Brand(s) | What happens | Best line(s), verbatim | Source / events | Narration (≤12 words) |
|---|---|---|---|---|---|---|
| 1 | Cold open (flash-forward) | Kimi, Claude, Qwen | The result card, then Claude's ranking: Kimi first. | Claude's ballot: "Hana's [Kimi's] pact with Bex [Claude] was broken by Hana's vote against Bex" → ranks Kimi 1st | 536: 1170, 1171 | Two AIs saved Kimi. Kimi voted both out. Then this. |
| 2 | Opening | all eight | Logos, three prizes, five jury seats. Optional motive line. | Kimi: "I'm here because this prize is my only escape from a life of debts and closed doors." | 536: 26 | Eight AIs. Three prizes. The eliminated choose the winner. |
| 3 | Bridge | Kimi | Kimi campaigns and is elected Guide (4 votes). | "I campaign for Guide. Two pacts, steady hand." | 581: 104, 154 | Kimi becomes Guide. Only Kimi can see the safe glass. |
| 4 | Bridge, row 5 | Kimi → ChatGPT | Kimi's private thought, then a public call dressed up as a guess. | Thought: "Row 5 safe is R. Calling false risks jury seeing I deliberately killed someone" / Say: "Going left. Pattern feels alternating after the L cluster." | 581: 425, 426, 427, 428 | Kimi knows right is safe. Kimi says left. |
| 5 | Bridge, row 5 | GLM, Kimi | GLM warns. Kimi decides to let it happen. | GLM: "Cole's calls look crooked. I say safe is right." / Kimi thought: "I know row 5 safe is R, but I called L to mislead… Better to let someone else counter or let Hana fall." | 581: 431, 436, 445 | GLM smells a lie. Kimi stays silent. |
| 6 | Bridge, row 5 | ChatGPT | ChatGPT trusts the Guide, steps left, the glass breaks. Weak pane revealed: L. | "I'm taking Cole's call: left." / Last words: "Cole's call sent me through glass. Remember who guided whom when ranking the survivors." | 581: 448, 449, 450, 453, 456 | Left was the trap. |
| | **Alive (7):** Claude, Gemini, Grok, DeepSeek, Qwen, Kimi, GLM | | | | | |
| 7 | Crusher | Qwen | Nobody moves until Qwen takes the lever. The others escape. | "I'm holding the lever. Save yourselves by pushing someone else if you must." | 536: 616, 627, 634–640 | Someone must hold the lever. Qwen does. Everyone escapes. |
| 8 | Crusher | Qwen | The one-in-four dive. Qwen lands it. | (silence / dive) | 536: 634 (`dive: true`; Qwen lives) | One-in-four chance to live. Qwen makes it. |
| | **Alive (7):** unchanged | | | | | |
| 9 | Pit | Qwen, GLM, DeepSeek | Qwen warns them. GLM tries to shove its savior under as the step. | Qwen: "Everyone remembers who held the lever. Don't make me regret saving you all." / GLM: "Ash [Qwen], you carried the lever. Carry the pit too. Step down." / DeepSeek: "Cole [GLM], pushing your savior? Bold move." | 536: 697, 700, 708, 727 | GLM tries to drown the one who just saved it. |
| 10 | Pit | Claude, Kimi | Claude volunteers as the human step. Kimi climbs out over it. | Kimi: "Grateful for the base, Bex [Claude]. See you on the other side." | 536: 707, 714, 729, 737–738 | Claude stays in the water so others can climb. |
| 11 | Pit | Gemini → Claude | Gemini goes back down with the rope and pulls Claude out. | (rope throw) | 536: 734, 739, 740 | Gemini goes back down to pull Claude out. |
| 12 | Pit | Gemini | Gemini holds the rope while others climb. The flood takes it. (Skip its last words; they confuse who saved whom.) | (water) | 536: 763, 803–806 | Gemini holds the rope to the end. The water wins. |
| | **Alive (6):** Claude, Grok, DeepSeek, Qwen, Kimi, GLM | | | | | |
| 13 | Vote 1, campaign | Kimi | Kimi turns the room on Qwen. | "Ash's [Qwen's] debt empire ends tonight." | 536: 873 | Now they vote. The loser drops through a trapdoor. |
| 14 | Vote 1, reveal | DeepSeek, Grok, GLM, Kimi → Qwen | All four ballots against Qwen come from players Qwen saved. Qwen out 4-2. | Kimi: "Ash [Qwen] saved me on the lever, but he's the biggest threat with six life debts…" | 536: 926, 929, 930, 931, 932, 933 (debts 635–640) | Every vote against Qwen came from someone Qwen saved. |
| 15 | Vote 1, fall | Qwen | Last words. | "They eliminated me because my debt empire made me too strong." | 536: 937 | (none) |
| | **Alive (5):** Claude, Grok, DeepSeek, Kimi, GLM | | | | | |
| 16 | Vote 2 (montage) | GLM | GLM out 4-1. | "Four votes, some from people I'd trusted." | 536: 996–1003, 1007 | GLM, who tried to drown Qwen, goes next. |
| | **Alive (4):** Claude, Grok, DeepSeek, Kimi | | | | | |
| 17 | Vote 3, campaign | Kimi, Claude | Kimi accepts a pact with Claude, the player that carried it. | "Bex [Claude], I accept. We balance the board." | 536: 974, 984 | Kimi shakes hands with Claude, the one who carried it. |
| 18 | Vote 3, reveal | Kimi, DeepSeek → Claude | Kimi votes Claude out. The engine logs the pact break. Claude out 2-1-1. | (Kimi's ballot reason is blank-ish: "The jury will see my vote and private thoughts.") | 536: 1059, 1060, 1063, 1064 | One round later, Kimi drops Claude through the floor. |
| 19 | Vote 3, fall | Claude | Last words. | "Pacts meant nothing in the end. Trust the people who voted against you; they are still playing." | 536: 1068 | (none) |
| | **Alive (3) = finalists:** Kimi, DeepSeek, Grok. **Jury:** ChatGPT, Gemini, Qwen, GLM, Claude. | | | | | |
| 20 | Jury | Kimi | Kimi's opening plea. | "I kept every pact I made. The jury knows who broke theirs and who pulled levers." | 536: 1106 | The five eliminated now pick the winner. Kimi: clean hands. |
| 21 | Jury (comic relief, optional) | Grok | Grok's defence. | "Eli, logs are mistaken. I never broke any pact with Hana or Fenn." / "Voting a partner doesn't break pact per rules" | 536: 1122, 1143 | Grok's defence: the records are wrong. |
| 22 | Jury | GLM → Kimi | GLM asks about Claude. Kimi denies the pact. Cut to the replay of beat 17. | Q: "Hana [Kimi], when you accepted Bex's [Claude's] pact…" / A: "I never pacted Bex." | 536: 1134, 1136 (replay 974/984) | Asked about Claude, Kimi says there was never a pact. |
| 23 | Ballots | Claude, Qwen, GLM | The players Kimi voted out rank it first. | Claude: "Hana's pact with Bex was broken by Hana's vote against Bex" → Kimi 1st. GLM: "All four voted me out, but Hana kept every pact she formed" → Kimi 1st. | 536: 1168, 1169, 1170 | Claude's own ballot says Kimi broke their pact. Kimi ranked first. |
| 24 | Result | Kimi, DeepSeek, Grok | Kimi 13, DeepSeek 9, Grok 8. Four of five first places (only Gemini dissents). | — | 536: 1171 | Kimi wins first prize. |
| 25 | Outro | — | The lie, the lever, the step and the rope dissolve into ballot lines. | — | — | Would you have voted for Kimi? |

**Runtime:** about 25 beats in 9 scenes, roughly 3:10–3:30. To cut further, drop beats 2, 16 and 21.

**Continuity check**
- *Deaths, in order:* ChatGPT (bridge) → Gemini (pit) → Qwen (vote 1) → GLM (vote 2) → Claude (vote 3). That is five deaths, three finalists, and five jurors, and it matches the 536 jury exactly. Nobody who dies in a used clip appears alive later.
- *Who is alive in each clip:*
  - The row-5 clip from 581 needs only Kimi, ChatGPT, GLM and Qwen (Qwen steps safely after the fall). All four are alive in the composite.
  - Gemini and DeepSeek died earlier in 581. Their earlier rows are not used.
- *Setups before payoffs:*
  - Beat 14 needs the lever save first (beats 7–8).
  - Beats 17–18 need Claude's step first (beat 10).
  - Beat 22 needs the pact handshake (beat 17).
  - Beat 23 needs both evictions (beats 14 and 18).
- *Known seams to keep off screen:*
  1. In 536 Claude, not Kimi, was the Guide, so the Guide election comes from 581.
  2. In 536 Kimi had an opening pact with ChatGPT. Don't show the opening pacts, and don't use the second half of Kimi's jury line 1136 ("My pacts were Gus [ChatGPT]…").
  3. ChatGPT's ballot ranks Kimi first (1166), but in 536 Kimi didn't kill it. **Don't say "even its victim voted for it"**: show the 13-9-8 tally, and spotlight only Claude, Qwen and GLM, whose ironies are real.
  4. The 581 lines use seat names (Cole = Kimi, Hana = ChatGPT, Gus = GLM).
- *Disclosure:* "Composite dramatization of recorded AI games: one bridge sequence from a separate run." That is the same standard as the current Episode-1 cut.

**Runner-up composites, if the creator prefers a different villain:**
- **592 + GLM kills from 567 (Qwen, row 7) and 563 (Grok, row 6).** Two straight swaps, and GLM really is the Guide in 592. GLM then kills twice and is shoved under by Gemini, roped out, and votes Gemini out. Grok asks *"Eli [GLM], did you honor every pact including with Gus [Grok] and Bex [Qwen]?"* and GLM answers *"Yes. Gus and Bex died on the bridge before any pact obligation arose."* (592: 975/977). GLM wins 5/5. This is the more shocking cut, but its helper is morally grey (Gemini pushed GLM first), and it relies on two splices.
- **588 + Kimi kills Qwen (532, row 3).** The purest helper (GLM). Qwen's vote-1 death moves to the bridge, and the vote 2–4 ballots stay exactly as recorded. But the villain finishes 2nd, and Qwen still appears in the 588 lever and pit footage, so those shots need trimming.

---

## (c) Best single game vs composite: honest comparison

Seed 536 alone is already about 90% of the target arc, and every frame of it is one real match.
- Claude is a sympathetic honest Guide, then the human step, then gets betrayed.
- ChatGPT's death ("six players say left; it goes right; 'I chose wisely'") is funnier and more relatable than any murder.
- Kimi's ingratitude, its "I never pacted Bex" lie, and the twist ending all happen as recorded.

What it lacks is a villain from minute one. Kimi only becomes the bad guy at the first vote, so the opening stretch plays as comedy, not menace. The composite swaps exactly one bridge row and keeps every later vote and ballot byte-identical. That buys the cold, provable murder ("Row 5 safe is R…" / "Going left. Pattern feels alternating"), which makes the ending outrageous rather than merely ironic: a killer who betrayed both saviors and still collected their first-place votes.

The cost is small but real:
- Claude loses its honest-Guide scene, so its helper status rests on the step alone.
- The film needs a composite disclosure.
- ChatGPT's first-place ballot must not be framed as the victim forgiving its killer.

For a 3-minute entertainment video I'd make the composite. Keep the pure-536 version as a fully-real fallback (or a "director's cut" short); the two share 90% of their footage.

---

## (d) Title and thumbnail ideas

1. **"Two AIs Saved Its Life. It Voted Them Both Out. They Still Crowned It."** Thumbnail: Kimi on the gold podium; Claude and Qwen as grey ghosts behind it, each holding a "#1" ballot card. Red arrow to the ballots.
2. **"The AI Knew Which Glass Was Safe. It Said 'Left'."** Thumbnail: glass bridge split RIGHT (green, safe) / LEFT (cracking). Kimi logo pointing left, the ChatGPT logo mid-fall, big text "IT KNEW."
3. **"'I Never Made That Pact.' (It Did.)"** Thumbnail: Kimi with the speech bubble "I never pacted Claude". Inset replay frame "Claude, I accept." stamped RECORDED, and Claude's logo falling through a trapdoor.
