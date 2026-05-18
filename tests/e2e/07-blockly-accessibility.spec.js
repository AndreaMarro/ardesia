/**
 * iter 82 Task 7 — Blockly accessibility WCAG 2.2 AA basic verification
 *
 * Uses Playwright built-in accessibility tools (NO @axe-core/playwright dep
 * per CLAUDE.md regola 13 NPM dep ratify mandate Andrea).
 *
 * Coverage:
 * - ARIA dialog role + aria-modal on ScratchOnboarding (specific selector)
 * - Escape key dismisses onboarding
 * - Toolbar buttons have aria-label Italian descriptive
 *
 * Bypasses ConsentBanner age gate via addInitScript pre-seed.
 *
 * Defer iter 83+ atom: axe-core full WCAG 2.2 AA audit (color contrast +
 * 50 rules) post Andrea ratify @axe-core/playwright devDep add.
 */
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:4173';
const ONBOARDING_DIALOG = '[role="dialog"][aria-labelledby="onboarding-title"]';

async function gotoCompileHomeWithSeed(page) {
  await page.addInitScript(() => {
    try {
      // gdprService getConsent() reads 'elab_gdpr_consent' JSON object
      localStorage.setItem('elab_gdpr_consent', JSON.stringify({
        status: 'accepted',
        timestamp: new Date().toISOString(),
        version: '1.0',
      }));
      localStorage.setItem('elab_consent_v2', 'accepted');
      sessionStorage.setItem('elab_user_age', '18');
    } catch (_) { /* defensive */ }
  });
  await page.goto(`${BASE}/#compile-home`, { waitUntil: 'domcontentloaded' });
}

test.describe('Blockly accessibility basic (no axe-core)', () => {
  test('Onboarding has ARIA dialog role + aria-modal=true', async ({ page }) => {
    await gotoCompileHomeWithSeed(page);
    const dialog = page.locator(ONBOARDING_DIALOG);
    await expect(dialog).toBeVisible({ timeout: 15000 });
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  test('Escape key dismisses onboarding', async ({ page }) => {
    await gotoCompileHomeWithSeed(page);
    const dialog = page.locator(ONBOARDING_DIALOG);
    await expect(dialog).toBeVisible({ timeout: 15000 });
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible({ timeout: 2000 });
  });

  test('Toolbar buttons have descriptive Italian aria-labels', async ({ page }) => {
    await gotoCompileHomeWithSeed(page);
    const dialog = page.locator(ONBOARDING_DIALOG);
    await expect(dialog).toBeVisible({ timeout: 15000 });
    await dialog.getByRole('button', { name: /salta/i }).click({ force: true });
    await page.waitForTimeout(800);

    const undoBtn = page.getByRole('button', { name: /annulla/i });
    const clearBtn = page.getByRole('button', { name: /svuota/i });

    await expect(undoBtn).toBeVisible();
    await expect(clearBtn).toBeVisible();

    const undoAria = await undoBtn.getAttribute('aria-label');
    const clearAria = await clearBtn.getAttribute('aria-label');
    expect(undoAria).toMatch(/annulla/i);
    expect(clearAria).toMatch(/svuota/i);
  });
});
