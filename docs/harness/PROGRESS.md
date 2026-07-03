# Project Progress

## Current Verified State
- Last verified: 2026-07-04 (F000 design reset)
- Tests: 21/21 passing via `npm test`
- Build: passing via `npm run build` (pre-existing chunk-size warning only)
- Lint: passing via `npm run lint`
- Clean state: passing via `bash scripts/harness/clean-state.sh`
- Active feature: none (F000 done; F001/M1 is next)
- Current blocker: none

## Recently Completed
- [2026-05-21] Added repo-level harness docs and scripts for Codex/OpenCode/DeepSeek workflow.
- [2026-07-04] Consolidated stray git branches into `main`; committed the pending harness rewrite and workspace-zone UI relabel as separate commits.
- [2026-07-04] Created `docs/ROADMAP.md` (strategic milestone tracker, M0–M6) and linked `docs/harness/FEATURE_LIST.json` features to milestones. Added F000 (design reset) and F004 (trace scrubbing).
- [2026-07-04] Completed M0 / F000: flattened the runtime-state surface in `src/App.css` (removed gradients, floating-card shadows, glassmorphism, decorative pills) while keeping the block palette expressive and all learning-meaningful signals intact. Verified and browser-QA'd. F000 state = passing.
- Existing product guidance documents: `docs/PRODUCT_VISION.md` and `docs/QA_GATE.md`.
- Existing app support truth: single-block Linear Search Teaching is supported, Level 4 block-built Linear Search is partial, and Binary Search Teaching is not ready.

## Active Task
None.

## Next Best Action
See `docs/ROADMAP.md` for the full sequencing. M0 (F000) is done. The next milestone is
**M1 — Harden Linear Search Teaching** (`docs/harness/FEATURE_LIST.json` feature F001): make
the single-block Linear Search Teaching flow airtight against every QA_GATE edge case (empty
array, one item, first/last index, duplicate target, missing target), with Run and Step
reaching identical final state, Reset clearing runtime state, and no stale text across
level/mode switches. Move only F001 to `active`.

## Known Risks
- UI can drift toward generic dashboard patterns if design constraints are not checked.
- Learning flow quality depends on runtime state, generated code, visualization, and explanation staying synchronized.
- `src/App.tsx` is high-coupling and should not be casually edited.
- Visible-but-not-working learning features create fake success and must be avoided.
