# DSA Visualization Research Notes

This folder is research material for improving DSA Blocks Lab. Do not copy code or content into the app unless the license is compatible and attribution is preserved.

## Local Open-Source References

| Reference | Local path | License note | What to study |
| --- | --- | --- | --- |
| Algorithm Visualizer app | `references/open-source/algorithm-visualizer` | MIT | Command-driven visual tracing, multi-panel UI, code-to-visualization architecture |
| Algorithm Visualizer algorithms | `references/open-source/algorithm-visualizer-algorithms` | No local LICENSE found in clone | Algorithm coverage and example explanations only; avoid direct code reuse unless license is confirmed |
| JSAV | `references/open-source/jsav` | MIT | Slideshow-style execution, arrays/graphs/trees/list primitives, pseudocode highlighting, exercises |
| DS&A in Python visualizations | `references/open-source/dsap-visualizations` | GPLv3 | Operation-first controls, variable display, code highlighting, speed/step/pause patterns |
| GraphAV | `references/open-source/graphav` | MIT | Graph canvas interactions, themes, zoom, BFS/DFS/Dijkstra animations, predecessor/shortest path info |
| Rhythm AlgoVisualizer | `references/open-source/rhythm-algo-visualizer` | MIT | Broad visualizer app structure, custom input workflows, searching/sorting/data structure presentation |
| Amar Graphs | `references/open-source/amar-graphs` | MIT | Canvas-based graph creation, randomized graph generation, speed control, DFS/BFS/Dijkstra |

## Web References Worth Learning From

| Site | Link | Strong idea |
| --- | --- | --- |
| VisuAlgo | https://visualgo.net/en | e-Lecture mode, side-by-side comparison, fast preset demos, quiz generator |
| OpenDSA | https://opendsa.org/ and https://github.com/OpenDSA/OpenDSA | Textbook-quality content integrated with visualizations and auto-graded exercises |
| JSAV docs | https://jsav.io/ | Mature vocabulary for arrays, graphs, trees, pseudocode, pointers, messages, questions, exercises |
| Cartesian interactive DSA handbook | https://cartesian.app/ | Playback, custom inputs, embedded Python, challenges, complexity discussion |
| Data Structures & Algorithms in Python | https://datastructures.live/ | Operation panel, code box, local variables, step controls, click-to-select data values |
| DeetCode | https://www.deetcode.com/ | Multiple rendering modes: animate, debug, snapshot, loop |
| Graphisual | https://graphisual.app/ | Whiteboard-like graph editing: draw, move, pan, zoom, undo, export |
| AlgoVizy | https://algovizy.com/ | Bar/dot animations, side-by-side language examples, Big O summaries |
| GraphAV | https://karimelghamry.github.io/GraphAV/ | Build and move graph nodes directly, then animate traversal |
| Amar Graphs | https://graphs.amartabakovic.ch | Minimal graph canvas with random generation and speed control |

## Design Takeaways For Our App

1. Add a true guided sandbox loop:
   - Choose scenario.
   - Choose algorithm recipe.
   - Predict result.
   - Step through.
   - Compare expected vs actual.

2. Add playback modes:
   - Step mode for beginners.
   - Auto-run for confidence.
   - Snapshot timeline for rewinding.
   - Loop mode for repeated animation.

3. Make data structures operation-first:
   - Instead of asking learners to build everything from blocks first, let them press operations like Search, Insert, Delete, Push, Pop.
   - Then reveal the blocks/code that produced the behavior.

4. Show local variables as first-class objects:
   - `i`, `left`, `mid`, `right`, `result`, `found`.
   - Put them near the memory view, not hidden in trace text.

5. Add conceptual overlays:
   - Binary search should shade the discarded half of the array.
   - Linear search should show the searched prefix.
   - Big O should be felt through a comparison meter, not only read as text.

6. Build an e-Lecture mode:
   - A short narrated/demo path for each topic.
   - The app performs a known run while explaining each movement.
   - Learner can pause and take control at any time.

7. Add auto-graded micro-challenges:
   - "Make the algorithm return index 3."
   - "Find the missing target."
   - "Use fewer than 4 comparisons."
   - "Fix the broken binary search setup."

8. Add graph-editor affordances later:
   - Click empty space to create nodes.
   - Drag nodes to rearrange.
   - Connect nodes with a clear edge gesture.
   - Show algorithm side data such as queue, visited set, predecessor, and distance.

## Recommended Next Build Sequence

1. Upgrade arrays/search:
   - Add variable chips for `current`, `left`, `mid`, `right`, `result`.
   - Shade searched/discarded ranges.
   - Add rewind/snapshot timeline.
   - Add side-by-side Linear vs Binary comparison.

2. Add stacks and queues:
   - Operation-first interface: Push, Pop, Enqueue, Dequeue.
   - Blocks/code reveal after each operation.
   - Natural metaphors: stack of plates, waiting line.

3. Add linked lists:
   - Drag nodes, connect pointers, animate insert/delete.
   - Make null pointers and pointer rewiring explicit.

4. Add recursion:
   - Call stack visualization.
   - Frame cards for parameters, return values, and base cases.

5. Add graphs:
   - Whiteboard canvas for nodes/edges.
   - BFS/DFS/Dijkstra with queue/stack/priority queue side panel.

## Safe Reuse Rule

Use permissively licensed code only when it truly saves time and the license is preserved. Otherwise, treat references as design inspiration and reimplement the behavior in our own React/TypeScript architecture.
