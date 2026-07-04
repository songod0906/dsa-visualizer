# Stage 2 Plan: The LeetCode Loop (thin slice)

Owner: songod0906. Status: planned 2026-07-04, not started. This is the design plan for
the next stage. Strategic context lives in [ROADMAP.md](ROADMAP.md); this doc is the
concrete design the Stage 2 features (F005–F007) implement.

## Why this stage

The MVP bar ("arrays and search excellent") is met (M0–M4). The product's differentiator
versus VisuAlgo is that **you build the algorithm**, and the vision's north star is the
flow `problem → pattern → visual plan → blocks → code → runtime/test feedback`
([PRODUCT_VISION.md](PRODUCT_VISION.md)). Stage 2 builds the first honest, end-to-end
vertical slice of that flow — deliberately the thin version — on top of the engine M0–M4
already produced.

Chosen over "widen the algorithm surface" (Sorting etc.) on 2026-07-04 because: it
advances the *differentiating* vision rather than making the app more VisuAlgo-like; it is
a **smaller** code surface (the engine already executes programs — we wrap it, we don't
extend it); and it is the stronger portfolio story.

## The slice (what we build)

`problem → blocks → code → test feedback`. We intentionally skip the `pattern → visual
plan` middle of the arc for now; that is a later stage.

A learner picks a **Problem**, builds an algorithm from the existing blocks, and hits
**Submit**. The built program is run against a set of **test cases** and graded pass/fail.
Failing cases can be loaded back into the existing visualization to step/scrub and see
exactly where the algorithm goes wrong — closing the loop `test feedback → visual debug`.

## Scope boundaries (what we deliberately do NOT build yet)

- No natural-language problem parsing and no arbitrary problem import. Problems are
  hand-authored data.
- No arbitrary user-code execution — unchanged core principle. Grading runs the safe
  internal instruction model, same as everywhere else.
- No `pattern → visual plan` layer yet (the middle of the vision arc).
- No new algorithm families and no new engine semantics. Stage 2 must be **additive and
  reuse-only**: it imports `executeProgram`, the blocks, and the teaching layer; it does
  not edit them. If that turns out to be impossible, stop and record why before expanding
  scope.
- Only problems solvable with the blocks that already exist (linear search, binary search,
  and their building blocks).

## Data model

New, small, and pure — proposed in a new `src/dsa/problems.ts` (types may live in
`types.ts`):

```ts
type TestCase = {
  array: number[]
  target: number
  expected: number   // expected final resultIndex (-1 for "not found")
  hidden?: boolean    // if true, input is not shown until the case fails
}

type Problem = {
  id: string
  title: string
  statement: string        // the prompt shown to the learner
  allowedBlocks: string[]  // reuse existing block ids
  starterBlocks: string    // reuse existing starter XML kind (or an empty start)
  cases: TestCase[]        // multiple; mix of found / missing / edge cases
}
```

## Grading (the one genuinely new piece of logic)

A pure, tested function — no engine change, just a loop over `executeProgram`:

```ts
function gradeProgram(instructions, cases): CaseResult[]
  = cases.map(c => {
      const frames = executeProgram(instructions, c.array, c.target)
      const actual = frames.at(-1)?.state.resultIndex ?? null
      return { case: c, actual, passed: actual === c.expected }
    })
```

Because grading is just repeated execution, the whole "test feedback" feature costs one
small pure function plus UI. That is the leverage the M2 architecture bought us.

## First problems (both solvable with existing blocks)

1. **Find the Target** (linear search, unsorted). Cases exercise found-middle,
   found-first, found-last, missing, empty array, and a duplicate target. A learner using
   the linear-search block passes all; a learner who builds a subtly broken loop (returns
   on the first cell, off-by-one, forgets the not-found path) fails specific cases. The
   multi-case grading *is* the lesson: robustness and edge cases.
2. **Search a Sorted Array** (binary search, sorted). Found / missing / first / last /
   empty over sorted inputs.

## UX

- A third mode alongside Puzzle and Sandbox: **Problems**. Reuses the Build / Run / Inspect
  zones unchanged.
- The problem statement shows in place of the lesson strip / concept line.
- **Submit** (distinct from the existing Check) grades the current program against all
  cases and shows a results panel: `N / M passed`, with each case's status. Failing cases
  reveal their input (found target vs expected) so the learner can debug; passing hidden
  cases stay summarized.
- The visualization shows one **selected case** (defaults to the first). A case selector
  lets the learner load any case — especially a failed one — into the Run zone and use the
  existing step / scrub / teaching to see where it breaks. This is the loop-closer.

## Milestones (decomposition, WIP = 1)

Stage 2 is bigger than one feature; it ships as three sequential features. Each keeps all
existing F001–F003 teaching-sync tests green.

### F005 — Problems foundation (the vertical slice on one problem)
Problem/TestCase model, `gradeProgram` (pure, tested), Problem 1 ("Find the Target"),
Problems mode shell, Submit, results panel. Visualization shows case 1.
**Exit:** In Problems mode, building linear search and hitting Submit shows all cases
passing; a deliberately broken program shows the correct specific cases failing with real
data. Puzzle/Sandbox untouched. Engine/blockly/learningSupport unedited (import-only).

### F006 — Debug-the-failure loop
Case selector that loads any case (especially a failing one) into the Run zone; stepping
and scrubbing work on the loaded case through the existing teaching layer.
**Exit:** Submit → click a failed case → it loads into the visualization → step/scrub
shows the divergence, teaching stays synchronized.

### F007 — Second problem + edge polish
Add Problem 2 ("Search a Sorted Array", binary), copy/UX refinement, edge-case coverage in
tests.
**Exit:** Both problems gradeable end-to-end; results copy is clear; grading tests cover
found/missing/empty/first/last/duplicate.

## Reuse map (what Stage 2 leans on, unchanged)

- `executeProgram` — grading is repeated calls to it. No change.
- Blockly blocks + `workspaceToInstructions` — the learner's program is parsed exactly as
  in Puzzle/Sandbox. No change.
- `getTeachingStep` / `getLearningSupport` / `buildProgramCode` — a loaded case steps and
  teaches through the same path. No change.
- ArrayBoard, CodePanel, trace, transport (M4) — the Run/Inspect zones work as-is on the
  selected case.

## Risks

- **Scope creep toward "real LeetCode."** The temptation is problem import, difficulty
  tiers, a big problem bank. Resist: two hand-authored problems prove the loop; the value
  is the loop, not the catalog.
- **Recipe blocks make problems trivial.** Allowing the single `linearSearch` block means a
  learner can pass without "building" much. Acceptable for the thin slice — the multi-case
  grading still teaches edge cases — but F007 can consider restricting a problem's
  `allowedBlocks` to force a block-built solution once the loop is proven.
- **App.tsx growth.** App.tsx is already high-coupling. Problems mode adds state. Keep the
  problem/grading logic in `problems.ts` (pure, tested) and let App.tsx only wire UI, to
  avoid deepening the coupling.
