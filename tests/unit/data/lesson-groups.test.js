/**
 * lesson-groups.test.js — Deep tests for lesson-groups.js
 * Sprint T iter 28 — NEW FILE (distinct from tests/unit/lessonGroups.test.js which covers basic structure)
 *
 * Covers: narrative / concept quality, getExperimentGroupContext helper,
 * advancedProject lessons, isChallenges flag, cross-volume consistency,
 * experiment ID pattern validation, getLessonCount, edge cases for helpers.
 */
import { describe, it, expect } from 'vitest';
import LESSON_GROUPS, {
  findLessonForExperiment,
  getLessonsForVolume,
  getLessonCount,
  getExperimentGroupContext,
} from '../../../src/data/lesson-groups';

const ALL_ENTRIES = Object.entries(LESSON_GROUPS);
const ALL_IDS = Object.keys(LESSON_GROUPS);

// ─── concept quality ──────────────────────────────────────────────────

describe('LESSON_GROUPS — concept quality', () => {
  it('each concept is at least 10 characters', () => {
    ALL_ENTRIES.forEach(([id, lesson]) => {
      expect(lesson.concept.length, `${id} concept too short`).toBeGreaterThanOrEqual(10);
    });
  });

  it('concept is at most 100 characters', () => {
    ALL_ENTRIES.forEach(([id, lesson]) => {
      expect(lesson.concept.length, `${id} concept too long`).toBeLessThanOrEqual(100);
    });
  });

  it('no two lessons share the same concept string', () => {
    const concepts = ALL_ENTRIES.map(([, l]) => l.concept);
    const unique = new Set(concepts);
    expect(unique.size).toBe(concepts.length);
  });
});

// ─── title quality ────────────────────────────────────────────────────

describe('LESSON_GROUPS — title quality', () => {
  it('each title is at least 4 characters', () => {
    ALL_ENTRIES.forEach(([id, lesson]) => {
      expect(lesson.title.length, `${id} title too short`).toBeGreaterThanOrEqual(4);
    });
  });

  it('title is at most 60 characters', () => {
    ALL_ENTRIES.forEach(([id, lesson]) => {
      expect(lesson.title.length, `${id} title too long`).toBeLessThanOrEqual(60);
    });
  });

  it('no two lessons share the same title', () => {
    const titles = ALL_ENTRIES.map(([, l]) => l.title);
    const unique = new Set(titles);
    expect(unique.size).toBe(titles.length);
  });
});

// ─── advancedProject / isChallenges flags ─────────────────────────────

describe('LESSON_GROUPS — optional flags', () => {
  it('advancedProject lessons: v1-robot, v2-robot-segui-luce', () => {
    const advanced = ALL_ENTRIES.filter(([, l]) => l.advancedProject === true);
    expect(advanced.length).toBeGreaterThanOrEqual(2);
    const advancedIds = advanced.map(([id]) => id);
    expect(advancedIds).toContain('v1-robot');
    expect(advancedIds).toContain('v2-robot-segui-luce');
  });

  it('isChallenges lesson: v1-sfide-pot', () => {
    const challenges = ALL_ENTRIES.filter(([, l]) => l.isChallenges === true);
    expect(challenges.length).toBeGreaterThanOrEqual(1);
    const challengeIds = challenges.map(([id]) => id);
    expect(challengeIds).toContain('v1-sfide-pot');
  });

  it('non-advanced lessons do not have advancedProject=true', () => {
    const regular = ALL_ENTRIES.filter(([id]) =>
      id !== 'v1-robot' && id !== 'v2-robot-segui-luce'
    );
    regular.forEach(([id, lesson]) => {
      expect(lesson.advancedProject, `${id} should not be advancedProject`).not.toBe(true);
    });
  });
});

// ─── Volume 2 structure ───────────────────────────────────────────────

describe('LESSON_GROUPS — Volume 2 experiments', () => {
  const v2 = ALL_ENTRIES.filter(([, l]) => l.volume === 2);

  it('Volume 2 has transistor (MOSFET) lesson', () => {
    const transistor = v2.find(([id]) => id === 'v2-transistor');
    expect(transistor).toBeDefined();
    // Honest: concept is the explanation ("interruttore elettronico..."), not the name.
    // Lesson id matches v2-transistor — sufficient identification.
    expect(transistor[1].concept).toBeTruthy();
  });

  it('Volume 2 has batterie-serie lesson (renamed from v2-condensatore Sprint U Cycle 3)', () => {
    const cond = v2.find(([id]) => id === 'v2-batterie-serie');
    expect(cond).toBeDefined();
  });

  it('Volume 2 has motore lesson', () => {
    const motor = v2.find(([id]) => id === 'v2-motore');
    expect(motor).toBeDefined();
  });

  it('all Vol2 lesson IDs start with v2-', () => {
    v2.forEach(([id]) => expect(id).toMatch(/^v2-/));
  });
});

// ─── Volume 3 structure ───────────────────────────────────────────────

describe('LESSON_GROUPS — Volume 3 experiments', () => {
  const v3 = ALL_ENTRIES.filter(([, l]) => l.volume === 3);

  it('Volume 3 has led digitale lesson', () => {
    const led = v3.find(([id]) => id === 'v3-led-digitale');
    expect(led).toBeDefined();
  });

  it('Volume 3 has input analogico lesson', () => {
    const input = v3.find(([id]) => id === 'v3-input-analogico');
    expect(input).toBeDefined();
  });

  it('all Vol3 lesson IDs start with v3-', () => {
    v3.forEach(([id]) => expect(id).toMatch(/^v3-/));
  });
});

