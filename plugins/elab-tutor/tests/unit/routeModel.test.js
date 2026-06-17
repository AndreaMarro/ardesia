/**
 * Unit tests for routeModel (supabase/functions/_shared/router.ts).
 *
 * Sprint U iter 46 v75 — architectural pivot Pro → Flash + thinkingBudget.
 *
 * Iter 43 A1 originally promoted THINKING_KEYWORDS → 'gemini-2.5-pro'.
 * Iter 45 v73 restored Pro after thinkingBudget integer fix.
 * Iter 46 v75 measured Pro LIVE 8-9s — too slow for LIM real-time mandate.
 * Andrea iter 46 directive "9681ms troppo lungo": rollback to Flash with
 * thinkingBudget=2048 ('medium' level via routeThinkingLevel helper).
 *
 * Validates THINKING_KEYWORDS promotion → 'gemini-2.5-flash' for explicit
 * deep-thinking prompts ("approfondisci", "spiegami nel dettaglio",
 * "comprendere a fondo", "metti a confronto", "differenza tra X e Y", ...).
 *
 * Upstream `unlim-chat/index.ts:795` calls `routeThinkingLevel(model, msg)`
 * which returns 'medium' when (Flash + THINKING_KEYWORDS) OR explicit Pro.
 * Vertex EU short-circuit `llm-client.ts:392-415` consumes model+thinkingLevel
 * to call `gemini-2.5-flash` with thinkingBudget=2048. Target <5s latency vs
 * Pro 8-9s. Cost ~2x Flash-Lite for <5% of live traffic.
 *
 * Cost discipline: regex tight by design (verb+phrase pairs for ambiguous
 * tokens). Promotion rate target <5% of live traffic vs Flash-Lite baseline.
 *
 * Evidence:
 *   - docs/audits/2026-05-13-iter-41-latency-bench-7-capabilities.md
 *   - docs/audits/2026-05-13-iter-46-pro-flash-pivot.md (this iter)
 *
 * (c) Andrea Marro 2026-05-13 — ELAB Tutor
 */

import { describe, it, expect } from 'vitest';

// Vitest resolves '.ts' through esbuild. The shared router module has zero
// Deno-only deps (only type-only import from './types.ts').
import { routeModel, routeThinkingLevel } from '../../supabase/functions/_shared/router.ts';

