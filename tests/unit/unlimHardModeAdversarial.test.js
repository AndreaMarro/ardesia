import { describe, expect, it } from 'vitest';

const mod = await import('../../supabase/functions/_shared/operational-response.ts');

describe('UNLIM hard-mode adversarial operational responses', () => {
  it('does not answer a traffic-light Arduino request with generic Blink code', () => {
    const response = mod.buildDirectOperationalResponse('Prepara il codice Arduino del semaforo e compila', null);

    expect(response?.source).toBe('direct-operational-arduino');
    expect(response?.response).toContain('[AZIONE:switcheditor:arduino]');
    expect(response?.response).toContain('[AZIONE:setcode:');
    expect(response?.response).toContain('[AZIONE:loadexp:v3-cap6-semaforo]');
    expect(response?.response).toContain('pinMode(5, OUTPUT)');
    expect(response?.response).toContain('pinMode(6, OUTPUT)');
    expect(response?.response).toContain('pinMode(3, OUTPUT)');
    expect(response?.response).toContain('[AZIONE:compile]');
    expect(response?.response).not.toContain('programma Blink');
  });

  it('loads Scratch blocks when the user asks UNLIM to create the blinking workspace', () => {
    const response = mod.buildDirectOperationalResponse('Apri Scratch e carica i blocchi per far lampeggiare il LED', null);

    expect(response?.source).toBe('direct-operational-scratch');
    expect(response?.response).toContain('[AZIONE:openeditor]');
    expect(response?.response).toContain('[AZIONE:switcheditor:scratch]');
    expect(response?.response).toContain('[AZIONE:loadblocks:');
    expect(response?.response).toContain('arduino_pin_mode');
    expect(response?.response).toContain('arduino_digital_write');
    expect(response?.response).not.toContain('arduino_pinmode');
    expect(response?.response).not.toContain('arduino_digitalwrite');
  });

  it('turns report or fumetto requests into the existing export action', () => {
    const response = mod.buildDirectOperationalResponse('Fammi il report fumetto della sessione con quello che abbiamo fatto', null);

    expect(response?.source).toBe('direct-operational-report-comic');
    expect(response?.response).toContain('[AZIONE:exportfumetto:pdf]');
    expect(response?.response).not.toMatch(/ho generato|e' pronto|è pronto/i);
  });
});
