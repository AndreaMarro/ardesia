/**
 * tests/unit/elab-agent/sketch-builder.test.js
 *
 * Iter 63 P0.5 ELAB Compile/Upload Agent MVP — SketchBuilder golden tests.
 * Andrea mandate verbatim 2026-05-15 PM ADR docs/architecture/ELAB-COMPILE-UPLOAD-AGENT.md §3.2.
 *
 * Scope: src/services/elab-agent/sketch-builder.js
 * - loadBoardProfile + createSketch + buildSketch + addInclude/addGlobal/addSetup/addLoop/addFunction
 * - validateNoForbidden (forbidden AVR patterns Nano R4)
 * - buildBlinkSketch (MVP smoke test fixture)
 */

import { describe, it, expect } from 'vitest';
import {
  loadBoardProfile,
  createSketch,
  addInclude,
  addGlobal,
  addSetup,
  addLoop,
  addFunction,
  buildSketch,
  validateNoForbidden,
  buildBlinkSketch,
} from '../../../src/services/elab-agent/sketch-builder.js';

describe('loadBoardProfile — arduino-nano-r4 canonical', () => {
  it('loads BoardProfile JSON from src/boards/arduino-nano-r4.json', () => {
    const profile = loadBoardProfile('arduino-nano-r4');
    expect(profile.id).toBe('arduino-nano-r4');
    expect(profile.name).toBe('Arduino Nano R4');
  });

  it('has correct FQBN arduino:renesas_uno:nanor4', () => {
    const profile = loadBoardProfile('arduino-nano-r4');
    expect(profile.fqbn).toBe('arduino:renesas_uno:nanor4');
  });

  it('has correct core arduino:renesas_uno (NOT renesas_nano)', () => {
    const profile = loadBoardProfile('arduino-nano-r4');
    expect(profile.requiredCore).toBe('arduino:renesas_uno');
    expect(profile.requiredCore).not.toContain('renesas_nano');
  });

  it('compiler arm-none-eabi-gcc (NOT avr-gcc)', () => {
    const profile = loadBoardProfile('arduino-nano-r4');
    expect(profile.compiler).toBe('arm-none-eabi-gcc');
    expect(profile.compiler).not.toContain('avr');
  });

  it('uploadTool dfu-util (NOT bossac like UNO R4 WiFi)', () => {
    const profile = loadBoardProfile('arduino-nano-r4');
    expect(profile.uploadTool).toBe('dfu-util');
    expect(profile.uploadTool).not.toBe('bossac');
  });

  it('mcu Renesas RA4M1 + Cortex-M4 + 48MHz + 256KB Flash + 32KB SRAM', () => {
    const profile = loadBoardProfile('arduino-nano-r4');
    expect(profile.mcu).toBe('RA4M1');
    expect(profile.mcuFamily).toBe('Arm Cortex-M4');
    expect(profile.clockMHz).toBe(48);
    expect(profile.flashKB).toBe(256);
    expect(profile.sramKB).toBe(32);
  });

  it('capabilities ADC 14-bit + DAC 12-bit on A0', () => {
    const profile = loadBoardProfile('arduino-nano-r4');
    expect(profile.capabilities.adcResolutionBits).toBe(14);
    expect(profile.capabilities.dacResolutionBits).toBe(12);
    expect(profile.capabilities.hasDac).toBe(true);
    expect(profile.capabilities.dacPin).toBe('A0');
  });

  it('forbiddenPatterns contains AVR registers PORTB/DDRD/TCCR/OCR/TIMSK', () => {
    const profile = loadBoardProfile('arduino-nano-r4');
    expect(profile.forbiddenPatterns).toContain('PORTB');
    expect(profile.forbiddenPatterns).toContain('DDRD');
    expect(profile.forbiddenPatterns).toContain('TCCR1A');
    expect(profile.forbiddenPatterns).toContain('OCR1A');
    expect(profile.forbiddenPatterns).toContain('TIMSK1');
  });

  it('throws on unknown boardId', () => {
    expect(() => loadBoardProfile('nonexistent-board-id')).toThrow(/not found/i);
  });
});

