/**
 * Iter 27 Agent X — 94 esperimenti Playwright sweep UNO PER UNO
 *
 * Brutal evidence harness per Andrea iter 21+ mandate (carryover iter 22-26).
 * Per ogni lesson-path JSON in src/data/lesson-paths/, naviga prod
 * https://www.elabtutor.school/#lavagna?exp=<id> e raccoglie:
 *  - HTTP status iniziale (5xx escalation gate)
 *  - errori console + page errors
 *  - presenza simulator-canvas + count componenti renderizzati
 *  - citation "Vol.X cap.Y" o "Vol.X pag.Y" sulla pagina
 *  - screenshot (full-page)
 *
 * Output:
 *  - JSON results per experiment scritto in automa/state/iter-27-92-esperimenti-results-*.json
 *  - Screenshots in docs/audits/iter-27-screenshots/
 *
 * Run:
 *   npx playwright test tests/e2e/iter-27-92-esperimenti-sweep.spec.js \
 *     --config=tests/e2e/sprint-u.config.js \
 *     --workers=1
 *
 * RUN_TIMESTAMP env var overrides default suffix for reproducibility.
 */

import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedSprintUBypass } from './helpers/sprint-u-auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const LESSON_PATHS_DIR = path.join(REPO_ROOT, '..', '..', 'packs', 'elab-tutor', 'data', 'lesson-paths');
const STATE_DIR = path.join(REPO_ROOT, 'automa', 'state');
const SCREENSHOTS_DIR = path.join(REPO_ROOT, 'docs', 'audits', 'iter-27-screenshots');

const PROD_BASE = process.env.SWEEP_BASE_URL || 'https://www.elabtutor.school';
const RUN_TIMESTAMP = process.env.RUN_TIMESTAMP || new Date().toISOString().replace(/[:.]/g, '-');
const RESULTS_PATH = path.join(STATE_DIR, `iter-27-92-esperimenti-results-${RUN_TIMESTAMP}.json`);
const PER_EXP_TIMEOUT_MS = parseInt(process.env.PER_EXP_TIMEOUT_MS || '12000', 10);
const SETTLE_MS = parseInt(process.env.SETTLE_MS || '3500', 10);
const MAX_EXPERIMENTS = process.env.MAX_EXPERIMENTS ? parseInt(process.env.MAX_EXPERIMENTS, 10) : null;

fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
fs.mkdirSync(STATE_DIR, { recursive: true });

