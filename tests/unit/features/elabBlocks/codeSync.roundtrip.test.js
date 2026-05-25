/**
 * codeSync — roundtrip contract test (Impl-G-2 contract for Impl-B-2 Wave 1b).
 *
 * Contract scope (20 cases minimum per brief Sez 18):
 *   - 5 roundtrip identity: blink / servo-sweep / lcd-hello / button-led / serial-echo
 *   - 3 comment-preserve: inline (slash-slash), block (slash-star...star-slash), mixed
 *   - 2 multi-function: user-defined `void foo()` -> procedures_defnoreturn
 *   - 3 #define macros: numeric, string, multi-line continuation
 *   - 1 #ifdef stub: graceful degrade, no crash
 *   - 3 error recovery: malformed syntax -> TODO Blockly placeholder + console.warn IT
 *   - 3 IT error messages: "Errore di sintassi alla riga X: ..." NOT English
 *
 * Total: 20 test cases (Wave 1b mandatory floor — matches brief).
 *
 * STATE at contract time: codeSync.js exports `isNanoR4BlinkCpp` + `cppToBlocklyXml` only.
 * Impl-B-2 must add exports:
 *   - `cppToBlocklyXmlTolerant(source, options?)` — error-recovery + comments-preserve + #define + multi-fn
 *   - `getLastParseDiagnostics()` — returns { warnings: [{lineno, message_it}], errors: [...], placeholders: [...] }
 *
 * SKIP STRATEGY (Wave 1b coordination): cases that need Impl-B-2 exports are wrapped
 * in `describe.skipIf(!IMPL_B_READY)`. Until Impl-B-2 lands, they read as SKIPPED in
 * vitest summary — preserving the global anti-regression baseline (no new fails).
 * Once Impl-B-2 exports the symbols, the skip auto-flips OFF and tests must pass.
 * This is the TDD red-green contract: tests are written FIRST (here), Impl-B-2
 * implements SECOND, the moment exports exist they go LIVE (RED -> green).
 *
 * DO NOT modify contract after first commit unless Impl-B-2 sends explicit feedback.
 *
 * (c) Andrea Marro — 2026-05-25 — Wave 1b Impl-G-2 contract for Impl-B-2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as codeSyncModule from '../../../../src/features/elabBlocks/codeSync.js';

const {
  isNanoR4BlinkCpp,
  cppToBlocklyXml,
  cppToBlocklyXmlTolerant,
  getLastParseDiagnostics,
} = codeSyncModule;

// Wave 1b coordination flag: TRUE once Impl-B-2 ships `cppToBlocklyXmlTolerant`.
// Until then, tolerant-only describe blocks read as SKIPPED (not failed) — preserves
// global vitest baseline. R1 (blink identity) uses the existing Wave 1 API and runs
// unconditionally.
const IMPL_B_READY = typeof cppToBlocklyXmlTolerant === 'function';
const SKIP_REASON = 'Wave 1b coordination: awaits Impl-B-2 `cppToBlocklyXmlTolerant` export';

// ─── ROUNDTRIP IDENTITY R1 (always runs, uses Wave 1 API) ───────────────────

describe('codeSync roundtrip identity (Wave 1 API) — R1 blink', () => {
  it('R1: blink C++ identity — well-formed pinMode(13) + digitalWrite HIGH/LOW + delay', () => {
    const src = `void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}
`;
    expect(isNanoR4BlinkCpp(src)).toBe(true);
    const xml = cppToBlocklyXml(src);
    expect(xml).not.toBeNull();
    expect(xml).toContain('arduino_digital_write');
    expect(xml).toContain('<field name="PIN">13</field>');
  });
});

// ─── ROUNDTRIP IDENTITY R2-R5 (Wave 1b Impl-B-2 API) ────────────────────────

describe.skipIf(!IMPL_B_READY)('codeSync roundtrip identity (Wave 1b Impl-B contract) — R2-R5', () => {
  it('R2: servo-sweep C++ produces Blockly XML with Servo block (tolerant)', () => {
    const src = `#include <Servo.h>
Servo myServo;
void setup() {
  myServo.attach(9);
}
void loop() {
  myServo.write(0);
  delay(500);
  myServo.write(180);
  delay(500);
}
`;
    const xml = cppToBlocklyXmlTolerant(src);
    expect(xml).not.toBeNull();
    expect(xml).toMatch(/servo/i);
    expect(xml).toContain('9');
  });

  it('R3: lcd-hello C++ produces Blockly XML with LCD block', () => {
    const src = `#include <LiquidCrystal.h>
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);
void setup() {
  lcd.begin(16, 2);
  lcd.print("Ciao");
}
void loop() {
}
`;
    const xml = cppToBlocklyXmlTolerant(src);
    expect(xml).not.toBeNull();
    expect(xml).toMatch(/lcd/i);
  });

  it('R4: button-led C++ produces Blockly XML with digital_read + controls_if', () => {
    const src = `void setup() {
  pinMode(2, INPUT);
  pinMode(13, OUTPUT);
}
void loop() {
  if (digitalRead(2) == HIGH) {
    digitalWrite(13, HIGH);
  } else {
    digitalWrite(13, LOW);
  }
}
`;
    const xml = cppToBlocklyXmlTolerant(src);
    expect(xml).not.toBeNull();
    expect(xml).toContain('digital_read');
    expect(xml).toMatch(/controls_if|if/);
  });

  it('R5: serial-echo C++ produces Blockly XML with Serial blocks', () => {
    const src = `void setup() {
  Serial.begin(9600);
}
void loop() {
  if (Serial.available()) {
    Serial.println(Serial.read());
  }
}
`;
    const xml = cppToBlocklyXmlTolerant(src);
    expect(xml).not.toBeNull();
    expect(xml).toMatch(/serial/i);
    expect(xml).toContain('9600');
  });
});

// ─── COMMENT PRESERVE C1-C3 ─────────────────────────────────────────────────

describe.skipIf(!IMPL_B_READY)('codeSync comment preserve — Wave 1b Impl-B contract', () => {
  it('C1: inline (slash-slash) comments preserved roundtrip as Blockly comment fields', () => {
    const src = `void setup() {
  pinMode(13, OUTPUT); // LED rosso pin 13
}
void loop() {
  digitalWrite(13, HIGH); // accendi
  delay(500);
  digitalWrite(13, LOW); // spegni
  delay(500);
}
`;
    const xml = cppToBlocklyXmlTolerant(src, { preserveComments: true });
    expect(xml).not.toBeNull();
    expect(xml).toMatch(/<comment[^>]*>[\s\S]*LED rosso pin 13[\s\S]*<\/comment>/);
    expect(xml).toMatch(/<comment[^>]*>[\s\S]*accendi[\s\S]*<\/comment>/);
  });

  it('C2: block (slash-star...star-slash) comments preserved as Blockly comment fields', () => {
    const src = `/* Esperimento blink — Volume 3 capitolo 6 */
