import * as Blockly from 'blockly';

type CallBlock = Blockly.Block & {
  argCount_: number;
  updateShape_: () => void;
};

const STYLE = 'logic_blocks';

function asCallBlock(block: Blockly.Block): CallBlock {
  return block as CallBlock;
}

function setStatementShape(block: Blockly.Block, label: string): void {
  block.appendValueInput('EXPRESSION').appendField(label);
  block.setPreviousStatement(true, null);
  block.setNextStatement(true, null);
  block.setStyle(STYLE);
}

Blockly.Blocks['elab_program'] = {
  init(this: Blockly.Block) {
    this.appendDummyInput().appendField('program');
    this.appendStatementInput('BODY').setCheck(null);
    this.setStyle(STYLE);
  },
};

Blockly.Blocks['elab_variable_reference'] = {
  init(this: Blockly.Block) {
    this.appendDummyInput()
      .appendField('variable')
      .appendField(new Blockly.FieldTextInput('x'), 'name');
    this.setOutput(true, null);
    this.setStyle(STYLE);
  },
};

Blockly.Blocks['elab_call_expression'] = {
  init(this: Blockly.Block) {
    const block = asCallBlock(this);
    block.argCount_ = 0;
    this.appendDummyInput('HEADER')
      .appendField('call')
      .appendField(new Blockly.FieldTextInput('fn'), 'CALLEE');
    this.setOutput(true, null);
    this.setStyle(STYLE);
  },

  mutationToDom(this: Blockly.Block) {
    const mutation = Blockly.utils.xml.createElement('mutation');
    mutation.setAttribute('arguments', String(asCallBlock(this).argCount_ ?? 0));
    return mutation;
  },

  domToMutation(this: Blockly.Block, xmlElement: Element) {
    const block = asCallBlock(this);
    block.argCount_ = Number(xmlElement.getAttribute('arguments') ?? '0');
    block.updateShape_();
  },

  saveExtraState(this: Blockly.Block) {
    return { arguments: asCallBlock(this).argCount_ ?? 0 };
  },

  loadExtraState(this: Blockly.Block, state: { arguments?: number }) {
    const block = asCallBlock(this);
    block.argCount_ = state.arguments ?? 0;
    block.updateShape_();
  },

  updateShape_(this: Blockly.Block) {
    const block = asCallBlock(this);
    let i = 0;
    while (this.getInput(`ARG${i}`)) {
      this.removeInput(`ARG${i}`);
      i += 1;
    }
    for (let arg = 0; arg < (block.argCount_ ?? 0); arg += 1) {
      this.appendValueInput(`ARG${arg}`).appendField(arg === 0 ? 'args' : ',');
    }
  },
};

Blockly.Blocks['elab_expression_statement'] = {
  init(this: Blockly.Block) {
    setStatementShape(this, 'do');
  },
};

Blockly.Blocks['elab_variable_declaration'] = {
  init(this: Blockly.Block) {
    this.appendDummyInput()
      .appendField('declare')
      .appendField(new Blockly.FieldDropdown([
        ['let', 'let'],
        ['const', 'const'],
        ['var', 'var'],
      ]), 'KIND')
      .appendField(new Blockly.FieldTextInput('int'), 'VAR_TYPE')
      .appendField(new Blockly.FieldTextInput('value'), 'NAME');
    this.appendValueInput('INIT').appendField('=');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle(STYLE);
  },
};

Blockly.Blocks['elab_assignment_statement'] = {
  init(this: Blockly.Block) {
    this.appendDummyInput()
      .appendField('set')
      .appendField(new Blockly.FieldTextInput('value'), 'NAME')
      .appendField(new Blockly.FieldDropdown([
        ['=', '='],
        ['+=', '+='],
        ['-=', '-='],
        ['*=', '*='],
        ['/=', '/='],
      ]), 'OP');
    this.appendValueInput('VALUE');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle(STYLE);
  },
};

Blockly.Blocks['elab_if_statement'] = {
  init(this: Blockly.Block) {
    this.appendValueInput('TEST').appendField('if');
    this.appendStatementInput('THEN').setCheck(null).appendField('then');
    this.appendStatementInput('ELSE').setCheck(null).appendField('else');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle(STYLE);
  },
};

export function registerElabArduinoAstBlocks(): void {
  // Importing this module registers the blocks on Blockly.Blocks.
}
