// @vitest-environment node
//
// Binding host: event-bus tipizzato Core↔Plugin → event-log LessonOS.
// Il bus è transito (contratto eventBus.ts), l'event-log è l'unica verità
// persistita: questo binding è il pezzo host che promuove i messaggi didattici
// del plugin (material.cited, error.observed) a fatti, senza che il plugin
// tocchi mai la memoria (canon §6: memoria = concern del Core).

import { describe, expect, it, vi } from "vitest"
import { createTypedEventBus, type ArdesiaEventMap } from "../core/contracts/eventBus"
import { InMemoryEventLog } from "../lessonos/eventlog"
import type { EventLogStore } from "../lessonos/eventlog"
import { bindBusToEventLog } from "../lessonos/busEventLogBinding"

const T = 1720200000000

function makeBus() {
  return createTypedEventBus<ArdesiaEventMap>()
}

describe("bindBusToEventLog", () => {
  it("promuove error.observed dal bus a fatto sull'event-log (stessi campi)", async () => {
    const bus = makeBus()
    const log = new InMemoryEventLog()
    bindBusToEventLog(bus, log, { onRecordError: () => {} })

    bus.emit("error.observed", {
      errorId: "led-invertito",
      conceptId: "polarita-led",
      studentId: "stu-7",
      labels: { it: "LED inserito al contrario" },
      t: T,
      evidence: ["plugin:elab-simulature@0.1.0", "lesson:aula-3b@" + T],
    })

    await vi.waitFor(async () => {
      expect(await log.readAll()).toHaveLength(1)
    })
    const [event] = await log.readAll()
    expect(event).toMatchObject({
      kind: "error.observed",
      errorId: "led-invertito",
      conceptId: "polarita-led",
      studentId: "stu-7",
      labels: { it: "LED inserito al contrario" },
      t: T,
      evidence: ["plugin:elab-simulature@0.1.0", `lesson:aula-3b@${T}`],
      seq: 1,
    })
  })

  it("non attribuisce studentId quando il bus non lo porta", async () => {
    const bus = makeBus()
    const log = new InMemoryEventLog()
    bindBusToEventLog(bus, log, { onRecordError: () => {} })

    bus.emit("error.observed", {
      errorId: "fili-riga-sbagliata",
      conceptId: "breadboard-righe",
      labels: { it: "Fili non nella stessa riga" },
      t: T,
      evidence: ["plugin:elab-simulature@0.1.0"],
    })

    await vi.waitFor(async () => {
      expect(await log.readAll()).toHaveLength(1)
    })
    const [event] = await log.readAll()
    expect("studentId" in event).toBe(false)
  })

  it("promuove material.cited dal bus a fatto sull'event-log", async () => {
    const bus = makeBus()
    const log = new InMemoryEventLog()
    bindBusToEventLog(bus, log, { onRecordError: () => {} })

    bus.emit("material.cited", {
      materialId: "manual:vol1",
      labels: { it: "Vol.1 pag.29" },
      t: T,
      evidence: ["manual:vol1:p29"],
    })

    await vi.waitFor(async () => {
      expect(await log.readAll()).toHaveLength(1)
    })
    expect((await log.readAll())[0].kind).toBe("material.cited")
  })

  it("append fallito → onRecordError, mai silenzio", async () => {
    const bus = makeBus()
    const onRecordError = vi.fn()
    const brokenLog: EventLogStore = {
      append: () => Promise.reject(new Error("storage giù")),
      readAll: () => Promise.resolve([]),
    }
    bindBusToEventLog(bus, brokenLog, { onRecordError })

    bus.emit("error.observed", {
      errorId: "e1",
      conceptId: "c1",
      labels: { it: "x" },
      t: T,
      evidence: ["plugin:p@1"],
    })

    await vi.waitFor(() => {
      expect(onRecordError).toHaveBeenCalledTimes(1)
    })
    expect(onRecordError.mock.calls[0][1]).toBe("error.observed")
  })

  it("unbind() ferma la promozione", async () => {
    const bus = makeBus()
    const log = new InMemoryEventLog()
    const unbind = bindBusToEventLog(bus, log, { onRecordError: () => {} })
    unbind()

    bus.emit("error.observed", {
      errorId: "e1",
      conceptId: "c1",
      labels: { it: "x" },
      t: T,
      evidence: ["plugin:p@1"],
    })

    // Consegna sincrona sul bus: dopo l'emit, un append (se partito) sarebbe
    // già in coda microtask — un giro di attesa basta a escluderlo.
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(await log.readAll()).toHaveLength(0)
  })
})
