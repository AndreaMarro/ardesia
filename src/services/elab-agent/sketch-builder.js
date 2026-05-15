/**
 * src/services/elab-agent/sketch-builder.js
 *
 * Iter 63 P0.5 ELAB Compile/Upload Agent MVP — SketchBuilder.
 * Andrea mandate verbatim 2026-05-15 PM (vedi docs/architecture/ELAB-COMPILE-UPLOAD-AGENT.md §3.2).
 *
 * Compone sketch Arduino C++ ordinato da blocchi Blockly "intenzioni".
 * Sezioni canoniche: includes / globals / setup / loop / functions.
 *
 * Anti-debito: blocchi emettono intenzioni (es. analogReadResolution(14)),
 * SketchBuilder deduplica + ordina in sezione corretta. No duplicati nel loop.
 *
 * Use:
 *   import { createSketch, buildSketch, validateNoForbidden } from './sketch-builder.js';
 *   const sketch = createSketch();
 *   sketch.addInclude('<Servo.h>');
 *   sketch.addGlobal('Servo myServo;');
 *   sketch.addSetup('myServo.attach(9);');
 *   sketch.addLoop('myServo.write(90);');
 *   const code = buildSketch(sketch);
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// BoardProfile loader
// ============================================================================

/**
 * Carica BoardProfile JSON canonical da src/boards/.
 * Default: arduino-nano-r4 per Andrea iter 62 close mandate.
 * @param {string} boardId - es. "arduino-nano-r4"
 * @returns {object} BoardProfile
 */
export function loadBoardProfile(boardId = 'arduino-nano-r4') {
  const repoRoot = path.resolve(__dirname, '..', '..', '..');
  const profilePath = path.join(repoRoot, 'src', 'boards', `${boardId}.json`);
  if (!fs.existsSync(profilePath)) {
    throw new Error(`BoardProfile not found: ${profilePath}`);
  }
  const raw = fs.readFileSync(profilePath, 'utf8');
  return JSON.parse(raw);
}

// ============================================================================
// Sketch state (uso Set per dedup automatico, array per loop dove ordine conta)
// ============================================================================

/**
 * Crea nuovo Sketch state vuoto.
 * @returns {Sketch}
 */
export function createSketch() {
  return {
    includes: new Set(),
    globals: new Set(),
    setup: new Set(),
    loop: [],
    functions: new Set(),
  };
}

/**
 * @typedef {object} Sketch
 * @property {Set<string>} includes - es. "<Servo.h>"
 * @property {Set<string>} globals - es. "Servo myServo;"
 * @property {Set<string>} setup - es. "analogReadResolution(14);"
 * @property {string[]} loop - ordinato es. ["int v = analogRead(A0);", "Serial.println(v);"]
 * @property {Set<string>} functions - definizioni funzioni complete (es. "void blink() { ... }")
 */

// ============================================================================
// Builder API (immutable add, dedup, validate)
// ============================================================================

function normalize(line) {
  if (typeof line !== 'string') {
    throw new TypeError(`SketchBuilder: line must be string, got ${typeof line}`);
  }
  return line.trim();
}

/**
 * Aggiunge include (dedup automatico tramite Set).
 * Accept con/senza angle brackets: addInclude('Servo.h') OR addInclude('<Servo.h>')
 */
