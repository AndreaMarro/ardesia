import { describe, it, expect } from "vitest"
import {
  createLessonOutcome,
  LESSON_OUTCOME_FORMAT,
  type LessonOutcomeV1,
} from "../store/lessonOutcome"
import type { LessonRecap } from "../store/lessonRecap"
import type { StudyDigest } from "../lessonos/studyDigest"

const RECAP: LessonRecap = {
  v: 1,
  title: "Primo LED",
  durationMs: 1000 * 60 * 12,
  mathFormulas: ["V = R \\cdot I"],
  elementTypeCounts: { rectangle: 3 },
  totalElementsAdded: 3,
  pdfPagesViewed: [29],
  firstEventTime: 1000,
  lastEventTime: 1000 + 1000 * 60 * 12,
}

const DIGEST: StudyDigest = {
  concepts: [{ id: "circuito_chiuso", label: "Circuito chiuso", evidence: ["manual:page:29"] }],
  errors: [],
}

describe("LessonOutcomeV1 (thin waist post-lezione)", () => {
  it("A — identity: dichiara la lesson, mai dedotta dal titolo", async () => {
    const outcome = createLessonOutcome("lezione-fisica-1", { ...RECAP, title: "Titolo docente qualunque" }, DIGEST)
    expect(outcome.format).toBe(LESSON_OUTCOME_FORMAT)
    expect(outcome.lessonId).toBe("lezione-fisica-1")
    const parsed = JSON.parse(JSON.stringify(outcome)) as LessonOutcomeV1
    expect(parsed).toEqual(outcome)
  })

  it("B — pedagogy available: digest valido anche vuoto, riusato per riferimento", async () => {
    const outcome = createLessonOutcome("lezione-a", RECAP, { concepts: [], errors: [] })
    expect(outcome.pedagogy).toEqual({ status: "available", digest: { concepts: [], errors: [] } })
  })

  it("C — pedagogy unavailable: distinta da digest vuoto, recap intatto", async () => {
    const outcome = createLessonOutcome("lezione-a", RECAP, null)
    expect(outcome.pedagogy).toEqual({ status: "unavailable" })
    expect(outcome.recap).toBe(RECAP)
  })

  it("composizione, non copia: recap e digest restano gli stessi oggetti", async () => {
    const outcome = createLessonOutcome("lezione-a", RECAP, DIGEST)
    expect(outcome.recap).toBe(RECAP)
    if (outcome.pedagogy.status !== "available") throw new Error("atteso available")
    expect(outcome.pedagogy.digest).toBe(DIGEST)
  })

  it("deterministico: stesso input → stesso outcome, nessun timestamp inventato", async () => {
    const first = createLessonOutcome("lezione-a", RECAP, DIGEST)
    const second = createLessonOutcome("lezione-a", RECAP, DIGEST)
    expect(second).toEqual(first)
    expect(JSON.stringify(first)).not.toContain("generatedAt")
  })

  it("FACTORY_IS_NOT_IDENTITY_VALIDATOR: il factory compone, lo scope lo garantisce il callsite", async () => {
    // Precondizione documentata: recap e digest devono arrivare gia' scoped
    // alla stessa lessonId dal chiamante (RecapView li deriva entrambi dalla
    // stessa `room`). Il factory NON ispeziona la provenance — un digest di
    // un'altra lezione verrebbe composto cosi' com'e': questo test lo
    // dichiara esplicitamente invece di fingere una validazione.
    const digestAltrui: StudyDigest = {
      concepts: [{ id: "x", label: "Altra lezione", evidence: [] }],
      errors: [],
    }
    const outcome = createLessonOutcome("lezione-a", RECAP, digestAltrui)
    expect(outcome.lessonId).toBe("lezione-a")
    if (outcome.pedagogy.status !== "available") throw new Error("atteso available")
    expect(outcome.pedagogy.digest).toBe(digestAltrui)
  })
})
