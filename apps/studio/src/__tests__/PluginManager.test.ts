// @vitest-environment node
//
// TOOLHOST §2/§3 — PluginManager: lifecycle install/uninstall/enable/disable a
// runtime sul confine SDK Layer-0, con il kill-switch come overlay.
//
// WebCrypto Ed25519 reali (Node 22+); coppie di chiavi fresh per run. La firma è
// sui BYTE del JSON originale (stesso contratto dell'installer).

import { describe, expect, it } from "vitest"
import { CONTRACT_VERSION } from "../sdk/index.ts"
import { ToolManifestSchema } from "../toolhost-protocol/index.ts"
import { PluginManager, lifecyclePath, LifecycleDocSchema } from "../toolhost/pluginManager.ts"
import { installTool, manifestPath } from "../toolhost/installer.ts"
import type { InstallerStore } from "../toolhost/installer.ts"
import { addToKillList, removeFromKillList } from "../toolhost/killList.ts"
import type { StorageEntryLike } from "../toolhost/caps/storage.ts"

// ---------- harness ----------

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

async function generateKeypair(): Promise<{ pubkeyB64: string; privateKey: CryptoKey }> {
  const keypair = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"])
  const pubkeyRaw = new Uint8Array(await crypto.subtle.exportKey("raw", keypair.publicKey))
  const pubkeyB64 = btoa(String.fromCharCode(...pubkeyRaw))
  return { pubkeyB64, privateKey: keypair.privateKey }
}

async function signJsonString(jsonString: string, privateKey: CryptoKey): Promise<string> {
  const msg = new TextEncoder().encode(jsonString)
  const sigRaw = new Uint8Array(await crypto.subtle.sign("Ed25519", privateKey, msg))
  return btoa(String.fromCharCode(...sigRaw))
}

async function makeSignedManifest(
  overrides?: Record<string, unknown>,
): Promise<{ manifestJson: string; signature: string; toolId: string }> {
  const { pubkeyB64, privateKey } = await generateKeypair()
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
  return { manifestJson, signature, toolId: obj.id as string }
}

/** Installa via manager con clock fisso; ritorna toolId. */
async function installViaManager(
  pm: PluginManager,
  overrides?: Record<string, unknown>,
): Promise<string> {
  const { manifestJson, signature, toolId } = await makeSignedManifest(overrides)
  const bundle = new Blob(["fake-zip"], { type: "application/zip" })
  await pm.install(manifestJson, bundle, signature)
  return toolId
}

// ---------- compat: binding al contratto Layer-0 ----------

describe("PluginManager — compat contratto SDK Layer-0", () => {
  it("contractVersion del manager == CONTRACT_VERSION dell'SDK", () => {
    expect(PluginManager.contractVersion).toBe(CONTRACT_VERSION)
  })

  it("il manifest installato via manager è valido contro il contratto (ToolManifestSchema)", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 1000)
    const { manifestJson, signature, toolId } = await makeSignedManifest()
    const manifest = await pm.install(manifestJson, new Blob(["z"]), signature)
    expect(manifest.id).toBe(toolId)
    // ri-parse dei byte salvati: ciò che è su disco resta contract-valido
    const saved = await store.read(manifestPath(toolId))
    const savedObj = JSON.parse(await saved!.text())
    expect(() => ToolManifestSchema.parse(savedObj)).not.toThrow()
  })
})

// ---------- lifecycle base ----------

