/**
 * Session 18 — FASE 1: Audit Componenti SVG
 * Uses JavaScript clicks to bypass overlay issues
 */
import { chromium } from 'playwright-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS = path.join(__dirname, '..', 'screenshots', 'session18');
const BASE = 'https://elab-builder.vercel.app';
const CREDS = { email: 'debug@test.com', password: 'Xk9#mL2!nR4' };

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/** Click buttons by evaluating JavaScript directly (bypasses all overlay issues) */
async function jsClickButton(page, textMatch) {
  return page.evaluate((text) => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent?.includes(text));
    if (btn) { btn.click(); return true; }
    return false;
  }, textMatch);
}

/** Aggressively dismiss ALL overlays using JS clicks */
async function dismissAllOverlays(page) {
  const texts = [
    'Accetto', 'Iniziamo', 'avventura', 'voglio esplorare',
    'ho un kit', 'Salta', 'Avanti', 'Fine', 'Ho capito', 'Chiudi'
  ];
  for (let round = 0; round < 25; round++) {
    let found = false;
    for (const t of texts) {
      if (await jsClickButton(page, t)) {
        await sleep(400);
        found = true;
        break;
      }
    }
    // Also try closing X buttons
    const closedX = await page.evaluate(() => {
      // Find buttons with just X-like text
      const btns = Array.from(document.querySelectorAll('button'));
      const xBtn = btns.find(b => {
        const t = b.textContent?.trim();
        return t === '✕' || t === '×' || t === 'X' || t === 'x' || t === '✖';
      });
      if (xBtn) { xBtn.click(); return true; }
      // Also try aria-label close
      const ariaClose = document.querySelector('[aria-label="close"], [aria-label="chiudi"]');
      if (ariaClose) { ariaClose.click(); return true; }
      return false;
    });
    if (closedX) {
      await sleep(400);
      found = true;
    }
    if (!found) break;
  }
  await sleep(500);
}

