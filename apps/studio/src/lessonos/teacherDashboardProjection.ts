import type { AppendedEvent, EvidenceRef, Labels } from "./eventlog"
import { materialize, type LessonEdge, type LessonGraph, type LessonNode } from "./materializer"
import { neighbors } from "./recall"
import type { JournalEvent } from "../store/JournalRecorder"

export type DashboardNodeKind = "concept" | "lesson" | "material" | "error" | "exercise"

export interface TeacherDashboardProjection {
  v: 1
  generatedAt: number
  teacherId: string
  locale: string
  scopes: Array<{
    scopeId: string
    kind: "class" | "room" | "student-aggregate"
    label: Labels
  }>
  lessons: Array<{
    room: string
    startedAt: number
    endedAt: number | null
    counts: { elements: number; mathInserts: number; pdfPagesViewed: number; audioChunks: number }
    evidenceRefs: EvidenceRef[]
  }>
  graphView: {
    focusNodeId: string | null
    nodes: Array<{ id: string; kind: DashboardNodeKind; label: Labels; evidenceRefs: EvidenceRef[] }>
    edges: Array<{ from: string; to: string; kind: LessonEdge["kind"]; introducedAt?: number; correctedAt?: number }>
  }
  recurringErrors: Array<{
    conceptId: string
    label: Labels
    count: number
    firstSeen: number
    lastSeen: number
    correctedBy: string[]
    evidenceRefs: EvidenceRef[]
  }>
  plugins: Array<{
    id: string
    version: string
    publisher: string
    kind?: "tool" | "pack"
    lastUsedAt: number | null
  }>
  studentPackQueue: Array<{
    candidateId: string
    /** Errore da cui nasce il candidato: la vista lo cita nell'evento di generazione. */
    errorId: string
    fromRoom: string
    label: Labels
    status: "candidate" | "generated" | "exported"
    evidenceRefs: EvidenceRef[]
  }>
  stats: Array<{
    key: string
    value: number
    window: { from: number; to: number }
    evidenceRefs: EvidenceRef[]
  }>
  publicProfile: {
    displayName: string
    subjects: string[]
    published: Array<{ id: string; kind: "pack" | "material"; label: Labels }>
  } | null
  unavailable: Array<{ zone: string; reason: string }>
}

export interface ProjectTeacherDashboardInput {
  lessonEvents: readonly AppendedEvent[]
  journalEvents?: readonly JournalEvent[]
  teacherId: string
  locale: string
  generatedAt: number
  /** Room that owns journal events from raw/events.jsonl until JournalRecorder carries room ids. */
  journalRoom?: string
  focusNodeId?: string | null
}

interface LessonSegment {
  room: string
  startedAt: number
  endedAt: number | null
  counts: { elements: number; mathInserts: number; pdfPagesViewed: number; audioChunks: number }
  evidenceRefs: EvidenceRef[]
  pdfPages: Set<number>
}

const EMPTY_COUNTS = { elements: 0, mathInserts: 0, pdfPagesViewed: 0, audioChunks: 0 }

function byString(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

function addEvidence(target: EvidenceRef[], refs: readonly EvidenceRef[]): void {
  for (const ref of refs) {
    if (!target.includes(ref)) target.push(ref)
  }
}

function labelsFor(id: string, locale: string, labels?: Labels): Labels {
  if (labels && Object.keys(labels).length > 0) return { ...labels }
  return { [locale]: id }
}

function dashboardKind(node: LessonNode): DashboardNodeKind {
  switch (node.kind) {
    case "concetto":
      return "concept"
    case "materiale":
      return "material"
    case "errore":
      return "error"
    case "esercizio":
      return "exercise"
    case "lesson":
      return "lesson"
  }
}

function journalEvidence(ev: JournalEvent): EvidenceRef[] {
  switch (ev.type) {
    case "element.add":
    case "element.update": {
      const id = typeof ev.element.id === "string" ? ev.element.id : `${ev.type}@${ev.t}`
      return [`board:${id}`]
    }
    case "element.delete":
      return [`board:${ev.elementId}`]
    case "math.insert":
      return [`journal:math.insert@${ev.t}`]
    case "pdf.page.view":
      return [`manual:page:${ev.page}`]
    case "audio.chunk":
      return [`journal:audio.chunk:${ev.chunkIndex}`]
    case "t0":
    case "t1":
      return [`journal:${ev.type}@${ev.t}`]
  }
}

/**
 * Segmento che contiene `t`: per segmenti chiusi la finestra è [startedAt, endedAt];
 * per segmenti aperti è [startedAt, startedAt del segmento successivo della stessa
 * room) — o +∞ se non c'è un segmento successivo. `segments` è ordinato per startedAt.
 */
function segmentFor(segments: readonly LessonSegment[], t: number): LessonSegment | undefined {
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    if (t < segment.startedAt) continue
    if (segment.endedAt !== null) {
      if (t <= segment.endedAt) return segment
    } else {
      const bound = segments[i + 1]?.startedAt ?? Number.POSITIVE_INFINITY
      if (t < bound) return segment
    }
  }
  return undefined
}

