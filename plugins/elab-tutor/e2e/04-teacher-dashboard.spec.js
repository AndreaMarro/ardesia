// @ts-check
import { test, expect } from '@playwright/test';
import { setupUser, setTeacherUser } from './helpers.js';

test.describe('Journey 4: Teacher Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
    await setTeacherUser(page);
  });

  test('teacher page loads without crash', async ({ page }) => {
    await page.goto('/#teacher');
    await page.waitForTimeout(3000);
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('dashboard header is present', async ({ page }) => {
    await page.goto('/#teacher');
    const heading = page.locator('h1, h2, [class*="header"], [class*="Header"], [class*="title"]').first();
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test('dashboard has interactive elements', async ({ page }) => {
    await page.goto('/#teacher');
    await page.waitForTimeout(3000);
    // Should have buttons or tabs
    const interactive = page.locator('button, [role="tab"], a[href]');
    const count = await interactive.count();
    expect(count).toBeGreaterThan(0);
  });

  test('no console errors on load', async ({ page }) => {
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto('/#teacher');
    await page.waitForTimeout(3000);
    // Filter out network errors (expected in dev without backend)
    const realErrors = errors.filter(e => !e.includes('net::') && !e.includes('Failed to fetch') && !e.includes('Supabase'));
    expect(realErrors.length).toBe(0);
  });
});
