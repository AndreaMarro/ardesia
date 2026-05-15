---
atom_id: ATOM-S6-A5
sprint: S
iter: 6
priority: P0
assigned_to: generator-test-opus
depends_on:
  - ATOM-S6-A1
provides:
  - tests/e2e/02-vision-flow.spec.js
acceptance_criteria:
  - Playwright spec `tests/e2e/02-vision-flow.spec.js` NEW
  - 5+ test cases:
    1. LED + resistor breadboard → Vision diagnose returns hasErrors=false
    2. breadboard vuota → Vision returns components=[]
    3. wire crossing detected → suggestions contain "fili sovrapposti"
    4. polarity wrong (LED rovescio) → hasErrors=true, suggestion "anodo/catodo"
    5. capstone MOSFET pin orientation → Vision suggests gate/drain/source labels
  - flow per test:
    1. browser.newPage()
    2. await page.goto('/lavagna')
    3. mount fixture circuit (via __ELAB_API.mountExperiment(id))
    4. await __ELAB_API.captureScreenshot()
    5. POST screenshot to unlim-diagnose Edge Function
    6. assert response JSON shape
  - skip se ELAB_API_KEY missing (CI/local dev compatibility)
  - timeout 30s per test
  - retry 1x on failure (Vision API flake tolerance)
  - artifacts: screenshot saved on failure
estimate_hours: 3.5
ownership: generator-test-opus writes ONLY tests/, scripts/openclaw/*.test.ts, scripts/bench/, automa/team-state/messages/gen-test-*.md
---

## Task

Playwright Vision E2E spec — 5+ test cases per ADR-012 design.

## Deliverables

- `tests/e2e/02-vision-flow.spec.js` (NEW)

## Hard rules

- depend ATOM-S6-A1 (ADR-012 must exist first per design contract)
- NO writes src/, supabase/
- 3x CoV (vitest baseline preserved)

## Iter 6 link

Box 7 Vision flow live: 0 → 0.7 post Playwright spec PASS.
