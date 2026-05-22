import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const prototypeUrl = pathToFileURL(
  path.resolve('docs/design/open-design/prototypes/percorso-morfico/index.html'),
).toString();

async function gotoPrototype(page) {
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  await page.goto(prototypeUrl);
  await expect(page.getByTestId('prototype-shell')).toBeVisible();
  return consoleErrors;
}

test.describe('Open Design Percorso morfico prototype', () => {
  test('renders a professional working prototype with Principio Zero invariants', async ({ page }) => {
    const consoleErrors = await gotoPrototype(page);

    await expect(page).toHaveTitle(/ELAB Percorso Morfico/i);
    await expect(page.getByTestId('canonical-ref')).toContainText('Vol.1 pag.36');
    await expect(page.getByTestId('kit-strip')).toContainText('kit fisico ELAB');
    await expect(page.getByTestId('lim-view')).toContainText('Ragazzi,');
    await expect(page.getByTestId('lim-view')).not.toContainText(/v1-cap/i);
    await expect(page.getByTestId('regia-view')).not.toContainText(/Docente, leggi|Insegnante, leggi|Ora fai|Ora di'|Ora distribuisci/i);
    expect(consoleErrors).toEqual([]);
  });

  test('morphs the same experiment across teacher, class, session, and device variants', async ({ page }) => {
    await gotoPrototype(page);

    await page.getByRole('tab', { name: /Docente esperto/i }).click();
    await expect(page.getByTestId('variant-profile')).toContainText('Docente esperto');
    await expect(page.getByTestId('session-phase')).toContainText('verifica');
    await expect(page.getByTestId('density-score')).toContainText('Densita alta');
    await expect(page.getByTestId('primary-cue')).toContainText('Confronto atteso/reale');

    await page.getByRole('tab', { name: /Primo anno/i }).click();
    await expect(page.getByTestId('variant-profile')).toContainText('Docente al primo anno');
    await expect(page.getByTestId('session-phase')).toContainText('costruzione');
    await expect(page.getByTestId('density-score')).toContainText('Micro-step');
    await expect(page.getByTestId('primary-cue')).toContainText('Polarita LED');

    await page.getByRole('tab', { name: /Report/i }).click();
    await expect(page.getByTestId('variant-profile')).toContainText('Report finale');
    await expect(page.getByTestId('session-phase')).toContainText('report');
    await expect(page.getByTestId('next-experiment')).toContainText('LED con pulsante');
  });

  test('keeps the public LIM layer separate from private regia controls', async ({ page }) => {
    await gotoPrototype(page);

    const limView = page.getByTestId('lim-view');
    const regiaView = page.getByTestId('regia-view');

    await expect(limView).toContainText('Ragazzi,');
    await expect(limView).not.toContainText(/Fallback|Avanza fase|UNLIM cue|Timer docente|errore ricorrente/i);
    await expect(regiaView).toContainText(/Fallback|UNLIM cue|Timer docente/i);
  });

  test('remains readable on a tablet docente viewport', async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1112 });
    await gotoPrototype(page);

    const shellBox = await page.getByTestId('prototype-shell').boundingBox();
    const limBox = await page.getByTestId('lim-view').boundingBox();
    const regiaBox = await page.getByTestId('regia-view').boundingBox();

    expect(shellBox?.width).toBeLessThanOrEqual(834);
    expect(limBox?.width).toBeGreaterThan(300);
    expect(regiaBox?.width).toBeGreaterThan(300);
    await expect(page.getByRole('tab', { name: /Primo anno/i })).toBeVisible();
  });
});
