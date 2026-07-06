// @vitest-environment jsdom
//
// P0-D — capability graph.query READ-ONLY: la vista wire sul grafo LessonOS
// è SEMPRE derivata on-demand dall'event-log (materializer), mai un secondo
// store. Unit su ToolGraph con eventi REALI + end-to-end su ToolHost via SDK
// (connectTool su MessageChannel, stesso harness di ToolHostE2E).
import { afterEach, describe, expect, it } from "vitest"
import { ERR, ToolManifestSchema } from "../toolhost-protocol/index.ts"
import type { ToolManifest } from "../toolhost-protocol/index.ts"
import { ToolGraph } from "../toolhost/caps/graph.ts"
import type { EventLogReadLike } from "../toolhost/caps/graph.ts"
import { ToolHost } from "../toolhost/host.ts"
import { resolveGrant } from "../toolhost/policy.ts"
import { InMemoryEventLog } from "../lessonos/eventlog.ts"
import type { StorageDriverLike, StorageEntryLike } from "../toolhost/caps/storage.ts"
import type { AuditStore } from "../toolhost/audit.ts"
import type { BoardApiLike, BoardElementLike } from "../toolhost/caps/board.ts"
import { connectTool } from "../toolsdk/connect.ts"
import type { ToolConnection, WindowLike } from "../toolsdk/connect.ts"

// ---------- fixture: event-log REALE (lezione ohm minimale) ----------

async function seededLog(): Promise<InMemoryEventLog> {
  const log = new InMemoryEventLog()
  await log.append({
    kind: "concept.introduced",
    conceptId: "concetto:legge-ohm",
    labels: { it: "Legge di Ohm" },
    evidence: ["manual:vol1:p30"],
    t: 1000,
  })
  await log.append({
    kind: "material.cited",
    materialId: "materiale:vol1-p30",
    conceptId: "concetto:legge-ohm",
    labels: { it: "Volume 1, pagina 30" },
    evidence: ["manual:vol1:p30"],
    t: 2000,
  })
  await log.append({
    kind: "error.observed",
    errorId: "errore:polarita-led",
    conceptId: "concetto:legge-ohm",
    labels: { it: "LED montato al contrario" },
    evidence: ["board:elem-led-1"],
    t: 3000,
  })
  await log.append({
    kind: "error.observed",
    errorId: "errore:resistenza-mancante",
    conceptId: "concetto:legge-ohm",
    labels: { it: "Resistenza dimenticata" },
    evidence: ["board:elem-r-1"],
    t: 3500,
  })
  await log.append({
    kind: "exercise.completed",
    exerciseId: "esercizio:rimonta-led",
    correctsErrorId: "errore:polarita-led",
    labels: { it: "Rimonta il LED" },
    evidence: ["board:elem-led-2"],
    t: 4000,
  })
  return log
}

// ---------- unit: ToolGraph su event-log reale ----------

