/**
 * tests/e2e/playwright.mock-usb.config.js
 *
 * Playwright config for iter 77 A.3 / iter 88 VERIFY-2 —
 * WebUSB DFU mock-board E2E spec.
 *
 * Runs ONLY tests/e2e/05-cross-compile-mock-board.spec.js against a Vite
 * dev server (default localhost:5173) OR a Vite preview server
 * (localhost:4173 when PREVIEW_URL env is set) OR the live production URL
 * when BASE_URL=https://www.elabtutor.school.
 *
 * The spec installs a fake `navigator.usb` via `page.addInitScript` BEFORE
 * React boots, and stubs the compile agent HTTP API via `page.route`, so no
 * physical Arduino Nano R4 board nor a running Compile Agent is required.
 *
 * ─── Why Chromium only ────────────────────────────────────────────────────
 * WebUSB is a Chromium-only API. Firefox and Safari do not implement it.
 * The mock replaces `navigator.usb` at the JS level so other browsers could
 * in theory run the tests, but the demo-mode state machine under test is
 * specifically gated on the browser's WebUSB capability detection in
 * `webUsbDetect.js`. Limiting to Chromium keeps the tests honest.
 *
 * ─── How to run ───────────────────────────────────────────────────────────
 *   # Against Vite dev server (start it first: npm run dev)
 *   npx playwright test tests/e2e/05-cross-compile-mock-board.spec.js \
 *     --config=tests/e2e/playwright.mock-usb.config.js
 *
 *   # Against Vite preview (build first: npm run build)
 *   BASE_URL=http://localhost:4173 \
 *   npx playwright test tests/e2e/05-cross-compile-mock-board.spec.js \
 *     --config=tests/e2e/playwright.mock-usb.config.js
 *
 *   # Against production (smoke only — live network)
 *   BASE_URL=https://www.elabtutor.school \
 *   npx playwright test tests/e2e/05-cross-compile-mock-board.spec.js \
 *     --config=tests/e2e/playwright.mock-usb.config.js
 *
 * ─── Honesty caveats ──────────────────────────────────────────────────────
 * 1. The DFU flash sequence (DFU_DETACH → DFU_DNLOAD → DFU_GETSTATUS) is
 *    exercised at the mock level only. The CompileUploadButton demo-mode
 *    state machine stops at HARDWARE_PICKED_AWAITING_FLASH — this is an
 *    honest engineering boundary because actual DFU transfer cannot be
 *    verified without a real Nano R4 board (T2 documents this caveat).
 *
 * 2. The BASE_URL in the spec defaults to http://localhost:5173 (Vite dev
 *    server port), NOT localhost:4173 (Vite preview port) as originally
 *    mentioned in the iter 88 task spec. Set BASE_URL env to override.
 *
 * 3. PREVIEW_URL env var is silently unused (the spec reads BASE_URL; set
 *    BASE_URL=http://localhost:4173 for preview).
 *
 * 4. addInitScript-injected mocks fire before page navigation. This is the
 *    correct order (Fix B from iter 77 A.3) and is verified by all 7 tests.
 *
 * 5. The compile agent mock (localhost:8765/compile) uses dual-layer
 *    interception: page.route (network) + addInitScript window.fetch patch.
 *    This handles both standard fetch paths and AbortController/CORS modes.
 */
import { defineConfig } from '@playwright/test';

const BASE_URL =
  process.env.BASE_URL ||
  process.env.PREVIEW_URL ||
  'http://localhost:5173';

export default defineConfig({
  testDir: '.',
  testMatch: ['05-cross-compile-mock-board.spec.js'],

  // Each test has multiple async waits; 45s covers the worst-case polling.
  timeout: 45_000,
  expect: { timeout: 12_000 },

  // Serial execution — the mocks are page-scoped but running in parallel
  // on the same dev server could cause flakiness in URL hash routing.
  fullyParallel: false,
  workers: 1,

  // No retries: these tests are deterministic (no real network, no real USB).
  retries: 0,

  reporter: process.env.CI
    ? [['junit', { outputFile: 'results/junit-mock-usb.xml' }], ['list']]
    : [['list']],

  outputDir: './results/artifacts-mock-usb',

  use: {
    baseURL: BASE_URL,

    // Required for WebUSB API: only Chromium implements it natively.
    // The mock replaces navigator.usb at JS level, but the feature-detect
    // in webUsbDetect.js also checks navigator.usb existence.
    browserName: 'chromium',

    // Launch args that mirror how a real Chrome user would encounter WebUSB.
    // '--enable-experimental-web-platform-features' is not needed because we
    // stub navigator.usb entirely via addInitScript.
    launchOptions: {
      args: [
        // Allow the page to call requestDevice() inside addInitScript context.
        '--disable-web-security',
      ],
    },

    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'off',
    viewport: { width: 1280, height: 720 },
  },

  projects: [
    {
      name: 'chromium-mock-usb',
      use: { browserName: 'chromium' },
    },
  ],
});
