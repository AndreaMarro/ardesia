/**
 * Iter 68 A-NEW-2 — Volpag detector extended regex tests.
 *
 * Validates 5 NEW pattern variants P1+P2 catch fixture iter 50+ volpag failures
 * AND emit responses with verbatim "Vol.X pag.Y" matching scorer
 * VOLPAG_RE_LOOSE (scripts/bench/run-1000-matrix.py:127).
 *
 * Coverage:
 * - P1 vol-FIRST + pagina (5 dotted + 5 verbose patterns)
 * - P2 page-FIRST + Volume (5 page+Volume + 5 "del Volume" patterns)
 * - Negative tests (5 non-volpag queries → null fall-through)
 *
 * Total: 25 tests.
 *
 * Iter 41 v64 backward compat preserved: existing volpagMatch (vol-FIRST cap-X)
 * NOT changed, still catches "leggi vol.3 cap.13" etc.
 */
import { describe, it, expect } from 'vitest';
import { buildDirectOperationalResponse } from '../../supabase/functions/_shared/operational-response.ts';

// Scorer regex from scripts/bench/run-1000-matrix.py:127 (must match responses)
const VOLPAG_RE_LOOSE = /(?:\bvol(?:ume)?\.?\s*[1-3])\s+(?:cap(?:itolo)?\.?\s*\d+|pag(?:ina)?\.?\s*\d+|a\s+pagina\s*\d+)/i;

describe('A-NEW-2 volpag P1 — vol-FIRST + pagina dotted format', () => {
  it('P1.1 catches "Apri Vol.1 pag.102"', () => {
    const r = buildDirectOperationalResponse('Apri Vol.1 pag.102');
    expect(r).not.toBeNull();
    expect(r?.source).toBe('direct-operational-volpag-dotted');
    expect(r?.response).toContain('Vol.1 pag.102');
    expect(r?.response).toMatch(/^Ragazzi,/);
    expect(VOLPAG_RE_LOOSE.test(r?.response || '')).toBe(true);
  });

  it('P1.2 catches "Cita testo Vol.2 pag.18"', () => {
    const r = buildDirectOperationalResponse('Cita testo Vol.2 pag.18');
    expect(r?.source).toBe('direct-operational-volpag-dotted');
    expect(r?.response).toContain('Vol.2 pag.18');
    expect(VOLPAG_RE_LOOSE.test(r?.response || '')).toBe(true);
  });

  it('P1.3 catches "Estratto Vol.1 pag.12"', () => {
    const r = buildDirectOperationalResponse('Estratto Vol.1 pag.12');
    expect(r?.source).toBe('direct-operational-volpag-dotted');
    expect(r?.response).toContain('Vol.1 pag.12');
    expect(VOLPAG_RE_LOOSE.test(r?.response || '')).toBe(true);
  });

  it('P1.4 catches "Vol.1 pag.52 cosa spiega?" (query suffix)', () => {
    const r = buildDirectOperationalResponse('Vol.1 pag.52 cosa spiega?');
    expect(r?.source).toBe('direct-operational-volpag-dotted');
    expect(r?.response).toContain('Vol.1 pag.52');
    expect(VOLPAG_RE_LOOSE.test(r?.response || '')).toBe(true);
  });

  it('P1.5 catches "Estratto Vol.3 pag.89"', () => {
    const r = buildDirectOperationalResponse('Estratto Vol.3 pag.89');
    expect(r?.source).toBe('direct-operational-volpag-dotted');
    expect(r?.response).toContain('Vol.3 pag.89');
    expect(VOLPAG_RE_LOOSE.test(r?.response || '')).toBe(true);
  });
});

