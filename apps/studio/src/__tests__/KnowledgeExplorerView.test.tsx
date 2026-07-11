// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import KnowledgeExplorerView, {
  buildKnowledgeExplorerSnapshot,
  filterKnowledgeExplorerGraph,
  selectRoomSession,
} from "../design/KnowledgeExplorerView"
import { InMemoryEventLog, type AppendedEvent, type LessonOsEvent } from "../lessonos/eventlog"

afterEach(() => {
  cleanup()
})

async function appendEvents(events: readonly LessonOsEvent[]): Promise<AppendedEvent[]> {
  const log = new InMemoryEventLog()
  for (const event of events) await log.append(event)
  return log.readAll()
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined
  const promise = new Promise<T>((complete) => {
    resolve = complete
  })
  return { promise, resolve }
}

async function eventsForRoom(room: string, conceptId: string, label: string): Promise<AppendedEvent[]> {
  return appendEvents([
    { kind: "lesson.started", room, t: 1, evidence: [`lesson:${room}@1`] },
    { kind: "concept.introduced", conceptId, labels: { it: label }, t: 2, evidence: [`manual:${conceptId}`] },
    { kind: "lesson.ended", room, t: 3, evidence: [`lesson:${room}@3`] },
  ])
}

const EVENTS: LessonOsEvent[] = [
  { kind: "lesson.started", room: "led-room", t: 100, evidence: ["lesson:led-room@100"] },
  {
    kind: "simulation.circuit.solved",
    experimentId: "v1-cap6-esp1",
    currentMa: 15.3,
    bookLayoutValid: true,
    labels: { it: "Circuito risolto: 15.3 mA" },
    t: 120,
    evidence: ["simulation:scene:v1-cap6-esp1"],
  },
  {
    kind: "simulation.error.observed",
    errorId: "sim-error:v1-cap6-esp1:open-circuit",
    conceptId: "circuito-serie",
    experimentId: "v1-cap6-esp1",
    labels: { it: "Circuito aperto" },
    t: 130,
    evidence: ["simulation:scene:v1-cap6-esp1"],
  },
  { kind: "lesson.ended", room: "led-room", t: 140, evidence: ["lesson:led-room@140"] },
  { kind: "lesson.started", room: "altra-room", t: 150, evidence: ["lesson:altra-room@150"] },
  {
    kind: "simulation.circuit.solved",
    experimentId: "other-experiment",
    labels: { it: "Altro circuito" },
    t: 160,
    evidence: ["simulation:scene:other-experiment"],
  },
]

