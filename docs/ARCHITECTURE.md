# Architecture

## App Shape
DSA Blocks Lab is a Vite, React, and TypeScript browser app. The MVP focuses on arrays and search, with Linear Search as the highest-priority learning flow.

## Core Runtime Model
The app should keep these surfaces synchronized:
- block logic
- beginner-friendly generated code
- safe internal instruction model
- runtime trace
- visualization state
- code or block highlighting
- explanation text
- learner feedback

Execution must use the app's internal instruction model. Arbitrary user code execution is out of scope.

## Current Support Truth
- Single-block Linear Search Teaching is supported.
- Level 4 block-built Linear Search is partial.
- Binary Search Teaching is not ready.
- LeetCode-style flows are future scope.

## High-Coupling Areas
Treat these files carefully and edit only when the feature requires it:
- `src/App.tsx`
- `src/dsa/types.ts`
- `src/dsa/engine.ts`
- `src/dsa/blockly.ts`
- `package.json`
- `package-lock.json`

## Verification Expectations
Behavioral changes should have focused tests where possible. Visible UI changes should also get a browser smoke check of the affected mode or level.
