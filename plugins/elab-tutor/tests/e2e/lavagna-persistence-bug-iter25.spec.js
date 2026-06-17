/**
 * LAVAGNA PERSISTENCE BUG — iter 25 reproduce + assert
 *
 * Mandato Andrea iter 19 PM: "Bug: lavagna disegni spariscono quando esci sessione.
 * Persistenza violata. Principio: contenuto sparisce SOLO con cancellazione esplicita."
 * Conferma Tea iter 24: "presenta bug nel salvataggio dei disegni in uscita"
 *
 * Investigation: docs/audits/2026-04-29-iter-25-LAVAGNA-PERSISTENCE-investigation.md
 * Fix design:    docs/audits/2026-04-29-iter-25-LAVAGNA-PERSISTENCE-fix-design.md
 *
 * Strategy:
 *  - Test A (Bug 1): bucket-mismatch null → expId. Draw in sandbox, load experiment,
 *    assert paths still visible OR auto-migrated to expId bucket. PRE-fix expected FAIL.
 *  - Test B (Bug 2): exit→re-entry preserves drawing. Draw with expId, navigate to
 *    #tutor, navigate back to #lavagna, assert paths still visible. PRE-fix expected FAIL.
 *  - Test C (control): explicit clear via "Cancella tutto" DOES wipe — sanity check
 *    that the persistence layer is honored when intentionally cleared.
 *  - Test D (storage probe): direct localStorage assert on key naming convention,
 *    cite drawingStorage.js:17,22 contract.
 *
 * NOTE: pen activation flow uses __ELAB_API.toggleDrawing(true). We bypass UI clicks
 * and call API directly to keep the spec stable across cosmetic UI changes.
 */

import { test, expect } from '@playwright/test';
import { waitForPageReady, seedE2EBypass, skipIfProd, EXPERIMENTS } from './fixtures.js';

const PREVIEW_URL = 'https://elab-tutor-git-e2e-bypass-preview-andreas-projects-6d4e9791.vercel.app';

