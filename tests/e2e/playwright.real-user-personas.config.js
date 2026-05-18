import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: ['11-elab-scratch-real-user-personas.spec.js'],
  timeout: 90000,
  expect: { timeout: 20000 },
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: [['list'], ['html', { outputFolder: 'results/personas-html-report' }]],
  outputDir: './results/artifacts-personas',
  use: {
    baseURL: 'http://localhost:4173',
    screenshot: 'only-on-failure',
    trace: 'on',
    video: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
