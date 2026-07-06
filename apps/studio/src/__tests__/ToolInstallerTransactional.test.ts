// @vitest-environment node
//
// P2.2 (review Codex PKT-CODEX-3) — install NON transazionale: se la write del
// bundle o dell'install record fallisce a metà, oggi resta un manifest.json
// orfano e isToolInstalled (solo presenza manifest) risponde true su un
// install incompleto. Futuro codice che assume "manifest presente = install
// valido" erediterebbe il buco.
//
// Invarianti falsificabili:
//   1. write 2/3 (bundle) fallisce → installTool rigetta E nessun manifest
//      orfano resta nello store (rollback best-effort nel catch);
//   2. write 3/3 (install record) fallisce → idem, niente manifest né bundle;
//   3. isToolInstalled = manifest + bundle + record VALIDO (triade), non solo
//      presenza del manifest;
//   4. un parziale legacy (manifest presente senza record) NON blocca il
//      reinstall: "already installed" scatta solo sulla triade completa —
//      il reinstall è il percorso di recovery.

import { describe, expect, it } from "vitest"
import {
  installTool,
  isToolInstalled,
  manifestPath,
  bundlePath,
  installRecordPath,
} from "../toolhost/installer.ts"
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

/** Store che fallisce la write su UN path specifico (fault injection reale). */
class FailingWriteStore extends MemoryInstallerStore {
  private _failOn: string
  constructor(failOn: string) {
    super()
    this._failOn = failOn
  }
  override async write(path: string, data: Blob): Promise<void> {
    if (path === this._failOn) throw new Error(`disk full writing ${path}`)
    await super.write(path, data)
  }
}

const TOOL_ID = "com.example.test-tool"

async function generateKeypair(): Promise<{ pubkeyB64: string; privateKey: CryptoKey }> {
  const keypair = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"])
  const pubkeyRaw = new Uint8Array(await crypto.subtle.exportKey("raw", keypair.publicKey))
  return { pubkeyB64: btoa(String.fromCharCode(...pubkeyRaw)), privateKey: keypair.privateKey }
}

async function makeSigned(): Promise<{ manifestJson: string; signature: string }> {
  const { pubkeyB64, privateKey } = await generateKeypair()
  const obj = {
    manifestVersion: 1,
    id: TOOL_ID,
    name: "Test Tool",
    version: "1.0.0",
    protocol: ">=1.0 <2.0",
    entry: "dist/index.html",
    surfaces: ["panel"],
    capabilities: { "board.read": {} },
    publisher: { id: "example", pubkey: `ed25519:${pubkeyB64}` },
    privacy: { dataOut: "none" },
  }
  const manifestJson = JSON.stringify(obj)
  const msg = new TextEncoder().encode(manifestJson)
  const sigRaw = new Uint8Array(await crypto.subtle.sign("Ed25519", privateKey, msg))
  return { manifestJson, signature: btoa(String.fromCharCode(...sigRaw)) }
}

const bundle = () => new Blob(["zip"], { type: "application/zip" })

describe("installTool transazionale (P2.2: mai artefatti parziali)", () => {
  it("write del bundle fallisce → reject e NESSUN manifest orfano", async () => {
    const { manifestJson, signature } = await makeSigned()
    const store = new FailingWriteStore(bundlePath(TOOL_ID))
    await expect(installTool(store, manifestJson, bundle(), signature)).rejects.toThrow(/disk full/)
    expect(await store.read(manifestPath(TOOL_ID))).toBeNull()
    expect(await isToolInstalled(store, TOOL_ID)).toBe(false)
  })

  it("write dell'install record fallisce → reject e niente manifest né bundle", async () => {
    const { manifestJson, signature } = await makeSigned()
    const store = new FailingWriteStore(installRecordPath(TOOL_ID))
    await expect(installTool(store, manifestJson, bundle(), signature)).rejects.toThrow(/disk full/)
    expect(await store.read(manifestPath(TOOL_ID))).toBeNull()
    expect(await store.read(bundlePath(TOOL_ID))).toBeNull()
    expect(await isToolInstalled(store, TOOL_ID)).toBe(false)
  })
})

describe("isToolInstalled = manifest + bundle + record valido (triade)", () => {
  it("manifest presente ma bundle o record assente → NON installato", async () => {
    const { manifestJson, signature } = await makeSigned()
    const store = new MemoryInstallerStore()
    await installTool(store, manifestJson, bundle(), signature)
    expect(await isToolInstalled(store, TOOL_ID)).toBe(true)

    await store.delete(bundlePath(TOOL_ID))
    expect(await isToolInstalled(store, TOOL_ID)).toBe(false)

    // ripristina bundle, togli il record: ancora non-installato
    await store.write(bundlePath(TOOL_ID), bundle())
    await store.delete(installRecordPath(TOOL_ID))
    expect(await isToolInstalled(store, TOOL_ID)).toBe(false)
  })

  it("record corrotto (JSON rotto) → NON installato, mai throw", async () => {
    const { manifestJson, signature } = await makeSigned()
    const store = new MemoryInstallerStore()
    await installTool(store, manifestJson, bundle(), signature)
    await store.write(installRecordPath(TOOL_ID), new Blob(["{not-json"], { type: "application/json" }))
    expect(await isToolInstalled(store, TOOL_ID)).toBe(false)
  })

  it("parziale legacy (solo manifest) non blocca il reinstall: recovery, non deadlock", async () => {
    const { manifestJson, signature } = await makeSigned()
    const store = new MemoryInstallerStore()
    // simula il residuo di un vecchio install interrotto: solo manifest.json
    await store.write(manifestPath(TOOL_ID), new Blob([manifestJson], { type: "application/json" }))
    expect(await isToolInstalled(store, TOOL_ID)).toBe(false)

    // il reinstall sopra il parziale deve riuscire e ricostruire la triade
    await installTool(store, manifestJson, bundle(), signature)
    expect(await isToolInstalled(store, TOOL_ID)).toBe(true)
  })

  it("install completo resta 'already installed' al secondo tentativo (invariata)", async () => {
    const { manifestJson, signature } = await makeSigned()
    const store = new MemoryInstallerStore()
    await installTool(store, manifestJson, bundle(), signature)
    await expect(installTool(store, manifestJson, bundle(), signature)).rejects.toThrow(
      /already installed/,
    )
  })
})