function buildLessons(input: ProjectTeacherDashboardInput): LessonSegment[] {
  const segmentsByRoom = new Map<string, LessonSegment[]>()

  // Segmentazione per coppie lesson.started/lesson.ended in ordine `seq` per room:
  // started apre un segmento, ended chiude l'ultimo segmento aperto della room,
  // started senza ended resta con endedAt null, ended orfano viene ignorato.
  for (const ev of [...input.lessonEvents].sort((a, b) => a.seq - b.seq)) {
    if (ev.kind === "lesson.started") {
      const segments = segmentsByRoom.get(ev.room) ?? []
      const segment: LessonSegment = {
        room: ev.room,
        startedAt: ev.t,
        endedAt: null,
        counts: { ...EMPTY_COUNTS },
        evidenceRefs: [],
        pdfPages: new Set(),
      }
      addEvidence(segment.evidenceRefs, ev.evidence)
      segments.push(segment)
      segmentsByRoom.set(ev.room, segments)
    } else if (ev.kind === "lesson.ended") {
      const open = [...(segmentsByRoom.get(ev.room) ?? [])].reverse().find((segment) => segment.endedAt === null)
      if (!open) continue
      open.endedAt = ev.t
      addEvidence(open.evidenceRefs, ev.evidence)
    }
  }

  for (const segments of segmentsByRoom.values()) {
    segments.sort((a, b) => a.startedAt - b.startedAt)
  }

  // I journal contano SOLO dentro la finestra del segmento a cui appartengono;
  // startedAt/endedAt vengono SOLO dagli eventi LessonOS, mai dal journal.
  const journalSegments = segmentsByRoom.get(input.journalRoom ?? "current") ?? []
  for (const ev of input.journalEvents ?? []) {
    const segment = segmentFor(journalSegments, ev.t)
    if (!segment) continue
    addEvidence(segment.evidenceRefs, journalEvidence(ev))
    switch (ev.type) {
      case "element.add":
        segment.counts.elements += 1
        break
      case "math.insert":
        segment.counts.mathInserts += 1
        break
      case "pdf.page.view":
        segment.pdfPages.add(ev.page)
        segment.counts.pdfPagesViewed = segment.pdfPages.size
        break
      case "audio.chunk":
        segment.counts.audioChunks += 1
        break
      case "element.delete":
      case "element.update":
      case "t0":
      case "t1":
        break
    }
  }

  return [...segmentsByRoom.values()].flat().sort((a, b) => byString(a.room, b.room) || a.startedAt - b.startedAt)
}

function projectGraphView(graph: LessonGraph, focusNodeId: string | null | undefined): TeacherDashboardProjection["graphView"] {
  const focus = focusNodeId ?? null
  // Z1: vicinato a profondità ≤2 del nodo in focus.
  const view = focus ? neighbors(graph, focus, 2) : null
  if (!view) return { focusNodeId: null, nodes: [], edges: [] }
  return {
    focusNodeId: focus,
    nodes: view.nodes.map((node) => ({
      id: node.id,
      kind: dashboardKind(node),
      label: { ...node.labels },
      evidenceRefs: [...node.evidenceRefs],
    })),
    edges: view.edges.map((edge) => ({
      from: edge.from,
      to: edge.to,
      kind: edge.kind,
      introducedAt: edge.introducedAt,
      correctedAt: graph.nodes.get(edge.to)?.correctedAt,
    })),
  }
}

