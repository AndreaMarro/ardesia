// @ts-check
import { test, expect } from '@playwright/test';
import { setupUser } from './helpers.js';

test.describe('Journey 1: Homepage → Simulatore', () => {
  test('homepage loads with ELAB branding', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/ELAB/i);
  });

  test('vetrina shows "Accedi al Simulatore" CTA', async ({ page }) => {
    await setupUser(page);
    await page.goto('/');
    const cta = page.locator('button', { hasText: /Accedi al Simulatore/i });
    await expect(cta).toBeVisible({ timeout: 15000 });
  });

  test('clicking "Accedi al Simulatore" opens simulator with SVG canvas', async ({ page }) => {
    await setupUser(page);
    await page.goto('/');

    const cta = page.locator('button', { hasText: /Accedi al Simulatore/i });
    await expect(cta).toBeVisible({ timeout: 15000 });
    await cta.click();

    // Wait for simulator — SVG canvas and toolbar
    const svg = page.locator('svg').first();
    await expect(svg).toBeVisible({ timeout: 30000 });

    const toolbar = page.locator('[role="toolbar"]');
    await expect(toolbar).toBeVisible({ timeout: 15000 });
  });

  test('direct navigation to #prova loads simulator', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#prova');

    const svg = page.locator('svg').first();
    await expect(svg).toBeVisible({ timeout: 30000 });

    const toolbar = page.locator('[role="toolbar"]');
    await expect(toolbar).toBeVisible({ timeout: 15000 });
  });
});
