// © Andrea Marro — 25/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * intelHexValidator — Intel HEX format validation + size cap.
 *
 * Spec source: PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md
 *   Sezione 4 item 6   — HEX bytes validation (Intel HEX format checksum)
 *   Sezione 20 item 3  — HEX binary validation Intel HEX checksum + size cap 32KB
 *
 * Defensive: rifiuta HEX malformato PRIMA di passarlo a AVRBridge.uploadHex
 * o a Web Serial STK500. Previene crash emulator e flash corrotto su Arduino fisico.
 *
 * Intel HEX line format (ASCII):
 *
 *   :LLAAAATT[DD...]CC
 *     :        start marker (colon)
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
 *     CC       checksum (two's complement of sum of LL+AAAA bytes+TT+DD bytes, mod 256)
 *
 * Esempio EOF-only:  :00000001FF
 *   LL=00, AAAA=0000, TT=01, no data, checksum = -(00+00+00+01) & 0xFF = 0xFF
 */

/** ATmega328p (Arduino Uno classic) flash: 32 KB. */
export const ATMEGA328P_FLASH_BYTES = 32 * 1024;

/** Renesas RA4M1 (Arduino Nano R4) flash: 256 KB (vedi compileSizeParse.js). */
export const NANO_R4_FLASH_BYTES = 256 * 1024;

/**
 * Default size cap. Usa ATmega328p come default difensivo —
 * caller deve specificare maxBytes esplicito quando target è Nano R4 / altro.
 */
export const DEFAULT_SIZE_CAP_BYTES = ATMEGA328P_FLASH_BYTES;

/** Regex per linea Intel HEX valida (case-insensitive sui caratteri hex). */
const HEX_LINE_RE = /^:([0-9a-fA-F]{2})([0-9a-fA-F]{4})([0-9a-fA-F]{2})([0-9a-fA-F]*)([0-9a-fA-F]{2})$/;

/** Record type EOF. */
const RECORD_TYPE_EOF = 0x01;

/**
 * Valida una stringa Intel HEX completa: format + checksum per riga + EOF presente
 * + size cap rispettato. Ritorna {valid, sizeBytes, error}.
 *
 * @param {string} hexString - testo HEX (multi-line, CRLF o LF, trim auto).
 * @param {object} [opts]
 * @param {number} [opts.maxBytes=DEFAULT_SIZE_CAP_BYTES] - cap dimensione dati in byte.
 * @returns {{valid:boolean, sizeBytes:number, error:(string|null)}}
 */
export function validateIntelHex(hexString, opts = {}) {
  const maxBytes = opts.maxBytes ?? DEFAULT_SIZE_CAP_BYTES;

  if (hexString == null) {
    return { valid: false, sizeBytes: 0, error: 'Input vuoto (null/undefined)' };
  }
  if (typeof hexString !== 'string') {
    return { valid: false, sizeBytes: 0, error: 'Input non è stringa' };
  }
  const trimmed = hexString.trim();
  if (trimmed.length === 0) {
    return { valid: false, sizeBytes: 0, error: 'Input vuoto' };
  }

  const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

  let totalDataBytes = 0;
  let sawEof = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line[0] !== ':') {
      return {
        valid: false,
        sizeBytes: totalDataBytes,
        error: `Riga ${i + 1}: deve iniziare con ':' (formato Intel HEX, trovato '${line[0]}')`,
      };
    }

    const m = line.match(HEX_LINE_RE);
    if (!m) {
      return {
        valid: false,
        sizeBytes: totalDataBytes,
        error: `Riga ${i + 1}: formato non valido o caratteri hex illegali`,
      };
    }

    const llByte = parseInt(m[1], 16);
    const addrHi = parseInt(m[2].slice(0, 2), 16);
    const addrLo = parseInt(m[2].slice(2, 4), 16);
    const ttByte = parseInt(m[3], 16);
    const dataHex = m[4];
    const ccByte = parseInt(m[5], 16);

    // Data length must match LL byte
    if (dataHex.length !== llByte * 2) {
      return {
        valid: false,
        sizeBytes: totalDataBytes,
        error: `Riga ${i + 1}: byte count LL=${llByte} non coincide con data length=${dataHex.length / 2}`,
      };
    }

    // Compute checksum: sum all bytes (LL + AAAA + TT + data) two's complement = CC
    let sum = llByte + addrHi + addrLo + ttByte;
    for (let j = 0; j < llByte; j++) {
      sum += parseInt(dataHex.slice(j * 2, j * 2 + 2), 16);
    }
    const expectedCC = ((-sum) >>> 0) & 0xff;
    if (expectedCC !== ccByte) {
      return {
        valid: false,
        sizeBytes: totalDataBytes,
        error: `Riga ${i + 1}: checksum invalido (atteso 0x${expectedCC.toString(16).padStart(2, '0').toUpperCase()}, trovato 0x${ccByte.toString(16).padStart(2, '0').toUpperCase()})`,
      };
    }

    // Accumulate data bytes for size cap
    if (ttByte === 0x00) {
      totalDataBytes += llByte;
    }

    if (ttByte === RECORD_TYPE_EOF) {
      sawEof = true;
      // EOF should be last record (lenient: allow trailing whitespace already trimmed)
    }
  }

  if (!sawEof) {
    return {
      valid: false,
      sizeBytes: totalDataBytes,
      error: 'Manca record EOF (end-of-file, tipo 01)',
    };
  }

  if (totalDataBytes > maxBytes) {
    return {
      valid: false,
      sizeBytes: totalDataBytes,
      error: `Dimensione ${totalDataBytes} byte supera cap ${maxBytes} byte`,
    };
  }

  return { valid: true, sizeBytes: totalDataBytes, error: null };
}

/**
 * Helper conveniente: ritorna solo dimensione data byte se HEX valido, altrimenti null.
 * Non applica size cap (utile per misura pre-cap).
 *
 * @param {string} hexString
 * @returns {number|null}
 */
export function parseIntelHexSize(hexString) {
  const result = validateIntelHex(hexString, { maxBytes: Number.POSITIVE_INFINITY });
  return result.valid ? result.sizeBytes : null;
}
