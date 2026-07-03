# Codex Workflow

## Roles
Codex is the planner, reviewer, and supervisor. OpenCode or DeepSeek can be used as bounded execution workers when a task is narrow enough.

The repo harness is the source of truth. Chat context is useful, but durable task state belongs in `docs/harness/`.

## Standard Session Start
1. Run `pwd`.
2. Run `git status --short`.
3. Run `bash scripts/harness/status.sh`.
4. Read `AGENTS.md`.
5. Read `docs/harness/BOOTSTRAP_CONTRACT.md`.
6. Read `docs/harness/PROGRESS.md`.
7. Read `docs/harness/FEATURE_LIST.json`.
8. Read `docs/QA_GATE.md`.

Then identify:
- current repo state
- active feature, if any
- highest-priority next feature
- verification commands
- relevant files
- files that must not be touched

## Supervisor and Worker Loop
1. Human defines product direction.
2. Codex turns it into one small task.
3. The feature moves to `active`.
4. Codex edits directly or delegates a bounded worker task.
5. Worker edits only allowed files.
6. Codex reviews the diff.
7. Codex runs verification.
8. Codex records evidence and handoff state.
9. Result is `PASS`, `FIX`, or `REJECT`.

## Worker Prompt Contract
Worker tasks must include:
- one specific task
- allowed files
- forbidden files
- no package installs
- no broad refactors
- correctness contract
- availability contract
- verification commands
- final report format

Workers must stop and report a blocker if the task cannot be completed within the allowed scope.

## Review Verdicts
- `PASS`: behavior is implemented, verification passed, evidence is recorded.
- `FIX`: implementation is close but needs more scoped work.
- `REJECT`: the change violates scope, correctness, availability, or verification requirements.
