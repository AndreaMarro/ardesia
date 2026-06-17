// @ts-check
import { test, expect } from '@playwright/test';
import { setupUser } from './helpers.js';

test.describe('Journey 6: Simulator Experiments', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
  });

  test('loading experiment v1-cap6-esp1 shows circuit', async ({ page }) => {
    await page.goto('/#prova');
    const svg = page.locator('svg').first();
    await expect(svg).toBeVisible({ timeout: 30000 });
  });

  test('simulator has interactive controls', async ({ page }) => {
    await page.goto('/#prova');
    // Wait for simulator to load fully
    await page.waitForTimeout(3000);
    const buttons = page.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(2);
  });

  test('experiment picker opens on lavagna', async ({ page }) => {
    await page.goto('/#lavagna');
    const picker = page.locator('[role="dialog"][aria-label*="esperimento"]');
    await expect(picker).toBeVisible({ timeout: 15000 });
  });

  test('volume tabs are present in picker', async ({ page }) => {
    await page.goto('/#lavagna');
    const tabs = page.locator('[role="tab"]');
    await expect(tabs).toHaveCount(3, { timeout: 15000 });
  });

  test('selecting experiment closes picker', async ({ page }) => {
    await page.goto('/#lavagna');
    const expBtn = page.locator('button', { hasText: /Accendi il tuo primo LED/i });
    await expect(expBtn).toBeVisible({ timeout: 15000 });
    await expBtn.click();
    // Picker should close — only UNLIM dialog remains
    await page.waitForTimeout(2000);
    const picker = page.locator('[aria-label="Scegli un esperimento"]');
    await expect(picker).toHaveCount(0);
  });
});
