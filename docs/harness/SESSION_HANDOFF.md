# Session Handoff

## Last Session Summary
Shipped M6b / F006 — the debug-the-failure loop. Test-case rows in the results panel are now
clickable and load their case into the Run zone; Submit auto-loads the first failing case; the
learner scrubs through it (M4 transport) with full teaching sync to see exactly where the
algorithm diverges. This closes the Stage 2 loop `test feedback → visual debug`. Reuse-only
held again: engine/blockly/learningSupport untouched.

## Active Feature
None. F000–F006 are done and marked `passing`. Next is F007 (M6c).

## How F006 works
- `src/dsa/problems.ts`: added pure `firstFailingIndex(results)` (index of first failing case,
  -1 if all pass), unit-tested in `problems.test.ts`.
- `src/App.tsx`: `selectedCaseIndex` state + `safeCaseIndex` clamp; the visualized case is now
  `activeProblem.cases[safeCaseIndex]` (was hardcoded `[0]`). Results rows are `<button>`s
  calling `selectCase(index)` (sets the case, resets frameIndex, stops running). `submitProblem`
  auto-loads the first failing case via `firstFailingIndex`. `chooseMode` resets the selection.
- `src/App.css`: `.result-row` is now a full-width clickable button with `:hover` and a
  `.selected` (green-border) state.

## Changed Files In Last Session
- `src/dsa/problems.ts`, `src/dsa/problems.test.ts`
- `src/App.tsx`, `src/App.css`
- `docs/ROADMAP.md`, `docs/harness/FEATURE_LIST.json`, `docs/harness/PROGRESS.md`,
  `docs/harness/SESSION_HANDOFF.md`
- engine.ts / blockly.ts / learningSupport.ts / types.ts: NOT touched (reuse-only).

## Verification In Last Session
- `npm test`: 50 tests passed (was 48; +2 firstFailingIndex).
- `npm run build`, `npm run lint`, `bash scripts/harness/clean-state.sh`: all passed.
- Browser QA: Submit → results heading "click one to debug it"; clicking the target-99 row
  loads that case (target-pill 99, 14-step trace, row highlighted); jump-to-last → step 14/14,
  line 5 return -1, result -1, 6 comparisons, explanation synced. Clicking the [7,7,7] row
  loads target 7 (4-step trace), stable. No console errors.
- LIMITATION: the auto-jump-to-first-FAILING-case can't be shown in-browser (correct starter
  passes all cases; a broken program can't be scripted through Blockly via the preview harness).
  Its two pieces are each verified: `selectCase` loading (browser) + `firstFailingIndex` (unit
  test). A one-off frameIndex race was seen under rapid scripted evals (frames recompute on
  case change); not reproducible in normal use — jump-to-end holds steady across reads.

## Notes For The Next Session (F007 / M6c groundwork)
- `activeProblem` is hardcoded to `problems[0]` in App.tsx. F007 adds a `problemIndex` state and
  a problem picker in the Problems-mode lesson strip, plus Problem 2 ("Search a Sorted Array",
  binary) in `problems.ts` with sorted cases. Switching problems must reset selection/results
  and reload the problem's starter (mirror `chooseMode`/`chooseLevel` resets, incl. the
  `setInstructions([])` stale-switch guard).
- The binary problem's `starterBlocks` should be `'binarySearch'` and `allowedBlocks` the binary
  set; grading is unchanged (gradeProgram already algorithm-agnostic).
- Keep it reuse-only: engine/blockly/learningSupport stay forbidden for F007.

## Open Risks
- Future sessions must check `git status --short` before editing.
- Do not mark a feature `passing` unless verification commands pass and evidence is recorded in `FEATURE_LIST.json`.
- The ~900kB JS bundle triggers a Vite chunk-size warning. Pre-existing, out of scope.
- Browser QA of Blockly-driven states (building/breaking programs) is not scriptable via the
  preview harness; rely on unit tests for program-shape-dependent behavior.

## Next Suggested Action
Start M6c / F007 (second problem + polish). Read `docs/STAGE_2_LEETCODE.md` and the F007 entry,
move only F007 to `active`, add Problem 2 + a problem picker, and keep all existing tests green.
