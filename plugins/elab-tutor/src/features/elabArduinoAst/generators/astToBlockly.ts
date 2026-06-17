export type IdentifierNode = { type: 'Identifier'; name: string };
export type StringLiteralNode = { type: 'StringLiteral'; value: string };
export type NumberLiteralNode = { type: 'NumberLiteral'; value: number };
export type BooleanLiteralNode = { type: 'BooleanLiteral'; value: boolean };
export type BinaryExpressionNode = {
  type: 'BinaryExpression';
  operator: string;
  left: ElabAstNode;
  right: ElabAstNode;
};
export type CallExpressionNode = {
  type: 'CallExpression';
  callee: IdentifierNode | string;
  arguments: ElabAstNode[];
};
export type ExpressionStatementNode = { type: 'ExpressionStatement'; expression: ElabAstNode };
export type VariableDeclarationNode = {
  type: 'VariableDeclaration';
  kind: string;
  varType?: string;
  id: IdentifierNode;
  init?: ElabAstNode | null;
};
export type AssignmentExpressionNode = {
  type: 'AssignmentExpression';
  operator: string;
  left: IdentifierNode;
  right: ElabAstNode;
};
export type IfStatementNode = {
  type: 'IfStatement';
  test: ElabAstNode;
  consequent: ElabAstNode[];
  alternate: ElabAstNode[] | null;
};
export type ProgramNode = { type: 'Program'; body: ElabAstNode[] };

export type ElabAstNode =
  | IdentifierNode
  | StringLiteralNode
  | NumberLiteralNode
  | BooleanLiteralNode
  | BinaryExpressionNode
  | CallExpressionNode
  | ExpressionStatementNode
  | VariableDeclarationNode
  | AssignmentExpressionNode
  | IfStatementNode
  | ProgramNode;

const COMPARE_TO_BLOCKLY: Record<string, string> = {
  '==': 'EQ',
  '!=': 'NEQ',
  '<': 'LT',
  '<=': 'LTE',
  '>': 'GT',
  '>=': 'GTE',
};

const ARITHMETIC_TO_BLOCKLY: Record<string, string> = {
  '+': 'ADD',
  '-': 'MINUS',
  '*': 'MULTIPLY',
  '/': 'DIVIDE',
  '^': 'POWER',
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function field(name: string, value: string | number | boolean): string {
  return `<field name="${name}">${escapeXml(String(value))}</field>`;
}

function valueInput(name: string, node: ElabAstNode | null | undefined): string {
  return node ? `<value name="${name}">${blockFor(node)}</value>` : '';
}

function statementInput(name: string, statements: ElabAstNode[] | null | undefined): string {
  if (!statements?.length) {
    return '';
  }
  return `<statement name="${name}">${statementChain(statements)}</statement>`;
}

function statementChain(statements: ElabAstNode[]): string {
  const [first, ...rest] = statements;
  if (!first) {
    return '';
  }
  const next = rest.length > 0 ? `<next>${statementChain(rest)}</next>` : '';
  return blockFor(first, next);
}

function calleeName(callee: IdentifierNode | string): string {
  return typeof callee === 'string' ? callee : callee.name;
}

function blockFor(node: ElabAstNode, next = ''): string {
  switch (node.type) {
    case 'Program':
      return `<block type="elab_program">${statementInput('BODY', node.body)}${next}</block>`;
    case 'Identifier':
      return `<block type="elab_variable_reference">${field('name', node.name)}${next}</block>`;
    case 'StringLiteral':
      return `<block type="text">${field('TEXT', node.value)}${next}</block>`;
    case 'NumberLiteral':
      return `<block type="math_number">${field('NUM', node.value)}${next}</block>`;
    case 'BooleanLiteral':
      return `<block type="logic_boolean">${field('BOOL', node.value ? 'TRUE' : 'FALSE')}${next}</block>`;
    case 'BinaryExpression': {
      const compareOp = COMPARE_TO_BLOCKLY[node.operator];
      const arithmeticOp = ARITHMETIC_TO_BLOCKLY[node.operator];
      const type = compareOp ? 'logic_compare' : 'math_arithmetic';
      const op = compareOp ?? arithmeticOp ?? 'ADD';
      return `<block type="${type}">${field('OP', op)}${valueInput('A', node.left)}${valueInput('B', node.right)}${next}</block>`;
    }
    case 'CallExpression':
      return `<block type="elab_call_expression">${field('CALLEE', calleeName(node.callee))}<mutation arguments="${node.arguments.length}"></mutation>${node.arguments
        .map((argument, index) => valueInput(`ARG${index}`, argument))
        .join('')}${next}</block>`;
    case 'ExpressionStatement':
      return `<block type="elab_expression_statement">${valueInput('EXPRESSION', node.expression)}${next}</block>`;
    case 'VariableDeclaration':
      return `<block type="elab_variable_declaration">${field('KIND', node.kind)}${field('VAR_TYPE', node.varType ?? '')}${field('NAME', node.id.name)}${valueInput('INIT', node.init)}${next}</block>`;
    case 'AssignmentExpression':
      return `<block type="elab_assignment_statement">${field('NAME', node.left.name)}${field('OP', node.operator)}${valueInput('VALUE', node.right)}${next}</block>`;
    case 'IfStatement':
      return `<block type="elab_if_statement">${valueInput('TEST', node.test)}${statementInput('THEN', node.consequent)}${statementInput('ELSE', node.alternate)}${next}</block>`;
    default: {
      const exhaustive: never = node;
      throw new Error(`Unsupported AST node: ${JSON.stringify(exhaustive)}`);
    }
  }
}

export function astToBlockly(ast: ElabAstNode): string {
  return `<xml xmlns="https://developers.google.com/blockly/xml">${blockFor(ast)}</xml>`;
}

