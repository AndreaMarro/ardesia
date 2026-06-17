/**
 * Session 18 — FASE 1 V3: Full Visual Audit of ALL SVG Components
 * Fix: force full reload between experiments by navigating to #login then back to #tutor
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

/** Fresh navigate: force reload → tutor → Simulatore → volumes visible */
async function freshToSimulator(page) {
  // Force full page reload by navigating to a different hash first
  await page.goto(`${BASE}/#login`);
  await sleep(1500);
  await page.goto(`${BASE}/#tutor`);
  await sleep(5000);
  await dismissOverlays(page);
  await dismissOverlays(page);

  // Click Simulatore
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Simulatore'));
    if (btn) btn.click();
  });
  await sleep(3000);
  await dismissOverlays(page);

  // Verify volumes are visible
  const vols = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button'))
      .filter(b => b.textContent?.includes('Volume') && b.textContent?.includes('esperiment'))
      .map(b => b.textContent?.trim().slice(0, 30));
  });
  return vols;
}

async function selectVolume(page, volNum) {
  return page.evaluate((v) => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent?.includes(`Volume ${v}`) && b.textContent?.includes('esperiment'));
    if (btn) { btn.click(); return true; }
    return false;
  }, volNum);
}

async function selectChapter(page, chapterText) {
  return page.evaluate((ct) => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => {
      const t = b.textContent || '';
      return t.includes(ct) && t.includes('esp.');
    });
    if (btn) { btn.click(); return btn.textContent?.trim().slice(0, 80); }
    return null;
  }, chapterText);
}

async function selectFirstExperiment(page) {
  return page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => {
      const t = b.textContent || '';
      return t.includes('★') && !t.includes('Volumi') && !t.includes('Capitoli');
    });
    if (btn) { btn.click(); return btn.textContent?.trim().slice(0, 80); }
    return null;
  });
}

async function selectNthExperiment(page, n) {
  return page.evaluate((idx) => {
    const btns = Array.from(document.querySelectorAll('button'));
    const expBtns = btns.filter(b => {
      const t = b.textContent || '';
      return t.includes('★') && !t.includes('Volumi') && !t.includes('Capitoli');
    });
    if (expBtns[idx]) { expBtns[idx].click(); return expBtns[idx].textContent?.trim().slice(0, 80); }
    return null;
  }, n);
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
    return { dataTypes, svgCount, rects, circles, paths, groups };
  });
}

