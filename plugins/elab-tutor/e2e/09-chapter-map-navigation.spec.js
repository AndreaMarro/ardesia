// @ts-check
/**
 * E2E Test: Chapter Map + Experiment Navigation
 *
 * Verifica il flusso Principio Zero:
 * - ExperimentPicker mostra capitoli raggruppati
 * - Navigazione tra volumi funziona
 * - Ricerca esperimenti filtra correttamente
 * - Selezione esperimento carica il circuito
 *
 * Richiede Chrome reale: npx playwright test e2e/09-chapter-map-navigation.spec.js
 */
import { test, expect } from '@playwright/test';
import { setupUser } from './helpers.js';

test.describe('Chapter Map — ExperimentPicker navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
  });

  test('ExperimentPicker shows 3 volume tabs', async ({ page }) => {
    await page.goto('/#lavagna');
    const tabs = page.locator('[role="tab"]');
    await expect(tabs).toHaveCount(3, { timeout: 15000 });

    // Check volume labels
    await expect(tabs.nth(0)).toContainText('Volume 1');
    await expect(tabs.nth(1)).toContainText('Volume 2');
    await expect(tabs.nth(2)).toContainText('Volume 3');
  });

  test('Vol1 shows experiments grouped by chapters', async ({ page }) => {
    await page.goto('/#lavagna');
    const picker = page.locator('[role="dialog"][aria-label*="esperimento"]');
    await expect(picker).toBeVisible({ timeout: 15000 });

    // Vol1 default — should show chapter headings
    const chapterHeaders = picker.locator('h3');
    const count = await chapterHeaders.count();
    expect(count).toBeGreaterThanOrEqual(5); // Vol1 has 9 chapters
  });

  test('switching to Vol2 shows different chapters', async ({ page }) => {
    await page.goto('/#lavagna');
    const vol2Tab = page.locator('[role="tab"]', { hasText: 'Volume 2' });
    await expect(vol2Tab).toBeVisible({ timeout: 15000 });
    await vol2Tab.click();

    // Vol2 starts with Capitolo 3 (Il Multimetro)
    const multimetro = page.locator('h3', { hasText: /Multimetro/i });
    await expect(multimetro).toBeVisible({ timeout: 5000 });
  });

  test('switching to Vol3 shows Arduino chapters', async ({ page }) => {
    await page.goto('/#lavagna');
    const vol3Tab = page.locator('[role="tab"]', { hasText: 'Volume 3' });
    await expect(vol3Tab).toBeVisible({ timeout: 15000 });
    await vol3Tab.click();

    // Vol3 should show "pin digitali" or "primo programma"
    const arduino = page.locator('h3', { hasText: /pin digitali|primo programma/i });
    await expect(arduino).toBeVisible({ timeout: 5000 });
  });

  test('search filters experiments across chapters', async ({ page }) => {
    await page.goto('/#lavagna');
    const searchInput = page.locator('input[placeholder*="Cerca"]');
    await expect(searchInput).toBeVisible({ timeout: 15000 });

    await searchInput.fill('RGB');
    await page.waitForTimeout(500);

    // Should show RGB experiments, hide non-RGB
    const led = page.locator('button', { hasText: /Accendi il tuo primo LED/i });
    await expect(led).toHaveCount(0);

    const rgb = page.locator('button', { hasText: /RGB/i });
    const rgbCount = await rgb.count();
    expect(rgbCount).toBeGreaterThan(0);
  });

  test('selecting experiment loads circuit in lavagna', async ({ page }) => {
    await page.goto('/#lavagna');
    const expBtn = page.locator('button', { hasText: /Accendi il tuo primo LED/i });
    await expect(expBtn).toBeVisible({ timeout: 15000 });
    await expBtn.click();

    // Picker closes
    await page.waitForTimeout(2000);
    const picker = page.locator('[aria-label="Scegli un esperimento"]');
    await expect(picker).toHaveCount(0);

    // Circuit should load — SVG canvas visible
    const svg = page.locator('svg');
    const svgCount = await svg.count();
    expect(svgCount).toBeGreaterThan(0);
  });

  test('progress counter shows correct format', async ({ page }) => {
    await page.goto('/#lavagna');
    const picker = page.locator('[role="dialog"][aria-label*="esperimento"]');
    await expect(picker).toBeVisible({ timeout: 15000 });

    // Footer should show "N/38 completati" for Vol1
    const footer = picker.locator('text=/\\d+\\/38 completati/');
    await expect(footer).toBeVisible({ timeout: 5000 });
  });
});
