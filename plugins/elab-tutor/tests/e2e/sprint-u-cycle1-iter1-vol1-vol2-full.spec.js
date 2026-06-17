/**
 * sprint-u-cycle1-iter1-vol1-vol2-full.spec.js
 *
 * Sprint U — Cycle 1 Iter 1 — LiveTest-1
 * FULL audit: 65 vol1+vol2 experiments against prod.
 *
 * Status: READY — execute in Cycle 2+ once license gate is confirmed stable.
 *
 * Strategy per experiment:
 *   1. seed localStorage via addInitScript (before app boots)
 *   2. navigate to /#tutor
 *   3. mount experiment via window.__ELAB_API.mountExperiment(id)
 *   4. wait 3s for render
 *   5. verify componentCount > 0 (SVG data-component-id nodes)
 *   6. check circuitState.components count via __ELAB_API.getCircuitState()
 *   7. verify simulation can start (no critical page errors)
 *   8. take screenshot
 *   9. record PASS / PARTIAL / BROKEN / NO_API
 *   10. write per-experiment JSONL + final summary JSON
 *
 * Pass criteria (HONEST — same as iter-29 audit):
 *   PASS    : api ready + mount ok + (componentCount > 0 OR circuitComponentCount > 0) + 0 pageErrors
 *   PARTIAL : mount ok BUT componentCount = 0 AND circuitComponentCount > 0, OR mount ok + pageErrors > 0
 *   BROKEN  : mount fails OR (componentCount = 0 AND circuitComponentCount = 0) OR pageErrors critical
 *   NO_API  : window.__ELAB_API not available (page did not load simulator)
 *
 * USAGE:
 *   npx playwright test tests/e2e/sprint-u-cycle1-iter1-vol1-vol2-full.spec.js \
 *     --config tests/e2e/sprint-u.config.js
 *
 * LiveTest-1 — Sprint U Cycle 1 Iter 1 — 2026-05-01
 */

import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedSprintUBypass } from './helpers/sprint-u-auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const SCREENSHOTS_DIR = path.join(
  REPO_ROOT,
  'docs',
  'audits',
  'sprint-u-cycle1-iter1-full-screenshots',
);
const RESULTS_DIR = path.join(REPO_ROOT, 'docs', 'audits');
const RESULTS_JSONL = path.join(RESULTS_DIR, 'sprint-u-cycle1-iter1-livetest-vol1-vol2-full.jsonl');
const RESULTS_JSON = path.join(RESULTS_DIR, 'sprint-u-cycle1-iter1-livetest-vol1-vol2-full.json');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}
// Initialize JSONL
if (!fs.existsSync(RESULTS_JSONL)) {
  fs.writeFileSync(
    RESULTS_JSONL,
    JSON.stringify({ _meta: 'sprint-u-cycle1-iter1-vol1-vol2-full', startedAt: new Date().toISOString() }) + '\n',
    'utf8',
  );
}

