---
name: dsa-ui-redesign
description: Use when changing DSA Blocks Lab layout, visual hierarchy, copy, controls, panels, or interaction feel.
---

# DSA UI Redesign

Use this skill for visible UI changes in DSA Blocks Lab.

## Product Feel

- Make the app feel like a confident learning lab, not a generic AI SaaS dashboard.
- Prefer visual state and direct manipulation over explanatory prose.
- Keep block-building first-class; it should not feel like decoration beside the visualizer.
- Do not create a landing page or marketing hero.

## Guardrails

- Preserve engine behavior.
- Preserve Puzzle/Sandbox behavior unless the task explicitly targets it.
- Do not fake unsupported Teaching, code highlights, block highlights, or explanations.
- No package installs unless explicitly approved.
- No broad redesign when the task asks for a focused fix.

## UI Checklist

- Controls are close to the thing they affect.
- Copy is short, confident, and not repeated.
- Unsupported/partial features are clearly labeled without noisy chip stacks.
- Text does not overlap or require awkward scrolling at common desktop widths.
- Runtime state is visually obvious: array, pointers, comparisons, result, and operation count.

## Verification

After visible UI changes:
1. Run `npm test`, `npm run build`, and `npm run lint`.
2. Smoke test the affected level/mode in the browser.
3. Report changed files, visual behavior, verification results, risks, and `PASS`/`FIX`/`REJECT`.
