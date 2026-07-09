export type SimulationMode = "gia-montato" | "passo-passo" | "monta-tu"

export type SimulationStepProjection = {
  id: string
  order: number
  reveals: {
    components: readonly string[]
    connections: readonly string[]
  }
  scene: SimulationSceneLike
}

export type SimulationModeProjection = {
  mode: SimulationMode
  scene: SimulationSceneLike
  editable: boolean
  steps: readonly SimulationStepProjection[]
}

export type DerivedSimulationModes = {
  mounted: SimulationModeProjection
  stepByStep: SimulationModeProjection
  freeAssembly: SimulationModeProjection
}

export type SimulationSceneLike = {
  experimentId?: string
  components?: readonly { id: string }[]
  connections?: readonly {
    from: string
    to: string
    color?: string
    kind?: string
    path?: unknown
  }[]
  pinAssignments?: Record<string, string>
  manual?: unknown
  provenance?: unknown
  [key: string]: unknown
}

export type NormalizedSimulationScene = {
  experimentId?: string
  components: readonly { id: string }[]
  connections: readonly {
    from: string
    to: string
    color?: string
    kind?: string
    path?: unknown
  }[]
  pinAssignments: Record<string, string>
  manual?: unknown
  provenance?: unknown
}

function canonicalSteps(scene: SimulationSceneLike): SimulationStepProjection[] {
  const components = [...(scene.components ?? [])].map((component) => component.id)
  const connections = [...(scene.connections ?? [])].map(
    (connection, index) => `${connection.from}->${connection.to}#${index + 1}`,
  )
  return [
    {
      id: `${scene.experimentId ?? "scene"}-final`,
      order: 1,
      reveals: { components, connections },
      scene,
    },
  ]
}

export function deriveSimulationModes(scene: SimulationSceneLike): DerivedSimulationModes {
  const steps = canonicalSteps(scene)
  return {
    mounted: { mode: "gia-montato", scene, editable: false, steps: [] },
    stepByStep: { mode: "passo-passo", scene, editable: false, steps },
    freeAssembly: { mode: "monta-tu", scene, editable: true, steps: [] },
  }
}

export function finalStepState(projection: SimulationModeProjection): SimulationSceneLike {
  const last = projection.steps.at(-1)
  return last?.scene ?? projection.scene
}

export function normalizeScene(scene: SimulationSceneLike): NormalizedSimulationScene {
  return {
    experimentId: scene.experimentId,
    components: [...(scene.components ?? [])],
    connections: [...(scene.connections ?? [])],
    pinAssignments: { ...(scene.pinAssignments ?? {}) },
    manual: scene.manual,
    provenance: scene.provenance,
  }
}
