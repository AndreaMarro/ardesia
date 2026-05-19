import { describe, expect, it } from 'vitest';
import { blocklyToAst } from '../../../src/features/elabArduinoAst/generators/blocklyToAst';

const xml = (block: string) => `<xml xmlns="https://developers.google.com/blockly/xml">${block}</xml>`;

describe('blocklyToAst', () => {
  it('parses elab_program', () => {
    expect(blocklyToAst(xml('<block type="elab_program"></block>'))).toEqual({ type: 'Program', body: [] });
  });

  it('parses elab_variable_reference as Identifier', () => {
    expect(blocklyToAst(xml('<block type="elab_variable_reference"><field name="name">x</field></block>'))).toEqual({
      type: 'Identifier',
      name: 'x',
    });
  });

  it('parses text as StringLiteral', () => {
    expect(blocklyToAst(xml('<block type="text"><field name="TEXT">x</field></block>'))).toEqual({ type: 'StringLiteral', value: 'x' });
  });

  it('parses math_number as NumberLiteral', () => {
    expect(blocklyToAst(xml('<block type="math_number"><field name="NUM">42</field></block>'))).toEqual({ type: 'NumberLiteral', value: 42 });
  });

  it('parses logic_boolean as BooleanLiteral', () => {
    expect(blocklyToAst(xml('<block type="logic_boolean"><field name="BOOL">FALSE</field></block>'))).toEqual({ type: 'BooleanLiteral', value: false });
  });

  it('parses logic_compare as BinaryExpression', () => {
    const ast = blocklyToAst(xml(`
      <block type="logic_compare">
        <field name="OP">LTE</field>
        <value name="A"><block type="elab_variable_reference"><field name="name">reading</field></block></value>
        <value name="B"><block type="math_number"><field name="NUM">200</field></block></value>
      </block>
    `));
    expect(ast).toEqual({
      type: 'BinaryExpression',
      operator: '<=',
      left: { type: 'Identifier', name: 'reading' },
      right: { type: 'NumberLiteral', value: 200 },
    });
  });

  it('parses elab_call_expression with ordered arguments', () => {
    const ast = blocklyToAst(xml(`
      <block type="elab_call_expression">
        <field name="CALLEE">digitalWrite</field>
        <mutation arguments="2"></mutation>
        <value name="ARG0"><block type="math_number"><field name="NUM">13</field></block></value>
        <value name="ARG1"><block type="elab_variable_reference"><field name="name">HIGH</field></block></value>
      </block>
    `));
    expect(ast).toEqual({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'digitalWrite' },
      arguments: [{ type: 'NumberLiteral', value: 13 }, { type: 'Identifier', name: 'HIGH' }],
    });
  });

  it('parses elab_expression_statement', () => {
    const ast = blocklyToAst(xml(`
      <block type="elab_expression_statement">
        <value name="EXPRESSION"><block type="elab_call_expression"><field name="CALLEE">tick</field><mutation arguments="0"></mutation></block></value>
      </block>
    `));
    expect(ast).toEqual({ type: 'ExpressionStatement', expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'tick' }, arguments: [] } });
  });

  it('parses elab_variable_declaration with initializer', () => {
    const ast = blocklyToAst(xml(`
      <block type="elab_variable_declaration">
        <field name="KIND">let</field><field name="VAR_TYPE">int</field><field name="NAME">count</field>
        <value name="INIT"><block type="math_number"><field name="NUM">1</field></block></value>
      </block>
    `));
    expect(ast).toEqual({ type: 'VariableDeclaration', kind: 'let', varType: 'int', id: { type: 'Identifier', name: 'count' }, init: { type: 'NumberLiteral', value: 1 } });
  });

  it('parses elab_assignment_statement', () => {
    const ast = blocklyToAst(xml(`
      <block type="elab_assignment_statement">
        <field name="NAME">count</field><field name="OP">=</field>
        <value name="VALUE"><block type="math_number"><field name="NUM">2</field></block></value>
      </block>
    `));
    expect(ast).toEqual({ type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'count' }, right: { type: 'NumberLiteral', value: 2 } });
  });

  it('parses statement chains via next blocks', () => {
    const ast = blocklyToAst(xml(`
      <block type="elab_program">
        <statement name="BODY">
          <block type="elab_expression_statement">
            <value name="EXPRESSION"><block type="elab_call_expression"><field name="CALLEE">first</field><mutation arguments="0"></mutation></block></value>
            <next><block type="elab_expression_statement"><value name="EXPRESSION"><block type="elab_call_expression"><field name="CALLEE">second</field><mutation arguments="0"></mutation></block></value></block></next>
          </block>
        </statement>
      </block>
    `));
    expect(ast).toEqual({
      type: 'Program',
      body: [
        { type: 'ExpressionStatement', expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'first' }, arguments: [] } },
        { type: 'ExpressionStatement', expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'second' }, arguments: [] } },
      ],
    });
  });

  it('parses if-else THEN and ELSE through getInputTargetBlock chains', () => {
    const ast = blocklyToAst(xml(`
      <block type="elab_if_statement">
        <value name="TEST"><block type="elab_variable_reference"><field name="name">pressed</field></block></value>
        <statement name="THEN">
          <block type="elab_expression_statement">
            <value name="EXPRESSION"><block type="elab_call_expression"><field name="CALLEE">on</field><mutation arguments="0"></mutation></block></value>
            <next><block type="elab_expression_statement"><value name="EXPRESSION"><block type="elab_call_expression"><field name="CALLEE">blink</field><mutation arguments="0"></mutation></block></value></block></next>
          </block>
        </statement>
        <statement name="ELSE">
          <block type="elab_if_statement">
            <value name="TEST"><block type="elab_variable_reference"><field name="name">fallback</field></block></value>
            <statement name="THEN"><block type="elab_expression_statement"><value name="EXPRESSION"><block type="elab_call_expression"><field name="CALLEE">off</field><mutation arguments="0"></mutation></block></value></block></statement>
          </block>
        </statement>
      </block>
    `));
    expect(ast).toEqual({
      type: 'IfStatement',
      test: { type: 'Identifier', name: 'pressed' },
      consequent: [
        { type: 'ExpressionStatement', expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'on' }, arguments: [] } },
        { type: 'ExpressionStatement', expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'blink' }, arguments: [] } },
      ],
      alternate: [{
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'fallback' },
        consequent: [{ type: 'ExpressionStatement', expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'off' }, arguments: [] } }],
        alternate: null,
      }],
    });
  });

  it('returns null for empty XML', () => {
    expect(blocklyToAst(xml(''))).toBeNull();
  });
});
