// @vitest-environment jsdom
//
// D10 — prima zona STATISTICHE del cruscotto docente: stat card derivate SOLO
// dall'event-log LessonOS via projectTeacherDashboard (projection read-only,
// mai un secondo store, mai numeri inventati). Il proiettore calcola già
// projection.stats (#100) ma nessuna vista le mostrava.
//
// Onestà: ogni card porta la finestra temporale e le evidenze da cui deriva;
// zero lezioni = zero, dichiarato — mai una card nascosta o un dato finto.

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { InMemoryEventLog, type AppendedEvent, type LessonOsEvent } from "../lessonos/eventlog"
import TeacherDashboardView from "../design/TeacherDashboardView"

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
    kind: "error.observed",
    errorId: "errore:corto-1",
    conceptId: "concetto:ohm",
    labels: { it: "Corto circuito" },
    t: 1500,
    evidence: ["board:wire9"],
  },
  { kind: "lesson.ended", room: "3b-elab", t: 2000, evidence: ["lesson:3b-elab@2000"] },
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

  it("event log vuoto → stat a zero DICHIARATE (mai card nascoste come se non esistessero)", async () => {
    render(<TeacherDashboardView deps={{ loadEvents: async () => [] }} />)
    const lessons = await screen.findByTestId("zstat-lessons.count")
    expect(lessons.getAttribute("data-zstat-value")).toBe("0")
  })
})
