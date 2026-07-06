import { describe, expect, it } from "vitest"
import { InMemoryEventLog, type AppendedEvent, type LessonOsEvent } from "../lessonos/eventlog"
import { projectTeacherDashboard, type TeacherDashboardProjection } from "../lessonos/teacherDashboardProjection"
import type { JournalEvent } from "../store/JournalRecorder"

const LESSON_EVENTS: LessonOsEvent[] = [
  { kind: "lesson.started", room: "3b-elab", t: 1000, evidence: ["lesson:3b-elab@1000"] },
  {
    kind: "concept.introduced",
    conceptId: "led_polarity",
    labels: { it: "Polarita del LED", en: "LED polarity" },
    t: 1100,
    evidence: ["manual:vol1:p30"],
  },
  {
    kind: "material.cited",
    materialId: "material:vol1-p30-fig2",
    conceptId: "led_polarity",
    labels: { it: "Figura p.30" },
    t: 1200,
    evidence: ["manual:vol1:p30", "board:fig2"],
  },
  {
    kind: "error.observed",
    errorId: "error:led-invertito-1",
    conceptId: "led_polarity",
    labels: { it: "LED invertito" },
    t: 1300,
    evidence: ["board:led1", "lesson:3b-elab@1300"],
  },
  {
    kind: "exercise.completed",
    exerciseId: "exercise:rimonta-led",
    conceptId: "led_polarity",
    correctsErrorId: "error:led-invertito-1",
    labels: { it: "Rimonta il LED" },
    t: 1400,
    evidence: ["board:led1"],
  },
  { kind: "lesson.ended", room: "3b-elab", t: 2000, evidence: ["lesson:3b-elab@2000"] },
]

const JOURNAL_EVENTS: JournalEvent[] = [
  { t: 1010, type: "t0" },
  { t: 1020, type: "element.add", element: { id: "resistor-1", type: "rectangle", version: 1 } },
  { t: 1030, type: "element.add", element: { id: "led-1", type: "ellipse", version: 1 } },
  { t: 1040, type: "math.insert", latex: "V = R I" },
  { t: 1050, type: "pdf.page.view", page: 30, totalPages: 31 },
  { t: 1060, type: "pdf.page.view", page: 30, totalPages: 31 },
  { t: 1070, type: "pdf.page.view", page: 31, totalPages: 31 },
  { t: 1080, type: "audio.chunk", chunkIndex: 0, startEpoch: 1080, endEpoch: 1090 },
  { t: 1090, type: "t1" },
]

async function appendEvents(events: readonly LessonOsEvent[]): Promise<AppendedEvent[]> {
  const log = new InMemoryEventLog()
  for (const ev of events) await log.append(ev)
  return log.readAll()
}

async function appendFixture(): Promise<AppendedEvent[]> {
  return appendEvents(LESSON_EVENTS)
}

function makeProjection(events: readonly AppendedEvent[]): TeacherDashboardProjection {
  return projectTeacherDashboard({
    lessonEvents: events,
    journalEvents: JOURNAL_EVENTS,
    teacherId: "teacher-a",
    locale: "it",
    generatedAt: 5000,
    journalRoom: "3b-elab",
    focusNodeId: "led_polarity",
  })
}