describe('routeModel — iter 46 THINKING_KEYWORDS Flash + thinkingBudget pivot', () => {
  describe('Flash promotion (deep-thinking prompts → Flash + thinkingBudget=2048)', () => {
    it('promotes "Spiegami nel dettaglio come funziona Ohm" to Pro', () => {
      expect(routeModel('Spiegami nel dettaglio come funziona Ohm')).toBe(
        'gemini-2.5-flash',
      );
    });

    it('promotes "Approfondisci differenza serie e parallelo" to Pro', () => {
      expect(routeModel('Approfondisci differenza serie e parallelo')).toBe(
        'gemini-2.5-flash',
      );
    });

    it('promotes "Analizza in profondità il circuito" to Pro', () => {
      expect(routeModel('Analizza in profondità il circuito')).toBe(
        'gemini-2.5-flash',
      );
    });

    it('promotes "Analizza nel dettaglio questo esperimento" to Pro', () => {
      expect(routeModel('Analizza nel dettaglio questo esperimento')).toBe(
        'gemini-2.5-flash',
      );
    });

    it('promotes "Vorrei comprendere a fondo la legge di Ohm" to Pro', () => {
      expect(routeModel('Vorrei comprendere a fondo la legge di Ohm')).toBe(
        'gemini-2.5-flash',
      );
    });

    it('promotes "Metti a confronto LED e resistore" to Pro', () => {
      expect(routeModel('Metti a confronto LED e resistore')).toBe(
        'gemini-2.5-flash',
      );
    });

    it('promotes "Differenza tra corrente e tensione" (explicit compare form) to Pro', () => {
      expect(routeModel('Differenza tra corrente e tensione')).toBe(
        'gemini-2.5-flash',
      );
    });

    it('promotes "differenza fra resistenza e impedenza" (fra variant) to Pro', () => {
      expect(routeModel('Qual e la differenza fra resistenza e impedenza?')).toBe(
        'gemini-2.5-flash',
      );
    });

    it('matches case-insensitively', () => {
      expect(routeModel('APPROFONDISCI questo concetto')).toBe('gemini-2.5-flash');
      expect(routeModel('Approfondire il tema')).toBe('gemini-2.5-flash');
    });

    it('promotes "in profondita" without accent (loose Italian input)', () => {
      expect(routeModel('Spiegami in profondita la corrente alternata')).toBe(
        'gemini-2.5-flash',
      );
    });
  });

  describe('Flash-Lite preserved (no false promotion)', () => {
    it('keeps "Cosa è un LED" on Flash-Lite (no promote)', () => {
      expect(routeModel('Cosa è un LED')).toBe('gemini-2.5-flash-lite');
    });

    it('keeps simple greeting on Flash-Lite', () => {
      expect(routeModel('Ciao!')).toBe('gemini-2.5-flash-lite');
    });

    it('keeps "Aiuto" on Flash-Lite', () => {
      expect(routeModel('Aiuto')).toBe('gemini-2.5-flash-lite');
    });

    it('keeps short quiz answer on Flash-Lite', () => {
      expect(routeModel('Vol.1 pag.45')).toBe('gemini-2.5-flash-lite');
    });
  });

  describe('Flash preserved (medium-complexity FLASH_KEYWORDS)', () => {
    it('keeps "Spiega come funziona LED" on Flash (no promote — spiega-only)', () => {
      // 'spiega' is FLASH_KEYWORD but does NOT trigger THINKING_KEYWORDS
      // (requires 'spiegami nel dettaglio' phrase pair).
      expect(routeModel('Spiega come funziona LED')).toBe('gemini-2.5-flash');
    });

    it('keeps "differenza LED" (generic, no compare form) on Flash', () => {
      // FLASH_KEYWORDS catches 'differenza' but THINKING_KEYWORDS requires
      // 'differenza tra/fra X e Y' explicit form.
      expect(routeModel('differenza tra LED')).toBe('gemini-2.5-flash');
    });

    it('keeps "Calcola la resistenza" on Flash', () => {
      expect(routeModel('Calcola la resistenza')).toBe('gemini-2.5-flash');
    });

    it('keeps PRO_KEYWORDS diagnostic on Flash (legacy iter 33 behavior preserved)', () => {
      expect(routeModel('debug del codice')).toBe('gemini-2.5-flash');
      expect(routeModel('circuito non funziona')).toBe('gemini-2.5-flash');
    });
  });

  describe('Vision path (hasImages=true) skips Pro promotion', () => {
    it('routes deep-thinking + image to Flash, not Pro (vision latency budget)', () => {
      // Even with THINKING_KEYWORDS, vision MUST stay Flash.
      expect(routeModel('Approfondisci questo circuito', true)).toBe(
        'gemini-2.5-flash',
      );
    });

    it('routes image + errors to Flash regardless of thinking keywords', () => {
      const circuitState = { errors: [{ code: 'short' }] };
      expect(
        routeModel('Spiegami nel dettaglio cosa vedo', true, circuitState),
      ).toBe('gemini-2.5-flash');
    });
  });

  describe('Null-safety / empty input', () => {
    it('handles empty string → Flash-Lite default', () => {
      expect(routeModel('')).toBe('gemini-2.5-flash-lite');
    });

    it('handles undefined message → Flash-Lite default', () => {
      expect(routeModel(undefined)).toBe('gemini-2.5-flash-lite');
    });

    it('handles null message → Flash-Lite default', () => {
      expect(routeModel(null)).toBe('gemini-2.5-flash-lite');
    });

    it('handles non-string message → Flash-Lite default', () => {
      expect(routeModel(42)).toBe('gemini-2.5-flash-lite');
      expect(routeModel({})).toBe('gemini-2.5-flash-lite');
    });

    it('handles missing circuitState gracefully', () => {
      expect(routeModel('Approfondisci', false, null)).toBe('gemini-2.5-flash');
      expect(routeModel('Approfondisci', false, undefined)).toBe(
        'gemini-2.5-flash',
      );
    });
  });

  describe('Cost discipline — tight regex (no over-promotion)', () => {
    // These prompts MUST stay on cheaper models. Anti-cost-explosion guard.

    it('does NOT promote bare "dettaglio" (no verb anchor)', () => {
      expect(routeModel('dammi un dettaglio')).toBe('gemini-2.5-flash-lite');
    });

    it('does NOT promote bare "confronto" (no "metti a" anchor)', () => {
      // FLASH_KEYWORDS includes 'confronta' which catches this on Flash.
      expect(routeModel('confronta i due')).toBe('gemini-2.5-flash');
    });

    it('does NOT promote "profondità" alone (requires "in profondità" phrase)', () => {
      expect(routeModel('la profondità del mare')).toBe('gemini-2.5-flash-lite');
    });

    it('does NOT promote "differenza X e Y" without tra/fra connector', () => {
      // Plain 'differenza' is FLASH_KEYWORD, not THINKING.
      expect(routeModel('differenza importante')).toBe('gemini-2.5-flash');
    });

    it('does NOT promote "comprendere" alone (requires "a fondo")', () => {
      expect(routeModel('voglio comprendere')).toBe('gemini-2.5-flash-lite');
    });
  });
});

