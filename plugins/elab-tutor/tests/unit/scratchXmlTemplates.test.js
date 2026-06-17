/**
 * scratchXmlTemplates.test.js — Verifica OGNI nuovo template scratchXml
 *
 * Testa tutti i template generati in scratch-xml-templates.js:
 * - XML valido
 * - Caricamento in Blockly workspace
 * - Generazione codice Arduino con setup/loop
 * - Output specifico per ogni esperimento
 */
import { describe, it, expect } from 'vitest';
import * as Blockly from 'blockly';
import '../../src/components/simulator/panels/scratchBlocks';
import { generateArduinoCode } from '../../src/components/simulator/panels/scratchGenerator';
import * as T from '../../src/data/scratch-xml-templates';

function codeFromXml(xml) {
  const workspace = new Blockly.Workspace();
  try {
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), workspace);
    return generateArduinoCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function validateXml(xml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  return doc.querySelectorAll('parsererror').length === 0;
}

const TEMPLATES = {
  BLINK_BUILTIN_SCRATCH: T.BLINK_BUILTIN_SCRATCH,
  BLINK_FAST_SCRATCH: T.BLINK_FAST_SCRATCH,
  LED_ESTERNO_SCRATCH: T.LED_ESTERNO_SCRATCH,
  CAMBIA_PIN_SCRATCH: T.CAMBIA_PIN_SCRATCH,
  POLIZIA_SCRATCH: T.POLIZIA_SCRATCH,
  PULSANTE_TOGGLE_SCRATCH: T.PULSANTE_TOGGLE_SCRATCH,
  MORSE_SIMPLE_SCRATCH: T.MORSE_SIMPLE_SCRATCH,
  ANALOG_READ_BASE_SCRATCH: T.ANALOG_READ_BASE_SCRATCH,
  TRIMMER_3LED_SCRATCH: T.TRIMMER_3LED_SCRATCH,
  PWM_FADE_SCRATCH: T.PWM_FADE_SCRATCH,
  PWM_MANUAL_SCRATCH: T.PWM_MANUAL_SCRATCH,
  TRIMMER_MAP_SCRATCH: T.TRIMMER_MAP_SCRATCH,
  SERIAL_SETUP_SCRATCH: T.SERIAL_SETUP_SCRATCH,
  SERIAL_LOOP_SCRATCH: T.SERIAL_LOOP_SCRATCH,
  POT_3LED_SERIAL_SCRATCH: T.POT_3LED_SERIAL_SCRATCH,
  PWM_FADE_UPDOWN_SCRATCH: T.PWM_FADE_UPDOWN_SCRATCH,
  SERIAL_2POT_SCRATCH: T.SERIAL_2POT_SCRATCH,
};

describe('scratch-xml-templates — validity', () => {
  for (const [name, xml] of Object.entries(TEMPLATES)) {
    it(`${name} is valid XML`, () => {
      expect(validateXml(xml)).toBe(true);
    });
  }
});

describe('scratch-xml-templates — Blockly load + code generation', () => {
  for (const [name, xml] of Object.entries(TEMPLATES)) {
    it(`${name} loads and generates valid Arduino code`, () => {
      const code = codeFromXml(xml);
      expect(code).toContain('void setup()');
      expect(code).toContain('void loop()');
    });
  }
});

