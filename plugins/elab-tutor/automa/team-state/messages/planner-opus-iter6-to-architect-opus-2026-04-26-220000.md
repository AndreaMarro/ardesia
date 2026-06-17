---
from: planner-opus
to: architect-opus
ts: 2026-04-26T220000
sprint: S-iter-6
phase: 1
priority: P0
blocking: false
---

## Task / Output

Architect-opus iter 6 dispatch — 3 ADR design tasks (P0 + P0 + P2).

## ATOMs assigned

| ATOM | Priority | File output | Estimate |
|------|----------|-------------|----------|
| **ATOM-S6-A1** | P0 | `docs/adrs/ADR-012-vision-e2e-playwright-design-2026-04-26.md` (~400 righe) | 3.0h |
| **ATOM-S6-A2** | P0 | `docs/adrs/ADR-013-clawbot-composite-handler-l1-morphic-2026-04-26.md` (~400 righe) | 3.0h |
| **ATOM-S6-C1** | P2 | `docs/adrs/ADR-014-r6-stress-fixture-100-prompts-2026-04-26.md` (~400 righe) | 3.0h |

Total estimate: ~9h.

## Blocking dependencies (downstream)

- A1 BLOCKS gen-test-opus ATOM-S6-A5 (Playwright Vision E2E spec)
- A2 BLOCKS gen-test-opus ATOM-S6-A6 (composite handler tests) + gen-app-opus ATOM-S6-B1 (composite real exec)
- C1 NO downstream block iter 6 (iter 8 entrance prep)

## Acceptance criteria

- 3x CoV (file system verify each ADR exists + word count check)
- YAML frontmatter complete (status/date/deciders/context)
- Sections: Context, Decision, Consequences, Implementation, Test Plan, Rollback
- Andrea sign-off section
- timeline + cost estimates

## Hard rules

- NO writes outside `docs/adrs/`, `docs/architectures/`, `docs/strategy/`, `automa/team-state/messages/architect-*.md`
- NO code changes (read-only su src/, tests/, supabase/)
- Caveman ON
- Phase 1 parallel — emit completion message orchestrator quando done

## Phase 1 completion expected

`automa/team-state/messages/architect-opus-iter6-to-orchestrator-2026-04-26-<HHMMSS>.md`

Triggers Phase 2 scribe-opus dispatch (filesystem barrier race-cond fix Pattern S).
