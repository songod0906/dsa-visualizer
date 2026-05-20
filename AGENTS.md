# DSA Blocks Lab Agent Guide

## Project Identity

DSA Blocks Lab is a beginner-focused DSA learning app. It is both:
- a VisuAlgo-like learning and sandbox experimentation tool
- a Scratch-like block construction tool for building algorithm logic by hand

The app is a Vite + React + TypeScript browser app. Blocks must generate a safe internal instruction model; never execute arbitrary user code.

## Current Scope

The MVP is arrays and search only.

Priority order:
1. Make Linear Search excellent first.
2. Then support Level 4 block-built Linear Search.
3. Then support Binary Search.
4. LeetCode-style features come later, not now.

## Hard Constraints

- No fake support.
- If a feature is visible, it must work or clearly say partial/unsupported.
- No fake code highlights.
- No fake explanations.
- No arbitrary user code execution.
- No broad refactors.
- No package installs unless explicitly approved.
- Do not expand product scope without explicit approval.
- Keep UI confident, visual, and concise; avoid AI-demo-style over-explaining.

## Workflow Rules

- Inspect the current implementation before editing.
- Keep changes small and tied to the requested behavior.
- Prefer pure helpers and focused tests for support logic.
- Do not rewrite unrelated levels, engine behavior, Blockly parsing, or UI layout.
- For UI changes, verify the visible app in the browser when practical.
- Protect existing Puzzle/Sandbox behavior and level navigation.

## Required Verification

After implementation tasks, run:

```bash
npm test
npm run build
npm run lint
```

For visible UI work, also do a browser smoke check of the affected mode/level.

## Report Format

End with:
- changed files
- behavior changes
- `npm test`, `npm run build`, and `npm run lint` results
- browser/manual QA results when applicable
- risks or assumptions
- verdict: `PASS`, `FIX`, or `REJECT`
