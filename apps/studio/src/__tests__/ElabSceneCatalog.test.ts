// @vitest-environment node

import { describe, expect, it } from "vitest"
import {
  getElabSceneStatus,
  V3_CAP6_ESP4_BLOCKER,
} from "../../sim/elab/sceneCatalog"

describe("ELAB scene catalog", () => {
  it("blocks v3-cap6-esp4 until verified authored geometry exists", () => {
    const status = getElabSceneStatus("v3-cap6-esp4")
    expect(status.kind).toBe("blocked")
    if (status.kind !== "blocked") throw new Error("expected blocked status")
    expect(status.experimentId).toBe("v3-cap6-esp4")
    expect(status.provenance).toEqual({
      experimentId: "v3-cap6-esp4",
      volume: 3,
      chapter: 6,
      page: 54,
      sourceManual: "Vol.3 pag.54 - ESERCIZIO 6.4",
      status: "blocked",
      blocker: V3_CAP6_ESP4_BLOCKER,
      checks: {
        electrical: "unknown",
        geometry: "unknown",
        bookMatch: "unknown",
        visualMatch: "unknown",
      },
    })
    expect(status.scene).toBeUndefined()
  })

  it("risponde 'blocked' anche per un esperimento che il prodotto MONTA davvero", () => {
    // Il confine, scritto come test perche' non si perda: questo modulo non e'
    // la fonte di verita' del mount. `v1-cap6-esp1` si monta e risolve nel
    // prodotto (misurato in browser il 2026-08-25), e qui risulta `blocked`
    // perche' il ramo `ready` non viene mai costruito. Chi volesse cablare
    // questo modulo come cancello del mount deve PRIMA aggiungere le voci
    // `ready`, o bloccherebbe tutto.
    const status = getElabSceneStatus("v1-cap6-esp1")
    expect(status.kind).toBe("blocked")
    expect(status.scene).toBeUndefined()
  })

  it("unknown experiments fail closed instead of borrowing another scene", () => {
    const status = getElabSceneStatus("v9-cap9-esp9")
    expect(status.kind).toBe("blocked")
    if (status.kind !== "blocked") throw new Error("expected blocked status")
    expect(status.experimentId).toBe("v9-cap9-esp9")
    expect(status.blocker).toContain("no SimulationScene registered")
    expect(status.scene).toBeUndefined()
    expect(status.provenance).toBeUndefined()
  })
})
