// @vitest-environment node
//
// ELAB Vol.1 cap.6 esp.1 drift guard for the Simulation Plugin context fixture.

import { describe, expect, it } from "vitest"
import * as fs from "node:fs"
import * as path from "node:path"

type CircuitComponent = {
  type: string
  id: string
  value?: number
  color?: string
}

type CircuitWire = {
  from: string
  to: string
  color: string
}

type BuildCircuitIntent = {
  components: CircuitComponent[]
  wires: CircuitWire[]
}

type ManualEvidence = {
  page: number
  claim: string
  evidence: string
}

type ElabFixture = {
  id: string
  title: string
  scope: string
  sourceOfTruth: {
    manualPdf: string
    manualPages: number[]
    experimentData: string
    lessonPath: string
  }
  manualEvidence: ManualEvidence[]
  components: CircuitComponent[]
  pinAssignments: Record<string, string>
  wires: CircuitWire[]
  driftNotes: string[]
}

type Experiment = {
  id: string
  components: CircuitComponent[]
  pinAssignments?: Record<string, string>
  connections: CircuitWire[]
}

type ExperimentsVol1Module = {
  default: {
    experiments: Experiment[]
  }
}

type LessonPath = {
  experiment_id: string
  phases: Array<{
    build_circuit?: {
      intent: BuildCircuitIntent
    }
  }>
  book_reference: {
    volume: number
    page: number
    label: string
  }
}

const repoRoot = path.resolve(import.meta.dirname, "../../../..")
const fixturePath = path.join(
  repoRoot,
  "apps/studio/sim/fixtures/elab-v1-cap6-esp1.json",
)
const experimentPath = path.join(
  repoRoot,
  "plugins/elab-tutor/src/data/experiments-vol1.js",
)
const lessonPath = path.join(
  repoRoot,
  "plugins/elab-tutor/src/data/lesson-paths/v1-cap6-esp1.json",
)

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T
}

function sortByJson<T>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
}

function findBuildCircuitIntent(lesson: LessonPath): BuildCircuitIntent {
  const phase = lesson.phases.find((candidate) => candidate.build_circuit)
  if (!phase?.build_circuit) throw new Error("missing build_circuit intent")
  return phase.build_circuit.intent
}

describe("ELAB Vol.1 cap.6 esp.1 Simulation Plugin fixture", () => {
  it("declares manual evidence across pages 29-31, not only the lesson-path page 29 reference", () => {
    const fixture = readJson<ElabFixture>(fixturePath)
    const lesson = readJson<LessonPath>(lessonPath)

    expect(fixture.id).toBe("v1-cap6-esp1")
    expect(fixture.scope).toBe("simulation-plugin-context-fixture")
    expect(fixture.sourceOfTruth.manualPages).toEqual([29, 30, 31])
    expect(fixture.manualEvidence.map((evidence) => evidence.page)).toEqual([29, 30, 31])
    expect(fixture.manualEvidence.map((evidence) => evidence.claim)).toEqual([
      "parts-list",
      "assembly-sequence",
      "closed-circuit",
    ])

    expect(lesson.book_reference).toEqual({
      volume: 1,
      page: 29,
      label: "Vol.1 pag.29",
    })
  })

  it("matches experiments-vol1.js and lesson-path circuit data for components and wires", async () => {
    const fixture = readJson<ElabFixture>(fixturePath)
    const lesson = readJson<LessonPath>(lessonPath)
    const module = (await import(experimentPath)) as ExperimentsVol1Module
    const experiment = module.default.experiments.find((candidate) => candidate.id === fixture.id)
    const lessonIntent = findBuildCircuitIntent(lesson)

    expect(experiment).toBeDefined()
    expect(sortByJson(fixture.components)).toEqual(sortByJson(experiment!.components))
    expect(sortByJson(fixture.components)).toEqual(sortByJson(lessonIntent.components))
    expect(sortByJson(fixture.wires)).toEqual(sortByJson(experiment!.connections))
    expect(sortByJson(fixture.wires)).toEqual(sortByJson(lessonIntent.wires))
  })

  it("preserves fixed pin assignments from experiments-vol1.js and records lesson-path drift", async () => {
    const fixture = readJson<ElabFixture>(fixturePath)
    const lesson = readJson<LessonPath>(lessonPath)
    const module = (await import(experimentPath)) as ExperimentsVol1Module
    const experiment = module.default.experiments.find((candidate) => candidate.id === fixture.id)

    expect(experiment?.pinAssignments).toEqual({
      "r1:pin1": "bb1:a2",
      "r1:pin2": "bb1:a9",
      "led1:anode": "bb1:f9",
      "led1:cathode": "bb1:f10",
    })
    expect(fixture.pinAssignments).toEqual(experiment!.pinAssignments)
    expect("pinAssignments" in findBuildCircuitIntent(lesson)).toBe(false)
    expect(fixture.driftNotes).toContain(
      "The lesson-path book_reference points to page 29 only; this fixture records manual evidence across pages 29-31.",
    )
  })

  it("keeps the fixture bounded to circuit evidence without runtime or deployment claims", () => {
    const fixtureText = fs.readFileSync(fixturePath, "utf-8").toLowerCase()

    expect(fixtureText).not.toMatch(/\bdeploy(ed|ment)?\b/)
    expect(fixtureText).not.toMatch(/\bproduct-ready\b/)
    expect(fixtureText).not.toMatch(/\bruntime\b/)
    expect(fixtureText).not.toContain("qualunque immagine")
  })
})
