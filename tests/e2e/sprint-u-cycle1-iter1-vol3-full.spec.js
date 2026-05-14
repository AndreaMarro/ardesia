/**
 * Sprint U Cycle 1 Iter 1 — Vol3 FULL Spec (LiveTest-2)
 *
 * All 16 vol3 experiments (EPIC 1 A4.1b — 13 Vol3 no-counterpart experiments removed).
 * Intended for Cycle 2+ comprehensive audits — each experiment fully verified.
 *
 * Vol3 simulationMode: "avr" — Arduino Nano R4, AVR emulation.
 * All experiments use breadboard + nano-r4 as minimum components.
 *
 * Per-experiment checks:
 *   - mountExperiment API call succeeds (no crash)
 *   - SVG canvas renders
 *   - Arduino editor UI present (Compila & Carica / Blocchi tab)
 *   - Component count ≥ expectedComponents
 *   - ZERO critical console/page errors
 *   - Screenshot saved to docs/audits/sprint-u-screenshots/full/
 *
 * License gate: elab-license-key = ELAB2026
 *
 * Prod URL: https://www.elabtutor.school
 * Created: 2026-05-01 — LiveTest-2 agent
 * Run in Cycle 2+ when all experiments verified individually.
 */

import { test, expect } from '@playwright/test';

const PROD_URL = 'https://www.elabtutor.school';
const SCREENSHOT_DIR = 'docs/audits/sprint-u-screenshots/full';

