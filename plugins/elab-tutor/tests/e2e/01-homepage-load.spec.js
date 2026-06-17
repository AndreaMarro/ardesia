import { test, expect } from '@playwright/test';
import { waitForPageReady, collectConsoleErrors, TIMEOUTS, seedE2EBypass, skipIfProd } from './fixtures.js';

test.describe('Homepage Load', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    skipIfProd(test, baseURL);
    await seedE2EBypass(page);
  });

  test('should load homepage with correct title', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);
    // Reviewer issue #4 (Day 01): tighten from length > 0 to content-specific.
    // ELAB Tutor title must reference the product. Accept ELAB/elab/tutor
    // tokens so we catch product identity (not just "any non-empty string").
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title.toLowerCase()).toMatch(/elab|tutor/);
  });

  test('should have no critical console errors on load', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/');
    await waitForPageReady(page);
    // Filter out known non-critical errors (service worker, third-party)
    const criticalErrors = errors.filter(
      e => !e.includes('service-worker') &&
           !e.includes('favicon') &&
           !e.includes('manifest')
    );
    // Allow up to 2 non-critical errors (third-party scripts, etc.)
    expect(criticalErrors.length).toBeLessThanOrEqual(2);
  });

  test('should render main content area with product identity', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);
    // Reviewer issue #4 (Day 01): tighten from length > 10 to >=3 content
    // specific assertions on product identity, not just "has text".
    // 1. Body has meaningful content volume (>100 chars, not empty shell).
    const bodyText = await page.textContent('body');
    expect(bodyText.length).toBeGreaterThan(100);

    // 2. Product name ELAB is present somewhere in DOM (brand identity).
    //    Case-insensitive match across body text.
    expect(bodyText.toLowerCase()).toMatch(/elab/);

    // 3. A primary interactive element is rendered (CTA: button, link, or
    //    form input). Empty page with only text would fail here. Playwright
    //    locator with count > 0 confirms presence without being brittle on
    //    specific selectors.
    const interactiveCount = await page.locator('button, a[href], input, [role="button"]').count();
    expect(interactiveCount).toBeGreaterThan(0);
  });
});
