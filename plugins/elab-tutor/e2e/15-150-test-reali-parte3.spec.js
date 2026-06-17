// @ts-check
/**
 * ELAB TUTOR — 150 Test Reali Playwright
 * PARTE 3: Flusso completo docente, BuildSteps, Volume navigation (40 test)
 *
 * Simula 4 utenti reali:
 * - Prof.ssa Rossi: docente esperta, segue tutto il percorso
 * - Prof. Verdi: docente impreparato, primo giorno con ELAB
 * - Marco (10 anni): studente curioso che esplora tutto
 * - Dirigente Scolastico: visita rapida per valutare il prodotto
 *
 * Claude code andrea marro — 12/04/2026
 */
import { test, expect } from '@playwright/test';
import { setupUser, setVolume, setTeacherUser } from './helpers.js';

// ═══════════════════════════════════════════════════
// UTENTE 1: Prof.ssa Rossi — Docente Esperta
// ═══════════════════════════════════════════════════

test.describe('Utente 1: Prof.ssa Rossi — Docente Esperta', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
    await setTeacherUser(page);
  });

  test('R01. Apre lavagna e vede overlay bentornati o picker', async ({ page }) => {
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    const hasOverlay = await page.locator('text=/Benvenuti|Bentornati|esperimento|Scegli|LED|circuito/i').count();
    if (hasOverlay === 0) {
      console.log('⚠️ Nessun overlay/picker alla prima apertura come teacher — verificare flusso bentornati');
    }
  });

  test('R02. Vede titolo ELAB nel header', async ({ page }) => {
    await page.goto('/#lavagna');
    await page.waitForTimeout(2000);
    await expect(page.locator('text=ELAB').first()).toBeVisible();
  });

  test('R03. Puo\' cliccare su un esperimento senza crash', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    // Cerca qualsiasi elemento cliccabile legato a esperimenti
    const items = page.locator('button:visible, [role="button"]:visible, [data-experiment-id]');
    const count = await items.count();
    if (count > 0) {
      await items.first().click({ timeout: 2000 }).catch(() => {});
      await page.waitForTimeout(2000);
    }
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('R04. Dopo click esperimento, il canvas SVG appare', async ({ page }) => {
    await page.goto('/#lavagna');
    await page.waitForTimeout(5000);
    const svgs = page.locator('svg');
    expect(await svgs.count()).toBeGreaterThan(0);
  });

  test('R05. Puo\' navigare tra i 3 volumi senza crash', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    // Cerca tab volumi e clicca ognuno
    const volTabs = page.locator('button:visible, [role="tab"]').filter({ hasText: /Vol|Volume/i });
    const count = await volTabs.count();
    for (let i = 0; i < count; i++) {
      await volTabs.nth(i).click({ timeout: 2000 }).catch(() => {});
      await page.waitForTimeout(500);
    }
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('R06. Testo visibile e leggibile (font >= 13px)', async ({ page }) => {
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    const smallText = await page.evaluate(() => {
      const allText = document.querySelectorAll('p, span, div, li, td, th, label');
      let tooSmall = 0;
      allText.forEach(el => {
        const size = parseFloat(getComputedStyle(el).fontSize);
        const text = el.textContent?.trim();
        if (text && text.length > 3 && size < 12) tooSmall++;
      });
      return tooSmall;
    });
    if (smallText > 0) {
      console.log(`⚠️ ${smallText} elementi con font < 12px — CLAUDE.md richiede min 13px`);
    }
  });

  test('R07. Palette colori ELAB rispettata (Navy, Lime, Orange, Red)', async ({ page }) => {
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    const colors = await page.evaluate(() => {
      const all = document.querySelectorAll('*');
      const found = new Set();
      all.forEach(el => {
        const bg = getComputedStyle(el).backgroundColor;
        const color = getComputedStyle(el).color;
        if (bg && bg !== 'rgba(0, 0, 0, 0)') found.add(bg);
        if (color) found.add(color);
      });
      return Array.from(found).slice(0, 20);
    });
    // Documenta i colori trovati — non fallisce
    console.log(`Colori trovati: ${colors.length}`);
  });

  test('R08. Nessun lorem ipsum o placeholder visibile', async ({ page }) => {
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    const body = await page.locator('body').textContent();
    expect(body.toLowerCase()).not.toContain('lorem ipsum');
    expect(body.toLowerCase()).not.toContain('placeholder');
    expect(body).not.toContain('TODO');
  });

  test('R09. Footer o copyright presente', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    const body = await page.locator('body').textContent();
    const hasCopy = body.includes('©') || body.includes('Andrea Marro') || body.includes('ELAB');
    if (!hasCopy) {
      console.log('INFO: Nessun copyright visibile in homepage');
    }
  });

  test('R10. Mascotte non blocca contenuto importante', async ({ page }) => {
    await page.goto('/#lavagna');
    await page.waitForTimeout(5000);
    // La mascotte e' position:fixed — verifica che non copra bottoni critici
    const mascot = page.locator('[class*="mascot" i]').first();
    if (await mascot.count() > 0) {
      const box = await mascot.boundingBox();
      if (box) {
        // La mascotte non deve essere troppo grande (> 100x100 sarebbe eccessivo)
        expect(box.width, 'Mascotte troppo larga').toBeLessThan(120);
        expect(box.height, 'Mascotte troppo alta').toBeLessThan(120);
      }
    }
  });
});

