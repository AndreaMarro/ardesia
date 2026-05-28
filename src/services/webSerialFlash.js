/**
 * webSerialFlash — Browser-native stk500v1 uploader via WebSerial API.
 *
 * Targets Arduino Nano (ATmega328 / ATmega328P) with the classic stk500v1
 * bootloader (old bootloader 57600 baud) or optiboot (115200 baud). Modern
 * Renesas Nano R4 boards use WebUSB DFU instead — see services/webDfuFlash.js.
 *
 * No local agent required. Runs entirely in Chromium-based browsers
 * (Chrome / Edge / Opera) where `navigator.serial` is available.
 *
 * Usage:
 *   const port = await requestSerialPort();
 *   await flashHex(port, hexString, {
 *     baudRate: 57600,
 *     onProgress: (done, total) => console.log(`${done}/${total}`),
 *   });
 *
 * Protocol reference: ATmega-stk500 datasheet + Arduino bootloader source.
 *
 * @copyright © Andrea Marro — 2026-05-27 — ELAB Tutor WebSerial stk500
 */

// ── stk500v1 protocol constants ─────────────────────────────────────────
const STK_OK = 0x10;
const STK_INSYNC = 0x14;
const STK_CRC_EOP = 0x20;
const STK_GET_SYNC = 0x30;
const STK_GET_PARAMETER = 0x41;
const STK_SET_DEVICE = 0x42;
const STK_SET_DEVICE_EXT = 0x45;
const STK_ENTER_PROGMODE = 0x50;
const STK_LEAVE_PROGMODE = 0x51;
const STK_LOAD_ADDRESS = 0x55;
const STK_PROG_PAGE = 0x64;
const STK_READ_PAGE = 0x74;
const STK_READ_SIGN = 0x75;

// ── Defaults for ATmega328 / ATmega328P ─────────────────────────────────
const DEFAULTS = Object.freeze({
  baudRate: 57600,
  pageSize: 128,
  flashSize: 32 * 1024,
  syncRetries: 8,
  syncDelayMs: 50,
  resetPulseMs: 60,
  readTimeoutMs: 1500,
  // arduino-cli set_device payload for atmega328p (avrdude.conf canonical).
  deviceParams: [
    0x86, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x03, 0xff, 0xff, 0xff, 0xff,
    0x00, 0x80, 0x04, 0x00, 0x00, 0x00, 0x80, 0x00,
  ],
  deviceExtParams: [0x05, 0x04, 0xd7, 0xc2, 0x00],
});

/**
 * Detect WebSerial availability.
 */
export function isWebSerialSupported() {
  return typeof navigator !== 'undefined' && !!navigator.serial;
}

/**
 * Prompt the user to pick a serial port. Throws if no port is granted.
 *
 * 2026-05-28 (Andrea live test: Chrome WebSerial picker showed "Nessun
 * dispositivo compatibile trovato" with an attached Arduino board). The
 * previous hardcoded `filters` array missed common school-board USB-serial
 * chips — Prolific PL2303 (0x067b), Espressif (0x303a), Atmel SAM-BA
 * (0x03eb), generic AVR-USB stack (0x16c0) — and Chrome's WebSerial picker
 * has no "show all" toggle once `filters` is set. So any unknown VID is
 * INVISIBLE to the docente, blocking upload even with a working cable.
 *
 * Strategy: call `requestPort()` with no filter. The picker enumerates
 * every serial device the OS exposes. Trade-off: Bluetooth modules,
 * modem-class devices, and other unrelated ports appear too. If the
 * docente picks the wrong port → stk500 sync fails with a clear
 * "scollega/ricollega USB" message (describeUploadError + protocol).
 * This mirrors Arduino IDE's tools-port-list UX, which schools already
 * use, and unblocks every clone shipped to ELAB schools.
 */
export async function requestSerialPort() {
  if (!isWebSerialSupported()) {
    throw new Error('WebSerial non supportato in questo browser. Usa Chrome o Edge.');
  }
  return navigator.serial.requestPort();
}

/**
 * Parse Intel HEX string into a flat Uint8Array indexed by absolute address.
 * Returns { data, size } where `size` is the highest address written + 1.
 */
