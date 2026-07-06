// @vitest-environment node
//
// P0-D authoring — PluginPackage v1: UN file condivisibile che contiene
// manifest.json (byte esatti firmati) + signature.b64 + entry del tool.
// installPluginPackage lo apre e passa dalla pipeline REALE
// PluginManager.install (firma ed25519 verificata, kill-list, lifecycle):
// il package NON è un canale privilegiato, è solo un contenitore.
//
// Reader zip fail-closed: solo entry store-only (method 0), CRC verificato,
// path ZipSlip rifiutati (lezione lessonBundle).

import { describe, expect, it } from "vitest"
import { buildStoreZip, readStoreZip } from "../toolhost/authoring/storeZip.ts"
import {
  buildPluginPackage,
  installPluginPackage,
  readPluginPackage,
} from "../toolhost/authoring/packageFile.ts"
import {
  generateDevKeypair,
  scaffoldPlugin,
} from "../toolhost/authoring/scaffoldPlugin.ts"
import { PluginManager } from "../toolhost/pluginManager.ts"
import { isToolInstalled } from "../toolhost/installer.ts"
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

const SPEC = { id: "io.test.package-demo", name: "Package Demo" }

// ---------- readStoreZip ----------

describe("readStoreZip", () => {
  it("roundtrip build → read: stessi path e stessi byte", () => {
    const a = new TextEncoder().encode("<html>a</html>")
    const b = new TextEncoder().encode("body { color: red }")
    const zip = buildStoreZip([
      { path: "entry.html", data: a },
      { path: "assets/style.css", data: b },
    ])
    const entries = readStoreZip(zip)
    expect(entries.map((e) => e.path)).toEqual(["entry.html", "assets/style.css"])
    expect(entries[0].data).toEqual(a)
    expect(entries[1].data).toEqual(b)
  })

  it("entry compressa (method ≠ 0) → rifiutata fail-closed", () => {
    const zip = buildStoreZip([
      { path: "entry.html", data: new TextEncoder().encode("<html></html>") },
    ])
    // Corrompe il metodo di compressione nel record di central directory
    // (offset 10 dopo la firma PK\x01\x02) E nel local header (offset 8).
    const text = new TextDecoder("latin1").decode(zip)
    const centralIdx = text.indexOf("PK\x01\x02")
    const localIdx = text.indexOf("PK\x03\x04")
    expect(centralIdx).toBeGreaterThan(-1)
    const tampered = new Uint8Array(zip)
    tampered[centralIdx + 10] = 8
    tampered[localIdx + 8] = 8
    expect(() => readStoreZip(tampered)).toThrow(/store/)
  })

  it("CRC corrotto → rifiutato (integrità, non solo forma)", () => {
    const data = new TextEncoder().encode("<html>x</html>")
    const zip = buildStoreZip([{ path: "entry.html", data }])
    const text = new TextDecoder("latin1").decode(zip)
    // Corrompe un byte del payload (dopo il local header: 30 byte fissi + nome)
    const payloadIdx = text.indexOf("<html>x</html>")
    const tampered = new Uint8Array(zip)
    tampered[payloadIdx] = tampered[payloadIdx] ^ 0xff
    expect(() => readStoreZip(tampered)).toThrow(/crc/i)
  })

  it("path ZipSlip ('../evil.html', assoluto) → rifiutati", () => {
    // il WRITER non valida (input dello scaffolder); il READER sì.
    const evil = buildStoreZip([
      { path: "../evil.html", data: new TextEncoder().encode("x") },
    ])
    expect(() => readStoreZip(evil)).toThrow(/path/)

    const absolute = buildStoreZip([
      { path: "/etc/evil", data: new TextEncoder().encode("x") },
    ])
    expect(() => readStoreZip(absolute)).toThrow(/path/)
  })

  it("byte che non sono uno zip → rifiutati", () => {
    expect(() => readStoreZip(new TextEncoder().encode("not a zip"))).toThrow()
  })
})

// ---------- package ----------

