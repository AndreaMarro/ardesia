/**
 * lessonGroupContext.test.js — Test completi per lesson-groups system
 * ~125 test: getExperimentGroupContext, findLessonForExperiment,
 * getLessonsForVolume, getLessonCount, cross-validation
 */
import { describe, it, expect } from 'vitest';
import LESSON_GROUPS, {
  findLessonForExperiment,
  getExperimentGroupContext,
  getLessonsForVolume,
  getLessonCount,
} from '../../src/data/lesson-groups.js';
import { ALL_EXPERIMENTS } from '../../src/data/experiments-index.js';

// ============================================================
// Helper: collect all experiment IDs from LESSON_GROUPS
// ============================================================
const ALL_LESSON_EXP_IDS = [];
const LESSON_ENTRIES = Object.entries(LESSON_GROUPS);
for (const [, lesson] of LESSON_ENTRIES) {
  ALL_LESSON_EXP_IDS.push(...lesson.experiments);
}

// ============================================================
// 1. getExperimentGroupContext — one test per experiment (92)
// ============================================================
describe('getExperimentGroupContext', () => {
  // Dynamically generate one test per experiment
  for (const [lessonId, lesson] of LESSON_ENTRIES) {
    const { experiments, chapter, title } = lesson;

    describe(`lesson "${lessonId}" (Cap. ${chapter}: ${title})`, () => {
      experiments.forEach((expId, idx) => {
        it(`returns valid context for ${expId}`, () => {
          const ctx = getExperimentGroupContext(expId);

          // Non-null
          expect(ctx).not.toBeNull();
          expect(ctx).toBeDefined();

          // position is 1-indexed
          expect(ctx.position).toBe(idx + 1);
          expect(ctx.position).toBeGreaterThanOrEqual(1);

          // total matches group length
          expect(ctx.total).toBe(experiments.length);

          // narrative is non-empty and contains chapter number
          expect(ctx.narrative).toBeTruthy();
          expect(ctx.narrative.length).toBeGreaterThan(0);
          expect(ctx.narrative).toContain(String(chapter));

          // prevExp / nextExp correctness
          if (idx === 0) {
            expect(ctx.prevExp).toBeNull();
          } else {
            expect(ctx.prevExp).toBe(experiments[idx - 1]);
          }

          if (idx === experiments.length - 1) {
            expect(ctx.nextExp).toBeNull();
          } else {
            expect(ctx.nextExp).toBe(experiments[idx + 1]);
          }

          // Volume and chapter are present
          expect(ctx.volume).toBe(lesson.volume);
          expect(ctx.chapter).toBe(chapter);
          expect(ctx.lessonTitle).toBe(title);
          expect(ctx.concept).toBeTruthy();
        });
      });
    });
  }

  it('returns null for unknown experiment ID', () => {
    expect(getExperimentGroupContext('v1-cap99-esp1')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(getExperimentGroupContext('')).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(getExperimentGroupContext(undefined)).toBeNull();
  });
});

// ============================================================
// 2. findLessonForExperiment — 15 tests
// ============================================================
describe('findLessonForExperiment', () => {
  it('finds correct lesson for v1-cap6-esp1', () => {
    const result = findLessonForExperiment('v1-cap6-esp1');
    expect(result).not.toBeNull();
    expect(result.lessonId).toBe('v1-accendi-led');
    expect(result.lesson.chapter).toBe(6);
  });

  it('finds correct lesson for v1-cap7-esp3', () => {
    const result = findLessonForExperiment('v1-cap7-esp3');
    expect(result).not.toBeNull();
    expect(result.lessonId).toBe('v1-led-rgb');
  });

  it('finds correct lesson for v1-cap9-esp7 (sfide)', () => {
    const result = findLessonForExperiment('v1-cap9-esp7');
    expect(result).not.toBeNull();
    expect(result.lessonId).toBe('v1-sfide-pot');
    expect(result.lesson.isChallenges).toBe(true);
  });

  it('finds correct lesson for v1-cap14-esp1 (robot)', () => {
    const result = findLessonForExperiment('v1-cap14-esp1');
    expect(result).not.toBeNull();
    expect(result.lessonId).toBe('v1-robot');
    expect(result.lesson.advancedProject).toBe(true);
  });

  it('finds correct lesson for v2-cap3-esp1', () => {
    const result = findLessonForExperiment('v2-cap3-esp1');
    expect(result).not.toBeNull();
    // Sprint U Cycle 3: rinominato da v2-resistenze a v2-multimetro per allineamento PDF v0.13 cap3
    expect(result.lessonId).toBe('v2-multimetro');
    expect(result.lesson.volume).toBe(2);
  });

  it('finds correct lesson for v2-cap8-esp2 (transistor)', () => {
    const result = findLessonForExperiment('v2-cap8-esp2');
    expect(result).not.toBeNull();
    expect(result.lessonId).toBe('v2-transistor');
  });

  it('finds correct lesson for v2-cap12-esp1 (robot segui luce)', () => {
    const result = findLessonForExperiment('v2-cap12-esp1');
    expect(result).not.toBeNull();
    expect(result.lessonId).toBe('v2-robot-segui-luce');
  });

  it('finds correct lesson for v3-cap5-esp1', () => {
    const result = findLessonForExperiment('v3-cap5-esp1');
    expect(result).not.toBeNull();
    expect(result.lessonId).toBe('v3-cap5-blink');
    expect(result.lesson.volume).toBe(3);
  });

  it('finds correct lesson for v3-cap6-esp5', () => {
    const result = findLessonForExperiment('v3-cap6-esp5');
    expect(result).not.toBeNull();
    expect(result.lessonId).toBe('v3-cap6-digitali');
  });

  it('returns null for unknown ID "v4-cap1-esp1"', () => {
    expect(findLessonForExperiment('v4-cap1-esp1')).toBeNull();
  });

  it('returns null for unknown ID "nonexistent"', () => {
    expect(findLessonForExperiment('nonexistent')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(findLessonForExperiment('')).toBeNull();
  });

  it('returns null for null', () => {
    expect(findLessonForExperiment(null)).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(findLessonForExperiment(undefined)).toBeNull();
  });
});

// ============================================================
// 3. getLessonsForVolume — 6 tests
// ============================================================
describe('getLessonsForVolume', () => {
  it('Vol 1 returns 10 lessons', () => {
    const lessons = getLessonsForVolume(1);
    expect(lessons).toHaveLength(10);
  });

  it('Vol 2 returns 9 lessons', () => {
    const lessons = getLessonsForVolume(2);
    expect(lessons).toHaveLength(9);
  });

  it('Vol 3 returns 4 lessons', () => {
    const lessons = getLessonsForVolume(3);
    expect(lessons).toHaveLength(4);
  });

  it('Vol 1 lessons are sorted by chapter', () => {
    const lessons = getLessonsForVolume(1);
    for (let i = 1; i < lessons.length; i++) {
      expect(lessons[i][1].chapter).toBeGreaterThanOrEqual(lessons[i - 1][1].chapter);
    }
  });

  it('Vol 2 lessons are sorted by chapter', () => {
    const lessons = getLessonsForVolume(2);
    for (let i = 1; i < lessons.length; i++) {
      expect(lessons[i][1].chapter).toBeGreaterThanOrEqual(lessons[i - 1][1].chapter);
    }
  });

  it('Vol 3 lessons are sorted by chapter', () => {
    const lessons = getLessonsForVolume(3);
    for (let i = 1; i < lessons.length; i++) {
      expect(lessons[i][1].chapter).toBeGreaterThanOrEqual(lessons[i - 1][1].chapter);
    }
  });
});

// ============================================================
// 4. getLessonCount — 2 tests
// ============================================================
describe('getLessonCount', () => {
  it('returns correct total count of 23', () => {
    expect(getLessonCount()).toBe(23);
  });

  it('matches sum of per-volume counts', () => {
    const v1 = getLessonsForVolume(1).length;
    const v2 = getLessonsForVolume(2).length;
    const v3 = getLessonsForVolume(3).length;
    expect(getLessonCount()).toBe(v1 + v2 + v3);
  });
});

// ============================================================
// 5. Cross-validation — 10 tests
// ============================================================
describe('Cross-validation with experiments-index', () => {
  const experimentIndexIds = new Set(ALL_EXPERIMENTS.map(e => e.id));

  it('ALL_EXPERIMENTS has at least 78 experiments', () => {
    expect(ALL_EXPERIMENTS.length).toBeGreaterThanOrEqual(78);
  });

  it('LESSON_GROUPS contains exactly 88 experiment IDs', () => {
    expect(ALL_LESSON_EXP_IDS.length).toBe(88);
  });

  it('every experiment in LESSON_GROUPS exists in experiments-index', () => {
    const missing = ALL_LESSON_EXP_IDS.filter(id => !experimentIndexIds.has(id));
    expect(missing).toEqual([]);
  });

  it('no experiment appears in multiple groups', () => {
    const seen = new Map();
    for (const [lessonId, lesson] of LESSON_ENTRIES) {
      for (const expId of lesson.experiments) {
        if (seen.has(expId)) {
          // Fail with useful message
          expect(`${expId} in ${lessonId}`).toBe(`${expId} already in ${seen.get(expId)}`);
        }
        seen.set(expId, lessonId);
      }
    }
    // All unique
    expect(seen.size).toBe(ALL_LESSON_EXP_IDS.length);
  });

  it('v1 group experiments all start with "v1-"', () => {
    const v1Lessons = getLessonsForVolume(1);
    for (const [, lesson] of v1Lessons) {
      for (const expId of lesson.experiments) {
        expect(expId).toMatch(/^v1-/);
      }
    }
  });

  it('v2 group experiments all start with "v2-"', () => {
    const v2Lessons = getLessonsForVolume(2);
    for (const [, lesson] of v2Lessons) {
      for (const expId of lesson.experiments) {
        expect(expId).toMatch(/^v2-/);
      }
    }
  });

  it('v3 group experiments all start with "v3-"', () => {
    const v3Lessons = getLessonsForVolume(3);
    for (const [, lesson] of v3Lessons) {
      for (const expId of lesson.experiments) {
        expect(expId).toMatch(/^v3-/);
      }
    }
  });

  it('every lesson has at least 1 experiment', () => {
    for (const [lessonId, lesson] of LESSON_ENTRIES) {
      expect(lesson.experiments.length, `${lessonId} has 0 experiments`).toBeGreaterThanOrEqual(1);
    }
  });

  it('every lesson has required fields (title, concept, volume, chapter)', () => {
    for (const [lessonId, lesson] of LESSON_ENTRIES) {
      expect(lesson.title, `${lessonId} missing title`).toBeTruthy();
      expect(lesson.concept, `${lessonId} missing concept`).toBeTruthy();
      expect(lesson.volume, `${lessonId} missing volume`).toBeDefined();
      expect(lesson.chapter, `${lessonId} missing chapter`).toBeDefined();
      expect([1, 2, 3]).toContain(lesson.volume);
    }
  });

  it('lesson group IDs follow naming convention v{N}-{slug}', () => {
    for (const [lessonId, lesson] of LESSON_ENTRIES) {
      expect(lessonId).toMatch(/^v[123]-[a-z]/);
      // Volume number in the ID matches the lesson volume
      const idVolume = parseInt(lessonId.charAt(1), 10);
      expect(idVolume, `${lessonId} ID says v${idVolume} but lesson.volume is ${lesson.volume}`).toBe(lesson.volume);
    }
  });
});
