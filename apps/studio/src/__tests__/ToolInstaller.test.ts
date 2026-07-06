// @vitest-environment node
//
// TOOLHOST T3 — installer: ed25519 verifica firma, kill-list, install/uninstall,
// revoca. Test su firma-valida/firma-rotta/revoca.
//
// Usa WebCrypto reali (Node 22+ Ed25519 testato in ambiente). I test generano
// coppie di chiavi fresh per ogni run: niente dipendenza da fixture statici.
// La firma è calcolata sul JSON ORIGINALE (stessi byte che il publisher firmerebbe),
// non su un oggetto re-serializzato — i test verificano proprio questo contratto.

import { describe, expect, it } from "vitest"
import { ToolManifestSchema } from "../toolhost-protocol/index.ts"
import {
  installTool,
  uninstallTool,
  isToolInstalled,
  listInstalledTools,
  getInstallRecord,
  manifestPath,
  bundlePath,
  installRecordPath,
} from "../toolhost/installer.ts"
import type { InstallerStore } from "../toolhost/installer.ts"
import { addToKillList, checkKillList, removeFromKillList, getKillList } from "../toolhost/killList.ts"
import type { StorageEntryLike } from "../toolhost/caps/storage.ts"

// ---------- harness ----------

/** Store in-memory che implementa InstallerStore. */
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

/** Genera una coppia di chiavi Ed25519 e restituisce pubkey base64 + privata. */
async function generateKeypair(): Promise<{ pubkeyB64: string; privateKey: CryptoKey }> {
  const keypair = await crypto.subtle.generateKey(
    { name: "Ed25519" },
    true,
    ["sign", "verify"],
  )
  const pubkeyRaw = new Uint8Array(
    await crypto.subtle.exportKey("raw", keypair.publicKey),
  )
  const pubkeyB64 = btoa(String.fromCharCode(...pubkeyRaw))
  return { pubkeyB64, privateKey: keypair.privateKey }
}

/**
 * Firma i byte di una stringa JSON con la chiave privata.
 * Questo è ESATTAMENTE ciò che farebbe il publisher: firma i byte del file
 * manifesto, non un oggetto re-serializzato.
 */
async function signJsonString(jsonString: string, privateKey: CryptoKey): Promise<string> {
  const msg = new TextEncoder().encode(jsonString)
  const sigRaw = new Uint8Array(await crypto.subtle.sign("Ed25519", privateKey, msg))
  return btoa(String.fromCharCode(...sigRaw))
}

/**
 * Costruisce un manifest completo, lo serializza in JSON, lo firma.
 * Restituisce tutto il necessario per installTool.
 */
async function makeSignedManifest(
  pubkeyB64: string,
  privateKey: CryptoKey,
  overrides?: Record<string, unknown>,
): Promise<{ manifestJson: string; manifestParsed: unknown; signature: string }> {
  const obj = {
    manifestVersion: 1,
    id: "com.example.test-tool",
    name: "Test Tool",
    version: "1.0.0",
    protocol: ">=1.0 <2.0",
    entry: "dist/index.html",
    surfaces: ["panel"],
    capabilities: { "board.read": {} },
    publisher: { id: "example", pubkey: `ed25519:${pubkeyB64}` },
    privacy: { dataOut: "none" },
    ...overrides,
  }
  const manifestJson = JSON.stringify(obj)
  const signature = await signJsonString(manifestJson, privateKey)
  return { manifestJson, manifestParsed: obj, signature }
}

// ---------- kill-list tests ----------

