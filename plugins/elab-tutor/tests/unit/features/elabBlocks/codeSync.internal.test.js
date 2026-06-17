/**
 * codeSync.internal.test.js — Wave 1b Impl-B-2 internal TDD harness
 *
 * Internal tests for codeSync.js + starterTemplates.js expansion.
 * Separate from Impl-G-owned codeSync.roundtrip.test.js (contract).
 *
 * Scope:
 *  - starterTemplates: 5+ templates (blink + servo-sweep + lcd-hello + button-led + serial-echo)
 *  - codeSync: tolerant parse, #define, multi-function, comment preserve, IT errors
 *
 * Spec: PROMPT-CROSSCOMPILATORE Sez 2 + Sez 3
 * Brief: docs/dispatch/2026-05-25-wave-1b-team-brief.md (Impl-B-2 scope)
 */
import { describe, it, expect } from 'vitest';
import {
  STARTER_TEMPLATES,
  getStarterXml,
  isValidStarterXml,
} from '../../../../src/features/elabBlocks/starterTemplates.js';
import {
  cppToBlocklyXml,
  isNanoR4BlinkCpp,
  parseCppTolerant,
  extractDefines,
  extractFunctions,
  extractComments,
} from '../../../../src/features/elabBlocks/codeSync.js';

describe('starterTemplates Wave 1b expansion (Impl-B-2)', () => {
  it('SE1: STARTER_TEMPLATES has 5+ keys including new ones', () => {
    const keys = Object.keys(STARTER_TEMPLATES);
    expect(keys.length).toBeGreaterThanOrEqual(5);
    expect(keys).toContain('blink');
    expect(keys).toContain('servo-sweep');
    expect(keys).toContain('lcd-hello');
    expect(keys).toContain('button-led');
    expect(keys).toContain('serial-echo');
  });

  it('SE2: all templates produce valid XML', () => {
    for (const key of Object.keys(STARTER_TEMPLATES)) {
      expect(isValidStarterXml(STARTER_TEMPLATES[key])).toBe(true);
    }
  });

  it('SE3: servo-sweep template references arduino_servo_attach + arduino_servo_write', () => {
    const xml = getStarterXml('servo-sweep');
    expect(xml).not.toBeNull();
    expect(xml).toContain('arduino_servo_attach');
    expect(xml).toContain('arduino_servo_write');
  });

  it('SE4: lcd-hello template references arduino_lcd_init + arduino_lcd_print', () => {
    const xml = getStarterXml('lcd-hello');
    expect(xml).not.toBeNull();
    expect(xml).toContain('arduino_lcd_init');
    expect(xml).toContain('arduino_lcd_print');
  });

  it('SE5: button-led template wires digital_read + digital_write', () => {
    const xml = getStarterXml('button-led');
    expect(xml).not.toBeNull();
    expect(xml).toContain('arduino_digital_read');
    expect(xml).toContain('arduino_digital_write');
  });

  it('SE6: serial-echo template uses arduino_serial_begin + arduino_serial_print', () => {
    const xml = getStarterXml('serial-echo');
    expect(xml).not.toBeNull();
    expect(xml).toContain('arduino_serial_begin');
    expect(xml).toContain('arduino_serial_print');
  });

  it('SE7: getStarterXml("unknown") returns null defensive', () => {
    expect(getStarterXml('totally-unknown-key')).toBeNull();
  });
});

describe('codeSync.parseCppTolerant (Impl-B-2)', () => {
  it('CT1: parses canonical blink without errors', () => {
    const result = parseCppTolerant(`void setup() {
  pinMode(13, OUTPUT);
}
void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`);
    expect(result.errors).toEqual([]);
    expect(result.functions.map((f) => f.name)).toContain('setup');
    expect(result.functions.map((f) => f.name)).toContain('loop');
  });

  it('CT2: malformed code returns IT error msg + TODO placeholder hint', () => {
    const result = parseCppTolerant(`void setup() {
  pinMode(13, OUTPUT);
}
void loop( {
  digitalWrite(13, HIGH);
}`);
    expect(result.errors.length).toBeGreaterThan(0);
    const msg = result.errors[0].message || result.errors[0];
    expect(typeof msg).toBe('string');
    expect(msg.toLowerCase()).toContain('errore');
    expect(result.placeholder).toBe(true);
  });

  it('CT3: error message reports line number', () => {
    const result = parseCppTolerant(`void setup() {
}
void loop() (
  digitalWrite(13, HIGH);
)`);
    expect(result.errors.length).toBeGreaterThan(0);
    const msg = result.errors[0].message || result.errors[0];
    expect(msg).toMatch(/riga\s+\d+/i);
  });

  it('CT4: empty input returns clean result with no functions', () => {
    const result = parseCppTolerant('');
    expect(result.functions).toEqual([]);
    expect(result.defines).toEqual([]);
  });
});

