/**
 * lessonGroups.test.js — Test per lesson-groups.js
 * Verifica struttura 23 lezioni, helper functions, copertura esperimenti
 */
import { describe, it, expect } from 'vitest';
import LESSON_GROUPS, {
  findLessonForExperiment,
  getLessonsForVolume,
  getLessonCount,
} from '../../src/data/lesson-groups';

describe('LESSON_GROUPS — struttura base', () => {
  const entries = Object.entries(LESSON_GROUPS);
  const allLessonIds = Object.keys(LESSON_GROUPS);

  it('esporta un oggetto non vuoto', () => {
    expect(LESSON_GROUPS).toBeDefined();
    expect(typeof LESSON_GROUPS).toBe('object');
    expect(entries.length).toBeGreaterThan(0);
  });

  it('contiene esattamente 23 lezioni', () => {
    expect(entries.length).toBe(23);
  });

  it('ogni lessonId inizia con v1-, v2- o v3-', () => {
    allLessonIds.forEach(id => {
      expect(id).toMatch(/^v[123]-/);
    });
  });

  it('ogni lezione ha title (stringa non vuota)', () => {
    entries.forEach(([id, lesson]) => {
      expect(lesson.title, `${id} manca title`).toBeTruthy();
      expect(typeof lesson.title).toBe('string');
    });
  });

  it('ogni lezione ha concept (stringa non vuota)', () => {
    entries.forEach(([id, lesson]) => {
      expect(lesson.concept, `${id} manca concept`).toBeTruthy();
    });
  });

  it('ogni lezione ha volume (1, 2 o 3)', () => {
    entries.forEach(([id, lesson]) => {
      expect([1, 2, 3]).toContain(lesson.volume);
    });
  });

  it('ogni lezione ha chapter (numero positivo)', () => {
    entries.forEach(([id, lesson]) => {
      expect(lesson.chapter, `${id} manca chapter`).toBeGreaterThan(0);
    });
  });

  it('ogni lezione ha icon (stringa non vuota)', () => {
    entries.forEach(([id, lesson]) => {
      expect(lesson.icon, `${id} manca icon`).toBeTruthy();
    });
  });

  it('ogni lezione ha experiments (array non vuoto)', () => {
    entries.forEach(([id, lesson]) => {
      expect(Array.isArray(lesson.experiments), `${id} experiments non array`).toBe(true);
      expect(lesson.experiments.length, `${id} experiments vuoto`).toBeGreaterThan(0);
    });
  });

  it('tutti gli experiment ID nelle lezioni sono stringhe', () => {
    entries.forEach(([id, lesson]) => {
      lesson.experiments.forEach(expId => {
        expect(typeof expId, `${id} ha expId non-string`).toBe('string');
      });
    });
  });

  it('experiment IDs seguono pattern vN-capN-espN o vN-capN-* o vN-extra-*', () => {
    entries.forEach(([, lesson]) => {
      lesson.experiments.forEach(expId => {
        expect(expId).toMatch(/^v[123]-(?:cap\d+-|extra-)/);
      });
    });
  });

  it('nessun experiment ID duplicato tra tutte le lezioni', () => {
    const allExpIds = entries.flatMap(([, l]) => l.experiments);
    const unique = new Set(allExpIds);
    expect(unique.size).toBe(allExpIds.length);
  });

  it('contiene esattamente 88 esperimenti totali', () => {
    const allExpIds = entries.flatMap(([, l]) => l.experiments);
    expect(allExpIds.length).toBe(88);
  });
});

describe('LESSON_GROUPS — distribuzione volumi', () => {
  const entries = Object.entries(LESSON_GROUPS);

  it('Volume 1 ha 10 lezioni', () => {
    const v1 = entries.filter(([, l]) => l.volume === 1);
    expect(v1.length).toBe(10);
  });

  it('Volume 2 ha 9 lezioni', () => {
    const v2 = entries.filter(([, l]) => l.volume === 2);
    expect(v2.length).toBe(9);
  });

  it('Volume 3 ha 4 lezioni', () => {
    const v3 = entries.filter(([, l]) => l.volume === 3);
    expect(v3.length).toBe(4);
  });

  it('Volume 1 contiene 38 esperimenti', () => {
    const v1Exps = entries.filter(([, l]) => l.volume === 1).flatMap(([, l]) => l.experiments);
    expect(v1Exps.length).toBe(38);
  });

  it('Volume 2 contiene 27 esperimenti', () => {
    const v2Exps = entries.filter(([, l]) => l.volume === 2).flatMap(([, l]) => l.experiments);
    expect(v2Exps.length).toBe(27);
  });

  it('Volume 3 contiene 23 esperimenti', () => {
    const v3Exps = entries.filter(([, l]) => l.volume === 3).flatMap(([, l]) => l.experiments);
    expect(v3Exps.length).toBe(23);
  });

  it('experiment IDs del Volume 1 iniziano con v1-', () => {
    entries.filter(([, l]) => l.volume === 1).forEach(([, l]) => {
      l.experiments.forEach(id => expect(id).toMatch(/^v1-/));
    });
  });

  it('experiment IDs del Volume 2 iniziano con v2-', () => {
    entries.filter(([, l]) => l.volume === 2).forEach(([, l]) => {
      l.experiments.forEach(id => expect(id).toMatch(/^v2-/));
    });
  });

  it('experiment IDs del Volume 3 iniziano con v3-', () => {
    entries.filter(([, l]) => l.volume === 3).forEach(([, l]) => {
      l.experiments.forEach(id => expect(id).toMatch(/^v3-/));
    });
  });
});