describe('A-NEW-2 P1 — vol-FIRST + pagina verbose format', () => {
  it('P1.6 catches "Riferisci Volume 1 pagina 102"', () => {
    const r = buildDirectOperationalResponse('Riferisci Volume 1 pagina 102');
    expect(r?.source).toBe('direct-operational-volpag-dotted');
    expect(r?.response).toContain('Vol.1 pag.102');
    expect(VOLPAG_RE_LOOSE.test(r?.response || '')).toBe(true);
  });

  it('P1.7 catches "Riferisci Volume 3 pagina 156"', () => {
    const r = buildDirectOperationalResponse('Riferisci Volume 3 pagina 156');
    expect(r?.source).toBe('direct-operational-volpag-dotted');
    expect(r?.response).toContain('Vol.3 pag.156');
    expect(VOLPAG_RE_LOOSE.test(r?.response || '')).toBe(true);
  });

  it('P1.8 catches "Leggi Volume 1 pagina 12"', () => {
    const r = buildDirectOperationalResponse('Leggi Volume 1 pagina 12');
    expect(r?.source).toBe('direct-operational-volpag-dotted');
    expect(r?.response).toContain('Vol.1 pag.12');
    expect(VOLPAG_RE_LOOSE.test(r?.response || '')).toBe(true);
  });

  it('P1.9 catches "Leggi Volume 2 pagina 134"', () => {
    const r = buildDirectOperationalResponse('Leggi Volume 2 pagina 134');
    expect(r?.source).toBe('direct-operational-volpag-dotted');
    expect(r?.response).toContain('Vol.2 pag.134');
    expect(VOLPAG_RE_LOOSE.test(r?.response || '')).toBe(true);
  });

  it('P1.10 catches "Leggi Volume 3 pagina 89"', () => {
    const r = buildDirectOperationalResponse('Leggi Volume 3 pagina 89');
    expect(r?.source).toBe('direct-operational-volpag-dotted');
    expect(r?.response).toContain('Vol.3 pag.89');
    expect(VOLPAG_RE_LOOSE.test(r?.response || '')).toBe(true);
  });
});

describe('A-NEW-2 P2 — page-FIRST + Volume direct format', () => {
  it('P2.1 catches "Vai a pagina 67 Volume 2"', () => {
    const r = buildDirectOperationalResponse('Vai a pagina 67 Volume 2');
    expect(r?.source).toBe('direct-operational-pagvol');
    expect(r?.response).toContain('Vol.2 pag.67');
    expect(r?.response).toMatch(/^Ragazzi,/);
    expect(VOLPAG_RE_LOOSE.test(r?.response || '')).toBe(true);
  });

  it('P2.2 catches "Vai a pagina 102 Volume 1"', () => {
    const r = buildDirectOperationalResponse('Vai a pagina 102 Volume 1');
    expect(r?.source).toBe('direct-operational-pagvol');
    expect(r?.response).toContain('Vol.1 pag.102');
    expect(VOLPAG_RE_LOOSE.test(r?.response || '')).toBe(true);
  });

  it('P2.3 catches "Vai a pagina 156 Volume 3"', () => {
    const r = buildDirectOperationalResponse('Vai a pagina 156 Volume 3');
    expect(r?.source).toBe('direct-operational-pagvol');
    expect(r?.response).toContain('Vol.3 pag.156');
    expect(VOLPAG_RE_LOOSE.test(r?.response || '')).toBe(true);
  });

  it('P2.4 catches "Vai a pagina 18 Volume 2"', () => {
    const r = buildDirectOperationalResponse('Vai a pagina 18 Volume 2');
    expect(r?.source).toBe('direct-operational-pagvol');
    expect(r?.response).toContain('Vol.2 pag.18');
    expect(VOLPAG_RE_LOOSE.test(r?.response || '')).toBe(true);
  });

  it('P2.5 catches "Vai a pagina 27 Volume 1"', () => {
    const r = buildDirectOperationalResponse('Vai a pagina 27 Volume 1');
    expect(r?.source).toBe('direct-operational-pagvol');
    expect(r?.response).toContain('Vol.1 pag.27');
    expect(VOLPAG_RE_LOOSE.test(r?.response || '')).toBe(true);
  });
});

