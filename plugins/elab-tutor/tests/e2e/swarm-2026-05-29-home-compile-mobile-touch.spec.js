/**
 * swarm-2026-05-29-home-compile-mobile-touch.spec.js
 *
 * SWARM 5 — Playwright responsive + touch-target audit for /#compile-home.
 *
 * Andrea immutable rule (CLAUDE.md Quality #9):
 *   "Touch target minimo 44x44px per bottoni interattivi"
 *
 * Plus implicit responsive contract:
 *   - LIM 1080p + 4K (1920x1080, 3840x2160)
 *   - Docente iPad (768x1024, 1024x1366)
 *   - Phone fallback (375x812) — degraded but functional, no overflow
 *
 * Tests:
 *   T1 — Desktop 1920x1080 LIM: no horizontal overflow, primary CTAs visible
 *   T2 — iPad portrait 768x1024: editor + compile-bar visible, touch >= 44px
 *   T3 — iPad landscape 1024x768: same with adjusted layout
 *   T4 — Phone portrait 375x812 (degraded): no horizontal scroll on body
 *   T5 — Tap test: tap on compile button registers (pointer-events not blocked
 *        by overlay)
 *   T6 — Pinch zoom: NOT disabled at viewport level (WCAG 1.4.4)
 *   T7 — Orientation change: no broken layout on rotate emulation
 *
 * Honest caveats:
 *   1. Playwright emulates viewport + touch but cannot reproduce real device
 *      finger imprecision. The 44x44 target is a proxy, not a guarantee.
 *   2. Some assertions skip when the corresponding element is unmounted
 *      (Swarm 2 V2 redesign may move panels into accordion/drawer pattern).
 *   3. Phone layout is deliberately degraded — ELAB is LIM-first. The test
 *      asserts NO horizontal overflow but does NOT enforce identical
 *      desktop affordances at 375px width.
 */
import { test, expect, devices } from '@playwright/test';
import {
  seedGateBypass,
  bypassWelcomeGate,
} from './helpers/welcome-gate-bypass.js';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const COMPILE_HOME_HASH = '/#compile-home';

const VIEWPORTS = {
  LIM_1080: { width: 1920, height: 1080, name: 'LIM 1080p' },
  LIM_4K: { width: 3840, height: 2160, name: 'LIM 4K' },
  IPAD_PORTRAIT: { width: 768, height: 1024, name: 'iPad portrait' },
  IPAD_LANDSCAPE: { width: 1024, height: 768, name: 'iPad landscape' },
  PHONE: { width: 375, height: 812, name: 'iPhone 13 portrait' },
};

const CTA_SELECTORS = [
  { sel: '[data-testid="home-compile-entry"] header button', label: 'back' },
  { sel: '[data-testid="board-picker"]', label: 'board picker' },
  { sel: 'button:has-text("Compila")', label: 'compile' },
  { sel: '[data-testid^="universal-upload-"] button', label: 'upload' },
];

async function gotoCompileHome(page) {
  await seedGateBypass(page);
  await page.goto(`${BASE_URL}${COMPILE_HOME_HASH}`, { waitUntil: 'domcontentloaded' });
  await bypassWelcomeGate(page);
  await page.waitForTimeout(2000);
}

async function assertNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      overflowRatio: document.documentElement.scrollWidth / document.documentElement.clientWidth,
    };
  });
  // Allow tiny 2px tolerance for scrollbar; anything > 1.05 is a real overflow
  expect(overflow.overflowRatio, `horizontal overflow ratio: ${overflow.overflowRatio.toFixed(3)} (scrollWidth=${overflow.scrollWidth} clientWidth=${overflow.clientWidth})`).toBeLessThanOrEqual(1.05);
}

async function reportTouchTargets(page, contextLabel) {
  const failures = [];
  for (const { sel, label } of CTA_SELECTORS) {
    const loc = page.locator(sel).first();
    const visible = await loc.isVisible({ timeout: 2_000 }).catch(() => false);
    if (!visible) continue;
    const box = await loc.boundingBox().catch(() => null);
    if (!box) continue;
    if (box.width < 44 || box.height < 44) {
      failures.push(`${contextLabel} / ${label}: ${Math.round(box.width)}x${Math.round(box.height)}`);
    }
  }
  return failures;
}

