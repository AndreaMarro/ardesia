import { defineConfig } from "@playwright/test";
import { tmpdir } from "node:os";
import { join } from "node:path";
export default defineConfig({
  testDir: ".", testMatch: "*.e2e.ts", workers: 1, timeout: 90000,
  outputDir: process.env.ARDESIA_S02_EVIDENCE ?? join(tmpdir(), "ardesia-s02-playwright"),
  reporter: "list",
  use: { baseURL: process.env.ARDESIA_WEB_URL ?? "http://127.0.0.1:5420", browserName: "chromium", trace: "retain-on-failure", launchOptions: process.env.ARDESIA_BROWSER ? {executablePath:process.env.ARDESIA_BROWSER} : {} },
});