function loadLessonPaths() {
  const files = fs
    .readdirSync(LESSON_PATHS_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort();
  const items = [];
  for (const fname of files) {
    const full = path.join(LESSON_PATHS_DIR, fname);
    let raw;
    try {
      raw = JSON.parse(fs.readFileSync(full, 'utf8'));
    } catch (e) {
      items.push({
        expId: fname.replace(/\.json$/, ''),
        file: full,
        parseError: e.message,
        volume: null,
        chapter: null,
        components: [],
      });
      continue;
    }
    const expId = raw.experiment_id || fname.replace(/\.json$/, '');
    const comps = Array.isArray(raw.components_needed)
      ? raw.components_needed.map((c) => c.name).filter(Boolean)
      : [];
    items.push({
      expId,
      file: full,
      volume: raw.volume ?? null,
      chapter: raw.chapter ?? null,
      title: raw.title ?? null,
      components: comps,
    });
  }
  return items;
}

const LESSON_PATHS = loadLessonPaths();
const SWEEP_SET = MAX_EXPERIMENTS ? LESSON_PATHS.slice(0, MAX_EXPERIMENTS) : LESSON_PATHS;

// Shared aggregate results — written from afterAll.
const aggregate = {
  meta: {
    runTimestamp: RUN_TIMESTAMP,
    baseUrl: PROD_BASE,
    total: SWEEP_SET.length,
    started: new Date().toISOString(),
  },
  results: [],
};

test.describe.configure({ mode: 'serial' });

test.describe('iter-27 92 esperimenti sweep brutal', () => {
  test.setTimeout(60_000);

  for (const lp of SWEEP_SET) {
    test(`sweep ${lp.expId}`, async ({ page }, testInfo) => {
      const consoleErrors = [];
      const pageErrors = [];
      const networkFailures = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const txt = msg.text();
          // ignore noisy benign cases
          if (/ResizeObserver|Workbox|sw\.js/.test(txt)) return;
          consoleErrors.push(txt.slice(0, 300));
        }
      });
      page.on('pageerror', (err) => {
        pageErrors.push(String(err.message || err).slice(0, 300));
      });
      page.on('requestfailed', (req) => {
        const url = req.url();
        if (/\.(png|jpg|jpeg|webp|svg|gif|woff2?|ttf|otf|json|js|css)(\?|$)/i.test(url)) {
          networkFailures.push({ url: url.slice(0, 200), failure: req.failure()?.errorText });
        }
      });

      await seedSprintUBypass(page);

      const url = `${PROD_BASE}/#lavagna?exp=${encodeURIComponent(lp.expId)}`;
      let httpStatus = null;
      let navError = null;
      const t0 = Date.now();
      try {
        const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: PER_EXP_TIMEOUT_MS });
        httpStatus = resp ? resp.status() : null;
      } catch (e) {
        navError = String(e.message || e).slice(0, 300);
      }

      // Give the SPA time to mount the simulator and apply the experiment param.
      await page.waitForTimeout(SETTLE_MS);

      // Inspect DOM for evidence.
      let canvasPresent = false;
      let componentCount = 0;
      let citationMatch = null;
      let bodyTextSample = '';
      try {
        canvasPresent = (await page.locator('.simulator-canvas, [data-testid="simulator-canvas"], svg.simulator-canvas').count()) > 0
          || (await page.locator('svg').filter({ hasText: '' }).count()) > 0;
        // count components by data attributes commonly used
        const a = await page.locator('[data-component-id]').count();
        const b = await page.locator('[data-comp-type]').count();
        const c = await page.locator('g[data-id^="comp-"]').count();
        componentCount = Math.max(a, b, c);
        // citation regex Vol.X cap.Y OR Vol.X pag.Y
        const bodyText = (await page.locator('body').innerText().catch(() => '')) || '';
        bodyTextSample = bodyText.slice(0, 400).replace(/\s+/g, ' ');
        const reCap = new RegExp(`Vol\\.?\\s*${lp.volume}\\b[^\\n]{0,40}\\bcap\\.?\\s*${lp.chapter}\\b`, 'i');
        const rePag = new RegExp(`Vol\\.?\\s*${lp.volume}\\b[^\\n]{0,40}\\bpag\\.?\\s*\\d+`, 'i');
        if (reCap.test(bodyText)) citationMatch = 'cap';
        else if (rePag.test(bodyText)) citationMatch = 'pag';
      } catch (e) {
        // swallow inspection errors — recorded as evidence below
        consoleErrors.push(`inspect-err: ${String(e.message || e).slice(0, 200)}`);
      }

      const screenshotPath = path.join(SCREENSHOTS_DIR, `${lp.expId}.png`);
      try {
        await page.screenshot({ path: screenshotPath, fullPage: false, timeout: 5000 });
      } catch (_e) {
        // best-effort
      }

      // Categorize broken reasons
      const reasons = [];
      if (navError) reasons.push(`cat4_nav_error:${navError.slice(0, 80)}`);
      if (httpStatus && httpStatus >= 500) reasons.push(`cat4_http_${httpStatus}`);
      if (pageErrors.length) reasons.push(`cat4_pageerror:${pageErrors[0].slice(0, 80)}`);
      if (!canvasPresent) reasons.push('cat1_no_canvas');
      if (canvasPresent && componentCount === 0 && lp.components.length > 0) reasons.push('cat2_zero_components_rendered');
      if (lp.components.length > 0 && componentCount > 0 && componentCount < Math.max(1, Math.floor(lp.components.length / 2))) {
        reasons.push(`cat2_component_count_low:${componentCount}/${lp.components.length}`);
      }
      if (!citationMatch) reasons.push('cat3_no_vol_pag_citation_visible');
      if (networkFailures.length) reasons.push(`cat6_network_fail:${networkFailures.length}`);
      const broken = reasons.length > 0;

      const result = {
        expId: lp.expId,
        volume: lp.volume,
        chapter: lp.chapter,
        title: lp.title,
        componentsExpected: lp.components.length,
        componentsExpectedNames: lp.components,
        componentsRendered: componentCount,
        canvasPresent,
        httpStatus,
        navError,
        consoleErrorsCount: consoleErrors.length,
        consoleErrorsSample: consoleErrors.slice(0, 3),
        pageErrorsCount: pageErrors.length,
        pageErrorsSample: pageErrors.slice(0, 3),
        networkFailuresCount: networkFailures.length,
        networkFailuresSample: networkFailures.slice(0, 3),
        citationMatch,
        bodyTextSample,
        screenshot: path.relative(REPO_ROOT, screenshotPath),
        broken,
        reasons,
        elapsedMs: Date.now() - t0,
      };
      aggregate.results.push(result);

      // Per-test note attachment for HTML reporter
      await testInfo.attach('result-json', {
        body: Buffer.from(JSON.stringify(result, null, 2)),
        contentType: 'application/json',
      });

      // Smoke assertion: navigation should not crash hard.
      expect(navError, `nav error for ${lp.expId}: ${navError}`).toBeNull();
    });
  }

  test.afterAll(async () => {
    aggregate.meta.ended = new Date().toISOString();
    const passing = aggregate.results.filter((r) => !r.broken);
    const broken = aggregate.results.filter((r) => r.broken);
    const byVol = (vol) => aggregate.results.filter((r) => r.volume === vol);
    aggregate.stats = {
      total: aggregate.results.length,
      passing: passing.length,
      broken: broken.length,
      vol1: { total: byVol(1).length, broken: byVol(1).filter((r) => r.broken).length },
      vol2: { total: byVol(2).length, broken: byVol(2).filter((r) => r.broken).length },
      vol3: { total: byVol(3).length, broken: byVol(3).filter((r) => r.broken).length },
    };
    // Top reasons frequency map
    const reasonFreq = {};
    for (const r of broken) {
      for (const reason of r.reasons) {
        // normalize parametric prefix
        const key = reason.split(':')[0];
        reasonFreq[key] = (reasonFreq[key] || 0) + 1;
      }
    }
    aggregate.stats.reasonFrequency = reasonFreq;
    fs.writeFileSync(RESULTS_PATH, JSON.stringify(aggregate, null, 2), 'utf8');
    // also write a stable-named copy for downstream tooling
    const stablePath = path.join(STATE_DIR, 'iter-27-92-esperimenti-results-latest.json');
    fs.writeFileSync(stablePath, JSON.stringify(aggregate, null, 2), 'utf8');
    // eslint-disable-next-line no-console
    console.log(`[iter-27 sweep] wrote ${RESULTS_PATH} (${aggregate.results.length} results, ${broken.length} broken)`);
  });
});
