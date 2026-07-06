// @vitest-environment node
//
// P0-D authoring — scaffoldPlugin: genera un plugin completo (manifest firmato
// dev + entry.html + bundle .maestrotool) che passa la pipeline REALE
// PluginManager.install → enabled, senza bypass. Fail-closed su: kind "core",
// id invalido, capability sconosciuta, manifest/firma manomessi.
//
// WebCrypto Ed25519 reale (Node 22+), chiavi fresh per run — stessa disciplina
// di ToolInstaller.test.ts. La firma è sui BYTE ORIGINALI del manifestJson.

import { describe, expect, it } from "vitest"
import { ToolManifestSchema } from "../toolhost-protocol/index.ts"
import {
  generateDevKeypair,
  scaffoldPlugin,
} from "../toolhost/authoring/scaffoldPlugin.ts"
import type { ScaffoldSpec } from "../toolhost/authoring/scaffoldPlugin.ts"
import { crc32, buildStoreZip } from "../toolhost/authoring/storeZip.ts"
import { PluginManager } from "../toolhost/pluginManager.ts"
import { isToolInstalled } from "../toolhost/installer.ts"
import type { InstallerStore } from "../toolhost/installer.ts"
import type { StorageEntryLike } from "../toolhost/caps/storage.ts"

// ---------- harness (stesso pattern di ToolInstaller.test.ts) ----------

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

const BASE_SPEC: ScaffoldSpec = {
  id: "io.test.scaffold-demo",
  name: "Scaffold Demo",
}

// ---------- manifest generato ----------

describe("scaffoldPlugin — manifest generato", () => {
  it("genera un manifest che passa ToolManifestSchema con default deny-by-default", async () => {
    const keys = await generateDevKeypair()
    const out = await scaffoldPlugin(BASE_SPEC, keys)

    const manifest = ToolManifestSchema.parse(JSON.parse(out.manifestJson))
    expect(manifest.id).toBe("io.test.scaffold-demo")
    expect(manifest.name).toBe("Scaffold Demo")
    expect(manifest.manifestVersion).toBe(1)
    // deny-by-default: NESSUNA capability se non richiesta
    expect(manifest.capabilities).toEqual({})
    expect(manifest.privacy.dataOut).toBe("none")
    expect(manifest.kind).toBe("plugin")
    expect(manifest.entry).toBe("entry.html")
    expect(manifest.surfaces).toEqual(["panel"])
    expect(manifest.publisher.pubkey).toBe(`ed25519:${keys.pubkeyB64}`)
  })

  it("deriva privacy declared-domains quando la spec chiede net.fetch", async () => {
    const keys = await generateDevKeypair()
    const out = await scaffoldPlugin(
      {
        ...BASE_SPEC,
        capabilities: { "net.fetch": { domains: ["api.example.com"] } },
      },
      keys,
    )
    const manifest = ToolManifestSchema.parse(JSON.parse(out.manifestJson))
    expect(manifest.privacy.dataOut).toBe("declared-domains")
  })

  it("è deterministico: stessa spec + stesse chiavi → stessi byte (manifest, firma, zip)", async () => {
    const keys = await generateDevKeypair()
    const a = await scaffoldPlugin(BASE_SPEC, keys)
    const b = await scaffoldPlugin(BASE_SPEC, keys)
    expect(a.manifestJson).toBe(b.manifestJson)
    expect(a.signatureB64).toBe(b.signatureB64)
    expect(new Uint8Array(await a.bundleZip.arrayBuffer())).toEqual(
      new Uint8Array(await b.bundleZip.arrayBuffer()),
    )
  })
})

// ---------- fail-closed sulla spec ----------

describe("scaffoldPlugin — fail-closed sulla spec", () => {
  it("rifiuta kind core: il core non è authorabile", async () => {
    const keys = await generateDevKeypair()
    await expect(
      scaffoldPlugin({ ...BASE_SPEC, kind: "core" as never }, keys),
    ).rejects.toThrow(/core/)
  })

  it("rifiuta un tool id non reverse-DNS", async () => {
    const keys = await generateDevKeypair()
    await expect(
      scaffoldPlugin({ ...BASE_SPEC, id: "NotAValidId!" }, keys),
    ).rejects.toThrow(/id/)
  })

  it("rifiuta una capability fuori dal vocabolario chiuso", async () => {
    const keys = await generateDevKeypair()
    await expect(
      scaffoldPlugin(
        { ...BASE_SPEC, capabilities: { "fs.read": {} } as never },
        keys,
      ),
    ).rejects.toThrow()
  })
})

