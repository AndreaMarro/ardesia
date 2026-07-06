// @vitest-environment node
//
// TOOLHOST-SPEC-v0 §3 — kill-switch a RUNTIME (revoca persistente via kill-list)
// vs lifecycle + audit del tool. Dopo una revoca:
//   - PluginManager.canMount nega un NUOVO mount (ToolHost.mountIfEnabled → null);
//   - l'intento `enabled` (tools/<id>/lifecycle.json) resta INTATTO su disco;
//   - l'audit-log (tools/<id>/audit.jsonl) resta INTATTO su disco.
// La revoca è un OVERLAY non distruttivo: oscura il mount senza cancellare né
// l'intento del docente né lo storico "chi ha letto cosa". L'audit qui è REALE —
// prodotto dall'handshake del plugin di riferimento contro la ToolHost reale, non
// righe fabbricate — così l'invariante "audit intatto su disco" è provata sul
// formato vero, byte per byte.
import { afterEach, describe, expect, it } from "vitest"
import { start } from "../../plugins/reference/main.ts"
import { manifest as refManifest } from "../../plugins/reference/manifest.ts"
import { ToolHost } from "../toolhost/host.ts"
import { PluginManager, lifecyclePath, LifecycleDocSchema } from "../toolhost/pluginManager.ts"
import { bundlePath, installRecordPath, manifestPath } from "../toolhost/installer.ts"
import { addToKillList, removeFromKillList } from "../toolhost/killList.ts"
import { auditPath, readAuditLog } from "../toolhost/audit.ts"
import type { AuditStore } from "../toolhost/audit.ts"
import { resolveGrant } from "../toolhost/policy.ts"
import type { BoardApiLike, BoardElementLike } from "../toolhost/caps/board.ts"
import type { StorageDriverLike, StorageEntryLike } from "../toolhost/caps/storage.ts"
import type { WindowLike } from "../sdk/index.ts"

const ID = refManifest.id

