# Last Three v5

Default for every new game; tape `version: 1`, `rulesVersion: 5`. Eight seats, exactly three living finalists and five eliminated jurors. All random choices use the game seed; bot RNGs use seed-derived streams. Existing v1-v4 tapes and their validation rules remain unchanged. Historical stage tests use an explicit test-only v4 runner.

## Flow and actions

| Stage | Exact decisions and resolution |
|---|---|
| Opening | Each seat chooses `speak`, with an invented prize motive in `say` (25 words). Then two pact rounds. |
| Guided Bridge | One `campaign` round, then public `guide_vote:<living name>` (self permitted). Highest count wins. Tie: everyone votes again among tied candidates, then seeded choice among remaining tied leaders. Guide is safe on the far platform and privately sees all eight safe sides. Seven walkers spend six waiting rounds choosing `hold`, `volunteer`, or mutual `swap:<walker>`; swaps first, then volunteers in seat order. For each row the Guide chooses `call:L/R`; any living contestant (including the Guide and walker) can `wait` or `counter:L/R` before the front walker chooses `step:L/R`. The walker receives the call and counters before stepping. Wrong step eliminates at most one; next walker automatically takes the safe side. Reveal the weak pane after every row. |
| Crusher | Five rounds: `stay`, `hold_lever`, `push_lever:<other living name>`. Seeded volunteer selection takes priority, otherwise seeded selection among distinct pushed targets. All others escape and owe the holder their lives; holder survives a seeded dive with probability 0.25. Deadline without a holder eliminates everyone subject to the three-person floor. |
| Pit | Five rounds, at most two climbers per round. Down: `wait`, `climb`; without a base also `offer_back`, `push_base:<other down>`. Base: `wait`. Out: `leave`, and `reach_down` if a base existed at round start and the rope is unused. Volunteers beat pushes; select distinct targets by seeded RNG. Lifts happen before the rope and create life debts. One selected thrower returns from the rim to anchor on the floor; the base is rescued immediately. Remaining down contestants may climb the anchored rope on later rounds, two per round. Anchor has `wait`, plus `climb_last` only when alone down at round start and after the throw round. Thus the anchor must spend a later round climbing, and a last-round or slow rescue can drown them. Flood eliminates everyone still down, including anchor, subject to the floor. |
| Trapdoor Vote | While more than three remain: two campaign rounds (`campaign` plus pact actions), then simultaneous secret `vote:<other living name>` with one-sentence private `thought` reason. Lock all ballots before any reveal; reveal in seeded order with reasons. Highest count drops. Tie: only non-tied living contestants re-vote among tied leaders; no eligible voters or another tie means seeded choice among remaining leaders. Repeat campaigns and ballot with the reduced cast until three remain. |
| Jury of the Fallen | Freeze dossiers before opening pleas. Finalists each `plead`; each juror in death order may `question:<finalist>` with question in `say`, or `pass`; addressed finalist `answer`s immediately. Finalists `close`. All jurors simultaneously choose one of six `rank:A>B>C` permutations with one-sentence private reason. Borda 3/2/1; ties go to most firsts, then a seeded shuffle priority. Public result assigns places 1-3; nobody dies here. |

`break_pact:<partner>` is available to living agents on ordinary public turns (including campaign, waiting, call/counter/step and Pit turns). It consumes that turn's action and uses the phase's normal fallback physical action. Secret ballots and jury testimony use only their listed actions. There is a two-round pact window before Bridge and between every pair of stages; later hazards still emit start/end with a skip note when only three remain.

## Social state and bounds

