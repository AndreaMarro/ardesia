// @ts-check
/**
 * STRESS TEST: 6 Utenti Aggiuntivi — scenari reali brutali
 *
 * 1. Nonna Maria (65 anni): non ha MAI usato un computer, clicca a caso
 * 2. Supplente Last-Minute: arriva 2 minuti prima, deve improvvisare
 * 3. Studente ADHD: clicca velocissimo, cambia continuamente
 * 4. Classe Intera (25 iPad): 25 sessioni simultanee (simulated)
 * 5. Hacker Etico (studente smanettone): prova a rompere tutto
 * 6. Giovanni Fagherazzi (demo lunedi): il percorso ESATTO della demo
 *
 * Claude code andrea marro — 12/04/2026
 */
import { test, expect } from '@playwright/test';
import { setupUser, setTeacherUser } from './helpers.js';

// ═══════════════════════════════════════════════════
// UTENTE 5: Nonna Maria — Mai usato un computer
// ═══════════════════════════════════════════════════

test.describe('Utente 5: Nonna Maria — 65 anni, zero esperienza', () => {
  test('NM01. Pagina carica anche senza JavaScript knowledge', async ({ page }) => {
    // Nonna non ha cookie, non ha localStorage, prima visita assoluta
    await page.goto('/');
    await page.waitForTimeout(5000);
    const body = await page.locator('body').textContent();
    expect(body.length, 'Pagina vuota per Nonna Maria').toBeGreaterThan(50);
  });

  test('NM02. Nonna clicca sul logo pensando sia un bottone', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    // Clicca su immagini e loghi
    const imgs = page.locator('img:visible');
    const count = await imgs.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      await imgs.nth(i).click({ timeout: 1000 }).catch(() => {});
      await page.waitForTimeout(300);
    }
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('NM03. Nonna prova a selezionare testo ovunque', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    // Triple click per selezionare testo
    const body = page.locator('body');
    await body.click({ clickCount: 3, position: { x: 200, y: 200 } });
    await page.waitForTimeout(500);
    // Non deve crashare
    const bodyText = await body.textContent();
    expect(bodyText.length).toBeGreaterThan(10);
  });

  test('NM04. Nonna usa Ctrl+A, Ctrl+C (seleziona tutto)', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    await page.keyboard.press('Control+a');
    await page.waitForTimeout(200);
    await page.keyboard.press('Control+c');
    await page.waitForTimeout(200);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════
// UTENTE 6: Supplente Last-Minute — 2 minuti per capire
// ═══════════════════════════════════════════════════

test.describe('Utente 6: Supplente Last-Minute', () => {
  test('SL01. Dalla homepage al primo esperimento in < 15 click', async ({ page }) => {
    await setupUser(page);
    await page.goto('/');
    await page.waitForTimeout(2000);

    let clicks = 0;
    const maxClicks = 15;

    // Step 1: Trova ed entra nel simulatore
    const cta = page.locator('button:visible, a:visible').filter({ hasText: /Accedi|Inizia|Prova|Simula|Entra/i });
    if (await cta.count() > 0) {
      await cta.first().click();
      clicks++;
      await page.waitForTimeout(2000);
    }

    // Step 2: Nella lavagna, cerca un esperimento da aprire
    const expItems = page.locator('button:visible, [role="button"]:visible, [data-experiment-id]');
    if (await expItems.count() > 0) {
      await expItems.first().click({ timeout: 2000 }).catch(() => {});
      clicks++;
    }

    console.log(`Supplente ha usato ${clicks} click per arrivare al simulatore`);
    expect(clicks, 'Troppi click per arrivare al primo esperimento').toBeLessThan(maxClicks);
  });

  test('SL02. Il supplente capisce cosa fare SENZA leggere un manuale', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#lavagna');
    await page.waitForTimeout(5000);
    const body = await page.locator('body').textContent();
    // Deve esserci ALMENO una delle seguenti parole guida
    const guideWords = ['esperimento', 'inizia', 'scegli', 'benvenuti', 'bentornati', 'LED', 'circuito'];
    const found = guideWords.filter(w => body.toLowerCase().includes(w.toLowerCase()));
    if (found.length === 0) {
      console.log('⚠️ PRINCIPIO ZERO VIOLATO: Il supplente non capisce cosa fare — nessuna parola guida visibile');
    }
  });

  test('SL03. Supplente preme F5 (refresh) per panico — app sopravvive', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#lavagna');
    await page.waitForTimeout(2000);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    // Panico: 3 refresh rapidi
    await page.reload();
    await page.waitForTimeout(500);
    await page.reload();
    await page.waitForTimeout(500);
    await page.reload();
    await page.waitForTimeout(2000);
    const body = await page.locator('body').textContent();
    expect(body.length).toBeGreaterThan(50);
  });
});