class MemoryWorkspace implements StorageDriverLike, AuditStore {
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

class FakeBoard implements BoardApiLike {
  elements: BoardElementLike[] = []
  selected: Record<string, boolean> = {}
  getSceneElements(): readonly BoardElementLike[] {
    return this.elements
  }
  getAppState(): { selectedElementIds: Record<string, boolean> } {
    return { selectedElementIds: this.selected }
  }
  updateScene(scene: { elements: BoardElementLike[] }): void {
    this.elements = scene.elements
  }
}

class FakeToolWindow implements WindowLike {
  private _listeners = new Set<(ev: { data: unknown; ports?: readonly unknown[] }) => void>()
  addEventListener(_t: "message", l: (ev: { data: unknown; ports?: readonly unknown[] }) => void): void {
    this._listeners.add(l)
  }
  removeEventListener(_t: "message", l: (ev: { data: unknown; ports?: readonly unknown[] }) => void): void {
    this._listeners.delete(l)
  }
  deliver(data: unknown, ports: readonly unknown[]): void {
    for (const l of [...this._listeners]) l({ data, ports })
  }
}

const openChannels: MessageChannel[] = []
afterEach(() => {
  for (const ch of openChannels.splice(0)) {
    ch.port1.close()
    ch.port2.close()
  }
})

function makeHost(store: MemoryWorkspace, board: FakeBoard, now?: () => number): ToolHost {
  const grant = resolveGrant(refManifest, ["board.read", "board.write"])
  return new ToolHost(refManifest, grant, { store, board, now })
}

/** Scrive la TRIADE di install del reference plugin (P2.2: isToolInstalled =
 *  manifest+bundle+record) → installato. Firma/hash fixture: qui si prova il
 *  gate di LIFECYCLE, non l'install. */
function writeManifest(store: MemoryWorkspace): void {
  store.files.set(manifestPath(ID), new Blob([JSON.stringify(refManifest)], { type: "application/json" }))
  store.files.set(bundlePath(ID), new Blob(["zip"], { type: "application/zip" }))
  const record = {
    v: 1,
    toolId: ID,
    manifestVersion: 1,
    toolVersion: refManifest.version,
    t: 0,
    signature: "fixture",
    bundleHash: "fixture",
  }
  store.files.set(installRecordPath(ID), new Blob([JSON.stringify(record)], { type: "application/json" }))
}

/** Mount gated + handshake del plugin REALE. Ritorna la sessione o null se il
 *  gate (canMount) nega il mount. L'handshake produce audit REALE (board.read +
 *  board.write iniziale) sul tool id. */
async function gatedMountWithHandshake(
  host: ToolHost,
  gate: PluginManager,
): Promise<ToolHost["session"]> {
  const ch = new MessageChannel()
  openChannels.push(ch)
  const session = await host.mountIfEnabled(gate, ch.port1)
  if (session === null) return null
  const win = new FakeToolWindow()
  const pluginPromise = start({ windowRef: win })
  win.deliver(session.hello, [ch.port2])
  await pluginPromise
  await host.audit.idle()
  return session
}

function freshPort(): MessageChannel["port1"] {
  const ch = new MessageChannel()
  openChannels.push(ch)
  return ch.port1
}

async function textAt(store: MemoryWorkspace, path: string): Promise<string> {
  const blob = await store.read(path)
  if (blob === null) throw new Error(`atteso file su disco: ${path}`)
  return blob.text()
}

describe("ToolHost — kill-switch a runtime: nega nuovo mount, enabled+audit intatti su disco", () => {
  it("revoca a runtime → un NUOVO mount è negato, lifecycle e audit restano byte-identici su disco", async () => {
    const store = new MemoryWorkspace()
    const board = new FakeBoard()
    let t = 1000
    const pm = new PluginManager(store, () => t++)
    writeManifest(store)
    await pm.enable(ID)

    // anchor pre-revoca: enabled → un mount RIESCE e il plugin reale accumula
    // audit (se così non fosse, il deny post-revoca sarebbe indistinguibile da un
    // gate "nega-tutto" — falsificabilità bidirezionale).
    expect(await pm.canMount(ID)).toBe(true)
    const host1 = makeHost(store, board, () => t++)
    const sess = await gatedMountWithHandshake(host1, pm)
    expect(sess).not.toBeNull()
    host1.unmount() // chiude la sessione: nessuna write d'audit in volo dopo lo snapshot

    // snapshot su disco PRIMA della revoca: audit reale non vuoto + lifecycle enabled.
    const lifecycleBefore = await textAt(store, lifecyclePath(ID))
    const auditBefore = await textAt(store, auditPath(ID))
    const auditLogBefore = await readAuditLog(store, ID)
    expect(auditLogBefore.malformed).toBe(0)
    expect(auditLogBefore.entries.length).toBeGreaterThan(0)
    expect(auditLogBefore.entries.every((e) => e.tool === ID)).toBe(true)

    // KILL-SWITCH a runtime: revoca persistente (il docente/pannello banna il tool).
    await addToKillList(store, ID, "incidente sicurezza a runtime", () => t++)
    expect(await pm.getState(ID)).toBe("revoked")
    expect(await pm.canMount(ID)).toBe(false)

    // un NUOVO mount (istanza host fresca) è NEGATO dal gate: null, nessuna sessione.
    const host2 = makeHost(store, board, () => t++)
    const denied = await host2.mountIfEnabled(pm, freshPort())
    expect(denied).toBeNull()
    expect(host2.session).toBeNull()

    // l'intento `enabled` su disco è INTATTO (byte-identico): la revoca non lo tocca.
    const lifecycleAfter = await textAt(store, lifecyclePath(ID))
    expect(lifecycleAfter).toBe(lifecycleBefore)
    expect(LifecycleDocSchema.parse(JSON.parse(lifecycleAfter)).enabled).toBe(true)

    // l'audit su disco è INTATTO (byte-identico): né la revoca né il mount negato
    // scrivono nell'audit — lo storico "chi ha letto cosa" resta consultabile.
    const auditAfter = await textAt(store, auditPath(ID))
    expect(auditAfter).toBe(auditBefore)
    const auditLogAfter = await readAuditLog(store, ID)
    expect(auditLogAfter.malformed).toBe(0)
    expect(auditLogAfter.entries).toEqual(auditLogBefore.entries)
  })

  it("la revoca è reversibile: removeFromKillList riapre il mount mentre l'audit accumulato resta intatto", async () => {
    // Prova che la revoca era l'UNICO ostacolo (non l'audit, non l'intento): un bug
    // "nega-sempre" romperebbe il re-mount qui; e che la riabilitazione NON azzera
    // lo storico (overlay non distruttivo).
    const store = new MemoryWorkspace()
    const board = new FakeBoard()
    let t = 1000
    const pm = new PluginManager(store, () => t++)
    writeManifest(store)
    await pm.enable(ID)

    const host1 = makeHost(store, board, () => t++)
    expect(await gatedMountWithHandshake(host1, pm)).not.toBeNull()
    host1.unmount()
    const auditLogBefore = await readAuditLog(store, ID)
    expect(auditLogBefore.entries.length).toBeGreaterThan(0)

    await addToKillList(store, ID, "sospetto", () => t++)
    expect(await pm.canMount(ID)).toBe(false)
    expect(await (makeHost(store, board, () => t++)).mountIfEnabled(pm, freshPort())).toBeNull()

    // riabilitazione: il tool torna montabile (l'intento enabled era rimasto intatto).
    await removeFromKillList(store, ID)
    expect(await pm.getState(ID)).toBe("enabled")
    expect(await pm.canMount(ID)).toBe(true)
    const host2 = makeHost(store, board, () => t++)
    const reSession = await host2.mountIfEnabled(pm, freshPort())
    expect(reSession).not.toBeNull()
    expect(host2.session).toBe(reSession)

    // l'audit accumulato prima della revoca è ancora lì, identico: unkill non azzera.
    const auditLogAfter = await readAuditLog(store, ID)
    expect(auditLogAfter.malformed).toBe(0)
    expect(auditLogAfter.entries).toEqual(auditLogBefore.entries)
  })
})
