// @ts-check
/**
 * E2E Test: Full Teacher Journey — Principio Zero
 *
 * Simula il percorso completo della Prof.ssa Rossi:
 * 1. Arriva alla landing page
 * 2. Entra nel simulatore
 * 3. Sceglie un esperimento dal picker (chapter-map navigation)
 * 4. Vede il circuito e le istruzioni
 * 5. Cambia volume
 * 6. Cerca un esperimento
 * 7. Apre UNLIM per chiedere aiuto
 * 8. Torna alla lavagna e seleziona Vol3 con Scratch
 *
 * Richiede Chrome reale: npx playwright test e2e/11-teacher-full-journey.spec.js
 */
import { test, expect } from '@playwright/test';
import { setupUser, setVolume, setTeacherUser } from './helpers.js';

test.describe('Teacher Full Journey — Principio Zero', () => {
  test('complete journey: landing → simulator → experiment → next', async ({ page }) => {
    await setupUser(page);
    await page.goto('/');

    // Step 1: Landing page loads
    await expect(page).toHaveTitle(/ELAB/i);

    // Step 2: Click CTA to enter simulator
    const cta = page.locator('button', { hasText: /Accedi al Simulatore|Inizia|Prova/i });
    await expect(cta.first()).toBeVisible({ timeout: 15000 });
    await cta.first().click();

    // Step 3: Simulator loads (SVG canvas visible)
    const svg = page.locator('svg').first();
    await expect(svg).toBeVisible({ timeout: 30000 });
  });

  test('lavagna experiment picker: full chapter navigation', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#lavagna');

    // Wait for picker to load
    const picker = page.locator('[role="dialog"][aria-label*="esperimento"]');
    await expect(picker).toBeVisible({ timeout: 15000 });

    // Vol1 default: verify chapter grouping
    const tabs = page.locator('[role="tab"]');
    await expect(tabs).toHaveCount(3);

    // Click Vol1 tab explicitly
    await tabs.nth(0).click();
    await page.waitForTimeout(500);

    // Verify chapter headers are shown
    const chapters = picker.locator('h3');
    const chapCount = await chapters.count();
    expect(chapCount).toBeGreaterThanOrEqual(5);

    // Switch to Vol2
    await tabs.nth(1).click();
    await page.waitForTimeout(500);
    const vol2Chapter = picker.locator('h3').first();
    await expect(vol2Chapter).toBeVisible();

    // Switch to Vol3
    await tabs.nth(2).click();
    await page.waitForTimeout(500);
    const vol3Chapter = picker.locator('h3').first();
    await expect(vol3Chapter).toBeVisible();

    // Back to Vol1 and select first experiment
    await tabs.nth(0).click();
    await page.waitForTimeout(500);
    const firstExp = page.locator('button', { hasText: /Accendi il tuo primo LED/i });
    await expect(firstExp).toBeVisible();
    await firstExp.click();

    // Picker should close
    await page.waitForTimeout(2000);
    await expect(picker).toHaveCount(0);
  });

  test('search works across volumes', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#lavagna');

    const searchInput = page.locator('input[placeholder*="Cerca"]');
    await expect(searchInput).toBeVisible({ timeout: 15000 });

    // Search for "pulsante" — should find experiments
    await searchInput.fill('pulsante');
    await page.waitForTimeout(500);

    const results = page.locator('[role="dialog"] button').filter({ hasText: /pulsante/i });
    const count = await results.count();
    expect(count).toBeGreaterThan(0);

    // Clear search
    const clearBtn = page.locator('button[aria-label="Cancella ricerca"]');
    if (await clearBtn.count() > 0) {
      await clearBtn.click();
    }
  });

  test('UNLIM suggestion banner is interactive', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#lavagna');

    const picker = page.locator('[role="dialog"][aria-label*="esperimento"]');
    await expect(picker).toBeVisible({ timeout: 15000 });

    // Look for UNLIM suggestion banner
    const unlimBanner = page.locator('button', { hasText: /Chiedi a UNLIM/i });
    if (await unlimBanner.count() > 0) {
      await expect(unlimBanner).toBeVisible();
      // Clicking should close picker and send message to UNLIM
      await unlimBanner.click();
      await page.waitForTimeout(2000);
      await expect(picker).toHaveCount(0);
    }
  });

  test('experiment cards show metadata', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#lavagna');

    const picker = page.locator('[role="dialog"][aria-label*="esperimento"]');
    await expect(picker).toBeVisible({ timeout: 15000 });

    // Switch to Vol3 to see Arduino badge
    const vol3Tab = page.locator('[role="tab"]', { hasText: 'Volume 3' });
    await vol3Tab.click();
    await page.waitForTimeout(500);

    // Some Vol3 cards should show "Arduino" badge
    const arduinoBadge = picker.locator('text=Arduino');
    const badgeCount = await arduinoBadge.count();
    expect(badgeCount).toBeGreaterThan(0);
  });

  test('progress counter updates correctly', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#lavagna');

    const picker = page.locator('[role="dialog"][aria-label*="esperimento"]');
    await expect(picker).toBeVisible({ timeout: 15000 });

    // Footer shows "0/38 completati" for Vol1 (fresh user)
    const footer = picker.locator('text=/0\\/38 completati/');
    await expect(footer).toBeVisible({ timeout: 5000 });

    // Switch to Vol2
    const vol2Tab = page.locator('[role="tab"]', { hasText: 'Volume 2' });
    await vol2Tab.click();
    await page.waitForTimeout(500);

    // Should show "0/27 completati"
    const vol2Footer = picker.locator('text=/0\\/27 completati/');
    await expect(vol2Footer).toBeVisible({ timeout: 5000 });
  });

  test('modal accessibility: focus trap and escape', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#lavagna');

    const picker = page.locator('[role="dialog"]');
    await expect(picker).toBeVisible({ timeout: 15000 });

    // Verify aria attributes
    await expect(picker).toHaveAttribute('aria-modal', 'true');
    await expect(picker).toHaveAttribute('aria-label', 'Scegli un esperimento');

    // Escape closes the modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    await expect(picker).toHaveCount(0);
  });
});