describe('createSketch + add* — Sketch state API', () => {
  it('creates empty sketch with all sections', () => {
    const s = createSketch();
    expect(s.includes).toBeInstanceOf(Set);
    expect(s.globals).toBeInstanceOf(Set);
    expect(s.setup).toBeInstanceOf(Set);
    expect(s.loop).toEqual([]);
    expect(s.functions).toBeInstanceOf(Set);
  });

  it('addInclude wraps unwrapped header in angle brackets', () => {
    const s = createSketch();
    addInclude(s, 'Servo.h');
    expect(s.includes.has('<Servo.h>')).toBe(true);
  });

  it('addInclude preserves existing angle brackets', () => {
    const s = createSketch();
    addInclude(s, '<Wire.h>');
    expect(s.includes.has('<Wire.h>')).toBe(true);
    expect(s.includes.has('<<Wire.h>>')).toBe(false);
  });

  it('addInclude preserves quoted user header form', () => {
    const s = createSketch();
    addInclude(s, '"my-lib.h"');
    expect(s.includes.has('"my-lib.h"')).toBe(true);
  });

  it('addInclude dedups same header', () => {
    const s = createSketch();
    addInclude(s, 'Servo.h');
    addInclude(s, 'Servo.h');
    addInclude(s, '<Servo.h>');
    expect(s.includes.size).toBe(1);
  });

  it('addSetup dedups (Andrea mandate: analogReadResolution una sola volta)', () => {
    const s = createSketch();
    addSetup(s, 'analogReadResolution(14);');
    addSetup(s, 'analogReadResolution(14);');
    expect(s.setup.size).toBe(1);
  });

  it('addLoop preserves insertion order (NO dedup, loop is sequential)', () => {
    const s = createSketch();
    addLoop(s, 'digitalWrite(LED_BUILTIN, HIGH);');
    addLoop(s, 'delay(500);');
    addLoop(s, 'digitalWrite(LED_BUILTIN, LOW);');
    expect(s.loop).toEqual([
      'digitalWrite(LED_BUILTIN, HIGH);',
      'delay(500);',
      'digitalWrite(LED_BUILTIN, LOW);',
    ]);
  });

  it('add* throws on non-string input', () => {
    const s = createSketch();
    expect(() => addInclude(s, 123)).toThrow(/must be string/);
    expect(() => addGlobal(s, null)).toThrow(/must be string/);
    expect(() => addSetup(s, undefined)).toThrow(/must be string/);
    expect(() => addLoop(s, {})).toThrow(/must be string/);
  });

  it('addLoop normalizes whitespace via trim', () => {
    const s = createSketch();
    addLoop(s, '   digitalWrite(LED_BUILTIN, HIGH);   ');
    expect(s.loop[0]).toBe('digitalWrite(LED_BUILTIN, HIGH);');
  });
});

