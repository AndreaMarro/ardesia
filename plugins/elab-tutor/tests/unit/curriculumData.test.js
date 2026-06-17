/**
 * curriculumData — Tests for teacher pedagogy data integrity
 * Validates structure, analogies, and assessment criteria.
 * Claude code andrea marro — 11/04/2026
 */
import { describe, it, expect } from 'vitest';
import CURRICULUM, { getCurriculum } from '../../src/data/curriculumData';

describe('curriculumData', () => {
  it('CURRICULUM is a non-empty object', () => {
    expect(typeof CURRICULUM).toBe('object');
    expect(Object.keys(CURRICULUM).length).toBeGreaterThan(0);
  });

  it('getCurriculum returns data for v1-cap6-esp1', () => {
    const data = getCurriculum('v1-cap6-esp1');
    expect(data).not.toBeNull();
  });

  it('getCurriculum returns null for unknown experiment', () => {
    expect(getCurriculum('nonexistent')).toBeNull();
  });

  it('every entry has teacherBriefing with 3 fields', () => {
    for (const [id, entry] of Object.entries(CURRICULUM)) {
      expect(entry.teacherBriefing).toBeDefined();
      expect(entry.teacherBriefing.beforeClass).toBeTruthy();
      expect(entry.teacherBriefing.duringClass).toBeTruthy();
      expect(entry.teacherBriefing.commonQuestion).toBeTruthy();
    }
  });

  it('every entry has commonMistakes array', () => {
    for (const [id, entry] of Object.entries(CURRICULUM)) {
      expect(Array.isArray(entry.commonMistakes)).toBe(true);
      expect(entry.commonMistakes.length).toBeGreaterThan(0);
      for (const m of entry.commonMistakes) {
        expect(m.error).toBeTruthy();
        expect(m.response).toBeTruthy();
      }
    }
  });

  it('every entry has analogies array', () => {
    for (const [id, entry] of Object.entries(CURRICULUM)) {
      expect(Array.isArray(entry.analogies)).toBe(true);
      expect(entry.analogies.length).toBeGreaterThan(0);
      for (const a of entry.analogies) {
        expect(a.concept).toBeTruthy();
        expect(a.text).toBeTruthy();
      }
    }
  });

  it('every entry has assessment array', () => {
    for (const [id, entry] of Object.entries(CURRICULUM)) {
      expect(Array.isArray(entry.assessment)).toBe(true);
      expect(entry.assessment.length).toBeGreaterThan(0);
    }
  });

  it('all IDs follow v{N}-cap{N}-esp{N} format', () => {
    for (const id of Object.keys(CURRICULUM)) {
      expect(id).toMatch(/^v\d+-cap\d+-esp\d+$/);
    }
  });
});
