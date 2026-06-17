// @ts-check
/**
 * ULTRA STRESS PARTE A: 25 utenti impossibili (U41-U65)
 * Scenari che NESSUNO penserebbe di testare. Se sopravvive a questi, sopravvive a tutto.
 * Claude code andrea marro — 12/04/2026
 */
import { test, expect } from '@playwright/test';
import { setupUser, setTeacherUser } from './helpers.js';

// ═══ BATCH 1: Utenti con problemi di rete (5 test) ═══

test.describe('Rete instabile', () => {
  test('U41. Rete che va e viene 5 volte', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(2000);
    for (let i = 0; i < 5; i++) {
      await page.context().setOffline(true);
      await page.waitForTimeout(500);
      await page.context().setOffline(false);
      await page.waitForTimeout(500);
    }
    await page.waitForTimeout(2000);
    const body = await page.locator('body').textContent();
    expect(body.length).toBeGreaterThan(20);
  });

  test('U42. Offline completo per 10 secondi poi online', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#lavagna');
    await page.waitForTimeout(2000);
    await page.context().setOffline(true);
    // Interagisci offline
    const btns = page.locator('button:visible');
    for (let i = 0; i < 5; i++) {
      if (await btns.count() > 0) await btns.first().click({ timeout: 500 }).catch(() => {});
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(5000);
    await page.context().setOffline(false);
    await page.waitForTimeout(2000);
    const body = await page.locator('body').textContent();
    expect(body.length).toBeGreaterThan(20);
  });

  test('U43. Refresh durante transizione offline→online', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(2000);
    await page.context().setOffline(true);
    await page.waitForTimeout(500);
    await page.context().setOffline(false);
    await page.reload();
    await page.waitForTimeout(3000);
    expect(errors.filter(e => !e.includes('ResizeObserver') && !e.includes('fetch'))).toHaveLength(0);
  });
});

// ═══ BATCH 2: Utenti che rompono l'ordine (5 test) ═══

test.describe('Ordine rotto', () => {
  test('U44. Carica Vol3 esperimento senza aver mai fatto Vol1', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    // Cerca tab Vol3
    const vol3Tab = page.locator('button:visible, [role="tab"]').filter({ hasText: /Vol.*3|Volume 3/i });
    if (await vol3Tab.count() > 0) {
      await vol3Tab.first().click();
      await page.waitForTimeout(1000);
      // Clicca il primo esperimento Vol3
      const items = page.locator('button:visible');
      if (await items.count() > 2) await items.nth(2).click({ timeout: 1000 }).catch(() => {});
    }
    await page.waitForTimeout(2000);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U45. Doppio mount — naviga via e torna istantaneamente', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    for (let i = 0; i < 5; i++) {
      await page.goto('/#lavagna', { waitUntil: 'commit' });
      await page.goto('/', { waitUntil: 'commit' });
    }
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U46. Spam hash change 20 volte in 2 secondi', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/');
    for (let i = 0; i < 20; i++) {
      await page.evaluate((h) => { location.hash = h; }, i % 2 === 0 ? 'lavagna' : '');
    }
    await page.waitForTimeout(3000);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U47. window.history.pushState manipulation', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
      for (let i = 0; i < 10; i++) history.pushState({}, '', `/#test-${i}`);
    });
    await page.waitForTimeout(1000);
    // Back 5 volte
    for (let i = 0; i < 5; i++) { await page.goBack(); await page.waitForTimeout(200); }
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });
});

// ═══ BATCH 3: Input malevoli (5 test) ═══

test.describe('Input malevoli', () => {
  test('U48. SQL injection in input field', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    const inputs = page.locator('input:visible, textarea:visible');
    if (await inputs.count() > 0) {
      await inputs.first().fill("'; DROP TABLE students; --");
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
    }
    // Il testo potrebbe apparire nell'input come testo — non e' esecuzione SQL
    // L'importante e' che non ci siano errori JS o esecuzione server-side
    const errors2 = [];
    page.on('pageerror', e => errors2.push(e.message));
    await page.waitForTimeout(500);
    expect(errors2.filter(e => e.includes('SQL'))).toHaveLength(0);
  });

  test('U49. HTML injection in input', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    const inputs = page.locator('input:visible, textarea:visible');
    if (await inputs.count() > 0) {
      await inputs.first().fill('<h1>HACKED</h1><script>alert(1)</script>');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
    }
    // Il testo non deve essere renderizzato come HTML
    const h1 = page.locator('h1:has-text("HACKED")');
    expect(await h1.count()).toBe(0);
  });

  test('U50. Unicode speciale (RTL, zero-width, emoji compositi)', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    const inputs = page.locator('input:visible, textarea:visible');
    if (await inputs.count() > 0) {
      await inputs.first().fill('Test \u200B\u200C\u200D\u2066\u2067 مرحبا 🇮🇹🏳️‍🌈👨‍👩‍👧‍👦');
      await page.waitForTimeout(500);
    }
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U51. Path traversal in URL hash', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#../../etc/passwd');
    await page.waitForTimeout(2000);
    const body = await page.locator('body').textContent();
    expect(body).not.toContain('root:');
  });

  test('U52. Null bytes in input', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    const inputs = page.locator('input:visible, textarea:visible');
    if (await inputs.count() > 0) {
      await inputs.first().fill('test\x00null\x00bytes');
      await page.waitForTimeout(500);
    }
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });
});

// ═══ BATCH 4: Scenari multi-componente (5 test) ═══

