import { describe, it, expect } from 'vitest';
import { norm, findVerbatimInVolume } from '../../../scripts/epic1/build-alignment-records.mjs';
import { buildAlignmentRecord } from '../../../scripts/epic1/build-alignment-records.mjs';

const SAMPLE_VOLUME = `
Capitolo 6 — Il diodo LED.
Per accendere il LED e fare il nostro primo esperimento abbiamo bisogno di:
un LED, una breadboard, una batteria 9V, la clip per la batteria 9V, un resistore da 470 Ohm.
Il LED ha una polarita: la gambetta lunga e l'anodo.
`;

describe('norm', () => {
  it('lowercases and collapses whitespace', () => {
    expect(norm('  Ciao   RAGAZZI \n ')).toBe('ciao ragazzi');
  });
  it('handles null/undefined', () => {
    expect(norm(null)).toBe('');
    expect(norm(undefined)).toBe('');
  });
  it('folds curly quotes, apostrophes, dashes, ellipsis to ASCII', () => {
    // pdftotext volume text uses curly punctuation; Tea bookText uses straight.
    // Without folding, indexOf() exact-match gives false negatives.
    expect(norm('Più “Spinta”!')).toBe(norm('Più "Spinta"!'));
    expect(norm('l’anodo')).toBe(norm("l'anodo"));
    expect(norm('serie–parallelo')).toBe(norm('serie-parallelo'));
    expect(norm('uno…')).toBe(norm('uno...'));
  });
});

describe('findVerbatimInVolume', () => {
  it('finds a full verbatim claim', () => {
    const r = findVerbatimInVolume(SAMPLE_VOLUME, 'Per accendere il LED e fare il nostro primo esperimento');
    expect(r.found).toBe(true);
    expect(r.matchType).toBe('full');
    expect(r.context).toContain('breadboard');
  });
  it('falls back to first-8-words prefix match', () => {
    const r = findVerbatimInVolume(SAMPLE_VOLUME, 'Per accendere il LED e fare il nostro TOTALLY DIFFERENT ENDING');
    expect(r.found).toBe(true);
    expect(r.matchType).toBe('prefix-8w');
  });
  it('returns not-found for absent text', () => {
    const r = findVerbatimInVolume(SAMPLE_VOLUME, 'questo testo non esiste nel volume affatto');
    expect(r.found).toBe(false);
    expect(r.reason).toBe('not in volume text');
  });
  it('rejects claims shorter than 12 chars', () => {
    const r = findVerbatimInVolume(SAMPLE_VOLUME, 'LED');
    expect(r.found).toBe(false);
    expect(r.reason).toBe('claim too short');
  });
});

describe('buildAlignmentRecord', () => {
  const src = {
    lessonPath: {
      title: 'Accendi il tuo primo LED', chapter: 6,
      next_experiment: { id: 'v1-cap6-esp2' },
      components_needed: [{ name: 'LED rosso' }, { name: 'Resistore 470Ω' }],
    },
    teaMapEntry: { title: 'Accendi il tuo primo LED', page: 29, next_id: 'v1-cap6-esp2' },
    teaMetaEntry: { bookText: 'Per accendere il LED e fare il nostro primo esperimento', chapter: 6 },
    volumeRefEntry: { bookPage: 29 },
    volumeText: 'Per accendere il LED e fare il nostro primo esperimento abbiamo bisogno di un LED.',
  };

  it('assembles a 3-way record with agreement flags', () => {
    const r = buildAlignmentRecord('v1-cap6-esp1', src);
    expect(r.id).toBe('v1-cap6-esp1');
    expect(r.flags.titleAgree).toBe(true);
    expect(r.flags.nextIdAgree).toBe(true);
    expect(r.flags.teaBookTextVerified).toBe(true);
    expect(r.repo.components).toEqual(['LED rosso', 'Resistore 470Ω']);
  });

  it('flags title divergence and unverified Tea bookText', () => {
    const diverged = {
      ...src,
      lessonPath: { ...src.lessonPath, title: 'Dimmer LED con potenziometro' },
      teaMetaEntry: { bookText: 'questo testo inventato non e nel volume', chapter: 6 },
    };
    const r = buildAlignmentRecord('v1-cap6-esp1', diverged);
    expect(r.flags.titleAgree).toBe(false);
    expect(r.flags.teaBookTextVerified).toBe(false);
  });

  it('produces a clean record when sources are missing, no false agreement', () => {
    const r = buildAlignmentRecord('v1-cap6-esp1', {
      lessonPath: null, teaMapEntry: null, teaMetaEntry: null,
      volumeRefEntry: null, volumeText: null,
    });
    expect(r.repo.title).toBe(null);
    expect(r.repo.components).toEqual([]);
    expect(r.flags.titleAgree).toBe(false);
    expect(r.flags.nextIdAgree).toBe(false);
    expect(r.flags.teaBookTextVerified).toBe(false);
  });
  it('does not throw on a null src', () => {
    expect(() => buildAlignmentRecord('v1-cap6-esp1', null)).not.toThrow();
  });
});
