import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  timeout: 30000,
  expect: { timeout: 10000 },
  fullyParallel: true,
  workers: process.env.CI ? 1 : 2,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [['junit', { outputFile: 'results/junit.xml' }]]
    : [['html', { open: 'never', outputFolder: 'results/html' }]],
  use: {
    baseURL: process.env.BASE_URL || 'https://www.elabtutor.school',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
  },
  outputDir: 'results/artifacts',
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    // Add firefox/webkit later when stable
  ],
});