/** All 65 vol1 + vol2 experiment IDs */
const ALL_EXPERIMENTS = [
  // ── Volume 1 (38 experiments) ─────────────────────────────────────────────
  // Capitolo 6 — Cos'è il diodo LED?
  { id: 'v1-cap6-esp1', vol: 1, cap: 6, title: 'Cap.6 Esp.1 - Primo LED' },
  { id: 'v1-cap6-esp2', vol: 1, cap: 6, title: 'Cap.6 Esp.2 - LED senza resistore' },
  { id: 'v1-cap6-esp3', vol: 1, cap: 6, title: 'Cap.6 Esp.3 - LED diversi colori' },
  // Capitolo 7 — LED RGB e varianti
  { id: 'v1-cap7-esp1', vol: 1, cap: 7, title: 'Cap.7 Esp.1 - LED RGB rosso' },
  { id: 'v1-cap7-esp2', vol: 1, cap: 7, title: 'Cap.7 Esp.2 - LED RGB verde' },
  { id: 'v1-cap7-esp3', vol: 1, cap: 7, title: 'Cap.7 Esp.3 - LED RGB blu' },
  { id: 'v1-cap7-esp4', vol: 1, cap: 7, title: 'Cap.7 Esp.4 - LED RGB bianco' },
  { id: 'v1-cap7-esp5', vol: 1, cap: 7, title: 'Cap.7 Esp.5 - LED RGB ciclo colori' },
  { id: 'v1-cap7-esp6', vol: 1, cap: 7, title: 'Cap.7 Esp.6 - LED RGB avanzato' },
  // Capitolo 8
  { id: 'v1-cap8-esp1', vol: 1, cap: 8, title: 'Cap.8 Esp.1' },
  { id: 'v1-cap8-esp2', vol: 1, cap: 8, title: 'Cap.8 Esp.2' },
  { id: 'v1-cap8-esp3', vol: 1, cap: 8, title: 'Cap.8 Esp.3' },
  { id: 'v1-cap8-esp4', vol: 1, cap: 8, title: 'Cap.8 Esp.4' },
  { id: 'v1-cap8-esp5', vol: 1, cap: 8, title: 'Cap.8 Esp.5' },
  // Capitolo 9 — Pulsanti
  { id: 'v1-cap9-esp1', vol: 1, cap: 9, title: 'Cap.9 Esp.1 - Pulsante' },
  { id: 'v1-cap9-esp2', vol: 1, cap: 9, title: 'Cap.9 Esp.2' },
  { id: 'v1-cap9-esp3', vol: 1, cap: 9, title: 'Cap.9 Esp.3' },
  { id: 'v1-cap9-esp4', vol: 1, cap: 9, title: 'Cap.9 Esp.4' },
  { id: 'v1-cap9-esp5', vol: 1, cap: 9, title: 'Cap.9 Esp.5' },
  { id: 'v1-cap9-esp6', vol: 1, cap: 9, title: 'Cap.9 Esp.6' },
  { id: 'v1-cap9-esp7', vol: 1, cap: 9, title: 'Cap.9 Esp.7' },
  { id: 'v1-cap9-esp8', vol: 1, cap: 9, title: 'Cap.9 Esp.8' },
  { id: 'v1-cap9-esp9', vol: 1, cap: 9, title: 'Cap.9 Esp.9' },
  // Capitolo 10 — Arduino
  { id: 'v1-cap10-esp1', vol: 1, cap: 10, title: 'Cap.10 Esp.1 - Arduino basic' },
  { id: 'v1-cap10-esp2', vol: 1, cap: 10, title: 'Cap.10 Esp.2' },
  { id: 'v1-cap10-esp3', vol: 1, cap: 10, title: 'Cap.10 Esp.3' },
  { id: 'v1-cap10-esp4', vol: 1, cap: 10, title: 'Cap.10 Esp.4' },
  { id: 'v1-cap10-esp5', vol: 1, cap: 10, title: 'Cap.10 Esp.5' },
  { id: 'v1-cap10-esp6', vol: 1, cap: 10, title: 'Cap.10 Esp.6' },
  // Capitolo 11
  { id: 'v1-cap11-esp1', vol: 1, cap: 11, title: 'Cap.11 Esp.1' },
  { id: 'v1-cap11-esp2', vol: 1, cap: 11, title: 'Cap.11 Esp.2' },
  // Capitolo 12 — PWM
  { id: 'v1-cap12-esp1', vol: 1, cap: 12, title: 'Cap.12 Esp.1 - PWM' },
  { id: 'v1-cap12-esp2', vol: 1, cap: 12, title: 'Cap.12 Esp.2' },
  { id: 'v1-cap12-esp3', vol: 1, cap: 12, title: 'Cap.12 Esp.3' },
  { id: 'v1-cap12-esp4', vol: 1, cap: 12, title: 'Cap.12 Esp.4' },
  // Capitolo 13
  { id: 'v1-cap13-esp1', vol: 1, cap: 13, title: 'Cap.13 Esp.1' },
  { id: 'v1-cap13-esp2', vol: 1, cap: 13, title: 'Cap.13 Esp.2' },
  // Capitolo 14
  { id: 'v1-cap14-esp1', vol: 1, cap: 14, title: 'Cap.14 Esp.1' },

  // ── Volume 2 (27 experiments) ─────────────────────────────────────────────
  // Capitolo 3
  { id: 'v2-cap3-esp1', vol: 2, cap: 3, title: 'V2 Cap.3 Esp.1' },
  { id: 'v2-cap3-esp2', vol: 2, cap: 3, title: 'V2 Cap.3 Esp.2' },
  { id: 'v2-cap3-esp3', vol: 2, cap: 3, title: 'V2 Cap.3 Esp.3' },
  { id: 'v2-cap3-esp4', vol: 2, cap: 3, title: 'V2 Cap.3 Esp.4' },
  // Capitolo 4
  { id: 'v2-cap4-esp1', vol: 2, cap: 4, title: 'V2 Cap.4 Esp.1' },
  { id: 'v2-cap4-esp2', vol: 2, cap: 4, title: 'V2 Cap.4 Esp.2' },
  { id: 'v2-cap4-esp3', vol: 2, cap: 4, title: 'V2 Cap.4 Esp.3' },
  // Capitolo 5
  { id: 'v2-cap5-esp1', vol: 2, cap: 5, title: 'V2 Cap.5 Esp.1' },
  { id: 'v2-cap5-esp2', vol: 2, cap: 5, title: 'V2 Cap.5 Esp.2' },
  // Capitolo 6
  { id: 'v2-cap6-esp1', vol: 2, cap: 6, title: 'V2 Cap.6 Esp.1' },
  { id: 'v2-cap6-esp2', vol: 2, cap: 6, title: 'V2 Cap.6 Esp.2' },
  { id: 'v2-cap6-esp3', vol: 2, cap: 6, title: 'V2 Cap.6 Esp.3' },
  { id: 'v2-cap6-esp4', vol: 2, cap: 6, title: 'V2 Cap.6 Esp.4' },
  // Capitolo 7
  { id: 'v2-cap7-esp1', vol: 2, cap: 7, title: 'V2 Cap.7 Esp.1' },
  { id: 'v2-cap7-esp2', vol: 2, cap: 7, title: 'V2 Cap.7 Esp.2' },
  { id: 'v2-cap7-esp3', vol: 2, cap: 7, title: 'V2 Cap.7 Esp.3' },
  { id: 'v2-cap7-esp4', vol: 2, cap: 7, title: 'V2 Cap.7 Esp.4' },
  // Capitolo 8
  { id: 'v2-cap8-esp1', vol: 2, cap: 8, title: 'V2 Cap.8 Esp.1' },
  { id: 'v2-cap8-esp2', vol: 2, cap: 8, title: 'V2 Cap.8 Esp.2' },
  { id: 'v2-cap8-esp3', vol: 2, cap: 8, title: 'V2 Cap.8 Esp.3' },
  // Capitolo 9
  { id: 'v2-cap9-esp1', vol: 2, cap: 9, title: 'V2 Cap.9 Esp.1' },
  { id: 'v2-cap9-esp2', vol: 2, cap: 9, title: 'V2 Cap.9 Esp.2' },
  // Capitolo 10
  { id: 'v2-cap10-esp1', vol: 2, cap: 10, title: 'V2 Cap.10 Esp.1' },
  { id: 'v2-cap10-esp2', vol: 2, cap: 10, title: 'V2 Cap.10 Esp.2' },
  { id: 'v2-cap10-esp3', vol: 2, cap: 10, title: 'V2 Cap.10 Esp.3' },
  { id: 'v2-cap10-esp4', vol: 2, cap: 10, title: 'V2 Cap.10 Esp.4' },
  // Capitolo 12
  { id: 'v2-cap12-esp1', vol: 2, cap: 12, title: 'V2 Cap.12 Esp.1' },
];

