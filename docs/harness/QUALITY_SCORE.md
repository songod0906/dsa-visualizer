# Quality Score

Use this as a lightweight review rubric before marking feature work as `PASS`.

## Current Score
- Correctness: not scored
- Scope control: not scored
- Feature availability truth: not scored
- Test coverage: not scored
- Browser/manual QA: not scored
- Design fit: not scored

## Rubric
Score each item from 0 to 2.

### Correctness
- 0: known incorrect behavior or stale runtime state
- 1: mostly correct with known gaps
- 2: tested and manually checked for the scoped flow

### Scope Control
- 0: unrelated files or broad refactors
- 1: mostly scoped with minor churn
- 2: only task-relevant files changed

### Feature Availability Truth
- 0: visible fake support
- 1: partial support is mostly labeled
- 2: all visible support is real or clearly partial/unsupported

### Test Coverage
- 0: no relevant tests
- 1: existing tests only
- 2: focused tests added or updated for risky logic

### Browser or Manual QA
- 0: not checked for visible work
- 1: smoke checked one happy path
- 2: checked target flow plus reset/switching edge cases

### Design Fit
- 0: generic, noisy, or decorative
- 1: acceptable but not strongly instructional
- 2: visual, concise, and focused on algorithm state

## Pass Bar
A `PASS` feature should have no zero scores, verification evidence, and no unreported risks.