async function main() {
  console.log('=== Session 18 — FASE 1: Audit Componenti SVG ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('console', () => {});

  try {
    // === LOGIN ===
    console.log('[1] Login...');
    await page.goto(`${BASE}/#login`);
    await sleep(3000);
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill(CREDS.email);
      await page.locator('input[type="password"]').first().fill(CREDS.password);
      await page.locator('button[type="submit"], button:has-text("Accedi")').first().click();
      await sleep(4000);
      console.log('  Login OK');
    }

    // === NAVIGATE TO TUTOR ===
    console.log('[2] Navigate to /#tutor...');
    await page.goto(`${BASE}/#tutor`);
    await sleep(5000);

    // === DISMISS ALL OVERLAYS ===
    console.log('[3] Dismissing ALL overlays...');
    await dismissAllOverlays(page);
    await sleep(1000);
    await dismissAllOverlays(page); // Second pass
    await page.screenshot({ path: path.join(SCREENSHOTS, 'f1-01-clean-tutor.png') });

    // Check if overlays are gone
    const stillBlocking = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.filter(b => {
        const t = b.textContent?.toLowerCase() || '';
        return t.includes('avventura') || t.includes('iniziamo') || t.includes('salta');
      }).map(b => b.textContent?.trim());
    });
    console.log(`  Remaining blocking buttons: ${JSON.stringify(stillBlocking)}`);

    // === CLICK SIMULATORE IN SIDEBAR ===
    console.log('[4] Clicking Simulatore in sidebar (JS)...');
    const simClicked = await jsClickButton(page, 'Simulatore');
    console.log(`  Simulatore clicked: ${simClicked}`);
    await sleep(3000);
    await dismissAllOverlays(page);
    await page.screenshot({ path: path.join(SCREENSHOTS, 'f1-02-after-sim-click.png') });

    // Check state
    const state4 = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4'))
        .map(e => e.textContent?.trim()).filter(Boolean);
      const visible = Array.from(document.querySelectorAll('*')).filter(e => {
        const t = e.textContent?.trim();
        const rect = e.getBoundingClientRect();
        return t && e.children.length === 0 && rect.width > 0 && rect.height > 0 &&
          t.length > 3 && t.length < 60;
      }).map(e => e.textContent.trim()).filter((v,i,a) => a.indexOf(v) === i).slice(0, 30);
      return { headings, visible };
    });
    console.log(`  Headings: ${JSON.stringify(state4.headings)}`);
    console.log('  Visible text:');
    state4.visible.forEach(t => console.log(`    "${t}"`));

    // === LOOK FOR VOLUME CARDS ===
    console.log('\n[5] Looking for Volume cards...');
    const volState = await page.evaluate(() => {
      // Find elements with "VOLUME" text
      const volEls = Array.from(document.querySelectorAll('*')).filter(e => {
        return e.textContent?.includes('VOLUME') && e.children.length < 5;
      });
      return volEls.map(e => ({
        tag: e.tagName,
        text: e.textContent?.trim().slice(0, 80),
        classes: e.className?.toString().slice(0, 50),
        visible: e.getBoundingClientRect().height > 0
      })).slice(0, 10);
    });
    console.log(`  Volume elements found: ${volState.length}`);
    volState.forEach(v => console.log(`    ${v.tag}[${v.classes}]: "${v.text}" visible=${v.visible}`));

    // Check if we need to find the experiment picker differently
    const expPickerState = await page.evaluate(() => {
      // Look for the ExperimentPicker or volume selection UI
      const selectors = [
        '[class*="experiment"]', '[class*="picker"]', '[class*="volume"]',
        '[class*="chooser"]', '[class*="select"]'
      ];
      const found = {};
      for (const sel of selectors) {
        const els = document.querySelectorAll(sel);
        if (els.length > 0) {
          found[sel] = Array.from(els).map(e => ({
            tag: e.tagName,
            text: e.textContent?.trim().slice(0, 60),
            classes: e.className?.toString().slice(0, 50)
          })).slice(0, 3);
        }
      }
      return found;
    });
    console.log('\n  Experiment picker elements:');
    for (const [sel, els] of Object.entries(expPickerState)) {
      console.log(`    ${sel}:`);
      els.forEach(e => console.log(`      ${e.tag}[${e.classes}]: "${e.text}"`));
    }

    // === TRY VOLUME 1 ===
    console.log('\n[6] Attempting to select Volume 1...');
    const vol1Clicked = await page.evaluate(() => {
      // Find and click the VOLUME 1 card
      const allEls = Array.from(document.querySelectorAll('*'));
      // Look for card/button that has "VOLUME 1" text
      const vol1 = allEls.find(e => {
        const t = e.textContent?.trim();
        return t && (
          (t.includes('VOLUME 1') && t.length < 100) ||
          (t.includes('Volume 1') && t.length < 100)
        ) && (e.tagName === 'BUTTON' || e.tagName === 'DIV' || e.onclick || e.style?.cursor === 'pointer');
      });
      if (vol1) {
        vol1.click();
        return vol1.textContent?.trim().slice(0, 80);
      }
      return null;
    });
    console.log(`  Volume 1 JS click result: ${vol1Clicked || 'NOT FOUND'}`);
    await sleep(3000);
    await dismissAllOverlays(page);
    await page.screenshot({ path: path.join(SCREENSHOTS, 'f1-03-after-vol1.png') });

    // === CHECK FOR EXPERIMENTS LIST ===
    console.log('\n[7] Checking for experiments...');
    const expState = await page.evaluate(() => {
      const texts = Array.from(document.querySelectorAll('*')).filter(e => {
        const t = e.textContent?.trim();
        return t && e.children.length === 0 && t.length > 5 && t.length < 100;
      }).map(e => e.textContent.trim()).filter((v,i,a) => a.indexOf(v) === i);

      // Find experiment-related text
      const expTexts = texts.filter(t =>
        t.includes('Esp') || t.includes('Cap') || t.includes('LED') ||
        t.includes('Accendi') || t.includes('Buzzer') || t.includes('Pulsante') ||
        t.includes('esperiment')
      ).slice(0, 20);

      return { total: texts.length, expTexts };
    });
    console.log(`  Total visible texts: ${expState.total}`);
    console.log(`  Experiment-related texts: ${expState.expTexts.length}`);
    expState.expTexts.forEach(t => console.log(`    "${t}"`));

    // === TRY CLICKING FIRST EXPERIMENT ===
    console.log('\n[8] Trying to select first experiment...');
    const exp1Clicked = await page.evaluate(() => {
      const allEls = Array.from(document.querySelectorAll('*'));
      const exp = allEls.find(e => {
        const t = e.textContent?.trim();
        return t && t.includes('Accendi') && t.includes('LED') && e.children.length < 5;
      });
      if (exp) {
        exp.click();
        return exp.textContent?.trim().slice(0, 80);
      }
      // Try "Cap. 6" or "Esp. 1"
      const exp2 = allEls.find(e => {
        const t = e.textContent?.trim();
        return t && t.includes('Cap. 6') && t.includes('Esp. 1');
      });
      if (exp2) {
        exp2.click();
        return exp2.textContent?.trim().slice(0, 80);
      }
      return null;
    });
    console.log(`  Experiment click: ${exp1Clicked || 'NOT FOUND'}`);
    await sleep(3000);
    await dismissAllOverlays(page);
    await page.screenshot({ path: path.join(SCREENSHOTS, 'f1-04-after-exp-click.png') });

    // === CHECK FOR MODE SELECTION ===
    console.log('\n[9] Looking for mode buttons...');
    const modeState = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.map(b => b.textContent?.trim()).filter(t =>
        t && (t.toLowerCase().includes('montato') || t.toLowerCase().includes('monta tu') ||
              t.toLowerCase().includes('osserva'))
      );
    });
    console.log(`  Mode buttons: ${JSON.stringify(modeState)}`);

    if (modeState.length > 0) {
      // Click "Già montato"
      const modeClicked = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent?.toLowerCase().includes('montato'));
        if (btn) { btn.click(); return btn.textContent?.trim(); }
        return null;
      });
      console.log(`  Mode clicked: ${modeClicked}`);
      await sleep(5000);
      await dismissAllOverlays(page);
    }

    await page.screenshot({ path: path.join(SCREENSHOTS, 'f1-05-simulator-canvas.png') });

    // === FINAL ANALYSIS ===
    console.log('\n[10] Final state...');
    const final = await page.evaluate(() => {
      return {
        hash: window.location.hash,
        svgCount: document.querySelectorAll('svg').length,
        draggables: document.querySelectorAll('[draggable="true"]').length,
        svgRects: document.querySelectorAll('svg rect').length,
        svgCircles: document.querySelectorAll('svg circle').length,
        svgPaths: document.querySelectorAll('svg path').length,
        svgGroups: document.querySelectorAll('svg g').length,
        dataTypes: [...new Set(Array.from(document.querySelectorAll('[data-type]')).map(e => e.getAttribute('data-type')))],
        btns: Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim().slice(0,40)).filter(Boolean).slice(0, 40),
      };
    });
    console.log(`  Hash: ${final.hash}`);
    console.log(`  SVG: ${final.svgCount}, Rects: ${final.svgRects}, Circles: ${final.svgCircles}, Paths: ${final.svgPaths}, Groups: ${final.svgGroups}`);
    console.log(`  Draggables: ${final.draggables}`);
    console.log(`  data-types: ${JSON.stringify(final.dataTypes)}`);
    console.log(`  Buttons:\n    ${final.btns.join('\n    ')}`);

  } catch (err) {
    console.error(`\nERROR: ${err.message}`);
    await page.screenshot({ path: path.join(SCREENSHOTS, 'f1-ERROR.png') }).catch(() => {});
  } finally {
    await browser.close();
  }

  console.log('\n=== FASE 1 Probe Complete ===');
}

main().catch(console.error);
