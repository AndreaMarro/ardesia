// @vitest-environment jsdom
//
// D10 — prima zona STATISTICHE del cruscotto docente: stat card derivate SOLO
// dall'event-log LessonOS via projectTeacherDashboard (projection read-only,
// mai un secondo store, mai numeri inventati). Il proiettore calcola già
// projection.stats (#100) ma nessuna vista le mostrava.
//
// Onestà: ogni card porta la finestra temporale e le evidenze da cui deriva;
// zero lezioni = zero, dichiarato — mai una card nascosta o un dato finto.

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { InMemoryEventLog, type AppendedEvent, type LessonOsEvent } from "../lessonos/eventlog"
import TeacherDashboardView from "../design/TeacherDashboardView"
import { selectDashboardRoomEvents } from "../design/knowledgeRoomSession"
import type { JournalEvent } from "../store/JournalRecorder"

afterEach(() => {
  cleanup()
})

async function appendEvents(events: readonly LessonOsEvent[]): Promise<AppendedEvent[]> {
  const log = new InMemoryEventLog()
  for (const ev of events) await log.append(ev)
  return log.readAll()
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined
  let reject: (reason?: unknown) => void = () => undefined
  const promise = new Promise<T>((complete, fail) => {
    resolve = complete
    reject = fail
  })
  return { promise, reject, resolve }
}

function recordStudentPackDownloads(downloads: string[]): () => void {
  const realCreate = URL.createObjectURL
  const realRevoke = URL.revokeObjectURL
  URL.createObjectURL = vi.fn(() => "blob:studentpack-race") as never
  URL.revokeObjectURL = vi.fn() as never
  const clickSpy = vi
    .spyOn(HTMLAnchorElement.prototype, "click")
    .mockImplementation(function (this: HTMLAnchorElement) {
      downloads.push(this.download)
    })
  return () => {
    clickSpy.mockRestore()
    URL.createObjectURL = realCreate
    URL.revokeObjectURL = realRevoke
  }
}

