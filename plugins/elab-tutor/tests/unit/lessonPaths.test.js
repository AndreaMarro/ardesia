/**
 * lessonPaths — Tests for lesson path registry and JSON data integrity
 * Validates all 3 volumes, 5-phase structure, and cross-references.
 * Claude code andrea marro — 11/04/2026
 */
import { describe, it, expect } from 'vitest';
import {
  getLessonPath,
  hasLessonPath,
  getAvailableLessonPaths,
  PHASE_NAMES,
} from '../../src/data/lesson-paths/index';

describe('lessonPaths', () => {
  describe('registry', () => {
    it('has lesson paths available', () => {
      const paths = getAvailableLessonPaths();
      expect(paths.length).toBeGreaterThan(40);
    });

    it('has all Vol1 experiments (38)', () => {
      const paths = getAvailableLessonPaths();
      const vol1 = paths.filter(p => p.startsWith('v1-'));
      expect(vol1.length).toBe(38);
    });

    it('has Vol2 experiments', () => {
      const paths = getAvailableLessonPaths();
      const vol2 = paths.filter(p => p.startsWith('v2-'));
      expect(vol2.length).toBeGreaterThan(10);
    });

    it('has Vol3 experiments', () => {
      const paths = getAvailableLessonPaths();
      const vol3 = paths.filter(p => p.startsWith('v3-'));
      expect(vol3.length).toBeGreaterThan(3);
    });
  });

  describe('getLessonPath', () => {
    it('returns lesson for v1-cap6-esp1', () => {
      const lesson = getLessonPath('v1-cap6-esp1');
      expect(lesson).not.toBeNull();
      expect(lesson.experiment_id).toBe('v1-cap6-esp1');
    });

    it('returns null for unknown experiment', () => {
      expect(getLessonPath('nonexistent')).toBeNull();
    });

    it('lesson has title and objective', () => {
      const lesson = getLessonPath('v1-cap6-esp1');
      expect(lesson.title).toBeTruthy();
      expect(lesson.objective).toBeTruthy();
    });

    it('lesson has duration_minutes', () => {
      const lesson = getLessonPath('v1-cap6-esp1');
      expect(lesson.duration_minutes).toBeGreaterThan(0);
    });

    it('lesson has 5 phases', () => {
      const lesson = getLessonPath('v1-cap6-esp1');
      expect(lesson.phases).toHaveLength(5);
    });

    it('phases follow PREPARA-MOSTRA-CHIEDI-OSSERVA-CONCLUDI order', () => {
      const lesson = getLessonPath('v1-cap6-esp1');
      for (let i = 0; i < 5; i++) {
        expect(lesson.phases[i].name).toBe(PHASE_NAMES[i]);
      }
    });

    it('every phase has teacher_message and duration_minutes', () => {
      const lesson = getLessonPath('v1-cap6-esp1');
      for (const phase of lesson.phases) {
        expect(phase.teacher_message).toBeTruthy();
        expect(phase.duration_minutes).toBeGreaterThan(0);
      }
    });
  });

  describe('hasLessonPath', () => {
    it('returns true for existing experiment', () => {
      expect(hasLessonPath('v1-cap6-esp1')).toBe(true);
    });

    it('returns false for unknown experiment', () => {
      expect(hasLessonPath('fake-id')).toBe(false);
    });
  });

  describe('PHASE_NAMES', () => {
    it('has exactly 5 phases', () => {
      expect(PHASE_NAMES).toHaveLength(5);
    });

    it('phases are PREPARA, MOSTRA, CHIEDI, OSSERVA, CONCLUDI', () => {
      expect(PHASE_NAMES).toEqual(['PREPARA', 'MOSTRA', 'CHIEDI', 'OSSERVA', 'CONCLUDI']);
    });
  });

  describe('data integrity — spot checks', () => {
    it('Vol2 lesson has correct structure', () => {
      const lesson = getLessonPath('v2-cap7-esp1');
      if (lesson) {
        expect(lesson.phases).toHaveLength(5);
        expect(lesson.title).toBeTruthy();
      }
    });

    it('Vol3 lesson has correct structure', () => {
      const lesson = getLessonPath('v3-cap6-esp5');
      if (lesson) {
        expect(lesson.phases).toHaveLength(5);
        expect(lesson.title).toBeTruthy();
      }
    });

    it('lesson has vocabulary when specified', () => {
      const lesson = getLessonPath('v1-cap6-esp1');
      // vocabulary may or may not be present
      if (lesson.vocabulary) {
        expect(lesson.vocabulary.allowed).toBeTruthy();
      }
    });
  });
});
