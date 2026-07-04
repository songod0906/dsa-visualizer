# Session Handoff

## Last Session Summary
Executed M3 / F003: turned Binary Search Teaching from "not ready" into fully supported,
per-line synchronized teaching. Crucially this needed NO engine rewrite — binary rode the
same rails as the linear recipe, which is the practical proof that M2's generalization held.
With M3 done, all three search flows (single-block linear, block-built linear, binary) teach
through one engine.

## Active Feature
None. F000 (M0), F001 (M1), F002 (M2), F003 (M3) are done and marked `passing`. Next is
F004 (M4) — or M5 if adding algorithms is preferred over control polish.

## How M3 works
- `learningSupport.ts` `isBinarySearchProgram` + a `getLearningSupport` branch mark the
  single-block `binarySearch` recipe as fully supported.
- `teachBinarySearchRecipe` is a fixed line mapping for the 11-line binary block (mirrors
  `teachLinearSearchRecipe`): note→1, left/right setup→2/3, mid pick→5, compare→6, found→7,
  left narrow→9, right narrow→11, not found→12. Setup vs in-loop pointer moves are told
  apart by message shape ("Move …" vs "… moves to …"), guarded by tests.
- `App.tsx` `ModePanel` now shows `support.reason` as the teaching intro instead of a
  hardcoded linear-search string (that bug would have mislabeled binary as "Linear search…").
  The stale hardcoded partial/unsupported strings were removed too (support.reason covers them).

## Changed Files In Last Session
- `src/dsa/learningSupport.ts` (isBinarySearchProgram, support branch, teachBinarySearchRecipe, dispatch)
- `src/dsa/learningSupport.test.ts` (binary sync-contract tests; flipped the old "binary unsupported" test)
- `src/App.tsx` (ModePanel intro from support.reason; removed unused linearSearchTeachingIntro)
- `docs/ROADMAP.md`, `docs/harness/FEATURE_LIST.json`, `docs/harness/PROGRESS.md`,
  `docs/harness/SESSION_HANDOFF.md` (tracking)
- engine.ts / blockly.ts / types.ts: NOT changed this milestone (M3 reused the M2 engine as-is).

## Verification In Last Session
- `npm test`: 3 files passed, 43 tests passed (was 38; +6 binary tests, 1 flipped).
- `npm run build`: passed with existing Vite chunk-size warning only.
- `npm run lint`: passed.
- `bash scripts/harness/clean-state.sh`: passed.
- Browser QA (Level 7): Teaching intro shows the binary text; stepping highlights mid→line 5,
  compare→line 6 with "middle smaller, discard left half" synced to 14<23, found→line 7
  (return mid) in 2 comparisons; left/mid/right pointers and discarded-cell window render.
  Level 5 linear intro regression re-verified.

## Notes For The Next Session
- M4 (F004, trace scrubbing): the full frame trace is already stored in `frames` and the
  trace rows already set `frameIndex` on click (see `App.tsx`), so transport buttons
  (step-back / jump-to-start / jump-to-end) are UI on existing data. `stepOnce` already exists;
  add the inverse and the two jumps, wire into the `.controls` row. Mostly App.tsx/App.css.
- M5 (widen array/search surface) is also unblocked now that the engine generalizes.
- Reminder: the F001 stale-switch guard briefly sets `instructions` to [] on level change; a
  scripted rapid-click test can observe that transient empty program, but it settles correctly
  on normal navigation. Do not remove the guard (it prevents a fake-support flash).

## Open Risks
- Future sessions must check `git status --short` before editing.
- Do not mark a feature `passing` unless verification commands pass and evidence is recorded in `FEATURE_LIST.json`.
- The ~896kB JS bundle triggers a Vite chunk-size warning. Pre-existing, out of scope; revisit only if it becomes a real load-time problem.

## Next Suggested Action
Start M4 / F004 (trace scrubbing) or M5 (widen surface). Read `docs/ROADMAP.md`, move only
one feature to `active`, and keep all F001–F003 teaching-sync tests green.
