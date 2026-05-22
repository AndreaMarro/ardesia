/**
 * experimentConsistency.test.js — Cross-validazione esperimenti e lesson-groups
 * Verifica: ogni esperimento in lesson-groups esiste nei data files,
 * ogni ID e unico, no esperimenti orfani, coerenza volumi
 */
import { describe, it, expect } from 'vitest';
import LESSON_GROUPS, {
  findLessonForExperiment,
  getLessonsForVolume,
  getLessonCount,
} from '../../src/data/lesson-groups';
import {
  ALL_EXPERIMENTS,
  findExperimentById,
  getTotalExperiments,
  getExperimentsByVolume,
} from '../../src/data/experiments-index';
import EXPERIMENTS_VOL1 from '../../src/data/experiments-vol1';
import EXPERIMENTS_VOL2 from '../../src/data/experiments-vol2';
import EXPERIMENTS_VOL3 from '../../src/data/experiments-vol3';
import ragChunks from '../../src/data/rag-chunks.json';

// Raccogli tutti gli experiment IDs dalle lesson-groups
const allLessonExpIds = Object.values(LESSON_GROUPS).flatMap(l => l.experiments);
// Raccogli tutti gli experiment IDs dai data files
const allDataExpIds = ALL_EXPERIMENTS.map(e => e.id);

describe('Cross-validazione lesson-groups <-> experiments data', () => {
  it('ogni esperimento in lesson-groups esiste nei data files', () => {
    const missing = allLessonExpIds.filter(id => !allDataExpIds.includes(id));
    expect(missing, `Mancanti nei data: ${missing.join(', ')}`).toEqual([]);
  });

  it('ogni esperimento nei data files e in una lesson-group', () => {
    const orphaned = allDataExpIds.filter(id => !allLessonExpIds.includes(id));
    expect(orphaned, `Orfani senza lezione: ${orphaned.join(', ')}`).toEqual([]);
  });

  it('stessa quantita di esperimenti in entrambe le fonti', () => {
    expect(allLessonExpIds.length).toBe(allDataExpIds.length);
    expect(allLessonExpIds.length).toBe(88);
  });

  it('findExperimentById funziona per tutti gli IDs lesson-groups', () => {
    allLessonExpIds.forEach(id => {
      const exp = findExperimentById(id);
      expect(exp, `findExperimentById("${id}") ritorna null`).not.toBeNull();
    });
  });

  it('findLessonForExperiment funziona per tutti gli IDs data files', () => {
    allDataExpIds.forEach(id => {
      const result = findLessonForExperiment(id);
      expect(result, `findLessonForExperiment("${id}") ritorna null`).not.toBeNull();
    });
  });
});

describe('Unicita globale IDs', () => {
  it('nessun experiment ID duplicato nei data files', () => {
    const unique = new Set(allDataExpIds);
    expect(unique.size).toBe(allDataExpIds.length);
  });

  it('nessun experiment ID duplicato nelle lesson-groups', () => {
    const unique = new Set(allLessonExpIds);
    expect(unique.size).toBe(allLessonExpIds.length);
  });

  it('nessun lesson ID duplicato', () => {
    const lessonIds = Object.keys(LESSON_GROUPS);
    const unique = new Set(lessonIds);
    expect(unique.size).toBe(lessonIds.length);
  });

  it('nessun experiment ID uguale a un lesson ID', () => {
    const lessonIds = new Set(Object.keys(LESSON_GROUPS));
    allDataExpIds.forEach(expId => {
      expect(lessonIds.has(expId), `${expId} e anche un lessonId`).toBe(false);
    });
  });
});