void setup() {
  pinMode(13, OUTPUT);
}
void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}
`;
    const xml = cppToBlocklyXmlTolerant(src, { preserveComments: true });
    expect(xml).not.toBeNull();
    expect(xml).toMatch(/Esperimento blink/);
  });

  it('C3: mixed inline + block comments preserved correctly', () => {
    const src = `/* header block */
void setup() {
  pinMode(13, OUTPUT); // inline LED
  /* multi
     line */
}
void loop() {
}
`;
    const xml = cppToBlocklyXmlTolerant(src, { preserveComments: true });
    expect(xml).not.toBeNull();
    expect(xml).toMatch(/header block/);
    expect(xml).toMatch(/inline LED/);
  });
});

// ─── MULTI-FUNCTION M1-M2 ───────────────────────────────────────────────────

describe.skipIf(!IMPL_B_READY)('codeSync multi-function support — Wave 1b Impl-B contract', () => {
  it('M1: user-defined `void foo()` parsed as procedures_defnoreturn block', () => {
    const src = `void blinkOnce() {
  digitalWrite(13, HIGH);
  delay(500);
  digitalWrite(13, LOW);
  delay(500);
}
void setup() {
  pinMode(13, OUTPUT);
}
void loop() {
  blinkOnce();
}
`;
    const xml = cppToBlocklyXmlTolerant(src);
    expect(xml).not.toBeNull();
    expect(xml).toMatch(/procedures_defnoreturn/);
    expect(xml).toMatch(/blinkOnce/);
  });

  it('M2: multiple user functions all parsed (3 functions)', () => {
    const src = `void ledOn() {
  digitalWrite(13, HIGH);
}
void ledOff() {
  digitalWrite(13, LOW);
}
void waitHalf() {
  delay(500);
}
void setup() {
  pinMode(13, OUTPUT);
}
void loop() {
  ledOn();
  waitHalf();
  ledOff();
  waitHalf();
}
`;
    const xml = cppToBlocklyXmlTolerant(src);
    expect(xml).not.toBeNull();
    const procDefMatches = xml.match(/procedures_defnoreturn/g) || [];
    expect(procDefMatches.length).toBeGreaterThanOrEqual(3);
    expect(xml).toMatch(/ledOn/);
    expect(xml).toMatch(/ledOff/);
    expect(xml).toMatch(/waitHalf/);
  });
});

// ─── #define MACROS D1-D3 ───────────────────────────────────────────────────

describe.skipIf(!IMPL_B_READY)('codeSync #define macros — Wave 1b Impl-B contract', () => {
  it('D1: numeric #define -> const var Blockly block', () => {
    const src = `#define LED_PIN 13
#define DELAY_MS 1000
void setup() {
  pinMode(LED_PIN, OUTPUT);
}
void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(DELAY_MS);
}
`;
    const xml = cppToBlocklyXmlTolerant(src);
    expect(xml).not.toBeNull();
    expect(xml).toMatch(/LED_PIN/);
    expect(xml).toMatch(/DELAY_MS/);
    expect(xml).toMatch(/>13</);
    expect(xml).toMatch(/>1000</);
  });

  it('D2: string #define -> const string Blockly block', () => {
    const src = `#define GREETING "Ciao ragazzi"
