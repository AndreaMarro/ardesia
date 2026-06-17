/**
 * Sprint U Playwright config — Cycle 1 Iter 1
 * Target: prod https://www.elabtutor.school
 * Single worker, sequential, retries 1.
 */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  timeout: 30000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: [
    ['line'],
    ['html', { open: 'never', outputFolder: 'docs/audits/sprint-u-cycle1-iter1-pw-report' }],
  ],
  use: {
    baseURL: 'https://www.elabtutor.school',
    headless: true,
    screenshot: 'on',
    video: 'off',
    storageState: undefined,
  },
});
