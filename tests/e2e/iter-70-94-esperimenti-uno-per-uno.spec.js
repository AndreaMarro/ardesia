/**
 * iter-70-94-esperimenti-uno-per-uno.spec.js
 *
 * Iter 70 Team B — AUDIT 79 esperimenti UNO PER UNO su prod
 * (Andrea iter 21 mandate carryover NEVER executed + May 13 verbatim
 * "Diciamo che non funziona affatto")
 *
 * Spec audits ALL experiments from:
 *   src/data/experiments-vol1.js  (38 experiments)
 *   src/data/experiments-vol2.js  (27 experiments)
 *   src/data/experiments-vol3.js  (14 experiments)
 *   TOTAL: 79 experiments
 *
 * NOTE: The task brief says "94" but the canonical source data contains
 * 79 experiments. This spec audits all 79 that actually exist.
 *
 * Per experiment:
 *   1. navigate https://www.elabtutor.school/#lavagna
 *   2. bypass license gate via seedSprintUBypass (addInitScript before goto)
 *   3. dismiss ExperimentPicker if auto-opens
 *   4. mountExperiment(id) via window.__ELAB_API
 *   5. wait for render (2.5s settle)
 *   6. capture DOM diagnostics:
 *        - __ELAB_API present + mountExperiment callable
 *        - circuit component count (data-component-id nodes)
 *        - circuit connection count from getCircuitState()
 *        - SVG presence
 *        - console errors + page errors
 *   7. screenshot to tests/e2e/iter-70-screenshots/{id}.png
 *   8. severity classification:
 *        P0 BROKEN  — API missing OR mount fails OR 0 circuit components rendered
 *        P1 PARTIAL — components render but connection count is 0 (wires missing)
 *                      OR component count < 50% of expected
 *        P2 OK      — components render + connections > 0 (or 0-connection
 *                      experiment where connections array is empty by design)
 *
 * Output:
 *   - Individual screenshots in tests/e2e/iter-70-screenshots/
 *   - Aggregate JSONL in docs/audits/iter-70-94-esperimenti-results.jsonl
 *   - Summary JSON in docs/audits/iter-70-94-esperimenti-summary.json
 *
 * Run:
 *   npx playwright test tests/e2e/iter-70-94-esperimenti-uno-per-uno.spec.js \
 *     --config tests/e2e/sprint-u.config.js \
 *     --workers=1 --timeout=45000
 *
 * (c) Andrea Marro 2026-05-19 — ELAB Tutor — iter 70 Team B
 */

import { test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedSprintUBypass } from './helpers/sprint-u-auth.js';
import { extractWireCount } from './helpers/wire-count.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const SCREENSHOTS_DIR = path.join(REPO_ROOT, 'tests', 'e2e', 'iter-70-screenshots');
const RESULTS_JSONL = path.join(REPO_ROOT, 'docs', 'audits', 'iter-70-94-esperimenti-results.jsonl');
const SUMMARY_JSON = path.join(REPO_ROOT, 'docs', 'audits', 'iter-70-94-esperimenti-summary.json');

// Ensure output dirs exist
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
fs.mkdirSync(path.join(REPO_ROOT, 'docs', 'audits'), { recursive: true });

const PROD_URL = (process.env.ELAB_PROD_URL || 'https://www.elabtutor.school').replace(/\/$/, '');
const SETTLE_MS = parseInt(process.env.SETTLE_MS || '2500', 10);