describe('findLessonForExperiment', () => {
  it('trova la lezione per v1-cap6-esp1', () => {
    const result = findLessonForExperiment('v1-cap6-esp1');
    expect(result).not.toBeNull();
    expect(result.lessonId).toBe('v1-accendi-led');
    expect(result.lesson.title).toBe('Accendi il LED');
  });

  it('trova la lezione per un esperimento Vol2', () => {
    const result = findLessonForExperiment('v2-cap3-esp1');
    expect(result).not.toBeNull();
    // Sprint U Cycle 3: rinominato da v2-resistenze a v2-multimetro per allineamento PDF v0.13 cap3
    expect(result.lessonId).toBe('v2-multimetro');
    expect(result.lesson.volume).toBe(2);
  });

  it('trova la lezione per un esperimento Vol3', () => {
    const result = findLessonForExperiment('v3-cap5-esp1');
    expect(result).not.toBeNull();
    expect(result.lessonId).toBe('v3-cap5-blink');
    expect(result.lesson.volume).toBe(3);
  });

  it('ritorna null per ID inesistente', () => {
    expect(findLessonForExperiment('non-esiste')).toBeNull();
  });

  it('ritorna null per stringa vuota', () => {
    expect(findLessonForExperiment('')).toBeNull();
  });

  it('ritorna oggetto con lessonId e lesson', () => {
    const result = findLessonForExperiment('v1-cap7-esp3');
    expect(result).toHaveProperty('lessonId');
    expect(result).toHaveProperty('lesson');
    expect(typeof result.lessonId).toBe('string');
    expect(typeof result.lesson).toBe('object');
  });

  it('ogni esperimento di ogni lezione viene trovato', () => {
    Object.entries(LESSON_GROUPS).forEach(([lessonId, lesson]) => {
      lesson.experiments.forEach(expId => {
        const found = findLessonForExperiment(expId);
        expect(found, `${expId} non trovato`).not.toBeNull();
        expect(found.lessonId).toBe(lessonId);
      });
    });
  });
});

describe('getLessonsForVolume', () => {
  it('ritorna array di tuple [id, lesson] per Volume 1', () => {
    const result = getLessonsForVolume(1);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(10);
    result.forEach(([id, lesson]) => {
      expect(typeof id).toBe('string');
      expect(lesson.volume).toBe(1);
    });
  });

  it('ritorna 9 lezioni per Volume 2', () => {
    const result = getLessonsForVolume(2);
    expect(result.length).toBe(9);
  });

  it('ritorna 4 lezioni per Volume 3', () => {
    const result = getLessonsForVolume(3);
    expect(result.length).toBe(4);
  });

  it('lezioni ordinate per chapter crescente', () => {
    [1, 2, 3].forEach(vol => {
      const result = getLessonsForVolume(vol);
      for (let i = 1; i < result.length; i++) {
        expect(result[i][1].chapter).toBeGreaterThanOrEqual(result[i - 1][1].chapter);
      }
    });
  });

  it('ritorna array vuoto per volume inesistente', () => {
    expect(getLessonsForVolume(99)).toEqual([]);
    expect(getLessonsForVolume(0)).toEqual([]);
  });
});

describe('getLessonCount', () => {
  it('ritorna 23', () => {
    expect(getLessonCount()).toBe(23);
  });

  it('ritorna un numero', () => {
    expect(typeof getLessonCount()).toBe('number');
  });
});

describe('LESSON_GROUPS — proprieta opzionali', () => {
  it('lezioni sfida hanno isChallenges=true', () => {
    const sfide = LESSON_GROUPS['v1-sfide-pot'];
    expect(sfide.isChallenges).toBe(true);
  });

  it('lezioni robot hanno advancedProject=true', () => {
    expect(LESSON_GROUPS['v1-robot'].advancedProject).toBe(true);
    expect(LESSON_GROUPS['v2-robot-segui-luce'].advancedProject).toBe(true);
  });

  it('lessonId del v1-accendi-led ha chapter 6', () => {
    expect(LESSON_GROUPS['v1-accendi-led'].chapter).toBe(6);
  });
});
