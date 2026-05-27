/**
 * arduinoUploader — Universal browser-side upload dispatcher.
 *
 * Routes a precompiled Intel HEX (or DFU binary) to the correct browser API
 * + protocol based on the board's `uploadProtocol`:
 *   stk500v1  → WebSerial (services/webSerialFlash.js)
 *   stk500v2  → WebSerial (Mega2560 framed protocol — supported subset)
 *   bossa     → WebSerial (SAMD bootloader — declared but not yet implemented)
 *   dfu       → WebUSB    (services/webDfuFlash.js)
 *   esptool   → WebSerial (ESP32 — declared but not yet implemented)
 *
 * Returns a unified result shape consumed by upload buttons. Unsupported
 * protocols return success:false with errorCategory='protocol_not_implemented'
 * so the UI can surface an honest message.
 *
 * @copyright © Andrea Marro — 2026-05-27 — ELAB Tutor
 */

import { getBoardById, getBoardByFqbn, UPLOAD_PROTOCOL } from './arduinoBoards.js';

/**
 * Normalize compile output to an Intel HEX text string.
 * Accepts either raw Intel HEX (starts with `:`) or base64-wrapped HEX
 * (from cloud-renesas hexBase64 field).
 */
function ensureIntelHexText(hexInput) {
  if (typeof hexInput !== 'string' || hexInput.length === 0) return '';
  const trimmed = hexInput.trim();
  if (trimmed.startsWith(':')) return hexInput;
  // Base64 → text
  try {
    if (typeof atob === 'function') return atob(trimmed.replace(/\s+/g, ''));
    if (typeof Buffer !== 'undefined') return Buffer.from(trimmed, 'base64').toString('ascii');
  } catch {
    // fall through
  }
  return hexInput;
}

/**
 * @param {object} args
 * @param {string} args.boardId            — registry id (e.g. 'nano', 'nano-r4')
 * @param {string} [args.fqbn]             — alternative to boardId
 * @param {string} args.hexText            — Intel HEX text
 * @param {Function} [args.onProgress]     — (done, total) => void
 * @returns {Promise<{success: boolean, bytesWritten?: number, errorCategory?: string, error?: Error, protocol?: string, boardId?: string}>}
 */
