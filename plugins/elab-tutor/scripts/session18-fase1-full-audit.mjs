/**
 * Session 18 — FASE 1: Full Visual Audit of ALL 21 SVG Components
 * Navigates to representative experiments, takes screenshots, verifies component presence.
 * Uses the reusable navigation helper.
 */
import { chromium } from 'playwright-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS = path.join(__dirname, '..', 'screenshots', 'session18');
const BASE = 'https://elab-builder.vercel.app';
const CREDS = { email: 'debug@test.com', password: 'Xk9#mL2!nR4' };

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/** Dismiss ALL overlays using JS clicks */
async function dismissOverlays(page) {
  const texts = [
    'Accetto', 'Iniziamo', 'avventura', 'voglio esplorare',
    'ho un kit', 'Salta', 'Avanti', 'Fine', 'Ho capito', 'Chiudi'
  ];
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

async function loginToTutor(page) {
  await page.goto(`${BASE}/#login`);
  await sleep(3000);
  const emailInput = page.locator('input[type="email"]').first();
  if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await emailInput.fill(CREDS.email);
    await page.locator('input[type="password"]').first().fill(CREDS.password);
    await page.locator('button[type="submit"], button:has-text("Accedi")').first().click();
    await sleep(4000);
  }
  await page.goto(`${BASE}/#tutor`);
  await sleep(5000);
  await dismissOverlays(page);
  await sleep(500);
  await dismissOverlays(page);
}

async function goToSimulator(page) {
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Simulatore'));
    if (btn) btn.click();
  });
  await sleep(3000);
  await dismissOverlays(page);
}

async function selectVolume(page, volNum) {
  const result = await page.evaluate((v) => {
    const btns = Array.from(document.querySelectorAll('button'));
    const volBtn = btns.find(b => {
      const t = b.textContent || '';
      return t.includes(`Volume ${v}`) && t.includes('esperiment');
    });
    if (volBtn) { volBtn.click(); return volBtn.textContent?.trim().slice(0, 60); }
    return null;
  }, volNum);
  await sleep(2000);
  return result;
}

async function selectChapter(page, chapterText) {
  const result = await page.evaluate((ct) => {
    const btns = Array.from(document.querySelectorAll('button'));
    const chapBtn = btns.find(b => {
      const t = b.textContent || '';
      return t.includes(ct) && t.includes('esp.') && !t.includes('Volumi');
    });
    if (chapBtn) { chapBtn.click(); return chapBtn.textContent?.trim().slice(0, 60); }
    return null;
  }, chapterText);
  await sleep(2000);
  return result;
}

async function selectExperiment(page, expTitle = null, mode = 'montato') {
  if (mode.toLowerCase().includes('monta tu')) {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent?.includes('Monta tu'));
      if (btn) btn.click();
    });
    await sleep(500);
  }

  const result = await page.evaluate((title) => {
    const btns = Array.from(document.querySelectorAll('button'));
    if (title) {
      const expBtn = btns.find(b => b.textContent?.includes(title) && !b.textContent?.includes('Capitoli'));
      if (expBtn) { expBtn.click(); return expBtn.textContent?.trim().slice(0, 80); }
    }
    const expBtn = btns.find(b => {
      const t = b.textContent || '';
      return t.includes('★') && !t.includes('Volumi') && !t.includes('Capitoli');
    });
    if (expBtn) { expBtn.click(); return expBtn.textContent?.trim().slice(0, 80); }
    return null;
  }, expTitle);

  await sleep(5000);
  await dismissOverlays(page);
  return result;
}

/** Go back to volume picker from any level */
async function goBackToVolumes(page) {
  // Click "Capitoli" back button (from experiments view)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent?.includes('Capitoli'));
    if (btn) btn.click();
  });
  await sleep(1000);
  // Click "Volumi" back button (from chapters view)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent?.includes('Volumi'));
    if (btn) btn.click();
  });
  await sleep(1000);
}

