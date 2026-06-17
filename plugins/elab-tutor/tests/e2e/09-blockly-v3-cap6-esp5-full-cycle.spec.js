/**
 * E2E — v3-cap6-esp5 Semaforo full cycle (Blockly → compile → AVR8js).
 *
 * Goal-driven validation: load `v3-cap6-esp5` lesson path, drag 3 digitalWrite
 * blocks (pin 5 red, pin 6 yellow, pin 3 green) into Blockly LOOP, hit compile,
 * verify pin states cycle red → yellow → green → red under AVR8js emulation.
 *
 * Reference:
 *   - docs/prompts/PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md Sez 18
 *   - docs/dispatch/2026-05-25-wave-1b-team-brief.md Impl-G-2 task 1
 *   - tests/e2e/08-blockly-v3-cap6-esp4-full-cycle.spec.js (sibling, esp4 sirena)
 *
 * STATUS at Wave 1b commit:
 *   - Upstream esp5 lesson path may not yet expose all required Italian labels
 *     (depends on Impl-A-2 toolbox IT expansion).
 *   - pinMode auto-emission for 3 simultaneous pins relies on Impl-B-2 var-decl
 *     top-of-file expansion.
 *   - Therefore, full assertions marked `test.fixme()` until Impl-A-2 + Impl-B-2 land.
 *
 * Wave 1b CLOSE criteria allow either:
 *   - PASS with real assertions, OR
 *   - test.fixme() skeleton stub with upstream-wait note (per brief Sez "Wave 1b CLOSE criteria")
 *
 * © Andrea Marro — 2026-05-25 — Wave 1b Impl-G-2
 */
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5173';
const LESSON_URL = `${BASE}/#lavagna?lessonPathId=v3-cap6-esp5`;

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

test.describe('Blockly v3-cap6-esp5 Semaforo full cycle — pin 5/6/3 sequence', () => {
  test('loads esp5 lesson path with Blockly workspace mounted', async ({ page }) => {
    test.fixme(true, 'Wave 1b upstream wait: Impl-A-2 IT toolbox + esp5 lesson visibility whitelist');
    await seedConsent(page);
    await page.goto(LESSON_URL, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-blockly-workspace], .blocklyWorkspace').first())
      .toBeVisible({ timeout: 15000 });
  });

  test('toolbox renders IT category labels including Pin digitali + Tempo', async ({ page }) => {
    test.fixme(true, 'Wave 1b upstream wait: Impl-A-2 expands blockly-msg-it.js with 30+ category keys');
    await seedConsent(page);
    await page.goto(LESSON_URL, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/Pin digitali/i)).toBeVisible();
    await expect(page.getByText(/Tempo/i)).toBeVisible();
  });

  test('drag 3 digitalWrite blocks (pin 5/6/3) generates pinMode in setup', async ({ page }) => {
    test.fixme(true, 'Wave 1b upstream wait: Impl-B-2 var-decl top-of-file + #include auto-emit');
    await seedConsent(page);
    await page.goto(LESSON_URL, { waitUntil: 'domcontentloaded' });
    // TODO Wave 2: real Playwright drag via __ELAB_API or DOM drag emulation
    // Expected post-compile C++ contains:
    //   pinMode(3, OUTPUT);
    //   pinMode(5, OUTPUT);
    //   pinMode(6, OUTPUT);
    //   digitalWrite(5, HIGH); delay(...);
    //   digitalWrite(6, HIGH); delay(...);
    //   digitalWrite(3, HIGH); delay(...);
  });

  test('compile success → AVR8js loop cycles red(5)→yellow(6)→green(3)', async ({ page }) => {
    test.fixme(true, 'Wave 1b upstream wait: full AVR8js sim integration + pin state observable hook');
    await seedConsent(page);
    await page.goto(LESSON_URL, { waitUntil: 'domcontentloaded' });
    // TODO Wave 2: subscribe to __ELAB_API.on('stateChange') and observe 3-pin cycle
  });

  test('uploadHex success surfaces cliffhanger CTA to next experiment', async ({ page }) => {
    test.fixme(true, 'Wave 1b upstream wait: AlbumStudente/cliffhanger wire-up iter 72 BG-A6');
    await seedConsent(page);
    await page.goto(LESSON_URL, { waitUntil: 'domcontentloaded' });
    // Per CLAUDE.md "NARRATIVE ARC CONTINUO" — esp5 success should surface next_experiment CTA
  });
});
