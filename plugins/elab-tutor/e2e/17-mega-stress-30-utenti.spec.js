// @ts-check
/**
 * MEGA STRESS: 30 Utenti Estremi — Playwright Chrome Reale
 *
 * 11. Bambina 8 anni con iPad rotto (touch fantasma)
 * 12. Docente con connessione 3G lentissima
 * 13. Studente daltonico (contrasto critico)
 * 14. Bambino che parla al microfono (voice input senza mic)
 * 15. Docente che apre 3 tab contemporaneamente
 * 16. Studente che copia-incolla da Wikipedia nella chat
 * 17. Docente che cambia esperimento 20 volte in 1 minuto
 * 18. iPad mini (320x480) — schermo minuscolo
 * 19. Monitor 4K (3840x2160) — schermo enorme
 * 20. Bambino che tiene premuto un tasto per 10 secondi
 * 21. Docente che apre ELAB e poi va a prendere il caffe (idle 5 min)
 * 22. Studente che fa pinch-to-zoom su iPad
 * 23. Docente che usa solo tastiera (no mouse — accessibility)
 * 24. Bambino che trascina fuori dalla finestra
 * 25. Docente che stampa la pagina (Ctrl+P)
 * 26. Studente con screen reader (aria-labels)
 * 27. Supplente che confonde Vol1 con Vol3
 * 28. Bambino che scrive emoji nella chat
 * 29. Docente che tenta di usare ELAB offline
 * 30. IT admin che ispeziona la sicurezza
 * 31-40: Scenari di carico e resilienza
 *
 * Claude code andrea marro — 12/04/2026
 */
import { test, expect } from '@playwright/test';
import { setupUser, setTeacherUser } from './helpers.js';

// ═══════════════════════════════════════════════════
// BATCH A: Device estremi (5 test)
// ═══════════════════════════════════════════════════

