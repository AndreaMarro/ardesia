// MAESTRO-Studio — LessonOutcome: thin waist del post-lezione.
//
// Composizione, NON copia: riusa LessonRecap (che cosa e' successo
// materialmente) e StudyDigest (che cosa e' successo didatticamente) per
// riferimento, aggiungendo solo identita' esplicita e la distinzione
// "digest disponibile" / "digest non disponibile" — che non sono lo stesso
// fatto e non devono collassare nello stesso null.
//
// Proiezione pura e deterministica: nessun I/O, nessun timestamp inventato,
// nessuna persistenza (quella verra' solo se necessaria). Primo consumer:
// buildRecapHtml (renderer umano del materiale).
//
// Forma "ardesia.lesson-outcome/1": stessa convenzione di
// LESSON_MEMORY_FORMAT (exportLessonMemory), che resta separato perche' e'
// raw history (tutti gli eventi), non derived outcome.

import type { LessonRecap } from "./lessonRecap"
import type { StudyDigest } from "../lessonos/studyDigest"

/** Versione del formato: cambia SOLO con un cambiamento di schema dichiarato. */
export const LESSON_OUTCOME_FORMAT = "ardesia.lesson-outcome/1" as const

export type LessonOutcomeV1 = Readonly<{
  format: typeof LESSON_OUTCOME_FORMAT
  /** Lesson canonica (lo stesso lessonId di EventEnvelope/room). Mai dedotto dal titolo. */
  lessonId: string
  /** Fatti materiali della lezione, riusati — non copiati. */
  recap: LessonRecap
  /** Fatti didattici: disponibili (anche vuoti) oppure non disponibili. */
  pedagogy:
    | Readonly<{ status: "available"; digest: StudyDigest }>
    | Readonly<{ status: "unavailable" }>
}>

/**
 * Costruisce l'outcome da pezzi gia' esistenti. `digest === null` copre sia
 * "event log non leggibile" sia "digest non calcolabile": in entrambi i casi
 * il recap base resta utilizzabile (fail-soft del chiamante) e nessuna
 * pedagogia viene inventata.
 */
export function createLessonOutcome(
  lessonId: string,
  recap: LessonRecap,
  digest: StudyDigest | null,
): LessonOutcomeV1 {
  return Object.freeze({
    format: LESSON_OUTCOME_FORMAT,
    lessonId,
    recap,
    pedagogy:
      digest === null
        ? Object.freeze({ status: "unavailable" as const })
        : Object.freeze({ status: "available" as const, digest }),
  })
}
