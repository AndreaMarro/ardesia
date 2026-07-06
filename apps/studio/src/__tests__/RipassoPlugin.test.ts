// @vitest-environment jsdom
//
// TERZO plugin concreto di riferimento — "Ripasso errori": PRIMO CONSUMATORE
// reale della capability graph.query (P0-D, contratto 1.1.0). Stressa la
// capability singola graph.query: sola lettura del grafo LessonOS derivato
// dall'event-log — niente board, niente storage (least-privilege estremo).
// Il modello vive in plugins/ripasso/ripasso.ts (puro); main.ts fa SOLO il
// ponte grafo ⇄ modello via src/sdk. Dati SEMPRE reali: fixture = eventi
// LessonOS veri su InMemoryEventLog, mai oggetti-grafo inventati.
import { afterEach, describe, expect, it } from "vitest"
import { start } from "../../plugins/ripasso/main.ts"
import { manifest as ripassoManifest } from "../../plugins/ripasso/manifest.ts"
import {
  EMPTY_RIPASSO,
  buildRipasso,
  isRipassoModel,
  renderRipasso,
} from "../../plugins/ripasso/ripasso.ts"
import type { GraphEdgeLike, GraphNodeLike } from "../../plugins/ripasso/ripasso.ts"
import { ToolHost } from "../toolhost/host.ts"
import type { BoardApiLike, BoardElementLike } from "../toolhost/caps/board.ts"
import type { AuditStore } from "../toolhost/audit.ts"
import type { StorageDriverLike, StorageEntryLike } from "../toolhost/caps/storage.ts"
import { resolveGrant } from "../toolhost/policy.ts"
import { CONTRACT, ToolManifestSchema, protocolSatisfies } from "../sdk/index.ts"
import type { CapabilityName, WindowLike } from "../sdk/index.ts"
import { InMemoryEventLog } from "../lessonos/eventlog.ts"

// ---------- fixture dati REALI: stessi eventi della lezione ohm ----------

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
    evidence: ["board:elem-r-1", "manual:vol1:p31"],
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

// ---------- unit: modello puro ----------

const NODES: GraphNodeLike[] = [
  { id: "concetto:legge-ohm", kind: "concetto", labels: { it: "Legge di Ohm" }, evidenceRefs: ["manual:vol1:p30"], introducedAt: 1000 },
  { id: "errore:polarita-led", kind: "errore", labels: { it: "LED montato al contrario" }, evidenceRefs: ["board:elem-led-1"], introducedAt: 3000, correctedAt: 4000 },
  { id: "errore:resistenza-mancante", kind: "errore", labels: { it: "Resistenza dimenticata" }, evidenceRefs: ["board:elem-r-1", "manual:vol1:p31"], introducedAt: 3500 },
]
const EDGES: GraphEdgeLike[] = [
  { from: "errore:polarita-led", to: "concetto:legge-ohm", kind: "deriva-da", introducedAt: 3000, evidenceRefs: ["board:elem-led-1"] },
  { from: "errore:resistenza-mancante", to: "concetto:legge-ohm", kind: "deriva-da", introducedAt: 3500, evidenceRefs: ["board:elem-r-1"] },
]

describe("ripasso.ts (modello puro: errori aperti prima, provenienza verbatim)", () => {
  it("separa aperti/corretti, aperti ordinati per introducedAt, concetti risolti in label", () => {
    const model = buildRipasso(NODES, EDGES)
    expect(model.aperti.map((i) => i.errorId)).toEqual(["errore:resistenza-mancante"])
    expect(model.corretti.map((i) => i.errorId)).toEqual(["errore:polarita-led"])
    const aperto = model.aperti[0]
    expect(aperto.label).toBe("Resistenza dimenticata")
    expect(aperto.concepts).toEqual(["Legge di Ohm"])
    // provenienza VERBATIM dall'event-log: mai riscritta né inventata
    expect(aperto.evidence).toEqual(["board:elem-r-1", "manual:vol1:p31"])
    expect(model.corretti[0].correctedAt).toBe(4000)
  })

  it("nodo errore senza label it degrada all'id; concetto sconosciuto degrada all'id", () => {
    const model = buildRipasso(
      [{ id: "errore:x", kind: "errore", labels: {}, evidenceRefs: ["board:e1"], introducedAt: 1 }],
      [{ from: "errore:x", to: "concetto:ignoto", kind: "deriva-da", introducedAt: 1, evidenceRefs: ["board:e1"] }],
    )
    expect(model.aperti[0].label).toBe("errore:x")
    expect(model.aperti[0].concepts).toEqual(["concetto:ignoto"])
  })

  it("render: gli aperti vengono PRIMA, con fonte citata; modello vuoto = messaggio onesto", () => {
    const lines = renderRipasso(buildRipasso(NODES, EDGES)).lines
    const iAperto = lines.findIndex((l) => l.includes("Resistenza dimenticata"))
    const iCorretto = lines.findIndex((l) => l.includes("LED montato al contrario"))
    expect(iAperto).toBeGreaterThanOrEqual(0)
    expect(iCorretto).toBeGreaterThan(iAperto)
    expect(lines[iAperto]).toContain("manual:vol1:p31")
    expect(renderRipasso(EMPTY_RIPASSO).lines.join(" ")).toMatch(/nessun errore/i)
  })

  it("isRipassoModel accetta il modello e rifiuta spazzatura (guardia restore)", () => {
    expect(isRipassoModel(buildRipasso(NODES, EDGES))).toBe(true)
    expect(isRipassoModel({ v: 2 })).toBe(false)
    expect(isRipassoModel(null)).toBe(false)
  })
})