describe('scratch-xml-templates — output correctness', () => {
  it('BLINK_BUILTIN generates pin 13 blink at 1000ms', () => {
    const code = codeFromXml(T.BLINK_BUILTIN_SCRATCH);
    expect(code).toContain('pinMode(13, OUTPUT)');
    expect(code).toContain('digitalWrite(13, HIGH)');
    expect(code).toContain('delay(1000)');
    expect(code).toContain('digitalWrite(13, LOW)');
  });

  it('BLINK_FAST generates 200ms delay', () => {
    const code = codeFromXml(T.BLINK_FAST_SCRATCH);
    expect(code).toContain('delay(200)');
  });

  it('CAMBIA_PIN uses pin 5', () => {
    const code = codeFromXml(T.CAMBIA_PIN_SCRATCH);
    expect(code).toContain('pinMode(5, OUTPUT)');
    expect(code).toContain('digitalWrite(5, HIGH)');
  });

  it('POLIZIA uses pins 5, 6, 9 with timing', () => {
    const code = codeFromXml(T.POLIZIA_SCRATCH);
    expect(code).toContain('pinMode(5, OUTPUT)');
    expect(code).toContain('pinMode(6, OUTPUT)');
    expect(code).toContain('pinMode(9, OUTPUT)');
    expect(code).toContain('delay(3000)');
    expect(code).toContain('delay(1000)');
  });

  it('PULSANTE_TOGGLE uses digitalRead pin 10', () => {
    const code = codeFromXml(T.PULSANTE_TOGGLE_SCRATCH);
    expect(code).toContain('pinMode(10, INPUT_PULLUP)');
    expect(code).toContain('digitalRead(10)');
    expect(code).toContain('if (');
  });

  it('MORSE_SIMPLE uses repeat block', () => {
    const code = codeFromXml(T.MORSE_SIMPLE_SCRATCH);
    expect(code).toContain('for (int');
    expect(code).toContain('delay(200)');
  });

  it('ANALOG_READ_BASE uses analogRead + if/else', () => {
    const code = codeFromXml(T.ANALOG_READ_BASE_SCRATCH);
    expect(code).toContain('analogRead(A0)');
    expect(code).toContain('if (');
    expect(code).toContain('> 511');
    expect(code).toContain('digitalWrite(13, HIGH)');
  });

  it('TRIMMER_3LED uses analogRead + 3 pins', () => {
    const code = codeFromXml(T.TRIMMER_3LED_SCRATCH);
    expect(code).toContain('analogRead(A0)');
    expect(code).toContain('pinMode(3, OUTPUT)');
    expect(code).toContain('pinMode(5, OUTPUT)');
    expect(code).toContain('pinMode(6, OUTPUT)');
  });

  it('PWM_FADE uses for loop + analogWrite', () => {
    const code = codeFromXml(T.PWM_FADE_SCRATCH);
    expect(code).toContain('for (int');
    expect(code).toContain('analogWrite(5,');
  });

  it('PWM_MANUAL uses 4 analogWrite values', () => {
    const code = codeFromXml(T.PWM_MANUAL_SCRATCH);
    expect(code).toContain('analogWrite(5, 0)');
    expect(code).toContain('analogWrite(5, 64)');
    expect(code).toContain('analogWrite(5, 128)');
    expect(code).toContain('analogWrite(5, 255)');
  });

  it('TRIMMER_MAP uses analogRead + map + analogWrite', () => {
    const code = codeFromXml(T.TRIMMER_MAP_SCRATCH);
    expect(code).toContain('analogRead(A0)');
    expect(code).toContain('map(');
    expect(code).toContain('analogWrite(5,');
  });

  it('SERIAL_SETUP uses Serial.begin + println in setup only', () => {
    const code = codeFromXml(T.SERIAL_SETUP_SCRATCH);
    expect(code).toContain('Serial.begin(9600)');
    expect(code).toContain('Serial.println("Ciao dal Team di ELAB!")');
  });

  it('SERIAL_LOOP uses Serial.println in loop', () => {
    const code = codeFromXml(T.SERIAL_LOOP_SCRATCH);
    expect(code).toContain('Serial.begin(9600)');
    const loopIdx = code.indexOf('void loop()');
    const printIdx = code.indexOf('Serial.println("Ciao dal Team di ELAB!")');
    expect(printIdx).toBeGreaterThan(loopIdx);
  });

  it('POT_3LED_SERIAL uses analogRead + Serial + 3 LED pins', () => {
    const code = codeFromXml(T.POT_3LED_SERIAL_SCRATCH);
    expect(code).toContain('analogRead(A3)');
    expect(code).toContain('Serial.begin(9600)');
    expect(code).toContain('pinMode(12, OUTPUT)');
    expect(code).toContain('pinMode(11, OUTPUT)');
    expect(code).toContain('pinMode(10, OUTPUT)');
  });

  it('PWM_FADE_UPDOWN uses two for loops (fade up + fade down)', () => {
    const code = codeFromXml(T.PWM_FADE_UPDOWN_SCRATCH);
    expect(code).toContain('analogWrite(5,');
    // Should have two for loops
    const forCount = (code.match(/for \(int/g) || []).length;
    expect(forCount).toBe(2);
  });

  it('SERIAL_2POT reads A3 and A4 with serial output', () => {
    const code = codeFromXml(T.SERIAL_2POT_SCRATCH);
    expect(code).toContain('Serial.begin(9600)');
    expect(code).toContain('analogRead(A3)');
    expect(code).toContain('analogRead(A4)');
  });
});
