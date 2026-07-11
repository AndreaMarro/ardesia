// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import KnowledgeExplorerView, {
  buildKnowledgeExplorerSnapshot,
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
})
