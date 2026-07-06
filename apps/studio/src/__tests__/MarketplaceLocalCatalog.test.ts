// @vitest-environment node
//
// P0-D marketplace locale-first — catalogo dei tool del workspace + preview di
// un package .maestrotool PRIMA dell'install. Nessun canale privilegiato: il
// catalogo legge SOLO ciò che la pipeline reale ha scritto (manifest firmati
// all'install, lifecycle di PluginManager); la preview verifica la firma
// ed25519 sugli stessi byte che l'installer verificherebbe (signatureValid),
// così l'UI può marcare un package manomesso PRIMA di proporre l'install.
// Fail-visible: manifest corrotto nel workspace → problems[], mai entry mute.

import { describe, expect, it } from "vitest"
import {
  buildLocalCatalog,
  previewPluginPackage,
} from "../toolhost/marketplace/localCatalog.ts"
import {
  generateDevKeypair,
  scaffoldPlugin,
} from "../toolhost/authoring/scaffoldPlugin.ts"
import { buildPluginPackage } from "../toolhost/authoring/packageFile.ts"
import { PluginManager } from "../toolhost/pluginManager.ts"
import { manifestPath } from "../toolhost/installer.ts"
import type { InstallerStore } from "../toolhost/installer.ts"
import type { StorageEntryLike } from "../toolhost/caps/storage.ts"

class MemoryInstallerStore implements InstallerStore {
  files = new Map<string, Blob>()

  async read(path: string): Promise<Blob | null> {
    return this.files.get(path) ?? null
  }
  async write(path: string, data: Blob): Promise<void> {
    this.files.set(path, data)
  }
  async delete(path: string): Promise<void> {
    this.files.delete(path)
  }
  async list(prefix?: string): Promise<StorageEntryLike[]> {
    return [...this.files.entries()]
      .filter(([p]) => prefix === undefined || p.startsWith(prefix))
      .map(([path, data]) => ({ path, data }))
  }
}

async function installScaffolded(
  pm: PluginManager,
  spec: Parameters<typeof scaffoldPlugin>[0],
) {
  const keys = await generateDevKeypair()
  const out = await scaffoldPlugin(spec, keys)
  await pm.install(out.manifestJson, out.bundleZip, out.signatureB64)
  return out
}

describe("buildLocalCatalog", () => {
  it("workspace vuoto → catalogo vuoto, zero problemi", async () => {
    const catalog = await buildLocalCatalog(new MemoryInstallerStore())
    expect(catalog.entries).toEqual([])
    expect(catalog.problems).toEqual([])
  })

  it("tool installati via pipeline reale → entry ordinate con campi marketplace e stato lifecycle", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 1_000)
    await installScaffolded(pm, {
      id: "io.test.catalog-b",
      name: "Catalog B",
      author: { name: "Andrea" },
      visibility: "public",
      license: "MIT",
    })
    await installScaffolded(pm, { id: "io.test.catalog-a", name: "Catalog A" })
    await pm.disable("io.test.catalog-a")

    const catalog = await buildLocalCatalog(store)
    expect(catalog.problems).toEqual([])
    expect(catalog.entries.map((e) => e.toolId)).toEqual([
      "io.test.catalog-a",
      "io.test.catalog-b",
    ])
    const [a, b] = catalog.entries
    expect(a.state).toBe("disabled")
    expect(a.author).toBeUndefined()
    expect(b.state).toBe("enabled")
    expect(b.name).toBe("Catalog B")
    expect(b.version).toBe("0.1.0")
    expect(b.kind).toBe("plugin")
    expect(b.author).toEqual({ name: "Andrea" })
    expect(b.visibility).toBe("public")
    expect(b.license).toBe("MIT")
  })

  it("manifest corrotto nel workspace → problems[] col toolId, le altre entry restano (fail-visible)", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 1_000)
    await installScaffolded(pm, { id: "io.test.catalog-sano", name: "Sano" })
    await installScaffolded(pm, { id: "io.test.catalog-rotto", name: "Rotto" })
    await store.write(
      manifestPath("io.test.catalog-rotto"),
      new Blob(["{not json"], { type: "application/json" }),
    )

    const catalog = await buildLocalCatalog(store)
    expect(catalog.entries.map((e) => e.toolId)).toEqual(["io.test.catalog-sano"])
    expect(catalog.problems).toHaveLength(1)
    expect(catalog.problems[0].toolId).toBe("io.test.catalog-rotto")
  })

  it("manifest sovrascritto post-install (schema-valido ma non firmato) → problems[], MAI entry trusted", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 1_000)
    await installScaffolded(pm, { id: "io.test.catalog-tamper", name: "Originale" })

    // Codex P1.1: manifest schema-valido riscritto DOPO l'install — la firma
    // registrata in install.json non copre questi byte. Il catalogo non deve
    // mai listarlo come entry trusted.
    const tampered = JSON.stringify({
      manifestVersion: 1,
      id: "io.test.catalog-tamper",
      name: "Tamperato",
      version: "0.1.0",
      protocol: ">=1.0 <2.0",
      entry: "entry.html",
      surfaces: ["panel"],
      capabilities: { "board.read": {}, "board.write": { scope: "own-embeds" } },
      publisher: {
        id: "attacker",
        pubkey: "ed25519:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
      },
      privacy: { dataOut: "none" },
    })
    await store.write(manifestPath("io.test.catalog-tamper"), new Blob([tampered]))

    const catalog = await buildLocalCatalog(store)
    expect(catalog.entries.map((e) => e.toolId)).not.toContain("io.test.catalog-tamper")
    expect(catalog.problems.map((p) => p.toolId)).toContain("io.test.catalog-tamper")
  })
})