// Z7 — candidati student-pack DERIVATI dagli eventi già nel log: un
// error.observed mai corretto (nessun exercise.completed.correctsErrorId che
// lo punta) è un candidato al ripasso. Il lift di stato viene da eventi
// append-only dedicati (studentpack.generated/exported), NON da un secondo
// store: candidate → generated → exported. fromRoom = finestra
// lesson.started/ended che contiene t; errore fuori da ogni finestra →
// fromRoom "" (mai perso in muto).
function studentPackQueue(
  lessonEvents: readonly AppendedEvent[],
): TeacherDashboardProjection["studentPackQueue"] {
  const sorted = [...lessonEvents].sort((a, b) => a.seq - b.seq)
  const correctedErrorIds = new Set<string>()
  const generatedPackIds = new Set<string>()
  const exportedPackIds = new Set<string>()
  const windows: Array<{ room: string; from: number; to: number }> = []
  const openByRoom = new Map<string, number>()
  for (const ev of sorted) {
    if (ev.kind === "exercise.completed" && ev.correctsErrorId !== undefined) {
      correctedErrorIds.add(ev.correctsErrorId)
    } else if (ev.kind === "studentpack.generated") {
      generatedPackIds.add(ev.packId)
    } else if (ev.kind === "studentpack.exported") {
      exportedPackIds.add(ev.packId)
    } else if (ev.kind === "lesson.started") {
      openByRoom.set(ev.room, ev.t)
    } else if (ev.kind === "lesson.ended") {
      const from = openByRoom.get(ev.room)
      if (from !== undefined) {
        windows.push({ room: ev.room, from, to: ev.t })
        openByRoom.delete(ev.room)
      }
    }
  }
  // lezione ancora aperta: finestra fino a +Infinity
  for (const [room, from] of openByRoom) windows.push({ room, from, to: Number.POSITIVE_INFINITY })

  const queue: TeacherDashboardProjection["studentPackQueue"] = []
  for (const ev of sorted) {
    if (ev.kind !== "error.observed" || correctedErrorIds.has(ev.errorId)) continue
    const candidateId = `sp-${ev.errorId}`
    const window = windows.find((w) => ev.t >= w.from && ev.t <= w.to)
    // exported richiede generated a monte: nessun salto di stato inventato.
    const status: "candidate" | "generated" | "exported" = generatedPackIds.has(candidateId)
      ? exportedPackIds.has(candidateId)
        ? "exported"
        : "generated"
      : "candidate"
    queue.push({
      candidateId,
      errorId: ev.errorId,
      fromRoom: window?.room ?? "",
      label: { ...ev.labels },
      status,
      evidenceRefs: [...ev.evidence],
    })
  }
  return queue.sort((a, b) => byString(a.candidateId, b.candidateId))
}

// count/firstSeen/lastSeen vengono dagli EVENTI error.observed (ogni osservazione
// conta, anche sullo stesso errorId); correctedBy resta dal grafo materializzato.
function recurringErrors(
  lessonEvents: readonly AppendedEvent[],
  graph: LessonGraph,
  locale: string,
): TeacherDashboardProjection["recurringErrors"] {
  const byConcept = new Map<string, TeacherDashboardProjection["recurringErrors"][number]>()
  for (const ev of [...lessonEvents].sort((a, b) => a.seq - b.seq)) {
    if (ev.kind !== "error.observed") continue
    const existing = byConcept.get(ev.conceptId)
    const row = existing ?? {
      conceptId: ev.conceptId,
      label: labelsFor(ev.conceptId, locale, graph.nodes.get(ev.conceptId)?.labels),
      count: 0,
      firstSeen: ev.t,
      lastSeen: ev.t,
      correctedBy: [],
      evidenceRefs: [],
    }
    row.count += 1
    row.firstSeen = Math.min(row.firstSeen, ev.t)
    row.lastSeen = Math.max(row.lastSeen, ev.t)
    addEvidence(row.evidenceRefs, ev.evidence)
    byConcept.set(ev.conceptId, row)
  }
  for (const row of byConcept.values()) {
    for (const correction of graph.edges) {
      if (correction.kind === "corregge" && correction.to === row.conceptId && !row.correctedBy.includes(correction.from)) {
        row.correctedBy.push(correction.from)
      }
    }
    row.correctedBy.sort(byString)
  }
  return [...byConcept.values()].sort((a, b) => byString(a.conceptId, b.conceptId))
}

