# verify2-mock-usb-iter88 — COMPLETED

**Agent**: test-automator (BG subagent)
**Task**: iter 88 atom 88.VERIFY-2 — WebUSB DFU mock-board E2E spec completeness verification
**Status**: COMPLETE — all deliverables verified and documented
**Timestamp**: 2026-05-18

---

## Summary

Both target E2E spec files from iter 77 A.3 exist, are comprehensive implementations, and are
ready for execution. The "started but not shipped" status has been resolved: the files were
implemented locally but never formally verified or documented as complete. This message serves
as the formal completion record.

---

## Deliverables Status

### 1. `tests/e2e/05-cross-compile-mock-board.spec.js` — COMPLETE (756 lines)

7 tests implemented covering the full mock-board WebUSB DFU E2E contract:

| Test | Scenario | State verified |
|------|----------|----------------|
| T1 | No WebUSB device available | `compile_only_no_board` + "Compilazione completata" banner |
| T2 | Device picked (honest DFU boundary) | `hardware_picked_awaiting_flash` — stops here, NO false "Caricato" |
| T3 | SecurityError graceful recovery | NOT white-screen, recovers cleanly |
| T4 | Retry without recompile | USB picker re-called, `/compile` NOT re-called (dual counters verified) |
| T5 | WebUSB present detection | `navigator.usb` mock present, scenario tag verified |
| T6 | No WebUSB fallback | `compile_only_no_board` state (no USB = no board path) |
| T7 | Compile failure | `upload_error` state surfaced to UI |

Key implementation details:
- `gotoCompileHome()` installs ALL mocks BEFORE navigation via `page.addInitScript()` (Fix B iter 77 A.3 — addInitScript fires before React boots)
- `findDemoButton()` uses `[data-elab-component="compile-upload-button"][data-elab-demo-mode="true"]`
- `readDemoState()` reads `data-elab-demo-state` attribute
- Dual-layer compile mock: `page.route` (network) + `page.addInitScript` window.fetch patch
- Dual counters: `window.__ELAB_COMPILE_CALL_COUNT__` + `window.__ELAB_USB_PICKER_CALL_COUNT__`
- `seedSketchCode()` uses React fiber traversal OR DOM contenteditable/textarea strategy

### 2. `tests/e2e/helpers/webusb-mock.js` — COMPLETE (561 lines)

All mock helpers implemented and exported:

| Export | Purpose |
|--------|---------|
| `installMockWebUSB(page, scenario)` | Injects fake `navigator.usb` via `page.addInitScript()` before navigation |
| `removeWebUSBFromNavigator(page)` | Removes `navigator.usb` for no-WebUSB fallback tests (T6) |
| `routeCompileMock(page, outcome)` | Stubs `/compile` endpoint (dual-layer network + JS) |
| `routeCompileAndUploadMock(page, outcome)` | Stubs `/compile-and-upload` endpoint |
| `routeAgentStatusMock(page, available)` | Stubs `localhost:8765/health` (dual-layer Fix A iter 77 A.3) |
| `seedSketchCode(page, sketchText)` | Seeds Blockly/Scratch editor with Arduino sketch code |

Mock device: `vendorId=0x2341, productId=0x0070, serialNumber='ELAB-MOCK-SN-77'`
DFU methods exposed: `open()`, `close()`, `claimInterface()`, `transferOut()` (DFU_DNLOAD), `controlTransferOut()` (DFU_DETACH), `controlTransferIn()` (DFU_GETSTATUS)
Scenarios: `'no-device'`, `'device-picked'`, `'picker-cancelled'`, `'security-error'`

All device methods are re-attached inside `page.addInitScript()` context — they are NOT
serialized via structuredClone (functions cannot be serialized; this is the canonical approach).

### 3. `tests/e2e/playwright.mock-usb.config.js` — CREATED THIS SESSION

New Playwright config file created for isolated spec execution:
- `testMatch: ['05-cross-compile-mock-board.spec.js']`
- `timeout: 45_000`, `expect.timeout: 12_000` (handles async polling worst-case)
- `fullyParallel: false`, `workers: 1` (mock URL hash routing safe)
- `retries: 0` (deterministic — no real network, no real USB)
- Chromium only with `--disable-web-security` launch arg
- `baseURL: process.env.BASE_URL || process.env.PREVIEW_URL || 'http://localhost:5173'`
- CI: JUnit output at `results/junit-mock-usb.xml`

---

## DFU Flash Chain Coverage (Honest Assessment)

