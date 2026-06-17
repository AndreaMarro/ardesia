import { defineConfig } from '@playwright/test';

// Tester-1 iter 37 dedicated config — runs A7+A8 specs from tests/e2e/ against prod.
// NO local webServer required (specs use prod baseURL).
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: ['03-fumetto-flow.spec.js', '04-lavagna-persistence.spec.js'],
  timeout: 60000,
  expect: { timeout: 15000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['line']],
  use: {
    baseURL: 'https://www.elabtutor.school',
    screenshot: 'on',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
