import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import type { Plugin } from "vite"

// Finite inventory shipped by the locked MathLive package, not a file-server root.
const FONT_NAMES = [
  "KaTeX_AMS-Regular", "KaTeX_Caligraphic-Bold", "KaTeX_Caligraphic-Regular",
  "KaTeX_Fraktur-Bold", "KaTeX_Fraktur-Regular", "KaTeX_Main-Bold",
  "KaTeX_Main-BoldItalic", "KaTeX_Main-Italic", "KaTeX_Main-Regular",
  "KaTeX_Math-BoldItalic", "KaTeX_Math-Italic", "KaTeX_SansSerif-Bold",
  "KaTeX_SansSerif-Italic", "KaTeX_SansSerif-Regular", "KaTeX_Script-Regular",
  "KaTeX_Size1-Regular", "KaTeX_Size2-Regular", "KaTeX_Size3-Regular",
  "KaTeX_Size4-Regular", "KaTeX_Typewriter-Regular",
] as const

export function localMathLiveFonts(): Plugin {
  const root = fileURLToPath(new URL("../node_modules/mathlive/", import.meta.url))
  const packageInfo = JSON.parse(readFileSync(`${root}/package.json`, "utf8")) as { version: string }
  if (packageInfo.version !== "0.111.1") throw new Error("Review the local font inventory when updating MathLive")
  const prefix = "mathlive-fonts/"
  const files = new Map<string, Buffer>(FONT_NAMES.map((name) => [
    `${prefix}${name}.woff2`, readFileSync(`${root}/fonts/${name}.woff2`),
  ]))
  files.set(`${prefix}LICENSE-MATHLIVE.txt`, readFileSync(`${root}/LICENSE.txt`))
  files.set(`${prefix}LICENSE-KATEX.txt`, readFileSync(new URL("../node_modules/katex/LICENSE", import.meta.url)))
  return {
    name: "ardesia-local-mathlive-fonts",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const method = request.method ?? "GET"
        if (method !== "GET" && method !== "HEAD") return next()
        const path = (request.url ?? "").split("?")[0]!
        const name = path.startsWith(server.config.base) ? path.slice(server.config.base.length) : ""
        const bytes = files.get(name)
        if (!bytes) return next()
        response.setHeader("Content-Type", name.endsWith(".woff2") ? "font/woff2" : "text/plain; charset=utf-8")
        response.setHeader("Content-Length", bytes.byteLength)
        response.end(method === "HEAD" ? undefined : bytes)
      })
    },
    generateBundle() {
      for (const [fileName, source] of files) this.emitFile({ type: "asset", fileName, source })
    },
  }
}
