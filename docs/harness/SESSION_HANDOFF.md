# Session Handoff

## Last Session Summary
Shipped M6a / F005 — the first slice of the Stage 2 LeetCode loop. A new "Problems" mode lets
the learner build an algorithm from blocks and Submit it to be graded against a set of test
cases, with a pass/fail results panel. The headline: the reuse-only bet held — `engine.ts`,
`blockly.ts`, and `learningSupport.ts` were not touched. Grading is a single pure function
(`gradeProgram`) that calls the existing `executeProgram` once per case.

## Active Feature
None. F000–F005 are done and marked `passing`. Next is F006 (M6b).

## How F005 works
- `src/dsa/types.ts`: `TestCase`, `Problem`, `CaseResult` types.
- `src/dsa/problems.ts`: `gradeProgram(instructions, cases)` (pure — runs `executeProgram` per
  case, compares final `resultIndex` to `expected`) and Problem 1 "Find the Target" (6 cases:
  found-middle/first/last, missing, empty, duplicate). `src/dsa/problems.test.ts` covers it.
- `src/App.tsx`: a third mode `'problems'`. `activeArray`/`activeTarget`/`allowedBlocks`/starter
  branch on it; the visualization runs `activeProblem.cases[0]` (F005 hardcodes case 0). A
  Submit button calls `submitProblem` → `gradeProgram` → `setGradeResults` → results panel.
  `refreshProgram` and `chooseMode` clear stale `gradeResults`.
- `src/App.css`: `.results-panel` / `.result-row` (pass=green, fail=red left border).

## Changed Files In Last Session
- `src/dsa/types.ts`, `src/dsa/problems.ts` (new), `src/dsa/problems.test.ts` (new)
- `src/App.tsx`, `src/App.css`
- `docs/ROADMAP.md`, `docs/harness/FEATURE_LIST.json`, `docs/harness/PROGRESS.md`,
  `docs/harness/SESSION_HANDOFF.md` (tracking)
- engine.ts / blockly.ts / learningSupport.ts: NOT touched (reuse-only, as scoped).

## Verification In Last Session
- `npm test`: 4 files, 48 tests passed (was 43; +5 problems.test).
- `npm run build`, `npm run lint`, `bash scripts/harness/clean-state.sh`: all passed.
- Browser QA: Problems mode shows the statement, loads the linear-search starter, case[0]
  drives the Run zone with real Teaching sync; Submit → results panel "6/6 passed" with correct
  per-row I/O (incl. empty-array case) and "All 6 test cases passed." feedback. Puzzle/Sandbox
  unchanged.
- KNOWN GAP: the failing-row UI (red rows) is unit-tested but was NOT exercised in-browser —
  the preview harness has no coordinate-click/key-press and Blockly's SVG editor ignores
  synthetic DOM events, so a broken program can't be scripted through the workspace. The fail
  path is asserted in problems.test (specific cases fail with real actual values); pass and fail
  rows share the same render mapping.

## Notes For The Next Session (F006 / M6b groundwork)
- F005 hardcodes the visualized case as `activeProblem.cases[0]` (`problemCase` in App.tsx).
  F006 generalizes this to a `selectedCaseIndex` state; the visualization runs the selected
  case, and clicking a results-panel row (especially a failing one) selects it. Then the
  learner steps/scrubs (M4 transport) through the failing case to see the divergence.
- Keep it reuse-only: engine/blockly/learningSupport stay forbidden for F006.
- Reminder: the F001 stale-switch guard sets `instructions` to [] briefly on mode/level change;
  a scripted rapid-click test can observe the transient empty program, but it settles correctly
  on normal navigation. Do not remove the guard.

## Open Risks
- Future sessions must check `git status --short` before editing.
- Do not mark a feature `passing` unless verification commands pass and evidence is recorded in `FEATURE_LIST.json`.
- The ~900kB JS bundle triggers a Vite chunk-size warning. Pre-existing, out of scope.
- Browser QA of Blockly-driven states (building/breaking programs) is not scriptable via the
  preview harness; rely on unit tests for program-shape-dependent behavior and browser QA for
  rendering/wiring.

## Next Suggested Action
Start M6b / F006 (debug-the-failure loop). Read `docs/STAGE_2_LEETCODE.md` and the F006 entry,
move only F006 to `active`, generalize the visualized case to a selectable index, and keep all
existing tests green.
