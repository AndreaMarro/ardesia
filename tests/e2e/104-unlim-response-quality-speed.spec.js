import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedGateBypass, bypassWelcomeGate, dismissExperimentPicker } from './helpers/welcome-gate-bypass.js';

test.skip(process.env.RUN_RESPONSE_QUALITY_SPEED !== '1', 'Opt-in UNLIM response quality/speed artifact run');
test.setTimeout(120_000);

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5173';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT_DIR = path.join(ROOT, 'docs/audits/2026-05-09-unlim-response-quality-speed');

const VIEWPORTS = [
  { name: 'desktop', width: 1366, height: 768 },
  { name: 'ipad', width: 1024, height: 1366 },
  { name: 'mobile', width: 390, height: 844 },
];

const THRESHOLDS = {
  firstUiFeedbackMs: 100,
  localUsefulResponseMs: 500,
  knownOperationalResponseMs: 1500,
  localActionVerifiedMs: 3000,
  apiReadyMs: 10_000,
  horizontalOverflowPx: 24,
};

async function installProbe(page) {
  await page.evaluate(() => {
    window.__UNLIM_QA_ACTIONS = [];
    const api = window.__ELAB_API;
    if (!api || api.__unlimQualityProbeInstalled) return;
    api.__unlimQualityProbeInstalled = true;
    const wrap = (target, name) => {
      const original = target?.[name];
      if (typeof original !== 'function') return;
      target[name] = async function wrapped(...args) {
        const started = performance.now();
        try {
          const result = await original.apply(this, args);
          window.__UNLIM_QA_ACTIONS.push({ name, ok: !(result?.ok === false || result?.success === false), ms: performance.now() - started });
          return result;
        } catch (error) {
          window.__UNLIM_QA_ACTIONS.push({ name, ok: false, error: error?.message || String(error), ms: performance.now() - started });
          throw error;
        }
      };
    };
    for (const name of ['showEditor', 'setEditorMode', 'setEditorCode', 'getEditorCode', 'compile', 'loadScratchWorkspace', 'loadExperiment', 'addWire', 'highlightPin']) wrap(api, name);
    if (api.unlim) wrap(api.unlim, 'exportFumetto');
  });
}

async function removeExperimentPickerOverlay(page) {
  const picker = page.locator('[role="dialog"][aria-label="Scegli un esperimento"]');
  if (await picker.isVisible({ timeout: 500 }).catch(() => false)) {
    await picker.getByRole('button', { name: /^Chiudi$/i }).first().click().catch(() => {});
    await page.keyboard.press('Escape').catch(() => {});
  }
  await page.evaluate(() => {
    document.querySelectorAll('[role="dialog"][aria-label="Scegli un esperimento"]').forEach(node => node.remove());
    document.querySelectorAll('[class*="backdrop"]').forEach((node) => {
      if (String(node.textContent || '').includes('Scegli Esperimento')) node.remove();
    });
  }).catch(() => {});
}

async function ensureExperimentForQualityRun(page) {
  await page.waitForFunction(() => !!window.__ELAB_API, null, { timeout: THRESHOLDS.apiReadyMs });
  await page.evaluate(() => {
    window.__ELAB_API?.loadExperiment?.('v1-cap6-esp1');
  }).catch(() => {});
  await page.waitForTimeout(300);
  await removeExperimentPickerOverlay(page);
}

async function openUnlim(page) {
  const later = page.getByText(/Più tardi|Piu tardi/i);
  if (await later.count()) await later.first().click().catch(() => {});
  await removeExperimentPickerOverlay(page);
  const mascot = page.getByRole('button', { name: /Parla con UNLIM/i });
  if (await mascot.count()) {
    await mascot.first().click();
  } else {
    await page.locator('button[aria-label*="UNLIM"]').last().click();
  }
  await page.getByLabel(/Scrivi messaggio a UNLIM/i).first().waitFor({ timeout: 5_000 });
}

