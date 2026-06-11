// @vitest-environment jsdom
// MAESTRO-Studio — Test R4-step1: ReplayEngine time-window query
//
// getSceneAt(t): stato della scena al tempo t (riavvolgimento deterministico).
// getActiveElements(t0, t1): elementi creati/modificati nella finestra [t0, t1].
// NON tautologici: journal sintetico noto → risultato atteso preciso.
//
// Contratto dichiarato per finestra che taglia uno stroke a metà:
// - Se element.add è prima di t0 MA element.update è dentro [t0, t1]:
//   l'elemento ERA attivo nella finestra → INCLUDED (con stato a t1).
// - Elementi cancellati DOPO t1 ma attivi dentro [t0, t1] → inclusi.
// - Elementi cancellati DENTRO [t0, t1] → esclusi (non esistono a fine finestra).

import { describe, it, expect, beforeEach } from "vitest"
import { ReplayEngine, serializeEvents, deserializeEvents } from "../store/ReplayEngine"
import type { JournalEvent } from "../store/JournalRecorder"

// Helper: elemento Excalidraw minimale
function makeElement(id: string, version: number, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id,
    type: "rectangle",
    x: 0,
    y: 0,
    width: 100,
    height: 50,
    angle: 0,
    strokeColor: "#000",
    backgroundColor: "#fff",
    fillStyle: "solid",
    strokeWidth: 1,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    groupIds: [],
    boundElements: null,
    updated: version,
    link: null,
    locked: false,
    version,
    versionNonce: version * 10,
    isDeleted: false,
    seed: version * 100,
    roundness: null,
    ...overrides,
  }
}

// Crea un journal sintetico noto con timeline precisa
// t=1000: add rect "r1" v1
// t=1100: add diamond "d1" v1
// t=1200: update "r1" v2 (spostato)
// t=1300: delete "d1"
// t=1400: add circle "c1" v1
function makeKnownJournal(): JournalEvent[] {
  return deserializeEvents(
    serializeEvents([
      { t: 1000, type: "element.add", element: makeElement("r1", 1, { x: 0, y: 0 }) },
      { t: 1100, type: "element.add", element: makeElement("d1", 1, { x: 100, y: 0 }) },
      { t: 1200, type: "element.update", element: makeElement("r1", 2, { x: 200, y: 0 }) },
      { t: 1300, type: "element.delete", elementId: "d1" },
      { t: 1400, type: "element.add", element: makeElement("c1", 1, { x: 300, y: 0 }) },
    ]),
  )
}

describe("ReplayEngine — getSceneAt", () => {
  let engine: ReplayEngine

  beforeEach(() => {
    engine = new ReplayEngine()
  })

  it("getSceneAt(900): prima di ogni evento → scena vuota", () => {
    const scene = engine.getSceneAt(makeKnownJournal(), 900)
    expect(scene).toHaveLength(0)
  })

  it("getSceneAt(1050): dopo add r1, prima di add d1 → solo r1 v1", () => {
    const scene = engine.getSceneAt(makeKnownJournal(), 1050)
    expect(scene).toHaveLength(1)
    expect(scene[0].id).toBe("r1")
    expect(scene[0].x).toBe(0) // v1, non ancora spostato
    expect(scene[0].version).toBe(1)
  })

  it("getSceneAt(1250): dopo update r1 a v2, prima di delete d1 → r1(200,0) v2 + d1", () => {
    const scene = engine.getSceneAt(makeKnownJournal(), 1250)
    expect(scene).toHaveLength(2)
    const r1 = scene.find((e) => e.id === "r1")
    const d1 = scene.find((e) => e.id === "d1")
    expect(r1).toBeDefined()
    expect(r1!.x).toBe(200)
    expect(r1!.version).toBe(2)
    expect(d1).toBeDefined()
    expect(d1!.x).toBe(100)
  })

  it("getSceneAt(1500): stato finale = replay() → r1 v2 + c1 (d1 cancellato)", () => {
    const journal = makeKnownJournal()
    const atEnd = engine.getSceneAt(journal, 99999)
    const full = engine.replay(journal)
    expect(atEnd).toEqual(full)
    expect(atEnd).toHaveLength(2)
    const ids = atEnd.map((e) => e.id).sort()
    expect(ids).toEqual(["c1", "r1"])
  })

  it("getSceneAt con journal vuoto non crasha", () => {
    const scene = engine.getSceneAt([], 5000)
    expect(scene).toHaveLength(0)
  })

  it("getSceneAt non muta lo stato interno di ReplayEngine", () => {
    const journal = makeKnownJournal()
    engine.getSceneAt(journal, 1050) // chiamata parziale
    const full = engine.replay(journal) // deve restituire lo stato finale normale
    expect(full).toHaveLength(2)
    expect(full.find((e) => e.id === "c1")).toBeDefined()
  })

  it("getSceneAt con eventi non-element (t0/t1/math/pdf) non altera la scena", () => {
    const journal = deserializeEvents(
      serializeEvents([
        { t: 1000, type: "element.add", element: makeElement("a", 1) },
        { t: 1100, type: "t0" },
        { t: 1200, type: "t1" },
        { t: 1300, type: "math.insert", latex: "x^2" },
        { t: 1400, type: "element.update", element: makeElement("a", 2) },
      ]),
    )
    const atT0 = engine.getSceneAt(journal, 1050)
    expect(atT0).toHaveLength(1)
    expect(atT0[0].version).toBe(1)

    const atEnd = engine.getSceneAt(journal, 9999)
    expect(atEnd).toHaveLength(1)
    expect(atEnd[0].version).toBe(2)
  })
})

