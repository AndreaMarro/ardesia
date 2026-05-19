/**
 * iter 82 Task 7 — Blockly first-block-60s kid persona
 *
 * Goal-driven validation: kid 8-14 navigates HomePage #compile-home, sees
 * ScratchOnboarding overlay (PRINCIPIO ZERO "Ragazzi" + kit fisico), dismisses
 * via Salta button, Blockly mounts with toolbar visible — under 60s wall clock.
 *
 * Bypasses ConsentBanner age gate via addInitScript localStorage pre-seed
 * (runs BEFORE page navigation — ConsentBanner reads localStorage on mount,
 * preventing banner render). Direct goto #compile-home triggers HomePage
 * hash routing → lazy HomeCompileEntry mount → ScratchEditor → ScratchOnboarding.
 *
 * Runs against built bundle via vite preview (config playwright.iter82-blockly-ux.config.js).
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
      // ConsentBanner internal CONSENT_KEY
      localStorage.setItem('elab_consent_v2', 'accepted');
      sessionStorage.setItem('elab_user_age', '18');
    } catch (_) { /* defensive */ }
  });
  await page.goto(`${BASE}/#compile-home`, { waitUntil: 'domcontentloaded' });
}

test.describe('Blockly first-block <60s kid persona', () => {
  test('Child sees onboarding, dismisses, toolbar visible — <60s', async ({ page }) => {
    const start = Date.now();
    await gotoCompileHomeWithSeed(page);

    const onboardingDialog = page.locator(ONBOARDING_DIALOG);
    await expect(onboardingDialog).toBeVisible({ timeout: 15000 });

    const text = await onboardingDialog.textContent();
    expect(text).toMatch(/ragazzi/i);
    expect(text).toMatch(/kit/i);

    await onboardingDialog.getByRole('button', { name: /salta/i }).click({ force: true });
    await page.waitForTimeout(800); // allow React state update + DOM unmount
    await expect(onboardingDialog).not.toBeVisible({ timeout: 5000 });

    await expect(page.getByRole('button', { name: /annulla/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /svuota/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /aiuto/i })).toBeVisible();

    // Blockly mount proof via ARIA tree (Blockly v12 toolbox uses role="tree"
    // — internal CSS class .blocklyToolboxDiv unreliable across obfuscator builds).
    await expect(page.getByRole('tree').first()).toBeVisible({ timeout: 10000 });

    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(60000);
    console.log(`[06-first-block-60s] Elapsed: ${elapsed}ms (target <60000ms)`);
  });

  test('Onboarding persists across page reload (localStorage flag)', async ({ page }) => {
    await gotoCompileHomeWithSeed(page);

    const onboardingDialog = page.locator(ONBOARDING_DIALOG);
    await expect(onboardingDialog).toBeVisible({ timeout: 15000 });
    await onboardingDialog.getByRole('button', { name: /salta/i }).click();

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(onboardingDialog).not.toBeVisible({ timeout: 5000 });
  });
});
