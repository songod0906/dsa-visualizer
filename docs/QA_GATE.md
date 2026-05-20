# QA Gate v0

Use this gate before marking DSA Blocks Lab implementation work as `PASS`.

## Task Summary

State what changed in one sentence. Name the affected level, mode, algorithm, or helper.

## Scope Control

Confirm:
- no package installs unless approved
- no broad refactors
- no unrelated formatting churn
- no unrelated levels changed
- no engine, Blockly, or UI behavior changed outside the task scope

## Correctness Contract

Algorithm behavior must remain correct:
- Run and Step must reach the same final state.
- Reset must clear runtime state.
- Switching modes or levels must not leak stale state.
- Generated code, runtime trace, and visualization must describe the same operation.

## Feature Availability Contract

If a feature is visible, it must work correctly or clearly say partial/unsupported.

Never show:
- fake Teaching support
- fake code highlights
- fake block highlights
- fake explanations
- stale teaching text from another level or mode

## Edge Cases

For search work, consider:
- target found
- target missing
- empty array
- one-item array
- first item
- last item
- duplicate target
- sorted array assumptions for Binary Search

## Implementation Instructions

Prefer small, testable changes:
- pure helpers for support classification
- focused tests for engine/parser/support behavior
- minimal UI edits for visible behavior
- browser smoke for visual changes

Do not add LeetCode import, arbitrary Blockly-program support, or new algorithm families unless explicitly scoped.

## Verification Prompt

Before final response, run:

```bash
npm test
npm run build
npm run lint
```

For UI work, manually check the affected screen in the browser and report what was observed.

## Manual QA Checklist

- Teaching Mode shows real support only where wired.
- Unsupported Teaching clearly says partial/unsupported.
- Exploration remains usable for runnable levels.
- Code highlight matches the current operation.
- Explanation matches actual runtime behavior.
- Level switching resets stale highlight/explanation state.
- Puzzle/Sandbox navigation still works.
- UI remains concise and does not over-explain itself.