function buildStats(
  lessons: readonly LessonSegment[],
  graph: LessonGraph,
): TeacherDashboardProjection["stats"] {
  const evidenceRefs: EvidenceRef[] = []
  for (const lesson of lessons) addEvidence(evidenceRefs, lesson.evidenceRefs)
  const times = lessons.flatMap((lesson) => [lesson.startedAt, lesson.endedAt ?? lesson.startedAt])
  const window = {
    from: times.length > 0 ? Math.min(...times) : 0,
    to: times.length > 0 ? Math.max(...times) : 0,
  }
  const errorEvidence: EvidenceRef[] = []
  let errors = 0
  for (const node of graph.nodes.values()) {
    if (node.kind === "errore") {
      errors += 1
      addEvidence(errorEvidence, node.evidenceRefs)
    }
  }
  return [
    { key: "lessons.count", value: lessons.length, window, evidenceRefs: [...evidenceRefs] },
    {
      key: "board.elements.created",
      value: lessons.reduce((sum, lesson) => sum + lesson.counts.elements, 0),
      window,
      evidenceRefs: [...evidenceRefs],
    },
    {
      key: "math.inserts.count",
      value: lessons.reduce((sum, lesson) => sum + lesson.counts.mathInserts, 0),
      window,
      evidenceRefs: [...evidenceRefs],
    },
    {
      key: "manual.pages.viewed",
      value: lessons.reduce((sum, lesson) => sum + lesson.counts.pdfPagesViewed, 0),
      window,
      evidenceRefs: [...evidenceRefs],
    },
    { key: "errors.count", value: errors, window, evidenceRefs: errorEvidence },
  ]
}

export function projectTeacherDashboard(input: ProjectTeacherDashboardInput): TeacherDashboardProjection {
  const graph = materialize(input.lessonEvents)
  const lessons = buildLessons(input)
  const lessonRows = lessons.map((lesson) => ({
    room: lesson.room,
    startedAt: lesson.startedAt,
    endedAt: lesson.endedAt,
    counts: { ...lesson.counts },
    evidenceRefs: [...lesson.evidenceRefs],
  }))
  const rooms = new Set<string>(lessonRows.map((lesson) => lesson.room))

  return {
    v: 1,
    generatedAt: input.generatedAt,
    teacherId: input.teacherId,
    locale: input.locale,
    scopes: [...rooms].sort(byString).map((room) => ({
      scopeId: room,
      kind: "room",
      label: { [input.locale]: room },
    })),
    lessons: lessonRows,
    graphView: projectGraphView(graph, input.focusNodeId),
    recurringErrors: recurringErrors(input.lessonEvents, graph, input.locale),
    plugins: [],
    studentPackQueue: studentPackQueue(input.lessonEvents),
    stats: buildStats(lessons, graph),
    publicProfile: null,
    unavailable: [
      { zone: "Z3", reason: "student aggregates require consent-scoped event types not present in v0" },
      { zone: "Z4", reason: "planned lessons require lesson.planned events" },
      { zone: "Z5", reason: "workspace material registry is not wired into this pure projector slice" },
      { zone: "Z6", reason: "plugin manifest registry is not wired into this pure projector slice" },
      { zone: "Z10", reason: "export/import events are not in the current event-log schema" },
      { zone: "Z11", reason: "integrazione Drive fuori v0/v1 (spec §Z11)" },
      { zone: "Z12", reason: "public profile has no local source contract yet" },
    ],
  }
}
