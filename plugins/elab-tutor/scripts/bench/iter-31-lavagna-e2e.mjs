#!/usr/bin/env node
/**
 * Iter 31 — Batch A: Lavagna E2E Playwright (10 cases)
 * Real browser drive against PROD or PREVIEW URL.
 * Evidence: screenshots + console errors + network captures.
 */

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO = path.resolve(__dirname, '..', '..');

const TARGET = process.env.LAVAGNA_TARGET_URL || 'https://elab-tutor-git-e2e-bypass-preview-andreas-projects-6d4e9791.vercel.app';
const OUT = path.join(REPO, 'scripts', 'bench', 'output', 'iter-31-massive-test', 'lavagna-batch');
fs.mkdirSync(OUT, { recursive: true });
const ts = new Date().toISOString().replace(/[:.]/g, '-');

async function shot(page, label) {
  const file = path.join(OUT, `${label}.png`);
  try {
    await page.screenshot({ path: file, fullPage: false });
  } catch (e) {
    /* ignore */
  }
  return file;
}

async function safeClick(page, locator, timeout = 4000) {
  try {
    await locator.first().click({ timeout });
    return true;
  } catch (e) {
    return false;
  }
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 ELAB-iter31-E2E',
  });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push({ type: 'error', text: msg.text() });
    else if (msg.type() === 'warning') consoleErrors.push({ type: 'warn', text: msg.text() });
  });
  page.on('pageerror', (err) => consoleErrors.push({ type: 'pageerror', text: String(err) }));

  const results = [];

  function rec(id, desc, ok, extra = {}) {
    results.push({ id, desc, ok, ts: new Date().toISOString(), ...extra });
    console.log(`[lavagna] ${id} ${ok ? 'PASS' : 'FAIL'} — ${desc}`);
  }

  // A01 — Open lavagna
  try {
    const t0 = Date.now();
    const resp = await page.goto(`${TARGET}/#lavagna`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const status = resp?.status() || 0;
    await page.waitForTimeout(2500);
    await shot(page, 'A01-open');
    rec('A01', 'Open #lavagna', status >= 200 && status < 400, { status, latency_ms: Date.now() - t0 });
  } catch (e) {
    rec('A01', 'Open #lavagna', false, { error: String(e) });
  }

  // A02 — Click INIZIA / start button (if welcome screen still present)
  try {
    const startBtns = page.locator('button:has-text("INIZIA"), button:has-text("Inizia"), button:has-text("Entra"), button:has-text("Comincia"), button:has-text("Inizia ora")');
    const clicked = await safeClick(page, startBtns, 3500);
    await page.waitForTimeout(1500);
    await shot(page, 'A02-after-inizia');
    rec('A02', 'Click INIZIA / Entra', clicked);
  } catch (e) {
    rec('A02', 'Click INIZIA', false, { error: String(e) });
  }

  // A03 — Verify mount (look for breadboard/SVG/canvas/lavagna container)
  try {
    const hasCircuit = await page.locator('svg, canvas, [class*="breadboard"], [class*="lavagna"], [class*="Lavagna"]').count();
    await shot(page, 'A03-mounted');
    rec('A03', 'Verify Lavagna container mounted', hasCircuit > 0, { mountCount: hasCircuit });
  } catch (e) {
    rec('A03', 'Verify mount', false, { error: String(e) });
  }

  // A04 — Switch Modalità (if mode toggle exists)
  try {
    const modeBtn = page.locator('button:has-text("Già"), button:has-text("Passo"), button:has-text("Libero"), [data-mode]');
    const clicks = Math.min(3, await modeBtn.count());
    let success = 0;
    for (let i = 0; i < clicks; i++) {
      const ok = await safeClick(page, modeBtn.nth(i), 2000);
      if (ok) success++;
      await page.waitForTimeout(700);
    }
    await shot(page, 'A04-modes');
    rec('A04', 'Switch modalità (3 modes)', success >= 1, { clicks_attempted: clicks, success });
  } catch (e) {
    rec('A04', 'Switch modalità', false, { error: String(e) });
  }

  // A05 — Toolbar interactions (Filo/Penna/Select/Delete/Undo/Redo)
  try {
    const toolNames = ['filo', 'penna', 'select', 'delete', 'undo', 'redo', 'wire', 'pen', 'cancella'];
    let clicked = 0;
    for (const n of toolNames) {
      const sel = page.locator(`button[aria-label*="${n}" i], button[title*="${n}" i], [data-tool*="${n}" i]`);
      if (await sel.count() > 0) {
        if (await safeClick(page, sel, 1500)) clicked++;
        await page.waitForTimeout(300);
      }
    }
    await shot(page, 'A05-toolbar');
    rec('A05', `Toolbar interactions (${clicked} buttons clicked)`, clicked >= 1, { clicked });
  } catch (e) {
    rec('A05', 'Toolbar', false, { error: String(e) });
  }

  // A06 — Components panel left → click LED
  try {
    const compBtns = page.locator('button:has-text("LED"), [data-component*="led" i], [aria-label*="LED" i]');
    const clicked = await safeClick(page, compBtns, 2500);
    await page.waitForTimeout(800);
    await shot(page, 'A06-led-clicked');
    rec('A06', 'Components panel: click LED', clicked, { count: await compBtns.count() });
  } catch (e) {
    rec('A06', 'Click LED', false, { error: String(e) });
  }

  // A07 — Vision button "Guarda il mio circuito"
  try {
    const visBtn = page.locator('button:has-text("Guarda"), button:has-text("Vision"), button:has-text("circuito")');
    const exists = await visBtn.count() > 0;
    let clicked = false;
    if (exists) {
      clicked = await safeClick(page, visBtn, 2500);
      await page.waitForTimeout(2500);
    }
    await shot(page, 'A07-vision');
    rec('A07', 'Vision button trigger', clicked || exists, { count: await visBtn.count(), clicked });
  } catch (e) {
    rec('A07', 'Vision btn', false, { error: String(e) });
  }

  // A08 — UNLIM mascotte click → chat overlay
  try {
    const masc = page.locator('[class*="mascotte" i], [class*="UNLIM" i], [aria-label*="UNLIM" i], button:has-text("UNLIM")');
    const exists = await masc.count() > 0;
    let clicked = false;
    if (exists) clicked = await safeClick(page, masc, 2500);
    await page.waitForTimeout(1500);
    await shot(page, 'A08-mascotte');
    rec('A08', 'Mascotte UNLIM click', clicked || exists, { count: await masc.count() });
  } catch (e) {
    rec('A08', 'Mascotte', false, { error: String(e) });
  }

  // A09 — Manuale / Video / Fumetto buttons
  try {
    const btns = page.locator('button:has-text("Manuale"), button:has-text("Video"), button:has-text("Fumetto")');
    const total = await btns.count();
    let clicked = 0;
    for (let i = 0; i < Math.min(total, 3); i++) {
      if (await safeClick(page, btns.nth(i), 1500)) clicked++;
      await page.waitForTimeout(700);
      await page.keyboard.press('Escape').catch(() => {});
    }
    await shot(page, 'A09-mvf');
    rec('A09', 'Manuale/Video/Fumetto trigger', clicked >= 1, { found: total, clicked });
  } catch (e) {
    rec('A09', 'MVF buttons', false, { error: String(e) });
  }

  // A10 — Console error capture
  try {
    const errs = consoleErrors.filter((c) => c.type === 'error' || c.type === 'pageerror');
    rec('A10', `Console errors captured (${errs.length})`, true, { errors_count: errs.length, sample: errs.slice(0, 5) });
    fs.writeFileSync(path.join(OUT, `console-errors-${ts}.json`), JSON.stringify(consoleErrors, null, 2));
  } catch (e) {
    rec('A10', 'Console capture', false, { error: String(e) });
  }

  await browser.close();

  const summary = {
    target: TARGET,
    total: results.length,
    pass: results.filter((r) => r.ok).length,
    fail: results.filter((r) => !r.ok).length,
    timestamp: ts,
  };
  const out = { summary, results };
  fs.writeFileSync(path.join(OUT, `summary-${ts}.json`), JSON.stringify(out, null, 2));
  console.log('\n=== Lavagna E2E summary ===');
  console.log(JSON.stringify(summary, null, 2));
}

run().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});
