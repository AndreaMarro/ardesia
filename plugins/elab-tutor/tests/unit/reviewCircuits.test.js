/**
 * reviewCircuits — Tests for circuit review quiz data integrity
 * Claude code andrea marro — 11/04/2026
 */
import { describe, it, expect } from 'vitest';
import REVIEW_CIRCUITS from '../../src/data/review-circuits';

describe('reviewCircuits', () => {
  it('REVIEW_CIRCUITS is a non-empty array', () => {
    expect(Array.isArray(REVIEW_CIRCUITS)).toBe(true);
    expect(REVIEW_CIRCUITS.length).toBeGreaterThan(5);
  });

  it('every circuit has description, components, questions', () => {
    for (const circuit of REVIEW_CIRCUITS) {
      expect(typeof circuit.description).toBe('string');
      expect(circuit.description.length).toBeGreaterThan(20);
      expect(Array.isArray(circuit.components)).toBe(true);
      expect(circuit.components.length).toBeGreaterThan(0);
      expect(Array.isArray(circuit.questions)).toBe(true);
      expect(circuit.questions.length).toBeGreaterThan(0);
    }
  });

  it('every question has text, options, correct index, explanation', () => {
    for (const circuit of REVIEW_CIRCUITS) {
      for (const q of circuit.questions) {
        expect(typeof q.text).toBe('string');
        expect(q.text.length).toBeGreaterThan(10);
        expect(Array.isArray(q.options)).toBe(true);
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        expect(typeof q.correct).toBe('number');
        expect(q.correct).toBeGreaterThanOrEqual(0);
        expect(q.correct).toBeLessThan(q.options.length);
        expect(typeof q.explanation).toBe('string');
        expect(q.explanation.length).toBeGreaterThan(10);
      }
    }
  });

  it('total questions across all circuits > 15', () => {
    const total = REVIEW_CIRCUITS.reduce((sum, c) => sum + c.questions.length, 0);
    expect(total).toBeGreaterThan(15);
  });

  it('covers basic, Arduino, and measurement topics', () => {
    const allDescriptions = REVIEW_CIRCUITS.map(c => c.description).join(' ');
    expect(allDescriptions).toContain('LED');
    expect(allDescriptions).toContain('Arduino');
    expect(allDescriptions).toContain('resistor');
  });
});