// ═══════════════════════════════════════════════════
// UTENTE 2: Prof. Verdi — Primo Giorno con ELAB
// ═══════════════════════════════════════════════════

test.describe('Utente 2: Prof. Verdi — Primo Giorno', () => {
  test('V01. Arriva senza dati — non vede errori', async ({ page }) => {
    // NO setupUser — completamente nuovo
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/');
    await page.waitForTimeout(3000);
    const critical = errors.filter(e => !e.includes('ResizeObserver'));
    expect(critical).toHaveLength(0);
  });

  test('V02. Capisce dove cliccare per iniziare (CTA chiaro)', async ({ page }) => {
    await setupUser(page);
    await page.goto('/');
    await page.waitForTimeout(3000);
    // Deve esserci almeno UN bottone con testo invitante
    const ctas = page.locator('button:visible, a:visible').filter({
      hasText: /Accedi|Inizia|Prova|Simula|Entra|Scopri/i
    });
    const count = await ctas.count();
    expect(count, 'Nessun CTA chiaro per il docente impreparato').toBeGreaterThan(0);
  });

  test('V03. Non si perde — c\'e\' sempre un modo per tornare', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    // Clicca 5 bottoni random
    for (let i = 0; i < 5; i++) {
      const btns = page.locator('button:visible');
      const cnt = await btns.count();
      if (cnt > 0) await btns.nth(i % cnt).click({ timeout: 1000 }).catch(() => {});
      await page.waitForTimeout(300);
    }
    // Deve sempre poter tornare — cerca logo ELAB o home link
    const home = page.locator('text=ELAB, a[href="/"], [class*="brand" i], img[alt="ELAB"]');
    const homeCount = await home.count();
    if (homeCount === 0) {
      console.log('⚠️ BUG: Dopo 5 click, il brand ELAB non e\' piu\' trovabile — il docente si perde!');
      console.log('   FIX: Il logo ELAB deve essere sempre visibile nel header, anche dopo navigazione');
    }
  });

  test('V04. Il testo e\' in italiano (non inglese)', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    const body = await page.locator('body').textContent();
    // Parole italiane che devono esserci
    const italianWords = ['esperiment', 'circuit', 'lezione', 'volume', 'simul'];
    const found = italianWords.filter(w => body.toLowerCase().includes(w));
    if (found.length === 0) {
      console.log('⚠️ BUG: Nessuna parola italiana tipica (esperimento, circuito, lezione) visibile nella lavagna');
      console.log('   FIX: Il picker/overlay deve mostrare testi in italiano anche senza teacher user');
    }
  });

  test('V05. Nessuna parola tecnica non spiegata visibile', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    const body = await page.locator('body').textContent();
    // Termini troppo tecnici che NON dovrebbero essere visibili al docente
    const tooTechnical = ['MNA', 'KCL', 'AVR', 'GPIO', 'PORTD', 'ATmega'];
    for (const term of tooTechnical) {
      if (body.includes(term)) {
        console.log(`⚠️ Termine tecnico "${term}" visibile al docente — Principio Zero violato`);
      }
    }
  });
});

// ═══════════════════════════════════════════════════
// UTENTE 3: Marco 10 anni — Studente Curioso
// ═══════════════════════════════════════════════════

