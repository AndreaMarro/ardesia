/**
 * 29-92-esperimenti-audit.spec.js
 *
 * Sprint T iter 29 P0 task D — 92 esperimenti broken UNO PER UNO Playwright audit.
 * Andrea iter 21 mandate: "MOLTI ESPERIMENTI NON FUNZIONANO" (componenti disposti
 * male o mal connessi).
 *
 * Goal:
 *   For EACH of 87 canonical lesson-paths (v[123]-cap*-esp*) + 7 extras
 *   (morse/semaforo/mini/serial/extras), navigate prod, mount via __ELAB_API,
 *   capture deep diagnostics:
 *     - Mount strategy (api / hash fallback)
 *     - SVG render count (renders at all?)
 *     - Live circuit components count vs expected from JSON
 *     - Wires count vs expected
 *     - Component types match (LED/R/breadboard/etc)
 *     - Console errors / page errors / failed requests
 *     - Compile button availability for arduino esperimenti
 *     - Screenshot per esperimento for visual diff
 *
 * Pass criteria (HONEST):
 *   - WORKING: navigate ok + api ready + mount ok + SVG > 5 + components_actual > 0 +
 *              components_actual matches expected (within 80%) + 0 page errors
 *   - PARTIAL: navigate + mount but components mismatch OR svg < 10 OR component_count <50%
 *   - BROKEN: mount fails OR SVG = 0 OR pageErrors > 0 OR components_actual = 0
 *
 * USAGE:
 *   ELAB_PROD_URL=https://elab-tutor-git-e2e-bypass-preview-andreas-projects-6d4e9791.vercel.app \
 *     npx playwright test tests/e2e/29-92-esperimenti-audit.spec.js \
 *     --config tests/e2e/playwright.iter29.config.js
 *
 * (c) Andrea Marro 2026-04-29 — ELAB Tutor — iter 29 Sprint T
 */

import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractWireCount } from './helpers/wire-count.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const LESSON_PATHS_DIR = path.join(REPO_ROOT, 'src', 'data', 'lesson-paths');
const SCREENSHOTS_DIR = path.join(REPO_ROOT, 'docs', 'audits', 'iter-29-92-esperimenti-screenshots');
const RESULTS_DIR = path.join(REPO_ROOT, 'automa', 'state', 'iter-29-92-esperimenti');
const RESULTS_JSONL = path.join(RESULTS_DIR, 'results.jsonl');

const PROD_URL = (
  process.env.ELAB_PROD_URL ||
  'https://elab-tutor-git-e2e-bypass-preview-andreas-projects-6d4e9791.vercel.app'
).replace(/\/$/, '');

if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR, { recursive: true });

// Reset results.jsonl on first invocation
if (!fs.existsSync(RESULTS_JSONL)) {
  fs.writeFileSync(
    RESULTS_JSONL,
    JSON.stringify({
      _meta: 'iter-29-92-esperimenti-audit',
      startedAt: new Date().toISOString(),
      prodUrl: PROD_URL,
    }) + '\n',
  );
}

function appendResult(record) {
  fs.appendFileSync(RESULTS_JSONL, JSON.stringify(record) + '\n');
}

function enumerateLessonPaths() {
  if (!fs.existsSync(LESSON_PATHS_DIR)) return [];
  // Match canonical AND extras (morse/semaforo/mini/serial/extras)
  const pattern = /^v\d+(-cap\d+-esp\d+|-cap\d+-(morse|semaforo|mini|serial)|-extra-[a-z-]+)\.json$/;
  const files = fs.readdirSync(LESSON_PATHS_DIR).filter((f) => pattern.test(f));
  files.sort();
  return files.map((f) => {
    const id = f.replace(/\.json$/, '');
    let json = null;
    try {
      json = JSON.parse(fs.readFileSync(path.join(LESSON_PATHS_DIR, f), 'utf8'));
    } catch (e) {
      json = null;
    }
    // Extract expected components from build_circuit.intent.components
    let expectedComponents = [];
    let expectedWires = [];
    if (json?.phases) {
      for (const phase of json.phases) {
        const intent = phase?.build_circuit?.intent;
        if (intent?.components && Array.isArray(intent.components)) {
          expectedComponents = intent.components;
        }
        if (intent?.wires && Array.isArray(intent.wires)) {
          expectedWires = intent.wires;
        }
      }
    }
    const titleLower = (json?.title || '').toLowerCase();
    const hasArduino =
      json?.volume >= 2 ||
      /arduino|sketch|scratch|programma|codice|loop\(\)|setup\(\)/i.test(titleLower);
    return {
      id,
      file: f,
      hasArduino,
      title: json?.title || '',
      volume: json?.volume || null,
      chapter: json?.chapter || null,
      objective: json?.objective || '',
      expectedComponentCount: expectedComponents.length,
      expectedWireCount: expectedWires.length,
      expectedComponentTypes: expectedComponents.map((c) => c.type).sort(),
      componentsNeeded: json?.components_needed || [],
      modes: json?.modes_supported || [],
    };
  });
}

