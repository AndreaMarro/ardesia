import { readFileSync, readdirSync } from "node:fs"
import { fileURLToPath } from "node:url"
import type { Plugin } from "vite"

/** Serve the fonts shipped by the locked Excalidraw package, also offline. */
export function localExcalidrawFonts(): Plugin {
  const root = fileURLToPath(new URL("../node_modules/@excalidraw/excalidraw/dist/prod/fonts/", import.meta.url))
  const prefix = "excalidraw-assets/fonts/"
  const files = new Map<string, string>()
  for (const entry of readdirSync(root, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".woff2")) continue
    const absolute = `${entry.parentPath}/${entry.name}`
    files.set(prefix + absolute.slice(root.length), absolute)
  }
  if (files.size === 0) throw new Error("Excalidraw fonts missing from the locked dependency")
  return {
    name: "ardesia-local-excalidraw-fonts",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const path = (request.url ?? "").split("?")[0]!
        const name = path.startsWith(server.config.base) ? path.slice(server.config.base.length) : ""
        const file = files.get(name)
        if (!file) return next()
        response.setHeader("Content-Type", "font/woff2")
        response.end(readFileSync(file))
      })
    },
    generateBundle() {
      for (const [fileName, file] of files) {
        this.emitFile({ type: "asset", fileName, source: readFileSync(file) })
      }
    },
  }
}