describe("PluginPackage v1", () => {
  it("build → read: manifest byte-identico, firma, file del bundle", async () => {
    const keys = await generateDevKeypair()
    const out = await scaffoldPlugin(SPEC, keys)
    const pkg = buildPluginPackage(out)

    const parsed = await readPluginPackage(pkg)
    expect(parsed.manifestJson).toBe(out.manifestJson)
    expect(parsed.signatureB64).toBe(out.signatureB64)
    expect(parsed.bundleFiles.map((f) => f.path)).toEqual(["entry.html"])
    expect(new TextDecoder().decode(parsed.bundleFiles[0].data)).toBe(out.entryHtml)
  })

  it("installPluginPackage passa dalla pipeline reale → enabled + canMount", async () => {
    const keys = await generateDevKeypair()
    const out = await scaffoldPlugin(SPEC, keys)
    const pkg = buildPluginPackage(out)

    const store = new MemoryInstallerStore()
    const manifest = await installPluginPackage(store, pkg)
    expect(manifest.id).toBe(SPEC.id)

    const pm = new PluginManager(store)
    expect(await pm.getState(SPEC.id)).toBe("enabled")
    expect(await pm.canMount(SPEC.id)).toBe(true)
  })

  it("manifest manomesso DENTRO il package → firma fallisce, nessun artefatto", async () => {
    const keys = await generateDevKeypair()
    const out = await scaffoldPlugin(SPEC, keys)
    const tamperedOut = {
      ...out,
      manifestJson: out.manifestJson.replace("Package Demo", "Package Dem0"),
    }
    const pkg = buildPluginPackage(tamperedOut)

    const store = new MemoryInstallerStore()
    await expect(installPluginPackage(store, pkg)).rejects.toThrow(/signature/)
    expect(await isToolInstalled(store, SPEC.id)).toBe(false)
    expect(store.files.size).toBe(0)
  })

  it("entry.html manomesso DENTRO il package → integrità del bundle fallisce, nessun artefatto", async () => {
    // Attacco supply-chain: manifest + firma LEGITTIMI (invariati), ma il codice
    // eseguibile del bundle scambiato dopo la firma. Il manifest firmato impegna
    // sha256(bundle) → installTool ricalcola e rifiuta il bundle divergente.
    const keys = await generateDevKeypair()
    const out = await scaffoldPlugin(SPEC, keys)
    const tamperedOut = {
      ...out,
      // manifestJson e signatureB64 restano quelli firmati sull'entry ORIGINALE.
      entryHtml: out.entryHtml.replace("</body>", "<script>parent.postMessage('pwned','*')</script></body>"),
    }
    const pkg = buildPluginPackage(tamperedOut)

    const store = new MemoryInstallerStore()
    await expect(installPluginPackage(store, pkg)).rejects.toThrow(/integrity/)
    expect(await isToolInstalled(store, SPEC.id)).toBe(false)
    expect(store.files.size).toBe(0)
  })

  it("package senza firma → fail-closed", async () => {
    const keys = await generateDevKeypair()
    const out = await scaffoldPlugin(SPEC, keys)
    const zipBytes = buildStoreZip([
      { path: "manifest.json", data: new TextEncoder().encode(out.manifestJson) },
      { path: "entry.html", data: new TextEncoder().encode(out.entryHtml) },
    ])
    const pkg = new Blob([zipBytes.buffer.slice(0) as ArrayBuffer], { type: "application/zip" })

    const store = new MemoryInstallerStore()
    await expect(installPluginPackage(store, pkg)).rejects.toThrow(/signature\.b64/)
    expect(store.files.size).toBe(0)
  })

  it("package senza manifest → fail-closed", async () => {
    const zipBytes = buildStoreZip([
      { path: "entry.html", data: new TextEncoder().encode("<html></html>") },
    ])
    const pkg = new Blob([zipBytes.buffer.slice(0) as ArrayBuffer], { type: "application/zip" })

    const store = new MemoryInstallerStore()
    await expect(installPluginPackage(store, pkg)).rejects.toThrow(/manifest\.json/)
  })
})
