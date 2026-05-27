/**
 * arduinoBoards — Canonical Arduino board registry for ELAB.
 *
 * Each entry describes a real Arduino model: FQBN string for arduino-cli,
 * MCU family (chooses simulator + compiler path), USB descriptors used by
 * WebSerial / WebUSB device pickers, and which upload protocol applies.
 *
 * Source of truth consumed by:
 *   - services/compiler.js          (picks precompiled HEX manifest + browser
 *                                    compiler eligibility)
 *   - services/arduinoUploader.js   (universal upload dispatcher)
 *   - simulator board picker UI
 *
 * @copyright © Andrea Marro — 2026-05-27 — ELAB Tutor
 */

export const MCU_FAMILY = Object.freeze({
  AVR: 'avr',
  RENESAS: 'renesas',
  SAMD: 'samd',
  NRF: 'nrf',
  ESP32: 'esp32',
});

export const UPLOAD_PROTOCOL = Object.freeze({
  STK500V1: 'stk500v1',   // ATmega328P Nano old bootloader (57600 baud)
  STK500V2: 'stk500v2',   // ATmega2560 Mega (115200 baud)
  BOSSA: 'bossa',         // SAMD boards (Zero, MKR, Nano 33 IoT)
  DFU: 'dfu',             // Renesas Nano R4, nRF52, native USB DFU
  ESPTOOL: 'esptool',     // ESP32 (Nano ESP32)
});

/**
 * Board catalog. Order matters for default picker (first = canonical default).
 */
export const BOARDS = [
  {
    id: 'nano-r4',
    label: 'Arduino Nano R4',
    fqbn: 'arduino:renesas_uno:nanor4',
    mcuFamily: MCU_FAMILY.RENESAS,
    uploadProtocol: UPLOAD_PROTOCOL.DFU,
    // ESPLICITO: Nano R4 (Renesas RA4M1) ha DUE descrittori USB —
    //   1. Bootloader DFU mode (dopo doppio click RESET):
    //      VID 0x2341 PID 0x0070 (Arduino native DFU)
    //      VID 0x045B PID 0x0234 (Renesas DfuSe usbboot, factory fallback)
    //   2. Runtime (sketch in esecuzione):
    //      VID 0x2341 PID 0x0069 (Arduino R4 CDC ACM)
    // L'ultimo filtro VID-only (0x2341) cattura altri PID Arduino come
    // safety net se Arduino aggiorna future revisioni firmware.
    usbFilters: [
      { vendorId: 0x2341, productId: 0x0070 },
      { vendorId: 0x2341, productId: 0x0069 },
      { vendorId: 0x045B, productId: 0x0234 },
      { vendorId: 0x045B },
      { vendorId: 0x2341 },
    ],
    flashStartAddress: 0x4000,
    inBrowserCompileSupported: false,
    precompiledHexSuffix: '-r4',
  },
  {
    id: 'uno-r4-minima',
    label: 'Arduino Uno R4 Minima',
    fqbn: 'arduino:renesas_uno:minima',
    mcuFamily: MCU_FAMILY.RENESAS,
    uploadProtocol: UPLOAD_PROTOCOL.DFU,
    usbFilters: [
      { vendorId: 0x2341, productId: 0x0069 },
      { vendorId: 0x2341 },
    ],
    flashStartAddress: 0x4000,
    inBrowserCompileSupported: false,
    precompiledHexSuffix: '-r4',
  },
  {
    id: 'uno-r4-wifi',
    label: 'Arduino Uno R4 WiFi',
    fqbn: 'arduino:renesas_uno:unor4wifi',
    mcuFamily: MCU_FAMILY.RENESAS,
    uploadProtocol: UPLOAD_PROTOCOL.DFU,
    usbFilters: [
      { vendorId: 0x2341, productId: 0x1002 },
      { vendorId: 0x2341 },
    ],
    flashStartAddress: 0x4000,
    inBrowserCompileSupported: false,
    precompiledHexSuffix: '-r4',
  },
  {
    id: 'nano',
    label: 'Arduino Nano (ATmega328P, old bootloader)',
    fqbn: 'arduino:avr:nano:cpu=atmega328old',
    mcuFamily: MCU_FAMILY.AVR,
    uploadProtocol: UPLOAD_PROTOCOL.STK500V1,
    baudRate: 57600,
    usbFilters: [
      { vendorId: 0x2341 },                  // Arduino
      { vendorId: 0x2a03 },                  // Arduino.org legacy
      { vendorId: 0x0403, productId: 0x6001 }, // FTDI FT232 clone
      { vendorId: 0x1a86 },                  // CH340 clone
      { vendorId: 0x10c4 },                  // CP210x clone
    ],
    inBrowserCompileSupported: true,
    flashSize: 32256,
  },
  {
    id: 'nano-optiboot',
    label: 'Arduino Nano (ATmega328P, optiboot)',
    fqbn: 'arduino:avr:nano:cpu=atmega328',
    mcuFamily: MCU_FAMILY.AVR,
    uploadProtocol: UPLOAD_PROTOCOL.STK500V1,
    baudRate: 115200,
    usbFilters: [
      { vendorId: 0x2341 },
      { vendorId: 0x2a03 },
      { vendorId: 0x0403, productId: 0x6001 },
      { vendorId: 0x1a86 },
      { vendorId: 0x10c4 },
    ],
    inBrowserCompileSupported: true,
    flashSize: 32256,
  },
  {
    id: 'uno',
    label: 'Arduino Uno R3 (ATmega328P)',
    fqbn: 'arduino:avr:uno',
    mcuFamily: MCU_FAMILY.AVR,
    uploadProtocol: UPLOAD_PROTOCOL.STK500V1,
    baudRate: 115200,
    usbFilters: [
      { vendorId: 0x2341, productId: 0x0043 },
      { vendorId: 0x2341, productId: 0x0001 },
      { vendorId: 0x2341 },
      { vendorId: 0x2a03 },
      { vendorId: 0x1a86 },
    ],
    inBrowserCompileSupported: true,
    flashSize: 32256,
  },
  {
    id: 'mega',
    label: 'Arduino Mega 2560',
    fqbn: 'arduino:avr:mega:cpu=atmega2560',
    mcuFamily: MCU_FAMILY.AVR,
    uploadProtocol: UPLOAD_PROTOCOL.STK500V2,
    baudRate: 115200,
    usbFilters: [
      { vendorId: 0x2341, productId: 0x0042 },
      { vendorId: 0x2341, productId: 0x0010 },
      { vendorId: 0x2341 },
    ],
    inBrowserCompileSupported: true, // pin map differs from 328P
    flashSize: 253952,
  },
  {
    id: 'leonardo',
    label: 'Arduino Leonardo (ATmega32U4)',
    fqbn: 'arduino:avr:leonardo',
    mcuFamily: MCU_FAMILY.AVR,
    uploadProtocol: UPLOAD_PROTOCOL.STK500V1,
    baudRate: 57600,
    usbFilters: [
      { vendorId: 0x2341, productId: 0x0036 },
      { vendorId: 0x2341, productId: 0x8036 },
      { vendorId: 0x2341 },
    ],
    inBrowserCompileSupported: false, // ATmega32U4 has native USB stack; non-trivial
    flashSize: 28672,
  },
  {
    id: 'nano33iot',
    label: 'Arduino Nano 33 IoT (SAMD21)',
    fqbn: 'arduino:samd:nano_33_iot',
    mcuFamily: MCU_FAMILY.SAMD,
    uploadProtocol: UPLOAD_PROTOCOL.BOSSA,
    usbFilters: [
      { vendorId: 0x2341, productId: 0x8057 },
      { vendorId: 0x2341, productId: 0x0057 },
      { vendorId: 0x2341 },
    ],
    inBrowserCompileSupported: false,
    flashStartAddress: 0x2000,
  },
  {
    id: 'nano33ble',
    label: 'Arduino Nano 33 BLE (nRF52840)',
    fqbn: 'arduino:mbed_nano:nano33ble',
    mcuFamily: MCU_FAMILY.NRF,
    uploadProtocol: UPLOAD_PROTOCOL.BOSSA, // actually a SoftDevice + OpenOCD
    usbFilters: [
      { vendorId: 0x2341, productId: 0x805a },
      { vendorId: 0x2341 },
    ],
    inBrowserCompileSupported: false,
    flashStartAddress: 0x16000,
  },
  {
    id: 'nano-esp32',
    label: 'Arduino Nano ESP32',
    fqbn: 'arduino:esp32:nano_nora',
    mcuFamily: MCU_FAMILY.ESP32,
    uploadProtocol: UPLOAD_PROTOCOL.ESPTOOL,
    usbFilters: [
      { vendorId: 0x2341, productId: 0x0070 },
      { vendorId: 0x303a, productId: 0x1001 }, // Espressif USB CDC
      { vendorId: 0x2341 },
    ],
    inBrowserCompileSupported: false,
    flashStartAddress: 0x10000,
  },
];

