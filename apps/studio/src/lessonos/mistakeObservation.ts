// LessonOS — emittente error.observed, sostanza pura (P0 dopo #67+#68+#70).
// Sorgente: common_mistakes e concepts_learned della lezione. Il mapping
// errore→concetto NON esiste nel dato e NON viene inventato: lo sceglie il
// docente sulla superficie di marcatura; qui solo estrazione e costruzione
// del payload bus "error.observed" (eventBus.ts), che il binding host
// promuove a fatto sull'event-log.

import type { ArdesiaEventMap } from "../core/contracts/eventBus"

export type MistakeObservedBusEvent = ArdesiaEventMap["error.observed"]

/** Sottoinsieme del lesson-path del Pack consumato da questo modulo. */
export interface LessonPathPhases {
  experiment_id: string
  phases: Array<{
    name?: string
    common_mistakes?: Array<{
      mistake: string
      teacher_response?: string | null
      analogy?: string | null
    }>
    concepts_learned?: string[]
  }>
}

export interface MistakeObservation {
  /** Stabile per file: `<experimentId>:mistake-<n>` (1-based, ordine del Pack). */
  errorId: string
  mistake: string
  teacherResponse?: string
  analogy?: string
}

export interface LessonConcept {
  /** Id neutro derivato deterministicamente dalla label (canon: concept_id neutro). */
  conceptId: string
  label: string
}

/** Id neutro: minuscole, accenti rimossi, tutto il resto collassato in `-`. */
export function slugifyConceptId(label: string): string {
  const slug = label
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  if (slug === "") {
    throw new Error(`slugifyConceptId: label "${label}" produce un id vuoto`)
  }
  return slug
}

/** Le common_mistakes della fase CHIEDI; assenti = lista vuota, mai inventata. */
export function listMistakeObservations(lessonPath: LessonPathPhases): MistakeObservation[] {
  const chiedi = lessonPath.phases.find((phase) => phase.name === "CHIEDI")
  const mistakes = chiedi?.common_mistakes ?? []
  return mistakes.map((entry, index) => ({
    errorId: `${lessonPath.experiment_id}:mistake-${index + 1}`,
    mistake: entry.mistake,
    ...(entry.teacher_response != null ? { teacherResponse: entry.teacher_response } : {}),
    ...(entry.analogy != null ? { analogy: entry.analogy } : {}),
  }))
}

/** I concepts_learned (fase CONCLUDI) come concetti selezionabili dal docente. */
export function listLessonConcepts(lessonPath: LessonPathPhases): LessonConcept[] {
  const concepts = lessonPath.phases.flatMap((phase) => phase.concepts_learned ?? [])
  return concepts.map((label) => ({ conceptId: slugifyConceptId(label), label }))
}

export interface MistakeObservedInput {
  experimentId: string
  evidence: string[]
  observation: MistakeObservation
  /** Concetto SCELTO dal docente (nessun default: il modulo non attribuisce da solo). */
  concept: LessonConcept
  /** Timestamp ms epoch fornito dal chiamante. */
  t: number
  studentId?: string
}

/** Payload bus "error.observed": evidence = il Pack che dichiara la tassonomia. */
export function mistakeObservedBusEvent(input: MistakeObservedInput): MistakeObservedBusEvent {
  return {
    errorId: input.observation.errorId,
    conceptId: input.concept.conceptId,
    ...(input.studentId !== undefined ? { studentId: input.studentId } : {}),
    labels: { it: input.observation.mistake },
    t: input.t,
    evidence: [...input.evidence],
  }
}
