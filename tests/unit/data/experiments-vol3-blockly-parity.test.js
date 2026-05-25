// © Andrea Marro — 2026-05-26 — ELAB Tutor — Tutti i diritti riservati
/**
 * Wave 1b post-close P0 regression: v3-cap6-esp4 + v3-cap6-esp5 scratchXml
 * placeholder mismatch with C++ code.
 *
 * Both experiments shipped with scratchXml = generic placeholder
 * (arduino_serial_begin + arduino_delay 1000) WITHOUT matching the actual
 * C++ programmed for the experiment. Students entering Blockly mode for
 * esp4/esp5 would see WRONG starter blocks vs the physical kit build.
 *
 * This test asserts the Blockly XML hydrates without throw + the generated
 * C++ contains the key digitalWrite/delay sequence matching experiment
 * intent (NOT byte-for-byte equality — preprocessor #define vs literal pin
 * may differ).
 *
 * Source spec:
 *   PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md Sez 17 (Vol3 esp1..esp29)
 *   experiments-vol3.js v3-cap6-esp4 + v3-cap6-esp5 code field
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as Blockly from 'blockly';
import {
  arduinoGenerator,
  generateArduinoCode,
} from '../../../src/components/simulator/panels/scratchGenerator.js';
import '../../../src/components/simulator/panels/scratchBlocks.js';

// Load experiments-vol3.js synchronously and extract esp4 + esp5 entries.
// Note: experiments-vol3.js exports a const array; we lazy-import via dynamic.
let esp4, esp5;
beforeAll(async () => {
  const mod = await import('../../../src/data/experiments-vol3.js');
  const all = mod.default?.experiments ?? mod.EXPERIMENTS_VOL3?.experiments ?? mod.experiments;
  if (!Array.isArray(all)) {
    throw new Error('experiments-vol3 .experiments not array — adjust test loader');
  }
  esp4 = all.find((e) => e.id === 'v3-cap6-esp4');
  esp5 = all.find((e) => e.id === 'v3-cap6-esp5');
  if (!esp4 || !esp5) {
    throw new Error(`esp4 found=${!!esp4} esp5 found=${!!esp5} — experiments-vol3.js shape changed`);
  }
});

function hydrateAndGenerate(xmlString) {
  const workspace = new Blockly.Workspace();
  const dom = Blockly.utils.xml.textToDom(xmlString);
  Blockly.Xml.domToWorkspace(dom, workspace);
  const code = generateArduinoCode(workspace);
  return { workspace, code };
}

describe('v3-cap6-esp4 Due LED alternati — Blockly ↔ C++ parity', () => {
  it('scratchXml hydrates without throw', () => {
    expect(() => hydrateAndGenerate(esp4.scratchXml)).not.toThrow();
  });

  it('generated C++ contains pinMode for pin 6 OUTPUT', () => {
    const { code } = hydrateAndGenerate(esp4.scratchXml);
    expect(code).toMatch(/pinMode\s*\(\s*6\s*,\s*OUTPUT\s*\)/);
  });

  it('generated C++ contains pinMode for pin 9 OUTPUT', () => {
    const { code } = hydrateAndGenerate(esp4.scratchXml);
    expect(code).toMatch(/pinMode\s*\(\s*9\s*,\s*OUTPUT\s*\)/);
  });

  it('generated C++ contains digitalWrite(6, HIGH) AND digitalWrite(9, LOW)', () => {
    const { code } = hydrateAndGenerate(esp4.scratchXml);
    expect(code).toMatch(/digitalWrite\s*\(\s*6\s*,\s*HIGH\s*\)/);
    expect(code).toMatch(/digitalWrite\s*\(\s*9\s*,\s*LOW\s*\)/);
  });

  it('generated C++ contains digitalWrite(6, LOW) AND digitalWrite(9, HIGH) (alternation)', () => {
    const { code } = hydrateAndGenerate(esp4.scratchXml);
    expect(code).toMatch(/digitalWrite\s*\(\s*6\s*,\s*LOW\s*\)/);
    expect(code).toMatch(/digitalWrite\s*\(\s*9\s*,\s*HIGH\s*\)/);
  });

  it('generated C++ contains delay(200) calls (>= 2 — alternation cadence)', () => {
    const { code } = hydrateAndGenerate(esp4.scratchXml);
    const matches = code.match(/delay\s*\(\s*200\s*\)/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it('NO arduino_serial_begin in generated code (placeholder anti-pattern check)', () => {
    const { code } = hydrateAndGenerate(esp4.scratchXml);
    expect(code).not.toMatch(/Serial\.begin/);
  });
});

describe('v3-cap6-esp5 Semaforo 3 LED — Blockly ↔ C++ parity', () => {
  it('scratchXml hydrates without throw', () => {
    expect(() => hydrateAndGenerate(esp5.scratchXml)).not.toThrow();
  });

  it('generated C++ contains pinMode for pin 5 OUTPUT (verde)', () => {
    const { code } = hydrateAndGenerate(esp5.scratchXml);
    expect(code).toMatch(/pinMode\s*\(\s*5\s*,\s*OUTPUT\s*\)/);
  });

  it('generated C++ contains pinMode for pin 6 OUTPUT (giallo)', () => {
    const { code } = hydrateAndGenerate(esp5.scratchXml);
    expect(code).toMatch(/pinMode\s*\(\s*6\s*,\s*OUTPUT\s*\)/);
  });

  it('generated C++ contains pinMode for pin 9 OUTPUT (rosso)', () => {
    const { code } = hydrateAndGenerate(esp5.scratchXml);
    expect(code).toMatch(/pinMode\s*\(\s*9\s*,\s*OUTPUT\s*\)/);
  });

  it('generated C++ contains digitalWrite(5, HIGH) — verde phase', () => {
    const { code } = hydrateAndGenerate(esp5.scratchXml);
    expect(code).toMatch(/digitalWrite\s*\(\s*5\s*,\s*HIGH\s*\)/);
  });

  it('generated C++ contains digitalWrite(6, HIGH) — giallo phase', () => {
    const { code } = hydrateAndGenerate(esp5.scratchXml);
    expect(code).toMatch(/digitalWrite\s*\(\s*6\s*,\s*HIGH\s*\)/);
  });

  it('generated C++ contains digitalWrite(9, HIGH) — rosso phase', () => {
    const { code } = hydrateAndGenerate(esp5.scratchXml);
    expect(code).toMatch(/digitalWrite\s*\(\s*9\s*,\s*HIGH\s*\)/);
  });

  it('generated C++ contains delay(3000) for verde + rosso phases (≥ 2 calls)', () => {
    const { code } = hydrateAndGenerate(esp5.scratchXml);
    const matches = code.match(/delay\s*\(\s*3000\s*\)/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it('generated C++ contains delay(1000) for giallo phase', () => {
    const { code } = hydrateAndGenerate(esp5.scratchXml);
    expect(code).toMatch(/delay\s*\(\s*1000\s*\)/);
  });

  it('NO arduino_serial_begin in generated code (placeholder anti-pattern check)', () => {
    const { code } = hydrateAndGenerate(esp5.scratchXml);
    expect(code).not.toMatch(/Serial\.begin/);
  });
});

describe('C++ source field reference (must still be present + non-placeholder)', () => {
  it('esp4.code defines pin 6 + 9 in pinMode setup', () => {
    expect(esp4.code).toMatch(/pinMode\s*\(\s*LED_BLU\s*,\s*OUTPUT\s*\)/);
    expect(esp4.code).toMatch(/pinMode\s*\(\s*LED_ROSSO\s*,\s*OUTPUT\s*\)/);
  });

  it('esp5.code defines pin 5/6/9 in pinMode setup', () => {
    expect(esp5.code).toMatch(/pinMode\s*\(\s*LED_VERDE\s*,\s*OUTPUT\s*\)/);
    expect(esp5.code).toMatch(/pinMode\s*\(\s*LED_GIALLO\s*,\s*OUTPUT\s*\)/);
    expect(esp5.code).toMatch(/pinMode\s*\(\s*LED_ROSSO\s*,\s*OUTPUT\s*\)/);
  });
});