describe('routeThinkingLevel — iter 46 v76 helper (Pro-only, latency-first pivot)', () => {
  it('returns "medium" ONLY for explicit Pro model (legacy / offline audit path)', () => {
    expect(routeThinkingLevel('gemini-2.5-pro', 'qualunque cosa')).toBe('medium');
    expect(routeThinkingLevel('gemini-2.5-pro', '')).toBe('medium');
    expect(routeThinkingLevel('gemini-2.5-pro', 'Approfondisci')).toBe('medium');
  });

  it('returns undefined for Flash + THINKING_KEYWORDS (iter 46 latency pivot — Flash plain)', () => {
    // Iter 46 v76: thinking OFF for Flash regardless of keywords.
    // Empirical: Flash + thinkingBudget=1024 measured 10-22s LIVE (worse than Pro).
    // Quality preserved via system-prompt + RAG inject; latency ~3-4s target.
    expect(routeThinkingLevel('gemini-2.5-flash', 'Approfondisci il concetto')).toBeUndefined();
    expect(routeThinkingLevel('gemini-2.5-flash', 'Spiegami nel dettaglio Ohm')).toBeUndefined();
  });

  it('returns undefined for Flash + no THINKING_KEYWORDS (diagnostic / vision Flash)', () => {
    expect(routeThinkingLevel('gemini-2.5-flash', 'Spiega come funziona LED')).toBeUndefined();
    expect(routeThinkingLevel('gemini-2.5-flash', 'circuito non funziona')).toBeUndefined();
  });

  it('returns undefined for Flash-Lite always (no thinking budget)', () => {
    expect(routeThinkingLevel('gemini-2.5-flash-lite', 'Approfondisci')).toBeUndefined();
    expect(routeThinkingLevel('gemini-2.5-flash-lite', 'Ciao')).toBeUndefined();
  });

  it('handles non-string message gracefully → undefined for Flash', () => {
    expect(routeThinkingLevel('gemini-2.5-flash', null)).toBeUndefined();
    expect(routeThinkingLevel('gemini-2.5-flash', undefined)).toBeUndefined();
    expect(routeThinkingLevel('gemini-2.5-flash', 42)).toBeUndefined();
  });
});
