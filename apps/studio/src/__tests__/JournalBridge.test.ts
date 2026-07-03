import { describe, expect, it } from "vitest"
import { InMemoryEventLog } from "../lessonos/eventlog"
import {
  bridgeJournalToLessonOs,
  singleManualRegistry,
  type ManualRegistry,
} from "../lessonos/journalBridge"
import type { JournalEvent } from "../store/JournalRecorder"

// Journal misto: solo le pdf.page.view sono candidate alla promozione
// (spec JOURNAL-LESSONOS-BRIDGE-SPEC §1); tutto il resto resta counts.
const JOURNAL: JournalEvent[] = [
  { type: "t0", t: 900 },
  { type: "element.add", element: { id: "el1" }, t: 950 },
  { type: "pdf.page.view", page: 30, totalPages: 120, t: 1000 },
  { type: "math.insert", latex: "V=RI", t: 1050 },
  { type: "pdf.page.view", page: 31, totalPages: 120, t: 1100 },
  { type: "audio.chunk", chunkIndex: 0, startEpoch: 900, endEpoch: 1200, t: 1200 },
  { type: "t1", t: 1250 },
  { type: "element.delete", elementId: "el1", t: 1300 },
]

const VOL1 = singleManualRegistry("manual:vol1", { title: "Vol.1" })

describe("bridgeJournalToLessonOs", () => {
  it("promuove pdf.page.view riconosciuta in material.cited con evidence doppia", () => {
    const out = bridgeJournalToLessonOs(JOURNAL, { registry: VOL1 })
    expect(out).toHaveLength(2)
    expect(out[0]).toEqual({
      kind: "material.cited",
      materialId: "manual:vol1:p30",
      labels: { it: "Vol.1 — p.30" },
      t: 1000,
      evidence: ["manual:vol1:p30", "journal:pdf.page.view@1000"],
    })
    expect(out[1].t).toBe(1100)
    expect(out[1].kind === "material.cited" && out[1].materialId).toBe("manual:vol1:p31")
  })

  it("non promuove MAI element.*, math.insert, audio.chunk, t0/t1", () => {
    const noPdf = JOURNAL.filter((ev) => ev.type !== "pdf.page.view")
    expect(bridgeJournalToLessonOs(noPdf, { registry: VOL1 })).toEqual([])
  })

  it("PDF non registrato (registry → undefined) ⇒ nessun evento, solo journal-side", () => {
    const unregistered: ManualRegistry = { resolve: () => undefined }
    expect(bridgeJournalToLessonOs(JOURNAL, { registry: unregistered })).toEqual([])
  })

  it("applica il pageOffset del registry alla numerazione del manuale", () => {
    const shifted = singleManualRegistry("manual:vol1", { pageOffset: 25 })
    const out = bridgeJournalToLessonOs(
      [{ type: "pdf.page.view", page: 5, totalPages: 120, t: 1000 }],
      { registry: shifted },
    )
    expect(out[0].kind === "material.cited" && out[0].materialId).toBe("manual:vol1:p30")
    expect(out[0].evidence).toContain("manual:vol1:p30")
  })

  it("con opts.room aggiunge il ref lesson:<room>@<t>; senza room mai inventato", () => {
    const withRoom = bridgeJournalToLessonOs(JOURNAL, { registry: VOL1, room: "3b-elab" })
    expect(withRoom[0].evidence).toEqual([
      "manual:vol1:p30",
      "journal:pdf.page.view@1000",
      "lesson:3b-elab@1000",
    ])
    const without = bridgeJournalToLessonOs(JOURNAL, { registry: VOL1 })
    expect(without[0].evidence.some((ref) => ref.startsWith("lesson:"))).toBe(false)
  })

  it("è pura e deterministica: stesso input ⇒ stesso output", () => {
    const a = bridgeJournalToLessonOs(JOURNAL, { registry: VOL1, room: "3b-elab" })
    const b = bridgeJournalToLessonOs(JOURNAL, { registry: VOL1, room: "3b-elab" })
    expect(a).toEqual(b)
  })

  it("idempotenza al replay: cursore afterT ⇒ full-run = prefix-run + tail-run", () => {
    const full = bridgeJournalToLessonOs(JOURNAL, { registry: VOL1 })
    const prefix = bridgeJournalToLessonOs(JOURNAL.slice(0, 4), { registry: VOL1 })
    const cursor = Math.max(...JOURNAL.slice(0, 4).map((ev) => ev.t))
    const tail = bridgeJournalToLessonOs(JOURNAL, { registry: VOL1, afterT: cursor })
    expect([...prefix, ...tail]).toEqual(full)
    // Re-run completo con cursore a fine journal ⇒ niente da ri-appendere.
    const lastT = Math.max(...JOURNAL.map((ev) => ev.t))
    expect(bridgeJournalToLessonOs(JOURNAL, { registry: VOL1, afterT: lastT })).toEqual([])
  })

  it("stessa pagina vista due volte a t diversi ⇒ due eventi (dedup per offset, non per pagina)", () => {
    const twice: JournalEvent[] = [
      { type: "pdf.page.view", page: 30, totalPages: 120, t: 1000 },
      { type: "pdf.page.view", page: 30, totalPages: 120, t: 2000 },
    ]
    const out = bridgeJournalToLessonOs(twice, { registry: VOL1 })
    expect(out).toHaveLength(2)
    expect(out.map((ev) => ev.evidence[1])).toEqual([
      "journal:pdf.page.view@1000",
      "journal:pdf.page.view@2000",
    ])
  })

  it("registry con manualId malformato ⇒ assertEvidence lancia (nessun fatto senza provenienza valida)", () => {
    const broken: ManualRegistry = { resolve: (view) => ({ manualId: "Vol1", page: view.page }) }
    expect(() => bridgeJournalToLessonOs(JOURNAL, { registry: broken })).toThrow(
      /evidence/i,
    )
  })

  it("gli eventi promossi sono accettati dall'EventLogStore di #24 (append-only)", async () => {
    const log = new InMemoryEventLog()
    const events = bridgeJournalToLessonOs(JOURNAL, { registry: VOL1, room: "3b-elab" })
    for (const ev of events) await log.append(ev)
    const all = await log.readAll()
    expect(all).toHaveLength(2)
    expect(all.map((ev) => ev.seq)).toEqual([1, 2])
    expect(all[0].kind).toBe("material.cited")
  })
})
