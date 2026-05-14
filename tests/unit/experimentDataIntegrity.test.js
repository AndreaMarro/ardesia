/**
 * Experiment Data Integrity — Comprehensive verification of ALL 81 experiments (EPIC 1 A4.1b — 13 Vol3 no-counterpart removed)
 * Verifies counts, uniqueness, required fields, components, lesson groups,
 * volume references, difficulty ranges, and simulation modes.
 * Target: ~300 test cases
 * (c) Andrea Marro — 15/04/2026
 */

import { describe, test, expect } from 'vitest';
import EXPERIMENTS_VOL1 from '../../src/data/experiments-vol1.js';
import EXPERIMENTS_VOL2 from '../../src/data/experiments-vol2.js';
import EXPERIMENTS_VOL3 from '../../src/data/experiments-vol3.js';
import LESSON_GROUPS, { findLessonForExperiment } from '../../src/data/lesson-groups.js';
import VOLUME_REFERENCES from '../../src/data/volume-references.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

const vol1Experiments = EXPERIMENTS_VOL1.experiments;
const vol2Experiments = EXPERIMENTS_VOL2.experiments;
const vol3Experiments = EXPERIMENTS_VOL3.experiments;
const allExperiments = [...vol1Experiments, ...vol2Experiments, ...vol3Experiments];

