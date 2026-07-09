// LessonOS — test della micro-slice event-log → materializer → recall.
// Test canonico (da LESSONOS-DYNAMIC-GRAPH-RESEARCH): "aggiungo evento errore →
// nasce arco corregge tra esercizio e concetto" (via correzione dell'errore).

import { describe, it, expect } from "vitest"
import {
  EVENT_LOG_DDL,
  InMemoryEventLog,
  isValidEvidenceRef,
  type AppendedEvent,
  type LessonOsEvent,
} from "../lessonos/eventlog"
import { materialize } from "../lessonos/materializer"
import { neighbors, recallCorrectionsForConcept, recallErrorsForConcept } from "../lessonos/recall"

/** Fixture: lezione Vol.1 Cap.6 Esp.1 — il LED, un errore di polarità, l'esercizio che lo corregge. */
const FIXTURE: LessonOsEvent[] = [
  { kind: "lesson.started", room: "elab-v1-cap6", t: 1000, evidence: ["lesson:elab-v1-cap6@1000"] },
  {
    kind: "concept.introduced",
    conceptId: "led_polarity",
    labels: { it: "Polarità del LED", en: "LED polarity" },
    t: 1100,
    evidence: ["manual:vol1:p30"],
  },
  {
    kind: "material.cited",
    materialId: "material:vol1-p30-fig2",
    conceptId: "led_polarity",
    labels: { it: "Figura montaggio p.30" },
    t: 1200,
    evidence: ["manual:vol1:p30", "board:fig2-embed"],
  },
  {
    kind: "error.observed",
    errorId: "error:led-invertito-1",
    conceptId: "led_polarity",
    labels: { it: "LED montato invertito" },
    t: 1300,
    evidence: ["board:sim-embed-1", "lesson:elab-v1-cap6@1300"],
  },
  {
    kind: "exercise.completed",
    exerciseId: "exercise:rimonta-led",
    conceptId: "led_polarity",
    correctsErrorId: "error:led-invertito-1",
    labels: { it: "Rimonta il LED con anodo verso il resistore" },
    t: 1400,
    evidence: ["board:sim-embed-1"],
  },
  { kind: "lesson.ended", room: "elab-v1-cap6", t: 1500, evidence: ["lesson:elab-v1-cap6@1500"] },
]

async function appendedFixture(): Promise<AppendedEvent[]> {
  const log = new InMemoryEventLog()
  for (const ev of FIXTURE) await log.append(ev)
  return log.readAll()
}

describe("event log append-only", () => {
  it("assegna seq monotono e preserva l'ordine di append", async () => {
    const events = await appendedFixture()
    expect(events.map((e) => e.seq)).toEqual([1, 2, 3, 4, 5, 6])
    expect(events.map((e) => e.kind)).toEqual(FIXTURE.map((e) => e.kind))
  })

  it("rifiuta eventi senza evidenza o con ref malformate (nessun fatto senza provenienza)", async () => {
    const log = new InMemoryEventLog()
    await expect(
      log.append({ kind: "lesson.started", room: "x", t: 1, evidence: [] }),
    ).rejects.toThrow(/evidence obbligatoria/)
    await expect(
      log.append({ kind: "lesson.started", room: "x", t: 1, evidence: ["senza-namespace"] }),
    ).rejects.toThrow(/malformata/)
    expect(isValidEvidenceRef("manual:vol1:p30")).toBe(true)
    expect(isValidEvidenceRef("NOPE")).toBe(false)
  })

  it("gli eventi accettati sono immutabili (il log non si riscrive)", async () => {
    const log = new InMemoryEventLog()
    const appended = await log.append(FIXTURE[0])
    expect(Object.isFrozen(appended)).toBe(true)
  })

  it("il DDL SQLite è append-only per contratto: nessun UPDATE/DELETE nel disciplinare", () => {
    expect(EVENT_LOG_DDL).toContain("CREATE TABLE IF NOT EXISTS lessonos_events")
    expect(EVENT_LOG_DDL.toLowerCase()).not.toContain("on update")
    expect(EVENT_LOG_DDL.toLowerCase()).not.toContain("on delete")
  })
})

