import { test, expect } from '@playwright/test';
import { waitForPageReady, VIEWPORTS } from './fixtures.js';

test.describe('Responsive Layout', () => {
  test('should render correctly at tablet viewport (768px)', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.tablet);
    await page.goto('/');
    await waitForPageReady(page);

    // Page should not have horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth + 10;
    });
    expect(hasHorizontalScroll).toBe(false);

    // Body should have content
    const bodyText = await page.textContent('body');
    expect(bodyText.length).toBeGreaterThan(0);
  });

  test('should render correctly at desktop viewport (1024px)', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    await waitForPageReady(page);

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth + 10;
    });
    expect(hasHorizontalScroll).toBe(false);
  });

  test('should render correctly at mobile viewport (375px)', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/');
    await waitForPageReady(page);

    // No JS errors at mobile size
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.waitForTimeout(1000);

    const criticalErrors = errors.filter(e => !e.includes('ResizeObserver'));
    expect(criticalErrors.length).toBe(0);
  });
});
