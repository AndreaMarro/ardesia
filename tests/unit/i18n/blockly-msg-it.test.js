// © Andrea Marro — 25/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * blockly-msg-it — Italian Blockly.Msg overrides (Wave 1 first slice).
 *
 * Spec source:
 *   PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md Sez 1 + Sez 11
 *   docs/plans/2026-05-25-blockly-crosscompiler-definitivo.md iter X.2 Wave 1 Impl-A
 *
 * Contract: applyItalianMessages(BlocklyInstance) MUST set the 15 core UI
 * msg keys to Italian (plurale, Vol1/Vol2 language) on the provided Blockly
 * namespace's Msg object. Invocation is idempotent (calling twice = same
 * final state, no errors).
 *
 * Language rule (Principio Zero): plurale verbatim Vol1/Vol2 — "Ripeti", non
 * "Loop"; "Pausa", non "Wait"; "Variabili", non "Variables".
 *
 * Test scope this slice = 15 keys only. Wave 1b will add search box, collapse
 * button copy, welcome empty state.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { applyItalianMessages } from '../../../src/i18n/blockly-msg-it.js';

// Build a fresh fake Blockly namespace per test to keep tests isolated
// (real Blockly Msg is a global singleton — we don't want cross-test pollution).
function makeFakeBlockly() {
  return { Msg: {} };
}

describe('blockly-msg-it — module export contract', () => {
  it('exports applyItalianMessages as a function', () => {
    expect(typeof applyItalianMessages).toBe('function');
  });

  it('returns the Blockly instance for chaining', () => {
    const Blockly = makeFakeBlockly();
    const result = applyItalianMessages(Blockly);
    expect(result).toBe(Blockly);
  });

  it('does not throw when called twice (idempotent)', () => {
    const Blockly = makeFakeBlockly();
    expect(() => {
      applyItalianMessages(Blockly);
      applyItalianMessages(Blockly);
    }).not.toThrow();
  });

  it('creates Msg object if missing on the Blockly namespace', () => {
    const Blockly = {}; // no Msg property
    applyItalianMessages(Blockly);
    expect(Blockly.Msg).toBeDefined();
    expect(typeof Blockly.Msg).toBe('object');
  });
});

describe('blockly-msg-it — 15 core IT msg overrides', () => {
  let Blockly;

  beforeEach(() => {
    Blockly = makeFakeBlockly();
    applyItalianMessages(Blockly);
  });

  // Setup / Loop core
  it('SETUP_FUNCTION = "Avvio"', () => {
    expect(Blockly.Msg.SETUP_FUNCTION).toBe('Avvio');
  });

  it('LOOP_FUNCTION = "Ripeti"', () => {
    expect(Blockly.Msg.LOOP_FUNCTION).toBe('Ripeti');
  });

  // Pin I/O — digital
  it('PIN_DIGITAL_WRITE = "Scrivi pin digitale"', () => {
    expect(Blockly.Msg.PIN_DIGITAL_WRITE).toBe('Scrivi pin digitale');
  });

  it('PIN_DIGITAL_READ = "Leggi pin digitale"', () => {
    expect(Blockly.Msg.PIN_DIGITAL_READ).toBe('Leggi pin digitale');
  });

  // Pin I/O — analog
  it('PIN_ANALOG_WRITE = "Scrivi pin analogico"', () => {
    expect(Blockly.Msg.PIN_ANALOG_WRITE).toBe('Scrivi pin analogico');
  });

  it('PIN_ANALOG_READ = "Leggi pin analogico"', () => {
    expect(Blockly.Msg.PIN_ANALOG_READ).toBe('Leggi pin analogico');
  });

  // Pin mode dropdown
  it('PIN_MODE_OUTPUT = "USCITA"', () => {
    expect(Blockly.Msg.PIN_MODE_OUTPUT).toBe('USCITA');
  });

  it('PIN_MODE_INPUT = "INGRESSO"', () => {
    expect(Blockly.Msg.PIN_MODE_INPUT).toBe('INGRESSO');
  });

  // Serial
  it('SERIAL_PRINT = "Serial.print"', () => {
    expect(Blockly.Msg.SERIAL_PRINT).toBe('Serial.print');
  });

  it('SERIAL_PRINTLN = "Serial.println"', () => {
    expect(Blockly.Msg.SERIAL_PRINTLN).toBe('Serial.println');
  });

  // Delay
  it('DELAY_MS = "Pausa (millisecondi)"', () => {
    expect(Blockly.Msg.DELAY_MS).toBe('Pausa (millisecondi)');
  });

  // Category labels
  it('VARIABLES = "Variabili"', () => {
    expect(Blockly.Msg.VARIABLES).toBe('Variabili');
  });

  it('FUNCTIONS = "Funzioni"', () => {
    expect(Blockly.Msg.FUNCTIONS).toBe('Funzioni');
  });

  it('MATH = "Matematica"', () => {
    expect(Blockly.Msg.MATH).toBe('Matematica');
  });

  it('LOGIC = "Logica"', () => {
    expect(Blockly.Msg.LOGIC).toBe('Logica');
  });
});

describe('blockly-msg-it — language discipline (Principio Zero)', () => {
  let Blockly;

  beforeEach(() => {
    Blockly = makeFakeBlockly();
    applyItalianMessages(Blockly);
  });

  it('all 15 msg values are non-empty strings', () => {
    const keys = [
      'SETUP_FUNCTION', 'LOOP_FUNCTION',
      'PIN_DIGITAL_WRITE', 'PIN_DIGITAL_READ',
      'PIN_ANALOG_WRITE', 'PIN_ANALOG_READ',
      'PIN_MODE_OUTPUT', 'PIN_MODE_INPUT',
      'SERIAL_PRINT', 'SERIAL_PRINTLN',
      'DELAY_MS',
      'VARIABLES', 'FUNCTIONS', 'MATH', 'LOGIC',
    ];
    for (const key of keys) {
      expect(typeof Blockly.Msg[key]).toBe('string');
      expect(Blockly.Msg[key].length).toBeGreaterThan(0);
    }
  });

  it('no English-only artifacts in IT-meaning keys (sanity check)', () => {
    // Quick guard: keys that should be IT must NOT contain English-only words
    // like "Loop", "Write", "Wait", "Variables". (SERIAL_PRINT/PRINTLN are
    // deliberately Arduino API keywords — excluded from this sweep.)
    const itOnlyKeys = [
      'SETUP_FUNCTION', 'LOOP_FUNCTION',
      'PIN_DIGITAL_WRITE', 'PIN_DIGITAL_READ',
      'PIN_ANALOG_WRITE', 'PIN_ANALOG_READ',
      'DELAY_MS', 'VARIABLES', 'FUNCTIONS', 'MATH', 'LOGIC',
    ];
    const englishWordRegex = /\b(Loop|Write|Read|Wait|Variables|Functions|Math|Logic|Setup)\b/;
    for (const key of itOnlyKeys) {
      expect(Blockly.Msg[key]).not.toMatch(englishWordRegex);
    }
  });
});