// ── Canonical experiment list ──────────────────────────────────────────────
// Hardcoded from src/data/experiments-vol*.js to avoid dynamic import issues
// in the Playwright worker context. Verified 2026-05-19.
const ALL_EXPERIMENTS = [
  // ── Volume 1 (38 experiments) ─────────────────────────────────────────
  { id: 'v1-cap6-esp1', vol: 1, cap: 6, expectedComponents: 4, expectedConnections: 6 },
  { id: 'v1-cap6-esp2', vol: 1, cap: 6, expectedComponents: 3, expectedConnections: 5 },
  { id: 'v1-cap6-esp3', vol: 1, cap: 6, expectedComponents: 4, expectedConnections: 6 },
  { id: 'v1-cap7-esp1', vol: 1, cap: 7, expectedComponents: 4, expectedConnections: 5 },
  { id: 'v1-cap7-esp2', vol: 1, cap: 7, expectedComponents: 4, expectedConnections: 5 },
  { id: 'v1-cap7-esp3', vol: 1, cap: 7, expectedComponents: 4, expectedConnections: 5 },
  { id: 'v1-cap7-esp4', vol: 1, cap: 7, expectedComponents: 5, expectedConnections: 6 },
  { id: 'v1-cap7-esp5', vol: 1, cap: 7, expectedComponents: 6, expectedConnections: 7 },
  { id: 'v1-cap7-esp6', vol: 1, cap: 7, expectedComponents: 6, expectedConnections: 7 },
  { id: 'v1-cap8-esp1', vol: 1, cap: 8, expectedComponents: 4, expectedConnections: 5 },
  { id: 'v1-cap8-esp2', vol: 1, cap: 8, expectedComponents: 4, expectedConnections: 5 },
  { id: 'v1-cap8-esp3', vol: 1, cap: 8, expectedComponents: 4, expectedConnections: 5 },
  { id: 'v1-cap8-esp4', vol: 1, cap: 8, expectedComponents: 4, expectedConnections: 5 },
  { id: 'v1-cap8-esp5', vol: 1, cap: 8, expectedComponents: 4, expectedConnections: 5 },
  { id: 'v1-cap9-esp1', vol: 1, cap: 9, expectedComponents: 5, expectedConnections: 6 },
  { id: 'v1-cap9-esp2', vol: 1, cap: 9, expectedComponents: 5, expectedConnections: 6 },
  { id: 'v1-cap9-esp3', vol: 1, cap: 9, expectedComponents: 5, expectedConnections: 6 },
  { id: 'v1-cap9-esp4', vol: 1, cap: 9, expectedComponents: 5, expectedConnections: 6 },
  { id: 'v1-cap9-esp5', vol: 1, cap: 9, expectedComponents: 5, expectedConnections: 6 },
  { id: 'v1-cap9-esp6', vol: 1, cap: 9, expectedComponents: 5, expectedConnections: 6 },
  { id: 'v1-cap9-esp7', vol: 1, cap: 9, expectedComponents: 5, expectedConnections: 6 },
  { id: 'v1-cap9-esp8', vol: 1, cap: 9, expectedComponents: 5, expectedConnections: 6 },
  { id: 'v1-cap9-esp9', vol: 1, cap: 9, expectedComponents: 6, expectedConnections: 7 },
  { id: 'v1-cap10-esp1', vol: 1, cap: 10, expectedComponents: 4, expectedConnections: 5 },
  { id: 'v1-cap10-esp2', vol: 1, cap: 10, expectedComponents: 4, expectedConnections: 5 },
  { id: 'v1-cap10-esp3', vol: 1, cap: 10, expectedComponents: 4, expectedConnections: 5 },
  { id: 'v1-cap10-esp4', vol: 1, cap: 10, expectedComponents: 4, expectedConnections: 5 },
  { id: 'v1-cap10-esp5', vol: 1, cap: 10, expectedComponents: 4, expectedConnections: 5 },
  { id: 'v1-cap10-esp6', vol: 1, cap: 10, expectedComponents: 4, expectedConnections: 5 },
  { id: 'v1-cap11-esp1', vol: 1, cap: 11, expectedComponents: 4, expectedConnections: 5 },
  { id: 'v1-cap11-esp2', vol: 1, cap: 11, expectedComponents: 4, expectedConnections: 5 },
  { id: 'v1-cap12-esp1', vol: 1, cap: 12, expectedComponents: 4, expectedConnections: 5 },
  { id: 'v1-cap12-esp2', vol: 1, cap: 12, expectedComponents: 4, expectedConnections: 5 },
  { id: 'v1-cap12-esp3', vol: 1, cap: 12, expectedComponents: 4, expectedConnections: 5 },
  { id: 'v1-cap12-esp4', vol: 1, cap: 12, expectedComponents: 4, expectedConnections: 5 },
  { id: 'v1-cap13-esp1', vol: 1, cap: 13, expectedComponents: 4, expectedConnections: 5 },
  { id: 'v1-cap13-esp2', vol: 1, cap: 13, expectedComponents: 4, expectedConnections: 5 },
  { id: 'v1-cap14-esp1', vol: 1, cap: 14, expectedComponents: 6, expectedConnections: 8 },

  // ── Volume 2 (27 experiments) ─────────────────────────────────────────
  { id: 'v2-cap3-esp1', vol: 2, cap: 3, expectedComponents: 2, expectedConnections: 0 },
  { id: 'v2-cap3-esp2', vol: 2, cap: 3, expectedComponents: 2, expectedConnections: 0 },
  { id: 'v2-cap3-esp3', vol: 2, cap: 3, expectedComponents: 2, expectedConnections: 0 },
  { id: 'v2-cap3-esp4', vol: 2, cap: 3, expectedComponents: 4, expectedConnections: 2 },
  { id: 'v2-cap4-esp1', vol: 2, cap: 4, expectedComponents: 4, expectedConnections: 2 },
  { id: 'v2-cap4-esp2', vol: 2, cap: 4, expectedComponents: 5, expectedConnections: 3 },
  { id: 'v2-cap4-esp3', vol: 2, cap: 4, expectedComponents: 5, expectedConnections: 3 },
  { id: 'v2-cap5-esp1', vol: 2, cap: 5, expectedComponents: 3, expectedConnections: 0 },
  { id: 'v2-cap5-esp2', vol: 2, cap: 5, expectedComponents: 3, expectedConnections: 0 },
  { id: 'v2-cap6-esp1', vol: 2, cap: 6, expectedComponents: 4, expectedConnections: 5 },
  { id: 'v2-cap6-esp2', vol: 2, cap: 6, expectedComponents: 4, expectedConnections: 5 },
  { id: 'v2-cap6-esp3', vol: 2, cap: 6, expectedComponents: 4, expectedConnections: 5 },
  { id: 'v2-cap6-esp4', vol: 2, cap: 6, expectedComponents: 5, expectedConnections: 6 },
  { id: 'v2-cap7-esp1', vol: 2, cap: 7, expectedComponents: 5, expectedConnections: 6 },
  { id: 'v2-cap7-esp2', vol: 2, cap: 7, expectedComponents: 5, expectedConnections: 6 },
  { id: 'v2-cap7-esp3', vol: 2, cap: 7, expectedComponents: 5, expectedConnections: 6 },
  { id: 'v2-cap7-esp4', vol: 2, cap: 7, expectedComponents: 5, expectedConnections: 6 },
  { id: 'v2-cap8-esp1', vol: 2, cap: 8, expectedComponents: 5, expectedConnections: 5 },
  { id: 'v2-cap8-esp2', vol: 2, cap: 8, expectedComponents: 5, expectedConnections: 5 },
  { id: 'v2-cap8-esp3', vol: 2, cap: 8, expectedComponents: 5, expectedConnections: 5 },
  { id: 'v2-cap9-esp1', vol: 2, cap: 9, expectedComponents: 5, expectedConnections: 5 },
  { id: 'v2-cap9-esp2', vol: 2, cap: 9, expectedComponents: 5, expectedConnections: 5 },
  { id: 'v2-cap10-esp1', vol: 2, cap: 10, expectedComponents: 5, expectedConnections: 5 },
  { id: 'v2-cap10-esp2', vol: 2, cap: 10, expectedComponents: 5, expectedConnections: 5 },
  { id: 'v2-cap10-esp3', vol: 2, cap: 10, expectedComponents: 5, expectedConnections: 5 },
  { id: 'v2-cap10-esp4', vol: 2, cap: 10, expectedComponents: 5, expectedConnections: 5 },
  { id: 'v2-cap12-esp1', vol: 2, cap: 12, expectedComponents: 6, expectedConnections: 6 },

  // ── Volume 3 (14 experiments) ─────────────────────────────────────────
  { id: 'v3-cap5-esp1', vol: 3, cap: 5, expectedComponents: 4, expectedConnections: 0 },
  { id: 'v3-cap5-esp2', vol: 3, cap: 5, expectedComponents: 4, expectedConnections: 0 },
  { id: 'v3-cap6-esp1', vol: 3, cap: 6, expectedComponents: 5, expectedConnections: 3 },
  { id: 'v3-cap6-esp2', vol: 3, cap: 6, expectedComponents: 5, expectedConnections: 3 },
  { id: 'v3-cap6-morse', vol: 3, cap: 6, expectedComponents: 4, expectedConnections: 2 },
  { id: 'v3-cap6-esp4', vol: 3, cap: 6, expectedComponents: 5, expectedConnections: 3 },
  { id: 'v3-cap6-semaforo', vol: 3, cap: 6, expectedComponents: 7, expectedConnections: 5 },
  { id: 'v3-cap7-esp1', vol: 3, cap: 7, expectedComponents: 5, expectedConnections: 3 },
  { id: 'v3-cap7-esp2', vol: 3, cap: 7, expectedComponents: 5, expectedConnections: 3 },
  { id: 'v3-cap7-esp3', vol: 3, cap: 7, expectedComponents: 5, expectedConnections: 3 },
  { id: 'v3-cap7-esp6', vol: 3, cap: 7, expectedComponents: 5, expectedConnections: 3 },
  { id: 'v3-cap8-esp1', vol: 3, cap: 8, expectedComponents: 5, expectedConnections: 3 },
  { id: 'v3-cap8-esp2', vol: 3, cap: 8, expectedComponents: 5, expectedConnections: 3 },
  { id: 'v3-cap8-esp3', vol: 3, cap: 8, expectedComponents: 5, expectedConnections: 3 },
];