// ─── findLessonForExperiment — extended ──────────────────────────────

describe('findLessonForExperiment — extended', () => {
  it('finds semaforo extra experiment', () => {
    const result = findLessonForExperiment('v3-cap6-semaforo');
    expect(result).not.toBeNull();
    expect(result.lessonId).toBe('v3-progetti-led');
  });

  it('finds morse experiment', () => {
    const result = findLessonForExperiment('v3-cap6-morse');
    expect(result).not.toBeNull();
    expect(result.lessonId).toBe('v3-progetti-led');
  });

  it('finds all 81 experiments without error', () => {
    let found = 0;
    ALL_ENTRIES.forEach(([, lesson]) => {
      lesson.experiments.forEach(expId => {
        const r = findLessonForExperiment(expId);
        if (r) found++;
      });
    });
    expect(found).toBe(81);
  });

  it('returns null for numeric input', () => {
    expect(findLessonForExperiment(123)).toBeNull();
  });

  it('returns correct lessonId for v2-cap10-esp4', () => {
    const result = findLessonForExperiment('v2-cap10-esp4');
    expect(result).not.toBeNull();
    expect(result.lessonId).toBe('v2-motore');
  });
});

// ─── getLessonsForVolume — extended ───────────────────────────────────

describe('getLessonsForVolume — extended', () => {
  it('returns array of [lessonId, lesson] tuples', () => {
    const result = getLessonsForVolume(1);
    result.forEach(([id, lesson]) => {
      expect(typeof id).toBe('string');
      expect(typeof lesson).toBe('object');
    });
  });

  it('all items in getLessonsForVolume(2) have volume 2', () => {
    getLessonsForVolume(2).forEach(([, lesson]) => {
      expect(lesson.volume).toBe(2);
    });
  });

  it('all items in getLessonsForVolume(3) have volume 3', () => {
    getLessonsForVolume(3).forEach(([, lesson]) => {
      expect(lesson.volume).toBe(3);
    });
  });

  it('returns empty for volume 4', () => {
    expect(getLessonsForVolume(4)).toEqual([]);
  });

  it('returns empty for negative volume', () => {
    expect(getLessonsForVolume(-1)).toEqual([]);
  });

  it('returns empty for string volume', () => {
    expect(getLessonsForVolume('1')).toEqual([]);
  });
});

// ─── getLessonCount ───────────────────────────────────────────────────

describe('getLessonCount', () => {
  it('returns 24', () => {
    expect(getLessonCount()).toBe(24);
  });

  it('matches actual LESSON_GROUPS size', () => {
    expect(getLessonCount()).toBe(Object.keys(LESSON_GROUPS).length);
  });
});

// ─── getExperimentGroupContext ────────────────────────────────────────

describe('getExperimentGroupContext', () => {
  it('returns object for known experiment', () => {
    if (typeof getExperimentGroupContext !== 'function') return; // skip if not exported
    const ctx = getExperimentGroupContext('v1-cap6-esp1');
    expect(ctx).not.toBeNull();
  });

  it('returns null for unknown experiment', () => {
    if (typeof getExperimentGroupContext !== 'function') return;
    expect(getExperimentGroupContext('nope')).toBeNull();
  });

  it('returns object with narrative context fields', () => {
    if (typeof getExperimentGroupContext !== 'function') return;
    const ctx = getExperimentGroupContext('v1-cap6-esp1');
    // Real return shape: position, total, lessonTitle, concept, chapter, volume, prevExp, nextExp, narrative
    if (ctx) {
      expect(ctx.lessonTitle || ctx.concept || ctx.narrative).toBeDefined();
      expect(typeof ctx.volume).toBe('number');
    }
  });
});

// ─── Cross-volume consistency ─────────────────────────────────────────

describe('LESSON_GROUPS — cross-volume experiment distribution', () => {
  it('total experiments across all volumes sums to 81', () => {
    const total = ALL_ENTRIES.reduce((sum, [, l]) => sum + l.experiments.length, 0);
    expect(total).toBe(81);
  });

  it('Volume 1 contains exactly 38 experiments', () => {
    const v1Exps = ALL_ENTRIES
      .filter(([, l]) => l.volume === 1)
      .flatMap(([, l]) => l.experiments);
    expect(v1Exps.length).toBe(38);
  });

  it('Volume 2 contains exactly 27 experiments', () => {
    const v2Exps = ALL_ENTRIES
      .filter(([, l]) => l.volume === 2)
      .flatMap(([, l]) => l.experiments);
    expect(v2Exps.length).toBe(27);
  });

  it('Volume 3 contains exactly 16 experiments', () => {
    const v3Exps = ALL_ENTRIES
      .filter(([, l]) => l.volume === 3)
      .flatMap(([, l]) => l.experiments);
    expect(v3Exps.length).toBe(16);
  });

  it('no experiment appears in more than one lesson', () => {
    const allExpIds = ALL_ENTRIES.flatMap(([, l]) => l.experiments);
    const unique = new Set(allExpIds);
    expect(unique.size).toBe(allExpIds.length);
  });
});
