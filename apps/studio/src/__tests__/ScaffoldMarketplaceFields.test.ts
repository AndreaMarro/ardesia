// @vitest-environment node
//
// P0-D authoring — passthrough dei campi marketplace (#72) nello scaffolder:
// author (creatore ≠ publisher-che-firma), visibility, license. Tutti
// opzionali: spec senza campi → manifest legacy IDENTICO a prima (nessun
// campo emesso). La validazione resta quella del manifest (.strict + bounds).

import { describe, expect, it } from "vitest"
import { ToolManifestSchema } from "../toolhost-protocol/index.ts"
import {
  generateDevKeypair,
  scaffoldPlugin,
} from "../toolhost/authoring/scaffoldPlugin.ts"

const keysPromise = generateDevKeypair()

const BASE = { id: "io.test.mkt-fields", name: "Mkt Fields" }

describe("scaffoldPlugin — campi marketplace (#72)", () => {
  it("spec senza campi marketplace → manifest LEGACY: nessuna chiave emessa", async () => {
    const out = await scaffoldPlugin(BASE, await keysPromise)
    const raw = JSON.parse(out.manifestJson) as Record<string, unknown>
    expect("author" in raw).toBe(false)
    expect("visibility" in raw).toBe(false)
    expect("license" in raw).toBe(false)
  })

  it("passthrough completo: author/visibility/license arrivano nel manifest firmato e validato", async () => {
    const out = await scaffoldPlugin(
      {
        ...BASE,
        author: { name: "Andrea Marro", url: "https://example.com/andrea" },
        visibility: "unlisted",
        license: "MIT",
      },
      await keysPromise,
    )
    const manifest = ToolManifestSchema.parse(JSON.parse(out.manifestJson))
    expect(manifest.author).toEqual({ name: "Andrea Marro", url: "https://example.com/andrea" })
    expect(manifest.visibility).toBe("unlisted")
    expect(manifest.license).toBe("MIT")
  })

  it("fail-closed: visibility fuori enum e author malformato → reject (nessuno scaffold firmato)", async () => {
    const keys = await keysPromise
    await expect(
      scaffoldPlugin({ ...BASE, visibility: "secret" as never }, keys),
    ).rejects.toThrow()
    await expect(
      scaffoldPlugin({ ...BASE, author: { url: "https://x.example" } as never }, keys),
    ).rejects.toThrow()
  })

  it("determinismo conservato: stessa spec coi campi → stessi byte", async () => {
    const keys = await keysPromise
    const spec = { ...BASE, author: { name: "A" }, visibility: "public" as const, license: "MIT" }
    const a = await scaffoldPlugin(spec, keys)
    const b = await scaffoldPlugin(spec, keys)
    expect(a.manifestJson).toBe(b.manifestJson)
    expect(a.signatureB64).toBe(b.signatureB64)
  })
})
