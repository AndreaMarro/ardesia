/**
 * Session 18 — FASE 1 V2: Full Visual Audit of ALL SVG Components
 * Strategy: reload tutor + re-navigate for each test case (avoids back-navigation bugs)
 * Correct chapter mapping verified from data files.
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

async function loginOnce(page) {
  await page.goto(`${BASE}/#login`);
  await sleep(3000);
  const emailInput = page.locator('input[type="email"]').first();
  if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await emailInput.fill(CREDS.email);
    await page.locator('input[type="password"]').first().fill(CREDS.password);
    await page.locator('button[type="submit"], button:has-text("Accedi")').first().click();
    await sleep(4000);
  }
}

/** Full fresh navigation from tutor home to experiment canvas */
async function navigateToExperiment(page, volNum, chapterText, expIndex = 0) {
  // 1. Go to tutor
  await page.goto(`${BASE}/#tutor`);
  await sleep(4000);
  await dismissOverlays(page);
  await dismissOverlays(page);

  // 2. Click Simulatore in sidebar
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Simulatore'));
    if (btn) btn.click();
  });
  await sleep(3000);
  await dismissOverlays(page);

  // 3. Select Volume
  const vol = await page.evaluate((v) => {
    const btns = Array.from(document.querySelectorAll('button'));
    const volBtn = btns.find(b => {
      const t = b.textContent || '';
      return t.includes(`Volume ${v}`) && t.includes('esperiment');
    });
    if (volBtn) { volBtn.click(); return volBtn.textContent?.trim().slice(0, 60); }
    return null;
  }, volNum);
  if (!vol) return { error: 'Volume not found' };
  await sleep(2000);

  // 4. Select Chapter
  const chap = await page.evaluate((ct) => {
    const btns = Array.from(document.querySelectorAll('button'));
    const chapBtn = btns.find(b => {
      const t = b.textContent || '';
      return t.includes(ct) && t.includes('esp.') && !t.includes('Volumi');
    });
    if (chapBtn) { chapBtn.click(); return chapBtn.textContent?.trim().slice(0, 80); }
    return null;
  }, chapterText);
  if (!chap) return { error: `Chapter "${chapterText}" not found` };
  await sleep(2000);

  // 5. Select Experiment (by index: 0=first, 1=second, etc.)
  const exp = await page.evaluate((idx) => {
    const btns = Array.from(document.querySelectorAll('button'));
    const expBtns = btns.filter(b => {
      const t = b.textContent || '';
      return t.includes('★') && !t.includes('Volumi') && !t.includes('Capitoli');
    });
    if (expBtns[idx]) {
      expBtns[idx].click();
      return expBtns[idx].textContent?.trim().slice(0, 80);
    }
    return null;
  }, expIndex);
  if (!exp) return { error: 'Experiment not found' };
  await sleep(5000);
  await dismissOverlays(page);

  return { vol, chap, exp };
}

async function analyzeCanvas(page) {
  return page.evaluate(() => {
    const dataTypes = [...new Set(
      Array.from(document.querySelectorAll('[data-type]')).map(e => e.getAttribute('data-type'))
    )];
    const svgCount = document.querySelectorAll('svg').length;
    const rects = document.querySelectorAll('svg rect').length;
    const circles = document.querySelectorAll('svg circle').length;
    const paths = document.querySelectorAll('svg path').length;
    const groups = document.querySelectorAll('svg g').length;
    const texts = document.querySelectorAll('svg text').length;

    // Console errors check
    const errorTexts = Array.from(document.querySelectorAll('*')).filter(e => {
      const t = e.textContent?.toLowerCase() || '';
      return (t.includes('errore') || t.includes('error') || t.includes('missing')) &&
             e.children.length === 0 && t.length < 100;
    }).map(e => e.textContent.trim()).slice(0, 5);

    return { dataTypes, svgCount, rects, circles, paths, groups, texts, errorTexts };
  });
}

