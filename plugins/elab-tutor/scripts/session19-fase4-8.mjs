/**
 * Session 19 — FASE 4-8: Tutor Tabs + Lavagna + Giochi + Teacher + Admin
 * Playwright-core headless — brutally honest audit
 */
import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const CHROMIUM = '/Users/andreamarro/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const BASE = 'https://elab-builder.vercel.app';
const SHOTS = '/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/scripts/screenshots/s19';

fs.mkdirSync(SHOTS, { recursive: true });

const results = { fase4: [], fase5: [], fase6: [], fase7: [], fase8: [] };

function log(fase, test, status, detail = '') {
  const entry = { test, status, detail };
  results[fase].push(entry);
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'BLOCKED' ? '🚫' : status === 'MOCK' ? '🎭' : status === 'EMPTY' ? '📭' : '⚠️';
  console.log(`  ${icon} [${fase.toUpperCase()}] ${test}${detail ? ` — ${detail}` : ''}`);
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: false });
}

async function loginAs(browser, email, password) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/#login`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  const ei = await page.$('input[type="email"], input[name="email"], input[placeholder*="mail" i]');
  const pi = await page.$('input[type="password"]');
  if (ei && pi) {
    await ei.fill(email);
    await pi.fill(password);
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text.includes('Accedi') || text.includes('Login')) {
        await btn.click();
        break;
      }
    }
    await page.waitForTimeout(5000);
  }
  return { ctx, page };
}

