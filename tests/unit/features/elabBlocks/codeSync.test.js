import { describe, it, expect } from 'vitest';
import * as Blockly from 'blockly';
import '../../../../src/components/simulator/panels/scratchBlocks.js';
import { generateArduinoCode } from '../../../../src/components/simulator/panels/scratchGenerator.js';
import {
  cppToBlocklyXml,
  isNanoR4BlinkCpp,
  NANO_R4_BLINK_CPP,
} from '../../../../src/features/elabBlocks/codeSync.js';

describe('codeSync — cppToBlocklyXml bidirectional translator', () => {
  it('isNanoR4BlinkCpp recognizes the default Blink template', () => {
    expect(isNanoR4BlinkCpp(NANO_R4_BLINK_CPP)).toBe(true);
  });

  it('parses the default Blink template into Arduino Blockly XML', () => {
    const xml = cppToBlocklyXml(NANO_R4_BLINK_CPP);
    expect(xml).not.toBeNull();
    expect(xml).toContain('<xml');
    expect(xml).toContain('arduino_pin_mode');
    expect(xml).toContain('arduino_digital_write');
    expect(xml).toContain('arduino_delay');
  });

  it('round-trip: cppToBlocklyXml(NANO_R4_BLINK_CPP) round-trips back to equivalent C++', () => {
    const xml = cppToBlocklyXml(NANO_R4_BLINK_CPP);
    expect(xml).not.toBeNull();
    const workspace = new Blockly.Workspace();
    try {
      Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), workspace);
      const generated = generateArduinoCode(workspace);
      expect(generated).toContain('pinMode(13, OUTPUT);');
      expect(generated).toContain('digitalWrite(13, HIGH);');
      expect(generated).toContain('digitalWrite(13, LOW);');
      expect(generated.match(/delay\(1000\);/g)).toHaveLength(2);
    } finally {
      workspace.dispose();
    }
  });

  it('parses modified delay value (delay(500) instead of 1000)', () => {
    const cpp = 'void setup() { pinMode(13, OUTPUT); }\nvoid loop() { digitalWrite(13, HIGH); delay(500); digitalWrite(13, LOW); delay(500); }';
    const xml = cppToBlocklyXml(cpp);
    expect(xml).not.toBeNull();
    expect(xml).toContain('500');
  });

  it('parses non-default pin number (digital pin 7 instead of 13)', () => {
    const cpp = 'void setup() { pinMode(7, OUTPUT); }\nvoid loop() { digitalWrite(7, HIGH); delay(200); }';
    const xml = cppToBlocklyXml(cpp);
    expect(xml).not.toBeNull();
    expect(xml).toContain('<field name="PIN">7</field>');
  });

  it('parses Serial.begin + Serial.println pair', () => {
    const cpp = 'void setup() { Serial.begin(9600); }\nvoid loop() { Serial.println("ok"); }';
    const xml = cppToBlocklyXml(cpp);
    expect(xml).not.toBeNull();
    expect(xml).toContain('arduino_serial_begin');
    expect(xml).toContain('arduino_serial_print');
    expect(xml).toContain('9600');
  });

  it('parses analogWrite with PWM value', () => {
    const cpp = 'void setup() { pinMode(9, OUTPUT); }\nvoid loop() { analogWrite(9, 128); }';
    const xml = cppToBlocklyXml(cpp);
    expect(xml).not.toBeNull();
    expect(xml).toContain('arduino_analog_write');
    expect(xml).toContain('128');
  });

  it('returns null for unparseable input (no setup/loop)', () => {
    expect(cppToBlocklyXml('this is not C++ at all')).toBeNull();
  });

  it('returns null for empty/nullish input', () => {
    expect(cppToBlocklyXml('')).toBeNull();
    expect(cppToBlocklyXml(null)).toBeNull();
    expect(cppToBlocklyXml(undefined)).toBeNull();
  });

  it('gracefully omits unsupported constructs (variables/if) but keeps supported ones', () => {
    const cpp = 'void setup() { pinMode(13, OUTPUT); }\nvoid loop() { int x = 5; if (x > 0) { digitalWrite(13, HIGH); } delay(100); }';
    const xml = cppToBlocklyXml(cpp);
    expect(xml).not.toBeNull();
    expect(xml).toContain('arduino_pin_mode');
    expect(xml).toContain('arduino_delay');
  });

  it('emits arduino_delay with DELAY_TIME value input (not MS field) for scratchBlocks compat', () => {
    const cpp = 'void setup() {}\nvoid loop() { delay(750); }';
    const xml = cppToBlocklyXml(cpp);
    expect(xml).not.toBeNull();
    expect(xml).toContain('<value name="DELAY_TIME">');
    expect(xml).not.toContain('<field name="MS">');
  });

  it('emits arduino_serial_print with CONTENT value input wrapping text shadow', () => {
    const cpp = 'void setup() { Serial.begin(9600); }\nvoid loop() { Serial.println("hello"); }';
    const xml = cppToBlocklyXml(cpp);
    expect(xml).not.toBeNull();
    expect(xml).toContain('<value name="CONTENT">');
    expect(xml).toContain('<shadow type="text">');
    expect(xml).toContain('hello');
    expect(xml).toContain('<field name="NEWLINE">TRUE</field>');
  });

  it('emits arduino_analog_write with VALUE value input (not field)', () => {
    const cpp = 'void setup() {}\nvoid loop() { analogWrite(5, 200); }';
    const xml = cppToBlocklyXml(cpp);
    expect(xml).not.toBeNull();
    expect(xml).toContain('<value name="VALUE">');
  });
});
