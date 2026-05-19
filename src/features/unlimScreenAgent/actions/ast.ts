import type { AstProgram, AstStatement } from '../types';
import { escapeXml } from '../utils/xmlEscape';

function statementToCpp(statement: AstStatement): string {
  switch (statement.kind) {
    case 'PinMode':
      return `  pinMode(${statement.pin}, ${statement.mode});`;
    case 'DW':
      return `  digitalWrite(${statement.pin}, ${statement.value});`;
    case 'Delay':
      return `  delay(${statement.ms});`;
    case 'SerialBegin':
      return `  Serial.begin(${statement.baud});`;
    case 'Raw':
      return indentRawCpp(statement.code);
    case 'UnsupportedCppBlock':
      return indentRawCpp(statement.rawText);
  }
}

function indentRawCpp(code: string): string {
  return code
    .split('\n')
    .map((line) => line.length > 0 ? `  ${line}` : '')
    .join('\n');
}

export function astToCpp(program: AstProgram): string {
  const globals = program.globals?.length ? `${program.globals.join('\n')}\n\n` : '';
  return `${globals}void setup() {\n${program.setup.map(statementToCpp).join('\n')}\n}\n\nvoid loop() {\n${program.loop.map(statementToCpp).join('\n')}\n}\n`;
}

function attr(name: string, value: string | number): string {
  return `${escapeXml(name)}="${escapeXml(String(value))}"`;
}

function field(name: string, value: string | number): string {
  return `<field ${attr('name', name)}>${escapeXml(String(value))}</field>`;
}

function statementToBlockly(statement: AstStatement, id: string): string {
  switch (statement.kind) {
    case 'PinMode':
      return `<block ${attr('type', 'arduino_pin_mode')} ${attr('id', id)}>${field('PIN', statement.pin)}${field('MODE', statement.mode)}</block>`;
    case 'DW':
      return `<block ${attr('type', 'arduino_digital_write')} ${attr('id', id)}>${field('PIN', statement.pin)}${field('VALUE', statement.value)}</block>`;
    case 'Delay':
      return `<block ${attr('type', 'arduino_delay')} ${attr('id', id)}>${field('MS', statement.ms)}</block>`;
    case 'SerialBegin':
      return `<block ${attr('type', 'arduino_serial_begin')} ${attr('id', id)}>${field('BAUD', statement.baud)}</block>`;
    case 'Raw':
      return `<block ${attr('type', statement.blockType || 'arduino_raw')} ${attr('id', id)}>${field('CODE', statement.code)}</block>`;
    case 'UnsupportedCppBlock':
      return `<block ${attr('type', statement.blockType || 'unsupported_cpp_block')} ${attr('id', id)}>${field('RAW_TEXT', statement.rawText)}</block>`;
  }
}

export function astToBlockly(program: AstProgram): string {
  const statements = [...program.setup, ...program.loop];
  const blocks = statements
    .map((statement, index) => statementToBlockly(statement, `unlim-${index + 1}`))
    .join('');
  return `<xml xmlns="https://developers.google.com/blockly/xml">${blocks}</xml>`;
}
