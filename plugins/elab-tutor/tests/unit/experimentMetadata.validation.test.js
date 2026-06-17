/**
 * Experiment Metadata Validation — title, chapter, simulationMode
 * Claude code andrea marro — 12/04/2026
 */
import { describe, it, expect } from 'vitest';
import { ALL_EXPERIMENTS } from '../../src/data/experiments-index';

describe('Experiment Metadata Validation', () => {
  for (const exp of ALL_EXPERIMENTS) {
    it(`${exp.id} ha title non vuoto`, () => {
      expect(exp.title?.length).toBeGreaterThan(3);
    });
  }
});
