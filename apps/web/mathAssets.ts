import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import type { Plugin } from "vite";

export function mathAssets(): Plugin {
  const require = createRequire(import.meta.url);
  const root = dirname(require.resolve("mathlive"));
  const version = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;
  if (version !== "0.110.0") throw Error("Review the MathLive adapter before changing its version.");
  const prefix = `mathlive/${version}/`;
  const files = new Map<string, Buffer>();
  files.set(prefix + "LICENSE.txt", readFileSync(join(root, "LICENSE.txt")));
  for (const name of readdirSync(join(root, "fonts")))
    files.set(prefix + "fonts/" + name, readFileSync(join(root, "fonts", name)));
  files.set(prefix + "manifest.json", Buffer.from(JSON.stringify({
    package: "mathlive", version, assets: [...files].map(([path, data]) => ({
      path, bytes: data.length, sha256: createHash("sha256").update(data).digest("hex"),
    })),
  }, null, 2)));
  return {
    name: "ardesia-local-mathlive-assets",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? "").split("?")[0].replace(/^\//, "");
        const bytes = files.get(path);
        if (!bytes) return next();
        res.setHeader("Content-Type", path.endsWith(".woff2") ? "font/woff2" : path.endsWith(".json") ? "application/json" : "text/plain");
        res.setHeader("X-Content-Type-Options", "nosniff"); res.end(bytes);
      });
    },
    generateBundle() {
      for (const [fileName, source] of files) this.emitFile({ type: "asset", fileName, source });
    },
  };
}
