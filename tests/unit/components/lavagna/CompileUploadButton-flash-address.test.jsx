/**
 * tests/unit/components/lavagna/CompileUploadButton-flash-address.test.jsx
 *
 * iter 103 — de-risk WebUSB DFU upload for the Nano R4 hardware UAT:
 *  - a compiled artifact whose Intel HEX does not start at 0x4000 is blocked
 *    before the flash (pre-flight sanity check on the compile target);
 *  - a board still in run mode (PID 0x0074, not the 0x0374 DFU bootloader) is
 *    blocked with a "double-tap RESET" hint;
 *  - the WebUSB picker is filtered to the Arduino vendor (0x2341).
 *
 * webDfuFlash is mocked here to spy the call args. It must stay REAL in the
 * sibling CompileUploadButton.test.jsx (T10/T11 exercise the full chain),
 * so these assertions live in a dedicated file (vi.mock is file-scoped).
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// vi.mock is hoisted above imports — the spy must be created via vi.hoisted
// so the mock factory can reference it.
const { flashDfuFirmwareSpy } = vi.hoisted(() => ({ flashDfuFirmwareSpy: vi.fn() }));

vi.mock('../../../../src/services/webDfuFlash.js', () => ({
  flashDfuFirmware: flashDfuFirmwareSpy,
  flashResultMessage: () => 'Simulazione: protocollo DFU mock completato.',
}));

import CompileUploadButton from '../../../../src/components/lavagna/CompileUploadButton.jsx';

// Intel HEX (16-byte data record + EOF) at the Renesas RA4M1 application base
// 0x4000 — the real Nano R4 cross-compile address.
const HEX_TEXT_4000 = ':10400000214601360121470136007EFE09D2190101\n:00000001FF\n';
const HEX_BASE64_4000 = Buffer.from(HEX_TEXT_4000, 'ascii').toString('base64');

// Intel HEX at 0x0100 — NOT the RA4M1 application base. The sanity guard rejects it.
const HEX_TEXT_WRONG = ':10010000214601360121470136007EFE09D2190140\n:00000001FF\n';
const HEX_BASE64_WRONG = Buffer.from(HEX_TEXT_WRONG, 'ascii').toString('base64');

// A Nano R4 in DFU bootloader mode (productId 0x0374).
const DFU_DEVICE = { vendorId: 0x2341, productId: 0x0374 };

function compileFetchReturning(hexBase64, jobId) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({
      ok: true,
      jobId,
      hexBase64,
      stdout: 'Sketch uses 16 bytes ...',
    }),
  });
}

describe('CompileUploadButton — iter 103 DFU upload de-risk', () => {
  beforeEach(() => {
    flashDfuFirmwareSpy.mockReset();
    flashDfuFirmwareSpy.mockResolvedValue({
      ok: true,
      mode: 'simulated',
      verified: false,
      evidence: { endEventReceived: true, bytesTransferred: 16, durationMs: 1 },
    });
  });

  it('blocks the flash with an honest error when the HEX does not start at 0x4000', async () => {
    const usbPicker = vi.fn().mockResolvedValue(DFU_DEVICE);
    const onError = vi.fn();
    render(
      <CompileUploadButton
        enableDemoMode
        sketchCode="void setup(){}void loop(){}"
        fetchImpl={compileFetchReturning(HEX_BASE64_WRONG, 'guard-1')}
        requestUsbDevice={usbPicker}
        onError={onError}
      />,
    );
    fireEvent.click(await screen.findByRole('button'));

    await waitFor(
      () => expect(
        onError.mock.calls.some((c) => c[0]?.category === 'unexpected_flash_address'),
      ).toBe(true),
      { timeout: 3000 },
    );

    expect(flashDfuFirmwareSpy).not.toHaveBeenCalled();
  });

  it('blocks the flash when the board is in run mode (PID 0x0074), not update mode', async () => {
    const usbPicker = vi.fn().mockResolvedValue({ vendorId: 0x2341, productId: 0x0074 });
    const onError = vi.fn();
    render(
      <CompileUploadButton
        enableDemoMode
        sketchCode="void setup(){}void loop(){}"
        fetchImpl={compileFetchReturning(HEX_BASE64_4000, 'runtime-1')}
        requestUsbDevice={usbPicker}
        onError={onError}
      />,
    );
    fireEvent.click(await screen.findByRole('button'));

    await waitFor(
      () => expect(
        onError.mock.calls.some((c) => c[0]?.category === 'board_not_in_update_mode'),
      ).toBe(true),
      { timeout: 3000 },
    );

    expect(flashDfuFirmwareSpy).not.toHaveBeenCalled();
  });

  it('opens the WebUSB picker filtered to the Arduino vendor (0x2341)', async () => {
    const usbPicker = vi.fn().mockResolvedValue(DFU_DEVICE);
    render(
      <CompileUploadButton
        enableDemoMode
        sketchCode="void setup(){}void loop(){}"
        fetchImpl={compileFetchReturning(HEX_BASE64_4000, 'filter-1')}
        requestUsbDevice={usbPicker}
      />,
    );
    fireEvent.click(await screen.findByRole('button'));

    await waitFor(
      () => expect(usbPicker).toHaveBeenCalledTimes(1),
      { timeout: 3000 },
    );

    expect(usbPicker.mock.calls[0][0]).toEqual({ filters: [{ vendorId: 0x2341 }] });
  });
});
