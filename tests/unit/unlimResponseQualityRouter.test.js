import { describe, expect, it } from 'vitest';

const mod = await import('../../supabase/functions/_shared/operational-response.ts');

describe('UNLIM response quality router', () => {
  it('classifies the required live-class intents with explicit budgets and tool plans', () => {
    const cases = [
      ['spiegami in breve il PWM', 'explain_brief', 55],
      ['il LED non si accende dopo che ho spostato il filo', 'circuit_diagnosis', 65],
      ['prepara Arduino blink e compila', 'arduino_action', 45],
      ['apri Scratch e carica i blocchi LED', 'scratch_action', 45],
      ['guarda lo schermo e dimmi cosa vedi', 'screen_look', 35],
      ['fai tu', 'vague', 35],
      ['raccontami questo esperimento come nel libro', 'book_narrative', 70],
    ];

    for (const [message, intent, maxWords] of cases) {
      const route = mod.classifyResponseQualityIntent(message, null);
      expect(route.intent).toBe(intent);
      expect(route.maxVisibleWords).toBeLessThanOrEqual(maxWords);
      expect(route.maxSentences).toBeLessThanOrEqual(4);
      expect(route.style).toMatch(/naturale|operativo|breve|vivo/i);
      expect(Array.isArray(route.toolPlan)).toBe(true);
    }
  });

  it('builds short local replies for vague classroom requests without citations or chatbot filler', () => {
    const response = mod.buildDirectOperationalResponse('fai tu, sono in panico', null);

    expect(response.source).toBe('direct-quality-vague');
    expect(response.response).not.toMatch(/ottima domanda|certamente|in base al contesto|Vol\.|pagina|pag\./i);
    expect(mod.visibleSentenceCount(response.response)).toBeLessThanOrEqual(3);
    expect(mod.visibleWordCount(response.response)).toBeLessThanOrEqual(35);
  });

  it('uses one clean thinking label and rejects old typo variants', () => {
    expect(mod.UNLIM_THINKING_LABEL).toBe('Sto ELABorando...');
    expect(mod.UNLIM_THINKING_LABEL).not.toContain('elaborandg');
    expect(mod.UNLIM_THINKING_LABEL).not.toContain('Sto elaborando');
  });

  it('caps visible prose at the live-class budget while preserving complete control tags', () => {
    const text = `${Array.from({ length: 140 }, (_, i) => `parola${i}`).join(' ')} [AZIONE:compile] [INTENT:{"tool":"highlightComponent","args":{"ids":["led1"]}}]`;
    const capped = mod.capWordsPreservingControlTags(text);

    expect(mod.visibleWordCount(capped)).toBeLessThanOrEqual(mod.UNLIM_MAX_VISIBLE_WORDS);
    expect(capped).toContain('[AZIONE:compile]');
    expect(capped).toContain('[INTENT:{"tool":"highlightComponent","args":{"ids":["led1"]}}]');
  });
});