describe("killList", () => {
  it("kill-list vuota → checkKillList false", async () => {
    const store = new MemoryInstallerStore()
    expect(await checkKillList(store, "com.example.evil")).toBe(false)
  })

  it("addToKillList + checkKillList → true", async () => {
    const store = new MemoryInstallerStore()
    await addToKillList(store, "com.example.evil", "malware detected", () => 1000)
    expect(await checkKillList(store, "com.example.evil")).toBe(true)
  })

  it("addToKillList id non valido → throw", async () => {
    const store = new MemoryInstallerStore()
    await expect(addToKillList(store, "invalid id!")).rejects.toThrow(/invalid tool id/)
  })

  it("removeFromKillList → checkKillList false", async () => {
    const store = new MemoryInstallerStore()
    await addToKillList(store, "com.example.evil", "bad", () => 1000)
    await removeFromKillList(store, "com.example.evil")
    expect(await checkKillList(store, "com.example.evil")).toBe(false)
  })

  it("getKillList restituisce la lista completa", async () => {
    const store = new MemoryInstallerStore()
    await addToKillList(store, "com.a.b", "reason a", () => 100)
    await addToKillList(store, "com.c.d", "reason c", () => 200)
    const list = await getKillList(store)
    expect(list).toHaveLength(2)
    expect(list.find((e) => e.toolId === "com.a.b")?.reason).toBe("reason a")
    expect(list.find((e) => e.toolId === "com.c.d")?.reason).toBe("reason c")
  })

  it("doppia addToKillList aggiorna timestamp senza duplicare", async () => {
    const store = new MemoryInstallerStore()
    let t = 100
    await addToKillList(store, "com.example.tool", "first", () => t)
    t = 200
    await addToKillList(store, "com.example.tool", "updated", () => t)
    const list = await getKillList(store)
    expect(list).toHaveLength(1)
    expect(list[0].t).toBe(200)
    expect(list[0].reason).toBe("updated")
  })
})

// ---------- installer tests ----------