describe("TeacherDashboardProjection", () => {
  it("deriva lezioni e statistiche dal journal senza creare un secondo store", async () => {
    const projection = makeProjection(await appendFixture())

    expect(projection.v).toBe(1)
    expect(projection.teacherId).toBe("teacher-a")
    expect(projection.scopes).toEqual([{ scopeId: "3b-elab", kind: "room", label: { it: "3b-elab" } }])
    expect(projection.lessons).toEqual([
      {
        room: "3b-elab",
        startedAt: 1000,
        endedAt: 2000,
        counts: { elements: 2, mathInserts: 1, pdfPagesViewed: 2, audioChunks: 1 },
        evidenceRefs: [
          "lesson:3b-elab@1000",
          "lesson:3b-elab@2000",
          "journal:t0@1010",
          "board:resistor-1",
          "board:led-1",
          "journal:math.insert@1040",
          "manual:page:30",
          "manual:page:31",
          "journal:audio.chunk:0",
          "journal:t1@1090",
        ],
      },
    ])
    expect(projection.stats.map((stat) => [stat.key, stat.value])).toEqual([
      ["lessons.count", 1],
      ["board.elements.created", 2],
      ["math.inserts.count", 1],
      ["manual.pages.viewed", 2],
      ["errors.count", 1],
    ])
  })

  it("proietta il vicinato del grafo LessonOS con kind inglesi compatibili col contratto dashboard", async () => {
    const projection = makeProjection(await appendFixture())

    expect(projection.graphView.focusNodeId).toBe("led_polarity")
    expect(projection.graphView.nodes.map((node) => [node.id, node.kind])).toEqual([
      ["error:led-invertito-1", "error"],
      ["exercise:rimonta-led", "exercise"],
      ["led_polarity", "concept"],
      ["material:vol1-p30-fig2", "material"],
    ])
    expect(projection.graphView.edges.map((edge) => [edge.from, edge.kind, edge.to])).toEqual([
      ["error:led-invertito-1", "deriva-da", "led_polarity"],
      ["exercise:rimonta-led", "cita", "led_polarity"],
      ["exercise:rimonta-led", "corregge", "error:led-invertito-1"],
      ["exercise:rimonta-led", "corregge", "led_polarity"],
      ["material:vol1-p30-fig2", "cita", "led_polarity"],
    ])
  })

  it("riassume gli errori ricorrenti per concetto con evidenze e correzioni", async () => {
    const projection = makeProjection(await appendFixture())

    expect(projection.recurringErrors).toEqual([
      {
        conceptId: "led_polarity",
        label: { it: "Polarita del LED", en: "LED polarity" },
        count: 1,
        firstSeen: 1300,
        lastSeen: 1300,
        correctedBy: ["exercise:rimonta-led"],
        evidenceRefs: ["board:led1", "lesson:3b-elab@1300"],
      },
    ])
  })

  it("e esplicitamente onesta sulle zone senza fonte reale", async () => {
    const projection = makeProjection(await appendFixture())

    expect(projection.plugins).toEqual([])
    expect(projection.studentPackQueue).toEqual([])
    expect(projection.publicProfile).toBeNull()
    expect(projection.unavailable.map((entry) => entry.zone)).toEqual(["Z3", "Z4", "Z5", "Z6", "Z10", "Z11", "Z12"])
  })

  it("segmenta due sessioni della stessa room in due lezioni con finestre e counts separati", async () => {
    const events = await appendEvents([
      { kind: "lesson.started", room: "3b-elab", t: 1000, evidence: ["lesson:3b-elab@1000"] },
      { kind: "lesson.ended", room: "3b-elab", t: 2000, evidence: ["lesson:3b-elab@2000"] },
      { kind: "lesson.started", room: "3b-elab", t: 9000, evidence: ["lesson:3b-elab@9000"] },
      { kind: "lesson.ended", room: "3b-elab", t: 9500, evidence: ["lesson:3b-elab@9500"] },
    ])
    const projection = projectTeacherDashboard({
      lessonEvents: events,
      journalEvents: [
        { t: 1500, type: "element.add", element: { id: "el-prima", type: "rectangle", version: 1 } },
        { t: 9100, type: "math.insert", latex: "I = V / R" },
      ],
      teacherId: "teacher-a",
      locale: "it",
      generatedAt: 10000,
      journalRoom: "3b-elab",
    })

    expect(projection.lessons).toEqual([
      {
        room: "3b-elab",
        startedAt: 1000,
        endedAt: 2000,
        counts: { elements: 1, mathInserts: 0, pdfPagesViewed: 0, audioChunks: 0 },
        evidenceRefs: ["lesson:3b-elab@1000", "lesson:3b-elab@2000", "board:el-prima"],
      },
      {
        room: "3b-elab",
        startedAt: 9000,
        endedAt: 9500,
        counts: { elements: 0, mathInserts: 1, pdfPagesViewed: 0, audioChunks: 0 },
        evidenceRefs: ["lesson:3b-elab@9000", "lesson:3b-elab@9500", "journal:math.insert@9100"],
      },
    ])
    expect(projection.stats.find((stat) => stat.key === "lessons.count")?.value).toBe(2)
  })

  it("esclude i journal fuori finestra e non riscrive startedAt col journal", async () => {
    const events = await appendEvents([
      { kind: "lesson.started", room: "3b-elab", t: 1000, evidence: ["lesson:3b-elab@1000"] },
      { kind: "lesson.ended", room: "3b-elab", t: 2000, evidence: ["lesson:3b-elab@2000"] },
    ])
    const projection = projectTeacherDashboard({
      lessonEvents: events,
      journalEvents: [
        { t: 500, type: "element.add", element: { id: "el-anticipato", type: "rectangle", version: 1 } },
        { t: 1500, type: "element.add", element: { id: "el-in-finestra", type: "rectangle", version: 1 } },
        { t: 2500, type: "math.insert", latex: "V = R I" },
      ],
      teacherId: "teacher-a",
      locale: "it",
      generatedAt: 5000,
      journalRoom: "3b-elab",
    })

    expect(projection.lessons).toEqual([
      {
        room: "3b-elab",
        startedAt: 1000,
        endedAt: 2000,
        counts: { elements: 1, mathInserts: 0, pdfPagesViewed: 0, audioChunks: 0 },
        evidenceRefs: ["lesson:3b-elab@1000", "lesson:3b-elab@2000", "board:el-in-finestra"],
      },
    ])
  })

  it("conta ogni osservazione dello stesso errorId e aggiorna lastSeen", async () => {
    const events = await appendEvents([
      { kind: "lesson.started", room: "3b-elab", t: 1000, evidence: ["lesson:3b-elab@1000"] },
      {
        kind: "concept.introduced",
        conceptId: "led_polarity",
        labels: { it: "Polarita del LED" },
        t: 1100,
        evidence: ["manual:vol1:p30"],
      },
      {
        kind: "error.observed",
        errorId: "error:led-invertito-1",
        conceptId: "led_polarity",
        labels: { it: "LED invertito" },
        t: 1300,
        evidence: ["lesson:3b-elab@1300"],
      },
      {
        kind: "error.observed",
        errorId: "error:led-invertito-1",
        conceptId: "led_polarity",
        labels: { it: "LED invertito" },
        t: 1700,
        evidence: ["lesson:3b-elab@1700"],
      },
      { kind: "lesson.ended", room: "3b-elab", t: 2000, evidence: ["lesson:3b-elab@2000"] },
    ])
    const projection = projectTeacherDashboard({
      lessonEvents: events,
      teacherId: "teacher-a",
      locale: "it",
      generatedAt: 5000,
    })

    expect(projection.recurringErrors).toEqual([
      {
        conceptId: "led_polarity",
        label: { it: "Polarita del LED" },
        count: 2,
        firstSeen: 1300,
        lastSeen: 1700,
        correctedBy: [],
        evidenceRefs: ["lesson:3b-elab@1300", "lesson:3b-elab@1700"],
      },
    ])
  })

  it("lascia endedAt null per lesson.started senza ended e conta i journal successivi", async () => {
    const events = await appendEvents([
      { kind: "lesson.started", room: "3b-elab", t: 1000, evidence: ["lesson:3b-elab@1000"] },
    ])
    const projection = projectTeacherDashboard({
      lessonEvents: events,
      journalEvents: [{ t: 1200, type: "element.add", element: { id: "el-aperto", type: "rectangle", version: 1 } }],
      teacherId: "teacher-a",
      locale: "it",
      generatedAt: 5000,
      journalRoom: "3b-elab",
    })

    expect(projection.lessons).toEqual([
      {
        room: "3b-elab",
        startedAt: 1000,
        endedAt: null,
        counts: { elements: 1, mathInserts: 0, pdfPagesViewed: 0, audioChunks: 0 },
        evidenceRefs: ["lesson:3b-elab@1000", "board:el-aperto"],
      },
    ])
  })

  it("e rigenerabile da zero e non introduce metriche interpretative", async () => {
    const events = await appendFixture()
    const a = makeProjection(events)
    const b = makeProjection(events)

    expect(a).toEqual(b)
    const serialized = JSON.stringify(a).toLowerCase()
    expect(serialized).not.toContain("score")
    expect(serialized).not.toContain("mastery")
    expect(serialized).not.toContain("progress")
  })
})

