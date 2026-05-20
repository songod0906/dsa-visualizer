# Product Vision

DSA Blocks Lab helps beginners learn data structures and algorithms by building, running, and seeing algorithms.

## Dual Identity

The product is both:
- a VisuAlgo-like DSA learning and sandbox experimentation tool
- a Scratch-like block construction tool for assembling algorithm logic by hand

The learner should not just watch an animation. They should build the algorithm, step through it, and understand why each operation changes the runtime state.

## Runtime Synchronization Model

The core experience should synchronize:
- block logic
- generated beginner-friendly code
- runtime state
- visualization
- code-line highlighting
- block highlighting
- explanations
- test feedback

Execution must use the safe internal instruction model, not arbitrary user code.

## Future LeetCode Flow

Long term, the app should help learners study LeetCode-style problems through this flow:

`problem -> pattern -> visual plan -> blocks -> code -> runtime/test feedback`

This is future scope. Do not build LeetCode import, arbitrary visualizer generation, or broad problem parsing until the arrays/search learning loop feels excellent.

## Current MVP

Arrays and search only.

Current support truth:
- Single-block Linear Search Teaching is supported.
- Level 4 block-built Linear Search is partial.
- Binary Search Teaching is not ready yet.

Priority:
1. Make Linear Search excellent first.
2. Then Level 4 block-built Linear Search.
3. Then Binary Search.
4. LeetCode-style features later.

## Design Direction

The app should feel confident, visual, and hands-on.

Prefer:
- strong visualization of runtime state
- concise labels
- direct controls
- visible cause and effect
- block-building as a first-class activity

Avoid:
- generic dashboard styling
- landing-page framing
- AI-demo-ish prose
- repeated explanatory copy
- unsupported features that look complete
