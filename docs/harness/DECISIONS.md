# Decisions

## 2026-05-21: Harness-First Codex Workflow
Decision: Make repo artifacts the source of truth for Codex sessions.
Reason: Conversation-only instructions are easy to lose across sessions.
Consequence: Every Codex run must read `AGENTS.md`, `FEATURE_LIST.json`, and `PROGRESS.md` before editing.

## 2026-05-21: WIP = 1
Decision: Keep only one active feature at a time.
Reason: This prevents broad, half-finished multi-feature edits.
Consequence: Agents must finish, block, or explicitly hand off the active feature before starting another.

## 2026-05-21: Worker and Supervisor Split
Decision: Codex supervises; OpenCode or DeepSeek may execute bounded worker tasks.
Reason: This saves premium reasoning for planning, review, and verification while allowing cheaper execution for narrow edits.
Consequence: Worker tasks must include allowed files, forbidden files, verification commands, and a no-package-install rule.

## 2026-05-21: No Fake Feature Availability
Decision: Visible features must work or clearly say partial or unsupported.
Reason: The app teaches beginners, so fake support creates wrong learning signals.
Consequence: Feature work must include an availability contract and stale-state checks.

## 2026-07-04: Added a Strategic Roadmap Above FEATURE_LIST.json
Decision: Created `docs/ROADMAP.md` as the milestone-level source of truth (M0–M6), with `docs/harness/FEATURE_LIST.json` features linked to a milestone ID.
Reason: `FEATURE_LIST.json` tracks the single in-flight feature well, but had no layer above it showing sequencing, why that sequencing was chosen, or how to tell if the product is actually progressing toward its vision rather than just shipping isolated features.
Consequence: Any new feature must be linked to a milestone in `docs/ROADMAP.md`. Reordering or cutting milestones requires a dated Changelog entry in `docs/ROADMAP.md`, not a silent rewrite. Added F000 (design reset) ahead of F001 after confirming concrete anti-slop violations in `src/App.css`, and reframed F002 from "make Level 4 work" to "generalize the teaching engine," since Level 4 and Binary Search both need the same underlying capability rather than two bespoke implementations.
