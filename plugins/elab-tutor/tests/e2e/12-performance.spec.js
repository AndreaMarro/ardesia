import { test, expect } from '@playwright/test';
import { collectConsoleErrors } from './fixtures.js';

test.describe('Performance', () => {
  test('should load page in under 5 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000);
  });

  test('should have no JS errors in first 3 seconds', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push({ time: Date.now(), message: err.message }));

    const startTime = Date.now();
    await page.goto('/');
    await page.waitForTimeout(3000);

    const earlyErrors = errors
      .filter(e => e.time - startTime < 3000)
      .filter(e => !e.message.includes('ResizeObserver') && !e.message.includes('Non-Error'));

    expect(earlyErrors.length).toBe(0);
  });

  test('should not have excessive DOM nodes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => {});

    const nodeCount = await page.evaluate(() => {
      return document.querySelectorAll('*').length;
    });

    // Reasonable DOM size for a SPA (under 5000 nodes on homepage)
    expect(nodeCount).toBeLessThan(5000);
  });
});
