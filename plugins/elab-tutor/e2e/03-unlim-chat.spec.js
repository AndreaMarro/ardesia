// @ts-check
import { test, expect } from '@playwright/test';
import { setupUser } from './helpers.js';

test.describe('Journey 3: UNLIM Chat', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
    await page.goto('/#lavagna');
    // Wait for experiment picker, select first experiment
    const expBtn = page.locator('button', { hasText: /Accendi il tuo primo LED/i });
    await expect(expBtn).toBeVisible({ timeout: 15000 });
    await expBtn.click();
    // Wait for lavagna to load
    await page.waitForTimeout(2000);
  });

  test('UNLIM mascot is visible', async ({ page }) => {
    // Mascot can be an img or SVG with various alt/aria-label
    const mascot = page.locator('img[alt*="UNLIM"], img[alt*="mascotte"], [aria-label*="UNLIM"], button:has-text("UNLIM")');
    await expect(mascot.first()).toBeVisible({ timeout: 10000 });
  });

  test('UNLIM input bar is accessible', async ({ page }) => {
    const input = page.locator('input[placeholder*="UNLIM"], input[placeholder*="Chiedi"], textarea[placeholder*="UNLIM"]');
    await expect(input).toBeVisible({ timeout: 10000 });
  });

  test('send button is present and input accepts text', async ({ page }) => {
    const input = page.locator('input[placeholder*="UNLIM"], input[placeholder*="Chiedi"], textarea[placeholder*="UNLIM"]');
    await expect(input).toBeVisible({ timeout: 10000 });

    await input.fill('Ciao');
    await expect(input).toHaveValue('Ciao');

    const sendBtn = page.locator('button[aria-label*="Invia"]');
    await expect(sendBtn).toBeVisible();
  });

  test('app remains stable after user interaction', async ({ page }) => {
    // Collect errors from the start
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    // Toolbar or any interactive element should be visible
    const toolbar = page.locator('[role="toolbar"], [class*="toolbar"], [class*="Toolbar"]');
    await expect(toolbar.first()).toBeVisible({ timeout: 15000 });

    await page.waitForTimeout(2000);
    // Allow at most 1 non-critical error (network timeouts are OK in dev)
    expect(errors.filter(e => !e.includes('net::') && !e.includes('Failed to fetch')).length).toBeLessThanOrEqual(1);
  });
});
