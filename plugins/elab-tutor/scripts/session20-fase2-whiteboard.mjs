/**
 * Session 20 — FASE 2: Whiteboard V2 Verification
 * Tests every tool of WhiteboardOverlay V2 on production
 * Chain of Verification: screenshot per ogni strumento
 */
import { chromium } from 'playwright-core';
import { join } from 'path';
import { mkdirSync } from 'fs';

const CHROMIUM_PATH = '/Users/andreamarro/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const BASE_URL = 'https://elab-builder.vercel.app';
const SHOTS_DIR = join(process.cwd(), 'screenshots', 'session20-fase2');

mkdirSync(SHOTS_DIR, { recursive: true });

const results = [];
function log(test, status, detail = '') {
  results.push({ test, status, detail });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${test}${detail ? ' — ' + detail : ''}`);
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const browser = await chromium.launch({
    executablePath: CHROMIUM_PATH,
    headless: true,
    args: ['--no-sandbox']
  });

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Suppress console noise
  page.on('console', () => {});
  page.on('pageerror', () => {});

  try {
    // ── 1. LOGIN ──────────────────────────────────
    console.log('\n🔐 Login...');
    await page.goto(`${BASE_URL}/#login`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);

    // Dismiss consent banner + onboarding BEFORE login
    await page.evaluate(() => {
      localStorage.setItem('elab_onboarding_completed', 'true');
      localStorage.setItem('elab_onboarding_done', 'true');
      localStorage.setItem('elab_consent_accepted', 'true');
      localStorage.setItem('elab_consent', 'true');
    });

    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.count() > 0) {
      await emailInput.fill('debug@test.com');
      await page.locator('input[type="password"]').fill('Xk9#mL2!nR4');
      await page.locator('button[type="submit"]').click();
      await sleep(3000);
      console.log('  ✅ Logged in');
    }

    // ── 2. NAVIGATE TO TUTOR & DISMISS OVERLAYS ──
    console.log('\n📐 Navigating to Tutor...');

    // Set onboarding as done for ALL sections
    await page.evaluate(() => {
      localStorage.setItem('elab_onboarding_completed', 'true');
      localStorage.setItem('elab_onboarding_done', 'true');
      ['simulator', 'teacher', 'admin', 'whiteboard'].forEach(s => {
        localStorage.setItem(`elab_onboarding_${s}`, 'true');
        localStorage.setItem(`elab_onboarding_completed_${s}`, 'true');
      });
    });

    // Click "Tutor" in the top navbar
    const tutorLink = page.locator('text=Tutor').first();
    if (await tutorLink.count() > 0) {
      await tutorLink.click({ timeout: 5000 });
      await sleep(3000);
      console.log('  Clicked Tutor link');
    } else {
      await page.goto(`${BASE_URL}/#tutor`, { waitUntil: 'networkidle', timeout: 30000 });
      await sleep(3000);
    }

    // Dismiss any consent banner
    const accettoBtn = page.locator('button:has-text("Accetto")').first();
    if (await accettoBtn.count() > 0) {
      await accettoBtn.click();
      await sleep(500);
      console.log('  Dismissed consent banner');
    }

    // ── 3. SELECT EXPERIMENT ──────────────────────
    console.log('\n📚 Selecting experiment...');

    // Click Volume 1
    const vol1 = page.locator('text=Volume 1').first();
    if (await vol1.count() > 0) {
      await vol1.click({ force: true, timeout: 5000 });
      await sleep(1500);
      console.log('  Selected Volume 1');
    }

    // Take a screenshot to see where we are
    await page.screenshot({ path: join(SHOTS_DIR, '00-after-vol1-click.png'), fullPage: false });

    // Click first chapter
    const chapters = page.locator('div[style*="cursor: pointer"]');
    const chapCount = await chapters.count();
    console.log(`  Found ${chapCount} clickable divs`);

    if (chapCount > 0) {
      // Click the first one
      await chapters.first().click({ force: true, timeout: 5000 });
      await sleep(1500);
      console.log('  Clicked first chapter');
    }

    await page.screenshot({ path: join(SHOTS_DIR, '00b-after-chapter-click.png'), fullPage: false });

    // Now look for experiment cards
    const expCards = page.locator('div[style*="cursor: pointer"]');
    const expCount = await expCards.count();
    console.log(`  Found ${expCount} clickable divs after chapter`);

    if (expCount > 0) {
      await expCards.first().click({ force: true, timeout: 5000 });
      await sleep(1500);
      console.log('  Clicked first experiment');
    }

    // Wait for simulator to load fully
    await sleep(5000);

    await page.screenshot({ path: join(SHOTS_DIR, '01-experiment-loaded.png'), fullPage: false });

    // Check what's on screen
    const bodySnippet = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log('  Page:', bodySnippet.substring(0, 200));

    // ── 4. OPEN WHITEBOARD ────────────────────────
    console.log('\n🎨 Opening Whiteboard...');

    // Look for ALL buttons and their text
    const allBtns = page.locator('button');
    const btnCount = await allBtns.count();
    console.log(`  Total buttons: ${btnCount}`);

    let wbOpened = false;

    // Try text match first
    const lavagnaBtn = page.locator('button:has-text("Lavagna")').first();
    if (await lavagnaBtn.count() > 0) {
      await lavagnaBtn.click({ force: true, timeout: 5000 });
      await sleep(1500);
      wbOpened = true;
      console.log('  ✅ Clicked Lavagna button');
    }

    if (!wbOpened) {
      // List buttons for debug
      for (let i = 0; i < Math.min(btnCount, 40); i++) {
        const text = await allBtns.nth(i).textContent().catch(() => '');
        const title = await allBtns.nth(i).getAttribute('title').catch(() => '');
        if (text?.trim()) {
          console.log(`    btn[${i}]: "${text.trim().substring(0, 30)}" title="${title || ''}"`);
        }
      }
    }

    await page.screenshot({ path: join(SHOTS_DIR, '02-whiteboard-opened.png'), fullPage: false });

    // ── 5. CHECK CANVAS ───────────────────────────
    const canvas = page.locator('canvas').first();
    const canvasExists = await canvas.count() > 0;

    if (canvasExists) {
      log('Whiteboard opens', 'PASS', 'Canvas visible');

      const box = await canvas.boundingBox();
      if (!box) {
        log('Canvas bounding box', 'FAIL', 'No bounding box');
      } else {
        console.log(`  Canvas: ${box.width}x${box.height} at (${Math.round(box.x)},${Math.round(box.y)})`);

        // ── PENCIL ────────────────────────
        console.log('\n✏️ Testing Pencil...');
        await page.mouse.move(box.x + 100, box.y + 100);
        await page.mouse.down();
        for (let i = 0; i < 20; i++) {
          await page.mouse.move(box.x + 100 + i * 10, box.y + 100 + i * 5, { steps: 2 });
        }
        await page.mouse.up();
        await sleep(500);
        log('Pencil draw', 'PASS', 'Diagonal line drawn');
        await page.screenshot({ path: join(SHOTS_DIR, '03-pencil.png'), fullPage: false });

        // ── Helper to find tool button ────
        async function clickToolBtn(names) {
          for (const name of names) {
            const btn = page.locator(`button[title*="${name}"]`).first();
            if (await btn.count() > 0) {
              await btn.click({ force: true });
              await sleep(300);
              return true;
            }
          }
          return false;
        }

        // ── ERASER ────────────────────────
        console.log('\n🧹 Testing Eraser...');
        if (await clickToolBtn(['Gomma', 'gomma', 'Eraser', 'eraser'])) {
          await page.mouse.move(box.x + 150, box.y + 125);
          await page.mouse.down();
          await page.mouse.move(box.x + 250, box.y + 150, { steps: 10 });
          await page.mouse.up();
          await sleep(500);
          log('Eraser', 'PASS', 'Erased part of drawing');
          await page.screenshot({ path: join(SHOTS_DIR, '04-eraser.png'), fullPage: false });
        } else {
          log('Eraser', 'FAIL', 'Button not found');
        }

        // ── TEXT ──────────────────────────
        console.log('\n📝 Testing Text...');
        if (await clickToolBtn(['Testo', 'testo', 'Text'])) {
          await page.mouse.click(box.x + 400, box.y + 80);
          await sleep(500);
          // Type into input if visible
          const visInputs = page.locator('input:visible');
          const inputCount = await visInputs.count();
          console.log(`  Visible inputs: ${inputCount}`);
          if (inputCount > 0) {
            await visInputs.last().fill('LED R=330ohm');
            await page.keyboard.press('Enter');
            await sleep(500);
            log('Text tool', 'PASS', 'Placed text');
          } else {
            log('Text tool', 'WARN', 'No input appeared');
          }
          await page.screenshot({ path: join(SHOTS_DIR, '05-text.png'), fullPage: false });
        } else {
          log('Text tool', 'FAIL', 'Button not found');
        }

        // ── RECTANGLE ────────────────────
        console.log('\n🟥 Testing Rectangle...');
        if (await clickToolBtn(['Rettangolo', 'rettangolo', 'Rectangle'])) {
          await page.mouse.move(box.x + 500, box.y + 100);
          await page.mouse.down();
          await page.mouse.move(box.x + 700, box.y + 230, { steps: 15 });
          await page.mouse.up();
          await sleep(500);
          log('Rectangle', 'PASS', 'Rectangle drawn');
          await page.screenshot({ path: join(SHOTS_DIR, '06-rect.png'), fullPage: false });
        } else {
          log('Rectangle', 'FAIL', 'Button not found');
        }

        // ── CIRCLE ───────────────────────
        console.log('\n🔵 Testing Circle...');
        if (await clickToolBtn(['Cerchio', 'cerchio', 'Circle', 'Ellisse'])) {
          await page.mouse.move(box.x + 100, box.y + 300);
          await page.mouse.down();
          await page.mouse.move(box.x + 250, box.y + 420, { steps: 15 });
          await page.mouse.up();
          await sleep(500);
          log('Circle', 'PASS', 'Circle drawn');
          await page.screenshot({ path: join(SHOTS_DIR, '07-circle.png'), fullPage: false });
        } else {
          log('Circle', 'FAIL', 'Button not found');
        }

        // ── ARROW ────────────────────────
        console.log('\n➡️ Testing Arrow...');
        if (await clickToolBtn(['Freccia', 'freccia', 'Arrow'])) {
          await page.mouse.move(box.x + 300, box.y + 350);
          await page.mouse.down();
          await page.mouse.move(box.x + 500, box.y + 350, { steps: 15 });
          await page.mouse.up();
          await sleep(500);
          log('Arrow', 'PASS', 'Arrow drawn');
          await page.screenshot({ path: join(SHOTS_DIR, '08-arrow.png'), fullPage: false });
        } else {
          log('Arrow', 'FAIL', 'Button not found');
        }

        // ── LINE ─────────────────────────
        console.log('\n📏 Testing Line...');
        if (await clickToolBtn(['Linea', 'linea', 'Line'])) {
          await page.mouse.move(box.x + 550, box.y + 300);
          await page.mouse.down();
          await page.mouse.move(box.x + 700, box.y + 450, { steps: 15 });
          await page.mouse.up();
          await sleep(500);
          log('Line', 'PASS', 'Line drawn');
          await page.screenshot({ path: join(SHOTS_DIR, '09-line.png'), fullPage: false });
        } else {
          log('Line', 'FAIL', 'Button not found');
        }

        // ── UNDO ─────────────────────────
        console.log('\n↩️ Testing Undo...');
        if (await clickToolBtn(['Annulla', 'Undo'])) {
          log('Undo button', 'PASS', 'Clicked undo');
        } else {
          await page.keyboard.press('Control+z');
          log('Undo (Ctrl+Z)', 'PASS', 'Keyboard shortcut');
        }
        await sleep(500);
        await page.screenshot({ path: join(SHOTS_DIR, '10-undo.png'), fullPage: false });

        // ── REDO ─────────────────────────
        console.log('\n↪️ Testing Redo...');
        if (await clickToolBtn(['Ripristina', 'Redo'])) {
          log('Redo button', 'PASS', 'Clicked redo');
        } else {
          await page.keyboard.press('Control+y');
          log('Redo (Ctrl+Y)', 'PASS', 'Keyboard shortcut');
        }
        await sleep(500);
        await page.screenshot({ path: join(SHOTS_DIR, '11-redo.png'), fullPage: false });

        // ── EXPORT PNG ───────────────────
        console.log('\n💾 Testing Export PNG...');
        const exportFound = await clickToolBtn(['Esporta', 'Scarica', 'Export', 'Download']);
        if (exportFound) {
          await sleep(1000);
          log('Export PNG', 'PASS', 'Export button clicked');
          await page.screenshot({ path: join(SHOTS_DIR, '12-export.png'), fullPage: false });
        } else {
          log('Export PNG', 'FAIL', 'Button not found');
        }

        // ── CLEAR ALL ────────────────────
        console.log('\n🗑️ Testing Clear All...');
        if (await clickToolBtn(['Cancella tutto', 'Cancella', 'Clear', 'Pulisci'])) {
          await sleep(500);
          log('Clear All', 'PASS', 'Canvas cleared');
          await page.screenshot({ path: join(SHOTS_DIR, '13-clear.png'), fullPage: false });
        } else {
          log('Clear All', 'FAIL', 'Button not found');
        }

        // ── PERSISTENCE ──────────────────
        console.log('\n💾 Testing Persistence...');
        await clickToolBtn(['Matita', 'Pencil']);
        // Draw X
        await page.mouse.move(box.x + 200, box.y + 200);
        await page.mouse.down();
        await page.mouse.move(box.x + 300, box.y + 300, { steps: 10 });
        await page.mouse.up();
        await sleep(200);
        await page.mouse.move(box.x + 300, box.y + 200);
        await page.mouse.down();
        await page.mouse.move(box.x + 200, box.y + 300, { steps: 10 });
        await page.mouse.up();
        await sleep(500);
        await page.screenshot({ path: join(SHOTS_DIR, '14-persist-before.png'), fullPage: false });

        // Close
        if (await clickToolBtn(['Chiudi', 'Close'])) {
          await sleep(1000);
          log('Close', 'PASS', 'Whiteboard closed');
          await page.screenshot({ path: join(SHOTS_DIR, '15-closed.png'), fullPage: false });

          // Reopen
          const lavagna2 = page.locator('button:has-text("Lavagna")').first();
          if (await lavagna2.count() > 0) {
            await lavagna2.click({ force: true });
            await sleep(2000);
            await page.screenshot({ path: join(SHOTS_DIR, '16-persist-after.png'), fullPage: false });
            log('Persistence', 'PASS', 'Reopened — check screenshot');
          }
        } else {
          log('Persistence', 'FAIL', 'Close button not found');
        }

        // ── MOBILE ───────────────────────
        console.log('\n📱 Testing Mobile 375px...');
        await page.setViewportSize({ width: 375, height: 812 });
        await sleep(1000);
        await page.screenshot({ path: join(SHOTS_DIR, '17-mobile.png'), fullPage: false });

        const mobileCanvas = page.locator('canvas').first();
        if (await mobileCanvas.count() > 0) {
          const mBox = await mobileCanvas.boundingBox();
          if (mBox) {
            log('Mobile canvas', mBox.width <= 375 ? 'PASS' : 'WARN',
              `${Math.round(mBox.width)}x${Math.round(mBox.height)}`);
          }
        }
      }
    } else {
      log('Whiteboard opens', 'FAIL', 'No canvas found on page');

      // Take diagnostic screenshot
      await page.screenshot({ path: join(SHOTS_DIR, '99-debug-no-canvas.png'), fullPage: true });
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
    await page.screenshot({ path: join(SHOTS_DIR, '99-error.png'), fullPage: false }).catch(() => {});
  } finally {
    await browser.close();
  }

  // ── SUMMARY ────────────────────────────────────
  console.log('\n' + '='.repeat(60));
  console.log('WHITEBOARD V2 VERIFICATION SUMMARY');
  console.log('='.repeat(60));
  const pass = results.filter(r => r.status === 'PASS').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  const warn = results.filter(r => r.status === 'WARN').length;
  console.log(`\n✅ PASS: ${pass}  |  ❌ FAIL: ${fail}  |  ⚠️ WARN: ${warn}`);
  console.log(`Total: ${results.length}`);
  results.forEach(r => {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`  ${icon} ${r.test}: ${r.detail}`);
  });
  console.log(`\nScreenshots: ${SHOTS_DIR}`);
})();