describe('buildSketch — compose ordered C++', () => {
  it('builds minimal Blink-shaped sketch with header by default', () => {
    const s = createSketch();
    addSetup(s, 'pinMode(LED_BUILTIN, OUTPUT);');
    addLoop(s, 'digitalWrite(LED_BUILTIN, HIGH);');
    addLoop(s, 'delay(500);');
    addLoop(s, 'digitalWrite(LED_BUILTIN, LOW);');
    addLoop(s, 'delay(500);');

    const code = buildSketch(s);
    expect(code).toContain('// Sketch generato da ELAB Tutor');
    expect(code).toContain('void setup() {');
    expect(code).toContain('  pinMode(LED_BUILTIN, OUTPUT);');
    expect(code).toContain('void loop() {');
    expect(code).toContain('  digitalWrite(LED_BUILTIN, HIGH);');
    expect(code).toContain('  delay(500);');
  });

  it('omits header when includeHeader: false', () => {
    const s = createSketch();
    addSetup(s, 'noop;');
    const code = buildSketch(s, { includeHeader: false });
    expect(code).not.toContain('// Sketch generato');
  });

  it('includes section sorted alphabetic for stability', () => {
    const s = createSketch();
    addInclude(s, 'Wire.h');
    addInclude(s, 'Servo.h');
    addInclude(s, 'Adafruit_NeoPixel.h');
    const code = buildSketch(s);
    const lines = code.split('\n');
    const includeLines = lines.filter((l) => l.startsWith('#include'));
    expect(includeLines).toEqual([
      '#include <Adafruit_NeoPixel.h>',
      '#include <Servo.h>',
      '#include <Wire.h>',
    ]);
  });

  it('setup section sorted alphabetic for stability', () => {
    const s = createSketch();
    addSetup(s, 'pinMode(LED_BUILTIN, OUTPUT);');
    addSetup(s, 'analogReadResolution(14);');
    addSetup(s, 'Serial.begin(9600);');
    const code = buildSketch(s);
    const setupBlock = code.split('void setup()')[1].split('}')[0];
    const setupLines = setupBlock
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && l !== '{');
    expect(setupLines).toEqual([
      'Serial.begin(9600);',
      'analogReadResolution(14);',
      'pinMode(LED_BUILTIN, OUTPUT);',
    ]);
  });

  it('functions section emitted after loop, separated by blank line', () => {
    const s = createSketch();
    addLoop(s, 'blinkOnce();');
    addFunction(s, 'void blinkOnce() {\n  digitalWrite(LED_BUILTIN, HIGH);\n  delay(100);\n  digitalWrite(LED_BUILTIN, LOW);\n}');
    const code = buildSketch(s);
    expect(code).toContain('void blinkOnce()');
    expect(code.indexOf('void blinkOnce()')).toBeGreaterThan(code.indexOf('void loop()'));
  });

  it('Andrea mandate: analogReadResolution(14) UNA SOLA VOLTA nel setup', () => {
    const s = createSketch();
    // Simula: blocco "leggi analogico avanzato" chiamato 3 volte
    for (let i = 0; i < 3; i++) {
      addSetup(s, 'analogReadResolution(14);');
      addLoop(s, `int v${i} = analogRead(A${i});`);
    }
    const code = buildSketch(s);
    const occurrences = (code.match(/analogReadResolution\(14\);/g) || []).length;
    expect(occurrences).toBe(1);
  });

  it('loop section preserves insertion ORDER (sequential), NOT sorted', () => {
    const s = createSketch();
    addLoop(s, 'C_first_alphabetic;');
    addLoop(s, 'A_should_NOT_be_first;');
    addLoop(s, 'B_middle;');
    const code = buildSketch(s);
    const loopBlock = code.split('void loop()')[1];
    const idxC = loopBlock.indexOf('C_first');
    const idxA = loopBlock.indexOf('A_should');
    const idxB = loopBlock.indexOf('B_middle');
    expect(idxC).toBeLessThan(idxA);
    expect(idxA).toBeLessThan(idxB);
  });
});

