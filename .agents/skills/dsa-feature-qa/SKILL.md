---
name: dsa-feature-qa
description: Use when reviewing or changing Teaching Mode, Exploration Mode, highlighting, explanations, support states, runtime synchronization, or related tests.
---

# DSA Feature QA

Use this skill for feature review, stability fixes, and support-state changes.

## False Promise Checks

Verify:
- no fake support
- no fake code highlights
- no fake explanations
- no stale highlights after switching levels or modes
- no stale teaching text crossing into Exploration Mode
- unsupported features do not look supported

If a feature is visible, it must work correctly or clearly say partial/unsupported.

## Synchronization Checks

Confirm the current step lines up across:
- runtime event
- visualization state
- generated code
- active code line
- explanation
- trace item

Run, Step, and Reset must behave consistently.

## Review Workflow

1. Inspect `git diff` before judging.
2. Identify the actual behavior surface touched.
3. Check whether tests cover the risk.
4. Run `npm test`, `npm run build`, and `npm run lint`.
5. Use browser smoke for visible behavior.

## Verdict

Report:
- changed files
- issues found or fixed
- verification results
- remaining risks
- `PASS`, `FIX`, or `REJECT`
