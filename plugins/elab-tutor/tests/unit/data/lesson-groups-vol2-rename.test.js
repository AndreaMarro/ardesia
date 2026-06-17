// Sprint U Cycle 3 — Vol2 lesson-groups rinomina test
// PDR fix per audit task5-volumi-vol2.json verdetto.top_fix #1:
// 5/9 lesson-groups Vol2 MISLABELED (chapter labels shifted-by-1 vs PDF v0.13)
//
// Mapping rinomina:
// - v2-resistenze (cap3) → v2-multimetro (cap3 PDF = "Il Multimetro")
// - v2-led-avanzato (cap4) → v2-resistenze-serie-parallelo (cap4 PDF = "Approfondiamo le resistenze")
// - v2-condensatore (cap5) → v2-batterie-serie (cap5 PDF = "Approfondiamo le Batterie")
// - v2-circuiti-rc (cap6) → v2-led-vf-resistore (cap6 PDF = "Approfondiamo i Led")
// - v2-condensatori-combo (cap7) → v2-condensatori-rc (cap7 PDF = "Cosa sono i condensatori")
//
// Decisione 2A locked: solo id+title+concept+chapter (NO esperimenti touch)

import { describe, it, expect } from 'vitest';
import LESSON_GROUPS, { findLessonForExperiment } from '../../../src/data/lesson-groups.js';

