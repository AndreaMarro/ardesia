/**
 * src/services/elab-agent/vol3-experiments-pipeline.js
 *
 * Iter 71 TEAM C — Vol3 first-vertical-slice Blink pipeline.
 * Andrea mandate iter 71 PM 2026-05-16 (PART 1 ~3h).
 *
 * Scope MVP:
 *   - registry VOL3_TEMPLATES con sketch canonical per esperimento Vol.3
 *   - compileVol3Experiment(experimentId) usando SketchBuilder + handleCompile
 *   - DI mock-friendly (runArduinoCli injectable per test)
 *   - validateNoForbidden contro forbidden AVR patterns (Renesas RA4M1)
 *
 * Morfismo Sense 2: ogni VOL3_TEMPLATES entry corrisponde VERBATIM al codice
 * stampato sul libro Volume 3 di Davide Fagherazzi (kit fisico + volume
 * cartaceo identici al software).
 *
 * iter 71 TEAM C scope: SOLO v3-cap5-esp1 (Blink). Resto Vol.3 iter 72+
 * progressivo (cap5-esp2, cap6, cap7, cap8 + extra).
 *
 * Anti-debito:
 *   - DI mock runArduinoCli (NO arduino-cli runtime test, NO hardware UAT)
 *   - validateNoForbidden gate PRIMA di handleCompile (AVR patterns block)
 *   - idempotent: stesso experimentId → stesso buildSketch output bit-exact
 *   - canonical sketch single source of truth in src/data/vol3-blink-canonical-sketch.txt
 *
 * Use:
 *   import { compileVol3Experiment, VOL3_TEMPLATES } from './vol3-experiments-pipeline.js';
 *   const result = await compileVol3Experiment('v3-cap5-esp1');
 *   // { ok: true, jobId, sketchDir, buildDir, sketch, experimentId }
 */

import {
  createSketch,
  addSetup,
  addLoop,
  addGlobal,
  buildSketch,
  validateNoForbidden,
  loadBoardProfile,
} from './sketch-builder.js';
import { handleCompile as defaultHandleCompile } from './server.js';

const DEFAULT_BOARD_ID = 'arduino-nano-r4';

// ============================================================================
// VOL3_TEMPLATES registry
// ============================================================================

/**
 * Registry sketch templates Volume 3 esperimenti.
 * KEY = experimentId canonical (es. 'v3-cap5-esp1')
 * VALUE = template builder function returning { sketch, meta }
 *
 * Template builder pattern (NOT plain string) per:
 *   - dedup intenzioni via Set (SketchBuilder addInclude/addGlobal/addSetup/addLoop)
 *   - parametrizzabile (es. delayMs custom iter 72+ esp2 "cambia velocità")
 *   - testabile unitario (mock-free per costruzione, mock solo arduino-cli)
 */
export const VOL3_TEMPLATES = {
  'v3-cap5-esp1': {
    chapter: 'Capitolo 5',
    page: 5,
    title: 'Blink — il primo programma',
    description: 'LED integrato pin 13 lampeggia 1s ON / 1s OFF',
    boardId: 'arduino-nano-r4',
    buildSketch: () => {
      const sketch = createSketch();
      addGlobal(sketch, 'const int LED_PIN = 13;');
      addSetup(sketch, 'pinMode(LED_PIN, OUTPUT);');
      addSetup(sketch, 'Serial.begin(9600);');
      addLoop(sketch, 'digitalWrite(LED_PIN, HIGH);');
      addLoop(sketch, 'delay(1000);');
      addLoop(sketch, 'digitalWrite(LED_PIN, LOW);');
      addLoop(sketch, 'delay(1000);');
      return sketch;
    },
  },
  // iter 72+ TODO: v3-cap5-esp2 (cambia velocità) + cap6 + cap7 + cap8 + extra
};

// ============================================================================
// Public API
// ============================================================================

