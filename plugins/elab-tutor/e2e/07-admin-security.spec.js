// @ts-check
import { test, expect } from '@playwright/test';
import { setupUser } from './helpers.js';

test.describe('Journey 7: Admin Security', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
  });

  test('admin page shows password form', async ({ page }) => {
    await page.goto('/#admin');
    const heading = page.locator('h1, h2', { hasText: /Admin/i });
    await expect(heading).toBeVisible({ timeout: 10000 });
    const input = page.locator('input[type="password"], input[placeholder*="Password"]');
    await expect(input).toBeVisible();
  });

  test('wrong password shows error', async ({ page }) => {
    await page.goto('/#admin');
    const input = page.locator('input[type="password"], input[placeholder*="Password"]');
    await expect(input).toBeVisible({ timeout: 10000 });
    await input.fill('wrong-password');
    // Find the Accedi button specifically in the admin form (not the nav)
    const submitBtn = page.locator('button', { hasText: /Accedi/i }).last();
    await submitBtn.click();
    // Error message should appear
    const error = page.locator('text=/[Pp]assword errata|[Ee]rrore|[Nn]on autorizzato/');
    await expect(error).toBeVisible({ timeout: 5000 });
  });

  test('admin page has back link', async ({ page }) => {
    await page.goto('/#admin');
    const backLink = page.locator('text=Torna alla home');
    await expect(backLink).toBeVisible({ timeout: 10000 });
  });

  test('no console errors on admin page', async ({ page }) => {
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto('/#admin');
    await page.waitForTimeout(2000);
    const realErrors = errors.filter(e => !e.includes('net::') && !e.includes('Failed to fetch'));
    expect(realErrors.length).toBe(0);
  });
});
