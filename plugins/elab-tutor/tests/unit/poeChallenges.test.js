/**
 * poeChallenges — Tests for Predict-Observe-Explain challenges
 * Claude code andrea marro — 11/04/2026
 */
import { describe, it, expect } from 'vitest';
import { POE_CHALLENGES } from '../../src/data/poe-challenges';

describe('poeChallenges', () => {
  it('POE_CHALLENGES is a non-empty array', () => {
    expect(Array.isArray(POE_CHALLENGES)).toBe(true);
    expect(POE_CHALLENGES.length).toBeGreaterThan(3);
  });

  it('every challenge has required fields', () => {
    for (const ch of POE_CHALLENGES) {
      expect(ch.id).toBeTruthy();
      expect(ch.question).toBeTruthy();
      expect(Array.isArray(ch.options)).toBe(true);
      expect(ch.options.length).toBeGreaterThanOrEqual(2);
      expect(typeof ch.correctAnswer).toBe('number');
      expect(ch.correctAnswer).toBeGreaterThanOrEqual(0);
      expect(ch.correctAnswer).toBeLessThan(ch.options.length);
      expect(ch.explanation).toBeTruthy();
      expect(ch.concept).toBeTruthy();
    }
  });

  it('all IDs are unique', () => {
    const ids = POE_CHALLENGES.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every challenge has a funFact', () => {
    for (const ch of POE_CHALLENGES) {
      expect(ch.funFact).toBeTruthy();
      expect(ch.funFact.length).toBeGreaterThan(10);
    }
  });

  it('covers Volume 1 experiments', () => {
    const vol1 = POE_CHALLENGES.filter(c => c.volume === 1);
    expect(vol1.length).toBeGreaterThan(0);
  });

  it('every challenge has a layer (terra/schema)', () => {
    const validLayers = ['terra', 'schema'];
    for (const ch of POE_CHALLENGES) {
      expect(validLayers).toContain(ch.layer);
    }
  });
});