// ── Init results JSONL ─────────────────────────────────────────────────────
fs.writeFileSync(
  RESULTS_JSONL,
  JSON.stringify({
    _meta: 'iter-70-94-esperimenti-audit',
    startedAt: new Date().toISOString(),
    prodUrl: PROD_URL,
    totalExpected: ALL_EXPERIMENTS.length,
  }) + '\n',
);

function appendResult(record) {
  fs.appendFileSync(RESULTS_JSONL, JSON.stringify(record) + '\n');
}

// ── Shared results accumulator for afterAll ────────────────────────────────
const sharedResults = [];

// ── Per-experiment probe function ─────────────────────────────────────────
async function probeExperiment(page, expId, consoleErrors, pageErrors) {
  // Mount via __ELAB_API
  const mountResult = await page.evaluate(async (id) => {
    const api = window.__ELAB_API;
    if (!api) return { apiReady: false, mounted: false, mountError: 'no __ELAB_API on window' };
    if (typeof api.mountExperiment !== 'function') {
      return { apiReady: true, mounted: false, mountError: 'mountExperiment not a function' };
    }
    let mounted = false;
    let mountError = null;
    try {
      const result = await api.mountExperiment(id);
      mounted = result !== false; // some versions return false on "not found"
    } catch (e) {
      mountError = String(e).slice(0, 300);
    }
    return { apiReady: true, mounted, mountError };
  }, expId);

  // Settle after mount
  await page.waitForTimeout(SETTLE_MS);

  // DOM + circuit diagnostics
  const diagnostics = await page.evaluate(() => {
    const api = window.__ELAB_API;
    let circuitState = null;
    try { circuitState = api ? api.getCircuitState() : null; } catch (_) {}

    const componentNodes = document.querySelectorAll('[data-component-id]');
    const svgEls = document.querySelectorAll('svg');
    const canvasEl = document.querySelector(
      '[data-testid="simulator-canvas"], .simulator-canvas, #simulator-canvas, [class*="SimulatorCanvas"]'
    );

    // Circuit state diagnostics
    const stateComponents = circuitState?.components
      ? (Array.isArray(circuitState.components)
          ? circuitState.components.length
          : Object.keys(circuitState.components).length)
      : 0;
    const stateConnections = Array.isArray(circuitState?.connections)
      ? circuitState.connections.length
      : (Array.isArray(circuitState?.wires) ? circuitState.wires.length : 0);

    return {
      domComponentCount: componentNodes.length,
      svgCount: svgEls.length,
      hasSvg: svgEls.length > 0,
      hasCanvas: !!canvasEl,
      circuitComponentCount: stateComponents,
      circuitConnectionCount: stateConnections,
      circuitStatePresent: circuitState !== null,
    };
  });

  return { ...mountResult, ...diagnostics };
}

