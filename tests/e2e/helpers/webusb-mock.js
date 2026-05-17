/**
 * tests/e2e/helpers/webusb-mock.js
 *
 * Iter 77 A.3 — Reusable WebUSB mock factory for Playwright E2E specs.
 *
 * Provides `installMockWebUSB(page, scenario)` which uses
 * `page.addInitScript` to inject a fake `navigator.usb` object BEFORE any
 * application script runs. This lets tests exercise the CompileUploadButton
 * demo-mode state machine (iter 76 D.1) without a physical Nano R4 board.
 *
 * Scenarios:
 *   'no-device'        – requestDevice() returns null (no board connected)
 *   'device-picked'    – requestDevice() resolves a minimal USB device stub
 *   'picker-cancelled' – requestDevice() rejects with DOMException NotFoundError
 *                        (user clicked Cancel in the browser picker)
 *   'security-error'   – requestDevice() rejects with DOMException SecurityError
 *                        (cross-origin iframe or missing Feature-Policy)
 *
 * Additionally exports `routeCompileMock(page, outcome)` to intercept
 * POST /compile network requests at the browser level (no real
 * localhost:8765 dependency needed).
 *
 * HOW ADDINIITSCRIPT WORKS:
 *   Playwright's `page.addInitScript` executes the supplied function in the
 *   page context BEFORE the document is parsed. This means by the time
 *   React hydrates and CompileUploadButton mounts, `navigator.usb` is
 *   already the mock object. Any subsequent `navigator?.usb?.requestDevice`
 *   call in application code hits our shim.
 *
 * HONESTY CAVEAT (1 of 5):
 *   W3C WebUSB spec requires `requestDevice` to be triggered by a user
 *   gesture (trusted event). In real Chrome, calling it outside a click
 *   handler throws. Playwright headless bypasses the trusted-event check
 *   because addInitScript installs a plain JS object — not a real WebUSB
 *   implementation — so no user-gesture enforcement fires. The real Omaric
 *   demo still requires an actual click by Andrea / Tea / Riccardo.
 *
 * HONESTY CAVEAT (2 of 5):
 *   Mock device stubs carry placeholder productId (0x0070) and vendorId
 *   (0x2341 — Arduino). Real Renesas RA4M1 Nano R4 descriptors differ.
 *   DFU vendor-specific descriptors are NOT in scope (iter 78+).
 *
 * HONESTY CAVEAT (3 of 5):
 *   DFU upload chain (dfu-util binary + USB bulk transfer + verify flash)
 *   is NOT exercised here. HARDWARE_PICKED_AWAITING_FLASH is the honest
 *   stop point — we only confirm the state transition, not actual flashing.
 *
 * HONESTY CAVEAT (4 of 5):
 *   WebUSB is behind a Chrome origin trial / feature flag. Playwright
 *   Chromium >= 89 exposes the real API but our mock replaces it entirely.
 *   If `page.addInitScript` fails silently in a restricted sandbox the
 *   test will degrade to navigator.usb === undefined, causing the
 *   compile_only_no_board fallback to trigger instead of device-picked.
 *
 * HONESTY CAVEAT (5 of 5):
 *   The compile mock (`routeCompileMock`) intercepts fetch calls via
 *   `page.route`. It covers the default CompileUploadButton `compileEndpoint`
 *   prop (`http://localhost:8765/compile`). If the component is rendered
 *   with a custom `compileEndpoint` the route pattern must be updated.
 *
 * @copyright © Andrea Marro — 2026-05-17 — ELAB Tutor iter 77 A.3
 */

// ─────────────────────────────────────────────────────────────────────────────
// Scenario definitions (serialised into page context via addInitScript)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * USB device stub returned when scenario === 'device-picked'.
 * Minimal shape matching what CompileUploadButton checks:
 *   `if (!device)` — must be truthy
 * The component does NOT inspect productId/vendorId further before
 * transitioning to HARDWARE_PICKED_AWAITING_FLASH.
 */
