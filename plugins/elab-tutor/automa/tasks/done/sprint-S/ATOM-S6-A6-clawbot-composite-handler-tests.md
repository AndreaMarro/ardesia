---
atom_id: ATOM-S6-A6
sprint: S
iter: 6
priority: P0
assigned_to: generator-test-opus
depends_on:
  - ATOM-S6-A2
provides:
  - scripts/openclaw/composite-handler.test.ts
acceptance_criteria:
  - vitest spec `scripts/openclaw/composite-handler.test.ts` NEW
  - 8 test cases (per ADR-013 design):
    1. analyzeImage happy path (screenshot OK + Vision OK + diagnose OK)
    2. screenshot fail → throw + audit log
    3. Vision API timeout → fallback message
    4. diagnose 500 → return partial result {hasErrors: 'unknown'}
    5. component highlights wired (Vision suggestion → highlightComponent call)
    6. composite handler dispatch via dispatcher.ts (route key `analyzeImage`)
    7. feature flag VITE_ENABLE_CLAWBOT_COMPOSITE=false → fallback simple
    8. audit log entry inserted (composite_handler_log table)
  - mock fetch + mock window.__ELAB_API.captureScreenshot
  - vitest config openclaw (`vitest.openclaw.config.ts`)
  - 8/8 PASS
estimate_hours: 3.0
ownership: generator-test-opus
---

## Task

ClawBot composite handler tests (analyzeImage = captureScreenshot + Vision + diagnose).

## Deliverables

- `scripts/openclaw/composite-handler.test.ts` (NEW)

## Hard rules

- depend ATOM-S6-A2 (ADR-013 design first)
- NO writes src/, supabase/
- 3x CoV

## Iter 6 link

Box 10 ClawBot composite handler tested 0.3 → 0.5 (real exec ATOM-S6-B1 lifts further → 0.6).