describe("KnowledgeExplorerView", () => {
  it("espone ricerca, filtro livelli, runtime Cytoscape e minimappa", async () => {
    const events = await appendEvents(EVENTS)
    const { container } = render(<KnowledgeExplorerView deps={{ room: "led-room", loadEvents: async () => events }} />)

    await screen.findByRole("searchbox", { name: "Cerca nel grafo" })

    expect(screen.getByRole("combobox", { name: "Livelli" })).toBeTruthy()
    expect(container.querySelector("[data-knowledge-minimap]")).toBeTruthy()
    expect(container.querySelector("[data-cytoscape-graph]")).toBeTruthy()
  })

  it("filtra solo nodi materializzati e mantiene onesto un risultato vuoto", async () => {
    const events = await appendEvents(EVENTS)
    const { container } = render(<KnowledgeExplorerView deps={{ room: "led-room", loadEvents: async () => events }} />)
    const search = await screen.findByRole("searchbox", { name: "Cerca nel grafo" })

    fireEvent.change(search, { target: { value: "Circuito aperto" } })
    expect(screen.getByRole("button", { name: "Circuito aperto" })).toBeTruthy()
    expect(container.querySelectorAll("[data-zgraph-node]")).toHaveLength(1)

    fireEvent.change(search, { target: { value: "nodo che LessonOS non contiene" } })
    expect(screen.getByText("Nessun nodo corrisponde ai filtri correnti.")).toBeTruthy()
    expect(container.querySelectorAll("[data-zgraph-node]")).toHaveLength(0)
  })

  it("interpreta 1 e 1-2 come livelli visualizzati esatti, lasciando i nodi scollegati al livello 3", () => {
    const snapshot = {
      sessionFound: true,
      events: [],
      evidenceRefs: [],
      nodes: [
        { id: "root", kind: "concept" as const, label: { it: "Radice" }, evidenceRefs: [] },
        { id: "one", kind: "material" as const, label: { it: "Primo" }, evidenceRefs: [] },
        { id: "two", kind: "error" as const, label: { it: "Secondo" }, evidenceRefs: [] },
        { id: "three", kind: "plugin" as const, label: { it: "Terzo" }, evidenceRefs: [] },
        { id: "orphan", kind: "lesson" as const, label: { it: "Scollegato" }, evidenceRefs: [] },
      ],
      edges: [
        { from: "root", to: "one", kind: "cita" as const },
        { from: "one", to: "two", kind: "cita" as const },
        { from: "two", to: "three", kind: "cita" as const },
      ],
    }

    expect(filterKnowledgeExplorerGraph(snapshot, "root", "", "all", "1").nodes.map((node) => node.id)).toEqual(["root"])
    expect(filterKnowledgeExplorerGraph(snapshot, "root", "", "all", "1-2").nodes.map((node) => node.id)).toEqual(["root", "one"])
    expect(filterKnowledgeExplorerGraph(snapshot, "root", "", "all", "all").nodes.map((node) => node.id)).toEqual([
      "root", "one", "two", "three", "orphan",
    ])
  })

  it("restringe il grafo alla sessione della lezione invece di combinare il log globale", async () => {
    const events = await appendEvents(EVENTS)
    const session = selectRoomSession(events, "led-room")
    const snapshot = buildKnowledgeExplorerSnapshot(events, "led-room")

    expect(session.map((event) => event.kind)).toEqual([
      "lesson.started",
      "simulation.circuit.solved",
      "simulation.error.observed",
      "lesson.ended",
    ])
    expect(snapshot.nodes.map((node) => node.id)).toContain("v1-cap6-esp1")
    expect(snapshot.nodes.map((node) => node.id)).not.toContain("lesson:led-room")
    expect(snapshot.nodes.map((node) => node.id)).not.toContain("other-experiment")
    expect(snapshot.nodes.find((node) => node.id === "circuito-serie")?.label).toEqual({ und: "circuito serie" })
    expect(snapshot.evidenceRefs).toEqual([
      "lesson:led-room@100",
      "lesson:led-room@140",
      "simulation:scene:v1-cap6-esp1",
    ])
  })

  it("rende solve, errore ed evidenze dal log reale e consente di cambiare il focus del grafo", async () => {
    const events = await appendEvents(EVENTS)
    render(<KnowledgeExplorerView deps={{ room: "led-room", loadEvents: async () => events }} />)

    expect(await screen.findByText("Circuito risolto: 15.3 mA")).toBeTruthy()
    expect(screen.getAllByText("Circuito aperto").length).toBeGreaterThan(0)
    expect(screen.getAllByText("simulation:scene:v1-cap6-esp1").length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole("button", { name: "Circuito aperto" }))

    await waitFor(() => {
      expect(document.querySelector('[data-testid="zgraph-descriptor"]')?.textContent).toContain("Circuito aperto")
    })
  })

  it("rende nel grafo gli eventi reali di Arduino, tutor e annotazioni", async () => {
    const events = await appendEvents([
      { kind: "lesson.started", room: "plugin-room", t: 1, evidence: ["lesson:plugin-room@1"] },
      {
        kind: "arduino.compile.completed",
        pluginId: "io.ardesia.arduino-toolchain",
        instanceId: "arduino-a",
        boardId: "nano-old",
        fqbn: "arduino:avr:nano:cpu=atmega328old",
        provider: "browser-avr",
        ok: true,
        diagnostic: "Compile completata",
        labels: { it: "Compile Arduino completata" },
        t: 2,
        evidence: ["plugin:io.ardesia.arduino-toolchain@arduino-a"],
      },
      {
        kind: "elabtutor.command.issued",
        pluginId: "io.elab.tutor",
        instanceId: "tutor-a",
        command: "simulation.command",
        targetInstanceId: "sim-a",
        toolchainInstanceId: "arduino-a",
        grounded: true,
        diagnostic: "Mostra il montaggio",
        labels: { it: "Invia comando alla simulazione" },
        t: 3,
        evidence: ["plugin:io.elab.tutor@tutor-a", "plugin:io.ardesia.simulation@sim-a"],
      },
      {
        kind: "plugin.annotation.changed",
        pluginId: "io.ardesia.simulation",
        instanceId: "sim-a",
        operation: "add",
        annotationId: "stroke-1",
        authorRole: "teacher",
        labels: { it: "Annotazione aggiunta" },
        t: 4,
        evidence: ["plugin:io.ardesia.simulation@sim-a"],
      },
    ])
    render(<KnowledgeExplorerView deps={{ room: "plugin-room", loadEvents: async () => events }} />)

    expect(await screen.findByRole("button", { name: "Compile Arduino completata" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Invia comando alla simulazione" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Annotazione aggiunta" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Simulation" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Sketch Arduino" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Guida ELABTutor" })).toBeTruthy()
    expect(screen.queryByRole("button", { name: "plugin-room" })).toBeNull()
  })

  it("ignora il risultato di un caricamento superseded quando la stanza cambia", async () => {
    const roomA = await eventsForRoom("room-a", "concept-a", "Concetto A")
    const roomB = await eventsForRoom("room-b", "concept-b", "Concetto B")
    const first = deferred<readonly AppendedEvent[]>()
    const second = deferred<readonly AppendedEvent[]>()
    let calls = 0
    const loadEvents = () => (calls++ === 0 ? first.promise : second.promise)
    const view = render(<KnowledgeExplorerView deps={{ room: "room-a", loadEvents }} />)

    view.rerender(<KnowledgeExplorerView deps={{ room: "room-b", loadEvents }} />)
    second.resolve(roomB)

    expect(await screen.findByRole("button", { name: "Concetto B" })).toBeTruthy()
    first.resolve(roomA)

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Concetto A" })).toBeNull()
      expect(screen.getByRole("button", { name: "Concetto B" })).toBeTruthy()
    })
  })

  it("replaces focus with a valid concept when a room refresh removes the focused node", async () => {
    const events = await appendEvents([
      { kind: "lesson.started", room: "room-a", t: 1, evidence: ["lesson:room-a@1"] },
      { kind: "concept.introduced", conceptId: "concept-a", labels: { it: "Concetto A" }, t: 2, evidence: ["manual:concept-a"] },
      { kind: "error.observed", errorId: "error-a", conceptId: "concept-a", labels: { it: "Errore A" }, t: 3, evidence: ["board:error-a"] },
      { kind: "lesson.ended", room: "room-a", t: 4, evidence: ["lesson:room-a@4"] },
      { kind: "lesson.started", room: "room-b", t: 5, evidence: ["lesson:room-b@5"] },
      { kind: "concept.introduced", conceptId: "concept-b", labels: { it: "Concetto B" }, t: 6, evidence: ["manual:concept-b"] },
      { kind: "lesson.ended", room: "room-b", t: 7, evidence: ["lesson:room-b@7"] },
    ])
    const loadEvents = async () => events
    const view = render(<KnowledgeExplorerView deps={{ room: "room-a", loadEvents }} />)

    const error = await screen.findByRole("button", { name: "Errore A" })
    fireEvent.click(error)
    expect(error.getAttribute("aria-pressed")).toBe("true")

    view.rerender(<KnowledgeExplorerView deps={{ room: "room-b", loadEvents }} />)

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Concetto B" }).getAttribute("aria-pressed")).toBe("true")
      expect(screen.queryByRole("button", { name: "Errore A" })).toBeNull()
    })
  })
})
