import { describe, it, expect } from 'vitest';
import { validateCorrectionsFile, CorrectionEntry } from '../../../scripts/epic1/corrections-schema.mjs';

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
