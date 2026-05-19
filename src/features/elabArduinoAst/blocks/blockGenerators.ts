import * as Blockly from 'blockly';
import './blockDefinitions';

const ORDER_ATOMIC = 0;
const ORDER_NONE = 99;

type CodeTuple = [string, number];

export const elabArduinoAstGenerator = new Blockly.Generator('ElabArduinoAst');

function valueToCode(block: Blockly.Block, inputName: string): string {
  return elabArduinoAstGenerator.valueToCode(block, inputName, ORDER_NONE) || '';
}

function statementToCode(block: Blockly.Block, inputName: string): string {
  return elabArduinoAstGenerator.statementToCode(block, inputName) || '';
}

function tuple(code: string, order = ORDER_ATOMIC): CodeTuple {
  return [code, order];
}

elabArduinoAstGenerator.scrub_ = function scrub(block: Blockly.Block, code: string, thisOnly?: boolean): string {
  const nextBlock = block.nextConnection?.targetBlock();
  const generated = thisOnly || !nextBlock ? '' : elabArduinoAstGenerator.blockToCode(nextBlock);
  const nextCode = Array.isArray(generated) ? generated[0] : generated;
  return code + nextCode;
};

elabArduinoAstGenerator.forBlock['elab_program'] = (block: Blockly.Block): string => {
  return statementToCode(block, 'BODY');
};

elabArduinoAstGenerator.forBlock['elab_variable_reference'] = (block: Blockly.Block): CodeTuple => {
  return tuple(block.getFieldValue('name') || block.getFieldValue('NAME') || '');
};

elabArduinoAstGenerator.forBlock['math_number'] = (block: Blockly.Block): CodeTuple => {
  return tuple(String(block.getFieldValue('NUM') ?? '0'));
};

elabArduinoAstGenerator.forBlock['logic_boolean'] = (block: Blockly.Block): CodeTuple => {
  return tuple(block.getFieldValue('BOOL') === 'TRUE' ? 'true' : 'false');
};

elabArduinoAstGenerator.forBlock['text'] = (block: Blockly.Block): CodeTuple => {
  const raw = String(block.getFieldValue('TEXT') ?? '');
  return tuple(JSON.stringify(raw));
};

elabArduinoAstGenerator.forBlock['logic_compare'] = (block: Blockly.Block): CodeTuple => {
  const operators: Record<string, string> = {
    EQ: '==',
    NEQ: '!=',
    LT: '<',
    LTE: '<=',
    GT: '>',
    GTE: '>=',
  };
  const left = valueToCode(block, 'A') || '0';
  const right = valueToCode(block, 'B') || '0';
  return tuple(`${left} ${operators[block.getFieldValue('OP')] ?? '=='} ${right}`, ORDER_NONE);
};

elabArduinoAstGenerator.forBlock['math_arithmetic'] = (block: Blockly.Block): CodeTuple => {
  const operators: Record<string, string> = {
    ADD: '+',
    MINUS: '-',
    MULTIPLY: '*',
    DIVIDE: '/',
    POWER: '^',
  };
  const left = valueToCode(block, 'A') || '0';
  const right = valueToCode(block, 'B') || '0';
  return tuple(`${left} ${operators[block.getFieldValue('OP')] ?? '+'} ${right}`, ORDER_NONE);
};

elabArduinoAstGenerator.forBlock['elab_call_expression'] = (block: Blockly.Block): CodeTuple => {
  const callee = block.getFieldValue('CALLEE') || 'fn';
  const args: string[] = [];
  for (let index = 0; block.getInput(`ARG${index}`); index += 1) {
    args.push(valueToCode(block, `ARG${index}`) || 'undefined');
  }
  return tuple(`${callee}(${args.join(', ')})`);
};

elabArduinoAstGenerator.forBlock['elab_expression_statement'] = (block: Blockly.Block): string => {
  return `${valueToCode(block, 'EXPRESSION')};\n`;
};

elabArduinoAstGenerator.forBlock['elab_variable_declaration'] = (block: Blockly.Block): string => {
  const kind = block.getFieldValue('KIND') || 'let';
  const varType = block.getFieldValue('VAR_TYPE') || 'auto';
  const name = block.getFieldValue('NAME') || 'value';
  const init = valueToCode(block, 'INIT');
  return `${kind} ${varType} ${name}${init ? ` = ${init}` : ''};\n`;
};

elabArduinoAstGenerator.forBlock['elab_assignment_statement'] = (block: Blockly.Block): string => {
  const name = block.getFieldValue('NAME') || 'value';
  const operator = block.getFieldValue('OP') || '=';
  const value = valueToCode(block, 'VALUE') || 'undefined';
  return `${name} ${operator} ${value};\n`;
};

elabArduinoAstGenerator.forBlock['elab_if_statement'] = (block: Blockly.Block): string => {
  const test = valueToCode(block, 'TEST') || 'false';
  const thenCode = statementToCode(block, 'THEN');
  const elseCode = statementToCode(block, 'ELSE');
  return `if (${test}) {\n${thenCode}}${elseCode ? ` else {\n${elseCode}}` : ''}\n`;
};
