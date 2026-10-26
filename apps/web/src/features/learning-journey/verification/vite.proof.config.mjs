import { defineConfig, mergeConfig } from "vite";
import { fileURLToPath } from "node:url";
import web from "../../../../vite.config.ts";

// The real Classroom now owns the mount. This configuration only selects the
// rollout flag and output directory; it never transforms application sources.
export default mergeConfig(web, defineConfig({
  root: fileURLToPath(new URL("../../../../", import.meta.url)),
  define: { "import.meta.env.VITE_S20_LEARNING_JOURNEY": JSON.stringify("1") },
  build: { outDir: fileURLToPath(new URL("../../../../../../../proof-dist", import.meta.url)), emptyOutDir: true, manifest: true },
}));
