// @vitest-environment jsdom
//
// TOOLHOST T2-ST4 — E2E runtime: tool echo REALE (SDK connectTool) montato su
// MessageChannel verso ToolHost. DoD spec §9 T2: legge la selezione, scrive un
// embed, lo stato sopravvive a suspend/restore, audit consultabile; capability
// non dichiarata → rifiutata E loggata; storage cross-tool → negato.
import { afterEach, describe, expect, it } from "vitest"
import { ERR, PROTOCOL_VERSION, ToolManifestSchema } from "../toolhost-protocol/index.ts"
import type { ToolManifest } from "../toolhost-protocol/index.ts"
import { MAX_STATE_BYTES, ToolHost, statePath } from "../toolhost/host.ts"
import { readAuditLog } from "../toolhost/audit.ts"
import type { AuditStore } from "../toolhost/audit.ts"
import { EMBED_DATA_KEY } from "../toolhost/caps/board.ts"
import type { BoardApiLike, BoardElementLike } from "../toolhost/caps/board.ts"
import type { StorageDriverLike, StorageEntryLike } from "../toolhost/caps/storage.ts"
import { resolveGrant } from "../toolhost/policy.ts"
import { connectTool } from "../toolsdk/connect.ts"
import type { ToolConnection, ToolHandlers, WindowLike } from "../toolsdk/connect.ts"

const ECHO_MANIFEST: ToolManifest = ToolManifestSchema.parse({
  manifestVersion: 1,
  id: "com.example.echo",
  name: "Echo",
  version: "1.0.0",
  protocol: ">=1.0 <2.0",
  entry: "dist/index.html",
  surfaces: ["panel"],
  capabilities: { "board.read": {}, "board.write": { scope: "own-embeds" }, storage: { quotaMB: 1 } },
  publisher: { id: "example", pubkey: "ed25519:AAAA" },
  privacy: { dataOut: "none" },
})

