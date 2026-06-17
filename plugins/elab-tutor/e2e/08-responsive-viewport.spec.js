// @ts-check
import { test, expect } from '@playwright/test';
import { setupUser } from './helpers.js';

test.describe('Journey 8: Responsive Viewports', () => {
  test('desktop 1280x800 loads correctly', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await setupUser(page);
    await page.goto('/');
    await expect(page).toHaveTitle(/ELAB/i);
    const cta = page.locator('button', { hasText: /Accedi al Simulatore/i });
    await expect(cta).toBeVisible({ timeout: 15000 });
  });

  test('tablet 768x1024 loads correctly', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await setupUser(page);
    await page.goto('/');
    await expect(page).toHaveTitle(/ELAB/i);
    const cta = page.locator('button', { hasText: /Accedi al Simulatore/i });
    await expect(cta).toBeVisible({ timeout: 15000 });
  });

  test('LIM 1024x768 simulator loads', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await setupUser(page);
    await page.goto('/#prova');
    const svg = page.locator('svg').first();
    await expect(svg).toBeVisible({ timeout: 30000 });
  });
});
