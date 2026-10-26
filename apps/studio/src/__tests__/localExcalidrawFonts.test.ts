// @vitest-environment node
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { build } from "vite"
import { expect, it } from "vitest"
import { localExcalidrawFonts } from "../../build/localExcalidrawFonts"

it("packages every reviewed font with its own notice and preserves the private release restriction", async () => {
  const result = await build({ configFile: false, logLevel: "silent", plugins: [localExcalidrawFonts(), {
    name: "font-notice-probe", resolveId(id) { if (id === "virtual:notice-probe") return id },
    load(id) { if (id === "virtual:notice-probe") return "export const probe = 1" },
  }], build: { write: false, rollupOptions: { input: "virtual:notice-probe" } } })
  const bundles = Array.isArray(result) ? result : [result]
  const assets = bundles.flatMap((bundle) => "output" in bundle ? bundle.output : []).filter((item) => item.type === "asset")
  expect(assets.filter((item) => item.fileName.endsWith(".woff2"))).toHaveLength(234)
  const base = fileURLToPath(new URL("../../build/notices/excalidraw/", import.meta.url))
  const manifest = JSON.parse(readFileSync(`${base}/manifest.json`, "utf8"))
  expect(Object.keys(manifest.families)).toHaveLength(9)
  expect(manifest.restrictions.publicStudioReleaseAllowed).toBe(false)
  expect(manifest.families.Liberation.license).not.toBe("OFL-1.1")
  for (const value of Object.values(manifest.families) as { notice: string }[]) {
    const emitted = assets.find((item) => item.fileName === `excalidraw-assets/notices/${value.notice}`)
    expect(emitted?.type).toBe("asset")
    if (emitted?.type === "asset") expect(Buffer.from(emitted.source)).toEqual(readFileSync(`${base}/${value.notice}`))
  }
})
