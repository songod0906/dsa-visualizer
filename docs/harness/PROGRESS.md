# Project Progress

## Current Verified State
- Last verified commit: unknown
- Tests: passing on 2026-05-21 via `bash scripts/harness/verify.sh`
- Build: passing on 2026-05-21 via `bash scripts/harness/verify.sh`
- Lint: passing on 2026-05-21 via `bash scripts/harness/verify.sh`
- Active feature: none
- Current blocker: none

## Recently Completed
- [2026-05-21] Added repo-level harness docs and scripts for Codex/OpenCode/DeepSeek workflow.
- [2026-07-04] Consolidated stray git branches into `main`; committed the pending harness rewrite and workspace-zone UI relabel as separate commits.
- [2026-07-04] Created `docs/ROADMAP.md` (strategic milestone tracker, M0–M6) and linked `docs/harness/FEATURE_LIST.json` features to milestones. Added F000 (design reset) and F004 (trace scrubbing).
- Existing product guidance documents: `docs/PRODUCT_VISION.md` and `docs/QA_GATE.md`.
- Existing app support truth: single-block Linear Search Teaching is supported, Level 4 block-built Linear Search is partial, and Binary Search Teaching is not ready.

## Active Task
None.

## Next Best Action
See `docs/ROADMAP.md` for the full sequencing. The next milestone is **M0 — Design reset**
(`docs/harness/FEATURE_LIST.json` feature F000): strip gradients/shadows/pill-badges from the
runtime-state surface before further UI work compounds the current design debt. After F000,
move to F001 (harden Linear Search Teaching). Move only one feature to `active` at a time.

## Known Risks
- UI can drift toward generic dashboard patterns if design constraints are not checked.
- Learning flow quality depends on runtime state, generated code, visualization, and explanation staying synchronized.
- `src/App.tsx` is high-coupling and should not be casually edited.
- Visible-but-not-working learning features create fake success and must be avoided.
