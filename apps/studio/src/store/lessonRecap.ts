// MAESTRO-Studio — Recap lezione
// Costruisce dati riepilogo di una lezione leggendo events.jsonl + meta.json.
// Linguaggio docente: mai flush/cache, "appunti salvati".

import { type WorkspaceStore } from "./WorkspaceStore"
import { roomPaths } from "./roomPaths"
import type { JournalEvent } from "./JournalRecorder"

export interface LessonRecap {
  v: 1
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
  store: Pick<WorkspaceStore, "loadMeta" | "read">,
  room: string,
): Promise<LessonRecap | null> {
  // Validate before the first store access: hostile IDs must fail without reads.
  const paths = roomPaths(room)

  // 1. Carica meta (nome lezione)
  const meta = await store.loadMeta(room)
  const title = meta?.name ?? "Lezione senza nome"

  // 2. Carica events.jsonl e analizza
  const journalBlob = await store.read(paths.journal)
  if (!journalBlob) {
    return {
      v: 1,
      title,
      durationMs: 0,
      mathFormulas: [],
      elementTypeCounts: {},
      totalElementsAdded: 0,
      pdfPagesViewed: [],
      firstEventTime: null,
      lastEventTime: null,
    }
  }

  const text = await journalBlob.text()
  const events: JournalEvent[] = text
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line) as JournalEvent
      } catch {
        return null
      }
    })
    .filter((e): e is JournalEvent => e !== null)

  if (events.length === 0) {
    return {
      v: 1,
      title,
      durationMs: 0,
      mathFormulas: [],
      elementTypeCounts: {},
      totalElementsAdded: 0,
      pdfPagesViewed: [],
      firstEventTime: null,
      lastEventTime: null,
    }
  }

  // Il journal puo essere out-of-order (merge di chunk, import): min/max, non primo/ultimo.
  // t corrotto (boundary: file su disco) esclude l'evento SOLO dalla durata,
  // non dalle aggregazioni (formule/elementi/pagine restano contati).
  let firstEventTime: number | null = null
  let lastEventTime: number | null = null
  for (const ev of events) {
    if (typeof ev.t !== "number" || !Number.isFinite(ev.t)) continue
    if (firstEventTime === null || ev.t < firstEventTime) firstEventTime = ev.t
    if (lastEventTime === null || ev.t > lastEventTime) lastEventTime = ev.t
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

  // 4. Pagine PDF uniche visualizzate
  const pdfPages = new Set<number>()
  for (const ev of events) {
    if (ev.type === "pdf.page.view" && Number.isInteger(ev.page) && ev.page > 0) {
      pdfPages.add(ev.page)
    }
  }

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
