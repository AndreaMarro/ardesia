/**
 * iter-70-experiments-data-integrity.test.js
 *
 * Iter 70 Team B — data integrity verification for all 88 experiments.
 *
 * Complements the existing experimentDataIntegrity.test.js but focuses on:
 *  1. Canonical ID regex compliance (v[1-3]-cap[0-9]+-esp\d+)
 *  2. unlimPrompt presence and minimum quality (non-empty string)
 *  3. connections field presence and correct type on all 88 experiments
 *  4. Vol3 chapter ordering matches book order (cap5 → cap6 → cap7 → cap8)
 *  5. Cross-volume ID uniqueness
 *  6. Exact counts (38 vol1, 27 vol2, 23 vol3 = 88 total)
 *  7. Vol3 chapter composition (cap5:2, cap6:8, cap7:7, cap8:6)
 *  8. Vol2 "simulable=false" experiments still have components array
 *  9. connections elements have {from, to} string fields
 * 10. layout field present on experiments with components
 * 11. No experiment has negative difficulty
 * 12. All Volume 3 IDs use clean canonical esp numbering
 * 13. Vol1+Vol2 experiments use simulationMode "circuit" (no Arduino)
 * 14. Vol3 experiments use simulationMode "avr" (Arduino)
 * 15. estimatedMinutes > 0 where present
 *
 * Target: 15+ test groups covering iter 70 mandate concerns.
 *
 * (c) Andrea Marro 2026-05-19 — ELAB Tutor — iter 70 Team B
 */

import { describe, test, expect } from 'vitest';
import EXPERIMENTS_VOL1 from '../../src/data/experiments-vol1.js';
import EXPERIMENTS_VOL2 from '../../src/data/experiments-vol2.js';
import EXPERIMENTS_VOL3 from '../../src/data/experiments-vol3.js';

const vol1 = EXPERIMENTS_VOL1.experiments;
const vol2 = EXPERIMENTS_VOL2.experiments;
const vol3 = EXPERIMENTS_VOL3.experiments;
const all = [...vol1, ...vol2, ...vol3];

// Canonical ID regex after Volume 3 printed-manual alignment.
const CANONICAL_ID_REGEX = /^v[1-3]-cap\d+-esp\d+$/;

