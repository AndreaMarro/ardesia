import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedGateBypass, bypassWelcomeGate, dismissExperimentPicker } from './helpers/welcome-gate-bypass.js';

test.describe.configure({ mode: 'serial' });
test.skip(process.env.RUN_PERF_BENCHMARK !== '1', 'Opt-in severe benchmark: set RUN_PERF_BENCHMARK=1');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5173';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT_DIR = path.join(ROOT, 'docs/audits/2026-05-09-unlim-performance-benchmark');

const THRESHOLDS = {
  domContentLoadedMs: 3_000,
  apiReadyMs: 7_000,
  firstMeaningfulTextMs: 7_500,
  loadExperimentMs: 1_200,
  domNodes: 9_000,
  longTaskCount: 35,
  longTaskMaxMs: 750,
  horizontalOverflowPx: 24,
  getLayoutP95Ms: 8,
  getSimulatorContextP95Ms: 35,
  getCircuitDescriptionP95Ms: 45,
  setGetCodeP95Ms: 45,
  compileP95Ms: 1_500,
  scratchLoadP95Ms: 300,
  addRemoveComponentP95Ms: 35,
  exportFumettoP95Ms: 120,
};

function summarize(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  const percentile = (p) => sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))] || 0;
  return {
    count: sorted.length,
    min: sorted[0] || 0,
    p50: percentile(50),
    p95: percentile(95),
    max: sorted[sorted.length - 1] || 0,
  };
}

function assertMetric(name, value, threshold, failures) {
  const ok = value <= threshold;
  if (!ok) failures.push({ name, value, threshold });
  return { name, value, threshold, ok };
}

test('UNLIM severe performance benchmark: load, runtime APIs, actions, viewport health', async ({ page }) => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const consoleErrors = [];
  const consoleWarnings = [];
  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error') consoleErrors.push(text);
    if (msg.type() === 'warning') consoleWarnings.push(text);
  });
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  await page.addInitScript(() => {
    window.__ELAB_PERF_LONG_TASKS = [];
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__ELAB_PERF_LONG_TASKS.push({
            name: entry.name,
            startTime: entry.startTime,
            duration: entry.duration,
          });
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
      window.__ELAB_PERF_LONG_TASK_OBSERVER = observer;
    } catch (_) {
      window.__ELAB_PERF_LONG_TASKS_UNAVAILABLE = true;
    }
  });
  await seedGateBypass(page);

  const startedAt = Date.now();
  await page.goto(`${BASE}/#lavagna`, { waitUntil: 'domcontentloaded' });
  const domContentLoadedMs = Date.now() - startedAt;
  await bypassWelcomeGate(page);

  const apiReadyStarted = Date.now();
  await page.waitForFunction(() => !!window.__ELAB_API, null, { timeout: THRESHOLDS.apiReadyMs });
  const apiReadyMs = Date.now() - startedAt;

  await page.waitForFunction(() => document.body.innerText.length > 80, null, { timeout: 7_500 });
  const firstMeaningfulTextMs = Date.now() - startedAt;
  await dismissExperimentPicker(page);

  const loadExperimentMs = await page.evaluate(async () => {
    const t0 = performance.now();
    await window.__ELAB_API.loadExperiment?.('v1-cap6-esp1');
    return performance.now() - t0;
  });
  await page.waitForTimeout(300);

  const actionMetrics = await page.evaluate(async () => {
    const waitFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));
    const summarizeLocal = (values) => {
      const sorted = values.slice().sort((a, b) => a - b);
      const percentile = (p) => sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))] || 0;
      return {
        count: sorted.length,
        min: sorted[0] || 0,
        p50: percentile(50),
        p95: percentile(95),
        max: sorted[sorted.length - 1] || 0,
      };
    };
    const time = async (fn) => {
      const t0 = performance.now();
      await fn();
      return performance.now() - t0;
    };
    const repeat = async (count, fn) => {
      const samples = [];
      for (let i = 0; i < count; i += 1) {
        samples.push(await time(() => fn(i)));
      }
      return summarizeLocal(samples);
    };

    const api = window.__ELAB_API;
    const code = 'void setup(){ pinMode(13, OUTPUT); } void loop(){ digitalWrite(13, HIGH); delay(100); digitalWrite(13, LOW); delay(100); }';
    const xml = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