describe('Vol2 lesson-groups rinomina — Sprint U Cycle 3', () => {
  describe('Old IDs MUST be removed', () => {
    it.each([
      'v2-resistenze',
      'v2-led-avanzato',
      'v2-condensatore',
      'v2-circuiti-rc',
      'v2-condensatori-combo',
    ])('old ID "%s" no longer exists', (oldId) => {
      expect(LESSON_GROUPS[oldId]).toBeUndefined();
    });
  });

  describe('New IDs MUST exist with PDF-aligned labels', () => {
    it('v2-multimetro (cap3) — Il Multimetro', () => {
      const lesson = LESSON_GROUPS['v2-multimetro'];
      expect(lesson).toBeDefined();
      expect(lesson.title).toBe('Il Multimetro');
      expect(lesson.chapter).toBe(3);
      expect(lesson.volume).toBe(2);
      expect(lesson.experiments).toEqual([
        'v2-cap3-esp1',
        'v2-cap3-esp2',
        'v2-cap3-esp3',
        'v2-cap3-esp4',
      ]);
    });

    it('v2-resistenze-serie-parallelo (cap4) — Resistenze in serie e parallelo', () => {
      const lesson = LESSON_GROUPS['v2-resistenze-serie-parallelo'];
      expect(lesson).toBeDefined();
      expect(lesson.title).toBe('Resistenze in serie e parallelo');
      expect(lesson.chapter).toBe(4);
      expect(lesson.volume).toBe(2);
      expect(lesson.experiments).toEqual([
        'v2-cap4-esp1',
        'v2-cap4-esp2',
        'v2-cap4-esp3',
      ]);
    });

    it('v2-batterie-serie (cap5) — Batterie in serie', () => {
      const lesson = LESSON_GROUPS['v2-batterie-serie'];
      expect(lesson).toBeDefined();
      expect(lesson.title).toBe('Batterie in serie');
      expect(lesson.chapter).toBe(5);
      expect(lesson.volume).toBe(2);
      expect(lesson.experiments).toEqual([
        'v2-cap5-esp1',
        'v2-cap5-esp2',
      ]);
    });

    it('v2-led-vf-resistore (cap6) — LED: tensione Vf e calcolo resistore', () => {
      const lesson = LESSON_GROUPS['v2-led-vf-resistore'];
      expect(lesson).toBeDefined();
      expect(lesson.title).toBe('LED: tensione Vf e calcolo resistore');
      expect(lesson.chapter).toBe(6);
      expect(lesson.volume).toBe(2);
      expect(lesson.experiments).toEqual([
        'v2-cap6-esp1',
        'v2-cap6-esp2',
        'v2-cap6-esp3',
        'v2-cap6-esp4',
      ]);
    });

    it('v2-condensatori-rc (cap7) — Condensatori e circuiti RC', () => {
      const lesson = LESSON_GROUPS['v2-condensatori-rc'];
      expect(lesson).toBeDefined();
      expect(lesson.title).toBe('Condensatori e circuiti RC');
      expect(lesson.chapter).toBe(7);
      expect(lesson.volume).toBe(2);
      expect(lesson.experiments).toEqual([
        'v2-cap7-esp1',
        'v2-cap7-esp2',
        'v2-cap7-esp3',
        'v2-cap7-esp4',
      ]);
    });
  });

  describe('Unchanged Vol2 lessons (sanity preservation)', () => {
    it.each([
      ['v2-transistor', 8],
      ['v2-fototransistor', 9],
      ['v2-motore', 10],
      ['v2-robot-segui-luce', 12],
    ])('lesson "%s" unchanged at chapter %d', (id, chapter) => {
      const lesson = LESSON_GROUPS[id];
      expect(lesson).toBeDefined();
      expect(lesson.chapter).toBe(chapter);
      expect(lesson.volume).toBe(2);
    });
  });

  describe('findLessonForExperiment maps to NEW IDs', () => {
    it('v2-cap3-esp1 → v2-multimetro (was v2-resistenze)', () => {
      const result = findLessonForExperiment('v2-cap3-esp1');
      expect(result).not.toBeNull();
      expect(result.lessonId).toBe('v2-multimetro');
    });

    it('v2-cap4-esp1 → v2-resistenze-serie-parallelo (was v2-led-avanzato)', () => {
      const result = findLessonForExperiment('v2-cap4-esp1');
      expect(result).not.toBeNull();
      expect(result.lessonId).toBe('v2-resistenze-serie-parallelo');
    });

    it('v2-cap5-esp1 → v2-batterie-serie (was v2-condensatore)', () => {
      const result = findLessonForExperiment('v2-cap5-esp1');
      expect(result).not.toBeNull();
      expect(result.lessonId).toBe('v2-batterie-serie');
    });

    it('v2-cap6-esp1 → v2-led-vf-resistore (was v2-circuiti-rc)', () => {
      const result = findLessonForExperiment('v2-cap6-esp1');
      expect(result).not.toBeNull();
      expect(result.lessonId).toBe('v2-led-vf-resistore');
    });

    it('v2-cap7-esp1 → v2-condensatori-rc (was v2-condensatori-combo)', () => {
      const result = findLessonForExperiment('v2-cap7-esp1');
      expect(result).not.toBeNull();
      expect(result.lessonId).toBe('v2-condensatori-rc');
    });
  });

  describe('Esperimenti coverage preservation (decisione 2A: NO esperimenti touch)', () => {
    it('all 27 Vol2 esperimenti still mapped to a lesson', () => {
      const vol2Ids = [
        'v2-cap3-esp1', 'v2-cap3-esp2', 'v2-cap3-esp3', 'v2-cap3-esp4',
        'v2-cap4-esp1', 'v2-cap4-esp2', 'v2-cap4-esp3',
        'v2-cap5-esp1', 'v2-cap5-esp2',
        'v2-cap6-esp1', 'v2-cap6-esp2', 'v2-cap6-esp3', 'v2-cap6-esp4',
        'v2-cap7-esp1', 'v2-cap7-esp2', 'v2-cap7-esp3', 'v2-cap7-esp4',
        'v2-cap8-esp1', 'v2-cap8-esp2', 'v2-cap8-esp3',
        'v2-cap9-esp1', 'v2-cap9-esp2',
        'v2-cap10-esp1', 'v2-cap10-esp2', 'v2-cap10-esp3', 'v2-cap10-esp4',
        'v2-cap12-esp1',
      ];
      vol2Ids.forEach((id) => {
        const result = findLessonForExperiment(id);
        expect(result).not.toBeNull();
        expect(result.lesson.volume).toBe(2);
      });
    });

    it('Vol2 has exactly 9 lessons (unchanged count)', () => {
      const vol2Lessons = Object.entries(LESSON_GROUPS).filter(
        ([, lesson]) => lesson.volume === 2,
      );
      expect(vol2Lessons).toHaveLength(9);
    });
  });
});
