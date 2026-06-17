/**
 * inBrowserAvrCompiler — Real Arduino → AVR machine code, in the browser.
 *
 * Compiles a bounded subset of Arduino C++ to ATmega328P machine code with
 * no backend dependency. Output is Intel HEX text loadable by avr8js or any
 * stk500v1 bootloader. Used as the FIRST compile step in the fallback chain
 * so docente can flash a real Nano (or simulate) without network access.
 *
 * Supported primitives (Vol3 experiment surface):
 *   pinMode(pin, OUTPUT | INPUT | INPUT_PULLUP)
 *   digitalWrite(pin, HIGH | LOW)
 *   delay(constant ms)
 *   (const) int IDENTIFIER = number;
 *
 * Unsupported (compiler returns null reason → caller falls through to
 * remote compile chain): Serial.*, analogRead, analogWrite, tone, runtime
 * arithmetic, conditionals, function calls, library includes.
 *
 * Memory map (ATmega328P I/O space addresses for SBI/CBI):
 *   PINB=0x03 DDRB=0x04 PORTB=0x05
 *   PINC=0x06 DDRC=0x07 PORTC=0x08
 *   PIND=0x09 DDRD=0x0A PORTD=0x0B
 *
 * Clock: 16 MHz. delay(ms) emits a calibrated 3-cycle busy loop scaled by ms.
 *
 * @copyright © Andrea Marro — 2026-05-27 — ELAB Tutor
 */

const IO_DDRB = 0x04;
const IO_PORTB = 0x05;
const IO_DDRC = 0x07;
const IO_PORTC = 0x08;
const IO_DDRD = 0x0A;
const IO_PORTD = 0x0B;

function pinToPort(pin) {
  if (pin >= 0 && pin <= 7) return { ddr: IO_DDRD, port: IO_PORTD, bit: pin };
  if (pin >= 8 && pin <= 13) return { ddr: IO_DDRB, port: IO_PORTB, bit: pin - 8 };
  if (pin >= 14 && pin <= 19) return { ddr: IO_DDRC, port: IO_PORTC, bit: pin - 14 };
  return null;
}

// ── Instruction encoders ────────────────────────────────────────────────
function enc_sbi(ioAddr, bit) {
  const w = 0x9A00 | ((ioAddr & 0x1F) << 3) | (bit & 0x07);
  return [w & 0xFF, (w >> 8) & 0xFF];
}

function enc_cbi(ioAddr, bit) {
  const w = 0x9800 | ((ioAddr & 0x1F) << 3) | (bit & 0x07);
  return [w & 0xFF, (w >> 8) & 0xFF];
}

function enc_rjmp(wordOffset) {
  const k = wordOffset & 0xFFF;
  const w = 0xC000 | k;
  return [w & 0xFF, (w >> 8) & 0xFF];
}

function enc_nop() {
  return [0x00, 0x00];
}

function enc_ldi(reg, imm) {
  if (reg < 16 || reg > 31) throw new Error('LDI requires R16-R31');
  const d = (reg - 16) & 0x0F;
  const K = imm & 0xFF;
  const w = 0xE000 | ((K & 0xF0) << 4) | (d << 4) | (K & 0x0F);
  return [w & 0xFF, (w >> 8) & 0xFF];
}

function enc_dec(reg) {
  const d = reg & 0x1F;
  const w = 0x940A | (d << 4);
  return [w & 0xFF, (w >> 8) & 0xFF];
}

function enc_brne(wordOffset) {
  const k = wordOffset & 0x7F;
  const w = 0xF401 | (k << 3);
  return [w & 0xFF, (w >> 8) & 0xFF];
}

function enc_cli() {
  return [0xF8, 0x94];
}

function enc_eor(rd, rr) {
  const dLow = rd & 0x0F;
  const dHigh = (rd >> 4) & 0x01;
  const rLow = rr & 0x0F;
  const rHigh = (rr >> 4) & 0x01;
  const w = 0x2400 | (rHigh << 9) | (dHigh << 8) | (dLow << 4) | rLow;
  return [w & 0xFF, (w >> 8) & 0xFF];
}