</block></next></block></next></block></next></block>
</statement>
</block></xml>`;

    const metrics = {};
    metrics.getLayout = await repeat(250, () => api.getLayout?.());
    metrics.getSimulatorContext = await repeat(160, () => api.getSimulatorContext?.());
    metrics.getCircuitDescription = await repeat(120, () => api.getCircuitDescription?.());
    metrics.setGetCode = await repeat(80, (i) => {
      api.showEditor?.();
      api.setEditorMode?.('arduino');
      api.setEditorCode?.(`${code}\n// bench ${i}`);
      const observed = api.getEditorCode?.();
      if (!String(observed || '').includes(`bench ${i}`)) throw new Error('editor readback mismatch');
    });
    metrics.compile = await repeat(12, async (i) => {
      api.setEditorCode?.(`${code}\n// compile ${i}`);
      await api.compile?.(api.getEditorCode?.());
    });
    metrics.scratchLoad = await repeat(40, (i) => {
      api.showEditor?.();
      api.setEditorMode?.('scratch');
      const loaded = api.loadScratchWorkspace?.(xml.replace('x="40"', `x="${40 + i}"`));
      if (loaded === false || loaded === null) throw new Error('scratch load rejected');
    });
    metrics.addRemoveComponent = await repeat(120, (i) => {
      const id = api.addComponent?.(i % 2 ? 'led' : 'resistor', { x: 120 + (i % 10) * 12, y: 180 + (i % 8) * 10 });
      if (!id) throw new Error('addComponent returned empty id');
      api.removeComponent?.(id);
    });
    metrics.exportFumetto = await repeat(25, (i) => {
      const result = api.unlim?.exportFumetto?.({ format: i % 2 ? 'png' : 'pdf', preview: true, source: 'performance-benchmark' });
      if (result?.ok === false) throw new Error('exportFumetto rejected');
    });

    await waitFrame();
    return metrics;
  });

  const pageHealth = await page.evaluate(() => {
    const longTasks = window.__ELAB_PERF_LONG_TASKS || [];
    const longDurations = longTasks.map((task) => task.duration);
    const heap = performance.memory ? {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
    } : null;
    return {
      title: document.title,
      url: location.href,
      bodyLength: document.body.innerText.length,
      domNodes: document.querySelectorAll('*').length,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      objectObject: document.body.innerText.includes('[object Object]'),
      autoplayMedia: document.querySelectorAll('audio[autoplay], video[autoplay]').length,
      longTaskUnavailable: Boolean(window.__ELAB_PERF_LONG_TASKS_UNAVAILABLE),
      longTaskCount: longTasks.length,
      longTaskSummary: longDurations.length ? {
        count: longDurations.length,
        min: Math.min(...longDurations),
        p50: longDurations.slice().sort((a, b) => a - b)[Math.floor(longDurations.length * 0.5)],
        p95: longDurations.slice().sort((a, b) => a - b)[Math.min(longDurations.length - 1, Math.floor(longDurations.length * 0.95))],
        max: Math.max(...longDurations),
      } : { count: 0, min: 0, p50: 0, p95: 0, max: 0 },
      heap,
    };
  });

  const screenshotPath = path.join(OUT_DIR, 'performance-lavagna-desktop.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });

  const failures = [];
  const checks = [
    assertMetric('domContentLoadedMs', domContentLoadedMs, THRESHOLDS.domContentLoadedMs, failures),
    assertMetric('apiReadyMs', apiReadyMs, THRESHOLDS.apiReadyMs, failures),
    assertMetric('firstMeaningfulTextMs', firstMeaningfulTextMs, THRESHOLDS.firstMeaningfulTextMs, failures),
    assertMetric('loadExperimentMs', loadExperimentMs, THRESHOLDS.loadExperimentMs, failures),
    assertMetric('domNodes', pageHealth.domNodes, THRESHOLDS.domNodes, failures),
    assertMetric('longTaskCount', pageHealth.longTaskCount, THRESHOLDS.longTaskCount, failures),
    assertMetric('longTaskMaxMs', pageHealth.longTaskSummary.max, THRESHOLDS.longTaskMaxMs, failures),
    assertMetric('horizontalOverflowPx', Math.max(0, pageHealth.scrollWidth - pageHealth.innerWidth), THRESHOLDS.horizontalOverflowPx, failures),
    assertMetric('getLayoutP95Ms', actionMetrics.getLayout.p95, THRESHOLDS.getLayoutP95Ms, failures),
    assertMetric('getSimulatorContextP95Ms', actionMetrics.getSimulatorContext.p95, THRESHOLDS.getSimulatorContextP95Ms, failures),
    assertMetric('getCircuitDescriptionP95Ms', actionMetrics.getCircuitDescription.p95, THRESHOLDS.getCircuitDescriptionP95Ms, failures),
    assertMetric('setGetCodeP95Ms', actionMetrics.setGetCode.p95, THRESHOLDS.setGetCodeP95Ms, failures),
    assertMetric('compileP95Ms', actionMetrics.compile.p95, THRESHOLDS.compileP95Ms, failures),
    assertMetric('scratchLoadP95Ms', actionMetrics.scratchLoad.p95, THRESHOLDS.scratchLoadP95Ms, failures),
    assertMetric('addRemoveComponentP95Ms', actionMetrics.addRemoveComponent.p95, THRESHOLDS.addRemoveComponentP95Ms, failures),
    assertMetric('exportFumettoP95Ms', actionMetrics.exportFumetto.p95, THRESHOLDS.exportFumettoP95Ms, failures),
  ];

  if (consoleErrors.length > 0) failures.push({ name: 'consoleErrors', value: consoleErrors.length, threshold: 0 });
  if (pageHealth.objectObject) failures.push({ name: 'objectObjectVisible', value: true, threshold: false });
  if (pageHealth.autoplayMedia > 0) failures.push({ name: 'autoplayMedia', value: pageHealth.autoplayMedia, threshold: 0 });

  const artifact = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE,
    thresholds: THRESHOLDS,
    navigation: {
      domContentLoadedMs,
      apiReadyMs,
      apiReadyWaitOnlyMs: Date.now() - apiReadyStarted,
      firstMeaningfulTextMs,
      loadExperimentMs,
    },
    actionMetrics,
    pageHealth,
    checks,
    console: {
      errors: consoleErrors,
      warnings: consoleWarnings.slice(0, 50),
    },
    screenshot: screenshotPath,
    verdict: failures.length === 0 ? 'PASS' : 'FAIL',
    failures,
  };
  fs.writeFileSync(path.join(OUT_DIR, 'performance-benchmark.json'), JSON.stringify(artifact, null, 2));

  expect(pageHealth.bodyLength).toBeGreaterThan(80);
  expect(pageHealth.objectObject).toBe(false);
  expect(pageHealth.autoplayMedia).toBe(0);
  expect(consoleErrors).toEqual([]);
  expect(failures, JSON.stringify(failures, null, 2)).toEqual([]);
});
