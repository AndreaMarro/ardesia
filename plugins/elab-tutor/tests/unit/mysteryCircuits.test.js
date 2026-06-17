/**
 * mysteryCircuits — Tests for reverse engineering mystery circuits data
 * Claude code andrea marro — 11/04/2026
 */
import { describe, it, expect } from 'vitest';
import { MYSTERY_CIRCUITS } from '../../src/data/mystery-circuits';

describe('mysteryCircuits', () => {
  it('MYSTERY_CIRCUITS is a non-empty array', () => {
    expect(Array.isArray(MYSTERY_CIRCUITS)).toBe(true);
    expect(MYSTERY_CIRCUITS.length).toBeGreaterThan(2);
  });

  it('every mystery has required fields', () => {
    for (const m of MYSTERY_CIRCUITS) {
      expect(m.id).toBeTruthy();
      expect(m.title).toBeTruthy();
      expect(typeof m.difficulty).toBe('number');
      expect(m.description).toBeTruthy();
      expect(Array.isArray(m.visibleParts)).toBe(true);
      expect(m.hiddenPart).toBeDefined();
      expect(m.hiddenPart.name).toBeTruthy();
      expect(m.behavior).toBeTruthy();
      expect(Array.isArray(m.guessOptions)).toBe(true);
      expect(typeof m.correctGuess).toBe('number');
      expect(m.solution).toBeTruthy();
    }
  });

  it('all IDs are unique', () => {
    const ids = MYSTERY_CIRCUITS.map(m => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('correctGuess index is valid for each mystery', () => {
    for (const m of MYSTERY_CIRCUITS) {
      expect(m.correctGuess).toBeGreaterThanOrEqual(0);
      expect(m.correctGuess).toBeLessThan(m.guessOptions.length);
    }
  });

  it('every mystery has test points', () => {
    for (const m of MYSTERY_CIRCUITS) {
      expect(Array.isArray(m.testPoints)).toBe(true);
      expect(m.testPoints.length).toBeGreaterThan(0);
      for (const tp of m.testPoints) {
        expect(tp.id).toBeTruthy();
        expect(tp.label).toBeTruthy();
        expect(tp.value).toBeTruthy();
        expect(tp.hint).toBeTruthy();
      }
    }
  });

  it('every mystery references a related experiment', () => {
    for (const m of MYSTERY_CIRCUITS) {
      expect(m.relatedExperiment).toBeTruthy();
      expect(m.relatedExperiment).toMatch(/^v\d+-cap\d+/);
    }
  });

  it('has connection to volume text', () => {
    for (const m of MYSTERY_CIRCUITS) {
      expect(m.connectionToVolume).toBeTruthy();
      expect(m.connectionToVolume).toContain('Volume');
    }
  });

  it('difficulty ranges from 1 to 3', () => {
    for (const m of MYSTERY_CIRCUITS) {
      expect(m.difficulty).toBeGreaterThanOrEqual(1);
      expect(m.difficulty).toBeLessThanOrEqual(3);
    }
  });
});
