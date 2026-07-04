# Product Roadmap

Owner: songod0906. This is the strategic source of truth for where DSA Blocks Lab is
going and why. `docs/harness/FEATURE_LIST.json` tracks the single active unit of work;
this document tracks the sequence of milestones above it and whether the product is
actually making progress toward its vision.

Full vision: [docs/PRODUCT_VISION.md](PRODUCT_VISION.md). Full architecture:
[docs/ARCHITECTURE.md](ARCHITECTURE.md).

## Mission

Combine VisuAlgo's rigor (state made visible, one truth across every surface) with
Scratch's tactility (you build the algorithm, you don't just watch it) — for
beginners learning arrays and search first, then expanding outward once that loop is
proven, not before.

## Success Metrics

A milestone is not "done" because code merged. It's done when:

1. **Zero fake support.** Every visible Teaching/Exploration surface either works
   correctly or states plainly that it doesn't, per `docs/QA_GATE.md`.
2. **One engine, not N bespoke ones.** Adding a second and third algorithm to the
   synchronized teaching flow required extending shared logic, not duplicating
   Linear Search's plumbing under a new name.
3. **Anti-slop holds.** The runtime-state surface (array board, pointers, badges)
   has no decoration that doesn't carry learning meaning — checked against
   `docs/DESIGN_SYSTEM.md`'s rules, not vibes.
4. **Verification is real.** `npm test`, `npm run build`, `npm run lint` pass, and a
   manual browser QA pass happened for any visible change (see `docs/harness/`).

## Now / Next / Later

| | Milestone | Status |
|---|---|---|
| Done | M0 — Design reset | done (2026-07-04) |
| Done | M1 — Harden Linear Search Teaching | done (2026-07-04) |
| Done | M2 — Generalize the teaching engine (Level 4) | done (2026-07-04) |
| Done | M3 — Binary Search on the shared engine | done (2026-07-04) |
| Done | M4 — VCR-style trace scrubbing | done (2026-07-04) |
| Now | M5 — Widen the array/search surface | unblocked (M2, M3 done) |
| Later | M6 — LeetCode arc (problem → pattern → blocks → code → test) | blocked by M2 (done); ready when prioritized |

## Milestones

### M0 — Design reset
**Goal:** Strip the runtime-state surface back to flat/functional — remove
gradients, drop-shadows, and pill badges that don't carry learning meaning, the way
VisuAlgo colors only what's operationally relevant (a compared cell, a matched
result). Block palette can stay expressive; it needs to read as "grabbable."
**Why now:** Confirmed concretely on 2026-07-04 — `src/App.css` currently has
`radial-gradient`/`linear-gradient` backgrounds and `box-shadow: 0 22px 48px
rgba(0,0,0,0.26)` on the runtime stage, which is exactly the generic-dashboard look
`docs/DESIGN_SYSTEM.md` bans. Fixing this before more UI work avoids compounding it.
**Exit criteria:** Runtime stage screenshot passes the anti-slop checklist item by
item. No unrelated behavior changes.
**Linked feature:** F000 (see `docs/harness/FEATURE_LIST.json`).
**Status:** done (2026-07-04). `src/App.css` only: removed the dual gradient on
`.run-stage` (now flat neutral), dropped floating-card drop-shadows on the runtime
and inspect panels, replaced fake glassmorphism (`rgba(255,255,255,0.x)`) with solid
surfaces on the state readout / mode panel / trace rows, and squared the decorative
`variable-chip` / `target-pill` / `step-pill` badges. Kept every learning-meaningful
signal: active-cell green + ring, state cell colors, pointer labels, trace step
markers. Block palette (gradient host, green frame) left intentionally expressive.
Verified: 21/21 tests, build, lint, clean-state all pass; browser QA on Levels 1 & 4
and Sandbox; `preview_inspect` confirms `.run-stage` has no background-image and no
box-shadow.

### M1 — Harden Linear Search Teaching
**Goal:** Single-block Linear Search Teaching is the only flow where
block↔code↔state↔explanation currently closes end to end. Make it airtight against
every edge case in `docs/QA_GATE.md` (empty array, one item, first/last index,
duplicate target, missing target), with Run and Step providably reaching identical
final state, Reset clearing everything, and no stale text across level/mode
switches.
**Why:** This is the flow a stranger would be shown first. It has to be undeniable,
not just "working."
**Exit criteria:** All edge cases above pass; QA_GATE manual checklist passes with
no caveats.
**Linked feature:** F001.
**Status:** done (2026-07-04). The happy-path sync (block↔code↔state↔explanation)
was already correct; the gap was that it was unguarded. Work done: (1) extracted
`getTeachingStep` from `App.tsx` into the testable `src/dsa/learningSupport.ts`;
(2) added 11 sync-contract tests that run the real engine and assert each frame's
highlighted code line and explanation match the operation, across found
(first/middle/last), missing, empty, one-item, and duplicate-target arrays — plus a
guard that the generated Python still matches the line numbers the mapping assumes;
(3) fixed a stale-program window where switching level/mode briefly painted the new
level against the previous program (which could flash FAKE "supported" teaching) —
`chooseLevel`/`chooseMode` now clear the program until the workspace reloads the
correct starter. Verified: 32/32 tests, build, lint, clean-state; browser QA of the
level round-trip and step-through.

