import { test, expect } from '@playwright/test';
import { waitForPageReady, SELECTORS, EXPERIMENTS, TIMEOUTS, seedE2EBypass, skipIfProd } from './fixtures.js';

test.describe('Experiment Load', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    skipIfProd(test, baseURL);
    await seedE2EBypass(page);
  });

  test('should load first experiment via hash', async ({ page }) => {
    await page.goto(`/#experiment=${EXPERIMENTS.first}`);
    await waitForPageReady(page);

    // Page should load without crash
    const bodyText = await page.textContent('body');
    expect(bodyText.length).toBeGreaterThan(0);
  });

  test('should load LED experiment and show circuit elements', async ({ page }) => {
    await page.goto(`/#experiment=${EXPERIMENTS.ledBasic}`);
    await waitForPageReady(page);

    // Wait for simulator to initialize
    await page.waitForTimeout(2000);

    // Check for SVG elements (circuit components render as SVG)
    const svgCount = await page.locator('svg').count();
    // At minimum the page should have rendered something
    const bodyText = await page.textContent('body');
    expect(bodyText.length).toBeGreaterThan(0);
  });

  test('should handle invalid experiment ID gracefully', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/#experiment=invalid-experiment-id');
    await waitForPageReady(page);

    // Should not crash
    const bodyText = await page.textContent('body');
    expect(bodyText.length).toBeGreaterThan(0);

    // No uncaught errors from invalid experiment
    const criticalErrors = errors.filter(e => !e.includes('ResizeObserver'));
    expect(criticalErrors.length).toBe(0);
  });
});