export function addInclude(sketch, headerOrPath) {
  const norm = normalize(headerOrPath);
  // Normalizza a <Header.h> form. Se già contiene < o " preserva.
  const wrapped = /^[<"]/.test(norm) ? norm : `<${norm}>`;
  sketch.includes.add(wrapped);
}

export function addGlobal(sketch, line) {
  sketch.globals.add(normalize(line));
}

export function addSetup(sketch, line) {
  sketch.setup.add(normalize(line));
}

export function addLoop(sketch, line) {
  sketch.loop.push(normalize(line));
}

export function addFunction(sketch, fnDef) {
  sketch.functions.add(normalize(fnDef));
}

// ============================================================================
// Build (compose ordered sketch C++)
// ============================================================================

/**
 * Componi sketch C++ finale ordinato.
 * @param {Sketch} sketch
 * @param {object} [opts]
 * @param {boolean} [opts.includeHeader=true] - header commento ELAB
 * @returns {string} sketch C++ formattato
 */
export function buildSketch(sketch, opts = {}) {
  const { includeHeader = true } = opts;
  const lines = [];

  if (includeHeader) {
    lines.push('// Sketch generato da ELAB Tutor — NON modificare a mano');
    lines.push('// SketchBuilder iter 63 P0.5 ELAB Compile/Upload Agent');
    lines.push('');
  }

  // 1. includes (sorted alphabetic per stability)
  if (sketch.includes.size > 0) {
    const sorted = Array.from(sketch.includes).sort();
    for (const inc of sorted) {
      lines.push(`#include ${inc}`);
    }
    lines.push('');
  }

  // 2. globals
  if (sketch.globals.size > 0) {
    const sorted = Array.from(sketch.globals).sort();
    for (const g of sorted) {
      lines.push(g);
    }
    lines.push('');
  }

  // 3. setup
  lines.push('void setup() {');
  if (sketch.setup.size > 0) {
    const sorted = Array.from(sketch.setup).sort();
    for (const s of sorted) {
      lines.push(`  ${s}`);
    }
  }
  lines.push('}');
  lines.push('');

  // 4. loop (ordered insertion sequence)
  lines.push('void loop() {');
  for (const l of sketch.loop) {
    lines.push(`  ${l}`);
  }
  lines.push('}');

  // 5. functions
  if (sketch.functions.size > 0) {
    lines.push('');
    for (const fn of sketch.functions) {
      lines.push(fn);
      lines.push('');
    }
  }

  return lines.join('\n');
}

// ============================================================================
// Forbidden AVR patterns validator
// ============================================================================

/**
 * Valida sketch C++ contro forbidden AVR patterns BoardProfile.
 * Nano R4 = Renesas RA4M1 Cortex-M4, NO PORTB/DDRD/TCCR/OCR/TIMSK (registri AVR ATmega328p).
 *
 * @param {string} sketchCode
 * @param {object} boardProfile - es. loadBoardProfile('arduino-nano-r4')
 * @returns {{ ok: boolean, violations: Array<{ pattern: string, line: number, snippet: string }> }}
 */
export function validateNoForbidden(sketchCode, boardProfile) {
  if (typeof sketchCode !== 'string') {
    throw new TypeError('sketchCode must be string');
  }
  if (!boardProfile || !Array.isArray(boardProfile.forbiddenPatterns)) {
// © Andrea Marro — 15/05/2026 — ELAB Tutor — Tutti i diritti riservati
    throw new Error('boardProfile must contain forbiddenPatterns array');
  }

  const violations = [];
  const codeLines = sketchCode.split('\n');

  for (let i = 0; i < codeLines.length; i++) {
    const line = codeLines[i];
    for (const pattern of boardProfile.forbiddenPatterns) {
      // Word-boundary match per evitare partial matches (es. "PORTB" NON match "PORTBELLO")
      const regex = new RegExp(`\\b${pattern}\\b`);
      if (regex.test(line)) {
        violations.push({
          pattern,
          line: i + 1,
          snippet: line.trim().slice(0, 80),
        });
      }
    }
  }

  return {
    ok: violations.length === 0,
    violations,
  };
}

// ============================================================================
// Blink sketch generator (MVP smoke test)
// ============================================================================

/**
 * Genera sketch Blink minimal per Nano R4 (LED_BUILTIN su D13).
 * Use per integration test reale arduino-cli compile.
 *
 * @param {object} [opts]
 * @param {number} [opts.delayMs=500] - delay between blink toggles
 * @returns {string} Blink sketch
 */
export function buildBlinkSketch(opts = {}) {
  const { delayMs = 500 } = opts;
  if (typeof delayMs !== 'number' || delayMs <= 0) {
    throw new RangeError('delayMs must be positive number');
  }

  const sketch = createSketch();
  addSetup(sketch, 'pinMode(LED_BUILTIN, OUTPUT);');
  addLoop(sketch, 'digitalWrite(LED_BUILTIN, HIGH);');
  addLoop(sketch, `delay(${delayMs});`);
  addLoop(sketch, 'digitalWrite(LED_BUILTIN, LOW);');
  addLoop(sketch, `delay(${delayMs});`);

  return buildSketch(sketch);
}