describe("PluginManager — install/enable/disable/uninstall", () => {
  it("install → stato enabled, canMount true, lifecycle.json versionato e timestampato", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 4242)
    const toolId = await installViaManager(pm)

    expect(await pm.getState(toolId)).toBe("enabled")
    expect(await pm.canMount(toolId)).toBe(true)

    const blob = await store.read(lifecyclePath(toolId))
    expect(blob).not.toBeNull()
    const doc = LifecycleDocSchema.parse(JSON.parse(await blob!.text()))
    expect(doc).toEqual({ v: 1, enabled: true, t: 4242 })
  })

  it("disable → stato disabled e canMount false, MA resta installato (manifest presente)", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const toolId = await installViaManager(pm)

    await pm.disable(toolId)
    expect(await pm.getState(toolId)).toBe("disabled")
    expect(await pm.canMount(toolId)).toBe(false)
    // disabilitare NON disinstalla: il manifest è ancora su disco
    expect(await store.read(manifestPath(toolId))).not.toBeNull()
  })

  it("enable dopo disable → torna enabled (transizione reversibile)", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const toolId = await installViaManager(pm)

    await pm.disable(toolId)
    expect(await pm.canMount(toolId)).toBe(false)
    await pm.enable(toolId)
    expect(await pm.getState(toolId)).toBe("enabled")
    expect(await pm.canMount(toolId)).toBe(true)
  })

  it("uninstall → stato not-installed, lifecycle.json rimosso, audit PRESERVATO", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const toolId = await installViaManager(pm)
    // simula un audit-log accumulato dal runtime
    const auditPath = `tools/${toolId}/audit.jsonl`
    await store.write(auditPath, new Blob(["entry\n"], { type: "application/x-ndjson" }))

    await pm.uninstall(toolId)

    expect(await pm.getState(toolId)).toBe("not-installed")
    expect(await store.read(lifecyclePath(toolId))).toBeNull()
    expect(await store.read(manifestPath(toolId))).toBeNull()
    // l'audit sopravvive all'uninstall (chi-ha-letto-cosa resta consultabile)
    expect(await store.read(auditPath)).not.toBeNull()
  })

  it("enable/disable su tool NON installato → throw", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store)
    await expect(pm.enable("com.example.ghost")).rejects.toThrow(/not installed/)
    await expect(pm.disable("com.example.ghost")).rejects.toThrow(/not installed/)
  })

  it("re-install dopo uninstall riparte enabled (lifecycle pulito)", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const toolId = await installViaManager(pm)
    await pm.disable(toolId)
    await pm.uninstall(toolId)
    // reinstalla
    await installViaManager(pm)
    expect(await pm.getState(toolId)).toBe("enabled")
  })
})

// ---------- kill-switch: overlay non distruttivo ----------

describe("PluginManager — kill-switch (overlay su enabled)", () => {
  it("kill di un plugin enabled → stato revoked e canMount false (anche con enabled=true su disco)", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const toolId = await installViaManager(pm)
    expect(await pm.canMount(toolId)).toBe(true)

    await addToKillList(store, toolId, "incidente sicurezza", () => 200)

    expect(await pm.getState(toolId)).toBe("revoked")
    expect(await pm.canMount(toolId)).toBe(false)
    // l'intento enabled su disco NON è stato toccato dal kill-switch
    const blob = await store.read(lifecyclePath(toolId))
    const doc = LifecycleDocSchema.parse(JSON.parse(await blob!.text()))
    expect(doc.enabled).toBe(true)
  })

  it("removeFromKillList ripristina lo stato precedente (enabled) — kill è reversibile", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const toolId = await installViaManager(pm)

    await addToKillList(store, toolId, "sospetto", () => 200)
    expect(await pm.getState(toolId)).toBe("revoked")

    await removeFromKillList(store, toolId)
    expect(await pm.getState(toolId)).toBe("enabled")
    expect(await pm.canMount(toolId)).toBe(true)
  })

  it("enable di un plugin revocato → throw (il kill-switch vince)", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const toolId = await installViaManager(pm)
    await pm.disable(toolId)
    await addToKillList(store, toolId, "bloccato", () => 200)

    await expect(pm.enable(toolId)).rejects.toThrow(/revoked/)
    // resta revoked, non enabled
    expect(await pm.getState(toolId)).toBe("revoked")
  })

  it("disable su plugin revocato è lecito e persiste: dopo removeFromKillList lo stato è disabled, NON enabled", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const toolId = await installViaManager(pm)
    await addToKillList(store, toolId, "bloccato", () => 200)

    // il docente spegne l'intento mentre è revocato
    await pm.disable(toolId)
    expect(await pm.getState(toolId)).toBe("revoked")

    await removeFromKillList(store, toolId)
    // l'intento disabled persiste: NON riparte da solo
    expect(await pm.getState(toolId)).toBe("disabled")
    expect(await pm.canMount(toolId)).toBe(false)
  })
})

// ---------- gate: versione di contratto richiesta dal plugin ----------

