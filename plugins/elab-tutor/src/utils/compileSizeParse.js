// © Andrea Marro — 20/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * compileSizeParse — derive the real Arduino program size from a compile result.
 *
 * iter-102 (Codex iter-101 review + live Chrome debug 2026-05-20): the iter-80.A5
 * size derivation in HomeCompileEntry reported the Intel HEX *file* size
 * (result.artifactSizeBytes = hexSize, and atob(hexBase64).length = the same
 * HEX text — both ~2.8x the real binary) → the compile panel showed "42%" for a
 * Blink that really uses ~14% of flash. arduino-cli stdout is the authoritative
 * source; the Intel HEX data records are the correct fallback.
 */

/** Nano R4 (Renesas RA4M1) flash: 256 KB — src/boards/arduino-nano-r4.json. */
export const FLASH_TOTAL_NANO_R4 = 262144;

/**
 * Parse real flash usage from arduino-cli stdout.
 * Matches "Sketch uses 39048 bytes (14%) of program storage space."
 * 2026-05-28: also captures the "Maximum is N bytes" line so the panel
 * denominator matches the picker-selected board's flash size (UNO R3
 * 32256 bytes, Nano R4 262144, etc.) instead of the hardcoded Nano R4.
 * @param {string} stdout
 * @returns {{bytes:number, percent:number, total:number|null}|null}
 */
export function parseFlashFromStdout(stdout) {
  if (typeof stdout !== 'string') return null;
  const m = stdout.match(/Sketch uses\s+([\d.,]+)\s+bytes\s*\(\s*(\d+)\s*%\)/i);
  if (!m) return null;
  const bytes = parseInt(m[1].replace(/[.,]/g, ''), 10);
  const percent = parseInt(m[2], 10);
  if (!Number.isFinite(bytes) || !Number.isFinite(percent)) return null;
  // arduino-cli emits "Maximum is 32256 bytes." (or 262144 for Nano R4)
  // on the same stdout block. Use it as authoritative total when present.
  const maxMatch = stdout.match(/Maximum is\s+([\d.,]+)\s+bytes/i);
  const totalParsed = maxMatch
    ? parseInt(maxMatch[1].replace(/[.,]/g, ''), 10)
    : NaN;
  const total = Number.isFinite(totalParsed) ? totalParsed : null;
  return { bytes, percent, total };
}

/**
 * Sum the data-record byte counts of an Intel HEX file = real program size.
 * Intel HEX line: ":" + ll(2) + aaaa(4) + tt(2) + data + cc(2). tt "00" = data.
 * @param {string} hexText
 * @returns {number|null} byte count, or null if not parseable Intel HEX
 */
export function intelHexProgramBytes(hexText) {
  if (typeof hexText !== 'string' || hexText.indexOf(':') === -1) return null;
  let total = 0;
  let sawRecord = false;
  for (const rawLine of hexText.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.charAt(0) !== ':' || line.length < 11) continue;
    const byteCount = parseInt(line.slice(1, 3), 16);
    if (!Number.isFinite(byteCount)) continue;
    sawRecord = true;
    if (line.slice(7, 9) === '00') total += byteCount; // 00 = data record
  }
  return sawRecord ? total : null;
}

/**
 * Resolve {bytes,total,percent} for the compile panel from a compileCode result.
 * Primary: arduino-cli stdout (result.output). Fallback: Intel HEX data records
 * (result.hex, base64 for Cloud Renesas or raw Intel HEX for legacy). Returns
 * null when no honest figure is available — better no number than a wrong one.
 * @param {{output?:string, hex?:string}} result
 * @returns {{bytes:number,total:number,percent:number}|null}
 */
export function resolveCompileFlash(result) {
  if (!result) return null;
  const fromStdout = parseFlashFromStdout(result.output);
  if (fromStdout) {
    // 2026-05-28: prefer the parsed "Maximum is N bytes" total so the
    // denominator matches the picker-selected board. Falls back to the
    // Nano R4 256 KB constant only when the backend stdout omits the
    // Maximum line.
    return {
      bytes: fromStdout.bytes,
      total: fromStdout.total != null ? fromStdout.total : FLASH_TOTAL_NANO_R4,
      percent: fromStdout.percent,
    };
  }
  if (!result.hex) return null;
  let hexText = String(result.hex);
  if (hexText.trimStart().charAt(0) !== ':') {
    try {
      hexText = atob(hexText.trim());
    } catch {
      return null;
    }
  }
  const bytes = intelHexProgramBytes(hexText);
  if (bytes == null) return null;
  return {
    bytes,
    total: FLASH_TOTAL_NANO_R4,
    percent: Math.round((bytes / FLASH_TOTAL_NANO_R4) * 100),
  };
}