// ── Classify severity ──────────────────────────────────────────────────────
function classifySeverity(probe, exp, consoleErrors, pageErrors) {
  // P0: API not present, or mount failed, or zero components rendered anywhere
  if (!probe.apiReady) return 'P0_BROKEN';
  if (!probe.mounted) return 'P0_BROKEN';
  if (probe.domComponentCount === 0 && probe.circuitComponentCount === 0) return 'P0_BROKEN';

  // P0: critical page errors (JS crashes)
  if (pageErrors.length > 0) return 'P0_BROKEN';

  // P1: components render but connections missing when expected
  const actualComponents = Math.max(probe.domComponentCount, probe.circuitComponentCount);
  const compRatio = exp.expectedComponents > 0 ? actualComponents / exp.expectedComponents : 1;
  const connectionsMissing = exp.expectedConnections > 0 && probe.circuitConnectionCount === 0;

  if (connectionsMissing) return 'P1_PARTIAL';
  if (compRatio < 0.5) return 'P1_PARTIAL';

  // P2: OK
  return 'P2_OK';
}

// ── Generate one Playwright test per experiment ────────────────────────────
for (const exp of ALL_EXPERIMENTS) {
  test(`iter70 ${exp.id} | vol${exp.vol} cap${exp.cap}`, async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text().slice(0, 300));
      }
    });
    page.on('pageerror', (err) => {
      pageErrors.push(String(err).slice(0, 300));
    });

    const startMs = Date.now();

    // Seed auth bypass BEFORE navigation
    await seedSprintUBypass(page);

    // Navigate to #lavagna (preferred over #tutor per iter-70 brief)
    await page.goto(`${PROD_URL}/#lavagna`, {
      waitUntil: 'domcontentloaded',
      timeout: 25000,
    });

    // Wait for app hydration
    await page.waitForTimeout(1500);

    // Dismiss ExperimentPicker if it auto-opened (non-fatal if absent)
    const picker = page.locator('[role="dialog"][aria-label="Scegli un esperimento"]');
    const pickerVisible = await picker.isVisible({ timeout: 3000 }).catch(() => false);
    if (pickerVisible) {
      // Try "Lavagna libera" button first
      const liberaBtn = picker.getByText(/Lavagna libera/i).first();
      const liberaVisible = await liberaBtn.isVisible({ timeout: 1000 }).catch(() => false);
      if (liberaVisible) {
        await liberaBtn.click({ timeout: 2000 }).catch(() => {});
      } else {
        // Fallback: close button or Escape
        const closeBtn = picker.getByRole('button', { name: /Chiudi/i }).first();
        const closeVisible = await closeBtn.isVisible({ timeout: 500 }).catch(() => false);
        if (closeVisible) {
          await closeBtn.click({ timeout: 2000 }).catch(() => {});
        } else {
          await page.keyboard.press('Escape').catch(() => {});
        }
      }
      await page.waitForTimeout(500);
    }

    // Probe experiment
    const probe = await probeExperiment(page, exp.id, consoleErrors, pageErrors);

    // Screenshot (best-effort — never fail the test on screenshot error)
    const screenshotPath = path.join(SCREENSHOTS_DIR, `${exp.id}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => {});

    const durationMs = Date.now() - startMs;
    const severity = classifySeverity(probe, exp, consoleErrors, pageErrors);

    const record = {
      id: exp.id,
      vol: exp.vol,
      cap: exp.cap,
      severity,
      apiReady: probe.apiReady,
      mounted: probe.mounted,
      mountError: probe.mountError || null,
      domComponentCount: probe.domComponentCount,
      circuitComponentCount: probe.circuitComponentCount,
      circuitConnectionCount: probe.circuitConnectionCount,
      hasSvg: probe.hasSvg,
      svgCount: probe.svgCount,
      hasCanvas: probe.hasCanvas,
      circuitStatePresent: probe.circuitStatePresent,
      expectedComponents: exp.expectedComponents,
      expectedConnections: exp.expectedConnections,
      consoleErrors: consoleErrors.slice(0, 5),
      pageErrors: pageErrors.slice(0, 3),
      screenshotPath: path.relative(path.join(REPO_ROOT, '..'), screenshotPath),
      durationMs,
      timestamp: new Date().toISOString(),
    };

    appendResult(record);
    sharedResults.push(record);

    // Inline CI log
    const actualComps = Math.max(probe.domComponentCount, probe.circuitComponentCount);
    console.log(
      `[${severity}] ${exp.id} | ` +
        `api=${probe.apiReady} mount=${probe.mounted} ` +
        `dom_comp=${probe.domComponentCount} circuit_comp=${probe.circuitComponentCount} ` +
        `conns=${probe.circuitConnectionCount}/${exp.expectedConnections} ` +
        `errs=${consoleErrors.length} pageErrs=${pageErrors.length} ` +
        `${durationMs}ms`
    );
  });
}

// ── After all: write summary JSON ─────────────────────────────────────────
test.afterAll(async () => {
  const p0 = sharedResults.filter((r) => r.severity === 'P0_BROKEN');
  const p1 = sharedResults.filter((r) => r.severity === 'P1_PARTIAL');
  const p2 = sharedResults.filter((r) => r.severity === 'P2_OK');

  const vol1Results = sharedResults.filter((r) => r.vol === 1);
  const vol2Results = sharedResults.filter((r) => r.vol === 2);
  const vol3Results = sharedResults.filter((r) => r.vol === 3);

  const summary = {
    meta: {
      iter: 70,
      team: 'B',
      task: '94-esperimenti-uno-per-uno',
      generatedAt: new Date().toISOString(),
      prodUrl: PROD_URL,
      totalTested: sharedResults.length,
    },
    totals: {
      P0_BROKEN: p0.length,
      P1_PARTIAL: p1.length,
      P2_OK: p2.length,
    },
    byVolume: {
      vol1: {
        total: vol1Results.length,
        P0_BROKEN: vol1Results.filter((r) => r.severity === 'P0_BROKEN').length,
        P1_PARTIAL: vol1Results.filter((r) => r.severity === 'P1_PARTIAL').length,
        P2_OK: vol1Results.filter((r) => r.severity === 'P2_OK').length,
      },
      vol2: {
        total: vol2Results.length,
        P0_BROKEN: vol2Results.filter((r) => r.severity === 'P0_BROKEN').length,
        P1_PARTIAL: vol2Results.filter((r) => r.severity === 'P1_PARTIAL').length,
        P2_OK: vol2Results.filter((r) => r.severity === 'P2_OK').length,
      },
      vol3: {
        total: vol3Results.length,
        P0_BROKEN: vol3Results.filter((r) => r.severity === 'P0_BROKEN').length,
        P1_PARTIAL: vol3Results.filter((r) => r.severity === 'P1_PARTIAL').length,
        P2_OK: vol3Results.filter((r) => r.severity === 'P2_OK').length,
      },
    },
    worstBroken: p0
      .sort((a, b) => a.id.localeCompare(b.id))
      .slice(0, 10)
      .map((r) => ({
        id: r.id,
        severity: r.severity,
        apiReady: r.apiReady,
        mounted: r.mounted,
        mountError: r.mountError,
        domComponentCount: r.domComponentCount,
        circuitComponentCount: r.circuitComponentCount,
        consoleErrors: r.consoleErrors,
        pageErrors: r.pageErrors,
        screenshotPath: r.screenshotPath,
      })),
    worstPartial: p1
      .sort((a, b) => a.id.localeCompare(b.id))
      .slice(0, 10)
      .map((r) => ({
        id: r.id,
        severity: r.severity,
        domComponentCount: r.domComponentCount,
        circuitComponentCount: r.circuitComponentCount,
        circuitConnectionCount: r.circuitConnectionCount,
        expectedConnections: r.expectedConnections,
        consoleErrors: r.consoleErrors,
        screenshotPath: r.screenshotPath,
      })),
    allResults: sharedResults,
  };

  fs.writeFileSync(SUMMARY_JSON, JSON.stringify(summary, null, 2), 'utf8');

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('ITER-70 TEAM B — 79 ESPERIMENTI AUDIT RESULTS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Total tested : ${sharedResults.length}`);
  console.log(`P2 OK        : ${p2.length} (${sharedResults.length > 0 ? ((p2.length / sharedResults.length) * 100).toFixed(1) : 0}%)`);
  console.log(`P1 PARTIAL   : ${p1.length} (${sharedResults.length > 0 ? ((p1.length / sharedResults.length) * 100).toFixed(1) : 0}%)`);
  console.log(`P0 BROKEN    : ${p0.length} (${sharedResults.length > 0 ? ((p0.length / sharedResults.length) * 100).toFixed(1) : 0}%)`);
  console.log('');
  console.log(`Vol1 (38): OK=${vol1Results.filter(r=>r.severity==='P2_OK').length} PARTIAL=${vol1Results.filter(r=>r.severity==='P1_PARTIAL').length} BROKEN=${vol1Results.filter(r=>r.severity==='P0_BROKEN').length}`);
  console.log(`Vol2 (27): OK=${vol2Results.filter(r=>r.severity==='P2_OK').length} PARTIAL=${vol2Results.filter(r=>r.severity==='P1_PARTIAL').length} BROKEN=${vol2Results.filter(r=>r.severity==='P0_BROKEN').length}`);
  console.log(`Vol3 (14): OK=${vol3Results.filter(r=>r.severity==='P2_OK').length} PARTIAL=${vol3Results.filter(r=>r.severity==='P1_PARTIAL').length} BROKEN=${vol3Results.filter(r=>r.severity==='P0_BROKEN').length}`);
  console.log('');
  if (p0.length > 0) {
    console.log('TOP P0 BROKEN:');
    p0.slice(0, 10).forEach((r) => {
      console.log(
        `  ${r.id}: api=${r.apiReady} mount=${r.mounted} ` +
          `comp=${r.circuitComponentCount} err="${(r.consoleErrors[0] || r.mountError || '').slice(0, 80)}"`
      );
    });
  }
  console.log('');
  console.log(`Summary JSON : docs/audits/iter-70-94-esperimenti-summary.json`);
  console.log(`Screenshots  : tests/e2e/iter-70-screenshots/ (${sharedResults.length} PNG)`);
  console.log('═══════════════════════════════════════════════════════════');
});
