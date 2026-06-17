/**
 * Session 18 — FASE 7: All 69 experiments in "Già montato" (observation) mode
 * Navigates each experiment via UI picker, verifies components render on canvas
 * Uses "Indietro" button to return to picker between experiments
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
  await sleep(300);
}

// The complete list of volumes→chapters→experiments as organized by the picker
const STRUCTURE = [
  {
    vol: 1, chapters: [
      { ch: "Capitolo 6", exps: ["v1-cap6-esp1","v1-cap6-esp2","v1-cap6-esp3"] },
      { ch: "Capitolo 7", exps: ["v1-cap7-esp1","v1-cap7-esp2","v1-cap7-esp3","v1-cap7-esp4","v1-cap7-esp5","v1-cap7-esp6"] },
      { ch: "Capitolo 8", exps: ["v1-cap8-esp1","v1-cap8-esp2","v1-cap8-esp3","v1-cap8-esp4","v1-cap8-esp5"] },
      { ch: "Capitolo 9", exps: ["v1-cap9-esp1","v1-cap9-esp2","v1-cap9-esp3","v1-cap9-esp4","v1-cap9-esp5","v1-cap9-esp6","v1-cap9-esp7","v1-cap9-esp8","v1-cap9-esp9"] },
      { ch: "Capitolo 10", exps: ["v1-cap10-esp1","v1-cap10-esp2","v1-cap10-esp3","v1-cap10-esp4","v1-cap10-esp5","v1-cap10-esp6"] },
      { ch: "Capitolo 11", exps: ["v1-cap11-esp1","v1-cap11-esp2"] },
      { ch: "Capitolo 12", exps: ["v1-cap12-esp1","v1-cap12-esp2","v1-cap12-esp3","v1-cap12-esp4"] },
      { ch: "Capitolo 13", exps: ["v1-cap13-esp1","v1-cap13-esp2"] },
      { ch: "Capitolo 14", exps: ["v1-cap14-esp1"] },
    ]
  },
  {
    vol: 2, chapters: [
      { ch: "Capitolo 6", exps: ["v2-cap6-esp1","v2-cap6-esp2","v2-cap6-esp3","v2-cap6-esp4"] },
      { ch: "Capitolo 7", exps: ["v2-cap7-esp1","v2-cap7-esp2","v2-cap7-esp3","v2-cap7-esp4"] },
      { ch: "Capitolo 8", exps: ["v2-cap8-esp1","v2-cap8-esp2","v2-cap8-esp3"] },
      { ch: "Capitolo 9", exps: ["v2-cap9-esp1","v2-cap9-esp2"] },
      { ch: "Capitolo 10", exps: ["v2-cap10-esp1","v2-cap10-esp2","v2-cap10-esp3","v2-cap10-esp4"] },
      { ch: "Capitolo 12", exps: ["v2-cap12-esp1"] },
    ]
  },
  {
    vol: 3, chapters: [
      { ch: "Capitolo 6", exps: ["v3-cap6-blink","v3-cap6-pin5","v3-cap6-morse","v3-cap6-sirena","v3-cap6-semaforo"] },
      { ch: "Capitolo 7", exps: ["v3-cap7-pullup","v3-cap7-pulsante","v3-cap7-mini"] },
      { ch: "Capitolo 8", exps: ["v3-cap8-id","v3-cap8-pot","v3-cap8-serial"] },
      { ch: "Extra", exps: ["v3-extra-lcd-hello","v3-extra-servo-sweep"] },
    ]
  }
];

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Session 18 — FASE 7: All 69 Experiments (Observe)');
  console.log('═══════════════════════════════════════════════════\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('console', () => {});

  const results = [];
  let expNum = 0;
  const totalExp = STRUCTURE.reduce((s, v) => s + v.chapters.reduce((s2, c) => s2 + c.exps.length, 0), 0);

  try {
    // Login
    console.log('[LOGIN]...');
    await page.goto(`${BASE}/#login`);
    await sleep(3000);
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill(CREDS.email);
      await page.locator('input[type="password"]').first().fill(CREDS.password);
      await page.locator('button[type="submit"], button:has-text("Accedi")').first().click();
      await sleep(4000);
    }
    console.log('[LOGIN] OK\n');

    for (const vol of STRUCTURE) {
      console.log(`\n${'═'.repeat(55)}`);
      console.log(`  VOLUME ${vol.vol}`);
      console.log(`${'═'.repeat(55)}`);

      for (const chapter of vol.chapters) {
        console.log(`\n  ── ${chapter.ch} (${chapter.exps.length} exp) ──`);

        for (let expIdx = 0; expIdx < chapter.exps.length; expIdx++) {
          const expId = chapter.exps[expIdx];
          expNum++;
          const t0 = Date.now();

          try {
            // Fresh navigate to simulator
            await page.goto(`${BASE}/#login`);
            await sleep(1000);
            await page.goto(`${BASE}/#tutor`);
            await sleep(4000);
            await dismissOverlays(page);
            await dismissOverlays(page);

            // Click Simulatore tab
            await page.evaluate(() => {
              const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Simulatore'));
              if (btn) btn.click();
            });
            await sleep(2500);
            await dismissOverlays(page);

            // Select Volume
            const volOk = await page.evaluate((v) => {
              const btns = Array.from(document.querySelectorAll('button'));
              const btn = btns.find(b => b.textContent?.includes(`Volume ${v}`) && b.textContent?.includes('esperiment'));
              if (btn) { btn.click(); return true; }
              return false;
            }, vol.vol);
            if (!volOk) {
              console.log(`  [${expNum}/${totalExp}] ${expId}: ❌ Volume not found`);
              results.push({ id: expId, status: 'FAIL', reason: 'Volume not found' });
              continue;
            }
            await sleep(1500);

            // Select Chapter
            const chOk = await page.evaluate((ct) => {
              const btns = Array.from(document.querySelectorAll('button'));
              const btn = btns.find(b => b.textContent?.includes(ct) && b.textContent?.includes('esp.'));
              if (btn) { btn.click(); return btn.textContent?.trim().slice(0, 60); }
              return null;
            }, chapter.ch);
            if (!chOk) {
              console.log(`  [${expNum}/${totalExp}] ${expId}: ❌ Chapter "${chapter.ch}" not found`);
              results.push({ id: expId, status: 'FAIL', reason: `Chapter not found` });
              continue;
            }
            await sleep(1500);

            // Make sure "Già montato" is active (default)
            // No action needed — it's default

            // Select Nth experiment in this chapter
            const expClicked = await page.evaluate((idx) => {
              const btns = Array.from(document.querySelectorAll('button'));
              const expBtns = btns.filter(b => {
                const t = b.textContent || '';
                return t.includes('★') && !t.includes('Volumi') && !t.includes('Capitoli');
              });
              if (expBtns[idx]) { expBtns[idx].click(); return expBtns[idx].textContent?.trim().slice(0, 80); }
              return null;
            }, expIdx);
            if (!expClicked) {
              console.log(`  [${expNum}/${totalExp}] ${expId}: ❌ Experiment #${expIdx} not found`);
              results.push({ id: expId, status: 'FAIL', reason: 'Experiment not found' });
              continue;
            }
            await sleep(4000);
            await dismissOverlays(page);
            await sleep(500);

            // Analyze canvas
            const analysis = await page.evaluate(() => {
              const dataTypes = [...new Set(
                Array.from(document.querySelectorAll('[data-type]')).map(e => e.getAttribute('data-type'))
              )];
              const componentIds = [...new Set(
                Array.from(document.querySelectorAll('[data-component-id]')).map(e => e.getAttribute('data-component-id'))
              )];
              const svgCount = document.querySelectorAll('svg').length;
              return { dataTypes, componentIds, svgCount };
            });

            const hasComponents = analysis.dataTypes.length > 0;
            const icon = hasComponents ? '✅' : '❌';
            const dt = ((Date.now() - t0) / 1000).toFixed(1);
            console.log(`  [${expNum}/${totalExp}] ${expId}: ${icon} types=[${analysis.dataTypes.join(',')}] ids=[${analysis.componentIds.join(',')}] (${dt}s)`);

            results.push({
              id: expId,
              status: hasComponents ? 'PASS' : 'FAIL',
              types: analysis.dataTypes,
              compIds: analysis.componentIds,
              reason: hasComponents ? null : 'No components on canvas'
            });

          } catch (err) {
            console.log(`  [${expNum}/${totalExp}] ${expId}: 💥 ${err.message}`);
            results.push({ id: expId, status: 'ERROR', reason: err.message });
          }
        }
      }
    }

  } catch (err) {
    console.error(`FATAL: ${err.message}`);
  } finally {
    await browser.close();
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  FASE 7 SUMMARY');
  console.log('═══════════════════════════════════════════════════');
  let pass = 0, fail = 0, error = 0;
  for (const r of results) {
    if (r.status === 'PASS') pass++;
    else if (r.status === 'FAIL') fail++;
    else error++;
  }
  console.log(`  ✅ PASS: ${pass}/${totalExp}`);
  console.log(`  ❌ FAIL: ${fail}/${totalExp}`);
  console.log(`  💥 ERROR: ${error}/${totalExp}`);

  // List failures
  const failures = results.filter(r => r.status !== 'PASS');
  if (failures.length > 0) {
    console.log('\n  FAILURES:');
    for (const f of failures) {
      console.log(`    ${f.status === 'FAIL' ? '❌' : '💥'} ${f.id}: ${f.reason}`);
    }
  }
  console.log('═══════════════════════════════════════════════════');
}

main().catch(console.error);