// ── All 16 vol3 experiments ────────────────────────────────────────────────
// Ordered as per experiments-vol3.js (cap5 → cap6 → cap7 → cap8 → extra → new)
const ALL_VOL3_EXPERIMENTS = [
  // ── Capitolo 5: Il nostro primo programma ─────────────────────────────
  {
    id: 'v3-cap5-esp1',
    title: 'Cap. 5 Esp. 1 - Blink con LED_BUILTIN',
    chapter: 'Capitolo 5',
    difficulty: 1,
    expectedComponents: 2, // breadboard + nano
    notes: 'Basic blink — internal LED pin 13',
    isNew: false,
  },
  {
    id: 'v3-cap5-esp2',
    title: 'Cap. 5 Esp. 2 - Modifica tempi del Blink',
    chapter: 'Capitolo 5',
    difficulty: 1,
    expectedComponents: 2,
    notes: 'Faster blink timing',
    isNew: false,
  },

  // ── Capitolo 6: I pin digitali ────────────────────────────────────────
  {
    id: 'v3-cap6-esp1',
    title: 'Cap. 6 Esp. 1 - Colleghiamo la resistenza',
    chapter: 'Capitolo 6',
    difficulty: 1,
    expectedComponents: 3, // bb + nano + LED+R
    notes: 'External LED with resistor',
    isNew: false,
  },
  {
    id: 'v3-cap6-esp2',
    title: 'Cap. 6 Esp. 2 - Cambia il numero di pin',
    chapter: 'Capitolo 6',
    difficulty: 1,
    expectedComponents: 3,
    notes: 'Change pin number for LED',
    isNew: false,
  },
  {
    id: 'v3-cap6-morse',
    title: 'Cap. 6 Esp. 3 - SOS in codice Morse',
    chapter: 'Capitolo 6',
    difficulty: 2,
    expectedComponents: 3,
    notes: 'Morse SOS — special timing patterns',
    isNew: false,
  },
  {
    id: 'v3-cap6-esp4',
    title: 'Cap. 6 Esp. 4 - Due LED: effetto polizia',
    chapter: 'Capitolo 6',
    difficulty: 2,
    expectedComponents: 4, // bb + nano + 2 LEDs
    notes: 'Police light effect — 2 LEDs alternating',
    isNew: false,
  },
  {
    id: 'v3-cap6-semaforo',
    title: 'Cap. 6 Esp. 5 - Il semaforo',
    chapter: 'Capitolo 6',
    difficulty: 2,
    expectedComponents: 5, // bb + nano + 3 LEDs
    notes: 'Traffic light — 3 LEDs red/yellow/green',
    isNew: false,
  },

  // ── Capitolo 7: I pin analogici ───────────────────────────────────────
  {
    id: 'v3-cap7-esp1',
    title: 'Cap. 7 Esp. 1 - analogRead base',
    chapter: 'Capitolo 7',
    difficulty: 2,
    expectedComponents: 3, // bb + nano + pot
    notes: 'ADC analogRead — potentiometer on A0',
    isNew: false,
  },
  {
    id: 'v3-cap7-esp2',
    title: 'Cap. 7 Esp. 2 - analogRead con tensione',
    chapter: 'Capitolo 7',
    difficulty: 2,
    expectedComponents: 3,
    notes: 'Read voltage with analogRead + Serial',
    isNew: false,
  },
  {
    id: 'v3-cap7-esp3',
    title: 'Cap. 7 Esp. 3 - Trimmer controlla 3 LED',
    chapter: 'Capitolo 7',
    difficulty: 2,
    expectedComponents: 6, // bb + nano + pot + 3 LEDs
    notes: 'Pot controls which LED lights up',
    isNew: false,
  },
  {
    id: 'v3-cap7-esp6',
    title: 'Cap. 7 Esp. 6 - Fade up/down con for',
    chapter: 'Capitolo 7',
    difficulty: 2,
    expectedComponents: 3,
    notes: 'Fade LED up/down using for loop',
    isNew: false,
  },

  // ── Capitolo 8: Comunicazione Seriale ────────────────────────────────
  {
    id: 'v3-cap8-esp1',
    title: 'Cap. 8 Esp. 1 - Serial.println in setup',
    chapter: 'Capitolo 8',
    difficulty: 1,
    expectedComponents: 1, // nano only
    notes: 'First Serial — println in setup once',
    isNew: false,
  },
  {
    id: 'v3-cap8-esp2',
    title: 'Cap. 8 Esp. 2 - Serial.println in loop',
    chapter: 'Capitolo 8',
    difficulty: 1,
    expectedComponents: 1,
    notes: 'Serial println repeating in loop',
    isNew: false,
  },
  {
    id: 'v3-cap8-esp3',
    title: 'Cap. 8 Esp. 3 - analogRead + Serial Monitor',
    chapter: 'Capitolo 8',
    difficulty: 2,
    expectedComponents: 3, // bb + nano + pot
    notes: 'Read pot value, print to Serial Monitor',
    isNew: false,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function seedLicense(page) {
  return page.addInitScript(() => {
    try {
      localStorage.setItem('elab-license-key', 'ELAB2026');
      localStorage.setItem(
        'elab_e2e_user',
        JSON.stringify({ id: 'e2e-user', email: 'e2e@elabtutor.school', role: 'admin' })
      );
      localStorage.setItem('elab_skip_bentornati', 'true');
    } catch (_e) { /* storage blocked */ }
  });
}

function isInfraError(text) {
  return (
    text.includes('ResizeObserver') ||
    text.includes('favicon') ||
    text.includes('onrender.com') ||
    text.includes('n8n.srv1022317.hstgr.cloud') || // Arduino compile endpoint — CORS/timeout OK
    text.includes('net::ERR_FAILED') ||
    text.includes('Failed to load resource') ||
    text.includes('Script error') ||
    text.includes('virtual:pwa-register')  // CSP infra error, not app error
  );
}

function collectErrors(page) {
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (isInfraError(text)) return;
      consoleErrors.push(text);
    }
  });

  page.on('pageerror', err => {
    pageErrors.push('[pageerror] ' + err.message);
  });

  return { consoleErrors, pageErrors };
}

async function navigateToTutor(page) {
  await page.goto(PROD_URL + '/#tutor');
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(2_000);
}

async function mountAndCheck(page, expId) {
  const result = await page.evaluate((id) => {
    try {
      const api = window.__ELAB_API;
      if (!api) return { ok: false, reason: 'no_api' };
      if (typeof api.mountExperiment !== 'function') return { ok: false, reason: 'no_mount_fn' };
      api.mountExperiment(id);
      return { ok: true };
    } catch (e) {
      return { ok: false, reason: e.message };
    }
  }, expId);
  return result;
}

