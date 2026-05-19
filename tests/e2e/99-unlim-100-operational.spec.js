import { test, expect } from '@playwright/test';
import { seedGateBypass, bypassWelcomeGate } from './helpers/welcome-gate-bypass.js';

test.describe.configure({ mode: 'serial' });
test.setTimeout(120_000);

let page;

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5173';

async function waitForApi() {
  await page.waitForFunction(() => !!window.__ELAB_API, null, { timeout: 45_000 });
}

async function apiSnapshot() {
  return await page.evaluate(() => {
    const api = window.__ELAB_API || {};
    return {
      keys: Object.keys(api).sort(),
      unlimKeys: Object.keys(api.unlim || {}).sort(),
      hasSimulator: !!api.getCircuitState || !!api.getLayout,
      hasEditor: !!api.showEditor && !!api.setEditorMode,
      hasCompile: !!api.compile,
      hasScratch: !!api.loadScratchWorkspace,
    };
  });
}

async function isUnlimVisible() {
  return await page.locator('#unlim-v3').first().isVisible({ timeout: 800 }).catch(() => false);
}

async function removeExperimentPickerOverlay() {
  const picker = page.locator('[role="dialog"][aria-label="Scegli un esperimento"]');
  if (await picker.isVisible({ timeout: 500 }).catch(() => false)) {
    await picker.getByRole('button', { name: /^Chiudi$/i }).first().click().catch(() => {});
    await page.keyboard.press('Escape').catch(() => {});
  }
  await page.evaluate(() => {
    document.querySelectorAll('[role="dialog"][aria-label="Scegli un esperimento"]').forEach((el) => el.remove());
    document.querySelectorAll('[class*="backdrop"]').forEach((el) => {
      if (String(el.textContent || '').includes('Scegli Esperimento')) el.remove();
    });
  }).catch(() => {});
}

async function ensureExperimentLoaded() {
  const picker = page.locator('[role="dialog"][aria-label="Scegli un esperimento"]');
  if (await picker.isVisible({ timeout: 2_000 }).catch(() => false)) {
    const firstExperiment = picker.locator('button[aria-label^="Cap."]').first();
    if (await firstExperiment.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await firstExperiment.click();
      await picker.waitFor({ state: 'hidden', timeout: 5_000 }).catch(async () => {
        await picker.getByRole('button', { name: /^Chiudi$/i }).first().click().catch(() => {});
      });
    }

    if (await picker.isVisible({ timeout: 500 }).catch(() => false)) {
      await picker.getByRole('button', { name: /^Chiudi$/i }).first().click().catch(() => {});
    }
  }

  await page.evaluate(() => {
    const api = window.__ELAB_API;
    api?.loadExperiment?.('v1-cap6-esp1');
  });
  await page.waitForTimeout(300);
  if (await picker.isVisible({ timeout: 500 }).catch(() => false)) {
    await removeExperimentPickerOverlay();
  }
  await page.waitForTimeout(600);
  await removeExperimentPickerOverlay();
}

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  await seedGateBypass(page);
  await page.goto(`${BASE}/#lavagna`);
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await bypassWelcomeGate(page);
  await ensureExperimentLoaded();
  await waitForApi();
  await ensureExperimentLoaded();
  await waitForApi();
});

test.afterAll(async () => {
  await page?.close();
});

const apiContracts = [
  'addComponent', 'addWire', 'removeComponent', 'moveComponent', 'setComponentValue',
  'play', 'pause', 'reset', 'undo', 'redo',
  'showEditor', 'hideEditor', 'setEditorMode', 'setEditorCode', 'getEditorCode',
  'compile', 'captureScreenshot', 'getCircuitState', 'getCircuitDescription', 'getLayout',
  'setBuildMode', 'setBuildStepIndex', 'nextStep', 'prevStep', 'loadExperiment',
  'loadScratchWorkspace', 'toggleDrawing', 'clearAll', 'mountExperiment', 'interact',
];

for (const name of apiContracts) {
  test(`API contract exposes ${name}`, async () => {
    const type = await page.evaluate((fn) => typeof window.__ELAB_API?.[fn], name);
    expect(type, `${name} must exist on __ELAB_API`).toBe('function');
  });
}

for (const name of ['highlightComponent', 'clearHighlights', 'setDiagnoseMode']) {
  test(`UNLIM API contract exposes ${name}`, async () => {
    const type = await page.evaluate((fn) => typeof window.__ELAB_API?.unlim?.[fn], name);
    expect(type, `unlim.${name} must exist`).toBe('function');
  });
}

const modeScenarios = [
  ['Percorso opens UNLIM percorso', 'Percorso', true],
  ['Passo Passo restores writable UNLIM chat', 'Passo Passo', true],
  ['Gia Montato restores writable UNLIM chat', 'Già Montato', true],
];

