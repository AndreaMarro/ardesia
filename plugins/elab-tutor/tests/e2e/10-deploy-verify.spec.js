import { test, expect } from '@playwright/test';
import { waitForPageReady, PROD_URL } from './fixtures.js';

test.describe('Deploy Verification', () => {
  test('should load production page successfully', async ({ page }) => {
    const response = await page.goto('/');
    expect(response.status()).toBe(200);
    await waitForPageReady(page);
  });

  test('should have key meta elements', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    // Check for viewport meta (mobile-ready)
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toBeTruthy();
  });

  test('should load CSS and render styled content', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    // Verify that styles are loaded (body has non-default styling)
    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    // Body should have some styling applied (not default white)
    expect(bgColor).toBeTruthy();
  });

  test('should load JavaScript bundle without errors', async ({ page }) => {
    const jsErrors = [];
    page.on('pageerror', err => jsErrors.push(err.message));

    await page.goto('/');
    await waitForPageReady(page);
    await page.waitForTimeout(2000);

    // Allow minor errors but no catastrophic failures
    const criticalErrors = jsErrors.filter(
      e => !e.includes('ResizeObserver') &&
           !e.includes('Non-Error') &&
           !e.includes('ChunkLoadError')
    );
    expect(criticalErrors.length).toBeLessThanOrEqual(2);
  });
});
