import { readFileSync, readdirSync } from "node:fs"
import { createHash } from "node:crypto"
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
  const noticesRoot = fileURLToPath(new URL("./notices/excalidraw/", import.meta.url))
  const manifest = JSON.parse(readFileSync(`${noticesRoot}/manifest.json`, "utf8")) as {
    version: string; assets: { family: string; file: string; sha256: string }[];
    families: Record<string, { notice: string; noticeSha256: string }>;
  }
  if (manifest.version !== "0.18.1" || manifest.assets.length !== files.size) throw new Error("Review the locked font notice inventory")
  for (const asset of manifest.assets) {
    const file = files.get(`${prefix}${asset.family}/${asset.file}`)
    if (!file || createHash("sha256").update(readFileSync(file)).digest("hex") !== asset.sha256) {
      throw new Error("Font bytes differ from the reviewed upstream inventory")
    }
    const notice = manifest.families[asset.family]
    if (!notice || createHash("sha256").update(readFileSync(`${noticesRoot}/${notice.notice}`)).digest("hex") !== notice.noticeSha256) {
      throw new Error("Missing or altered font notice")
    }
  }
  for (const name of readdirSync(noticesRoot)) {
    if (name.endsWith(".txt") || name === "manifest.json") files.set(`excalidraw-assets/notices/${name}`, `${noticesRoot}/${name}`)
  }
  return {
    name: "ardesia-local-excalidraw-fonts",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.method !== "GET" && request.method !== "HEAD") return next()
        const path = (request.url ?? "").split("?")[0]!
        const name = path.startsWith(server.config.base) ? path.slice(server.config.base.length) : ""
        const file = files.get(name)
        if (!file) return next()
        const bytes = readFileSync(file)
        response.setHeader("Content-Type", name.endsWith(".woff2") ? "font/woff2" : name.endsWith(".json") ? "application/json" : "text/plain; charset=utf-8")
        response.setHeader("Content-Length", bytes.byteLength)
        response.end(request.method === "HEAD" ? undefined : bytes)
      })
    },
    generateBundle() {
      for (const [fileName, file] of files) {
        this.emitFile({ type: "asset", fileName, source: readFileSync(file) })
      }
    },
  }
}
