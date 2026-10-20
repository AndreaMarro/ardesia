import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
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
