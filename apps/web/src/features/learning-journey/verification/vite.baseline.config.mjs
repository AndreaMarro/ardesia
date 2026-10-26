import { defineConfig, mergeConfig } from "vite";
import { fileURLToPath } from "node:url";
import web from "../../../../vite.config.ts";
export default mergeConfig(web, defineConfig({
  root: fileURLToPath(new URL("../../../../", import.meta.url)),
  build: { outDir: fileURLToPath(new URL("../../../../../../../baseline-dist", import.meta.url)), emptyOutDir: true },
}));
