import { validateElabV1Cap6Esp1BookTopology } from "../breadboard/geometry"

export type ElabCircuitComponent = {
  type: string
  id: string
  value?: number
  color?: string
}

export type ElabCircuitWire = {
  from: string
  to: string
  color: string
}

export type ElabManualEvidence = {
  page: number
  claim: string
  evidence: string
}

export type ElabV1Cap6Esp1Fixture = {
  id: string
  title: string
  scope: string
  sourceOfTruth: {
    manualPdf: string
    manualPages: number[]
    experimentData: string
    lessonPath: string
  }
  manualEvidence: ElabManualEvidence[]
  components: ElabCircuitComponent[]
  pinAssignments: Record<string, string>
  wires: ElabCircuitWire[]
  driftNotes: string[]
}

export type ElabCircuitSceneAdapterPayload = {
  schema: "elab.circuit-scene-adapter.v1"
  experimentId: "v1-cap6-esp1"
  title: string
  sourceLabel: "Vol.1 pag.29-31"
  manualEvidence: ElabManualEvidence[]
  circuit: {
    components: ElabCircuitComponent[]
    wires: ElabCircuitWire[]
    pinAssignments: Record<string, string>
  }
  provenance: {
    status: "fixture-validated"
    manualPages: [29, 30, 31]
    checks: {
      components: "canonical"
      wires: "canonical"
      pinAssignments: "canonical"
    }
  }
}

export const ELAB_V1_CAP6_ESP1_MANUAL_PAGES = [29, 30, 31] as const

const EXPECTED_COMPONENTS: ElabCircuitComponent[] = [
  { type: "battery9v", id: "bat1" },
  { type: "breadboard-half", id: "bb1" },
  { type: "resistor", id: "r1", value: 470 },
  { type: "led", id: "led1", color: "red" },
]

// Book-faithful topology (Vol.1 pp.29-31): LED straddles the central divide on tie 3,
// resistor reaches the red strip via one jumper on tie 9 (component pins live in holes,
// so the book's leg-in-the-strip becomes a jumper), negative lead returns directly.
const EXPECTED_PIN_ASSIGNMENTS: Record<string, string> = {
  "r1:pin1": "bb1:i9",
  "r1:pin2": "bb1:i3",
  "led1:anode": "bb1:f3",
  "led1:cathode": "bb1:e3",
}

const EXPECTED_WIRES: ElabCircuitWire[] = [
  { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
  { from: "bb1:bus-top-plus-9", to: "bb1:j9", color: "red" },
  { from: "bb1:a3", to: "bat1:negative", color: "black" },
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`
  if (!isRecord(value)) return JSON.stringify(value)
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
    .join(",")}}`
}

function sortByStableJson<T>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => stableJson(a).localeCompare(stableJson(b)))
}

function assertSameFixturePart(name: string, actual: unknown, expected: unknown): void {
  if (stableJson(sortIfArray(actual)) !== stableJson(sortIfArray(expected))) {
    throw new Error(`ELAB v1 cap6 esp1 ${name} drift`)
  }
}

function sortIfArray(value: unknown): unknown {
  return Array.isArray(value) ? sortByStableJson(value) : value
}

function readString(value: Record<string, unknown>, key: string): string {
  const field = value[key]
  if (typeof field !== "string" || field.length === 0) {
    throw new Error(`ELAB v1 cap6 esp1 fixture missing ${key}`)
  }
  return field
}

function readArray<T>(value: Record<string, unknown>, key: string): T[] {
  const field = value[key]
  if (!Array.isArray(field)) throw new Error(`ELAB v1 cap6 esp1 fixture missing ${key}`)
  return field as T[]
}

function readRecord(value: Record<string, unknown>, key: string): Record<string, string> {
  const field = value[key]
  if (!isRecord(field)) throw new Error(`ELAB v1 cap6 esp1 fixture missing ${key}`)
  const entries = Object.entries(field)
  if (entries.length === 0 || entries.some(([, item]) => typeof item !== "string")) {
    throw new Error(`ELAB v1 cap6 esp1 fixture invalid ${key}`)
  }
  return Object.fromEntries(entries) as Record<string, string>
}

export function validateElabV1Cap6Esp1Fixture(input: unknown): ElabV1Cap6Esp1Fixture {
  if (!isRecord(input)) throw new Error("ELAB v1 cap6 esp1 fixture must be an object")

  const sourceOfTruth = input.sourceOfTruth
  if (!isRecord(sourceOfTruth)) {
    throw new Error("ELAB v1 cap6 esp1 fixture missing sourceOfTruth")
  }

  const fixture: ElabV1Cap6Esp1Fixture = {
    id: readString(input, "id"),
    title: readString(input, "title"),
    scope: readString(input, "scope"),
    sourceOfTruth: {
      manualPdf: readString(sourceOfTruth, "manualPdf"),
      manualPages: readArray<number>(sourceOfTruth, "manualPages"),
      experimentData: readString(sourceOfTruth, "experimentData"),
      lessonPath: readString(sourceOfTruth, "lessonPath"),
    },
    manualEvidence: readArray<ElabManualEvidence>(input, "manualEvidence"),
    components: readArray<ElabCircuitComponent>(input, "components"),
    pinAssignments: readRecord(input, "pinAssignments"),
    wires: readArray<ElabCircuitWire>(input, "wires"),
    driftNotes: readArray<string>(input, "driftNotes"),
  }

  if (fixture.id !== "v1-cap6-esp1") {
    throw new Error(`ELAB v1 cap6 esp1 fixture id drift: ${fixture.id}`)
  }
  assertSameFixturePart("manualPages", fixture.sourceOfTruth.manualPages, [
    ...ELAB_V1_CAP6_ESP1_MANUAL_PAGES,
  ])
  assertSameFixturePart(
    "manualEvidence pages",
    fixture.manualEvidence.map((evidence) => evidence.page),
    [...ELAB_V1_CAP6_ESP1_MANUAL_PAGES],
  )
  assertSameFixturePart("components", fixture.components, EXPECTED_COMPONENTS)
  assertSameFixturePart("wires", fixture.wires, EXPECTED_WIRES)
  assertSameFixturePart("pinAssignments", fixture.pinAssignments, EXPECTED_PIN_ASSIGNMENTS)
  validateElabV1Cap6Esp1BookTopology({
    pinAssignments: fixture.pinAssignments,
    wires: fixture.wires,
  })

  return fixture
}

export function createElabV1Cap6Esp1CircuitPayload(
  input: unknown,
): ElabCircuitSceneAdapterPayload {
  const fixture = validateElabV1Cap6Esp1Fixture(input)
  return {
    schema: "elab.circuit-scene-adapter.v1",
    experimentId: "v1-cap6-esp1",
    title: fixture.title,
    sourceLabel: "Vol.1 pag.29-31",
    manualEvidence: fixture.manualEvidence.map((evidence) => ({ ...evidence })),
    circuit: {
      components: fixture.components.map((component) => ({ ...component })),
      wires: fixture.wires.map((wire) => ({ ...wire })),
      pinAssignments: { ...fixture.pinAssignments },
    },
    provenance: {
      status: "fixture-validated",
      manualPages: [29, 30, 31],
      checks: {
        components: "canonical",
        wires: "canonical",
        pinAssignments: "canonical",
      },
    },
  }
}
