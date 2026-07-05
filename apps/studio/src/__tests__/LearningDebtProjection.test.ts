// Persistenza studente (event-log unica fonte): il learning-debt NON è una
// tabella ma una PROIEZIONE derivata deterministicamente dall'event-log
// (error.observed accumula; exercise.completed con correctsErrorId salda).
// Stesso log ⇒ stessa proiezione, sempre (replay-safe, zero stato proprio).

import { describe, expect, it } from "vitest"
import { InMemoryEventLog, type LessonOsEvent } from "../lessonos/eventlog"
import { projectLearningDebt } from "../lessonos/learningDebtProjection"

const T0 = 1_783_000_000_000

function errorObserved(errorId: string, t: number, studentId?: string): LessonOsEvent {
  return {
    kind: "error.observed",
    errorId,
    conceptId: "concept:ohm",
    labels: { it: `errore ${errorId}` },
    t,
    evidence: [`journal:test@${t}`],
    ...(studentId !== undefined ? { studentId } : {}),
  }
}

function exerciseCompleted(exerciseId: string, t: number, correctsErrorId?: string, studentId?: string): LessonOsEvent {
  return {
    kind: "exercise.completed",
    exerciseId,
    labels: { it: `esercizio ${exerciseId}` },
    t,
    evidence: [`journal:test@${t}`],
    ...(correctsErrorId !== undefined ? { correctsErrorId } : {}),
    ...(studentId !== undefined ? { studentId } : {}),
  }
}

async function logWith(events: LessonOsEvent[]) {
  const log = new InMemoryEventLog()
  for (const ev of events) await log.append(ev)
  return log.readAll()
}

describe("projectLearningDebt (proiezione derivata, mai stored)", () => {
  it("errore osservato due volte senza correzione = debito aperto con count 2", async () => {
    const events = await logWith([
      errorObserved("error:polarita-led", T0),
      errorObserved("error:polarita-led", T0 + 1000),
    ])
    const debts = projectLearningDebt(events)
    expect(debts).toHaveLength(1)
    expect(debts[0]).toMatchObject({
      errorId: "error:polarita-led",
      conceptId: "concept:ohm",
      observedCount: 2,
      open: true,
    })
    // provenienza: ogni debito porta l'evidence delle osservazioni
    expect(debts[0]!.evidence.length).toBeGreaterThan(0)
  })

  it("exercise.completed con correctsErrorId SALDA il debito (open=false)", async () => {
    const events = await logWith([
      errorObserved("error:polarita-led", T0),
      exerciseCompleted("ex:led-1", T0 + 5000, "error:polarita-led"),
    ])
    const debts = projectLearningDebt(events)
    expect(debts).toHaveLength(1)
    expect(debts[0]!.open).toBe(false)
    expect(debts[0]!.correctedAtT).toBe(T0 + 5000)
  })

  it("errore RI-osservato dopo la correzione riapre il debito (errore ricorrente)", async () => {
    const events = await logWith([
      errorObserved("error:polarita-led", T0),
      exerciseCompleted("ex:led-1", T0 + 5000, "error:polarita-led"),
      errorObserved("error:polarita-led", T0 + 9000),
    ])
    const debts = projectLearningDebt(events)
    expect(debts).toHaveLength(1)
    expect(debts[0]!.open).toBe(true)
    expect(debts[0]!.observedCount).toBe(2)
  })

  it("exercise senza correctsErrorId non salda nulla", async () => {
    const events = await logWith([
      errorObserved("error:corto", T0),
      exerciseCompleted("ex:generico", T0 + 1000),
    ])
    expect(projectLearningDebt(events)[0]!.open).toBe(true)
  })

  it("filtro studentId: il debito di uno studente non salda quello di un altro", async () => {
    const events = await logWith([
      errorObserved("error:corto", T0, "student:anna"),
      errorObserved("error:corto", T0 + 100, "student:bruno"),
      exerciseCompleted("ex:corto-1", T0 + 2000, "error:corto", "student:anna"),
    ])
    const anna = projectLearningDebt(events, { studentId: "student:anna" })
    const bruno = projectLearningDebt(events, { studentId: "student:bruno" })
    expect(anna).toHaveLength(1)
    expect(anna[0]!.open).toBe(false)
    expect(bruno).toHaveLength(1)
    expect(bruno[0]!.open).toBe(true)
  })

  it("determinismo replay: stesso log ⇒ proiezione identica (deep-equal)", async () => {
    const events = await logWith([
      errorObserved("error:a", T0),
      errorObserved("error:b", T0 + 1),
      exerciseCompleted("ex:1", T0 + 2, "error:a"),
    ])
    expect(projectLearningDebt(events)).toEqual(projectLearningDebt(events))
  })
})

describe("quiz.attempted (nuovo kind per-studente)", () => {
  it("è appendabile sul log con evidence obbligatoria", async () => {
    const log = new InMemoryEventLog()
    const appended = await log.append({
      kind: "quiz.attempted",
      quizId: "quiz:cap3-1",
      conceptId: "concept:ohm",
      studentId: "student:anna",
      correct: 7,
      total: 10,
      labels: { it: "Quiz cap.3 — 7/10" },
      t: T0,
      evidence: [`lesson:room-x@${T0}`],
    })
    expect(appended.seq).toBeGreaterThan(0)
  })

  it("senza evidence viene RIFIUTATO (nessun fatto senza provenienza)", async () => {
    const log = new InMemoryEventLog()
    await expect(
      log.append({
        kind: "quiz.attempted",
        quizId: "quiz:cap3-1",
        correct: 1,
        total: 10,
        labels: { it: "quiz" },
        t: T0,
        evidence: [],
      }),
    ).rejects.toThrow(/evidence/i)
  })
})
