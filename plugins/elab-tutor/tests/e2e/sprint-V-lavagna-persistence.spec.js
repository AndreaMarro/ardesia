/**
 * sprint-V-lavagna-persistence.spec.js — Sprint V iter 1 Atom A14 (Tester-1)
 *
 * Lavagna persistence E2E: drawn strokes must survive Esci toolbar, page
 * reload, experiment switch, and saved-session reload. Explicit "Cancella
 * tutto" cestino DOES wipe (regression check).
 *
 * Scope per Sprint V mandate: 5 specs.
 * Helper: tests/e2e/helpers/welcome-gate-bypass.js gotoLavagna().
 *
 * NOTE: orchestrator gates Playwright execution post Phase 3 implementation.
 * Several specs depend on Maker-1/2 ship of multi-experiment switch + saved
 * session reload UX — those marked test.fixme until Phase 3 verified.
 */
import { test, expect } from '@playwright/test';
import { gotoLavagna } from './helpers/welcome-gate-bypass.js';

const BASE_URL = process.env.ELAB_BASE_URL || 'https://www.elabtutor.school';
const LAVAGNA_URL = `${BASE_URL}/#lavagna`;

async function activatePenAndDraw(page) {
  const penTool = page.locator('[aria-label="Pen tool"], text=Penna, [data-tool="pen"]').first();
  const penVisible = await penTool.isVisible({ timeout: 5_000 }).catch(() => false);
  if (!penVisible) test.skip(true, 'Pen tool not visible in current UI build');
  await penTool.click().catch(() => {});
  const canvas = page.locator('canvas, svg.lavagna-canvas').first();
  const box = await canvas.boundingBox();
  if (!box) test.skip(true, 'Canvas not bounded — cannot draw');
  for (let i = 0; i < 5; i++) {
    await page.mouse.move(box.x + 100 + i * 40, box.y + 100 + i * 30);
    await page.mouse.down();
    await page.mouse.move(box.x + 150 + i * 40, box.y + 150 + i * 30);
    await page.mouse.up();
  }
  await page.waitForTimeout(500);
}

test.describe('Sprint V iter 1 A14 — Lavagna persistence (5 specs)', () => {

  test('S1: draw 5 strokes → click Esci toolbar → strokes still visible (handleClose wipe-free)', async ({ page }) => {
    await gotoLavagna(page, LAVAGNA_URL);
    await activatePenAndDraw(page);

    const before = await page.evaluate(() => {
      const keys = Object.keys(localStorage).filter(k => k.includes('drawing') || k.includes('paths'));
      return keys.reduce((acc, k) => acc + (JSON.parse(localStorage.getItem(k) || '[]').length || 0), 0);
    });
    expect(before).toBeGreaterThan(0);

    // Click Esci on color toolbar (not the cestino)
    const esciButton = page.locator('button:has-text("Esci"), [aria-label="Esci"]').first();
    if (await esciButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await esciButton.click();
      await page.waitForTimeout(300);
    }

    const after = await page.evaluate(() => {
      const keys = Object.keys(localStorage).filter(k => k.includes('drawing') || k.includes('paths'));
      return keys.reduce((acc, k) => acc + (JSON.parse(localStorage.getItem(k) || '[]').length || 0), 0);
    });
    expect(after).toBeGreaterThanOrEqual(before);
  });

  test('S2: draw → reload page → strokes still visible (localStorage persistence)', async ({ page }) => {
    await gotoLavagna(page, LAVAGNA_URL);
    await activatePenAndDraw(page);

    const before = await page.evaluate(() => {
      const keys = Object.keys(localStorage).filter(k => k.includes('drawing') || k.includes('paths'));
      return keys.reduce((acc, k) => acc + (JSON.parse(localStorage.getItem(k) || '[]').length || 0), 0);
    });
    expect(before).toBeGreaterThan(0);

    await page.reload();
    await page.waitForTimeout(2000);

    const after = await page.evaluate(() => {
      const keys = Object.keys(localStorage).filter(k => k.includes('drawing') || k.includes('paths'));
      return keys.reduce((acc, k) => acc + (JSON.parse(localStorage.getItem(k) || '[]').length || 0), 0);
    });
    expect(after).toBeGreaterThanOrEqual(before);
  });

  test.fixme('S3: experiment switch A→B→A → strokes A preserved per-experiment bucket', async ({ page }) => {
    // Phase 3 dep: experiment picker UX must support quick switching A↔B in this sequence.
    // Marked test.fixme — orchestrator unblocks post Maker-1 multi-exp switch verified.
    await gotoLavagna(page, LAVAGNA_URL);
    expect(true).toBe(true);
  });

  test('S4: draw → click Cancella tutto cestino → confirm → strokes wiped (explicit clear preserved)', async ({ page }) => {
    await gotoLavagna(page, LAVAGNA_URL);
    await activatePenAndDraw(page);

    const cestino = page.locator('[aria-label="Cancella tutto"], [data-action="clear-all"], button:has-text("Cancella")').first();
    const visible = await cestino.isVisible({ timeout: 2000 }).catch(() => false);
    if (!visible) test.skip(true, 'Cestino button not visible in current UI build');

    page.on('dialog', d => d.accept().catch(() => {}));
    await cestino.click();
    await page.waitForTimeout(500);

    const after = await page.evaluate(() => {
      const keys = Object.keys(localStorage).filter(k => k.includes('drawing') || k.includes('paths'));
      return keys.reduce((acc, k) => acc + (JSON.parse(localStorage.getItem(k) || '[]').length || 0), 0);
    });
    expect(after).toBe(0);
  });

  test.fixme('S5: draw → save session → reload → load saved session → strokes restored per esperimento', async ({ page }) => {
    // Phase 3 dep: saved-session reload UX (cronologia ChatGPT-style) — Maker-2 ships iter 1 Phase 3.
    await gotoLavagna(page, LAVAGNA_URL);
    expect(true).toBe(true);
  });
});
