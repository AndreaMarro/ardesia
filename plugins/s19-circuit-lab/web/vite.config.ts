import { defineConfig } from "vite";
export default defineConfig(({ mode }) => ({
  base: "/s19/circuit-lab/",
  server: {
    proxy: {
      "/study": { target: "http://127.0.0.1:5198", changeOrigin: true },
    },
  },
  build:
    mode === "test"
      ? {
          rollupOptions: {
            input: { main: "index.html", host: "tests/host.html" },
          },
        }
      : {},
}));
