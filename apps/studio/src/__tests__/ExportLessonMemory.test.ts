// @vitest-environment node
//
// Golden-path §8 segmento "export" — la memoria della lezione (event-log)
// esce come UN file JSON versionato: formato dichiarato, eventi nell'ordine
// del log (l'ordine del log È l'ordine della verità), nome file
// deterministico dato il timestamp. Modulo puro: la vista fa solo il
// download del risultato.

import { describe, expect, it } from "vitest"
import {
  buildLessonMemoryExport,
  lessonMemoryFileName,
  LESSON_MEMORY_FORMAT,
} from "../lessonos/exportLessonMemory"
import { InMemoryEventLog } from "../lessonos/eventlog"

const T0 = 1751772000000 // 2026-07-06T04:00:00Z circa — fisso, mai Date.now nei test

async function seededLog(): Promise<InMemoryEventLog> {
  const log = new InMemoryEventLog()
  await log.append({
    kind: "lesson.started",
    room: "aula-1",
    t: T0,
    evidence: [`lesson:aula-1@${T0}`],
  })
  await log.append({
    kind: "concept.introduced",
    conceptId: "circuito-chiuso",
    labels: { it: "circuito chiuso" },
    t: T0 + 1000,
    evidence: [`lesson:aula-1@${T0}`],
  })
  return log
}

describe("buildLessonMemoryExport", () => {
  it("formato versionato + eventi nell'ordine del log, con seq", async () => {
    const log = await seededLog()
    const out = await buildLessonMemoryExport(log, {
      experimentId: "v1-cap6-esp1",
      now: T0 + 5000,
    })
    expect(out.format).toBe(LESSON_MEMORY_FORMAT)
    expect(out.exportedAt).toBe(T0 + 5000)
    expect(out.experimentId).toBe("v1-cap6-esp1")
    expect(out.events.map((event) => event.seq)).toEqual([1, 2])
    expect(out.events.map((event) => event.kind)).toEqual([
      "lesson.started",
      "concept.introduced",
    ])
  })

  it("log vuoto: export ONESTO con zero eventi (mai inventarne)", async () => {
    const out = await buildLessonMemoryExport(new InMemoryEventLog(), { now: T0 })
    expect(out.events).toEqual([])
    expect(out.experimentId).toBeUndefined()
  })

  it("il JSON round-trippa identico (serializzabile senza perdita)", async () => {
    const log = await seededLog()
    const out = await buildLessonMemoryExport(log, { now: T0 })
    expect(JSON.parse(JSON.stringify(out))).toEqual(out)
  })
})

describe("lessonMemoryFileName", () => {
  it("deterministico dato il timestamp, con esperimento", () => {
    expect(lessonMemoryFileName("v1-cap6-esp1", Date.UTC(2026, 6, 6, 4, 30, 0))).toBe(
      "lezione-v1-cap6-esp1-2026-07-06T04-30-00.json",
    )
  })

  it("senza esperimento: prefisso neutro, stessa grammatica", () => {
    expect(lessonMemoryFileName(undefined, Date.UTC(2026, 6, 6, 4, 30, 0))).toBe(
      "lezione-2026-07-06T04-30-00.json",
    )
  })
})