// ---------- pipeline reale install → gate ----------

describe("scaffoldPlugin — install/gate reale", () => {
  it("l'output installa via PluginManager (firma verificata) → enabled + canMount", async () => {
    const keys = await generateDevKeypair()
    const out = await scaffoldPlugin(BASE_SPEC, keys)
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 1_000)

    const manifest = await pm.install(out.manifestJson, out.bundleZip, out.signatureB64)
    expect(manifest.id).toBe(BASE_SPEC.id)
    expect(await pm.getState(BASE_SPEC.id)).toBe("enabled")
    expect(await pm.canMount(BASE_SPEC.id)).toBe(true)
  })

  it("manifest manomesso di UN byte → install rifiutato, nessun artefatto (fail-closed)", async () => {
    const keys = await generateDevKeypair()
    const out = await scaffoldPlugin(BASE_SPEC, keys)
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 1_000)

    const tampered = out.manifestJson.replace("Scaffold Demo", "Scaffold Dem0")
    await expect(pm.install(tampered, out.bundleZip, out.signatureB64)).rejects.toThrow(
      /signature/,
    )
    expect(await isToolInstalled(store, BASE_SPEC.id)).toBe(false)
    expect(store.files.size).toBe(0)
  })

  it("firma sbagliata (di un'altra coppia di chiavi) → install rifiutato", async () => {
    const keys = await generateDevKeypair()
    const otherKeys = await generateDevKeypair()
    const out = await scaffoldPlugin(BASE_SPEC, keys)
    const outOther = await scaffoldPlugin(BASE_SPEC, otherKeys)
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 1_000)

    await expect(
      pm.install(out.manifestJson, out.bundleZip, outOther.signatureB64),
    ).rejects.toThrow(/signature/)
    expect(store.files.size).toBe(0)
  })
})

// ---------- entry template ----------

describe("scaffoldPlugin — entry template", () => {
  it("l'entry.html parla il lifecycle wire: host.hello → tool.ready con eco del nonce", async () => {
    const keys = await generateDevKeypair()
    const out = await scaffoldPlugin(BASE_SPEC, keys)
    expect(out.entryHtml).toContain("host.hello")
    expect(out.entryHtml).toContain("tool.ready")
    expect(out.entryHtml).toContain("nonce")
    // il nome del tool compare nel template
    expect(out.entryHtml).toContain("Scaffold Demo")
  })
})

// ---------- zip store-only ----------

describe("storeZip", () => {
  it("crc32 vettore noto: '123456789' → 0xCBF43926", () => {
    expect(crc32(new TextEncoder().encode("123456789"))).toBe(0xcbf43926)
  })

  it("produce uno zip strutturalmente valido: local header, central dir, EOCD, nome entry", () => {
    const data = new TextEncoder().encode("<html></html>")
    const zip = buildStoreZip([{ path: "entry.html", data }])
    // PK\x03\x04 local file header all'inizio
    expect([...zip.slice(0, 4)]).toEqual([0x50, 0x4b, 0x03, 0x04])
    // EOCD PK\x05\x06 presente
    const text = new TextDecoder("latin1").decode(zip)
    expect(text).toContain("PK\x05\x06")
    expect(text).toContain("entry.html")
    // payload store-only: i byte del file compaiono verbatim
    expect(text).toContain("<html></html>")
  })

  it("il bundle .maestrotool contiene entry.html", async () => {
    const keys = await generateDevKeypair()
    const out = await scaffoldPlugin(BASE_SPEC, keys)
    const bytes = new Uint8Array(await out.bundleZip.arrayBuffer())
    const text = new TextDecoder("latin1").decode(bytes)
    expect([...bytes.slice(0, 4)]).toEqual([0x50, 0x4b, 0x03, 0x04])
    expect(text).toContain("entry.html")
  })
})