const MOCK_DEVICE_STUB = {
  productName: 'Arduino Nano 33 BLE (Mock)',
  manufacturerName: 'Arduino SA',
  vendorId: 0x2341,   // Arduino/Genuino
  productId: 0x0070,  // Nano R4 placeholder — real PID TBD iter 78+
  serialNumber: 'ELAB-MOCK-SN-77',
  deviceClass: 0xEF,
  deviceProtocol: 0x01,
  deviceSubclass: 0x02,
  usbVersionMajor: 2,
  opened: false,
  // Stub out mandatory WebUSBDevice prototype methods to prevent any
  // application code from crashing if it accidentally calls them.
  open:           async () => {},
  close:          async () => {},
  selectConfiguration: async () => {},
  claimInterface: async () => {},
  releaseInterface: async () => {},
  transferOut:    async () => ({ status: 'ok', bytesWritten: 0 }),
  transferIn:     async () => ({ status: 'ok', data: new DataView(new ArrayBuffer(0)) }),
  controlTransferOut: async () => ({ status: 'ok', bytesWritten: 0 }),
  controlTransferIn:  async () => ({
    status: 'ok',
    data: new DataView(new ArrayBuffer(4)),
  }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Install a mock `navigator.usb` implementation in `page` BEFORE navigation.
 *
 * MUST be called before `page.goto(...)`. Registers a persistent init-script
 * that fires on every navigation in the page context.
 *
 * @param {import('@playwright/test').Page} page
 * @param {'no-device'|'device-picked'|'picker-cancelled'|'security-error'} scenario
 * @returns {Promise<void>}
 */
export async function installMockWebUSB(page, scenario) {
  // Serialise the device stub and scenario into the script closure so that
  // Playwright's serialiser (structuredClone) can transfer them. Note that
  // functions on MOCK_DEVICE_STUB are NOT serialisable — we re-attach them
  // inside the page context where structuredClone doesn't apply.
  const serializableDeviceStub = {
    productName: MOCK_DEVICE_STUB.productName,
    manufacturerName: MOCK_DEVICE_STUB.manufacturerName,
    vendorId: MOCK_DEVICE_STUB.vendorId,
    productId: MOCK_DEVICE_STUB.productId,
    serialNumber: MOCK_DEVICE_STUB.serialNumber,
    deviceClass: MOCK_DEVICE_STUB.deviceClass,
    deviceProtocol: MOCK_DEVICE_STUB.deviceProtocol,
    deviceSubclass: MOCK_DEVICE_STUB.deviceSubclass,
    usbVersionMajor: MOCK_DEVICE_STUB.usbVersionMajor,
    opened: false,
  };

  await page.addInitScript(
    ({ scenario: _scenario, deviceStub: _stub }) => {
      // Re-attach stub methods inside the page context (no serialisation issue)
      const deviceStub = Object.assign({}, _stub, {
        open:               () => Promise.resolve(),
        close:              () => Promise.resolve(),
        selectConfiguration: () => Promise.resolve(),
        claimInterface:     () => Promise.resolve(),
        releaseInterface:   () => Promise.resolve(),
        transferOut:        () => Promise.resolve({ status: 'ok', bytesWritten: 0 }),
        transferIn:         () => Promise.resolve({
          status: 'ok',
          data: new DataView(new ArrayBuffer(0)),
        }),
        controlTransferOut: () => Promise.resolve({ status: 'ok', bytesWritten: 0 }),
        controlTransferIn:  () => Promise.resolve({
          status: 'ok',
          data: new DataView(new ArrayBuffer(4)),
        }),
      });

      // Build mock requestDevice based on scenario
      let requestDevice;
      switch (_scenario) {
        case 'device-picked':
          requestDevice = async (_filters) => deviceStub;
          break;

        case 'no-device':
          // Resolves with null — component must handle this branch.
          requestDevice = async (_filters) => null;
          break;

        case 'picker-cancelled': {
          // W3C spec: user dismissal → DOMException NotFoundError
          const err = new DOMException(
            'No device selected.',
            'NotFoundError',
          );
          requestDevice = async (_filters) => { throw err; };
          break;
        }

        case 'security-error': {
          const err = new DOMException(
            'Access to the feature "usb" is disallowed by permissions policy.',
            'SecurityError',
          );
          requestDevice = async (_filters) => { throw err; };
          break;
        }

        default:
          // Unknown scenario → behave like no-device (safe fallback)
          requestDevice = async (_filters) => null;
      }

      // Install the full mock navigator.usb object.
      // We overwrite unconditionally so the real Chrome WebUSB is replaced.
      const mockUSB = {
        requestDevice,
        getDevices: async () => [],
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      };

      // Use defineProperty so any code that does `if (navigator.usb)` gets true.
      Object.defineProperty(navigator, 'usb', {
        value: mockUSB,
        writable: true,
        configurable: true,
      });

      // Expose scenario on window for test-side assertions via page.evaluate.
      window.__ELAB_USB_MOCK_SCENARIO__ = _scenario;
    },
    { scenario, deviceStub: serializableDeviceStub },
  );
}

/**
 * Remove mock `navigator.usb` so the test simulates Safari / Firefox where
 * WebUSB is completely absent (undefined).
 *
 * MUST be called before `page.goto(...)`.
 *
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<void>}
 */
export async function removeWebUSBFromNavigator(page) {
  await page.addInitScript(() => {
    // Simulate non-Chrome browser where WebUSB API is absent.
    try {
      Object.defineProperty(navigator, 'usb', {
        value: undefined,
        writable: true,
        configurable: true,
      });
    } catch (_e) {
      // Readonly in some contexts — acceptable fallback
    }
    window.__ELAB_USB_MOCK_SCENARIO__ = 'no-webusb-api';
  });
}

/**
 * Route `POST http://localhost:8765/compile` via `page.route` so tests do
 * not depend on a real local Compile Agent process.
 *
 * @param {import('@playwright/test').Page} page
 * @param {'success'|'compile-failed'|'agent-offline'} outcome
 * @param {object} [overrides]  Extra fields merged into the response body
 * @returns {Promise<void>}
 */
export async function routeCompileMock(page, outcome = 'success', overrides = {}) {
  await page.route('http://localhost:8765/compile', async (route) => {
    switch (outcome) {
      case 'success':
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          // Matches iter 76 D.1 real arduino-cli stdout format so
          // parseCompileStdout extracts byte counts correctly.
          body: JSON.stringify(Object.assign({
            ok: true,
            jobId: 'mock-job-77-A3',
            stdout: 'Lo sketch usa 39048 byte (14%) dello spazio disponibile per i programmi. Il massimo è 262144 byte.\nLe variabili globali usano 3940 byte (12%) di memoria dinamica, lasciando 28644 byte liberi per le variabili locali. Il massimo è 32768 byte.',
            stderr: '',
          }, overrides)),
        });
        break;

      case 'compile-failed':
        await route.fulfill({
          status: 422,
          contentType: 'application/json',
          body: JSON.stringify(Object.assign({
            ok: false,
            error: {
              category: 'compile_failed',
              message: 'mock compile error — iter 77 sandbox',
            },
          }, overrides)),
        });
        break;

      case 'agent-offline':
        // Simulate network-level refusal (agent process not running)
        await route.abort('connectionrefused');
        break;

      default:
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ ok: false, error: { category: 'unknown' } }),
        });
    }
  });
}

/**
 * Also route the legacy `/compile-and-upload` endpoint (iter 69 non-demo
 * path) so tests that accidentally trigger it don't hang waiting for a
 * real agent.
 *
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<void>}
 */
export async function routeCompileAndUploadMock(page) {
  await page.route('http://localhost:8765/compile-and-upload', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, jobId: 'mock-combined-77' }),
    });
  });
}

/**
 * Also route the agent status/health endpoint so `getCompileAgentStatus()`
 * (polled on mount) returns "available: true" allowing the button to enable.
 *
 * @param {import('@playwright/test').Page} page
 * @param {boolean} [available=true]
 * @returns {Promise<void>}
 */
export async function routeAgentStatusMock(page, available = true) {
  await page.route('http://localhost:8765/health', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: available ? 'ok' : 'offline',
        available,
        port: 8765,
        version: 'mock-iter-77',
      }),
    });
  });
}
