// @vitest-environment jsdom
//
// TOOLHOST-SPEC-v0 §3 — ToolHost.mountIfEnabled integra PluginManager.canMount:
// il mount è negato a un plugin `disabled` (intento del docente OFF). È il
// pendant sull'asse INTENTO del kill-switch (refreshKillSwitch, asse SICUREZZA):
// canMount riflette lo stato `enabled` del lifecycle e il mount lo rispetta.
//
// canMount reale del PluginManager (getState → installato? → kill-list → enabled?);
// lo stato è guidato dai metodi PUBBLICI del manager (enable/disable) sullo stesso
// store dell'host. Il manifest è scritto diretto (manifestPath) per evitare la
// dipendenza da WebCrypto Ed25519: isToolInstalled controlla solo la presenza del
// manifest, e la firma è irrilevante per il gate di lifecycle qui in prova.
import { afterEach, describe, expect, it } from "vitest"
import { ToolManifestSchema } from "../toolhost-protocol/index.ts"
import type { Capabilities, ToolManifest } from "../toolhost-protocol/index.ts"
import { ToolHost } from "../toolhost/host.ts"
import { PluginManager } from "../toolhost/pluginManager.ts"
import { resolveGrant } from "../toolhost/policy.ts"
import { bundlePath, installRecordPath, manifestPath } from "../toolhost/installer.ts"
import { addToKillList } from "../toolhost/killList.ts"
import type { InstallerStore } from "../toolhost/installer.ts"
import type { AuditStore } from "../toolhost/audit.ts"
import type { BoardApiLike, BoardElementLike } from "../toolhost/caps/board.ts"
import type { StorageDriverLike, StorageEntryLike } from "../toolhost/caps/storage.ts"

const MANIFEST: ToolManifest = ToolManifestSchema.parse({
  manifestVersion: 1,
  id: "com.example.echo",
  name: "Echo",
  version: "1.0.0",
  protocol: ">=1.0 <2.0",
  entry: "dist/index.html",
  surfaces: ["panel"],
  capabilities: { "board.read": {} },
  publisher: { id: "example", pubkey: "ed25519:AAAA" },
  privacy: { dataOut: "none" },
})

// Uno store soddisfa sia l'InstallerStore del PluginManager sia le deps del ToolHost.
class MemoryWorkspace implements InstallerStore, StorageDriverLike, AuditStore {
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

const board: BoardApiLike = {
  getSceneElements: (): readonly BoardElementLike[] => [],
  getAppState: () => ({ selectedElementIds: {} }),
  updateScene: () => {},
}

const openChannels: MessageChannel[] = []
afterEach(() => {
  for (const ch of openChannels.splice(0)) {
    ch.port1.close()
    ch.port2.close()
  }
})

function freshPort(): MessageChannel["port1"] {
  const ch = new MessageChannel()
  openChannels.push(ch)
  return ch.port1
}

const grant: Capabilities = resolveGrant(MANIFEST, ["board.read"])

/** Scrive la TRIADE di install (P2.2: isToolInstalled = manifest+bundle+record)
 *  → installato. Firma/hash fixture: qui si prova il gate di LIFECYCLE, non l'install. */
function writeManifest(store: MemoryWorkspace): void {
  store.files.set(manifestPath(MANIFEST.id), new Blob([JSON.stringify(MANIFEST)], { type: "application/json" }))
  store.files.set(bundlePath(MANIFEST.id), new Blob(["zip"], { type: "application/zip" }))
  const record = {
    v: 1,
    toolId: MANIFEST.id,
    manifestVersion: 1,
    toolVersion: MANIFEST.version,
    t: 0,
    signature: "fixture",
    bundleHash: "fixture",
  }
  store.files.set(installRecordPath(MANIFEST.id), new Blob([JSON.stringify(record)], { type: "application/json" }))
}

function makeHost(store: MemoryWorkspace): ToolHost {
  return new ToolHost(MANIFEST, grant, { store, board })
}

describe("ToolHost.mountIfEnabled — integra PluginManager.canMount", () => {
  it("plugin DISABLED → mount negato: ritorna null, nessuna sessione aperta", async () => {
    const store = new MemoryWorkspace()
    const pm = new PluginManager(store, () => 100)
    writeManifest(store)
    await pm.disable(MANIFEST.id)
    // precondizione: il manager lo considera NON montabile (intento OFF)
    expect(await pm.getState(MANIFEST.id)).toBe("disabled")
    expect(await pm.canMount(MANIFEST.id)).toBe(false)

    const host = makeHost(store)
    const session = await host.mountIfEnabled(pm, freshPort())

    expect(session).toBeNull()
    expect(host.session).toBeNull()

    // il deny è NON-terminale (distinto da revoke): riabilitare e ritentare monta.
    // Prova che mountIfEnabled non ha lasciato residui sull'host al path negato.
    await pm.enable(MANIFEST.id)
    const retry = await host.mountIfEnabled(pm, freshPort())
    expect(retry).not.toBeNull()
    expect(host.session).toBe(retry)
  })

  it("plugin ENABLED → mount consentito: sessione viva (gate falsificabile in entrambe le direzioni)", async () => {
    // un bug 'nega-tutto' romperebbe QUESTO; un bug 'monta-sempre' romperebbe il test disabled.
    const store = new MemoryWorkspace()
    const pm = new PluginManager(store, () => 100)
    writeManifest(store)
    await pm.enable(MANIFEST.id)
    expect(await pm.canMount(MANIFEST.id)).toBe(true)

    const host = makeHost(store)
    const session = await host.mountIfEnabled(pm, freshPort())

    expect(session).not.toBeNull()
    expect(host.session).toBe(session)
  })

  it("plugin abilitato ma REVOCATO (kill-list) → canMount false → mount negato", async () => {
    // copre l'asse SICUREZZA via lo stesso gate: l'intento enabled NON basta se revocato.
    const store = new MemoryWorkspace()
    const pm = new PluginManager(store, () => 100)
    writeManifest(store)
    await pm.enable(MANIFEST.id)
    await addToKillList(store, MANIFEST.id, "incidente", () => 200)
    expect(await pm.getState(MANIFEST.id)).toBe("revoked")

    const host = makeHost(store)
    const session = await host.mountIfEnabled(pm, freshPort())

    expect(session).toBeNull()
    expect(host.session).toBeNull()
  })

  it("plugin NON installato → canMount false → mount negato (manifest mai scritto)", async () => {
    const store = new MemoryWorkspace()
    const pm = new PluginManager(store, () => 100)
    expect(await pm.canMount(MANIFEST.id)).toBe(false)

    const host = makeHost(store)
    const session = await host.mountIfEnabled(pm, freshPort())

    expect(session).toBeNull()
    expect(host.session).toBeNull()
  })

  it("mount() diretto NON applica il gate: è mountIfEnabled a integrare canMount", async () => {
    // documenta il contratto: il gate vive in mountIfEnabled, non in mount() (sync,
    // usato da chi ha già deciso). Rende esplicito DOVE l'integrazione avviene.
    const store = new MemoryWorkspace()
    const pm = new PluginManager(store, () => 100)
    writeManifest(store)
    await pm.disable(MANIFEST.id)

    const host = makeHost(store)
    const direct = host.mount(freshPort())
    expect(direct).not.toBeNull()
    expect(host.session).toBe(direct)
  })
})
