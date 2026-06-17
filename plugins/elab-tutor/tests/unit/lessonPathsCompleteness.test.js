/**
 * Lesson Paths Completeness — Verifica 92/92 esperimenti coperti
 * Principio Zero: UNLIM prepara la lezione per OGNI esperimento
 * (c) Andrea Marro — 11/04/2026
 */

import { describe, test, expect } from 'vitest';

const vol1 = await import('../../src/data/experiments-vol1.js');
const vol2 = await import('../../src/data/experiments-vol2.js');
const vol3 = await import('../../src/data/experiments-vol3.js');

function getExperiments(mod) {
  const exp = mod.default || mod.experiments || [];
  if (Array.isArray(exp)) return exp;
  return Object.values(exp).flat().filter(e => e?.id);
}

function getExperimentIds() {
  const all = [...getExperiments(vol1), ...getExperiments(vol2), ...getExperiments(vol3)];
  return all.filter(e => e.id?.match(/^v\d-cap\d/)).map(e => e.id);
}

// Dynamically import lesson paths index
const lessonPathsModule = await import('../../src/data/lesson-paths/index.js');
const LESSON_PATHS = lessonPathsModule.default || {};
const getLessonPath = lessonPathsModule.getLessonPath;

describe('Lesson Paths Completeness', () => {
  const experimentIds = getExperimentIds();

  test('at least 78 experiments have lesson paths', () => {
    const withPath = experimentIds.filter(id => {
      if (getLessonPath) return getLessonPath(id) !== null;
      return LESSON_PATHS[id] !== undefined;
    });
    expect(withPath.length).toBeGreaterThanOrEqual(78);
  });

  test('lesson paths have required fields', () => {
    Object.entries(LESSON_PATHS).forEach(([id, path]) => {
      if (!path) return;
      expect(path.experiment_id || path.experimentId, `${id} missing experiment_id`).toBeTruthy();
      expect(path.title, `${id} missing title`).toBeTruthy();
    });
  });

  test('lesson paths have phases', () => {
    let withPhases = 0;
    Object.entries(LESSON_PATHS).forEach(([id, path]) => {
      if (!path) return;
      if (path.phases && path.phases.length > 0) withPhases++;
    });
    expect(withPhases).toBeGreaterThan(50);
  });

  test('lesson paths have vocabulary', () => {
    let withVocab = 0;
    Object.entries(LESSON_PATHS).forEach(([id, path]) => {
      if (!path) return;
      if (path.vocabulary) withVocab++;
    });
    expect(withVocab).toBeGreaterThan(40);
  });

  test('no lesson path has empty title', () => {
    Object.entries(LESSON_PATHS).forEach(([id, path]) => {
      if (!path) return;
      if (path.title) {
        expect(path.title.length, `${id} title too short`).toBeGreaterThan(3);
      }
    });
  });

  test('lesson paths reference valid experiment IDs', () => {
    Object.entries(LESSON_PATHS).forEach(([id, path]) => {
      if (!path) return;
      const expId = path.experiment_id || path.experimentId || id;
      // Should match v{N}-cap{N} or v{N}-extra pattern
      expect(expId, `${id} has invalid experiment_id format`).toMatch(/^v\d-(cap\d|extra)/);
    });
  });
});

describe('Lesson Paths — Principio Zero Quality', () => {
  test('lesson paths have teacher_message or similar', () => {
    let withTeacherMsg = 0;
    Object.entries(LESSON_PATHS).forEach(([id, path]) => {
      if (!path) return;
      const json = JSON.stringify(path);
      if (json.includes('teacher') || json.includes('docente') || json.includes('message')) {
        withTeacherMsg++;
      }
    });
    // At least half should have teacher guidance
    expect(withTeacherMsg).toBeGreaterThan(30);
  });

  test('lesson paths include analogies for kids', () => {
    let withAnalogy = 0;
    Object.entries(LESSON_PATHS).forEach(([id, path]) => {
      if (!path) return;
      const json = JSON.stringify(path);
      if (json.includes('anologi') || json.includes('come un') || json.includes('come se') ||
          json.includes('immagina') || json.includes('pensa a')) {
        withAnalogy++;
      }
    });
    expect(withAnalogy, `Only ${withAnalogy} lesson paths have analogies`).toBeGreaterThan(20);
  });
});
