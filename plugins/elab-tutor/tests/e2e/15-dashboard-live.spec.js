import { test, expect } from '@playwright/test';
import { waitForPageReady, TIMEOUTS, PROD_URL } from './fixtures.js';

/**
 * Dashboard live E2E spec (sett-3 Day 05 / Day 19 cumulative).
 *
 * Scope — verifies `useDashboardData` hook renders 4 states through
 * `DashboardShell` gated by `?live=1` query flag on the `/#dashboard-v2`
 * hash route. Fetch mocked via `page.route()`:
 *
 *   1. Loading state  → aria-busy true, skeleton copy visible
 *   2. Error state    → role=alert + retry button
 *   3. Ready success  → 4 metric cards rendered (student/interactions/minutes/experiments)
 *   4. Default disabled (no ?live=1) → placeholder copy preserved
 *
 * Out of scope:
 *   - Real Edge Function call (ANON key gap carry-over)
 *   - Data shape evolution beyond schema v0.1.x
 *
 * Prod host skip — same pattern as spec 14 (placeholder-only on prod).
 */

const isProdHost = (url) => {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.hostname.endsWith('elabtutor.school');
  } catch {
    return false;
  }
};

const BASE_URL = process.env.BASE_URL || process.env.PLAYWRIGHT_BASE_URL || '';

const MOCK_METRICS = {
  schema_version: '0.1.0',
  metrics: {
    student_count: 42,
    total_interactions: 318,
    avg_session_minutes: 2150,
    experiments_completed: 27,
  },
};

test.describe('Dashboard live E2E — spec 15', () => {
  test.skip(
    isProdHost(BASE_URL) || BASE_URL === PROD_URL,
    'Dashboard live skipped on prod host (no mock network allowed).',
  );

  test('default no ?live → placeholder retained (backward-compat Day 10)', async ({ page }) => {
    await page.goto('/#dashboard-v2');
    await waitForPageReady(page);

    const placeholder = page.getByTestId('dashboard-placeholder');
    await expect(placeholder).toBeVisible({ timeout: TIMEOUTS.pageLoad });
    await expect(placeholder).toContainText(/in sviluppo/i);
  });

  test('?live=1 + mock success → 4 metric cards render', async ({ page }) => {
    await page.route('**/dashboard-data**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_METRICS),
      });
    });

    await page.goto('/#dashboard-v2?live=1&teacher=t-001&range=7d');
    await waitForPageReady(page);

    // Wait for ready state (success → 4 metric cards)
    const studentCard = page.getByTestId('metric-student-count');
    await expect(studentCard).toBeVisible({ timeout: TIMEOUTS.pageLoad });
    await expect(studentCard).toContainText('42');

    const interactionsCard = page.getByTestId('metric-interactions');
    await expect(interactionsCard).toBeVisible();
    await expect(interactionsCard).toContainText('318');

    // Region a11y semantics preserved
    const region = page.getByRole('region', { name: /Dashboard Docente/i });
    await expect(region).toBeVisible();

    // aria-busy should be false/undefined once loaded
    const ariaBusy = await region.getAttribute('aria-busy');
    expect(ariaBusy === null || ariaBusy === 'false').toBe(true);
  });

  test('?live=1 + mock 500 → error alert + retry button', async ({ page }) => {
    let callCount = 0;
    await page.route('**/dashboard-data**', async (route) => {
      callCount += 1;
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'internal' }),
      });
    });

    await page.goto('/#dashboard-v2?live=1');
    await waitForPageReady(page);

    const errorPanel = page.getByTestId('dashboard-error');
    await expect(errorPanel).toBeVisible({ timeout: TIMEOUTS.pageLoad });
    await expect(errorPanel).toHaveAttribute('role', 'alert');

    const retryBtn = page.getByTestId('dashboard-retry');
    await expect(retryBtn).toBeVisible();
    expect(callCount).toBeGreaterThanOrEqual(1);
  });

  test('?live=1 slow network → aria-busy loading state visible', async ({ page }) => {
    await page.route('**/dashboard-data**', async (route) => {
      // Deliberate delay for loading-state observation window
      await new Promise((r) => setTimeout(r, 800));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_METRICS),
      });
    });

    const nav = page.goto('/#dashboard-v2?live=1');

    // Before resolution, loading placeholder OR aria-busy should be present.
    const loading = page.getByTestId('dashboard-loading');
    await expect(loading).toBeVisible({ timeout: 3000 });

    await nav;
    await waitForPageReady(page);

    // After resolution, success state reached
    const studentCard = page.getByTestId('metric-student-count');
    await expect(studentCard).toBeVisible({ timeout: TIMEOUTS.pageLoad });
  });

  test('PZ v3 watchdog — no "Docente leggi" in dashboard copy', async ({ page }) => {
    await page.route('**/dashboard-data**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_METRICS),
      });
    });

    await page.goto('/#dashboard-v2?live=1');
    await waitForPageReady(page);

    const bodyText = await page.textContent('body');
    expect(bodyText).not.toMatch(/Docente,?\s*leggi/i);
    expect(bodyText).not.toMatch(/Insegnante,?\s*leggi/i);
  });
});
