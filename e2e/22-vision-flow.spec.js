// @ts-check
/**
 * Vision E2E — VisionButton → __ELAB_API.captureScreenshot → UNLIM analyzeImage.
 * Stub analyzeImage at network level (no real Supabase call).
 * Claude Opus 4.7 — Andrea Marro — 19/04/2026
 */
import { test, expect } from '@playwright/test';
import { setupUser, setTeacherUser } from './helpers.js';

const TINY_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
const TINY_PNG_DATA_URL = `data:image/png;base64,${TINY_PNG_BASE64}`;

async function goToLavagna(page) {
  // Sprint U Cycle 3 (2026-05-07) fix: PR #81 iter 45 B9 product change —
  // "Lavagna libera" (freeMode=true) NO LONGER mounts NewElabSimulator,
  // therefore __ELAB_API.captureScreenshot is undefined → VisionButton disabled.
  // Per Andrea verbatim: "Lavagna libera" = solo UNLIM + manuale + capitoli + video.
  // Vision E2E needs simulator → mount via experiment selection instead.
  await page.goto('/#lavagna');
  // ExperimentPicker auto-opens on lavagna route entry. Click first lesson card
  // (Volume 1 default tab "Accendi il LED" cap6 has 3 esperimenti — auto-handleSelect
  // first via lesson card click when expanded; here we click first esp directly via
  // chapter view to avoid expand step).
  const tutti = page.getByRole('button', { name: /Tutti gli esperimenti/i });
  await expect(tutti).toBeVisible({ timeout: 15000 });
  await tutti.click();
  // Click first experiment "Accendi il tuo primo LED" (v1-cap6-esp1)
  const firstExp = page.getByText(/Accendi il tuo primo LED/i).first();
  await expect(firstExp).toBeVisible({ timeout: 5000 });
  await firstExp.click();
  // Wait for simulator + __ELAB_API exposure
  await page.waitForFunction(
    () => typeof window.__ELAB_API?.captureScreenshot === 'function',
    null,
    { timeout: 15000 },
  );
}

async function stubVisionInfra(page) {
  // Stub captureScreenshot on __ELAB_API once it exists.
  await page.addInitScript((dataUrl) => {
    const tryPatch = () => {
      const api = window.__ELAB_API;
      if (api && typeof api.captureScreenshot !== 'function') {
        api.captureScreenshot = async () => dataUrl;
      } else if (api && typeof api.captureScreenshot === 'function') {
        api.captureScreenshot = async () => dataUrl;
      }
    };
    tryPatch();
    const interval = setInterval(() => {
      if (window.__ELAB_API) { tryPatch(); clearInterval(interval); }
    }, 100);
    setTimeout(() => clearInterval(interval), 20000);
  }, TINY_PNG_DATA_URL);

  // Stub Supabase unlim-chat edge function response to avoid real AI call.
  // Body shape must include `success: true` and `response` — tryNanobot() in
  // src/services/api.js returns null otherwise (causing fallback cascade).
  const stubBody = JSON.stringify({
    success: true,
    response: 'Ragazzi, il circuito sembra in ordine! LED collegato bene come spiega il Vol. 1.',
    model: 'stub',
    tokens: 0,
  });
  await page.route(/.*functions\/v1\/unlim-chat.*/, async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: stubBody });
  });
  // Defensive: also stub Render fallback /chat and local server probe so the
  // response cascade lands on our stub deterministically.
  await page.route(/elab-galileo\.onrender\.com\/.*/, async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: stubBody });
  });
  await page.route(/localhost:8000\/.*/, async (route) => {
    await route.fulfill({ status: 503, contentType: 'application/json', body: '{}' });
  });
}

