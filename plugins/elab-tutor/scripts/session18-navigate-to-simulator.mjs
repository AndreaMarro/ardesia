/**
 * Session 18 — Reusable navigation helper
 * Login → Tutor → Simulatore → Volume → Chapter → Experiment → Canvas
 */
import { chromium } from 'playwright-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const SCREENSHOTS = path.join(__dirname, '..', 'screenshots', 'session18');
const BASE = 'https://elab-builder.vercel.app';
const CREDS = { email: 'debug@test.com', password: 'Xk9#mL2!nR4' };

export function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/** Dismiss ALL overlays using JS clicks */
export async function dismissOverlays(page) {
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
    // X buttons
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

/**
 * Login and get to the Tutor with overlays dismissed
 */
export async function loginToTutor(page) {
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

/**
 * From tutor home, navigate to the Simulatore ExperimentPicker
 */
export async function goToSimulator(page) {
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Simulatore'));
    if (btn) btn.click();
  });
  await sleep(3000);
  await dismissOverlays(page);
}

/**
 * From the Volume picker, select a volume (1, 2, or 3)
 * This transitions from "volumes" view to "chapters" view
 */
export async function selectVolume(page, volNum) {
  const result = await page.evaluate((v) => {
    // The volume buttons have text like "📗Volume 1 - Le Basi..."
    // They're inside the experiment picker, not the sidebar
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

/**
 * From the Chapters view, select a chapter by its name
 * This transitions from "chapters" view to "experiments" view
 */
export async function selectChapter(page, chapterText) {
  const result = await page.evaluate((ct) => {
    // Chapter buttons contain "Capitolo X - ..." and "N esp."
    // But NOT the back button "Volumi"
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

/**
 * From the Experiments view, select an experiment by title text
 * If no title given, selects the first experiment
 * @param {string} mode - 'montato' or 'monta tu'
 */
export async function selectExperiment(page, expTitle = null, mode = 'montato') {
  // First, set the mode toggle if needed
  if (mode.toLowerCase().includes('monta tu')) {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent?.includes('Monta tu'));
      if (btn) btn.click();
    });
    await sleep(500);
  }

  // Now click the experiment
  const result = await page.evaluate((title) => {
    const btns = Array.from(document.querySelectorAll('button'));
    if (title) {
      // Find by title
      const expBtn = btns.find(b => b.textContent?.includes(title) && !b.textContent?.includes('Capitoli'));
      if (expBtn) { expBtn.click(); return expBtn.textContent?.trim().slice(0, 80); }
    }
    // Find first experiment card (has star rating ★)
    const expBtn = btns.find(b => {
      const t = b.textContent || '';
      return t.includes('★') && !t.includes('Volumi') && !t.includes('Capitoli');
    });
    if (expBtn) { expBtn.click(); return expBtn.textContent?.trim().slice(0, 80); }
    return null;
  }, expTitle);

  await sleep(5000); // Wait for simulator canvas to load
  await dismissOverlays(page);
  return result;
}

/**
 * Full navigation: login → tutor → simulatore → volume → chapter → experiment
 */
export async function navigateToExperiment(opts = {}) {
  const {
    volume = 1,
    chapter = 'Capitolo 6',
    experiment = null,
    mode = 'montato',
    headless = true,
  } = opts;

  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('console', () => {});

  await loginToTutor(page);
  await goToSimulator(page);
  const vol = await selectVolume(page, volume);
  console.log(`  Volume: ${vol || 'NOT FOUND'}`);
  const chap = await selectChapter(page, chapter);
  console.log(`  Chapter: ${chap || 'NOT FOUND'}`);
  const exp = await selectExperiment(page, experiment, mode);
  console.log(`  Experiment: ${exp || 'NOT FOUND'}`);

  return { browser, context, page };
}

// === SELF-TEST ===
if (process.argv[1]?.includes('navigate-to-simulator')) {
  (async () => {
    console.log('=== Testing navigation to v1-cap6-esp1 ===\n');
    const { browser, page } = await navigateToExperiment({
      volume: 1,
      chapter: 'Capitolo 6',
      mode: 'montato'
    });

    await page.screenshot({ path: path.join(SCREENSHOTS, 'test-nav-final.png') });

    const state = await page.evaluate(() => {
      return {
        hash: window.location.hash,
        svgCount: document.querySelectorAll('svg').length,
        draggables: document.querySelectorAll('[draggable="true"]').length,
        svgRects: document.querySelectorAll('svg rect').length,
        svgCircles: document.querySelectorAll('svg circle').length,
        svgGroups: document.querySelectorAll('svg g').length,
        dataTypes: [...new Set(Array.from(document.querySelectorAll('[data-type]')).map(e => e.getAttribute('data-type')))],
        btns: Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim().slice(0,50)).filter(Boolean).slice(0,30),
      };
    });
    console.log(`\nFinal state:`);
    console.log(`  SVG: ${state.svgCount}, Rects: ${state.svgRects}, Circles: ${state.svgCircles}, Groups: ${state.svgGroups}`);
    console.log(`  Draggables: ${state.draggables}`);
    console.log(`  data-types: ${JSON.stringify(state.dataTypes)}`);
    console.log(`  Buttons: ${state.btns.join(' | ')}`);

    await browser.close();
    console.log('\nDone!');
  })();
}
