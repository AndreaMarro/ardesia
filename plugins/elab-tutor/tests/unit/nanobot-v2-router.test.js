/**
 * Nanobot V2 — Router Unit Tests
 * Tests the AI model routing logic (70/25/5 split).
 * (c) Andrea Marro — 02/04/2026
 */
import { describe, it, expect } from 'vitest';

// Re-implement router logic for testing (Edge Functions use Deno, tests use Node)
const FLASH_KEYWORDS = /spiega|come funziona|differenza|confronta|progetta|perch[eé]|ragion|principio|legge|formula|calcola|analogia|esempio/i;
const PRO_KEYWORDS = /analizza|debug|perché non|errore complesso|non capisco perch|dove sbaglio|trova il problema|circuito non funziona/i;

function routeModel(message, hasImages = false, circuitState = null) {
  const hasErrors = (circuitState?.errors?.length ?? 0) > 0;
  if (hasImages && hasErrors) return 'gemini-3.1-pro-preview';
  if (PRO_KEYWORDS.test(message)) return 'gemini-3.1-pro-preview';
  if (hasImages) return 'gemini-3-flash-preview';
  if (FLASH_KEYWORDS.test(message)) return 'gemini-3-flash-preview';
  return 'gemini-3.1-flash-lite-preview';
}

describe('Nanobot V2 Router', () => {
  describe('Flash-Lite (70% — simple questions)', () => {
    it('routes greetings to Flash-Lite', () => {
      expect(routeModel('Ciao!')).toBe('gemini-3.1-flash-lite-preview');
    });

    it('routes simple questions to Flash-Lite', () => {
      expect(routeModel("Cos'è un LED?")).toBe('gemini-3.1-flash-lite-preview');
    });

    it('routes quiz answers to Flash-Lite', () => {
      expect(routeModel('La risposta è B')).toBe('gemini-3.1-flash-lite-preview');
    });

    it('routes action requests to Flash-Lite', () => {
      expect(routeModel('Accendi la simulazione')).toBe('gemini-3.1-flash-lite-preview');
    });

    it('routes simple help to Flash-Lite', () => {
      expect(routeModel('Aiutami')).toBe('gemini-3.1-flash-lite-preview');
    });
  });

  describe('Flash (25% — reasoning)', () => {
    it('routes "spiega" to Flash', () => {
      expect(routeModel('Spiega la legge di Ohm')).toBe('gemini-3-flash-preview');
    });

    it('routes "come funziona" to Flash', () => {
      expect(routeModel('Come funziona un condensatore?')).toBe('gemini-3-flash-preview');
    });

    it('routes "perché" to Flash', () => {
      expect(routeModel('Perché il LED si accende?')).toBe('gemini-3-flash-preview');
    });

    it('routes "differenza" to Flash', () => {
      expect(routeModel('Qual è la differenza tra serie e parallelo?')).toBe('gemini-3-flash-preview');
    });

    it('routes images without errors to Flash', () => {
      expect(routeModel('Cosa vedi?', true)).toBe('gemini-3-flash-preview');
    });

    it('routes "formula" to Flash', () => {
      expect(routeModel('Qual è la formula della potenza?')).toBe('gemini-3-flash-preview');
    });
  });

  describe('Pro (5% — complex analysis)', () => {
    it('routes "analizza" to Pro', () => {
      expect(routeModel('Analizza questo circuito')).toBe('gemini-3.1-pro-preview');
    });

    it('routes "perché non funziona" to Pro', () => {
      expect(routeModel('Perché non si accende il LED?')).toBe('gemini-3.1-pro-preview');
    });

    it('routes "debug" to Pro', () => {
      expect(routeModel('Debug del circuito')).toBe('gemini-3.1-pro-preview');
    });

    it('routes "dove sbaglio" to Pro', () => {
      expect(routeModel('Dove sbaglio?')).toBe('gemini-3.1-pro-preview');
    });

    it('routes images WITH errors to Pro', () => {
      expect(routeModel('Cosa c\'è che non va?', true, { errors: ['LED bruciato'] }))
        .toBe('gemini-3.1-pro-preview');
    });

    it('routes "circuito non funziona" to Pro', () => {
      expect(routeModel('Il circuito non funziona')).toBe('gemini-3.1-pro-preview');
    });
  });

  describe('Edge cases', () => {
    it('handles empty message as Flash-Lite', () => {
      expect(routeModel('')).toBe('gemini-3.1-flash-lite-preview');
    });

    it('handles null circuitState gracefully', () => {
      expect(routeModel('test', false, null)).toBe('gemini-3.1-flash-lite-preview');
    });

    it('handles circuitState without errors', () => {
      expect(routeModel('test', false, { errors: [] })).toBe('gemini-3.1-flash-lite-preview');
    });

    it('"perché" triggers Flash (reasoning), not Pro', () => {
      // "perché" alone = reasoning question, not debugging
      expect(routeModel('Perché i colori delle resistenze sono diversi?')).toBe('gemini-3-flash-preview');
    });

    it('"perché non" triggers Pro (debugging)', () => {
      // "perché non" = something broken, needs deep analysis
      expect(routeModel('Perché non funziona?')).toBe('gemini-3.1-pro-preview');
    });
  });
});