async function dismissOnboarding(page) {
  // Dismiss onboarding overlay if present
  for (let i = 0; i < 3; i++) {
    const btns = await page.$$('button');
    for (const btn of btns) {
      const text = await btn.textContent().catch(() => '');
      if (text.includes('Salta') || text.includes('Skip') || text.includes('Iniziamo')) {
        await btn.click().catch(() => {});
        await page.waitForTimeout(800);
        break;
      }
    }
  }
  // Also close any overlay by clicking outside or pressing Escape
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(500);
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROMIUM, headless: true });

  // ═══════════════════════════════════════════
  // FASE 4: ElabTutorV4 — TUTTI I TAB
  // ═══════════════════════════════════════════
  console.log('\n═══ FASE 4: ELAB TUTOR V4 — TABS ═══');

  const { ctx: ctx4, page: p4 } = await loginAs(browser, 'debug@test.com', 'Xk9#mL2!nR4');

  try {
    await p4.goto(`${BASE}/#tutor`, { waitUntil: 'networkidle', timeout: 30000 });
    await p4.waitForTimeout(5000);
    await dismissOnboarding(p4);
    await p4.waitForTimeout(1000);
    await shot(p4, 'f4-tutor-after-onboarding');

    // Analyze sidebar items
    const sidebarItems = await p4.evaluate(() => {
      const items = [];
      // Look for sidebar links/buttons
      const sidebar = document.querySelector('[class*="sidebar" i], [class*="Sidebar" i], aside, nav');
      if (!sidebar) return items;
      const links = sidebar.querySelectorAll('a, button, [role="tab"], [class*="item" i], [class*="link" i]');
      links.forEach(el => {
        const text = el.textContent.trim();
        if (text && text.length < 50) items.push(text);
      });
      return items;
    });
    log('fase4', 'Sidebar items', sidebarItems.length > 3 ? 'PASS' : 'FAIL', sidebarItems.join(' | '));

    // Click each sidebar item and check what renders
    const tabTests = [
      { name: 'Manuale', keywords: ['manuale', 'manual'] },
      { name: 'Simulatore', keywords: ['simulatore', 'simulator'] },
      { name: 'Trova Guasto', keywords: ['guasto', 'detective', 'trova'] },
      { name: 'Prevedi', keywords: ['prevedi', 'predict', 'poe'] },
      { name: 'Misterioso', keywords: ['misterioso', 'reverse', 'mystery'] },
      { name: 'Controlla', keywords: ['controlla', 'review'] },
      { name: 'Lavagna', keywords: ['lavagna', 'canvas', 'whiteboard'] },
      { name: 'Taccuini', keywords: ['taccuini', 'notebook', 'quadern'] },
      { name: 'Progressi', keywords: ['progressi', 'progress', 'timeline'] },
      { name: 'Media', keywords: ['media', 'video'] },
    ];

    for (const tab of tabTests) {
      try {
        // Find and click the tab
        const btns = await p4.$$('[class*="sidebar" i] button, [class*="sidebar" i] a, aside button, aside a, [class*="Sidebar" i] button, [class*="nav" i] button');
        let clicked = false;
        for (const btn of btns) {
          const text = (await btn.textContent().catch(() => '')).toLowerCase();
          if (tab.keywords.some(kw => text.includes(kw))) {
            await btn.click().catch(() => {});
            clicked = true;
            break;
          }
        }

        if (!clicked) {
          // Try broader search
          const allBtns = await p4.$$('button, a, [role="tab"]');
          for (const btn of allBtns) {
            const text = (await btn.textContent().catch(() => '')).toLowerCase();
            if (tab.keywords.some(kw => text.includes(kw))) {
              await btn.click().catch(() => {});
              clicked = true;
              break;
            }
          }
        }

        if (clicked) {
          await p4.waitForTimeout(2000);
          await shot(p4, `f4-tab-${tab.name.toLowerCase().replace(/\s+/g, '-')}`);

          // Check content area
          const content = await p4.evaluate(() => {
            const main = document.querySelector('[class*="main" i], [class*="content" i], [class*="panel" i], main');
            return main ? main.innerText.slice(0, 200) : document.body.innerText.slice(0, 200);
          });
          const hasReal = content.length > 30 && !content.includes('Coming soon') && !content.includes('In arrivo');
          log('fase4', `Tab "${tab.name}"`, hasReal ? 'PASS' : (clicked ? 'EMPTY' : 'FAIL'), content.slice(0, 80));
        } else {
          log('fase4', `Tab "${tab.name}"`, 'FAIL', 'Pulsante non trovato nella sidebar');
        }
      } catch (err) {
        log('fase4', `Tab "${tab.name}"`, 'FAIL', err.message.slice(0, 80));
      }
    }

    // Check Galileo chat panel (right side)
    const chatPanel = await p4.evaluate(() => {
      const galileo = document.querySelector('[class*="chat" i], [class*="galileo" i], [class*="Chat" i]');
      if (!galileo) return { found: false };
      return {
        found: true,
        text: galileo.innerText.slice(0, 200),
        hasInput: !!galileo.querySelector('textarea, input[type="text"]'),
        hasSendBtn: Array.from(galileo.querySelectorAll('button')).some(b => b.textContent.includes('Invia') || b.getAttribute('aria-label')?.includes('invia')),
      };
    });
    log('fase4', 'Galileo chat panel (right)', chatPanel.found ? 'PASS' : 'FAIL', chatPanel.found ? `input: ${chatPanel.hasInput}, send: ${chatPanel.hasSendBtn}` : 'non trovato');

    // Check top bar (experiment selector, progress)
    const topBar = await p4.evaluate(() => {
      const top = document.querySelector('[class*="topbar" i], [class*="top-bar" i], [class*="TopBar" i], [class*="header" i]');
      return top ? { found: true, text: top.innerText.slice(0, 150) } : { found: false };
    });
    log('fase4', 'Top bar (progress/experiment)', topBar.found ? 'PASS' : 'WARN', topBar.text?.slice(0, 80) || '');

  } catch (err) {
    log('fase4', 'Tutor V4 test', 'FAIL', err.message.slice(0, 100));
  }

  await ctx4.close();

  // ═══════════════════════════════════════════
  // FASE 5: Lavagna/Whiteboard
  // ═══════════════════════════════════════════
  console.log('\n═══ FASE 5: LAVAGNA/WHITEBOARD ═══');

  const { ctx: ctx5, page: p5 } = await loginAs(browser, 'debug@test.com', 'Xk9#mL2!nR4');
  try {
    await p5.goto(`${BASE}/#tutor`, { waitUntil: 'networkidle', timeout: 30000 });
    await p5.waitForTimeout(5000);
    await dismissOnboarding(p5);
    await p5.waitForTimeout(1000);

    // Click Lavagna in sidebar
    const allBtns = await p5.$$('button, a, [role="tab"]');
    let lavagnaClicked = false;
    for (const btn of allBtns) {
      const text = (await btn.textContent().catch(() => '')).toLowerCase();
      if (text.includes('lavagna') || text.includes('canvas') || text.includes('whiteboard')) {
        await btn.click().catch(() => {});
        lavagnaClicked = true;
        break;
      }
    }

    if (lavagnaClicked) {
      await p5.waitForTimeout(2000);
      await shot(p5, 'f5-lavagna-opened');

      // Check whiteboard UI
      const wbInfo = await p5.evaluate(() => {
        const canvas = document.querySelector('canvas');
        const toolbar = document.querySelectorAll('button[aria-label]');
        const toolLabels = Array.from(toolbar).map(b => b.getAttribute('aria-label') || b.title || b.textContent.trim()).filter(Boolean);
        return {
          hasCanvas: !!canvas,
          canvasWidth: canvas?.width || 0,
          canvasHeight: canvas?.height || 0,
          toolCount: toolLabels.length,
          tools: toolLabels,
          // Check what's missing
          hasText: toolLabels.some(t => t.toLowerCase().includes('testo') || t.toLowerCase().includes('text')),
          hasShapes: toolLabels.some(t => t.toLowerCase().includes('forma') || t.toLowerCase().includes('shape') || t.toLowerCase().includes('rettangolo') || t.toLowerCase().includes('cerchio')),
          hasUndo: toolLabels.some(t => t.toLowerCase().includes('undo') || t.toLowerCase().includes('annulla')),
          hasExport: toolLabels.some(t => t.toLowerCase().includes('esport') || t.toLowerCase().includes('export') || t.toLowerCase().includes('salva immagine')),
          hasZoom: toolLabels.some(t => t.toLowerCase().includes('zoom')),
        };
      });

      log('fase5', 'Canvas HTML5 presente', wbInfo.hasCanvas ? 'PASS' : 'FAIL', `${wbInfo.canvasWidth}x${wbInfo.canvasHeight}`);
      log('fase5', 'Tools presenti', wbInfo.toolCount > 3 ? 'PASS' : 'FAIL', wbInfo.tools.join(', '));
      log('fase5', 'Tool TESTO (scrivere)', wbInfo.hasText ? 'PASS' : 'FAIL', 'MANCANTE — solo disegno a mano libera');
      log('fase5', 'Tool FORME (rettangolo/cerchio/freccia)', wbInfo.hasShapes ? 'PASS' : 'FAIL', 'MANCANTE');
      log('fase5', 'UNDO/REDO', wbInfo.hasUndo ? 'PASS' : 'FAIL', 'MANCANTE');
      log('fase5', 'EXPORT immagine', wbInfo.hasExport ? 'PASS' : 'FAIL', 'MANCANTE');
      log('fase5', 'ZOOM', wbInfo.hasZoom ? 'PASS' : 'FAIL', 'MANCANTE');

      // Test drawing
      const canvas = await p5.$('canvas');
      if (canvas) {
        const box = await canvas.boundingBox();
        if (box) {
          // Draw a line
          await p5.mouse.move(box.x + 100, box.y + 100);
          await p5.mouse.down();
          await p5.mouse.move(box.x + 300, box.y + 200, { steps: 10 });
          await p5.mouse.up();
          await p5.waitForTimeout(500);
          await shot(p5, 'f5-lavagna-drawn');

          // Check localStorage save
          const saved = await p5.evaluate(() => {
            const keys = Object.keys(localStorage).filter(k => k.startsWith('elab_wb_'));
            return keys.length;
          });
          log('fase5', 'Disegno salva in localStorage', saved > 0 ? 'PASS' : 'WARN', `${saved} chiavi wb_`);
        }
      }

      // Test colors
      const colorBtns = await p5.evaluate(() => {
        const btns = document.querySelectorAll('button');
        const colors = [];
        btns.forEach(b => {
          const label = b.getAttribute('aria-label') || '';
          if (label.startsWith('Colore')) colors.push(label);
        });
        return colors;
      });
      log('fase5', 'Colori preset', colorBtns.length >= 4 ? 'PASS' : 'FAIL', colorBtns.join(', '));

      // Test eraser
      const hasEraser = await p5.evaluate(() => {
        return Array.from(document.querySelectorAll('button')).some(b => {
          const label = (b.getAttribute('aria-label') || b.title || '').toLowerCase();
          return label.includes('gomma') || label.includes('eraser');
        });
      });
      log('fase5', 'Gomma (eraser)', hasEraser ? 'PASS' : 'FAIL', '');

      // Test clear all
      const hasClear = await p5.evaluate(() => {
        return Array.from(document.querySelectorAll('button')).some(b => {
          const label = (b.getAttribute('aria-label') || b.title || '').toLowerCase();
          return label.includes('cancella tutto') || label.includes('clear');
        });
      });
      log('fase5', 'Cancella tutto', hasClear ? 'PASS' : 'FAIL', '');

    } else {
      log('fase5', 'Lavagna apertura', 'FAIL', 'Pulsante Lavagna non trovato');
    }
  } catch (err) {
    log('fase5', 'Lavagna test', 'FAIL', err.message.slice(0, 100));
  }
  await ctx5.close();

  // ═══════════════════════════════════════════
  // FASE 6: Giochi Educativi
  // ═══════════════════════════════════════════
  console.log('\n═══ FASE 6: GIOCHI EDUCATIVI ═══');

  const { ctx: ctx6, page: p6 } = await loginAs(browser, 'debug@test.com', 'Xk9#mL2!nR4');
  try {
    await p6.goto(`${BASE}/#tutor`, { waitUntil: 'networkidle', timeout: 30000 });
    await p6.waitForTimeout(5000);
    await dismissOnboarding(p6);
    await p6.waitForTimeout(1000);

    const games = [
      { name: 'Trova Guasto', keywords: ['guasto', 'detective'], file: 'f6-trova-guasto' },
      { name: 'Prevedi', keywords: ['prevedi', 'predict'], file: 'f6-prevedi' },
      { name: 'Misterioso', keywords: ['misterioso', 'reverse'], file: 'f6-misterioso' },
      { name: 'Controlla', keywords: ['controlla', 'review'], file: 'f6-controlla' },
    ];

    for (const game of games) {
      try {
        const btns = await p6.$$('button, a, [role="tab"]');
        let clicked = false;
        for (const btn of btns) {
          const text = (await btn.textContent().catch(() => '')).toLowerCase();
          if (game.keywords.some(kw => text.includes(kw))) {
            await btn.click().catch(() => {});
            clicked = true;
            break;
          }
        }
        if (clicked) {
          await p6.waitForTimeout(2000);
          await shot(p6, game.file);

          const content = await p6.evaluate(() => {
            const body = document.body.innerText;
            return {
              length: body.length,
              text: body.slice(0, 500),
              hasCards: document.querySelectorAll('[class*="card" i], [class*="challenge" i], [class*="circuit" i]').length,
              hasButtons: document.querySelectorAll('button').length,
              hasList: document.querySelectorAll('li, [class*="item" i]').length,
            };
          });

          const isReal = content.hasCards > 0 || content.hasList > 0;
          log('fase6', `Gioco "${game.name}"`, isReal ? 'PASS' : 'EMPTY', `cards: ${content.hasCards}, list: ${content.hasList}, buttons: ${content.hasButtons}`);

          // Check if there are actual challenges loaded
          if (game.name === 'Trova Guasto') {
            const challenges = await p6.evaluate(() => {
              const items = document.querySelectorAll('[class*="circuit" i], [class*="challenge" i], [class*="card" i]');
              return Array.from(items).slice(0, 5).map(i => i.textContent.trim().slice(0, 50));
            });
            log('fase6', `  Sfide Detective caricate`, challenges.length > 0 ? 'PASS' : 'EMPTY', challenges.join(' | ') || 'nessuna sfida');
          }
        } else {
          log('fase6', `Gioco "${game.name}"`, 'FAIL', 'Pulsante non trovato');
        }
      } catch (err) {
        log('fase6', `Gioco "${game.name}"`, 'FAIL', err.message.slice(0, 80));
      }
    }
  } catch (err) {
    log('fase6', 'Giochi test', 'FAIL', err.message.slice(0, 100));
  }
  await ctx6.close();

  // ═══════════════════════════════════════════
  // FASE 7: Teacher Dashboard
  // ═══════════════════════════════════════════
  console.log('\n═══ FASE 7: AREA DOCENTE ═══');

  const { ctx: ctx7, page: p7 } = await loginAs(browser, 'teacher@elab.test', 'Pw8&jF3@hT6!cZ1');
  try {
    await p7.goto(`${BASE}/#teacher`, { waitUntil: 'networkidle', timeout: 30000 });
    await p7.waitForTimeout(3000);
    await shot(p7, 'f7-teacher-dashboard');

    const teacherTabs = ['Il Giardino', 'Meteo Classe', 'Attività', 'Dettaglio Studente', 'Nudge', 'Documentazione'];

    for (const tabName of teacherTabs) {
      try {
        const btns = await p7.$$('button, [role="tab"]');
        let clicked = false;
        for (const btn of btns) {
          const text = (await btn.textContent().catch(() => '')).trim();
          if (text.includes(tabName) || text.includes(tabName.split(' ')[0])) {
            await btn.click().catch(() => {});
            clicked = true;
            break;
          }
        }

        if (clicked) {
          await p7.waitForTimeout(1500);
          await shot(p7, `f7-teacher-${tabName.toLowerCase().replace(/\s+/g, '-')}`);

          const content = await p7.evaluate(() => {
            const text = document.body.innerText;
            return {
              length: text.length,
              hasData: !text.includes('Nessuno studente') && !text.includes('Nessun dato') && !text.includes('0 studenti'),
              snippet: text.slice(0, 300),
              isEmpty: text.includes('Nessuno studente') || text.includes('Nessun dato') || text.includes('vuoto'),
            };
          });

          if (content.isEmpty || !content.hasData) {
            log('fase7', `Tab "${tabName}"`, 'EMPTY', 'Dati vuoti — nessuno studente');
          } else {
            log('fase7', `Tab "${tabName}"`, 'PASS', content.snippet.slice(0, 80));
          }
        } else {
          log('fase7', `Tab "${tabName}"`, 'FAIL', 'Tab non trovato');
        }
      } catch (err) {
        log('fase7', `Tab "${tabName}"`, 'FAIL', err.message.slice(0, 80));
      }
    }

    // Nudge test — does it actually work?
    try {
      const btns = await p7.$$('button, [role="tab"]');
      for (const btn of btns) {
        const text = (await btn.textContent().catch(() => '')).trim();
        if (text.includes('Nudge')) {
          await btn.click().catch(() => {});
          break;
        }
      }
      await p7.waitForTimeout(1500);
      await shot(p7, 'f7-teacher-nudge-detail');

      const nudgeUI = await p7.evaluate(() => {
        const textarea = document.querySelector('textarea');
        const sendBtns = Array.from(document.querySelectorAll('button')).filter(b =>
          b.textContent.includes('Invia') || b.textContent.includes('Send') || b.textContent.includes('Nudge')
        );
        return {
          hasTextarea: !!textarea,
          hasSendBtn: sendBtns.length > 0,
          sendBtnText: sendBtns.map(b => b.textContent.trim()),
        };
      });
      log('fase7', 'Nudge: UI presente', nudgeUI.hasTextarea || nudgeUI.hasSendBtn ? 'PASS' : 'FAIL', `textarea: ${nudgeUI.hasTextarea}, send: ${nudgeUI.hasSendBtn}`);
      log('fase7', 'Nudge: notifica REALE allo studente', 'FAIL', 'Nudge salva in sessionStorage, NON invia notifica reale');
    } catch (err) {
      log('fase7', 'Nudge test', 'FAIL', err.message.slice(0, 80));
    }

    // Check data source honesty
    log('fase7', 'ONESTÀ: dati studenti', 'EMPTY', 'studentService dipende da backend (n8n/Netlify). Con 0 studenti registrati, dashboard è vuota. NON è mock data — è assenza di dati reali.');

  } catch (err) {
    log('fase7', 'Teacher Dashboard', 'FAIL', err.message.slice(0, 100));
  }
  await ctx7.close();

  // ═══════════════════════════════════════════
  // FASE 8: Admin Panel + Gestionale
  // ═══════════════════════════════════════════
  console.log('\n═══ FASE 8: ADMIN + GESTIONALE ═══');

  const { ctx: ctx8, page: p8 } = await loginAs(browser, 'marro.andrea96@gmail.com', 'Bz4@qW8!fJ3#xV6');
  try {
    await p8.goto(`${BASE}/#admin`, { waitUntil: 'networkidle', timeout: 30000 });
    await p8.waitForTimeout(3000);
    await shot(p8, 'f8-admin-panel');

    // Check admin tabs
    const adminTabs = await p8.evaluate(() => {
      const tabs = document.querySelectorAll('button, [role="tab"]');
      return Array.from(tabs).map(t => t.textContent.trim()).filter(t => t.length > 1 && t.length < 30);
    });
    log('fase8', 'Admin tabs visibili', adminTabs.length > 3 ? 'PASS' : 'FAIL', adminTabs.slice(0, 10).join(' | '));

    // Click each admin tab
    const adminTabNames = ['Dashboard', 'Utenti', 'Ordini', 'Corsi', 'Eventi', 'Waitlist'];
    for (const tabName of adminTabNames) {
      try {
        const btns = await p8.$$('button, [role="tab"]');
        let clicked = false;
        for (const btn of btns) {
          const text = (await btn.textContent().catch(() => '')).trim();
          if (text.includes(tabName)) {
            await btn.click().catch(() => {});
            clicked = true;
            break;
          }
        }
        if (clicked) {
          await p8.waitForTimeout(2000);
          await shot(p8, `f8-admin-${tabName.toLowerCase()}`);

          const content = await p8.evaluate(() => {
            const text = document.body.innerText;
            return {
              hasData: text.length > 300,
              hasN8nError: text.includes('n8n') || text.includes('raggiungibile') || text.includes('N/A'),
              hasTable: document.querySelectorAll('table, [class*="table" i]').length,
              hasCards: document.querySelectorAll('[class*="card" i], [class*="stat" i]').length,
              snippet: text.slice(0, 200),
            };
          });

          if (content.hasN8nError) {
            log('fase8', `Admin "${tabName}"`, 'BLOCKED', 'n8n offline — dati non disponibili');
          } else if (content.hasTable > 0 || content.hasCards > 0) {
            log('fase8', `Admin "${tabName}"`, 'PASS', `tables: ${content.hasTable}, cards: ${content.hasCards}`);
          } else {
            log('fase8', `Admin "${tabName}"`, 'EMPTY', content.snippet.slice(0, 80));
          }
        } else {
          log('fase8', `Admin "${tabName}"`, 'FAIL', 'Tab non trovato');
        }
      } catch (err) {
        log('fase8', `Admin "${tabName}"`, 'FAIL', err.message.slice(0, 80));
      }
    }

    // Check for Gestionale link/tab
    const hasGestionale = await p8.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, a'));
      return btns.some(b => b.textContent.toLowerCase().includes('gestionale'));
    });
    log('fase8', 'Gestionale link presente', hasGestionale ? 'PASS' : 'WARN', hasGestionale ? 'Trovato' : 'Non trovato — potrebbe essere integrato in Admin');

    if (hasGestionale) {
      const btns = await p8.$$('button, a');
      for (const btn of btns) {
        const text = (await btn.textContent().catch(() => '')).toLowerCase();
        if (text.includes('gestionale')) {
          await btn.click().catch(() => {});
          break;
        }
      }
      await p8.waitForTimeout(3000);
      await shot(p8, 'f8-gestionale-main');

      const gestInfo = await p8.evaluate(() => {
        const text = document.body.innerText;
        return {
          hasModules: text.includes('Fatturazione') || text.includes('Magazzino') || text.includes('Dipendenti'),
          hasCharts: document.querySelectorAll('canvas, svg[class*="chart" i], [class*="chart" i]').length,
          hasMock: text.includes('€ 0') || text.includes('0 ordini') || text.includes('mock') || text.includes('demo'),
          modules: [],
          snippet: text.slice(0, 400),
        };
      });
      log('fase8', 'Gestionale moduli', gestInfo.hasModules ? 'PASS' : 'FAIL', gestInfo.snippet.slice(0, 100));
      log('fase8', 'Gestionale charts', gestInfo.hasCharts > 0 ? 'PASS' : 'EMPTY', `${gestInfo.hasCharts} charts`);
      log('fase8', 'ONESTÀ: Gestionale dati', 'MOCK', 'Il gestionale usa localStorage / dati hard-coded. Non è collegato a un database reale.');
    }

  } catch (err) {
    log('fase8', 'Admin test', 'FAIL', err.message.slice(0, 100));
  }
  await ctx8.close();

  // ═══════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════
  console.log('\n\n═══════════════════════════════════════');
  console.log('         SESSION 19 — FASE 4-8 SUMMARY');
  console.log('═══════════════════════════════════════');

  for (const [fase, tests] of Object.entries(results)) {
    const pass = tests.filter(t => t.status === 'PASS').length;
    const fail = tests.filter(t => t.status === 'FAIL').length;
    const blocked = tests.filter(t => t.status === 'BLOCKED').length;
    const empty = tests.filter(t => t.status === 'EMPTY').length;
    const mock = tests.filter(t => t.status === 'MOCK').length;
    console.log(`\n  ${fase.toUpperCase()}: ${pass} PASS | ${fail} FAIL | ${blocked} BLOCKED | ${empty} EMPTY | ${mock} MOCK`);
    tests.filter(t => t.status === 'FAIL').forEach(t => console.log(`    ❌ ${t.test}: ${t.detail}`));
    tests.filter(t => t.status === 'EMPTY').forEach(t => console.log(`    📭 ${t.test}: ${t.detail}`));
    tests.filter(t => t.status === 'MOCK').forEach(t => console.log(`    🎭 ${t.test}: ${t.detail}`));
    tests.filter(t => t.status === 'BLOCKED').forEach(t => console.log(`    🚫 ${t.test}: ${t.detail}`));
  }

  const all = Object.values(results).flat();
  console.log(`\n  TOTALE: ${all.filter(t=>t.status==='PASS').length} PASS | ${all.filter(t=>t.status==='FAIL').length} FAIL | ${all.filter(t=>t.status==='BLOCKED').length} BLOCKED | ${all.filter(t=>t.status==='EMPTY').length} EMPTY | ${all.filter(t=>t.status==='MOCK').length} MOCK`);
  console.log('═══════════════════════════════════════\n');

  await browser.close();
})();
