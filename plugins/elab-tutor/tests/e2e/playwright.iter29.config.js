// playwright.iter29.config.js — Sprint T iter 29 P0 task D
// 92 esperimenti audit UNO PER UNO against prod.
// Parallel workers (4) for speed, no retries (we want raw verdicts).

import { defineConfig } from '@playwright/test';

const PROD_URL = (
  process.env.ELAB_PROD_URL ||
  'https://elab-tutor-git-e2e-bypass-preview-andreas-projects-6d4e9791.vercel.app'
).replace(/\/$/, '');

export default defineConfig({
  testDir: '.',
  testMatch: /29-92-esperimenti-audit\.spec\.js$/,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  workers: 4,
  retries: 0,
  maxFailures: 0,
  reporter: [
    ['list'],
    ['json', { outputFile: '../../automa/state/iter-29-92-esperimenti/playwright-report.json' }],
  ],
  use: {
    baseURL: PROD_URL,
    screenshot: 'only-on-failure',
    trace: 'off',
    video: 'off',
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
