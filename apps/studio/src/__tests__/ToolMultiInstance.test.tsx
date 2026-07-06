// @vitest-environment jsdom
//
// P0-C — multi-istanza dello STESSO plugin: due post-it dello stesso tool non
// devono mai condividere storage né potersi scrivere gli embed a vicenda.
// Oggi ToolStorage namespace per toolId e ToolBoard marca owner=toolId: due
// istanze = stesso namespace = cross-write. L'istanza è un concetto HOST-side
// (il docente crea le istanze, mai il tool): instanceId entra da ToolHostDeps,
// non dal wire.
//
// Invarianti falsificabili:
//   1. storage.set dell'istanza A invisibile all'istanza B (stesso tool).
//   2. il namespace istanza sta DENTRO tools/<id>/storage/ → l'uninstall
//      (purgeToolStorage) pulisce TUTTE le istanze, nessun residuo.
//   3. instanceId malformato = fail-closed (mai un prefisso alias-abile).
//   4. board: l'embed di A non è "own" per B; write di B su embed di A rifiutata.
//   5. il pass-through di ToolHostDeps.instanceId è REALE: due host montati sul
//      wire (storage.set/get) restano isolati.

import { afterEach, describe, expect, it } from "vitest"
import { ToolStorage, purgeToolStorage, storagePrefix } from "../toolhost/caps/storage.ts"
import type { StorageDriverLike, StorageEntryLike } from "../toolhost/caps/storage.ts"
import { EMBED_DATA_KEY, ToolBoard, embedOwner } from "../toolhost/caps/board.ts"
import type { BoardApiLike, BoardElementLike } from "../toolhost/caps/board.ts"
import type { AuditStore } from "../toolhost/audit.ts"
import { ToolHost } from "../toolhost/host.ts"
import { resolveGrant } from "../toolhost/policy.ts"
import { ToolManifestSchema } from "../toolhost-protocol/index.ts"
import { connectTool } from "../sdk/index.ts"
import type { ToolConnection, WindowLike } from "../sdk/index.ts"

class MemoryDriver implements StorageDriverLike, AuditStore {
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
  getSceneElements(): readonly BoardElementLike[] {
    return this.elements
  }
  getAppState(): { selectedElementIds: Record<string, boolean> } {
    return { selectedElementIds: {} }
  }
  updateScene(scene: { elements: BoardElementLike[] }): void {
    this.elements = scene.elements
  }
}

const TOOL_ID = "com.example.postit"

describe("ToolStorage multi-istanza (namespace per instanceId)", () => {
  it("set dell'istanza A invisibile a B; senza instanceId il prefisso resta quello storico", async () => {
    const driver = new MemoryDriver()
    const a = new ToolStorage(driver, TOOL_ID, 1, "ist-a")
    const b = new ToolStorage(driver, TOOL_ID, 1, "ist-b")
    const legacy = new ToolStorage(driver, TOOL_ID, 1)

    await a.set("note.json", '{"testo":"ciao"}')
    expect(await b.get("note.json")).toEqual({ value: null })
    expect((await b.list()).keys).toEqual([])
    expect(await legacy.get("note.json")).toEqual({ value: null })

    // back-compat: il tool senza istanza scrive ESATTAMENTE dove scriveva prima
    await legacy.set("vecchia.txt", "x")
    expect([...driver.files.keys()]).toContain(`tools/${TOOL_ID}/storage/vecchia.txt`)
    // e l'istanza vive DENTRO il prefisso storico del tool (mai fuori)
    const prefix = storagePrefix(TOOL_ID)
    for (const p of driver.files.keys()) expect(p.startsWith(prefix)).toBe(true)
  })

  it("uninstall: purgeToolStorage pulisce anche TUTTE le istanze (nessun residuo)", async () => {
    const driver = new MemoryDriver()
    await new ToolStorage(driver, TOOL_ID, 1, "ist-a").set("a.txt", "1")
    await new ToolStorage(driver, TOOL_ID, 1, "ist-b").set("b.txt", "2")
    await new ToolStorage(driver, TOOL_ID, 1).set("legacy.txt", "3")

    const purged = await purgeToolStorage(driver, TOOL_ID)
    expect(purged).toBe(3)
    expect(driver.files.size).toBe(0)
  })

  it("instanceId malformato = fail-closed (niente prefissi alias-abili)", () => {
    const driver = new MemoryDriver()
    for (const bad of ["", "../fuori", "a/b", "a.b", "@x", "UPPER CASE", "x".repeat(65)]) {
      expect(() => new ToolStorage(driver, TOOL_ID, 1, bad), `instanceId: ${JSON.stringify(bad)}`).toThrow()
    }
  })
})

