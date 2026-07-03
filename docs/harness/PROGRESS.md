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
- Existing product guidance documents: `docs/PRODUCT_VISION.md` and `docs/QA_GATE.md`.
- Existing app support truth: single-block Linear Search Teaching is supported, Level 4 block-built Linear Search is partial, and Binary Search Teaching is not ready.

## Active Task
None.

## Next Best Action
Pick the highest-priority `not_started` feature in `docs/harness/FEATURE_LIST.json`, move only that feature to `active`, then implement within its allowed scope.

## Known Risks
- UI can drift toward generic dashboard patterns if design constraints are not checked.
- Learning flow quality depends on runtime state, generated code, visualization, and explanation staying synchronized.
- `src/App.tsx` is high-coupling and should not be casually edited.
- Visible-but-not-working learning features create fake success and must be avoided.
