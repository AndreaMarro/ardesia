---
atom_id: ATOM-S6-A1
sprint: S
iter: 6
priority: P0
assigned_to: architect-opus
depends_on: []
provides:
  - docs/adrs/ADR-012-vision-e2e-playwright-design-2026-04-26.md
acceptance_criteria:
  - file ~400 righe markdown
  - YAML frontmatter (status, date, deciders, context)
  - sections: Context, Decision, Consequences, Implementation, Test Plan, Rollback
  - design Gemini Vision EU (no GPU dependency, no Qwen-VL pod)
  - flow: Playwright captureScreenshot → POST unlim-diagnose Edge Function → assertion JSON {hasErrors, components, suggestions}
  - 5+ test cases Playwright spec definiti (LED+resistor, breadboard vuota, wire crossing, polarity wrong, capstone MOSFET)
  - alternatives evaluated (Qwen-VL local, GPT-4 Vision, Anthropic Vision) con rationale Gemini choice
  - cost estimate Gemini Vision per request (~$0.001)
  - timeline iter 6 P0
  - CoV checklist (vitest baseline preserved, build PASS)
estimate_hours: 3.0
ownership: architect-opus writes ONLY docs/adrs/ + automa/team-state/messages/architect-*.md
---

## Task

Design ADR-012 Vision E2E Playwright spec — Gemini Vision EU primary, no GPU.

## Deliverables

- `docs/adrs/ADR-012-vision-e2e-playwright-design-2026-04-26.md` (~400 righe)

## Hard rules

- NO writes outside docs/adrs/ + messages
- NO code changes (read-only su src/, tests/, supabase/)
- Caveman ON
- 3x CoV before claim done

## Iter 6 link

Box 7 Vision flow live: 0 → 0.7 (post implementation iter 6 P0)
