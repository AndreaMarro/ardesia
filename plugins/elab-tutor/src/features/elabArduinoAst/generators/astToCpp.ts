import {
  ArduinoProgramSchema,
  type ArduinoAstNode,
  type ArduinoProgram,
  type ExpressionNode,
} from '../ast/nodes';

export function astToCpp(programInput: ArduinoProgram): string {
  const program = ArduinoProgramSchema.parse(programInput);
  const sections: string[] = [];

  if (program.globals.length > 0) {
    sections.push(program.globals.map((node) => renderNode(node, 0)).join('\n'));
  }

  sections.push(`void setup() {\n${renderBody(program.setup, 1)}\n}`);
  sections.push(`void loop() {\n${renderBody(program.loop, 1)}\n}`);

  return `${sections.filter(Boolean).join('\n\n')}\n`;
}

function renderBody(nodes: ArduinoAstNode[], indentLevel: number): string {
  return nodes.map((node) => renderNode(node, indentLevel)).join('\n');
}

function renderNode(node: ArduinoAstNode, indentLevel: number): string {
  const pad = '  '.repeat(indentLevel);

  switch (node.type) {
    case 'PinMode':
      return `${pad}pinMode(${node.pin}, ${node.mode});`;
    case 'DigitalWrite':
      return `${pad}digitalWrite(${node.pin}, ${node.value});`;
    case 'AnalogWrite':
      return `${pad}analogWrite(${node.pin}, ${node.value});`;
    case 'DigitalRead':
      return node.storeIn
        ? `${pad}${node.storeIn} = digitalRead(${node.pin});`
        : `${pad}digitalRead(${node.pin});`;
    case 'AnalogRead':
      return node.storeIn
        ? `${pad}${node.storeIn} = analogRead(${node.pin});`
        : `${pad}analogRead(${node.pin});`;
    case 'Delay':
      return `${pad}delay(${node.ms});`;
    case 'SerialBegin':
      return `${pad}Serial.begin(${node.baud});`;
    case 'SerialPrint':
      return `${pad}Serial.${node.newline ? 'println' : 'print'}(${node.value});`;
    case 'Variable':
      return `${pad}${node.varType} ${node.name}${node.init ? ` = ${renderExpression(node.init)}` : ''};`;
    case 'If': {
      const thenBody = renderBody(node.then, indentLevel + 1);
      const elseBody = node.else ? ` else {\n${renderBody(node.else, indentLevel + 1)}\n${pad}}` : '';
      return `${pad}if (${node.cond}) {\n${thenBody}\n${pad}}${elseBody}`;
    }
    case 'UnsupportedCppBlock':
      return node.raw
        .split('\n')
        .map((line) => `${pad}${line}`)
        .join('\n');
  }
}

function renderExpression(node: ExpressionNode): string {
  switch (node.type) {
    case 'RawExpression':
      return node.raw;
    case 'DigitalRead':
      return `digitalRead(${node.pin})`;
    case 'AnalogRead':
      return `analogRead(${node.pin})`;
  }
}
