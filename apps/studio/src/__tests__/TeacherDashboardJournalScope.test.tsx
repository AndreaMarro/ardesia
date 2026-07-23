// @vitest-environment jsdom
//
// Il journal della lavagna è room-scoped da FB-4C2: la vista Continuità deve
// leggerlo da raw/<room>/events.jsonl. Leggendo il path flat raw/events.jsonl
// mostrerebbe nella lezione corrente eventi di un'altra lezione (o niente,
// perché nessun writer scrive più flat) attribuendoli comunque a journalRoom.
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const reads: string[] = []
const files = new Map<string, string>()

vi.mock("../store/WorkspaceStore", () => ({
  workspaceStore: {
    mode: "localStorage",
    init: async () => true,
    read: async (path: string) => {
      reads.push(path)
      const text = files.get(path)
      return text === undefined ? null : new Blob([text])
    },
  },
}))

vi.mock("../toolhost/panelHost", () => ({
  mountRipassoPanel: async () => ({
    plugin: { render: () => ({ lines: [] }), model: () => ({ aperti: [] }) },
    close: () => {},
  }),
}))

const TeacherDashboardView = (await import("../design/TeacherDashboardView")).default
const { InMemoryEventLog } = await import("../lessonos/eventlog")
type LessonOsEvent = import("../lessonos/eventlog").LessonOsEvent
type AppendedEvent = import("../lessonos/eventlog").AppendedEvent

async function appendEvents(events: readonly LessonOsEvent[]): Promise<AppendedEvent[]> {
  const log = new InMemoryEventLog()
  for (const event of events) await log.append(event)
  return log.readAll()
}

const ROOM = "lezione-continuita"
const OTHER = "lezione-altra"

function journalLine(marker: string, t: number): string {
  return `${JSON.stringify({ t, type: "math.insert", latex: marker })}\n`
}

afterEach(() => {
  cleanup()
})

beforeEach(() => {
  reads.length = 0
  files.clear()
  location.hash = `#${ROOM}`
})

describe("Continuità — sorgente del journal", () => {
  it("legge il journal della room corrente, non il path flat", async () => {
    files.set(`raw/${ROOM}/events.jsonl`, journalLine("FORMULA-DI-QUESTA-LEZIONE", 1000))
    files.set("raw/events.jsonl", journalLine("RESIDUO-FLAT-DI-UNALTRA-LEZIONE", 900))

    render(<TeacherDashboardView deps={{ loadEvents: async () => [], appendEvent: async () => {} }} />)
    await waitFor(() => expect(screen.getByText("Statistiche")).toBeTruthy())

    expect(reads).toContain(`raw/${ROOM}/events.jsonl`)
    expect(reads).not.toContain("raw/events.jsonl")
  })

  it("non legge il journal di un'altra lezione quando journalRoom è esplicito", async () => {
    files.set(`raw/${OTHER}/events.jsonl`, journalLine("FORMULA-DI-B", 900))

    render(<TeacherDashboardView deps={{
      loadEvents: async () => [],
      appendEvent: async () => {},
      journalRoom: OTHER,
    }} />)
    await waitFor(() => expect(screen.getByText("Statistiche")).toBeTruthy())

    expect(reads).toContain(`raw/${OTHER}/events.jsonl`)
    expect(reads).not.toContain(`raw/${ROOM}/events.jsonl`)
    expect(reads).not.toContain("raw/events.jsonl")
  })

  it("conta le formule del journal room-scoped, non quelle del residuo flat", async () => {
    files.set(
      `raw/${ROOM}/events.jsonl`,
      journalLine("FORMULA-1", 1200) + journalLine("FORMULA-2", 1300),
    )
    // Tre formule sul path flat: se venissero lette il conteggio sarebbe 3 o 5.
    files.set(
      "raw/events.jsonl",
      journalLine("FLAT-1", 1210) + journalLine("FLAT-2", 1220) + journalLine("FLAT-3", 1230),
    )
    const events = await appendEvents([
      { kind: "lesson.started", room: ROOM, t: 1000, evidence: [`lesson:${ROOM}@1000`] },
      { kind: "lesson.ended", room: ROOM, t: 2000, evidence: [`lesson:${ROOM}@2000`] },
    ])

    render(<TeacherDashboardView deps={{ loadEvents: async () => events, appendEvent: async () => {} }} />)

    const card = await screen.findByTestId("zstat-math.inserts.count")
    expect(card.getAttribute("data-zstat-value")).toBe("2")
  })
})
