import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedGateBypass, bypassWelcomeGate, dismissExperimentPicker } from './helpers/welcome-gate-bypass.js';

test.describe.configure({ mode: 'serial' });
test.skip(process.env.RUN_FAST_ACTIVE_BENCHMARK !== '1', 'Opt-in fast active benchmark: set RUN_FAST_ACTIVE_BENCHMARK=1');
test.setTimeout(90_000);

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5173';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT_DIR = path.join(ROOT, 'docs/audits/2026-05-09-unlim-fast-active-benchmark');

const THRESHOLDS = {
  firstOperationalReplyMs: 2_000,
  actionVerifiedMs: 6_000,
  apiReadyMs: 10_000,
  horizontalOverflowPx: 24,
};

async function installActionProbe(page) {
  await page.evaluate(() => {
    window.__UNLIM_FAST_ACTIONS = [];
    const api = window.__ELAB_API;
    if (!api || api.__fastActionProbeInstalled) return;
    api.__fastActionProbeInstalled = true;
    const wrap = (name, target = api) => {
      const original = target?.[name];
      if (typeof original !== 'function') return;
      target[name] = async function wrappedFastAction(...args) {
        const started = performance.now();
        try {
          const result = await original.apply(this, args);
          window.__UNLIM_FAST_ACTIONS.push({ name, args, ok: !(result?.ok === false || result?.success === false), ms: performance.now() - started });
          return result;
        } catch (error) {
          window.__UNLIM_FAST_ACTIONS.push({ name, args, ok: false, error: error?.message || String(error), ms: performance.now() - started });
          throw error;
        }
      };
    };
    for (const name of ['showEditor', 'setEditorMode', 'setEditorCode', 'getEditorCode', 'compile', 'loadScratchWorkspace', 'loadExperiment', 'addWire', 'highlightPin']) {
      wrap(name, api);
    }
    if (api.unlim) wrap('exportFumetto', api.unlim);
  });
}

async function sendOperational(page, text, expectedText, requiredActions) {
  await page.evaluate(() => { window.__UNLIM_FAST_ACTIONS = []; });
  const input = page.getByLabel(/Scrivi messaggio a UNLIM/i).first();
  await input.fill(text);

  const started = Date.now();
  await page.getByRole('button', { name: /Invia messaggio/i }).first().click();
  await page.getByText(new RegExp(expectedText, 'i')).first().waitFor({ timeout: THRESHOLDS.firstOperationalReplyMs });
  const firstReplyMs = Date.now() - started;

  await page.waitForFunction((actions) => {
    const seen = (window.__UNLIM_FAST_ACTIONS || []).map(a => a.name);
    return actions.every(action => seen.includes(action));
  }, requiredActions, { timeout: THRESHOLDS.actionVerifiedMs });
  const actionVerifiedMs = Date.now() - started;

  const actionEvents = await page.evaluate(() => window.__UNLIM_FAST_ACTIONS || []);
  await page.waitForTimeout(250);
  return { text, expectedText, firstReplyMs, actionVerifiedMs, actionEvents };
}

test('UNLIM fast active benchmark: replies under 2s and verifies complex actions', async ({ page }) => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const consoleErrors = [];
  const networkFailures = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('requestfailed', (request) => {
    const url = request.url();
    if (url.includes('elab-galileo.onrender.com/health')) return;
    networkFailures.push({ url, resourceType: request.resourceType(), errorText: request.failure()?.errorText || '' });
  });

  await seedGateBypass(page);
  const started = Date.now();
  await page.goto(`${BASE}/#lavagna`, { waitUntil: 'domcontentloaded' });
  await bypassWelcomeGate(page);
  await page.waitForFunction(() => !!window.__ELAB_API, null, { timeout: THRESHOLDS.apiReadyMs });
  const apiReadyMs = Date.now() - started;
  await dismissExperimentPicker(page);
  await page.getByRole('button', { name: /Parla con UNLIM/i }).first().click();
  await installActionProbe(page);

  const cases = [
    {
      text: 'Prepara codice Arduino per semaforo e compila',
      expectedText: 'semaforo a tre LED',
      requiredActions: ['showEditor', 'setEditorMode', 'setEditorCode', 'compile'],
    },
    {
      text: 'Apri Scratch e carica i blocchi per far lampeggiare il LED',
      expectedText: 'editor a blocchi',
      requiredActions: ['showEditor', 'setEditorMode', 'loadScratchWorkspace'],
    },
    {
      text: 'Monta un circuito LED con resistenza su Arduino D13 e GND',
      expectedText: 'monto il circuito LED base',
      requiredActions: ['loadExperiment', 'addWire', 'highlightPin'],
    },
  ];

  const results = [];
  for (const c of cases) results.push(await sendOperational(page, c.text, c.expectedText, c.requiredActions));

  const pageHealth = await page.evaluate(() => ({
    bodyLength: document.body.innerText.length,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    objectObject: document.body.innerText.includes('[object Object]'),
    autoplayMedia: document.querySelectorAll('audio[autoplay], video[autoplay]').length,
  }));

  const failures = [];
  for (const result of results) {
    if (result.firstReplyMs > THRESHOLDS.firstOperationalReplyMs) {
      failures.push({ name: 'firstOperationalReplyMs', text: result.text, value: result.firstReplyMs, threshold: THRESHOLDS.firstOperationalReplyMs });
    }
    if (result.actionVerifiedMs > THRESHOLDS.actionVerifiedMs) {
      failures.push({ name: 'actionVerifiedMs', text: result.text, value: result.actionVerifiedMs, threshold: THRESHOLDS.actionVerifiedMs });
    }
    const rejected = result.actionEvents.filter(e => e.ok === false);
    if (rejected.length > 0) failures.push({ name: 'rejectedActions', text: result.text, rejected });
  }
  if (consoleErrors.length > 0) failures.push({ name: 'consoleErrors', value: consoleErrors.length, errors: consoleErrors });
  if (networkFailures.length > 0) failures.push({ name: 'networkFailures', value: networkFailures.length, failures: networkFailures });
  if (pageHealth.objectObject) failures.push({ name: 'objectObjectVisible', value: true });
  if (pageHealth.autoplayMedia > 0) failures.push({ name: 'autoplayMedia', value: pageHealth.autoplayMedia });
  if (Math.max(0, pageHealth.scrollWidth - pageHealth.innerWidth) > THRESHOLDS.horizontalOverflowPx) {
    failures.push({ name: 'horizontalOverflowPx', value: pageHealth.scrollWidth - pageHealth.innerWidth, threshold: THRESHOLDS.horizontalOverflowPx });
  }

  const artifact = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE,
    thresholds: THRESHOLDS,
    apiReadyMs,
    results,
    pageHealth,
    console: { errors: consoleErrors },
    networkFailures,
    verdict: failures.length === 0 ? 'PASS' : 'FAIL',
    failures,
  };
  fs.writeFileSync(path.join(OUT_DIR, 'fast-active-benchmark.json'), JSON.stringify(artifact, null, 2));
  await page.screenshot({ path: path.join(OUT_DIR, 'fast-active-lavagna.png'), fullPage: false });

  expect(failures).toEqual([]);
});
