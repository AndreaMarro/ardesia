/**
 * iter 82 Task 7 — Blockly UX overhaul E2E config.
 *
 * Runs 06-blockly-first-block-60s.spec.js + 07-blockly-accessibility.spec.js
 * against vite preview built bundle (server lifecycle managed externally).
 *
 * Same external-server pattern as playwright.build-smoke.config.js (iter 79.0
 * Atom 79.0) — @playwright/test 1.58.2 webServer config flaky vite preview 7.x.
 */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: ['06-blockly-first-block-60s.spec.js', '07-blockly-accessibility.spec.js'],
  timeout: 60000,
  expect: { timeout: 15000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  outputDir: './results/artifacts-iter82-blockly-ux',
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
