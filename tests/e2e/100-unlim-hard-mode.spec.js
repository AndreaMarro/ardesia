import { test, expect } from '@playwright/test';
import { seedGateBypass, bypassWelcomeGate } from './helpers/welcome-gate-bypass.js';

test.describe.configure({ mode: 'serial' });

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5173';
let page;

async function waitForApi() {
  await page.waitForFunction(() => !!window.__ELAB_API, null, { timeout: 20_000 });
}

async function ensureExperimentLoaded() {
  await page.evaluate(() => {
    window.__ELAB_API?.loadExperiment?.('v1-cap6-esp1');
  });
  await page.waitForTimeout(300);
}

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  await seedGateBypass(page);
  await page.goto(`${BASE}/#lavagna`);
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await bypassWelcomeGate(page);
  await waitForApi();
  await ensureExperimentLoaded();
});

test.afterAll(async () => {
  await page?.close();
});

for (const name of ['exportFumetto', 'generateQuiz', 'highlightComponent', 'setDiagnoseMode']) {
  test(`UNLIM runtime API exposes ${name}`, async () => {
    const type = await page.evaluate((fn) => typeof window.__ELAB_API?.unlim?.[fn], name);
    expect(type).toBe('function');
  });
}

for (const [index, format] of ['pdf', 'png', 'pdf'].entries()) {
  test(`fumetto export dispatches verified runtime events ${index + 1} ${format}`, async () => {
    const result = await page.evaluate((fmt) => {
      const events = [];
      const offFumetto = window.__ELAB_API.on('fumettoExportRequested', (detail) => {
        events.push({ type: 'fumettoExportRequested', detail });
      });
      const onVoice = (event) => events.push({ type: 'elab-voice-command', detail: event.detail });
      window.addEventListener('elab-voice-command', onVoice);
      const response = window.__ELAB_API.unlim.exportFumetto({ format: fmt, preview: true });
      offFumetto();
      window.removeEventListener('elab-voice-command', onVoice);
      return { response, events };
    }, format);

    expect(result.response.ok).toBe(true);
    expect(result.response.format).toBe(format);
    expect(result.events.some(e => e.type === 'fumettoExportRequested' && e.detail.format === format)).toBe(true);
    expect(result.events.some(e => e.type === 'elab-voice-command' && e.detail.action === 'createReport')).toBe(true);
  });
}

for (let i = 0; i < 6; i += 1) {
  test(`Arduino hard traffic-light editor roundtrip ${i + 1}`, async () => {
    const result = await page.evaluate((n) => {
      const code = `const int PIN_ROSSO = 13;
const int PIN_GIALLO = 12;
const int PIN_VERDE = 11;
void setup(){ pinMode(PIN_ROSSO, OUTPUT); pinMode(PIN_GIALLO, OUTPUT); pinMode(PIN_VERDE, OUTPUT); }
void loop(){ digitalWrite(PIN_ROSSO, ${n % 2 ? 'HIGH' : 'LOW'}); }`;
      const api = window.__ELAB_API;
      api.showEditor?.();
      api.setEditorMode?.('arduino');
      api.setEditorCode?.(code);
      return {
        code: api.getEditorCode?.(),
        hasCompile: typeof api.compile === 'function',
      };
    }, i);

    expect(result.code).toContain('PIN_ROSSO');
    expect(result.code).toContain('PIN_GIALLO');
    expect(result.code).toContain('PIN_VERDE');
    expect(result.hasCompile).toBe(true);
  });
}

for (let i = 0; i < 6; i += 1) {
  test(`Scratch hard blink workspace load ${i + 1}`, async () => {
    const result = await page.evaluate((n) => {
      const xml = `<xml><block type="arduino_pinmode" id="pin${n}"><field name="PIN">13</field><next><block type="arduino_digitalwrite" id="write${n}"><field name="STATE">HIGH</field></block></next></block></xml>`;
      const api = window.__ELAB_API;
      api.showEditor?.();
      api.setEditorMode?.('scratch');
      const loaded = api.loadScratchWorkspace?.(xml);
      return { loaded: loaded !== false && loaded !== null, hasScratch: typeof api.loadScratchWorkspace === 'function' };
    }, i);

    expect(result.hasScratch).toBe(true);
    expect(result.loaded).toBe(true);
  });
}

for (let i = 0; i < 8; i += 1) {
  test(`Circuit mutation remains inspectable after noisy changes ${i + 1}`, async () => {
    const result = await page.evaluate((n) => {
      const api = window.__ELAB_API;
      const id = api.addComponent?.(n % 2 ? 'led' : 'resistor', { x: 140 + n * 9, y: 180 + n * 6 });
      const layout = api.getLayout?.() || {};
      const state = api.getCircuitState?.() || {};
      const text = api.getCircuitDescription?.() || '';
      return {
        added: Boolean(id),
        componentCount: Array.isArray(layout.components) ? layout.components.length : 0,
        stateType: typeof state,
        descriptionType: typeof text,
      };
    }, i);

    expect(result.added).toBe(true);
    expect(result.componentCount).toBeGreaterThan(0);
    expect(result.stateType).toBe('object');
    expect(result.descriptionType).toBe('string');
  });
}

for (const viewport of [
  { width: 834, height: 1112 },
  { width: 1112, height: 834 },
  { width: 390, height: 844 },
]) {
  test(`hard viewport no white screen or major overflow ${viewport.width}x${viewport.height}`, async () => {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(250);
    const result = await page.evaluate(() => ({
      bodyLength: document.body.innerText.length,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      objectObject: document.body.innerText.includes('[object Object]'),
      autoplayAudio: document.querySelectorAll('audio[autoplay], video[autoplay]').length,
      visibleText: document.body.innerText.slice(0, 500),
    }));

    expect(result.bodyLength).toBeGreaterThan(20);
    expect(result.objectObject).toBe(false);
    expect(result.autoplayAudio).toBe(0);
    expect(result.scrollWidth).toBeLessThanOrEqual(result.innerWidth + 24);
    expect(result.visibleText).not.toMatch(/white screen|cannot read|undefined is not/i);
  });
}
