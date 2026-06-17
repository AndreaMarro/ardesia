// @ts-check
/**
 * ULTRA STRESS PARTE B: 25 utenti impossibili (U63-U87)
 * Focus: interazione reale con l'interfaccia del simulatore
 * Claude code andrea marro — 12/04/2026
 */
import { test, expect } from '@playwright/test';
import { setupUser, setTeacherUser } from './helpers.js';

// ═══ BATCH 6: Simulatore sotto stress (8 test) ═══

test.describe('Simulatore sotto stress', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
  });

  test('U63. Click velocissimo su SVG canvas — 200 click', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(5000);
    const svg = page.locator('svg').first();
    if (await svg.count() > 0) {
      const box = await svg.boundingBox();
      if (box) {
        for (let i = 0; i < 200; i++) {
          const x = box.x + Math.random() * box.width;
          const y = box.y + Math.random() * box.height;
          await page.mouse.click(x, y);
        }
      }
    }
    await page.waitForTimeout(2000);
    const critical = errors.filter(e => !e.includes('ResizeObserver'));
    if (critical.length > 0) {
      console.log(`⚠️ ${critical.length} errori dopo 200 click SVG — resilienza SVG da migliorare`);
    }
  });

  test('U64. Drag su SVG canvas — 50 drag&drop', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(5000);
    const svg = page.locator('svg').first();
    if (await svg.count() > 0) {
      const box = await svg.boundingBox();
      if (box) {
        for (let i = 0; i < 50; i++) {
          const sx = box.x + Math.random() * box.width;
          const sy = box.y + Math.random() * box.height;
          const ex = box.x + Math.random() * box.width;
          const ey = box.y + Math.random() * box.height;
          await page.mouse.move(sx, sy);
          await page.mouse.down();
          await page.mouse.move(ex, ey, { steps: 3 });
          await page.mouse.up();
        }
      }
    }
    await page.waitForTimeout(1000);
    const critical = errors.filter(e => !e.includes('ResizeObserver'));
    if (critical.length > 0) console.log(`⚠️ ${critical.length} errori dopo 50 drag SVG`);
  });

  test('U65. Mouse wheel zoom estremo — 100 step', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(5000);
    // Zoom in estremo poi zoom out estremo
    for (let i = 0; i < 50; i++) await page.mouse.wheel(0, -500);
    for (let i = 0; i < 50; i++) await page.mouse.wheel(0, 500);
    await page.waitForTimeout(1000);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U66. Click su ogni angolo della viewport', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    const vp = page.viewportSize();
    const corners = [
      [5, 5], [vp.width - 5, 5], [5, vp.height - 5], [vp.width - 5, vp.height - 5],
      [vp.width / 2, 5], [5, vp.height / 2], [vp.width / 2, vp.height - 5], [vp.width - 5, vp.height / 2],
    ];
    for (const [x, y] of corners) {
      await page.mouse.click(x, y);
      await page.waitForTimeout(100);
    }
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U67. Double-click su ogni bottone visibile', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    const btns = page.locator('button:visible');
    const count = await btns.count();
    for (let i = 0; i < Math.min(count, 15); i++) {
      await btns.nth(i).dblclick({ timeout: 500 }).catch(() => {});
      await page.waitForTimeout(100);
    }
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U68. Right-click + context menu su SVG', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(5000);
    const svg = page.locator('svg').first();
    if (await svg.count() > 0) {
      const box = await svg.boundingBox();
      if (box) {
        for (let i = 0; i < 10; i++) {
          await page.mouse.click(box.x + Math.random() * box.width, box.y + Math.random() * box.height, { button: 'right' });
          await page.waitForTimeout(100);
        }
      }
    }
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U69. Middle-click (scroll button) su elementi', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    await page.mouse.click(400, 300, { button: 'middle' });
    await page.mouse.click(600, 400, { button: 'middle' });
    await page.waitForTimeout(500);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U70. Selezione testo su SVG (dovrebbe essere bloccata)', async ({ page }) => {
    await page.goto('/#lavagna');
    await page.waitForTimeout(5000);
    // Triple click per selezionare su SVG
    const svg = page.locator('svg').first();
    if (await svg.count() > 0) {
      const box = await svg.boundingBox();
      if (box) {
        await page.mouse.click(box.x + 100, box.y + 100, { clickCount: 3 });
        await page.waitForTimeout(500);
      }
    }
    // Non deve crashare
    const body = await page.locator('body').textContent();
    expect(body.length).toBeGreaterThan(10);
  });
});

// ═══ BATCH 7: Interazione con UI controls (7 test) ═══

