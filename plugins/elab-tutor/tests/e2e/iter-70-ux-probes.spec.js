/**
 * ELAB Quality Harness Phase 1 — UX Probes 5 Personas
 * iter 70 Team E — 2026-05-19
 *
 * Playwright UX probe specs for 5 personas × 5 canonical scenarios
 *
 * PERSONAS:
 *   P1 — docente primaria (primary school teacher, less technical)
 *   P2 — docente media 1 anno (1st year middle school teacher)
 *   P3 — docente media 3 anno (3rd year, more experienced)
 *   P4 — studente curioso (curious student watching LIM)
 *   P5 — studente disengaged (disengaged student, off-task)
 *
 * SCENARIOS (5 canonical):
 *   S1 — open Lavagna (click toolbar/menu to open lavagna)
 *   S2 — select capitolo (choose a chapter from lesson path)
 *   S3 — read UNLIM response (open tutor + read AI reply)
 *   S4 — ask "non ho capito" (request clarification)
 *   S5 — click esperimento (open an experiment)
 *
 * Usage:
 *   npx playwright test tests/e2e/iter-70-ux-probes.spec.js
 *   BASE_URL=http://localhost:5173 npx playwright test tests/e2e/iter-70-ux-probes.spec.js
 */

import { test, expect } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE_URL = process.env.BASE_URL || 'https://www.elabtutor.school';
const PROBE_TIMEOUT = parseInt(process.env.PROBE_TIMEOUT || '20000', 10);
const OUTPUT_DIR = resolve(process.cwd(), 'docs/audits');
const UX_RESULTS_FILE = resolve(OUTPUT_DIR, '2026-05-19-iter-70-ux-probes-results.json');

// ----------------------------------------------------------------
// Persona definitions
// ----------------------------------------------------------------

const PERSONAS = [
  {
    id: 'P1',
    name: 'docente-primaria',
    label: 'Docente Primaria',
    description: 'Primary school teacher, less technical, first ELAB session',
    viewport: { width: 1280, height: 720 }, // LIM typical resolution
    techLevel: 'beginner',
  },
  {
    id: 'P2',
    name: 'docente-media1',
    label: 'Docente Media 1° anno',
    description: '1st year middle school teacher, moderate tech comfort',
    viewport: { width: 1366, height: 768 },
    techLevel: 'intermediate',
  },
  {
    id: 'P3',
    name: 'docente-media3',
    label: 'Docente Media 3° anno',
    description: '3rd year middle school teacher, experienced with ELAB',
    viewport: { width: 1920, height: 1080 }, // High-res LIM
    techLevel: 'experienced',
  },
  {
    id: 'P4',
    name: 'studente-curioso',
    label: 'Studente Curioso',
    description: 'Curious student viewing LIM screen, engaged',
    viewport: { width: 1280, height: 720 },
    techLevel: 'student',
  },
  {
    id: 'P5',
    name: 'studente-disengaged',
    label: 'Studente Disengaged',
    description: 'Disengaged student, may try off-topic interactions',
    viewport: { width: 375, height: 667 }, // Mobile viewport (own device)
    techLevel: 'student',
  },
];

// Accumulated probe results
const probeResults = [];

// ----------------------------------------------------------------
// Helper: record a probe result
// ----------------------------------------------------------------

function recordProbe(persona, scenario, status, details = {}) {
  probeResults.push({
    persona: persona.id,
    personaName: persona.name,
    scenario,
    status, // 'pass' | 'fail' | 'skip' | 'warn'
    timestamp: new Date().toISOString(),
    ...details,
  });
}

// ----------------------------------------------------------------
// Helper: safe navigation with timeout
// ----------------------------------------------------------------

async function safeNavigate(page, url, timeout = PROBE_TIMEOUT) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
    await page.waitForTimeout(1500); // allow hydration
    return true;
  } catch (err) {
    console.warn(`[ux-probes] Navigation failed: ${url} — ${err.message}`);
    return false;
  }
}

// ----------------------------------------------------------------
// Helper: check if element exists without throwing
// ----------------------------------------------------------------

async function elementExists(page, selector, timeout = 5000) {
  try {
    await page.locator(selector).waitFor({ timeout });
    return true;
  } catch {
    return false;
  }
}

// ----------------------------------------------------------------
// Helper: safe click without throwing
// ----------------------------------------------------------------