describe("previewPluginPackage", () => {
  it("package integro → manifest + signatureValid true (stessi byte che l'installer verificherebbe)", async () => {
    const keys = await generateDevKeypair()
    const out = await scaffoldPlugin(
      { id: "io.test.preview-ok", name: "Preview OK", license: "MIT" },
      keys,
    )
    const preview = await previewPluginPackage(buildPluginPackage(out))
    expect(preview.manifest.id).toBe("io.test.preview-ok")
    expect(preview.manifest.license).toBe("MIT")
    expect(preview.signatureValid).toBe(true)
  })

  it("manifest manomesso DENTRO il package → preview col manifest ma signatureValid false", async () => {
    const keys = await generateDevKeypair()
    const out = await scaffoldPlugin({ id: "io.test.preview-tamper", name: "Tamper" }, keys)
    const tampered = buildPluginPackage({
      ...out,
      manifestJson: out.manifestJson.replace("Tamper", "T4mper"),
    })
    const preview = await previewPluginPackage(tampered)
    expect(preview.manifest.name).toBe("T4mper")
    expect(preview.signatureValid).toBe(false)
  })

  it("manifest fuori schema → throw (nessuna preview di roba malformata)", async () => {
    const keys = await generateDevKeypair()
    const out = await scaffoldPlugin({ id: "io.test.preview-bad", name: "Bad" }, keys)
    const raw = JSON.parse(out.manifestJson) as Record<string, unknown>
    raw.surfaces = []
    const broken = buildPluginPackage({ ...out, manifestJson: JSON.stringify(raw) })
    await expect(previewPluginPackage(broken)).rejects.toThrow()
  })

  // ---- integrità payload in preview (Codex P2.1) ----

  it("package integro con integrity → bundleIntegrityValid true, installable true, non legacy", async () => {
    const keys = await generateDevKeypair()
    const out = await scaffoldPlugin({ id: "io.test.preview-int-ok", name: "Int OK" }, keys)
    const preview = await previewPluginPackage(buildPluginPackage(out))
    expect(preview.signatureValid).toBe(true)
    expect(preview.bundleIntegrityValid).toBe(true)
    expect(preview.legacyIntegrityMissing).toBe(false)
    expect(preview.installable).toBe(true)
  })

  it("entry manomessa, manifest intatto → firma valida MA bundleIntegrityValid false e installable false", async () => {
    // Codex P2.1: prima del fix la preview mostrava solo signatureValid=true
    // e l'install falliva DOPO — la UI poteva proporre un package manomesso.
    const keys = await generateDevKeypair()
    const out = await scaffoldPlugin({ id: "io.test.preview-int-tamper", name: "Int Tamper" }, keys)
    const tampered = buildPluginPackage({
      ...out,
      entryHtml: out.entryHtml.replace("</body>", "<script>/* evil */</script></body>"),
    })
    const preview = await previewPluginPackage(tampered)
    expect(preview.signatureValid).toBe(true) // il manifest non è stato toccato
    expect(preview.bundleIntegrityValid).toBe(false)
    expect(preview.installable).toBe(false)
    // coerenza con l'install autoritativo: DEVE rifiutare davvero
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 1_000)
    const parsed = JSON.parse(out.manifestJson) as { id: string }
    await expect(
      (await import("../toolhost/authoring/packageFile.ts")).installPluginPackage(store, tampered),
    ).rejects.toThrow(/integrity/)
    expect(await pm.getState(parsed.id)).toBe("not-installed")
  })

  it("manifest legacy senza integrity → legacyIntegrityMissing true, installable segue la firma", async () => {
    // Package costruito a mano: manifest schema-valido SENZA campo integrity,
    // firmato correttamente. Back-compat: installabile, ma la preview deve
    // dichiarare che il payload non è impegnato dalla firma.
    const keypair = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"])
    const pubRaw = new Uint8Array(await crypto.subtle.exportKey("raw", keypair.publicKey))
    const pubkeyB64 = btoa(String.fromCharCode(...pubRaw))
    const manifestJson = JSON.stringify({
      manifestVersion: 1,
      id: "io.test.preview-legacy",
      name: "Legacy",
      version: "1.0.0",
      protocol: ">=1.0 <2.0",
      entry: "entry.html",
      surfaces: ["panel"],
      capabilities: { "board.read": {} },
      publisher: { id: "legacy-pub", pubkey: `ed25519:${pubkeyB64}` },
      privacy: { dataOut: "none" },
    })
    const sigRaw = new Uint8Array(
      await crypto.subtle.sign("Ed25519", keypair.privateKey, new TextEncoder().encode(manifestJson)),
    )
    const pkg = buildPluginPackage({
      manifestJson,
      signatureB64: btoa(String.fromCharCode(...sigRaw)),
      entryHtml: "<!doctype html><html><body>legacy</body></html>",
    })
    const preview = await previewPluginPackage(pkg)
    expect(preview.signatureValid).toBe(true)
    expect(preview.legacyIntegrityMissing).toBe(true)
    expect(preview.installable).toBe(true)
  })

  it("manifest manomesso → installable false anche se il bundle combacia con l'integrity dichiarata", async () => {
    const keys = await generateDevKeypair()
    const out = await scaffoldPlugin({ id: "io.test.preview-sig-tamper", name: "Sig Tamper" }, keys)
    const tampered = buildPluginPackage({
      ...out,
      manifestJson: out.manifestJson.replace("Sig Tamper", "S1g Tamper"),
    })
    const preview = await previewPluginPackage(tampered)
    expect(preview.signatureValid).toBe(false)
    expect(preview.installable).toBe(false)
  })
})