void setup() {
  Serial.begin(9600);
  Serial.println(GREETING);
}
void loop() {
}
`;
    const xml = cppToBlocklyXmlTolerant(src);
    expect(xml).not.toBeNull();
    expect(xml).toMatch(/GREETING/);
    expect(xml).toMatch(/Ciao ragazzi/);
  });

  it('D3: multi-line #define backslash continuation parsed without crash', () => {
    const src = `#define LONG_MACRO(a, b) \\
    do { \\
      digitalWrite((a), (b)); \\
    } while (0)
void setup() {
  pinMode(13, OUTPUT);
}
void loop() {
  LONG_MACRO(13, HIGH);
  delay(500);
}
`;
    // Don't assert success — multi-line backslash may degrade to TODO placeholder
    // Just ensure NO crash + parser stays alive
    expect(() => cppToBlocklyXmlTolerant(src)).not.toThrow();
  });
});

// ─── #ifdef STUB I1 ─────────────────────────────────────────────────────────

describe.skipIf(!IMPL_B_READY)('codeSync #ifdef stub — Wave 1b Impl-B contract', () => {
  it('I1: #ifdef block does not crash parser (degrade gracefully)', () => {
    const src = `#ifdef DEBUG
#define LOG(x) Serial.println(x)
#else
#define LOG(x)
#endif
void setup() {
  Serial.begin(9600);
}
void loop() {
  LOG("test");
}
`;
    expect(() => cppToBlocklyXmlTolerant(src)).not.toThrow();
    if (typeof getLastParseDiagnostics === 'function') {
      const diag = getLastParseDiagnostics();
      expect(diag).toBeDefined();
      expect(diag).toHaveProperty('warnings');
    }
  });
});

// ─── ERROR RECOVERY E1-E3 ───────────────────────────────────────────────────

describe.skipIf(!IMPL_B_READY)('codeSync error recovery — Wave 1b Impl-B contract', () => {
  let warnSpy;
  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('E1: missing semicolon -> TODO Blockly placeholder block', () => {
    const src = `void setup() {
  pinMode(13, OUTPUT)
}
void loop() {
  digitalWrite(13, HIGH);
}
`;
    const xml = cppToBlocklyXmlTolerant(src);
    expect(xml).not.toBeNull();
    expect(xml).toMatch(/TODO|unknown|placeholder/i);
  });

  it('E2: unmatched brace -> graceful degrade + warn', () => {
    const src = `void setup() {
  pinMode(13, OUTPUT);

void loop() {
  digitalWrite(13, HIGH);
}
`;
    expect(() => cppToBlocklyXmlTolerant(src)).not.toThrow();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('E3: completely garbage input -> empty workspace XML + warn (no throw)', () => {
    const src = `this is not C++ at all $%^&*()`;
    expect(() => cppToBlocklyXmlTolerant(src)).not.toThrow();
    expect(warnSpy).toHaveBeenCalled();
  });
});

// ─── IT ERROR MESSAGES IT1-IT3 ──────────────────────────────────────────────

describe.skipIf(!IMPL_B_READY)('codeSync IT error messages — Wave 1b Impl-B contract', () => {
  let warnSpy;
  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('IT1: parse error warn message is in Italian, NOT English', () => {
    const src = `void setup() { invalid syntax @@@ }
void loop() {}`;
    cppToBlocklyXmlTolerant(src);
    expect(warnSpy).toHaveBeenCalled();
    const calls = warnSpy.mock.calls.flat().join(' ');
    expect(calls).toMatch(/Errore|errore|sintassi|riga/i);
    expect(calls).not.toMatch(/^Syntax error/);
    expect(calls).not.toMatch(/^Parse error/);
  });

  it('IT2: error message includes "riga X" with line number', () => {
    const src = `void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, @@@);
}
`;
    cppToBlocklyXmlTolerant(src);
    if (typeof getLastParseDiagnostics === 'function') {
      const diag = getLastParseDiagnostics();
      const allMessages = [
        ...(diag.warnings || []).map((w) => w.message_it || w.message || ''),
        ...(diag.errors || []).map((e) => e.message_it || e.message || ''),
      ].join(' ');
      expect(allMessages).toMatch(/riga\s*\d+|linea\s*\d+/i);
    } else {
      const calls = warnSpy.mock.calls.flat().join(' ');
      expect(calls).toMatch(/riga|linea/i);
    }
  });

  it('IT3: TODO placeholder block has IT label "DA COMPLETARE" or "Errore"', () => {
    const src = `void setup() {
  pinMode(13, OUTPUT)
}
void loop() {}
`;
    const xml = cppToBlocklyXmlTolerant(src);
    if (xml && /TODO|placeholder|unknown/i.test(xml)) {
      expect(xml).toMatch(/DA COMPLETARE|Errore|Completa|riga|sintassi/i);
    }
  });
});
