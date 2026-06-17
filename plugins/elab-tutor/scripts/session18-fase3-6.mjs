/**
 * Session 18 — FASE 3-6: Wire, UI, Compiler, Simulator
 * Tests: wire creation flow, toolbar buttons, Arduino compiler, overall simulator state
 */
import { chromium } from 'playwright-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS = path.join(__dirname, '..', 'screenshots', 'session18');
const BASE = 'https://elab-builder.vercel.app';
const CREDS = { email: 'debug@test.com', password: 'Xk9#mL2!nR4' };

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function dismissOverlays(page) {
  const texts = ['Accetto','Iniziamo','avventura','voglio esplorare','ho un kit','Salta','Avanti','Fine','Ho capito','Chiudi'];
  for (let round = 0; round < 25; round++) {
    let found = false;
    for (const t of texts) {
      const clicked = await page.evaluate((text) => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes(text));
        if (btn) { btn.click(); return true; }
        return false;
      }, t);
      if (clicked) { await sleep(400); found = true; break; }
    }
    const closedX = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const xBtn = btns.find(b => ['✕','×','X','✖'].includes(b.textContent?.trim()));
      if (xBtn) { xBtn.click(); return true; }
      return false;
    });
    if (closedX) { await sleep(350); found = true; }
    if (!found) break;
  }
  await sleep(400);
}

