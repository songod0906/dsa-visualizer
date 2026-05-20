# DSA Blocks Lab

A beginner-friendly data structures and algorithms game built with Vite, React, TypeScript, and Blockly.

The app teaches arrays and search through drag-and-drop Python-like blocks. Learners can run or step through programs and watch array cells, pointers, comparisons, results, and operation counts update in the visual memory view.

## Features

- Puzzle Mode with 8 levels covering array reads, pointers, comparisons, linear search, sorted arrays, binary search, and Big O intuition.
- Sandbox Mode for changing the array and target while experimenting with all MVP blocks.
- Blockly custom blocks mapped into a safe internal instruction model.
- Python reveal panel that shows beginner-readable code without executing arbitrary user code.
- Step trace, run/pause/reset controls, speed slider, hints, and answer checks.

## Development

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://127.0.0.1:5173/`.

## Verification

```bash
npm test
npm run build
```

The test suite covers Blockly-to-instruction parsing, Python reveal output, linear search and binary search traces, edge cases, and level goal checks.

## Architecture

- `src/dsa/types.ts`: shared level, instruction, event, and run-state types.
- `src/dsa/blockly.ts`: Blockly custom blocks, starter programs, parser, and Python code reveal.
- `src/dsa/engine.ts`: deterministic interpreter that emits visualization frames.
- `src/dsa/levels.ts`: the 8 guided beginner puzzle levels.
- `src/App.tsx`: app shell, mode switching, controls, memory view, trace, and sandbox inputs.
