# Agent Operating Rules

## Project
DSA Blocks Lab is a beginner-focused DSA learning app combining algorithm visualization, Blockly-style block programming, and guided learning flows.

## Required Startup Routine
Before editing code:
1. Read [docs/harness/BOOTSTRAP_CONTRACT.md](docs/harness/BOOTSTRAP_CONTRACT.md).
2. Read [docs/harness/PROGRESS.md](docs/harness/PROGRESS.md).
3. Read [docs/harness/FEATURE_LIST.json](docs/harness/FEATURE_LIST.json).
4. Read [docs/QA_GATE.md](docs/QA_GATE.md).
5. Run `bash scripts/harness/status.sh`.
6. Identify the single active task.
7. Do not edit until scope is clear.

## Work Rules
- WIP = 1. Work on one task only.
- Do not modify `src/App.tsx` unless explicitly required.
- Do not install packages unless explicitly approved.
- Do not do broad refactors.
- Do not change unrelated formatting.
- Do not mark work done unless verification passes.
- If a feature is visible, it must work or clearly say unsupported or partial.

## Verification
Before final report for implementation work:
- `npm test`
- `npm run build`
- `npm run lint`
- `bash scripts/harness/clean-state.sh`

## End-of-Session Routine
1. List changed files.
2. Record verification output.
3. Update [docs/harness/PROGRESS.md](docs/harness/PROGRESS.md).
4. Update [docs/harness/SESSION_HANDOFF.md](docs/harness/SESSION_HANDOFF.md).
5. Report risks honestly.
