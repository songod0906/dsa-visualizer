---
name: dsa-learning-flow
description: Use when adding or changing DSA lessons, puzzle levels, sandbox flows, algorithm explanations, Teaching/Exploration behavior, or future LeetCode-style problem breakdown.
---

# DSA Learning Flow

Use this skill for changes that affect how learners understand or build algorithms.

## Priority Order

1. Make Linear Search excellent first.
2. Then Level 4 block-built Linear Search.
3. Then Binary Search.
4. LeetCode-style problem breakdown later, not now.

## Learning Contract

A supported learning flow should synchronize:
- blocks
- generated code
- runtime state
- visualization
- code-line highlighting
- block highlighting when implemented
- explanation
- test feedback

Do not claim any part of this works until it is actually wired.

## Scope Guardrails

- Current MVP is arrays and search only.
- Do not add arbitrary Blockly-program support unless explicitly scoped.
- Do not add LeetCode import or problem parsing yet.
- Do not add new algorithm families before Linear Search, Level 4, and Binary Search are solid.
- Keep explanations conservative and tied to actual runtime behavior.

## Implementation Preference

- Prefer one algorithm or level at a time.
- Add support classification before exposing new Teaching behavior.
- Add tests for support status, event traces, and edge cases.
- Keep unsupported or partial states honest in the UI.

## Verification

Run `npm test`, `npm run build`, and `npm run lint`.

For learning-flow UI changes, manually verify that the visible step, code line, explanation, and visualization describe the same operation.
