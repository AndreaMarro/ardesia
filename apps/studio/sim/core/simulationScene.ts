export type SimulationSourceKind =
  | "wokwi-diagram-json"
  | "manual-description"
  | "image-observation"
  | "kicad-schematic"
  | "fritzing-part"
  | "elab-pack"

export type SimulationPoint = {
  x: number
  y: number
}

export type SimulationPose = SimulationPoint & {
  rotation?: number
}

export type SimulationComponent = {
  id: string
  type: string
  label?: string
  pose: SimulationPose
  attrs?: Record<string, string | number | boolean>
}

export type SimulationWirePath = {
  kind: "orthogonal" | "polyline"
  points: SimulationPoint[]
  sourceInstructions?: string[]
}

export type SimulationWire = {
  id: string
  from: string
  to: string
  color: string
  path?: SimulationWirePath
}

export type SimulationSceneSource = {
  kind: SimulationSourceKind
  label: string
  status: "draft" | "reviewed" | "verified" | "blocked"
  blocker?: string
}

export type SimulationScene = {
  schemaVersion: "simulation-scene/2"
  id: string
  title: string
  domain: "electronics"
  components: SimulationComponent[]
  wires: SimulationWire[]
  provenance: {
    source: SimulationSceneSource
    derivedFrom?: SimulationSceneSource[]
  }
  adapters: {
    source: SimulationSourceKind
    solver: Array<"local" | "fastapi" | "ngspice-wasm" | "external-adapter">
  }
}

export type SimulationSceneNormalized = {
  components: string[]
  wires: string[]
}

export type SimulationSceneReadiness = {
  ok: boolean
  blockers: string[]
}

export function normalizeSimulationScene(scene: SimulationScene): SimulationSceneNormalized {
  return {
    components: scene.components
      .map((component) => `${component.id}:${component.type}`)
      .sort((a, b) => a.localeCompare(b)),
    wires: scene.wires
      .map((wire) => `${wire.from}->${wire.to}`)
      .sort((a, b) => a.localeCompare(b)),
  }
}

export function sceneReadiness(scene: SimulationScene): SimulationSceneReadiness {
  const blockers: string[] = []
  const componentIds = new Set<string>()

  if (scene.components.length === 0) blockers.push("scene has no components")
  if (scene.provenance.source.status === "blocked") {
    blockers.push(scene.provenance.source.blocker ?? "source is blocked")
  }

  for (const component of scene.components) {
    if (componentIds.has(component.id)) blockers.push(`duplicate component id: ${component.id}`)
    componentIds.add(component.id)
    if (!Number.isFinite(component.pose.x) || !Number.isFinite(component.pose.y)) {
      blockers.push(`invalid pose: ${component.id}`)
    }
  }

  for (const wire of scene.wires) {
    const fromComponent = endpointComponentId(wire.from)
    const toComponent = endpointComponentId(wire.to)
    if (!componentIds.has(fromComponent)) blockers.push(`wire ${wire.id} missing source ${fromComponent}`)
    if (!componentIds.has(toComponent)) blockers.push(`wire ${wire.id} missing target ${toComponent}`)
  }

  return { ok: blockers.length === 0, blockers }
}

export function endpointComponentId(endpoint: string): string {
  const separator = endpoint.indexOf(":")
  return separator === -1 ? endpoint : endpoint.slice(0, separator)
}