// Collect all experiment IDs referenced in lesson groups
const lessonGroupExperimentIds = new Set();
const lessonGroupEntries = Object.entries(LESSON_GROUPS);
for (const [, lesson] of lessonGroupEntries) {
  if (lesson.experiments) {
    lesson.experiments.forEach(id => lessonGroupExperimentIds.add(id));
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. COUNT INTEGRITY (5 tests)
// ═════════════════════════════════════════════════════════════════════════════

describe('1. Count Integrity', () => {
  test('Volume 1 has exactly 38 experiments', () => {
    expect(vol1Experiments.length).toBe(38);
  });

  test('Volume 2 has exactly 27 experiments', () => {
    expect(vol2Experiments.length).toBe(27);
  });

  test('Volume 3 has exactly 16 experiments', () => {
    expect(vol3Experiments.length).toBe(16);
  });

  test('Total experiments is 38 + 27 + 16 = 81', () => {
    expect(allExperiments.length).toBe(81);
  });

  test('Sum of volumes equals total', () => {
    expect(vol1Experiments.length + vol2Experiments.length + vol3Experiments.length)
      .toBe(allExperiments.length);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 2. ID UNIQUENESS (5 tests)
// ═════════════════════════════════════════════════════════════════════════════

describe('2. ID Uniqueness', () => {
  test('No duplicate IDs across all volumes', () => {
    const ids = allExperiments.map(e => e.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  test('No duplicate IDs within Volume 1', () => {
    const ids = vol1Experiments.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('No duplicate IDs within Volume 2', () => {
    const ids = vol2Experiments.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('No duplicate IDs within Volume 3', () => {
    const ids = vol3Experiments.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('Vol1 IDs start with v1-, Vol2 with v2-, Vol3 with v3-', () => {
    vol1Experiments.forEach(e => expect(e.id).toMatch(/^v1-/));
    vol2Experiments.forEach(e => expect(e.id).toMatch(/^v2-/));
    vol3Experiments.forEach(e => expect(e.id).toMatch(/^v3-/));
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 3. REQUIRED FIELDS (81 tests — one per experiment)
// ═════════════════════════════════════════════════════════════════════════════

describe('3. Required Fields — one test per experiment', () => {
  allExperiments.forEach(exp => {
    test(`${exp.id} has all required fields (id, title, desc, chapter, difficulty, simulationMode, components)`, () => {
      expect(exp.id, 'missing id').toBeTruthy();
      expect(typeof exp.id).toBe('string');

      expect(exp.title, `${exp.id} missing title`).toBeTruthy();
      expect(typeof exp.title).toBe('string');

      const description = exp.desc || exp.description;
      expect(description, `${exp.id} missing desc/description`).toBeTruthy();

      expect(exp.chapter, `${exp.id} missing chapter`).toBeTruthy();
      expect(typeof exp.chapter).toBe('string');

      expect(exp.difficulty, `${exp.id} missing difficulty`).toBeDefined();
      expect(typeof exp.difficulty).toBe('number');

      expect(exp.simulationMode, `${exp.id} missing simulationMode`).toBeTruthy();
      expect(typeof exp.simulationMode).toBe('string');

      expect(exp.components, `${exp.id} missing components`).toBeDefined();
      expect(Array.isArray(exp.components), `${exp.id} components is not an array`).toBe(true);
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 4. COMPONENT VALIDITY (81 tests — one per experiment)
// ═════════════════════════════════════════════════════════════════════════════

describe('4. Component Validity — one test per experiment', () => {
  allExperiments.forEach(exp => {
    test(`${exp.id} components all have type and id`, () => {
      expect(Array.isArray(exp.components), `${exp.id} components is not an array`).toBe(true);
      // At least one component expected
      expect(exp.components.length, `${exp.id} has no components`).toBeGreaterThan(0);

      exp.components.forEach((comp, idx) => {
        expect(comp.type, `${exp.id} component[${idx}] missing type`).toBeTruthy();
        expect(typeof comp.type).toBe('string');
        expect(comp.id, `${exp.id} component[${idx}] missing id`).toBeTruthy();
        expect(typeof comp.id).toBe('string');
      });
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 5. LESSON GROUP COVERAGE (5 tests)
// ═════════════════════════════════════════════════════════════════════════════

describe('5. Lesson Group Coverage', () => {
  test('There are exactly 24 lesson groups', () => {
    expect(lessonGroupEntries.length).toBe(24);
  });

  test('Every experiment belongs to at least one lesson group', () => {
    const missing = allExperiments.filter(e => !lessonGroupExperimentIds.has(e.id));
    expect(missing.map(e => e.id)).toEqual([]);
  });

  test('No experiment appears in more than one lesson group', () => {
    const seen = new Map();
    for (const [lessonId, lesson] of lessonGroupEntries) {
      if (lesson.experiments) {
        lesson.experiments.forEach(expId => {
          if (seen.has(expId)) {
            expect.fail(`${expId} appears in both ${seen.get(expId)} and ${lessonId}`);
          }
          seen.set(expId, lessonId);
        });
      }
    }
  });

  test('Lesson group experiment IDs total matches 81', () => {
    expect(lessonGroupExperimentIds.size).toBe(81);
  });

  test('Every lesson group experiment ID corresponds to a real experiment', () => {
    const realIds = new Set(allExperiments.map(e => e.id));
    const orphans = [...lessonGroupExperimentIds].filter(id => !realIds.has(id));
    expect(orphans).toEqual([]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 6. VOLUME REFERENCE MAPPING (81 tests — one per experiment)
// ═════════════════════════════════════════════════════════════════════════════

describe('6. Volume Reference Mapping — one test per experiment', () => {
  allExperiments.forEach(exp => {
    test(`${exp.id} has a volume-references entry with bookPage`, () => {
      const ref = VOLUME_REFERENCES[exp.id];
      expect(ref, `${exp.id} missing from VOLUME_REFERENCES`).toBeDefined();
      expect(ref.bookPage, `${exp.id} missing bookPage`).toBeDefined();
      expect(typeof ref.bookPage).toBe('number');
      expect(ref.bookPage).toBeGreaterThan(0);
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 7. LESSON PATH EXISTENCE (10 tests)
//    No lesson-path JSON files currently exist in the project, so we test
//    that findLessonForExperiment returns valid data for a sample of experiments.
// ═════════════════════════════════════════════════════════════════════════════

describe('7. Lesson Path Existence — sample of 10 experiments', () => {
  const sampleIds = [
    'v1-cap6-esp1',   // first experiment
    'v1-cap7-esp3',   // LED RGB
    'v1-cap9-esp5',   // potenziometro
    'v1-cap14-esp1',  // robot
    'v2-cap3-esp1',   // multimetro
    'v2-cap8-esp2',   // transistor
    'v2-cap12-esp1',  // robot segui luce
    'v3-cap5-esp1',   // primi passi Arduino
    'v3-cap6-semaforo', // semaforo
    'v3-cap6-esp5',   // INPUT_PULLUP
  ];

  sampleIds.forEach(id => {
    test(`${id} has a lesson path via findLessonForExperiment`, () => {
      const result = findLessonForExperiment(id);
      expect(result, `${id} not found in any lesson group`).not.toBeNull();
      expect(result.lessonId).toBeTruthy();
      expect(result.lesson).toBeDefined();
      expect(result.lesson.title).toBeTruthy();
      expect(result.lesson.experiments).toContain(id);
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 8. CROSS-REFERENCE CONSISTENCY (10 tests)
//    Experiment volume (v1/v2/v3) matches volume-references volume number
// ═════════════════════════════════════════════════════════════════════════════

describe('8. Cross-Reference Consistency — 10 sample experiments', () => {
  const samples = [
    { id: 'v1-cap6-esp1', expectedVol: 1 },
    { id: 'v1-cap10-esp3', expectedVol: 1 },
    { id: 'v1-cap13-esp2', expectedVol: 1 },
    { id: 'v2-cap3-esp2', expectedVol: 2 },
    { id: 'v2-cap7-esp1', expectedVol: 2 },
    { id: 'v2-cap10-esp4', expectedVol: 2 },
    { id: 'v3-cap5-esp2', expectedVol: 3 },
    { id: 'v3-cap6-esp5', expectedVol: 3 },
    { id: 'v3-cap8-esp3', expectedVol: 3 },
    { id: 'v3-cap6-esp4', expectedVol: 3 },
  ];

  samples.forEach(({ id, expectedVol }) => {
    test(`${id} volume-reference volume matches v${expectedVol}`, () => {
      const ref = VOLUME_REFERENCES[id];
      expect(ref, `${id} missing from VOLUME_REFERENCES`).toBeDefined();
      expect(ref.volume).toBe(expectedVol);

      // Also verify experiment ID prefix matches
      expect(id.startsWith(`v${expectedVol}-`)).toBe(true);

      // Verify lesson group volume matches too
      const lesson = findLessonForExperiment(id);
      expect(lesson, `${id} not in any lesson group`).not.toBeNull();
      expect(lesson.lesson.volume).toBe(expectedVol);
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 9. DIFFICULTY RANGE (5 tests)
// ═════════════════════════════════════════════════════════════════════════════

describe('9. Difficulty Range', () => {
  test('All experiments have difficulty between 1 and 5', () => {
    allExperiments.forEach(e => {
      expect(e.difficulty, `${e.id} difficulty out of range`).toBeGreaterThanOrEqual(1);
      expect(e.difficulty, `${e.id} difficulty out of range`).toBeLessThanOrEqual(5);
    });
  });

  test('Volume 1 difficulties are between 1 and 5', () => {
    vol1Experiments.forEach(e => {
      expect(e.difficulty).toBeGreaterThanOrEqual(1);
      expect(e.difficulty).toBeLessThanOrEqual(5);
    });
  });

  test('Volume 2 difficulties are between 1 and 5', () => {
    vol2Experiments.forEach(e => {
      expect(e.difficulty).toBeGreaterThanOrEqual(1);
      expect(e.difficulty).toBeLessThanOrEqual(5);
    });
  });

  test('Volume 3 difficulties are between 1 and 5', () => {
    vol3Experiments.forEach(e => {
      expect(e.difficulty).toBeGreaterThanOrEqual(1);
      expect(e.difficulty).toBeLessThanOrEqual(5);
    });
  });

  test('Difficulty is always an integer', () => {
    allExperiments.forEach(e => {
      expect(Number.isInteger(e.difficulty), `${e.id} difficulty ${e.difficulty} is not integer`).toBe(true);
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 10. SIMULATION MODE VALID (5 tests)
// ═════════════════════════════════════════════════════════════════════════════

describe('10. SimulationMode Valid', () => {
  const VALID_MODES = ['circuit', 'avr'];

  test('All experiments have simulationMode "circuit" or "avr"', () => {
    allExperiments.forEach(e => {
      expect(VALID_MODES, `${e.id} has invalid simulationMode "${e.simulationMode}"`)
        .toContain(e.simulationMode);
    });
  });

  test('Volume 1 experiments are all "circuit" mode (no Arduino)', () => {
    vol1Experiments.forEach(e => {
      expect(e.simulationMode, `${e.id} should be circuit`).toBe('circuit');
    });
  });

  test('Volume 2 experiments are all "circuit" mode (no Arduino)', () => {
    vol2Experiments.forEach(e => {
      expect(e.simulationMode, `${e.id} should be circuit`).toBe('circuit');
    });
  });

  test('Volume 3 experiments are all "avr" mode (Arduino)', () => {
    vol3Experiments.forEach(e => {
      expect(e.simulationMode, `${e.id} should be avr`).toBe('avr');
    });
  });

  test('Circuit mode count (65) + AVR mode count (16) = 81', () => {
    const circuitCount = allExperiments.filter(e => e.simulationMode === 'circuit').length;
    const avrCount = allExperiments.filter(e => e.simulationMode === 'avr').length;
    expect(circuitCount).toBe(65);
    expect(avrCount).toBe(16);
    expect(circuitCount + avrCount).toBe(81);
  });
});
