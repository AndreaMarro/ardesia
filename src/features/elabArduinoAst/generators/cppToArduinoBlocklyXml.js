// © Andrea Marro — 27/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * cppToArduinoBlocklyXml
 *
 * Converts simple Arduino C++ source into Blockly XML matching the
 * arduino_base container + chained next block pattern consumed by
 * ScratchEditor (scratchBlocks.js). Used as runtime fallback when an
 * experiment scratchXml is a stub (default delay-only template).
 *
 * Supports primitives used across Vol3 experiments:
 *   pinMode, digitalWrite, analogWrite, delay, Serial.begin,
 *   Serial.println, Serial.print, tone, noTone.
 *
 * Variable declarations (const int LED_BLU = 6;) are resolved to numeric
 * pin literals so generated blocks reference concrete pin numbers.
 */

const PIN_MODE_RE = /pinMode\s*\(\s*([A-Za-z_]\w*|\d+)\s*,\s*(INPUT_PULLUP|INPUT|OUTPUT)\s*\)/g;
const DIGITAL_WRITE_RE = /digitalWrite\s*\(\s*([A-Za-z_]\w*|\d+)\s*,\s*(HIGH|LOW)\s*\)/g;
const ANALOG_WRITE_RE = /analogWrite\s*\(\s*([A-Za-z_]\w*|\d+)\s*,\s*(\d+)\s*\)/g;
const DELAY_RE = /delay\s*\(\s*(\d+)\s*\)/g;
const SERIAL_BEGIN_RE = /Serial\.begin\s*\(\s*(\d+)\s*\)/g;
const SERIAL_PRINTLN_RE = /Serial\.println\s*\(\s*("([^"]*)"|([A-Za-z_]\w*|\d+))\s*\)/g;
const SERIAL_PRINT_RE = /Serial\.print\s*\(\s*("([^"]*)"|([A-Za-z_]\w*|\d+))\s*\)/g;
const TONE_RE = /tone\s*\(\s*([A-Za-z_]\w*|\d+)\s*,\s*(\d+)\s*\)/g;
const NO_TONE_RE = /noTone\s*\(\s*([A-Za-z_]\w*|\d+)\s*\)/g;

const SETUP_BODY_RE = /void\s+setup\s*\(\s*\)\s*\{([\s\S]*?)\n\}/;
const LOOP_BODY_RE = /void\s+loop\s*\(\s*\)\s*\{([\s\S]*?)\n\}/;
const CONST_INT_RE = /(?:const\s+)?int\s+([A-Za-z_]\w*)\s*=\s*(\d+)\s*;/g;

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildConstMap(source) {
  const map = new Map();
  for (const m of source.matchAll(CONST_INT_RE)) {
    map.set(m[1], m[2]);
  }
  return map;
}

function resolvePin(token, constMap) {
  if (/^\d+$/.test(token)) return token;
  if (constMap.has(token)) return constMap.get(token);
  return token;
}

function extractBlocks(body, constMap) {
  const blocks = [];

  for (const m of body.matchAll(PIN_MODE_RE)) {
    blocks.push({
      index: m.index,
      descriptor: {
        type: 'arduino_pin_mode',
        fields: [['PIN', resolvePin(m[1], constMap)], ['MODE', m[2]]],
      },
    });
  }
  for (const m of body.matchAll(DIGITAL_WRITE_RE)) {
    blocks.push({
      index: m.index,
      descriptor: {
        type: 'arduino_digital_write',
        fields: [['PIN', resolvePin(m[1], constMap)], ['STATE', m[2]]],
      },
    });
  }
  for (const m of body.matchAll(ANALOG_WRITE_RE)) {
    blocks.push({
      index: m.index,
      descriptor: {
        type: 'arduino_analog_write',
        fields: [['PIN', resolvePin(m[1], constMap)], ['VALUE', m[2]]],
      },
    });
  }
  for (const m of body.matchAll(DELAY_RE)) {
    blocks.push({
      index: m.index,
      descriptor: {
        type: 'arduino_delay',
        value: { name: 'DELAY_TIME', shadowType: 'math_number', shadowField: ['NUM', m[1]] },
      },
    });
  }
  for (const m of body.matchAll(SERIAL_BEGIN_RE)) {
    blocks.push({
      index: m.index,
      descriptor: {
        type: 'arduino_serial_begin',
        fields: [['BAUD', m[1]]],
      },
    });
  }
  for (const m of body.matchAll(SERIAL_PRINTLN_RE)) {
    const literal = m[2] !== undefined ? m[2] : (m[3] || '');
    blocks.push({
      index: m.index,
      descriptor: {
        type: 'arduino_serial_print',
        fields: [['NEWLINE', 'TRUE']],
        value: { name: 'CONTENT', shadowType: 'text', shadowField: ['TEXT', literal] },
      },
    });
  }
  for (const m of body.matchAll(SERIAL_PRINT_RE)) {
    const window = body.slice(Math.max(0, m.index - 4), m.index + m[0].length);
    if (/Serial\.println/.test(window)) continue;
    const literal = m[2] !== undefined ? m[2] : (m[3] || '');
    blocks.push({
      index: m.index,
      descriptor: {
        type: 'arduino_serial_print',
        fields: [['NEWLINE', 'FALSE']],
        value: { name: 'CONTENT', shadowType: 'text', shadowField: ['TEXT', literal] },
      },
    });
  }
  for (const m of body.matchAll(TONE_RE)) {
    blocks.push({
      index: m.index,
      descriptor: {
        type: 'arduino_tone',
        fields: [['PIN', resolvePin(m[1], constMap)], ['FREQUENCY', m[2]]],
      },
    });
  }
  for (const m of body.matchAll(NO_TONE_RE)) {
    blocks.push({
      index: m.index,
      descriptor: {
        type: 'arduino_no_tone',
        fields: [['PIN', resolvePin(m[1], constMap)]],
      },
    });
  }

  blocks.sort((a, b) => a.index - b.index);
  return blocks.map((b) => b.descriptor);
}

