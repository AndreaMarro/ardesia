---
atom_id: ATOM-S6-C3
sprint: S
iter: 6
priority: P2
assigned_to: orchestrator
phase: 3
depends_on:
  - ATOM-S6-C2
provides:
  - docs/audits/iter8-stress-prod-2026-04-26.png (Playwright screenshot)
  - docs/audits/2026-04-26-sprint-s-iter8-stress-prod.md
acceptance_criteria:
  - Playwright + Control Chrome MCP smoke prod `https://www.elabtutor.school`
  - HTTP 200 home + /lavagna route
  - UNLIM chat 3 prompts response received
  - console errors == 0
  - Vision flow E2E test (LED+resistor → diagnose) PASS
  - TTS playback test (Isabella voice → audio MP3 valid)
  - screenshot evidence
  - audit doc ~150 righe (results + screenshots + score impact iter 8 entrance gate)
  - /quality-audit run + score 10 boxes ONESTO
estimate_hours: 2.5
ownership: orchestrator (Phase 3 final CoV)
---

## Task

Stress test prod Playwright + Control Chrome MCP iter 8 entrance gate (per SPEC iter 4 §11).

## Deliverables

- `docs/audits/iter8-stress-prod-2026-04-26.png`
- `docs/audits/2026-04-26-sprint-s-iter8-stress-prod.md`

## Hard rules

- Phase 3 SEQUENTIAL — wait Phase 2 scribe complete
- 3x CoV final
- NO main push

## Iter 6 link

Iter 8 entrance gate — Vision E2E + TTS prod smoke test.
