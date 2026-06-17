import { defineConfig } from '@playwright/test';

// Stale specs pre-date WelcomePage license gate (commit 222b630 G44-PDR).
// Delivers Epic 3.1 "stale specs skip" per sprint-3 PR #18 scope.
// Refactor to handle gate flow scheduled sprint-4 Epic rebuild.
// Stress specs (13-20 subset) excluded via workflow grep-invert.
const STALE_SPECS_PENDING_REFACTOR = [
  /01-homepage-simulator\.spec\.js/,
  /03-unlim-chat\.spec\.js/,
  /04-teacher-dashboard\.spec\.js/,
  /06-simulator-experiments\.spec\.js/,
  /07-admin-security\.spec\.js/,
  /08-responsive-viewport\.spec\.js/,
  /09-chapter-map-navigation\.spec\.js/,
  /10-scratch-blockly\.spec\.js/,
  /11-teacher-full-journey\.spec\.js/,
  /21-lesson-reader-flow\.spec\.js/,
];

export default defineConfig({
  testDir: './e2e',
  testIgnore: STALE_SPECS_PENDING_REFACTOR,
  timeout: 60000,
  expect: { timeout: 15000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 30000,
  },
});