// ---------- manifest: primo uso reale del gate contract ≥1.1 ----------

describe("manifest ripasso (least-privilege: SOLO graph.query)", () => {
  it("valido contro lo schema; capability = graph.query e nient'altro", () => {
    expect(ToolManifestSchema.safeParse(ripassoManifest).success).toBe(true)
    const declared = Object.keys(ripassoManifest.capabilities)
    expect(declared).toEqual(["graph.query"])
  })

  it("richiede contract >=1.1: il metodo wire esiste solo da 1.1.0", () => {
    expect(ripassoManifest.contract).toBe(">=1.1 <2.0")
    expect(protocolSatisfies(CONTRACT.contractVersion, ripassoManifest.contract ?? "")).toBe(true)
    // falsificabile all'indietro: un host 1.0.x NON soddisfa il range
    expect(protocolSatisfies("1.0.0", ripassoManifest.contract ?? "")).toBe(false)
  })
})

// ---------- e2e: ToolHost reale + event-log reale ----------

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

async function mountRipasso(opts: {
  eventLog?: InMemoryEventLog
  approved?: readonly CapabilityName[]
}): Promise<ReturnType<typeof start>> {
  const host = new ToolHost(
    ripassoManifest,
    resolveGrant(ripassoManifest, opts.approved ?? ["graph.query"]),
    {
      store: new MemoryWorkspace(),
      board: new FakeBoard(),
      bearerToken: "bearer-test-1234",
      ...(opts.eventLog === undefined ? {} : { eventLog: opts.eventLog }),
    },
  )
  const ch = new MessageChannel()
  openChannels.push(ch)
  const session = host.mount(ch.port1)
  const win = new FakeToolWindow()
  const pluginP = start({ windowRef: win })
  win.deliver(session.hello, [ch.port2])
  return pluginP
}

describe("plugin ripasso e2e (ToolHost + event-log REALE)", () => {
  it("legge il grafo via graph.query e produce il ripasso della lezione vera", async () => {
    const plugin = await mountRipasso({ eventLog: await seededLog() })
    const model = await plugin.refresh()
    expect(model.aperti.map((i) => i.errorId)).toEqual(["errore:resistenza-mancante"])
    expect(model.aperti[0].concepts).toEqual(["Legge di Ohm"])
    expect(model.aperti[0].evidence).toContain("manual:vol1:p31")
    expect(model.corretti.map((i) => i.errorId)).toEqual(["errore:polarita-led"])
    const lines = plugin.render().lines
    expect(lines.some((l) => l.includes("Resistenza dimenticata"))).toBe(true)
    plugin.conn.close()
  })

  it("capability NEGATA dal docente → degrada a vuoto, nessun throw", async () => {
    const plugin = await mountRipasso({ eventLog: await seededLog(), approved: [] })
    const model = await plugin.refresh()
    expect(model).toEqual(EMPTY_RIPASSO)
    plugin.conn.close()
  })

  it("host senza event-log cablato → degrada a vuoto (INTERNAL assorbito, mai crash)", async () => {
    const plugin = await mountRipasso({})
    const model = await plugin.refresh()
    expect(model).toEqual(EMPTY_RIPASSO)
    plugin.conn.close()
  })
})
