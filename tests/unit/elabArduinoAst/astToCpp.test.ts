import { describe, expect, it } from 'vitest';

import { astToCpp } from '../../../src/features/elabArduinoAst/generators/astToCpp';
import type { ArduinoProgram } from '../../../src/features/elabArduinoAst/ast/nodes';

const render = (partial: Partial<ArduinoProgram>) =>
  astToCpp({ type: 'Program', globals: [], setup: [], loop: [], ...partial });

describe('astToCpp', () => {
  it('renders an empty program', () => {
    expect(render({})).toContain('void setup()');
    expect(render({})).toContain('void loop()');
  });

  it('renders pinMode nodes', () => {
    expect(render({ setup: [{ type: 'PinMode', pin: '13', mode: 'OUTPUT' }] })).toContain(
      'pinMode(13, OUTPUT);',
    );
  });

  it('renders digitalWrite nodes', () => {
    expect(render({ loop: [{ type: 'DigitalWrite', pin: '13', value: 'HIGH' }] })).toContain(
      'digitalWrite(13, HIGH);',
    );
  });

  it('renders analogWrite nodes', () => {
    expect(render({ loop: [{ type: 'AnalogWrite', pin: '9', value: '128' }] })).toContain(
      'analogWrite(9, 128);',
    );
  });

  it('renders delay nodes', () => {
    expect(render({ loop: [{ type: 'Delay', ms: '1000' }] })).toContain('delay(1000);');
  });

  it('renders Serial.begin nodes', () => {
    expect(render({ setup: [{ type: 'SerialBegin', baud: '9600' }] })).toContain(
      'Serial.begin(9600);',
    );
  });

  it('renders Serial.print nodes', () => {
    expect(render({ loop: [{ type: 'SerialPrint', value: 'state', newline: false }] })).toContain(
      'Serial.print(state);',
    );
  });

  it('renders Serial.println nodes', () => {
    expect(render({ loop: [{ type: 'SerialPrint', value: '"ok"', newline: true }] })).toContain(
      'Serial.println("ok");',
    );
  });

  it('renders digitalRead assignment nodes', () => {
    expect(render({ loop: [{ type: 'DigitalRead', pin: '2', storeIn: 'buttonState' }] })).toContain(
      'buttonState = digitalRead(2);',
    );
  });

  it('renders analogRead assignment nodes', () => {
    expect(render({ loop: [{ type: 'AnalogRead', pin: 'A0', storeIn: 'v' }] })).toContain(
      'v = analogRead(A0);',
    );
  });

  it('renders variables with raw init', () => {
    expect(
      render({
        loop: [{ type: 'Variable', varType: 'long', name: 'elapsed', init: { type: 'RawExpression', raw: 'millis()' } }],
      }),
    ).toContain('long elapsed = millis();');
  });

  it('renders variables initialized from digitalRead with type', () => {
    expect(
      render({
        loop: [
          {
            type: 'Variable',
            varType: 'int',
            name: 'buttonState',
            init: { type: 'DigitalRead', pin: '2', storeIn: 'buttonState' },
          },
        ],
      }),
    ).toContain('int buttonState = digitalRead(2);');
  });

  it('renders if nodes with raw condition strings', () => {
    const cpp = render({
      loop: [
        {
          type: 'If',
          cond: 'digitalRead(2) == HIGH',
          then: [{ type: 'DigitalWrite', pin: '13', value: 'HIGH' }],
        },
      ],
    });

    expect(cpp).toContain('if (digitalRead(2) == HIGH) {');
    expect(cpp).toContain('digitalWrite(13, HIGH);');
  });

  it('preserves unsupported globals verbatim', () => {
    expect(
      render({ globals: [{ type: 'UnsupportedCppBlock', raw: '#include <Servo.h>' }] }),
    ).toMatch(/^#include <Servo\.h>/);
  });

  it('preserves unsupported body blocks verbatim', () => {
    expect(render({ loop: [{ type: 'UnsupportedCppBlock', raw: 'tone(8, 440);' }] })).toContain(
      'tone(8, 440);',
    );
  });

  it('renders variables without init', () => {
    expect(render({ globals: [{ type: 'Variable', varType: 'int', name: 'counter' }] })).toContain(
      'int counter;',
    );
  });
});
