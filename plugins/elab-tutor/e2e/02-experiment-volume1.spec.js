// @ts-check
import { test, expect } from '@playwright/test';
import { setupUser } from './helpers.js';

test.describe('Journey 2: Esperimento Volume 1', () => {
  test('prova mode loads Vol.1 experiment with SVG canvas', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#prova');

    // Main simulator canvas has class .elab-simulator-canvas
    const canvas = page.locator('.elab-simulator-canvas svg');
    await expect(canvas).toBeVisible({ timeout: 30000 });

    const banner = page.locator('text=Versione di prova');
    await expect(banner).toBeVisible({ timeout: 10000 });
  });

  test('simulator toolbar is functional', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#prova');

    const toolbar = page.locator('[role="toolbar"]');
    await expect(toolbar).toBeVisible({ timeout: 30000 });

    const buttons = toolbar.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('experiment has components rendered in canvas', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#prova');

    // Wait for the main simulator canvas SVG
    const canvas = page.locator('.elab-simulator-canvas svg');
    await expect(canvas).toBeVisible({ timeout: 30000 });

    // Wait for components to render (circuit elements are <g> groups)
    // The breadboard, Arduino board, and components should be rendered
    await page.waitForTimeout(3000);
    const svgContent = await canvas.innerHTML();
    // A loaded circuit has thousands of chars in SVG (breadboard alone is >1000)
    expect(svgContent.length).toBeGreaterThan(1000);
  });

  test('experiment guide panel is visible', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#prova');

    // The experiment guide / objective text should be visible
    // In prova mode, Vol.1 Cap.6 LED experiment loads with guide text
    const guideText = page.locator('text=Obiettivo').or(page.locator('text=obiettivo')).or(page.locator('text=LED'));
    await expect(guideText.first()).toBeVisible({ timeout: 30000 });
  });
});
