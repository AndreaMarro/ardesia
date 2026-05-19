import * as Blockly from 'blockly';
import '../blocks/blockDefinitions';
import type { ElabAstNode, IdentifierNode } from './astToBlockly';

const BLOCKLY_TO_COMPARE: Record<string, string> = {
  EQ: '==',
  NEQ: '!=',
  LT: '<',
  LTE: '<=',
  GT: '>',
  GTE: '>=',
};

const BLOCKLY_TO_ARITHMETIC: Record<string, string> = {
  ADD: '+',
  MINUS: '-',
  MULTIPLY: '*',
  DIVIDE: '/',
  POWER: '^',
};

function identifier(name: string): IdentifierNode {
  return { type: 'Identifier', name };
}

function valueFromBlock(block: Blockly.Block, inputName: string): ElabAstNode | null {
  const inputBlock = block.getInputTargetBlock(inputName);
  return inputBlock ? astFromBlock(inputBlock) : null;
}

function statementFromBlock(block: Blockly.Block, inputName: string): ElabAstNode[] {
  const firstBlock = block.getInputTargetBlock(inputName);
  if (!firstBlock) {
    return [];
  }

  // THEN/ELSE are Blockly statement input chains: parse the target block,
  // then traverse following statements through getNextBlock().
  const statements: ElabAstNode[] = [];
  let current: Blockly.Block | null = firstBlock;
  while (current) {
    const node = astFromBlock(current);
    if (node) {
      statements.push(node);
    }
    current = current.getNextBlock();
  }
  return statements;
}

function astFromBlock(block: Blockly.Block): ElabAstNode | null {
  switch (block.type) {
    case 'elab_program':
      return { type: 'Program', body: statementFromBlock(block, 'BODY') };
    case 'elab_variable_reference':
      return identifier(block.getFieldValue('name') || block.getFieldValue('NAME') || '');
    case 'text':
      return { type: 'StringLiteral', value: block.getFieldValue('TEXT') ?? '' };
    case 'math_number':
      return { type: 'NumberLiteral', value: Number(block.getFieldValue('NUM') ?? 0) };
    case 'logic_boolean':
      return { type: 'BooleanLiteral', value: block.getFieldValue('BOOL') === 'TRUE' };
    case 'logic_compare':
      return {
        type: 'BinaryExpression',
        operator: BLOCKLY_TO_COMPARE[block.getFieldValue('OP')] ?? '==',
        left: valueFromBlock(block, 'A') ?? { type: 'NumberLiteral', value: 0 },
        right: valueFromBlock(block, 'B') ?? { type: 'NumberLiteral', value: 0 },
      };
    case 'math_arithmetic':
      return {
        type: 'BinaryExpression',
        operator: BLOCKLY_TO_ARITHMETIC[block.getFieldValue('OP')] ?? '+',
        left: valueFromBlock(block, 'A') ?? { type: 'NumberLiteral', value: 0 },
        right: valueFromBlock(block, 'B') ?? { type: 'NumberLiteral', value: 0 },
      };
    case 'elab_call_expression': {
      const args: ElabAstNode[] = [];
      for (let index = 0; block.getInput(`ARG${index}`); index += 1) {
        const arg = valueFromBlock(block, `ARG${index}`);
        if (arg) {
          args.push(arg);
        }
      }
      return {
        type: 'CallExpression',
        callee: identifier(block.getFieldValue('CALLEE') || 'fn'),
        arguments: args,
      };
    }
    case 'elab_expression_statement':
      return {
        type: 'ExpressionStatement',
        expression: valueFromBlock(block, 'EXPRESSION') ?? { type: 'CallExpression', callee: identifier('noop'), arguments: [] },
      };
    case 'elab_variable_declaration':
      return {
        type: 'VariableDeclaration',
        kind: block.getFieldValue('KIND') || 'let',
        varType: block.getFieldValue('VAR_TYPE') || '',
        id: identifier(block.getFieldValue('NAME') || 'value'),
        init: valueFromBlock(block, 'INIT'),
      };
    case 'elab_assignment_statement':
      return {
        type: 'AssignmentExpression',
        operator: block.getFieldValue('OP') || '=',
        left: identifier(block.getFieldValue('NAME') || 'value'),
        right: valueFromBlock(block, 'VALUE') ?? { type: 'Identifier', name: 'undefined' },
      };
    case 'elab_if_statement': {
      const alternate = statementFromBlock(block, 'ELSE');
      return {
        type: 'IfStatement',
        test: valueFromBlock(block, 'TEST') ?? { type: 'BooleanLiteral', value: false },
        consequent: statementFromBlock(block, 'THEN'),
        alternate: alternate.length > 0 ? alternate : null,
      };
    }
    default:
      return null;
  }
}

function astFromWorkspace(workspace: Blockly.Workspace): ElabAstNode | null {
  const [topBlock] = workspace.getTopBlocks(false);
  return topBlock ? astFromBlock(topBlock) : null;
}

export function blocklyToAst(source: string | Blockly.Workspace): ElabAstNode | null {
  if (typeof source !== 'string') {
    return astFromWorkspace(source);
  }

  const workspace = new Blockly.Workspace();
  try {
    const dom = Blockly.utils.xml.textToDom(source);
    Blockly.Xml.domToWorkspace(dom, workspace);
    return astFromWorkspace(workspace);
  } finally {
    workspace.dispose();
  }
}

