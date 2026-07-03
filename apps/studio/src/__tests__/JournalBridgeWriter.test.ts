import { describe, expect, it } from "vitest"
import { InMemoryEventLog } from "../lessonos/eventlog"
import {
  appendJournalBridgeTail,
  lastPromotedJournalT,
} from "../lessonos/journalBridgeWriter"
import { singleManualRegistry, type ManualRegistry } from "../lessonos/journalBridge"
import type { JournalEvent } from "../store/JournalRecorder"

const VOL1 = singleManualRegistry("manual:vol1", { title: "Vol.1" })
const VOL1_DOCUMENT_ID = "document:sha256:vol1"

const VOL1_DOCUMENT_REGISTRY: ManualRegistry = {
  resolve(view) {
    if (view.documentId !== VOL1_DOCUMENT_ID) return undefined
    if (view.page < 29 || view.page > 31) return undefined
    return {
      manualId: "manual:vol1",
      page: view.page,
      labels: { it: `Vol.1 — p.${view.page}` },
    }
  },
}

const JOURNAL: JournalEvent[] = [
  { type: "t0", t: 900 },
  { type: "pdf.page.view", page: 30, totalPages: 120, t: 1000 },
  { type: "math.insert", latex: "V=RI", t: 1050 },
  { type: "pdf.page.view", page: 31, totalPages: 120, t: 1100 },
  { type: "t1", t: 1200 },
]

describe("appendJournalBridgeTail", () => {
  it("promuove solo pdf.page.view con documento e pagina riconosciuti dal registry esplicito", async () => {
    const log = new InMemoryEventLog()
    const journal: JournalEvent[] = [
      {
        type: "pdf.page.view",
        page: 30,
        totalPages: 120,
        documentId: VOL1_DOCUMENT_ID,
        documentName: "volume1.pdf",
        t: 1000,
      },
      {
        type: "pdf.page.view",
        page: 30,
        totalPages: 120,
        documentId: "document:sha256:unregistered",
        documentName: "scheda-libera.pdf",
        t: 1100,
      },
      {
        type: "pdf.page.view",
        page: 99,
        totalPages: 120,
        documentId: VOL1_DOCUMENT_ID,
        documentName: "volume1.pdf",
        t: 1200,
      },
    ]

    const first = await appendJournalBridgeTail(log, journal, {
      registry: VOL1_DOCUMENT_REGISTRY,
    })
    const second = await appendJournalBridgeTail(log, journal, {
      registry: VOL1_DOCUMENT_REGISTRY,
    })

    expect(first).toHaveLength(1)
    expect(first[0].kind === "material.cited" && first[0].materialId).toBe("manual:vol1:p30")
    expect(first[0].evidence).toEqual([
      "manual:vol1:p30",
      "journal:pdf.page.view@1000",
    ])
    expect(second).toEqual([])
    expect(await log.readAll()).toHaveLength(1)
  })

  it("appende al LessonOS event-log solo le pdf.page.view promosse", async () => {
    const log = new InMemoryEventLog()

    const appended = await appendJournalBridgeTail(log, JOURNAL, {
      registry: VOL1,
      room: "3b-elab",
    })

    expect(appended).toHaveLength(2)
    expect(appended.map((event) => event.seq)).toEqual([1, 2])
    expect(appended.map((event) => event.kind)).toEqual(["material.cited", "material.cited"])
    expect(appended[0].evidence).toEqual([
      "manual:vol1:p30",
      "journal:pdf.page.view@1000",
      "lesson:3b-elab@1000",
    ])
    expect(await log.readAll()).toEqual(appended)
  })

  it("e' idempotente al replay completo: il cursore si ricava dal log esistente", async () => {
    const log = new InMemoryEventLog()

    const first = await appendJournalBridgeTail(log, JOURNAL, { registry: VOL1 })
    const second = await appendJournalBridgeTail(log, JOURNAL, { registry: VOL1 })

    expect(first).toHaveLength(2)
    expect(second).toEqual([])
    expect(await log.readAll()).toHaveLength(2)
    expect(lastPromotedJournalT(await log.readAll())).toBe(1100)
  })

  it("su journal esteso appende solo la coda con t maggiore del cursore", async () => {
    const log = new InMemoryEventLog()
    await appendJournalBridgeTail(log, JOURNAL.slice(0, 3), { registry: VOL1 })

    const tail = await appendJournalBridgeTail(log, JOURNAL, { registry: VOL1 })

    expect(tail).toHaveLength(1)
    expect(tail[0].seq).toBe(2)
    expect(tail[0].kind === "material.cited" && tail[0].materialId).toBe("manual:vol1:p31")
    expect((await log.readAll()).map((event) => event.seq)).toEqual([1, 2])
  })

  it("non inventa material.cited quando il registry non riconosce il PDF", async () => {
    const log = new InMemoryEventLog()
    const unregistered: ManualRegistry = { resolve: () => undefined }

    const appended = await appendJournalBridgeTail(log, JOURNAL, {
      registry: unregistered,
    })

    expect(appended).toEqual([])
    expect(await log.readAll()).toEqual([])
  })

  it("ignora evidence journal malformate quando calcola il cursore", async () => {
    const log = new InMemoryEventLog()
    await log.append({
      kind: "material.cited",
      materialId: "manual:vol1:p1",
      labels: { it: "Vol.1 - p.1" },
      t: 1,
      evidence: ["manual:vol1:p1", "journal:pdf.page.view@not-a-number"],
    })

    expect(lastPromotedJournalT(await log.readAll())).toBeNull()
    const appended = await appendJournalBridgeTail(log, JOURNAL.slice(0, 2), {
      registry: VOL1,
    })
    expect(appended).toHaveLength(1)
    expect(appended[0].seq).toBe(2)
  })
})