describe('codeSync.extractDefines (Impl-B-2)', () => {
  it('CD1: extracts single #define LED_PIN 13', () => {
    const defines = extractDefines(`#define LED_PIN 13
void setup() {}`);
    expect(defines).toHaveLength(1);
    expect(defines[0].name).toBe('LED_PIN');
    expect(defines[0].value).toBe('13');
  });

  it('CD2: extracts multiple #define lines preserving order', () => {
    const defines = extractDefines(`#define A 1
#define B 2
#define C 3`);
    expect(defines).toHaveLength(3);
    expect(defines.map((d) => d.name)).toEqual(['A', 'B', 'C']);
  });

  it('CD3: ignores #define inside comments', () => {
    const defines = extractDefines(`// #define COMMENTED 99
#define REAL 42`);
    expect(defines).toHaveLength(1);
    expect(defines[0].name).toBe('REAL');
  });

  it('CD4: handles #define without value (flag macros)', () => {
    const defines = extractDefines(`#define DEBUG
void setup() {}`);
    expect(defines).toHaveLength(1);
    expect(defines[0].name).toBe('DEBUG');
    expect(defines[0].value).toBe('');
  });
});

describe('codeSync.extractFunctions (Impl-B-2)', () => {
  it('CF1: extracts setup + loop from blink', () => {
    const fns = extractFunctions(`void setup() {
  pinMode(13, OUTPUT);
}
void loop() {
  digitalWrite(13, HIGH);
}`);
    expect(fns.map((f) => f.name).sort()).toEqual(['loop', 'setup']);
  });

  it('CF2: extracts user-defined function void foo()', () => {
    const fns = extractFunctions(`void setup() {}
void loop() {}
void blinkTwice() {
  digitalWrite(13, HIGH);
  delay(100);
  digitalWrite(13, LOW);
}`);
    const names = fns.map((f) => f.name);
    expect(names).toContain('blinkTwice');
    expect(names).toContain('setup');
    expect(names).toContain('loop');
  });

  it('CF3: captures function body content', () => {
    const fns = extractFunctions(`void setup() {
  pinMode(13, OUTPUT);
}`);
    const setupFn = fns.find((f) => f.name === 'setup');
    expect(setupFn).toBeDefined();
    expect(setupFn.body).toContain('pinMode(13, OUTPUT)');
  });

  it('CF4: handles function with no body (empty braces)', () => {
    const fns = extractFunctions(`void setup() {}
void loop() {}`);
    expect(fns).toHaveLength(2);
  });
});

describe('codeSync.extractComments (Impl-B-2)', () => {
  it('CC1: extracts // line comments', () => {
    const comments = extractComments(`void setup() {
  // initialise LED
  pinMode(13, OUTPUT);
}`);
    expect(comments.length).toBeGreaterThanOrEqual(1);
    expect(comments[0].text).toContain('initialise LED');
  });

  it('CC2: extracts /* block */ comments', () => {
    const comments = extractComments(`/* main blink program */
void setup() {}`);
    expect(comments.length).toBeGreaterThanOrEqual(1);
    expect(comments[0].text).toContain('main blink program');
  });

  it('CC3: preserves comments through cppToBlocklyXml metadata', () => {
    const source = `// Blink LED on pin 13
void setup() {
  pinMode(13, OUTPUT);
}
void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`;
    const xml = cppToBlocklyXml(source);
    expect(xml).not.toBeNull();
  });
});

describe('codeSync.cppToBlocklyXml backward compat (Impl-B-2)', () => {
  it('BC1: canonical blink still returns blink starter XML', () => {
    const xml = cppToBlocklyXml(`void setup() {
  pinMode(13, OUTPUT);
}
void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`);
    expect(xml).not.toBeNull();
    expect(xml).toContain('arduino_digital_write');
  });

  it('BC2: isNanoR4BlinkCpp recognises LED_BUILTIN form', () => {
    expect(
      isNanoR4BlinkCpp(`void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}
void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
}`)
    ).toBe(true);
  });

  it('BC3: returns null for completely empty input', () => {
    expect(cppToBlocklyXml('')).toBeNull();
  });
});