async function safeClick(page, selector, timeout = 5000) {
  try {
    const el = page.locator(selector).first();
    await el.waitFor({ timeout });
    await el.click({ timeout });
    return true;
  } catch {
    return false;
  }
}

// ----------------------------------------------------------------
// Scenario implementations
// ----------------------------------------------------------------

/** S1: Open Lavagna — navigate to /#lavagna and verify it loads */
async function scenarioOpenLavagna(page, persona) {
  const navigated = await safeNavigate(page, `${BASE_URL}/#lavagna`);
  if (!navigated) {
    return { status: 'fail', error: 'Navigation failed' };
  }

  // Check for lavagna-specific UI elements
  const hasLavagna = await elementExists(page, '[class*="lavagna"], [data-testid="lavagna"], #lavagna-root, canvas', 5000);
  // Also check for page content (not blank)
  const hasContent = await page.evaluate(() => document.body.textContent.trim().length > 50);

  const status = hasContent ? 'pass' : 'warn';
  return {
    status,
    hasLavagnaElement: hasLavagna,
    hasPageContent: hasContent,
    note: hasLavagna ? 'Lavagna element found' : 'No specific lavagna element detected (may use hash routing)',
  };
}

/** S2: Select capitolo — check chapter selector exists on tutor route */
async function scenarioSelectCapitolo(page, persona) {
  const navigated = await safeNavigate(page, `${BASE_URL}/#tutor`);
  if (!navigated) {
    return { status: 'fail', error: 'Navigation to #tutor failed' };
  }

  // Look for capitolo/chapter picker UI
  const hasChapterPicker = await elementExists(
    page,
    '[class*="capitolo"], [class*="chapter"], [data-testid="chapter-picker"], [aria-label*="capitolo"], [aria-label*="chapter"]',
    5000
  );

  // Also check for any list/menu that might be chapter selection
  const hasListItems = await elementExists(page, 'ul li, [role="listitem"], [role="option"]', 5000);

  const status = hasChapterPicker || hasListItems ? 'pass' : 'warn';
  return {
    status,
    hasChapterPicker,
    hasListItems,
    note: hasChapterPicker ? 'Chapter picker found' : 'Chapter picker not found with expected selectors',
  };
}

/** S3: Read UNLIM response — open tutor and look for UNLIM chat area */
async function scenarioReadUnlim(page, persona) {
  const navigated = await safeNavigate(page, `${BASE_URL}/#tutor`);
  if (!navigated) {
    return { status: 'fail', error: 'Navigation to #tutor failed' };
  }

  // Check for UNLIM/AI chat elements
  const hasChat = await elementExists(
    page,
    '[class*="chat"], [class*="unlim"], [class*="galileo"], [data-testid="chat"], [aria-label*="UNLIM"]',
    5000
  );

  // Check for message input
  const hasInput = await elementExists(
    page,
    'input[type="text"], textarea, [contenteditable="true"]',
    5000
  );

  // Check for any AI response area
  const hasMsgArea = await elementExists(
    page,
    '[class*="message"], [class*="reply"], [class*="bubble"], [class*="response"]',
    5000
  );

  const status = hasChat || hasInput ? 'pass' : 'warn';
  return {
    status,
    hasChat,
    hasInput,
    hasMsgArea,
    note: hasChat ? 'UNLIM chat area found' : 'UNLIM elements not found with expected selectors',
  };
}

/** S4: Ask "non ho capito" — type clarification request in UNLIM chat */
async function scenarioAskNonHoCapito(page, persona) {
  const navigated = await safeNavigate(page, `${BASE_URL}/#tutor`);
  if (!navigated) {
    return { status: 'fail', error: 'Navigation failed' };
  }

  // Find input field
  const inputSelectors = [
    'input[type="text"]',
    'textarea',
    '[contenteditable="true"]',
    '[placeholder*="scrivi"]',
    '[placeholder*="domanda"]',
    '[aria-label*="messaggio"]',
  ];

  let foundInput = false;
  for (const sel of inputSelectors) {
    if (await elementExists(page, sel, 2000)) {
      foundInput = true;
      try {
        // Type "non ho capito" — simulates student/teacher clarification request
        await page.locator(sel).first().click({ timeout: 3000 });
        await page.keyboard.type('non ho capito', { delay: 30 });

        // Verify text was typed
        const value = await page.evaluate((s) => {
          const el = document.querySelector(s);
          return el?.value || el?.textContent?.trim() || '';
        }, sel);

        return {
          status: value.toLowerCase().includes('non ho capito') ? 'pass' : 'warn',
          inputFound: true,
          inputSelector: sel,
          textTyped: value.length > 0,
          note: 'Typed "non ho capito" in chat input',
        };
      } catch (err) {
        // Try next selector
        continue;
      }
    }
  }

  return {
    status: 'warn',
    inputFound: foundInput,
    note: 'Could not type in chat input — may require auth or specific app state',
  };
}

