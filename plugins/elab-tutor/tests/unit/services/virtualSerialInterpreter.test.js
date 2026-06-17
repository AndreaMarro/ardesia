/**
 * Iter 95 SP3 T1 — Virtual Serial Monitor C++ Arduino interpreter
 *
 * Lightweight C++ subset interpreter that scans user sketch + extracts
 * predicted Serial.* output WITHOUT actually compiling or executing the code.
 *
 * Andrea iter 94 PM mandate verbatim:
 *   "Si può verificare la seriale prevista. Senza scheda si può fare una
 *    verifica molto utile:
 *      1. compilare il codice per Nano R4;
 *      2. analizzare Serial.begin / Serial.print / Serial.println;
 *      3. mostrare un Monitor Seriale Virtuale;
 *      4. indicare che l'output è previsto/simulato, non letto da hardware."
 *
 * SCOPE (iter 95 SP3 T1):
 *   - parse setup() block + extract sequential Serial.* calls
 *   - parse loop() block + extract sequential Serial.* calls
 *   - Simulate N=10 loop iterations max (default 10) for display
 *   - Substitute simple literal arguments (string + integer)
 *   - Detect Serial.begin(baud) for baud rate display
 *   - Identify delay(ms) calls for timestamp annotation
 *
 * EXPLICIT NON-GOALS (iter 96+):
 *   - NOT a real C++ compiler/interpreter
 *   - NO variable substitution beyond simple literals
 *   - NO if/else conditional simulation
 *   - NO function call resolution
 *   - NO sensor/input simulation (analogRead returns fake 0 placeholder)
 *
 * Output disclaimer mandatory: "Seriale prevista dal programma. Per leggere
 * la seriale reale collega una Nano R4 via USB."
 */
import { describe, it, expect } from 'vitest';
import { interpretSerialOutput } from '../../../src/services/virtualSerialInterpreter.js';

