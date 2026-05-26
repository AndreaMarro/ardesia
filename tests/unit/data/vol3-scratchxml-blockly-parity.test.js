// © Andrea Marro — 2026-05-26 — ELAB Tutor — Tutti i diritti riservati
/**
 * Wave 2 X.3 P0 — Vol3 19 placeholder scratchXml bulk fix Blockly C++ parity.
 *
 * Wave 1b shipped only 2 esp scratchXml fixes (v3-cap6-esp4 + v3-cap6-esp5)
 * but 19 OTHER esp in experiments-vol3.js still ship a generic placeholder
 * (arduino_serial_begin BAUD 9600 + arduino_delay 1000) NOT matching their
 * actual C++ code field. Students entering Blockly mode for any of these 19
 * see WRONG starter blocks vs the kit-physical build.
 *
 * This test asserts each of the 19 esp:
 *   1. scratchXml is no longer the generic placeholder (must contain at least
 *      one of the C++-relevant block types beyond serial_begin + delay).
 *   2. scratchXml is well-formed (starts <xml ..., ends </xml>, contains
 *      arduino_base hat block).
 *   3. scratchXml hydrates into a Blockly workspace without throw + generates
 *      Arduino C++ that contains the expected key calls (pin numbers,
 *      digitalWrite states, delays, Serial calls) matching the experiment.
 *
 * Source spec:
 *   PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md Sez Wave 2 X.3
 *   experiments-vol3.js .code field per esp.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as Blockly from 'blockly';
import {
  generateArduinoCode,
} from '../../../src/components/simulator/panels/scratchGenerator.js';
import '../../../src/components/simulator/panels/scratchBlocks.js';

const PLACEHOLDER_FIXED_IDS = [
  'v3-cap5-esp2',
  'v3-cap6-esp1', 'v3-cap6-esp2', 'v3-cap6-esp3', 'v3-cap6-esp6', 'v3-cap6-esp7', 'v3-cap6-esp8',
  'v3-cap7-esp1', 'v3-cap7-esp2', 'v3-cap7-esp3', 'v3-cap7-esp4', 'v3-cap7-esp5', 'v3-cap7-esp6', 'v3-cap7-esp7',
  'v3-cap8-esp2', 'v3-cap8-esp3', 'v3-cap8-esp4', 'v3-cap8-esp5', 'v3-cap8-esp6',
];

let experimentsById = new Map();
beforeAll(async () => {
  const mod = await import('../../../src/data/experiments-vol3.js');
  const all = mod.default?.experiments ?? mod.EXPERIMENTS_VOL3?.experiments ?? mod.experiments;
  if (!Array.isArray(all)) {
    throw new Error('experiments-vol3 .experiments not array — adjust test loader');
  }
  for (const exp of all) experimentsById.set(exp.id, exp);
});

function hydrateAndGenerate(xmlString) {
  const workspace = new Blockly.Workspace();
  const dom = Blockly.utils.xml.textToDom(xmlString);
  Blockly.Xml.domToWorkspace(dom, workspace);
  const code = generateArduinoCode(workspace);
  return { workspace, code };
}

// Generic regression checks (19 esp × 3 checks = 57 tests)
describe('Vol3 scratchXml Blockly parity (Wave 2 X.3 P0) — generic checks', () => {
  for (const id of PLACEHOLDER_FIXED_IDS) {
    describe(`${id}`, () => {
      it('scratchXml is no longer the generic placeholder', () => {
        const exp = experimentsById.get(id);
        expect(exp).toBeDefined();
        expect(exp.scratchXml).toBeTruthy();
        // The generic placeholder pattern is ONLY arduino_serial_begin + arduino_delay 1000
        // with no other Arduino blocks. Must contain at least one of the C++-relevant
        // block types beyond just serial_begin + delay.
        const hasRealBlocks = /(arduino_pin_mode|arduino_digital_write|arduino_digital_read|arduino_analog_write|arduino_analog_read|arduino_serial_print|arduino_variable_set|arduino_map|controls_if|controls_whileUntil|controls_repeat_ext)/.test(exp.scratchXml);
        expect(hasRealBlocks).toBe(true);
      });

      it('scratchXml is well-formed XML with arduino_base root', () => {
        const exp = experimentsById.get(id);
        expect(exp.scratchXml).toMatch(/^<xml /);
        expect(exp.scratchXml).toMatch(/<\/xml>$/);
        expect(exp.scratchXml).toContain('arduino_base');
      });

      it('scratchXml hydrates into workspace without throw', () => {
        const exp = experimentsById.get(id);
        expect(() => hydrateAndGenerate(exp.scratchXml)).not.toThrow();
      });
    });
  }
});

// Semantic per-esp checks (richer for simpler esp, generic for complex)
describe('v3-cap5-esp2 — Modificare il delay del Blink', () => {
  it('generates pinMode(13, OUTPUT)', () => {
    const exp = experimentsById.get('v3-cap5-esp2');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    expect(code).toMatch(/pinMode\s*\(\s*13\s*,\s*OUTPUT\s*\)/);
  });

  it('generates digitalWrite(13, HIGH) + digitalWrite(13, LOW)', () => {
    const exp = experimentsById.get('v3-cap5-esp2');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    expect(code).toMatch(/digitalWrite\s*\(\s*13\s*,\s*HIGH\s*\)/);
    expect(code).toMatch(/digitalWrite\s*\(\s*13\s*,\s*LOW\s*\)/);
  });

  it('generates delay(500) + delay(200) (asymmetric blink)', () => {
    const exp = experimentsById.get('v3-cap5-esp2');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    expect(code).toMatch(/delay\s*\(\s*500\s*\)/);
    expect(code).toMatch(/delay\s*\(\s*200\s*\)/);
  });
});

describe('v3-cap6-esp2 — LED esterno sul pin 13', () => {
  it('generates pinMode(13, OUTPUT)', () => {
    const exp = experimentsById.get('v3-cap6-esp2');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    expect(code).toMatch(/pinMode\s*\(\s*13\s*,\s*OUTPUT\s*\)/);
  });

  it('generates digitalWrite(13, HIGH) + digitalWrite(13, LOW)', () => {
    const exp = experimentsById.get('v3-cap6-esp2');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    expect(code).toMatch(/digitalWrite\s*\(\s*13\s*,\s*HIGH\s*\)/);
    expect(code).toMatch(/digitalWrite\s*\(\s*13\s*,\s*LOW\s*\)/);
  });

  it('generates delay(1000) calls (>= 2)', () => {
    const exp = experimentsById.get('v3-cap6-esp2');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    const matches = code.match(/delay\s*\(\s*1000\s*\)/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });
});

describe('v3-cap6-esp3 — LED esterno pin 8 (delay 700)', () => {
  it('generates pinMode(8, OUTPUT)', () => {
    const exp = experimentsById.get('v3-cap6-esp3');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    expect(code).toMatch(/pinMode\s*\(\s*8\s*,\s*OUTPUT\s*\)/);
  });

  it('generates digitalWrite(8, HIGH) + digitalWrite(8, LOW)', () => {
    const exp = experimentsById.get('v3-cap6-esp3');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    expect(code).toMatch(/digitalWrite\s*\(\s*8\s*,\s*HIGH\s*\)/);
    expect(code).toMatch(/digitalWrite\s*\(\s*8\s*,\s*LOW\s*\)/);
  });

  it('generates delay(700) calls (>= 2)', () => {
    const exp = experimentsById.get('v3-cap6-esp3');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    const matches = code.match(/delay\s*\(\s*700\s*\)/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });
});

describe('v3-cap6-esp6 — Leggere pulsante con digitalRead (if/else)', () => {
  it('generates pinMode(10, INPUT_PULLUP) for pulsante', () => {
    const exp = experimentsById.get('v3-cap6-esp6');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    expect(code).toMatch(/pinMode\s*\(\s*10\s*,\s*INPUT_PULLUP\s*\)/);
  });

  it('generates digitalRead(10) condition', () => {
    const exp = experimentsById.get('v3-cap6-esp6');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    expect(code).toMatch(/digitalRead\s*\(\s*10\s*\)/);
  });

  it('generates if/else branching with digitalWrite(5, HIGH) and digitalWrite(5, LOW)', () => {
    const exp = experimentsById.get('v3-cap6-esp6');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    expect(code).toMatch(/if\s*\(/);
    expect(code).toMatch(/else/);
    expect(code).toMatch(/digitalWrite\s*\(\s*5\s*,\s*HIGH\s*\)/);
    expect(code).toMatch(/digitalWrite\s*\(\s*5\s*,\s*LOW\s*\)/);
  });
});

describe('v3-cap8-esp2 — Messaggio ripetuto nel loop (Serial.println)', () => {
  it('generates Serial.begin(9600)', () => {
    const exp = experimentsById.get('v3-cap8-esp2');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    expect(code).toMatch(/Serial\.begin\s*\(\s*9600\s*\)/);
  });

  it('generates Serial.println with "Ciao" in the loop content', () => {
    const exp = experimentsById.get('v3-cap8-esp2');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    expect(code).toMatch(/Serial\.println\s*\(/);
    expect(code).toMatch(/Ciao/);
  });

  it('generates delay(1000) inside loop', () => {
    const exp = experimentsById.get('v3-cap8-esp2');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    expect(code).toMatch(/delay\s*\(\s*1000\s*\)/);
  });
});

describe('v3-cap8-esp3 — Stampare analogRead sul Monitor Seriale', () => {
  it('generates Serial.begin(9600)', () => {
    const exp = experimentsById.get('v3-cap8-esp3');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    expect(code).toMatch(/Serial\.begin\s*\(\s*9600\s*\)/);
  });

  it('generates Serial.println call referencing analogRead(A0)', () => {
    const exp = experimentsById.get('v3-cap8-esp3');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    expect(code).toMatch(/Serial\.println\s*\(/);
    expect(code).toMatch(/analogRead\s*\(\s*A0\s*\)/);
  });

  it('generates delay(200)', () => {
    const exp = experimentsById.get('v3-cap8-esp3');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    expect(code).toMatch(/delay\s*\(\s*200\s*\)/);
  });
});

// Semantic per-esp lite checks for the harder esp — verify key pins / operations
// are present without insisting on exact float math / arithmetic that the
// available Blockly blocks cannot express verbatim.

describe('v3-cap6-esp1 — Logica AND/OR (4 pulsanti)', () => {
  it('generates pinMode INPUT_PULLUP for at least one pulsante pin (3/9/10/11)', () => {
    const exp = experimentsById.get('v3-cap6-esp1');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    expect(code).toMatch(/pinMode\s*\(\s*(3|9|10|11)\s*,\s*INPUT_PULLUP\s*\)/);
  });

  it('generates digitalWrite to LED_OR pin 5 and LED_AND pin 6', () => {
    const exp = experimentsById.get('v3-cap6-esp1');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    expect(code).toMatch(/digitalWrite\s*\(\s*5\s*,/);
    expect(code).toMatch(/digitalWrite\s*\(\s*6\s*,/);
  });
});

describe('v3-cap6-esp7 — Variabile statoLED (toggle)', () => {
  it('references pulsante pin 10 (INPUT_PULLUP) + LED pin 5 (digitalWrite)', () => {
    const exp = experimentsById.get('v3-cap6-esp7');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    expect(code).toMatch(/pinMode\s*\(\s*10\s*,\s*INPUT_PULLUP\s*\)/);
    expect(code).toMatch(/digitalWrite\s*\(\s*5\s*,/);
  });
});

describe('v3-cap6-esp8 — Evitare lampeggio con while', () => {
  it('generates while loop AND references pin 10 + 5', () => {
    const exp = experimentsById.get('v3-cap6-esp8');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    expect(code).toMatch(/while\s*\(/);
    expect(code).toMatch(/digitalRead\s*\(\s*10\s*\)/);
    expect(code).toMatch(/digitalWrite\s*\(\s*5\s*,/);
  });
});

describe('v3-cap7-esp1 — Trimmer threshold A0 > 512 (LED pin 13)', () => {
  it('generates analogRead(A0) + digitalWrite(13, ...) with if branching', () => {
    const exp = experimentsById.get('v3-cap7-esp1');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    expect(code).toMatch(/analogRead\s*\(\s*A0\s*\)/);
    expect(code).toMatch(/digitalWrite\s*\(\s*13\s*,/);
    expect(code).toMatch(/if\s*\(/);
  });
});

describe('v3-cap7-esp2 — Trimmer threshold (Volt simplification)', () => {
  it('generates analogRead(A0) + digitalWrite(13, ...) with if branching', () => {
    const exp = experimentsById.get('v3-cap7-esp2');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    expect(code).toMatch(/analogRead\s*\(\s*A0\s*\)/);
    expect(code).toMatch(/digitalWrite\s*\(\s*13\s*,/);
    expect(code).toMatch(/if\s*\(/);
  });
});

describe('v3-cap7-esp3 — Tre LED indicano posizione trimmer (if/else if/else)', () => {
  it('generates analogRead(A0) + digitalWrite to pins 3, 5, 6 + if/else chain', () => {
    const exp = experimentsById.get('v3-cap7-esp3');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    expect(code).toMatch(/analogRead\s*\(\s*A0\s*\)/);
    expect(code).toMatch(/digitalWrite\s*\(\s*3\s*,/);
    expect(code).toMatch(/digitalWrite\s*\(\s*5\s*,/);
    expect(code).toMatch(/digitalWrite\s*\(\s*6\s*,/);
    expect(code).toMatch(/if\s*\(/);
    expect(code).toMatch(/else/);
  });
});

describe('v3-cap7-esp4 — Aumentare luminosita PWM con for', () => {
  it('generates analogWrite(5, ...) inside a for loop', () => {
    const exp = experimentsById.get('v3-cap7-esp4');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    expect(code).toMatch(/analogWrite\s*\(\s*5\s*,/);
    expect(code).toMatch(/for\s*\(/);
    expect(code).toMatch(/delay\s*\(\s*10\s*\)/);
  });
});

describe('v3-cap7-esp5 — Effetto respiro (due for loops)', () => {
  it('generates analogWrite(5, ...) + for loop(s) + delay(10)', () => {
    const exp = experimentsById.get('v3-cap7-esp5');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    expect(code).toMatch(/analogWrite\s*\(\s*5\s*,/);
    expect(code).toMatch(/for\s*\(/);
    expect(code).toMatch(/delay\s*\(\s*10\s*\)/);
  });
});

describe('v3-cap7-esp6 — Trimmer controlla luminosita LED (map)', () => {
  it('generates analogRead(A0) + map(...) + analogWrite(5, ...)', () => {
    const exp = experimentsById.get('v3-cap7-esp6');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    expect(code).toMatch(/analogRead\s*\(\s*A0\s*\)/);
    expect(code).toMatch(/map\s*\(/);
    expect(code).toMatch(/analogWrite\s*\(\s*5\s*,/);
  });
});

describe('v3-cap7-esp7 — Generare tensione analogica su pin A0', () => {
  it('generates analogRead(A1) + analogWrite(...) — note analogWriteResolution skipped (no block)', () => {
    const exp = experimentsById.get('v3-cap7-esp7');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    expect(code).toMatch(/analogRead\s*\(\s*A1\s*\)/);
    expect(code).toMatch(/analogWrite\s*\(/);
  });
});

describe('v3-cap8-esp4 — Due trimmer su Serial Plotter', () => {
  it('generates Serial.begin + analogRead(A2) + analogRead(A3) + Serial.print/println', () => {
    const exp = experimentsById.get('v3-cap8-esp4');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    expect(code).toMatch(/Serial\.begin\s*\(\s*9600\s*\)/);
    expect(code).toMatch(/analogRead\s*\(\s*A2\s*\)/);
    expect(code).toMatch(/analogRead\s*\(\s*A3\s*\)/);
    expect(code).toMatch(/Serial\.(print|println)\s*\(/);
  });
});

describe('v3-cap8-esp5 — Trimmer tre LED + valori seriali', () => {
  it('generates Serial.begin + analogRead(A0) + digitalWrite to pins 3, 5, 6', () => {
    const exp = experimentsById.get('v3-cap8-esp5');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    expect(code).toMatch(/Serial\.begin\s*\(\s*9600\s*\)/);
    expect(code).toMatch(/analogRead\s*\(\s*A0\s*\)/);
    expect(code).toMatch(/digitalWrite\s*\(\s*3\s*,/);
    expect(code).toMatch(/digitalWrite\s*\(\s*5\s*,/);
    expect(code).toMatch(/digitalWrite\s*\(\s*6\s*,/);
  });
});

describe('v3-cap8-esp6 — Barra progressiva LED', () => {
  it('generates Serial.begin + analogRead(A0) + digitalWrite to pins 3, 5, 6 + if branching', () => {
    const exp = experimentsById.get('v3-cap8-esp6');
    const { code } = hydrateAndGenerate(exp.scratchXml);
    expect(code).toMatch(/Serial\.begin\s*\(\s*9600\s*\)/);
    expect(code).toMatch(/analogRead\s*\(\s*A0\s*\)/);
    expect(code).toMatch(/digitalWrite\s*\(\s*3\s*,/);
    expect(code).toMatch(/digitalWrite\s*\(\s*5\s*,/);
    expect(code).toMatch(/digitalWrite\s*\(\s*6\s*,/);
    expect(code).toMatch(/if\s*\(/);
  });
});

describe('C++ source field reference (sanity — must still be present + non-empty)', () => {
  for (const id of PLACEHOLDER_FIXED_IDS) {
    it(`${id}.code is still defined and non-empty`, () => {
      const exp = experimentsById.get(id);
      expect(exp.code).toBeTruthy();
      expect(exp.code.length).toBeGreaterThan(20);
    });
  }
});