function renderBlock(descriptor) {
  const fieldsXml = (descriptor.fields || [])
    .map(([n, v]) => `<field name="${escapeXml(n)}">${escapeXml(v)}</field>`)
    .join('');
  let valueXml = '';
  if (descriptor.value) {
    const { name, shadowType, shadowField } = descriptor.value;
    const [sfName, sfVal] = shadowField;
    valueXml = `<value name="${escapeXml(name)}"><shadow type="${escapeXml(shadowType)}"><field name="${escapeXml(sfName)}">${escapeXml(sfVal)}</field></shadow></value>`;
  }
  return {
    open: `<block type="${escapeXml(descriptor.type)}">${fieldsXml}${valueXml}`,
    close: `</block>`,
  };
}

function chainBlocks(blocks) {
  if (blocks.length === 0) return '';
  let xml = '';
  let closes = 0;
  for (let i = 0; i < blocks.length; i++) {
    const { open, close } = renderBlock(blocks[i]);
    xml += open;
    if (i < blocks.length - 1) {
      xml += '<next>';
      closes += 1;
    }
    xml += close;
  }
  for (let i = 0; i < closes; i++) xml += '</next>';
  return xml;
}

/**
 * Detect if a scratchXml is the default stub (only serial_begin + delay 1000).
 */
export function isStubScratchXml(xml) {
  if (!xml || typeof xml !== 'string') return true;
  const hasBase = xml.includes('arduino_base');
  if (!hasBase) return true;
  const setupBlockMatch = xml.match(/<statement name="SETUP">([\s\S]*?)<\/statement>/);
  const loopBlockMatch = xml.match(/<statement name="LOOP">([\s\S]*?)<\/statement>/);
  const setupBody = setupBlockMatch?.[1] || '';
  const loopBody = loopBlockMatch?.[1] || '';
  const setupHasOnlySerial =
    /arduino_serial_begin/.test(setupBody) &&
    !/arduino_pin_mode|arduino_digital_write|arduino_analog_write/.test(setupBody);
  const loopHasOnlyDelay =
    /arduino_delay/.test(loopBody) &&
    !/arduino_digital_write|arduino_analog_write|arduino_serial_print|arduino_tone/.test(loopBody);
  return setupHasOnlySerial && loopHasOnlyDelay;
}

/**
 * Convert Arduino C++ source to Blockly XML matching the arduino_base
 * + chained next block pattern used by ScratchEditor.
 */
export function cppToArduinoBlocklyXml(source) {
  if (!source || typeof source !== 'string') {
    return '<xml xmlns="https://developers.google.com/blockly/xml"></xml>';
  }

  const constMap = buildConstMap(source);

  const setupMatch = source.match(SETUP_BODY_RE);
  const loopMatch = source.match(LOOP_BODY_RE);
  const setupBody = setupMatch ? setupMatch[1] : '';
  const loopBody = loopMatch ? loopMatch[1] : '';

  const setupBlocks = extractBlocks(setupBody, constMap);
  const loopBlocks = extractBlocks(loopBody, constMap);

  const setupChain = chainBlocks(setupBlocks);
  const loopChain = chainBlocks(loopBlocks);

  const setupStatement = setupChain ? `<statement name="SETUP">${setupChain}</statement>` : '';
  const loopStatement = loopChain ? `<statement name="LOOP">${loopChain}</statement>` : '';

  return `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false">${setupStatement}${loopStatement}</block></xml>`;
}

/**
 * Return experiment.scratchXml if non-stub, otherwise regenerate from
 * experiment.code. Falls back to the original (possibly empty) xml if
 * code is missing.
 */
export function ensureScratchXml(experiment) {
  if (!experiment) return '';
  const xml = experiment.scratchXml;
  if (xml && !isStubScratchXml(xml)) return xml;
  if (experiment.code) {
    try {
      return cppToArduinoBlocklyXml(experiment.code);
    } catch {
      // fall through
    }
  }
  return xml || '';
}
