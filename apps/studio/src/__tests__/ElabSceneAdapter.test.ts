// @vitest-environment node

import { describe, expect, it } from "vitest"
import * as fs from "node:fs"
import * as path from "node:path"
import {
  createSimulationAdapterPayloadFromElabScene,
  type ElabSceneSimulationAdapterPayload,
} from "../../sim/elab/elabSceneAdapter.ts"

const repoRoot = path.resolve(import.meta.dirname, "../../../..")

function readJsonFixture(name: string): unknown {
  return JSON.parse(
    fs.readFileSync(path.join(repoRoot, "apps/studio/sim/fixtures", name), "utf-8"),
  )
}

const candidateFixture = () => readJsonFixture("elab-scene-v2-candidate-v1cap6esp1.json")
const verifiedFixture = () => readJsonFixture("elab-scene-v2-verified-synthetic.json")

describe("ElabScene -> Simulation Plugin adapter", () => {
  it("adapts the real Vol.1 cap.6 esp.1 candidate into the simulator circuit payload", () => {
    const payload = createSimulationAdapterPayloadFromElabScene(candidateFixture())

    expect(payload).toMatchObject({
      schema: "elab.scene-sim-adapter.v1",
      experimentId: "v1-cap6-esp1",
      sourceLabel: "Vol.1 pag.29-31",
      canDriveLesson: false,
      circuit: {
        components: [
          { id: "bat1", type: "battery9v" },
          { id: "bb1", type: "breadboard-half" },
          { id: "r1", type: "resistor", value: 470 },
          { id: "led1", type: "led", color: "red" },
        ],
        wires: [
          { id: "w1", from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
          { id: "w2", from: "bb1:bus-top-plus-9", to: "bb1:j9", color: "red" },
          { id: "w3", from: "bb1:a3", to: "bat1:negative", color: "black" },
        ],
        pinAssignments: {
          "r1:pin1": "bb1:i9",
          "r1:pin2": "bb1:i3",
          "led1:anode": "bb1:f3",
          "led1:cathode": "bb1:e3",
        },
      },
    } satisfies Partial<ElabSceneSimulationAdapterPayload>)
    expect(payload.geometry).toEqual({
      componentsTotal: 4,
      componentsWithPose: 0,
      wiresTotal: 3,
      wiresWithAuthoredPath: 0,
      componentPoses: {},
      wirePaths: {},
    })
  })

  it("preserves authored geometry from a verified scene without moving it into renderer state", () => {
    const payload = createSimulationAdapterPayloadFromElabScene(verifiedFixture())

    expect(payload.canDriveLesson).toBe(true)
    expect(payload.geometry.componentsWithPose).toBe(payload.geometry.componentsTotal)
    expect(payload.geometry.wiresWithAuthoredPath).toBe(payload.geometry.wiresTotal)
    expect(payload.geometry.componentPoses["led1"]).toEqual({
      x: 32.75,
      y: 72.5,
      rotationDeg: 90,
      scale: 1,
    })
    expect(payload.geometry.wirePaths["w1"]?.points).toEqual([
      { x: 280, y: 50 },
      { x: 150, y: 5 },
      { x: 17.75, y: 21.25 },
    ])
  })

  it("rejects pinAssignments that point to non-existent breadboard refs", () => {
    const scene = candidateFixture() as { pinAssignments: Record<string, string> }
    scene.pinAssignments["led1:anode"] = "bb1:k999"

    expect(() => createSimulationAdapterPayloadFromElabScene(scene)).toThrow(
      /invalid breadboard ref in pinAssignments led1:anode: bb1:k999/,
    )
  })

  it("rejects wire endpoints that look like breadboard refs but do not resolve", () => {
    const scene = candidateFixture() as { wires: Array<{ from: string; to: string }> }
    scene.wires[1]!.from = "bb1:bus-top-plus-999"

    expect(() => createSimulationAdapterPayloadFromElabScene(scene)).toThrow(
      /invalid breadboard ref in wire w2.from: bb1:bus-top-plus-999/,
    )
  })

  it("rejects a wire endpoint whose breadboard-like prefix is a typo (fail-closed, not fail-open)", () => {
    const scene = candidateFixture() as { wires: Array<{ from: string; to: string }> }
    scene.wires[1]!.from = "b1:j9"

    expect(() => createSimulationAdapterPayloadFromElabScene(scene)).toThrow(
      /unresolvable endpoint in wire w2.from: b1:j9/,
    )
  })

  it("rejects a breadboard ref whose board id is not a declared component", () => {
    const scene = candidateFixture() as { wires: Array<{ from: string; to: string }> }
    scene.wires[1]!.from = "bb99:j9"

    expect(() => createSimulationAdapterPayloadFromElabScene(scene)).toThrow(
      /breadboard bb99 is not a declared component in wire w2.from: bb99:j9/,
    )
  })

  it("rejects a wire endpoint referencing an undeclared component", () => {
    const scene = candidateFixture() as { wires: Array<{ from: string; to: string }> }
    scene.wires[2]!.to = "batt9:negative"

    expect(() => createSimulationAdapterPayloadFromElabScene(scene)).toThrow(
      /unresolvable endpoint in wire w3.to: batt9:negative/,
    )
  })

  it("rejects a pinAssignments key whose component is not declared", () => {
    const scene = candidateFixture() as { pinAssignments: Record<string, string> }
    scene.pinAssignments["rx:pin1"] = "bb1:a1"

    expect(() => createSimulationAdapterPayloadFromElabScene(scene)).toThrow(
      /unresolvable component in pinAssignments key rx:pin1/,
    )
  })

  it("rejects a pinAssignments value on a board that is not a declared component", () => {
    const scene = candidateFixture() as { pinAssignments: Record<string, string> }
    scene.pinAssignments["led1:anode"] = "bb2:f3"

    expect(() => createSimulationAdapterPayloadFromElabScene(scene)).toThrow(
      /breadboard bb2 is not a declared component in pinAssignments led1:anode: bb2:f3/,
    )
  })

  it("dedupes duplicate book pages in sourceLabel", () => {
    const scene = candidateFixture() as { book: { pages: number[] } }
    scene.book.pages = [29, 29, 30, 31]

    expect(createSimulationAdapterPayloadFromElabScene(scene).sourceLabel).toBe("Vol.1 pag.29-31")
  })

  it("is deterministic for repeat adapter runs", () => {
    expect(JSON.stringify(createSimulationAdapterPayloadFromElabScene(candidateFixture()))).toBe(
      JSON.stringify(createSimulationAdapterPayloadFromElabScene(candidateFixture())),
    )
  })

  // F5: zeri iniziali non devono aliasare i ref (bb1:j09 ≡ bb1:j9 via Number()).
  // La grammatica breadboard è ancorata a [1-9]\d* come sim/breadboard/geometry.ts.
  it("rejects a wire endpoint whose column has a leading zero instead of aliasing it", () => {
    const scene = candidateFixture() as { wires: Array<{ from: string; to: string }> }
    scene.wires[1]!.to = "bb1:j09"

    expect(() => createSimulationAdapterPayloadFromElabScene(scene)).toThrow(
      /invalid breadboard ref in wire w2.to: bb1:j09/,
    )
  })

  it("rejects a rail ref whose index has a leading zero instead of aliasing it", () => {
    const scene = candidateFixture() as { wires: Array<{ from: string; to: string }> }
    scene.wires[1]!.from = "bb1:bus-top-plus-09"

    expect(() => createSimulationAdapterPayloadFromElabScene(scene)).toThrow(
      /invalid breadboard ref in wire w2.from: bb1:bus-top-plus-09/,
    )
  })

  it("rejects a board id with a leading zero at the grammar level, not as a distinct board", () => {
    const scene = candidateFixture() as { wires: Array<{ from: string; to: string }> }
    scene.wires[1]!.from = "bb01:j9"

    expect(() => createSimulationAdapterPayloadFromElabScene(scene)).toThrow(
      /invalid breadboard ref in wire w2.from: bb01:j9/,
    )
  })

  it("rejects a pinAssignments value whose column has a leading zero", () => {
    const scene = candidateFixture() as { pinAssignments: Record<string, string> }
    scene.pinAssignments["led1:anode"] = "bb1:f03"

    expect(() => createSimulationAdapterPayloadFromElabScene(scene)).toThrow(
      /invalid breadboard ref in pinAssignments led1:anode: bb1:f03/,
    )
  })
})
