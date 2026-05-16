# `.ai/` — Multi-Agent War Room Workspace

**Created**: 2026-05-16 iter 67 PHASE 4 (post Andrea strategic input documento)
**Pattern**: Andrea ratify iter 67 PHASE 4 — coexist `.ai/` NEW + preserve `automa/team-state/` legacy

## Scope

Canonical workspace for multi-agent war room workflow (Pattern S r3 11× consecutive validated):
- `mission.md` — current iter goal + appetite + Definition of Done + agent roles + Ready tasks
- `board.md` — Kanban board WIP limit 3 + Backlog/Ready/InProgress/Blocked/Review/Done
- `handoffs/` — single-cycle agent handoff messages (NEW path, parallel to `automa/team-state/messages/` Pattern S r3 inter-agent completion msgs)
- `dreams/` — Manual Dream Protocol candidate folders YYYY-MM-DD-{morning,evening} (NOT applied directly, requires Andrea review per AutoDream GitHub issues warning iter 67)
- `reports/` — latest quality summary + AI eval + UX scorecard generated artifacts (placeholder for ELAB Quality Harness Phase 1 iter 70+)

## Coexist with `automa/team-state/`

`.ai/` ≠ migration of `automa/team-state/`. Both PRESERVE:
- `.ai/handoffs/` = NEW canonical path for war room workflow cycle (mission → architect → builder → tester → reviewer → integrator)
- `automa/team-state/messages/{agent}-iter{N}-{phase}-completed.md` = Pattern S r3 inter-agent filesystem barrier (PRESERVE 11× race-cond fix validated iter 5+6+8+11+12+19+36+37+38+43+67)
- Single agent dispatch (iter 67 single-agent inline) writes BOTH paths if pertinent

## Pattern S r3 file ownership rigid

1 agent = 1 branch = 1 worktree = 1 mission. NO 2 agents same dir editing simultaneously.

## Manual Dream Protocol (iter 69+ prototype)

End-of-session consolidation NOT modifying code OR memory directly. Andrea reviews dream candidate before apply to CLAUDE.md/AGENTS.md.

Per Andrea iter 67 documento §6.3: AutoDream / `/dream` Claude Code GitHub issues confirm "Unknown skill" + file deletion bug + memory loss. USE Manual Dream Protocol con backup + diff + Andrea approve.

## Cross-link

- Strategic plan: `docs/strategy/2026-05-16-multi-agent-war-room-strategic-plan.md` (TBD iter 68 if Phase 1 ROI verify)
- Codex workflow: `docs/dev/CODEX-WORKFLOW.md` v2.0 (4 patterns V/R/I/A + 4 ELAB profiles)
- Pattern S r3 messaging legacy: `automa/team-state/messages/` (iter 36+ filesystem barrier)
- Codex repo-level rules: `.codex/AGENTS.md` (4263B)
- Agent ops CLI: `scripts/agents/aiw.sh` (status/smoke/quality/handoffs/dream)
