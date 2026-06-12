// MAESTRO-Studio — Recap lezione
// Costruisce dati riepilogo di una lezione leggendo events.jsonl + meta.json.
// Linguaggio docente: mai flush/cache, "appunti salvati".

import { type WorkspaceStore } from "./WorkspaceStore"
import { PATHS } from "./types"
import type { JournalEvent } from "./JournalRecorder"

export interface LessonRecap {
  v: 1
  /** Nome della lezione (da meta.json) */
  title: string
  /** Durata in millisecondi (da primo a ultimo evento journal) */
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
  store: WorkspaceStore,
  room: string,
): Promise<LessonRecap | null> {
  // 1. Carica meta (nome lezione)
  const meta = await store.loadMeta(room)
  const title = meta?.name ?? "Lezione senza nome"

  // 2. Carica events.jsonl e analizza
  const journalBlob = await store.read(PATHS.JOURNAL)
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

  const firstEventTime = events[0].t
  const lastEventTime = events[events.length - 1].t

  // 3. Estrai formula LaTeX uniche
  const mathFormulas = new Set<string>()
  const elementTypeCounts: Record<string, number> = {}

  for (const ev of events) {
    if (ev.type === "math.insert") {
      mathFormulas.add(ev.latex.trim())
    }
    if (ev.type === "element.add") {
      const el = ev.element as Record<string, unknown> | null
      if (el && typeof el === "object") {
        el satisfies Record<string, unknown>
        const etype = typeof el.type === "string" ? el.type : "unknown"
        elementTypeCounts[etype] = (elementTypeCounts[etype] ?? 0) + 1
      }
    }
  }

  const totalElementsAdded = Object.values(elementTypeCounts).reduce((a, b) => a + b, 0)

  // 4. Pagine PDF uniche visualizzate
  const pdfPages = new Set<number>()
  for (const ev of events) {
    if (ev.type === "pdf.page.view") {
      pdfPages.add(ev.page)
    }
  }

  const durationMs = lastEventTime - firstEventTime

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

  if (hours > 0) {
    const hLabel = hours === 1 ? "ora" : "ore"
    if (minutes > 0) {
      return `${hours} ${hLabel} e ${minutes} minuti`
    }
    return `${hours} ${hLabel}`
  }
  if (minutes > 0) {
    return `${minutes} minuti`
  }
  return "meno di un minuto"
}
