import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { pdfAssets } from "./pdfAssets";
import { mathAssets } from "./mathAssets";
export default defineConfig({
  plugins: [react(), pdfAssets(), mathAssets()],
  resolve: { dedupe: ["react", "react-dom"] },
  test: { include: ["src/**/*.test.{ts,tsx}"] },
  server: {
    port: 5320,
    strictPort: true,
    proxy: {
      "/study": { target: "http://127.0.0.1:5321", changeOrigin: false },
    },
  },
});
