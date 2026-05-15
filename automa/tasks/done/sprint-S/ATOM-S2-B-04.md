---
id: ATOM-S2-B-04
parent_task: B
sprint: S
iter: 2
assignee: generator-test-opus
depends_on:
  - ATOM-S2-B-01
  - ATOM-S2-B-02
  - ATOM-S2-B-03
est_hours: 2
files_owned:
  - tests/e2e/11-modalita-citazioni-inline.spec.js
acceptance_criteria:
  - First Playwright e2e spec scaffolded (was 0 in tests/e2e/ per CLAUDE.md gap #2)
  - Scenario: open prod (or local dev) → switch Lavagna percorso mode → click Capitoli → select Cap 6 LED → verify PercorsoCapitoloView mounts → scroll to exp1 narrative → click VolumeCitation → assert VolumeViewer opens at Vol.1 pag.27
  - Uses Playwright API @playwright/test
  - Has skip flag if dev server not running (graceful CI failure handling)
  - Documented in tests/e2e/README.md (create if absent — but ownership scribe-opus, so just leave note in spec header)
  - 1x manual run with `npx playwright test tests/e2e/11-modalita-citazioni-inline.spec.js` PASS at least once locally
references:
  - ATOM-S2-B-01, B-02, B-03 wire-up
  - master plan §5.4 user flow steps 1-7
  - CLAUDE.md tests/e2e structure
---

## Task

Write `tests/e2e/11-modalita-citazioni-inline.spec.js`. This is the FIRST e2e spec in the project (gap #2).

## Test scaffold

```js
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

test.describe('Modalità Citazioni Inline (Sprint S iter 2 Task B)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Skip gracefully if app not running
    const title = await page.title().catch(() => null);
    test.skip(!title, 'Dev server not running, skipping e2e');
  });

  test('docente flow: Capitolo 6 LED → click citazione → VolumeViewer Vol.1 pag.27', async ({ page }) => {
    // 1. Open Lavagna tab
    await page.getByRole('tab', { name: /lavagna/i }).click();
    // 2. Switch to percorso mode
    await page.getByRole('button', { name: /percorso/i }).click();
    // 3. Click Capitoli button
    await page.getByRole('button', { name: /capitoli/i }).click();
    // 4. Select Cap 6 LED
    await page.getByRole('button', { name: /capitolo 6.*led/i }).click();
    // 5. Assert PercorsoCapitoloView visible
    await expect(page.getByTestId('percorso-capitolo-view')).toBeVisible();
    // 6. Scroll to exp1 + click VolumeCitation
    await page.getByText(/Il LED è un diodo che emette luce/).scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: /Vol\.1 pag\.27/i }).click();
    // 7. Assert VolumeViewer opens
    await expect(page.getByTestId('volume-viewer-side-panel')).toBeVisible();
    await expect(page.getByText(/pag\. 27/i)).toBeVisible();
  });
});
```

NOTE: data-testid attributes need to be added to PercorsoCapitoloView and the volume side-panel — coordinate with generator-app-opus to add `data-testid="percorso-capitolo-view"` and `data-testid="volume-viewer-side-panel"`.

## CoV

- 1x local PASS (spec runs, no flakes)
- baseline vitest ≥12498 (e2e doesn't change vitest count)
- npm run build PASS