// Z7 — studentPackQueue: i candidati derivano dagli eventi GIÀ nel log
// (error.observed mai corretto da exercise.completed.correctsErrorId), senza
// nuovi kind. Solo status "candidate": generated/exported richiedono eventi
// append-only dedicati (restano fuori, documentato nel proiettore).
describe("studentPackQueue (Z7) — candidati dagli errori mai corretti", () => {
  it("un errore osservato e mai corretto diventa candidato con la room della lezione", async () => {
    const events = await appendEvents([
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
    ])
    const projection = makeProjection(events)

    expect(projection.studentPackQueue).toEqual([
      {
        candidateId: "sp-error:corto-1",
        errorId: "error:corto-1",
        fromRoom: "3b-elab",
        label: { it: "Corto circuito sulla riga i" },
        status: "candidate",
        evidenceRefs: ["board:wire9", "manual:vol1:p29"],
      },
    ])
    expect(projection.unavailable.map((entry) => entry.zone)).not.toContain("Z7")
  })

  it("un errore corretto da un esercizio NON è candidato (fixture canonica)", async () => {
    const projection = makeProjection(await appendFixture())
    expect(projection.studentPackQueue).toEqual([])
  })

  it("errore fuori da ogni finestra lezione: candidato con fromRoom vuota, mai perso in silenzio", async () => {
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
    const projection = makeProjection(events)

    expect(projection.studentPackQueue).toEqual([
      {
        candidateId: "sp-error:senza-lezione",
        errorId: "error:senza-lezione",
        fromRoom: "",
        label: { it: "Errore orfano" },
        status: "candidate",
        evidenceRefs: ["board:x1"],
      },
    ])
  })
})

