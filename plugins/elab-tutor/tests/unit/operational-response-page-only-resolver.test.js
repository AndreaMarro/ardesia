// Iter 70 A-NEW-2c — page-only resolver session experimentId context unit tests.
// Iter 68 PHASE 6 matrix evidence: 8 failures "Cosa dice il libro a pagina N?" + variants
// require session.currentExperimentId context to derive volN. Detector ordered AFTER
// vol+pag (P1/P2) + volume-only detectors so explicit vol+pag still wins.
//
// Verification target:
//   - 6 page-only cases WITH session.currentExperimentId (Vol1/Vol2/Vol3 derive correct volN)
//   - 3 page-only cases WITHOUT session → redirect "quale volume"
//   - 2 anti-regression: vol+pag explicit NOT trigger page-only (existing detector wins)
//   - 1 anti-regression: arbitrary "Cosa dice il libro" without pagina NOT trigger
//
// Scorer alignment (run-1000-matrix.py:127):
//   VOLPAG_RE_LOOSE = /\bvol(?:ume)?\.?\s*[123]\s+pag(?:ina)?\.?\s*\d+/i
//   Detector emits verbatim "Vol.X pag.N" canonical format.

import { describe, it, expect } from 'vitest';
import { buildDirectOperationalResponse } from '../../supabase/functions/_shared/operational-response.ts';

const VOLPAG_RE = /\bvol(?:ume)?\.?\s*[123]\s+pag(?:ina)?\.?\s*\d+/i;

describe('iter 70 A-NEW-2c page-only resolver — WITH session.currentExperimentId', () => {
  const cases = [
    {
      label: 'Vol1 cap6 esp1 → Vol.1',
      msg: 'Cosa dice il libro a pagina 12?',
      session: { currentExperimentId: 'v1-cap6-esp1' },
      expectVol: '1',
      expectPag: '12',
    },
    {
      label: 'Vol1 cap10 esp2 → Vol.1',
      msg: 'Leggi pagina 45',
      session: { currentExperimentId: 'v1-cap10-esp2' },
      expectVol: '1',
      expectPag: '45',
    },
    {
      label: 'Vol2 cap5 esp1 → Vol.2',
      msg: 'Apri pagina 67',
      session: { currentExperimentId: 'v2-cap5-esp1' },
      expectVol: '2',
      expectPag: '67',
    },
    {
      label: 'Vol2 cap10 esp1 → Vol.2',
      msg: 'Vai a pagina 102',
      session: { currentExperimentId: 'v2-cap10-esp1' },
      expectVol: '2',
      expectPag: '102',
    },
    {
      label: 'Vol3 cap6 esp2 → Vol.3',
      msg: 'Cosa dice il libro a pagina 134?',
      session: { currentExperimentId: 'v3-cap6-esp2' },
      expectVol: '3',
      expectPag: '134',
    },
    {
      label: 'Vol3 cap8 serial → Vol.3',
      msg: 'Spiega pagina 89',
      session: { currentExperimentId: 'v3-cap8-serial' },
      expectVol: '3',
      expectPag: '89',
    },
  ];

  for (const { label, msg, session, expectVol, expectPag } of cases) {
    it(`${label}: "${msg}" emits canonical Vol.${expectVol} pag.${expectPag}`, () => {
      const result = buildDirectOperationalResponse(msg, null, session);
      expect(result).not.toBeNull();
      expect(result.source).toBe('direct-operational-page-only-resolved');
      expect(result.dataProcessing).toBe('local-direct');
      expect(result.response).toMatch(/^Ragazzi,/);
      expect(result.response).toContain(`Vol.${expectVol} pag.${expectPag}`);
      expect(result.response.toLowerCase()).toContain('kit elab');
      // Scorer VOLPAG_RE_LOOSE alignment
      expect(result.response).toMatch(VOLPAG_RE);
    });
  }
});

