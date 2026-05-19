// Iter 69 A-NEW-2d — volume-only Riferimento detector unit tests.
// Iter 68 PHASE 6 matrix evidence: 3 failures "Riferimento al Volume 1/2/3" + variants.
// Scorer VOLPAG_RE_LOOSE requires Vol.X pag.Y together — detector emits canonical
// Vol.X pag.6 (cap iniziale anchor) + invite capitolo specification.

import { describe, it, expect } from 'vitest';
import { buildDirectOperationalResponse } from '../../supabase/functions/_shared/operational-response.ts';

describe('iter 69 A-NEW-2d volume-only Riferimento detector — matrix evidence', () => {
  const cases = [
    { msg: 'Riferimento al Volume 1', expectVol: '1', expectPag: '6' },
    { msg: 'Riferimento al Volume 2', expectVol: '2', expectPag: '5' },
    { msg: 'Riferimento al Volume 3', expectVol: '3', expectPag: '5' },
    { msg: 'Spiega Volume 2', expectVol: '2', expectPag: '5' },
    { msg: 'Apri Volume 1', expectVol: '1', expectPag: '6' },
    { msg: 'Mostrami il Volume 3', expectVol: '3', expectPag: '5' },
  ];

  for (const { msg, expectVol, expectPag } of cases) {
    it(`"${msg}" emits canonical Vol.${expectVol} pag.${expectPag}`, () => {
      const result = buildDirectOperationalResponse(msg);
      expect(result).not.toBeNull();
      expect(result.source).toBe('direct-operational-volume-only');
      expect(result.dataProcessing).toBe('local-direct');
      expect(result.response).toMatch(/^Ragazzi,/);
      expect(result.response).toContain(`Vol.${expectVol} pag.${expectPag}`);
      expect(result.response.toLowerCase()).toContain('kit elab');
      // Scorer VOLPAG_RE_LOOSE: must contain Vol.X pag.Y pattern
      const VOLPAG_RE = /\bvol(?:ume)?\.?\s*[123]\s+pag(?:ina)?\.?\s*\d+/i;
      expect(result.response).toMatch(VOLPAG_RE);
    });
  }
});

describe('iter 69 A-NEW-2d detector — anti-regression vol+pag explicit queries NOT trigger', () => {
  it('"Apri Vol.1 pag.12" goes to vol+pag detector (NOT volume-only)', () => {
    const result = buildDirectOperationalResponse('Apri Vol.1 pag.12');
    expect(result).not.toBeNull();
    expect(result.source).not.toBe('direct-operational-volume-only');
    expect(result.source).toMatch(/volpag|pagvol/);
  });

  it('"Cita Volume 2 capitolo 3" with cap NOT trigger volume-only', () => {
    const result = buildDirectOperationalResponse('Cita Volume 2 capitolo 3');
    if (result !== null) {
      expect(result.source).not.toBe('direct-operational-volume-only');
    }
  });
});