async function loginAndNavigate(page, vol, ch, expN) {
  // Login
  await page.goto(`${BASE}/#login`);
  await sleep(3000);
  const emailInput = page.locator('input[type="email"]').first();
  if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await emailInput.fill(CREDS.email);
    await page.locator('input[type="password"]').first().fill(CREDS.password);
    await page.locator('button[type="submit"], button:has-text("Accedi")').first().click();
    await sleep(4000);
  }

  // Navigate to experiment
  await page.goto(`${BASE}/#login`);
  await sleep(1500);
  await page.goto(`${BASE}/#tutor`);
  await sleep(5000);
  await dismissOverlays(page);
  await dismissOverlays(page);

  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Simulatore'));
    if (btn) btn.click();
  });
  await sleep(3000);
  await dismissOverlays(page);

  // Select volume
  await page.evaluate((v) => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent?.includes(`Volume ${v}`) && b.textContent?.includes('esperiment'));
    if (btn) btn.click();
  }, vol);
  await sleep(2000);

  // Select chapter
  await page.evaluate((ct) => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent?.includes(ct) && b.textContent?.includes('esp.'));
    if (btn) btn.click();
  }, ch);
  await sleep(2000);

  // Select experiment
  await page.evaluate((idx) => {
    const btns = Array.from(document.querySelectorAll('button'));
    const expBtns = btns.filter(b => {
      const t = b.textContent || '';
      return t.includes('★') && !t.includes('Volumi') && !t.includes('Capitoli');
    });
    if (expBtns[idx]) expBtns[idx].click();
  }, expN);
  await sleep(5000);
  await dismissOverlays(page);
  await sleep(1000);
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Session 18 — FASE 3-6: Wire + UI + Compiler + Simulator');
  console.log('═══════════════════════════════════════════════════\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

  try {
    // ====== Load V1-Cap6-Esp1 (LED circuit) for testing ======
    console.log('[FASE 3-6] Loading V1 > Cap6 > Esp1 (LED circuit)...');
    await loginAndNavigate(page, 1, 'Capitolo 6', 0);

    // ====== FASE 3: Wire Tests ======
    console.log('\n[FASE 3] Wire Tests');

    // 3a. Check toolbar presence
    const toolbar = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const toolbarBtns = btns.map(b => b.textContent?.trim()).filter(t => t && t.length < 30);
      const hasCollegaFili = toolbarBtns.some(t => t.includes('Collega Fili'));
      const hasAvvia = toolbarBtns.some(t => t.includes('Avvia'));
      const hasAzzera = toolbarBtns.some(t => t.includes('Azzera'));
      const hasIndietro = toolbarBtns.some(t => t.includes('Indietro'));
      return { hasCollegaFili, hasAvvia, hasAzzera, hasIndietro, toolbarBtns: toolbarBtns.slice(0, 20) };
    });
    console.log(`  "Collega Fili" button: ${toolbar.hasCollegaFili ? '✅' : '❌'}`);
    console.log(`  "Avvia" button: ${toolbar.hasAvvia ? '✅' : '❌'}`);
    console.log(`  "Azzera" button: ${toolbar.hasAzzera ? '✅' : '❌'}`);
    console.log(`  "Indietro" button: ${toolbar.hasIndietro ? '✅' : '❌'}`);

    // 3b. Check existing wires
    const wires = await page.evaluate(() => {
      const wireElements = document.querySelectorAll('[data-wire-index], .wire-path, path[data-wire]');
      const svgPaths = document.querySelectorAll('svg path');
      const wirelike = Array.from(svgPaths).filter(p => {
        const stroke = p.getAttribute('stroke');
        return stroke && !stroke.startsWith('#') && !stroke.startsWith('url') && p.getAttribute('stroke-width');
      });
      return { wireElements: wireElements.length, svgPaths: svgPaths.length, wirelike: wirelike.length };
    });
    console.log(`  Wire elements: ${wires.wireElements} | SVG paths: ${wires.svgPaths} | Wire-like: ${wires.wirelike}`);

    // 3c. Click "Collega Fili" to enter wire mode
    const wireModeEntered = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Collega Fili'));
      if (btn) { btn.click(); return true; }
      return false;
    });
    await sleep(1000);

    // 3d. Check cursor changed to crosshair
    const cursorState = await page.evaluate(() => {
      const svg = document.querySelector('svg');
      const cursor = svg ? getComputedStyle(svg).cursor : 'unknown';
      return { cursor };
    });
    console.log(`  Wire mode entered: ${wireModeEntered ? '✅' : '❌'} | Cursor: ${cursorState.cursor}`);

    await page.screenshot({ path: path.join(SCREENSHOTS, 'f3-wire-mode.png') });
    console.log('  📸 f3-wire-mode.png');

    // Exit wire mode
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Collega Fili'));
      if (btn) btn.click();
    });
    await sleep(500);

    // ====== FASE 4: UI/UX Tests ======
    console.log('\n[FASE 4] UI/UX Comprehensibility Tests');

    // 4a. Check step instructions panel
    const stepPanel = await page.evaluate(() => {
      const steps = document.querySelectorAll('[class*="step"], [class*="Step"]');
      const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5')).map(h => h.textContent?.trim()).filter(Boolean);
      const instructionText = document.querySelector('[class*="instruction"], [class*="desc"], [class*="cosa"]');
      return {
        stepCount: steps.length,
        headings: headings.slice(0, 10),
        hasInstructions: !!instructionText || headings.some(h => h.includes('COSA FARE') || h.includes('Cap.'))
      };
    });
    console.log(`  Instructions panel: ${stepPanel.hasInstructions ? '✅' : '❌'}`);
    console.log(`  Headings: ${JSON.stringify(stepPanel.headings.slice(0, 5))}`);

    // 4b. Check Galileo chat bubble
    const galileo = await page.evaluate(() => {
      const galileoBox = document.querySelector('[class*="galileo"], [class*="Galileo"]');
      const chatInput = document.querySelector('input[placeholder*="Galileo"], input[placeholder*="Chiedi"]');
      const btns = Array.from(document.querySelectorAll('button'));
      const galileoBtns = btns.filter(b => b.textContent?.includes('Galileo') || b.textContent?.includes('Esperimento') || b.textContent?.includes('Manuale'));
      return {
        hasGalileoBox: !!galileoBox,
        hasChatInput: !!chatInput,
        galileoBtns: galileoBtns.map(b => b.textContent?.trim().slice(0, 30))
      };
    });
    console.log(`  Galileo chat box: ${galileo.hasGalileoBox ? '✅' : '❌'}`);
    console.log(`  Chat input: ${galileo.hasChatInput ? '✅' : '❌'}`);
    console.log(`  Galileo buttons: ${JSON.stringify(galileo.galileoBtns)}`);

    // 4c. Check sidebar navigation
    const sidebar = await page.evaluate(() => {
      const nav = document.querySelector('[class*="sidebar"], nav, [class*="menu"]');
      const items = Array.from(document.querySelectorAll('a, button')).filter(el => {
        const t = el.textContent?.trim() || '';
        return ['Manuale','Simulatore','Trova Guasto','Prevedi','Misterioso','Controlla','Lavagna','Taccuini','Progressi','Media'].some(s => t.includes(s));
      });
      return { hasSidebar: !!nav, menuItems: items.map(el => el.textContent?.trim().slice(0, 20)) };
    });
    console.log(`  Sidebar present: ${sidebar.hasSidebar ? '✅' : '❌'}`);
    console.log(`  Menu items: ${sidebar.menuItems.join(', ')}`);

    // 4d. Check experiment title visibility
    const expTitle = await page.evaluate(() => {
      const text = Array.from(document.querySelectorAll('*')).find(el => {
        const t = el.textContent?.trim() || '';
        return t.includes('CAP.') || t.includes('ESP.') || t.includes('Cap ');
      });
      return text ? text.textContent?.trim().slice(0, 60) : null;
    });
    console.log(`  Experiment title: ${expTitle || '❌ NOT FOUND'}`);

    await page.screenshot({ path: path.join(SCREENSHOTS, 'f4-ui-overview.png') });
    console.log('  📸 f4-ui-overview.png');

    // ====== FASE 5: Arduino Compiler ======
    console.log('\n[FASE 5] Arduino Compiler Tests');

    // Navigate to Vol3 experiment (Arduino)
    await page.goto(`${BASE}/#login`);
    await sleep(1500);
    await page.goto(`${BASE}/#tutor`);
    await sleep(5000);
    await dismissOverlays(page);
    await dismissOverlays(page);

    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Simulatore'));
      if (btn) btn.click();
    });
    await sleep(3000);
    await dismissOverlays(page);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent?.includes('Volume 3') && b.textContent?.includes('esperiment'));
      if (btn) btn.click();
    });
    await sleep(2000);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent?.includes('Capitolo 6') && b.textContent?.includes('esp.'));
      if (btn) btn.click();
    });
    await sleep(2000);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const expBtns = btns.filter(b => {
        const t = b.textContent || '';
        return t.includes('★') && !t.includes('Volumi') && !t.includes('Capitoli');
      });
      if (expBtns[0]) expBtns[0].click();
    });
    await sleep(5000);
    await dismissOverlays(page);
    await sleep(1000);

    // 5a. Check Monitor Seriale
    const monitorSeriale = await page.evaluate(() => {
      const monitor = document.querySelector('[class*="monitor"], [class*="Monitor"], [class*="serial"]');
      const hasCodeEditor = !!document.querySelector('[class*="codemirror"], [class*="CodeMirror"], [class*="editor"]');
      const btns = Array.from(document.querySelectorAll('button'));
      const compilerBtns = btns.filter(b => {
        const t = b.textContent?.trim() || '';
        return t.includes('Avvia') || t.includes('Stop') || t.includes('Carica') || t.includes('Compila');
      }).map(b => b.textContent?.trim().slice(0, 20));
      return { hasMonitor: !!monitor, hasCodeEditor, compilerBtns };
    });
    console.log(`  Monitor Seriale: ${monitorSeriale.hasMonitor ? '✅' : '❌'}`);
    console.log(`  Code Editor: ${monitorSeriale.hasCodeEditor ? '✅' : '❌'}`);
    console.log(`  Compiler buttons: ${JSON.stringify(monitorSeriale.compilerBtns)}`);

    // 5b. Check Nano R4 on canvas
    const nano = await page.evaluate(() => {
      const nanoEl = document.querySelector('[data-type="nano-r4"]');
      const hasSvg = nanoEl ? nanoEl.querySelectorAll('svg, rect, circle, text').length : 0;
      return { found: !!nanoEl, svgElements: hasSvg };
    });
    console.log(`  Nano R4 on canvas: ${nano.found ? '✅' : '❌'} (${nano.svgElements} SVG elements)`);

    // 5c. Try clicking Avvia
    const avviaClicked = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Avvia'));
      if (btn) { btn.click(); return true; }
      return false;
    });
    await sleep(3000);

    // Check for compiler output
    const compilerOutput = await page.evaluate(() => {
      const monitor = document.querySelector('[class*="monitor"], [class*="Monitor"], [class*="serial"]');
      const text = monitor ? monitor.textContent?.trim().slice(0, 200) : '';
      const errors = Array.from(document.querySelectorAll('*')).filter(el => {
        const t = el.textContent?.toLowerCase() || '';
        return (t.includes('errore compilazione') || t.includes('compilation error')) && el.children.length === 0;
      }).map(el => el.textContent?.trim().slice(0, 80));
      return { monitorText: text, errors };
    });
    console.log(`  Avvia clicked: ${avviaClicked ? '✅' : '❌'}`);
    console.log(`  Monitor output: "${compilerOutput.monitorText.slice(0, 100)}"`);
    if (compilerOutput.errors.length) console.log(`  Errors: ${JSON.stringify(compilerOutput.errors)}`);

    await page.screenshot({ path: path.join(SCREENSHOTS, 'f5-arduino-compiler.png') });
    console.log('  📸 f5-arduino-compiler.png');

    // ====== FASE 6: Overall Simulator Tests ======
    console.log('\n[FASE 6] Overall Simulator State');

    // Navigate back to LED experiment for full test
    await page.goto(`${BASE}/#login`);
    await sleep(1500);
    await page.goto(`${BASE}/#tutor`);
    await sleep(5000);
    await dismissOverlays(page);
    await dismissOverlays(page);

    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Simulatore'));
      if (btn) btn.click();
    });
    await sleep(3000);
    await dismissOverlays(page);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent?.includes('Volume 1') && b.textContent?.includes('esperiment'));
      if (btn) btn.click();
    });
    await sleep(2000);
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent?.includes('Capitolo 6') && b.textContent?.includes('esp.'));
      if (btn) btn.click();
    });
    await sleep(2000);
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const expBtns = btns.filter(b => {
        const t = b.textContent || '';
        return t.includes('★') && !t.includes('Volumi') && !t.includes('Capitoli');
      });
      if (expBtns[0]) expBtns[0].click();
    });
    await sleep(5000);
    await dismissOverlays(page);

    // 6a. Click Avvia on LED experiment
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Avvia'));
      if (btn) btn.click();
    });
    await sleep(3000);

    // 6b. Check if CircuitSolver produced a result
    const circuitState = await page.evaluate(() => {
      const dataTypes = [...new Set(Array.from(document.querySelectorAll('[data-type]')).map(e => e.getAttribute('data-type')))];
      const btns = Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim().slice(0, 30)).filter(Boolean);
      const hasStop = btns.some(b => b.includes('Stop'));
      // Check for circuit detection indicator
      const circuitMsg = Array.from(document.querySelectorAll('*')).find(el => {
        const t = el.textContent?.toLowerCase() || '';
        return t.includes('circuit') && el.children.length === 0 && t.length < 100;
      });
      return { dataTypes, hasStop, circuitMsg: circuitMsg?.textContent?.trim().slice(0, 60) };
    });
    console.log(`  Circuit simulation running: ${circuitState.hasStop ? '✅ (Stop visible)' : '❌'}`);
    console.log(`  Components: [${circuitState.dataTypes.join(', ')}]`);

    // 6c. Check for console errors
    const errorCount = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('worker')).length;
    console.log(`  Console errors: ${errorCount === 0 ? '✅ none' : `⚠️ ${errorCount}`}`);
    if (errorCount > 0) {
      consoleErrors.filter(e => !e.includes('favicon') && !e.includes('worker')).slice(0, 3).forEach(e => {
        console.log(`    ${e.slice(0, 100)}`);
      });
    }

    // 6d. Test Azzera (reset)
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Azzera'));
      if (btn) btn.click();
    });
    await sleep(2000);

    const afterReset = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim().slice(0, 30)).filter(Boolean);
      const hasAvvia = btns.some(b => b.includes('Avvia'));
      return { hasAvvia };
    });
    console.log(`  After Azzera: Avvia visible: ${afterReset.hasAvvia ? '✅' : '❌'}`);

    // 6e. Test Lista Pezzi and Componenti buttons
    const toolbarButtons = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const results = {};
      for (const name of ['Lista Pezzi', 'Componenti', 'Cattura', 'Nota', 'Lavagna']) {
        results[name] = btns.some(b => b.textContent?.includes(name));
      }
      return results;
    });
    for (const [name, found] of Object.entries(toolbarButtons)) {
      console.log(`  "${name}": ${found ? '✅' : '❌'}`);
    }

    await page.screenshot({ path: path.join(SCREENSHOTS, 'f6-simulator-overview.png') });
    console.log('  📸 f6-simulator-overview.png');

    // ====== SUMMARY ======
    console.log('\n═══════════════════════════════════════════════════');
    console.log('  FASE 3-6 SUMMARY');
    console.log('═══════════════════════════════════════════════════');
    console.log(`  FASE 3 (Wire): Collega Fili button: ${toolbar.hasCollegaFili ? '✅' : '❌'}`);
    console.log(`  FASE 4 (UI): Instructions + Galileo + Sidebar: ${stepPanel.hasInstructions && galileo.hasChatInput && sidebar.hasSidebar ? '✅' : '⚠️'}`);
    console.log(`  FASE 5 (Compiler): Nano + Monitor: ${nano.found && monitorSeriale.hasMonitor ? '✅' : '⚠️'}`);
    console.log(`  FASE 6 (Simulator): Avvia/Azzera + No errors: ${toolbar.hasAvvia && toolbar.hasAzzera && errorCount === 0 ? '✅' : '⚠️'}`);
    console.log(`  Console errors total: ${consoleErrors.length}`);
    console.log('═══════════════════════════════════════════════════');

  } catch (err) {
    console.error(`FATAL: ${err.message}`);
    await page.screenshot({ path: path.join(SCREENSHOTS, 'f3-6-error.png') }).catch(() => {});
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
