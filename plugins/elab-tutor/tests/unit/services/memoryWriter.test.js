/**
 * memoryWriter tests — Sprint Q5
 */
import { describe, it, expect } from 'vitest';
import {
  buildStudentMemory,
  buildTeacherMemory,
  inferLivello,
  inferStileDidattico,
  collectEsperimentiFatti,
  collectErroriRicorrenti,
  collectClassiSeguite,
  collectVolumiPreferiti,
} from '../../../src/services/memoryWriter.js';

const SAMPLE_SESSIONS_FEW = [
  { experimentId: 'v1-cap6-esp1', mode: 'percorso', errors: ['polarita-led'], tags: [] },
  { experimentId: 'v1-cap6-esp2', mode: 'passopasso', errors: ['filo-staccato'], tags: ['visivo'] },
];

const SAMPLE_SESSIONS_MANY = Array.from({ length: 35 }, (_, i) => ({
  experimentId: `v${(i % 3) + 1}-cap${(i % 14) + 1}-esp1`,
  mode: i % 2 === 0 ? 'percorso' : 'passopasso',
  errors: i % 5 === 0 ? ['polarita-led'] : [],
  tags: i % 3 === 0 ? ['hands-on'] : [],
  classId: `classe-${(i % 3) + 1}`,
}));

describe('inferLivello', () => {
  it('principiante for empty log', () => {
    expect(inferLivello([])).toBe('principiante');
  });

  it('principiante for < 10 esp', () => {
    expect(inferLivello(SAMPLE_SESSIONS_FEW)).toBe('principiante');
  });

  it('avanzato for >= 30 unique esp', () => {
    const many = Array.from({ length: 35 }, (_, i) => ({ experimentId: `v1-cap${i % 14}-esp${i}` }));
    expect(inferLivello(many)).toBe('avanzato');
  });
});

describe('inferStileDidattico', () => {
  it('da-osservare for empty', () => {
    expect(inferStileDidattico([])).toBe('da-osservare');
  });

  it('hands-on if libero/hands-on tags dominant', () => {
    const log = [
      { mode: 'libero' }, { mode: 'libero' }, { tags: ['hands-on'] }, { mode: 'percorso' },
    ];
    expect(inferStileDidattico(log)).toBe('hands-on');
  });

  it('narrativo if percorso/narrativo dominant', () => {
    const log = [{ mode: 'percorso' }, { mode: 'percorso' }, { tags: ['narrativo'] }];
    expect(inferStileDidattico(log)).toBe('narrativo');
  });

  it('visivo if passopasso dominant', () => {
    const log = [{ mode: 'passopasso' }, { mode: 'passopasso' }, { tags: ['visivo'] }];
    expect(inferStileDidattico(log)).toBe('visivo');
  });
});

describe('collectEsperimentiFatti', () => {
  it('returns unique sorted experiment IDs', () => {
    const log = [
      { experimentId: 'v1-cap6-esp1' },
      { experimentId: 'v1-cap6-esp2' },
      { experimentId: 'v1-cap6-esp1' },
    ];
    expect(collectEsperimentiFatti(log)).toEqual(['v1-cap6-esp1', 'v1-cap6-esp2']);
  });

  it('handles experiments_completed arrays', () => {
    const log = [{ experiments_completed: ['v2-cap3-esp1', 'v2-cap3-esp2'] }];
    expect(collectEsperimentiFatti(log).length).toBe(2);
  });
});

describe('collectErroriRicorrenti', () => {
  it('returns errors with count >= 2 sorted by frequency', () => {
    const log = [
      { errors: ['polarita-led'] },
      { errors: ['polarita-led', 'filo-staccato'] },
      { errors: ['polarita-led'] },
      { errors: ['filo-staccato'] },
    ];
    const out = collectErroriRicorrenti(log);
    expect(out[0]).toBe('polarita-led'); // 3 times
    expect(out[1]).toBe('filo-staccato'); // 2 times
  });

  it('excludes single-occurrence errors', () => {
    const log = [{ errors: ['rare-error'] }];
    expect(collectErroriRicorrenti(log)).toEqual([]);
  });
});

describe('collectClassiSeguite + collectVolumiPreferiti', () => {
  it('classi unique sorted', () => {
    expect(collectClassiSeguite(SAMPLE_SESSIONS_MANY).length).toBeGreaterThan(0);
  });

  it('volumi sorted by frequency desc', () => {
    const out = collectVolumiPreferiti(SAMPLE_SESSIONS_MANY);
    expect(out.length).toBeGreaterThanOrEqual(1);
  });
});

describe('buildStudentMemory', () => {
  it('throws if classId missing', () => {
    expect(() => buildStudentMemory(null)).toThrow();
  });

  it('builds markdown with front-matter for classe-x', () => {
    const md = buildStudentMemory('classe-1A', SAMPLE_SESSIONS_FEW, { today: '2026-04-25' });
    expect(md).toContain('---');
    expect(md).toContain('classId: classe-1A');
    expect(md).toContain('livello: principiante');
    expect(md).toContain('updated_at: 2026-04-25');
    expect(md).toContain('# Memoria classe classe-1A');
  });

  it('lists esperimenti_fatti', () => {
    const md = buildStudentMemory('c1', SAMPLE_SESSIONS_FEW);
    expect(md).toContain('v1-cap6-esp1');
    expect(md).toContain('v1-cap6-esp2');
  });

  it('reflects livello avanzato for many sessions', () => {
    const many = Array.from({ length: 35 }, (_, i) => ({ experimentId: `v1-cap${i % 14}-esp${i}` }));
    const md = buildStudentMemory('c1', many);
    expect(md).toContain('livello: avanzato');
  });

  it('PRINCIPIO ZERO note included', () => {
    const md = buildStudentMemory('c1', []);
    expect(md).toContain('PRINCIPIO ZERO');
    expect(md).toContain('NO comandi al docente');
  });
});

describe('buildTeacherMemory', () => {
  it('throws if teacherId missing', () => {
    expect(() => buildTeacherMemory(null)).toThrow();
  });

  it('builds markdown with front-matter for teacher', () => {
    const md = buildTeacherMemory('docente-001', SAMPLE_SESSIONS_MANY, { today: '2026-04-25' });
    expect(md).toContain('teacherId: docente-001');
    expect(md).toContain('updated_at: 2026-04-25');
    expect(md).toContain('# Memoria docente docente-001');
  });

  it('infers stile_didattico from sessions', () => {
    const log = [{ mode: 'libero' }, { tags: ['hands-on'] }];
    const md = buildTeacherMemory('d1', log);
    expect(md).toContain('hands-on');
  });

  it('lists classi_seguite', () => {
    const md = buildTeacherMemory('d1', SAMPLE_SESSIONS_MANY);
    expect(md).toMatch(/classi_seguite:/);
  });
});