### M2 — Generalize the teaching engine
**Goal:** Level 4's block-built Linear Search is "partial" today because the sync
engine was hand-built for one canned instruction sequence, not for arbitrary block
assemblies. Extract the narration/highlight logic in `learningSupport.ts` into
something that walks *any* valid instruction-model program (loop, compare, if,
return) generically. Level 4 becomes the first proof this generalizes, not a
special case bolted on.
**Why:** Without this, every future algorithm (Binary Search, then anything in the
LeetCode arc) needs its own bespoke teaching wiring — the exact trap Level 4 fell
into the first time.
**Exit criteria:** Level 4 Teaching mode works for every valid block combination the
level allows. The single-block version keeps working through the same engine with
no new code path.
**Linked feature:** F002.
**Status:** done (2026-07-04). Implemented via source-instruction correlation rather
than shape-matching: each execution frame now carries the `ProgramInstruction` it is
running (optional `source` on `ExecutionEvent`, threaded through `engine.ts`), and
`blockly.ts` `buildProgramCode()` returns an instruction→line map. `getTeachingStep`
dispatches — the single-block `linearSearch` recipe keeps its fixed line mapping; any
block-built program looks up `frame.event.source` in the line map, so Level 4 and the
single-block recipe run through ONE engine with no duplicated per-line logic.
`getLearningSupport` recognizes the canonical block-built shape and marks it fully
supported; non-canonical Level 4 arrangements stay honestly `partial`. Verified: 38/38
tests (engine-driven block sync tests + line-map tests), build, lint, clean-state;
browser QA of Level 4 stepping through lines 2→3→4→5 in sync, Level 5 regression intact.
**The hinge held:** the engine generalized without a rewrite, which is what unblocks M3.

### M3 — Binary Search on the shared engine
**Goal:** Binary Search Teaching goes from "not ready" to real, using the same
synchronization engine M2 built — not a rewrite.
**Why:** This is the actual test of whether M2 generalized or is secretly still
linear-search-shaped. If Binary Search needs its own bespoke engine, M2 wasn't done.
**Exit criteria:** Binary Search Teaching explains the current comparison, decision,
and remaining search interval correctly, with no stale text leaking from other
algorithms or modes.
**Linked feature:** F003.
**Status:** done (2026-07-04). As predicted, binary search rode the same rails as the
linear recipe: added `teachBinarySearchRecipe` (fixed line mapping for the 11-line binary
block — setup→2/3, mid→5, compare→6, found→7, narrowing→9/11, not-found→12) and flipped
`getLearningSupport` to mark the single-block binary recipe supported. No engine rewrite —
the interpreter already emitted left/mid/right moves and compares. Also fixed `ModePanel`
to source the teaching intro from `support.reason` (it was hardcoded to a linear-search
string, which would have mislabeled binary). Verified: 43/43 tests, build, lint,
clean-state; browser QA of Level 7 (mid→5, compare→6 with correct discard-half explanation,
found→7 in 2 comparisons), linear/block regressions intact. That M3 needed no engine change
is the proof M2 actually generalized.

### M4 — VCR-style trace scrubbing
**Goal:** We already store the full frame trace and render clickable past steps.
Add step-back, jump-to-start, and jump-to-end transport instead of forward-only
Run/Step, matching the scrubbing VisuAlgo offers.
**Why:** Cheap, high-value, low-risk — it's UI on top of data we already produce,
observed directly by comparing our trace panel to VisuAlgo's transport controls on
2026-07-04.
**Exit criteria:** Learner can jump to any prior step from the trace panel or
transport controls without re-running the program.
**Status:** done (2026-07-04). Added a transport cluster (jump-to-first, step-back,
step-forward, jump-to-last) to the controls row, with boundary-aware disabling.
Backward scrubbing re-syncs code highlight, explanation, visualization, and trace
because they all derive from `frameIndex` — no engine or teaching change needed, which
is exactly why this was cheap. Verified: 43/43 tests, build, lint, clean-state; browser
QA of all four transport actions and both boundary states on Level 7.