describe("ReplayEngine — getActiveElements", () => {
  let engine: ReplayEngine

  beforeEach(() => {
    engine = new ReplayEngine()
  })

  it("finestra vuota tra eventi → nessun elemento attivo", () => {
    const active = engine.getActiveElements(makeKnownJournal(), 900, 950)
    expect(active).toHaveLength(0)
  })

  it("finestra [1050, 1150]: contiene add d1 → attivi r1 (creato prima) e d1 (creato in finestra)", () => {
    const active = engine.getActiveElements(makeKnownJournal(), 1050, 1150)
    // r1: add a 1000 (prima), update a 1200 (dopo). Nessun evento nella finestra → non è "attivo" qui
    // d1: add a 1100 (dentro finestra) → attivo
    // Quindi solo d1
    expect(active).toHaveLength(1)
    expect(active[0].id).toBe("d1")
  })

  it("finestra [900, 1150]: include r1.add + d1.add → r1 e d1 attivi", () => {
    const active = engine.getActiveElements(makeKnownJournal(), 900, 1150)
    expect(active).toHaveLength(2)
    const ids = active.map((e) => e.id).sort()
    expect(ids).toEqual(["d1", "r1"])
  })

  it("finestra che taglia uno stroke a metà: t0 dopo add ma prima update → elemento attivo", () => {
    // Simula uno stroke: element.add r1 a t=1000, element.update r1 a t=1200
    // Finestra [1050, 1150]: t0 è dentro lo stroke (dopo add, prima update)
    // r1.add è prima di t0, ma r1.update è DOPO t1 → nessun evento in finestra
    // -> r1 NON è attivo (nessun add/update in finestra)
    //
    // Versione 2: stroke con update in finestra
    // element.add a t=1000, element.update a t=1100
    // finestra [1050, 1150]: update in finestra → attivo
    const journal = deserializeEvents(
      serializeEvents([
        { t: 1000, type: "element.add", element: makeElement("stroke", 1, { type: "freedraw" }) },
        { t: 1100, type: "element.update", element: makeElement("stroke", 2, { type: "freedraw", points: [1, 2, 3] }) },
      ]),
    )
    const active = engine.getActiveElements(journal, 1050, 1200)
    // stroke.update è a 1100 che è dentro [1050, 1200]
    expect(active).toHaveLength(1)
    expect(active[0].id).toBe("stroke")
    expect(active[0].version).toBe(2)
  })

  it("elemento cancellato DOPO la finestra ma attivo nella finestra → incluso", () => {
    const journal = deserializeEvents(
      serializeEvents([
        { t: 1000, type: "element.add", element: makeElement("ephemeral", 1) },
        { t: 2000, type: "element.delete", elementId: "ephemeral" }, // cancellato dopo
      ]),
    )
    // Finestra [900, 1500]: add a 1000 è dentro
    const active = engine.getActiveElements(journal, 900, 1500)
    expect(active).toHaveLength(1)
    expect(active[0].id).toBe("ephemeral")
    // Lo stato restituito è quello a fine finestra (t1=1500), quando esisteva ancora
  })

  it("elemento cancellato DENTRO la finestra → escluso (non esiste a t1)", () => {
    const journal = deserializeEvents(
      serializeEvents([
        { t: 1000, type: "element.add", element: makeElement("flash", 1) },
        { t: 1100, type: "element.delete", elementId: "flash" }, // cancellato dentro finestra
      ]),
    )
    const active = engine.getActiveElements(journal, 900, 1500)
    // flash è stato aggiunto e cancellato dentro la finestra: a t1 non esiste → escluso
    expect(active).toHaveLength(0)
  })

  it("journal vuoto → array vuoto, nessun crash", () => {
    const active = engine.getActiveElements([], 0, 99999)
    expect(active).toHaveLength(0)
  })

  it("elemento con update multipli: ultimo update dentro finestra → attivo con stato finale", () => {
    const journal = deserializeEvents(
      serializeEvents([
        { t: 1000, type: "element.add", element: makeElement("a", 1) },
        { t: 1500, type: "element.update", element: makeElement("a", 2, { x: 50 }) },
        { t: 2000, type: "element.update", element: makeElement("a", 3, { x: 100 }) },
      ]),
    )
    // Finestra [1400, 1800]: ultimo update in finestra è t=1500 -> v2
    const active = engine.getActiveElements(journal, 1400, 1800)
    expect(active).toHaveLength(1)
    expect(active[0].id).toBe("a")
    // Lo stato è quello a t1=1800 (v2 applicato, v3 non ancora)
    expect(active[0].x).toBe(50)
    expect(active[0].version).toBe(2)
  })
})