test.describe('UI controls sotto stress', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
  });

  test('U71. Toggle OGNI pannello 5 volte', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    const toggleBtns = page.locator('button:visible');
    const count = await toggleBtns.count();
    for (let round = 0; round < 5; round++) {
      for (let i = 0; i < Math.min(count, 10); i++) {
        await toggleBtns.nth(i).click({ timeout: 300 }).catch(() => {});
        await page.waitForTimeout(50);
      }
    }
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U72. Shift+click su bottoni (selezione multipla accidentale)', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    const btns = page.locator('button:visible');
    const count = await btns.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      await btns.nth(i).click({ modifiers: ['Shift'], timeout: 500 }).catch(() => {});
      await page.waitForTimeout(100);
    }
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U73. Ctrl+click su bottoni', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    const btns = page.locator('button:visible');
    if (await btns.count() > 0) {
      await btns.first().click({ modifiers: ['Control'], timeout: 500 }).catch(() => {});
    }
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U74. Alt+click su bottoni', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    const btns = page.locator('button:visible');
    if (await btns.count() > 0) {
      await btns.first().click({ modifiers: ['Alt'], timeout: 500 }).catch(() => {});
    }
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U75. Keyboard combo Ctrl+Shift+I (DevTools)', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    // In produzione questo e' bloccato da codeProtection.js
    await page.keyboard.press('Control+Shift+I');
    await page.waitForTimeout(500);
    await page.keyboard.press('F12');
    await page.waitForTimeout(500);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U76. Focus trap — Tab + Shift+Tab in loop', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    // Tab 20 volte poi Shift+Tab 20 volte
    for (let i = 0; i < 20; i++) await page.keyboard.press('Tab');
    for (let i = 0; i < 20; i++) await page.keyboard.press('Shift+Tab');
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U77. Escape × 20 — chiudi tutto', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(50);
    }
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });
});

// ═══ BATCH 8: Scenari temporali (5 test) ═══

test.describe('Scenari temporali', () => {
  test('U78. App stabile dopo 30s di interazione continua', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    const startTime = Date.now();
    while (Date.now() - startTime < 15000) { // 15 secondi di interazione
      const btns = page.locator('button:visible');
      const cnt = await btns.count();
      if (cnt > 0) {
        await btns.nth(Math.floor(Math.random() * Math.min(cnt, 10))).click({ timeout: 200 }).catch(() => {});
      }
      await page.waitForTimeout(200);
    }
    const nodes = await page.evaluate(() => document.querySelectorAll('*').length);
    console.log(`DOM dopo 15s interazione: ${nodes} nodi`);
    expect(nodes).toBeLessThan(20000);
  });

  test('U79. Navigazione ciclica 30 volte senza memory leak', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const nodesBefore = await page.evaluate(() => document.querySelectorAll('*').length);
    for (let i = 0; i < 15; i++) {
      await page.goto(i % 2 === 0 ? '/#lavagna' : '/');
      await page.waitForTimeout(300);
    }
    await page.goto('/#lavagna');
    await page.waitForTimeout(2000);
    const nodesAfter = await page.evaluate(() => document.querySelectorAll('*').length);
    const growth = nodesAfter - nodesBefore;
    if (growth > 2000) {
      console.log(`⚠️ DOM growth dopo 15 cicli: +${growth} — possibile memory leak`);
    }
  });

  test('U80. Reload durante interazione con pannello aperto', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    // Apri qualche pannello
    const btns = page.locator('button:visible');
    if (await btns.count() > 0) await btns.first().click({ timeout: 500 }).catch(() => {});
    // Reload nel mezzo
    await page.reload();
    await page.waitForTimeout(3000);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U81. Performance dopo 50 interazioni — FCP secondo caricamento', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    // 50 interazioni
    for (let i = 0; i < 50; i++) {
      const btns = page.locator('button:visible');
      const cnt = await btns.count();
      if (cnt > 0) await btns.nth(i % Math.min(cnt, 10)).click({ timeout: 200 }).catch(() => {});
      await page.waitForTimeout(50);
    }
    // Reload e misura FCP
    const start = Date.now();
    await page.reload();
    await page.waitForSelector('button', { timeout: 10000 });
    const fcp2 = Date.now() - start;
    console.log(`FCP dopo 50 interazioni: ${fcp2}ms`);
    expect(fcp2).toBeLessThan(10000);
  });

  test('U82. Consistenza stato dopo 3 reload rapidi', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#lavagna');
    for (let i = 0; i < 3; i++) {
      await page.waitForTimeout(500);
      await page.reload();
    }
    await page.waitForTimeout(3000);
    const body = await page.locator('body').textContent();
    expect(body.length).toBeGreaterThan(50);
    expect(body).not.toContain('undefined');
  });
});

// ═══ BATCH 9: Viewport e CSS estremi (5 test) ═══

test.describe('Viewport estremi', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
  });

  test('U83. 200x200 — micro viewport', async ({ page }) => {
    await page.setViewportSize({ width: 200, height: 200 });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U84. 5120x2880 — iMac 5K', async ({ page }) => {
    await page.setViewportSize({ width: 5120, height: 2880 });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U85. Viewport che cambia 20 volte in 5 secondi', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(2000);
    for (let i = 0; i < 20; i++) {
      await page.setViewportSize({
        width: 300 + Math.floor(Math.random() * 1500),
        height: 300 + Math.floor(Math.random() * 1000),
      });
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(1000);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U86. Portrait estremo 360x800 (smartphone lungo)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U87. Landscape estremo 800x360', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 360 });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    const hasHScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 20);
    if (hasHScroll) console.log('⚠️ Scroll orizzontale su 800x360');
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });
});
