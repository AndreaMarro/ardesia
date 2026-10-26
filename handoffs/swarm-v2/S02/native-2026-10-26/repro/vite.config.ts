import { defineConfig, mergeConfig } from "vite";
import { fileURLToPath } from "node:url";
import { realpathSync } from "node:fs";
import base from "../apps/web/vite.config";
const root = fileURLToPath(new URL("../", import.meta.url));
export default mergeConfig(base, defineConfig({
  root: root + "apps/web",
  server: { host: "127.0.0.1", port: 5420, strictPort: true,
    fs: { allow: [root, realpathSync(root + "node_modules")] },
    proxy: { "/study": { target: "http://127.0.0.1:5421", changeOrigin: false } },
  },
}));
