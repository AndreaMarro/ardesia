import { test, expect } from '@playwright/test';
import { skipIfProd } from './fixtures.js';

const VIEWPORTS = [
  { name: 'desktop 1920', width: 1920, height: 1080 },
  { name: 'LIM 1366', width: 1366, height: 768 },
  { name: 'iPad 1024', width: 1024, height: 768 },
];

test.describe('IDE shell C++ first layout', () => {
  test.beforeEach(async ({ baseURL }) => {
    skipIfProd(test, baseURL);
  });

  for (const viewport of VIEWPORTS) {
    test(`renderizza griglia 3-pane su ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/#compile-home-v2');

      const shell = page.getByTestId('ide-shell');
      await expect(shell).toBeVisible();
      await expect(shell).toHaveAttribute('data-mode', 'cpp');

      const palette = page.getByLabel('Palette componenti');
      const center = page.getByLabel('Editor progetto');
      const unlim = page.getByLabel('Mascotte UNLIM');
      const status = page.getByRole('status');

      await expect(palette).toBeVisible();
      await expect(center).toBeVisible();
      await expect(unlim).toBeVisible();
      await expect(status).toContainText('Pronto');

      const boxes = await Promise.all([
        palette.boundingBox(),
        center.boundingBox(),
        unlim.boundingBox(),
        status.boundingBox(),
      ]);
      const [paletteBox, centerBox, unlimBox, statusBox] = boxes;
      expect(Math.round(paletteBox.width)).toBeGreaterThanOrEqual(239);
      expect(Math.round(unlimBox.width)).toBeGreaterThanOrEqual(319);
      expect(centerBox.width).toBeGreaterThan(300);
      expect(Math.round(statusBox.height)).toBe(40);
    });
  }

  test('switcher alterna Blocchi, C++ e Vista doppia', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('/#compile-home-v2');

    await page.getByRole('button', { name: 'Blocchi' }).click();
    await expect(page.getByTestId('ide-shell')).toHaveAttribute('data-mode', 'blocks');

    await page.getByRole('button', { name: 'Vista doppia' }).click();
    await expect(page.getByTestId('ide-shell')).toHaveAttribute('data-mode', 'dual');

    await page.getByRole('button', { name: 'C++' }).click();
    await expect(page.getByTestId('ide-shell')).toHaveAttribute('data-mode', 'cpp');
  });

  test('CompileButton invia solo compilazione senza mostrare stato Caricato', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.route('**/api/compile/nanor4', async (route) => {
      const request = route.request();
      expect(request.method()).toBe('POST');
      expect(request.postDataJSON()).toHaveProperty('source');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, size: { bytes: 512, total: 98304, percent: 1 } }),
      });
    });

    await page.goto('/#compile-home-v2');
    await page.getByRole('button', { name: /compila/i }).click();
    await expect(page.getByRole('status')).toContainText('Compilazione riuscita');
    await expect(page.getByText(/Caricato/i)).toHaveCount(0);
  });
});