### M5 — Widen the array/search surface
**Goal:** Still inside "arrays and search," round out adjacent patterns (e.g.
insert/delete with shifting, two-pointer patterns) — only once M2/M3 prove the
engine generalizes cleanly across two algorithms.
**Why not sooner:** Adding surface area before the sync engine is trustworthy
multiplies the number of places that can go stale or fake.
**Status:** blocked by M2, M3.

### M6 — The LeetCode arc
**Goal:** `problem → pattern → visual plan → blocks → code → runtime/test feedback`,
per `docs/PRODUCT_VISION.md`'s long-term scope.
**Why now it's sequenced, not scoped yet:** This is explicitly future scope until
the arrays/search loop is excellent. It depends on M2's generalized engine existing,
otherwise every new problem needs bespoke teaching wiring again.
**Status:** blocked by M2. Do not start design work here before M2 exits.

## How to update this roadmap

1. When a milestone's status changes, edit its **Status** line and the Now/Next/Later
   table above.
2. When scope changes (a milestone is split, reordered, or cut), add a dated entry to
   the Changelog below — don't silently rewrite history.
3. Keep `docs/harness/FEATURE_LIST.json` features linked to a milestone ID so the
   granular in-flight tracker and this strategic view never drift apart.
4. Re-run the Success Metrics check whenever a milestone is marked done, not just the
   milestone's own exit criteria.

## Changelog

- **2026-07-04**: M4 (VCR-style trace scrubbing / F004) completed. Added a jump-to-first /
  step-back / step-forward / jump-to-last transport cluster to the runtime controls, with
  boundary-aware disabling. Pure UI on existing data — backward scrubbing re-syncs every
  teaching surface for free because they all derive from `frameIndex`. 43 tests (unchanged;
  UI-only). All core-loop + enhancement milestones through M4 are done; remaining work
  (M5 widen surface, M6 LeetCode arc) is expansion, not core-loop.
- **2026-07-04**: M3 (Binary Search on the shared engine / F003) completed. Binary Search
  Teaching went from "not ready" to fully supported by mirroring the linear recipe
  (`teachBinarySearchRecipe` fixed line mapping) plus a support-classification flip — no
  engine rewrite, which confirms M2's generalization held. Fixed a latent bug where the
  teaching intro was hardcoded to a linear-search string (would have mislabeled binary);
  it now comes from `support.reason`. 43 tests (up from 38). All three search algorithms
  (single-block linear, block-built linear, binary) now teach through the same engine. M4
  (trace scrubbing) is the next Now.
- **2026-07-04**: M2 (generalize the teaching engine / F002) completed — the load-bearing
  milestone. Level 4's block-built linear search now gets real per-line teaching through
  the SAME engine as the single-block recipe, via source-instruction correlation (frames
  carry their source instruction; a line map resolves it to a code line) rather than a
  bespoke Level-4 path. `getLearningSupport` marks the canonical block shape supported and
  keeps non-canonical arrangements honestly partial. 38 tests (up from 32). This proves the
  architecture generalizes, which is the precondition the rest of the roadmap depended on;
  M3 (Binary Search) is now unblocked. Scope note: expanded F002 to touch `types.ts` (see
  DECISIONS.md) for the optional `source` field on `ExecutionEvent`.
- **2026-07-04**: M1 (harden Linear Search Teaching / F001) completed. Extracted the
  teaching-step sync logic into `learningSupport.ts`, locked it with 11 engine-driven
  sync-contract tests (32 total, up from 21), and closed a stale-program-on-switch
  window that could flash fake "supported" teaching. The extraction also sets up M2:
  the teaching-step derivation is now an isolated, tested function to generalize.
  M2 (generalize the teaching engine) is now the active Now milestone.
- **2026-07-04**: M0 (design reset / F000) completed. Runtime-state surface flattened
  in `src/App.css`; block palette left expressive per plan. Verification and browser QA
  recorded on the milestone and in `docs/harness/FEATURE_LIST.json`. M1 (harden Linear
  Search Teaching) is now the active Now milestone.
- **2026-07-04**: Roadmap created. Sequenced M0–M6 from the existing
  `docs/PRODUCT_VISION.md` priority order (Linear Search → Level 4 → Binary Search →
  LeetCode) plus two additions surfaced this session: M0 (design reset, prompted by
  confirming gradient/shadow/pill-badge slop in `src/App.css`) and M4 (trace
  scrubbing, prompted by direct comparison against VisuAlgo's transport controls).
  M2 reframes F002 from "make Level 4 work" to "generalize the engine so Level 4,
  Binary Search, and future algorithms all ride the same rails" — this is the load-
  bearing milestone the rest of the roadmap depends on.