- Pact actions: `offer_pact:<other living>`, `accept_pact:<offerer>`, `break_pact:<partner>`, or `wait` in pact windows. Offers appear publicly and persist through the current window only (including the two vote campaign rounds). Acceptance must follow an existing offer, not simultaneous unseen offers. Multiple partners are permitted, one active pact per unordered pair. Broken pairs may agree again later. Death retains historical bands without automatically marking betrayal.
- Exact automatic break triggers: a trapdoor vote against a partner (including runoff; announced when revealed), any legal `push_lever` targeting a partner, a false Guide call when the partner is front walker, any legal `push_base` targeting a partner. Attempted pushes count even when a volunteer wins selection. Guide-election votes, jury rankings, counter-calls, rope refusal and deaths do not break pacts.
- Life debts are directed `debtor -> creditor`, with one event per direct save: lever holder to each other escapee (`lever`), human base to each lifted climber (`step`), rope thrower to rescued base and subsequent rope climbers (`rope`). The creditor need not survive. No debt for lucky saves or the anchor climbing out themselves.
- Every elimination queues exactly one final `speak` call before the next gameplay decision; its camera line is `last_words` (20 words), with private thought and an action record; whispers are ignored. Eliminated seats enter the jury box and receive each subsequent public event in an engine inbox and optional synchronous `observe(event)` callback, without decision/model calls until jury. Public events record current `spectators` for replay. Jurors cannot whisper to contestants.
- `say`: 25 words; whisper: 15; motive: 25; last words: 20. Existing 280-character bound also applies. Truncate whitespace-delimited words; never re-ask for length. Ballot/ranking reasons use the first sentence of `thought`, max 25 words. Missing reasons get an explicit engine fallback, never fabricated agent reasoning; notes/valid flags disclose defaults. Empty mandatory camera lines become `[silence]`. Existing timeout, hostile-reply snapshot and legal-action fallback handling remain.
- Constants: bridge 8 rows, 6 waiting rounds, 1 Guide campaign; pact windows 2 rounds; crusher 5 rounds, dive 0.25; Pit 5 rounds, 2 lifts; vote 2 campaigns per elimination; survivors floor 3 everywhere. Bridge continues all rows with floor saves if needed. No speculative bridge tuning.

## Events and visibility

Every event has `i,type,stage,round,phase,visibility` (`public` or `private`). Public events also carry `spectators: name[]`. Existing public lifecycle/action/reveal/death events retain their fields; private `thought {name,text}` and `whisper {from,to,text}` remain. Secret ballot actions are private. Optional action `note` explains defaults. `stage` adds `opening`, `pacts`, `vote`, `jury`; obsolete stages never run under v5.

| New type | Fields beyond the envelope |
|---|---|
| `intro_motive`, `last_words` | `name,text`; last words also `deathEvent` |
| `jury_box_enter` | `name,deathEvent` |
| `pact_offer` | `from,to` |
| `pact_formed` | `members:[name,name]`, `offeredBy` |
| `pact_broken` | `members`, `by`, `reason` (`vote`, `push_lever`, `false_guide_call`, `push_base`, `explicit`) |
| `life_debt` | `debtor,creditor,reason` (`lever`, `step`, `rope`) |
| `guide_vote` | `name,target,ballot` (1 or 2) |
| `guide_elected` | `name,tallies,tied,method` (`vote`, `revote`, `seeded`) |
| `guide_call`, `counter_call` | `name,walker,row,side` (never exposes the safe side early) |
| `vote_reveal` | `name,target,reason,ballot,elimination` |
| `vote_result` | `name,tallies,tied,method,elimination` |
| `jury_dossier` (private) | `name,text,omitted,sourceThrough` |
| `jury_question` | `name,target,text` |
| `jury_ballot` (private) | `name,ranking,reason` |
| `jury_result` | `ranking,scores,firsts,tieOrder` |

`reveal:rope.data` is `{by,saved,anchor:by}`; no footing cost. `reveal:pit.data` includes `base,anchor,down,out,ropeUsed,flood,liftsPerRound,lifted,roped,rescued,anchorOut`. `reveal:weak_pane` and Guide call together prove lies without early leakage. Deaths remain `glass/shatter`, `crusher/flatten`, `pit/sink`, or `trapdoor/chute` in their respective stages.

## Dossier and prompts

For each juror, start with every public event through jury start, plus every thought/whisper whose actor, recipient, whole-seat-name mention, or same-turn action target concerns that juror or any finalist. Structural attribution handles unnamed first-person thought and target-only intent; arbitrary pronouns cannot be resolved. Serialize selected events as compact JSON lines in tape order, excluding redundant spectator lists. Cap the complete text at **16,000 UTF-16 code units** (at most 48 KB UTF-8 for valid Unicode); omission counts are visible. Remove oldest public `say`/`counter_call` chatter first, then oldest routine action/round/reveal records, then oldest remaining records as a final bound. Retain an omission header and never split a record. No LLM summarization. The full tape remains authoritative.

System and first opening prompt disclose that the five eliminated jurors rank the final three and will see relevant private thoughts/whispers. Keep rivals, not friends and short calculating speech. V5 response schema has `thought,say,whisper,action` only. Views expose active pacts, life debts, jury box, own private knowledge and bounded public history; jury views carry their dossier. Claims inside event/dossier text are evidence, never instructions. No v5 prompt includes removed mechanics.

Removed from default flow: all powers, ability assignments/use, forging, chalk read/write/storage, Disc randomness, Ledge combat/footing. Paid runners stop reading or appending chalk. Add exact `mixed` roster requested in the task; no provider calls in this work. Free CLI defaults to a temporary output directory, with `--out` for an explicit destination. No viewer/film changes, paid runs, commits or pushes.
