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

interface LessonAccumulator {
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

function lessonKey(room: string): string {
  return `room:${room}`
}

function getOrCreateLesson(lessons: Map<string, LessonAccumulator>, room: string, startedAt: number): LessonAccumulator {
  const key = lessonKey(room)
  const existing = lessons.get(key)
  if (existing) {
    if (startedAt < existing.startedAt) existing.startedAt = startedAt
    return existing
  }
  const lesson: LessonAccumulator = {
    room,
    startedAt,
    endedAt: null,
    counts: { ...EMPTY_COUNTS },
    evidenceRefs: [],
    pdfPages: new Set(),
  }
  lessons.set(key, lesson)
  return lesson
}

function buildLessons(input: ProjectTeacherDashboardInput): LessonAccumulator[] {
  const lessons = new Map<string, LessonAccumulator>()

  for (const ev of [...input.lessonEvents].sort((a, b) => a.seq - b.seq)) {
    if (ev.kind === "lesson.started") {
      const lesson = getOrCreateLesson(lessons, ev.room, ev.t)
      addEvidence(lesson.evidenceRefs, ev.evidence)
    } else if (ev.kind === "lesson.ended") {
      const lesson = getOrCreateLesson(lessons, ev.room, ev.t)
      lesson.endedAt = ev.t
      addEvidence(lesson.evidenceRefs, ev.evidence)
    }
  }

  const journalEvents = input.journalEvents ?? []
  if (journalEvents.length > 0) {
    const room = input.journalRoom ?? "current"
    const firstJournalTime = Math.min(...journalEvents.map((ev) => ev.t).filter(Number.isFinite))
    const lesson = getOrCreateLesson(lessons, room, firstJournalTime)
    for (const ev of journalEvents) {
      addEvidence(lesson.evidenceRefs, journalEvidence(ev))
      switch (ev.type) {
        case "element.add":
          lesson.counts.elements += 1
          break
        case "math.insert":
          lesson.counts.mathInserts += 1
          break
        case "pdf.page.view":
          lesson.pdfPages.add(ev.page)
          lesson.counts.pdfPagesViewed = lesson.pdfPages.size
          break
        case "audio.chunk":
          lesson.counts.audioChunks += 1
          break
        case "element.delete":
        case "element.update":
        case "t0":
        case "t1":
          break
      }
    }
  }

  return [...lessons.values()].sort((a, b) => a.startedAt - b.startedAt || byString(a.room, b.room))
}

function projectGraphView(graph: LessonGraph, focusNodeId: string | null | undefined): TeacherDashboardProjection["graphView"] {
  const focus = focusNodeId ?? null
  const view = focus ? neighbors(graph, focus, 1) : null
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

function recurringErrors(graph: LessonGraph, locale: string): TeacherDashboardProjection["recurringErrors"] {
  const byConcept = new Map<string, TeacherDashboardProjection["recurringErrors"][number]>()
  for (const edge of graph.edges) {
    if (edge.kind !== "deriva-da") continue
    const errorNode = graph.nodes.get(edge.from)
    const conceptNode = graph.nodes.get(edge.to)
    if (errorNode?.kind !== "errore") continue
    const existing = byConcept.get(edge.to)
    const row = existing ?? {
      conceptId: edge.to,
      label: labelsFor(edge.to, locale, conceptNode?.labels),
      count: 0,
      firstSeen: errorNode.introducedAt,
      lastSeen: errorNode.introducedAt,
      correctedBy: [],
      evidenceRefs: [],
    }
    row.count += 1
    row.firstSeen = Math.min(row.firstSeen, errorNode.introducedAt)
    row.lastSeen = Math.max(row.lastSeen, errorNode.introducedAt)
    addEvidence(row.evidenceRefs, errorNode.evidenceRefs)
    addEvidence(row.evidenceRefs, edge.evidenceRefs)
    for (const correction of graph.edges) {
      if (correction.kind === "corregge" && correction.to === edge.to && !row.correctedBy.includes(correction.from)) {
        row.correctedBy.push(correction.from)
      }
    }
    row.correctedBy.sort(byString)
    byConcept.set(edge.to, row)
  }
  return [...byConcept.values()].sort((a, b) => byString(a.conceptId, b.conceptId))
}

function buildStats(
  lessons: readonly LessonAccumulator[],
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
    recurringErrors: recurringErrors(graph, input.locale),
    plugins: [],
    studentPackQueue: [],
    stats: buildStats(lessons, graph),
    publicProfile: null,
    unavailable: [
      { zone: "Z3", reason: "student aggregates require consent-scoped event types not present in v0" },
      { zone: "Z4", reason: "planned lessons require lesson.planned events" },
      { zone: "Z5", reason: "workspace material registry is not wired into this pure projector slice" },
      { zone: "Z6", reason: "plugin manifest registry is not wired into this pure projector slice" },
      { zone: "Z7", reason: "student-pack candidates require dedicated append-only events" },
      { zone: "Z10", reason: "export/import events are not in the current event-log schema" },
      { zone: "Z12", reason: "public profile has no local source contract yet" },
    ],
  }
}
