import {
  ArduinoProgramSchema,
  type ArduinoAstNode,
  type ArduinoProgram,
} from '../ast/nodes';

/**
 * Canonical Arduino-flavoured Blockly generator.
 *
 * Unlike `astToBlockly`, which emits the generic `elab_program` /
 * `elab_call_expression` blocks, this generator emits the `arduino_*` blocks
 * used by the ELAB simulator's Blockly workspace (`scratchBlocks.js`):
 * `arduino_pin_mode`, `arduino_digital_write`, `arduino_delay`,
 * `arduino_serial_begin`, etc.
 *
 * It consumes the canonical `ArduinoProgram` shape, keeping
 * `elabArduinoAst` the single source of truth for both C++ and arduino_*
 * Blockly output.
 */

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function attr(name: string, value: string | number): string {
  return `${escapeXml(name)}="${escapeXml(String(value))}"`;
}

function field(name: string, value: string | number): string {
  return `<field ${attr('name', name)}>${escapeXml(String(value))}</field>`;
}

function nodeToBlockly(node: ArduinoAstNode, id: string): string {
  switch (node.type) {
    case 'PinMode':
      return `<block ${attr('type', 'arduino_pin_mode')} ${attr('id', id)}>${field('PIN', node.pin)}${field('MODE', node.mode)}</block>`;
    case 'DigitalWrite':
      // arduino_digital_write value field is STATE (scratchBlocks.js:61), not VALUE.
      return `<block ${attr('type', 'arduino_digital_write')} ${attr('id', id)}>${field('PIN', node.pin)}${field('STATE', node.value)}</block>`;
    case 'AnalogWrite':
      return `<block ${attr('type', 'arduino_analog_write')} ${attr('id', id)}>${field('PIN', node.pin)}${field('VALUE', node.value)}</block>`;
    case 'DigitalRead':
      return `<block ${attr('type', 'arduino_digital_read')} ${attr('id', id)}>${field('PIN', node.pin)}${node.storeIn ? field('STORE_IN', node.storeIn) : ''}</block>`;
    case 'AnalogRead':
      return `<block ${attr('type', 'arduino_analog_read')} ${attr('id', id)}>${field('PIN', node.pin)}${node.storeIn ? field('STORE_IN', node.storeIn) : ''}</block>`;
    case 'Delay':
      return `<block ${attr('type', 'arduino_delay')} ${attr('id', id)}>${field('MS', node.ms)}</block>`;
    case 'SerialBegin':
      return `<block ${attr('type', 'arduino_serial_begin')} ${attr('id', id)}>${field('BAUD', node.baud)}</block>`;
    case 'SerialPrint':
      return `<block ${attr('type', 'arduino_serial_print')} ${attr('id', id)}>${field('TEXT', node.value)}${field('NEWLINE', node.newline ? 'TRUE' : 'FALSE')}</block>`;
    case 'Variable':
      return `<block ${attr('type', 'arduino_variable')} ${attr('id', id)}>${field('VAR_TYPE', node.varType)}${field('NAME', node.name)}${node.init ? field('INIT', expressionToText(node.init)) : ''}</block>`;
    case 'If':
      return `<block ${attr('type', 'arduino_if')} ${attr('id', id)}>${field('COND', node.cond)}</block>`;
    case 'UnsupportedCppBlock':
      return `<block ${attr('type', 'unsupported_cpp_block')} ${attr('id', id)}>${field('RAW_TEXT', node.raw)}</block>`;
  }
}

function expressionToText(node: { type: string; raw?: string; pin?: string }): string {
  switch (node.type) {
    case 'RawExpression':
      return node.raw ?? '';
    case 'DigitalRead':
      return `digitalRead(${node.pin})`;
    case 'AnalogRead':
      return `analogRead(${node.pin})`;
    default:
      return '';
  }
}

export function arduinoAstToBlockly(programInput: ArduinoProgram): string {
  const program = ArduinoProgramSchema.parse(programInput);
  const nodes = [...program.globals, ...program.setup, ...program.loop];
  const blocks = nodes
    .map((node, index) => nodeToBlockly(node, `unlim-${index + 1}`))
    .join('');
  return `<xml xmlns="https://developers.google.com/blockly/xml">${blocks}</xml>`;
}