// CORRECT chapter mapping from data files
const TEST_CASES = [
  // Vol1
  { name: "LED + Resistor + Battery + BB", vol: 1, chapter: "Capitolo 6", expIdx: 0,
    expected: ["battery9v","breadboard-half","resistor","led"], shot: "fase1-comp-01-led.png" },
  { name: "RGB LED", vol: 1, chapter: "Capitolo 7", expIdx: 0,
    expected: ["rgb-led"], shot: "fase1-comp-02-rgb-led.png" },
  { name: "Push Button", vol: 1, chapter: "Capitolo 8", expIdx: 0,
    expected: ["push-button"], shot: "fase1-comp-03-push-button.png" },
  { name: "Potentiometer", vol: 1, chapter: "Capitolo 9", expIdx: 0,
    expected: ["potentiometer"], shot: "fase1-comp-04-potentiometer.png" },
  { name: "PhotoResistor (LDR)", vol: 1, chapter: "Capitolo 10", expIdx: 0,
    expected: ["photo-resistor"], shot: "fase1-comp-05-photo-resistor.png" },
  { name: "Buzzer Piezo", vol: 1, chapter: "Capitolo 11", expIdx: 0,
    expected: ["buzzer-piezo"], shot: "fase1-comp-06-buzzer.png" },
  { name: "Reed Switch", vol: 1, chapter: "Capitolo 12", expIdx: 0,
    expected: ["reed-switch"], shot: "fase1-comp-07-reed-switch.png" },
  // Vol2
  { name: "Capacitor + Multimeter", vol: 2, chapter: "Capitolo 7", expIdx: 0,
    expected: ["capacitor","multimeter"], shot: "fase1-comp-08-capacitor.png" },
  { name: "MOSFET N-channel", vol: 2, chapter: "Capitolo 8", expIdx: 0,
    expected: ["mosfet-n"], shot: "fase1-comp-09-mosfet.png" },
  { name: "Phototransistor", vol: 2, chapter: "Capitolo 9", expIdx: 0,
    expected: ["phototransistor"], shot: "fase1-comp-10-phototransistor.png" },
  { name: "Motor DC", vol: 2, chapter: "Capitolo 10", expIdx: 0,
    expected: ["motor-dc"], shot: "fase1-comp-11-motor-dc.png" },
  { name: "Diode (Robot Segui Luce)", vol: 2, chapter: "Capitolo 12", expIdx: 0,
    expected: ["diode"], shot: "fase1-comp-12-diode.png" },
  // Vol3
  { name: "Arduino Nano R4", vol: 3, chapter: "Capitolo 6", expIdx: 0,
    expected: ["nano-r4"], shot: "fase1-comp-13-nano-r4.png" },
  { name: "LCD 16x2 + Servo (Extra)", vol: 3, chapter: "Extra", expIdx: 0,
    expected: ["lcd16x2"], shot: "fase1-comp-14-lcd-servo.png" },
];

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Session 18 — FASE 1 V2: Full Component Audit');
  console.log('═══════════════════════════════════════════════════\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('console', () => {});

  const results = [];

  try {
    // Login once
    console.log('[LOGIN] ...');
    await loginOnce(page);
    console.log('[LOGIN] OK\n');

    for (let i = 0; i < TEST_CASES.length; i++) {
      const tc = TEST_CASES[i];
      console.log(`[${i + 1}/${TEST_CASES.length}] ${tc.name}`);
      console.log(`  Vol${tc.vol} > ${tc.chapter} > exp[${tc.expIdx}]`);

      try {
        const nav = await navigateToExperiment(page, tc.vol, tc.chapter, tc.expIdx);

        if (nav.error) {
          console.log(`  ❌ ${nav.error}`);
          results.push({ ...tc, status: 'FAIL', reason: nav.error });
          await page.screenshot({ path: path.join(SCREENSHOTS, `fase1-err-${i + 1}.png`) }).catch(() => {});
          continue;
        }

        console.log(`  Loaded: ${nav.exp}`);
        await sleep(1500);

        const analysis = await analyzeCanvas(page);
        console.log(`  data-types: ${JSON.stringify(analysis.dataTypes)}`);
        console.log(`  SVG: ${analysis.svgCount}, Rects: ${analysis.rects}, Circles: ${analysis.circles}`);

        const found = tc.expected.filter(t => analysis.dataTypes.includes(t));
        const missing = tc.expected.filter(t => !analysis.dataTypes.includes(t));

        if (missing.length === 0) {
          console.log(`  ✅ All expected: [${found.join(', ')}]`);
        } else {
          console.log(`  ⚠️ Missing: [${missing.join(', ')}] | Found: [${found.join(', ')}]`);
        }

        if (analysis.errorTexts.length > 0) {
          console.log(`  ⚠️ Errors on page: ${JSON.stringify(analysis.errorTexts)}`);
        }

        await page.screenshot({ path: path.join(SCREENSHOTS, tc.shot) });
        console.log(`  📸 ${tc.shot}\n`);

        results.push({
          ...tc, status: missing.length === 0 ? 'PASS' : 'PARTIAL',
          allTypes: analysis.dataTypes, found, missing,
          svgCount: analysis.svgCount, errors: analysis.errorTexts
        });

      } catch (err) {
        console.log(`  💥 ${err.message}\n`);
        results.push({ ...tc, status: 'ERROR', reason: err.message });
      }
    }

  } catch (err) {
    console.error(`FATAL: ${err.message}`);
  } finally {
    await browser.close();
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  FASE 1 V2 — SUMMARY');
  console.log('═══════════════════════════════════════════════════');

  let pass = 0, partial = 0, fail = 0, error = 0;
  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'PARTIAL' ? '⚠️' : r.status === 'ERROR' ? '💥' : '❌';
    console.log(`  ${icon} ${r.name}: ${r.status}${r.missing?.length > 0 ? ` (missing: ${r.missing.join(', ')})` : ''}${r.reason ? ` — ${r.reason}` : ''}`);
    if (r.status === 'PASS') pass++; else if (r.status === 'PARTIAL') partial++;
    else if (r.status === 'ERROR') error++; else fail++;
  }

  const allFoundTypes = new Set(results.flatMap(r => r.allTypes || []));
  const ALL_TYPES = [
    'battery9v','breadboard-half','breadboard-full','led','rgb-led','resistor',
    'capacitor','diode','push-button','potentiometer','photo-resistor',
    'phototransistor','reed-switch','buzzer-piezo','motor-dc','mosfet-n',
    'servo','lcd16x2','multimeter','nano-r4','wire'
  ];
  const covered = ALL_TYPES.filter(t => allFoundTypes.has(t));
  const uncovered = ALL_TYPES.filter(t => !allFoundTypes.has(t));

  console.log(`\n  Total: ${results.length} | ✅ ${pass} | ⚠️ ${partial} | ❌ ${fail} | 💥 ${error}`);
  console.log(`  Coverage: ${covered.length}/${ALL_TYPES.length} (${covered.join(', ')})`);
  if (uncovered.length > 0) console.log(`  Uncovered: ${uncovered.join(', ')}`);
  console.log('═══════════════════════════════════════════════════');
}

main().catch(console.error);
