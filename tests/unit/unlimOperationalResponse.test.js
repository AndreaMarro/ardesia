import { describe, expect, it } from 'vitest';

const mod = await import('../../supabase/functions/_shared/operational-response.ts');

describe('UNLIM operational response contracts', () => {
  it('keeps complete control tags while capping visible prose at live-class budget', () => {
    const longText = `${Array.from({ length: 360 }, (_, i) => `parola${i}`).join(' ')} [AZIONE:compile] [INTENT:{"tool":"highlightComponent","args":{"ids":["led1","r1"]}}]`;
    const capped = mod.capWordsPreservingControlTags(longText);

    expect(capped.split(/\s+/).filter(w => /^parola/.test(w))).toHaveLength(mod.UNLIM_MAX_VISIBLE_WORDS);
    expect(capped).toContain('[AZIONE:compile]');
    expect(capped).toContain('[INTENT:{"tool":"highlightComponent","args":{"ids":["led1","r1"]}}]');
  });

  it('answers vague behavior-change prompts from circuit errors with diagnosis and executable tags', () => {
    const response = mod.buildDirectOperationalResponse('È cambiato qualcosa, come mai ora fa così?', {
      text: 'LED2 spento dopo spostamento',
      components: [{ id: 'led2', type: 'led', state: 'off' }, { id: 'r2', type: 'resistor' }],
      errors: ['led2 scollegato: non esiste un percorso chiuso'],
    });

    expect(response.source).toBe('direct-operational-diagnosis');
    expect(response.response).toContain('led2 scollegato');
    expect(response.response).toContain('[AZIONE:highlight:led2,r2]');
    expect(response.response).toContain('[AZIONE:diagnose]');
  });

  it('returns Arduino actions for code, editor and compile in one response', () => {
    const response = mod.buildDirectOperationalResponse('Apri Arduino, metti il codice blink e compila', null);

    expect(response.source).toBe('direct-operational-arduino');
    expect(response.response).toContain('[AZIONE:openeditor]');
    expect(response.response).toContain('[AZIONE:switcheditor:arduino]');
    expect(response.response).toContain('[AZIONE:setcode:');
    expect(response.response).toContain('[AZIONE:compile]');
  });

  // 2026-05-10 — live prod probe P4 fix:
  // "Cosa fa la funzione pinMode in Arduino" matched arduino keyword → returned
  // "Passo ad Arduino e preparo Blink" instead of explaining pinMode concept.
  // Knowledge queries must fall through to LLM for proper teaching response.
  it('does NOT short-circuit knowledge queries about Arduino concepts (regression P4)', () => {
    const knowledgeQueries = [
      'Cosa fa la funzione pinMode in Arduino?',
      'Spiegami digitalWrite in Arduino',
      'Come funziona analogRead in Arduino?',
      "Cos'è il loop in Arduino?",
      'Descrivimi il setup() Arduino',
      'Definisci la funzione delay nel codice Arduino',
    ];
    for (const q of knowledgeQueries) {
      const response = mod.buildDirectOperationalResponse(q, null);
      expect(response, `Knowledge query "${q}" should NOT trigger direct-operational-arduino`).toBeNull();
    }
  });

  it('still triggers direct-operational-arduino for action queries (regression: keep legitimate path)', () => {
    const actionQueries = [
      'Apri Arduino e prepara blink',
      'Compila il codice Arduino',
      'Carica programma blink Arduino',
      'Prepara sketch Arduino lampeggio LED',
    ];
    for (const q of actionQueries) {
      const response = mod.buildDirectOperationalResponse(q, null);
      expect(response?.source, `Action query "${q}" should still trigger direct-operational-arduino`).toBe('direct-operational-arduino');
    }
  });

  it('uses the official Volume 3 semaforo experiment and pins for traffic-light prompts', () => {
    const response = mod.buildDirectOperationalResponse('Prepara codice Arduino per semaforo e compila', null);

    expect(response.source).toBe('direct-operational-arduino');
    expect(response.response).toContain('[AZIONE:loadexp:v3-cap6-semaforo]');
    expect(response.response).toContain('pinMode(5, OUTPUT)');
    expect(response.response).toContain('pinMode(6, OUTPUT)');
    expect(response.response).toContain('pinMode(3, OUTPUT)');
    expect(response.response).not.toContain('PIN_ROSSO = 13');
  });

  it('returns valid Scratch workspace actions when the prompt asks to load blocks', () => {
    const response = mod.buildDirectOperationalResponse('Apri i blocchi Scratch e carica blink', null);

    expect(response.source).toBe('direct-operational-scratch');
    expect(response.response).toContain('[AZIONE:openeditor]');
    expect(response.response).toContain('[AZIONE:switcheditor:scratch]');
    expect(response.response).toContain('[AZIONE:loadblocks:');
    expect(response.response).toContain('arduino_pin_mode');
    expect(response.response).toContain('arduino_digital_write');
    expect(response.response).not.toContain('arduino_pinmode');
    expect(response.response).not.toContain('arduino_digitalwrite');
  });
});