describe("materializer (eventi → grafo derivato)", () => {
  it("TEST CANONICO: evento errore + esercizio correttivo → arco corregge tra esercizio e concetto", async () => {
    const graph = materialize(await appendedFixture())

    // L'errore deriva dal concetto…
    expect(
      graph.edges.some(
        (e) => e.from === "error:led-invertito-1" && e.kind === "deriva-da" && e.to === "led_polarity",
      ),
    ).toBe(true)
    // …l'esercizio corregge l'errore…
    expect(
      graph.edges.some(
        (e) => e.from === "exercise:rimonta-led" && e.kind === "corregge" && e.to === "error:led-invertito-1",
      ),
    ).toBe(true)
    // …e la correzione PROPAGA al concetto (l'arco del test canonico).
    expect(
      graph.edges.some(
        (e) => e.from === "exercise:rimonta-led" && e.kind === "corregge" && e.to === "led_polarity",
      ),
    ).toBe(true)
    // Temporalità come attributo: l'errore risulta corretto al tempo dell'esercizio.
    expect(graph.nodes.get("error:led-invertito-1")?.correctedAt).toBe(1400)
  })

  it("ogni nodo porta evidenza e introducedAt del primo evento", async () => {
    const graph = materialize(await appendedFixture())
    for (const node of graph.nodes.values()) {
      expect(node.evidenceRefs.length).toBeGreaterThan(0)
    }
    expect(graph.nodes.get("led_polarity")?.introducedAt).toBe(1100)
    expect(graph.nodes.get("led_polarity")?.labels.it).toBe("Polarità del LED")
  })

  it("è deterministico e riderivabile: due materializzazioni sono identiche", async () => {
    const events = await appendedFixture()
    const a = materialize(events)
    const b = materialize(events)
    expect([...a.nodes.entries()]).toEqual([...b.nodes.entries()])
    expect(a.edges).toEqual(b.edges)
  })

  it("arco duplicato non si duplica: si uniscono le evidenze (grafo mai corrotto)", async () => {
    const log = new InMemoryEventLog()
    for (const ev of FIXTURE) await log.append(ev)
    await log.append({
      kind: "error.observed",
      errorId: "error:led-invertito-1",
      conceptId: "led_polarity",
      labels: {},
      t: 1600,
      evidence: ["board:sim-embed-2"],
    })
    const graph = materialize(await log.readAll())
    const derivaDa = graph.edges.filter(
      (e) => e.from === "error:led-invertito-1" && e.kind === "deriva-da" && e.to === "led_polarity",
    )
    expect(derivaDa).toHaveLength(1)
    expect(derivaDa[0].evidenceRefs).toContain("board:sim-embed-1")
    expect(derivaDa[0].evidenceRefs).toContain("board:sim-embed-2")
    expect(derivaDa[0].introducedAt).toBe(1300) // il primo evento fissa la storia
  })

  it("correzione verso un errore mai osservato non inventa archi", async () => {
    const log = new InMemoryEventLog()
    await log.append({
      kind: "exercise.completed",
      exerciseId: "exercise:orfano",
      correctsErrorId: "error:inesistente",
      labels: {},
      t: 1,
      evidence: ["board:x"],
    })
    const graph = materialize(await log.readAll())
    expect(graph.edges.filter((e) => e.kind === "corregge")).toHaveLength(0)
  })

  it("simulation.step.completed materializza uno step verificato come esercizio con evidence di plugin/scena", async () => {
    const log = new InMemoryEventLog()
    await log.append({
      kind: "simulation.step.completed",
      stepId: "step:v1-cap6-esp1:2",
      sceneId: "scene:v1-cap6-esp1",
      experimentId: "v1-cap6-esp1",
      conceptId: "led_polarity",
      labels: { it: "LED orientato correttamente" },
      t: 1450,
      evidence: ["plugin:io.ardesia.simulation@2.0.0", "scene:v1-cap6-esp1@candidate"],
    })

    const graph = materialize(await log.readAll())
    expect(graph.nodes.get("step:v1-cap6-esp1:2")).toMatchObject({
      kind: "esercizio",
      labels: { it: "LED orientato correttamente" },
      evidenceRefs: ["plugin:io.ardesia.simulation@2.0.0", "scene:v1-cap6-esp1@candidate"],
    })
    expect(graph.edges).toContainEqual(
      expect.objectContaining({
        from: "step:v1-cap6-esp1:2",
        kind: "cita",
        to: "led_polarity",
      }),
    )
  })

  it("simulation.circuit.solved materializza l'esperimento risolto come esercizio + cita concetto", async () => {
    const log = new InMemoryEventLog()
    await log.append({
      kind: "simulation.circuit.solved",
      experimentId: "v1-cap6-esp1",
      sceneId: "scene:v1-cap6-esp1",
      conceptId: "led_polarity",
      currentMa: 15.3,
      bookLayoutValid: true,
      labels: { it: "Primo LED acceso" },
      t: 1500,
      evidence: ["plugin:io.ardesia.simulation@2.0.0", "scene:v1-cap6-esp1@solved"],
    })

    const graph = materialize(await log.readAll())
    expect(graph.nodes.get("v1-cap6-esp1")).toMatchObject({
      kind: "esercizio",
      labels: { it: "Primo LED acceso" },
      evidenceRefs: ["plugin:io.ardesia.simulation@2.0.0", "scene:v1-cap6-esp1@solved"],
    })
    expect(graph.edges).toContainEqual(
      expect.objectContaining({ from: "v1-cap6-esp1", kind: "cita", to: "led_polarity" }),
    )
  })

  it("simulation.error.observed materializza l'errore elettrico come errore + deriva-da concetto", async () => {
    const log = new InMemoryEventLog()
    await log.append({
      kind: "simulation.error.observed",
      errorId: "error:filo-scollegato-1",
      conceptId: "circuito_chiuso",
      sceneId: "scene:v1-cap6-esp1",
      experimentId: "v1-cap6-esp1",
      labels: { it: "Filo scollegato: circuito aperto" },
      t: 1480,
      evidence: ["plugin:io.ardesia.simulation@2.0.0", "scene:v1-cap6-esp1@broken"],
    })

    const graph = materialize(await log.readAll())
    expect(graph.nodes.get("error:filo-scollegato-1")).toMatchObject({
      kind: "errore",
      labels: { it: "Filo scollegato: circuito aperto" },
    })
    expect(graph.edges).toContainEqual(
      expect.objectContaining({
        from: "error:filo-scollegato-1",
        kind: "deriva-da",
        to: "circuito_chiuso",
      }),
    )
  })

  it("plugin.mounted materializza il plugin montato con instanceId e evidence del catalogo", async () => {
    const log = new InMemoryEventLog()
    await log.append({
      kind: "plugin.mounted",
      pluginId: "io.ardesia.simulation",
      pluginKind: "simulation",
      instanceId: "sim-a",
      room: "lezione-led",
      labels: { it: "Simulatore" },
      t: 1500,
      evidence: ["plugin:io.ardesia.simulation@0.1.0", "board:plugin-postit-sim-a-board"],
    })

    const graph = materialize(await log.readAll())
    expect(graph.nodes.get("plugin:io.ardesia.simulation#sim-a")).toMatchObject({
      kind: "plugin",
      labels: { it: "Simulatore" },
      evidenceRefs: ["plugin:io.ardesia.simulation@0.1.0", "board:plugin-postit-sim-a-board"],
    })
  })
})

