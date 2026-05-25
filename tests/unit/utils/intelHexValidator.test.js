// © Andrea Marro — 25/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * intelHexValidator — Intel HEX format validation + size cap.
 *
 * Spec source: PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md
 *   Sezione 4 item 6 — HEX bytes validation (Intel HEX format checksum)
 *   Sezione 20 item 3 — HEX binary validation Intel HEX checksum + size cap 32KB
 *
 * Intel HEX line format:
 *   :LLAAAATT[DD...]CC
 *     :        start marker
 *     LL       byte count of data field (hex, 2 chars)
 *     AAAA     load address (hex, 4 chars)
 *     TT       record type (hex, 2 chars)
 *                00 = data
 *                01 = end-of-file
 *                02 = extended segment address
 *                03 = start segment address
 *                04 = extended linear address
 *                05 = start linear address
 *     DD..     data bytes (hex, 2 chars each)
 *     CC       checksum (two's complement of sum of all bytes from LL onward)
 */

import { describe, it, expect } from 'vitest';
import {
  validateIntelHex,
  parseIntelHexSize,
  DEFAULT_SIZE_CAP_BYTES,
  ATMEGA328P_FLASH_BYTES,
  NANO_R4_FLASH_BYTES,
} from '../../../src/utils/intelHexValidator.js';

// Fixtures: known-good minimal Intel HEX strings (manually verified checksums).

// Single data record: 4 bytes 0x00 at address 0x0000, then EOF.
// :04 0000 00 00000000 FC
//   LL=04 AAAA=0000 TT=00 DD=00 00 00 00 CC=FC
//   checksum: sum = 04+00+00+00 + 00+00+00+00 = 04 → two's compl = FC
const MINIMAL_HEX_4BYTES = `:04000000000000000FC
:00000001FF
`;

// Cleaner correct version (recomputed):
//   LL=04 AAAA=0000 TT=00 DD=00 00 00 00
//   sum bytes: 04+00+00+00+00+00+00+00 = 04 → two's compl 8-bit = 0xFC
const MINIMAL_HEX_4BYTES_CLEAN = ':0400000000000000FC\n:00000001FF\n';

// EOF-only: minimal valid HEX file.
//   :00000001FF
//   LL=00 AAAA=0000 TT=01 → no data → checksum = -(00+00+00+01) = 0xFF
const EOF_ONLY = ':00000001FF\n';

// Single data 16 bytes 0x42 starting addr 0x0100, EOF
//   LL=10 AAAA=0100 TT=00 DD= 16x 0x42
//   sum data: 16 * 0x42 = 0x420 → 16 * 66 = 1056 → 0x420
//   sum header: 10+01+00+00 = 0x11 → 17
//   total = 1056 + 17 = 1073 = 0x431 → low byte 0x31 → two's compl = 0xCF
const HEX_16BYTES = ':1001000042424242424242424242424242424242CF\n:00000001FF\n';

// Broken checksum
const HEX_BAD_CHECKSUM = ':0400000000000000FF\n:00000001FF\n';

// Missing EOF
const HEX_NO_EOF = ':0400000000000000FC\n';

// Empty / nonsense
const HEX_NOT_STARTING_COLON = '0400000000000000FC\n';
const HEX_INVALID_CHARS = ':04000000GGGGGGGGFC\n:00000001FF\n';

describe('intelHexValidator — constants', () => {
  it('exports ATmega328p flash size = 32768 bytes', () => {
    expect(ATMEGA328P_FLASH_BYTES).toBe(32 * 1024);
  });

  it('exports Nano R4 flash size = 262144 bytes', () => {
    expect(NANO_R4_FLASH_BYTES).toBe(256 * 1024);
  });

  it('default size cap = ATmega328p flash (defensive default)', () => {
    expect(DEFAULT_SIZE_CAP_BYTES).toBe(ATMEGA328P_FLASH_BYTES);
  });
});

describe('intelHexValidator — validateIntelHex', () => {
  it('accepts minimal EOF-only HEX', () => {
    const result = validateIntelHex(EOF_ONLY);
    expect(result.valid).toBe(true);
    expect(result.sizeBytes).toBe(0);
    expect(result.error).toBeNull();
  });

  it('accepts 4-byte data record with valid checksum', () => {
    const result = validateIntelHex(MINIMAL_HEX_4BYTES_CLEAN);
    expect(result.valid).toBe(true);
    expect(result.sizeBytes).toBe(4);
    expect(result.error).toBeNull();
  });

  it('accepts 16-byte data record with valid checksum', () => {
    const result = validateIntelHex(HEX_16BYTES);
    expect(result.valid).toBe(true);
    expect(result.sizeBytes).toBe(16);
    expect(result.error).toBeNull();
  });

  it('rejects bad checksum', () => {
    const result = validateIntelHex(HEX_BAD_CHECKSUM);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/checksum/i);
  });

  it('rejects missing EOF record', () => {
    const result = validateIntelHex(HEX_NO_EOF);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/eof|end-of-file/i);
  });

  it('rejects line not starting with colon', () => {
    const result = validateIntelHex(HEX_NOT_STARTING_COLON);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/colon|format/i);
  });

  it('rejects invalid hex chars in payload', () => {
    const result = validateIntelHex(HEX_INVALID_CHARS);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/hex|caratter/i);
  });

  it('rejects empty input', () => {
    const result = validateIntelHex('');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/vuoto|empty/i);
  });

  it('rejects null/undefined input', () => {
    expect(validateIntelHex(null).valid).toBe(false);
    expect(validateIntelHex(undefined).valid).toBe(false);
  });

  it('enforces default size cap (32KB ATmega328p)', () => {
    // Build a HEX line with 0x80 (128) bytes data — record type 0 cap.
    // Actually Intel HEX max data per record = 255, so simulate via many records.
    // For brevity test: directly compute by hex with size > cap using oversized records virtually.
    // Use 256 records of 128 bytes = 32768 bytes — at cap, should pass.
    // Use 257 records of 128 bytes = 32896 bytes — over cap, should fail.

    // Generate records helper (kept inline test for clarity).
    const makeRecord = (addrHigh) => {
      // 128 bytes of 0x00 at addr 0xHH00.
      const ll = 0x80;
      const aaaa = (addrHigh & 0xff) << 8;
      const tt = 0x00;
      const sumHeader = ll + ((aaaa >> 8) & 0xff) + (aaaa & 0xff) + tt;
      const sumData = 0; // 128 zeros
      const sumTotal = (sumHeader + sumData) & 0xff;
      const cc = (-sumTotal) & 0xff;
      const hexAddr = aaaa.toString(16).padStart(4, '0').toUpperCase();
      const dataHex = '00'.repeat(128);
      const ccHex = cc.toString(16).padStart(2, '0').toUpperCase();
      return `:80${hexAddr}00${dataHex}${ccHex}`;
    };

    // 256 records (32 KB exact) — should pass
    const atCap = Array.from({ length: 256 }, (_, i) => makeRecord(i)).join('\n')
      + '\n:00000001FF\n';
    const atCapResult = validateIntelHex(atCap);
    expect(atCapResult.valid).toBe(true);
    expect(atCapResult.sizeBytes).toBe(32768);

    // Over cap: 257 * 128 = 32896 bytes
    // Note: addrHigh > 0xFF doesn't fit, but for size calc we just count data bytes.
    // Use overlapping addresses — validator counts cumulative data, not unique addresses.
    const overCap = Array.from({ length: 257 }, (_, i) => makeRecord(i & 0xff)).join('\n')
      + '\n:00000001FF\n';
    const overCapResult = validateIntelHex(overCap);
    expect(overCapResult.valid).toBe(false);
    expect(overCapResult.error).toMatch(/size|cap|byte/i);
  });

  it('respects custom maxBytes cap (Nano R4 256KB)', () => {
    // 4-byte HEX, cap = NANO_R4 → pass
    const result = validateIntelHex(MINIMAL_HEX_4BYTES_CLEAN, { maxBytes: NANO_R4_FLASH_BYTES });
    expect(result.valid).toBe(true);
  });

  it('respects custom maxBytes cap (artificially low → fail)', () => {
    const result = validateIntelHex(HEX_16BYTES, { maxBytes: 8 });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/size|cap|byte/i);
  });

  it('handles CRLF line endings', () => {
    const crlf = MINIMAL_HEX_4BYTES_CLEAN.replace(/\n/g, '\r\n');
    const result = validateIntelHex(crlf);
    expect(result.valid).toBe(true);
    expect(result.sizeBytes).toBe(4);
  });

  it('handles trailing whitespace', () => {
    const padded = '  ' + MINIMAL_HEX_4BYTES_CLEAN + '  ';
    const result = validateIntelHex(padded);
    expect(result.valid).toBe(true);
  });
});

describe('intelHexValidator — parseIntelHexSize (convenience)', () => {
  it('returns data byte count for valid HEX', () => {
    expect(parseIntelHexSize(MINIMAL_HEX_4BYTES_CLEAN)).toBe(4);
    expect(parseIntelHexSize(HEX_16BYTES)).toBe(16);
    expect(parseIntelHexSize(EOF_ONLY)).toBe(0);
  });

  it('returns null for invalid HEX', () => {
    expect(parseIntelHexSize(HEX_BAD_CHECKSUM)).toBeNull();
    expect(parseIntelHexSize('')).toBeNull();
    expect(parseIntelHexSize(null)).toBeNull();
  });
});