/** S5: Click esperimento — find and click an experiment card/button */
async function scenarioClickEsperimento(page, persona) {
  const navigated = await safeNavigate(page, `${BASE_URL}/#tutor`);
  if (!navigated) {
    // Try homepage as fallback
    await safeNavigate(page, BASE_URL);
  }

  // Look for experiment cards/buttons
  const experimentSelectors = [
    '[data-testid*="experiment"]',
    '[class*="esperimento"]',
    '[class*="experiment"]',
    'button[class*="card"]',
    '[class*="lesson"] button',
    '[aria-label*="esperimento"]',
    '[aria-label*="apri"]',
  ];

  for (const sel of experimentSelectors) {
    if (await elementExists(page, sel, 2000)) {
      const clicked = await safeClick(page, sel, 3000);
      if (clicked) {
        await page.waitForTimeout(1000);
        return {
          status: 'pass',
          selectorUsed: sel,
          note: `Clicked experiment element with selector: ${sel}`,
        };
      }
    }
  }

  // Fallback: check if any clickable items exist
  const anyClickable = await elementExists(page, 'button, a[href]', 2000);
  return {
    status: 'warn',
    anyClickable,
    note: 'No specific experiment element found — ELAB may require auth or specific navigation state',
  };
}

// ----------------------------------------------------------------
// Scenario runner map
// ----------------------------------------------------------------

const SCENARIOS = {
  S1: { fn: scenarioOpenLavagna, label: 'open-lavagna', description: 'Open Lavagna interattiva' },
  S2: { fn: scenarioSelectCapitolo, label: 'select-capitolo', description: 'Select chapter from lesson path' },
  S3: { fn: scenarioReadUnlim, label: 'read-unlim', description: 'Read UNLIM AI response' },
  S4: { fn: scenarioAskNonHoCapito, label: 'non-ho-capito', description: 'Ask "non ho capito" clarification' },
  S5: { fn: scenarioClickEsperimento, label: 'click-esperimento', description: 'Click on an experiment' },
};

// ----------------------------------------------------------------
// Write final results JSON
// ----------------------------------------------------------------

test.afterAll(() => {
  try {
    mkdirSync(OUTPUT_DIR, { recursive: true });

    const passCount = probeResults.filter((r) => r.status === 'pass').length;
    const warnCount = probeResults.filter((r) => r.status === 'warn').length;
    const failCount = probeResults.filter((r) => r.status === 'fail').length;
    const skipCount = probeResults.filter((r) => r.status === 'skip').length;
    const total = probeResults.length;

    const output = {
      tool: 'playwright-ux-probes',
      generatedAt: new Date().toISOString(),
      branch: 'feat/iter-70-team-E-quality-harness',
      baseUrl: BASE_URL,
      personas: PERSONAS.map((p) => ({ id: p.id, name: p.name, description: p.description })),
      scenarios: Object.entries(SCENARIOS).map(([id, s]) => ({ id, label: s.label, description: s.description })),
      totalProbes: total,
      summary: {
        pass: passCount,
        warn: warnCount,
        fail: failCount,
        skip: skipCount,
        passRate: total > 0 ? Math.round((passCount / total) * 1000) / 10 : 0,
        warnRate: total > 0 ? Math.round((warnCount / total) * 1000) / 10 : 0,
      },
      probeResults,
      honestyCaveats: [
        'ELAB uses hash-based routing (#route) — Playwright navigation to hash routes requires client-side hydration',
        'Auth/class_key may be required for full app functionality — probes run without auth',
        'UNLIM AI responses require network calls to Edge Function — may time out in CI',
        'Experiment interaction requires specific app state (active session, loaded lesson path)',
        'Persona viewports affect element visibility — mobile viewport (P5) may show hamburger menu',
        'Warn status = functionality may exist but not detected with current selectors — not a hard failure',
      ],
    };

    writeFileSync(UX_RESULTS_FILE, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`[ux-probes] Results written: ${UX_RESULTS_FILE}`);
    console.log(`[ux-probes] Summary: ${passCount} pass / ${warnCount} warn / ${failCount} fail / ${skipCount} skip`);
  } catch (err) {
    console.error('[ux-probes] Failed to write results:', err.message);
  }
});

