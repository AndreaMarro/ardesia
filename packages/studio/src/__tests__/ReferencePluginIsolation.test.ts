// @vitest-environment node
//
// Plugin-isolation: DUE istanze del plugin di riferimento (Arduino Blink) montate
// su ToolHost distinti che CONDIVIDONO lo stesso WorkspaceStore NON condividono
// stato. La ToolHost namespacizza ogni superficie persistente per tool id; questo
// test prova che il confine regge quando due tool diversi insistono sullo stesso
// store di supporto:
//   1. state.json (suspend/restore) è per-id: i due snapshot non si mescolano;
//   2. audit-log è per-id: le chiamate di A non finiscono nel log di B;
//   3. board own-embeds: quando due reference-plugin (stesso embed-id hardcoded)
//      insistono sulla STESSA lavagna, l'ownership per-id nega la write del
//      secondo (collisione disciplinata). Prova la negazione dell'ownership, NON
//      un isolamento board generale (plugin con embed-id distinti non collidono);
//   4. sessione: nonce e bearer token sono distinti per mount (nessun segreto condiviso).
// Tutto guidato dal plugin REALE (plugins/reference/main.ts) via SDK reale +
// MessageChannel, contro la ToolHost reale.
//
// NOTA: il reference plugin hardcoda l'embed id (`<manifest.id>:led` nel SUO
// modulo, quindi sempre lo stesso per entrambe le istanze). Due plugin sulla
// STESSA lavagna collidono su quell'id già all'handshake: è esattamente lo
// scenario del test #3. Per i test #1/#2 (isolamento dello STATO persistito, che
// vive nello store) ogni plugin disegna sulla propria superficie — come in
// produzione, dove ogni embed vive nel proprio iframe.
import { afterEach, describe, expect, it } from "vitest"
import { start } from "../../plugins/reference/main.ts"
import { manifest as refManifest } from "../../plugins/reference/manifest.ts"
import { ToolHost, statePath } from "../toolhost/host.ts"
import { EMBED_DATA_KEY } from "../toolhost/caps/board.ts"
import type { BoardApiLike, BoardElementLike } from "../toolhost/caps/board.ts"
import { readAuditLog } from "../toolhost/audit.ts"
import type { AuditStore } from "../toolhost/audit.ts"
import type { StorageDriverLike, StorageEntryLike } from "../toolhost/caps/storage.ts"
import { resolveGrant } from "../toolhost/policy.ts"
import { defineManifest, ERR, isValidToolId } from "../sdk/index.ts"
import type { CapabilityName, ToolManifest, WindowLike } from "../sdk/index.ts"

// Embed id hardcoded dal plugin reale (vedi main.ts): entrambe le istanze del
// reference plugin mirano allo STESSO id sulla lavagna condivisa → la collisione
// è esattamente ciò che l'ownership per-id deve disciplinare.
const SHARED_EMBED_ID = `${refManifest.id}:led`

const ID_A = "io.maestro.plugin-ref-a"
const ID_B = "io.maestro.plugin-ref-b"

/** Clona il manifest del reference plugin con un id/publisher distinti: due TOOL diversi, stesso codice. */
function refManifestWithId(id: string, publisherId: string): ToolManifest {
  return defineManifest({ ...refManifest, id, publisher: { ...refManifest.publisher, id: publisherId } })
}

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

interface Harness {
  host: ToolHost
  session: ReturnType<ToolHost["mount"]>
  plugin: Awaited<ReturnType<typeof start>>
}

/** Monta il reference plugin reale su una ToolHost con il manifest dato (id distinto). */
async function mount(
  manifest: ToolManifest,
  deps: { store: MemoryWorkspace; board: FakeBoard },
  opts: { approved?: readonly CapabilityName[]; bearerToken?: string; now?: () => number } = {},
): Promise<Harness> {
  const approved = opts.approved ?? (["board.read", "board.write"] as const)
  const host = new ToolHost(manifest, resolveGrant(manifest, approved), {
    store: deps.store,
    board: deps.board,
    bearerToken: opts.bearerToken,
    now: opts.now,
  })
  const ch = new MessageChannel()
  openChannels.push(ch)
  const session = host.mount(ch.port1)
  const win = new FakeToolWindow()
  const pluginPromise = start({ windowRef: win })
  win.deliver(session.hello, [ch.port2])
  return { host, session, plugin: await pluginPromise }
}

