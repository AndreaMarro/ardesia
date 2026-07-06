// @vitest-environment node

import { describe, expect, it } from "vitest"
import * as fs from "node:fs"
import * as path from "node:path"
import {
  canDriveLesson,
  fromCircuitSceneV1,
  sceneGeometryStatus,
  validateElabScene,
  type ElabScene,
} from "../../sim/elab/elabScene.ts"

const repoRoot = path.resolve(import.meta.dirname, "../../../..")

function readJsonFixture(name: string): unknown {
  return JSON.parse(
    fs.readFileSync(path.join(repoRoot, "apps/studio/sim/fixtures", name), "utf-8"),
  )
}

// Dichiarate FIXTURE: dati di test, non scene di produzione.
// - candidate: topologia reale Vol.1 cap.6 esp.1 (stessa BOM/wiring di elab-v1-cap6-esp1.json),
//   geometria NON authored (backfill onesto: niente pose, niente wire.path).
// - verified: scena SINTETICA completa di geometria, serve solo a coprire lo schema pieno.
const candidateFixture = () => readJsonFixture("elab-scene-v2-candidate-v1cap6esp1.json")
const verifiedFixture = () => readJsonFixture("elab-scene-v2-verified-synthetic.json")

function validScene(): ElabScene {
  const result = validateElabScene(verifiedFixture())
  if (!result.ok) throw new Error(`fixture invalid: ${JSON.stringify(result.errors)}`)
  return result.scene
}

describe("ElabScene circuit-scene/2 schema", () => {
  it("accepts the verified synthetic fixture (full geometry)", () => {
    const result = validateElabScene(verifiedFixture())
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.scene.schemaVersion).toBe("circuit-scene/2")
    expect(result.scene.provenance.status).toBe("verified")
    expect(result.scene.wires.every((wire) => (wire.path?.points.length ?? 0) >= 2)).toBe(true)
  })

  it("accepts the candidate fixture with authored geometry (scena reale riconciliata)", () => {
    const result = validateElabScene(candidateFixture())
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.scene.provenance.status).toBe("candidate")
    expect(result.scene.components.every((component) => component.pose !== undefined)).toBe(true)
    expect(result.scene.wires.every((wire) => (wire.path?.points.length ?? 0) >= 2)).toBe(true)
  })

  it("rejects a wrong schemaVersion with a per-field error", () => {
    const scene = { ...(candidateFixture() as Record<string, unknown>), schemaVersion: "circuit-scene/1" }
    const result = validateElabScene(scene)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.some((error) => error.path === "schemaVersion")).toBe(true)
  })

  it("rejects an unknown provenance status with a per-field error", () => {
    const scene = validScene() as unknown as { provenance: { status: string } }
    scene.provenance.status = "fixture-validated"
    const result = validateElabScene(scene)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.some((error) => error.path === "provenance.status")).toBe(true)
  })

  it("rejects unknown top-level keys (fail-closed against typos)", () => {
    const scene = { ...(candidateFixture() as Record<string, unknown>), wirez: [] }
    const result = validateElabScene(scene)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.some((error) => error.message.includes("wirez"))).toBe(true)
  })

  it("rejects a malformed sourceImageHash (must be sha256 hex)", () => {
    const scene = validScene()
    scene.source.sourceImageHash = "not-a-hash"
    const result = validateElabScene(scene)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.some((error) => error.path === "source.sourceImageHash")).toBe(true)
  })

  it("reports the deep path for a broken wire path point", () => {
    const scene = validScene() as unknown as {
      wires: Array<{ path?: { points: Array<Record<string, unknown>> } }>
    }
    delete scene.wires[0]!.path!.points[1]!.y
    const result = validateElabScene(scene)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.some((error) => error.path === "wires.0.path.points.1.y")).toBe(true)
  })

  it("rejects duplicate component ids", () => {
    const scene = validScene()
    scene.components.push({ ...scene.components[0]! })
    const result = validateElabScene(scene)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.some((error) => error.path === "components")).toBe(true)
  })

  it("rejects duplicate wire ids", () => {
    const scene = validScene()
    scene.wires.push({ ...scene.wires[0]! })
    const result = validateElabScene(scene)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.some((error) => error.path === "wires")).toBe(true)
  })

  it("rejects a wire id that collides with a component id", () => {
    const scene = validScene()
    scene.wires[0]!.id = scene.components[0]!.id
    const result = validateElabScene(scene)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.some((error) => error.path === "wires" && error.message.includes("collides"))).toBe(true)
  })

  it("rejects a cropBBox with non-positive width or height", () => {
    const scene = validScene()
    scene.source.cropBBox = [0, 0, -253, 145]
    const result = validateElabScene(scene)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.some((error) => error.path === "source.cropBBox")).toBe(true)
  })

  it("rejects empty pinAssignments keys or values", () => {
    const scene = validScene() as unknown as { pinAssignments: Record<string, string> }
    scene.pinAssignments[""] = "bb1:a1"
    const result = validateElabScene(scene)
    expect(result.ok).toBe(false)
  })
})

