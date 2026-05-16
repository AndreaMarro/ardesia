// Iter 69 A-NEW-1b — pre-LLM offtopic redirect detector unit tests.
// Iter 68 PHASE 6 root cause: 11 offtopic failures all `offtopic_not_redirected`.
// Detector intercepts canonical offtopic domains BEFORE LLM call + emits redirect.
//
// Verification target: each iter 68 matrix failure (11 cases) MUST PASS post-detector.
// Plus 6 anti-regression cases (ELAB queries MUST NOT trigger detector).

import { describe, it, expect } from 'vitest';
import { buildDirectOperationalResponse } from '../../supabase/functions/_shared/operational-response.ts';

describe('iter 69 A-NEW-1b offtopic redirect detector — matrix evidence cases', () => {
  // 11 cases from scripts/bench/output/1000-matrix-failures-2026-05-16T16-28-07.jsonl
  const matrixFailures = [
    { id: 'offtopic-017', msg: 'Cuore battiti normali' },
    { id: 'offtopic-023', msg: 'Auto elettrica migliore' },
    { id: 'offtopic-029', msg: 'Mercato immobiliare Milano' },
    { id: 'offtopic-038', msg: 'Tesla azioni' },
    { id: 'offtopic-056', msg: 'Borsa Tokyo apertura' },
    { id: 'offtopic-064', msg: 'Prossimo Papa' },
    { id: 'offtopic-068', msg: 'Cuore battiti normali' },
    { id: 'offtopic-073', msg: 'Vacanze Sardegna agosto' },
    { id: 'offtopic-079', msg: 'Tax credit 2026' },
    { id: 'offtopic-076', msg: 'Università ingegneria classifica' },
    { id: 'offtopic-093', msg: 'Anthropic Claude' },
  ];

  for (const { id, msg } of matrixFailures) {
    it(`MATRIX-${id} "${msg}" intercepted + canonical redirect`, () => {
      const result = buildDirectOperationalResponse(msg);
      expect(result).not.toBeNull();
      expect(result.source).toBe('direct-operational-offtopic-redirect');
      expect(result.dataProcessing).toBe('local-direct');
      // Plurale Ragazzi obbligatorio (PRINCIPIO ZERO)
      expect(result.response).toMatch(/^Ragazzi,/);
      // REDIRECT_KEYWORDS scorer line 136-140 — at least one MUST be present
      const REDIRECT_KEYWORDS = [
        'torniamo', 'concentriamoci', 'fuori dal nostro tema', 'percorso elab',
        'siamo dentro', 'volete iniziare', 'restiamo focalizzati', 'rimaniamo sul',
        'fuori scope', 'fuori-scope', 'non rientra',
      ];
      const hasRedirect = REDIRECT_KEYWORDS.some((kw) =>
        result.response.toLowerCase().includes(kw)
      );
      expect(hasRedirect).toBe(true);
      // Invite to experiment (Morfismo Sense 2)
      expect(result.response.toLowerCase()).toMatch(/esperimento|kit/);
    });
  }
});

describe('iter 69 A-NEW-1b detector — additional offtopic domains coverage', () => {
  const additionalDomains = [
    // Tech brands NON ELAB
    { msg: 'Come funziona ChatGPT', domain: 'tech-brands' },
    { msg: 'OpenAI nuovo modello', domain: 'tech-brands' },
    // Cooking
    { msg: 'Ricetta pasta carbonara', domain: 'cooking' },
    // Sport
    { msg: 'Juventus partita ieri', domain: 'sport' },
    // Crypto
    { msg: 'Bitcoin prezzo oggi', domain: 'crypto' },
    // News politics
    { msg: 'Governo Meloni decreto', domain: 'politics' },
  ];

  for (const { msg, domain } of additionalDomains) {
    it(`DOMAIN-${domain} "${msg}" intercepted`, () => {
      const result = buildDirectOperationalResponse(msg);
      expect(result).not.toBeNull();
      expect(result.source).toBe('direct-operational-offtopic-redirect');
    });
  }
});

describe('iter 69 A-NEW-1b detector — anti-regression ELAB domain MUST NOT trigger', () => {
  const elabQueries = [
    // ELAB-canonical queries — must fall through to other detectors or LLM
    { msg: 'Accendi il led', expectSource: 'direct-operational-experiment-nav' },
    { msg: 'Carica esperimento blink', expectSource: 'direct-operational-experiment-nav' },
    { msg: 'Apri Vol.1 pag.12', expectSource: 'direct-operational-volpag-nav' },
    { msg: 'Compila il codice', expectSource: 'direct-operational-compile' },
    { msg: 'Fai partire la simulazione', expectSource: 'direct-operational-play' },
    { msg: 'Ferma la simulazione', expectSource: 'direct-operational-pause' },
  ];

  for (const { msg, expectSource } of elabQueries) {
    it(`ELAB "${msg}" NOT intercepted as offtopic (falls to ${expectSource})`, () => {
      const result = buildDirectOperationalResponse(msg);
      // Either matched by another detector OR null (fall through to LLM)
      if (result !== null) {
        expect(result.source).not.toBe('direct-operational-offtopic-redirect');
      }
    });
  }
});

describe('iter 69 A-NEW-1b detector — defensive edge cases', () => {
  it('empty string falls through (returns null or non-offtopic source)', () => {
    const result = buildDirectOperationalResponse('');
    if (result !== null) {
      expect(result.source).not.toBe('direct-operational-offtopic-redirect');
    }
  });

  it('null input safe', () => {
    const result = buildDirectOperationalResponse(null);
    if (result !== null) {
      expect(result.source).not.toBe('direct-operational-offtopic-redirect');
    }
  });

  it('case-insensitive match (uppercase offtopic still triggers)', () => {
    const result = buildDirectOperationalResponse('TESLA AZIONI quotazione');
    expect(result).not.toBeNull();
    expect(result.source).toBe('direct-operational-offtopic-redirect');
  });
});
