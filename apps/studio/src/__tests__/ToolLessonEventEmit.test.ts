// @vitest-environment jsdom
//
// lesson.event.emit — write path minimo e controllato verso LessonOS.
// Il plugin non scrive il grafo: appende eventi con evidenza nel log, da cui
// graph.query/materializer derivano le viste.
import { afterEach, describe, expect, it } from "vitest"
import { ERR, ToolManifestSchema } from "../toolhost-protocol/index.ts"
import type { ToolManifest } from "../toolhost-protocol/index.ts"
import { ToolHost } from "../toolhost/host.ts"
import { readAuditLog } from "../toolhost/audit.ts"
import { resolveGrant } from "../toolhost/policy.ts"
import { InMemoryEventLog } from "../lessonos/eventlog.ts"
import type { EventLogStore } from "../lessonos/eventlog.ts"
import type { StorageDriverLike, StorageEntryLike } from "../toolhost/caps/storage.ts"
import type { AuditStore } from "../toolhost/audit.ts"
import type { BoardApiLike, BoardElementLike } from "../toolhost/caps/board.ts"
import { connectTool } from "../toolsdk/connect.ts"
import type { ToolConnection, WindowLike } from "../toolsdk/connect.ts"
import { materialize } from "../lessonos/materializer.ts"

