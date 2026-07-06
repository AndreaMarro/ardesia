// @vitest-environment node
//
// Producer quiz.attempted (P0 "manca chi emette"): dalla correzione stateless
// del backend (QuizGradeResponse) al fatto sull'event-log. Il producer MAPPA,
// non giudica: il punteggio resta del backend; incoerenze = throw, mai un
// evento inventato.

import { describe, expect, it } from "vitest"
import type { QuizGradeResponse } from "../lessonos/apiClient"
import { InMemoryEventLog } from "../lessonos/eventlog"
import {
  quizAttemptEventFromGrade,
  recordQuizAttempt,
} from "../lessonos/quizAttemptProducer"

const GRADE: QuizGradeResponse = {
  saved_id: "s1",
  lesson_id: "l1",
  results: [
    { atom_id: "a1", question: "Dove va l'anodo?", selected_index: 0, correct_index: 0, correct: true },
    { atom_id: "a2", question: "Serve il resistore?", selected_index: 1, correct_index: 0, correct: false },
  ],
  score: 1,
  total: 2,
}

const OPTS = { t: 1720200000000, labels: { it: "Il LED" } }

describe("quizAttemptEventFromGrade", () => {
  it("mappa la correzione del backend in un quiz.attempted con evidence", () => {
    const event = quizAttemptEventFromGrade(GRADE, OPTS)

    expect(event).toEqual({
      kind: "quiz.attempted",
      quizId: "s1",
      correct: 1,
      total: 2,
      labels: { it: "Il LED" },
      t: 1720200000000,
      evidence: ["quiz:s1", "lessonos-lesson:l1", "quiz-atom:a1", "quiz-atom:a2"],
    })
  })

  it("aggiunge lesson:<room>@<t> SOLO quando la room e' nota (mai inventata)", () => {
    const event = quizAttemptEventFromGrade(GRADE, { ...OPTS, room: "aula-3b" })
    expect(event.evidence).toContain("lesson:aula-3b@1720200000000")

    const senzaRoom = quizAttemptEventFromGrade(GRADE, OPTS)
    expect(senzaRoom.evidence.some((ref) => ref.startsWith("lesson:"))).toBe(false)
  })

  it("attribuisce lo studente solo se fornito", () => {
    const event = quizAttemptEventFromGrade(GRADE, { ...OPTS, studentId: "stu-7" })
    expect(event.studentId).toBe("stu-7")
    expect("studentId" in quizAttemptEventFromGrade(GRADE, OPTS)).toBe(false)
  })

  it("rifiuta una correzione senza results: nessun fatto senza sostanza", () => {
    expect(() => quizAttemptEventFromGrade({ ...GRADE, results: [] }, OPTS)).toThrow(
      /senza risultati/,
    )
  })

  it("rifiuta score/total del backend incoerenti coi results (drift di contratto)", () => {
    expect(() => quizAttemptEventFromGrade({ ...GRADE, score: 2 }, OPTS)).toThrow(/incoerente/)
    expect(() => quizAttemptEventFromGrade({ ...GRADE, total: 5 }, OPTS)).toThrow(/incoerente/)
  })

  it("accetta score/total assenti (campi opzionali del contratto OpenAPI)", () => {
    const { score: _s, total: _t, ...senzaPunteggio } = GRADE
    const event = quizAttemptEventFromGrade(senzaPunteggio, OPTS)
    expect(event.correct).toBe(1)
    expect(event.total).toBe(2)
  })
})

describe("recordQuizAttempt", () => {
  it("appende sull'event-log e restituisce l'evento con seq", async () => {
    const log = new InMemoryEventLog()
    const appended = await recordQuizAttempt(log, GRADE, OPTS)

    expect(appended.seq).toBe(1)
    expect(appended.kind).toBe("quiz.attempted")
    const all = await log.readAll()
    expect(all).toHaveLength(1)
    expect(all[0]).toEqual(appended)
    expect(appended.correct).toBe(1)
  })
})