async function errorEventsForRoom(
  room: string,
  suffix: string,
  label: string,
  start: number,
): Promise<AppendedEvent[]> {
  return appendEvents([
    { kind: "lesson.started", room, t: start, evidence: [`lesson:${room}@${start}`] },
    {
      kind: "error.observed",
      errorId: `errore:${suffix}`,
      conceptId: `concetto:${suffix}`,
      labels: { it: label },
      t: start + 1,
      evidence: [`board:${suffix}`],
    },
    { kind: "lesson.ended", room, t: start + 2, evidence: [`lesson:${room}@${start + 2}`] },
  ])
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

  it("non legge lifecycle foreign collocato dentro la sessione attiva della room", async () => {
    const events = await appendEvents([
      { kind: "lesson.started", room: "room-a", t: 1, evidence: ["lesson:room-a@1"] },
      {
        kind: "error.observed",
        errorId: "errore:condiviso",
        conceptId: "concetto:a",
        labels: { it: "Errore A" },
        t: 2,
        evidence: ["board:a"],
      },
      {
        kind: "studentpack.generated",
        packId: "sp-errore:condiviso",
        errorId: "errore:condiviso",
        fromRoom: "room-b",
        t: 3,
        evidence: ["board:b"],
      },
      { kind: "lesson.ended", room: "room-a", t: 4, evidence: ["lesson:room-a@4"] },
    ])

    render(
      <TeacherDashboardView
        deps={{ loadEvents: async () => events, journalRoom: "room-a" }}
      />,
    )

    const row = await waitFor(() => {
      const candidate = document.querySelector('[data-z7-candidate="sp-errore:condiviso"]')
      expect(candidate).not.toBeNull()
      return candidate!
    })
    expect(row.querySelector("[data-z7-status=candidate]")).not.toBeNull()
    expect(row.querySelector("[data-z7-status=generated]")).toBeNull()
  })

  it("non reclama in due room lo stesso lifecycle legacy ambiguo", async () => {
    const events = await appendEvents([
      { kind: "lesson.started", room: "room-a", t: 1, evidence: ["lesson:room-a@1"] },
      {
        kind: "error.observed",
        errorId: "errore:condiviso",
        conceptId: "concetto:a",
        labels: { it: "Errore A" },
        t: 2,
        evidence: ["board:a"],
      },
      { kind: "lesson.ended", room: "room-a", t: 3, evidence: ["lesson:room-a@3"] },
      { kind: "lesson.started", room: "room-b", t: 4, evidence: ["lesson:room-b@4"] },
      {
        kind: "error.observed",
        errorId: "errore:condiviso",
        conceptId: "concetto:b",
        labels: { it: "Errore B" },
        t: 5,
        evidence: ["board:b"],
      },
      { kind: "lesson.ended", room: "room-b", t: 6, evidence: ["lesson:room-b@6"] },
      {
        kind: "studentpack.generated",
        packId: "sp-errore:condiviso",
        errorId: "errore:condiviso",
        t: 7,
        evidence: ["board:legacy"],
      },
    ])

    const generatedCounts = ["room-a", "room-b"].map(
      (room) => selectDashboardRoomEvents(events, room)
        .filter((event) => event.kind === "studentpack.generated").length,
    )
    expect(generatedCounts).toEqual([0, 0])
  })

  it("ignora il refresh lento superseded quando la room cambia", async () => {
    const roomA = await errorEventsForRoom("room-a", "a", "Errore lento A", 1)
    const roomB = await errorEventsForRoom("room-b", "b", "Errore veloce B", 4)
    const slowA = deferred<readonly AppendedEvent[]>()
    const fastB = deferred<readonly AppendedEvent[]>()
    let calls = 0
    const loadEvents = () => (calls++ === 0 ? slowA.promise : fastB.promise)
    const view = render(
      <TeacherDashboardView deps={{ loadEvents, journalRoom: "room-a" }} />,
    )

    view.rerender(<TeacherDashboardView deps={{ loadEvents, journalRoom: "room-b" }} />)
    await act(async () => {
      fastB.resolve(roomB)
    })
    expect(await screen.findByRole("button", { name: "Errore veloce B" })).toBeTruthy()

    await act(async () => {
      slowA.resolve(roomA)
    })
    expect(screen.queryByRole("button", { name: "Errore lento A" })).toBeNull()
    expect(screen.getByRole("button", { name: "Errore veloce B" })).toBeTruthy()
  })

  it("non rilancia il refresh della room A quando un append lento termina dopo il passaggio a B", async () => {
    const roomA = await errorEventsForRoom("room-a", "a", "Errore azione A", 1)
    const roomB = await errorEventsForRoom("room-b", "b", "Errore stabile B", 4)
    const slowAppend = deferred<void>()
    const appendEvent = vi.fn(() => slowAppend.promise)
    const view = render(
      <TeacherDashboardView
        deps={{ loadEvents: async () => roomA, appendEvent, journalRoom: "room-a" }}
      />,
    )

    fireEvent.click(await screen.findByRole("button", { name: "Genera pack" }))
    await waitFor(() => expect(appendEvent).toHaveBeenCalledTimes(1))
    view.rerender(
      <TeacherDashboardView
        deps={{ loadEvents: async () => roomB, appendEvent, journalRoom: "room-b" }}
      />,
    )
    expect(await screen.findByRole("button", { name: "Errore stabile B" })).toBeTruthy()

    await act(async () => {
      slowAppend.resolve()
    })
    expect(screen.queryByRole("button", { name: "Errore azione A" })).toBeNull()
    expect(screen.getByRole("button", { name: "Errore stabile B" })).toBeTruthy()
  })

  it("non sostituisce B con l'errore tardivo di un append avviato in A", async () => {
    const roomA = await errorEventsForRoom("room-a", "a", "Errore azione A", 1)
    const roomB = await errorEventsForRoom("room-b", "b", "Errore stabile B", 4)
    const slowAppend = deferred<void>()
    const appendEvent = vi.fn(() => slowAppend.promise)
    const view = render(
      <TeacherDashboardView
        deps={{ loadEvents: async () => roomA, appendEvent, journalRoom: "room-a" }}
      />,
    )

    fireEvent.click(await screen.findByRole("button", { name: "Genera pack" }))
    await waitFor(() => expect(appendEvent).toHaveBeenCalledTimes(1))
    view.rerender(
      <TeacherDashboardView
        deps={{ loadEvents: async () => roomB, appendEvent, journalRoom: "room-b" }}
      />,
    )
    expect(await screen.findByRole("button", { name: "Errore stabile B" })).toBeTruthy()

    await act(async () => {
      slowAppend.reject(new Error("append A fallito"))
    })
    expect(screen.queryByText(/memoria della lezione non leggibile/i)).toBeNull()
    expect(screen.getByRole("button", { name: "Errore stabile B" })).toBeTruthy()
  })

  it("non lascia che un'azione sospesa in A disabiliti lo stesso candidate ID in B", async () => {
    const events = await appendEvents([
      { kind: "lesson.started", room: "room-a", t: 1, evidence: ["lesson:room-a@1"] },
      {
        kind: "error.observed",
        errorId: "errore:condiviso",
        conceptId: "concetto:a",
        labels: { it: "Errore A" },
        t: 2,
        evidence: ["board:a"],
      },
      { kind: "lesson.ended", room: "room-a", t: 3, evidence: ["lesson:room-a@3"] },
      { kind: "lesson.started", room: "room-b", t: 4, evidence: ["lesson:room-b@4"] },
      {
        kind: "error.observed",
        errorId: "errore:condiviso",
        conceptId: "concetto:b",
        labels: { it: "Errore B" },
        t: 5,
        evidence: ["board:b"],
      },
      { kind: "lesson.ended", room: "room-b", t: 6, evidence: ["lesson:room-b@6"] },
    ])
    const slowAppend = deferred<void>()
    const appendEvent = vi.fn(() => slowAppend.promise)
    const view = render(
      <TeacherDashboardView
        deps={{ loadEvents: async () => events, appendEvent, journalRoom: "room-a" }}
      />,
    )

    fireEvent.click(await screen.findByRole("button", { name: "Genera pack" }))
    await waitFor(() => expect(appendEvent).toHaveBeenCalledTimes(1))
    view.rerender(
      <TeacherDashboardView
        deps={{ loadEvents: async () => events, appendEvent, journalRoom: "room-b" }}
      />,
    )
    const buttonB = await screen.findByRole("button", { name: "Genera pack" })
    const disabledInB = buttonB.hasAttribute("disabled")

    await act(async () => {
      slowAppend.resolve()
    })
    expect(disabledInB).toBe(false)
  })

  it("non scarica automaticamente l'export di A se l'append termina dopo il passaggio a B", async () => {
    const log = new InMemoryEventLog()
    for (const event of [
      { kind: "lesson.started", room: "room-a", t: 1, evidence: ["lesson:room-a@1"] },
      {
        kind: "error.observed",
        errorId: "errore:a",
        conceptId: "concetto:a",
        labels: { it: "Errore A" },
        t: 2,
        evidence: ["board:a"],
      },
      { kind: "lesson.ended", room: "room-a", t: 3, evidence: ["lesson:room-a@3"] },
      { kind: "lesson.started", room: "room-b", t: 4, evidence: ["lesson:room-b@4"] },
      { kind: "lesson.ended", room: "room-b", t: 5, evidence: ["lesson:room-b@5"] },
      {
        kind: "studentpack.generated",
        packId: "sp-errore:a",
        errorId: "errore:a",
        fromRoom: "room-a",
        t: 6,
        evidence: ["board:a"],
      },
    ] satisfies LessonOsEvent[]) await log.append(event)
    const pending = deferred<void>()
    const appendEvent = vi.fn(async (event: LessonOsEvent) => {
      await pending.promise
      await log.append(event)
    })
    const downloads: string[] = []
    const restoreDownloads = recordStudentPackDownloads(downloads)
    let observedDownloads: number
    try {
      const view = render(
        <TeacherDashboardView
          deps={{ loadEvents: () => log.readAll(), appendEvent, journalRoom: "room-a" }}
        />,
      )
      fireEvent.click(await screen.findByRole("button", { name: "Esporta" }))
      await waitFor(() => expect(appendEvent).toHaveBeenCalledTimes(1))
      view.rerender(
        <TeacherDashboardView
          deps={{ loadEvents: () => log.readAll(), appendEvent, journalRoom: "room-b" }}
        />,
      )
      expect(await screen.findByText("Nessun candidato in coda")).toBeTruthy()
      await act(async () => {
        pending.resolve()
      })
      await waitFor(async () => {
        const exported = (await log.readAll()).filter((event) => event.kind === "studentpack.exported")
        expect(exported).toHaveLength(1)
      })
      await act(async () => {
        await Promise.resolve()
      })
      observedDownloads = downloads.length
    } finally {
      restoreDownloads()
    }

    expect(observedDownloads).toBe(0)
  })

  it("non scarica un export della visita A precedente dopo A→B→A e mostra il retry", async () => {
    const log = new InMemoryEventLog()
    for (const event of [
      { kind: "lesson.started", room: "room-a", t: 1, evidence: ["lesson:room-a@1"] },
      {
        kind: "error.observed",
        errorId: "errore:a",
        conceptId: "concetto:a",
        labels: { it: "Errore A" },
        t: 2,
        evidence: ["board:a"],
      },
      { kind: "lesson.ended", room: "room-a", t: 3, evidence: ["lesson:room-a@3"] },
      { kind: "lesson.started", room: "room-b", t: 4, evidence: ["lesson:room-b@4"] },
      { kind: "lesson.ended", room: "room-b", t: 5, evidence: ["lesson:room-b@5"] },
      {
        kind: "studentpack.generated",
        packId: "sp-errore:a",
        errorId: "errore:a",
        fromRoom: "room-a",
        t: 6,
        evidence: ["board:a"],
      },
    ] satisfies LessonOsEvent[]) await log.append(event)
    const pending = deferred<void>()
    const appendEvent = vi.fn(async (event: LessonOsEvent) => {
      await pending.promise
      await log.append(event)
    })
    const downloads: string[] = []
    const restoreDownloads = recordStudentPackDownloads(downloads)
    let observedDownloads: number
    let retryVisible: boolean
    try {
      const view = render(
        <TeacherDashboardView
          deps={{ loadEvents: () => log.readAll(), appendEvent, journalRoom: "room-a" }}
        />,
      )
      fireEvent.click(await screen.findByRole("button", { name: "Esporta" }))
      await waitFor(() => expect(appendEvent).toHaveBeenCalledTimes(1))
      view.rerender(
        <TeacherDashboardView
          deps={{ loadEvents: () => log.readAll(), appendEvent, journalRoom: "room-b" }}
        />,
      )
      expect(await screen.findByText("Nessun candidato in coda")).toBeTruthy()
      view.rerender(
        <TeacherDashboardView
          deps={{ loadEvents: () => log.readAll(), appendEvent, journalRoom: "room-a" }}
        />,
      )
      await screen.findByRole("button", { name: "Esporta" })
      await act(async () => {
        pending.resolve()
      })
      await waitFor(() => {
        expect(document.querySelector("[data-z7-status=exported]")).not.toBeNull()
      })
      observedDownloads = downloads.length
      retryVisible = document.querySelector('[data-z7-download="sp-errore:a"]') !== null
    } finally {
      restoreDownloads()
    }

    expect(observedDownloads).toBe(0)
    expect(retryVisible).toBe(true)
  })

  it("completa due generate concorrenti senza farle supersedere globalmente", async () => {
    const log = new InMemoryEventLog()
    for (const event of [
      { kind: "lesson.started", room: "room-a", t: 1, evidence: ["lesson:room-a@1"] },
      {
        kind: "error.observed",
        errorId: "errore:x",
        conceptId: "concetto:x",
        labels: { it: "Errore X" },
        t: 2,
        evidence: ["board:x"],
      },
      {
        kind: "error.observed",
        errorId: "errore:y",
        conceptId: "concetto:y",
        labels: { it: "Errore Y" },
        t: 3,
        evidence: ["board:y"],
      },
      { kind: "lesson.ended", room: "room-a", t: 4, evidence: ["lesson:room-a@4"] },
    ] satisfies LessonOsEvent[]) await log.append(event)
    const pendingX = deferred<void>()
    const pendingY = deferred<void>()
    const appendEvent = vi.fn(async (event: LessonOsEvent) => {
      if (event.kind !== "studentpack.generated") throw new Error("evento inatteso")
      await (event.packId === "sp-errore:x" ? pendingX.promise : pendingY.promise)
      await log.append(event)
    })
    render(
      <TeacherDashboardView
        deps={{ loadEvents: () => log.readAll(), appendEvent, journalRoom: "room-a" }}
      />,
    )

    fireEvent.click(await waitFor(() => {
      const button = document.querySelector('[data-z7-generate="sp-errore:x"]')
      expect(button).not.toBeNull()
      return button!
    }))
    fireEvent.click(document.querySelector('[data-z7-generate="sp-errore:y"]')!)
    await waitFor(() => expect(appendEvent).toHaveBeenCalledTimes(2))
    await act(async () => {
      pendingY.resolve()
    })
    await waitFor(() => {
      expect(document.querySelector('[data-z7-candidate="sp-errore:y"] [data-z7-status=generated]')).not.toBeNull()
    })
    await act(async () => {
      pendingX.resolve()
    })
    await waitFor(async () => {
      const generated = (await log.readAll()).filter((event) => event.kind === "studentpack.generated")
      expect(generated).toHaveLength(2)
    })

    const generatedRows = ["sp-errore:x", "sp-errore:y"].map(
      (packId) => document.querySelector(`[data-z7-candidate="${packId}"] [data-z7-status=generated]`) !== null,
    )
    expect(generatedRows).toEqual([true, true])
  })

  it("consegna entrambi gli export concorrenti e conserva un retry download-only", async () => {
    const log = new InMemoryEventLog()
    for (const event of [
      { kind: "lesson.started", room: "room-a", t: 1, evidence: ["lesson:room-a@1"] },
      {
        kind: "error.observed",
        errorId: "errore:x",
        conceptId: "concetto:x",
        labels: { it: "Errore X" },
        t: 2,
        evidence: ["board:x"],
      },
      {
        kind: "error.observed",
        errorId: "errore:y",
        conceptId: "concetto:y",
        labels: { it: "Errore Y" },
        t: 3,
        evidence: ["board:y"],
      },
      { kind: "lesson.ended", room: "room-a", t: 4, evidence: ["lesson:room-a@4"] },
      {
        kind: "studentpack.generated",
        packId: "sp-errore:x",
        errorId: "errore:x",
        fromRoom: "room-a",
        t: 5,
        evidence: ["board:x"],
      },
      {
        kind: "studentpack.generated",
        packId: "sp-errore:y",
        errorId: "errore:y",
        fromRoom: "room-a",
        t: 6,
        evidence: ["board:y"],
      },
    ] satisfies LessonOsEvent[]) await log.append(event)
    const pendingX = deferred<void>()
    const pendingY = deferred<void>()
    const appendEvent = vi.fn(async (event: LessonOsEvent) => {
      if (event.kind !== "studentpack.exported") throw new Error("evento inatteso")
      await (event.packId === "sp-errore:x" ? pendingX.promise : pendingY.promise)
      await log.append(event)
    })
    const downloads: string[] = []
    const restoreDownloads = recordStudentPackDownloads(downloads)
    let observedDownloads: number
    let observedRetries: number
    try {
      render(
        <TeacherDashboardView
          deps={{ loadEvents: () => log.readAll(), appendEvent, journalRoom: "room-a" }}
        />,
      )
      fireEvent.click(await waitFor(() => {
        const button = document.querySelector('[data-z7-export="sp-errore:x"]')
        expect(button).not.toBeNull()
        return button!
      }))
      fireEvent.click(document.querySelector('[data-z7-export="sp-errore:y"]')!)
      await waitFor(() => expect(appendEvent).toHaveBeenCalledTimes(2))
      await act(async () => {
        pendingX.resolve()
      })
      await act(async () => {
        pendingY.resolve()
      })
      await waitFor(() => {
        expect(document.querySelectorAll("[data-z7-status=exported]")).toHaveLength(2)
        expect(downloads.length).toBeGreaterThan(0)
      })
      observedDownloads = downloads.length
      observedRetries = document.querySelectorAll("[data-z7-download]").length
    } finally {
      restoreDownloads()
    }

    expect(observedDownloads).toBe(2)
    expect(observedRetries).toBe(2)
  })

  it("dichiara un download fallito e lascia il retry abilitato", async () => {
    const events = await appendEvents([
      ...LESSON_EVENTS,
      {
        kind: "studentpack.generated",
        packId: "sp-errore:corto-1",
        errorId: "errore:corto-1",
        fromRoom: "3b-elab",
        t: 2100,
        evidence: ["board:wire9"],
      },
      {
        kind: "studentpack.exported",
        packId: "sp-errore:corto-1",
        t: 2200,
        evidence: ["board:wire9"],
      },
    ])
    const realCreate = URL.createObjectURL
    URL.createObjectURL = vi.fn(() => {
      throw new Error("download browser negato")
    }) as never
    try {
      render(
        <TeacherDashboardView
          deps={{ loadEvents: async () => events, journalRoom: "3b-elab" }}
        />,
      )
      const retry = await screen.findByRole("button", { name: "Scarica di nuovo" })
      fireEvent.click(retry)

      expect((await screen.findByRole("alert")).textContent).toContain("download browser negato")
      await waitFor(() => expect(retry.hasAttribute("disabled")).toBe(false))
    } finally {
      URL.createObjectURL = realCreate
    }
  })

  it("un cambio focus nella stessa room non invalida una generate già appesa", async () => {
    const log = new InMemoryEventLog()
    for (const event of LESSON_EVENTS) await log.append(event)
    const pending = deferred<void>()
    const appendEvent = vi.fn(async (event: LessonOsEvent) => {
      await pending.promise
      await log.append(event)
    })
    render(
      <TeacherDashboardView
        deps={{ loadEvents: () => log.readAll(), appendEvent, journalRoom: "3b-elab" }}
      />,
    )

    fireEvent.click(await screen.findByRole("button", { name: "Genera pack" }))
    await waitFor(() => expect(appendEvent).toHaveBeenCalledTimes(1))
    fireEvent.click(screen.getByRole("button", { name: /Corto circuito/i }))
    await waitFor(() => expect(screen.getByTestId("zgraph-focus").textContent).toContain("Corto circuito"))
    await act(async () => {
      pending.resolve()
    })
    await waitFor(async () => {
      const generated = (await log.readAll()).filter((event) => event.kind === "studentpack.generated")
      expect(generated).toHaveLength(1)
    })

    expect(document.querySelector("[data-z7-status=generated]")).not.toBeNull()
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