describe('A-NEW-2 P2 — page-FIRST + del Volume query format', () => {
  it('P2.6 catches "Cosa contiene pagina 102 del Volume 1?"', () => {
    const r = buildDirectOperationalResponse('Cosa contiene pagina 102 del Volume 1?');
    expect(r?.source).toBe('direct-operational-pagvol');
    expect(r?.response).toContain('Vol.1 pag.102');
    expect(VOLPAG_RE_LOOSE.test(r?.response || '')).toBe(true);
  });

  it('P2.7 catches "Cosa contiene pagina 18 del Volume 2?"', () => {
    const r = buildDirectOperationalResponse('Cosa contiene pagina 18 del Volume 2?');
    expect(r?.source).toBe('direct-operational-pagvol');
    expect(r?.response).toContain('Vol.2 pag.18');
    expect(VOLPAG_RE_LOOSE.test(r?.response || '')).toBe(true);
  });

  it('P2.8 catches "Cosa contiene pagina 45 del Volume 3?"', () => {
    const r = buildDirectOperationalResponse('Cosa contiene pagina 45 del Volume 3?');
    expect(r?.source).toBe('direct-operational-pagvol');
    expect(r?.response).toContain('Vol.3 pag.45');
    expect(VOLPAG_RE_LOOSE.test(r?.response || '')).toBe(true);
  });

  it('P2.9 catches "Cosa contiene pagina 67 del Volume 2?"', () => {
    const r = buildDirectOperationalResponse('Cosa contiene pagina 67 del Volume 2?');
    expect(r?.source).toBe('direct-operational-pagvol');
    expect(r?.response).toContain('Vol.2 pag.67');
    expect(VOLPAG_RE_LOOSE.test(r?.response || '')).toBe(true);
  });

  it('P2.10 catches "Cosa contiene pagina 27 del Volume 1?"', () => {
    const r = buildDirectOperationalResponse('Cosa contiene pagina 27 del Volume 1?');
    expect(r?.source).toBe('direct-operational-pagvol');
    expect(r?.response).toContain('Vol.1 pag.27');
    expect(VOLPAG_RE_LOOSE.test(r?.response || '')).toBe(true);
  });
});

describe('A-NEW-2 backward compat — iter 41 v64 cap-X detector preserved', () => {
  it('BC1 still catches "leggi vol.3 cap.13" (iter 41 baseline pattern)', () => {
    const r = buildDirectOperationalResponse('leggi vol.3 cap.13');
    expect(r?.source).toBe('direct-operational-volpag-nav');
    expect(r?.response).toContain('Vol.3 cap.13');
    expect(r?.response).toContain('[INTENT:{"tool":"mountExperiment","args":{"id":"v3-cap13-esp1"}}]');
    expect(VOLPAG_RE_LOOSE.test(r?.response || '')).toBe(true);
  });

  it('BC2 still catches "apri Vol.1 cap.6" (iter 41 baseline pattern)', () => {
    const r = buildDirectOperationalResponse('apri Vol.1 cap.6');
    expect(r?.source).toBe('direct-operational-volpag-nav');
    expect(r?.response).toContain('Vol.1 cap.6');
    expect(VOLPAG_RE_LOOSE.test(r?.response || '')).toBe(true);
  });
});

describe('A-NEW-2 negative — non-volpag queries fall-through to LLM', () => {
  it('N1 "Cosa dice il libro a pagina 134?" (page-only, no volume) → null', () => {
    // Ambiguous page reference, LLM should resolve volume from context
    const r = buildDirectOperationalResponse('Cosa dice il libro a pagina 134?');
    // Should NOT match either new pattern (P1 requires vol+pag, P2 requires pag+vol)
    expect(r === null || (r.source !== 'direct-operational-volpag-dotted' && r.source !== 'direct-operational-pagvol')).toBe(true);
  });

  it('N2 "Riferimento al Volume 1" (volume-only, no page) → not P1/P2 match', () => {
    const r = buildDirectOperationalResponse('Riferimento al Volume 1');
    expect(r === null || (r.source !== 'direct-operational-volpag-dotted' && r.source !== 'direct-operational-pagvol')).toBe(true);
  });

  it('N3 "Spiega cosa è elettricità" (pure theory) → not P1/P2 match', () => {
    const r = buildDirectOperationalResponse('Spiega cosa è elettricità');
    expect(r === null || (r.source !== 'direct-operational-volpag-dotted' && r.source !== 'direct-operational-pagvol')).toBe(true);
  });
});