const lessonPaths = enumerateLessonPaths();

async function waitForElabApi(page, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const exists = await page.evaluate(() => Boolean(window.__ELAB_API));
    if (exists) return true;
    await page.waitForTimeout(500);
  }
  return false;
}

async function tryMountExperiment(page, id) {
  const apiResult = await page.evaluate((expId) => {
    try {
      const api = window.__ELAB_API;
      if (!api) return { strategy: 'none', ok: false, reason: 'api-missing' };
      if (api.unlim && typeof api.unlim.mountExperiment === 'function') {
        const r = api.unlim.mountExperiment(expId);
        return { strategy: 'api.unlim.mountExperiment', ok: !!r, raw: r };
      }
      if (typeof api.mountExperiment === 'function') {
        const r = api.mountExperiment(expId);
        return { strategy: 'api.mountExperiment', ok: !!r, raw: r };
      }
      if (typeof api.loadExperiment === 'function') {
        const r = api.loadExperiment(expId);
        return { strategy: 'api.loadExperiment', ok: !!r, raw: r };
      }
      return { strategy: 'none', ok: false, reason: 'no-mount-fn' };
    } catch (e) {
      return { strategy: 'error', ok: false, reason: String(e?.message || e) };
    }
  }, id);
  if (apiResult.ok) return apiResult;
  await page
    .goto(`${PROD_URL}/#experiment=${id}`, { waitUntil: 'domcontentloaded' })
    .catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  return { strategy: 'hash-fallback', ok: false, raw: null };
}

async function captureCircuitState(page) {
  // NOTE: in-page eval cannot import Node modules. The wire-count read
  // here MUST match tests/e2e/helpers/wire-count.js#extractWireCount —
  // see tests/unit/audit/wires-measurement-source.test.js for the contract.
  // (connections is canonical per useSimulatorAPI.js:136; wires is legacy fallback.)
  return page.evaluate(() => {
    try {
      const api = window.__ELAB_API;
      if (!api) return null;
      const state = api.getCircuitState?.() || api.unlim?.getCircuitState?.() || null;
      const desc = api.getCircuitDescription?.() || null;
      const wireSource = Array.isArray(state?.connections)
        ? state.connections
        : Array.isArray(state?.wires)
        ? state.wires
        : [];
      return {
        state,
        desc,
        components: state?.components || [],
        wires: wireSource,
      };
    } catch (e) {
      return { error: String(e?.message || e) };
    }
  });
}