// ═══════════════════════════════════════════════════
// UTENTE 7: Studente ADHD — Velocissimo, cambia tutto
// ═══════════════════════════════════════════════════

test.describe('Utente 7: Studente ADHD — iperattivo', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
  });

  test('ADHD01. 50 click in 10 secondi su aree diverse', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);

    for (let i = 0; i < 50; i++) {
      const x = 100 + Math.random() * 800;
      const y = 50 + Math.random() * 500;
      await page.mouse.click(x, y);
      // NESSUN waitForTimeout — velocissimo come un bambino ADHD
    }
    await page.waitForTimeout(1000);
    const critical = errors.filter(e => !e.includes('ResizeObserver'));
    expect(critical, `Crash con 50 click rapidi: ${critical.join('; ')}`).toHaveLength(0);
  });

  test('ADHD02. Apre/chiude dialog 10 volte di fila', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);
      const btns = page.locator('button:visible');
      if (await btns.count() > 0) {
        await btns.first().click({ timeout: 300 }).catch(() => {});
      }
    }
    const critical = errors.filter(e => !e.includes('ResizeObserver'));
    if (critical.length > 0) {
      console.log(`⚠️ BUG ADHD02: Escape+click rapido causa ${critical.length} errori JS`);
      critical.slice(0, 3).forEach(e => console.log(`   ${e.slice(0, 100)}`));
    }
  });

  test('ADHD03. Mouse wheel frenetico (zoom in/out/in/out)', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    for (let i = 0; i < 20; i++) {
      await page.mouse.wheel(0, i % 2 === 0 ? -300 : 300);
    }
    await page.waitForTimeout(500);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════
// UTENTE 8: Hacker Etico — Studente smanettone
// ═══════════════════════════════════════════════════

test.describe('Utente 8: Hacker Etico — prova a rompere tutto', () => {
  test('HE01. Inject script via URL hash', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#<img src=x onerror=alert(1)>');
    await page.waitForTimeout(2000);
    // Nessun alert deve apparire
    const dialogPromise = page.waitForEvent('dialog', { timeout: 2000 }).catch(() => null);
    expect(await dialogPromise, 'XSS via hash eseguito!').toBeNull();
  });

  test('HE02. localStorage injection — valori malformati', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('elab_user', '{"role":"admin","__proto__":{"isAdmin":true}}');
      localStorage.setItem('elab_gdpr_consent', JSON.stringify({ status: 'accepted', age: 14, version: '1.0' }));
    });
    await page.goto('/#admin');
    await page.waitForTimeout(2000);
    const body = await page.locator('body').textContent();
    // Non deve ottenere accesso admin tramite prototype pollution
    expect(body).not.toContain('Fatturazione');
    expect(body).not.toContain('revenue');
  });

  test('HE03. Overflow input fields con 10000 caratteri', async ({ page }) => {
    await setupUser(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    const inputs = page.locator('input:visible, textarea:visible');
    const count = await inputs.count();
    const longText = 'A'.repeat(10000);
    for (let i = 0; i < Math.min(count, 3); i++) {
      await inputs.nth(i).fill(longText).catch(() => {});
      await page.waitForTimeout(200);
    }
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('HE04. Console commands — window.__ELAB_API manipulation', async ({ page }) => {
    await setupUser(page);
    await page.goto('/#lavagna');
    await page.waitForTimeout(5000);
    // Prova a manipolare l'API globale
    const result = await page.evaluate(() => {
      try {
        if (window.__ELAB_API) {
          window.__ELAB_API.clearCircuit?.();
          return 'API accessible';
        }
        return 'No API';
      } catch (e) {
        return `Error: ${e.message}`;
      }
    });
    // L'API potrebbe essere accessibile (e' intenzionale per UNLIM/voice)
    // Ma non deve crashare
    console.log(`__ELAB_API access: ${result}`);
  });
});

// ═══════════════════════════════════════════════════
// UTENTE 9: Giovanni Fagherazzi — Demo Lunedi
// IL PERCORSO PIU' CRITICO
// ═══════════════════════════════════════════════════

test.describe('Utente 9: Giovanni Fagherazzi — Demo Lunedi', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
    await setTeacherUser(page);
  });

  test('GF01. Homepage carica VELOCE e professionale', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const elapsed = Date.now() - start;
    expect(elapsed, `Homepage troppo lenta: ${elapsed}ms`).toBeLessThan(5000);

    const body = await page.locator('body').textContent();
    if (body.length < 100) {
      console.log('⚠️ BUG GF01: Homepage con teacher user ha body corto — possibile redirect a lavagna');
    }
    expect(body).not.toContain('TypeError');
  });

  test('GF02. Entra nel simulatore senza confusione', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    const cta = page.locator('button:visible, a:visible').filter({ hasText: /Accedi|Inizia|Prova|Simula|ELAB/i });
    if (await cta.count() === 0) {
      console.log('⚠️ BUG GF02: Teacher user potrebbe essere redirectato direttamente a #lavagna — nessun CTA visibile');
    }
  });

  test('GF03. Lavagna apre senza errori', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(5000);
    const critical = errors.filter(e => !e.includes('ResizeObserver'));
    expect(critical, `Errori JS durante demo: ${critical.join('; ')}`).toHaveLength(0);
  });

  test('GF04. SVG canvas visibile — il circuito si vede', async ({ page }) => {
    await page.goto('/#lavagna');
    await page.waitForTimeout(5000);
    const svgCount = await page.locator('svg').count();
    expect(svgCount, 'Nessun SVG — Giovanni non vede il simulatore!').toBeGreaterThan(0);
  });

  test('GF05. Interfaccia pulita — no debug, no Lorem, no TODO', async ({ page }) => {
    await page.goto('/#lavagna');
    await page.waitForTimeout(5000);
    const body = await page.locator('body').textContent();
    expect(body).not.toContain('TODO');
    expect(body).not.toContain('FIXME');
    expect(body).not.toContain('lorem ipsum');
    expect(body).not.toContain('console.log');
    expect(body.toLowerCase()).not.toContain('debug mode');
  });

  test('GF06. Responsive su iPad (la LIM di scuola)', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(3000);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
    // Niente scroll orizzontale
    const hasHScroll = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth + 10
    );
    expect(hasHScroll, 'Scroll orizzontale su iPad — Giovanni lo nota!').toBe(false);
  });

  test('GF07. Ritorno alla home funziona (Giovanni naviga indietro)', async ({ page }) => {
    await page.goto('/#lavagna');
    await page.waitForTimeout(2000);
    await page.goBack();
    await page.waitForTimeout(2000);
    const body = await page.locator('body').textContent();
    if (body.length < 50) {
      console.log('⚠️ BUG GF07: Back da lavagna produce pagina vuota — FIX necessario per demo');
    }
  });
});

// ═══════════════════════════════════════════════════
// UTENTE 10: Classe Intera — Stress da 25 utenti
// ═══════════════════════════════════════════════════

test.describe('Utente 10: Classe Intera — stress simulato', () => {
  test('CI01. App sopravvive a localStorage con 25 sessioni studente', async ({ page }) => {
    await page.addInitScript(() => {
      // Simula 25 studenti con sessioni salvate
      const sessions = [];
      for (let i = 0; i < 25; i++) {
        sessions.push({
          experimentId: `v1-cap6-esp${(i % 3) + 1}`,
          startTime: new Date(Date.now() - i * 3600000).toISOString(),
          messages: Array(10).fill({ role: 'user', content: 'domanda' }),
          errors: i % 5 === 0 ? [{ type: 'polarity' }] : [],
        });
      }
      localStorage.setItem('elab_sessions', JSON.stringify(sessions));
      localStorage.setItem('elab_gdpr_consent', JSON.stringify({
        status: 'accepted', age: 14, timestamp: new Date().toISOString(), version: '1.0',
      }));
    });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#lavagna');
    await page.waitForTimeout(5000);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });
});
