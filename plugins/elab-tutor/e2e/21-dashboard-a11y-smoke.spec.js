// @ts-check
/**
 * Dashboard Docente — a11y smoke (WCAG 2.1 AA regression guard).
 *
 * Complementa 04-teacher-dashboard.spec.js: qui verifichiamo la PRESENZA
 * degli attributi ARIA chiave (non la loro correttezza semantica completa —
 * quella richiede axe-core runtime, prevista in ATOM successivo).
 *
 * Scope: regression guard per il lavoro di ATOM-002. Se i fix vengono
 * applicati, questi test passano; se qualcuno rimuove gli attributi
 * accidentalmente, falliscono.
 *
 * Riferimento: docs/audit/2026-04-19-dashboard-a11y.md
 */
import { test, expect } from '@playwright/test';
import { setupUser, setTeacherUser } from './helpers.js';

test.describe('Dashboard Docente — a11y attributes (smoke)', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
    await setTeacherUser(page);
  });

  test('tablist pattern è presente sul container schede', async ({ page }) => {
    await page.goto('/#teacher');
    await page.waitForTimeout(2500);

    // Il pattern ARIA Tabs è documentato in TeacherDashboard.jsx ~riga 712-729.
    // Deve esserci almeno un role="tablist" sulla pagina.
    const tablist = page.locator('[role="tablist"]');
    const count = await tablist.count();
    expect(count, 'almeno un role="tablist" deve essere presente').toBeGreaterThanOrEqual(1);

    // E almeno 2 role="tab" figli (Classe + Report almeno).
    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();
    expect(tabCount, 'almeno 2 role="tab" devono esistere').toBeGreaterThanOrEqual(2);
  });

  test('icone decorative non confondono screen reader', async ({ page }) => {
    await page.goto('/#teacher');
    await page.waitForTimeout(2500);

    // Audit: almeno 1 aria-hidden su SVG decorativi già presente (riga 3130).
    // Questo test documenta il pattern: deve esistere >=1 aria-hidden="true".
    const hiddenDecor = page.locator('[aria-hidden="true"]');
    const cnt = await hiddenDecor.count();
    expect(cnt, 'almeno 1 elemento aria-hidden="true" atteso (icone decorative)').toBeGreaterThanOrEqual(1);
  });

  test('pulsanti hanno testo o aria-label (no button "muti")', async ({ page }) => {
    await page.goto('/#teacher');
    await page.waitForTimeout(2500);

    // Ogni <button> deve avere o testo visibile o aria-label (WCAG 4.1.2).
    // Tolleriamo fino a 2 button senza nessuna delle due come smoke, perché
    // la dashboard ha componenti dinamici. Soglia ampia per evitare falsi positivi.
    const buttons = page.locator('button:visible');
    const total = await buttons.count();
    let muti = 0;

    for (let i = 0; i < total; i++) {
      const btn = buttons.nth(i);
      const text = (await btn.textContent())?.trim() ?? '';
      const ariaLabel = (await btn.getAttribute('aria-label')) ?? '';
      const ariaLabelledBy = (await btn.getAttribute('aria-labelledby')) ?? '';
      const title = (await btn.getAttribute('title')) ?? '';
      if (!text && !ariaLabel && !ariaLabelledBy && !title) {
        muti++;
      }
    }

    // Threshold: < 10% mutes, o max 2 (smoke-level tolerance).
    const maxMuti = Math.max(2, Math.floor(total * 0.1));
    expect(muti, `button senza testo/aria-label: ${muti}/${total} (max tollerato ${maxMuti})`).toBeLessThanOrEqual(maxMuti);
  });

  test('nessun role/aria invalido (smoke sanity)', async ({ page }) => {
    await page.goto('/#teacher');
    await page.waitForTimeout(2500);

    // Smoke: nessun role="undefined" o aria-label=""/null accidentale.
    const bad1 = await page.locator('[role=""]').count();
    const bad2 = await page.locator('[role="undefined"]').count();
    const bad3 = await page.locator('[role="null"]').count();

    expect(bad1 + bad2 + bad3, 'nessun role invalido atteso').toBe(0);
  });

  // NOTA PER AGENT FUTURI:
  // Dopo che ATOM-002 è risolto, aggiungere qui test positivi:
  //   - await expect(page.locator('[role="img"]')).toHaveCount(>=2)
  //   - await expect(page.locator('caption')).toHaveCount(>=1)
  //   - grafici Recharts wrappati correttamente
  // Per ora stiamo facendo regression guard, non verifica conformità piena.
});