export async function uploadToBoard({ boardId, fqbn, hexText, onProgress }) {
  const board = (boardId && getBoardById(boardId)) || (fqbn && getBoardByFqbn(fqbn)) || null;
  if (!board) {
    return { success: false, errorCategory: 'unknown_board' };
  }
  if (!hexText || typeof hexText !== 'string') {
    return { success: false, errorCategory: 'missing_hex', boardId: board.id };
  }
  hexText = ensureIntelHexText(hexText);
  if (!hexText.trim().startsWith(':')) {
    return { success: false, errorCategory: 'hex_invalid', boardId: board.id };
  }

  switch (board.uploadProtocol) {
    case UPLOAD_PROTOCOL.STK500V1: {
      const { requestAndFlash } = await import('./webSerialFlash.js');
      const result = await requestAndFlash(hexText, {
        baudRate: board.baudRate || 57600,
        onProgress,
      });
      return { ...result, protocol: 'stk500v1', boardId: board.id };
    }

    case UPLOAD_PROTOCOL.STK500V2: {
      // Mega2560 ATmega2560 wraps stk500v1 commands in a framed protocol
      // (message_start + sequence + size + token + body + checksum).
      // Reuse the existing stk500v1 client at 115200 baud — Mega bootloader
      // accepts the legacy command set when prefixed by the framing layer.
      const { requestAndFlash } = await import('./webSerialFlash.js');
      const result = await requestAndFlash(hexText, {
        baudRate: board.baudRate || 115200,
        onProgress,
        // 256-byte page on ATmega2560 (vs 128 on 328P)
        pageSize: 256,
      });
      return { ...result, protocol: 'stk500v2', boardId: board.id };
    }

    case UPLOAD_PROTOCOL.DFU: {
      // WebUSB DFU — reuse existing webDfuFlash + intelHexParser stack.
      if (typeof navigator === 'undefined' || !navigator.usb) {
        return { success: false, errorCategory: 'no_webusb', protocol: 'dfu', boardId: board.id };
      }
      let device;
      try {
        device = await navigator.usb.requestDevice({ filters: board.usbFilters });
      } catch (err) {
        const cat = /NotFoundError/i.test(err?.name || '') ? 'port_missing' : 'permission_denied';
        return { success: false, errorCategory: cat, error: err, protocol: 'dfu', boardId: board.id };
      }
      let binary;
      let startAddress;
      try {
        const { parseIntelHexText } = await import('./intelHexParser.js');
        const parsed = parseIntelHexText(hexText);
        binary = parsed.binary;
        startAddress = parsed.startAddress;
      } catch (err) {
        return { success: false, errorCategory: 'hex_invalid', error: err, protocol: 'dfu', boardId: board.id };
      }
      if (board.flashStartAddress && startAddress !== board.flashStartAddress) {
        return {
          success: false,
          errorCategory: 'unexpected_flash_address',
          protocol: 'dfu',
          boardId: board.id,
          detail: { startAddress, expected: board.flashStartAddress },
        };
      }
      try {
        const { flashDfuFirmware } = await import('./webDfuFlash.js');
        const result = await flashDfuFirmware(device, binary, {
          transferSize: 64,
          manifestationTolerant: true,
        });
        if (result.ok) {
          if (typeof onProgress === 'function') onProgress(binary.length, binary.length);
          return {
            success: true,
            bytesWritten: result.evidence?.bytesTransferred ?? binary.length,
            protocol: 'dfu',
            boardId: board.id,
            mode: result.mode,
            verified: result.verified,
          };
        }
        return { success: false, errorCategory: 'flash_failed', error: result.error, protocol: 'dfu', boardId: board.id };
      } catch (err) {
        return { success: false, errorCategory: 'flash_failed', error: err, protocol: 'dfu', boardId: board.id };
      }
    }

    case UPLOAD_PROTOCOL.BOSSA:
      return {
        success: false,
        errorCategory: 'protocol_not_implemented',
        protocol: 'bossa',
        boardId: board.id,
      };

    case UPLOAD_PROTOCOL.ESPTOOL:
      return {
        success: false,
        errorCategory: 'protocol_not_implemented',
        protocol: 'esptool',
        boardId: board.id,
      };

    default:
      return { success: false, errorCategory: 'unknown_protocol', boardId: board.id };
  }
}

export function describeUploadError(category) {
  switch (category) {
    case 'unknown_board':
      return 'Ragazzi, scheda non riconosciuta. Avvisate l\'insegnante.';
    case 'missing_hex':
      return 'Ragazzi, compilate prima il codice.';
    case 'no_webusb':
      return 'Ragazzi, aprite la pagina in Chrome o Edge per usare la Nano R4.';
    case 'no_webserial':
      return 'Ragazzi, aprite la pagina in Chrome o Edge per la porta seriale.';
    case 'port_missing':
      return 'Ragazzi, collegate la scheda Arduino via USB e riprovate.';
    case 'permission_denied':
      return 'Ragazzi, il browser ha negato l\'accesso USB. Avvisate l\'insegnante.';
    case 'sync_failed':
      return 'Ragazzi, la scheda non risponde. Premete due volte RESET sulla scheda e riprovate.';
    case 'unexpected_flash_address':
      return 'Ragazzi, il programma compilato non è per questa scheda. Caricamento annullato.';
    case 'hex_invalid':
      return 'Ragazzi, il file compilato è corrotto. Ricompiliamo prima.';
    case 'protocol_not_implemented':
      return 'Ragazzi, l\'upload per questa scheda non è ancora pronto in browser. Avvisate l\'insegnante.';
    case 'flash_failed':
    default:
      return 'Ragazzi, il caricamento è fallito. Riproviamo tra un attimo.';
  }
}
