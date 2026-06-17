import fs from 'fs';

const src = fs.readFileSync('src/data/experiments-vol3.js', 'utf-8');

console.log('ELAB Vol3 FULL EXPERIMENT AUDIT\n');

let totalIssues = 0;
let criticalIssues = 0;

function issue(severity, expId, msg) {
  const prefix = severity === 'P0' ? 'P0-CRITICAL' : severity === 'P1' ? 'P1-WARN' : 'P2-INFO';
  console.log('  [' + prefix + '] ' + msg);
  totalIssues++;
  if (severity === 'P0') criticalIssues++;
}

// 1. EXTRACT ALL EXPERIMENTS
console.log('1. EXPERIMENT EXTRACTION\n');

const expRegex = /\{\s*id:\s*['"]([^'"]+)['"]/g;
const experiments = [];
let m;
while ((m = expRegex.exec(src)) !== null) {
  const id = m[1];
  const startIdx = m.index;
  const chunk = src.substring(startIdx, startIdx + 15000);
  experiments.push({ id, startIdx, chunk });
}
console.log('  Found ' + experiments.length + ' experiments\n');

// 2. VALIDATE EACH EXPERIMENT
for (const exp of experiments) {
  console.log('\n-- ' + exp.id + ' --');

  const c = exp.chunk;

  // simulationMode
  const modeMatch = c.match(/simulationMode:\s*['"]([^'"]+)['"]/);
  const mode = modeMatch ? modeMatch[1] : null;
  if (!mode) {
    issue('P0', exp.id, 'MISSING simulationMode');
  } else {
    console.log('  Mode: ' + mode);
  }

  // title
  const titleMatch = c.match(/title:\s*['"]([^'"]+)['"]/);
  if (!titleMatch) {
    issue('P1', exp.id, 'MISSING title');
  } else {
    console.log('  Title: ' + titleMatch[1].substring(0, 60));
  }

  // components
  const hasComponents = c.includes('components:');
  if (!hasComponents) {
    issue('P0', exp.id, 'MISSING components array');
  } else {
    const compTypes = [...c.matchAll(/type:\s*['"]([^'"]+)['"]/g)].map(mm => mm[1]);
    // Filter out non-component types (like simulationMode value)
    const realComps = compTypes.filter(t => !['avr','circuit','scratch'].includes(t));
    console.log('  Components: ' + realComps.length + ' (' + realComps.join(', ') + ')');
  }

  // connections
  const hasConnections = c.includes('connections:');
  if (hasConnections) {
    const connCount = [...c.matchAll(/from:\s*['"][^'"]+['"]/g)].length;
    console.log('  Connections: ' + connCount);
  } else if (mode === 'avr') {
    issue('P1', exp.id, 'AVR experiment MISSING connections');
  }

  // code (AVR only)
  if (mode === 'avr') {
    const codeMatch = c.match(/code:\s*`([\s\S]*?)`/);
    if (!codeMatch) {
      issue('P0', exp.id, 'AVR experiment MISSING code template');
    } else {
      const code = codeMatch[1];
      if (!code.includes('void setup()')) issue('P0', exp.id, 'Code missing void setup()');
      if (!code.includes('void loop()')) issue('P0', exp.id, 'Code missing void loop()');

      const opens = (code.match(/\{/g) || []).length;
      const closes = (code.match(/\}/g) || []).length;
      if (opens !== closes) issue('P0', exp.id, 'Code brace mismatch: ' + opens + ' { vs ' + closes + ' }');

      if (code.includes('${')) issue('P1', exp.id, 'Code has template literal interpolation ${}');
      if (code.includes('Serial.print') && !code.includes('Serial.begin')) {
        issue('P1', exp.id, 'Code uses Serial.print without Serial.begin');
      }

      const lines = code.split('\n').length;
      console.log('  Code: OK (' + lines + ' lines)');
    }
  }

  // scratchXml
  const scratchXmlMatch = c.match(/scratchXml:\s*(\w+)/);
  if (scratchXmlMatch) {
    const constName = scratchXmlMatch[1];
    const constExists = src.includes('const ' + constName + ' =');
    if (!constExists) {
      issue('P0', exp.id, 'scratchXml references "' + constName + '" but constant NOT FOUND');
    } else {
      console.log('  ScratchXml: ' + constName + ' (exists)');
    }
  } else if (mode === 'avr') {
    console.log('  ScratchXml: none (uses default arduino_base)');
  }

  // scratchSteps
  const hasScratchSteps = c.includes('scratchSteps:');
  if (hasScratchSteps) {
    const stepsAfter = c.substring(c.indexOf('scratchSteps:'));
    const stepXmls = [...stepsAfter.matchAll(/xml:\s*`/g)];
    console.log('  ScratchSteps: ' + stepXmls.length + ' steps');
  }
}

// 3. XML TEMPLATE CONSTANTS
console.log('\n\n3. XML TEMPLATE CONSTANTS\n');
const xmlConstants = [...src.matchAll(/const\s+(\w+)\s*=\s*`(<xml[\s\S]*?<\/xml>)`/g)];
console.log('  Found ' + xmlConstants.length + ' XML constants\n');

for (const xc of xmlConstants) {
  const name = xc[1];
  const xml = xc[2];

  const blocks = (xml.match(/<block /g) || []).length;
  const blockCloses = (xml.match(/<\/block>/g) || []).length;
  if (blocks !== blockCloses) {
    issue('P0', name, 'Block tag mismatch: ' + blocks + ' opens vs ' + blockCloses + ' closes');
  }

  const shadows = (xml.match(/<shadow /g) || []).length;
  const shadowCloses = (xml.match(/<\/shadow>/g) || []).length;
  if (shadows !== shadowCloses) {
    issue('P0', name, 'Shadow tag mismatch: ' + shadows + ' opens vs ' + shadowCloses + ' closes');
  }

  const fields = (xml.match(/<field /g) || []).length;
  const fieldCloses = (xml.match(/<\/field>/g) || []).length;
  if (fields !== fieldCloses) {
    issue('P1', name, 'Field tag mismatch: ' + fields + ' opens vs ' + fieldCloses + ' closes');
  }

  // Check for JS comments in XML
  const jsComments = [...xml.matchAll(/\/\/[^\n]*\n/g)];
  const realComments = jsComments.filter(cc => !cc[0].includes('developers.google.com'));
  if (realComments.length > 0) {
    issue('P0', name, 'Has ' + realComments.length + ' JS comments inside XML!');
  }

  // Check block types
  const blockTypes = [...new Set([...xml.matchAll(/type="([^"]+)"/g)].map(mm => mm[1]))];
  const validTypes = [
    // Custom Arduino blocks (scratchBlocks.js)
    'arduino_base', 'arduino_pin_mode', 'arduino_digital_write', 'arduino_digital_read',
    'arduino_analog_read', 'arduino_analog_write', 'arduino_delay', 'arduino_millis',
    'arduino_tone', 'arduino_no_tone',
    'arduino_serial_begin', 'arduino_serial_print', 'arduino_serial_println',
    'arduino_map', 'arduino_random',
    'arduino_variable_set', 'arduino_variable_get',
    'arduino_servo_attach', 'arduino_servo_write', 'arduino_servo_read',
    'arduino_lcd_init', 'arduino_lcd_print', 'arduino_lcd_set_cursor', 'arduino_lcd_clear',
    // Blockly built-in: controls
    'controls_repeat_ext', 'controls_for', 'controls_if', 'controls_whileUntil',
    // Blockly built-in: logic
    'logic_compare', 'logic_operation', 'logic_negate', 'logic_boolean',
    // Blockly built-in: math
    'math_number', 'math_arithmetic', 'math_modulo', 'math_random_int',
    // Blockly built-in: variables
    'variables_get', 'variables_set',
    // Blockly built-in: text
    'text', 'text_print', 'text_join',
  ];
  const unknownTypes = blockTypes.filter(bt => !validTypes.includes(bt));
  if (unknownTypes.length > 0) {
    issue('P2', name, 'Unknown block types: ' + unknownTypes.join(', '));
  }

  const usageCount = (src.match(new RegExp('\\b' + name + '\\b', 'g')) || []).length;
  const status = usageCount > 1 ? 'used' : 'UNUSED';
  console.log('  ' + name + ': ' + blocks + ' blocks, ' + fields + ' fields (' + status + ')');
}

// 4. SUMMARY
console.log('\n\n=== AUDIT SUMMARY ===');
console.log('Experiments: ' + experiments.length);
console.log('XML Constants: ' + xmlConstants.length);
console.log('Total Issues: ' + totalIssues);
console.log('Critical (P0): ' + criticalIssues);
console.log(criticalIssues === 0 ? 'STATUS: ALL CLEAR' : 'STATUS: NEEDS FIXES');
