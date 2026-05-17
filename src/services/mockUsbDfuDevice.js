/**
 * mockUsbDfuDevice.js — iter 78 B.2.4 Mock USBDevice DFU 1.1 emulator
 * for scientifically valid simulated flash without physical Nano R4 board.
 *
 * Andrea mandate iter 78 entrance: "trova il modo di simulare upload, sii
 * onesto scientifico". Codex design verdict iter 78: shallow mock fails
 * webdfu.init/connect which read full USB descriptors + DFU functional
 * descriptor (type 0x21). Mock MUST implement:
 *
 *   1. configurations[] with DFU interface class 0xFE subclass 0x01 protocol 0x01
 *   2. opened state + selectConfiguration/claimInterface/selectAlternateInterface
 *   3. GET_DESCRIPTOR config returning configuration + interface + DFU functional
 *   4. Standard DFU sequence: DNLOAD + GETSTATUS poll loop + final zero-length + reset
 *   5. Optional GETSTATE + CLRSTATUS + ABORT robustness
 *
 * Marker `__elabMockMode = 'simulated'` distinguishes mock vs real device
 * for honest UI state per webDfuFlash.js adapter.
 *
 * @copyright © Andrea Marro — 2026 — ELAB Tutor iter 78 B.2.4
 */

// DFU 1.1 spec request codes (per USB DFU 1.1 spec Table 3-1)
const DFU_REQUEST = Object.freeze({
  DETACH: 0,
  DNLOAD: 1,
  UPLOAD: 2,
  GETSTATUS: 3,
  CLRSTATUS: 4,
  GETSTATE: 5,
  ABORT: 6,
});

// DFU 1.1 spec status codes (per USB DFU 1.1 spec Table 6-1)
const DFU_STATUS = Object.freeze({
  OK: 0x00,
  errTARGET: 0x01,
  errFILE: 0x02,
  errWRITE: 0x03,
});

// DFU 1.1 spec state codes (per USB DFU 1.1 spec Table 6-2)
const DFU_STATE = Object.freeze({
  appIDLE: 0,
  appDETACH: 1,
  dfuIDLE: 2,
  dfuDNLOAD_SYNC: 3,
  dfuDNBUSY: 4,
  dfuDNLOAD_IDLE: 5,
  dfuMANIFEST_SYNC: 6,
  dfuMANIFEST: 7,
  dfuMANIFEST_WAIT_RESET: 8,
  dfuUPLOAD_IDLE: 9,
  dfuERROR: 10,
});

/**
 * Build USB configuration descriptor with DFU functional descriptor.
 * Per USB DFU 1.1 spec Section 4.1.3 (DFU Functional Descriptor type 0x21).
 *
 * @returns {Uint8Array} raw configuration descriptor bytes
 */
function buildConfigDescriptor() {
  // bmAttributes: bitWillDetach=0 + bitManifestationTolerant=1 + bitCanUpload=1 + bitCanDnload=1 = 0x0F
  // wDetachTimeOut: 0x00FA = 250ms (per Arduino bootloader common)
  // wTransferSize: 0x0040 = 64 bytes
  // bcdDFUVersion: 0x0110 = DFU 1.1
  const configHeader = new Uint8Array([
    0x09, 0x02, 0x1B, 0x00, 0x01, 0x01, 0x00, 0xC0, 0x32, // Config descriptor 9 bytes
    0x09, 0x04, 0x00, 0x00, 0x00, 0xFE, 0x01, 0x01, 0x00, // Interface descriptor 9 bytes (DFU mode protocol 1)
    0x09, 0x21, 0x0F, 0xFA, 0x00, 0x40, 0x00, 0x10, 0x01, // DFU functional descriptor 9 bytes
  ]);
  return configHeader;
}

