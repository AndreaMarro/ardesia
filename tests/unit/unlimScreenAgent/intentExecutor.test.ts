import { describe, expect, it, vi } from 'vitest';
import * as Blockly from 'blockly';
import '../../../src/components/simulator/panels/scratchBlocks';
import { generateArduinoCode } from '../../../src/components/simulator/panels/scratchGenerator';
import {
  executeIntent,
  intentToBlocklyXml,
  normalizeIntent,
} from '../../../src/features/unlimScreenAgent/intentExecutor';
import { parseUnlimIntent } from '../../../src/features/unlimScreenAgent/intentSchema';

function parseXml(xml: string) {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  expect(doc.querySelectorAll('parsererror').length).toBe(0);
  return doc;
}

function generateFromXml(xml: string) {
  const workspace = new Blockly.Workspace();
  try {
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), workspace);
    return generateArduinoCode(workspace);
  } finally {
    workspace.dispose();
  }
}

describe('unlimScreenAgent intent schema', () => {
  it('accepts create_blink with a digital pin', () => {
    const parsed = parseUnlimIntent({
      intent: 'create_blink',
      nl: 'fai blink sul pin 13',
      params: { pin: '13', intervalMs: 500 },
    });
    expect(parsed.params.pin).toBe('13');
  });

  it('accepts analog pins A0-A7 for analog_read', () => {
    const parsed = parseUnlimIntent({
      intent: 'analog_read',
      nl: 'leggi A7',
      params: { pin: 'A7', variable: 'valore' },
    });
    expect(parsed.params.pin).toBe('A7');
  });

  it('rejects pins outside 0-13 and A0-A7', () => {
    expect(() => parseUnlimIntent({
      intent: 'digital_write',
      nl: 'accendi pin 14',
      params: { pin: '14', value: 'HIGH' },
    })).toThrow(/pin/i);
  });

  it('rejects analog pins outside A0-A7', () => {
    expect(() => parseUnlimIntent({
      intent: 'analog_read',
      nl: 'leggi A8',
      params: { pin: 'A8', variable: 'v' },
    })).toThrow(/pin/i);
  });

  it('rejects natural-language prompts longer than 500 chars', () => {
    expect(() => parseUnlimIntent({
      intent: 'create_blink',
      nl: 'x'.repeat(501),
      params: { pin: '13', intervalMs: 1000 },
    })).toThrow(/500/i);
  });

  it('rejects unknown top-level keys', () => {
    expect(() => parseUnlimIntent({
      intent: 'create_blink',
      nl: 'blink',
      params: { pin: '13', intervalMs: 1000 },
      injected: true,
    })).toThrow();
  });

  it('rejects params that do not match the expected intent shape', () => {
    expect(() => parseUnlimIntent({
      intent: 'create_blink',
      nl: 'blink',
      params: { pin: '13', value: 'HIGH' },
    })).toThrow(/params/i);
  });

  it('rejects malformed expressions', () => {
    expect(() => parseUnlimIntent({
      intent: 'serial_print',
      nl: 'stampa',
      params: { expr: 'digitalRead(2); evil();' },
    })).toThrow(/expr/i);
  });
});

describe('unlimScreenAgent intent executor XML', () => {
  it('creates valid blink Blockly XML', () => {
    const xml = intentToBlocklyXml({
      intent: 'create_blink',
      nl: 'blink pin 13',
      params: { pin: '13', intervalMs: 1000 },
    });
    parseXml(xml);
    expect(xml).toContain('type="arduino_base"');
    expect(xml).toContain('<field name="PIN">13</field>');
  });

  it('loads generated blink XML in Blockly and generates Arduino setup/loop', () => {
    const xml = intentToBlocklyXml({
      intent: 'create_blink',
      nl: 'blink pin 13',
      params: { pin: '13', intervalMs: 1000 },
    });
    const code = generateFromXml(xml);
    expect(code).toContain('void setup()');
    expect(code).toContain('pinMode(13, OUTPUT);');
    expect(code).toContain('digitalWrite(13, HIGH);');
    expect(code).toContain('delay(1000);');
  });

  it('escapes C++ reference operators in value fields so XML remains valid', () => {
    const xml = intentToBlocklyXml({
      intent: 'comment',
      nl: 'stampa valore',
      params: { pin: 'A0', value: 'params', expr: 'int x = &y;' },
    });
    parseXml(xml);
    expect(xml).toContain('pin=A0');
    expect(xml).toContain('int x = &amp;y;');
    expect(xml).not.toContain('int x = &y;');
  });

  it('escapes NL prompt containing angle brackets in XML metadata', () => {
    const xml = intentToBlocklyXml({
      intent: 'create_blink',
      nl: 'crea <blink> e poi > prova',
      params: { pin: '13', intervalMs: 250 },
    });
    parseXml(xml);
    expect(xml).toContain('crea &lt;blink&gt; e poi &gt; prova');
  });

  it('escapes pin/value/expr params before XML insertion', () => {
    const xml = intentToBlocklyXml({
      intent: 'comment',
      nl: 'test injection',
      params: {
        pin: 'A0',
        value: '<shadow type="math_number">',
        expr: 'analogRead(A0) & 1',
      },
    });
    parseXml(xml);
    expect(xml).toContain('pin=A0');
    expect(xml).toContain('&lt;shadow type=&quot;math_number&quot;&gt;');
    expect(xml).toContain('analogRead(A0) &amp; 1');
  });

  it('does not emit unescaped closing tags from intent params', () => {
    const xml = intentToBlocklyXml({
      intent: 'comment',
      nl: 'try close',
      params: {
        pin: 'A0',
        value: '</field><block type="evil">',
        expr: 'analogRead(A0)',
      },
    });
    parseXml(xml);
    expect(xml).not.toContain('</field><block type="evil">');
    expect(xml).not.toContain('type="evil"');
  });

  it('normalizes LLM aliases into canonical intent JSON', () => {
    const intent = normalizeIntent({
      type: 'blink',
      naturalLanguage: 'blink',
      parameters: { pin: 13, interval: 750 },
    });
    expect(intent).toEqual({
      intent: 'create_blink',
      nl: 'blink',
      params: { pin: '13', intervalMs: 750 },
    });
  });

  it('executes by loading the generated workspace through the simulator API', () => {
    const loadScratchWorkspace = vi.fn();
    const result = executeIntent({
      intent: 'digital_write',
      nl: 'accendi',
      params: { pin: '13', value: 'HIGH' },
    }, { loadScratchWorkspace });

    expect(result.ok).toBe(true);
    expect(loadScratchWorkspace).toHaveBeenCalledTimes(1);
    expect(loadScratchWorkspace.mock.calls[0][0]).toContain('arduino_digital_write');
  });

  it('returns a structured error and does not touch workspace for invalid intents', () => {
    const loadScratchWorkspace = vi.fn();
    const result = executeIntent({
      intent: 'digital_write',
      nl: 'bad',
      params: { pin: '22', value: 'HIGH' },
    }, { loadScratchWorkspace });

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/pin/i);
    expect(loadScratchWorkspace).not.toHaveBeenCalled();
  });
});