describe("recall deterministico (query O(vicinato))", () => {
  it("neighbors depth-1 del concetto: materiale, errore, esercizio collegati, ordinati", async () => {
    const graph = materialize(await appendedFixture())
    const view = neighbors(graph, "led_polarity", 1)
    expect(view).not.toBeNull()
    expect(view!.nodes.map((n) => n.id)).toEqual([
      "error:led-invertito-1",
      "exercise:rimonta-led",
      "led_polarity",
      "material:vol1-p30-fig2",
    ])
    // Stessa query due volte → stessa risposta (nessuna casualità).
    expect(neighbors(graph, "led_polarity", 1)).toEqual(view)
  })

  it("neighbors di un nodo inesistente → null (il recall non inventa nodi)", async () => {
    const graph = materialize(await appendedFixture())
    expect(neighbors(graph, "ghost", 1)).toBeNull()
  })

  it("recallErrorsForConcept / recallCorrectionsForConcept leggono solo il grafo", async () => {
    const graph = materialize(await appendedFixture())
    expect(recallErrorsForConcept(graph, "led_polarity").map((n) => n.id)).toEqual([
      "error:led-invertito-1",
    ])
    expect(recallCorrectionsForConcept(graph, "led_polarity").map((n) => n.id)).toEqual([
      "exercise:rimonta-led",
    ])
  })
})
