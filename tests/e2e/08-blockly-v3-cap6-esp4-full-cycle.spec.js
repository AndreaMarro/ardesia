import { test, expect } from '@playwright/test';

// E2E spec for v3-cap6-esp4 Due LED sirena (pin 6+9).
//
// Wave 1 (b1e19e14) committed this as a `test.describe.skip` skeleton with 1
// `test.fail()` per case (3 cases total). Wave 1b Impl-G-2 unskips the describe
// block and per-test gates each case via `test.fixme()` with a precise
// upstream-wait note, in line with brief Sez "Wave 1b CLOSE criteria":
//
//   "E2E 08-blockly-v3-cap6-esp4 UNSKIPPED + PASS (or skip with test.fixme() if upstream wait)"
//
// Upstream wait at Wave 1b commit time:
//   - Impl-A-2 Italian toolbox msg keys (Avvio / Ripeti) — landing in same wave
//   - Impl-B-2 pinMode auto-emission (collectGpioPinUsage hooked Wave 1, but
//     multi-pin INPUT detection + INPUT_PULLUP coverage still pending)
//   - AVR8js bridge end-to-end full cycle (alternation timing observable)
//
// Reference: docs/prompts/PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md Sez 18
// Plan: docs/plans/2026-05-25-blockly-crosscompiler-definitivo.md iter X.2 Wave 1
//
// © Andrea Marro — 2026-05-25 — Wave 1b Impl-G-2 unskip + fixme migration

const BASE = process.env.BASE_URL || 'http://localhost:5173';
const LESSON_URL = `${BASE}/#lavagna?lessonPathId=v3-cap6-esp4`;

async function seedConsent(page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('elab_gdpr_consent', JSON.stringify({
        status: 'accepted',
        timestamp: new Date().toISOString(),
        version: '1.0',
      }));
      localStorage.setItem('elab_consent_v2', 'accepted');
      sessionStorage.setItem('elab_user_age', '18');
    } catch (_) { /* defensive */ }
  });
}

test.describe('Blockly v3-cap6-esp4 full cycle - Due LED sirena pin 6+9', () => {
  test('toolbox renders with Italian labels after Blockly init', async ({ page }) => {
    test.fixme(true, 'Wave 1b upstream wait: Impl-A-2 IT toolbox msg keys (Avvio/Ripeti) landing in parallel');
    await seedConsent(page);
    await page.goto(LESSON_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-blockly-workspace], .blocklyWorkspace', { timeout: 10000 });
    // After Impl-A-2 lands: toolbox has IT msg keys (Avvio / Ripeti)
    await expect(page.locator('text=Avvio').first()).toBeVisible();
    await expect(page.locator('text=Ripeti').first()).toBeVisible();
  });

  test('digitalWrite block emits pinMode in setup()', async ({ page }) => {
    test.fixme(true, 'Wave 1b upstream wait: Impl-B-2 multi-pin INPUT/OUTPUT classification + DOM drag emulation');
    await seedConsent(page);
    await page.goto(LESSON_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-blockly-workspace], .blocklyWorkspace', { timeout: 10000 });
    // Drag digitalWrite D6 HIGH block, drag digitalWrite D9 HIGH block
    // Click compile preview, assert C++ output contains:
    //   pinMode(6, OUTPUT);
    //   pinMode(9, OUTPUT);
    // This validates Impl-B pinMode auto-emission (already partial Wave 1, broader Wave 1b).
  });

  test('full compile->AVR8js cycle: pin 6 + pin 9 alternating HIGH', async ({ page }) => {
    test.fixme(true, 'Wave 1b upstream wait: AVR8js stateChange event observable for multi-pin alternation');
    await seedConsent(page);
    await page.goto(LESSON_URL, { waitUntil: 'domcontentloaded' });
    // Expected: subscribe to __ELAB_API.on('stateChange', cb) and observe
    // 2+ alternations of pin 6 and pin 9 within a 5s observation window.
  });
});
