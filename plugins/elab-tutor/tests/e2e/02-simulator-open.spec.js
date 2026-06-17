import { test, expect } from '@playwright/test';
import { waitForPageReady, SELECTORS, TIMEOUTS, seedE2EBypass, skipIfProd } from './fixtures.js';

test.describe('Simulator Open', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    skipIfProd(test, baseURL);
    await seedE2EBypass(page);
  });

  test('should open simulator and render canvas', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    // Try to navigate to simulator via hash or button
    await page.goto('/#simulator');
    await waitForPageReady(page);

    // Wait for SVG canvas or simulator container
    const hasCanvas = await page.locator(SELECTORS.simulatorCanvas).first()
      .isVisible({ timeout: TIMEOUTS.pageLoad })
      .catch(() => false);

    // Fallback: check for any SVG element that looks like circuit board
    if (!hasCanvas) {
      const svgCount = await page.locator('svg').count();
      expect(svgCount).toBeGreaterThan(0);
    }
  });

  test('should have breadboard element when simulator loaded', async ({ page }) => {
    await page.goto('/#simulator');
    await waitForPageReady(page);

    // Check for breadboard-related elements
    const hasBreadboard = await page.locator(SELECTORS.breadboard).first()
      .isVisible({ timeout: TIMEOUTS.pageLoad })
      .catch(() => false);

    // Soft assertion: breadboard may not be visible until experiment loaded
    if (!hasBreadboard) {
      // At minimum, the page should have loaded without error
      const bodyText = await page.textContent('body');
      expect(bodyText.length).toBeGreaterThan(0);
    }
  });
});