async function sendAndMeasure(page, text, expectedText, requiredActions = []) {
  await page.evaluate(() => { window.__UNLIM_QA_ACTIONS = []; });
  const input = page.getByLabel(/Scrivi messaggio a UNLIM/i).first();
  await input.fill(text);
  const started = Date.now();
  const firstUiFeedbackMs = await page.evaluate(async (expected) => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const button = buttons.find(b => /Invia messaggio/i.test(b.getAttribute('aria-label') || b.textContent || ''));
    if (!button) throw new Error('send button not found');
    const expectedRe = new RegExp(expected, 'i');
    const t0 = performance.now();
    const done = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        observer.disconnect();
        reject(new Error('first UI feedback timeout'));
      }, 1500);
      const check = () => {
        const body = document.body.innerText;
        if (body.includes('Sto ELABorando...') || expectedRe.test(body)) {
          clearTimeout(timer);
          observer.disconnect();
          resolve(performance.now() - t0);
        }
      };
      const observer = new MutationObserver(check);
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
      check();
    });
    button.click();
    return done;
  }, expectedText);

  await page.getByText(new RegExp(expectedText, 'i')).first().waitFor({ timeout: THRESHOLDS.knownOperationalResponseMs });
  const firstUsefulResponseMs = Date.now() - started;

  let actionVerifiedMs = null;
  if (requiredActions.length > 0) {
    await page.waitForFunction((required) => {
      const textNow = document.body.innerText;
      const actionsSeen = (window.__UNLIM_QA_ACTIONS || []).map(a => a.name);
      const proof = {
        showEditor: actionsSeen.includes('showEditor') || /openeditor|editor/i.test(textNow),
        setEditorMode: actionsSeen.includes('setEditorMode') || /switcheditor:(arduino|scratch)|editor a blocchi|Arduino/i.test(textNow),
        setEditorCode: actionsSeen.includes('setEditorCode') || /setcode|Codice impostato/i.test(textNow),
        compile: actionsSeen.includes('compile') || /compile|Compilato/i.test(textNow),
        loadScratchWorkspace: actionsSeen.includes('loadScratchWorkspace') || /loadblocks|Blocchi caricati|workspace/i.test(textNow),
      };
      return required.every(actionName => proof[actionName]);
    }, requiredActions, { timeout: THRESHOLDS.localActionVerifiedMs });
    actionVerifiedMs = Date.now() - started;
  }

  const state = await page.evaluate(() => {
    const textNow = document.body.innerText;
    const actionsSeen = (window.__UNLIM_QA_ACTIONS || []).map(a => a.name);
    const actionProof = {
      showEditor: actionsSeen.includes('showEditor') || /openeditor|editor/i.test(textNow),
      setEditorMode: actionsSeen.includes('setEditorMode') || /switcheditor:(arduino|scratch)|editor a blocchi|Arduino/i.test(textNow),
      setEditorCode: actionsSeen.includes('setEditorCode') || /setcode|Codice impostato/i.test(textNow),
      compile: actionsSeen.includes('compile') || /compile|Compilato/i.test(textNow),
      loadScratchWorkspace: actionsSeen.includes('loadScratchWorkspace') || /loadblocks|Blocchi caricati|workspace/i.test(textNow),
    };
    return {
      thinkingCount: (textNow.match(/Sto ELABorando\.\.\./g) || []).length,
      oldElaborandoCount: (textNow.match(/Sto elaborando|elaborandg/gi) || []).length,
      objectObject: textNow.includes('[object Object]'),
      autoplayMedia: document.querySelectorAll('audio[autoplay], video[autoplay]').length,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      actions: window.__UNLIM_QA_ACTIONS || [],
      actionProof,
    };
  });

  return { text, expectedText, requiredActions, firstUiFeedbackMs, firstUsefulResponseMs, actionVerifiedMs, state };
}

