import { describe, it, expect } from 'vitest';
import { norm, findVerbatimInVolume } from '../../../scripts/epic1/build-alignment-records.mjs';

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
