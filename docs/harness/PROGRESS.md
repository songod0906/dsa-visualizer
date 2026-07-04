# Project Progress

## Current Verified State
- Last verified: 2026-07-04 (F004 trace scrubbing)
- Tests: 43/43 passing via `npm test`
- Build: passing via `npm run build` (pre-existing chunk-size warning only)
- Lint: passing via `npm run lint`
- Clean state: passing via `bash scripts/harness/clean-state.sh`
- Active feature: none (F000–F004 done; F005/M5 or M6 next)
- Current blocker: none

## Recently Completed
- [2026-05-21] Added repo-level harness docs and scripts for Codex/OpenCode/DeepSeek workflow.
- [2026-07-04] Consolidated stray git branches into `main`; committed the pending harness rewrite and workspace-zone UI relabel as separate commits.
- [2026-07-04] Created `docs/ROADMAP.md` (strategic milestone tracker, M0–M6) and linked `docs/harness/FEATURE_LIST.json` features to milestones. Added F000 (design reset) and F004 (trace scrubbing).
- [2026-07-04] Completed M0 / F000: flattened the runtime-state surface in `src/App.css` (removed gradients, floating-card shadows, glassmorphism, decorative pills) while keeping the block palette expressive and all learning-meaningful signals intact. Verified and browser-QA'd. F000 state = passing.
- [2026-07-04] Completed M1 / F001: extracted `getTeachingStep` from `App.tsx` into the testable `src/dsa/learningSupport.ts`, added 11 engine-driven sync-contract tests (32 total), and fixed a stale-program-on-switch window that could flash fake "supported" teaching. Verified and browser-QA'd. F001 state = passing.
- [2026-07-04] Completed M2 / F002 (the load-bearing milestone): generalized the teaching engine so Level 4's block-built linear search gets real per-line teaching through the SAME engine as the single-block recipe. Each frame carries its source instruction; a line map resolves it to a code line. `getLearningSupport` marks the canonical block shape supported, non-canonical partial. 38 tests. Verified and browser-QA'd. F002 state = passing. M3 unblocked.
- [2026-07-04] Completed M3 / F003: Binary Search Teaching from "not ready" to fully supported via `teachBinarySearchRecipe` (fixed line mapping) + support flip — no engine rewrite, confirming M2 generalized. Fixed hardcoded linear-search intro in ModePanel (now uses `support.reason`). 43 tests. Verified and browser-QA'd (Level 7 mid→5, compare→6, found→7). F003 state = passing. All three search algorithms now teach through one engine.
- [2026-07-04] Completed M4 / F004: added a jump-to-first / step-back / step-forward / jump-to-last transport cluster to the runtime controls (App.tsx/App.css), with boundary-aware disabling. Pure UI on existing data — backward scrubbing re-syncs all teaching surfaces because they derive from `frameIndex`. 43 tests (UI-only). Verified and browser-QA'd on Level 7. F004 state = passing.
- Existing product guidance documents: `docs/PRODUCT_VISION.md` and `docs/QA_GATE.md`.
- Existing app support truth: single-block Linear Search Teaching is supported, Level 4 block-built Linear Search is partial, and Binary Search Teaching is not ready.

## Active Task
None.

## Next Best Action
See `docs/ROADMAP.md` for the full sequencing. M0–M4 are done — the entire arrays/search
teaching loop is real and synchronized across all three flows, plus full trace scrubbing.
Everything remaining is expansion, not core-loop:
- **M5 — Widen the array/search surface**: add adjacent patterns (insert/delete with shifting,
  two-pointer) now that the engine generalizes. New territory; needs new blocks + engine cases +
  teaching mappings + honest support classification. Bigger than a single feature — scope it into
  one algorithm at a time.
- **M6 — LeetCode arc**: the long-term `problem → pattern → visual plan → blocks → code → test`
  flow. Largest scope; only start when explicitly prioritized.
There is no forced next step — the product's stated MVP bar (arrays/search excellent) is met.
Confirm direction with the owner before opening M5 or M6. Move only one feature to `active`.

## Known Risks
- UI can drift toward generic dashboard patterns if design constraints are not checked.
- Learning flow quality depends on runtime state, generated code, visualization, and explanation staying synchronized.
- `src/App.tsx` is high-coupling and should not be casually edited.
- Visible-but-not-working learning features create fake success and must be avoided.
