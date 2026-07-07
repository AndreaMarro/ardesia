// @vitest-environment node
//
// Emittente error.observed — sostanza pura (P0 post #67+#68+#70): dalle
// common_mistakes della fase CHIEDI del lesson-path (Pack) al payload bus
// "error.observed". Il docente sceglie il concetto (concepts_learned): il
// modulo non inventa mai il mapping errore→concetto.

import { describe, expect, it } from "vitest"
import * as fs from "node:fs"
import * as path from "node:path"
import {
  listLessonConcepts,
  listMistakeObservations,
  mistakeObservedBusEvent,
  slugifyConceptId,
} from "../lessonos/mistakeObservation"

const repoRoot = path.resolve(import.meta.dirname, "../../../..")
const lessonPath = JSON.parse(
  fs.readFileSync(
    path.join(repoRoot, "packs/elab-tutor/data/lesson-paths/v1-cap6-esp1.json"),
    "utf-8",
  ),
)

describe("slugifyConceptId", () => {
  it("produce id neutri deterministici (accenti e punteggiatura normalizzati)", () => {
    expect(slugifyConceptId("polarità LED (anodo/catodo)")).toBe("polarita-led-anodo-catodo")
    expect(slugifyConceptId("circuito chiuso")).toBe("circuito-chiuso")
    expect(slugifyConceptId("  Resistenza — Ohm  ")).toBe("resistenza-ohm")
  })

  it("rifiuta label che non lasciano nulla (nessun id vuoto)", () => {
    expect(() => slugifyConceptId("—··—")).toThrow(/vuoto/)
    expect(() => slugifyConceptId("")).toThrow(/vuoto/)
  })
})

describe("listMistakeObservations (fase CHIEDI del Pack)", () => {
  it("estrae le 3 common_mistakes di v1-cap6-esp1 con errorId stabili", () => {
    const observations = listMistakeObservations(lessonPath)
    expect(observations).toHaveLength(3)
    expect(observations[0]).toMatchObject({
      errorId: "v1-cap6-esp1:mistake-1",
      mistake: "LED inserito al contrario",
    })
    expect(observations.map((o) => o.errorId)).toEqual([
      "v1-cap6-esp1:mistake-1",
      "v1-cap6-esp1:mistake-2",
      "v1-cap6-esp1:mistake-3",
    ])
  })

  it("lesson-path senza fase CHIEDI o senza mistakes = lista vuota (mai inventata)", () => {
    expect(listMistakeObservations({ experiment_id: "x", phases: [] })).toEqual([])
    expect(
      listMistakeObservations({
        experiment_id: "x",
        phases: [{ name: "CHIEDI" }],
      }),
    ).toEqual([])
  })
})

describe("listLessonConcepts (concepts_learned)", () => {
  it("estrae i concetti con id neutro + label italiana", () => {
    expect(listLessonConcepts(lessonPath)).toEqual([
      { conceptId: "circuito-chiuso", label: "circuito chiuso" },
      { conceptId: "polarita-led-anodo-catodo", label: "polarità LED (anodo/catodo)" },
    ])
  })
})

describe("mistakeObservedBusEvent", () => {
  const observation = listMistakeObservations(lessonPath)[0]
  const concept = listLessonConcepts(lessonPath)[1]
  const base = { experimentId: "v1-cap6-esp1", observation, concept, t: 1720300000000 }

  it("costruisce il payload error.observed col concetto SCELTO dal docente", () => {
    expect(mistakeObservedBusEvent(base)).toEqual({
      errorId: "v1-cap6-esp1:mistake-1",
      conceptId: "polarita-led-anodo-catodo",
      labels: { it: "LED inserito al contrario" },
      t: 1720300000000,
      evidence: ["pack:io.elab.tutor:v1-cap6-esp1"],
    })
  })

  it("attribuisce lo studente solo se fornito", () => {
    expect(mistakeObservedBusEvent({ ...base, studentId: "stu-7" }).studentId).toBe("stu-7")
    expect("studentId" in mistakeObservedBusEvent(base)).toBe(false)
  })
})
