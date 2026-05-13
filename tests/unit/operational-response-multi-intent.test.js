import { describe, expect, it } from 'vitest';

// Iter 43 A2 — Onnipotenza composite emission gate test (iter 41 bench bug #3 fix).
// Multi-INTENT queries like "accendi led, evidenzia r1 e compila" must return null
// from buildDirectOperationalResponse so the LLM can emit a composite intent ARRAY
// via INTENT_TOOLS_SCHEMA function calling. Browser intentsDispatcher then iterates
// and dispatches all of them.
//
// Regression mandate: must NOT trigger on SINGLE-action queries (iter 41 v67
// 1000-matrix-failures.jsonl must remain empty). Verb count threshold ≥2 keeps
// single-action queries on their existing pre-LLM fast path.

const mod = await import('../../supabase/functions/_shared/operational-response.ts');

describe('UNLIM operational response — multi-INTENT composite gate (iter 43)', () => {
  describe('multi-action queries return null (let LLM emit composite array)', () => {
    it('returns null for "accendi led e compila" (2 verbs)', () => {
      const response = mod.buildDirectOperationalResponse('accendi led e compila', null);
      expect(response).toBeNull();
    });

    it('returns null for "metti led verde poi play" (2 verbs)', () => {
      const response = mod.buildDirectOperationalResponse('metti led verde poi play', null);
      expect(response).toBeNull();
    });

    it('returns null for "evidenzia r1 dopo compila" (2 verbs)', () => {
      const response = mod.buildDirectOperationalResponse('evidenzia r1 dopo compila', null);
      expect(response).toBeNull();
    });

    it('returns null for "accendi led, evidenzia r1 e compila" (3 verbs — iter 41 bench seed)', () => {
      const response = mod.buildDirectOperationalResponse('accendi led, evidenzia r1 e compila', null);
      expect(response).toBeNull();
    });

    it('returns null for "fai partire e fammi vedere" (2 verbs edge case)', () => {
      const response = mod.buildDirectOperationalResponse('fai partire e fammi vedere', null);
      expect(response).toBeNull();
    });

    it('returns null for "carica esperimento poi mostrami il LED" (2 verbs)', () => {
      const response = mod.buildDirectOperationalResponse('carica esperimento poi mostrami il LED', null);
      expect(response).toBeNull();
    });
  });

  describe('SINGLE-action queries preserve existing pre-LLM fast path (regression v67)', () => {
    it('returns direct-operational-experiment-nav for SINGLE "accendi led"', () => {
      const response = mod.buildDirectOperationalResponse('accendi led', null);
      expect(response).not.toBeNull();
      expect(response.source).toBe('direct-operational-experiment-nav');
    });

    it('returns direct-operational-compile for SINGLE "compila il codice"', () => {
      const response = mod.buildDirectOperationalResponse('compila il codice', null);
      expect(response).not.toBeNull();
      expect(response.source).toBe('direct-operational-compile');
    });

    it('returns direct-operational-play for SINGLE "fai partire"', () => {
      const response = mod.buildDirectOperationalResponse('fai partire', null);
      expect(response).not.toBeNull();
      expect(response.source).toBe('direct-operational-play');
    });

    it('returns response for SINGLE "evidenzia r1"', () => {
      const response = mod.buildDirectOperationalResponse('evidenzia r1', null);
      expect(response).not.toBeNull();
      expect(response.source).toBe('direct-operational-highlight');
    });

    it('returns direct-operational-screenshot for SINGLE "fai una foto del circuito"', () => {
      // "fai" is 1 verb match — gate must NOT trigger
      const response = mod.buildDirectOperationalResponse('fai una foto del circuito', null);
      expect(response).not.toBeNull();
      expect(response.source).toBe('direct-operational-screenshot');
    });
  });

  describe('knowledge queries still fall through to LLM (regression P4 preserved)', () => {
    it('returns null for "Cosa fa pinMode in Arduino?"', () => {
      const response = mod.buildDirectOperationalResponse('Cosa fa pinMode in Arduino?', null);
      expect(response).toBeNull();
    });

    it('returns null for "Spiegami digitalWrite"', () => {
      // "spiegami" is not in action-verb list, falls through naturally
      const response = mod.buildDirectOperationalResponse('Spiegami digitalWrite', null);
      expect(response).toBeNull();
    });
  });
});
