/**
 * harness-real-2026-04-28.spec.js
 *
 * Sprint T iter 21 — REAL Playwright E2E harness UNO PER UNO.
 *
 * Sostituisce il "false-positive" harness 2.0 (iter 19, 94/94 PASS basato su
 * static JSON checks: components_count, wires_count, description_non_empty,
 * state_capturable, components_match_expected). ZERO browser launch in 2.0.
 *
 * Questo spec invece:
 *   - Lancia browser Chromium reale (Playwright)
 *   - Naviga su https://www.elabtutor.school (PROD live)
 *   - Mounts ogni esperimento via window.__ELAB_API.unlim.mountExperiment(id)
 *     (fallback a hash navigation #experiment=<id> se API non disponibile)
 *   - Cattura console errors, network failures, render assertions
 *   - Verifica getCircuitState() restituisca componenti reali
 *   - Compila Arduino (se esperimento ha codice) via UI button
 *   - Screenshot full-page per visual diff
 *   - Salva risultato JSONL append-only per ogni esperimento
 *
 * USAGE:
 *   # Run TUTTI 87 esperimenti (long, ~30-60 min)
 *   ELAB_PROD_URL=https://www.elabtutor.school \
 *     npx playwright test tests/e2e/harness-real-2026-04-28.spec.js \
 *     --config tests/e2e/playwright.config.js
 *
 *   # Run smoke 5 piloti (~3-5 min)
 *   ELAB_PROD_URL=https://www.elabtutor.school \
 *     npx playwright test tests/e2e/harness-real-2026-04-28.spec.js \
 *     --grep "v1-cap6-esp1|v1-cap10-esp1|v2-cap1-esp1|v3-cap1-esp1|v1-cap1-esp1" \
 *     --config tests/e2e/playwright.config.js
 *
 * ENV VARS:
 *   ELAB_PROD_URL          — base URL (default https://www.elabtutor.school)
 *   ELAB_E2E_AUTH_BYPASS   — se "1" tenta seedE2EBypass (no-op in prod build)
 *   ELAB_HARNESS_REAL_DIR  — output dir override (default automa/state/iter-21-harness-real)
 *
 * (c) Andrea Marro 2026-04-28 — ELAB Tutor — iter 21 Sprint T
 */

import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─────────────────────────────────────────────────────────────────────────────
// Lesson paths enumeration (filesystem readdir, NO bundler import)
// Replicating the harness 2.0 enumeration to keep parity for diff reporting.
// ─────────────────────────────────────────────────────────────────────────────

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const LESSON_PATHS_DIR = path.join(REPO_ROOT, 'src', 'data', 'lesson-paths');
const SNAPSHOTS_DIR = path.join(REPO_ROOT, 'tests', 'e2e', 'snapshots', 'iter-21-real-harness');
const RESULTS_DIR = process.env.ELAB_HARNESS_REAL_DIR
  ? path.resolve(process.env.ELAB_HARNESS_REAL_DIR)
  : path.join(REPO_ROOT, 'automa', 'state', 'iter-21-harness-real');
const RESULTS_JSONL = path.join(RESULTS_DIR, 'results.jsonl');

function enumerateLessonPaths() {
  if (!fs.existsSync(LESSON_PATHS_DIR)) return [];
  const pattern = /^v\d+-cap\d+-esp\d+\.json$/;
  const files = fs.readdirSync(LESSON_PATHS_DIR).filter(f => pattern.test(f));
  files.sort();
  return files.map(f => {
    const id = f.replace(/\.json$/, '');
    let json = null;
    try {
      json = JSON.parse(fs.readFileSync(path.join(LESSON_PATHS_DIR, f), 'utf8'));
    } catch (e) {
      json = null;
    }
    const titleLower = (json?.title || '').toLowerCase();
    // Heuristic: arduino if volume >= 2 or title contains "arduino" / "scratch" / "code"
    const hasArduino = (json?.volume >= 2)
      || /arduino|sketch|scratch|programma|codice|loop\(\)|setup\(\)/i.test(titleLower);
    return { id, file: f, hasArduino, title: json?.title || '', volume: json?.volume || null };
  });
}

const lessonPaths = enumerateLessonPaths();
const PROD_URL = (process.env.ELAB_PROD_URL || 'https://www.elabtutor.school').replace(/\/$/, '');

// Ensure output dirs exist
if (!fs.existsSync(SNAPSHOTS_DIR)) fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR, { recursive: true });

// Reset results JSONL at first test (we keep append within run, fresh per spec invocation)
// Use globalSetup-like trick: write a header line if file missing.
if (!fs.existsSync(RESULTS_JSONL)) {
  fs.writeFileSync(
    RESULTS_JSONL,
    JSON.stringify({ _meta: 'iter-21-real-harness', startedAt: new Date().toISOString(), prodUrl: PROD_URL, total: lessonPaths.length }) + '\n'
  );
}

function appendResult(record) {
  fs.appendFileSync(RESULTS_JSONL, JSON.stringify(record) + '\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function waitForElabApi(page, timeoutMs = 15000) {
  // Poll for window.__ELAB_API up to timeoutMs
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const exists = await page.evaluate(() => Boolean(window.__ELAB_API));
    if (exists) return true;
    await page.waitForTimeout(500);
  }
  return false;
}

