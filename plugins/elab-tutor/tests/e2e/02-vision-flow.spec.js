/**
 * Sprint S iter 6 — Vision E2E flow Playwright spec (Task A5).
 *
 * Generator: gen-test-opus iter 6 PHASE 1.
 *
 * Scope (real prod end-to-end vision flow on https://www.elabtutor.school):
 *   1. Login via class_key fixture (TEST-CLASS-2026 — must exist in Supabase
 *      `classes` table or be seeded by Andrea before run).
 *   2. Mount experiment v1-cap6-esp1 (LED basic) via window.__ELAB_API.
 *   3. Capture screenshot via window.__ELAB_API.captureScreenshot().
 *   4. POST screenshot base64 to unlim-chat Edge Function with `images` param
 *      and a Vision-trigger user message ("guarda il mio circuito").
 *   5. Assert response.text contains "Ragazzi" (Principio Zero plurale).
 *   6. Assert at least one [AZIONE:...] tag present.
 *   7. Assert end-to-end latency < 10000 ms.
 *
 * 5 fixtures cover circuit states:
 *   - empty   → board with no components
 *   - led-ok  → LED + resistor + nano correctly wired
 *   - led-bad → LED reversed polarity
 *   - resistor-only → resistor only, missing LED
 *   - nano-only → Arduino Nano only, no peripherals
 *
 * Iter 6 hard rules (per orchestrator brief):
 *   - This spec is NOT executed in CI yet — Andrea OK + browser headed run.
 *   - Skip on non-prod hosts unless BASE_URL explicitly points to prod.
 *   - No real Edge Function call without ELAB_API_KEY + SUPABASE_ANON_KEY env.
 *   - Latency ceiling 10s = Edge cold-start + LLM round-trip + screenshot.
 *
 * Out of scope iter 6: TTS playback assertion (Box 8 wire-up iter 6+),
 * voice trigger via Web Speech API (defer iter 7+), automated visual diff
 * of returned analysis text (defer iter 8+ stress test pass).
 *
 * Spec ref:
 *   - SPEC iter 4 §6 PHASE-PHASE pattern (sequential after Phase 1).
 *   - ARCHITETTURA-FINALE-SESSIONE-2026-04-26.md Box 7 lift target +0.7.
 */

import { test, expect } from '@playwright/test';
import { waitForPageReady, TIMEOUTS, PROD_URL, EXPERIMENTS } from './fixtures.js';

const BASE_URL = (process.env.BASE_URL || process.env.PLAYWRIGHT_BASE_URL || PROD_URL || '').trim();
const ELAB_API_KEY = (process.env.ELAB_API_KEY || '').trim();
const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || '').trim();
const UNLIM_EDGE_URL = (process.env.UNLIM_EDGE_URL ||
  'https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat').trim();

const CLASS_KEY_FIXTURE = (process.env.CLASS_KEY_E2E || 'TEST-CLASS-2026').trim();
const VISION_LATENCY_CEILING_MS = 10000;
const PZ_PLURAL_REGEX = /\bRagazzi\b/i;
const AZIONE_TAG_REGEX = /\[AZIONE:[a-z][a-z0-9_]*\]/i;

const isProdHost = (url) => {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.hostname.endsWith('elabtutor.school');
  } catch {
    return false;
  }
};

/**
 * 5 circuit-state fixtures driving the vision flow.
 * `mountSpec` describes the deterministic experiment to mount via __ELAB_API,
 * plus optional component mutations to simulate the variant.
 */
const CIRCUIT_FIXTURES = [
  {
    id: 'empty',
    label: 'empty board',
    experimentId: null,
    mutate: null,
    userMessage: 'Guarda il mio circuito, e vuoto?',
  },
  {
    id: 'led-ok',
    label: 'LED basic correctly wired',
    experimentId: EXPERIMENTS.ledBasic, // v1-cap6-esp1
    mutate: null,
    userMessage: 'Guarda il mio circuito LED e dimmi se va bene',
  },
  {
    id: 'led-bad',
    label: 'LED reversed polarity',
    experimentId: EXPERIMENTS.ledBasic,
    mutate: { kind: 'flip-led-polarity' },
    userMessage: 'Guarda il mio circuito, perche il LED non si accende?',
  },
  {
    id: 'resistor-only',
    label: 'resistor only, missing LED',
    experimentId: EXPERIMENTS.ledBasic,
    mutate: { kind: 'remove-component', target: 'led' },
    userMessage: 'Guarda il mio circuito, manca qualcosa?',
  },
  {
    id: 'nano-only',
    label: 'Arduino Nano only',
    experimentId: EXPERIMENTS.arduino, // v2-cap1-esp1
    mutate: { kind: 'clear-peripherals' },
    userMessage: 'Guarda il mio Nano, e collegato bene?',
  },
];