/** Analyze components on canvas */
async function analyzeCanvas(page) {
  return page.evaluate(() => {
    const dataTypes = [...new Set(
      Array.from(document.querySelectorAll('[data-type]')).map(e => e.getAttribute('data-type'))
    )];
    const svgCount = document.querySelectorAll('svg').length;
    const draggables = document.querySelectorAll('[draggable="true"]').length;
    const rects = document.querySelectorAll('svg rect').length;
    const circles = document.querySelectorAll('svg circle').length;
    const paths = document.querySelectorAll('svg path').length;
    const groups = document.querySelectorAll('svg g').length;
    const texts = document.querySelectorAll('svg text').length;
    const lines = document.querySelectorAll('svg line').length;

    // Check for error messages
    const errorTexts = Array.from(document.querySelectorAll('*')).filter(e => {
      const t = e.textContent?.toLowerCase() || '';
      return (t.includes('errore') || t.includes('error') || t.includes('missing')) &&
             e.children.length === 0 && t.length < 100;
    }).map(e => e.textContent.trim());

    return { dataTypes, svgCount, draggables, rects, circles, paths, groups, texts, lines, errorTexts };
  });
}

// ═══════════════════════════════════════════════════
// TEST CASES: one experiment per component type group
// ═══════════════════════════════════════════════════
const TEST_CASES = [
  {
    name: "LED + Resistor + Battery + Breadboard",
    volume: 1, chapter: "Capitolo 6", experiment: "Esp. 1",
    expectedTypes: ["battery9v", "breadboard-half", "resistor", "led"],
    screenshot: "fase1-comp-01-led-resistor.png"
  },
  {
    name: "RGB LED",
    volume: 1, chapter: "Capitolo 7", experiment: "Esp. 1",
    expectedTypes: ["rgb-led"],
    screenshot: "fase1-comp-02-rgb-led.png"
  },
  {
    name: "Push Button",
    volume: 1, chapter: "Capitolo 8", experiment: "Esp. 1",
    expectedTypes: ["push-button"],
    screenshot: "fase1-comp-03-push-button.png"
  },
  {
    name: "Potentiometer",
    volume: 1, chapter: "Capitolo 10", experiment: "Esp. 1",
    expectedTypes: ["potentiometer"],
    screenshot: "fase1-comp-04-potentiometer.png"
  },
  {
    name: "PhotoResistor (LDR)",
    volume: 1, chapter: "Capitolo 11", experiment: "Esp. 1",
    expectedTypes: ["photo-resistor"],
    screenshot: "fase1-comp-05-photo-resistor.png"
  },
  {
    name: "Buzzer Piezo",
    volume: 1, chapter: "Capitolo 12", experiment: "Esp. 1",
    expectedTypes: ["buzzer-piezo"],
    screenshot: "fase1-comp-06-buzzer.png"
  },
  {
    name: "Reed Switch",
    volume: 1, chapter: "Capitolo 13", experiment: "Esp. 1",
    expectedTypes: ["reed-switch"],
    screenshot: "fase1-comp-07-reed-switch.png"
  },
  {
    name: "Capacitor + Multimeter",
    volume: 2, chapter: "Capitolo 15", experiment: "Esp. 1",
    expectedTypes: ["capacitor", "multimeter"],
    screenshot: "fase1-comp-08-capacitor-multimeter.png"
  },
  {
    name: "MOSFET N-channel",
    volume: 2, chapter: "Capitolo 16", experiment: "Esp. 1",
    expectedTypes: ["mosfet-n"],
    screenshot: "fase1-comp-09-mosfet.png"
  },
  {
    name: "Phototransistor",
    volume: 2, chapter: "Capitolo 17", experiment: "Esp. 1",
    expectedTypes: ["phototransistor"],
    screenshot: "fase1-comp-10-phototransistor.png"
  },
  {
    name: "Motor DC + Diode",
    volume: 2, chapter: "Capitolo 18", experiment: "Esp. 3",
    expectedTypes: ["motor-dc"],
    screenshot: "fase1-comp-11-motor-diode.png"
  },
  {
    name: "Arduino Nano R4 (NanoBreakout)",
    volume: 3, chapter: "Capitolo 19", experiment: "Esp. 1",
    expectedTypes: ["nano-r4"],
    screenshot: "fase1-comp-12-nano-r4.png"
  },
  {
    name: "LCD 16x2",
    volume: 3, chapter: "Capitolo 21", experiment: "Esp. 1",
    expectedTypes: ["lcd16x2"],
    screenshot: "fase1-comp-13-lcd16x2.png"
  },
  {
    name: "Servo Motor",
    volume: 3, chapter: "Capitolo 22", experiment: "Esp. 1",
    expectedTypes: ["servo"],
    screenshot: "fase1-comp-14-servo.png"
  }
];

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Session 18 — FASE 1: Full Visual Audit (21 SVG)');
  console.log('═══════════════════════════════════════════════════\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('console', () => {});

  const results = [];
  let currentVolume = null;

  try {
    // === LOGIN ===
    console.log('[LOGIN] Logging in...');
    await loginToTutor(page);
    console.log('[LOGIN] OK\n');

    // === GO TO SIMULATOR ===
    console.log('[SIMULATOR] Opening...');
    await goToSimulator(page);
    console.log('[SIMULATOR] OK\n');

    // === RUN EACH TEST CASE ===
    for (let i = 0; i < TEST_CASES.length; i++) {
      const tc = TEST_CASES[i];
      console.log(`\n[${i + 1}/${TEST_CASES.length}] ${tc.name}`);
      console.log(`  Volume ${tc.volume} > ${tc.chapter} > ${tc.experiment}`);

      try {
        // Navigate back to volume picker if needed
        if (currentVolume !== null) {
          // We need to go back to the experiment picker
          // Click "Menu" or similar to go back to picker
          const menuClicked = await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            // Look for back/menu button
            const btn = btns.find(b => {
              const t = b.textContent?.trim().toLowerCase() || '';
              return t === 'menu' || t.includes('← menu') || t.includes('torna');
            });
            if (btn) { btn.click(); return true; }
            return false;
          });
          if (menuClicked) {
            await sleep(2000);
          } else {
            // Try clicking "Menu" icon or sidebar button
            await page.evaluate(() => {
              const btns = Array.from(document.querySelectorAll('button'));
              const btn = btns.find(b => b.textContent?.includes('Menu'));
              if (btn) btn.click();
            });
            await sleep(1000);
          }

          // Navigate back through picker
          await goBackToVolumes(page);
          await sleep(1000);
        }

        // Select volume
        const vol = await selectVolume(page, tc.volume);
        if (!vol) {
          console.log(`  ❌ Volume ${tc.volume} NOT FOUND`);
          results.push({ ...tc, status: 'FAIL', reason: 'Volume not found' });
          continue;
        }
        currentVolume = tc.volume;

        // Select chapter
        const chap = await selectChapter(page, tc.chapter);
        if (!chap) {
          console.log(`  ❌ ${tc.chapter} NOT FOUND`);
          results.push({ ...tc, status: 'FAIL', reason: 'Chapter not found' });
          // Go back to volumes for next test
          await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const btn = btns.find(b => b.textContent?.includes('Volumi'));
            if (btn) btn.click();
          });
          await sleep(1000);
          continue;
        }

        // Select experiment (first one in the chapter)
        const exp = await selectExperiment(page, tc.experiment);
        if (!exp) {
          console.log(`  ❌ Experiment NOT FOUND`);
          results.push({ ...tc, status: 'FAIL', reason: 'Experiment not found' });
          await goBackToVolumes(page);
          continue;
        }
        console.log(`  Loaded: ${exp}`);

        // Wait for canvas to render fully
        await sleep(2000);

        // Analyze components on canvas
        const analysis = await analyzeCanvas(page);
        console.log(`  data-types: ${JSON.stringify(analysis.dataTypes)}`);
        console.log(`  SVG: ${analysis.svgCount}, Rects: ${analysis.rects}, Circles: ${analysis.circles}, Paths: ${analysis.paths}`);

        if (analysis.errorTexts.length > 0) {
          console.log(`  ⚠️ Errors: ${JSON.stringify(analysis.errorTexts)}`);
        }

        // Check expected types
        const found = tc.expectedTypes.filter(t => analysis.dataTypes.includes(t));
        const missing = tc.expectedTypes.filter(t => !analysis.dataTypes.includes(t));

        if (missing.length === 0) {
          console.log(`  ✅ All expected components found: [${found.join(', ')}]`);
        } else {
          console.log(`  ⚠️ Missing: [${missing.join(', ')}]`);
          console.log(`  ✅ Found: [${found.join(', ')}]`);
        }

        // Screenshot
        await page.screenshot({ path: path.join(SCREENSHOTS, tc.screenshot) });
        console.log(`  📸 ${tc.screenshot}`);

        results.push({
          ...tc,
          status: missing.length === 0 ? 'PASS' : 'PARTIAL',
          allTypes: analysis.dataTypes,
          found,
          missing,
          svgCount: analysis.svgCount,
          errors: analysis.errorTexts
        });

      } catch (err) {
        console.log(`  ❌ ERROR: ${err.message}`);
        await page.screenshot({ path: path.join(SCREENSHOTS, `fase1-error-${i + 1}.png`) }).catch(() => {});
        results.push({ ...tc, status: 'ERROR', reason: err.message });
      }
    }

  } catch (err) {
    console.error(`\nFATAL ERROR: ${err.message}`);
    await page.screenshot({ path: path.join(SCREENSHOTS, 'fase1-FATAL.png') }).catch(() => {});
  } finally {
    await browser.close();
  }

  // === SUMMARY ===
  console.log('\n\n═══════════════════════════════════════════════════');
  console.log('  FASE 1 SUMMARY');
  console.log('═══════════════════════════════════════════════════');

  let pass = 0, partial = 0, fail = 0, error = 0;
  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'PARTIAL' ? '⚠️' : r.status === 'ERROR' ? '💥' : '❌';
    console.log(`  ${icon} ${r.name}: ${r.status}`);
    if (r.missing?.length > 0) console.log(`     Missing: ${r.missing.join(', ')}`);
    if (r.reason) console.log(`     Reason: ${r.reason}`);
    if (r.status === 'PASS') pass++;
    else if (r.status === 'PARTIAL') partial++;
    else if (r.status === 'ERROR') error++;
    else fail++;
  }

  console.log(`\n  Total: ${results.length} | ✅ ${pass} PASS | ⚠️ ${partial} PARTIAL | ❌ ${fail} FAIL | 💥 ${error} ERROR`);

  // Component coverage
  const allFoundTypes = new Set(results.flatMap(r => r.allTypes || []));
  const ALL_TYPES = [
    'battery9v', 'breadboard-half', 'breadboard-full', 'led', 'rgb-led',
    'resistor', 'capacitor', 'diode', 'push-button', 'potentiometer',
    'photo-resistor', 'phototransistor', 'reed-switch', 'buzzer-piezo',
    'motor-dc', 'mosfet-n', 'servo', 'lcd16x2', 'multimeter', 'nano-r4', 'wire'
  ];
  const covered = ALL_TYPES.filter(t => allFoundTypes.has(t));
  const uncovered = ALL_TYPES.filter(t => !allFoundTypes.has(t));

  console.log(`\n  Component Coverage: ${covered.length}/${ALL_TYPES.length}`);
  console.log(`  Covered: ${covered.join(', ')}`);
  if (uncovered.length > 0) {
    console.log(`  Uncovered: ${uncovered.join(', ')}`);
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  FASE 1 Complete');
  console.log('═══════════════════════════════════════════════════');
}

main().catch(console.error);
