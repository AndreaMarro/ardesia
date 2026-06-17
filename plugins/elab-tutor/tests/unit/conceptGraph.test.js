/**
 * conceptGraph — Tests for concept dependency graph data integrity
 * Claude code andrea marro — 11/04/2026
 */
import { describe, it, expect } from 'vitest';
import { CONCEPTS } from '../../src/data/concept-graph';

describe('conceptGraph', () => {
  it('CONCEPTS is a non-empty object', () => {
    expect(typeof CONCEPTS).toBe('object');
    expect(Object.keys(CONCEPTS).length).toBeGreaterThan(5);
  });

  it('every concept has required fields', () => {
    for (const [id, concept] of Object.entries(CONCEPTS)) {
      expect(concept.name).toBeTruthy();
      expect(concept.description).toBeTruthy();
      expect(concept.analogy).toBeTruthy();
      expect(concept.firstTaught).toBeTruthy();
      expect(typeof concept.difficulty).toBe('number');
      expect(concept.difficulty).toBeGreaterThanOrEqual(1);
      expect(concept.difficulty).toBeLessThanOrEqual(3);
    }
  });

  it('every concept has a metaphor (double analogy)', () => {
    for (const [id, concept] of Object.entries(CONCEPTS)) {
      expect(concept.metaphor).toBeTruthy();
      expect(concept.metaphor.length).toBeGreaterThan(20);
    }
  });

  it('firstTaught references valid experiment IDs', () => {
    for (const [id, concept] of Object.entries(CONCEPTS)) {
      expect(concept.firstTaught).toMatch(/^v\d+-cap\d+/);
    }
  });

  it('analogies are kid-friendly (max ~30 words)', () => {
    for (const [id, concept] of Object.entries(CONCEPTS)) {
      const words = concept.analogy.split(/\s+/).length;
      expect(words).toBeLessThanOrEqual(50);
    }
  });

  it('contains fundamental concepts', () => {
    expect(CONCEPTS['circuito-chiuso']).toBeDefined();
    expect(CONCEPTS['polarita-led']).toBeDefined();
    expect(CONCEPTS['resistenza-protezione']).toBeDefined();
  });

  it('circuito-chiuso is difficulty 1', () => {
    expect(CONCEPTS['circuito-chiuso'].difficulty).toBe(1);
  });
});
