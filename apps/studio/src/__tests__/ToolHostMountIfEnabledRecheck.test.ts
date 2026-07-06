// @vitest-environment node
//
// TOOLHOST-SPEC-v0 §3 — ToolHost.mountIfEnabled RICONSULTA canMount ad OGNI
// invocazione: il gate di INTENTO non è memoizzato sull'istanza host. Un `disable`
// (il docente spegne l'intento — asse INTENTO, distinto dal kill-switch della
// kill-list dell'asse SICUREZZA) emesso TRA due mount nega il SECONDO mount sulla
// STESSA istanza host che aveva montato il primo. Conseguenze provate su disco:
//   - il deny è un gate PRE-mount → non apre sessione, non consuma porta, non scrive;
//   - l'audit prodotto dalla PRIMA sessione resta INTATTO (byte per byte): spegnere
//     l'intento non cancella lo storico "chi ha letto cosa".
// L'audit qui è REALE — prodotto dall'handshake del plugin di riferimento contro la
// ToolHost reale, non righe fabbricate — così l'invariante è provata sul formato vero.
import { afterEach, describe, expect, it } from "vitest"
import { start } from "../../plugins/reference/main.ts"
import { manifest as refManifest } from "../../plugins/reference/manifest.ts"
import { ToolHost } from "../toolhost/host.ts"
import type { MountGate } from "../toolhost/host.ts"
import { PluginManager, lifecyclePath, LifecycleDocSchema } from "../toolhost/pluginManager.ts"
import { bundlePath, installRecordPath, manifestPath } from "../toolhost/installer.ts"
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

/** Mount gated + handshake del plugin REALE sulla stessa istanza host. Ritorna la
 *  sessione, o null se il gate (canMount) nega il mount. L'handshake produce audit
 *  REALE (board.read + board.write iniziale) sul tool id; al ritorno l'audit è
 *  drenato (audit.idle) e la sessione chiusa, così lo snapshot su disco è stabile. */