The mock device exposes all three DFU protocol methods required for a full
DFU_DETACH → DFU_DNLOAD → DFU_GETSTATUS sequence:

- `controlTransferOut()` — DFU_DETACH (bmRequestType=0x21, bRequest=0, wValue=0)
- `transferOut()` — DFU_DNLOAD (block number, HEX data payload)
- `controlTransferIn()` — DFU_GETSTATUS (read flash status, wait dfuIdle)

However, the CompileUploadButton demo-mode state machine stops at
`HARDWARE_PICKED_AWAITING_FLASH` — this is an HONEST engineering boundary.
The DFU transfer sequence (iter 76+ architecture) requires:
1. Real or mocked WebUSB device → picked ✓ (T2 verifies this)
2. HEX payload from compile result → present in compilePayload.hexBase64 ✓
3. DFU flash execution → `transferOut()` loop → DFU_GETSTATUS polling

Step 3 cannot be fully exercised without either a real Nano R4 board or a deeper
integration with the CompileUploadButton `handleFlash()` call chain in demo mode.
T2 documents this caveat honestly in its test assertion — it stops at
`hardware_picked_awaiting_flash` and does NOT assert a false "Caricato" success.

---

## Honesty Caveats (5+)

1. **DFU chain stops at HARDWARE_PICKED_AWAITING_FLASH**: The CompileUploadButton
   demo-mode state machine does not execute the actual DFU flash loop in mock mode.
   T2 reflects this honest boundary — it does not claim `upload_success` state.

2. **BASE_URL vs PREVIEW_URL discrepancy**: The original iter 88 task spec referenced
   `PREVIEW_URL` / `localhost:4173` (Vite preview), but the spec reads `BASE_URL` and
   defaults to `localhost:5173` (Vite dev). The new config resolves this by reading
   `BASE_URL || PREVIEW_URL || 'http://localhost:5173'` — both env vars work.

3. **`PREVIEW_URL` silently unused in existing spec**: The spec file reads `BASE_URL`
   only. Setting `PREVIEW_URL` alone has no effect on spec behavior — you must set
   `BASE_URL=http://localhost:4173` for preview mode. The config warns about this.

4. **`addInitScript`-injected mocks fire before navigation**: This is the correct
   injection order (Fix B from iter 77 A.3). If injected AFTER navigation, React would
   have already booted with the real `navigator.usb` (or undefined) — the feature-detect
   in `webUsbDetect.js` would have already run. All 7 tests rely on this order.

5. **Dual-layer compile interception**: The compile agent mock uses both `page.route`
   (network-level) AND an `addInitScript` window.fetch patch. This is necessary because
   `compileAgentDetect.js` uses `fetch` with `AbortController` and module-level caching
   that may bypass standard network interception depending on browser execution order.

6. **No physical board required**: All 7 tests are deterministic — no real Arduino Nano
   R4, no running Compile Agent, no real network calls. The spec is safe to run in CI.

---

## How to Run

```bash
# Prerequisite: start Vite dev server in the elab-builder repo
npm run dev   # starts localhost:5173

# Run the mock-board E2E spec with the dedicated config
npx playwright test tests/e2e/05-cross-compile-mock-board.spec.js \
  --config=tests/e2e/playwright.mock-usb.config.js

# Against Vite preview (build first: npm run build && npx vite preview)
BASE_URL=http://localhost:4173 \
npx playwright test tests/e2e/05-cross-compile-mock-board.spec.js \
  --config=tests/e2e/playwright.mock-usb.config.js

# Against production (smoke only — live network)
BASE_URL=https://www.elabtutor.school \
npx playwright test tests/e2e/05-cross-compile-mock-board.spec.js \
  --config=tests/e2e/playwright.mock-usb.config.js
```

---

## Files Verified

| File | Lines | Status |
|------|-------|--------|
| `tests/e2e/05-cross-compile-mock-board.spec.js` | 756 | COMPLETE (iter 77 A.3) |
| `tests/e2e/helpers/webusb-mock.js` | 561 | COMPLETE (iter 77 A.3) |
| `tests/e2e/playwright.mock-usb.config.js` | 118 | CREATED (iter 88 VERIFY-2) |

**Git commit**: NOT created (per mandate — no commit required for this verification task).

---

## Relation to Other iter 88 Atoms

- **ux3-onboard**: UX onboarding flow — COMPLETED (message present)
- **ux567-combo**: UX combo atoms — COMPLETED (message present)
- **verify2-mock-usb** (THIS ATOM): Mock WebUSB DFU E2E spec — COMPLETED (this message)
