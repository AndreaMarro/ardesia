import { describe, it, expect } from "vitest"
import { InMemoryEventLog } from "../lessonos/eventlog"
import { materialize } from "../lessonos/materializer"
import { buildStudyDigest, buildRoomStudyDigest } from "../lessonos/studyDigest"

describe("buildStudyDigest (materiale di studio dal grafo LessonOS)", () => {
  it("estrae concetti + errori break→explain (incl. simulation.error.observed) con provenienza e stato-corretto", async () => {
    const log = new InMemoryEventLog()
    await log.append({
      kind: "concept.introduced",
      conceptId: "circuito_chiuso",
      labels: { it: "Circuito chiuso" },
      t: 1,
      evidence: ["manual:page:29"],
    })
    // Errore del SIMULATORE (evento P30): nodo errore + arco deriva-da concetto.
    await log.append({
      kind: "simulation.error.observed",
      errorId: "sim-error:v1:open-circuit",
      conceptId: "circuito_chiuso",
      sceneId: "scene:v1",
      experimentId: "v1-cap6-esp1",
      labels: { it: "Circuito aperto" },
      t: 2,
      evidence: ["simulation:scene:v1-cap6-esp1"],
    })
    // Correzione: esercizio che corregge l'errore → correctedAt.
    await log.append({
      kind: "exercise.completed",
      exerciseId: "ex:ricollega",
      correctsErrorId: "sim-error:v1:open-circuit",
      labels: { it: "Ricollega il negativo" },
      t: 3,
      evidence: ["board:fix"],
    })

    const digest = buildStudyDigest(materialize(await log.readAll()))

    expect(digest.concepts.map((c) => c.id)).toContain("circuito_chiuso")
    const err = digest.errors.find((e) => e.id === "sim-error:v1:open-circuit")
    expect(err).toMatchObject({
      conceptId: "circuito_chiuso",
      corrected: true,
      label: "Circuito aperto",
    })
    expect(err?.evidence).toContain("simulation:scene:v1-cap6-esp1")
  })

  it("errore non corretto → corrected false; digest deterministico", async () => {
    const log = new InMemoryEventLog()
    await log.append({
      kind: "simulation.error.observed",
      errorId: "sim-error:x",
      conceptId: "resistenza",
      labels: { it: "Resistenza mancante" },
      t: 1,
      evidence: ["simulation:scene:x"],
    })
    const events = await log.readAll()
    const digest = buildStudyDigest(materialize(events))
    expect(digest.errors.find((e) => e.id === "sim-error:x")?.corrected).toBe(false)
    expect(buildStudyDigest(materialize(events))).toEqual(digest)
  })

  it("room-scoped: include SOLO gli eventi nella finestra della lezione della room", async () => {
    const log = new InMemoryEventLog()
    // Room A: finestra 100..200
    await log.append({ kind: "lesson.started", room: "a", t: 100, evidence: ["lesson:A@100"] })
    await log.append({
      kind: "simulation.error.observed",
      errorId: "err:A",
      conceptId: "cA",
      labels: { it: "Errore A" },
      t: 150,
      evidence: ["simulation:scene:A"],
    })
    await log.append({ kind: "lesson.ended", room: "a", t: 200, evidence: ["lesson:A@200"] })
    // Room B: fuori dalla finestra di A
    await log.append({ kind: "lesson.started", room: "b", t: 300, evidence: ["lesson:B@300"] })
    await log.append({
      kind: "simulation.error.observed",
      errorId: "err:B",
      conceptId: "cB",
      labels: { it: "Errore B" },
      t: 350,
      evidence: ["simulation:scene:B"],
    })
    const events = await log.readAll()

    const digestA = buildRoomStudyDigest(events, "a")
    expect(digestA.errors.map((e) => e.id)).toContain("err:A")
    expect(digestA.errors.map((e) => e.id)).not.toContain("err:B")
  })

  it("senza lesson.started della room non usa mai l'intero log globale", async () => {
    const log = new InMemoryEventLog()
    await log.append({ kind: "lesson.started", room: "b", t: 100, evidence: ["lesson:B@100"] })
    await log.append({
      kind: "simulation.error.observed",
      errorId: "err:B",
      conceptId: "cB",
      labels: { it: "Errore B" },
      t: 150,
      evidence: ["simulation:scene:B"],
    })

    expect(buildRoomStudyDigest(await log.readAll(), "a")).toEqual({ concepts: [], errors: [] })
  })

  it("segmenta per seq più sessioni della room senza includere una room interposta", async () => {
    const log = new InMemoryEventLog()
    await log.append({ kind: "lesson.started", room: "a", t: 100, evidence: ["lesson:A@100"] })
    await log.append({
      kind: "simulation.error.observed",
      errorId: "err:A1",
      conceptId: "cA",
      labels: { it: "Errore A1" },
      t: 110,
      evidence: ["simulation:scene:A1"],
    })
    await log.append({ kind: "lesson.started", room: "b", t: 120, evidence: ["lesson:B@120"] })
    await log.append({
      kind: "simulation.error.observed",
      errorId: "err:B",
      conceptId: "cB",
      labels: { it: "Errore B" },
      t: 130,
      evidence: ["simulation:scene:B"],
    })
    await log.append({ kind: "lesson.ended", room: "b", t: 140, evidence: ["lesson:B@140"] })
    await log.append({ kind: "lesson.started", room: "a", t: 150, evidence: ["lesson:A@150"] })
    await log.append({
      kind: "simulation.error.observed",
      errorId: "err:A2",
      conceptId: "cA",
      labels: { it: "Errore A2" },
      t: 160,
      evidence: ["simulation:scene:A2"],
    })
    await log.append({ kind: "lesson.ended", room: "a", t: 170, evidence: ["lesson:A@170"] })

    const errors = buildRoomStudyDigest(await log.readAll(), "a").errors.map((error) => error.id)
    expect(errors).toEqual(["err:A1", "err:A2"])
  })
})