// ----------------------------------------------------------------
// Test suite — Persona × Scenario matrix
// ----------------------------------------------------------------

test.describe('ELAB UX Probes — 5 personas × 5 scenarios', () => {

  for (const persona of PERSONAS) {
    test.describe(`Persona ${persona.id}: ${persona.label}`, () => {

      test.use({ viewport: persona.viewport });

      for (const [scenarioId, scenario] of Object.entries(SCENARIOS)) {
        test(`${persona.id}-${scenarioId}: ${scenario.description}`, async ({ page }) => {
          page.setDefaultTimeout(PROBE_TIMEOUT);

          let result;
          try {
            result = await scenario.fn(page, persona);
          } catch (err) {
            console.error(`[ux-probes] ${persona.id}-${scenarioId} error:`, err.message);
            result = { status: 'fail', error: err.message };
          }

          recordProbe(persona, scenarioId, result.status, {
            scenario: scenario.label,
            scenarioDescription: scenario.description,
            ...result,
          });

          // Log per probe
          const icon = result.status === 'pass' ? '✓' : result.status === 'warn' ? '⚠' : '✗';
          console.log(`[ux-probes] ${icon} ${persona.id}-${scenarioId}: ${result.status} — ${result.note || ''}`);

          // Hard assertions only on 'fail' (warn is acceptable for Phase 1 baseline)
          if (result.status === 'fail') {
            // Don't hard-fail — Phase 1 is a baseline, not a gate
            console.warn(`[ux-probes] FAIL: ${persona.id}-${scenarioId} — ${result.error || 'unknown'}`);
          }

          // Use soft assertion so all probes run even if some fail
          expect.soft(result.status, `${persona.id}-${scenarioId} probe failed`).not.toBe('fail');
        });
      }
    });
  }
});

// ----------------------------------------------------------------
// Additional: Baseline load-time probe
// ----------------------------------------------------------------

test.describe('ELAB UX Probes — Page load performance baseline', () => {
  test('homepage loads within 10s', async ({ page }) => {
    const start = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const elapsed = Date.now() - start;

    console.log(`[ux-probes] Homepage load time: ${elapsed}ms`);

    recordProbe(
      { id: 'PERF', name: 'performance' },
      'S0',
      elapsed < 10000 ? 'pass' : 'warn',
      { loadTimeMs: elapsed, url: BASE_URL, scenario: 'homepage-load' }
    );

    expect.soft(elapsed, `Homepage load time ${elapsed}ms exceeds 10s`).toBeLessThan(10000);
  });

  test('UNLIM chat route loads within 10s', async ({ page }) => {
    const start = Date.now();
    await page.goto(`${BASE_URL}/#tutor`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const elapsed = Date.now() - start;

    console.log(`[ux-probes] Tutor route load time: ${elapsed}ms`);

    recordProbe(
      { id: 'PERF', name: 'performance' },
      'S0-tutor',
      elapsed < 10000 ? 'pass' : 'warn',
      { loadTimeMs: elapsed, url: `${BASE_URL}/#tutor`, scenario: 'tutor-route-load' }
    );

    expect.soft(elapsed, `Tutor route load time ${elapsed}ms exceeds 10s`).toBeLessThan(10000);
  });

  test('ELAB branding visible on homepage', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);

    // Check for ELAB brand text
    const pageText = await page.evaluate(() => document.body.textContent || '');
    const hasElab = pageText.toUpperCase().includes('ELAB');
    const hasUnlim = pageText.includes('UNLIM') || pageText.toLowerCase().includes('unlim');

    recordProbe(
      { id: 'BRAND', name: 'branding' },
      'S0-brand',
      hasElab ? 'pass' : 'warn',
      { hasElab, hasUnlim, scenario: 'brand-visibility' }
    );

    expect.soft(hasElab, 'ELAB branding not visible on homepage').toBe(true);
    console.log(`[ux-probes] ELAB brand: ${hasElab}, UNLIM: ${hasUnlim}`);
  });
});
