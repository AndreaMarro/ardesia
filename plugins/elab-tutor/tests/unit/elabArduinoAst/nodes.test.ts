import { describe, expect, it } from 'vitest';

import {
  ArduinoAstNodeSchema,
  ArduinoProgramSchema,
  DigitalReadNodeSchema,
  IfNodeSchema,
  UnsupportedCppBlockNodeSchema,
  VariableNodeSchema,
} from '../../../src/features/elabArduinoAst/ast/nodes';

describe('elabArduinoAst nodes', () => {
  it('validates a complete empty program', () => {
    const program = ArduinoProgramSchema.parse({
      type: 'Program',
      globals: [],
      setup: [],
      loop: [],
    });

    expect(program.type).toBe('Program');
  });

  it('validates pinMode nodes', () => {
    expect(
      ArduinoAstNodeSchema.parse({ type: 'PinMode', pin: '13', mode: 'OUTPUT' }),
    ).toEqual({ type: 'PinMode', pin: '13', mode: 'OUTPUT' });
  });

  it('validates digitalWrite nodes', () => {
    expect(
      ArduinoAstNodeSchema.parse({ type: 'DigitalWrite', pin: '13', value: 'HIGH' }),
    ).toEqual({ type: 'DigitalWrite', pin: '13', value: 'HIGH' });
  });

  it('validates digitalRead nodes with storeIn', () => {
    const node = DigitalReadNodeSchema.parse({
      type: 'DigitalRead',
      pin: '2',
      storeIn: 'buttonState',
    });

    expect(node.storeIn).toBe('buttonState');
  });

  it('validates analogRead nodes with storeIn', () => {
    expect(
      ArduinoAstNodeSchema.parse({ type: 'AnalogRead', pin: 'A0', storeIn: 'sensorValue' }),
    ).toEqual({ type: 'AnalogRead', pin: 'A0', storeIn: 'sensorValue' });
  });

  it('validates delay nodes', () => {
    expect(ArduinoAstNodeSchema.parse({ type: 'Delay', ms: '1000' })).toEqual({
      type: 'Delay',
      ms: '1000',
    });
  });

  it('validates variable nodes preserving type and raw init', () => {
    const node = VariableNodeSchema.parse({
      type: 'Variable',
      varType: 'const int',
      name: 'LED_PIN',
      init: { type: 'RawExpression', raw: '13' },
    });

    expect(node.varType).toBe('const int');
    expect(node.init?.raw).toBe('13');
  });

  it('validates variable nodes initialized from digitalRead', () => {
    const node = VariableNodeSchema.parse({
      type: 'Variable',
      varType: 'int',
      name: 'buttonState',
      init: { type: 'DigitalRead', pin: '2', storeIn: 'buttonState' },
    });

    expect(node.init?.type).toBe('DigitalRead');
  });

  it('validates if nodes with opaque raw conditions', () => {
    const node = IfNodeSchema.parse({
      type: 'If',
      cond: 'digitalRead(2) == HIGH',
      then: [{ type: 'DigitalWrite', pin: '13', value: 'HIGH' }],
    });

    expect(node.cond).toBe('digitalRead(2) == HIGH');
    expect(node.then).toHaveLength(1);
  });

  it('validates unsupported C++ blocks verbatim', () => {
    const node = UnsupportedCppBlockNodeSchema.parse({
      type: 'UnsupportedCppBlock',
      raw: '#include <Servo.h>',
    });

    expect(node.raw).toBe('#include <Servo.h>');
  });

  it('rejects unknown node types', () => {
    expect(() => ArduinoAstNodeSchema.parse({ type: 'Nope' })).toThrow();
  });
});
