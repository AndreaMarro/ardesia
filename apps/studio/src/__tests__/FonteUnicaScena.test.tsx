// @vitest-environment jsdom
//
// FONTE UNICA: la scena reference v1-cap6-esp1 NON è più hand-coded ma
// derivata dal bridge sulla fixture candidate (schema circuit-scene/2).
// Questo test vieta il drift: se qualcuno reintroduce una topologia a mano
// (bat+→j2 senza rail, violazione del testo p30 provata da
// ElabBookConstraints.test.ts "FALSIFICA la topologia della scena reference"),
// il deep-equal fallisce.
import * as fs from "node:fs"
import * as path from "node:path"
import { describe, expect, it } from "vitest"
import { simulationSceneFromElabScene } from "../toolhost/elabSceneBridge"
import {
  ELAB_V1_CAP6_ESP1_BRIDGE_OPTS,
  createReferenceSimulationScene,
} from "../toolhost/ToolCanvasEmbeddable"

const repoRoot = path.resolve(import.meta.dirname, "../../../..")

function candidateFixture(): unknown {
  return JSON.parse(
    fs.readFileSync(
      path.join(repoRoot, "apps/studio/sim/fixtures/elab-scene-v2-candidate-v1cap6esp1.json"),
      "utf-8",
    ),
  )
}

describe("fonte unica scena v1-cap6-esp1", () => {
  it("createReferenceSimulationScene = bridge(fixture): zero topologia hand-coded", () => {
    const reference = createReferenceSimulationScene()
    const bridged = simulationSceneFromElabScene(candidateFixture(), ELAB_V1_CAP6_ESP1_BRIDGE_OPTS)
    expect(reference).toEqual(bridged)
  })

  it("la reference rispetta il testo p30: bat+ arriva a un rail plus, non a un foro di zona", () => {
    const scene = createReferenceSimulationScene()
    const positive = scene.connections.find((connection) => connection.from === "bat1:positive")
    expect(positive?.to).toBe("bb1:bus-top-plus-1")
    expect(positive?.path?.kind).toBe("polyline")
  })

  it("ledOn override sopravvive al bridge (unico delta ammesso)", () => {
    const off = createReferenceSimulationScene({ ledOn: false })
    expect(off.runtime.kind).toBe("battery-led")
    if (off.runtime.kind === "battery-led") expect(off.runtime.ledOn).toBe(false)
  })
})
