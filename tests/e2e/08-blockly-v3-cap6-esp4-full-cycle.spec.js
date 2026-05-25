import { test, expect } from '@playwright/test';

// Forward-looking spec for v3-cap6-esp4 Due LED sirena (pin 6+9)
// Currently SKIPPED - depends on Impl-A IT labels + Impl-B pinMode emission landing
// Unskip in Wave 1b once production env stable
//
// Reference: docs/prompts/PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md Sez 18
// Plan: docs/plans/2026-05-25-blockly-crosscompiler-definitivo.md iter X.2 Wave 1
test.describe.skip('Blockly v3-cap6-esp4 full cycle - Due LED sirena pin 6+9', () => {
  test('toolbox renders with Italian labels after Blockly init', async ({ page }) => {
    await page.goto('http://localhost:5173/#lavagna?lessonPathId=v3-cap6-esp4');
    await page.waitForSelector('[data-blockly-workspace]', { timeout: 10000 });
    // After Impl-A Wave 1 slice: toolbox has IT msg keys
    await expect(page.locator('text=Avvio')).toBeVisible();
    await expect(page.locator('text=Ripeti')).toBeVisible();
  });

  test('digitalWrite block emits pinMode in setup()', async ({ page }) => {
    await page.goto('http://localhost:5173/#lavagna?lessonPathId=v3-cap6-esp4');
    await page.waitForSelector('[data-blockly-workspace]', { timeout: 10000 });
    // Drag digitalWrite D6 HIGH block, drag digitalWrite D9 HIGH block
    // Click compile preview, assert C++ output contains:
    //   pinMode(6, OUTPUT);
    //   pinMode(9, OUTPUT);
    // This validates Impl-B pinMode auto-emission
    test.fail(true, 'TODO: implement drag-drop + compile preview assertion');
  });

  test('full compile->AVR8js cycle: pin 6 + pin 9 alternating HIGH', async ({ page }) => {
    test.fail(true, 'TODO: implement after pipeline stable Wave 1b/2');
  });
});
