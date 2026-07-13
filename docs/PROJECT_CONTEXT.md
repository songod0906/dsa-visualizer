# DSA Blocks Lab — Full Project Context (for writing a PRD)

> **How to use this document.** Paste it into a fresh Claude conversation and ask it to
> help you write a PRD. It is self-contained: it captures the product vision, the user and
> problem, the differentiation thesis, what has actually been built, the key product
> decisions and their rationale, the roadmap and its sequencing logic, and how success
> would be measured. It deliberately surfaces the *product-management* reasoning (not just
> the engineering) because it is intended as a PRD example for a product interview.
>
> **Honest framing (keep this in the PRD's tone):** this is a **solo portfolio project**,
> not a shipped product with real users or live metrics. Where this doc talks about
> "success metrics" or "users," treat them as *how we would measure success* and *who we
> are building for* — hypotheses to validate, not results achieved. A strong PRD here is
> judged on product thinking, prioritization, and clarity, not on invented traction.

---

## 1. One-line summary

**DSA Blocks Lab is a browser-based learning tool where beginners *build* a data-structures
-and-algorithms solution out of drag-and-drop blocks and watch it run, step by step, with
the code, the memory state, and a plain-English explanation all staying in sync.**

It fuses two proven ideas: **VisuAlgo** (algorithms made visible) and **Scratch** (you
construct logic by snapping blocks together), and points them at a long-term north star of
**LeetCode-style practice for people who can't yet read or write code fluently.**

---

## 2. The problem

Learning data structures and algorithms is a notorious wall for beginners and career
switchers. Two failure modes dominate:

1. **Watching isn't understanding.** Animated visualizers (like VisuAlgo) are beautiful,
   but the learner is a spectator. They watch someone else's binary search run; they never
   build one. Passive watching produces the illusion of understanding that collapses the
   moment they face a blank editor.
2. **The blank editor is too steep.** Platforms like LeetCode assume you can already write
   correct code. A beginner who understands the *idea* of linear search still faces syntax,
   tooling, and edge cases all at once, and bounces.

There is a missing middle: a place where you **actively construct** the algorithm (so you
own it) but **without the full cliff of writing raw code** (so you can start), and where the
tool shows you **why each step changes the state** (so you build a real mental model).

## 3. Target user

- **Primary:** absolute-beginner and early-intermediate learners of DSA — CS students in
  their first algorithms course, self-taught career switchers, bootcamp students.
- **Context of use:** self-directed practice, in a browser, on a laptop. Short sessions.
- **What they want:** to *get* how an algorithm actually works, well enough to rebuild it
  and to recognize it in a problem — not just to memorize its name.

## 4. The differentiation thesis (the core bet)

The product's single defensible idea is: **you build the algorithm, you don't just watch
it.** Everything follows from that.

- Versus **VisuAlgo**: VisuAlgo has no *building*. Every visualization is pre-written; the
  algorithm is a black box with a play button. DSA Blocks Lab makes the learner assemble
  the loop / comparison / conditional / return out of blocks, *then* gives them
  VisuAlgo-grade synchronized feedback on the thing they built. That's a different causal
  relationship between learner and algorithm: construction, not observation.
- Versus **Scratch**: Scratch is tactile block-building but has no algorithmic rigor or
  state visualization. We borrow the tactility and add the rigor.
- Versus **LeetCode**: LeetCode assumes coding fluency and gives sparse feedback (pass/fail
  on hidden tests). We let the learner build with blocks first, and — critically — let them
  *load a failing test case back into the visualization and step through it* to see exactly
  where their logic breaks.

Everything that is *shared* with VisuAlgo (state made visible, one truth across every
surface) is table stakes we match. The *building* is the wedge.

## 5. The experience (what the learner actually does)

The core loop synchronizes, on every single step, five surfaces so they never disagree:

1. **Blocks** — the algorithm the learner assembled (Blockly-style puzzle pieces).
2. **Generated code** — beginner-readable Python revealed from those blocks (never executed
   as raw code; see the safety principle below).
3. **Runtime state** — an array visualization with cells, pointers, comparisons, and an
   operation counter.
4. **Highlighting** — the exact code line and the exact array cell in play, lit up together.
5. **Explanation** — one plain-English sentence describing what just happened and why.

The learner can **Run** (autoplay), **Step**, and **scrub** the trace freely — jump to
start/end, step backward, replay — like a VCR for the algorithm's execution.

Three modes:
- **Puzzle** — 8 guided levels from "read one array cell" up to "linear vs. binary search /
  Big-O intuition."
- **Sandbox** — free experimentation: change the array and target, run either search recipe.
- **Problems** — the LeetCode slice: a problem statement, build blocks, **Submit** to grade
  against multiple test cases, then click any (failing) case to load it and debug it visually.

## 6. Product principles (these are the real values — good PRD material)

1. **No fake support — honesty over polish.** If a feature is visible, it must either work
   correctly or *plainly say* it doesn't ("Teaching is not ready for this level yet"). The
   app would rather admit a gap than show a confidently-wrong explanation. Rationale: a
   learning tool that lies once — a wrong explanation, a fake highlight — loses the
   learner's trust permanently. This is enforced, not aspirational: features carry an
   explicit "availability contract," and there are automated tests asserting that
   unsupported states show no highlight and no explanation.
2. **One engine, not N bespoke ones.** Each new algorithm must ride shared machinery, not
   get its own copy-pasted plumbing. This was tested for real: adding Binary Search teaching
   required *zero* changes to the execution engine — proof the architecture generalized.
3. **Anti-slop design.** The runtime-state surface is deliberately spare (flat, no
   gradients/drop-shadows/decorative badges) so that color and motion *mean* something — a
   green cell is "being compared," not decoration. The expressive, colorful styling budget
   is spent only on the block palette, where "grabbable/tactile" is the job.
4. **Safety by construction.** Blocks compile to a safe internal instruction model; the app
   **never executes arbitrary user code**. The "Python" panel is a readable *reveal*, not an
   interpreter. This keeps the tool safe to run anywhere and keeps execution deterministic.

## 7. What has been built (current state)

Working today, all verified (50 automated tests, build + lint clean, manual browser QA):

- **Three fully-synchronized teaching flows:** single-block Linear Search, block-built
  Linear Search (the learner assembles the loop themselves), and Binary Search — each with
  code↔state↔highlight↔explanation↔trace all in sync across run / step / reset / scrub.
- **8-level guided Puzzle curriculum** (arrays → pointers → comparisons → linear search →
  Big-O → sorted arrays → binary search → linear vs. binary).
- **Sandbox mode** for free experimentation.
- **VCR-style trace scrubbing** (jump-to-start, step-back, step-forward, jump-to-end).
- **Problems mode (the LeetCode slice):** one problem ("Find the Target"), build-and-Submit
  grading against 6 test cases (found middle/first/last, missing, empty array, duplicate),
  a pass/fail results panel, and a **debug-the-failure loop** — click a case (Submit
  auto-jumps to the first failure) to load it into the visualization and scrub through
  exactly where the algorithm diverges.

Scope is deliberately **arrays and search only** so far — breadth was consciously deferred
(see §9).

## 8. Architecture (brief — for context, not the PRD's focus)

- **Stack:** Vite + React 19 + TypeScript (strict) + Blockly; Vitest for tests. ~2,600 LOC.
- **`engine.ts`** — a deterministic interpreter: it runs the internal instruction model and
  emits a list of "frames," each a snapshot of state + an event describing what changed.
- **`blockly.ts`** — custom blocks, the block→instruction parser, and the readable-Python
  generator (with an instruction→code-line map).
- **`learningSupport.ts`** — the sync brain: maps each execution frame to the code line to
  highlight and the explanation to show, and honestly classifies what level of teaching
  support a given program qualifies for.
- **`problems.ts`** — the LeetCode layer: a pure `gradeProgram` that runs the built program
  against each test case and compares results. Notably it required *no* engine changes —
  grading is just repeated execution.
- The whole thing is driven by a single `frameIndex`, which is why scrubbing "just works":
  moving the playhead re-derives every surface.

## 9. Roadmap and the sequencing logic (the prioritization story — strong PRD material)

Work was sequenced as milestones, each with an explicit exit bar. The *order* was a series
of deliberate product calls:

**Stage 1 — make the core loop excellent before widening (done):**
- **M0 Design reset** — strip the UI back to a clean, meaningful visual language first, so
  later work doesn't compound design debt.
- **M1 Harden Linear Search teaching** — make the one flow that fully works *undeniable*
  and lock its correctness with tests, before generalizing.
- **M2 Generalize the teaching engine** — *the load-bearing milestone.* Make a
  learner-built program (not just a canned one) get the same synchronized teaching. This was
  the make-or-break bet: if the engine didn't generalize, everything after would need
  bespoke wiring.
- **M3 Binary Search on the shared engine** — the proof M2 worked (it needed no engine
  rewrite).
- **M4 Trace scrubbing** — a cheap, high-value control upgrade, deliberately done *after*
  the sync engine was trustworthy.

**Stage 2 — the LeetCode loop (in progress):** the differentiating vision, built as a thin
vertical slice `problem → blocks → code → test feedback` rather than boiling the ocean.
- **M6a Problems foundation (done)** — build, Submit, grade.
- **M6b Debug-the-failure loop (done)** — load a failing case and scrub it.
- **M6c Second problem + polish (next)** — add a binary-search problem and a problem picker.

**Explicitly deferred:**
- **M5 Widen the algorithm surface (e.g. Sorting).** A tempting breadth play, deliberately
  *deprioritized*. Rationale: adding more VisuAlgo-style visualizations makes the app more
  *like* VisuAlgo, whereas the LeetCode loop advances the thing that makes us *different*.
  Breadth is a Stage 3 candidate, revisited only after the depth slice proves out.
- **The full `pattern → visual plan` middle of the LeetCode arc**, and any natural-language
  problem import — later stages, intentionally out of the current slice.

## 10. The key product decision to highlight (depth vs. breadth)

At the end of Stage 1, there was a genuine fork:
- **Breadth:** add Sorting (bubble/selection/insertion) — canonical, recognizable, "makes
  the app feel complete."
- **Depth:** build the LeetCode loop slice — advances the differentiator, and (because of
  the M2 engine) is actually a *smaller* code surface, since grading is just repeated
  execution with no new algorithm semantics.

**Chose depth.** Reasoning: (a) breadth makes us a worse VisuAlgo; depth makes us a
category of one; (b) the architecture made depth cheap; (c) for a portfolio, a coherent,
differentiated product beats a sprawling feature list. This is the kind of prioritization
tradeoff a PRD should make explicit and defend.

## 11. How success would be measured (hypotheses, not results)

Since there are no live users yet, these are the metrics we'd instrument and the bars we'd
set if this went to real users:

- **Activation:** % of new users who build and successfully run *their own* program (not
  just the starter) in session one. The whole thesis is "building beats watching," so this
  is the North-Star-adjacent metric.
- **Concept mastery proxy:** in Problems mode, % of learners who go from a failing submit to
  a passing one *after using the debug-the-failure loop* (did the visual debug actually
  help them fix it?).
- **Edge-case learning:** distribution of which test cases learners fail first (missing
  target? empty array?) — validates that multi-case grading teaches robustness.
- **Depth of engagement:** step/scrub interactions per session (are they actually
  interrogating execution, or just hitting Run once?).
- **Progression:** Puzzle level completion funnel; drop-off points.
- **Trust/quality guardrail (internal):** zero shipped instances of "fake support" — a
  wrong highlight or explanation. Treated as a P0 quality bar, not a growth metric.

## 12. Honest current limitations (put these in the PRD as risks/assumptions)

- **Solo build, no real users yet.** All "user" statements are hypotheses to validate.
- **Narrow content:** arrays and search only; two algorithms fully taught. Breadth is
  deferred, not free.
- **Recipe blocks can trivialize a problem.** In Problems mode a learner can drop a single
  "linear search" block and pass without building much; the multi-case grading still teaches
  edge cases, but forcing a block-built solution is an open design question.
- **No accounts, no persistence, no mobile layout yet.**
- **Tooling reality:** some behaviors (building/breaking programs in the block editor) are
  covered by automated tests rather than end-to-end UI automation, because the block editor
  can't be script-driven easily.

## 13. If you (the interviewer's reader) want the elevator pitch

> Beginners hit a wall with algorithms because visualizers make them spectators and coding
> platforms make them face a blank editor too soon. DSA Blocks Lab is the missing middle:
> you *assemble* an algorithm out of blocks, watch it run with the code, the memory, and a
> plain-English explanation all in lockstep, and — in the LeetCode mode — submit it against
> real test cases and step through the exact case that breaks. It's VisuAlgo's rigor plus
> Scratch's hands-on-ness, aimed at the moment between "I sort of get it" and "I can build
> it." Built with a hard rule that the tool never fakes understanding: every visible piece
> either works or honestly says it doesn't.