describe('Virtual Serial Monitor C++ interpreter', () => {
  describe('Baud rate detection', () => {
    it('extracts baud rate from Serial.begin(9600)', () => {
      const code = `void setup() { Serial.begin(9600); }`;
      const result = interpretSerialOutput(code);
      expect(result.baudRate).toBe(9600);
    });

    it('returns null baudRate when Serial.begin missing', () => {
      const code = `void setup() {} void loop() {}`;
      const result = interpretSerialOutput(code);
      expect(result.baudRate).toBeNull();
    });

    it('extracts 115200 baud rate', () => {
      const code = `void setup() { Serial.begin(115200); }`;
      const result = interpretSerialOutput(code);
      expect(result.baudRate).toBe(115200);
    });
  });

  describe('setup() Serial output extraction', () => {
    it('extracts single Serial.println in setup', () => {
      const code = `void setup() {
        Serial.begin(9600);
        Serial.println("ELAB Nano R4 pronto");
      }
      void loop() {}`;
      const result = interpretSerialOutput(code);
      expect(result.setupOutput).toEqual(['ELAB Nano R4 pronto']);
    });

    it('extracts multiple Serial.println in setup in order', () => {
      const code = `void setup() {
        Serial.begin(9600);
        Serial.println("primo");
        Serial.println("secondo");
        Serial.println("terzo");
      }
      void loop() {}`;
      const result = interpretSerialOutput(code);
      expect(result.setupOutput).toEqual(['primo', 'secondo', 'terzo']);
    });

    it('handles Serial.print (no newline) joining adjacent print/println', () => {
      const code = `void setup() {
        Serial.begin(9600);
        Serial.print("hello ");
        Serial.println("world");
      }
      void loop() {}`;
      const result = interpretSerialOutput(code);
      expect(result.setupOutput).toEqual(['hello world']);
    });

    it('returns empty setupOutput when no Serial calls in setup', () => {
      const code = `void setup() { Serial.begin(9600); pinMode(13, OUTPUT); }
      void loop() {}`;
      const result = interpretSerialOutput(code);
      expect(result.setupOutput).toEqual([]);
    });
  });

  describe('loop() Serial output extraction with iteration', () => {
    it('extracts Serial.println in loop with N=10 default iterations', () => {
      const code = `void setup() { Serial.begin(9600); }
      void loop() {
        Serial.println("LED ON");
        delay(1000);
      }`;
      const result = interpretSerialOutput(code);
      expect(result.loopOutput.length).toBe(10);
      expect(result.loopOutput[0]).toMatchObject({ iteration: 1, lines: ['LED ON'], delaysMs: [1000] });
      expect(result.loopOutput[9]).toMatchObject({ iteration: 10, lines: ['LED ON'], delaysMs: [1000] });
    });

    it('respects custom maxIterations option', () => {
      const code = `void setup() { Serial.begin(9600); }
      void loop() {
        Serial.println("tick");
        delay(500);
      }`;
      const result = interpretSerialOutput(code, { maxIterations: 3 });
      expect(result.loopOutput.length).toBe(3);
      expect(result.loopOutput[0].lines).toEqual(['tick']);
    });

    it('extracts multiple Serial calls per loop iteration', () => {
      const code = `void setup() { Serial.begin(9600); }
      void loop() {
        Serial.println("LED ON");
        delay(1000);
        Serial.println("LED OFF");
        delay(1000);
      }`;
      const result = interpretSerialOutput(code, { maxIterations: 2 });
      expect(result.loopOutput[0].lines).toEqual(['LED ON', 'LED OFF']);
      expect(result.loopOutput[0].delaysMs).toEqual([1000, 1000]);
      expect(result.loopOutput[1].lines).toEqual(['LED ON', 'LED OFF']);
    });

    it('returns empty loopOutput when no Serial calls in loop', () => {
      const code = `void setup() { Serial.begin(9600); }
      void loop() { delay(100); }`;
      const result = interpretSerialOutput(code, { maxIterations: 3 });
      expect(result.loopOutput).toEqual([]);
    });
  });

  describe('cumulative timestamp calculation', () => {
    it('calculates cumulative delay timestamps across iterations', () => {
      const code = `void setup() { Serial.begin(9600); }
      void loop() {
        Serial.println("A");
        delay(500);
        Serial.println("B");
        delay(1500);
      }`;
      const result = interpretSerialOutput(code, { maxIterations: 2 });
      // Iter 1: line A at t=0ms, line B at t=500ms (after first delay)
      // Iter 2: line A at t=2000ms (after 500+1500), line B at t=2500ms
      expect(result.loopOutput[0].timestamps).toEqual([0, 500]);
      expect(result.loopOutput[1].timestamps).toEqual([2000, 2500]);
    });
  });

  describe('iter 95 SP3 T1 follow-up fixes — Codex Pattern V + code-reviewer', () => {
    it('CRITICAL-1: ignores commented-out Serial.println (line comment)', () => {
      const code = `void setup() {
        Serial.begin(9600);
        // Serial.println("COMMENTED OUT");
        Serial.println("real line");
      }
      void loop() {}`;
      const result = interpretSerialOutput(code);
      expect(result.setupOutput).toEqual(['real line']);
      expect(result.setupOutput).not.toContain('COMMENTED OUT');
    });

    it('CRITICAL-1: ignores commented-out Serial.println (block comment)', () => {
      const code = `void setup() {
        Serial.begin(9600);
        /* Serial.println("BLOCK COMMENTED");
           Serial.println("ALSO COMMENTED"); */
        Serial.println("real");
      }
      void loop() {}`;
      const result = interpretSerialOutput(code);
      expect(result.setupOutput).toEqual(['real']);
    });

    it('CRITICAL-2: maxIterations=0 produces zero loop iterations (NOT default 10)', () => {
      const code = `void setup() { Serial.begin(9600); }
      void loop() { Serial.println("loop line"); }`;
      const result = interpretSerialOutput(code, { maxIterations: 0 });
      expect(result.loopOutput.length).toBe(0);
    });

    it('HIGH-1: maxIterations clamped to MAX_ITERATIONS_HARDCAP (200) for large input', () => {
      const code = `void setup() { Serial.begin(9600); }
      void loop() { Serial.println("x"); }`;
      const result = interpretSerialOutput(code, { maxIterations: 99999 });
      expect(result.loopOutput.length).toBe(200);
      expect(result.warnings.some((w) => w.includes('clamped'))).toBe(true);
    });

    it('CRITICAL-2/HIGH-1: negative + NaN maxIterations falls back to default 10', () => {
      const code = `void setup() { Serial.begin(9600); }
      void loop() { Serial.println("x"); }`;
      expect(interpretSerialOutput(code, { maxIterations: -5 }).loopOutput.length).toBe(10);
      expect(interpretSerialOutput(code, { maxIterations: NaN }).loopOutput.length).toBe(10);
      expect(interpretSerialOutput(code, { maxIterations: 'abc' }).loopOutput.length).toBe(10);
    });
  });

  describe('error tolerance + defensive parsing', () => {
    it('returns safe empty result for null/undefined input', () => {
      expect(interpretSerialOutput(null)).toEqual({
        baudRate: null,
        setupOutput: [],
        loopOutput: [],
        warnings: ['empty input'],
      });
      expect(interpretSerialOutput(undefined).warnings).toContain('empty input');
      expect(interpretSerialOutput('').warnings).toContain('empty input');
    });

    it('returns warnings for code without setup() or loop()', () => {
      const code = `int x = 5; // no setup/loop`;
      const result = interpretSerialOutput(code);
      expect(result.warnings).toContain('setup() not found');
      expect(result.warnings).toContain('loop() not found');
    });

    it('handles non-string argument with placeholder', () => {
      const code = `void setup() {
        Serial.begin(9600);
        int x = 42;
        Serial.println(x);
      }
      void loop() {}`;
      const result = interpretSerialOutput(code);
      // Non-literal argument → placeholder showing variable name
      expect(result.setupOutput[0]).toMatch(/\[x\]|\{x\}|<x>/i);
    });

    it('iter-99 MEDIUM: caps oversized raw input and warns (MAX_CODE_LENGTH)', () => {
      const huge = 'void setup() { Serial.begin(9600); Serial.println("ok"); }\n'
        + 'void loop() {}\n'
        + '// padding '.repeat(8000);
      expect(huge.length).toBeGreaterThan(50000);
      const result = interpretSerialOutput(huge);
      expect(result.warnings.some((w) => w.includes('truncated'))).toBe(true);
      // leading setup() is within the cap -> still parsed correctly
      expect(result.baudRate).toBe(9600);
      expect(result.setupOutput).toContain('ok');
    });
  });

  describe('Andrea iter 94 PM mandate verbatim example', () => {
    it('produces expected output for ELAB Blink+Serial example', () => {
      const code = `void setup() {
        Serial.begin(9600);
        pinMode(13, OUTPUT);
        Serial.println("ELAB Nano R4 pronto");
      }

      void loop() {
        digitalWrite(13, HIGH);
        Serial.println("LED acceso");
        delay(1000);

        digitalWrite(13, LOW);
        Serial.println("LED spento");
        delay(1000);
      }`;
      const result = interpretSerialOutput(code, { maxIterations: 2 });
      expect(result.baudRate).toBe(9600);
      expect(result.setupOutput).toEqual(['ELAB Nano R4 pronto']);
      expect(result.loopOutput[0].lines).toEqual(['LED acceso', 'LED spento']);
      expect(result.loopOutput[0].delaysMs).toEqual([1000, 1000]);
      expect(result.loopOutput[1].lines).toEqual(['LED acceso', 'LED spento']);
    });
  });
});
