import { describe, expect, it } from 'vitest';

import { cppToAst } from '../../../src/features/elabArduinoAst/parsers/cppToAst';

describe('cppToAst', () => {
  it('parses setup and loop bodies', () => {
    const ast = cppToAst('void setup() { pinMode(13, OUTPUT); }\nvoid loop() { delay(1000); }');

    expect(ast.setup).toEqual([{ type: 'PinMode', pin: '13', mode: 'OUTPUT' }]);
    expect(ast.loop).toEqual([{ type: 'Delay', ms: '1000' }]);
  });

  it('parses digitalWrite statements', () => {
    const ast = cppToAst('void loop() { digitalWrite(13, HIGH); }');

    expect(ast.loop[0]).toEqual({ type: 'DigitalWrite', pin: '13', value: 'HIGH' });
  });

  it('parses analogWrite statements', () => {
    const ast = cppToAst('void loop() { analogWrite(9, 128); }');

    expect(ast.loop[0]).toEqual({ type: 'AnalogWrite', pin: '9', value: '128' });
  });

  it('parses delay statements', () => {
    const ast = cppToAst('void loop() { delay(250); }');

    expect(ast.loop[0]).toEqual({ type: 'Delay', ms: '250' });
  });

  it('parses Serial.begin statements', () => {
    const ast = cppToAst('void setup() { Serial.begin(9600); }');

    expect(ast.setup[0]).toEqual({ type: 'SerialBegin', baud: '9600' });
  });

  it('parses Serial.print statements', () => {
    const ast = cppToAst('void loop() { Serial.print(buttonState); }');

    expect(ast.loop[0]).toEqual({ type: 'SerialPrint', value: 'buttonState', newline: false });
  });

  it('parses Serial.println statements', () => {
    const ast = cppToAst('void loop() { Serial.println("ok"); }');

    expect(ast.loop[0]).toEqual({ type: 'SerialPrint', value: '"ok"', newline: true });
  });

  it('parses digitalRead assignment statements', () => {
    const ast = cppToAst('void loop() { buttonState = digitalRead(2); }');

    expect(ast.loop[0]).toEqual({ type: 'DigitalRead', pin: '2', storeIn: 'buttonState' });
  });

  it('parses analogRead assignment statements', () => {
    const ast = cppToAst('void loop() { sensorValue = analogRead(A0); }');

    expect(ast.loop[0]).toEqual({ type: 'AnalogRead', pin: 'A0', storeIn: 'sensorValue' });
  });

  it('parses typed variable declarations with raw init', () => {
    const ast = cppToAst('void loop() { long elapsed = millis(); }');

    expect(ast.loop[0]).toEqual({
      type: 'Variable',
      varType: 'long',
      name: 'elapsed',
      init: { type: 'RawExpression', raw: 'millis()' },
    });
  });

  it('parses bool variables initialized from digitalRead preserving type', () => {
    const ast = cppToAst('void loop() { bool pressed = digitalRead(2); }');

    expect(ast.loop[0]).toEqual({
      type: 'Variable',
      varType: 'bool',
      name: 'pressed',
      init: { type: 'DigitalRead', pin: '2', storeIn: 'pressed' },
    });
  });

  it('parses int variables initialized from analogRead preserving type', () => {
    const ast = cppToAst('void loop() { int v = analogRead(A0); }');

    expect(ast.loop[0]).toEqual({
      type: 'Variable',
      varType: 'int',
      name: 'v',
      init: { type: 'AnalogRead', pin: 'A0', storeIn: 'v' },
    });
  });

  it('keeps unsupported statements inside loop', () => {
    const ast = cppToAst('void loop() { tone(8, 440); digitalWrite(13, LOW); }');

    expect(ast.loop).toEqual([
      { type: 'UnsupportedCppBlock', raw: 'tone(8, 440);' },
      { type: 'DigitalWrite', pin: '13', value: 'LOW' },
    ]);
  });

  it('parses if bodies even when condition is a raw expression', () => {
    const ast = cppToAst('void loop() { if (digitalRead(2) == HIGH) { digitalWrite(13, HIGH); } }');

    expect(ast.loop[0]).toEqual({
      type: 'If',
      cond: 'digitalRead(2) == HIGH',
      then: [{ type: 'DigitalWrite', pin: '13', value: 'HIGH' }],
    });
  });

  it('keeps unsupported statements inside if bodies', () => {
    const ast = cppToAst('void loop() { if (millis() > 1000) { tone(8, 440); delay(10); } }');

    expect(ast.loop[0]).toEqual({
      type: 'If',
      cond: 'millis() > 1000',
      then: [
        { type: 'UnsupportedCppBlock', raw: 'tone(8, 440);' },
        { type: 'Delay', ms: '10' },
      ],
    });
  });

  it('preserves include lines as unsupported globals', () => {
    const ast = cppToAst('#include <Servo.h>\nvoid setup() {}');

    expect(ast.globals[0]).toEqual({ type: 'UnsupportedCppBlock', raw: '#include <Servo.h>' });
  });

  it('preserves const globals as unsupported when not parsed as plain variables', () => {
    const ast = cppToAst('const int LED_PIN = 13;\nvoid setup() {}');

    expect(ast.globals[0]).toEqual({
      type: 'UnsupportedCppBlock',
      raw: 'const int LED_PIN = 13;',
    });
  });

  it('preserves helper functions as unsupported globals', () => {
    const ast = cppToAst('void blink() { digitalWrite(13, HIGH); }\nvoid loop() {}');

    expect(ast.globals[0]).toEqual({
      type: 'UnsupportedCppBlock',
      raw: 'void blink() { digitalWrite(13, HIGH); }',
    });
  });

  it('parses plain global variables', () => {
    const ast = cppToAst('int counter = 0;\nvoid loop() {}');

    expect(ast.globals[0]).toEqual({
      type: 'Variable',
      varType: 'int',
      name: 'counter',
      init: { type: 'RawExpression', raw: '0' },
    });
  });

  it('preserves global arrays as unsupported', () => {
    const ast = cppToAst('int pins[] = {2, 3, 4};\nvoid loop() {}');

    expect(ast.globals[0]).toEqual({
      type: 'UnsupportedCppBlock',
      raw: 'int pins[] = {2, 3, 4};',
    });
  });
});
