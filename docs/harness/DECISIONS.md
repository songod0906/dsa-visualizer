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