export function parseIntelHex(hexText) {
  const flat = new Uint8Array(64 * 1024).fill(0xff);
  let highestAddr = 0;
  let extLinearAddr = 0;

  const lines = hexText.split(/\r?\n/);
  for (const line of lines) {
    if (!line || line[0] !== ':') continue;
    const byteCount = parseInt(line.substr(1, 2), 16);
    const address = parseInt(line.substr(3, 4), 16);
    const recordType = parseInt(line.substr(7, 2), 16);

    // Checksum verification
    let sum = 0;
    for (let i = 1; i < line.length - 2; i += 2) {
      sum += parseInt(line.substr(i, 2), 16);
    }
    const checksum = parseInt(line.substr(line.length - 2, 2), 16);
    if (((sum + checksum) & 0xff) !== 0) {
      throw new Error(`HEX checksum mismatch: ${line}`);
    }

    if (recordType === 0x00) {
      // Data record
      const absAddr = (extLinearAddr << 16) | address;
      for (let i = 0; i < byteCount; i++) {
        const byte = parseInt(line.substr(9 + i * 2, 2), 16);
        flat[absAddr + i] = byte;
        if (absAddr + i > highestAddr) highestAddr = absAddr + i;
      }
    } else if (recordType === 0x01) {
      // EOF
      break;
    } else if (recordType === 0x04) {
      // Extended linear address
      extLinearAddr = parseInt(line.substr(9, 4), 16);
    }
    // Other record types ignored
  }

  return { data: flat.slice(0, highestAddr + 1), size: highestAddr + 1 };
}

class StkProgrammer {
  constructor(port, options = {}) {
    this.port = port;
    this.opts = { ...DEFAULTS, ...options };
    this.reader = null;
    this.writer = null;
    this.rxBuffer = [];
    this.onProgress = options.onProgress || (() => {});
  }

  async open() {
    await this.port.open({
      baudRate: this.opts.baudRate,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      flowControl: 'none',
      bufferSize: 4096,
    });
    this.writer = this.port.writable.getWriter();
    this.reader = this.port.readable.getReader();
    this._startReadLoop();
  }

  async close() {
    try {
      if (this.reader) {
        await this.reader.cancel().catch(() => {});
        this.reader.releaseLock();
        this.reader = null;
      }
    } catch { /* ignore */ }
    try {
      if (this.writer) {
        this.writer.releaseLock();
        this.writer = null;
      }
    } catch { /* ignore */ }
    try {
      await this.port.close();
    } catch { /* ignore */ }
  }

  async _startReadLoop() {
    const reader = this.reader;
    if (!reader) return;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          for (let i = 0; i < value.length; i++) this.rxBuffer.push(value[i]);
        }
      }
    } catch { /* reader cancelled */ }
  }

  async _write(bytes) {
    const payload = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    await this.writer.write(payload);
  }

  _drainRx() {
    this.rxBuffer = [];
  }

  async _readBytes(count, timeoutMs = this.opts.readTimeoutMs) {
    const deadline = Date.now() + timeoutMs;
    while (this.rxBuffer.length < count) {
      if (Date.now() > deadline) {
        throw new Error(`stk500 read timeout (wanted ${count}, got ${this.rxBuffer.length})`);
      }
      await new Promise((r) => setTimeout(r, 5));
    }
    const out = this.rxBuffer.splice(0, count);
    return out;
  }

  async _command(payload, expectedExtra = 0) {
    this._drainRx();
    await this._write(payload);
    const head = await this._readBytes(1);
    if (head[0] !== STK_INSYNC) {
      throw new Error(`stk500 not in sync: got 0x${head[0].toString(16)}`);
    }
    const extra = expectedExtra > 0 ? await this._readBytes(expectedExtra) : [];
    const tail = await this._readBytes(1);
    if (tail[0] !== STK_OK) {
      throw new Error(`stk500 missing OK: got 0x${tail[0].toString(16)}`);
    }
    return extra;
  }

  async resetBoard() {
    // DTR pulse to reset AVR via bootloader trigger.
    try {
      await this.port.setSignals({ dataTerminalReady: false, requestToSend: false });
      await new Promise((r) => setTimeout(r, this.opts.resetPulseMs));
      await this.port.setSignals({ dataTerminalReady: true, requestToSend: true });
      await new Promise((r) => setTimeout(r, this.opts.resetPulseMs));
    } catch (err) {
      // Some adapters don't support setSignals — bootloader may still respond.
      if (!/not supported|invalid/i.test(err?.message || '')) throw err;
    }
  }

  async sync() {
    for (let attempt = 0; attempt < this.opts.syncRetries; attempt++) {
      this._drainRx();
      try {
        await this._write([STK_GET_SYNC, STK_CRC_EOP]);
        const head = await this._readBytes(1, 250);
        if (head[0] === STK_INSYNC) {
          const tail = await this._readBytes(1, 250);
          if (tail[0] === STK_OK) return true;
        }
      } catch { /* retry */ }
      await new Promise((r) => setTimeout(r, this.opts.syncDelayMs));
    }
    throw new Error('stk500 sync failed dopo retry. Premete 2 volte reset sulla scheda Arduino.');
  }

  async enterProgmode() {
    // Send device params first (avrdude does this for some bootloaders).
    try {
      await this._command([STK_SET_DEVICE, ...this.opts.deviceParams, STK_CRC_EOP]);
      await this._command([STK_SET_DEVICE_EXT, ...this.opts.deviceExtParams, STK_CRC_EOP]);
    } catch {
      // Many bootloaders accept ENTER_PROGMODE without prior SET_DEVICE.
    }
    await this._command([STK_ENTER_PROGMODE, STK_CRC_EOP]);
  }

  async leaveProgmode() {
    await this._command([STK_LEAVE_PROGMODE, STK_CRC_EOP]);
  }

  async loadAddress(wordAddr) {
    const lo = wordAddr & 0xff;
    const hi = (wordAddr >> 8) & 0xff;
    await this._command([STK_LOAD_ADDRESS, lo, hi, STK_CRC_EOP]);
  }

  async programPage(pageBytes) {
    const sizeHi = (pageBytes.length >> 8) & 0xff;
    const sizeLo = pageBytes.length & 0xff;
    const packet = [STK_PROG_PAGE, sizeHi, sizeLo, 0x46, ...pageBytes, STK_CRC_EOP];
    await this._command(packet);
  }

  async writeFlash(data) {
    const pageSize = this.opts.pageSize;
    const total = data.length;
    let written = 0;
    for (let addr = 0; addr < total; addr += pageSize) {
      const end = Math.min(addr + pageSize, total);
      const page = new Uint8Array(pageSize).fill(0xff);
      page.set(data.subarray(addr, end), 0);
      const wordAddr = addr >> 1;
      await this.loadAddress(wordAddr);
      await this.programPage(page);
      written = end;
      this.onProgress(written, total);
    }
  }
}

