/**
 * Playwright config for iter 79 Atom 79.0 — Built-bundle smoke spec.
 *
 * Runs ONLY tests/e2e/build-preview-smoke.spec.js against a vite preview
 * server already running on http://localhost:4173. The server lifecycle is
 * managed externally by `scripts/run-build-smoke.sh` (the canonical entry
 * point invoked by `npm run test:build-smoke`).
 *
 * webServer config was tried and removed: @playwright/test 1.58.2 webServer
 * detection times out reliably against vite preview 7.x even though the
 * server responds HTTP 200 in 2s (verified via curl). External lifecycle
 * via bash wrapper script is robust.
 *
 * Safe to keep permanently — this config is the canonical built-bundle
 * regression gate iter 79+.
 */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: ['build-preview-smoke.spec.js'],
  timeout: 60000,
  expect: { timeout: 15000 },
  fullyParallel: false, // sequential to keep server load predictable
  workers: 1,
  retries: 0,
  reporter: [['list']],
  outputDir: './results/artifacts-build-smoke',
  use: {
    baseURL: 'http://localhost:4173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'off',
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
