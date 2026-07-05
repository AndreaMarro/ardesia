// LessonOS — producer di `quiz.attempted` (P0: kind e proiezione esistono da
// #66, questo modulo è chi emette). Il fatto registrato è la correzione
// STATELESS del backend (ARCHITECTURE-CANON: quiz grading senza tabella
// punteggi): qui si mappa la QuizGradeResponse in un evento con evidence,
// senza rifare il punteggio. Incoerenze tra score/total dichiarati dal
// backend e i results = throw: nessun evento inventato, fail-closed.

import type { QuizGradeResponse } from "./apiClient"
import type { EventLogStore, Labels, LessonOsEvent } from "./eventlog"

/** Il membro preciso dell'unione: chi consuma il producer non deve ri-narroware. */
export type QuizAttemptedEvent = Extract<LessonOsEvent, { kind: "quiz.attempted" }>

export interface QuizAttemptOptions {
  /** Timestamp ms epoch fornito dal chiamante (il log non inventa tempi). */
  t: number
  /** Label multilingua del quiz (es. titolo della lezione salvata). */
  labels: Labels
  /** Room della lezione; assente = MAI inventata (stessa regola di BoardCitation §2.5). */
  room?: string
  /** Studente cui attribuire il tentativo; assente = non attribuito. */
  studentId?: string
}

/**
 * Mappa la correzione del backend in un evento `quiz.attempted`.
 * Evidence: il quiz corretto, la lezione LessonOS sorgente, gli atom valutati,
 * più `lesson:<room>@<t>` solo quando la room è nota.
 */
export function quizAttemptEventFromGrade(
  grade: QuizGradeResponse,
  options: QuizAttemptOptions,
): QuizAttemptedEvent {
  if (grade.results.length === 0) {
    throw new Error(
      `quiz.attempted rifiutato: correzione di "${grade.saved_id}" senza risultati`,
    )
  }

  const correct = grade.results.filter((result) => result.correct).length
  const total = grade.results.length
  if (grade.score !== undefined && grade.score !== correct) {
    throw new Error(
      `quiz.attempted rifiutato: score backend ${grade.score} incoerente coi results (${correct} corretti)`,
    )
  }
  if (grade.total !== undefined && grade.total !== total) {
    throw new Error(
      `quiz.attempted rifiutato: total backend ${grade.total} incoerente coi results (${total})`,
    )
  }

  const evidence = [
    `quiz:${grade.saved_id}`,
    `lessonos-lesson:${grade.lesson_id}`,
    ...grade.results.map((result) => `quiz-atom:${result.atom_id}`),
  ]
  if (options.room !== undefined) {
    evidence.push(`lesson:${options.room}@${options.t}`)
  }

  return {
    kind: "quiz.attempted",
    quizId: grade.saved_id,
    ...(options.studentId !== undefined ? { studentId: options.studentId } : {}),
    correct,
    total,
    labels: options.labels,
    t: options.t,
    evidence,
  }
}

/** Appende il tentativo sull'event-log (append-only, evidence validata dal log). */
export async function recordQuizAttempt(
  log: EventLogStore,
  grade: QuizGradeResponse,
  options: QuizAttemptOptions,
): Promise<QuizAttemptedEvent & { readonly seq: number }> {
  const event = quizAttemptEventFromGrade(grade, options)
  const appended = await log.append(event)
  return { ...event, seq: appended.seq }
}
