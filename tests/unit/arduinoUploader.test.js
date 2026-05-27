// © Andrea Marro — 27/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * arduinoUploader — Smoke tests for universal upload dispatcher routing.
 * Verifies board family → upload protocol mapping + error categorisation
 * + base64 vs Intel HEX detection.
 */
import { describe, test, expect } from 'vitest';
import { uploadToBoard, describeUploadError } from '../../src/services/arduinoUploader.js';

describe('uploadToBoard routing', () => {
  test('unknown board returns unknown_board error', async () => {
    const r = await uploadToBoard({ boardId: 'fake-board', hexText: ':00000001FF\n' });
    expect(r.success).toBe(false);
    expect(r.errorCategory).toBe('unknown_board');
  });

  test('missing hex returns missing_hex', async () => {
    const r = await uploadToBoard({ boardId: 'nano', hexText: '' });
    expect(r.success).toBe(false);
    expect(r.errorCategory).toBe('missing_hex');
  });

  test('invalid hex (non-Intel) returns hex_invalid', async () => {
    const r = await uploadToBoard({ boardId: 'nano', hexText: 'not-hex-data-and-not-base64-either' });
    expect(r.success).toBe(false);
    expect(r.errorCategory).toBe('hex_invalid');
  });

  test('base64-wrapped Intel HEX is detected + decoded', async () => {
    const intelHex = ':020000020000FC\n:00000001FF\n';
    const base64 = Buffer.from(intelHex).toString('base64');
    // Use SAMD board so we route to BOSSA (not_implemented) but still hit the
    // ensureIntelHexText branch successfully (no real DFU/serial dispatch).
    const r = await uploadToBoard({ boardId: 'nano33iot', hexText: base64 });
    expect(r.success).toBe(false);
    expect(r.errorCategory).toBe('protocol_not_implemented');
  });

  test('BOSSA protocol surfaces protocol_not_implemented', async () => {
    const r = await uploadToBoard({ boardId: 'nano33iot', hexText: ':00000001FF\n' });
    expect(r.success).toBe(false);
    expect(r.errorCategory).toBe('protocol_not_implemented');
    expect(r.protocol).toBe('bossa');
  });

  test('esptool protocol surfaces protocol_not_implemented', async () => {
    const r = await uploadToBoard({ boardId: 'nano-esp32', hexText: ':00000001FF\n' });
    expect(r.success).toBe(false);
    expect(r.errorCategory).toBe('protocol_not_implemented');
    expect(r.protocol).toBe('esptool');
  });

  test('DFU on Nano R4 returns no_webusb in headless node env', async () => {
    const r = await uploadToBoard({ boardId: 'nano-r4', hexText: ':02400000007F00FA\n:00000001FF\n' });
    expect(r.success).toBe(false);
    // In node, navigator.usb is undefined → no_webusb
    expect(r.errorCategory).toBe('no_webusb');
    expect(r.protocol).toBe('dfu');
  });
});

describe('describeUploadError', () => {
  test('returns docente plurale message for each known category', () => {
    expect(describeUploadError('port_missing')).toMatch(/Ragazzi.*USB/);
    expect(describeUploadError('no_webusb')).toMatch(/Chrome|Edge/);
    expect(describeUploadError('sync_failed')).toMatch(/RESET/);
    expect(describeUploadError('protocol_not_implemented')).toMatch(/non.*ancora pronto/);
  });

  test('unknown category falls back to flash_failed message', () => {
    expect(describeUploadError('xyz_random')).toMatch(/Ragazzi.*Riproviamo/);
  });
});
