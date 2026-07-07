// @vitest-environment jsdom
//
// D10 — prima zona STATISTICHE del cruscotto docente: stat card derivate SOLO
// dall'event-log LessonOS via projectTeacherDashboard (projection read-only,
// mai un secondo store, mai numeri inventati). Il proiettore calcola già
// projection.stats (#100) ma nessuna vista le mostrava.
//
// Onestà: ogni card porta la finestra temporale e le evidenze da cui deriva;
// zero lezioni = zero, dichiarato — mai una card nascosta o un dato finto.

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { InMemoryEventLog, type AppendedEvent, type LessonOsEvent } from "../lessonos/eventlog"
import TeacherDashboardView from "../design/TeacherDashboardView"
import type { JournalEvent } from "../store/JournalRecorder"

afterEach(() => {
  cleanup()
})

async function appendEvents(events: readonly LessonOsEvent[]): Promise<AppendedEvent[]> {
  const log = new InMemoryEventLog()
  for (const ev of events) await log.append(ev)
  return log.readAll()
}

const LESSON_EVENTS: LessonOsEvent[] = [
  { kind: "lesson.started", room: "3b-elab", t: 1000, evidence: ["lesson:3b-elab@1000"] },
  {
    kind: "concept.introduced",
    conceptId: "concetto:ohm",
    labels: { it: "Legge di Ohm" },
    t: 1200,
    evidence: ["manual:vol1:p29"],
  },
  {
    kind: "error.observed",
    errorId: "errore:corto-1",
    conceptId: "concetto:ohm",
    labels: { it: "Corto circuito" },
    t: 1500,
    evidence: ["board:wire9"],
  },
  { kind: "lesson.ended", room: "3b-elab", t: 2000, evidence: ["lesson:3b-elab@2000"] },
]

const JOURNAL_EVENTS: JournalEvent[] = [
  { t: 1250, type: "element.add", element: { id: "resistor-1", type: "rectangle", version: 1 } },
  { t: 1300, type: "math.insert", latex: "V = R I" },
  { t: 1350, type: "pdf.page.view", page: 29, totalPages: 31 },
]

describe("TeacherDashboardView — zona Statistiche (D10, solo event-log)", () => {
  it("mostra le stat del proiettore reale: lezioni ed errori con valore e finestra", async () => {
    const events = await appendEvents(LESSON_EVENTS)
    render(<TeacherDashboardView deps={{ loadEvents: async () => events }} />)

    const lessons = await screen.findByTestId("zstat-lessons.count")
    expect(lessons.getAttribute("data-zstat-value")).toBe("1")
    const errors = await screen.findByTestId("zstat-errors.count")
    expect(errors.getAttribute("data-zstat-value")).toBe("1")

    // etichetta docente (mai la key grezza da sola) + finestra temporale reale
    expect(lessons.textContent).toContain("Lezioni")
    expect(lessons.textContent).toContain("1")
    const zona = document.querySelector("[data-zstat]")
    expect(zona).not.toBeNull()
  })

  it("passa il journal reale al projector: elementi, formule e pagine diventano grafici", async () => {
    const events = await appendEvents(LESSON_EVENTS)
    render(
      <TeacherDashboardView
        deps={{
          loadEvents: async () => events,
          loadJournalEvents: async () => JOURNAL_EVENTS,
          journalRoom: "3b-elab",
        }}
      />,
    )

    expect((await screen.findByTestId("zstat-board.elements.created")).getAttribute("data-zstat-value")).toBe("1")
    expect((await screen.findByTestId("zstat-math.inserts.count")).getAttribute("data-zstat-value")).toBe("1")
    expect((await screen.findByTestId("zstat-manual.pages.viewed")).getAttribute("data-zstat-value")).toBe("1")
    expect((await screen.findByTestId("zchart-board.elements.created")).getAttribute("data-zchart-value")).toBe("1")
  })

  it("rende il grafo della lezione navigabile senza un secondo store", async () => {
    const events = await appendEvents(LESSON_EVENTS)
    render(<TeacherDashboardView deps={{ loadEvents: async () => events }} />)

    const graph = await screen.findByTestId("zgraph")
    expect(graph.textContent).toContain("Legge di Ohm")
    expect(graph.textContent).toContain("Corto circuito")
    expect(screen.getByTestId("zgraph-focus").textContent).toContain("Legge di Ohm")

    fireEvent.click(screen.getByRole("button", { name: /Corto circuito/i }))

    await waitFor(() => {
      expect(screen.getByTestId("zgraph-focus").textContent).toContain("Corto circuito")
    })
  })

  it("event log vuoto → stat a zero DICHIARATE (mai card nascoste come se non esistessero)", async () => {
    render(<TeacherDashboardView deps={{ loadEvents: async () => [] }} />)
    const lessons = await screen.findByTestId("zstat-lessons.count")
    expect(lessons.getAttribute("data-zstat-value")).toBe("0")
  })
})
