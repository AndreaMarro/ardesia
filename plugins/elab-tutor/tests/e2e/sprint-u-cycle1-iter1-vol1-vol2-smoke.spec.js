/**
 * sprint-u-cycle1-iter1-vol1-vol2-smoke.spec.js
 *
 * Sprint U — Cycle 1 Iter 1 — LiveTest-1
 * Smoke test: 10 representative vol1+vol2 experiments against prod.
 *
 * Strategy:
 *   1. seed localStorage via addInitScript (before app boots) — bypass WelcomePage + ConsentBanner
 *   2. navigate to /#tutor
 *   3. mount experiment via window.__ELAB_API.mountExperiment()
 *   4. record component count, wires, console errors
 *   5. take screenshot
 *   6. accumulate results → write to docs/audits/sprint-u-cycle1-iter1-livetest-vol1-vol2-smoke.json
 *
 * LiveTest-1 — Sprint U Cycle 1 Iter 1 — 2026-05-01
 */

import { test } from '@playwright/test';
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
  'sprint-u-cycle1-iter1-screenshots',
);
const RESULTS_JSON = path.join(
  REPO_ROOT,
  'docs',
  'audits',
  'sprint-u-cycle1-iter1-livetest-vol1-vol2-smoke.json',
);

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

/** 10 representative experiments covering vol1 + vol2 */
const SMOKE_EXPERIMENTS = [
  { id: 'v1-cap6-esp1', label: 'LED rosso — basic circuit', vol: 1 },
  { id: 'v1-cap6-esp2', label: 'LED senza resistore', vol: 1 },
  { id: 'v1-cap7-esp1', label: 'LED RGB rosso', vol: 1 },
  { id: 'v1-cap9-esp1', label: 'pulsante', vol: 1 },
  { id: 'v1-cap10-esp1', label: 'Arduino basic', vol: 1 },
  { id: 'v1-cap12-esp1', label: 'PWM', vol: 1 },
  { id: 'v2-cap3-esp1', label: 'Vol2 primo capitolo', vol: 2 },
  { id: 'v2-cap4-esp1', label: 'Vol2 secondo capitolo', vol: 2 },
  { id: 'v2-cap5-esp1', label: 'Vol2 terzo capitolo', vol: 2 },
  { id: 'v2-cap6-esp1', label: 'Vol2 avanzato', vol: 2 },
];

/** Accumulated results shared across tests */
const results = [];

/**
 * Try to mount experiment via __ELAB_API, return diagnostics.
 */
async function probeExperiment(page, experimentId) {
  const mountResult = await page.evaluate(async (id) => {
    const api = window.__ELAB_API;
    if (!api) return { apiReady: false, mounted: false, error: 'no __ELAB_API' };

    let mounted = false;
    let mountError = null;
    try {
      await api.mountExperiment(id);
      mounted = true;
    } catch (e) {
      mountError = String(e);
    }
    return { apiReady: true, mounted, mountError };
  }, experimentId);

  // Wait for render
  await page.waitForTimeout(3000);

  const diagnostics = await page.evaluate(() => {
    const componentNodes = document.querySelectorAll('[data-component-id]');
    const wireNodes = document.querySelectorAll('[data-wire-id], [class*="wire"]');
    const svgEl = document.querySelector('svg');
    const canvasEl = document.querySelector('[data-testid="simulator-canvas"], .simulator-canvas, #simulator-canvas');
    const api = window.__ELAB_API;
    let circuitState = null;
    try {
      circuitState = api ? api.getCircuitState() : null;
    } catch (_e) {}
    return {
      componentCount: componentNodes.length,
      wireCount: wireNodes.length,
      hasSvg: !!svgEl,
      hasCanvas: !!canvasEl,
      circuitComponentCount: circuitState?.components ? Object.keys(circuitState.components).length : 0,
      circuitWireCount: circuitState?.connections ? circuitState.connections.length : 0,
    };
  });

  return { ...mountResult, ...diagnostics };
}

for (const exp of SMOKE_EXPERIMENTS) {
  test(`smoke: ${exp.id} — ${exp.label}`, async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 200));
    });
    page.on('pageerror', (err) => {
      pageErrors.push(String(err).slice(0, 200));
    });

    // Step 1: seed before navigation
    await seedSprintUBypass(page);

    // Step 2: navigate to /#tutor
    await page.goto('https://www.elabtutor.school/#tutor', {
      waitUntil: 'domcontentloaded',
      timeout: 20000,
    });
    await page.waitForTimeout(2000);

    // Step 3-4: probe experiment
    const probe = await probeExperiment(page, exp.id);

    // Step 5: screenshot
    const screenshotFile = path.join(SCREENSHOTS_DIR, `${exp.id}.png`);
    await page.screenshot({ path: screenshotFile, fullPage: false }).catch(() => {});

    // Determine status
    let status = 'UNKNOWN';
    if (!probe.apiReady) {
      status = 'NO_API';
    } else if (!probe.mounted) {
      status = 'MOUNT_FAIL';
    } else if (probe.componentCount === 0 && probe.circuitComponentCount === 0) {
      status = 'NO_COMPONENTS';
    } else {
      status = 'PASS';
    }

    const record = {
      id: exp.id,
      label: exp.label,
      vol: exp.vol,
      status,
      apiReady: probe.apiReady,
      mounted: probe.mounted,
      mountError: probe.mountError || null,
      componentCount: probe.componentCount,
      wireCount: probe.wireCount,
      circuitComponentCount: probe.circuitComponentCount,
      circuitWireCount: probe.circuitWireCount,
      hasSvg: probe.hasSvg,
      hasCanvas: probe.hasCanvas,
      consoleErrors: consoleErrors.slice(0, 5),
      pageErrors: pageErrors.slice(0, 3),
      screenshotFile: path.relative(REPO_ROOT, screenshotFile),
      timestamp: new Date().toISOString(),
    };

    results.push(record);

    // Log inline for CI visibility
    console.log(
      `[${status}] ${exp.id} | api=${probe.apiReady} mount=${probe.mounted} ` +
        `dom_components=${probe.componentCount} circuit_components=${probe.circuitComponentCount} ` +
        `wires=${probe.wireCount}/${probe.circuitWireCount} errors=${consoleErrors.length}`,
    );
  });
}

// After all tests, write consolidated JSON results
test.afterAll(async () => {
  const passCount = results.filter((r) => r.status === 'PASS').length;
  const failCount = results.filter((r) => r.status !== 'PASS').length;

  const summary = {
    meta: {
      sprint: 'Sprint U',
      cycle: 1,
      iter: 1,
      agent: 'LiveTest-1',
      generatedAt: new Date().toISOString(),
      totalExperiments: results.length,
      passCount,
      failCount,
      passRate: results.length > 0 ? `${((passCount / results.length) * 100).toFixed(1)}%` : '0%',
    },
    results,
  };

  fs.writeFileSync(RESULTS_JSON, JSON.stringify(summary, null, 2), 'utf8');
  console.log(`\n=== SMOKE SUMMARY: ${passCount}/${results.length} PASS ===`);
  console.log(`Results written to: ${path.relative(REPO_ROOT, RESULTS_JSON)}`);
});
