/**
 * Debug: test re-navigation to simulator volumes after first experiment
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

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('console', () => {});

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

  // First navigate to tutor
  console.log('=== First navigation to tutor ===');
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

  // Check volume buttons
  let volBtns = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.filter(b => b.textContent?.includes('Volume') && b.textContent?.includes('esperiment'))
      .map(b => b.textContent?.trim().slice(0, 60));
  });
  console.log(`Volume buttons (1st time): ${JSON.stringify(volBtns)}`);
  await page.screenshot({ path: path.join(SCREENSHOTS, 'debug-1st-volumes.png') });

  // Select Vol1 > Cap6 > Esp1
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
    const btn = btns.find(b => b.textContent?.includes('★') && !b.textContent?.includes('Volumi'));
    if (btn) btn.click();
  });
  await sleep(5000);
  await dismissOverlays(page);
  console.log('=== Experiment loaded ===');

  // Now try to re-navigate
  console.log('\n=== RE-NAVIGATION attempt ===');
  await page.goto(`${BASE}/#tutor`);
  await sleep(5000);
  await dismissOverlays(page);
  await dismissOverlays(page);
  await page.screenshot({ path: path.join(SCREENSHOTS, 'debug-2nd-tutor.png') });

  // What do we see?
  const state = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim().slice(0, 50)).filter(Boolean);
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4')).map(h => h.textContent?.trim());
    return { btns: btns.slice(0, 30), headings };
  });
  console.log(`Buttons: ${JSON.stringify(state.btns)}`);
  console.log(`Headings: ${JSON.stringify(state.headings)}`);

  // Click Simulatore again
  const simClicked = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Simulatore'));
    if (btn) { btn.click(); return true; }
    return false;
  });
  console.log(`Simulatore clicked: ${simClicked}`);
  await sleep(3000);
  await dismissOverlays(page);
  await page.screenshot({ path: path.join(SCREENSHOTS, 'debug-2nd-simulator.png') });

  // Check for volume buttons
  volBtns = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.filter(b => b.textContent?.includes('Volume') && b.textContent?.includes('esperiment'))
      .map(b => b.textContent?.trim().slice(0, 60));
  });
  console.log(`Volume buttons (2nd time): ${JSON.stringify(volBtns)}`);

  // If no volume buttons, what is there?
  if (volBtns.length === 0) {
    const allBtns = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim().slice(0, 60)).filter(t => t && t.length > 1);
    });
    console.log(`All buttons: ${JSON.stringify(allBtns)}`);

    // Check if we're still in canvas mode
    const dataTypes = await page.evaluate(() => {
      return [...new Set(Array.from(document.querySelectorAll('[data-type]')).map(e => e.getAttribute('data-type')))];
    });
    console.log(`data-types on page: ${JSON.stringify(dataTypes)}`);
  }

  await browser.close();
  console.log('\nDone!');
})();
