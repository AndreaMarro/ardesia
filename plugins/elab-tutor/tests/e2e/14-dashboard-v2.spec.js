import { test, expect } from '@playwright/test';
import { waitForPageReady, collectConsoleErrors, TIMEOUTS, PROD_URL } from './fixtures.js';

/**
 * Dashboard v2 E2E smoke spec (Day 12 / sett-2 Day 05).
 *
 * Scope — SCAFFOLD smoke only (DashboardShell placeholder):
 *   - verify `/#dashboard-v2` hash route resolves to DashboardShell,
 *   - assert placeholder heading renders ("Dashboard Docente"),
 *   - assert region a11y semantics (role=region, aria-label),
 *   - assert URL hash persists across navigation,
 *   - assert no uncaught page errors / console errors bubble up.
 *
 * Out of scope (Day 13+ feature logic):
 *   - Supabase data wiring,
 *   - real teacher/student aggregation,
 *   - chart render,
 *   - export CSV.
 *
 * Production host guard: skip on elabtutor.school prod (placeholder
 * may already be hot-swapped by deploy-time flag; smoke is local-focused).
 *
 * Principle Zero v3 compliance: dashboard copy must never address the
 * teacher directly as "Docente, leggi".
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

test.describe('Dashboard-v2 E2E Scaffold', () => {
  test.skip(
    isProdHost(BASE_URL) || BASE_URL === PROD_URL,
    'Dashboard-v2 smoke skipped on prod host (placeholder-only route).',
  );

  test('should resolve #dashboard-v2 hash route to DashboardShell placeholder', async ({ page }) => {
    const consoleErrors = collectConsoleErrors(page);
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/#dashboard-v2');
    await waitForPageReady(page);

    // Placeholder heading is the Day 10 scaffold assertion target.
    // DashboardShell renders <h1>Dashboard Docente</h1> + a descriptive paragraph.
    const heading = page.getByRole('heading', { name: /Dashboard Docente/i, level: 1 });
    await expect(heading).toBeVisible({ timeout: TIMEOUTS.pageLoad });

    // Region a11y semantics required by DashboardShell (role + aria-label).
    const region = page.getByRole('region', { name: /Dashboard Docente/i });
    await expect(region).toBeVisible();

    // URL hash persists (did not get silently rewritten by router).
    const hash = await page.evaluate(() => window.location.hash);
    expect(hash).toBe('#dashboard-v2');

    // PZ v3 watchdog: dashboard copy must never meta-instruct the teacher.
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toMatch(/Docente,?\s*leggi/i);
    expect(bodyText).not.toMatch(/Insegnante,?\s*leggi/i);

    // No uncaught page errors from rendering the lazy-loaded DashboardShell.
    const criticalPageErrors = pageErrors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error'),
    );
    expect(criticalPageErrors).toEqual([]);

    // Console errors: tolerate benign dev warnings (PWA precache, etc.)
    // but block anything matching "Dashboard" or "TypeError" patterns.
    const criticalConsole = consoleErrors.filter(
      (e) => /dashboard|typeerror|cannot read/i.test(e) && !/precache/i.test(e),
    );
    expect(criticalConsole).toEqual([]);
  });

  test('should render placeholder body copy ("In sviluppo")', async ({ page }) => {
    // Explicit placeholder-copy smoke: if Day 13+ feature logic lands without
    // removing this copy, test still passes; if copy text changes, test fails
    // loudly — acts as a change detector before feature integration.
    await page.goto('/#dashboard-v2');
    await waitForPageReady(page);

    const bodyText = await page.textContent('body');
    // Accept either the scaffold copy OR a future real dashboard label.
    // Failing assertion below = someone removed placeholder AND did not
    // provide a substitute semantic anchor — that's the regression we guard.
    const hasScaffoldCopy = /in sviluppo/i.test(bodyText);
    const hasRealDashboard = /(progress|studenti|classi|export)/i.test(bodyText);
    expect(hasScaffoldCopy || hasRealDashboard).toBe(true);
  });

  test('should persist hash on reload (no silent redirect)', async ({ page }) => {
    await page.goto('/#dashboard-v2');
    await waitForPageReady(page);

    await page.reload();
    await waitForPageReady(page);

    // After reload the hash route must still resolve to DashboardShell.
    const hash = await page.evaluate(() => window.location.hash);
    expect(hash).toBe('#dashboard-v2');

    const heading = page.getByRole('heading', { name: /Dashboard Docente/i, level: 1 });
    await expect(heading).toBeVisible({ timeout: TIMEOUTS.pageLoad });
  });
});