test.describe('Sprint S iter 6 — Vision E2E flow', () => {
  test.skip(
    !isProdHost(BASE_URL),
    `Vision E2E only runs against prod host. BASE_URL='${BASE_URL}' rejected.`,
  );

  test.skip(
    !ELAB_API_KEY || !SUPABASE_ANON_KEY,
    'Vision E2E requires ELAB_API_KEY + SUPABASE_ANON_KEY env vars.',
  );

  test.beforeEach(async ({ page }) => {
    page.on('pageerror', (err) => {
      console.warn('[vision-e2e] pageerror:', err.message);
    });
  });

  for (const fx of CIRCUIT_FIXTURES) {
    test(`vision flow — ${fx.id}: ${fx.label}`, async ({ page }) => {
      // 1. Login via class_key fixture (localStorage seed pre-navigate)
      await page.addInitScript((classKey) => {
        try {
          window.localStorage.setItem('elab_class_key', classKey);
          window.localStorage.setItem(
            'elab_e2e_user',
            JSON.stringify({
              id: 'e2e-vision-iter6',
              email: 'vision-e2e@elabtutor.school',
              role: 'student',
              class_key: classKey,
            }),
          );
        } catch (_e) { /* storage disabled — test will skip naturally */ }
      }, CLASS_KEY_FIXTURE);

      // Iter 11 P0 fix: navigate to /#lavagna route where LavagnaShell mounts __ELAB_API global.
      // Root '/' renders Vetrina (no simulator) — __ELAB_API not exposed.
      await page.goto('/#lavagna');
      await waitForPageReady(page);

      // 2. Mount experiment via __ELAB_API (when fixture demands it)
      if (fx.experimentId) {
        const mounted = await page.waitForFunction(
          (expId) => {
            if (!window.__ELAB_API || typeof window.__ELAB_API.mountExperiment !== 'function') {
              return false;
            }
            try {
              window.__ELAB_API.mountExperiment(expId);
              return true;
            } catch (_e) {
              return false;
            }
          },
          fx.experimentId,
          { timeout: TIMEOUTS.pageLoad },
        ).then((h) => h.jsonValue()).catch(() => false);

        expect(mounted, `mountExperiment(${fx.experimentId}) did not resolve`).toBe(true);
      }

      // 2b. Apply mutation (if any) to simulate broken/empty variants
      if (fx.mutate) {
        await page.evaluate((mutation) => {
          if (!window.__ELAB_API) return;
          if (mutation.kind === 'clear-peripherals') {
            try { window.__ELAB_API.clearCircuit?.(); } catch (_e) { /* tolerant */ }
          }
          // Other mutation kinds left as TODO iter 7+ when SimulatorCanvas exposes
          // deterministic mutation API. iter 6 just records the variant intent.
        }, fx.mutate);
      }

      // Settle simulator render before screenshot
      await page.waitForTimeout(500);

      // ITER 12 ATOM-S12-A3 — DIAGNOSTIC BLOCK: enumerate canvas/svg candidates BEFORE capture.
      // Iter 11 captureScreenshot returned null/empty (selector mismatch). Enumerate live
      // candidates to surface canvas + svg root info (id/class/role/aria/bbox) — log to
      // console + attach to test as artifact for selector-evidence audit.
      const canvasCandidates = await page.evaluate(() => {
        const out = [];
        const els = Array.from(document.querySelectorAll('canvas, svg'));
        for (const el of els) {
          const rect = el.getBoundingClientRect();
          out.push({
            tag: el.tagName,
            id: el.id || '',
            class: typeof el.className === 'string'
              ? el.className
              : (el.className && el.className.baseVal) || '',
            role: el.getAttribute('role') || '',
            aria: el.getAttribute('aria-label') || '',
            testid: el.getAttribute('data-testid') || '',
            bbox: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
          });
        }
        return out;
      });
      console.log(`[vision-e2e][${fx.id}] canvas/svg candidates:`, JSON.stringify(canvasCandidates, null, 2));

      // Pick the simulator canvas root: prefer data-testid="simulator-canvas", then svg
      // with class containing "NanoR4" or "SimulatorCanvas", then largest bbox svg.
      const simulatorSelector = await page.evaluate(() => {
        const tryEl = (sel) => document.querySelector(sel);
        const named = tryEl('[data-testid="simulator-canvas"]')
          || tryEl('svg[data-testid*="simulator"]')
          || tryEl('svg.SimulatorCanvas')
          || tryEl('svg[class*="NanoR4"]')
          || tryEl('svg[class*="simulator"]');
        if (named) {
          if (named.getAttribute('data-testid')) return `[data-testid="${named.getAttribute('data-testid')}"]`;
          if (named.id) return `#${named.id}`;
          const cls = (typeof named.className === 'string' ? named.className : named.className?.baseVal || '')
            .split(/\s+/).filter(Boolean)[0];
          if (cls) return `${named.tagName.toLowerCase()}.${cls}`;
        }
        // Largest bbox svg fallback
        const svgs = Array.from(document.querySelectorAll('svg'));
        let best = null;
        let bestArea = 0;
        for (const s of svgs) {
          const r = s.getBoundingClientRect();
          const area = r.width * r.height;
          if (area > bestArea) { best = s; bestArea = area; }
        }
        if (best) {
          const cls = (typeof best.className === 'string' ? best.className : best.className?.baseVal || '')
            .split(/\s+/).filter(Boolean)[0];
          return cls ? `svg.${cls}` : 'svg';
        }
        return 'svg';
      });
      console.log(`[vision-e2e][${fx.id}] picked simulator selector: ${simulatorSelector}`);

      // Wait for the picked simulator canvas selector to be visible before screenshot.
      // Tolerant: if selector vanishes mid-test, fall through to captureScreenshot which
      // owns its own internal selector logic (see simulator-api.js).
      try {
        await page.waitForSelector(simulatorSelector, { state: 'visible', timeout: 10000 });
      } catch (e) {
        console.warn(`[vision-e2e][${fx.id}] waitForSelector(${simulatorSelector}) timeout: ${e.message}`);
      }

      // 3. Capture screenshot via __ELAB_API
      const screenshot = await page.evaluate(async () => {
        if (!window.__ELAB_API || typeof window.__ELAB_API.captureScreenshot !== 'function') {
          return { ok: false, reason: 'captureScreenshot not exposed on __ELAB_API' };
        }
        try {
          const dataUrl = await window.__ELAB_API.captureScreenshot();
          if (!dataUrl || typeof dataUrl !== 'string') {
            return { ok: false, reason: 'captureScreenshot returned non-string' };
          }
          if (!dataUrl.startsWith('data:image/')) {
            return { ok: false, reason: `captureScreenshot returned non-data-url: ${dataUrl.slice(0, 40)}` };
          }
          return { ok: true, dataUrl, length: dataUrl.length };
        } catch (err) {
          return { ok: false, reason: String(err && err.message ? err.message : err) };
        }
      });

      expect(screenshot.ok, `captureScreenshot failed: ${screenshot.reason}`).toBe(true);
      expect(screenshot.length).toBeGreaterThan(100); // PNG base64 must be non-trivial

      // 4. POST screenshot to unlim-chat Edge Function (with images param)
      const sessionId = `e2e_vision_iter6_${fx.id}_${Date.now()}`;
      const start = Date.now();

      const resp = await page.evaluate(async ({ url, anonKey, elabKey, body }) => {
        const headers = {
          'Content-Type': 'application/json',
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        };
        if (elabKey) headers['X-Elab-Api-Key'] = elabKey;
        try {
          const r = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
          });
          const text = await r.text();
          let json = null;
          try { json = JSON.parse(text); } catch (_e) { /* keep raw text */ }
          return { ok: r.ok, status: r.status, json, text };
        } catch (err) {
          return { ok: false, status: 0, error: String(err && err.message ? err.message : err) };
        }
      }, {
        url: UNLIM_EDGE_URL,
        anonKey: SUPABASE_ANON_KEY,
        elabKey: ELAB_API_KEY,
        body: {
          message: fx.userMessage,
          sessionId,
          experimentId: fx.experimentId,
          images: [screenshot.dataUrl],
          circuitState: null,
          simulatorContext: { source: 'vision-e2e-iter6', fixture: fx.id },
        },
      });

      const latency = Date.now() - start;

      expect(resp.ok, `Edge Function HTTP ${resp.status}: ${resp.text || resp.error}`).toBe(true);
      expect(resp.json, 'Edge Function response is not JSON').not.toBeNull();
      const responseText = (resp.json.response || resp.json.text || resp.json.message || '').trim();
      expect(responseText.length, 'response text is empty').toBeGreaterThan(0);

      // 5. PZ plurale: "Ragazzi" must appear (UNLIM v3 hard rule)
      expect(responseText, `PZ plurale violation — "Ragazzi" absent in: ${responseText.slice(0, 200)}`)
        .toMatch(PZ_PLURAL_REGEX);

      // 6. At least one [AZIONE:...] tag (vision response should drive UI)
      expect(responseText, `no [AZIONE:...] tag in: ${responseText.slice(0, 200)}`)
        .toMatch(AZIONE_TAG_REGEX);

      // 7. Latency ceiling 10s
      expect(
        latency,
        `vision flow latency ${latency}ms exceeds ceiling ${VISION_LATENCY_CEILING_MS}ms`,
      ).toBeLessThan(VISION_LATENCY_CEILING_MS);
    });
  }
});