describe("PluginManager — gate contract version", () => {
  it("rigetta un plugin che RICHIEDE un contratto superiore a quello dell'host (atomico: nessun artefatto)", async () => {
    // host SDK = CONTRACT_VERSION (1.x); il plugin pretende >=2.0 → l'host è inferiore
    // per QUALUNQUE 1.x: il fixture non deve ridiventare valido a ogni MINOR bump
    // (successo con ">=1.1" quando il contratto è passato a 1.1.0).
    // Firmo con una chiave SBAGLIATA di proposito: se l'errore è ancora "incompatible
    // contract" (non "signature"), il gate di contratto ha cortocircuitato PRIMA della
    // verifica firma di installTool → prova l'ordine (gate-prima-di-firma), non solo
    // che "qualcosa" abbia lanciato. Difende contro un reorder gate↔firma.
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const { manifestJson, toolId } = await makeSignedManifest({ contract: ">=2.0" })
    const { privateKey: wrongKey } = await generateKeypair()
    const badSig = await signJsonString(manifestJson, wrongKey)

    await expect(pm.install(manifestJson, new Blob(["z"]), badSig)).rejects.toThrow(
      /incompatible contract/,
    )
    // reject PRIMA di installTool: né manifest né lifecycle scritti
    expect(await store.read(manifestPath(toolId))).toBeNull()
    expect(await store.read(lifecyclePath(toolId))).toBeNull()
    expect(await pm.getState(toolId)).toBe("not-installed")
  })

  it("accetta un plugin il cui range INCLUDE la versione dell'host (gate falsificabile in entrambe le direzioni)", async () => {
    // ">=1.0 <2.0" è soddisfatto da 1.0.0 → install riesce. Un bug "rigetta-tutto"
    // romperebbe QUESTO; un bug "accetta-tutto" romperebbe il test sopra.
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const toolId = await installViaManager(pm, { contract: ">=1.0 <2.0" })

    expect(await pm.getState(toolId)).toBe("enabled")
    expect(await store.read(manifestPath(toolId))).not.toBeNull()
  })

  it("manifest SENZA campo contract → install riesce (migrate-safe, zero regressione sui legacy)", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const toolId = await installViaManager(pm) // nessun override: niente `contract`

    expect(await pm.getState(toolId)).toBe("enabled")
  })

  it("range di contract malformato → reject a parse-schema (sintassi, non compatibilità)", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const { manifestJson, signature, toolId } = await makeSignedManifest({ contract: "abc" })

    await expect(pm.install(manifestJson, new Blob(["z"]), signature)).rejects.toThrow(
      /invalid contract range/,
    )
    expect(await pm.getState(toolId)).toBe("not-installed")
  })
})

// ---------- robustezza / fail-safe ----------

describe("PluginManager — robustezza", () => {
  it("lifecycle mancante (install diretto via installer) → fail-safe disabled, non enabled", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const { manifestJson, signature, toolId } = await makeSignedManifest()
    // install BYPASSANDO il manager (nessun lifecycle.json scritto)
    await installTool(store, manifestJson, new Blob(["z"]), signature, () => 1)

    expect(await store.read(lifecyclePath(toolId))).toBeNull()
    expect(await pm.getState(toolId)).toBe("disabled")
    expect(await pm.canMount(toolId)).toBe(false)
    // ma è abilitabile esplicitamente dal docente
    await pm.enable(toolId)
    expect(await pm.getState(toolId)).toBe("enabled")
  })

  it("install FALLITO (firma rotta) → nessun lifecycle.json orfano (write solo dopo install riuscito)", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const { manifestJson, toolId } = await makeSignedManifest()
    // firma con una chiave diversa: installTool rigetta PRIMA di scrivere
    const { privateKey: wrongKey } = await generateKeypair()
    const badSig = await signJsonString(manifestJson, wrongKey)

    await expect(pm.install(manifestJson, new Blob(["z"]), badSig)).rejects.toThrow(/signature/)
    // né manifest né lifecycle scritti: install atomico al fallimento
    expect(await store.read(manifestPath(toolId))).toBeNull()
    expect(await store.read(lifecyclePath(toolId))).toBeNull()
    expect(await pm.getState(toolId)).toBe("not-installed")
  })

  it("lifecycle.json corrotto → getState BLOCCA (mai trattare spazzatura come enabled)", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const toolId = await installViaManager(pm)
    await store.write(lifecyclePath(toolId), new Blob(["{not json"], { type: "application/json" }))

    await expect(pm.getState(toolId)).rejects.toThrow(/corrupted lifecycle/)
  })

  it("getState su tool id non valido → not-installed (nessun throw)", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store)
    expect(await pm.getState("invalid id!")).toBe("not-installed")
  })

  it("list riporta stato per ogni plugin installato (enabled/disabled/revoked)", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const a = await installViaManager(pm, { id: "com.a.alpha" })
    const b = await installViaManager(pm, { id: "com.b.bravo" })
    const c = await installViaManager(pm, { id: "com.c.charlie" })
    await pm.disable(b)
    await addToKillList(store, c, "x", () => 1)

    const list = await pm.list()
    const byId = new Map(list.map((e) => [e.toolId, e.state]))
    expect(byId.get(a)).toBe("enabled")
    expect(byId.get(b)).toBe("disabled")
    expect(byId.get(c)).toBe("revoked")
    expect(list).toHaveLength(3)
  })
})
