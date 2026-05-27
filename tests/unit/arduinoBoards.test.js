// © Andrea Marro — 27/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * arduinoBoards — Smoke tests for the board registry + lookup helpers.
 * Catches regressions in FQBN strings, USB filter shape, and
 * inBrowserCompile capability flags that the simulator relies on.
 */
import { describe, test, expect } from 'vitest';
import {
  BOARDS,
  MCU_FAMILY,
  UPLOAD_PROTOCOL,
  getBoardById,
  getBoardByFqbn,
  getBoardForBoardParam,
  defaultBoard,
  listBoards,
  supportsInBrowserCompile,
  isAtmega328PinMap,
} from '../../src/services/arduinoBoards.js';

describe('arduinoBoards registry', () => {
  test('registry not empty + each entry has required fields', () => {
    expect(BOARDS.length).toBeGreaterThan(0);
    for (const b of BOARDS) {
      expect(typeof b.id).toBe('string');
      expect(typeof b.label).toBe('string');
      expect(typeof b.fqbn).toBe('string');
      expect(Object.values(MCU_FAMILY)).toContain(b.mcuFamily);
      expect(Object.values(UPLOAD_PROTOCOL)).toContain(b.uploadProtocol);
      expect(Array.isArray(b.usbFilters)).toBe(true);
      expect(typeof b.inBrowserCompileSupported).toBe('boolean');
    }
  });

  test('Nano R4 entry has correct flash base + DFU protocol', () => {
    const board = getBoardById('nano-r4');
    expect(board).not.toBeNull();
    expect(board.fqbn).toBe('arduino:renesas_uno:nanor4');
    expect(board.mcuFamily).toBe(MCU_FAMILY.RENESAS);
    expect(board.uploadProtocol).toBe(UPLOAD_PROTOCOL.DFU);
    expect(board.flashStartAddress).toBe(0x4000);
  });

  test('Nano (ATmega328P) supports in-browser compile + stk500v1', () => {
    const board = getBoardById('nano');
    expect(board).not.toBeNull();
    expect(board.uploadProtocol).toBe(UPLOAD_PROTOCOL.STK500V1);
    expect(supportsInBrowserCompile(board)).toBe(true);
    expect(isAtmega328PinMap(board)).toBe(true);
  });

  test('Mega2560 does NOT use 328P pin map', () => {
    const board = getBoardById('mega');
    expect(board.uploadProtocol).toBe(UPLOAD_PROTOCOL.STK500V2);
    expect(isAtmega328PinMap(board)).toBe(false);
  });

  test('getBoardByFqbn resolves canonical FQBN', () => {
    expect(getBoardByFqbn('arduino:renesas_uno:nanor4')?.id).toBe('nano-r4');
    expect(getBoardByFqbn('arduino:avr:uno')?.id).toBe('uno');
    expect(getBoardByFqbn('arduino:esp32:nano_nora')?.id).toBe('nano-esp32');
  });

  test('getBoardForBoardParam tolerates id or fqbn', () => {
    expect(getBoardForBoardParam('nano')?.id).toBe('nano');
    expect(getBoardForBoardParam('arduino:avr:nano:cpu=atmega328old')?.id).toBe('nano');
    expect(getBoardForBoardParam('unknown-xyz')).toBe(null);
  });

  test('defaultBoard returns first entry (Nano R4 canonical)', () => {
    expect(defaultBoard().id).toBe('nano-r4');
  });

  test('listBoards returns a copy, not the live array', () => {
    const list = listBoards();
    expect(list.length).toBe(BOARDS.length);
    list.push({ id: 'fake' });
    expect(BOARDS.find((b) => b.id === 'fake')).toBeUndefined();
  });

  test('all AVR boards have a baudRate for stk500', () => {
    for (const b of BOARDS) {
      if (b.uploadProtocol === UPLOAD_PROTOCOL.STK500V1
        || b.uploadProtocol === UPLOAD_PROTOCOL.STK500V2) {
        expect(typeof b.baudRate).toBe('number');
        expect(b.baudRate).toBeGreaterThan(0);
      }
    }
  });

  test('all DFU boards declare flashStartAddress', () => {
    for (const b of BOARDS) {
      if (b.uploadProtocol === UPLOAD_PROTOCOL.DFU) {
        expect(typeof b.flashStartAddress).toBe('number');
        expect(b.flashStartAddress).toBeGreaterThan(0);
      }
    }
  });
});
