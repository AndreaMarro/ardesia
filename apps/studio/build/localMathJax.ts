import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import type { Plugin } from "vite"

/** Browser bundle from the existing lock, without importing the CJS entry. */
export function localMathJax(): Plugin {
  const root = fileURLToPath(new URL("../node_modules/mathjax-full/", import.meta.url))
  const info = JSON.parse(readFileSync(`${root}/package.json`, "utf8")) as { version: string }
  if (info.version !== "3.2.1") throw new Error("Review the MathJax browser asset when updating the lock")
  const files = new Map([
    ["mathjax/tex-svg-full.js", readFileSync(`${root}/es5/tex-svg-full.js`)],
    ["mathjax/LICENSE.txt", readFileSync(`${root}/LICENSE`)],
  ])
  return {
    name: "ardesia-local-mathjax",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const method = request.method ?? "GET"
        if (method !== "GET" && method !== "HEAD") return next()
        const path = (request.url ?? "").split("?")[0]!
        const name = path.startsWith(server.config.base) ? path.slice(server.config.base.length) : ""
        const bytes = files.get(name)
        if (!bytes) return next()
        response.setHeader("Content-Type", name.endsWith(".js") ? "application/javascript" : "text/plain; charset=utf-8")
        response.setHeader("Content-Length", bytes.byteLength)
        response.end(method === "HEAD" ? undefined : bytes)
      })
    },
    generateBundle() {
      for (const [fileName, source] of files) this.emitFile({ type: "asset", fileName, source })
    },
  }
}