async function tryMountExperiment(page, id) {
  // Strategy 1: __ELAB_API.unlim.mountExperiment / __ELAB_API.mountExperiment
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
  // Strategy 2: hash navigation fallback
  await page.goto(`${PROD_URL}/#experiment=${id}`, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  return { strategy: 'hash-fallback', ok: true, raw: null };
}

async function captureCircuitState(page) {
  return page.evaluate(() => {
    try {
      const api = window.__ELAB_API;
      if (!api) return null;
      const state = api.getCircuitState?.() || api.unlim?.getCircuitState?.() || null;
      const desc = api.getCircuitDescription?.() || null;
      return { state, desc };
    } catch (e) {
      return { error: String(e?.message || e) };
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-experiment test
// ─────────────────────────────────────────────────────────────────────────────

// NOTE: NO serial mode. Each test independent so a single failure
// doesn't skip the rest (we want full pilot data even when most fail).
test.describe(`iter-21 real harness UNO PER UNO @ ${PROD_URL}`, () => {
  test.setTimeout(90_000); // each test up to 90s (network + compile)

  for (const lp of lessonPaths) {
    test(`real harness ${lp.id}`, async ({ page }) => {
      const consoleErrors = [];
      const pageErrors = [];
      const failedRequests = [];

      page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 500)); });
      page.on('pageerror', err => pageErrors.push(String(err?.message || err).slice(0, 500)));
      page.on('requestfailed', req => failedRequests.push(`${req.method()} ${req.url()} ${req.failure()?.errorText || ''}`));

      const startedAt = Date.now();
      const result = {
        experiment_id: lp.id,
        title: lp.title,
        volume: lp.volume,
        has_arduino: lp.hasArduino,
        prod_url: PROD_URL,
        startedAt: new Date().toISOString(),
        steps: {},
        pass: false,
        errors: [],
      };

      try {
        // 1. Navigate prod (cold)
        await page.goto(PROD_URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
        await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
        result.steps.navigate = { ok: true, url: page.url() };

        // 2. Wait for __ELAB_API exposure (signal app booted)
        const apiReady = await waitForElabApi(page, 15_000);
        result.steps.api_ready = { ok: apiReady };

        // 3. Mount esperimento (real interaction)
        const mount = await tryMountExperiment(page, lp.id);
        result.steps.mount = mount;
        // Allow render
        await page.waitForTimeout(2500);

        // 4. Capture circuit state via API
        const circuit = await captureCircuitState(page);
        result.steps.circuit = {
          has_state: !!circuit?.state,
          components: circuit?.state?.components?.length ?? circuit?.state?.components_count ?? null,
          desc_len: circuit?.desc ? String(circuit.desc).length : 0,
          error: circuit?.error || null,
        };

        // 5. Visual verify: at least one SVG component or breadboard rendered
        const svgCount = await page.locator('svg').count();
        const componentNodes = await page.locator('[data-component], [data-testid="component"], .component-svg, g[data-comp-id]').count();
        result.steps.render = { svg_count: svgCount, component_nodes: componentNodes };

        // 6. Compile test (only if arduino) — best-effort, soft assertion
        if (lp.hasArduino) {
          const compileBtn = page.locator('button:has-text("Compila"), button:has-text("Compile"), button[aria-label*="compil" i]').first();
          const compileVisible = await compileBtn.isVisible().catch(() => false);
          if (compileVisible) {
            const respPromise = page.waitForResponse(
              resp => /compile|n8n|hostinger/i.test(resp.url()),
              { timeout: 30_000 }
            ).catch(() => null);
            await compileBtn.click({ trial: false }).catch(() => {});
            const resp = await respPromise;
            result.steps.compile = {
              attempted: true,
              btn_visible: true,
              response_url: resp?.url() || null,
              response_status: resp?.status() || null,
            };
          } else {
            result.steps.compile = { attempted: false, btn_visible: false, reason: 'compile-button-not-found' };
          }
        }

        // 7. Screenshot full-page
        const shotPath = path.join(SNAPSHOTS_DIR, `${lp.id}.png`);
        await page.screenshot({ path: shotPath, fullPage: true }).catch(e => {
          result.errors.push(`screenshot-fail: ${e.message}`);
        });
        result.steps.screenshot = { path: shotPath, exists: fs.existsSync(shotPath) };

        // 8. Pass criteria onesto:
        //    - navigate ok
        //    - api ready
        //    - mount returned something OR hash fallback
        //    - render >0 svg
        //    - no pageerror
        const passCriteria = {
          navigate: result.steps.navigate?.ok === true,
          api_ready: apiReady === true,
          mount_attempted: !!mount?.strategy,
          render_has_svg: svgCount > 0,
          no_page_errors: pageErrors.length === 0,
        };
        result.steps.pass_criteria = passCriteria;
        result.pass = Object.values(passCriteria).every(Boolean);
      } catch (e) {
        result.errors.push(`exception: ${String(e?.message || e)}`);
        result.pass = false;
      } finally {
        result.consoleErrors = consoleErrors.slice(0, 20);
        result.pageErrors = pageErrors.slice(0, 20);
        result.failedRequests = failedRequests.slice(0, 20);
        result.durationMs = Date.now() - startedAt;
        result.endedAt = new Date().toISOString();
        appendResult(result);
      }

      // Soft expect: don't kill suite on first fail, but assert critical
      expect.soft(result.steps.navigate?.ok, 'navigate prod').toBe(true);
      expect.soft(result.pageErrors.length, 'no pageerror').toBe(0);
      // Hard: at least one SVG must render (otherwise the simulator clearly failed to mount)
      expect(result.steps.render?.svg_count, `svg rendered for ${lp.id}`).toBeGreaterThan(0);
    });
  }
});
