// @vitest-environment node
import { readFileSync, readdirSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { build, createServer } from "vite"
import { expect, it } from "vitest"
import { localMathLiveFonts } from "../../build/localMathLiveFonts"

const root = fileURLToPath(new URL("../../node_modules/mathlive/", import.meta.url))
const fontNames = readdirSync(`${root}/fonts`).filter((name) => name.endsWith(".woff2")).sort()

it("emits the exact locked font bytes plus MathLive and KaTeX license notices", async () => {
  const result = await build({ configFile: false, logLevel: "silent", plugins: [localMathLiveFonts(), {
    name: "font-build-probe", resolveId(id) { if (id === "virtual:font-probe") return id },
    load(id) { if (id === "virtual:font-probe") return "export const probe = 1" },
  }], build: { write: false, rollupOptions: { input: "virtual:font-probe" } } })
  const bundles = Array.isArray(result) ? result : [result]
  const assets = bundles.flatMap((bundle) => "output" in bundle ? bundle.output : [])
  const fonts = assets.filter((asset) => asset.fileName.endsWith(".woff2"))
  expect(fonts.map((asset) => asset.fileName).sort()).toEqual(fontNames.map((name) => `mathlive-fonts/${name}`))
  for (const font of fonts) {
    expect(font.type).toBe("asset")
    if (font.type === "asset") expect(Buffer.from(font.source)).toEqual(readFileSync(`${root}/fonts/${font.fileName.split("/").at(-1)}`))
  }
  for (const name of ["LICENSE-MATHLIVE.txt", "LICENSE-KATEX.txt"]) {
    const asset = assets.find((item) => item.fileName === `mathlive-fonts/${name}`)
    expect(asset?.type).toBe("asset")
    if (asset?.type === "asset") expect(Buffer.from(asset.source).toString()).toContain("Permission is hereby granted")
  }
})

it.each(["/", "/studio/"])("serves only allowlisted local font/notice bytes over native HTTP at %s", async (base) => {
  const server = await createServer({ configFile: false, base, plugins: [localMathLiveFonts()], logLevel: "silent",
    server: { host: "127.0.0.1", port: 0, strictPort: true, watch: null } })
  try {
    await server.listen()
    const address = server.httpServer!.address()
    if (!address || typeof address === "string") throw new Error("Missing native HTTP server address")
    const origin = `http://127.0.0.1:${address.port}`
    const response = await fetch(`${origin}${base}mathlive-fonts/KaTeX_Main-Regular.woff2`)
    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toBe("font/woff2")
    expect(Buffer.from(await response.arrayBuffer())).toEqual(readFileSync(`${root}/fonts/KaTeX_Main-Regular.woff2`))
    const head = await fetch(`${origin}${base}mathlive-fonts/KaTeX_Main-Regular.woff2`, { method: "HEAD" })
    expect((await head.arrayBuffer()).byteLength).toBe(0)
    const license = await fetch(`${origin}${base}mathlive-fonts/LICENSE-MATHLIVE.txt`)
    expect(await license.text()).toBe(readFileSync(`${root}/LICENSE.txt`, "utf8"))
    const unknown = await fetch(`${origin}${base}mathlive-fonts/package.json`)
    expect(unknown.headers.get("content-type")).not.toBe("font/woff2")
    expect(await unknown.text()).not.toContain('"name": "mathlive"')
  } finally { await server.close() }
})
