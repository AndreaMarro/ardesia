// @vitest-environment node

import { describe, expect, it } from "vitest"
import * as fs from "node:fs"
import * as path from "node:path"
import {
  createElabV1Cap6Esp1CircuitPayload,
  validateElabV1Cap6Esp1Fixture,
  type ElabV1Cap6Esp1Fixture,
} from "../../sim/elab/fixtureAdapter.ts"

const repoRoot = path.resolve(import.meta.dirname, "../../../..")
const fixturePath = path.join(
  repoRoot,
  "apps/studio/sim/fixtures/elab-v1-cap6-esp1.json",
)

function readFixture(): ElabV1Cap6Esp1Fixture {
  return validateElabV1Cap6Esp1Fixture(
    JSON.parse(fs.readFileSync(fixturePath, "utf-8")),
  )
}

function cloneFixture(): ElabV1Cap6Esp1Fixture {
  return JSON.parse(JSON.stringify(readFixture())) as ElabV1Cap6Esp1Fixture
}

describe("ELAB fixture adapter contract", () => {
  it("preserves canonical components in the adapter payload", () => {
    const fixture = readFixture()
    const payload = createElabV1Cap6Esp1CircuitPayload(fixture)

    expect(payload.schema).toBe("elab.circuit-scene-adapter.v1")
    expect(payload.experimentId).toBe("v1-cap6-esp1")
    expect(payload.circuit.components).toEqual(fixture.components)
    expect(payload.provenance.checks.components).toBe("canonical")
  })

  it("preserves canonical wires in the adapter payload", () => {
    const fixture = readFixture()
    const payload = createElabV1Cap6Esp1CircuitPayload(fixture)

    expect(payload.circuit.wires).toEqual(fixture.wires)
    expect(payload.provenance.checks.wires).toBe("canonical")
  })

  it("preserves fixed pinAssignments for future board mounting", () => {
    const fixture = readFixture()
    const payload = createElabV1Cap6Esp1CircuitPayload(fixture)

    expect(payload.circuit.pinAssignments).toEqual({
      "r1:pin1": "bb1:i9",
      "r1:pin2": "bb1:i3",
      "led1:anode": "bb1:f3",
      "led1:cathode": "bb1:e3",
    })
    expect(payload.circuit.pinAssignments).toEqual(fixture.pinAssignments)
    expect(payload.provenance.checks.pinAssignments).toBe("canonical")
  })

  it("exposes manual evidence pages 29-31 as the source label and provenance", () => {
    const payload = createElabV1Cap6Esp1CircuitPayload(readFixture())

    expect(payload.sourceLabel).toBe("Vol.1 pag.29-31")
    expect(payload.manualEvidence.map((evidence) => evidence.page)).toEqual([29, 30, 31])
    expect(payload.provenance.manualPages).toEqual([29, 30, 31])
  })

  it("fails fast when pinAssignments are missing", () => {
    const fixtureWithoutPins: Partial<ElabV1Cap6Esp1Fixture> = cloneFixture()
    delete fixtureWithoutPins.pinAssignments

    expect(() => createElabV1Cap6Esp1CircuitPayload(fixtureWithoutPins)).toThrow(
      /pinAssignments/,
    )
  })

  it("fails when components, wires, or pinAssignments drift", () => {
    const componentDrift = cloneFixture()
    componentDrift.components = componentDrift.components.filter((component) => component.id !== "led1")
    expect(() => createElabV1Cap6Esp1CircuitPayload(componentDrift)).toThrow(
      /components drift/,
    )

    const wireDrift = cloneFixture()
    wireDrift.wires = wireDrift.wires.map((wire, index) =>
      index === 0 ? { ...wire, to: "bb1:wrong-hole" } : wire,
    )
    expect(() => createElabV1Cap6Esp1CircuitPayload(wireDrift)).toThrow(/wires drift/)

    const pinDrift = cloneFixture()
    pinDrift.pinAssignments = { ...pinDrift.pinAssignments, "led1:anode": "bb1:f8" }
    expect(() => createElabV1Cap6Esp1CircuitPayload(pinDrift)).toThrow(
      /pinAssignments drift/,
    )
  })
})