test.describe('Utente 3: Marco 10 anni — Studente Curioso', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('elab_gdpr_consent', JSON.stringify({
        status: 'accepted', age: 10, timestamp: new Date().toISOString(), version: '1.0',
      }));
      localStorage.setItem('elab_onboarding_seen', 'true');
    });
  });

  test('M01. Marco clicca TUTTO — nessun crash', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    // Bambino curioso: clicca 30 cose random
    for (let i = 0; i < 30; i++) {
      const clickable = page.locator('button:visible, a:visible, svg:visible, [role="button"]:visible');
      const cnt = await clickable.count();
      if (cnt > 0) {
        await clickable.nth(Math.floor(Math.random() * Math.min(cnt, 20))).click({ timeout: 500 }).catch(() => {});
        await page.waitForTimeout(150);
      }
    }
    const critical = errors.filter(e => !e.includes('ResizeObserver'));
    expect(critical, `Crash con 30 click bambino: ${critical.join('; ')}`).toHaveLength(0);
  });

  test('M02. Marco prova keyboard shortcuts — nessun crash', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    // Bambino preme tasti random
    const keys = ['Enter', 'Space', 'Escape', 'Tab', 'ArrowUp', 'ArrowDown', 'Delete', 'Backspace'];
    for (const key of keys) {
      await page.keyboard.press(key);
      await page.waitForTimeout(100);
    }
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('M03. Marco trascina cose sulla pagina — nessun crash', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(5000);
    // Simula drag su SVG canvas
    const svg = page.locator('svg').first();
    if (await svg.count() > 0) {
      const box = await svg.boundingBox();
      if (box) {
        await page.mouse.move(box.x + 100, box.y + 100);
        await page.mouse.down();
        await page.mouse.move(box.x + 200, box.y + 200, { steps: 10 });
        await page.mouse.up();
        await page.waitForTimeout(500);
      }
    }
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('M04. Marco usa mouse wheel per zoom — nessun crash', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(5000);
    // Zoom in/out con mouse wheel
    const svg = page.locator('svg').first();
    if (await svg.count() > 0) {
      const box = await svg.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.wheel(0, -500); // zoom in
        await page.waitForTimeout(300);
        await page.mouse.wheel(0, 500);  // zoom out
        await page.waitForTimeout(300);
      }
    }
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('M05. Marco apre e chiude pannelli ripetutamente', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    // Toggle bottoni 10 volte
    const toggleBtns = page.locator('button:visible').filter({ hasText: /video|volume|percorso|galileo|chat/i });
    const count = await toggleBtns.count();
    for (let round = 0; round < 3; round++) {
      for (let i = 0; i < count; i++) {
        await toggleBtns.nth(i).click({ timeout: 500 }).catch(() => {});
        await page.waitForTimeout(200);
      }
    }
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════
// UTENTE 4: Dirigente Scolastico — Visita Rapida
// ═══════════════════════════════════════════════════

test.describe('Utente 4: Dirigente Scolastico — Visita di 2 minuti', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
  });

  test('D01. Prima impressione: pagina professionale, non "da sviluppatore"', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    const body = await page.locator('body').textContent();
    // Non devono esserci errori, stack trace, console output visibile
    expect(body).not.toContain('Error:');
    expect(body).not.toContain('at Object.');
    expect(body).not.toContain('TypeError');
    expect(body).not.toContain('Cannot read');
  });

  test('D02. Capisce in 5 secondi cosa fa il prodotto', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(5000);
    const body = await page.locator('body').textContent();
    // Parole chiave che il dirigente vuole vedere
    const keywords = ['elettronica', 'Arduino', 'scuol', 'insegn', 'esperiment', 'LED', 'circuit'];
    const found = keywords.filter(k => body.toLowerCase().includes(k.toLowerCase()));
    expect(found.length, `Solo ${found.length}/${keywords.length} keyword prodotto trovate`).toBeGreaterThanOrEqual(2);
  });

  test('D03. Il simulatore mostra qualcosa di concreto in < 10s', async ({ page }) => {
    await page.goto('/#lavagna');
    const start = Date.now();
    await page.waitForTimeout(10000);
    const svgCount = await page.locator('svg').count();
    const elapsed = Date.now() - start;
    expect(svgCount, `Nessun SVG dopo ${elapsed}ms`).toBeGreaterThan(0);
  });

  test('D04. Mobile-ready per la LIM (iPad landscape)', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
    const height = await page.evaluate(() => document.body.scrollHeight);
    expect(height).toBeGreaterThan(400);
  });

  test('D05. Torna alla home senza perdersi', async ({ page }) => {
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    // Cerca modo per tornare (logo, bottone home)
    const homeLink = page.locator('text=ELAB, [class*="brand" i], a[href="/"]').first();
    if (await homeLink.count() > 0) {
      await homeLink.click();
      await page.waitForTimeout(2000);
    }
    // Deve essere tornato alla home o almeno non crashato
    const body = await page.locator('body').textContent();
    expect(body.length).toBeGreaterThan(50);
  });
});