describe('iter 70 A-NEW-2c page-only resolver — WITHOUT session → plurale redirect', () => {
  const cases = [
    { msg: 'Cosa dice il libro a pagina 12?', expectPag: '12' },
    { msg: 'Leggi pagina 45', expectPag: '45' },
    { msg: 'Apri pagina 67', expectPag: '67' },
  ];

  for (const { msg, expectPag } of cases) {
    it(`"${msg}" without session emits plurale redirect asking volume`, () => {
      const result = buildDirectOperationalResponse(msg, null, null);
      expect(result).not.toBeNull();
      expect(result.source).toBe('direct-operational-page-only-redirect');
      expect(result.dataProcessing).toBe('local-direct');
      expect(result.response).toMatch(/^Ragazzi,/);
      // Plurale redirect MUST ask which volume + mention page number
      expect(result.response.toLowerCase()).toContain('quale volume');
      expect(result.response).toContain(expectPag);
      // Plurale check: must mention Vol.1, Vol.2, Vol.3 options
      expect(result.response).toMatch(/Vol\.1.*Vol\.2.*Vol\.3/i);
    });
  }

  it('page-only with empty session object (no currentExperimentId) → redirect', () => {
    const result = buildDirectOperationalResponse('Vai a pagina 23', null, {});
    expect(result).not.toBeNull();
    expect(result.source).toBe('direct-operational-page-only-redirect');
    expect(result.response).toMatch(/^Ragazzi,/);
    expect(result.response.toLowerCase()).toContain('quale volume');
  });

  it('page-only with session.currentExperimentId malformed (no v[1-3]- prefix) → redirect', () => {
    const result = buildDirectOperationalResponse('Apri pagina 50', null, {
      currentExperimentId: 'unknown-experiment-id',
    });
    expect(result).not.toBeNull();
    expect(result.source).toBe('direct-operational-page-only-redirect');
    expect(result.response.toLowerCase()).toContain('quale volume');
  });
});

describe('iter 70 A-NEW-2c — anti-regression vol+pag explicit NOT trigger page-only', () => {
  it('"Vol.1 pag.12" explicit vol+pag falls to existing P1/P2 detector', () => {
    const result = buildDirectOperationalResponse('Vol.1 pag.12', null, {
      currentExperimentId: 'v3-cap6-esp1',
    });
    expect(result).not.toBeNull();
    // Must NOT match page-only sources — explicit vol+pag wins via P1/P2 detectors
    expect(result.source).not.toBe('direct-operational-page-only-resolved');
    expect(result.source).not.toBe('direct-operational-page-only-redirect');
    expect(result.source).toMatch(/volpag|pagvol/);
  });

  it('"Apri Vol.2 pag.45" explicit vol+pag falls to existing P1/P2 detector', () => {
    const result = buildDirectOperationalResponse('Apri Vol.2 pag.45', null, {
      currentExperimentId: 'v1-cap6-esp1',
    });
    expect(result).not.toBeNull();
    expect(result.source).not.toBe('direct-operational-page-only-resolved');
    expect(result.source).not.toBe('direct-operational-page-only-redirect');
    expect(result.source).toMatch(/volpag|pagvol/);
  });
});

describe('iter 70 A-NEW-2c — anti-regression arbitrary "libro" without page NOT trigger', () => {
  it('"Cosa dice il libro?" without pagina NOT trigger page-only (falls to LLM)', () => {
    const result = buildDirectOperationalResponse('Cosa dice il libro?', null, {
      currentExperimentId: 'v1-cap6-esp1',
    });
    // Either null (LLM fall-through) or some other detector — but NEVER page-only sources
    if (result !== null) {
      expect(result.source).not.toBe('direct-operational-page-only-resolved');
      expect(result.source).not.toBe('direct-operational-page-only-redirect');
    }
  });
});

describe('iter 70 A-NEW-2c — backward compat: signature with 2 args still works', () => {
  it('buildDirectOperationalResponse(msg, circuit) without 3rd arg works (legacy callers)', () => {
    // Vol+pag explicit — existing P1 detector path
    const result = buildDirectOperationalResponse('Vol.1 pag.12', null);
    expect(result).not.toBeNull();
    expect(result.source).toMatch(/volpag|pagvol/);
  });

  it('buildDirectOperationalResponse(msg) single arg works (legacy callers)', () => {
    // Volume-only — existing volume-only detector path
    const result = buildDirectOperationalResponse('Riferimento al Volume 2');
    expect(result).not.toBeNull();
    expect(result.source).toBe('direct-operational-volume-only');
  });
});
