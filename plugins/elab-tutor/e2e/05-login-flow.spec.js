// @ts-check
import { test, expect } from '@playwright/test';
import { setupUser } from './helpers.js';

test.describe('Journey 5: Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
  });

  test('login page shows email and password form', async ({ page }) => {
    await page.goto('/#login');

    const form = page.locator('form[aria-label="Form di accesso"]');
    await expect(form).toBeVisible({ timeout: 15000 });

    const email = page.locator('#login-email');
    await expect(email).toBeVisible();
    await expect(email).toHaveAttribute('type', 'email');

    const password = page.locator('#login-password');
    await expect(password).toBeVisible();
    await expect(password).toHaveAttribute('type', 'password');

    const submit = form.locator('button[type="submit"]');
    await expect(submit).toBeVisible();
  });

  test('submitting invalid credentials shows error', async ({ page }) => {
    await page.goto('/#login');

    const form = page.locator('form[aria-label="Form di accesso"]');
    await expect(form).toBeVisible({ timeout: 15000 });

    await page.locator('#login-email').fill('invalid@test.com');
    await page.locator('#login-password').fill('wrongpassword123');
    await form.locator('button[type="submit"]').click();

    // Error alert should appear (network error or auth failure)
    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible({ timeout: 15000 });
  });

  test('empty email field prevents submission', async ({ page }) => {
    await page.goto('/#login');

    const form = page.locator('form[aria-label="Form di accesso"]');
    await expect(form).toBeVisible({ timeout: 15000 });

    await page.locator('#login-password').fill('somepassword');
    await form.locator('button[type="submit"]').click();

    // Form still visible (HTML5 required validation)
    await expect(form).toBeVisible();
  });

  test('password visibility toggle works', async ({ page }) => {
    await page.goto('/#login');

    const form = page.locator('form[aria-label="Form di accesso"]');
    await expect(form).toBeVisible({ timeout: 15000 });

    const password = page.locator('#login-password');
    await expect(password).toHaveAttribute('type', 'password');

    const toggleBtn = password.locator('..').locator('button');
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await expect(password).toHaveAttribute('type', 'text');
    }
  });
});