// ═══════════════════════════════════════════════════════════════════════════
// 1. Exact counts — printed-manual reality check (88 canonical experiments)
// ═══════════════════════════════════════════════════════════════════════════
describe('1. Exact experiment counts', () => {
  test('Volume 1 has exactly 38 experiments', () => {
    expect(vol1.length).toBe(38);
  });

  test('Volume 2 has exactly 27 experiments', () => {
    expect(vol2.length).toBe(27);
  });

  test('Volume 3 has exactly 23 experiments', () => {
    expect(vol3.length).toBe(23);
  });

  test('Total across all volumes is 88', () => {
    expect(all.length).toBe(88);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. All 88 IDs match canonical regex
// ═══════════════════════════════════════════════════════════════════════════
describe('2. All IDs match canonical regex v[1-3]-cap\\d+-esp\\d+', () => {
  all.forEach((exp) => {
    test(`${exp.id} matches canonical ID regex`, () => {
      expect(exp.id, `"${exp.id}" does not match canonical regex`).toMatch(CANONICAL_ID_REGEX);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. All 88 IDs are unique across volumes
// ═══════════════════════════════════════════════════════════════════════════
describe('3. ID uniqueness', () => {
  test('No duplicate IDs across all 88 experiments', () => {
    const ids = all.map((e) => e.id);
    const unique = new Set(ids);
    const duplicates = ids.filter((id, idx) => ids.indexOf(id) !== idx);
    expect(duplicates, `Duplicate IDs found: ${duplicates.join(', ')}`).toEqual([]);
    expect(unique.size).toBe(all.length);
  });

  test('No duplicate IDs within Volume 1', () => {
    const ids = vol1.map((e) => e.id);
    const dups = ids.filter((id, idx) => ids.indexOf(id) !== idx);
    expect(dups).toEqual([]);
  });

  test('No duplicate IDs within Volume 2', () => {
    const ids = vol2.map((e) => e.id);
    const dups = ids.filter((id, idx) => ids.indexOf(id) !== idx);
    expect(dups).toEqual([]);
  });

  test('No duplicate IDs within Volume 3', () => {
    const ids = vol3.map((e) => e.id);
    const dups = ids.filter((id, idx) => ids.indexOf(id) !== idx);
    expect(dups).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. All experiments have required fields: title + unlimPrompt + components + connections
// ═══════════════════════════════════════════════════════════════════════════
describe('4. Required fields present on all 88 experiments', () => {
  all.forEach((exp) => {
    test(`${exp.id} has title + unlimPrompt + components + connections`, () => {
      expect(exp.title, `${exp.id} missing title`).toBeTruthy();
      expect(typeof exp.title).toBe('string');
      expect(exp.title.length, `${exp.id} title is empty`).toBeGreaterThan(0);

      expect(exp.unlimPrompt, `${exp.id} missing unlimPrompt`).toBeTruthy();
      expect(typeof exp.unlimPrompt).toBe('string');
      expect(exp.unlimPrompt.length, `${exp.id} unlimPrompt is too short (< 20 chars)`).toBeGreaterThanOrEqual(20);

      expect(exp.components, `${exp.id} missing components`).toBeDefined();
      expect(Array.isArray(exp.components), `${exp.id} components is not an array`).toBe(true);
      expect(exp.components.length, `${exp.id} has zero components`).toBeGreaterThan(0);

      expect(exp.connections, `${exp.id} missing connections field`).toBeDefined();
      expect(Array.isArray(exp.connections), `${exp.id} connections is not an array`).toBe(true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. connections elements have {from, to} string fields
// ═══════════════════════════════════════════════════════════════════════════
describe('5. connections elements are valid {from, to} objects', () => {
  all.forEach((exp) => {
    if (!exp.connections || exp.connections.length === 0) return;
    test(`${exp.id} connections elements have from+to strings`, () => {
      exp.connections.forEach((conn, idx) => {
        expect(typeof conn.from, `${exp.id} connections[${idx}].from is not string`).toBe('string');
        expect(conn.from.length, `${exp.id} connections[${idx}].from is empty`).toBeGreaterThan(0);
        expect(typeof conn.to, `${exp.id} connections[${idx}].to is not string`).toBe('string');
        expect(conn.to.length, `${exp.id} connections[${idx}].to is empty`).toBeGreaterThan(0);
      });
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. Vol3 chapter ordering matches book order: cap5 → cap6 → cap7 → cap8
// ═══════════════════════════════════════════════════════════════════════════
describe('6. Vol3 chapter ordering matches book order (cap5 → cap6 → cap7 → cap8)', () => {
  test('Vol3 experiments are in ascending chapter order in the array', () => {
    const chapNumbers = vol3.map((e) => {
      const m = e.id.match(/^v3-cap(\d+)-/);
      return m ? parseInt(m[1], 10) : -1;
    });

    // Chapters must be non-decreasing (sorted ascending)
    for (let i = 1; i < chapNumbers.length; i++) {
      expect(
        chapNumbers[i],
        `Vol3 experiment at index ${i} (${vol3[i].id}) has chapter ${chapNumbers[i]} ` +
          `which is lower than previous chapter ${chapNumbers[i - 1]}`
      ).toBeGreaterThanOrEqual(chapNumbers[i - 1]);
    }
  });

  test('Vol3 first experiment is in cap5', () => {
    expect(vol3[0].id).toMatch(/^v3-cap5-/);
  });

  test('Vol3 last experiment is in cap8', () => {
    expect(vol3[vol3.length - 1].id).toMatch(/^v3-cap8-/);
  });

  test('Vol3 chapter 5 has exactly 2 experiments', () => {
    const cap5 = vol3.filter((e) => e.id.startsWith('v3-cap5-'));
    expect(cap5.length).toBe(2);
  });

  test('Vol3 chapter 6 has exactly 8 experiments', () => {
    const cap6 = vol3.filter((e) => e.id.startsWith('v3-cap6-'));
    expect(cap6.length).toBe(8);
  });

  test('Vol3 chapter 7 has exactly 7 experiments', () => {
    const cap7 = vol3.filter((e) => e.id.startsWith('v3-cap7-'));
    expect(cap7.length).toBe(7);
  });

  test('Vol3 chapter 8 has exactly 6 experiments', () => {
    const cap8 = vol3.filter((e) => e.id.startsWith('v3-cap8-'));
    expect(cap8.length).toBe(6);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. Volume 3 IDs are clean canonical esp IDs
// ═══════════════════════════════════════════════════════════════════════════
describe('7. Canonical ID suffixes are used everywhere', () => {
  test('No non-standard suffixes remain', () => {
    const nonStandard = all.filter((e) => !/^v[1-3]-cap\d+-esp\d+$/.test(e.id));
    expect(
      nonStandard.map((e) => e.id),
      'Unexpected non-standard IDs found'
    ).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 8. Vol1 + Vol2 use simulationMode "circuit" (no Arduino)
// ═══════════════════════════════════════════════════════════════════════════
describe('8. simulationMode correctness by volume', () => {
  test('All Vol1 experiments use simulationMode "circuit"', () => {
    const wrong = vol1.filter((e) => e.simulationMode !== 'circuit');
    expect(wrong.map((e) => `${e.id}:${e.simulationMode}`)).toEqual([]);
  });

  test('All Vol2 experiments use simulationMode "circuit"', () => {
    const wrong = vol2.filter((e) => e.simulationMode !== 'circuit');
    expect(wrong.map((e) => `${e.id}:${e.simulationMode}`)).toEqual([]);
  });

  test('All Vol3 experiments use simulationMode "avr"', () => {
    const wrong = vol3.filter((e) => e.simulationMode !== 'avr');
    expect(wrong.map((e) => `${e.id}:${e.simulationMode}`)).toEqual([]);
  });

  test('Total circuit mode = 65 (Vol1+Vol2), total avr mode = 23 (Vol3)', () => {
    const circuitCount = all.filter((e) => e.simulationMode === 'circuit').length;
    const avrCount = all.filter((e) => e.simulationMode === 'avr').length;
    expect(circuitCount).toBe(65);
    expect(avrCount).toBe(23);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 9. Vol2 simulable=false experiments still have non-empty components array
// ═══════════════════════════════════════════════════════════════════════════
describe('9. Vol2 non-simulable experiments still have components', () => {
  const nonSimulableVol2 = vol2.filter((e) => e.simulable === false);

  test('There are some non-simulable experiments in Vol2', () => {
    // vol2 has multimeter experiments marked simulable=false
    expect(nonSimulableVol2.length).toBeGreaterThan(0);
  });

  nonSimulableVol2.forEach((exp) => {
    test(`${exp.id} (non-simulable) still has components array`, () => {
      expect(Array.isArray(exp.components)).toBe(true);
      expect(exp.components.length).toBeGreaterThan(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 10. layout field present on experiments with components
// ═══════════════════════════════════════════════════════════════════════════
describe('10. layout field present and non-empty for all experiments', () => {
  all.forEach((exp) => {
    test(`${exp.id} has layout object with at least one entry`, () => {
      expect(exp.layout, `${exp.id} missing layout`).toBeDefined();
      expect(typeof exp.layout).toBe('object');
      expect(exp.layout).not.toBeNull();
      const keys = Object.keys(exp.layout);
      expect(keys.length, `${exp.id} layout is empty`).toBeGreaterThan(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 11. Difficulty is positive integer (no negatives, no zero)
// ═══════════════════════════════════════════════════════════════════════════
describe('11. Difficulty is a positive integer 1-5', () => {
  test('No experiment has difficulty <= 0', () => {
    const bad = all.filter((e) => !e.difficulty || e.difficulty <= 0);
    expect(bad.map((e) => `${e.id}:${e.difficulty}`)).toEqual([]);
  });

  test('No experiment has difficulty > 5', () => {
    const bad = all.filter((e) => e.difficulty > 5);
    expect(bad.map((e) => `${e.id}:${e.difficulty}`)).toEqual([]);
  });

  test('All difficulty values are integers', () => {
    const bad = all.filter((e) => !Number.isInteger(e.difficulty));
    expect(bad.map((e) => `${e.id}:${e.difficulty}`)).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 12. estimatedMinutes > 0 where present
// ═══════════════════════════════════════════════════════════════════════════
describe('12. estimatedMinutes is positive where defined', () => {
  const withMinutes = all.filter((e) => e.estimatedMinutes !== undefined && e.estimatedMinutes !== null);

  test('Experiments with estimatedMinutes have it > 0', () => {
    const bad = withMinutes.filter((e) => e.estimatedMinutes <= 0);
    expect(bad.map((e) => `${e.id}:${e.estimatedMinutes}`)).toEqual([]);
  });

  test('estimatedMinutes is a number where present', () => {
    const bad = withMinutes.filter((e) => typeof e.estimatedMinutes !== 'number');
    expect(bad.map((e) => `${e.id}:${typeof e.estimatedMinutes}`)).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 13. unlimPrompt language check (Italian — rudimentary keyword test)
// ═══════════════════════════════════════════════════════════════════════════
describe('13. unlimPrompt is in Italian (contains Italian keywords)', () => {
  // Spot-check: UNLIM always ends with "Rispondi in italiano."
  const itKeywords = /Rispondi in italiano|Sei UNLIM|il docente|bambini|la classe/i;

  all.forEach((exp) => {
    test(`${exp.id} unlimPrompt contains Italian indicator`, () => {
      expect(exp.unlimPrompt, `${exp.id} unlimPrompt missing — cannot check language`).toBeTruthy();
      expect(
        itKeywords.test(exp.unlimPrompt),
        `${exp.id} unlimPrompt appears not in Italian: "${exp.unlimPrompt.slice(0, 80)}..."`
      ).toBe(true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 14. Vol3 canonical chapter checks
// ═══════════════════════════════════════════════════════════════════════════
describe('14. Vol3 canonical chapter fields are correct', () => {
  test('All Cap.6 experiments have simulationMode avr and chapter field containing "Capitolo 6"', () => {
    const cap6 = vol3.filter((e) => e.id.startsWith('v3-cap6-'));
    expect(cap6).toHaveLength(8);
    cap6.forEach((exp) => {
      expect(exp.simulationMode).toBe('avr');
      expect(exp.chapter).toMatch(/capitolo 6|cap.*6/i);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 15. Component IDs within each experiment are unique
// ═══════════════════════════════════════════════════════════════════════════
describe('15. Component IDs are unique within each experiment', () => {
  all.forEach((exp) => {
    if (!exp.components || exp.components.length < 2) return;
    test(`${exp.id} has no duplicate component IDs`, () => {
      const compIds = exp.components.map((c) => c.id);
      const unique = new Set(compIds);
      const dups = compIds.filter((id, idx) => compIds.indexOf(id) !== idx);
      expect(
        dups,
        `${exp.id} has duplicate component IDs: ${dups.join(', ')}`
      ).toEqual([]);
      expect(unique.size).toBe(compIds.length);
    });
  });
});