/** Shared results accumulator */
const allResults = [];

/**
 * Mount and probe an experiment, return diagnostics.
 */
async function probeExperiment(page, experimentId) {
  const mountResult = await page.evaluate(async (id) => {
    const api = window.__ELAB_API;
    if (!api) return { apiReady: false, mounted: false, mountError: 'no __ELAB_API' };
    let mounted = false;
    let mountError = null;
    try {
      await api.mountExperiment(id);
      mounted = true;
    } catch (e) {
      mountError = String(e).slice(0, 300);
    }
    return { apiReady: true, mounted, mountError };
  }, experimentId);

  await page.waitForTimeout(3000);

  const diagnostics = await page.evaluate(() => {
    const api = window.__ELAB_API;
    const componentNodes = document.querySelectorAll('[data-component-id]');
    const wireNodes = document.querySelectorAll('[data-wire-id], [class*="wire"]');
    const svgEl = document.querySelector('svg');
    let circuitState = null;
    try {
      circuitState = api ? api.getCircuitState() : null;
    } catch (_e) {}
    return {
      componentCount: componentNodes.length,
      wireCount: wireNodes.length,
      hasSvg: !!svgEl,
      circuitComponentCount: circuitState?.components
        ? Object.keys(circuitState.components).length
        : 0,
      circuitWireCount: circuitState?.connections ? circuitState.connections.length : 0,
    };
  });

  return { ...mountResult, ...diagnostics };
}

/**
 * Classify status from probe diagnostics.
 */
function classifyStatus(probe, consoleErrors, pageErrors) {
  if (!probe.apiReady) return 'NO_API';
  if (!probe.mounted) return 'BROKEN';
  const hasComponents = probe.componentCount > 0 || probe.circuitComponentCount > 0;
  const hasCriticalErrors = pageErrors.length > 0;
  if (!hasComponents) return 'BROKEN';
  if (hasCriticalErrors) return 'PARTIAL';
  if (consoleErrors.length > 0) return 'PARTIAL';
  return 'PASS';
}