describe('Coerenza volume tra lesson-groups e experiments', () => {
  it('esperimenti Vol1 sono in lezioni Vol1', () => {
    EXPERIMENTS_VOL1.experiments.forEach(exp => {
      const result = findLessonForExperiment(exp.id);
      expect(result, `${exp.id} non trovato in lezioni`).not.toBeNull();
      expect(result.lesson.volume, `${exp.id} in lezione vol ${result.lesson.volume}, dovrebbe essere 1`).toBe(1);
    });
  });

  it('esperimenti Vol2 sono in lezioni Vol2', () => {
    EXPERIMENTS_VOL2.experiments.forEach(exp => {
      const result = findLessonForExperiment(exp.id);
      expect(result).not.toBeNull();
      expect(result.lesson.volume, `${exp.id} in lezione vol ${result.lesson.volume}`).toBe(2);
    });
  });

  it('esperimenti Vol3 sono in lezioni Vol3', () => {
    EXPERIMENTS_VOL3.experiments.forEach(exp => {
      const result = findLessonForExperiment(exp.id);
      expect(result).not.toBeNull();
      expect(result.lesson.volume, `${exp.id} in lezione vol ${result.lesson.volume}`).toBe(3);
    });
  });
});

describe('Coerenza chapter tra lesson-groups e experiments', () => {
  it('esperimenti di una lezione hanno chapter coerente con la lezione', () => {
    Object.entries(LESSON_GROUPS).forEach(([lessonId, lesson]) => {
      // Lezioni con chapter 99 (extra) possono avere qualsiasi chapter
      if (lesson.chapter === 99) return;
      lesson.experiments.forEach(expId => {
        const exp = findExperimentById(expId);
        if (exp && exp.chapter) {
          // Il chapter dell'esperimento (stringa) dovrebbe contenere il numero del chapter della lezione
          expect(
            exp.chapter.includes(String(lesson.chapter)),
            `${expId} chapter "${exp.chapter}" non contiene ${lesson.chapter} (lezione ${lessonId})`
          ).toBe(true);
        }
      });
    });
  });
});

describe('Volume data files — coerenza interna', () => {
  it('Vol1 + Vol2 + Vol3 = ALL_EXPERIMENTS', () => {
    const total = EXPERIMENTS_VOL1.experiments.length +
      EXPERIMENTS_VOL2.experiments.length +
      EXPERIMENTS_VOL3.experiments.length;
    expect(total).toBe(ALL_EXPERIMENTS.length);
  });

  it('getExperimentsByVolume(1) == Vol1 experiments', () => {
    const byVol = getExperimentsByVolume(1);
    expect(byVol.length).toBe(EXPERIMENTS_VOL1.experiments.length);
  });

  it('getExperimentsByVolume(2) == Vol2 experiments', () => {
    const byVol = getExperimentsByVolume(2);
    expect(byVol.length).toBe(EXPERIMENTS_VOL2.experiments.length);
  });

  it('getExperimentsByVolume(3) == Vol3 experiments', () => {
    const byVol = getExperimentsByVolume(3);
    expect(byVol.length).toBe(EXPERIMENTS_VOL3.experiments.length);
  });

  it('getTotalExperiments() == lunghezza ALL_EXPERIMENTS', () => {
    expect(getTotalExperiments()).toBe(ALL_EXPERIMENTS.length);
  });

  it('getLessonCount() == numero chiavi LESSON_GROUPS', () => {
    expect(getLessonCount()).toBe(Object.keys(LESSON_GROUPS).length);
  });
});

describe('Lesson-groups — copertura completa', () => {
  it('getLessonsForVolume copre tutti i volumi 1-3', () => {
    const total = getLessonsForVolume(1).length +
      getLessonsForVolume(2).length +
      getLessonsForVolume(3).length;
    expect(total).toBe(getLessonCount());
  });

  it('ogni lezione ha almeno 1 esperimento', () => {
    Object.entries(LESSON_GROUPS).forEach(([id, lesson]) => {
      expect(lesson.experiments.length, `${id} ha 0 esperimenti`).toBeGreaterThan(0);
    });
  });

  it('nessuna lezione ha piu di 10 esperimenti', () => {
    Object.entries(LESSON_GROUPS).forEach(([id, lesson]) => {
      expect(lesson.experiments.length, `${id} ha troppi esperimenti`).toBeLessThanOrEqual(10);
    });
  });
});

