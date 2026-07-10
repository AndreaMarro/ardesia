# P30 Free-Manipulation — RED FIRST (TDD proof)

Test written BEFORE any source change. First run = RED, as required.

- Command: `npx playwright test e2e/p30-free-manipulation.spec.ts` (no `--project` — config has a single unnamed project; `--project=chromium` errors "not found").
- Result: **1 failed** (exit 1).
- First failing assertion (spec line 43):
  ```
  Error: expect(locator).toBeVisible() failed
  Locator: locator('[data-simulation-free-mode]').first()
  Error: element(s) not found
    waiting for locator('[data-simulation-free-mode]').first()
  ```
- Interpretation: the DOM contract `[data-simulation-free-mode]` (solve badge / break control / diagnostic / scene digest) does not exist yet. Confirms the gap identified in the plan. No source was modified before this RED.

Evidence: `/tmp/p30-free-manipulation-red.log`.