// ── delay(ms) inline emitter — calibrated 16MHz busy loop ───────────────
function emitDelay(ms) {
  const bytes = [];
  const N = Math.max(1, Math.floor((ms * 16000) / 3));
  const capped = Math.min(N, 0xFFFFFF);
  const lo = capped & 0xFF;
  const mid = (capped >> 8) & 0xFF;
  const hi = (capped >> 16) & 0xFF;
  bytes.push(...enc_ldi(24, lo));
  bytes.push(...enc_ldi(25, mid));
  bytes.push(...enc_ldi(26, hi));
  // AVR BRNE: target_PC = PC + k + 1 (k is signed 7-bit, relative to next).
  // To re-execute the immediately preceding DEC, k = -2:
  //   BRNE at PC, DEC at PC-1 ⇒ PC + (-2) + 1 = PC - 1 ✓
  // For BRNE_R25 (2 words past DEC R24) ⇒ k = -4.
  // For BRNE_R26 (4 words past DEC R24) ⇒ k = -6.
  // Adversarial-review HIGH-1 fix 2026-05-27: prior offsets -1/-3/-5 made
  // BRNE branch to itself ⇒ delay() hung forever ⇒ sketch frozen.
  bytes.push(...enc_dec(24));
  bytes.push(...enc_brne(-2 & 0x7F));
  bytes.push(...enc_dec(25));
  bytes.push(...enc_brne(-4 & 0x7F));
  bytes.push(...enc_dec(26));
  bytes.push(...enc_brne(-6 & 0x7F));
  return bytes;
}

// ── Const map ───────────────────────────────────────────────────────────
function buildConstMap(source) {
  const map = new Map();
  const re = /(?:const\s+)?int\s+([A-Za-z_]\w*)\s*=\s*(\d+)\s*;/g;
  for (const m of source.matchAll(re)) {
    map.set(m[1], parseInt(m[2], 10));
  }
  return map;
}

function resolvePin(token, constMap) {
  if (/^\d+$/.test(token)) return parseInt(token, 10);
  if (constMap.has(token)) return constMap.get(token);
  return null;
}

// ── Find setup() / loop() bodies via brace balance ──────────────────────
function findBody(source, name) {
  const headRe = new RegExp(`void\\s+${name}\\s*\\(\\s*\\)\\s*\\{`);
  const head = source.match(headRe);
  if (!head) return null;
  const startIndex = head.index + head[0].length;
  let depth = 1;
  let i = startIndex;
  while (i < source.length && depth > 0) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') depth--;
    i++;
  }
  if (depth !== 0) return null;
  return source.slice(startIndex, i - 1);
}

// ── Statement parser (regex-based, bounded subset) ──────────────────────
const PIN_MODE_LINE = /^pinMode\s*\(\s*([A-Za-z_0-9]+)\s*,\s*(OUTPUT|INPUT_PULLUP|INPUT)\s*\)$/;
const DIGITAL_WRITE_LINE = /^digitalWrite\s*\(\s*([A-Za-z_0-9]+)\s*,\s*(HIGH|LOW)\s*\)$/;
const DELAY_LINE = /^delay\s*\(\s*(\d+)\s*\)$/;

function parseStatements(body, constMap) {
  const stmts = [];
  let unsupportedHit = false;

  const lines = body.split(/[\n;]/);
  for (const rawLine of lines) {
    const line = rawLine.replace(/\/\/.*$/, '').trim();
    if (!line) continue;

    const pm = line.match(PIN_MODE_LINE);
    if (pm) {
      const pin = resolvePin(pm[1], constMap);
      if (pin === null) { unsupportedHit = true; break; }
      stmts.push({ type: 'PinMode', pin, mode: pm[2] });
      continue;
    }
    const dw = line.match(DIGITAL_WRITE_LINE);
    if (dw) {
      const pin = resolvePin(dw[1], constMap);
      if (pin === null) { unsupportedHit = true; break; }
      stmts.push({ type: 'DigitalWrite', pin, value: dw[2] });
      continue;
    }
    const dl = line.match(DELAY_LINE);
    if (dl) {
      stmts.push({ type: 'Delay', ms: parseInt(dl[1], 10) });
      continue;
    }
    unsupportedHit = true;
    break;
  }

  return { stmts, unsupportedHit };
}

function codegenStatements(stmts) {
  const bytes = [];
  for (const stmt of stmts) {
    if (stmt.type === 'PinMode') {
      const pp = pinToPort(stmt.pin);
      if (!pp) throw new Error(`Unsupported pin ${stmt.pin}`);
      if (stmt.mode === 'OUTPUT') {
        bytes.push(...enc_sbi(pp.ddr, pp.bit));
      } else if (stmt.mode === 'INPUT') {
        bytes.push(...enc_cbi(pp.ddr, pp.bit));
        bytes.push(...enc_cbi(pp.port, pp.bit));
      } else if (stmt.mode === 'INPUT_PULLUP') {
        bytes.push(...enc_cbi(pp.ddr, pp.bit));
        bytes.push(...enc_sbi(pp.port, pp.bit));
      }
    } else if (stmt.type === 'DigitalWrite') {
      const pp = pinToPort(stmt.pin);
      if (!pp) throw new Error(`Unsupported pin ${stmt.pin}`);
      if (stmt.value === 'HIGH') bytes.push(...enc_sbi(pp.port, pp.bit));
      else if (stmt.value === 'LOW') bytes.push(...enc_cbi(pp.port, pp.bit));
    } else if (stmt.type === 'Delay') {
      bytes.push(...emitDelay(stmt.ms));
    }
  }
  return bytes;
}

