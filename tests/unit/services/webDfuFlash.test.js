/**
 * tests/unit/services/webDfuFlash.test.js — iter 78 B.2.3+B.2.4 integration tests
 *
 * Andrea mandate iter 78: "no demo deve funzionare certamente, simulare upload".
 * Tests verify adapter + mock device DFU sequence end-to-end.
 *
 * Codex design verdict honored: real event-driven dfu.write API + USB
 * descriptor mock + real-vs-simulated honest contract.
 */
import { describe, it, expect } from 'vitest';
import {
  flashDfuFirmware,
  isDfuCapable,
  flashResultMessage,
} from '../../../src/services/webDfuFlash.js';
import {
  createMockDfuDevice,
  getMockTransferStats,
  _internal,
} from '../../../src/services/mockUsbDfuDevice.js';

const TEST_BINARY = new Uint8Array(256).fill(0xAB); // 256 bytes test firmware

describe('webDfuFlash — input validation', () => {
  it('rejects null device', async () => {
    await expect(flashDfuFirmware(null, TEST_BINARY)).rejects.toThrow(/USBDevice required/);
  });

  it('rejects non-Uint8Array binary', async () => {
    const mock = createMockDfuDevice();
    await expect(flashDfuFirmware(mock, 'not-binary')).rejects.toThrow(/Uint8Array/);
  });

  it('rejects empty binary', async () => {
    const mock = createMockDfuDevice();
    await expect(flashDfuFirmware(mock, new Uint8Array(0))).rejects.toThrow(/empty/i);
  });
});

describe('webDfuFlash — mock simulation flash success', () => {
  it('completes full DFU sequence with mock + returns ok result mode=simulated', async () => {
    const mock = createMockDfuDevice();
    const result = await flashDfuFirmware(mock, TEST_BINARY, { transferSize: 64 });
    expect(result.mode).toBe('simulated');
    expect(result.ok).toBe(true);
    expect(result.verified).toBe(false); // No readback iter 78 MVP
    expect(result.evidence.endEventReceived).toBe(true);
    expect(result.evidence.bytesTransferred).toBeGreaterThan(0);
    expect(result.evidence.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('mock device receives correct number of DNLOAD blocks (transferSize=64, 256 bytes = 4 blocks + final zero)', async () => {
    const mock = createMockDfuDevice();
    await flashDfuFirmware(mock, TEST_BINARY, { transferSize: 64 });
    const stats = getMockTransferStats(mock);
    expect(stats.downloadedBytes).toBe(256);
    expect(stats.totalBlocks).toBeGreaterThanOrEqual(4); // 4 data blocks minimum
  });

  it('reports progress via onProgress callback', async () => {
    const mock = createMockDfuDevice();
    const progressEvents = [];
    await flashDfuFirmware(mock, TEST_BINARY, {
      transferSize: 64,
      onProgress: (evt) => progressEvents.push(evt),
    });
    expect(progressEvents.length).toBeGreaterThan(0);
    expect(progressEvents[0]).toHaveProperty('bytesTransferred');
    expect(progressEvents[0]).toHaveProperty('totalBytes');
  });

  it('honest contract: simulated mode preserved even with successful end event', async () => {
    const mock = createMockDfuDevice();
    const result = await flashDfuFirmware(mock, TEST_BINARY);
    expect(result.mode).toBe('simulated'); // NEVER claim 'real' for mock
    expect(result.verified).toBe(false);   // NEVER claim 'verified' without readback
  });
});

describe('webDfuFlash — isDfuCapable detector', () => {
  it('returns capable=true for mock DFU device', () => {
    const mock = createMockDfuDevice();
    const r = isDfuCapable(mock);
    expect(r.capable).toBe(true);
    expect(r.dfuInterfaceFound).toBe(true);
    expect(r.interfaceNumber).toBe(0);
    expect(r.protocol).toBe(0x01);
  });

  it('returns capable=false for non-DFU device', () => {
    const fakeNonDfu = {
      configurations: [{
        interfaces: [{
          interfaceNumber: 0,
          alternates: [{ interfaceClass: 0x03 /* HID */, interfaceSubclass: 0x01, interfaceProtocol: 0x01 }],
        }],
      }],
    };
    const r = isDfuCapable(fakeNonDfu);
    expect(r.capable).toBe(false);
    expect(r.reason).toMatch(/no_dfu_interface/);
  });

  it('returns capable=false for missing configurations', () => {
    const r = isDfuCapable({});
    expect(r.capable).toBe(false);
    expect(r.reason).toMatch(/no_configurations/);
  });
});

describe('flashResultMessage — honest UI text per Codex mandate', () => {
  it('real mode + verified=true → "Caricamento reale ... e verificato"', () => {
    const msg = flashResultMessage({
      ok: true, mode: 'real', verified: true,
      evidence: { bytesTransferred: 39048, durationMs: 4500 },
    });
    expect(msg).toMatch(/Caricamento reale/);
    expect(msg).toMatch(/verificato/);
    expect(msg).toMatch(/39048 byte/);
  });

  it('real mode + verified=false → "Caricamento reale ... no read-back verify"', () => {
    const msg = flashResultMessage({
      ok: true, mode: 'real', verified: false,
      evidence: { bytesTransferred: 39048, durationMs: 4500 },
    });
    expect(msg).toMatch(/Caricamento reale/);
    expect(msg).toMatch(/no read-back/);
    expect(msg).not.toMatch(/verificato/);
  });

  it('simulated mode → "Simulazione scientifica ... nessuna scheda fisica scritta"', () => {
    const msg = flashResultMessage({
      ok: true, mode: 'simulated', verified: false,
      evidence: { bytesTransferred: 256, durationMs: 80 },
    });
    expect(msg).toMatch(/Simulazione scientifica/);
    expect(msg).toMatch(/nessuna scheda fisica scritta/);
    expect(msg).toMatch(/Tea/);
    expect(msg).toMatch(/Riccardo/);
    expect(msg).not.toMatch(/Caricato/); // NO false claim
  });

  it('error → "Errore flash" + mode + duration', () => {
    const msg = flashResultMessage({
      ok: false, mode: 'real', verified: false,
      evidence: { durationMs: 1234 },
      error: 'init_failed: timeout',
    });
    expect(msg).toMatch(/Errore flash/);
    expect(msg).toMatch(/init_failed/);
    expect(msg).toMatch(/mode=real/);
  });
});

describe('mockUsbDfuDevice — internal state machine', () => {
  it('initial state is dfuIDLE', () => {
    const mock = createMockDfuDevice();
    const stats = getMockTransferStats(mock);
    expect(stats.state).toBe(_internal.DFU_STATE.dfuIDLE);
    expect(stats.downloadedBytes).toBe(0);
  });

  it('open/close lifecycle', async () => {
    const mock = createMockDfuDevice();
    expect(mock.opened).toBe(false);
    await mock.open();
    expect(mock.opened).toBe(true);
    await mock.close();
    expect(mock.opened).toBe(false);
  });

  it('selectConfiguration requires open', async () => {
    const mock = createMockDfuDevice();
    await expect(mock.selectConfiguration(1)).rejects.toThrow(/not_opened/);
  });

  it('marker __elabMockMode = "simulated"', () => {
    const mock = createMockDfuDevice();
    expect(mock.__elabMockMode).toBe('simulated');
  });

  it('vendor/product IDs default Nano R4 Arduino 0x2341/0x0070', () => {
    const mock = createMockDfuDevice();
    expect(mock.vendorId).toBe(0x2341);
    expect(mock.productId).toBe(0x0070);
  });
});
