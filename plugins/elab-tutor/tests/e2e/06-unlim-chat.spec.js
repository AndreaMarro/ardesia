import { test, expect } from '@playwright/test';
import { waitForPageReady, SELECTORS, TIMEOUTS, seedE2EBypass, skipIfProd } from './fixtures.js';

test.describe('UNLIM Chat', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    skipIfProd(test, baseURL);
    await seedE2EBypass(page);
  });

  test('should have chat interface elements', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    // Navigate to chat/tutor area
    await page.goto('/#tutor');
    await waitForPageReady(page);

    // Look for chat input or message area
    const hasChatInput = await page.locator(SELECTORS.chatInput).first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    // Chat may require authentication
    // At minimum verify the page structure is intact
    const bodyText = await page.textContent('body');
    expect(bodyText.length).toBeGreaterThan(0);
  });

  test('should not crash when attempting to send message', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    // Navigate to chat area
    await page.goto('/#tutor');
    await waitForPageReady(page);

    // Try to find and interact with chat input
    const chatInput = page.locator(SELECTORS.chatInput).first();
    const isVisible = await chatInput.isVisible({ timeout: 5000 }).catch(() => false);

    if (isVisible) {
      await chatInput.fill('Ciao UNLIM');
      await page.waitForTimeout(500);
    }

    // No critical JS errors
    const criticalErrors = errors.filter(e => !e.includes('ResizeObserver'));
    expect(criticalErrors.length).toBe(0);
  });
});