function echoVariant(id: string, capabilities: Record<string, unknown>): ToolManifest {
  return ToolManifestSchema.parse({ ...ECHO_MANIFEST, id, capabilities })
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

/** Finestra finta del tool: connectTool ci ascolta, l'harness consegna l'hello. */
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

interface Mounted {
  host: ToolHost
  conn: ToolConnection
}

/** Mount completo: ToolHost su port1, SDK reale (connectTool) su port2. */
async function mountTool(
  manifest: ToolManifest,
  deps: { store: MemoryWorkspace; board: FakeBoard; now?: () => number },
  handlers: ToolHandlers = {},
  approved: Parameters<typeof resolveGrant>[1] = ["board.read", "board.write", "storage"],
): Promise<Mounted> {
  const host = new ToolHost(manifest, resolveGrant(manifest, approved), {
    ...deps,
    bearerToken: "bearer-test-1234",
  })
  return { host, conn: await remount(host, handlers) }
}

/** Nuovo mount sullo stesso host (nuova sessione, nuovo canale): simula il re-open dell'iframe. */
async function remount(host: ToolHost, handlers: ToolHandlers = {}): Promise<ToolConnection> {
  const ch = new MessageChannel()
  openChannels.push(ch)
  const session = host.mount(ch.port1)
  const win = new FakeToolWindow()
  const connPromise = connectTool({ windowRef: win, handlers })
  win.deliver(session.hello, [ch.port2])
  return connPromise
}

describe("DoD §9 T2: il tool echo via SDK reale", () => {
  it("legge la selezione, scrive un embed marcato, lo rilegge dalla scena", async () => {
    const store = new MemoryWorkspace()
    const board = new FakeBoard()
    board.elements = [
      { id: "del-docente", type: "rectangle" },
      { id: "scelto", type: "text" },
    ]
    board.selected = { scelto: true }
    const { conn } = await mountTool(ECHO_MANIFEST, { store, board })

    const selection = (await conn.call("board.read", { target: "selection" })) as { elements: BoardElementLike[] }
    expect(selection.elements.map((e) => e.id)).toEqual(["scelto"])

    await conn.call("board.write", { embedId: "echo-embed", state: { eco: "scelto" } })
    const embed = board.elements.find((e) => e.id === "echo-embed")!
    expect(embed.customData?.[EMBED_DATA_KEY]).toEqual({ owner: "com.example.echo", state: { eco: "scelto" } })

    const scene = (await conn.call("board.read", { target: "scene" })) as { elements: BoardElementLike[] }
    expect(scene.elements).toHaveLength(3)
  })

  it("storage round-trip via wire, nel namespace del tool", async () => {
    const store = new MemoryWorkspace()
    const { conn } = await mountTool(ECHO_MANIFEST, { store, board: new FakeBoard() })
    await conn.call("storage.set", { key: "memo.txt", value: "ricorda" })
    expect(await conn.call("storage.get", { key: "memo.txt" })).toEqual({ value: "ricorda" })
    expect(store.files.has("tools/com.example.echo/storage/memo.txt")).toBe(true)
  })

  it("lo stato sopravvive a suspend → unmount → remount → restore", async () => {
    const store = new MemoryWorkspace()
    let t = 5000
    const toolState = { contatore: 7, nota: "in corso" }
    const { host } = await mountTool(
      ECHO_MANIFEST,
      { store, board: new FakeBoard(), now: () => t++ },
      { suspend: () => toolState },
    )

    await host.suspend()
    host.unmount()
    expect(host.session).toBeNull()
    const persisted = JSON.parse(await store.files.get(statePath("com.example.echo"))!.text())
    expect(persisted).toEqual({ v: 1, t: 5000, state: { contatore: 7, nota: "in corso" } })

    let restored: unknown = null
    await remount(host, { restore: (s) => (restored = s) })
    expect(await host.restore()).toBe(true)
    expect(restored).toEqual(toolState)
  })

  it("restore senza stato persistito → false, il tool non riceve nulla", async () => {
    let touched = false
    const { host } = await mountTool(
      ECHO_MANIFEST,
      { store: new MemoryWorkspace(), board: new FakeBoard() },
      { restore: () => (touched = true) },
    )
    expect(await host.restore()).toBe(false)
    expect(touched).toBe(false)
  })

  it("suspend con stato oltre il tetto → errore, nulla persistito (no bypass quota via state.json)", async () => {
    const store = new MemoryWorkspace()
    const { host } = await mountTool(
      ECHO_MANIFEST,
      { store, board: new FakeBoard() },
      { suspend: () => ({ zavorra: "x".repeat(MAX_STATE_BYTES) }) },
    )
    await expect(host.suspend()).rejects.toThrow(/suspend state too large/)
    expect(store.files.has(statePath("com.example.echo"))).toBe(false)
  })

  it("state.json corrotto (non-JSON o forma sbagliata) → 'corrupted tool state', il tool non riceve nulla", async () => {
    const store = new MemoryWorkspace()
    let touched = false
    const { host } = await mountTool(
      ECHO_MANIFEST,
      { store, board: new FakeBoard() },
      { restore: () => (touched = true) },
    )
    store.files.set(statePath("com.example.echo"), new Blob(["{vandalo"]))
    await expect(host.restore()).rejects.toThrow(/corrupted tool state/)
    store.files.set(statePath("com.example.echo"), new Blob(['{"v":99,"sorpresa":true}']))
    await expect(host.restore()).rejects.toThrow(/corrupted tool state/)
    expect(touched).toBe(false)
  })

  it("tool muto: host.suspend scade col timeout, la promise non resta appesa per sempre", async () => {
    const host = new ToolHost(ECHO_MANIFEST, resolveGrant(ECHO_MANIFEST, ["board.read"]), {
      store: new MemoryWorkspace(),
      board: new FakeBoard(),
      requestTimeoutMs: 30,
    })
    const ch = new MessageChannel()
    openChannels.push(ch)
    const session = host.mount(ch.port1)
    // handshake manuale: il tool completa il ready ma poi resta MUTO
    ch.port2.start()
    ch.port2.postMessage({
      jsonrpc: "2.0",
      id: 1,
      method: "tool.ready",
      params: { protocolVersion: PROTOCOL_VERSION, nonce: session.nonce },
    })
    await session.ready
    await expect(host.suspend()).rejects.toThrow(/within 30ms/)
  })

  it("suspend/restore senza mount → errore esplicito, mai stato corrotto", async () => {
    const host = new ToolHost(ECHO_MANIFEST, resolveGrant(ECHO_MANIFEST, ["board.read"]), {
      store: new MemoryWorkspace(),
      board: new FakeBoard(),
    })
    await expect(host.suspend()).rejects.toThrow(/not mounted/)
    await expect(host.restore()).rejects.toThrow(/not mounted/)
  })
})

describe("criterio T2-d: tentativi oltre il grant — rifiutati E loggati", () => {
  it("capability NON dichiarata (storage assente dal manifest) → CAPABILITY_DENIED + audit denied", async () => {
    const store = new MemoryWorkspace()
    let t = 100
    const manifest = echoVariant("com.example.solo-board", { "board.read": {} })
    const { conn } = await mountTool(manifest, { store, board: new FakeBoard(), now: () => t++ }, {}, ["board.read"])

    await expect(conn.call("storage.get", { key: "x" })).rejects.toMatchObject({ code: ERR.CAPABILITY_DENIED })
    await expect(conn.call("fs.read", { path: "/etc/passwd" })).rejects.toMatchObject({ code: ERR.METHOD_NOT_FOUND })

    const { entries, malformed } = await readAuditLog(store, "com.example.solo-board")
    expect(malformed).toBe(0)
    expect(entries).toEqual([
      { v: 1, t: 100, tool: "com.example.solo-board", method: "storage.get", outcome: "denied", code: ERR.CAPABILITY_DENIED },
      { v: 1, t: 101, tool: "com.example.solo-board", method: "fs.read", outcome: "denied", code: ERR.METHOD_NOT_FOUND },
    ])
  })

  it("capability dichiarata ma NON approvata dal docente → stessa sorte (grant ≠ manifest)", async () => {
    const store = new MemoryWorkspace()
    const { conn } = await mountTool(ECHO_MANIFEST, { store, board: new FakeBoard() }, {}, ["board.read"])
    await expect(conn.call("board.write", { embedId: "e", state: {} })).rejects.toMatchObject({
      code: ERR.CAPABILITY_DENIED,
    })
    const { entries } = await readAuditLog(store, "com.example.echo")
    expect(entries.map((e) => e.outcome)).toEqual(["denied"])
  })

  it("storage cross-tool: il tool B non vede né tocca i dati del tool A", async () => {
    const store = new MemoryWorkspace()
    const board = new FakeBoard()
    const a = await mountTool(ECHO_MANIFEST, { store, board })
    const b = await mountTool(echoVariant("com.rivale.spy", { storage: { quotaMB: 1 } }), { store, board }, {}, [
      "storage",
    ])
    await a.conn.call("storage.set", { key: "segreto", value: "di-a" })
    expect(await b.conn.call("storage.get", { key: "segreto" })).toEqual({ value: null })
    await b.conn.call("storage.delete", { key: "segreto" })
    expect(await a.conn.call("storage.get", { key: "segreto" })).toEqual({ value: "di-a" })
    expect(await b.conn.call("storage.list", {})).toEqual({ keys: [] })
  })

  it("l'audit del tool è consultabile dal docente: ogni chiamata con esito, in ordine", async () => {
    const store = new MemoryWorkspace()
    let t = 9000
    const { host, conn } = await mountTool(ECHO_MANIFEST, { store, board: new FakeBoard(), now: () => t++ })
    await conn.call("board.read", { target: "scene" })
    await conn.call("storage.set", { key: "k", value: "v" })
    await conn.call("board.read", { target: "luna" }).catch(() => {})
    await host.audit.idle()
    const { entries } = await readAuditLog(store, "com.example.echo")
    expect(entries.map((e) => [e.method, e.outcome])).toEqual([
      ["board.read", "ok"],
      ["storage.set", "ok"],
      ["board.read", "invalid"],
    ])
    expect(entries.map((e) => e.t)).toEqual([9000, 9001, 9002])
  })

  it("raffica concorrente: nessuna riga di audit persa né malformata", async () => {
    const store = new MemoryWorkspace()
    const { host, conn } = await mountTool(ECHO_MANIFEST, { store, board: new FakeBoard() })
    await Promise.all(Array.from({ length: 20 }, (_, i) => conn.call("storage.set", { key: `k${i}`, value: "v" })))
    await host.audit.idle()
    const { entries, malformed } = await readAuditLog(store, "com.example.echo")
    expect(malformed).toBe(0)
    expect(entries).toHaveLength(20)
    expect(entries.every((e) => e.method === "storage.set" && e.outcome === "ok")).toBe(true)
  })
})

describe("uninstall (spec §2): storage e stato purgati, audit SOPRAVVIVE", () => {
  it("dopo uninstall restano solo le righe di audit", async () => {
    const store = new MemoryWorkspace()
    const { host, conn } = await mountTool(ECHO_MANIFEST, {
      store,
      board: new FakeBoard(),
      now: () => 1,
    })
    await conn.call("storage.set", { key: "dati", value: "x" })
    store.files.set(statePath("com.example.echo"), new Blob(['{"v":1,"t":1,"state":null}']))
    await host.audit.idle()
    await host.uninstall()
    expect(host.session).toBeNull()
    const rimasti = [...store.files.keys()]
    expect(rimasti).toEqual(["tools/com.example.echo/audit.jsonl"])
    expect((await readAuditLog(store, "com.example.echo")).entries.length).toBeGreaterThan(0)
  })
})
