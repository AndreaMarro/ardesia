/**
 * tests/unit/services/elab-agent/vol3-experiments-pipeline.test.js
 *
 * Iter 71 TEAM C PART 1 — Vol3 pipeline unit tests.
 * DI mock runArduinoCli (NO arduino-cli runtime, NO Nano R4 hardware).
 *
 * Coverage:
 *   - canonical sketch match Davide libro (Vol.3 cap.5 esp.1 pag.5)
 *   - validateNoForbidden AVR patterns (Renesas RA4M1)
 *   - idempotent build (stesso experimentId → stesso output)
 *   - DI mock handleCompile success/fail
 *   - registry isVol3ExperimentSupported / listSupportedVol3Experiments
 *   - unknown experimentId → template_missing category
 */

import { describe, it, expect, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  VOL3_TEMPLATES,
  buildVol3ExperimentSketch,
  compileVol3Experiment,
  isVol3ExperimentSupported,
  listSupportedVol3Experiments,
} from '../../../../src/services/elab-agent/vol3-experiments-pipeline.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..', '..', '..');
const CANONICAL_SKETCH_PATH = path.join(repoRoot, 'src', 'data', 'vol3-blink-canonical-sketch.txt');

describe('iter 71 TEAM C — Vol3 pipeline registry', () => {
  it('1. exports VOL3_TEMPLATES with v3-cap5-esp1 entry', () => {
    expect(VOL3_TEMPLATES).toBeDefined();
    expect(VOL3_TEMPLATES['v3-cap5-esp1']).toBeDefined();
    expect(VOL3_TEMPLATES['v3-cap5-esp1'].chapter).toBe('Capitolo 5');
    expect(VOL3_TEMPLATES['v3-cap5-esp1'].page).toBe(5);
    expect(VOL3_TEMPLATES['v3-cap5-esp1'].boardId).toBe('arduino-nano-r4');
  });

  it('2. listSupportedVol3Experiments returns ["v3-cap5-esp1"] iter 71 TEAM C scope', () => {
    const supported = listSupportedVol3Experiments();
    expect(supported).toContain('v3-cap5-esp1');
    // iter 71 TEAM C = scope ONLY v3-cap5-esp1; iter 72+ will add cap5-esp2 + cap6+
  });

  it('3. isVol3ExperimentSupported returns true for v3-cap5-esp1', () => {
    expect(isVol3ExperimentSupported('v3-cap5-esp1')).toBe(true);
  });

  it('4. isVol3ExperimentSupported returns false for unknown id', () => {
    expect(isVol3ExperimentSupported('v3-cap99-esp99')).toBe(false);
    expect(isVol3ExperimentSupported('')).toBe(false);
    expect(isVol3ExperimentSupported(null)).toBe(false);
  });
});

describe('iter 71 TEAM C — buildVol3ExperimentSketch v3-cap5-esp1 canonical', () => {
  it('5. returns object with sketch, experimentId, boardId, meta', () => {
    const result = buildVol3ExperimentSketch('v3-cap5-esp1');
    expect(result.experimentId).toBe('v3-cap5-esp1');
    expect(result.boardId).toBe('arduino-nano-r4');
    expect(result.sketch).toBeTruthy();
    expect(typeof result.sketch).toBe('string');
    expect(result.meta.chapter).toBe('Capitolo 5');
    expect(result.meta.page).toBe(5);
  });

  it('6. sketch contains LED_PIN=13 global declaration (Davide libro Vol.3 pag.5)', () => {
    const { sketch } = buildVol3ExperimentSketch('v3-cap5-esp1');
    expect(sketch).toContain('const int LED_PIN = 13;');
  });

  it('7. sketch contains pinMode(LED_PIN, OUTPUT) in setup', () => {
    const { sketch } = buildVol3ExperimentSketch('v3-cap5-esp1');
    expect(sketch).toMatch(/void setup\(\)\s*{[\s\S]*pinMode\(LED_PIN, OUTPUT\);[\s\S]*}/);
  });

  it('8. sketch contains Serial.begin(9600) in setup', () => {
    const { sketch } = buildVol3ExperimentSketch('v3-cap5-esp1');
    expect(sketch).toContain('Serial.begin(9600);');
  });

  it('9. sketch contains digitalWrite HIGH + delay(1000) + LOW + delay(1000) in loop', () => {
    const { sketch } = buildVol3ExperimentSketch('v3-cap5-esp1');
    expect(sketch).toContain('digitalWrite(LED_PIN, HIGH);');
    expect(sketch).toContain('digitalWrite(LED_PIN, LOW);');
    // 2 occurrences of delay(1000) (ON + OFF)
    const delayMatches = sketch.match(/delay\(1000\);/g);
    expect(delayMatches).toBeTruthy();
    expect(delayMatches.length).toBe(2);
  });

  it('10. sketch matches canonical reference file vol3-blink-canonical-sketch.txt (semantic equivalence)', () => {
    const { sketch } = buildVol3ExperimentSketch('v3-cap5-esp1');
    const canonical = fs.readFileSync(CANONICAL_SKETCH_PATH, 'utf8');
    // Canonical file has commented header — match only the code body lines (non-comment, non-empty)
    const codeOnly = (str) =>
      str
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('//') && !l.startsWith('/*') && !l.startsWith('*'))
        .join('\n');
    const sketchBody = codeOnly(sketch);
    const canonicalBody = codeOnly(canonical);
    expect(sketchBody).toBe(canonicalBody);
  });

  it('11. sketch is idempotent (same experimentId → bit-exact same output)', () => {
    const r1 = buildVol3ExperimentSketch('v3-cap5-esp1');
    const r2 = buildVol3ExperimentSketch('v3-cap5-esp1');
    const r3 = buildVol3ExperimentSketch('v3-cap5-esp1');
    expect(r1.sketch).toBe(r2.sketch);
    expect(r2.sketch).toBe(r3.sketch);
  });

  it('12. unknown experimentId → throws Error with helpful message', () => {
    expect(() => buildVol3ExperimentSketch('v3-cap99-esp99')).toThrow(
      /not found.*v3-cap99-esp99/i,
    );
  });

  it('13. sketch contains NO forbidden AVR registers (PORTB/DDRD/TCCR/...)', () => {
    const { sketch } = buildVol3ExperimentSketch('v3-cap5-esp1');
    const forbidden = ['PORTB', 'PORTC', 'PORTD', 'DDRB', 'DDRD', 'TCCR0A', 'TIMSK0', 'OCR0A'];
    for (const pattern of forbidden) {
      const regex = new RegExp(`\\b${pattern}\\b`);
      expect(regex.test(sketch), `sketch should NOT contain AVR ${pattern} (Renesas RA4M1)`).toBe(
        false,
      );
    }
  });
});