/**
 * Create mock USBDevice emulating Nano R4 in DFU mode.
 * Implements minimum subset of WebUSB API per Codex design verdict.
 *
 * @param {object} [opts]
 * @param {number} [opts.vendorId=0x2341] — Arduino vendor (Nano R4)
 * @param {number} [opts.productId=0x0070] — Nano R4 product (placeholder iter 78+)
 * @param {string} [opts.productName='Arduino Nano R4 (mock)'] — display name
 * @returns {USBDevice-compatible mock}
 */
export function createMockDfuDevice(opts = {}) {
  const vendorId = opts.vendorId || 0x2341;
  const productId = opts.productId || 0x0070;
  const productName = opts.productName || 'Arduino Nano R4 (mock)';

  // DFU state machine internal state
  let state = DFU_STATE.dfuIDLE;
  let lastStatus = DFU_STATUS.OK;
  let downloadedBytes = 0;
  let totalBlocks = 0;
  let bytesReceived = [];

  // USB lifecycle state
  let isOpened = false;
  let activeConfiguration = null;
  let claimedInterfaces = new Set();

  const configDescriptorBytes = buildConfigDescriptor();

  // Standard mock interface metadata (matches webdfu library expectations)
  const mockInterface = {
    interfaceNumber: 0,
    alternate: {
      alternateSetting: 0,
      interfaceClass: 0xFE,
      interfaceSubclass: 0x01,
      interfaceProtocol: 0x01,
      interfaceName: '',
      endpoints: [],
    },
    alternates: [{
      alternateSetting: 0,
      interfaceClass: 0xFE,
      interfaceSubclass: 0x01,
      interfaceProtocol: 0x01,
      interfaceName: '',
      endpoints: [],
    }],
    claimed: false,
  };

  const mockConfiguration = {
    configurationValue: 1,
    configurationName: 'Mock DFU Config',
    interfaces: [mockInterface],
  };

  return {
    __elabMockMode: 'simulated',
    __elabMockDfuVersion: '1.1',
    __getInternalState: () => ({ state, lastStatus, downloadedBytes, totalBlocks, bytesReceived: bytesReceived.length }),

    vendorId,
    productId,
    productName,
    manufacturerName: 'Arduino (mock)',
    serialNumber: 'MOCK-NANO-R4-IT78',
    deviceClass: 0x00,
    deviceSubclass: 0x00,
    deviceProtocol: 0x00,
    usbVersionMajor: 2,
    usbVersionMinor: 0,
    usbVersionSubminor: 0,
    deviceVersionMajor: 1,
    deviceVersionMinor: 0,
    deviceVersionSubminor: 0,
    opened: false,
    configuration: null,
    configurations: [mockConfiguration],

    async open() {
      isOpened = true;
      this.opened = true;
      return Promise.resolve();
    },

    async close() {
      isOpened = false;
      this.opened = false;
      return Promise.resolve();
    },

    async selectConfiguration(configValue) {
      if (!isOpened) throw new Error('mock_device_not_opened');
      activeConfiguration = configValue;
      this.configuration = mockConfiguration;
      return Promise.resolve();
    },

    async claimInterface(interfaceNumber) {
      if (!isOpened) throw new Error('mock_device_not_opened');
      claimedInterfaces.add(interfaceNumber);
      mockInterface.claimed = true;
      return Promise.resolve();
    },

    async releaseInterface(interfaceNumber) {
      claimedInterfaces.delete(interfaceNumber);
      mockInterface.claimed = false;
      return Promise.resolve();
    },

    async selectAlternateInterface(interfaceNumber, alternateSetting) {
      return Promise.resolve();
    },

    async controlTransferIn(setup, length) {
      // Standard USB GET_DESCRIPTOR requests
      if (setup.requestType === 'standard' && setup.request === 6) {
        // GET_DESCRIPTOR — return config descriptor
        const slice = configDescriptorBytes.slice(0, length);
        return { data: new DataView(slice.buffer, slice.byteOffset, slice.byteLength), status: 'ok' };
      }
      // DFU class requests
      if (setup.requestType === 'class') {
        if (setup.request === DFU_REQUEST.GETSTATUS) {
          // Return 6-byte status: bStatus, bwPollTimeout (3 bytes LE), bState, iString
          const status = new Uint8Array(6);
          status[0] = lastStatus;
          status[1] = 0x01; // 1ms poll timeout (mock fast)
          status[2] = 0x00;
          status[3] = 0x00;
          status[4] = state;
          status[5] = 0x00;
          // Auto-advance state per DFU sequence semantics:
          // DNLOAD_SYNC → DNLOAD_IDLE (writes ack)
          // DNBUSY → DNLOAD_IDLE
          // MANIFEST_SYNC → MANIFEST → MANIFEST_WAIT_RESET → dfuIDLE
          if (state === DFU_STATE.dfuDNLOAD_SYNC || state === DFU_STATE.dfuDNBUSY) {
            state = DFU_STATE.dfuDNLOAD_IDLE;
          } else if (state === DFU_STATE.dfuMANIFEST_SYNC) {
            state = DFU_STATE.dfuMANIFEST;
          } else if (state === DFU_STATE.dfuMANIFEST) {
            state = DFU_STATE.dfuIDLE;
          }
          return { data: new DataView(status.buffer), status: 'ok' };
        }
        if (setup.request === DFU_REQUEST.GETSTATE) {
          const stateBytes = new Uint8Array([state]);
          return { data: new DataView(stateBytes.buffer), status: 'ok' };
        }
      }
      // Unknown request — return empty
      return { data: new DataView(new ArrayBuffer(0)), status: 'ok' };
    },

    async controlTransferOut(setup, data) {
      if (setup.requestType !== 'class') {
        return { bytesWritten: 0, status: 'ok' };
      }
      if (setup.request === DFU_REQUEST.DNLOAD) {
        const dataBytes = data instanceof Uint8Array ? data : (data && data.buffer ? new Uint8Array(data.buffer) : new Uint8Array(0));
        if (dataBytes.length === 0) {
          // Final zero-length DNLOAD → enter manifestation
          state = DFU_STATE.dfuMANIFEST_SYNC;
        } else {
          // Data block DNLOAD
          downloadedBytes += dataBytes.length;
          totalBlocks++;
          bytesReceived.push(dataBytes);
          state = DFU_STATE.dfuDNLOAD_SYNC;
        }
        return { bytesWritten: dataBytes.length, status: 'ok' };
      }
      if (setup.request === DFU_REQUEST.CLRSTATUS) {
        state = DFU_STATE.dfuIDLE;
        lastStatus = DFU_STATUS.OK;
        return { bytesWritten: 0, status: 'ok' };
      }
      if (setup.request === DFU_REQUEST.ABORT) {
        state = DFU_STATE.dfuIDLE;
        bytesReceived = [];
        downloadedBytes = 0;
        return { bytesWritten: 0, status: 'ok' };
      }
      if (setup.request === DFU_REQUEST.DETACH) {
        // Simulate detach into DFU mode
        return { bytesWritten: 0, status: 'ok' };
      }
      return { bytesWritten: 0, status: 'ok' };
    },

    async reset() {
      // Reset to runtime mode — DFU library calls this after manifestation
      state = DFU_STATE.dfuIDLE;
      return Promise.resolve();
    },

    async forget() {
      return Promise.resolve();
    },
  };
}

/**
 * Inspect mock device transfer result for test assertions.
 *
 * @param {USBDevice} mockDevice — created via createMockDfuDevice
 * @returns {{state: number, downloadedBytes: number, totalBlocks: number, receivedBlockCount: number}}
 */
export function getMockTransferStats(mockDevice) {
  if (!mockDevice || !mockDevice.__getInternalState) {
    throw new TypeError('getMockTransferStats: not a mock DFU device');
  }
  return mockDevice.__getInternalState();
}

export const _internal = {
  DFU_REQUEST,
  DFU_STATUS,
  DFU_STATE,
  buildConfigDescriptor,
};