// ── Intel HEX serialization ─────────────────────────────────────────────
function toIntelHex(bytes) {
  const lines = [];
  const CHUNK = 16;
  for (let addr = 0; addr < bytes.length; addr += CHUNK) {
    const len = Math.min(CHUNK, bytes.length - addr);
    let line = `:${len.toString(16).padStart(2, '0').toUpperCase()}${addr
      .toString(16)
      .padStart(4, '0')
      .toUpperCase()}00`;
    let sum = len + (addr & 0xFF) + ((addr >> 8) & 0xFF) + 0x00;
    for (let i = 0; i < len; i++) {
      const b = bytes[addr + i];
      line += b.toString(16).padStart(2, '0').toUpperCase();
      sum = (sum + b) & 0xFF;
    }
    const checksum = ((~sum + 1) & 0xFF).toString(16).padStart(2, '0').toUpperCase();
    lines.push(line + checksum);
  }
  lines.push(':00000001FF');
  return lines.join('\r\n') + '\r\n';
}

/**
 * Compile a bounded subset of Arduino C++ to ATmega328P Intel HEX.
 *
 * Currently supports the ATmega328P pin map (Uno R3 + Nano). Other AVR
 * variants (Mega2560, Leonardo) and non-AVR families (Renesas RA4M1,
 * SAMD, ESP32) return { success: false, reason: 'unsupported_board' }
 * — caller falls through to precompiled HEX or remote compile.
 *
 * @param {string} source — Arduino C++ source
 * @param {object} [options]
 * @param {string} [options.board='nano'] — board id from arduinoBoards.js
 * @returns {{ success: true, hex: string, size: number, board: string }
 *          | { success: false, reason: string }}
 */
const SUPPORTED_BOARDS_328P = new Set(['nano', 'nano-optiboot', 'uno']);

export function compileArduinoInBrowser(source, options = {}) {
  const boardId = options.board || 'nano';

  if (!SUPPORTED_BOARDS_328P.has(boardId)) {
    return { success: false, reason: 'unsupported_board' };
  }

  if (typeof source !== 'string' || source.length === 0) {
    return { success: false, reason: 'empty_source' };
  }

  const constMap = buildConstMap(source);
  const setupBody = findBody(source, 'setup');
  const loopBody = findBody(source, 'loop');
  if (setupBody === null || loopBody === null) {
    return { success: false, reason: 'missing_setup_or_loop' };
  }

  const setupParsed = parseStatements(setupBody, constMap);
  const loopParsed = parseStatements(loopBody, constMap);
  if (setupParsed.unsupportedHit || loopParsed.unsupportedHit) {
    return { success: false, reason: 'unsupported_statement' };
  }

  // Layout:
  //   word 0:     RJMP to main (skip interrupt table; 25 words forward)
  //   words 1-25: NOP filler for unused interrupt vectors
  //   main:       CLI / EOR R1,R1 / <setup body> / <loop body> / RJMP loop_top
  const bytes = [];
  bytes.push(...enc_rjmp(25));
  for (let i = 0; i < 25; i++) bytes.push(...enc_nop());

  bytes.push(...enc_cli());
  bytes.push(...enc_eor(1, 1));
  bytes.push(...codegenStatements(setupParsed.stmts));

  const loopTopByteOffset = bytes.length;
  bytes.push(...codegenStatements(loopParsed.stmts));
  const wordsForward = (bytes.length - loopTopByteOffset) / 2;
  bytes.push(...enc_rjmp((-wordsForward) & 0xFFF));

  if (bytes.length > 32 * 1024) {
    return { success: false, reason: 'overflow' };
  }

  return {
    success: true,
    hex: toIntelHex(bytes),
    size: bytes.length,
    board: boardId,
  };
}

// Expose internal encoders for unit tests.
export const _internals = {
  enc_sbi,
  enc_cbi,
  enc_rjmp,
  enc_ldi,
  enc_dec,
  enc_brne,
  pinToPort,
  toIntelHex,
  buildConstMap,
  parseStatements,
};