describe('iter 71 TEAM C — compileVol3Experiment DI mock', () => {
  it('14. compileVol3Experiment success: mock handleCompile returns ok=true, jobId, paths', async () => {
    const mockHandleCompile = vi.fn(async ({ code, boardId }) => {
      expect(boardId).toBe('arduino-nano-r4');
      expect(code).toContain('LED_PIN');
      return {
        ok: true,
        jobId: 'mock-job-uuid-1234',
        sketchDir: '/tmp/elab-arduino/mock-job-uuid-1234/ElabSketch',
        buildDir: '/tmp/elab-arduino/mock-job-uuid-1234/build',
        stdout: 'Sketch uses 12345 bytes of program storage space.',
      };
    });

    const result = await compileVol3Experiment('v3-cap5-esp1', {
      handleCompile: mockHandleCompile,
    });

    expect(result.ok).toBe(true);
    expect(result.experimentId).toBe('v3-cap5-esp1');
    expect(result.jobId).toBe('mock-job-uuid-1234');
    expect(result.sketch).toContain('digitalWrite(LED_PIN, HIGH);');
    expect(result.meta.chapter).toBe('Capitolo 5');
    expect(mockHandleCompile).toHaveBeenCalledOnce();
  });

  it('15. compileVol3Experiment failure: mock handleCompile returns ok=false + error', async () => {
    const mockHandleCompile = vi.fn(async () => ({
      ok: false,
      jobId: 'mock-fail-job',
      sketchDir: '/tmp/fail/ElabSketch',
      buildDir: '/tmp/fail/build',
      error: {
        category: 'compile_failed',
        docenteFriendlyMessage: "Ragazzi, c'e' un errore di compilazione...",
        suggestedFix: 'Controllate punto e virgola',
      },
    }));

    const result = await compileVol3Experiment('v3-cap5-esp1', {
      handleCompile: mockHandleCompile,
    });

    expect(result.ok).toBe(false);
    expect(result.experimentId).toBe('v3-cap5-esp1');
    expect(result.error).toBeDefined();
    expect(result.error.category).toBe('compile_failed');
  });

  it('16. compileVol3Experiment with unknown id → ok=false + template_missing category', async () => {
    const mockHandleCompile = vi.fn();
    const result = await compileVol3Experiment('v3-cap99-esp99', {
      handleCompile: mockHandleCompile,
    });

    expect(result.ok).toBe(false);
    expect(result.error.category).toBe('template_missing');
    expect(result.error.message).toMatch(/Ragazzi/);
    expect(result.error.message).toMatch(/Volume 3/);
    // mock NOT called (early return)
    expect(mockHandleCompile).not.toHaveBeenCalled();
  });

  it('17. compileVol3Experiment uses default handleCompile if no DI provided (does NOT throw at signature level)', async () => {
    // Verify signature without DI works (default handleCompile is imported from server.js).
    // We do NOT actually invoke arduino-cli — just check the function exists and is callable.
    // Using unknown id ensures template_missing short-circuit before handleCompile runs.
    const result = await compileVol3Experiment('v3-cap99-esp99');
    expect(result.ok).toBe(false);
    expect(result.error.category).toBe('template_missing');
  });
});

describe('iter 71 TEAM C — pipeline anti-debito invariants', () => {
  it('18. all VOL3_TEMPLATES entries have required fields (chapter, page, boardId, buildSketch)', () => {
    for (const [id, template] of Object.entries(VOL3_TEMPLATES)) {
      expect(template.chapter, `${id} missing chapter`).toBeTruthy();
      expect(template.page, `${id} missing page`).toBeTruthy();
      expect(template.boardId, `${id} missing boardId`).toBeTruthy();
      expect(typeof template.buildSketch, `${id} buildSketch must be function`).toBe('function');
    }
  });
});