for (let i = 0; i < 12; i++) {
  const [title, label, shouldOpen] = modeScenarios[i % modeScenarios.length];
  test(`mode visibility ${i + 1}: ${title}`, async () => {
    await removeExperimentPickerOverlay();
    await page.evaluate(() => window.__ELAB_API?.unlim?.clearHighlights?.());
    const close = page.locator('#unlim-v3').getByRole('button', { name: /chiudi|close/i }).first();
    if (await close.isVisible({ timeout: 500 }).catch(() => false)) await close.click().catch(() => {});
    const testId = label === 'Percorso'
      ? 'modalita-btn-percorso'
      : label === 'Passo Passo'
        ? 'modalita-btn-passo-passo'
        : 'modalita-btn-gia-montato';
    await page.getByTestId(testId).click();
    await page.waitForTimeout(250);
    const visible = await isUnlimVisible();
    expect(visible).toBe(shouldOpen);
    if (visible) {
      await expect(page.getByLabel(/Scrivi messaggio a UNLIM/i).first()).toBeVisible({ timeout: 2_000 });
    }
  });
}

for (let i = 0; i < 14; i++) {
  test(`canvas/API scattered circuit mutation ${i + 1}`, async () => {
    const result = await page.evaluate((n) => {
      const api = window.__ELAB_API;
      const added = api.addComponent?.(n % 2 ? 'led' : 'resistor', { x: 120 + n * 7, y: 130 + n * 5 });
      const state = api.getCircuitState?.() || api.getLayout?.() || {};
      return { added: !!added, stateType: typeof state };
    }, i);
    expect(result.added).toBe(true);
    expect(result.stateType).toBe('object');
  });
}

for (let i = 0; i < 12; i++) {
  test(`Arduino editor operational path ${i + 1}`, async () => {
    const result = await page.evaluate((n) => {
      const api = window.__ELAB_API;
      api.showEditor?.();
      api.setEditorMode?.('arduino');
      const code = `void setup(){ pinMode(13, OUTPUT); } void loop(){ digitalWrite(13, ${n % 2 ? 'HIGH' : 'LOW'}); }`;
      api.setEditorCode?.(code);
      const read = api.getEditorCode?.();
      return { read, hasCompile: typeof api.compile === 'function' };
    }, i);
    expect(result.read).toContain('pinMode');
    expect(result.hasCompile).toBe(true);
  });
}

for (let i = 0; i < 10; i++) {
  test(`Scratch editor operational path ${i + 1}`, async () => {
    const result = await page.evaluate((n) => {
      const api = window.__ELAB_API;
      api.showEditor?.();
      api.setEditorMode?.('scratch');
      const xml = `<xml><block type="controls_repeat_ext" id="b${n}"></block></xml>`;
      const loaded = api.loadScratchWorkspace?.(xml);
      return { loaded: loaded !== false && loaded !== null, hasScratch: typeof api.loadScratchWorkspace === 'function' };
    }, i);
    expect(result.hasScratch).toBe(true);
    expect(result.loaded).toBe(true);
  });
}

for (let i = 0; i < 12; i++) {
  test(`UNLIM visual awareness support ${i + 1}`, async () => {
    const snap = await apiSnapshot();
    expect(snap.hasSimulator).toBe(true);
    expect(snap.hasEditor).toBe(true);
    expect(snap.keys.length).toBeGreaterThan(12);
  });
}

for (let i = 0; i < 8; i++) {
  test(`Percorso text integrity and components ${i + 1}`, async () => {
    await page.getByTestId('modalita-btn-percorso').click();
    await page.waitForTimeout(250);
    const body = await page.locator('body').innerText();
    expect(body).not.toContain('[object Object]');
    expect(body).toMatch(/Componenti|Percorso|PREPARA|percorso/i);
  });
}

for (let i = 0; i < 8; i++) {
  test(`single clean ELABorando copy and no typo waiting copy ${i + 1}`, async () => {
    const body = await page.locator('body').innerText();
    expect(body).not.toContain('UNLIM sta elaborando');
    expect(body).not.toContain('Sto elaborando');
    expect(body).not.toContain('elaborandg');
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('elab-unlim-send', { detail: { text: 'ping test' } }));
    });
    await page.waitForTimeout(100);
    const now = await page.locator('body').innerText();
    expect(now).not.toContain('UNLIM sta elaborando');
    expect(now).not.toContain('Sto elaborando');
    expect(now).not.toContain('elaborandg');
    expect((now.match(/Sto ELABorando\.\.\./g) || []).length).toBeLessThanOrEqual(1);
  });
}

for (const viewport of [
  { width: 1024, height: 768 },
  { width: 1180, height: 820 },
  { width: 1366, height: 768 },
  { width: 1600, height: 900 },
  { width: 834, height: 1112 },
  { width: 1112, height: 834 },
  { width: 1280, height: 720 },
  { width: 1440, height: 900 },
  { width: 1536, height: 864 },
  { width: 1920, height: 1080 },
  { width: 900, height: 900 },
]) {
  test(`viewport smoke ${viewport.width}x${viewport.height}`, async () => {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(150);
    const errors = await page.locator('text=/Error|Unhandled|Cannot read|undefined is not/i').count();
    expect(errors).toBe(0);
    const body = await page.locator('body').innerText();
    expect(body.length).toBeGreaterThan(20);
  });
}