const BY_ID = new Map(BOARDS.map((b) => [b.id, b]));
const BY_FQBN = new Map(BOARDS.map((b) => [b.fqbn, b]));

export function getBoardById(id) {
  return BY_ID.get(id) || null;
}

export function getBoardByFqbn(fqbn) {
  return BY_FQBN.get(fqbn) || null;
}

export function getBoardForBoardParam(boardParam) {
  if (!boardParam) return null;
  if (BY_ID.has(boardParam)) return BY_ID.get(boardParam);
  if (BY_FQBN.has(boardParam)) return BY_FQBN.get(boardParam);
  // Tolerate partial FQBN (without :cpu=)
  for (const b of BOARDS) {
    if (b.fqbn.startsWith(boardParam)) return b;
  }
  return null;
}

export function defaultBoard() {
  return BOARDS[0];
}

export function listBoards() {
  return BOARDS.slice();
}

/**
 * True when the in-browser compiler can produce machine code for this board.
 * Currently: ATmega328P (Uno, Nano) — same pin map. Mega2560 is a stretch
 * goal (different MCU + I/O addresses) but flagged.
 */
export function supportsInBrowserCompile(board) {
  if (!board) return false;
  return board.inBrowserCompileSupported === true && board.mcuFamily === MCU_FAMILY.AVR;
}

/**
 * True when this board uses the AVR ATmega328P pin map (Uno R3 + Nano).
 * Mega2560 returns FALSE because pin → port mapping differs.
 */
export function isAtmega328PinMap(board) {
  if (!board) return false;
  return ['uno', 'nano', 'nano-optiboot'].includes(board.id);
}
