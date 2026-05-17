/**
 * intelHexParser.js — iter 78 B.2.2 Intel HEX format parser for WebUSB DFU flash.
 *
 * Andrea mandate iter 78 entrance: "no demo, deve funzionare certamente".
 * Cross-compile cloud Render returns hex bytes wrapped in canonical Intel HEX
 * format (per arduino-cli output) base64-encoded. WebUSB DFU library (`dfu`
 * npm flipperdevices) expects binary ArrayBuffer/Uint8Array. This parser
 * bridges: hexBase64 → Uint8Array binary flash image.
 *
 * Intel HEX 16-bit format reference: https://en.wikipedia.org/wiki/Intel_HEX
 *
 * Record types supported:
 *   00 — Data record (address + data bytes)
 *   01 — End of file
 *   04 — Extended linear address (high 16 bits of 32-bit address)
 *   05 — Start linear address (entry point — informational, ignored)
 *
 * NOT supported (Nano R4 RA4M1 doesn't emit these):
 *   02 — Extended segment address (8086 real mode)
 *   03 — Start segment address (8086 real mode)
 *
 * Renesas RA4M1 firmware base address: 0x00000000 (flash) — single-segment
 * typical Blink output, MA arduino-cli may emit 04 extended record for
 * larger sketches > 64KB. Parser handles both.
 *
 * Output: contiguous Uint8Array starting from min address found in records.
 * Sparse address ranges filled with 0xFF (NOR flash erased state).
 *
 * @copyright © Andrea Marro — 2026 — ELAB Tutor iter 78 B.2.2
 */

/**
 * Decode base64 string to Uint8Array of ASCII bytes.
 *
 * @param {string} base64 — base64 encoded Intel HEX text
 * @returns {Uint8Array} ASCII bytes of HEX text
 */
function base64ToAsciiBytes(base64) {
  if (typeof atob === 'function') {
    const binStr = atob(base64);
    const out = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) out[i] = binStr.charCodeAt(i);
    return out;
  }
  // Node fallback (testing)
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }
  throw new Error('No base64 decoder available (atob/Buffer)');
}

/**
 * Parse single Intel HEX record line.
 *
 * @param {string} line — single record starting with ':' (without trailing CRLF)
 * @returns {{byteCount, address, recordType, data, checksum}}
 */
function parseRecord(line) {
  if (line.charCodeAt(0) !== 58) { // ':'
    throw new Error(`Invalid record (missing colon): ${line.substring(0, 20)}`);
  }
  const hex = line.substring(1);
  if (hex.length < 10) throw new Error(`Record too short: ${line}`);
  const byteCount = parseInt(hex.substring(0, 2), 16);
  const address = parseInt(hex.substring(2, 6), 16);
  const recordType = parseInt(hex.substring(6, 8), 16);
  const dataEnd = 8 + byteCount * 2;
  if (hex.length < dataEnd + 2) {
    throw new Error(`Record length mismatch: declared ${byteCount} bytes, line short`);
  }
  const data = new Uint8Array(byteCount);
  for (let i = 0; i < byteCount; i++) {
    data[i] = parseInt(hex.substring(8 + i * 2, 10 + i * 2), 16);
  }
  const checksum = parseInt(hex.substring(dataEnd, dataEnd + 2), 16);

  // Verify checksum: two's complement of sum of bytes
  let sum = byteCount + ((address >> 8) & 0xFF) + (address & 0xFF) + recordType;
  for (let i = 0; i < byteCount; i++) sum += data[i];
  const expectedChk = (0x100 - (sum & 0xFF)) & 0xFF;
  if (checksum !== expectedChk) {
    throw new Error(`Checksum mismatch line "${line.substring(0, 30)}": got 0x${checksum.toString(16)} expected 0x${expectedChk.toString(16)}`);
  }
  return { byteCount, address, recordType, data, checksum };
}

/**
 * Production safety guards per Codex Pattern C iter 78 review:
 *   MAX_FLASH_SIZE_BYTES — Nano R4 RA4M1 flash 256KB. Reject larger.
 *   MAX_SPARSE_GAP_BYTES — Reject if min/max range exceeds 1MB
 *     (catches absurd far-apart segments that would balloon memory).
 */
const MAX_FLASH_SIZE_BYTES = 256 * 1024; // Arduino Nano R4 256KB flash
const MAX_SPARSE_GAP_BYTES = 1024 * 1024; // 1MB sanity cap

/**
 * Parse Intel HEX text content into linear binary image + metadata.
 *
 * Production safety guards (iter 78 Codex Pattern C review):
 * - EOF record MUST be LAST line (records after EOF → reject)
 * - Overlapping data records → reject unless byte-identical
 * - Total size > 256KB → reject (Nano R4 flash overrun)
 * - Sparse range > 1MB → reject (absurd address layout)
 *
 * @param {string} hexText — full Intel HEX text (multi-line, may have CRLF or LF)
 * @returns {{binary: Uint8Array, startAddress: number, endAddress: number, recordCount: number}}
 */