describe("caps/ToolGraph (vista derivata, read-only)", () => {
  it("summary: conteggi nodi/archi reali + errori non corretti", async () => {
    const graph = new ToolGraph(await seededLog())
    const res = await graph.query({ select: "summary" })
    expect(res.summary?.nodeCounts).toEqual({ concetto: 1, materiale: 1, errore: 2, esercizio: 1 })
    // cita (materiale→concetto) + deriva-da ×2 + corregge errore + corregge concetto propagato
    expect(res.summary?.edgeCounts).toEqual({ cita: 1, "deriva-da": 2, corregge: 2 })
    expect(res.summary?.uncorrectedErrors).toBe(1)
    expect(res.total).toBe(5) // 5 nodi nel grafo
  })

  it("nodes con filtro kind: il nodo errore corretto porta correctedAt dall'evento reale", async () => {
    const graph = new ToolGraph(await seededLog())
    const res = await graph.query({ select: "nodes", kind: "errore" })
    expect(res.total).toBe(2)
    const corretto = res.nodes?.find((n) => n.id === "errore:polarita-led")
    expect(corretto?.correctedAt).toBe(4000)
    expect(corretto?.labels).toEqual({ it: "LED montato al contrario" })
    expect(corretto?.evidenceRefs).toContain("board:elem-led-1")
    const aperto = res.nodes?.find((n) => n.id === "errore:resistenza-mancante")
    expect(aperto?.correctedAt).toBeUndefined()
  })

  it("edges kind corregge: include la propagazione esercizio→concetto del materializer", async () => {
    const graph = new ToolGraph(await seededLog())
    const res = await graph.query({ select: "edges", kind: "corregge" })
    expect(res.total).toBe(2)
    expect(res.edges).toContainEqual(
      expect.objectContaining({ from: "esercizio:rimonta-led", to: "errore:polarita-led", kind: "corregge" }),
    )
    expect(res.edges).toContainEqual(
      expect.objectContaining({ from: "esercizio:rimonta-led", to: "concetto:legge-ohm", kind: "corregge" }),
    )
  })

  it("limit tronca la risposta ma total resta il conteggio pieno", async () => {
    const graph = new ToolGraph(await seededLog())
    const res = await graph.query({ select: "nodes", limit: 1 })
    expect(res.nodes).toHaveLength(1)
    expect(res.total).toBe(5)
  })

  it("read-only strutturale: consuma SOLO readAll, il log resta intatto", async () => {
    const log = await seededLog()
    const before = (await log.readAll()).length
    let reads = 0
    const readOnlyView: EventLogReadLike = {
      readAll: () => ((reads += 1), log.readAll()),
    }
    const graph = new ToolGraph(readOnlyView)
    await graph.query({ select: "summary" })
    await graph.query({ select: "nodes" })
    expect(reads).toBe(2) // on-demand a ogni query: nessuna cache = nessun secondo store
    expect((await log.readAll()).length).toBe(before)
  })

  it("log vuoto → risposta vuota ben formata, non errore", async () => {
    const graph = new ToolGraph(new InMemoryEventLog())
    const res = await graph.query({ select: "summary" })
    expect(res.total).toBe(0)
    expect(res.summary?.nodeCounts).toEqual({})
    expect(res.summary?.uncorrectedErrors).toBe(0)
  })
})

// ---------- end-to-end: ToolHost + SDK reale ----------

const GRAPH_MANIFEST: ToolManifest = ToolManifestSchema.parse({
  manifestVersion: 1,
  id: "com.example.conceptviewer",
  name: "Concept Viewer",
  version: "1.0.0",
  protocol: ">=1.0 <2.0",
  entry: "dist/index.html",
  surfaces: ["panel"],
  capabilities: { "graph.query": {} },
  publisher: { id: "example", pubkey: "ed25519:AAAA" },
  privacy: { dataOut: "none" },
})

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

async function mountGraphTool(eventLog?: EventLogReadLike): Promise<ToolConnection> {
  const host = new ToolHost(GRAPH_MANIFEST, resolveGrant(GRAPH_MANIFEST, ["graph.query"]), {
    store: new MemoryWorkspace(),
    board: new FakeBoard(),
    bearerToken: "bearer-test-1234",
    ...(eventLog === undefined ? {} : { eventLog }),
  })
  const ch = new MessageChannel()
  openChannels.push(ch)
  const session = host.mount(ch.port1)
  const win = new FakeToolWindow()
  const connPromise = connectTool({ windowRef: win })
  win.deliver(session.hello, [ch.port2])
  return connPromise
}

describe("ToolHost end-to-end: graph.query via SDK reale", () => {
  it("con event-log iniettato risponde dati REALI derivati dagli eventi", async () => {
    const conn = await mountGraphTool(await seededLog())
    const res = (await conn.call("graph.query", { select: "nodes", kind: "concetto" })) as {
      total: number
      nodes: Array<{ id: string; labels: Record<string, string> }>
    }
    expect(res.total).toBe(1)
    expect(res.nodes[0].id).toBe("concetto:legge-ohm")
    expect(res.nodes[0].labels).toEqual({ it: "Legge di Ohm" })
    conn.close()
  })

  it("host SENZA event-log → INTERNAL method not wired (mai silenzio)", async () => {
    const conn = await mountGraphTool(undefined)
    await expect(conn.call("graph.query", { select: "summary" })).rejects.toMatchObject({
      code: ERR.INTERNAL,
    })
    conn.close()
  })
})