describe("installer", () => {
  it("installa un tool con firma valida → artefatti su disco", async () => {
    const store = new MemoryInstallerStore()
    const { pubkeyB64, privateKey } = await generateKeypair()
    const { manifestJson, signature } = await makeSignedManifest(pubkeyB64, privateKey)
    const bundleZip = new Blob(["fake-zip-content"], { type: "application/zip" })

    const manifest = await installTool(store, manifestJson, bundleZip, signature, () => 5000)

    // Verifica che il manifest parsato sia corretto
    expect(manifest.id).toBe("com.example.test-tool")
    expect(manifest.version).toBe("1.0.0")

    // Verifica artefatti su disco — manifest.json = IDENTICO ai byte originali
    const manifestBlob = await store.read(manifestPath("com.example.test-tool"))
    expect(manifestBlob).not.toBeNull()
    const savedJson = await manifestBlob!.text()
    expect(savedJson).toBe(manifestJson) // byte-exact

    // Verifica bundle
    const bundleBlob = await store.read(bundlePath("com.example.test-tool"))
    expect(bundleBlob).not.toBeNull()

    // Verifica install record
    const installRecord = await getInstallRecord(store, "com.example.test-tool")
    expect(installRecord).not.toBeNull()
    expect(installRecord!.toolVersion).toBe("1.0.0")
    expect(installRecord!.t).toBe(5000)
    expect(installRecord!.signature).toBe(signature)
  })

  it("firma valida → isToolInstalled true e listInstalledTools include", async () => {
    const store = new MemoryInstallerStore()
    const { pubkeyB64, privateKey } = await generateKeypair()
    const { manifestJson, signature } = await makeSignedManifest(pubkeyB64, privateKey)
    const bundleZip = new Blob(["zip"], { type: "application/zip" })

    await installTool(store, manifestJson, bundleZip, signature)
    expect(await isToolInstalled(store, "com.example.test-tool")).toBe(true)

    const installed = await listInstalledTools(store)
    expect(installed).toContain("com.example.test-tool")
  })

  it("firma alterata (byte corrotti) → install rifiutato, nessun artefatto su disco", async () => {
    const store = new MemoryInstallerStore()
    const { pubkeyB64, privateKey } = await generateKeypair()
    const { manifestJson } = await makeSignedManifest(pubkeyB64, privateKey)
    const bundleZip = new Blob(["zip"], { type: "application/zip" })

    // Firma il JSON con una chiave DIVERSA dalla pubkey nel manifest
    const { privateKey: wrongKey } = await generateKeypair()
    const badSig = await signJsonString(manifestJson, wrongKey)

    await expect(
      installTool(store, manifestJson, bundleZip, badSig),
    ).rejects.toThrow(/signature verification failed/)

    expect(await isToolInstalled(store, "com.example.test-tool")).toBe(false)
  })

  it("manifest corretto ma JSON alterato dopo la firma → rifiutato", async () => {
    const store = new MemoryInstallerStore()
    const { pubkeyB64, privateKey } = await generateKeypair()
    const { manifestJson } = await makeSignedManifest(pubkeyB64, privateKey)
    const signature = await signJsonString(manifestJson, privateKey)

    // Altera il JSON dopo la firma
    const tamperedJson = manifestJson.replace('"Test Tool"', '"Evil Tool"')
    const bundleZip = new Blob(["zip"], { type: "application/zip" })

    await expect(
      installTool(store, tamperedJson, bundleZip, signature),
    ).rejects.toThrow(/signature verification failed/)

    expect(await isToolInstalled(store, "com.example.test-tool")).toBe(false)
  })

  it("integrity.bundleSha256 combacia → install accettato", async () => {
    const store = new MemoryInstallerStore()
    const { pubkeyB64, privateKey } = await generateKeypair()
    const bundleZip = new Blob(["exact-bundle-bytes"], { type: "application/zip" })
    const bundleSha256 = btoa(
      String.fromCharCode(
        ...new Uint8Array(await crypto.subtle.digest("SHA-256", await bundleZip.arrayBuffer())),
      ),
    )
    const { manifestJson, signature } = await makeSignedManifest(pubkeyB64, privateKey, {
      integrity: { bundleSha256 },
    })

    const manifest = await installTool(store, manifestJson, bundleZip, signature)
    expect(manifest.integrity?.bundleSha256).toBe(bundleSha256)
    expect(await isToolInstalled(store, "com.example.test-tool")).toBe(true)
  })

  it("integrity.bundleSha256 firmato ma bundle divergente → rifiutato, nessun artefatto", async () => {
    // Firma valida, manifest valido: SOLO il payload runtime è stato scambiato
    // dopo la firma. Il gap firma-payload è chiuso dall'hash impegnato.
    const store = new MemoryInstallerStore()
    const { pubkeyB64, privateKey } = await generateKeypair()
    const original = new Blob(["trusted-entry"], { type: "application/zip" })
    const committed = btoa(
      String.fromCharCode(
        ...new Uint8Array(await crypto.subtle.digest("SHA-256", await original.arrayBuffer())),
      ),
    )
    const { manifestJson, signature } = await makeSignedManifest(pubkeyB64, privateKey, {
      integrity: { bundleSha256: committed },
    })
    const tamperedBundle = new Blob(["MALICIOUS-entry"], { type: "application/zip" })

    await expect(
      installTool(store, manifestJson, tamperedBundle, signature),
    ).rejects.toThrow(/integrity/)
    expect(await isToolInstalled(store, "com.example.test-tool")).toBe(false)
    expect(store.files.size).toBe(0)
  })

  it("tool in kill-list → install rifiutato", async () => {
    const store = new MemoryInstallerStore()
    const { pubkeyB64, privateKey } = await generateKeypair()
    const { manifestJson, signature } = await makeSignedManifest(pubkeyB64, privateKey, {
      id: "com.example.revoked-tool",
    })
    await addToKillList(store, "com.example.revoked-tool", "security incident", () => 1000)
    const bundleZip = new Blob(["zip"], { type: "application/zip" })

    await expect(
      installTool(store, manifestJson, bundleZip, signature),
    ).rejects.toThrow(/is revoked/)
    expect(await isToolInstalled(store, "com.example.revoked-tool")).toBe(false)
  })

  it("tool già installato → install rifiutato", async () => {
    const store = new MemoryInstallerStore()
    const { pubkeyB64, privateKey } = await generateKeypair()
    const { manifestJson, signature } = await makeSignedManifest(pubkeyB64, privateKey)
    const bundleZip = new Blob(["zip"], { type: "application/zip" })

    await installTool(store, manifestJson, bundleZip, signature, () => 100)
    await expect(
      installTool(store, manifestJson, bundleZip, signature, () => 200),
    ).rejects.toThrow(/already installed/)
  })

  it("uninstall rimuove artefatti e storage ma preserva audit", async () => {
    const store = new MemoryInstallerStore()
    const { pubkeyB64, privateKey } = await generateKeypair()
    const { manifestJson, signature } = await makeSignedManifest(pubkeyB64, privateKey)
    const bundleZip = new Blob(["zip"], { type: "application/zip" })

    await installTool(store, manifestJson, bundleZip, signature)

    // Simula storage per-tool e audit
    const storagePath = "tools/com.example.test-tool/storage/some-key"
    await store.write(storagePath, new Blob(["data"]))
    const auditPath = "tools/com.example.test-tool/audit.jsonl"
    await store.write(auditPath, new Blob(["entry\n"], { type: "application/x-ndjson" }))
    const statePath = "tools/com.example.test-tool/state.json"
    await store.write(statePath, new Blob(["{}"], { type: "application/json" }))

    await uninstallTool(store, "com.example.test-tool")

    // Verifica artefatti rimossi
    expect(await store.read(manifestPath("com.example.test-tool"))).toBeNull()
    expect(await store.read(bundlePath("com.example.test-tool"))).toBeNull()
    expect(await store.read(installRecordPath("com.example.test-tool"))).toBeNull()
    expect(await store.read(statePath)).toBeNull()
    expect(await store.read(storagePath)).toBeNull()

    // Audit SOPRAVVIVE
    expect(await store.read(auditPath)).not.toBeNull()
    expect(await isToolInstalled(store, "com.example.test-tool")).toBe(false)
  })

  it("listInstalledTools su store vuoto → []", async () => {
    const store = new MemoryInstallerStore()
    expect(await listInstalledTools(store)).toEqual([])
  })

  it("listInstalledTools con più tool installati", async () => {
    const store = new MemoryInstallerStore()

    // Installa due tool
    const { pubkeyB64: pk1, privateKey: sk1 } = await generateKeypair()
    const m1 = await makeSignedManifest(pk1, sk1, { id: "com.a.tool1" })
    await installTool(store, m1.manifestJson, new Blob(["z1"]), m1.signature, () => 1)

    const { pubkeyB64: pk2, privateKey: sk2 } = await generateKeypair()
    const m2 = await makeSignedManifest(pk2, sk2, { id: "com.b.tool2" })
    await installTool(store, m2.manifestJson, new Blob(["z2"]), m2.signature, () => 2)

    const installed = await listInstalledTools(store)
    expect(installed).toContain("com.a.tool1")
    expect(installed).toContain("com.b.tool2")
    expect(installed).toHaveLength(2)
  })

  it("isToolInstalled per tool non valido → false (non throw)", async () => {
    const store = new MemoryInstallerStore()
    expect(await isToolInstalled(store, "invalid!")).toBe(false)
  })

  it("getInstallRecord per tool non installato → null", async () => {
    const store = new MemoryInstallerStore()
    expect(await getInstallRecord(store, "com.example.nonexistent")).toBeNull()
  })

  it("JSON malformato (non parsabile) → ZodError da ToolManifestSchema.parse", async () => {
    const store = new MemoryInstallerStore()
    const { privateKey } = await generateKeypair()
    const badJson = '{"this is not valid manifest"}'
    const signature = await signJsonString(badJson, privateKey)
    const bundleZip = new Blob(["zip"], { type: "application/zip" })

    await expect(
      installTool(store, badJson, bundleZip, signature),
    ).rejects.toThrow() // ZodError o SyntaxError
  })

  it("manifest con pubkey non ed25519 → rifiutato da Zod già al parse", async () => {
    const raw = {
      manifestVersion: 1,
      id: "com.example.test",
      name: "Test",
      version: "1.0.0",
      protocol: ">=1.0 <2.0",
      entry: "dist/index.html",
      surfaces: ["panel"],
      capabilities: { "board.read": {} },
      publisher: { id: "test", pubkey: "rsa:AAAA" },
      privacy: { dataOut: "none" },
    }
    expect(() => ToolManifestSchema.parse(raw)).toThrow()
  })
})
