import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: ".",
  testMatch: "replay-kill-test.spec.ts",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:5173",
    headless: true,
  },
})
