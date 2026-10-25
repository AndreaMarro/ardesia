import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  timeout: 60000,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.ARDESIA_WEB_URL ?? "http://127.0.0.1:5320",
    browserName: "chromium",
    launchOptions: process.env.ARDESIA_BROWSER
      ? { executablePath: process.env.ARDESIA_BROWSER }
      : {},
    trace: "retain-on-failure",
  },
  outputDir: "../../../web-qa/e2e-artifacts",
});
