import { describe, expect, it } from 'vitest';

import { astToCpp } from '../../../src/features/elabArduinoAst/generators/astToCpp';
import { cppToAst } from '../../../src/features/elabArduinoAst/parsers/cppToAst';

const roundtrip = (cpp: string) => astToCpp(cppToAst(cpp));

describe('elabArduinoAst roundtrip', () => {
  it('preserves complex if condition content and parsed body', () => {
    const cpp = 'void loop() { if (digitalRead(2) == HIGH) { digitalWrite(13, HIGH); } }';

    const out = roundtrip(cpp);

    expect(out).toContain('if (digitalRead(2) == HIGH)');
    expect(out).toContain('digitalWrite(13, HIGH);');
  });

  it('preserves typed int digitalRead variables', () => {
    const out = roundtrip('void loop() { int buttonState = digitalRead(2); }');

    expect(out).toContain('int buttonState = digitalRead(2);');
  });

  it('preserves typed int analogRead variables', () => {
    const out = roundtrip('void loop() { int value = analogRead(A0); }');

    expect(out).toContain('int value = analogRead(A0);');
  });

  it('preserves typed bool digitalRead variables', () => {
    const out = roundtrip('void loop() { bool b = digitalRead(2); }');

    expect(out).toContain('bool b = digitalRead(2);');
  });

  it('preserves include lines verbatim', () => {
    const out = roundtrip('#include <Servo.h>\nvoid setup() {}');

    expect(out).toContain('#include <Servo.h>');
  });

  it('preserves const globals verbatim', () => {
    const out = roundtrip('const int LED_PIN = 13;\nvoid setup() {}');

    expect(out).toContain('const int LED_PIN = 13;');
  });

  it('preserves helper functions verbatim', () => {
    const out = roundtrip('void blink() { digitalWrite(13, HIGH); }\nvoid loop() {}');

    expect(out).toContain('void blink() { digitalWrite(13, HIGH); }');
  });

  it('roundtrips pinMode', () => {
    expect(roundtrip('void setup() { pinMode(13, OUTPUT); }')).toContain('pinMode(13, OUTPUT);');
  });

  it('roundtrips digitalWrite', () => {
    expect(roundtrip('void loop() { digitalWrite(13, LOW); }')).toContain(
      'digitalWrite(13, LOW);',
    );
  });

  it('roundtrips analogWrite', () => {
    expect(roundtrip('void loop() { analogWrite(9, 200); }')).toContain('analogWrite(9, 200);');
  });

  it('roundtrips delay', () => {
    expect(roundtrip('void loop() { delay(500); }')).toContain('delay(500);');
  });

  it('roundtrips Serial.begin', () => {
    expect(roundtrip('void setup() { Serial.begin(115200); }')).toContain(
      'Serial.begin(115200);',
    );
  });

  it('roundtrips Serial.println', () => {
    expect(roundtrip('void loop() { Serial.println("hello"); }')).toContain(
      'Serial.println("hello");',
    );
  });

  it('roundtrips unsupported loop statements', () => {
    expect(roundtrip('void loop() { tone(8, 440); }')).toContain('tone(8, 440);');
  });

  it('roundtrips unsupported statements inside if bodies', () => {
    const out = roundtrip('void loop() { if (millis() > 5) { tone(8, 440); } }');

    expect(out).toContain('if (millis() > 5)');
    expect(out).toContain('tone(8, 440);');
  });

  it('roundtrips global arrays verbatim', () => {
    expect(roundtrip('int pins[] = {2, 3, 4};\nvoid loop() {}')).toContain(
      'int pins[] = {2, 3, 4};',
    );
  });
});