const LESSON_EVENT_MANIFEST: ToolManifest = ToolManifestSchema.parse({
  manifestVersion: 1,
  id: "com.example.lesson-writer",
  name: "Lesson Writer",
  version: "1.0.0",
  protocol: ">=1.0 <2.0",
  entry: "dist/index.html",
  surfaces: ["panel"],
  capabilities: { "lesson.event.emit": {} },
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

async function mountLessonWriter(opts: {
  approved?: boolean
  lessonEventLog?: EventLogStore
  instanceId?: string
  /** Iniettabile per leggere l'audit-log DOPO la chiamata (stesso store dell'host). */
  store?: MemoryWorkspace
  /** L'audit è fire-and-forget: serve l'host per aspettarne il flush con idle(). */
  onHost?: (host: ToolHost) => void
}): Promise<ToolConnection> {
  const host = new ToolHost(
    LESSON_EVENT_MANIFEST,
    resolveGrant(LESSON_EVENT_MANIFEST, opts.approved === false ? [] : ["lesson.event.emit"]),
    {
      store: opts.store ?? new MemoryWorkspace(),
      board: new FakeBoard(),
      bearerToken: "bearer-test-1234",
      ...(opts.lessonEventLog === undefined ? {} : { lessonEventLog: opts.lessonEventLog }),
      ...(opts.instanceId === undefined ? {} : { instanceId: opts.instanceId }),
    },
  )
  opts.onHost?.(host)
  const ch = new MessageChannel()
  openChannels.push(ch)
  const session = host.mount(ch.port1)
  const win = new FakeToolWindow()
  const connPromise = connectTool({ windowRef: win })
  win.deliver(session.hello, [ch.port2])
  return connPromise
}

describe("ToolHost end-to-end: lesson.event.emit via SDK reale", () => {
  it("appende error.observed nel log LessonOS e ritorna il seq", async () => {
    const log = new InMemoryEventLog()
    const conn = await mountLessonWriter({ lessonEventLog: log })

    const res = await conn.call("lesson.event.emit", {
      event: {
        kind: "error.observed",
        errorId: "errore:polarita-led",
        conceptId: "concetto:circuito-led",
        labels: { it: "LED montato al contrario" },
        evidence: ["board:led-1"],
        t: 1718000000000,
      },
    })

    expect(res).toEqual({ seq: 1 })
    expect(await log.readAll()).toEqual([
      expect.objectContaining({
        seq: 1,
        kind: "error.observed",
        errorId: "errore:polarita-led",
        evidence: ["board:led-1"],
      }),
    ])
    conn.close()
  })

  it("appende material.cited con evidenza manuale", async () => {
    const log = new InMemoryEventLog()
    const conn = await mountLessonWriter({ lessonEventLog: log })

    await expect(
      conn.call("lesson.event.emit", {
        event: {
          kind: "material.cited",
          materialId: "materiale:vol1-p30",
          conceptId: "concetto:circuito-led",
          labels: { it: "Volume 1, pagina 30" },
          evidence: ["manual:vol1:p30"],
          t: 1718000001000,
        },
      }),
    ).resolves.toEqual({ seq: 1 })
    expect((await log.readAll())[0]?.kind).toBe("material.cited")
    conn.close()
  })

  it("appende lesson.started/ended dal plugin con evidence, senza scrivere il grafo direttamente", async () => {
    const log = new InMemoryEventLog()
    const conn = await mountLessonWriter({ lessonEventLog: log })

    await expect(
      conn.call("lesson.event.emit", {
        event: {
          kind: "lesson.started",
          room: "lezione-led",
          evidence: ["lesson:lezione-led@1718000000000"],
          t: 1718000000000,
        },
      }),
    ).resolves.toEqual({ seq: 1 })
    await expect(
      conn.call("lesson.event.emit", {
        event: {
          kind: "lesson.ended",
          room: "lezione-led",
          evidence: ["lesson:lezione-led@1718003600000"],
          t: 1718003600000,
        },
      }),
    ).resolves.toEqual({ seq: 2 })

    const graph = materialize(await log.readAll())
    expect(graph.nodes.get("lesson:lezione-led")).toMatchObject({
      kind: "lesson",
      labels: { und: "lezione-led" },
      evidenceRefs: [
        "lesson:lezione-led@1718000000000",
        "lesson:lezione-led@1718003600000",
      ],
    })
    conn.close()
  })

  it("appende simulation.step.completed e il grafo deriva lo step come esercizio citante il concetto", async () => {
    const log = new InMemoryEventLog()
    const conn = await mountLessonWriter({ lessonEventLog: log })

    await expect(
      conn.call("lesson.event.emit", {
        event: {
          kind: "simulation.step.completed",
          stepId: "step:v1-cap6-esp1:2",
          sceneId: "scene:v1-cap6-esp1",
          experimentId: "v1-cap6-esp1",
          conceptId: "concetto:circuito-led",
          labels: { it: "Collega il resistore al positivo" },
          evidence: [
            "plugin:io.ardesia.simulation@2.0.0",
            "scene:v1-cap6-esp1@candidate",
            "board:sim-postit-1",
          ],
          t: 1718000002000,
        },
      }),
    ).resolves.toEqual({ seq: 1 })

    const graph = materialize(await log.readAll())
    expect(graph.nodes.get("step:v1-cap6-esp1:2")).toMatchObject({
      kind: "esercizio",
      labels: { it: "Collega il resistore al positivo" },
      evidenceRefs: [
        "plugin:io.ardesia.simulation@2.0.0",
        "scene:v1-cap6-esp1@candidate",
        "board:sim-postit-1",
      ],
    })
    expect(graph.edges).toContainEqual(
      expect.objectContaining({
        from: "step:v1-cap6-esp1:2",
        kind: "cita",
        to: "concetto:circuito-led",
      }),
    )
    conn.close()
  })

  it("senza grant → CAPABILITY_DENIED e il log resta intatto", async () => {
    const log = new InMemoryEventLog()
    const conn = await mountLessonWriter({ approved: false, lessonEventLog: log })

    await expect(
      conn.call("lesson.event.emit", {
        event: {
          kind: "error.observed",
          errorId: "errore:polarita-led",
          conceptId: "concetto:circuito-led",
          labels: { it: "LED montato al contrario" },
          evidence: ["board:led-1"],
          t: 1718000000000,
        },
      }),
    ).rejects.toMatchObject({ code: ERR.CAPABILITY_DENIED })
    expect(await log.readAll()).toEqual([])
    conn.close()
  })

  it("senza evidence → INVALID_PARAMS prima dell'handler", async () => {
    const log = new InMemoryEventLog()
    const conn = await mountLessonWriter({ lessonEventLog: log })

    await expect(
      conn.call("lesson.event.emit", {
        event: {
          kind: "error.observed",
          errorId: "errore:polarita-led",
          conceptId: "concetto:circuito-led",
          labels: { it: "LED montato al contrario" },
          t: 1718000000000,
        },
      }),
    ).rejects.toMatchObject({ code: ERR.INVALID_PARAMS })
    expect(await log.readAll()).toEqual([])
    conn.close()
  })

  // L'identità di ISTANZA è HOST-side e "non esiste sul wire" (ToolHostDeps.instanceId
  // e caps/instance.ts lo dichiarano entrambi). `plugin.mounted` però PORTA
  // pluginId/instanceId nei suoi params, quindi senza un gate di ownership un tool
  // montato può dichiararsi un'ALTRA istanza — o un ALTRO plugin — e la provenienza
  // per-istanza di LessonOS diventa un'affermazione dell'attore non fidato.
  // Stessa classe di board.write fuori dagli own-embeds, quindi stesso codice.
  const pluginMountedBy = (pluginId: string, instanceId: string) => ({
    kind: "plugin.mounted" as const,
    pluginId,
    pluginKind: "panel",
    instanceId,
    room: "lezione-led",
    labels: { it: "Post-it vivo" },
    evidence: ["plugin:com.example.lesson-writer@1.0.0"],
    t: 1718000000000,
  })

  it("plugin.mounted con la PROPRIA identità → appeso (il gate non è un divieto)", async () => {
    const log = new InMemoryEventLog()
    const conn = await mountLessonWriter({ lessonEventLog: log, instanceId: "sim-a" })

    await expect(
      conn.call("lesson.event.emit", { event: pluginMountedBy(LESSON_EVENT_MANIFEST.id, "sim-a") }),
    ).resolves.toEqual({ seq: 1 })
    expect((await log.readAll())[0]).toMatchObject({ kind: "plugin.mounted", instanceId: "sim-a" })
    conn.close()
  })

  it("plugin.mounted con l'identità di un'ALTRA istanza → CAPABILITY_DENIED, log intatto", async () => {
    const log = new InMemoryEventLog()
    const conn = await mountLessonWriter({ lessonEventLog: log, instanceId: "sim-a" })

    await expect(
      conn.call("lesson.event.emit", { event: pluginMountedBy(LESSON_EVENT_MANIFEST.id, "sim-b") }),
    ).rejects.toMatchObject({ code: ERR.CAPABILITY_DENIED })
    expect(await log.readAll()).toEqual([])
    conn.close()
  })

  it("plugin.mounted a nome di un ALTRO plugin → CAPABILITY_DENIED, log intatto", async () => {
    const log = new InMemoryEventLog()
    const conn = await mountLessonWriter({ lessonEventLog: log, instanceId: "sim-a" })

    await expect(
      conn.call("lesson.event.emit", { event: pluginMountedBy("io.ardesia.simulation", "sim-a") }),
    ).rejects.toMatchObject({ code: ERR.CAPABILITY_DENIED })
    expect(await log.readAll()).toEqual([])
    conn.close()
  })

  it("host SENZA identità di istanza → plugin.mounted negato (deny-by-default)", async () => {
    const log = new InMemoryEventLog()
    const conn = await mountLessonWriter({ lessonEventLog: log })

    await expect(
      conn.call("lesson.event.emit", { event: pluginMountedBy(LESSON_EVENT_MANIFEST.id, "sim-a") }),
    ).rejects.toMatchObject({ code: ERR.CAPABILITY_DENIED })
    expect(await log.readAll()).toEqual([])
    conn.close()
  })

  it("il tentativo di forgiatura entra nell'audit come `denied`, non come errore interno", async () => {
    const log = new InMemoryEventLog()
    const store = new MemoryWorkspace()
    let host: ToolHost | undefined
    const conn = await mountLessonWriter({
      lessonEventLog: log,
      instanceId: "sim-a",
      store,
      onHost: (h) => {
        host = h
      },
    })

    await expect(
      conn.call("lesson.event.emit", { event: pluginMountedBy(LESSON_EVENT_MANIFEST.id, "sim-b") }),
    ).rejects.toMatchObject({ code: ERR.CAPABILITY_DENIED })

    // Il rifiuto deve essere LEGGIBILE da chi insegna: `denied` è la categoria di
    // "ha chiesto qualcosa che non gli è concesso". Con INVALID_PARAMS l'audit
    // direbbe `invalid`, cioè "il plugin ha sbagliato la forma" — un tentativo di
    // dichiararsi un'altra istanza sparirebbe fra gli errori di battitura.
    await host?.audit.idle()
    const { entries, malformed } = await readAuditLog(store, LESSON_EVENT_MANIFEST.id)
    expect(malformed).toBe(0)
    expect(entries.at(-1)).toMatchObject({
      tool: LESSON_EVENT_MANIFEST.id,
      method: "lesson.event.emit",
      outcome: "denied",
      code: ERR.CAPABILITY_DENIED,
    })
    conn.close()
  })

  it("host senza log NÉ identità (forma ToolLab): plugin.mounted nega prima di rivelare il wiring", async () => {
    // Cambio di comportamento DELIBERATO introdotto col gate, fissato qui perché
    // non resti incidentale: prima questa forma rispondeva INTERNAL "method not
    // wired". ToolLab concede tutte le capability dichiarate dal manifest — e il
    // manifest della simulazione dichiara lesson.event.emit — senza iniettare né
    // lessonEventLog né instanceId. Negare prima del dispatch è la scelta
    // fail-closed: non si rivela lo stato di cablaggio dell'host a chi non è
    // comunque autorizzato a dichiarare quell'identità.
    const conn = await mountLessonWriter({})

    await expect(
      conn.call("lesson.event.emit", { event: pluginMountedBy(LESSON_EVENT_MANIFEST.id, "sim-a") }),
    ).rejects.toMatchObject({ code: ERR.CAPABILITY_DENIED })
    conn.close()
  })

  it("host senza lessonEventLog → INTERNAL method not wired", async () => {
    const conn = await mountLessonWriter({})
    await expect(
      conn.call("lesson.event.emit", {
        event: {
          kind: "material.cited",
          materialId: "materiale:vol1-p30",
          labels: { it: "Volume 1, pagina 30" },
          evidence: ["manual:vol1:p30"],
          t: 1718000001000,
        },
      }),
    ).rejects.toMatchObject({ code: ERR.INTERNAL })
    conn.close()
  })
})
