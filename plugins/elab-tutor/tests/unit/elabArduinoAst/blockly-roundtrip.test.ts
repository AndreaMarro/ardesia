import { describe, expect, it } from 'vitest';
import { astToBlockly } from '../../../src/features/elabArduinoAst/generators/astToBlockly';
import { blocklyToAst } from '../../../src/features/elabArduinoAst/generators/blocklyToAst';

const roundtrip = (ast: any) => blocklyToAst(astToBlockly(ast));
const call = (callee: string, args: any[] = []) => ({ type: 'CallExpression', callee: { type: 'Identifier', name: callee }, arguments: args });
const stmt = (callee: string, args: any[] = []) => ({ type: 'ExpressionStatement', expression: call(callee, args) });

describe('Blockly XML roundtrip', () => {
  it('preserves Identifier node type', () => {
    expect(roundtrip({ type: 'Identifier', name: 'x' })).toEqual({ type: 'Identifier', name: 'x' });
  });

  it('preserves StringLiteral as distinct from Identifier', () => {
    expect(roundtrip({ type: 'StringLiteral', value: 'x' })).toEqual({ type: 'StringLiteral', value: 'x' });
  });

  it('preserves nested if-else statement chains', () => {
    const ast = {
      type: 'IfStatement',
      test: { type: 'Identifier', name: 'pressed' },
      consequent: [stmt('digitalWrite', [{ type: 'NumberLiteral', value: 13 }, { type: 'Identifier', name: 'HIGH' }]), stmt('delay', [{ type: 'NumberLiteral', value: 100 }])],
      alternate: [{
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'fallback' },
        consequent: [stmt('digitalWrite', [{ type: 'NumberLiteral', value: 13 }, { type: 'Identifier', name: 'LOW' }])],
        alternate: [stmt('delay', [{ type: 'NumberLiteral', value: 25 }])],
      }],
    };
    expect(roundtrip(ast)).toEqual(ast);
  });

  it('preserves complex Blink program', () => {
    const ast = {
      type: 'Program',
      body: [
        stmt('pinMode', [{ type: 'NumberLiteral', value: 13 }, { type: 'Identifier', name: 'OUTPUT' }]),
        stmt('digitalWrite', [{ type: 'NumberLiteral', value: 13 }, { type: 'Identifier', name: 'HIGH' }]),
        stmt('delay', [{ type: 'NumberLiteral', value: 1000 }]),
        stmt('digitalWrite', [{ type: 'NumberLiteral', value: 13 }, { type: 'Identifier', name: 'LOW' }]),
        stmt('delay', [{ type: 'NumberLiteral', value: 1000 }]),
      ],
    };
    expect(roundtrip(ast)).toEqual(ast);
  });

  it('preserves Button program with variable and if-else', () => {
    const ast = {
      type: 'Program',
      body: [
        { type: 'VariableDeclaration', kind: 'let', varType: 'int', id: { type: 'Identifier', name: 'buttonState' }, init: { type: 'NumberLiteral', value: 0 } },
        { type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'buttonState' }, right: call('digitalRead', [{ type: 'NumberLiteral', value: 2 }]) },
        {
          type: 'IfStatement',
          test: { type: 'BinaryExpression', operator: '==', left: { type: 'Identifier', name: 'buttonState' }, right: { type: 'Identifier', name: 'HIGH' } },
          consequent: [stmt('digitalWrite', [{ type: 'NumberLiteral', value: 13 }, { type: 'Identifier', name: 'HIGH' }])],
          alternate: [stmt('digitalWrite', [{ type: 'NumberLiteral', value: 13 }, { type: 'Identifier', name: 'LOW' }])],
        },
      ],
    };
    expect(roundtrip(ast)).toEqual(ast);
  });

  it('preserves Analog program with analogRead comparison', () => {
    const ast = {
      type: 'Program',
      body: [
        { type: 'VariableDeclaration', kind: 'let', varType: 'int', id: { type: 'Identifier', name: 'reading' }, init: { type: 'NumberLiteral', value: 0 } },
        { type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'reading' }, right: call('analogRead', [{ type: 'Identifier', name: 'A0' }]) },
        {
          type: 'IfStatement',
          test: { type: 'BinaryExpression', operator: '>', left: { type: 'Identifier', name: 'reading' }, right: { type: 'NumberLiteral', value: 512 } },
          consequent: [stmt('analogWrite', [{ type: 'NumberLiteral', value: 9 }, { type: 'NumberLiteral', value: 255 }])],
          alternate: [stmt('analogWrite', [{ type: 'NumberLiteral', value: 9 }, { type: 'NumberLiteral', value: 0 }])],
        },
      ],
    };
    expect(roundtrip(ast)).toEqual(ast);
  });

  it('preserves boolean literals', () => {
    expect(roundtrip({ type: 'BooleanLiteral', value: false })).toEqual({ type: 'BooleanLiteral', value: false });
  });

  it('preserves arithmetic BinaryExpression', () => {
    const ast = { type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'NumberLiteral', value: 1 } };
    expect(roundtrip(ast)).toEqual(ast);
  });

  it('preserves call expressions without arguments', () => {
    const ast = call('millis');
    expect(roundtrip(ast)).toEqual(ast);
  });

  it('preserves XML special characters in strings', () => {
    const ast = { type: 'StringLiteral', value: 'a < b & "quoted"' };
    expect(roundtrip(ast)).toEqual(ast);
  });
});