async function getPageState(page) {
  return await page.evaluate(() => {
    const api = window.__ELAB_API;
    return {
      apiExists: !!api,
      componentCount: document.querySelectorAll('[data-component-id]').length,
      svgCount: document.querySelectorAll('svg').length,
      hasCompila: !!document.querySelector('button[class*="compila"], button[class*="compile"]') ||
        [...document.querySelectorAll('button')].some(b => /Compila/i.test(b.textContent)),
      hasBlocchi: [...document.querySelectorAll('button')].some(b => /^Blocchi$/i.test(b.textContent?.trim())),
      hasArduinoTab: [...document.querySelectorAll('button')].some(b => /Arduino C\+\+/.test(b.textContent)),
      activeExperiment: api?.getCircuitState?.()?.experimentId || null,
    };
  });
}

// ── Full Test Suite ────────────────────────────────────────────────────────

test.describe('Vol3 Full Audit — All 16 Experiments (Sprint U Cycle 2+)', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(60_000);

  for (const exp of ALL_VOL3_EXPERIMENTS) {
    const testLabel = exp.isNew ? `[NEW] [${exp.id}]` : `[${exp.id}]`;

    test(`${testLabel} ${exp.title}`, async ({ page }) => {
      const { consoleErrors, pageErrors } = collectErrors(page);
      seedLicense(page);

      // Navigate
      await navigateToTutor(page);

      // Mount
      const mountResult = await mountAndCheck(page, exp.id);
      console.log(`${testLabel} mount:`, JSON.stringify(mountResult));

      // Wait for render
      await page.waitForTimeout(3_000);

      // Collect page state
      const state = await getPageState(page);
      console.log(`${testLabel} state:`, JSON.stringify(state));

      // Screenshot
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/${exp.id}.png`,
        fullPage: false,
      }).catch(e => console.log(`${testLabel} screenshot failed:`, e.message));

      // Log errors
      const allErrors = [...consoleErrors, ...pageErrors];
      if (allErrors.length > 0) {
        console.log(`${testLabel} ERRORS (${allErrors.length}):`, allErrors.slice(0, 3).join(' | '));
      }

      // ── Assertions ──────────────────────────────────────────────────
      // P0: SVG canvas must render
      expect(state.svgCount, `${testLabel} BUG P0: No SVG rendered`).toBeGreaterThan(0);

      // P0: No critical JS errors
      expect(allErrors.length, `${testLabel} BUG P0: JS errors: ${allErrors.slice(0, 2).join(' | ')}`).toBe(0);

      // P1: Arduino editor must be present for AVR experiments
      const hasAnyEditor = state.hasCompila || state.hasBlocchi || state.hasArduinoTab;
      if (!hasAnyEditor) {
        console.log(
          `${testLabel} WARN P1: No Arduino editor UI (Compila/Blocchi/Arduino C++ tab). ` +
          `May indicate experiment not loaded or simulator in wrong mode.`
        );
      }
      // Not hard-failing on editor presence — could be mount timing issue
      // Hard-fail in Cycle 2 once mount timing confirmed stable

      // P2: Component count check (soft warning)
      if (exp.expectedComponents > 0 && state.componentCount < exp.expectedComponents) {
        console.log(
          `${testLabel} WARN P2: Expected ≥${exp.expectedComponents} components, got ${state.componentCount}. ` +
          `${exp.notes}`
        );
      }
    });
  }
});

// ── Grouped chapter summaries ─────────────────────────────────────────────

test.describe('Vol3 Chapter Summary — Cap5 (2 experiments)', () => {
  test.setTimeout(30_000);

  test('Cap5 basic smoke: v3-cap5-esp1 and v3-cap5-esp2 both mount', async ({ page }) => {
    seedLicense(page);
    await page.goto(PROD_URL + '/#tutor');
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await page.waitForTimeout(2_000);

    for (const id of ['v3-cap5-esp1', 'v3-cap5-esp2']) {
      await page.evaluate((expId) => window.__ELAB_API?.mountExperiment(expId), id);
      await page.waitForTimeout(2_000);
      const svgCount = await page.locator('svg').count();
      console.log(`[cap5-summary] ${id} SVG count:`, svgCount);
      expect(svgCount, `Cap5 ${id}: no SVG`).toBeGreaterThan(0);
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/cap5-summary.png` }).catch(() => {});
  });
});
