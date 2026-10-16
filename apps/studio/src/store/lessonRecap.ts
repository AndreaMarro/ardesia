// MAESTRO-Studio — Recap lezione
// Costruisce dati riepilogo di una lezione leggendo events.jsonl + meta.json.
// Linguaggio docente: mai flush/cache, "appunti salvati".

import { type WorkspaceStore } from "./WorkspaceStore"
import { PATHS } from "./types"
import type { JournalEnvelopeV2, JournalEvent } from "./JournalRecorder"
import type { EventEvidence } from "../core/contracts/eventEnvelope"
import { decodeJournalJsonl, ReplayEngine } from "./ReplayEngine"
import { roomPaths } from "./roomPaths"

export interface LessonRecap {
  v: 1
  /** Final visible board text, with original element and evidence identity. */
  boardTexts?: ReadonlyArray<Readonly<{ elementId: string; text: string; evidence: readonly EventEvidence[] }>>
  /** An import is not evidence that a page was observed. */
  pdfReferences?: ReadonlyArray<Readonly<{
    documentId: string | null; documentName: string | null; page: number
    status: "imported" | "observed"; evidence: readonly EventEvidence[]
  }>>
  /** Nome della lezione (da meta.json) */
  title: string
  /** Durata in millisecondi (max-min dei timestamp journal validi) */
  durationMs: number
  /** Formula LaTeX uniche inserite durante la lezione */
  mathFormulas: string[]
  /** Conteggio elementi aggiunti per tipo Excalidraw */
  elementTypeCounts: Record<string, number>
  /** Numero totale di elementi aggiunti */
  totalElementsAdded: number
  /** Pagine PDF uniche visualizzate (numeri 1-based) */
  pdfPagesViewed: number[]
  /** Timestamp epoch ms del primo evento journal */
  firstEventTime: number | null
  /** Timestamp epoch ms dell'ultimo evento journal */
  lastEventTime: number | null
}

/**
 * Costruisce il recap di una lezione leggendo i dati persistenti.
 * Restituisce un oggetto LessonRecap, o null se non ci sono dati sufficienti.
 * Linguaggio: mai "flush"/"cache"/"workspace" nei label — solo "appunti salvati".
 */
