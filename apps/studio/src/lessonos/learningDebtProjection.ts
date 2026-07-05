// LessonOS — learning-debt come PROIEZIONE derivata dall'event-log (unica fonte).
// Nessuna tabella propria: `error.observed` accumula debito, `exercise.completed`
// con `correctsErrorId` lo salda, una ri-osservazione successiva lo riapre
// (errore ricorrente). Funzione pura: stesso log ⇒ stessa proiezione (replay-safe).

import type { AppendedEvent, EvidenceRef } from "./eventlog"

export interface LearningDebt {
  errorId: string
  conceptId: string
  /** Quante volte l'errore è stato osservato (totale, incluse ricorrenze post-correzione). */
  observedCount: number
  firstObservedT: number
  lastObservedT: number
  /** Timestamp dell'ultima correzione, se mai avvenuta. */
  correctedAtT?: number
  /** true = debito da saldare (ultima osservazione dopo l'ultima correzione, o mai corretto). */
  open: boolean
  /** Provenienza: evidence di tutte le osservazioni e correzioni che compongono il debito. */
  evidence: EvidenceRef[]
}

export interface LearningDebtOptions {
  /**
   * Se presente, proietta il debito del solo studente indicato (eventi con
   * `studentId` diverso vengono ignorati; eventi SENZA studentId restano
   * esclusi: un fatto non attribuito non è debito personale di nessuno).
   * Assente = proiezione di classe (tutti gli eventi, attribuiti o no).
   */
  studentId?: string
}

interface DebtAccumulator {
  debt: LearningDebt
  lastCorrectionT: number
}

/**
 * Deriva i learning-debt dall'event-log. L'ordine di verità è `seq` (l'ordine
 * del log), non il timestamp: il log è append-only e la proiezione lo rispetta.
 */
export function projectLearningDebt(
  events: readonly AppendedEvent[],
  opts: LearningDebtOptions = {},
): LearningDebt[] {
  const byError = new Map<string, DebtAccumulator>()
  const wanted = opts.studentId

  const matches = (studentId: string | undefined): boolean =>
    wanted === undefined || studentId === wanted

  for (const ev of [...events].sort((a, b) => a.seq - b.seq)) {
    if (ev.kind === "error.observed" && matches(ev.studentId)) {
      const acc = byError.get(ev.errorId)
      if (acc) {
        acc.debt.observedCount += 1
        acc.debt.lastObservedT = ev.t
        acc.debt.open = true
        acc.debt.evidence.push(...ev.evidence)
      } else {
        byError.set(ev.errorId, {
          lastCorrectionT: Number.NEGATIVE_INFINITY,
          debt: {
            errorId: ev.errorId,
            conceptId: ev.conceptId,
            observedCount: 1,
            firstObservedT: ev.t,
            lastObservedT: ev.t,
            open: true,
            evidence: [...ev.evidence],
          },
        })
      }
    } else if (ev.kind === "exercise.completed" && ev.correctsErrorId && matches(ev.studentId)) {
      const acc = byError.get(ev.correctsErrorId)
      if (acc) {
        acc.lastCorrectionT = ev.t
        acc.debt.correctedAtT = ev.t
        acc.debt.open = false
        acc.debt.evidence.push(...ev.evidence)
      }
      // correzione di un errore mai osservato: nessun debito da saldare, nessuna invenzione
    }
  }

  return [...byError.values()].map((acc) => ({ ...acc.debt, evidence: [...acc.debt.evidence] }))
}
