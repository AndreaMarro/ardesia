// TOOLHOST T2-ST3 — capability REALI v0: storage namespaced per-tool (MAI fuori,
// quota dal manifest) e board.* own-embeds (spec §2). Include il criterio T2-d:
// storage cross-tool negato, tentativi loggati.
import { describe, expect, it } from "vitest"
import { ERR } from "../toolhost-protocol/index.ts"
import { ToolStorage, purgeToolStorage, storagePrefix } from "../toolhost/caps/storage.ts"
import type { StorageDriverLike, StorageEntryLike } from "../toolhost/caps/storage.ts"
import { workspaceStore } from "../store/WorkspaceStore.ts"
import { EMBED_DATA_KEY, ToolBoard, embedOwner } from "../toolhost/caps/board.ts"
import type { BoardApiLike, BoardElementLike } from "../toolhost/caps/board.ts"
import { routeRequest } from "../toolhost/router.ts"
import type { AuditEvent } from "../toolhost/audit.ts"

class MemoryDriver implements StorageDriverLike {
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

// ---------- storage: namespace per-tool, MAI fuori ----------

describe("caps/ToolStorage (namespace tools/<id>/storage/, quota dal manifest)", () => {
  it("set/get/delete round-trip; chiave mai scritta → null", async () => {
    const driver = new MemoryDriver()
    const s = new ToolStorage(driver, "com.example.echo", 1)
    expect(await s.get("notes")).toEqual({ value: null })
    await s.set("notes", "ciao")
    expect(await s.get("notes")).toEqual({ value: "ciao" })
    await s.delete("notes")
    expect(await s.get("notes")).toEqual({ value: null })
  })

  it("i path fisici stanno SOTTO tools/<id>/storage/ — il namespace è del host, non del tool", async () => {
    const driver = new MemoryDriver()
    await new ToolStorage(driver, "com.example.echo", 1).set("a/b.json", "{}")
    expect([...driver.files.keys()]).toEqual(["tools/com.example.echo/storage/a/b.json"])
    expect(storagePrefix("com.example.echo")).toBe("tools/com.example.echo/storage/")
    expect(() => storagePrefix("../escape")).toThrow(/invalid tool id/)
  })

  it("due tool sullo STESSO driver, stessa chiave → valori indipendenti (isolamento)", async () => {
    const driver = new MemoryDriver()
    const a = new ToolStorage(driver, "com.a.uno", 1)
    const b = new ToolStorage(driver, "com.b.due", 1)
    await a.set("config", "di-a")
    expect(await b.get("config")).toEqual({ value: null })
    await b.set("config", "di-b")
    expect(await a.get("config")).toEqual({ value: "di-a" })
    await b.delete("config")
    expect(await a.get("config")).toEqual({ value: "di-a" })
  })

  it("chiavi fuori grammatica (traversal, assolute, vuote, alias '.') → REJECT anche chiamando la classe diretta", async () => {
    const s = new ToolStorage(new MemoryDriver(), "com.example.echo", 1)
    await expect(s.get("../altrui")).rejects.toThrow(/invalid storage key/)
    expect(() => s.set("a/../b", "x")).toThrow(/invalid storage key/)
    expect(() => s.delete("/assoluta")).toThrow(/invalid storage key/)
    expect(() => s.set("a//b", "x")).toThrow(/invalid storage key/)
    expect(() => s.set("a/./b", "x")).toThrow(/invalid storage key/)
  })

  it("il workspaceStore REALE soddisfa StorageDriverLike: wiring diretto, senza adapter", () => {
    workspaceStore satisfies StorageDriverLike
  })

  it("list: chiavi RELATIVE ordinate, filtro prefix, mai il path fisico", async () => {
    const driver = new MemoryDriver()
    const s = new ToolStorage(driver, "com.example.echo", 1)
    await s.set("b.txt", "2")
    await s.set("a/uno.txt", "1")
    await s.set("a/due.txt", "3")
    await new ToolStorage(driver, "com.altro.tool", 1).set("a/suo.txt", "x")
    expect(await s.list()).toEqual({ keys: ["a/due.txt", "a/uno.txt", "b.txt"] })
    expect(await s.list("a/")).toEqual({ keys: ["a/due.txt", "a/uno.txt"] })
  })

  it("quota dal manifest: superarla rigetta, l'overwrite conta il RIMPIAZZO non la somma", async () => {
    const s = new ToolStorage(new MemoryDriver(), "com.example.echo", 1)
    await expect(s.set("troppo", "x".repeat(1024 * 1024 + 1))).rejects.toThrow(/quota exceeded/)
    await s.set("big", "a".repeat(1_000_000))
    // overwrite della STESSA chiave: il vecchio valore non conta nel computo
    await s.set("big", "b".repeat(1_000_000))
    // ma una chiave NUOVA che sfora il totale rigetta — e non scrive nulla
    await expect(s.set("extra", "c".repeat(100_000))).rejects.toThrow(/quota exceeded/)
    expect(await s.get("extra")).toEqual({ value: null })
    expect((await s.get("big")).value).toBe("b".repeat(1_000_000))
  })

  it("set CONCORRENTI: la quota tiene anche con check/write interlacciati (mutazioni serializzate)", async () => {
    const driver = new MemoryDriver()
    const s = new ToolStorage(driver, "com.example.echo", 1)
    const results = await Promise.allSettled([s.set("k1", "x".repeat(900_000)), s.set("k2", "x".repeat(900_000))])
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1)
    expect(results.filter((r) => r.status === "rejected")).toHaveLength(1)
    let total = 0
    for (const blob of driver.files.values()) total += blob.size
    expect(total).toBeLessThanOrEqual(1024 * 1024)
  })

  it("anche le chiavi pesano: valanga di chiavi a valore vuoto → quota, non crescita libera", async () => {
    const s = new ToolStorage(new MemoryDriver(), "com.example.echo", 1)
    await s.set("k1", "x".repeat(1024 * 1024 - 2048))
    await s.set("k2", "") // arriva esattamente al tetto
    await expect(s.set("k3", "")).rejects.toThrow(/quota exceeded/)
  })

  it("uninstall: purge svuota SOLO storage/, l'audit dello stesso tool sopravvive", async () => {
    const driver = new MemoryDriver()
    const s = new ToolStorage(driver, "com.example.echo", 1)
    await s.set("k1", "v1")
    await s.set("k2", "v2")
    driver.files.set("tools/com.example.echo/audit.jsonl", new Blob(['{"v":1}\n']))
    await new ToolStorage(driver, "com.altro.tool", 1).set("suo", "x")
    const removed = await purgeToolStorage(driver, "com.example.echo")
    expect(removed).toBe(2)
    expect(await s.list()).toEqual({ keys: [] })
    expect(driver.files.has("tools/com.example.echo/audit.jsonl")).toBe(true)
    expect([...driver.files.keys()]).toContain("tools/com.altro.tool/storage/suo")
  })
})