async function gatedMountWithHandshake(
  host: ToolHost,
  gate: MountGate,
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
  host.unmount()
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

/** Avvolge un MountGate contando le consultazioni di canMount: prova "riconsulta ad
 *  OGNI invocazione" — ogni mountIfEnabled deve produrre esattamente una query. */
class CountingGate implements MountGate {
  calls = 0
  private readonly inner: MountGate
  constructor(inner: MountGate) {
    this.inner = inner
  }
  async canMount(toolId: string): Promise<boolean> {
    this.calls++
    return this.inner.canMount(toolId)
  }
}

describe("ToolHost.mountIfEnabled — riconsulta canMount ad ogni invocazione (asse INTENTO)", () => {
  it("un disable TRA due mount nega il secondo sulla STESSA istanza; l'audit della prima sessione resta byte-identico", async () => {
    const store = new MemoryWorkspace()
    const board = new FakeBoard()
    let t = 1000
    const pm = new PluginManager(store, () => t++)
    writeManifest(store)
    await pm.enable(ID)

    // STESSA istanza host per entrambi i mount: è il cuore del test "riconsulta ad
    // ogni invocazione". Un host che memoizzasse l'esito del primo canMount=true
    // monterebbe il secondo nonostante il disable.
    const host = makeHost(store, board, () => t++)

    // anchor pre-disable: enabled → il PRIMO mount RIESCE e il plugin reale accumula
    // audit (senza, il deny post-disable sarebbe indistinguibile da un gate
    // "nega-tutto" — falsificabilità bidirezionale).
    expect(await pm.canMount(ID)).toBe(true)
    const sess = await gatedMountWithHandshake(host, pm)
    expect(sess).not.toBeNull()
    expect(host.session).toBeNull() // gatedMountWithHandshake chiude la sessione

    // snapshot su disco DOPO la prima sessione: audit reale non vuoto.
    const auditBefore = await textAt(store, auditPath(ID))
    const auditLogBefore = await readAuditLog(store, ID)
    expect(auditLogBefore.malformed).toBe(0)
    expect(auditLogBefore.entries.length).toBeGreaterThan(0)
    expect(auditLogBefore.entries.every((e) => e.tool === ID)).toBe(true)

    // DISABLE a runtime TRA i due mount: il docente spegne l'intento (asse INTENTO,
    // NON kill-list). Persiste enabled=false su disco.
    await pm.disable(ID)
    expect(await pm.getState(ID)).toBe("disabled")
    expect(await pm.canMount(ID)).toBe(false)

    // il SECONDO mount sulla STESSA istanza host è NEGATO: mountIfEnabled riconsulta
    // canMount (ora false) → null, nessuna sessione aperta, porta non consumata.
    const denied = await host.mountIfEnabled(pm, freshPort())
    expect(denied).toBeNull()
    expect(host.session).toBeNull()

    // l'intento su disco riflette il disable: enabled=false (questo, non un revoke,
    // è ciò che ha negato il mount — distingue dall'asse SICUREZZA/kill-list).
    const lifecycleAfter = await textAt(store, lifecyclePath(ID))
    expect(LifecycleDocSchema.parse(JSON.parse(lifecycleAfter)).enabled).toBe(false)

    // l'audit della PRIMA sessione resta INTATTO (byte-identico): né il disable né il
    // mount negato scrivono nell'audit — lo storico "chi ha letto cosa" sopravvive
    // allo spegnimento dell'intento.
    const auditAfter = await textAt(store, auditPath(ID))
    expect(auditAfter).toBe(auditBefore)
    const auditLogAfter = await readAuditLog(store, ID)
    expect(auditLogAfter.malformed).toBe(0)
    expect(auditLogAfter.entries).toEqual(auditLogBefore.entries)
  })

  it("nessuna memoizzazione su NESSUN asse: enabled→disabled→enabled produce mount→deny→mount con UNA consultazione di canMount per chiamata", async () => {
    // Prova diretta del "ad ogni invocazione": un gate contatore avvolge il
    // PluginManager REALE. Tre mountIfEnabled attraverso tre stati distinti devono
    // dare [sessione, null, sessione] ed esattamente 3 consultazioni (una per call).
    // Un host che latchasse l'esito (true O false) fallirebbe la sequenza o il conteggio.
    const store = new MemoryWorkspace()
    const board = new FakeBoard()
    let t = 1000
    const pm = new PluginManager(store, () => t++)
    writeManifest(store)
    await pm.enable(ID)

    const host = makeHost(store, board, () => t++)
    const gate = new CountingGate(pm)

    // #1 enabled → mount RIESCE (+ audit reale, poi sessione chiusa).
    const first = await gatedMountWithHandshake(host, gate)
    expect(first).not.toBeNull()
    expect(gate.calls).toBe(1)
    const auditLogAfterFirst = await readAuditLog(store, ID)
    expect(auditLogAfterFirst.entries.length).toBeGreaterThan(0)
    const auditByteSnapshot = await textAt(store, auditPath(ID))

    // #2 disabled → mount NEGATO (riconsultato fresco, non latchato a true).
    await pm.disable(ID)
    const second = await host.mountIfEnabled(gate, freshPort())
    expect(second).toBeNull()
    expect(host.session).toBeNull()
    expect(gate.calls).toBe(2)

    // #3 ri-enabled → mount RIESCE di nuovo (riconsultato fresco, non latchato a
    // false): la decisione è SEMPRE letta dal gate, mai congelata dall'istanza host.
    await pm.enable(ID)
    const third = await host.mountIfEnabled(gate, freshPort())
    expect(third).not.toBeNull()
    expect(host.session).toBe(third)
    expect(gate.calls).toBe(3)
    host.unmount()

    // l'audit della prima sessione è ancora intatto attraverso disable+enable: le
    // transizioni di intento non toccano lo storico.
    const auditByteFinal = await textAt(store, auditPath(ID))
    expect(auditByteFinal).toBe(auditByteSnapshot)
    const auditLogFinal = await readAuditLog(store, ID)
    expect(auditLogFinal.malformed).toBe(0)
    expect(auditLogFinal.entries).toEqual(auditLogAfterFirst.entries)
  })
})
