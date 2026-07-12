// Golden-path §8 — config Playwright di apps/studio (la config in eval/ resta
// scoped al solo replay-kill-test). testDir e2e/: smoke di superficie reale
// contro il dev server vite, inclusa la smoke bloccante del job CI studio.
import { defineConfig } from "@playwright/test"

const externalBaseURL = process.env.ARDESIA_STUDIO_E2E_BASE_URL?.trim()
const baseURL = externalBaseURL || "http://localhost:5199"

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  outputDir: "test-results",
  reporter: [
    ["line"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL,
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  ...(externalBaseURL
    ? {}
    : {
        webServer: {
          // MAI pipe sull'output del dev server (gotcha SIGPIPE): lo gestisce Playwright.
          command: "npx vite --port 5199 --strictPort",
          url: "http://localhost:5199",
          reuseExistingServer: true,
          timeout: 60_000,
        },
      }),
})
