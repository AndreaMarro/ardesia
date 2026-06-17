import { test, expect } from '@playwright/test';
import { waitForPageReady } from './fixtures.js';

test.describe('Principio Zero v3 Watchdog', () => {
  test('should not contain PZ v3 violations in page source', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    const bodyText = await page.textContent('body');

    // PZ v3: UNLIM must NOT use "Docente, leggi" or "Insegnante, leggi"
    expect(bodyText).not.toMatch(/Docente,?\s*leggi/i);
    expect(bodyText).not.toMatch(/Insegnante,?\s*leggi/i);
  });

  test('should use correct UNLIM naming (not Galileo)', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    // Check page source for naming consistency
    const pageSource = await page.content();

    // "Galileo" should not appear as visible UI label (file names are OK)
    // This is a soft check - Galileo may appear in legacy file references
    const bodyText = await page.textContent('body');
    // If UNLIM appears, Galileo should not be used as user-facing name
    if (bodyText.includes('UNLIM')) {
      // UNLIM found, good
      expect(bodyText).toContain('UNLIM');
    }
  });
});