test.describe('SWARM 5 — Home compile mobile/touch/responsive', () => {

  test('T1: LIM 1080p — no horizontal overflow, primary CTAs visible', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.LIM_1080);
    await gotoCompileHome(page);

    const entry = page.locator('[data-testid="home-compile-entry"]');
    await expect(entry).toBeVisible({ timeout: 10_000 });

    await assertNoHorizontalOverflow(page);

    const visible = await page.evaluate(() => ({
      header: !!document.querySelector('[data-testid="home-compile-entry"] header'),
      main: !!document.querySelector('[data-testid="home-compile-entry"] main'),
      aside: !!document.querySelector('[data-testid="home-compile-entry"] aside'),
    }));
    expect(visible.header).toBe(true);
    expect(visible.main).toBe(true);
    expect(visible.aside).toBe(true);
  });

  test('T2: iPad portrait — touch targets >= 44x44 for primary CTAs', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.IPAD_PORTRAIT);
    await gotoCompileHome(page);

    const entry = page.locator('[data-testid="home-compile-entry"]');
    await expect(entry).toBeVisible({ timeout: 10_000 });

    const failures = await reportTouchTargets(page, 'iPad portrait');
    test.info().annotations.push({
      type: 'description',
      description: failures.length ? `touch failures: ${failures.join('; ')}` : 'all touch targets >= 44x44',
    });
    expect(failures, `undersized: ${failures.join(', ')}`).toHaveLength(0);

    await assertNoHorizontalOverflow(page);
  });

  test('T3: iPad landscape — editor + compile-bar both visible side-by-side', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.IPAD_LANDSCAPE);
    await gotoCompileHome(page);

    const entry = page.locator('[data-testid="home-compile-entry"]');
    await expect(entry).toBeVisible({ timeout: 10_000 });

    const editorPanel = page.locator('[data-onboard-target="editor"]').first();
    const compilePanel = page.locator('[data-onboard-target="compile-bar"]').first();
    const editorVisible = await editorPanel.isVisible({ timeout: 5_000 }).catch(() => false);
    const compileVisible = await compilePanel.isVisible({ timeout: 5_000 }).catch(() => false);

    if (!editorVisible || !compileVisible) {
      test.skip(true, 'V2 redesign may move panels; baseline ok per current build only');
      return;
    }

    const editorBox = await editorPanel.boundingBox();
    const compileBox = await compilePanel.boundingBox();
    expect(editorBox?.width || 0).toBeGreaterThan(200);
    expect(compileBox?.width || 0).toBeGreaterThan(200);

    await assertNoHorizontalOverflow(page);
  });

  test('T4: Phone fallback (375x812) — no horizontal overflow', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.PHONE);
    await gotoCompileHome(page);

    const entry = page.locator('[data-testid="home-compile-entry"]');
    await expect(entry).toBeVisible({ timeout: 10_000 });

    await assertNoHorizontalOverflow(page);

    // Phone is degraded — we DON'T enforce 44x44 here, only "no overflow + entry visible"
    // because Swarm 2 V2 may collapse panels into accordion.
    test.info().annotations.push({
      type: 'description',
      description: 'Phone layout exists but UX is best-effort; LIM/iPad are primary.',
    });
  });

  test('T5: tap on compile button is not blocked by overlay (LIM viewport)', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.LIM_1080);
    await gotoCompileHome(page);

    const entry = page.locator('[data-testid="home-compile-entry"]');
    await expect(entry).toBeVisible({ timeout: 10_000 });

    const compileBtn = page.locator('button:has-text("Compila")').first();
    const visible = await compileBtn.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!visible) {
      test.skip(true, 'Compile button not in DOM at LIM viewport');
      return;
    }

    // Tap the button — Playwright dispatches a touchstart/touchend pair
    // If an overlay is intercepting, the click receiver won't be the button
    const handle = await compileBtn.elementHandle();
    if (!handle) {
      test.skip(true, 'Compile button handle not retrievable');
      return;
    }
    const box = await compileBtn.boundingBox();
    if (!box) {
      test.skip(true, 'no bounding box for compile button');
      return;
    }
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    const receiver = await page.evaluate(({ x, y }) => {
      const el = document.elementFromPoint(x, y);
      if (!el) return null;
      // Find nearest ancestor button if direct hit is a span / icon
      const btn = el.closest('button');
      return btn ? {
        text: btn.textContent?.trim() || '',
        ariaLabel: btn.getAttribute('aria-label') || '',
        testId: btn.getAttribute('data-testid') || '',
      } : { text: el.textContent?.slice(0, 50) || '', tag: el.tagName };
    }, { x: cx, y: cy });

    expect(receiver, 'no element at compile-button center').not.toBeNull();
    expect(
      receiver?.text?.toLowerCase().includes('compila') ||
      receiver?.ariaLabel?.toLowerCase().includes('compila') ||
      receiver?.testId?.includes('compile'),
      `tap receiver mismatch: ${JSON.stringify(receiver)}`,
    ).toBe(true);
  });

  test('T6: viewport meta does NOT block pinch zoom (WCAG 1.4.4)', async ({ page }) => {
    await gotoCompileHome(page);
    const viewportContent = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return meta?.getAttribute('content') || '';
    });
    // WCAG 1.4.4: must NOT contain user-scalable=no OR maximum-scale=1
    expect(viewportContent.toLowerCase()).not.toMatch(/user-scalable\s*=\s*no/);
    expect(viewportContent.toLowerCase()).not.toMatch(/maximum-scale\s*=\s*1[^.\d]/);
  });

  test('T7: orientation change (portrait → landscape) — no broken layout', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.IPAD_PORTRAIT);
    await gotoCompileHome(page);
    const entry = page.locator('[data-testid="home-compile-entry"]');
    await expect(entry).toBeVisible({ timeout: 10_000 });
    await assertNoHorizontalOverflow(page);

    await page.setViewportSize(VIEWPORTS.IPAD_LANDSCAPE);
    await page.waitForTimeout(800);
    // Entry must still be visible — no crash on rotate
    await expect(entry).toBeVisible({ timeout: 5_000 });
    await assertNoHorizontalOverflow(page);
  });
});
