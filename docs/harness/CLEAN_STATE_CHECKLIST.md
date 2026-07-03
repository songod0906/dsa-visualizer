# Clean State Checklist

Use this before ending a session.

## Repo State
- `git status --short` reviewed.
- Changed files are all intentional.
- User-owned unrelated changes are preserved.
- No package files changed unless explicitly approved.

## Feature State
- At most one feature is `active`.
- No feature is `passing` without evidence.
- Blockers are recorded if work cannot finish.

## Verification
- `npm test` run.
- `npm run build` run.
- `npm run lint` run.
- `bash scripts/harness/clean-state.sh` run for implementation work.

## Manual QA
For visible UI work:
- affected mode or level opened in browser
- target flow checked
- reset checked
- switching levels or modes checked
- stale explanation/highlight checked

## Handoff
- `docs/harness/PROGRESS.md` updated.
- `docs/harness/SESSION_HANDOFF.md` updated.
- final report includes changed files, behavior changes, verification results, manual QA, risks, and verdict.