// ---------- board: read scene/selection, write own-embeds ----------

describe("caps/ToolBoard (lettura scena/selezione, embed con ownership in customData)", () => {
  it("read scene → tutti gli elementi; read selection → solo i selezionati", () => {
    const api = new FakeBoard()
    api.elements = [
      { id: "e1", type: "rectangle" },
      { id: "e2", type: "text" },
    ]
    api.selected = { e2: true }
    const board = new ToolBoard(api, "com.example.echo")
    expect(board.read("scene").elements).toHaveLength(2)
    expect(board.read("selection").elements).toEqual([{ id: "e2", type: "text" }])
  })

  it("write su id libero CREA l'embed marcato con owner e state", () => {
    const api = new FakeBoard()
    api.elements = [{ id: "preesistente", type: "rectangle" }]
    const board = new ToolBoard(api, "com.example.echo")
    board.write("embed-1", { count: 3 })
    expect(api.elements).toHaveLength(2)
    const embed = api.elements.find((el) => el.id === "embed-1")!
    expect(embedOwner(embed)).toBe("com.example.echo")
    expect((embed.customData?.[EMBED_DATA_KEY] as { state: unknown }).state).toEqual({ count: 3 })
  })

  it("write sul PROPRIO embed aggiorna lo state senza mutare l'array originale", () => {
    const api = new FakeBoard()
    const board = new ToolBoard(api, "com.example.echo")
    board.write("embed-1", { count: 1 })
    const before = api.elements
    board.write("embed-1", { count: 2 })
    expect(api.elements).toHaveLength(1)
    expect((api.elements[0]!.customData?.[EMBED_DATA_KEY] as { state: unknown }).state).toEqual({ count: 2 })
    // immutabilità: l'array consegnato prima non è stato toccato in place
    expect((before[0]!.customData?.[EMBED_DATA_KEY] as { state: unknown }).state).toEqual({ count: 1 })
  })

  it("isOwnEmbed: id libero sì, proprio sì, di un ALTRO tool no, elemento del docente no", () => {
    const api = new FakeBoard()
    api.elements = [
      { id: "altrui", customData: { [EMBED_DATA_KEY]: { owner: "com.altro.tool", state: null } } },
      { id: "del-docente", type: "freedraw" },
    ]
    const board = new ToolBoard(api, "com.example.echo")
    expect(board.isOwnEmbed("nuovo")).toBe(true)
    board.write("mio", {})
    expect(board.isOwnEmbed("mio")).toBe(true)
    expect(board.isOwnEmbed("altrui")).toBe(false)
    expect(board.isOwnEmbed("del-docente")).toBe(false)
  })

  it("write su embed altrui o su elemento del docente → REJECT (difesa oltre il router)", () => {
    const api = new FakeBoard()
    api.elements = [
      { id: "altrui", customData: { [EMBED_DATA_KEY]: { owner: "com.altro.tool", state: null } } },
      { id: "del-docente", type: "freedraw" },
    ]
    const board = new ToolBoard(api, "com.example.echo")
    expect(() => board.write("altrui", {})).toThrow(/not owned/)
    expect(() => board.write("del-docente", {})).toThrow(/not owned/)
    expect(api.elements).toHaveLength(2)
  })

  it("skeleton iniettato: usato per i nuovi embed, ma id e marker restano dell'host", () => {
    const api = new FakeBoard()
    const board = new ToolBoard(api, "com.example.echo", () => ({
      id: "ignorato",
      type: "embeddable",
      x: 9,
      customData: { [EMBED_DATA_KEY]: { owner: "spoofed", state: "evil" } },
    }))
    board.write("embed-1", { ok: true })
    const embed = api.elements[0]!
    expect(embed.id).toBe("embed-1")
    expect(embed.x).toBe(9)
    expect(embedOwner(embed)).toBe("com.example.echo")
  })

  it("marker malformati (owner non-stringa, customData non-oggetto) → mai owner", () => {
    expect(embedOwner({ id: "a", customData: { [EMBED_DATA_KEY]: { owner: 42 } } })).toBeUndefined()
    expect(embedOwner({ id: "b", customData: { [EMBED_DATA_KEY]: "stringa" } })).toBeUndefined()
    expect(embedOwner({ id: "c" })).toBeUndefined()
  })
})