/**
 * Restituisce sketch C++ canonical per experimentId Vol.3.
 * NON chiama arduino-cli (pure function, idempotente).
 *
 * @param {string} experimentId - es. 'v3-cap5-esp1'
 * @returns {{ experimentId: string, sketch: string, boardId: string, meta: object }}
 * @throws Error se experimentId non in VOL3_TEMPLATES
 */
export function buildVol3ExperimentSketch(experimentId) {
  const template = VOL3_TEMPLATES[experimentId];
  if (!template) {
    throw new Error(
      `Vol3 template not found for experimentId="${experimentId}". ` +
      `Known: ${Object.keys(VOL3_TEMPLATES).join(', ')}`,
    );
  }

  const sketch = template.buildSketch();
  const code = buildSketch(sketch);

  return {
    experimentId,
    sketch: code,
    boardId: template.boardId || DEFAULT_BOARD_ID,
    meta: {
      chapter: template.chapter,
      page: template.page,
      title: template.title,
      description: template.description,
    },
  };
}

/**
 * Pipeline completa Vol.3 esperimento: build sketch + validate forbidden + handleCompile.
 *
 * @param {string} experimentId - es. 'v3-cap5-esp1'
 * @param {object} [opts]
 * @param {Function} [opts.handleCompile=defaultHandleCompile] - DI per test (mock arduino-cli)
 * @returns {Promise<{
 *   ok: boolean,
 *   experimentId: string,
 *   sketch?: string,
 *   jobId?: string,
 *   sketchDir?: string,
 *   buildDir?: string,
 *   error?: object,
 *   violations?: Array,
 * }>}
 */
export async function compileVol3Experiment(experimentId, opts = {}) {
  const { handleCompile = defaultHandleCompile } = opts;

  let built;
  try {
    built = buildVol3ExperimentSketch(experimentId);
  } catch (err) {
    return {
      ok: false,
      experimentId,
      error: {
        category: 'template_missing',
        message: `Ragazzi, l'esperimento "${experimentId}" non e' ancora pronto. Verificate il Volume 3.`,
        detail: err.message,
      },
    };
  }

  // Gate forbidden AVR patterns (Renesas RA4M1 Cortex-M4, NO PORTB/DDRD/TCCR/...)
  const profile = loadBoardProfile(built.boardId);
  const validation = validateNoForbidden(built.sketch, profile);
  if (!validation.ok) {
    return {
      ok: false,
      experimentId,
      sketch: built.sketch,
      violations: validation.violations,
      error: {
        category: 'forbidden_avr_pattern',
        message:
          'Ragazzi, il codice usa registri AVR (PORTB/DDRD/TCCR) che la Nano R4 NON supporta. ' +
          'Usate le funzioni Arduino standard: pinMode, digitalWrite, analogRead.',
        detail: `Forbidden patterns: ${validation.violations.map((v) => v.pattern).join(', ')}`,
      },
    };
  }

  // Invoke handleCompile (real arduino-cli OR mock in test via DI)
  const result = await handleCompile({ code: built.sketch, boardId: built.boardId });

  return {
    ok: !!result.ok,
    experimentId,
    sketch: built.sketch,
    jobId: result.jobId,
    sketchDir: result.sketchDir,
    buildDir: result.buildDir,
    stdout: result.stdout,
    error: result.error,
    meta: built.meta,
  };
}

/**
 * Restituisce true se experimentId e' supportato da pipeline iter 71 TEAM C.
 * @param {string} experimentId
 * @returns {boolean}
 */
export function isVol3ExperimentSupported(experimentId) {
  return Object.prototype.hasOwnProperty.call(VOL3_TEMPLATES, experimentId);
}

/**
 * Lista experimentId Vol.3 supportati iter 71 TEAM C.
 * @returns {string[]}
 */
// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
export function listSupportedVol3Experiments() {
  return Object.keys(VOL3_TEMPLATES);
}
