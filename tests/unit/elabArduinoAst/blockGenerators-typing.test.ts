import { describe, expect, it } from 'vitest';
import * as Blockly from 'blockly';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { elabArduinoAstGenerator } from '../../../src/features/elabArduinoAst/blocks/blockGenerators';
import '../../../src/features/elabArduinoAst/blocks/blockDefinitions';

describe('blockGenerators TypeScript compatibility', () => {
  it('does not access ORDER_ATOMIC or ORDER_NONE on Blockly.Generator instances', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/features/elabArduinoAst/blocks/blockGenerators.ts'), 'utf8');
    expect(source).toContain('const ORDER_ATOMIC = 0');
    expect(source).toContain('const ORDER_NONE = 99');
    expect(source).not.toMatch(/generator\\.ORDER_(ATOMIC|NONE)/);
  });

  it('generates variable references with local order constants', () => {
      const workspace = new Blockly.Workspace();
    try {
      const block = workspace.newBlock('elab_variable_reference');
      block.setFieldValue('x', 'name');
      expect(elabArduinoAstGenerator.blockToCode(block)).toEqual(['x', 0]);
    } finally {
      workspace.dispose();
    }
  });

  it('generates if statements without typed ORDER member access', () => {
    const workspace = new Blockly.Workspace();
    try {
      const block = workspace.newBlock('elab_if_statement');
      const code = elabArduinoAstGenerator.blockToCode(block);
      expect(code).toContain('if (false)');
    } finally {
      workspace.dispose();
    }
  });
});