describe("studentPackQueue (Z7) — lift candidate→generated→exported dagli eventi append-only", () => {
  const BASE: LessonOsEvent[] = [
    { kind: "lesson.started", room: "3b-elab", t: 1000, evidence: ["lesson:3b-elab@1000"] },
    {
      kind: "error.observed",
      errorId: "error:corto-1",
      conceptId: "ohm_law",
      labels: { it: "Corto sulla riga i" },
      t: 1500,
      evidence: ["board:wire9"],
    },
    { kind: "lesson.ended", room: "3b-elab", t: 2000, evidence: ["lesson:3b-elab@2000"] },
  ]

  it("un studentpack.generated lifta il candidato a 'generated' senza secondo store", async () => {
    const events = await appendEvents([
      ...BASE,
      {
        kind: "studentpack.generated",
        packId: "sp-error:corto-1",
        errorId: "error:corto-1",
        fromRoom: "3b-elab",
        t: 2500,
        evidence: ["board:wire9"],
      },
    ])
    const projection = makeProjection(events)
    expect(projection.studentPackQueue).toEqual([
      {
        candidateId: "sp-error:corto-1",
        errorId: "error:corto-1",
        fromRoom: "3b-elab",
        label: { it: "Corto sulla riga i" },
        status: "generated",
        evidenceRefs: ["board:wire9"],
      },
    ])
  })

  it("generated + exported lifta a 'exported' (ordine append-only rispettato)", async () => {
    const events = await appendEvents([
      ...BASE,
      {
        kind: "studentpack.generated",
        packId: "sp-error:corto-1",
        errorId: "error:corto-1",
        fromRoom: "3b-elab",
        t: 2500,
        evidence: ["board:wire9"],
      },
      { kind: "studentpack.exported", packId: "sp-error:corto-1", t: 2600, evidence: ["board:wire9"] },
    ])
    const projection = makeProjection(events)
    expect(projection.studentPackQueue[0]?.status).toBe("exported")
  })

  it("exported senza generated resta 'candidate': nessun salto di stato inventato", async () => {
    const events = await appendEvents([
      ...BASE,
      { kind: "studentpack.exported", packId: "sp-error:corto-1", t: 2600, evidence: ["board:wire9"] },
    ])
    const projection = makeProjection(events)
    expect(projection.studentPackQueue[0]?.status).toBe("candidate")
  })
})