// ---------- router + capability reali: criterio T2-d ----------

describe("router con capability REALI (criterio T2-d: cross-tool negato e loggato)", () => {
  function wire(driver: MemoryDriver, api: FakeBoard, toolId: string) {
    const storage = new ToolStorage(driver, toolId, 1)
    const board = new ToolBoard(api, toolId)
    const events: AuditEvent[] = []
    const route = (raw: unknown) =>
      routeRequest(raw, {
        grantedCaps: { "board.read": {}, "board.write": { scope: "own-embeds" }, storage: { quotaMB: 1 } },
        handlers: {
          "board.read": (p) => board.read((p as { target: "scene" | "selection" }).target),
          "board.write": (p) => {
            const { embedId, state } = p as { embedId: string; state: unknown }
            return board.write(embedId, state)
          },
          "storage.get": (p) => storage.get((p as { key: string }).key),
          "storage.set": (p) => {
            const { key, value } = p as { key: string; value: string }
            return storage.set(key, value)
          },
          "storage.list": (p) => storage.list((p as { prefix?: string }).prefix),
        },
        isOwnEmbed: board.isOwnEmbed,
        onAudit: (e) => events.push(e),
      })
    return { route, events }
  }

  it("il tool B NON vede lo storage del tool A (stessa chiave → null) e tutto è loggato", async () => {
    const driver = new MemoryDriver()
    const api = new FakeBoard()
    const a = wire(driver, api, "com.a.uno")
    const b = wire(driver, api, "com.b.due")
    await a.route({ jsonrpc: "2.0", id: 1, method: "storage.set", params: { key: "segreto", value: "di-a" } })
    const res = await b.route({ jsonrpc: "2.0", id: 1, method: "storage.get", params: { key: "segreto" } })
    expect(res).toEqual({ jsonrpc: "2.0", id: 1, result: { value: null } })
    expect(a.events).toEqual([{ method: "storage.set", outcome: "ok" }])
    expect(b.events).toEqual([{ method: "storage.get", outcome: "ok" }])
  })

  it("chiave con traversal verso il namespace altrui → INVALID_PARAMS al wire, mai l'handler", async () => {
    const driver = new MemoryDriver()
    const a = wire(driver, new FakeBoard(), "com.a.uno")
    await a.route({ jsonrpc: "2.0", id: 1, method: "storage.set", params: { key: "segreto", value: "di-a" } })
    const b = wire(driver, new FakeBoard(), "com.b.due")
    const res = await b.route({
      jsonrpc: "2.0",
      id: 2,
      method: "storage.get",
      params: { key: "../../com.a.uno/storage/segreto" },
    })
    expect(res).toMatchObject({ error: { code: ERR.INVALID_PARAMS } })
    expect(b.events).toEqual([{ method: "storage.get", outcome: "invalid", code: ERR.INVALID_PARAMS }])
  })

  it("board.write del tool B sull'embed del tool A → CAPABILITY_DENIED + audit denied", async () => {
    const driver = new MemoryDriver()
    const api = new FakeBoard()
    const a = wire(driver, api, "com.a.uno")
    const b = wire(driver, api, "com.b.due")
    await a.route({ jsonrpc: "2.0", id: 1, method: "board.write", params: { embedId: "embed-a", state: { x: 1 } } })
    const res = await b.route({
      jsonrpc: "2.0",
      id: 2,
      method: "board.write",
      params: { embedId: "embed-a", state: { x: 99 } },
    })
    expect(res).toMatchObject({ error: { code: ERR.CAPABILITY_DENIED } })
    expect(b.events).toEqual([{ method: "board.write", outcome: "denied", code: ERR.CAPABILITY_DENIED }])
    // lo stato di A è intatto
    const embed = api.elements.find((el) => el.id === "embed-a")!
    expect((embed.customData?.[EMBED_DATA_KEY] as { state: unknown }).state).toEqual({ x: 1 })
  })

  it("storage.list con prefix ostile (../) NON elenca i namespace altrui", async () => {
    const driver = new MemoryDriver()
    const a = wire(driver, new FakeBoard(), "com.a.uno")
    await a.route({ jsonrpc: "2.0", id: 1, method: "storage.set", params: { key: "segreto", value: "di-a" } })
    const b = wire(driver, new FakeBoard(), "com.b.due")
    const res = await b.route({ jsonrpc: "2.0", id: 2, method: "storage.list", params: { prefix: "../" } })
    expect(res).toEqual({ jsonrpc: "2.0", id: 2, result: { keys: [] } })
  })

  it("bound al wire: embedId chilometrico e state oltre 256KB → INVALID_PARAMS", async () => {
    const a = wire(new MemoryDriver(), new FakeBoard(), "com.a.uno")
    const longId = await a.route({
      jsonrpc: "2.0",
      id: 1,
      method: "board.write",
      params: { embedId: "x".repeat(500), state: {} },
    })
    expect(longId).toMatchObject({ error: { code: ERR.INVALID_PARAMS } })
    const fatState = await a.route({
      jsonrpc: "2.0",
      id: 2,
      method: "board.write",
      params: { embedId: "e1", state: { blob: "x".repeat(300 * 1024) } },
    })
    expect(fatState).toMatchObject({ error: { code: ERR.INVALID_PARAMS } })
    expect(a.events.map((e) => e.outcome)).toEqual(["invalid", "invalid"])
  })

  it("quota sforata via wire → INTERNAL/error nell'audit, valore non scritto", async () => {
    const driver = new MemoryDriver()
    const a = wire(driver, new FakeBoard(), "com.a.uno")
    const res = await a.route({
      jsonrpc: "2.0",
      id: 1,
      method: "storage.set",
      params: { key: "troppo", value: "x".repeat(1024 * 1024 + 1) },
    })
    expect(res).toMatchObject({ error: { code: ERR.INTERNAL, message: expect.stringMatching(/quota/) } })
    expect(a.events).toEqual([{ method: "storage.set", outcome: "error", code: ERR.INTERNAL }])
    expect(driver.files.size).toBe(0)
  })
})