export function parseIntelHexText(hexText) {
  if (typeof hexText !== 'string' || hexText.length === 0) {
    throw new Error('Empty HEX text');
  }
  const lines = hexText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const segments = []; // [{addr, data}]
  let extendedAddress = 0;
  let recordCount = 0;
  let eofSeen = false;
  let eofIndex = -1;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    const rec = parseRecord(line);
    recordCount++;
    if (eofSeen) {
      // Codex iter 78 review: EOF must be LAST.
      throw new Error(`Records found after EOF (type 01) at line ${lineIdx + 1}`);
    }
    switch (rec.recordType) {
      case 0x00: { // Data record
        const linearAddress = (extendedAddress << 16) + rec.address;
        segments.push({ addr: linearAddress, data: rec.data });
        break;
      }
      case 0x01: // End of file
        eofSeen = true;
        eofIndex = lineIdx;
        break;
      case 0x04: // Extended linear address
        if (rec.data.length !== 2) throw new Error('Type 04 must have 2 data bytes');
        extendedAddress = (rec.data[0] << 8) | rec.data[1];
        break;
      case 0x03: // Start segment address (8086 CS:IP — informational, ignored for ARM)
        break;
      case 0x05: // Start linear address (entry point, informational, ignored)
        break;
      case 0x02: // Extended segment address (8086 real mode — paragraph<<4 added to address)
        // Renesas + AVR arduino-cli output may include this; treat as no-op
        // for now since Renesas RA4M1 firmware base is 0x00000000.
        break;
      default:
        throw new Error(`Unsupported record type 0x${rec.recordType.toString(16)}`);
    }
  }

  if (!eofSeen) {
    throw new Error('No EOF record (type 01) found — truncated HEX');
  }
  if (segments.length === 0) {
    throw new Error('No data records found');
  }

  // Compute linear address range
  let minAddr = Infinity;
  let maxAddr = 0;
  for (const seg of segments) {
    if (seg.addr < minAddr) minAddr = seg.addr;
    const segEnd = seg.addr + seg.data.length;
    if (segEnd > maxAddr) maxAddr = segEnd;
  }

  const totalSize = maxAddr - minAddr;

  // Codex iter 78 review guards:
  if (totalSize > MAX_SPARSE_GAP_BYTES) {
    throw new Error(`Sparse address range too large: ${totalSize} bytes (max ${MAX_SPARSE_GAP_BYTES})`);
  }
  if (totalSize > MAX_FLASH_SIZE_BYTES) {
    throw new Error(`Firmware too large: ${totalSize} bytes (Nano R4 max ${MAX_FLASH_SIZE_BYTES})`);
  }

  // NOR flash erased = 0xFF (Renesas RA4M1 convention)
  const binary = new Uint8Array(totalSize).fill(0xFF);
  // Overlap detection: track written ranges. Identical-byte overlap allowed,
  // conflicting overlap rejected (typical arduino-cli output has none MA
  // hostile/corrupt HEX may contain — production safety).
  const writtenMarker = new Uint8Array(totalSize); // 0=unwritten, 1=written
  for (const seg of segments) {
    const offset = seg.addr - minAddr;
    for (let i = 0; i < seg.data.length; i++) {
      const pos = offset + i;
      if (writtenMarker[pos] && binary[pos] !== seg.data[i]) {
        throw new Error(`Conflicting overlapping records at address 0x${(minAddr + pos).toString(16)}`);
      }
      binary[pos] = seg.data[i];
      writtenMarker[pos] = 1;
    }
  }

  return {
    binary,
    startAddress: minAddr,
    endAddress: maxAddr,
    recordCount,
  };
}

/**
 * Decode base64-encoded Intel HEX text + parse → binary image.
 *
 * Cloud Render compile response shape (iter 76 D.3 OpenAPI 3.1):
 *   { ok: true, jobId, hexBase64: "<base64 of Intel HEX text>", stdout, stderr }
 *
 * @param {string} hexBase64 — base64 encoded Intel HEX content
 * @returns {{binary: Uint8Array, startAddress: number, endAddress: number, recordCount: number}}
 */
export function parseIntelHexBase64(hexBase64) {
  if (typeof hexBase64 !== 'string' || hexBase64.length === 0) {
    throw new Error('Empty hexBase64');
  }
  const asciiBytes = base64ToAsciiBytes(hexBase64);
  const hexText = new TextDecoder('ascii').decode(asciiBytes);
  return parseIntelHexText(hexText);
}

/**
 * Convert binary Uint8Array to base64 for transport.
 * Useful for round-trip verification + Mock DFU upload response.
 *
 * @param {Uint8Array} binary
 * @returns {string} base64
 */
export function binaryToBase64(binary) {
  if (!(binary instanceof Uint8Array)) {
    throw new TypeError('binaryToBase64 expects Uint8Array');
  }
  if (typeof btoa === 'function') {
    let bin = '';
    const chunkSize = 8192; // Avoid String.fromCharCode stack overflow
    for (let i = 0; i < binary.length; i += chunkSize) {
      bin += String.fromCharCode.apply(null, binary.subarray(i, i + chunkSize));
    }
    return btoa(bin);
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(binary).toString('base64');
  }
  throw new Error('No base64 encoder available (btoa/Buffer)');
}
