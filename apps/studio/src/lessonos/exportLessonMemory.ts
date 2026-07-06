// Golden-path §8 segmento "export" — la memoria della lezione esce come UN
// file JSON versionato. Modulo puro: legge l'event-log (readAll, l'ordine
// del log È l'ordine della verità) e produce un oggetto serializzabile; il
// download è della vista. Il timestamp arriva dal chiamante: qui non si
// inventano tempi (stessa disciplina dell'event-log).

import type { AppendedEvent, EventLogStore } from "./eventlog"

/** Versione del formato: cambia SOLO con un cambiamento di schema dichiarato. */
export const LESSON_MEMORY_FORMAT = "ardesia.lesson-memory/1"

export type LessonMemoryExport = {
  format: typeof LESSON_MEMORY_FORMAT
  /** Timestamp dell'export (ms epoch), fornito dal chiamante. */
  exportedAt: number
  /** Esperimento della vista, quando noto; mai inventato. */
  experimentId?: string
  /** Tutti gli eventi, ordine di seq del log. */
  events: AppendedEvent[]
}

export async function buildLessonMemoryExport(
  log: EventLogStore,
  options: { experimentId?: string; now: number },
): Promise<LessonMemoryExport> {
  const events = await log.readAll()
  return {
    format: LESSON_MEMORY_FORMAT,
    exportedAt: options.now,
    ...(options.experimentId !== undefined ? { experimentId: options.experimentId } : {}),
    events,
  }
}

/**
 * Nome file deterministico dato il timestamp: "lezione[-<esperimento>]-
 * <ISO senza due punti>.json" (i ":" non sono ammessi nei filename).
 */
export function lessonMemoryFileName(experimentId: string | undefined, now: number): string {
  const stamp = new Date(now).toISOString().slice(0, 19).replace(/:/g, "-")
  return experimentId === undefined
    ? `lezione-${stamp}.json`
    : `lezione-${experimentId}-${stamp}.json`
}