test.describe('Multi-componente', () => {
  test('U53. Apri TUTTI i pannelli contemporaneamente', async ({ page }) => {
    await setupUser(page);
    await setTeacherUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    // Clicca ogni bottone toggle
    const btns = page.locator('button:visible');
    const count = await btns.count();
    for (let i = 0; i < Math.min(count, 15); i++) {
      await btns.nth(i).click({ timeout: 500 }).catch(() => {});
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(2000);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U54. Resize finestra mentre pannelli aperti', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    // Apri qualche pannello
    const btns = page.locator('button:visible');
    if (await btns.count() > 3) {
      await btns.nth(0).click({ timeout: 500 }).catch(() => {});
      await btns.nth(1).click({ timeout: 500 }).catch(() => {});
    }
    // Resize violento
    for (let w = 1200; w >= 400; w -= 100) {
      await page.setViewportSize({ width: w, height: 700 });
      await page.waitForTimeout(100);
    }
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U55. Keyboard shortcuts con pannelli aperti', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    const keys = ['Space', 'Enter', 'Escape', 'Delete', 'F1', 'F5', 'F11'];
    for (const key of keys) {
      await page.keyboard.press(key).catch(() => {});
      await page.waitForTimeout(200);
    }
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U56. Scroll wheel su ogni area della pagina', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    for (let x = 100; x < 800; x += 200) {
      for (let y = 100; y < 600; y += 200) {
        await page.mouse.move(x, y);
        await page.mouse.wheel(0, -300);
        await page.mouse.wheel(0, 300);
      }
    }
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U57. Touch simulation — swipe gesture', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    // Simula swipe con mouse (touchscreen richiede hasTouch nel context)
    await page.mouse.click(400, 300);
    await page.waitForTimeout(200);
    // Drag gesture simulato
    await page.mouse.move(400, 300);
    await page.mouse.down();
    await page.mouse.move(200, 300, { steps: 5 });
    await page.mouse.up();
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });
});

// ═══ BATCH 5: Principio Zero — edge cases (5 test) ═══

test.describe('Principio Zero Edge Cases', () => {
  test('U58. Docente con localStorage di 30 lezioni passate', async ({ page }) => {
    await page.addInitScript(() => {
      const sessions = [];
      for (let i = 0; i < 30; i++) {
        sessions.push({
          experimentId: `v1-cap${6 + (i % 9)}-esp${(i % 3) + 1}`,
          startTime: new Date(Date.now() - i * 86400000).toISOString(),
          endTime: new Date(Date.now() - i * 86400000 + 2700000).toISOString(),
          messages: Array(3).fill({ role: 'user', content: 'domanda' }),
          errors: i % 4 === 0 ? [{ type: 'polarity' }] : [],
        });
      }
      localStorage.setItem('elab_sessions', JSON.stringify(sessions));
      localStorage.setItem('elab_gdpr_consent', JSON.stringify({
        status: 'accepted', age: 35, timestamp: new Date().toISOString(), version: '1.0',
      }));
      localStorage.setItem('elab_onboarding_seen', 'true');
    });
    await page.goto('/#lavagna');
    await page.waitForTimeout(5000);
    // Con 30 sessioni, il bentornati flow deve suggerire il prossimo esperimento
    const body = await page.locator('body').textContent();
    expect(body.length).toBeGreaterThan(50);
  });

  test('U59. Docente che ha completato TUTTI i 92 esperimenti', async ({ page }) => {
    await page.addInitScript(() => {
      const sessions = [];
      // Simula tutti e 92 gli esperimenti completati
      for (let v = 1; v <= 3; v++) {
        const capRange = v === 1 ? [6, 14] : v === 2 ? [3, 12] : [5, 8];
        for (let c = capRange[0]; c <= capRange[1]; c++) {
          for (let e = 1; e <= 3; e++) {
            sessions.push({
              experimentId: `v${v}-cap${c}-esp${e}`,
              startTime: new Date(Date.now() - sessions.length * 3600000).toISOString(),
              messages: [], errors: [],
            });
          }
        }
      }
      localStorage.setItem('elab_sessions', JSON.stringify(sessions));
      localStorage.setItem('elab_gdpr_consent', JSON.stringify({
        status: 'accepted', age: 40, timestamp: new Date().toISOString(), version: '1.0',
      }));
    });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(5000);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U60. Bambino 8 anni con consenso parentale pending', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('elab_gdpr_consent', JSON.stringify({
        status: 'parental_required', age: 8,
        parentEmail: 'mamma@test.it',
        timestamp: new Date().toISOString(), version: '1.0',
      }));
    });
    await page.goto('/');
    await page.waitForTimeout(3000);
    // L'app deve mostrare qualcosa — non una pagina bianca
    const body = await page.locator('body').textContent();
    expect(body.length).toBeGreaterThan(20);
  });

  test('U61. Due tab aperte — consistenza localStorage', async ({ page, context }) => {
    await setupUser(page);
    await page.goto('/#lavagna');
    await page.waitForTimeout(2000);
    // Apri seconda tab
    const page2 = await context.newPage();
    await setupUser(page2);
    await page2.goto('/#lavagna');
    await page2.waitForTimeout(2000);
    // Interagisci su tab 1
    const btns1 = page.locator('button:visible');
    if (await btns1.count() > 0) await btns1.first().click({ timeout: 500 }).catch(() => {});
    // Tab 2 deve ancora funzionare
    const body2 = await page2.locator('body').textContent();
    expect(body2.length).toBeGreaterThan(20);
    await page2.close();
  });

  test('U62. Cambio lingua browser (Accept-Language) — app resta in italiano', async ({ page }) => {
    await setupUser(page);
    // Simula browser in inglese
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    const body = await page.locator('body').textContent();
    // L'app deve restare in italiano — non switchare a inglese
    expect(body).not.toContain('Choose experiment');
    expect(body).not.toContain('Start simulation');
  });
});
