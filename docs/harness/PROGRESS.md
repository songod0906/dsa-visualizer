# Project Progress

## Current Verified State
- Last verified: 2026-07-04 (F002 teaching-engine generalization)
- Tests: 38/38 passing via `npm test`
- Build: passing via `npm run build` (pre-existing chunk-size warning only)
- Lint: passing via `npm run lint`
- Clean state: passing via `bash scripts/harness/clean-state.sh`
- Active feature: none (F000 + F001 + F002 done; F003/M3 is next)
- Current blocker: none

## Recently Completed
- [2026-05-21] Added repo-level harness docs and scripts for Codex/OpenCode/DeepSeek workflow.
- [2026-07-04] Consolidated stray git branches into `main`; committed the pending harness rewrite and workspace-zone UI relabel as separate commits.
- [2026-07-04] Created `docs/ROADMAP.md` (strategic milestone tracker, M0–M6) and linked `docs/harness/FEATURE_LIST.json` features to milestones. Added F000 (design reset) and F004 (trace scrubbing).
- [2026-07-04] Completed M0 / F000: flattened the runtime-state surface in `src/App.css` (removed gradients, floating-card shadows, glassmorphism, decorative pills) while keeping the block palette expressive and all learning-meaningful signals intact. Verified and browser-QA'd. F000 state = passing.
- [2026-07-04] Completed M1 / F001: extracted `getTeachingStep` from `App.tsx` into the testable `src/dsa/learningSupport.ts`, added 11 engine-driven sync-contract tests (32 total), and fixed a stale-program-on-switch window that could flash fake "supported" teaching. Verified and browser-QA'd. F001 state = passing.
- [2026-07-04] Completed M2 / F002 (the load-bearing milestone): generalized the teaching engine so Level 4's block-built linear search gets real per-line teaching through the SAME engine as the single-block recipe. Each frame carries its source instruction; a line map resolves it to a code line. `getLearningSupport` marks the canonical block shape supported, non-canonical partial. 38 tests. Verified and browser-QA'd. F002 state = passing. M3 unblocked.
- Existing product guidance documents: `docs/PRODUCT_VISION.md` and `docs/QA_GATE.md`.
- Existing app support truth: single-block Linear Search Teaching is supported, Level 4 block-built Linear Search is partial, and Binary Search Teaching is not ready.

## Active Task
None.

## Next Best Action
See `docs/ROADMAP.md` for the full sequencing. M0/M1/M2 are done. The next milestone is
**M3 — Binary Search on the shared engine** (`docs/harness/FEATURE_LIST.json` feature F003):
turn Binary Search Teaching from "not ready" into real teaching. The single-block
`binarySearch` is a recipe (one instruction → 11-line block), so it most likely wants a
fixed-line mapping `teachBinarySearchRecipe` mirroring `teachLinearSearchRecipe`, plus
flipping `getLearningSupport` to mark the binary recipe supported. The engine already emits
left/mid/right pointer moves and compares. Keep all F001/F002 tests green. Move only F003 to
`active`.

## Known Risks
- UI can drift toward generic dashboard patterns if design constraints are not checked.
- Learning flow quality depends on runtime state, generated code, visualization, and explanation staying synchronized.
- `src/App.tsx` is high-coupling and should not be casually edited.
- Visible-but-not-working learning features create fake success and must be avoided.
