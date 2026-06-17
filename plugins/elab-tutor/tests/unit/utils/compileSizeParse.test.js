import { describe, it, expect } from 'vitest';
import {
  parseFlashFromStdout,
  intelHexProgramBytes,
  resolveCompileFlash,
  FLASH_TOTAL_NANO_R4,
} from '../../../src/utils/compileSizeParse.js';

// Exact arduino-cli stdout captured from a live Nano R4 compile (2026-05-20).
const LIVE_STDOUT =
  'Sketch uses 39048 bytes (14%) of program storage space. Maximum is 262144 bytes.\n' +
  'Global variables use 3940 bytes (12%) of dynamic memory, leaving 28828 bytes for local variables. Maximum is 32768 bytes.\n';

// Two Intel HEX data records of 0x10 (16) bytes each = 32 data bytes, + EOF.
const SAMPLE_HEX =
  ':10000000214601360121470136007EFE09D2190140\n' +
  ':100010002146017E17C20001FF5F16002148011928\n' +
  ':00000001FF\n';

describe('parseFlashFromStdout', () => {
  it('parses real flash usage + total from the Sketch-uses + Maximum lines', () => {
    // 2026-05-28 PR #183: total now derived from "Maximum is N bytes" line.
    expect(parseFlashFromStdout(LIVE_STDOUT)).toEqual({ bytes: 39048, percent: 14, total: 262144 });
  });

  it('matches the Sketch line, NOT the Global variables (RAM) line', () => {
    // 3940 bytes (12%) is RAM — must not leak into the flash figure.
    expect(parseFlashFromStdout(LIVE_STDOUT).bytes).toBe(39048);
  });

  it('parses UNO R3 flash total 32256 from picker-aware Maximum line', () => {
    // arduino-cli for `arduino:avr:uno` (ATmega328P) emits 32256 max.
    // Verifies the denominator no longer leaks Nano R4's 262144 figure
    // when the docente picks UNO R3 in BoardPicker.
    const unoStdout = 'Sketch uses 924 bytes (2%) of program storage space. Maximum is 32256 bytes.\n';
    expect(parseFlashFromStdout(unoStdout)).toEqual({ bytes: 924, percent: 2, total: 32256 });
  });

  it('strips thousands separators from the byte count + total', () => {
    expect(parseFlashFromStdout('Sketch uses 39.048 bytes (14%) of program storage space. Maximum is 262.144 bytes.'))
      .toEqual({ bytes: 39048, percent: 14, total: 262144 });
  });

  it('returns total:null when Maximum line absent (legacy stdout)', () => {
    expect(parseFlashFromStdout('Sketch uses 39048 bytes (14%) of program storage space.'))
      .toEqual({ bytes: 39048, percent: 14, total: null });
  });

  it('returns null on no match / non-string input', () => {
    expect(parseFlashFromStdout('no compile output here')).toBeNull();
    expect(parseFlashFromStdout(null)).toBeNull();
    expect(parseFlashFromStdout(undefined)).toBeNull();
    expect(parseFlashFromStdout(42)).toBeNull();
  });
});

describe('intelHexProgramBytes', () => {
  it('sums the byte counts of data records (type 00) only', () => {
    expect(intelHexProgramBytes(SAMPLE_HEX)).toBe(32);
  });

  it('ignores the EOF record (type 01)', () => {
    expect(intelHexProgramBytes(':00000001FF\n')).toBe(0);
  });

  it('ignores extended-address records (type 04)', () => {
    const withExt = ':020000040000FA\n:10000000214601360121470136007EFE09D2190140\n:00000001FF\n';
    expect(intelHexProgramBytes(withExt)).toBe(16);
  });

  it('returns null for non-Intel-HEX input', () => {
    expect(intelHexProgramBytes('not hex at all')).toBeNull();
    expect(intelHexProgramBytes('')).toBeNull();
    expect(intelHexProgramBytes(null)).toBeNull();
  });
});

describe('resolveCompileFlash', () => {
  it('regression iter-102: reports real flash, NOT the Intel HEX file size', () => {
    // Live response shape 2026-05-20: artifactSizeBytes/hexSize = 109863 is the
    // Intel HEX *file* size — the panel must show the real 39048 bytes (14%),
    // never 109863 (42%).
    const result = {
      output: LIVE_STDOUT,
      hex: btoa(SAMPLE_HEX),
      artifactSizeBytes: 109863,
    };
    expect(resolveCompileFlash(result)).toEqual({ bytes: 39048, total: 262144, percent: 14 });
  });

  it('falls back to base64 Intel HEX data records when stdout is absent', () => {
    const flash = resolveCompileFlash({ output: null, hex: btoa(SAMPLE_HEX) });
    expect(flash.bytes).toBe(32);
    expect(flash.total).toBe(FLASH_TOTAL_NANO_R4);
  });

  it('falls back to raw Intel HEX text when stdout is absent', () => {
    const flash = resolveCompileFlash({ output: '', hex: SAMPLE_HEX });
    expect(flash.bytes).toBe(32);
  });

  it('returns null when no honest figure is available', () => {
    expect(resolveCompileFlash(null)).toBeNull();
    expect(resolveCompileFlash({})).toBeNull();
    expect(resolveCompileFlash({ output: 'garbage', hex: 'not-base64-not-hex-@@@' })).toBeNull();
  });
});