test.describe('Lavagna Persistence Bug iter 25 (PRE-fix expected FAIL)', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    skipIfProd(test, baseURL);
    await seedE2EBypass(page);
  });

  /**
   * Test A — Bug 1: bucket-mismatch on null → expId transition.
   * DrawingOverlay.jsx:103-108 resets paths when experimentId changes.
   * If user drew in sandbox (null) then loaded experiment, drawing vanishes.
   */
  test('Bug 1: drawing in sandbox survives experiment load (bucket migration)', async ({ page }) => {
    await page.goto('/#lavagna');
    await waitForPageReady(page);

    // Wait for __ELAB_API to be wired
    await page.waitForFunction(() => typeof window.__ELAB_API?.toggleDrawing === 'function', null, { timeout: 15000 });

    // Activate drawing in sandbox (no experiment loaded yet → expId null)
    await page.evaluate(() => window.__ELAB_API.toggleDrawing(true));
    await page.waitForTimeout(300);

    // Simulate a stroke: 3-point drag on the SVG drawing surface.
    // Dispatch pointer events directly on the overlay SVG.
    await page.evaluate(() => {
      const svg = document.querySelector('svg[xmlns="http://www.w3.org/2000/svg"]');
      if (!svg) throw new Error('drawing svg not found');
      const fire = (type, x, y) => svg.dispatchEvent(new PointerEvent(type, {
        clientX: x, clientY: y, pointerId: 1, pointerType: 'mouse', bubbles: true,
      }));
      fire('pointerdown', 100, 100);
      fire('pointermove', 150, 150);
      fire('pointermove', 200, 200);
      fire('pointerup', 200, 200);
    });
    await page.waitForTimeout(200);

    // Capture sandbox bucket — should now contain 1+ paths
    const sandboxBefore = await page.evaluate(() => localStorage.getItem('elab-drawing-paths'));
    expect(sandboxBefore, 'sandbox bucket should have ink after stroke').toBeTruthy();
    const sandboxParsed = JSON.parse(sandboxBefore);
    expect(Array.isArray(sandboxParsed) && sandboxParsed.length > 0, 'sandbox paths > 0').toBe(true);

    // Load an experiment via API → triggers experimentId change in DrawingOverlay
    await page.evaluate((expId) => {
      window.__ELAB_API.loadExperiment(expId);
    }, EXPERIMENTS.ledBasic);
    await page.waitForTimeout(800);

    // ASSERT: drawing should still be visible (either via migrated bucket or preserved state)
    // Check 1: experiment bucket OR sandbox bucket retains content
    const expBucket = await page.evaluate((expId) => localStorage.getItem(`elab-drawing-${expId}`), EXPERIMENTS.ledBasic);
    const sandboxAfter = await page.evaluate(() => localStorage.getItem('elab-drawing-paths'));

    // Fix design: paths SHOULD migrate to experiment bucket on null→id transition.
    // Pre-fix: paths stay in sandbox, experiment bucket is empty/null, on-screen drawing vanishes.
    const expHasPaths = expBucket && JSON.parse(expBucket).length > 0;
    const sandboxStillHasPaths = sandboxAfter && JSON.parse(sandboxAfter).length > 0;

    // Onesto: ONE of these must be true to satisfy "no implicit clear" mandate.
    // After fix: expHasPaths === true (migration happened).
    // Pre-fix: expHasPaths === false AND sandboxStillHasPaths === true BUT not displayed.
    // We assert displayed-state via DOM <path> count.
    const pathCount = await page.evaluate(() => document.querySelectorAll('svg path[stroke-linecap="round"]').length);

    expect.soft(expHasPaths || sandboxStillHasPaths, 'paths preserved in some bucket').toBe(true);
    expect(pathCount, 'at least one stroke visible on screen post-experiment-load').toBeGreaterThan(0);
  });

  /**
   * Test B — Bug 2: exit hash nav → re-entry preserves drawing visually.
   * LavagnaShell.jsx:648-652 sets window.location.hash = '#tutor' which unmounts
   * lavagna. Re-entry mounts with currentExperiment=null → wrong bucket loaded.
   */
  test('Bug 2: exit to #tutor and re-entry preserves drawing on screen', async ({ page }) => {
    await page.goto('/#lavagna');
    await waitForPageReady(page);
    await page.waitForFunction(() => typeof window.__ELAB_API?.toggleDrawing === 'function', null, { timeout: 15000 });

    // Load experiment first so expId is real
    await page.evaluate((expId) => window.__ELAB_API.loadExperiment(expId), EXPERIMENTS.ledBasic);
    await page.waitForTimeout(600);

    // Activate drawing
    await page.evaluate(() => window.__ELAB_API.toggleDrawing(true));
    await page.waitForTimeout(300);

    // Stroke
    await page.evaluate(() => {
      const svg = document.querySelector('svg[xmlns="http://www.w3.org/2000/svg"]');
      if (!svg) throw new Error('drawing svg not found');
      const fire = (type, x, y) => svg.dispatchEvent(new PointerEvent(type, {
        clientX: x, clientY: y, pointerId: 1, pointerType: 'mouse', bubbles: true,
      }));
      fire('pointerdown', 120, 120);
      fire('pointermove', 180, 180);
      fire('pointerup', 180, 180);
    });
    await page.waitForTimeout(200);

    const expBucketBefore = await page.evaluate((expId) => localStorage.getItem(`elab-drawing-${expId}`), EXPERIMENTS.ledBasic);
    expect(expBucketBefore, 'experiment bucket has ink before exit').toBeTruthy();
    const pathsBefore = JSON.parse(expBucketBefore).length;
    expect(pathsBefore).toBeGreaterThan(0);

    // Exit to #tutor (simulates handleMenuOpen)
    await page.evaluate(() => { window.location.hash = '#tutor'; });
    await page.waitForTimeout(500);

    // Re-enter Lavagna
    await page.evaluate(() => { window.location.hash = '#lavagna'; });
    await waitForPageReady(page);
    await page.waitForTimeout(800);

    // Storage MUST still hold paths (no implicit clear allowed)
    const expBucketAfter = await page.evaluate((expId) => localStorage.getItem(`elab-drawing-${expId}`), EXPERIMENTS.ledBasic);
    expect(expBucketAfter, 'experiment bucket survives navigation').toBeTruthy();
    expect(JSON.parse(expBucketAfter).length, 'paths count unchanged').toBe(pathsBefore);

    // ASSERT visually: re-mounted DrawingOverlay should auto-restore the drawing.
    // PRE-fix: drawing not visible because currentExperiment defaults to null on remount,
    // wrong bucket loaded, screen empty.
    // POST-fix: last-expId restore brings back same experiment + same drawing.
    await page.evaluate(() => window.__ELAB_API?.toggleDrawing?.(true));
    await page.waitForTimeout(500);

    const visiblePathCount = await page.evaluate(() => document.querySelectorAll('svg path[stroke-linecap="round"]').length);
    expect(visiblePathCount, 'drawing re-rendered on screen post re-entry').toBeGreaterThan(0);
  });

  /**
   * Test C — control: explicit "Cancella tutto" DOES wipe.
   * Sanity check the persistence layer respects intentional clear.
   */
  test('Control: explicit clearAll wipes paths (intentional cancellation OK)', async ({ page }) => {
    await page.goto('/#lavagna');
    await waitForPageReady(page);
    await page.waitForFunction(() => typeof window.__ELAB_API?.toggleDrawing === 'function', null, { timeout: 15000 });

    await page.evaluate(() => window.__ELAB_API.toggleDrawing(true));
    await page.waitForTimeout(300);

    await page.evaluate(() => {
      const svg = document.querySelector('svg[xmlns="http://www.w3.org/2000/svg"]');
      if (!svg) return;
      const fire = (type, x, y) => svg.dispatchEvent(new PointerEvent(type, {
        clientX: x, clientY: y, pointerId: 1, pointerType: 'mouse', bubbles: true,
      }));
      fire('pointerdown', 100, 100);
      fire('pointermove', 150, 150);
      fire('pointerup', 150, 150);
    });
    await page.waitForTimeout(200);

    const before = await page.evaluate(() => localStorage.getItem('elab-drawing-paths'));
    expect(before).toBeTruthy();

    // Click "Cancella tutto" — aria-label "Cancella" per DrawingOverlay.jsx:394-396
    await page.click('button[aria-label="Cancella"]', { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(300);

    const after = await page.evaluate(() => localStorage.getItem('elab-drawing-paths'));
    // After explicit clear, bucket should be empty array (or absent)
    if (after) {
      expect(JSON.parse(after).length).toBe(0);
    }
  });

  /**
   * Test D — storage contract probe: verify key naming convention from
   * src/utils/drawingStorage.js:17,22 (DEFAULT_SUFFIX='paths', prefix='elab-drawing-').
   */
  test('Storage contract: keys follow elab-drawing-<id> | elab-drawing-paths convention', async ({ page }) => {
    await page.goto('/#lavagna');
    await waitForPageReady(page);
    await page.waitForFunction(() => typeof window.__ELAB_API?.toggleDrawing === 'function', null, { timeout: 15000 });

    await page.evaluate(() => window.__ELAB_API.toggleDrawing(true));
    await page.waitForTimeout(300);

    await page.evaluate(() => {
      const svg = document.querySelector('svg[xmlns="http://www.w3.org/2000/svg"]');
      if (!svg) return;
      const fire = (type, x, y) => svg.dispatchEvent(new PointerEvent(type, {
        clientX: x, clientY: y, pointerId: 1, pointerType: 'mouse', bubbles: true,
      }));
      fire('pointerdown', 80, 80);
      fire('pointermove', 90, 90);
      fire('pointerup', 90, 90);
    });
    await page.waitForTimeout(200);

    const drawingKeys = await page.evaluate(() => {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('elab-drawing-')) keys.push(k);
      }
      return keys;
    });

    expect(drawingKeys.length, 'at least one elab-drawing-* key exists').toBeGreaterThan(0);
    // All keys must match prefix contract
    for (const k of drawingKeys) {
      expect(k.startsWith('elab-drawing-')).toBe(true);
    }
  });
});