describe("fromCircuitSceneV1 read-shim (connections -> wires)", () => {
  const legacyScene = () => ({
    schemaVersion: "circuit-scene/1",
    experimentId: "v1-cap6-esp1",
    provenance: {
      status: "candidate",
      origin: "imported",
      checks: { electrical: "unknown", geometry: "unknown", bookMatch: "unknown" },
    },
    book: { volume: 1, chapter: 6, exp: "esp1", pages: [29, 30, 31] },
    components: [
      { id: "bat1", type: "battery9v" },
      { id: "bb1", type: "breadboard-half" },
      { id: "r1", type: "resistor", value: 470 },
      { id: "led1", type: "led", color: "red" },
    ],
    connections: [
      { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
      { from: "bb1:bus-top-plus-9", to: "bb1:j9", color: "red" },
      { from: "bb1:a3", to: "bat1:negative", color: "black" },
    ],
    pinAssignments: {
      "r1:pin1": "bb1:i9",
      "r1:pin2": "bb1:i3",
      "led1:anode": "bb1:f3",
      "led1:cathode": "bb1:e3",
    },
  })

  it("produces a valid circuit-scene/2 scene", () => {
    const shimmed = fromCircuitSceneV1(legacyScene())
    const result = validateElabScene(shimmed)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.scene.schemaVersion).toBe("circuit-scene/2")
    expect(result.scene.wires).toHaveLength(3)
    expect(result.scene.wires.map((wire) => ({ from: wire.from, to: wire.to, color: wire.color }))).toEqual(
      legacyScene().connections,
    )
  })

  it("adds the 4th validator axis as unknown, preserving the v1 checks", () => {
    const legacy = legacyScene()
    legacy.provenance.checks = { electrical: "pass", geometry: "fail", bookMatch: "pass" }
    const shimmed = fromCircuitSceneV1(legacy)
    expect(shimmed.provenance.checks).toEqual({
      electrical: "pass",
      geometry: "fail",
      bookMatch: "pass",
      visualMatch: "unknown",
    })
  })

  it("preserves the v1 audit trail (sourceRef/verifiedBy/verifiedAt)", () => {
    const legacy = legacyScene() as Record<string, unknown>
    legacy.provenance = {
      status: "verified",
      origin: "hand-authored",
      sourceRef: "pr#195",
      verifiedBy: "andrea",
      verifiedAt: "2026-06-23T00:00:00Z",
      checks: { electrical: "pass", geometry: "pass", bookMatch: "pass" },
    }
    const shimmed = fromCircuitSceneV1(legacy)
    expect(shimmed.provenance.sourceRef).toBe("pr#195")
    expect(shimmed.provenance.verifiedBy).toBe("andrea")
    expect(shimmed.provenance.verifiedAt).toBe("2026-06-23T00:00:00Z")
  })

  it("refuses to silently drop authored v1 waypoints", () => {
    const legacy = legacyScene() as { connections: Array<Record<string, unknown>> }
    legacy.connections[0]!.waypoints = [{ x: 1, y: 2 }]
    expect(() => fromCircuitSceneV1(legacy)).toThrow(/waypoints/)
  })

  it("fails closed on v1 components carrying unknown extra keys", () => {
    const legacy = legacyScene() as { components: Array<Record<string, unknown>> }
    legacy.components[2]!.layout = { x: 151.5, y: 43.75 }
    expect(() => fromCircuitSceneV1(legacy)).toThrow(/components/)
  })

  it("fails closed on v1 connections carrying unknown extra keys (no silent drop)", () => {
    const legacy = legacyScene() as { connections: Array<Record<string, unknown>> }
    legacy.connections[1]!.gauge = "22awg"
    expect(() => fromCircuitSceneV1(legacy)).toThrow(
      /connections\[1\] carries unknown key gauge/,
    )
  })

  it("fails closed on a legacy connection id: re-keying would sever external references", () => {
    const legacy = legacyScene() as { connections: Array<Record<string, unknown>> }
    legacy.connections[0]!.id = "legacy-conn-7"
    expect(() => fromCircuitSceneV1(legacy)).toThrow(/connections\[0\] carries unknown key id/)
  })

  it("is deterministic: same input, byte-identical output", () => {
    expect(JSON.stringify(fromCircuitSceneV1(legacyScene()))).toBe(
      JSON.stringify(fromCircuitSceneV1(legacyScene())),
    )
  })

  it("does not invent geometry: no poses, no wire paths", () => {
    const shimmed = fromCircuitSceneV1(legacyScene())
    const status = sceneGeometryStatus(shimmed)
    expect(status).toEqual({
      componentsTotal: 4,
      componentsWithPose: 0,
      wiresTotal: 3,
      wiresWithAuthoredPath: 0,
    })
  })

  it("maps a v1 book with a single page to pages[]", () => {
    const legacy = legacyScene() as Record<string, unknown>
    legacy.book = { volume: 1, page: 29, ref: "fig 6.1", photo: "esp1.jpg" }
    const shimmed = fromCircuitSceneV1(legacy)
    expect(shimmed.book).toEqual({ volume: 1, pages: [29] })
    expect(validateElabScene(shimmed).ok).toBe(true)
  })

  it("rejects a legacy scene without connections", () => {
    const legacy = legacyScene() as Record<string, unknown>
    delete legacy.connections
    expect(() => fromCircuitSceneV1(legacy)).toThrow(/connections/)
  })
})

describe("provenance gate", () => {
  it("only verified scenes can drive real lessons", () => {
    const scene = validScene()
    expect(canDriveLesson(scene)).toBe(true)
    for (const status of ["candidate", "reviewed", "rejected", "deprecated"] as const) {
      scene.provenance.status = status
      expect(canDriveLesson(scene)).toBe(false)
    }
  })

  it("a verified scene with any failing or unknown check cannot drive lessons", () => {
    for (const bad of ["fail", "unknown"] as const) {
      const scene = validScene()
      scene.provenance.checks.visualMatch = bad
      expect(canDriveLesson(scene)).toBe(false)
    }
  })

  it("measures authored geometry on the verified fixture", () => {
    const status = sceneGeometryStatus(validScene())
    expect(status.componentsWithPose).toBe(status.componentsTotal)
    expect(status.wiresWithAuthoredPath).toBe(status.wiresTotal)
  })
})
