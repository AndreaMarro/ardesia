// © Andrea Marro — 27/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * cppToArduinoBlocklyXml — Smoke tests for the runtime C++ → Blockly XML
 * fallback generator. Verifies the generator produces structurally valid
 * arduino_base + chained next block output for the two LED alternation
 * sketch shown in the v3-cap6-esp4 experiment (and any stub equivalent).
 */
import { describe, test, expect } from 'vitest';
import {
  cppToArduinoBlocklyXml,
  isStubScratchXml,
  ensureScratchXml,
} from '../../src/features/elabArduinoAst/generators/cppToArduinoBlocklyXml.js';

const STUB_XML =
  '<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"><statement name="SETUP"><block type="arduino_serial_begin"><field name="BAUD">9600</field></block></statement><statement name="LOOP"><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value></block></statement></block></xml>';

const TWO_LED_SKETCH = `const int LED_BLU = 6;
const int LED_ROSSO = 9;

void setup() {
  pinMode(LED_BLU, OUTPUT);
  pinMode(LED_ROSSO, OUTPUT);
}

void loop() {
  digitalWrite(LED_BLU, HIGH);
  digitalWrite(LED_ROSSO, LOW);
  delay(200);
  digitalWrite(LED_BLU, LOW);
  digitalWrite(LED_ROSSO, HIGH);
  delay(200);
}`;

describe('isStubScratchXml', () => {
  test('detects default delay-only stub', () => {
    expect(isStubScratchXml(STUB_XML)).toBe(true);
  });

  test('treats empty / missing xml as stub', () => {
    expect(isStubScratchXml('')).toBe(true);
    expect(isStubScratchXml(null)).toBe(true);
    expect(isStubScratchXml(undefined)).toBe(true);
  });

  test('returns false for proper LED blink xml', () => {
    const realXml =
      '<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base"><statement name="SETUP"><block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">OUTPUT</field></block></statement><statement name="LOOP"><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field></block></statement></block></xml>';
    expect(isStubScratchXml(realXml)).toBe(false);
  });
});

describe('cppToArduinoBlocklyXml', () => {
  test('produces arduino_base container with SETUP + LOOP statements', () => {
    const xml = cppToArduinoBlocklyXml(TWO_LED_SKETCH);
    expect(xml).toContain('arduino_base');
    expect(xml).toContain('<statement name="SETUP">');
    expect(xml).toContain('<statement name="LOOP">');
  });

  test('resolves const int pin aliases to numeric literals', () => {
    const xml = cppToArduinoBlocklyXml(TWO_LED_SKETCH);
    expect(xml).toContain('<field name="PIN">6</field>');
    expect(xml).toContain('<field name="PIN">9</field>');
    expect(xml).not.toContain('LED_BLU');
    expect(xml).not.toContain('LED_ROSSO');
  });

  test('emits pinMode OUTPUT blocks in setup', () => {
    const xml = cppToArduinoBlocklyXml(TWO_LED_SKETCH);
    expect(xml).toMatch(/arduino_pin_mode[\s\S]*OUTPUT/);
  });

  test('emits digitalWrite HIGH and LOW blocks in loop', () => {
    const xml = cppToArduinoBlocklyXml(TWO_LED_SKETCH);
    expect(xml).toMatch(/arduino_digital_write[\s\S]*HIGH/);
    expect(xml).toMatch(/arduino_digital_write[\s\S]*LOW/);
  });

  test('chains multiple blocks with <next> wrappers', () => {
    const xml = cppToArduinoBlocklyXml(TWO_LED_SKETCH);
    expect(xml.match(/<next>/g)?.length).toBeGreaterThanOrEqual(4);
  });

  test('handles empty / invalid input safely', () => {
    expect(cppToArduinoBlocklyXml('')).toContain('xmlns');
    expect(cppToArduinoBlocklyXml(null)).toContain('xmlns');
  });
});

describe('ensureScratchXml', () => {
  test('returns regenerated xml when stub xml + code present', () => {
    const xml = ensureScratchXml({ scratchXml: STUB_XML, code: TWO_LED_SKETCH });
    expect(isStubScratchXml(xml)).toBe(false);
    expect(xml).toContain('arduino_pin_mode');
  });

  test('returns original xml when non-stub', () => {
    const real =
      '<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base"><statement name="SETUP"><block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">OUTPUT</field></block></statement></block></xml>';
    const xml = ensureScratchXml({ scratchXml: real, code: 'void setup(){} void loop(){}' });
    expect(xml).toBe(real);
  });

  test('returns empty string when experiment is null', () => {
    expect(ensureScratchXml(null)).toBe('');
  });
});