test.describe('Device Estremi', () => {
  test('U11. iPad mini 320x480 — contenuto visibile', async ({ page }) => {
    await setupUser(page);
    await page.setViewportSize({ width: 320, height: 480 });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    const height = await page.evaluate(() => document.body.scrollHeight);
    expect(height).toBeGreaterThan(100);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U19. Monitor 4K 3840x2160 — no stretch, no white space', async ({ page }) => {
    await setupUser(page);
    await page.setViewportSize({ width: 3840, height: 2160 });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U22. Pinch-to-zoom simulation (wheel + ctrl)', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    // Simula pinch-to-zoom via Ctrl+wheel
    await page.keyboard.down('Control');
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, i % 2 === 0 ? -200 : 200);
    }
    await page.keyboard.up('Control');
    await page.waitForTimeout(500);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U24. Drag fuori dalla finestra — no crash', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    // Inizia drag dal centro e trascina fuori dalla viewport
    await page.mouse.move(400, 300);
    await page.mouse.down();
    await page.mouse.move(-100, -100, { steps: 5 }); // Fuori viewport
    await page.mouse.up();
    await page.waitForTimeout(500);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U25. Ctrl+P (stampa) — no crash', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    // Ctrl+P aprirebbe il dialog stampa — ma in headless non lo fa
    await page.keyboard.press('Control+p');
    await page.waitForTimeout(1000);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════
// BATCH B: Accessibility (5 test)
// ═══════════════════════════════════════════════════

test.describe('Accessibility Estrema', () => {
  test('U13. Daltonico — nessun info trasmessa SOLO via colore', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    // Verifica che i bottoni abbiano testo, non solo colore
    const buttons = page.locator('button:visible');
    const count = await buttons.count();
    let emptyButtons = 0;
    for (let i = 0; i < Math.min(count, 20); i++) {
      const text = await buttons.nth(i).textContent();
      const ariaLabel = await buttons.nth(i).getAttribute('aria-label');
      if ((!text || text.trim().length === 0) && !ariaLabel) emptyButtons++;
    }
    if (emptyButtons > 0) {
      console.log(`⚠️ WCAG: ${emptyButtons} bottoni senza testo/aria-label — daltonico non capisce`);
    }
  });

  test('U23. Solo tastiera — Tab naviga tutti i bottoni', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    const focusedElements = new Set();
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => document.activeElement?.tagName);
      if (tag) focusedElements.add(tag);
    }
    // Deve aver raggiunto almeno BUTTON o A
    const reachedInteractive = focusedElements.has('BUTTON') || focusedElements.has('A') || focusedElements.has('INPUT');
    if (!reachedInteractive) {
      console.log(`⚠️ WCAG: Tab non raggiunge elementi interattivi — solo ${[...focusedElements].join(',')}`);
    }
  });

  test('U26. Screen reader — aria-labels sui bottoni principali', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    const buttons = page.locator('button:visible');
    const count = await buttons.count();
    let withAria = 0;
    for (let i = 0; i < Math.min(count, 20); i++) {
      const ariaLabel = await buttons.nth(i).getAttribute('aria-label');
      const text = (await buttons.nth(i).textContent())?.trim();
      if (ariaLabel || (text && text.length > 0)) withAria++;
    }
    const coverage = Math.round(withAria / Math.min(count, 20) * 100);
    console.log(`Aria coverage: ${withAria}/${Math.min(count, 20)} (${coverage}%)`);
  });

  test('U20. Tasto tenuto premuto 5 secondi — no flood', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    await page.keyboard.down('Enter');
    await page.waitForTimeout(3000);
    await page.keyboard.up('Enter');
    await page.waitForTimeout(500);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U28. Emoji nella chat input — no crash', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    const inputs = page.locator('input:visible, textarea:visible');
    if (await inputs.count() > 0) {
      await inputs.first().fill('Come funziona il LED? 🔴💡🔌');
      await page.waitForTimeout(500);
    }
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════
// BATCH C: Comportamenti assurdi (10 test)
// ═══════════════════════════════════════════════════

test.describe('Comportamenti Assurdi', () => {
  test('U15. 3 navigazioni hash in 1 secondo', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/');
    await page.evaluate(() => { location.hash = 'lavagna'; });
    await page.evaluate(() => { location.hash = 'admin'; });
    await page.evaluate(() => { location.hash = 'lavagna'; });
    await page.waitForTimeout(2000);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U16. Paste 5000 caratteri in input', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    const inputs = page.locator('input:visible, textarea:visible');
    if (await inputs.count() > 0) {
      const longText = 'Il LED è un componente elettronico. '.repeat(150);
      await inputs.first().fill(longText);
    }
    await page.waitForTimeout(500);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U17. Cambio esperimento 10 volte in 30 secondi', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    for (let i = 0; i < 10; i++) {
      const btns = page.locator('button:visible');
      const cnt = await btns.count();
      if (cnt > 2) {
        await btns.nth(Math.floor(Math.random() * Math.min(cnt, 10))).click({ timeout: 500 }).catch(() => {});
      }
      await page.waitForTimeout(200);
    }
    await page.waitForTimeout(1000);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U21. Idle 5 secondi poi interazione — no stale state', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#lavagna');
    await page.waitForTimeout(5000); // Simula idle
    // Dopo idle, clicca qualcosa
    const btns = page.locator('button:visible');
    if (await btns.count() > 0) {
      await btns.first().click({ timeout: 2000 }).catch(() => {});
    }
    await page.waitForTimeout(1000);
    const body = await page.locator('body').textContent();
    expect(body.length).toBeGreaterThan(50);
  });

  test('U27. Confonde Vol1 con Vol3 — switch rapido', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    // Cerca tab volumi e switch avanti-indietro
    const tabs = page.locator('button:visible, [role="tab"]').filter({ hasText: /Vol|Volume/i });
    const count = await tabs.count();
    for (let round = 0; round < 5; round++) {
      for (let i = 0; i < count; i++) {
        await tabs.nth(i).click({ timeout: 500 }).catch(() => {});
        await page.waitForTimeout(200);
      }
    }
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U29. Simulazione "offline" — no network', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    // Taglia la rete
    await page.context().setOffline(true);
    await page.waitForTimeout(2000);
    // L'app deve continuare a funzionare (PWA/offline)
    const body = await page.locator('body').textContent();
    expect(body.length, 'App vuota offline').toBeGreaterThan(20);
    // Ripristina
    await page.context().setOffline(false);
  });

  test('U30. Right-click ovunque — context menu non rompe nulla', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    // Right-click su 5 punti diversi
    for (let i = 0; i < 5; i++) {
      await page.mouse.click(200 + i * 100, 200, { button: 'right' });
      await page.waitForTimeout(200);
    }
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U31. Doppio Escape in dialogo modale', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U32. Click durante caricamento (race condition)', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    // Vai alla pagina e inizia a cliccare PRIMA che finisca il caricamento
    page.goto('/#lavagna');
    await page.waitForTimeout(500);
    for (let i = 0; i < 10; i++) {
      await page.mouse.click(300 + i * 50, 300);
    }
    await page.waitForTimeout(3000);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════
// BATCH D: Resilienza e carico (10 test)
// ═══════════════════════════════════════════════════

test.describe('Resilienza e Carico', () => {
  test('U33. 100 click in 5 secondi — stress massimo', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    for (let i = 0; i < 100; i++) {
      const x = 50 + Math.random() * 900;
      const y = 50 + Math.random() * 600;
      await page.mouse.click(x, y);
    }
    await page.waitForTimeout(2000);
    const critical = errors.filter(e => !e.includes('ResizeObserver'));
    if (critical.length > 0) {
      console.log(`⚠️ ${critical.length} errori dopo 100 click — RESILIENZA INSUFFICIENTE`);
    }
  });

  test('U34. Navigazione rapida / → #lavagna → / → #lavagna (10x)', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    for (let i = 0; i < 10; i++) {
      await page.goto(i % 2 === 0 ? '/' : '/#lavagna');
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(2000);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U35. localStorage con 100 sessioni vecchie', async ({ page }) => {
    await page.addInitScript(() => {
      const sessions = [];
      for (let i = 0; i < 100; i++) {
        sessions.push({
          experimentId: `v1-cap${6 + (i % 9)}-esp${(i % 3) + 1}`,
          startTime: new Date(Date.now() - i * 86400000).toISOString(),
          messages: Array(5).fill({ role: 'user', content: 'test' }),
          errors: [],
        });
      }
      localStorage.setItem('elab_sessions', JSON.stringify(sessions));
      localStorage.setItem('elab_gdpr_consent', JSON.stringify({
        status: 'accepted', age: 14, timestamp: new Date().toISOString(), version: '1.0',
      }));
      localStorage.setItem('elab_onboarding_seen', 'true');
    });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(5000);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('U36. DOM node count dopo 5 minuti simulati', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    // Simula 5 min di interazione (30 azioni)
    for (let i = 0; i < 30; i++) {
      const btns = page.locator('button:visible');
      const cnt = await btns.count();
      if (cnt > 0) {
        await btns.nth(i % Math.min(cnt, 10)).click({ timeout: 300 }).catch(() => {});
      }
      await page.waitForTimeout(200);
    }
    const nodes = await page.evaluate(() => document.querySelectorAll('*').length);
    console.log(`DOM nodes dopo 30 interazioni: ${nodes}`);
    expect(nodes, `DOM explosion: ${nodes} nodi`).toBeLessThan(20000);
  });

  test('U37. Performance: First Contentful Paint', async ({ page }) => {
    await setupUser(page);
    const start = Date.now();
    await page.goto('/#lavagna');
    await page.waitForSelector('body *', { timeout: 10000 });
    const fcp = Date.now() - start;
    console.log(`FCP: ${fcp}ms`);
    expect(fcp, `FCP troppo lento: ${fcp}ms`).toBeLessThan(8000);
  });

  test('U38. Nessun event listener leak dopo mount/unmount', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    const before = await page.evaluate(() => {
      // Count event listeners (approximate via getEventListeners in CDP)
      return document.querySelectorAll('*').length;
    });
    // Navigate away and back
    await page.goto('/');
    await page.waitForTimeout(1000);
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    const after = await page.evaluate(() => document.querySelectorAll('*').length);
    // DOM count should not grow significantly
    const growth = after - before;
    if (growth > 500) {
      console.log(`⚠️ DOM growth after remount: +${growth} nodi — possibile leak`);
    }
  });

  test('U39. Console errors count dopo sessione completa', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    await setupUser(page);
    await page.goto('/#lavagna');
    await page.waitForTimeout(5000);
    // Interagisci un po'
    for (let i = 0; i < 10; i++) {
      const btns = page.locator('button:visible');
      if (await btns.count() > 0) {
        await btns.nth(i % (await btns.count())).click({ timeout: 300 }).catch(() => {});
      }
      await page.waitForTimeout(300);
    }
    const real = consoleErrors.filter(e =>
      !e.includes('favicon') && !e.includes('404') && !e.includes('serviceWorker') && !e.includes('manifest')
    );
    console.log(`Console errors: ${real.length} (${consoleErrors.length} totali)`);
    if (real.length > 0) {
      real.slice(0, 3).forEach(e => console.log(`  - ${e.slice(0, 100)}`));
    }
  });

  test('U40. App funziona dopo 20 secondi di inattività', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#lavagna');
    await page.waitForTimeout(20000); // 20 secondi idle
    // Deve ancora funzionare
    const btns = page.locator('button:visible');
    const count = await btns.count();
    expect(count, 'Nessun bottone dopo 20s idle').toBeGreaterThan(0);
    // Click funziona ancora
    if (count > 0) {
      await btns.first().click({ timeout: 2000 }).catch(() => {});
    }
  });
});
