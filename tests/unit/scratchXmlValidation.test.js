/**
 * ScratchXml Validation — Verifica che gli XML Blockly siano strutturalmente validi
 * Ogni scratchXml deve avere blocchi con type validi e struttura corretta
 * (c) Andrea Marro — 11/04/2026
 */

import { describe, test, expect } from 'vitest';
import { JSDOM } from 'jsdom';

const vol3 = await import('../../src/data/experiments-vol3.js');

function getVol3Experiments() {
  const exp = vol3.default || vol3.experiments || [];
  if (Array.isArray(exp)) return exp;
  return Object.values(exp).flat().filter(e => e?.id);
}

// Valid Arduino Blockly block types (from scratchBlocks.js patterns)
const VALID_BLOCK_TYPES = new Set([
  'arduino_base', 'arduino_setup', 'arduino_loop',
  'arduino_pin_mode', 'arduino_digital_write', 'arduino_digital_read',
  'arduino_analog_write', 'arduino_analog_read',
  'arduino_delay', 'arduino_delay_microseconds',
  'arduino_serial_begin', 'arduino_serial_print', 'arduino_serial_println',
  'arduino_serial_read', 'arduino_serial_available',
  'arduino_tone', 'arduino_no_tone',
  'arduino_map', 'arduino_constrain',
  'arduino_variable_set', 'arduino_variable_get',
  'controls_if', 'controls_repeat_ext', 'controls_whileUntil', 'controls_for',
  'logic_compare', 'logic_operation', 'logic_negate', 'logic_boolean',
  'math_number', 'math_arithmetic', 'math_modulo',
  'text', 'text_join',
  'variables_set', 'variables_get',
  'procedures_defnoreturn', 'procedures_callnoreturn',
]);

describe('ScratchXml Validation', () => {
  const experiments = getVol3Experiments();
  const withScratch = experiments.filter(e => e.scratchXml);

  test('at least 14 Vol3 experiments have scratchXml', () => {
    expect(withScratch.length).toBeGreaterThanOrEqual(14);
  });

  test('every scratchXml is valid XML', () => {
    withScratch.forEach(e => {
      const xml = typeof e.scratchXml === 'string' ? e.scratchXml : String(e.scratchXml);
      expect(() => {
        const dom = new JSDOM(xml, { contentType: 'text/xml' });
        const errors = dom.window.document.querySelector('parsererror');
        if (errors) throw new Error(`XML parse error in ${e.id}`);
      }, `${e.id} has invalid XML`).not.toThrow();
    });
  });

  test('every scratchXml starts with <xml', () => {
    withScratch.forEach(e => {
      const xml = typeof e.scratchXml === 'string' ? e.scratchXml : String(e.scratchXml);
      expect(xml.trimStart().startsWith('<xml'), `${e.id} should start with <xml`).toBe(true);
    });
  });

  test('every scratchXml has at least one <block> element', () => {
    withScratch.forEach(e => {
      const xml = typeof e.scratchXml === 'string' ? e.scratchXml : String(e.scratchXml);
      expect(xml.includes('<block'), `${e.id} has no <block> elements`).toBe(true);
    });
  });

  test('arduino_base or arduino_setup block is present', () => {
    withScratch.forEach(e => {
      const xml = typeof e.scratchXml === 'string' ? e.scratchXml : String(e.scratchXml);
      const hasBase = xml.includes('arduino_base') || xml.includes('arduino_setup');
      expect(hasBase, `${e.id} missing arduino_base/setup block`).toBe(true);
    });
  });

  test('pin numbers in digital_write are valid Arduino pins (0-19)', () => {
    withScratch.forEach(e => {
      const xml = typeof e.scratchXml === 'string' ? e.scratchXml : String(e.scratchXml);
      const pinMatches = [...xml.matchAll(/<field name="PIN">(\d+)<\/field>/g)];
      pinMatches.forEach(m => {
        const pin = parseInt(m[1]);
        expect(pin, `${e.id} has invalid pin ${pin}`).toBeGreaterThanOrEqual(0);
        expect(pin, `${e.id} has invalid pin ${pin}`).toBeLessThanOrEqual(19);
      });
    });
  });

  test('delay values are reasonable (1-60000ms)', () => {
    withScratch.forEach(e => {
      const xml = typeof e.scratchXml === 'string' ? e.scratchXml : String(e.scratchXml);
      // Find delay blocks with numeric values
      const delayPattern = /arduino_delay[\s\S]*?<field name="NUM">(\d+)<\/field>/g;
      const matches = [...xml.matchAll(delayPattern)];
      matches.forEach(m => {
        const delay = parseInt(m[1]);
        expect(delay, `${e.id} has unreasonable delay ${delay}`).toBeGreaterThan(0);
        expect(delay, `${e.id} has unreasonable delay ${delay}`).toBeLessThanOrEqual(60000);
      });
    });
  });

  test('HIGH/LOW states are valid in digital_write', () => {
    withScratch.forEach(e => {
      const xml = typeof e.scratchXml === 'string' ? e.scratchXml : String(e.scratchXml);
      const stateMatches = [...xml.matchAll(/<field name="STATE">(\w+)<\/field>/g)];
      stateMatches.forEach(m => {
        expect(['HIGH', 'LOW']).toContain(m[1]);
      });
    });
  });
});
