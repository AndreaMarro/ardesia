/**
 * scratchXmlBlockly.test.js — Test scratchXml in Blockly runtime
 *
 * Verifica che:
 * 1. Tutti i scratchXml definiti negli esperimenti sono XML valido
 * 2. Tutti i block type usati nel XML hanno definizione in scratchBlocks.js
 * 3. Tutti i block type usati nel XML hanno generatore in scratchGenerator.js
 * 4. Blockly carica correttamente il XML e genera codice Arduino valido
 *
 * Principio Zero: se il docente clicca "Scratch", deve funzionare al primo colpo.
 */
import { describe, it, expect } from 'vitest';
import * as Blockly from 'blockly';
import '../../src/components/simulator/panels/scratchBlocks';
import { arduinoGenerator, generateArduinoCode } from '../../src/components/simulator/panels/scratchGenerator';
import EXPERIMENTS_VOL3 from '../../src/data/experiments-vol3';

// ─── Collect all scratchXml from experiments (top-level + buildSteps) ────
function collectAllScratchXml() {
  const entries = [];
  for (const exp of EXPERIMENTS_VOL3.experiments) {
    if (exp.scratchXml) {
      entries.push({ id: exp.id, label: `${exp.id} (top-level)`, xml: exp.scratchXml });
    }
    if (exp.buildSteps) {
      for (const step of exp.buildSteps) {
        if (step.scratchXml) {
          entries.push({
            id: exp.id,
            label: `${exp.id} step ${step.step} scratchXml`,
            xml: step.scratchXml,
          });
        }
      }
    }
  }
  return entries;
}

// ─── Known ELAB block types (from scratchBlocks.js) ────
const ELAB_BLOCK_TYPES = new Set([
  'arduino_base',
  'arduino_pin_mode',
  'arduino_digital_write',
  'arduino_digital_read',
  'arduino_analog_write',
  'arduino_analog_read',
  'arduino_delay',
  'arduino_millis',
  'arduino_serial_begin',
  'arduino_serial_print',
  'arduino_serial_available',
  'arduino_serial_read',
  'arduino_pulse_in',
  'arduino_tone',
  'arduino_no_tone',
  'arduino_servo_attach',
  'arduino_servo_write',
  'arduino_servo_read',
  'arduino_lcd_init',
  'arduino_lcd_print',
  'arduino_lcd_set_cursor',
  'arduino_lcd_clear',
  'arduino_variable_set',
  'arduino_variable_get',
  'arduino_random',
  'arduino_map',
]);

// ─── Standard Blockly types used in scratchXml ────
const STANDARD_BLOCK_TYPES = new Set([
  'math_number',
  'math_arithmetic',
  'math_modulo',
  'math_constrain',
  'controls_if',
  'controls_repeat_ext',
  'controls_whileUntil',
  'controls_for',
  'controls_flow_statements',
  'logic_compare',
  'logic_operation',
  'logic_negate',
  'logic_boolean',
  'text',
  'text_join',
]);

const ALL_KNOWN_TYPES = new Set([...ELAB_BLOCK_TYPES, ...STANDARD_BLOCK_TYPES]);

const ALL_SCRATCH = collectAllScratchXml();

// ─── Extract block types from XML string ────
function extractBlockTypes(xmlString) {
  const types = new Set();
  // Match block type="..." and shadow type="..."
  const regex = /(?:block|shadow)\s+type="([^"]+)"/g;
  let match;
  while ((match = regex.exec(xmlString)) !== null) {
    types.add(match[1]);
  }
  return types;
}

describe('scratchXml — XML validity', () => {
  it(`has ${ALL_SCRATCH.length} scratchXml entries across Vol3`, () => {
    expect(ALL_SCRATCH.length).toBeGreaterThanOrEqual(7);
  });

  for (const entry of ALL_SCRATCH) {
    it(`${entry.label} is valid XML`, () => {
      expect(entry.xml).toBeTruthy();
      expect(entry.xml.trim().startsWith('<xml')).toBe(true);
      expect(entry.xml.trim().endsWith('</xml>')).toBe(true);

      // DOMParser check
      const parser = new DOMParser();
      const doc = parser.parseFromString(entry.xml, 'text/xml');
      const errors = doc.querySelectorAll('parsererror');
      expect(errors.length).toBe(0);
    });
  }
});

