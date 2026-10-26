import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests",
  testMatch: process.env.S19_PRODUCT === "1" ? "product.spec.ts" : "lab.spec.ts",
  workers: 1,
  timeout: 45000,
  use: {
    baseURL: "http://127.0.0.1:5198",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  reporter: [["list"], ["json", { outputFile: "test-results/results.json" }]],
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1080 } } },
    {
      name: "touch",
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
