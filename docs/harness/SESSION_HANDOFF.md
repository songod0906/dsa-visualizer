# Session Handoff

## Last Session Summary
Executed M2 / F002, the load-bearing milestone: generalized the teaching engine so Level 4's
block-built linear search gets real, per-line synchronized teaching through the SAME engine as
the single-block recipe — not a bespoke Level-4 path. This proves the architecture generalizes,
which is the precondition the rest of the roadmap depended on.

## Active Feature
None. F000 (M0), F001 (M1), F002 (M2) are done and marked `passing`. Next is F003 (M3).

## How M2 works (read before M3)
- `ExecutionEvent` gained an optional `source?: ProgramInstruction` field (`src/dsa/types.ts`).
  `engine.ts` stamps each frame's event with the instruction it is executing (the single-block
  `linearSearch`/`binarySearch` recipe cases deliberately leave it undefined).
- `blockly.ts` `buildProgramCode(instructions)` returns `{ code, lineOf }` where `lineOf` is a
  `Map<ProgramInstruction, number>` (1-indexed primary line per instruction, incl. nested),
  keyed by object identity. `instructionsToPython` is now a thin wrapper over it.
- `learningSupport.ts` `getTeachingStep` dispatches: `isLinearSearchProgram` -> fixed-line
  `teachLinearSearchRecipe`; otherwise `teachBlockProgram`, which reads `frame.event.source`,
  looks up its line via `buildProgramCode`, and explains by event kind. `isSupportedBlockLinearSearch`
  gates `getLearningSupport` to mark the canonical block shape supported (non-canonical stays partial).

## Changed Files In Last Session
- `src/dsa/types.ts` (optional `source` on ExecutionEvent — scope expansion, see DECISIONS.md)
- `src/dsa/engine.ts` (thread source instruction through push + helpers)
- `src/dsa/blockly.ts` (`buildProgramCode` + line-tracking emitter; `instructionsToPython` wraps it)
- `src/dsa/learningSupport.ts` (recognizer + recipe/block dispatch in getTeachingStep)
- `src/dsa/blockly.test.ts`, `src/dsa/learningSupport.test.ts` (line-map + block sync tests)
- `docs/ROADMAP.md`, `docs/harness/FEATURE_LIST.json`, `docs/harness/DECISIONS.md`,
  `docs/harness/PROGRESS.md`, `docs/harness/SESSION_HANDOFF.md` (tracking + scope decision)
- App.tsx: NOT changed this milestone (getTeachingStep/getLearningSupport signatures held).

## Verification In Last Session
- `npm test`: 3 files passed, 38 tests passed (was 32; +6 M2 tests).
- `npm run build`: passed with existing Vite chunk-size warning only.
- `npm run lint`: passed.
- `bash scripts/harness/clean-state.sh`: passed.
- Browser QA: Level 4 Teaching steps through lines 2 (for) -> 3 (compare) -> 4 (if, correct
  true/false explanation) -> 5 (return i on found), all synced with the active cell, pointer,
  trace, and explanation. Level 5 single-block regression re-verified (line 2 on first loop step).

## Notes For The Next Session (M3 groundwork)
- Binary Search Teaching (F003) should mirror the linear recipe: add `teachBinarySearchRecipe`
  with a fixed line mapping for the 11-line binary block, and flip `getLearningSupport` to mark
  `[{binarySearch}]` supported. The engine already emits left/mid/right moves + compares.
- Binary Search binary-window visualization (discarded cells) is already wired in ArrayBoard
  (`hasBinaryWindow`), so the visual half largely exists; the gap is the code-line + explanation
  mapping and honest support classification.
- A scripted rapid-click sequence can transiently observe an empty program right after a
  level switch (F001 guard sets instructions to [] until the workspace reloads). This settles
  correctly on any normal navigation and is not a product bug — do not "fix" it by removing the
  guard, which prevents a worse fake-support flash.

## Open Risks
- Future sessions must check `git status --short` before editing.
- Do not mark a feature `passing` unless verification commands pass and evidence is recorded in `FEATURE_LIST.json`.
- The ~896kB JS bundle triggers a Vite chunk-size warning. Pre-existing, out of scope; revisit only if it becomes a real load-time problem.

## Next Suggested Action
Start M3 / F003. Read `docs/ROADMAP.md` M3 and the F003 entry, move only F003 to `active`, then
add `teachBinarySearchRecipe` + supported classification for the binary recipe, keeping all
F001/F002 tests green.
