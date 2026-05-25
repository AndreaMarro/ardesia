import { describe, it, expect } from 'vitest';
import * as Blockly from 'blockly';
import '../../../../src/components/simulator/panels/scratchBlocks.js';
import { generateArduinoCode } from '../../../../src/components/simulator/panels/scratchGenerator.js';
import { STARTER_TEMPLATES, getStarterXml, isValidStarterXml } from '../../../../src/features/elabBlocks/starterTemplates.js';

describe('starterTemplates — Sub-project A iter 84 atom 6', () => {
  it('T1: STARTER_TEMPLATES has 3 keys all with valid XML', () => {
    const keys = Object.keys(STARTER_TEMPLATES);
    expect(keys).toEqual(expect.arrayContaining(['blink', 'button', 'sensor']));
    expect(keys.length).toBe(3);
    for (const k of keys) {
      expect(isValidStarterXml(STARTER_TEMPLATES[k])).toBe(true);
    }
  });

  it('T2: getStarterXml("blink") returns Blockly XML containing arduino_digital_write', () => {
    const xml = getStarterXml('blink');
    expect(xml).not.toBeNull();
    expect(xml).toContain('arduino_digital_write');
    expect(xml).toContain('<field name="PIN">13</field>');
    expect(xml).toContain('arduino_delay');
  });

  it('T2b: blink starter generates Nano R4 built-in LED blink code immediately', () => {
    const workspace = new Blockly.Workspace();
    try {
      Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(getStarterXml('blink')), workspace);
      const code = generateArduinoCode(workspace);

      expect(code).toContain('pinMode(13, OUTPUT);');
      expect(code).toContain('digitalWrite(13, HIGH);');
      expect(code).toContain('digitalWrite(13, LOW);');
      expect(code.match(/delay\(1000\);/g)).toHaveLength(2);
    } finally {
      workspace.dispose();
    }
  });

  it('T3: getStarterXml("unknown") returns null defensive', () => {
    expect(getStarterXml('unknown')).toBeNull();
    expect(getStarterXml('')).toBeNull();
    expect(getStarterXml(null)).toBeNull();
  });
});
