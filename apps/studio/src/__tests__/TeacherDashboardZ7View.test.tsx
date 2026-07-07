// @vitest-environment jsdom
// Z7 UI (TEACHER-DASHBOARD-SPEC §3) — prima zona del cruscotto docente con una
// vista reale: la studentPackQueue esiste nel proiettore (#100) ma nessuna
// vista la mostrava. Micro-slice (regola §7.10: ogni zona nuova = PR piccola
// con test): SOLO Z7, dati dal proiettore REALE su eventi reali — mai coda
// costruita a mano nei test della vista.
//
// Onestà (spec §0.4): event log illeggibile → errore visibile, MAI una coda
// vuota spacciata per vera; coda vuota REALE → empty state dichiarato.

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { InMemoryEventLog, type AppendedEvent, type LessonOsEvent } from "../lessonos/eventlog"
import { isTeacherDashboardView } from "../store/teacherDashboardView"
import TeacherDashboardView from "../design/TeacherDashboardView"

afterEach(() => {
  cleanup()
  window.history.replaceState(null, "", "/")
})

async function appendEvents(events: readonly LessonOsEvent[]): Promise<AppendedEvent[]> {
  const log = new InMemoryEventLog()
  for (const ev of events) await log.append(ev)
  return log.readAll()
}

const CANDIDATE_EVENTS: LessonOsEvent[] = [
  { kind: "lesson.started", room: "3b-elab", t: 1000, evidence: ["lesson:3b-elab@1000"] },
  {
    kind: "error.observed",
    errorId: "error:corto-1",
    conceptId: "ohm_law",
    labels: { it: "Corto circuito sulla riga i" },
    t: 1500,
    evidence: ["board:wire9", "manual:vol1:p29"],
  },
  { kind: "lesson.ended", room: "3b-elab", t: 2000, evidence: ["lesson:3b-elab@2000"] },
]

describe("isTeacherDashboardView", () => {
  it("vera solo per ?vista=cruscotto", () => {
    window.history.replaceState(null, "", "/?vista=cruscotto")
    expect(isTeacherDashboardView()).toBe(true)
    window.history.replaceState(null, "", "/?vista=officina-plugin")
    expect(isTeacherDashboardView()).toBe(false)
    window.history.replaceState(null, "", "/")
    expect(isTeacherDashboardView()).toBe(false)
  })
})

describe("TeacherDashboardView — zona Z7 student-pack", () => {
  it("mostra i candidati derivati dal proiettore reale (label, room, stato, evidenze)", async () => {
    const events = await appendEvents(CANDIDATE_EVENTS)
    render(<TeacherDashboardView deps={{ loadEvents: async () => events }} />)

    await screen.findByRole("button", { name: /genera pack/i })
    const row = document.querySelector('[data-z7-candidate="sp-error:corto-1"]')
    expect(row).not.toBeNull()
    expect(row!.textContent).toContain("Corto circuito sulla riga i")
    expect(row!.textContent).toContain("3b-elab")
    expect(row!.textContent).toContain("candidate")
    // ogni riga porta le sue evidenze (spec §0.3: niente dati senza provenienza)
    expect(row!.textContent).toContain("board:wire9")
    expect(row!.textContent).toContain("manual:vol1:p29")
  })

  it("candidato orfano (fromRoom vuota): dichiarato fuori lezione, mai perso in silenzio", async () => {
    const events = await appendEvents([
      {
        kind: "error.observed",
        errorId: "error:senza-lezione",
        conceptId: "ohm_law",
        labels: { it: "Errore orfano" },
        t: 100,
        evidence: ["board:x1"],
      },
    ])
    render(<TeacherDashboardView deps={{ loadEvents: async () => events }} />)

    await screen.findByText(/fuori lezione/i)
    const row = document.querySelector('[data-z7-candidate="sp-error:senza-lezione"]')
    expect(row!.textContent).toContain("Errore orfano")
    expect(row!.textContent).toContain("fuori lezione")
  })

  it("coda vuota reale: empty state dichiarato (non una zona muta)", async () => {
    render(<TeacherDashboardView deps={{ loadEvents: async () => [] }} />)
    expect(await screen.findByText(/nessun candidato/i)).toBeTruthy()
  })

  it("event log illeggibile: errore visibile, MAI coda vuota spacciata per vera", async () => {
    render(
      <TeacherDashboardView
        deps={{ loadEvents: async () => Promise.reject(new Error("IndexedDB rotto")) }}
      />,
    )
    expect(await screen.findByText(/memoria della lezione non leggibile/i)).toBeTruthy()
    expect(screen.queryByText(/nessun candidato/i)).toBeNull()
  })

  it("'Genera pack' su un candidato appende studentpack.generated (nessun secondo store) e ricarica", async () => {
    const store = new InMemoryEventLog()
    for (const ev of CANDIDATE_EVENTS) await store.append(ev)
    const appendEvent = vi.fn(async (ev: LessonOsEvent) => {
      await store.append(ev)
    })
    render(
      <TeacherDashboardView
        deps={{ loadEvents: async () => store.readAll(), appendEvent }}
      />,
    )

    const button = await screen.findByRole("button", { name: /genera pack/i })
    fireEvent.click(button)

    await waitFor(() => expect(appendEvent).toHaveBeenCalledTimes(1))
    const appended = appendEvent.mock.calls[0]![0]
    expect(appended).toMatchObject({
      kind: "studentpack.generated",
      packId: "sp-error:corto-1",
      errorId: "error:corto-1",
      fromRoom: "3b-elab",
    })
    expect(appended.evidence).toEqual(["board:wire9", "manual:vol1:p29"])
    // dopo il ricarico il candidato risulta generato (lift dal projector reale)
    await waitFor(() => {
      const row = document.querySelector('[data-z7-candidate="sp-error:corto-1"]')
      expect(row?.querySelector("[data-z7-status=generated]")).not.toBeNull()
    })
  })

  it("'Esporta' su un pack generato appende studentpack.exported", async () => {
    const store = new InMemoryEventLog()
    for (const ev of CANDIDATE_EVENTS) await store.append(ev)
    await store.append({
      kind: "studentpack.generated",
      packId: "sp-error:corto-1",
      errorId: "error:corto-1",
      fromRoom: "3b-elab",
      t: 2500,
      evidence: ["board:wire9"],
    })
    const appendEvent = vi.fn(async (ev: LessonOsEvent) => {
      await store.append(ev)
    })
    render(
      <TeacherDashboardView deps={{ loadEvents: async () => store.readAll(), appendEvent }} />,
    )

    const button = await screen.findByRole("button", { name: /esporta/i })
    fireEvent.click(button)

    await waitFor(() => expect(appendEvent).toHaveBeenCalledTimes(1))
    expect(appendEvent.mock.calls[0]![0]).toMatchObject({
      kind: "studentpack.exported",
      packId: "sp-error:corto-1",
    })
  })
})
