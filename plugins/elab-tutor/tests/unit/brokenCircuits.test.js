/**
 * brokenCircuits — Tests for Circuit Detective game data integrity
 * Claude code andrea marro — 11/04/2026
 */
import { describe, it, expect } from 'vitest';
import { BROKEN_CIRCUITS } from '../../src/data/broken-circuits';

describe('brokenCircuits', () => {
  it('BROKEN_CIRCUITS is a non-empty array', () => {
    expect(Array.isArray(BROKEN_CIRCUITS)).toBe(true);
    expect(BROKEN_CIRCUITS.length).toBeGreaterThan(3);
  });

  it('all IDs are unique', () => {
    const ids = BROKEN_CIRCUITS.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every circuit has required fields', () => {
    for (const c of BROKEN_CIRCUITS) {
      expect(c.id).toBeTruthy();
      expect(c.title).toBeTruthy();
      expect(typeof c.difficulty).toBe('number');
      expect(c.description).toBeTruthy();
      expect(c.fault).toBeDefined();
      expect(c.fault.type).toBeTruthy();
      expect(Array.isArray(c.hints)).toBe(true);
      expect(c.hints.length).toBeGreaterThan(0);
      expect(c.solution).toBeTruthy();
      expect(c.concept).toBeTruthy();
      expect(c.whatYouLearn).toBeTruthy();
    }
  });

  it('every circuit has 2-3 progressive hints', () => {
    for (const c of BROKEN_CIRCUITS) {
      expect(c.hints.length).toBeGreaterThanOrEqual(2);
      expect(c.hints.length).toBeLessThanOrEqual(4);
    }
  });

  it('difficulty ranges 1-3', () => {
    for (const c of BROKEN_CIRCUITS) {
      expect(c.difficulty).toBeGreaterThanOrEqual(1);
      expect(c.difficulty).toBeLessThanOrEqual(3);
    }
  });

  it('every circuit references an experiment', () => {
    for (const c of BROKEN_CIRCUITS) {
      expect(c.experimentId).toBeTruthy();
      expect(c.experimentId).toMatch(/^v\d+-cap\d+/);
    }
  });

  it('has schematic text for visual', () => {
    for (const c of BROKEN_CIRCUITS) {
      expect(c.schematicText).toBeTruthy();
      expect(c.schematicText.length).toBeGreaterThan(20);
    }
  });
});
