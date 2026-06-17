---
atom_id: ATOM-S6-A2
sprint: S
iter: 6
priority: P0
assigned_to: architect-opus
depends_on: []
provides:
  - docs/adrs/ADR-013-clawbot-composite-handler-l1-morphic-2026-04-26.md
acceptance_criteria:
  - file ~400 righe markdown
  - YAML frontmatter (status, date, deciders, context)
  - sections: Context, Decision, Consequences, Implementation, Test Plan, Rollback
  - L1 morphic composite handler design (analyzeImage = captureScreenshot + Vision + diagnose)
  - flow chart text + box-arrow ascii
  - integration con `multimodalRouter.routeVision()` e `dispatcher.ts` ClawBot
  - error handling (screenshot fail, Vision API timeout, diagnose 500)
  - rollback strategy (feature flag VITE_ENABLE_CLAWBOT_COMPOSITE)
  - 8 test cases unit (composite happy path + 7 error/edge)
  - Andrea sign-off section
  - timeline iter 6 P1 (composite real exec depends ADR design first)
estimate_hours: 3.0
ownership: architect-opus writes ONLY docs/adrs/ + automa/team-state/messages/architect-*.md
---

## Task

Design ADR-013 ClawBot composite handler L1 morphic — analyzeImage = captureScreenshot + Vision + diagnose.

## Deliverables

- `docs/adrs/ADR-013-clawbot-composite-handler-l1-morphic-2026-04-26.md` (~400 righe)

## Hard rules

- NO writes outside docs/adrs/ + messages
- Caveman ON
- 3x CoV

## Iter 6 link

Box 10 ClawBot 80-tool live: 0.3 → 0.6 (post composite handler real exec iter 6 P1)
