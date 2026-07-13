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
import { afterEach, describe, expect, it, vi } from "vitest"
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
  it("proietta soltanto LessonOS e journal della room richiesta", async () => {
    const events = await appendEvents([
      ...LESSON_EVENTS,
      { kind: "lesson.started", room: "room-b", t: 3000, evidence: ["lesson:room-b@3000"] },
      {
        kind: "error.observed",
        errorId: "errore:b",
        conceptId: "concetto:b",
        labels: { it: "Errore B" },
        t: 3100,
        evidence: ["board:b"],
      },
      { kind: "lesson.ended", room: "room-b", t: 3200, evidence: ["lesson:room-b@3200"] },
    ])
    const loadJournalEvents = vi.fn(async () => JOURNAL_EVENTS)

    render(
      <TeacherDashboardView
        deps={{
          loadEvents: async () => events,
          loadJournalEvents,
          journalRoom: "3b-elab",
        }}
      />,
    )

    expect((await screen.findByTestId("zstat-lessons.count")).getAttribute("data-zstat-value")).toBe("1")
    expect(screen.getByTestId("zstat-errors.count").getAttribute("data-zstat-value")).toBe("1")
    expect(screen.queryByText("Errore B")).toBeNull()
    expect(loadJournalEvents).toHaveBeenCalledWith("3b-elab")
  })

  it("rifiuta una room ostile prima di leggere LessonOS o journal", async () => {
    const loadEvents = vi.fn(async () => [] as AppendedEvent[])
    const loadJournalEvents = vi.fn(async () => [] as JournalEvent[])
    const eventLog = { readAll: vi.fn(async () => [] as AppendedEvent[]) }

    render(
      <TeacherDashboardView
        deps={{ loadEvents, loadJournalEvents, eventLog, journalRoom: "../escape" }}
      />,
    )

    expect(await screen.findByText(/memoria della lezione non leggibile/i)).toBeTruthy()
    expect(loadEvents).not.toHaveBeenCalled()
    expect(loadJournalEvents).not.toHaveBeenCalled()
    expect(eventLog.readAll).not.toHaveBeenCalled()
  })

  it("mantiene il lifecycle student-pack della room quando l'ownership è univoca", async () => {
    const log = new InMemoryEventLog()
    for (const event of LESSON_EVENTS) await log.append(event)
    await log.append({
      kind: "studentpack.generated",
      packId: "sp-errore:corto-1",
      errorId: "errore:corto-1",
      fromRoom: "3b-elab",
      t: 2100,
      evidence: ["board:wire9"],
    })
    await log.append({
      kind: "studentpack.exported",
      packId: "sp-errore:corto-1",
      t: 2200,
      evidence: ["board:wire9"],
    })

    render(
      <TeacherDashboardView
        deps={{ loadEvents: () => log.readAll(), journalRoom: "3b-elab" }}
      />,
    )

    const row = await waitFor(() => {
      const candidate = document.querySelector('[data-z7-candidate="sp-errore:corto-1"]')
      expect(candidate).not.toBeNull()
      return candidate!
    })
    expect(row.querySelector("[data-z7-status=exported]")).not.toBeNull()
  })

  it("non attribuisce un export legacy quando lo stesso pack è generato in due room", async () => {
    const log = new InMemoryEventLog()
    for (const event of LESSON_EVENTS) await log.append(event)
    await log.append({
      kind: "lesson.started",
      room: "room-b",
      t: 3000,
      evidence: ["lesson:room-b@3000"],
    })
    await log.append({
      kind: "error.observed",
      errorId: "errore:corto-1",
      conceptId: "concetto:b",
      labels: { it: "Errore omonimo B" },
      t: 3100,
      evidence: ["board:b"],
    })
    await log.append({
      kind: "lesson.ended",
      room: "room-b",
      t: 3200,
      evidence: ["lesson:room-b@3200"],
    })
    await log.append({
      kind: "studentpack.generated",
      packId: "sp-errore:corto-1",
      errorId: "errore:corto-1",
      fromRoom: "3b-elab",
      t: 3300,
      evidence: ["board:wire9"],
    })
    await log.append({
      kind: "studentpack.generated",
      packId: "sp-errore:corto-1",
      errorId: "errore:corto-1",
      fromRoom: "room-b",
      t: 3400,
      evidence: ["board:b"],
    })
    await log.append({
      kind: "studentpack.exported",
      packId: "sp-errore:corto-1",
      t: 3500,
      evidence: ["board:export"],
    })

    render(
      <TeacherDashboardView
        deps={{ loadEvents: () => log.readAll(), journalRoom: "3b-elab" }}
      />,
    )

    const row = await waitFor(() => {
      const candidate = document.querySelector('[data-z7-candidate="sp-errore:corto-1"]')
      expect(candidate).not.toBeNull()
      return candidate!
    })
    expect(row.querySelector("[data-z7-status=generated]")).not.toBeNull()
    expect(row.querySelector("[data-z7-status=exported]")).toBeNull()
    expect(row.textContent).not.toContain("Errore omonimo B")
  })

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
