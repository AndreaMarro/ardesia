// @ts-check
/**
 * Persona simulation runner — Harness STRINGENT Livello 5 PEDAGOGICAL
 * iter 27 P2 SCAFFOLD — full implementation iter 29 P0
 *
 * Honest caveat: agent simulation ≠ utenti reali. Playtest scuola pubblica
 * con docente vero = ground truth definitivo (deferred Sprint U).
 *
 * Principio Zero V3 imperativo enforce: docente protagonist + kit fisico ELAB
 * + Vol/pag VERBATIM citation.
 */

import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const personas = JSON.parse(
  readFileSync(join(__dirname, 'personas.json'), 'utf-8')
).personas;

const PROD_URL = process.env.ELAB_TEST_URL || 'https://elab-tutor.vercel.app';
const E2E_BYPASS = process.env.VITE_E2E_AUTH_BYPASS === 'true';

/**
 * Per-persona session simulator.
 * Each persona drives Playwright with their click_speed + read_speed +
 * test_assertions, scoring against scoring_rubric.
 */
for (const persona of personas) {
  test.describe(`Persona ${persona.id} — ${persona.label}`, () => {
    test.skip(!E2E_BYPASS, 'requires VITE_E2E_AUTH_BYPASS=true on preview');

    test(`session ${persona.session_duration_target_s}s`, async ({ page }) => {
      // SCAFFOLD ONLY iter 27 — full impl iter 29
      // Steps:
      // 1. Navigate landing
      await page.goto(PROD_URL);
      await page.waitForLoadState('networkidle');

      // 2. Skip license (preview bypass)
      // 3. Enter Lavagna mode via #lavagna
      // 4. Default Modalità Percorso pre-selected check
      // 5. Open primo esperimento (LED v1-cap6-esp1)
      // 6. Per persona: drive UI at click_speed_ms + read at WPM
      // 7. Capture UNLIM responses for Vol/pag + plurale + analogy + kit_mention
      // 8. Score against scoring_rubric
      // 9. Output JSON results /persona-sim/output/persona_X-results.json

      // PLACEHOLDER assertions iter 27 P2 scaffold
      const html = await page.content();
      expect(html.length).toBeGreaterThan(100);

      // Honest caveat: scaffold-only, full assertions iter 29
      console.log(`[persona-sim] ${persona.id} scaffold loaded (iter 27 P2 placeholder)`);
    });
  });
}

test.describe('Persona simulation aggregate score', () => {
  test('5 personas aggregate', async () => {
    test.skip(!E2E_BYPASS, 'requires preview bypass');
    // Aggregator iter 29: combine 5 persona scores → harness STRINGENT Livello 5
    expect(personas.length).toBe(5);
  });
});
