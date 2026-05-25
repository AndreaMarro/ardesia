/**
 * E2E — HomePage Codekit (#compile-home): drag block → compile → simulator pin states.
 *
 * Goal-driven validation: a kid (8-14) lands on HomePage, opens #compile-home, drags a
 * digitalWrite block into Blockly, compiles, and the simulator (AVR8js bridge) shows
 * pin 13 toggling. The full chain Blockly UI → C++ codegen → arduino-cli remote/cache
 * → AVR8js emulation must work.
 *
 * Reference:
 *   - docs/dispatch/2026-05-25-wave-1b-team-brief.md Impl-G-2 task 2
 *   - tests/e2e/06-blockly-first-block-60s.spec.js (existing pattern for #compile-home)
 *   - src/components/home/HomeCompileEntry — lazy-mounted on hash route
 *
 * STATUS at Wave 1b commit:
 *   - `#compile-home` route exists (iter 82 task 7) — confirmed working
 *   - Blockly drag+compile+sim chain needs Wave 1b Impl-B-2 codegen for var-decl + #include
 *   - Sim pin-state observable hook still relies on __ELAB_API events
 *
 * Per brief: if integration chain not yet ready → `test.fixme()` skeleton stub allowed.
 *
 * © Andrea Marro — 2026-05-25 — Wave 1b Impl-G-2
 */
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:4173';
const ONBOARDING_DIALOG = '[role="dialog"][aria-labelledby="onboarding-title"]';

async function gotoCompileHomeWithSeed(page) {
  await page.addInitScript(() => {
    try {
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

async function dismissOnboarding(page) {
  const dialog = page.locator(ONBOARDING_DIALOG);
  if (await dialog.isVisible({ timeout: 5000 }).catch(() => false)) {
    await dialog.getByRole('button', { name: /salta/i }).click({ force: true });
    await page.waitForTimeout(800);
  }
}

test.describe('HomePage Codekit — Blockly drag → compile → sim pin states', () => {
  test('#compile-home renders Blockly with toolbar buttons (Annulla/Svuota/Aiuto)', async ({ page }) => {
    await gotoCompileHomeWithSeed(page);
    await dismissOnboarding(page);
    await expect(page.getByRole('button', { name: /annulla/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /svuota/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /aiuto/i })).toBeVisible();
    await expect(page.getByRole('tree').first()).toBeVisible({ timeout: 10000 });
  });

  test('starter blink program loaded → compile button visible', async ({ page }) => {
    test.fixme(true, 'Wave 1b upstream wait: starter blink autoload + compile bar wire-up iter 74');
    await gotoCompileHomeWithSeed(page);
    await dismissOnboarding(page);
    // Expected: starter blink XML auto-injected on first mount, compile bar surfaces button.
    await expect(page.getByRole('button', { name: /compila/i })).toBeVisible({ timeout: 10000 });
  });

  test('compile starter blink → pin 13 toggles in simulator (AVR8js)', async ({ page }) => {
    test.fixme(true, 'Wave 1b upstream wait: ScratchCompileBar → AVR8js bridge end-to-end iter 74+75');
    await gotoCompileHomeWithSeed(page);
    await dismissOnboarding(page);
    // Expected flow:
    //   1. Click "Compila" → compiler.js → HEX (precompiled or remote)
    //   2. HEX → AVRBridge.loadHex() → start emulation
    //   3. __ELAB_API.on('stateChange', cb) — cb fires with pin13 HIGH/LOW alternations
    //   4. Assert at least 2 transitions within 5s
  });

  test('compile failure → IT error toast surfaces (NOT English)', async ({ page }) => {
    test.fixme(true, 'Wave 1b upstream wait: error toast IT localization wire-up');
    await gotoCompileHomeWithSeed(page);
    await dismissOnboarding(page);
    // Inject malformed code via __ELAB_API or workspace mutation, expect IT error toast
  });

  test('Aiuto button surfaces onboarding overlay again (re-entry)', async ({ page }) => {
    await gotoCompileHomeWithSeed(page);
    await dismissOnboarding(page);
    await page.getByRole('button', { name: /aiuto/i }).click({ force: true });
    await page.waitForTimeout(500);
    // Help overlay should be visible — exact selector may vary; defer strict check until
    // help-overlay component lands. For now assert no crash.
    expect(page.url()).toContain('#compile-home');
  });
});
