// playwright.harness-real.config.js — Sprint T iter 21
// Dedicated config for the REAL prod harness spec.
// NO webServer (run against live https://www.elabtutor.school).
// NO testIgnore filter — only runs the harness-real spec via testMatch.

import { defineConfig } from '@playwright/test';

const PROD_URL = (process.env.ELAB_PROD_URL || 'https://www.elabtutor.school').replace(/\/$/, '');

export default defineConfig({
  testDir: '.',
  testMatch: /harness-real-2026-04-28\.spec\.js$/,
  timeout: 120_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  maxFailures: 0,
  reporter: [
    ['list'],
    ['json', { outputFile: '../../automa/state/iter-21-harness-real/playwright-report.json' }],
  ],
  use: {
    baseURL: PROD_URL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'chromium-prod',
      use: { browserName: 'chromium' },
    },
  ],
});