function embedOf(board: FakeBoard): { owner: string; state: { ledOn: boolean; millis: number } } | undefined {
  const el = board.elements.find((e) => e.id === SHARED_EMBED_ID)
  if (el === undefined) return undefined
  return el.customData?.[EMBED_DATA_KEY] as { owner: string; state: { ledOn: boolean; millis: number } }
}

describe("plugin-isolation — due reference-plugin, backing condiviso", () => {
  it("gli id clonati sono tool id validi e distinti dall'originale", () => {
    expect(isValidToolId(ID_A)).toBe(true)
    expect(isValidToolId(ID_B)).toBe(true)
    expect(ID_A).not.toBe(refManifest.id)
    expect(ID_B).not.toBe(refManifest.id)
  })

  it("state.json è per-id: A e B persistono snapshot DIVERSI, restore non li mescola", async () => {
    // store CONDIVISO (è lì che vive lo stato persistito) — board separati: ogni
    // embed renderizza nella propria superficie, come in produzione (iframe per tool).
    const store = new MemoryWorkspace()
    const boardA = new FakeBoard()
    const boardB = new FakeBoard()
    let ta = 1000
    let tb = 2000
    const a = await mount(refManifestWithId(ID_A, "ref-a"), { store, board: boardA }, { now: () => ta++ })
    const b = await mount(refManifestWithId(ID_B, "ref-b"), { store, board: boardB }, { now: () => tb++ })

    // A avanza a millis 3000 (3 step → LED ON), B avanza a millis 2000 (2 step → LED OFF).
    for (let i = 0; i < 3; i++) await a.plugin.step()
    for (let i = 0; i < 2; i++) await b.plugin.step()
    expect(a.plugin.runtime.millis()).toBe(3000)
    expect(b.plugin.runtime.millis()).toBe(2000)
    expect(a.plugin.ledOn()).toBe(true)
    expect(b.plugin.ledOn()).toBe(false)

    const pathA = statePath(ID_A)
    const pathB = statePath(ID_B)
    // INTERLEAVED: suspend() di A scrive SOLO nel namespace di A; quello di B non
    // esiste finché B non lo persiste a sua volta (la write non è coincidenza di
    // stringa, è host.suspend reale che indirizza il proprio tool id).
    expect(store.files.has(pathA)).toBe(false)
    expect(store.files.has(pathB)).toBe(false)
    await a.host.suspend()
    expect(store.files.has(pathA)).toBe(true)
    expect(store.files.has(pathB)).toBe(false)
    await b.host.suspend()
    expect(store.files.has(pathB)).toBe(true)

    const docA = JSON.parse(await store.files.get(pathA)!.text())
    const docB = JSON.parse(await store.files.get(pathB)!.text())
    expect(docA.state).toEqual({ v: 1, millis: 3000, modes: { 13: 1 }, levels: { 13: 1 } })
    expect(docB.state).toEqual({ v: 1, millis: 2000, modes: { 13: 1 }, levels: { 13: 0 } })
    expect(docA.state).not.toEqual(docB.state)

    a.host.unmount()
    b.host.unmount()

    // Nuovi mount sullo stesso store: ognuno ripristina SOLO il proprio snapshot.
    const a2 = await mount(refManifestWithId(ID_A, "ref-a"), { store, board: new FakeBoard() })
    const b2 = await mount(refManifestWithId(ID_B, "ref-b"), { store, board: new FakeBoard() })
    expect(a2.plugin.runtime.millis()).toBe(0)
    expect(b2.plugin.runtime.millis()).toBe(0)
    expect(await a2.host.restore()).toBe(true)
    expect(await b2.host.restore()).toBe(true)
    expect(a2.plugin.runtime.millis()).toBe(3000)
    expect(a2.plugin.ledOn()).toBe(true)
    expect(b2.plugin.runtime.millis()).toBe(2000)
    expect(b2.plugin.ledOn()).toBe(false)
  })

  it("audit-log è per-id: le chiamate di A non compaiono nel log di B (e viceversa)", async () => {
    const store = new MemoryWorkspace()
    let t = 5000
    const a = await mount(refManifestWithId(ID_A, "ref-a"), { store, board: new FakeBoard() }, { now: () => t++ })
    const b = await mount(refManifestWithId(ID_B, "ref-b"), { store, board: new FakeBoard() }, { now: () => t++ })

    // A: handshake (board.read + board.write iniziale) + 2 step (2 board.write). B: solo handshake.
    await a.plugin.step()
    await a.plugin.step()

    await a.host.audit.idle()
    await b.host.audit.idle()

    const logA = await readAuditLog(store, ID_A)
    const logB = await readAuditLog(store, ID_B)
    expect(logA.malformed).toBe(0)
    expect(logB.malformed).toBe(0)
    // ogni entry è etichettata col SUO tool id: nessuna contaminazione incrociata.
    expect(logA.entries.length).toBeGreaterThan(0)
    expect(logB.entries.length).toBeGreaterThan(0)
    expect(logA.entries.every((e) => e.tool === ID_A)).toBe(true)
    expect(logB.entries.every((e) => e.tool === ID_B)).toBe(true)
    // Conteggi ESATTI (pin del comportamento di handshake + step):
    //   A = board.read(selezione) + board.write(embed iniziale) + 2× board.write(step) = 4
    //   B = board.read(selezione) + board.write(embed iniziale)                         = 2
    // I log non si mescolano: se condividessero il file, ogni `every(tool===)` fallirebbe.
    const writesA = logA.entries.filter((e) => e.method === "board.write").length
    const writesB = logB.entries.filter((e) => e.method === "board.write").length
    expect(writesA).toBe(3)
    expect(writesB).toBe(1)
    expect(logA.entries.length).toBe(4)
    expect(logB.entries.length).toBe(2)
  })

  it("board own-embeds: la collisione su embed-id condiviso è negata (B non sovrascrive l'embed di A)", async () => {
    const shared = { store: new MemoryWorkspace(), board: new FakeBoard() }
    // A monta per primo: il suo handshake crea l'embed sulla lavagna → owner = A.
    const a = await mount(refManifestWithId(ID_A, "ref-a"), shared)
    const owned = embedOf(shared.board)
    expect(owned?.owner).toBe(ID_A)
    expect(owned?.state.ledOn).toBe(false)

    // B mira allo STESSO embed id (hardcoded nel reference plugin). Già al suo
    // handshake la write iniziale verso un embed NON suo è negata (own-embeds):
    // start() rigetta. L'ownership per-id impedisce a B di toccare lo stato di A.
    let denied: { code?: number; message: string } | null = null
    await mount(refManifestWithId(ID_B, "ref-b"), shared).catch((e: unknown) => {
      denied = e as { code?: number; message: string }
    })
    expect(denied).not.toBeNull()
    expect(denied!.code).toBe(ERR.CAPABILITY_DENIED)
    expect(denied!.message).toMatch(/own-embeds/)

    // l'embed di A è INTATTO: owner e stato invariati, B non l'ha toccato.
    const after = embedOf(shared.board)
    expect(after?.owner).toBe(ID_A)
    expect(after?.state.ledOn).toBe(false)
    expect(shared.board.elements.filter((e) => e.id === SHARED_EMBED_ID)).toHaveLength(1)

    // controprova: A può ancora aggiornare il PROPRIO embed (non è stato bloccato dal tentativo di B).
    await a.plugin.step()
    expect(embedOf(shared.board)?.owner).toBe(ID_A)
    expect(embedOf(shared.board)?.state.ledOn).toBe(true)
  })

  it("sessione: due mount concorrenti hanno nonce e bearer token distinti", async () => {
    const store = new MemoryWorkspace()
    const a = await mount(refManifestWithId(ID_A, "ref-a"), { store, board: new FakeBoard() }, { bearerToken: "bearer-A" })
    const b = await mount(refManifestWithId(ID_B, "ref-b"), { store, board: new FakeBoard() }, { bearerToken: "bearer-B" })

    expect(a.session.nonce).not.toBe(b.session.nonce)
    expect(a.session.hello.params.nonce).toBe(a.session.nonce)
    expect(b.session.hello.params.nonce).toBe(b.session.nonce)
    expect(a.plugin.conn.bearerToken).toBe("bearer-A")
    expect(b.plugin.conn.bearerToken).toBe("bearer-B")
    expect(a.plugin.conn.bearerToken).not.toBe(b.plugin.conn.bearerToken)
  })
})