describe('RAG chunks — copertura volumi esperimenti', () => {
  it('RAG ha chunk per tutti e 3 i volumi', () => {
    expect(ragChunks.some(c => c.volume === 1)).toBe(true);
    expect(ragChunks.some(c => c.volume === 2)).toBe(true);
    expect(ragChunks.some(c => c.volume === 3)).toBe(true);
  });

  it('RAG chunk count e coerente (549)', () => {
    expect(ragChunks.length).toBe(549);
  });

  it('numero totale esperimenti e coerente ovunque', () => {
    // Tutte le fonti concordano su 88 (EPIC 1 A4.1c — 2 Vol3 duplicate-id consolidati)
    expect(ALL_EXPERIMENTS.length).toBe(88);
    expect(allLessonExpIds.length).toBe(88);
    expect(getTotalExperiments()).toBe(88);
    expect(
      EXPERIMENTS_VOL1.experiments.length +
      EXPERIMENTS_VOL2.experiments.length +
      EXPERIMENTS_VOL3.experiments.length
    ).toBe(88);
  });
});

describe('Validazione integreferenziale componenti', () => {
  // Alcuni esperimenti hanno componenti extra nel layout (es. r2 derivato da variazioni)
  // o componenti senza layout (per esperimenti non simulabili)

  it('la maggior parte dei componenti nel layout ha un corrispondente in components', () => {
    let total = 0;
    let matched = 0;
    ALL_EXPERIMENTS.forEach(exp => {
      if (!exp.layout) return;
      const compIds = new Set(exp.components.map(c => c.id));
      Object.keys(exp.layout).forEach(layoutId => {
        total++;
        if (compIds.has(layoutId)) matched++;
      });
    });
    // Almeno 95% di corrispondenza
    expect(matched / total).toBeGreaterThan(0.95);
  });

  it('la maggior parte dei componenti in components ha una posizione nel layout', () => {
    let total = 0;
    let matched = 0;
    ALL_EXPERIMENTS.forEach(exp => {
      if (!exp.layout) return;
      const layoutIds = new Set(Object.keys(exp.layout));
      exp.components.forEach(comp => {
        total++;
        if (layoutIds.has(comp.id)) matched++;
      });
    });
    expect(matched / total).toBeGreaterThan(0.95);
  });
});

describe('unlimPrompt coerenza', () => {
  const withPrompt = ALL_EXPERIMENTS.filter(e => typeof e.unlimPrompt === 'string' && e.unlimPrompt.length > 10);

  it('la maggior parte degli esperimenti ha unlimPrompt', () => {
    // Vol1 ha 38 e Vol2 ha 27 con prompt = 65+; Vol3 ne ha una parte
    expect(withPrompt.length).toBeGreaterThan(60);
  });

  it('unlimPrompt quando presente e stringa non vuota', () => {
    withPrompt.forEach(exp => {
      expect(typeof exp.unlimPrompt, `${exp.id} unlimPrompt non string`).toBe('string');
      expect(exp.unlimPrompt.length, `${exp.id} unlimPrompt vuoto`).toBeGreaterThan(0);
    });
  });

  it('unlimPrompt quando presente ha almeno 30 caratteri', () => {
    withPrompt.forEach(exp => {
      expect(
        exp.unlimPrompt.length,
        `${exp.id} unlimPrompt troppo corto (${exp.unlimPrompt.length} chars)`
      ).toBeGreaterThan(30);
    });
  });

  it('la maggior parte degli unlimPrompt menziona parole chiave pedagogiche', () => {
    const keywords = ['unlim', 'elab', 'tutor', 'studente', 'spiega', 'italiano'];
    const withKeyword = withPrompt.filter(exp => {
      const text = exp.unlimPrompt.toLowerCase();
      return keywords.some(kw => text.includes(kw));
    });
    // Almeno 90% devono avere parole chiave
    expect(withKeyword.length / withPrompt.length).toBeGreaterThan(0.9);
  });
});