test.describe(`iter-29 92-esperimenti audit @ ${PROD_URL}`, () => {
  test.setTimeout(60_000);

  for (const lp of lessonPaths) {
    test(`audit ${lp.id}`, async ({ page }) => {
      const consoleErrors = [];
      const pageErrors = [];
      const failedRequests = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 300));
      });
      page.on('pageerror', (err) =>
        pageErrors.push(String(err?.message || err).slice(0, 300)),
      );
      page.on('requestfailed', (req) =>
        failedRequests.push(`${req.method()} ${req.url()} ${req.failure()?.errorText || ''}`),
      );

      const startedAt = Date.now();
      const result = {
        experiment_id: lp.id,
        title: lp.title,
        volume: lp.volume,
        chapter: lp.chapter,
        objective: lp.objective?.slice(0, 200),
        has_arduino: lp.hasArduino,
        modes: lp.modes,
        expected: {
          component_count: lp.expectedComponentCount,
          wire_count: lp.expectedWireCount,
          component_types: lp.expectedComponentTypes,
          components_needed: lp.componentsNeeded.map((c) => c.name),
        },
        prod_url: PROD_URL,
        startedAt: new Date().toISOString(),
        steps: {},
        verdict: 'UNKNOWN',
        bugs: [],
      };

      try {
        // 1. Navigate
        await page.goto(PROD_URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
        await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
        result.steps.navigate = { ok: true, url: page.url() };

        // 2. Wait for __ELAB_API
        const apiReady = await waitForElabApi(page, 15_000);
        result.steps.api_ready = { ok: apiReady };
        if (!apiReady) {
          result.bugs.push({ severity: 'P0', kind: 'api-missing', detail: '__ELAB_API not exposed' });
        }

        // 3. Mount esperimento
        const mount = await tryMountExperiment(page, lp.id);
        result.steps.mount = mount;
        if (!mount.ok) {
          result.bugs.push({
            severity: 'P0',
            kind: 'mount-failed',
            detail: `${mount.strategy}: ${mount.reason || 'unknown'}`,
          });
        }
        await page.waitForTimeout(2500);

        // 4. Capture circuit state
        const circuit = await captureCircuitState(page);
        const actualCompCount = circuit?.components?.length ?? 0;
        // extractWireCount: canonical read on raw state (connections | wires fallback).
        // Iter-29 root cause: harness previously read state.wires only, which is
        // undefined per useSimulatorAPI.js:136 (canonical field is `connections`).
        const actualWireCount = extractWireCount(circuit?.state);
        const actualCompTypes = (circuit?.components || []).map((c) => c.type).sort();
        result.steps.circuit = {
          has_state: !!circuit?.state,
          components_actual: actualCompCount,
          wires_actual: actualWireCount,
          desc_len: circuit?.desc ? String(circuit.desc).length : 0,
          component_types_actual: actualCompTypes,
          error: circuit?.error || null,
        };

        // 5. Component diff (expected vs actual)
        const expectedTypes = lp.expectedComponentTypes;
        const missingTypes = expectedTypes.filter((t) => !actualCompTypes.includes(t));
        const extraTypes = actualCompTypes.filter((t) => !expectedTypes.includes(t));
        const componentDelta =
          expectedTypes.length > 0
            ? Math.abs(actualCompCount - lp.expectedComponentCount) / lp.expectedComponentCount
            : null;
        result.steps.diff = {
          missing_types: missingTypes,
          extra_types: extraTypes,
          component_delta_ratio: componentDelta,
          expected_count: lp.expectedComponentCount,
          actual_count: actualCompCount,
        };
        if (lp.expectedComponentCount > 0 && actualCompCount === 0) {
          result.bugs.push({
            severity: 'P0',
            kind: 'no-components-rendered',
            detail: `Expected ${lp.expectedComponentCount} components, got 0`,
          });
        } else if (componentDelta !== null && componentDelta > 0.4) {
          result.bugs.push({
            severity: 'P1',
            kind: 'component-count-mismatch',
            detail: `Expected ${lp.expectedComponentCount}, got ${actualCompCount} (delta ${(componentDelta * 100).toFixed(0)}%)`,
          });
        }
        if (missingTypes.length > 0 && actualCompCount > 0) {
          result.bugs.push({
            severity: 'P1',
            kind: 'missing-component-types',
            detail: `Missing: ${missingTypes.join(', ')}`,
          });
        }
        if (lp.expectedWireCount > 0 && actualWireCount === 0 && actualCompCount > 1) {
          result.bugs.push({
            severity: 'P1',
            kind: 'no-wires-rendered',
            detail: `Expected ${lp.expectedWireCount} wires, got 0 (components ARE present)`,
          });
        }

        // 6. SVG render
        const svgCount = await page.locator('svg').count();
        result.steps.render = { svg_count: svgCount };
        if (svgCount === 0) {
          result.bugs.push({ severity: 'P0', kind: 'no-svg-rendered', detail: 'Zero SVG elements on page' });
        }

        // 7. Arduino: check compile button availability (NOT click — just visibility check)
        if (lp.hasArduino) {
          const compileBtn = page
            .locator(
              'button:has-text("Compila"), button:has-text("Compile"), button[aria-label*="compil" i]',
            )
            .first();
          const compileVisible = await compileBtn.isVisible().catch(() => false);
          result.steps.compile = { btn_visible: compileVisible };
          if (!compileVisible) {
            result.bugs.push({
              severity: 'P2',
              kind: 'compile-button-missing',
              detail: 'Esperimento marked as arduino but no compile button found',
            });
          }
        }

        // 8. Screenshot
        const shotPath = path.join(SCREENSHOTS_DIR, `${lp.id}.png`);
        await page.screenshot({ path: shotPath, fullPage: false }).catch((e) => {
          result.bugs.push({ severity: 'P3', kind: 'screenshot-fail', detail: e.message });
        });
        result.steps.screenshot = { path: shotPath, exists: fs.existsSync(shotPath) };

        // 9. Page errors
        if (pageErrors.length > 0) {
          result.bugs.push({
            severity: 'P0',
            kind: 'page-errors',
            detail: pageErrors.slice(0, 3).join(' | '),
          });
        }

        // 10. Verdict
        const hasP0 = result.bugs.some((b) => b.severity === 'P0');
        const hasP1 = result.bugs.some((b) => b.severity === 'P1');
        if (hasP0) {
          result.verdict = 'BROKEN';
        } else if (hasP1) {
          result.verdict = 'PARTIAL';
        } else if (svgCount > 5 && actualCompCount > 0) {
          result.verdict = 'WORKING';
        } else if (lp.expectedComponentCount === 0) {
          // Zero expected components likely means "passive_view" lesson — count as WORKING if SVG renders
          result.verdict = svgCount > 5 ? 'WORKING' : 'PARTIAL';
        } else {
          result.verdict = 'PARTIAL';
        }
      } catch (e) {
        result.bugs.push({
          severity: 'P0',
          kind: 'exception',
          detail: String(e?.message || e).slice(0, 300),
        });
        result.verdict = 'BROKEN';
      } finally {
        result.consoleErrors = consoleErrors.slice(0, 10);
        result.pageErrors = pageErrors.slice(0, 5);
        result.failedRequests = failedRequests.slice(0, 5);
        result.durationMs = Date.now() - startedAt;
        result.endedAt = new Date().toISOString();
        appendResult(result);
      }

      // Soft assertions — collect data even on fail
      expect.soft(result.steps.navigate?.ok, 'navigate prod').toBe(true);
      expect.soft(result.pageErrors.length, 'no pageerror').toBe(0);
    });
  }
});
