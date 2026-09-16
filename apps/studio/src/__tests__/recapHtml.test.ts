import { describe, it, expect } from "vitest"
import { buildRecapHtml } from "../store/recapHtml"
import { createLessonOutcome, type LessonOutcomeV1 } from "../store/lessonOutcome"
import { formatDuration, type LessonRecap } from "../store/lessonRecap"
import type { StudyDigest } from "../lessonos/studyDigest"

const LESSON_ID = "lezione-primo-led"

const RECAP: LessonRecap = {
  v: 1,
  title: "Primo LED",
  durationMs: 1000 * 60 * 12,
  mathFormulas: ["V = R \\cdot I"],
  elementTypeCounts: { rectangle: 3, text: 2 },
  totalElementsAdded: 5,
  pdfPagesViewed: [31, 29, 30],
  firstEventTime: 1000,
  lastEventTime: 1000 + 1000 * 60 * 12,
}

function outcomeOf(recap: LessonRecap, digest: StudyDigest | null): LessonOutcomeV1 {
  return createLessonOutcome(LESSON_ID, recap, digest)
}

describe("buildRecapHtml (deliverable umano-leggibile)", () => {
  it("produce un HTML autosufficiente con titolo, durata e attività", () => {
    const html = buildRecapHtml(outcomeOf(RECAP, null))
    expect(html.startsWith("<!doctype html>")).toBe(true)
    expect(html).toContain("<title>Primo LED — Recap</title>")
    expect(html).toContain("Primo LED")
    expect(html).toContain(formatDuration(RECAP.durationMs))
    expect(html).toContain("rettangoli")
    expect(html).toContain("V = R \\cdot I")
    // PDF via stampa: pulsante presente (nascosto in @media print)
    expect(html).toContain('onclick="window.print()"')
  })

  it("rende LEGGIBILE la provenienza (pagine del manuale, ordinate) — la fonte", () => {
    const html = buildRecapHtml(outcomeOf(RECAP, null))
    // ordinate 29,30,31
    const i29 = html.indexOf("pagina&nbsp;29")
    const i30 = html.indexOf("pagina&nbsp;30")
    const i31 = html.indexOf("pagina&nbsp;31")
    expect(i29).toBeGreaterThan(-1)
    expect(i30).toBeGreaterThan(i29)
    expect(i31).toBeGreaterThan(i30)
    expect(html).toContain("Fonti")
    // Worksheet: spazio appunti rigato per lo studente
    expect(html).toContain("I miei appunti")
    expect((html.match(/class="rule"/g) ?? []).length).toBe(6)
  })

  it("è XSS-safe: il titolo è HTML-escaped", () => {
    const html = buildRecapHtml(outcomeOf({ ...RECAP, title: '<script>alert(1)</script>' }, null))
    expect(html).not.toContain("<script>alert(1)</script>")
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;")
  })

  it("recap vuoto → HTML valido con stato-vuoto (mai crash, mai 'undefined')", () => {
    const empty: LessonRecap = {
      v: 1,
      title: "Lezione senza nome",
      durationMs: 0,
      mathFormulas: [],
      elementTypeCounts: {},
      totalElementsAdded: 0,
      pdfPagesViewed: [],
      firstEventTime: null,
      lastEventTime: null,
    }
    const html = buildRecapHtml(outcomeOf(empty, null))
    expect(html).toContain("non ha ancora attività registrata")
    expect(html).not.toContain("undefined")
    expect(html.trim().endsWith("</html>")).toBe(true)
  })

  it("deterministico: stesso recap → stesso documento", () => {
    expect(buildRecapHtml(outcomeOf(RECAP, null))).toBe(buildRecapHtml(outcomeOf(RECAP, null)))
  })

  it("col digest: rende Concetti + Errori-e-correzioni (break→explain nel materiale)", () => {
    const digest: StudyDigest = {
      concepts: [{ id: "circuito_chiuso", label: "Circuito chiuso", evidence: ["manual:page:29"] }],
      errors: [
        { id: "e1", label: "Circuito aperto", conceptId: "circuito_chiuso", corrected: true, evidence: [] },
        { id: "e2", label: "Resistenza mancante", conceptId: "resistenza", corrected: false, evidence: [] },
      ],
    }
    const html = buildRecapHtml(outcomeOf(RECAP, digest))
    expect(html).toContain("Concetti trattati")
    expect(html).toContain("Circuito chiuso")
    expect(html).toContain("Errori e correzioni")
    expect(html).toContain("Circuito aperto")
    expect(html).toContain(">corretto<")
    expect(html).toContain(">da rivedere<")
  })

  it("pedagogy unavailable: documento valido, nessuna sezione inventata (fail-soft)", () => {
    const html = buildRecapHtml(outcomeOf(RECAP, null))
    expect(html).toContain("Primo LED")
    expect(html).not.toContain("Concetti trattati")
    expect(html).not.toContain("Errori e correzioni")
    expect(html).not.toContain("undefined")
  })
})
