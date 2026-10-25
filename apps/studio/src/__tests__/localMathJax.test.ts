// @vitest-environment node
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { build } from "vite"
import { expect, it } from "vitest"
import { localMathJax } from "../../build/localMathJax"

it("ships the exact locked full browser bundle and its Apache notice", async () => {
  const result = await build({ configFile: false, logLevel: "silent", plugins: [localMathJax(), {
    name: "mathjax-build-probe", resolveId(id) { if (id === "virtual:mathjax-probe") return id },
    load(id) { if (id === "virtual:mathjax-probe") return "export const probe = 1" },
  }], build: { write: false, rollupOptions: { input: "virtual:mathjax-probe" } } })
  const bundles = Array.isArray(result) ? result : [result]
  const assets = bundles.flatMap((bundle) => "output" in bundle ? bundle.output : [])
    .filter((asset) => asset.type === "asset")
  const root = fileURLToPath(new URL("../../node_modules/mathjax-full/", import.meta.url))
  expect(assets.map((asset) => asset.fileName).sort()).toEqual(["mathjax/LICENSE.txt", "mathjax/tex-svg-full.js"])
  for (const [name, original] of [["mathjax/tex-svg-full.js", "es5/tex-svg-full.js"], ["mathjax/LICENSE.txt", "LICENSE"]]) {
    const asset = assets.find((item) => item.fileName === name)
    expect(asset?.type).toBe("asset")
    if (asset?.type === "asset") expect(Buffer.from(asset.source)).toEqual(readFileSync(`${root}/${original}`))
  }
  expect(readFileSync(`${root}/LICENSE`, "utf8")).toContain("Apache License")
})