export async function buildRecap(
  store: Pick<WorkspaceStore, "read" | "loadMeta">,
  room: string,
): Promise<LessonRecap | null> {
  // 1. Carica meta (nome lezione)
  const meta = await store.loadMeta(room)
  const title = meta?.name ?? "Lezione senza nome"

  const source = roomPaths(room).journal
  const scopedBlob = await store.read(source)
  // Legacy compatibility is explicit and only applies when the room artifact
  // is absent. A present empty or unreadable canonical journal is authoritative.
  const journalBlob = scopedBlob ?? await store.read(PATHS.JOURNAL)
  const text = journalBlob ? await journalBlob.text() : ""
  let envelopes: readonly JournalEnvelopeV2[] | null = null
  let events: JournalEvent[]
  if (scopedBlob !== null) {
    const decoded = decodeJournalJsonl(text, source)
    if (decoded.issues.length > 0) throw new Error(`${source}: journal incompleto alla riga ${decoded.issues[0]!.line}`)
    envelopes = decoded.envelopes
    events = [...decoded.legacy]
  } else {
    events = text.trim().split("\n").filter(Boolean).map(line => {
      try { return JSON.parse(line) as JournalEvent } catch { return null }
    }).filter((event): event is JournalEvent => event !== null)
  }

  // Il journal puo essere out-of-order (merge di chunk, import): min/max, non primo/ultimo.
  // t corrotto (boundary: file su disco) esclude l'evento SOLO dalla durata,
  // non dalle aggregazioni (formule/elementi/pagine restano contati).
  let firstEventTime: number | null = null
  let lastEventTime: number | null = null
  // Some canonical events (notably PDF imports) intentionally have no legacy
  // projection. Their occurrence still counts as activity, never as observation.
  const timestamps = envelopes === null ? events.map(event => event.t) : envelopes.map(event => Date.parse(event.occurredAt))
  for (const timestamp of timestamps) {
    if (typeof timestamp !== "number" || !Number.isFinite(timestamp)) continue
    if (firstEventTime === null || timestamp < firstEventTime) firstEventTime = timestamp
    if (lastEventTime === null || timestamp > lastEventTime) lastEventTime = timestamp
  }

  // 3. Estrai formula LaTeX uniche
  const mathFormulas = new Set<string>()
  const elementTypeCounts: Record<string, number> = {}

  for (const ev of events) {
    if (ev.type === "math.insert" && typeof ev.latex === "string") {
      mathFormulas.add(ev.latex.trim())
    }
    if (ev.type === "element.add") {
      const el = ev.element as Record<string, unknown> | null
      if (el && typeof el === "object" && !Array.isArray(el)) {
        const etype = typeof el.type === "string" ? el.type : "unknown"
        elementTypeCounts[etype] = (elementTypeCounts[etype] ?? 0) + 1
      }
    }
  }

  const totalElementsAdded = Object.values(elementTypeCounts).reduce((a, b) => a + b, 0)

  const pdfReferences: NonNullable<LessonRecap["pdfReferences"]> = envelopes === null ? [] : envelopes
    .filter(event => event.kind === "journal.pdf.imported" || event.kind === "journal.pdf.page-observed")
    .map(event => ({ documentId: event.payload.documentId, documentName: event.payload.documentName, page: event.payload.page,
      status: event.kind === "journal.pdf.page-observed" ? "observed" as const : "imported" as const,
      evidence: event.evidence }))
  const pdfPages = new Set<number>()
  if (envelopes !== null) {
    for (const ref of pdfReferences) if (ref.status === "observed") pdfPages.add(ref.page)
  } else for (const ev of events) {
    if (ev.type === "pdf.page.view" && Number.isInteger(ev.page) && ev.page > 0) pdfPages.add(ev.page)
  }
  const textEvidence = new Map<string, readonly EventEvidence[]>()
  for (const event of envelopes ?? []) {
    if (event.kind === "journal.element.add" || event.kind === "journal.element.update") {
      textEvidence.set(String(event.payload.element.id), event.evidence)
    }
  }
  const boardTexts: NonNullable<LessonRecap["boardTexts"]> = envelopes === null ? [] : new ReplayEngine().replay(events)
    .filter(element => element.type === "text" && typeof element.text === "string" && !element.isDeleted)
    .map(element => ({ elementId: String(element.id), text: element.text as string,
      evidence: textEvidence.get(String(element.id)) ?? [] }))

  const durationMs = firstEventTime !== null && lastEventTime !== null ? lastEventTime - firstEventTime : 0

  return {
    v: 1,
    title,
    durationMs,
    mathFormulas: [...mathFormulas].sort(),
    elementTypeCounts,
    totalElementsAdded,
    pdfPagesViewed: [...pdfPages].sort((a, b) => a - b),
    firstEventTime,
    lastEventTime,
    ...(envelopes === null ? {} : { boardTexts, pdfReferences }),
  }
}

/**
 * Formatta durata in millisecondi in stringa leggibile.
 * Esempi: "3 minuti", "1 ora e 12 minuti", "—" (se 0)
 */
export function formatDuration(durationMs: number): string {
  if (durationMs <= 0) return "—"
  const totalSeconds = Math.round(durationMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  const mLabel = minutes === 1 ? "minuto" : "minuti"
  if (hours > 0) {
    const hLabel = hours === 1 ? "ora" : "ore"
    if (minutes > 0) {
      return `${hours} ${hLabel} e ${minutes} ${mLabel}`
    }
    return `${hours} ${hLabel}`
  }
  if (minutes > 0) {
    return `${minutes} ${mLabel}`
  }
  return "meno di un minuto"
}
