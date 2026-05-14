import { describe, it, expect } from 'vitest';
import { validateCorrectionsFile, CorrectionEntry } from '../../../scripts/epic1/corrections-schema.mjs';
import { checkLessonPath } from '../../../scripts/epic1/validate-lesson-paths.mjs';

const VALID_FILE = {
  generatedFrom: ['docs/audits/2026-05-14-epic1-a3-vol1-verdict.md'],
  experiments: {
    'v1-cap6-esp1': {
      action: 'keep', bookFaithfulTitle: 'Accendi il tuo primo LED',
      page: 29, chapter: 6, nextId: 'v1-cap6-esp2',
      source: 'repo', confidence: 'high',
    },
    'v3-cap6-esp6': {
      action: 'remove', bookFaithfulTitle: null, page: null, chapter: null,
      nextId: null, source: 'neither', confidence: 'high',
      note: 'no 6th Ch6 experiment exists in the volume',
    },
  },
};

describe('validateCorrectionsFile', () => {
  it('accepts a well-formed corrections file', () => {
    const r = validateCorrectionsFile(VALID_FILE);
    expect(r.ok).toBe(true);
  });
  it('rejects an unknown action enum', () => {
    const bad = structuredClone(VALID_FILE);
    bad.experiments['v1-cap6-esp1'].action = 'frobnicate';
    const r = validateCorrectionsFile(bad);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/action/i);
  });
  it('rejects a missing required field', () => {
    const bad = structuredClone(VALID_FILE);
    delete bad.experiments['v1-cap6-esp1'].source;
    const r = validateCorrectionsFile(bad);
    expect(r.ok).toBe(false);
  });
  it('rejects an empty generatedFrom array', () => {
    const bad = structuredClone(VALID_FILE);
    bad.generatedFrom = [];
    expect(validateCorrectionsFile(bad).ok).toBe(false);
  });
  it('CorrectionEntry requires consolidateInto only when action=consolidate', () => {
    const ok = CorrectionEntry.safeParse({
      action: 'consolidate', bookFaithfulTitle: 'x', page: 1, chapter: 1,
      nextId: null, consolidateInto: 'v3-cap6-esp3', source: 'repo', confidence: 'high',
    });
    expect(ok.success).toBe(true);
    const missing = CorrectionEntry.safeParse({
      action: 'consolidate', bookFaithfulTitle: 'x', page: 1, chapter: 1,
      nextId: null, source: 'repo', confidence: 'high',
    });
    expect(missing.success).toBe(false);
  });
});

describe('checkLessonPath', () => {
  const correction = {
    action: 'correct', bookFaithfulTitle: 'Accendi il tuo primo LED',
    page: 29, chapter: 6, nextId: 'v1-cap6-esp2', source: 'repo', confidence: 'high',
  };
  it('passes when the lesson-path matches its correction', () => {
    const lp = { experiment_id: 'v1-cap6-esp1', title: 'Accendi il tuo primo LED',
      chapter: 6, next_experiment: { id: 'v1-cap6-esp2' } };
    const r = checkLessonPath('v1-cap6-esp1', lp, correction);
    expect(r.ok).toBe(true);
    expect(r.issues).toEqual([]);
  });
  it('flags a title divergence', () => {
    const lp = { experiment_id: 'v1-cap6-esp1', title: 'WRONG TITLE',
      chapter: 6, next_experiment: { id: 'v1-cap6-esp2' } };
    const r = checkLessonPath('v1-cap6-esp1', lp, correction);
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.includes('title'))).toBe(true);
  });
  it('flags a nextId and chapter divergence', () => {
    const lp = { experiment_id: 'v1-cap6-esp1', title: 'Accendi il tuo primo LED',
      chapter: 99, next_experiment: { id: 'v1-cap6-esp9' } };
    const r = checkLessonPath('v1-cap6-esp1', lp, correction);
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.includes('chapter'))).toBe(true);
    expect(r.issues.some((i) => i.includes('nextId'))).toBe(true);
  });
  it('reports pending-removal when correction.action is remove and the file still exists', () => {
    const lp = { experiment_id: 'v3-cap6-esp6', title: 'whatever' };
    const r = checkLessonPath('v3-cap6-esp6', lp, { action: 'remove', bookFaithfulTitle: null,
      page: null, chapter: null, nextId: null, source: 'neither', confidence: 'high' });
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.includes('pending-removal'))).toBe(true);
  });
  it('reports pending-consolidation when action is consolidate', () => {
    const lp = { experiment_id: 'v3-cap6-esp3', title: 'whatever' };
    const r = checkLessonPath('v3-cap6-esp3', lp, { action: 'consolidate', bookFaithfulTitle: null,
      page: null, chapter: null, nextId: null, consolidateInto: 'v3-cap6-morse',
      source: 'repo', confidence: 'high' });
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.includes('pending-consolidation') && i.includes('v3-cap6-morse'))).toBe(true);
  });
  it('reports a missing correction entry', () => {
    const lp = { experiment_id: 'v9-cap1-esp1', title: 'orphan' };
    const r = checkLessonPath('v9-cap1-esp1', lp, undefined);
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.includes('no correction entry'))).toBe(true);
  });
  it('reports missing-lesson-path when lessonPath is null but a correction exists', () => {
    const r = checkLessonPath('v1-cap6-esp1', null, correction);
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.includes('missing-lesson-path'))).toBe(true);
  });
  it('treats contract nextId:null as a capstone — ok with no next, flagged with a next', () => {
    const capstone = { action: 'keep', bookFaithfulTitle: 'Capstone', page: 60,
      chapter: 9, nextId: null, source: 'repo', confidence: 'high' };
    const noNext = { experiment_id: 'v9-cap9-esp9', title: 'Capstone', chapter: 9 };
    expect(checkLessonPath('v9-cap9-esp9', noNext, capstone).ok).toBe(true);
    const hasNext = { experiment_id: 'v9-cap9-esp9', title: 'Capstone', chapter: 9,
      next_experiment: { id: 'v9-cap9-esp10' } };
    const r = checkLessonPath('v9-cap9-esp9', hasNext, capstone);
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.includes('nextId'))).toBe(true);
  });
});