// CORRECT mapping from experiments data files
const TEST_CASES = [
  // Vol 1
  { name: "LED+Resistor+Battery+BB", vol: 1, ch: "Capitolo 6", expN: 0,
    expect: ["battery9v","breadboard-half","resistor","led"], shot: "f1-01-led.png" },
  { name: "RGB LED", vol: 1, ch: "Capitolo 7", expN: 0,
    expect: ["rgb-led"], shot: "f1-02-rgb.png" },
  { name: "Push Button", vol: 1, ch: "Capitolo 8", expN: 0,
    expect: ["push-button"], shot: "f1-03-btn.png" },
  { name: "Potentiometer", vol: 1, ch: "Capitolo 9", expN: 0,
    expect: ["potentiometer"], shot: "f1-04-pot.png" },
  { name: "PhotoResistor", vol: 1, ch: "Capitolo 10", expN: 0,
    expect: ["photo-resistor"], shot: "f1-05-ldr.png" },
  { name: "Buzzer", vol: 1, ch: "Capitolo 11", expN: 0,
    expect: ["buzzer-piezo"], shot: "f1-06-buzz.png" },
  { name: "Reed Switch", vol: 1, ch: "Capitolo 12", expN: 0,
    expect: ["reed-switch"], shot: "f1-07-reed.png" },
  // Vol 2
  { name: "Capacitor+Multimeter", vol: 2, ch: "Capitolo 7", expN: 0,
    expect: ["capacitor","multimeter"], shot: "f1-08-cap.png" },
  { name: "MOSFET-N", vol: 2, ch: "Capitolo 8", expN: 0,
    expect: ["mosfet-n"], shot: "f1-09-mos.png" },
  { name: "Phototransistor", vol: 2, ch: "Capitolo 9", expN: 0,
    expect: ["phototransistor"], shot: "f1-10-pt.png" },
  { name: "Motor DC", vol: 2, ch: "Capitolo 10", expN: 0,
    expect: ["motor-dc"], shot: "f1-11-mot.png" },
  { name: "Diode (Robot)", vol: 2, ch: "Capitolo 12", expN: 0,
    expect: ["diode"], shot: "f1-12-diode.png" },
  // Vol 3
  { name: "Arduino Nano R4", vol: 3, ch: "Capitolo 6", expN: 0,
    expect: ["nano-r4"], shot: "f1-13-nano.png" },
  { name: "LCD+Servo (Extra)", vol: 3, ch: "Extra", expN: 0,
    expect: ["lcd16x2"], shot: "f1-14-lcd.png" },
  { name: "Servo (Extra)", vol: 3, ch: "Extra", expN: 1,
    expect: ["servo"], shot: "f1-15-servo.png" },
];

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Session 18 — FASE 1 V3: Component Audit');
  console.log('═══════════════════════════════════════════════════\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('console', () => {});

  const results = [];

  try {
    console.log('[LOGIN]...');
    await loginOnce(page);
    console.log('[LOGIN] OK\n');

    for (let i = 0; i < TEST_CASES.length; i++) {
      const tc = TEST_CASES[i];
      const t0 = Date.now();
      console.log(`[${i + 1}/${TEST_CASES.length}] ${tc.name} (V${tc.vol} > ${tc.ch} > #${tc.expN})`);

      try {
        // Fresh navigate to simulator
        const vols = await freshToSimulator(page);
        if (vols.length === 0) {
          console.log('  ❌ No volume buttons found after fresh nav');
          results.push({ ...tc, status: 'FAIL', reason: 'No volumes' });
          continue;
        }

        // Select volume
        const volOk = await selectVolume(page, tc.vol);
        if (!volOk) {
          console.log(`  ❌ Volume ${tc.vol} not found`);
          results.push({ ...tc, status: 'FAIL', reason: 'Volume not found' });
          continue;
        }
        await sleep(2000);

        // Select chapter
        const chap = await selectChapter(page, tc.ch);
        if (!chap) {
          console.log(`  ❌ ${tc.ch} not found`);
          results.push({ ...tc, status: 'FAIL', reason: `Chapter "${tc.ch}" not found` });
          continue;
        }
        await sleep(2000);

        // Select experiment
        const exp = await selectNthExperiment(page, tc.expN);
        if (!exp) {
          console.log(`  ❌ Experiment #${tc.expN} not found`);
          results.push({ ...tc, status: 'FAIL', reason: 'Experiment not found' });
          continue;
        }
        await sleep(5000);
        await dismissOverlays(page);
        await sleep(1000);

        // Analyze
        const a = await analyzeCanvas(page);
        const found = tc.expect.filter(t => a.dataTypes.includes(t));
        const missing = tc.expect.filter(t => !a.dataTypes.includes(t));

        const icon = missing.length === 0 ? '✅' : '⚠️';
        console.log(`  ${icon} types: [${a.dataTypes.join(', ')}]`);
        console.log(`  SVG:${a.svgCount} R:${a.rects} C:${a.circles} P:${a.paths} G:${a.groups}`);
        if (missing.length > 0) console.log(`  Missing: [${missing.join(', ')}]`);

        await page.screenshot({ path: path.join(SCREENSHOTS, tc.shot) });
        console.log(`  📸 ${tc.shot} (${((Date.now() - t0) / 1000).toFixed(1)}s)\n`);

        results.push({ ...tc, status: missing.length === 0 ? 'PASS' : 'PARTIAL',
          allTypes: a.dataTypes, found, missing });

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
  console.log('═══════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('═══════════════════════════════════════════════════');
  let p = 0, pa = 0, f = 0, e = 0;
  for (const r of results) {
    const ic = r.status === 'PASS' ? '✅' : r.status === 'PARTIAL' ? '⚠️' : r.status === 'ERROR' ? '💥' : '❌';
    const extra = r.missing?.length > 0 ? ` [missing: ${r.missing.join(',')}]` : '';
    const reason = r.reason ? ` — ${r.reason}` : '';
    console.log(`  ${ic} ${r.name}: ${r.status}${extra}${reason}`);
    if (r.status === 'PASS') p++; else if (r.status === 'PARTIAL') pa++;
    else if (r.status === 'ERROR') e++; else f++;
  }

  const allFound = new Set(results.flatMap(r => r.allTypes || []));
  const ALL = ['battery9v','breadboard-half','breadboard-full','led','rgb-led','resistor',
    'capacitor','diode','push-button','potentiometer','photo-resistor','phototransistor',
    'reed-switch','buzzer-piezo','motor-dc','mosfet-n','servo','lcd16x2','multimeter','nano-r4','wire'];
  const cov = ALL.filter(t => allFound.has(t));
  const unc = ALL.filter(t => !allFound.has(t));

  console.log(`\n  ✅ ${p} | ⚠️ ${pa} | ❌ ${f} | 💥 ${e} — Coverage: ${cov.length}/${ALL.length}`);
  if (unc.length > 0) console.log(`  Uncovered: ${unc.join(', ')}`);
  console.log('═══════════════════════════════════════════════════');
}

main().catch(console.error);