// ── iter 103 Sprint A-i (2026-05-21): test.describe.fixme ──────────────────
// VisionButton è dead code: zero import / zero `<VisionButton` JSX in src/.
// Il tag fu rimosso ~2026-05-12 (iter 39, commit aad961d3 "Pure Gemini chat
// decision") — combacia con "CI E2E rossa dal 12/05". La feature vision vive
// ora via chatbot (ChatbotChatPanel.sendVision). Questi 5 test asseriscono un
// bottone non più montato → fail garantito. fixme = marker onesto (spec ROTTO,
// non skip arbitrario). Da risolvere: re-wire VisionButton OPPURE riscrivere
// lo spec per il flusso chat-vision OPPURE cancellare. Andrea iter 103 ratify.
test.describe.fixme('Vision E2E — VisionButton → UNLIM', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
    await setTeacherUser(page);
    await stubVisionInfra(page);
  });

  test('VisionButton visible with label "Guarda il mio circuito"', async ({ page }) => {
    await goToLavagna(page);
    const btn = page.getByRole('button', { name: /Guarda il mio circuito/i });
    await expect(btn).toBeVisible({ timeout: 15000 });
  });

  test('clicking VisionButton dispatches elab-vision-capture event', async ({ page }) => {
    await goToLavagna(page);
    await page.evaluate(() => {
      window.__visionEvents = [];
      window.addEventListener('elab-vision-capture', (e) => {
        window.__visionEvents.push(e.detail || {});
      });
    });
    const btn = page.getByRole('button', { name: /Guarda il mio circuito/i });
    await expect(btn).toBeVisible({ timeout: 15000 });
    await btn.click();
    await expect.poll(
      async () => page.evaluate(() => (window.__visionEvents || []).length),
      { timeout: 5000 }
    ).toBeGreaterThan(0);
    const event = await page.evaluate(() => window.__visionEvents[0]);
    expect(event.base64).toContain('iVBOR');
    expect(event.mimeType).toBe('image/png');
  });

  test('Principio Zero v3: button label uses plural Italian, no "Docente leggi"', async ({ page }) => {
    await goToLavagna(page);
    const btn = page.getByRole('button', { name: /Guarda il mio circuito/i });
    await expect(btn).toBeVisible({ timeout: 15000 });
    const ariaLabel = await btn.getAttribute('aria-label');
    expect(ariaLabel).toMatch(/Guarda il mio circuito/i);
    expect(ariaLabel).not.toMatch(/Docente,\s*leggi/i);
    expect(ariaLabel).not.toMatch(/Insegnante,\s*leggi/i);
  });

  test('captureScreenshot contract: returns data URL or null', async ({ page }) => {
    await goToLavagna(page);
    // Ensure VisionButton is mounted so __ELAB_API presence was already confirmed by the other specs
    const btn = page.getByRole('button', { name: /Guarda il mio circuito/i });
    await expect(btn).toBeVisible({ timeout: 15000 });
    // Click dispatches capture (populates state), then we invoke captureScreenshot directly
    await btn.click();
    const result = await page.evaluate(async () => {
      const api = window.__ELAB_API;
      if (!api || typeof api.captureScreenshot !== 'function') return '__missing__';
      try {
        const out = await api.captureScreenshot();
        return out === null || out === undefined ? null : String(out);
      } catch {
        return '__threw__';
      }
    });
    // Documented contract: either a data URL string or null
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^data:image\//);
    }
  });

  test('mocked UNLIM response body renders in chat UI', async ({ page }) => {
    await goToLavagna(page);
    const btn = page.getByRole('button', { name: /Guarda il mio circuito/i });
    await expect(btn).toBeVisible({ timeout: 15000 });
    // Click triggers: capture event → useGalileoChat listener → analyzeImage → /unlim-chat (stubbed).
    // LavagnaShell.handleVisionResult also opens the galileo panel so the ChatOverlay mounts.
    await btn.click();
    // Response text from stubVisionInfra L44 must surface in DOM within 10s
    // If the current UI does not render the mocked response (backend/feature gap), this will
    // fail with a clear Playwright timeout — we do NOT relax the assertion to fake green.
    await expect(
      page.getByText(/Ragazzi, il circuito/i).first()
    ).toBeVisible({ timeout: 10000 });
  });
});
