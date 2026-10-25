import { defineConfig } from "@playwright/test";
const externalOrigin = process.env.ARDESIA_PUBLIC_BASE_URL;

export default defineConfig({
  testDir: "./e2e-public",
  timeout: 30000,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: externalOrigin || "http://127.0.0.1:5324",
    browserName: "chromium",
    trace: "retain-on-failure",
    launchOptions: process.env.ARDESIA_BROWSER
      ? { executablePath: process.env.ARDESIA_BROWSER }
      : {},
  },
  // Plain static server: no Vite API proxy, SPA fallback or synthetic backend.
  webServer: externalOrigin ? undefined : {
    command: "python3 ../../bin/web/serve_public_preview.py --port 5324",
    url: "http://127.0.0.1:5324",
    reuseExistingServer: false,
  },
  outputDir: "test-results/public-preview",
});
