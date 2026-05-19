import { describe, expect, it } from 'vitest';
import { astToBlockly } from '../../../src/features/elabArduinoAst/generators/astToBlockly';

describe('astToBlockly', () => {
  it('serializes Program as elab_program', () => {
    const xml = astToBlockly({ type: 'Program', body: [] });
    expect(xml).toContain('type="elab_program"');
  });

  it('serializes Identifier as elab_variable_reference', () => {
    const xml = astToBlockly({ type: 'Identifier', name: 'x' });
    expect(xml).toContain('type="elab_variable_reference"');
    expect(xml).toContain('<field name="name">x</field>');
    expect(xml).not.toContain('type="text"');
  });

  it('serializes StringLiteral as text block', () => {
    const xml = astToBlockly({ type: 'StringLiteral', value: 'hello' });
    expect(xml).toContain('type="text"');
    expect(xml).toContain('<field name="TEXT">hello</field>');
  });

  it('escapes XML text values', () => {
    const xml = astToBlockly({ type: 'StringLiteral', value: 'a < b & c' });
    expect(xml).toContain('a &lt; b &amp; c');
  });

  it('serializes NumberLiteral as math_number', () => {
    const xml = astToBlockly({ type: 'NumberLiteral', value: 13 });
    expect(xml).toContain('type="math_number"');
    expect(xml).toContain('<field name="NUM">13</field>');
  });

  it('serializes BooleanLiteral as logic_boolean', () => {
    const xml = astToBlockly({ type: 'BooleanLiteral', value: true });
    expect(xml).toContain('type="logic_boolean"');
    expect(xml).toContain('<field name="BOOL">TRUE</field>');
  });

  it('serializes BinaryExpression with left and right value inputs', () => {
    const xml = astToBlockly({
      type: 'BinaryExpression',
      operator: '>',
      left: { type: 'Identifier', name: 'reading' },
      right: { type: 'NumberLiteral', value: 512 },
    });
    expect(xml).toContain('type="logic_compare"');
    expect(xml).toContain('<field name="OP">GT</field>');
    expect(xml).toContain('<value name="A">');
    expect(xml).toContain('<value name="B">');
  });

  it('serializes CallExpression arguments in order', () => {
    const xml = astToBlockly({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'digitalWrite' },
      arguments: [
        { type: 'NumberLiteral', value: 13 },
        { type: 'Identifier', name: 'HIGH' },
      ],
    });
    expect(xml).toContain('type="elab_call_expression"');
    expect(xml).toContain('<field name="CALLEE">digitalWrite</field>');
    expect(xml).toContain('<value name="ARG0">');
    expect(xml).toContain('<value name="ARG1">');
  });

  it('serializes ExpressionStatement as statement block', () => {
    const xml = astToBlockly({
      type: 'ExpressionStatement',
      expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'loop' }, arguments: [] },
    });
    expect(xml).toContain('type="elab_expression_statement"');
    expect(xml).toContain('<value name="EXPRESSION">');
  });

  it('serializes VariableDeclaration with initializer', () => {
    const xml = astToBlockly({
      type: 'VariableDeclaration',
      kind: 'let',
      varType: 'int',
      id: { type: 'Identifier', name: 'buttonState' },
      init: { type: 'NumberLiteral', value: 0 },
    });
    expect(xml).toContain('type="elab_variable_declaration"');
    expect(xml).toContain('<field name="NAME">buttonState</field>');
    expect(xml).toContain('<value name="INIT">');
  });

  it('serializes AssignmentExpression as assignment statement', () => {
    const xml = astToBlockly({
      type: 'AssignmentExpression',
      operator: '=',
      left: { type: 'Identifier', name: 'reading' },
      right: { type: 'CallExpression', callee: { type: 'Identifier', name: 'analogRead' }, arguments: [{ type: 'Identifier', name: 'A0' }] },
    });
    expect(xml).toContain('type="elab_assignment_statement"');
    expect(xml).toContain('<field name="NAME">reading</field>');
    expect(xml).toContain('<value name="VALUE">');
  });

  it('serializes IfStatement with THEN and ELSE statement inputs', () => {
    const xml = astToBlockly({
      type: 'IfStatement',
      test: { type: 'Identifier', name: 'pressed' },
      consequent: [{ type: 'ExpressionStatement', expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'on' }, arguments: [] } }],
      alternate: [{ type: 'ExpressionStatement', expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'off' }, arguments: [] } }],
    });
    expect(xml).toContain('type="elab_if_statement"');
    expect(xml).toContain('<statement name="THEN">');
    expect(xml).toContain('<statement name="ELSE">');
  });

  it('serializes statement chains with next blocks', () => {
    const xml = astToBlockly({
      type: 'Program',
      body: [
        { type: 'ExpressionStatement', expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'first' }, arguments: [] } },
        { type: 'ExpressionStatement', expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'second' }, arguments: [] } },
      ],
    });
    expect(xml).toContain('<next>');
    expect(xml.indexOf('first')).toBeLessThan(xml.indexOf('second'));
  });
});