describe("ToolBoard multi-istanza (ownership per istanza)", () => {
  it("l'embed di A non è own per B: write di B rifiutata, scena intatta", () => {
    const api = new FakeBoard()
    const a = new ToolBoard(api, TOOL_ID, undefined, "ist-a")
    const b = new ToolBoard(api, TOOL_ID, undefined, "ist-b")

    a.write("embed-1", { note: "di A" })
    expect(b.isOwnEmbed("embed-1")).toBe(false)
    expect(a.isOwnEmbed("embed-1")).toBe(true)
    expect(() => b.write("embed-1", { note: "furto" })).toThrow(/not owned/)

    const el = api.elements.find((e) => e.id === "embed-1")!
    const marker = (el.customData as Record<string, unknown>)[EMBED_DATA_KEY] as { state?: unknown }
    expect(marker.state).toEqual({ note: "di A" })
  })

  it("owner marker distingue le istanze ma resta il toolId per chi non ne ha", () => {
    const api = new FakeBoard()
    new ToolBoard(api, TOOL_ID, undefined, "ist-a").write("embed-a", {})
    new ToolBoard(api, TOOL_ID).write("embed-plain", {})

    const ownerOf = (id: string) => embedOwner(api.elements.find((e) => e.id === id)!)
    expect(ownerOf("embed-a")).not.toBe(TOOL_ID)
    expect(ownerOf("embed-a")).toContain(TOOL_ID)
    expect(ownerOf("embed-plain")).toBe(TOOL_ID)
  })

  it("instanceId malformato = fail-closed anche sulla board", () => {
    expect(() => new ToolBoard(new FakeBoard(), TOOL_ID, undefined, "a/b")).toThrow()
  })
})

// ---------- pass-through ToolHostDeps.instanceId sul wire REALE ----------

const MULTI_MANIFEST = ToolManifestSchema.parse({
  manifestVersion: 1,
  id: TOOL_ID,
  name: "Post-it (multi-instance test)",
  version: "1.0.0",
  protocol: ">=1.0 <2.0",
  entry: "entry.html",
  surfaces: ["board-embed"],
  capabilities: { storage: { quotaMB: 1 } },
  publisher: { id: "ref", pubkey: "ed25519:AAAA" },
  privacy: { dataOut: "none" },
})

class InPageToolWindow implements WindowLike {
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

const cleanups: Array<() => void> = []
afterEach(() => {
  for (const c of cleanups.splice(0)) c()
})

async function mountInstance(driver: MemoryDriver, instanceId: string): Promise<ToolConnection> {
  const host = new ToolHost(MULTI_MANIFEST, resolveGrant(MULTI_MANIFEST, ["storage"]), {
    store: driver,
    board: new FakeBoard(),
    instanceId,
  })
  const ch = new MessageChannel()
  const session = host.mount(ch.port1)
  const win = new InPageToolWindow()
  const connP = connectTool({ windowRef: win, handlers: {} })
  win.deliver(session.hello, [ch.port2])
  const conn = await connP
  cleanups.push(() => {
    conn.close()
    host.unmount()
    ch.port1.close()
    ch.port2.close()
  })
  return conn
}

describe("ToolHost multi-istanza (due mount sul wire, storage isolato)", () => {
  it("storage.set dell'istanza A non è leggibile dall'istanza B dello stesso tool", async () => {
    const driver = new MemoryDriver()
    const a = await mountInstance(driver, "ist-a")
    const b = await mountInstance(driver, "ist-b")

    await a.call("storage.set", { key: "nota.txt", value: "segreto di A" })
    expect(await a.call("storage.get", { key: "nota.txt" })).toEqual({ value: "segreto di A" })
    expect(await b.call("storage.get", { key: "nota.txt" })).toEqual({ value: null })
  })

  it("instanceId malformato in deps → il costruttore rifiuta (fail-closed)", () => {
    expect(
      () =>
        new ToolHost(MULTI_MANIFEST, resolveGrant(MULTI_MANIFEST, ["storage"]), {
          store: new MemoryDriver(),
          board: new FakeBoard(),
          instanceId: "../evasione",
        }),
    ).toThrow()
  })
})
