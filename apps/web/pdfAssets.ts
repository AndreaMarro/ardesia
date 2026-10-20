import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import type { Plugin } from "vite";

/** Serve the installed, locked PDF.js assets and all their notices from our origin. */
export function pdfAssets(): Plugin {
  const require = createRequire(import.meta.url);
  const root = dirname(require.resolve("pdfjs-dist/package.json"));
  const version = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;
  if (version !== "6.4.299") throw new Error("Review PDF.js adapter before changing its version.");
  const prefix = `pdfjs/${version}/`;
  const files = new Map<string, Buffer>();
  files.set(`${prefix}LICENSE`, readFileSync(join(root, "LICENSE")));
  for (const directory of ["cmaps", "standard_fonts", "wasm", "iccs"]) {
    for (const name of readdirSync(join(root, directory))) {
      files.set(`${prefix}${directory}/${name}`, readFileSync(join(root, directory, name)));
    }
  }
  files.set(`${prefix}manifest.json`, Buffer.from(JSON.stringify({
    package: "pdfjs-dist", version,
    assets: [...files].map(([path, bytes]) => ({
      path, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex"),
    })),
  }, null, 2)));
  return {
    name: "ardesia-local-pdf-assets",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? "").split("?")[0].replace(/^\//, "");
        const bytes = files.get(path);
        if (!bytes) return next();
        res.setHeader("Content-Type", path.endsWith(".wasm") ? "application/wasm"
          : path.endsWith(".json") ? "application/json" : "application/octet-stream");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.end(bytes);
      });
    },
    generateBundle() {
      for (const [fileName, source] of files) this.emitFile({ type: "asset", fileName, source });
    },
  };
}