describe('validateNoForbidden — Nano R4 AVR forbidden patterns', () => {
  const nanoR4Profile = loadBoardProfile('arduino-nano-r4');

  it('PASS on Blink sketch (clean, no AVR registers)', () => {
    const blink = buildBlinkSketch();
    const result = validateNoForbidden(blink, nanoR4Profile);
    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
  });

  it('FAIL on PORTB register usage', () => {
    const bad = 'void setup() { PORTB |= (1 << 5); }';
    const result = validateNoForbidden(bad, nanoR4Profile);
    expect(result.ok).toBe(false);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].pattern).toBe('PORTB');
    expect(result.violations[0].line).toBe(1);
    expect(result.violations[0].snippet).toContain('PORTB');
  });

  it('FAIL on DDRD register usage', () => {
    const bad = 'void setup() {\n  DDRD = 0xFF;\n}';
    const result = validateNoForbidden(bad, nanoR4Profile);
    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.pattern === 'DDRD')).toBe(true);
  });

  it('FAIL on TCCR1A + OCR1A combined (timer AVR)', () => {
    const bad = 'void setup() {\n  TCCR1A = 0x82;\n  OCR1A = 999;\n}';
    const result = validateNoForbidden(bad, nanoR4Profile);
    expect(result.ok).toBe(false);
    expect(result.violations).toHaveLength(2);
    expect(result.violations.map((v) => v.pattern)).toEqual(expect.arrayContaining(['TCCR1A', 'OCR1A']));
  });

  it('FAIL on TIMSK0 interrupt mask AVR', () => {
    const bad = 'ISR(TIMER0_OVF_vect) {\n  TIMSK0 &= ~(1 << TOIE0);\n}';
    const result = validateNoForbidden(bad, nanoR4Profile);
    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.pattern === 'TIMSK0')).toBe(true);
  });

  it('word-boundary prevents false positives (PORTBELLO does NOT match PORTB)', () => {
    const ok = 'const char* name = "PORTBELLO";';
    const result = validateNoForbidden(ok, nanoR4Profile);
    expect(result.ok).toBe(true);
  });

  it('reports line number 1-indexed accurately', () => {
    const bad = '// line 1\n// line 2\nPORTB = 0xFF;\n// line 4';
    const result = validateNoForbidden(bad, nanoR4Profile);
    expect(result.violations[0].line).toBe(3);
  });

  it('throws on non-string sketchCode', () => {
    expect(() => validateNoForbidden(null, nanoR4Profile)).toThrow(/must be string/);
  });

  it('throws on missing boardProfile forbiddenPatterns', () => {
    expect(() => validateNoForbidden('void setup(){}', { id: 'fake' })).toThrow(/forbiddenPatterns/);
  });
});

describe('buildBlinkSketch — MVP smoke fixture', () => {
  it('emits valid Arduino Blink sketch with default 500ms delay', () => {
    const code = buildBlinkSketch();
    expect(code).toContain('pinMode(LED_BUILTIN, OUTPUT);');
    expect(code).toContain('digitalWrite(LED_BUILTIN, HIGH);');
    expect(code).toContain('digitalWrite(LED_BUILTIN, LOW);');
    expect(code).toContain('delay(500);');
  });

  it('respects custom delayMs', () => {
    const code = buildBlinkSketch({ delayMs: 1000 });
    expect(code).toContain('delay(1000);');
    expect(code).not.toContain('delay(500);');
  });

  it('Blink sketch PASSES Nano R4 forbidden AVR validation', () => {
    const code = buildBlinkSketch();
    const profile = loadBoardProfile('arduino-nano-r4');
    const result = validateNoForbidden(code, profile);
    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
  });

  it('throws on invalid delayMs (zero or negative)', () => {
    expect(() => buildBlinkSketch({ delayMs: 0 })).toThrow(/positive/);
    expect(() => buildBlinkSketch({ delayMs: -100 })).toThrow(/positive/);
    expect(() => buildBlinkSketch({ delayMs: 'fast' })).toThrow();
  });

  it('emits exactly ONE pinMode call (setup deduped)', () => {
    const code = buildBlinkSketch();
    const occurrences = (code.match(/pinMode\(LED_BUILTIN, OUTPUT\);/g) || []).length;
    expect(occurrences).toBe(1);
  });

  it('emits TWO delay calls in loop (HIGH delay + LOW delay)', () => {
    const code = buildBlinkSketch({ delayMs: 250 });
    const occurrences = (code.match(/delay\(250\);/g) || []).length;
    expect(occurrences).toBe(2);
  });
});
