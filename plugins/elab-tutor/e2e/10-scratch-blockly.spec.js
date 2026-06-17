// @ts-check
/**
 * E2E Test: Scratch/Blockly Editor with scratchXml
 *
 * Verifica che il Blockly editor si apra e carichi correttamente
 * gli scratchXml degli esperimenti Vol3.
 *
 * Richiede Chrome reale: npx playwright test e2e/10-scratch-blockly.spec.js
 */
import { test, expect } from '@playwright/test';
import { setupUser, setVolume } from './helpers.js';

test.describe('Scratch/Blockly — runtime integration', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
    await setVolume(page, '3');
  });

  test('Scratch tab is visible for Vol3 experiments', async ({ page }) => {
    await page.goto('/#prova');
    await page.waitForTimeout(5000);

    // Look for Scratch/Blockly tab or panel
    const scratchTab = page.locator('button, [role="tab"]', { hasText: /Scratch|Blockly|Codice Visuale/i });
    // Vol3 must show scratch capability
    await expect(scratchTab.first()).toBeVisible({ timeout: 10000 });
  });

  test('Blockly workspace renders without errors', async ({ page }) => {
    await page.goto('/#prova');
    await page.waitForTimeout(5000);

    // Click Scratch tab
    const scratchTab = page.locator('button, [role="tab"]', { hasText: /Scratch|Blockly/i });
    await expect(scratchTab.first()).toBeVisible({ timeout: 10000 });
    await scratchTab.first().click();
    await page.waitForTimeout(2000);

    // Blockly injects a .blocklySvg element
    const blocklySvg = page.locator('.blocklySvg');
    await expect(blocklySvg).toBeVisible({ timeout: 10000 });

    // Toolbox should be present
    const toolbox = page.locator('.blocklyToolboxDiv');
    await expect(toolbox).toBeVisible({ timeout: 5000 });
  });

  test('Blockly workspace has ELAB categories', async ({ page }) => {
    await page.goto('/#prova');
    await page.waitForTimeout(5000);

    const scratchTab = page.locator('button, [role="tab"]', { hasText: /Scratch|Blockly/i });
    await expect(scratchTab.first()).toBeVisible({ timeout: 10000 });
    await scratchTab.first().click();
    await page.waitForTimeout(2000);

    // ELAB-specific categories should be present
    const categories = page.locator('.blocklyToolboxCategory');
    const catCount = await categories.count();
    expect(catCount).toBeGreaterThan(3);
  });

  test('no console errors during Blockly load', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => {
      // Ignore known non-critical errors
      if (err.message.includes('ResizeObserver') || err.message.includes('Script error')) return;
      errors.push(err.message);
    });

    await page.goto('/#prova');
    await page.waitForTimeout(5000);

    const scratchTab = page.locator('button, [role="tab"]', { hasText: /Scratch|Blockly/i });
    if (await scratchTab.count() > 0) {
      await scratchTab.first().click();
      await page.waitForTimeout(3000);
    }

    // Filter out Blockly-internal warnings that are non-critical
    const criticalErrors = errors.filter(e =>
      !e.includes('InsertionMarker') && !e.includes('removeTypedBlock')
    );
    expect(criticalErrors).toEqual([]);
  });

  test('Semaforo experiment loads scratchXml in Blockly', async ({ page }) => {
    // Navigate to semaforo experiment via lavagna picker
    await page.goto('/#lavagna');
    const vol3Tab = page.locator('[role="tab"]', { hasText: 'Volume 3' });
    await expect(vol3Tab).toBeVisible({ timeout: 15000 });
    await vol3Tab.click();

    const semaforoBtn = page.locator('button', { hasText: /semaforo/i });
    await expect(semaforoBtn.first()).toBeVisible({ timeout: 10000 });
    await semaforoBtn.first().click();
    await page.waitForTimeout(3000);

    // Switch to Scratch view
    const scratchTab = page.locator('button, [role="tab"]', { hasText: /Scratch|Blockly/i });
    await expect(scratchTab.first()).toBeVisible({ timeout: 10000 });
    await scratchTab.first().click();
    await page.waitForTimeout(3000);

    // Blockly workspace should have blocks (not empty)
    const blocks = page.locator('.blocklyDraggable');
    const blockCount = await blocks.count();
    expect(blockCount).toBeGreaterThan(0);
  });
});
