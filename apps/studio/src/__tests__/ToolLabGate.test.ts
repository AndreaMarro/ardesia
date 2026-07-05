// @vitest-environment node
// Tool Lab — pipeline REALE install+gate (firma ed25519 con la chiave dev
// checked-in, installer, lifecycle, kill-switch). Ambiente node come
// ToolReferenceSimE2E: la WebCrypto di jsdom è realm-fragile sui TypedArray.

import { describe, it, expect } from "vitest"
import { installAndGateReferenceTool } from "../toolhost/toolLab"
import { isToolInstalled, manifestPath } from "../toolhost/installer"
import { addToKillList } from "../toolhost/killList"
import type { InstallerStore } from "../toolhost/installer"
import type { StorageEntryLike } from "../toolhost/caps/storage"

const TOOL_ID = "io.maestro.sim-reference-blink"

class MemStore implements InstallerStore {
  private _m = new Map<string, Blob>()
  async read(p: string): Promise<Blob | null> {
    return this._m.get(p) ?? null
  }
  async write(p: string, d: Blob): Promise<void> {
    this._m.set(p, d)
  }
  async delete(p: string): Promise<void> {
    this._m.delete(p)
  }
  async list(prefix?: string): Promise<StorageEntryLike[]> {
    return [...this._m.entries()]
      .filter(([k]) => prefix === undefined || k.startsWith(prefix))
      .map(([path, data]) => ({ path, data }))
  }
}

describe("installAndGateReferenceTool", () => {
  it("happy path: installa (firma verificata), enabled, mountabile; idempotente", async () => {
    const store = new MemStore()
    const result = await installAndGateReferenceTool(store)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.manifest.id).toBe(TOOL_ID)
    // artefatti reali dell'installer, non uno stato in-memory della route
    expect(await isToolInstalled(store, TOOL_ID)).toBe(true)
    expect(await store.read(manifestPath(TOOL_ID))).not.toBeNull()
    // seconda chiamata: NON deve fallire per "already installed"
    const again = await installAndGateReferenceTool(store)
    expect(again.ok).toBe(true)
  })

  it("firma manomessa → fail-closed, NESSUN artefatto installato", async () => {
    const store = new MemStore()
    const result = await installAndGateReferenceTool(store, {
      signatureB64: "QUFBQQ==", // firma arbitraria non valida
    })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reason).toBe("install-failed")
    expect(await isToolInstalled(store, TOOL_ID)).toBe(false)
  })

  it("tool in kill-list prima dell'install → fail-closed", async () => {
    const store = new MemStore()
    await addToKillList(store, TOOL_ID, "test: revocato", () => 1)
    const result = await installAndGateReferenceTool(store)
    expect(result.ok).toBe(false)
    expect(await isToolInstalled(store, TOOL_ID)).toBe(false)
  })

  it("installato e POI revocato → canMount nega (overlay kill-switch)", async () => {
    const store = new MemStore()
    const first = await installAndGateReferenceTool(store)
    expect(first.ok).toBe(true)
    await addToKillList(store, TOOL_ID, "test: revoca post-install", () => 2)
    const result = await installAndGateReferenceTool(store)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reason).toBe("not-mountable")
  })
})