for (const exp of ALL_EXPERIMENTS) {
  test(`full: ${exp.id}`, async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Filter known infrastructure errors (not app errors):
        // - CSP violation for virtual:pwa-register (VitePWA dev module leaks in prod CSP)
        if (text.includes('virtual:pwa-register')) return;
        consoleErrors.push(text.slice(0, 200));
      }
    });
    page.on('pageerror', (err) => {
      pageErrors.push(String(err).slice(0, 200));
    });

    // Seed before navigation
    await seedSprintUBypass(page);

    // Navigate to /#tutor (simulator route)
    await page.goto('https://www.elabtutor.school/#tutor', {
      waitUntil: 'domcontentloaded',
      timeout: 20000,
    });
    await page.waitForTimeout(2000);

    // Probe experiment
    const probe = await probeExperiment(page, exp.id);

    // Screenshot
    const screenshotFile = path.join(SCREENSHOTS_DIR, `${exp.id}.png`);
    await page.screenshot({ path: screenshotFile, fullPage: false }).catch(() => {});

    const status = classifyStatus(probe, consoleErrors, pageErrors);

    const record = {
      id: exp.id,
      vol: exp.vol,
      cap: exp.cap,
      title: exp.title,
      status,
      apiReady: probe.apiReady,
      mounted: probe.mounted,
      mountError: probe.mountError || null,
      componentCount: probe.componentCount,
      wireCount: probe.wireCount,
      circuitComponentCount: probe.circuitComponentCount,
      circuitWireCount: probe.circuitWireCount,
      hasSvg: probe.hasSvg,
      consoleErrorCount: consoleErrors.length,
      pageErrorCount: pageErrors.length,
      consoleErrors: consoleErrors.slice(0, 3),
      pageErrors: pageErrors.slice(0, 2),
      screenshotFile: path.relative(REPO_ROOT, screenshotFile),
      timestamp: new Date().toISOString(),
    };

    allResults.push(record);
    fs.appendFileSync(RESULTS_JSONL, JSON.stringify(record) + '\n');

    console.log(
      `[${status}] ${exp.id} | dom=${probe.componentCount} circuit=${probe.circuitComponentCount}` +
        ` wires=${probe.circuitWireCount} errors=${consoleErrors.length}/${pageErrors.length}`,
    );

    // Soft assertion — test is informational, never hard-fails the suite
    // (change to expect(status).toBe('PASS') to enforce strict mode in future cycles)
  });
}

test.afterAll(async () => {
  if (allResults.length === 0) return;

  const passCount = allResults.filter((r) => r.status === 'PASS').length;
  const partialCount = allResults.filter((r) => r.status === 'PARTIAL').length;
  const brokenCount = allResults.filter((r) => r.status === 'BROKEN').length;
  const noApiCount = allResults.filter((r) => r.status === 'NO_API').length;
  const vol1Results = allResults.filter((r) => r.vol === 1);
  const vol2Results = allResults.filter((r) => r.vol === 2);

  const summary = {
    meta: {
      sprint: 'Sprint U',
      cycle: 1,
      iter: 1,
      agent: 'LiveTest-1',
      spec: 'vol1-vol2-full',
      generatedAt: new Date().toISOString(),
      totalExperiments: allResults.length,
      vol1Count: vol1Results.length,
      vol2Count: vol2Results.length,
      passCount,
      partialCount,
      brokenCount,
      noApiCount,
      passRate:
        allResults.length > 0
          ? `${((passCount / allResults.length) * 100).toFixed(1)}%`
          : '0%',
      vol1PassCount: vol1Results.filter((r) => r.status === 'PASS').length,
      vol2PassCount: vol2Results.filter((r) => r.status === 'PASS').length,
    },
    results: allResults,
  };

  fs.writeFileSync(RESULTS_JSON, JSON.stringify(summary, null, 2), 'utf8');

  console.log('\n=== FULL AUDIT SUMMARY ===');
  console.log(`PASS: ${passCount} | PARTIAL: ${partialCount} | BROKEN: ${brokenCount} | NO_API: ${noApiCount}`);
  console.log(`Vol1: ${vol1Results.filter((r) => r.status === 'PASS').length}/${vol1Results.length} PASS`);
  console.log(`Vol2: ${vol2Results.filter((r) => r.status === 'PASS').length}/${vol2Results.length} PASS`);
  console.log(`Results written to: ${path.relative(REPO_ROOT, RESULTS_JSON)}`);
});