test('UNLIM response quality + speed viewport artifact', async ({ browser }) => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const consoleErrors = [];
  const consoleWarnings = [];
  const requestFailures = [];

  const screenshots = [];
  const viewportResults = [];
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(`[${viewport.name}] ${msg.text()}`);
      if (msg.type() === 'warning') consoleWarnings.push(`[${viewport.name}] ${msg.text()}`);
    });
    page.on('pageerror', err => consoleErrors.push(`[${viewport.name}] ${err.message}`));
    page.on('requestfailed', request => {
      const url = request.url();
      if (!url.includes('elab-galileo.onrender.com/health')) {
        requestFailures.push({ viewport: viewport.name, url, type: request.resourceType(), error: request.failure()?.errorText || '' });
      }
    });
    await seedGateBypass(page);
    const started = Date.now();
    await page.goto(`${BASE}/#lavagna`, { waitUntil: 'domcontentloaded' });
    await bypassWelcomeGate(page);
    await dismissExperimentPicker(page);
    await page.keyboard.press('Escape').catch(() => {});
    await removeExperimentPickerOverlay(page);
    const picker = page.locator('[role="dialog"][aria-label="Scegli un esperimento"]');
    if (await picker.count()) {
      await page.keyboard.press('Escape').catch(() => {});
      if (await picker.isVisible().catch(() => false)) {
        await picker.locator('button').first().click({ force: true }).catch(() => {});
      }
      if (await picker.isVisible().catch(() => false)) {
        await picker.evaluateAll(nodes => nodes.forEach(node => node.remove())).catch(() => {});
      }
    }
    await ensureExperimentForQualityRun(page);
    const apiReadyMs = Date.now() - started;
    await openUnlim(page);
    await installProbe(page);

    const measurements = [];
    measurements.push(await sendAndMeasure(page, 'fai tu, sono in panico', 'Parto dal gesto piu sicuro'));
    measurements.push(await sendAndMeasure(page, 'Prepara codice Arduino per semaforo e compila', 'semaforo a tre LED', ['showEditor', 'setEditorMode', 'setEditorCode', 'compile']));
    measurements.push(await sendAndMeasure(page, 'Apri Scratch e carica i blocchi per far lampeggiare il LED', 'editor a blocchi', ['showEditor', 'setEditorMode', 'loadScratchWorkspace']));

    const health = await page.evaluate(() => ({
      bodyLength: document.body.innerText.length,
      title: document.title,
      url: location.href,
      whiteScreen: document.body.innerText.length < 80,
      objectObject: document.body.innerText.includes('[object Object]'),
      oldWaitingCopy: /Sto elaborando|elaborandg/i.test(document.body.innerText),
      autoplayMedia: document.querySelectorAll('audio[autoplay], video[autoplay]').length,
      horizontalOverflowPx: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
    }));

    const screenshotPath = path.join(OUT_DIR, `playwright-${viewport.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    screenshots.push(screenshotPath);
    viewportResults.push({ viewport, apiReadyMs, measurements, health });
    await context.close();
  }

  const failures = [];
  for (const vr of viewportResults) {
    if (vr.apiReadyMs > THRESHOLDS.apiReadyMs) failures.push({ viewport: vr.viewport.name, metric: 'apiReadyMs', value: vr.apiReadyMs });
    if (vr.health.whiteScreen) failures.push({ viewport: vr.viewport.name, metric: 'whiteScreen' });
    if (vr.health.objectObject) failures.push({ viewport: vr.viewport.name, metric: 'objectObject' });
    if (vr.health.oldWaitingCopy) failures.push({ viewport: vr.viewport.name, metric: 'oldWaitingCopy' });
    if (vr.health.autoplayMedia > 0) failures.push({ viewport: vr.viewport.name, metric: 'autoplayMedia', value: vr.health.autoplayMedia });
    if (vr.health.horizontalOverflowPx > THRESHOLDS.horizontalOverflowPx) failures.push({ viewport: vr.viewport.name, metric: 'horizontalOverflowPx', value: vr.health.horizontalOverflowPx });
    for (const m of vr.measurements) {
      if (m.firstUiFeedbackMs > THRESHOLDS.firstUiFeedbackMs) failures.push({ viewport: vr.viewport.name, metric: 'firstUiFeedbackMs', text: m.text, value: m.firstUiFeedbackMs });
      if (m.text.includes('fai tu') && m.firstUsefulResponseMs > THRESHOLDS.localUsefulResponseMs) failures.push({ viewport: vr.viewport.name, metric: 'localUsefulResponseMs', text: m.text, value: m.firstUsefulResponseMs });
      if (!m.text.includes('fai tu') && m.firstUsefulResponseMs > THRESHOLDS.knownOperationalResponseMs) failures.push({ viewport: vr.viewport.name, metric: 'knownOperationalResponseMs', text: m.text, value: m.firstUsefulResponseMs });
      if (m.actionVerifiedMs !== null && m.actionVerifiedMs > THRESHOLDS.localActionVerifiedMs) failures.push({ viewport: vr.viewport.name, metric: 'localActionVerifiedMs', text: m.text, value: m.actionVerifiedMs });
      for (const actionName of m.requiredActions) {
        if (!m.state.actionProof?.[actionName]) failures.push({ viewport: vr.viewport.name, metric: 'missingActionProof', text: m.text, actionName, actions: m.state.actions });
      }
      if (m.state.thinkingCount > 1) failures.push({ viewport: vr.viewport.name, metric: 'duplicateThinking', text: m.text, value: m.state.thinkingCount });
      if (m.state.oldElaborandoCount > 0) failures.push({ viewport: vr.viewport.name, metric: 'oldElaborando', text: m.text, value: m.state.oldElaborandoCount });
      if (m.state.objectObject) failures.push({ viewport: vr.viewport.name, metric: 'objectObjectDuringChat', text: m.text });
    }
  }
  if (consoleErrors.length > 0) failures.push({ metric: 'consoleErrors', value: consoleErrors.length, consoleErrors });

  const artifact = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE,
    thresholds: THRESHOLDS,
    viewportResults,
    screenshots,
    console: { errors: consoleErrors, warnings: consoleWarnings.slice(0, 20) },
    requestFailures,
    verdict: failures.length === 0 ? 'PASS' : 'FAIL',
    failures,
  };
  fs.writeFileSync(path.join(OUT_DIR, 'playwright-quality-speed.json'), JSON.stringify(artifact, null, 2));
  expect(failures).toEqual([]);
});