/**
 * Flash an Intel HEX string to a serial-attached Arduino via stk500v1.
 *
 * @param {SerialPort} port — opened or unopened WebSerial port
 * @param {string} hexText — Intel HEX text
 * @param {object} [options]
 * @param {number} [options.baudRate=57600]
 * @param {number} [options.pageSize=128]
 * @param {Function} [options.onProgress]
 * @returns {Promise<{ bytesWritten: number }>}
 */
export async function flashHex(port, hexText, options = {}) {
  if (!port) throw new Error('Nessuna porta seriale fornita.');
  if (!hexText || typeof hexText !== 'string') throw new Error('HEX vuoto.');

  const { data, size } = parseIntelHex(hexText);
  if (size <= 0) throw new Error('HEX non contiene dati programmabili.');

  const prog = new StkProgrammer(port, options);
  await prog.open();
  try {
    await prog.resetBoard();
    await prog.sync();
    await prog.enterProgmode();
    await prog.writeFlash(data);
    await prog.leaveProgmode();
  } finally {
    await prog.close();
  }
  return { bytesWritten: size };
}

/**
 * High-level helper: ask user for port + flash hex. Handles error categorisation
 * matching the docente plurale copy used by CompileUploadButton.
 *
 * @param {string} hexText
 * @param {object} [options]
 * @returns {Promise<{ success: boolean, bytesWritten?: number, errorCategory?: string, error?: Error }>}
 */
export async function requestAndFlash(hexText, options = {}) {
  if (!isWebSerialSupported()) {
    return { success: false, errorCategory: 'no_webserial' };
  }
  let port;
  try {
    port = await requestSerialPort();
  } catch (err) {
    if (err && /NotFoundError/i.test(err.name || '')) {
      return { success: false, errorCategory: 'port_missing', error: err };
    }
    return { success: false, errorCategory: 'permission_denied', error: err };
  }
  try {
    const result = await flashHex(port, hexText, options);
    return { success: true, bytesWritten: result.bytesWritten };
  } catch (err) {
    const message = err?.message || String(err);
    let category = 'upload_failed';
    if (/sync/i.test(message)) category = 'sync_failed';
    else if (/timeout/i.test(message)) category = 'timeout';
    else if (/checksum/i.test(message)) category = 'hex_invalid';
    return { success: false, errorCategory: category, error: err };
  }
}