describe('scratchXml — block type coverage', () => {
  it('all block types used in scratchXml are known', () => {
    const unknownTypes = [];
    for (const entry of ALL_SCRATCH) {
      const types = extractBlockTypes(entry.xml);
      for (const t of types) {
        if (!ALL_KNOWN_TYPES.has(t)) {
          unknownTypes.push(`${entry.label}: unknown type "${t}"`);
        }
      }
    }
    expect(unknownTypes).toEqual([]);
  });

  it('all ELAB block types used in scratchXml have Blockly.Blocks definition', () => {
    const missing = [];
    for (const entry of ALL_SCRATCH) {
      const types = extractBlockTypes(entry.xml);
      for (const t of types) {
        if (ELAB_BLOCK_TYPES.has(t) && !Blockly.Blocks[t]) {
          missing.push(`${entry.label}: missing Blockly.Blocks["${t}"]`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it('all ELAB block types used in scratchXml have generator', () => {
    const missing = [];
    for (const entry of ALL_SCRATCH) {
      const types = extractBlockTypes(entry.xml);
      for (const t of types) {
        if (ELAB_BLOCK_TYPES.has(t) && !arduinoGenerator.forBlock[t]) {
          missing.push(`${entry.label}: missing generator for "${t}"`);
        }
      }
    }
    expect(missing).toEqual([]);
  });
});

describe('scratchXml — every XML has arduino_base block', () => {
  for (const entry of ALL_SCRATCH) {
    it(`${entry.label} contains arduino_base`, () => {
      expect(entry.xml).toContain('type="arduino_base"');
    });
  }
});

describe('scratchXml — Blockly workspace load + code generation', () => {
  for (const entry of ALL_SCRATCH) {
    it(`${entry.label} loads into workspace and generates code`, () => {
      const workspace = new Blockly.Workspace();
      try {
        // Load XML into workspace
        const xmlDom = Blockly.utils.xml.textToDom(entry.xml);
        Blockly.Xml.domToWorkspace(xmlDom, workspace);

        // Verify arduino_base block exists
        const baseBlocks = workspace.getBlocksByType('arduino_base');
        expect(baseBlocks.length).toBe(1);

        // Generate Arduino code
        const code = generateArduinoCode(workspace);
        expect(code).toBeTruthy();
        expect(typeof code).toBe('string');

        // Must contain setup() and loop()
        expect(code).toContain('void setup()');
        expect(code).toContain('void loop()');
      } finally {
        workspace.dispose();
      }
    });
  }
});

describe('scratchXml — code output correctness', () => {
  function generateFromXml(xml) {
    const workspace = new Blockly.Workspace();
    try {
      Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), workspace);
      return generateArduinoCode(workspace);
    } finally {
      workspace.dispose();
    }
  }

  it('Semaforo generates pinMode + digitalWrite + delay', () => {
    const semaforo = ALL_SCRATCH.find(e => e.id.includes('semaforo'));
    if (!semaforo) return; // Skip if not found
    const code = generateFromXml(semaforo.xml);
    expect(code).toContain('pinMode(');
    expect(code).toContain('digitalWrite(');
    expect(code).toContain('delay(');
  });

  it('Serial generates Serial.begin + Serial.println', () => {
    const serial = ALL_SCRATCH.find(e => e.label.includes('top-level') && e.id.includes('cap8'));
    if (!serial) return;
    const code = generateFromXml(serial.xml);
    expect(code).toContain('Serial.begin(');
    expect(code).toContain('Serial.println(');
  });

  it('Servo generates Servo attach + write', () => {
    const servo = ALL_SCRATCH.find(e => e.id.includes('servo'));
    if (!servo) return;
    const code = generateFromXml(servo.xml);
    expect(code).toContain('#include <Servo.h>');
    expect(code).toContain('.attach(');
    expect(code).toContain('.write(');
  });

  it('Simon generates tone + noTone', () => {
    const simon = ALL_SCRATCH.find(e => e.id.includes('simon') && e.label.includes('top-level'));
    if (!simon) return;
    const code = generateFromXml(simon.xml);
    expect(code).toContain('tone(');
    expect(code).toContain('noTone(');
  });

  it('Mini Toggle generates if/else with digitalRead', () => {
    const mini = ALL_SCRATCH.find(e =>
      e.label.includes('top-level') &&
      extractBlockTypes(e.xml).has('controls_if') &&
      extractBlockTypes(e.xml).has('arduino_digital_read')
    );
    if (!mini) return;
    const code = generateFromXml(mini.xml);
    expect(code).toContain('digitalRead(');
    expect(code).toContain('if (');
  });
});

describe('scratchXml — inventory check', () => {
  it('experiments with scratchXml are all in Vol3', () => {
    for (const entry of ALL_SCRATCH) {
      expect(entry.id.startsWith('v3-')).toBe(true);
    }
  });

  it('known scratchXml experiment IDs are present', () => {
    const ids = new Set(ALL_SCRATCH.map(e => e.id));
    // These experiments should have scratchXml (from the codebase analysis)
    const expected = ['v3-cap6-esp5', 'v3-cap6-esp8', 'v3-cap7-esp1'];
    for (const id of expected) {
      expect(ids.has(id)).toBe(true);
    }
  });
});
