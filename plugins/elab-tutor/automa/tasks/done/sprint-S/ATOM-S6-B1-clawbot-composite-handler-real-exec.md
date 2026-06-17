---
atom_id: ATOM-S6-B1
sprint: S
iter: 6
priority: P1
assigned_to: generator-app-opus
depends_on:
  - ATOM-S6-A2
  - ATOM-S6-A6
provides:
  - scripts/openclaw/composite-handler.ts
acceptance_criteria:
  - `scripts/openclaw/composite-handler.ts` NEW
  - export `analyzeImage(opts: {experimentId?: string})` async returns `{hasErrors, components, suggestions}`
  - composes: window.__ELAB_API.captureScreenshot() + multimodalRouter.routeVision(blob) + (optional) routeDiagnose(visionResult)
  - L1 morphic: declarative composition, no dynamic JS
  - feature flag check `VITE_ENABLE_CLAWBOT_COMPOSITE`
  - audit log helper writeCompositeAuditLog (Supabase composite_handler_log)
  - integration con dispatcher.ts (register route 'analyzeImage')
  - all 8 tests ATOM-S6-A6 PASS
  - error handling per ADR-013 (try/catch + partial result)
estimate_hours: 3.5
ownership: generator-app-opus writes ONLY src/, scripts/openclaw/, supabase/, messages
---

## Task

ClawBot composite handler real exec (`analyzeImage`).

## Deliverables

- `scripts/openclaw/composite-handler.ts` (NEW)

## Hard rules

- depend ATOM-S6-A2 design + ATOM-S6-A6 tests (TDD red-green: tests first then impl)
- 3x CoV
- NO main push

## Iter 6 link

Box 10 ClawBot 80-tool dispatcher 0.3 → 0.6 (composite handler L1 morphic real exec).
