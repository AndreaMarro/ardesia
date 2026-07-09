import type {
  SimulationComponent,
  SimulationPoint,
  SimulationScene,
  SimulationWire,
} from "./simulationScene"
import {
  createBreadboardModel,
  pointForSimulationSnapRef,
} from "./simulationScene"

type WokwiPart = {
  id: string
  type: string
  left?: number
  top?: number
  rotate?: number
  attrs?: Record<string, string | number | boolean>
}

type WokwiConnection = [string, string, string, string[]?]

type WokwiDiagram = {
  version: 1
  author?: string
  editor?: string
  parts: WokwiPart[]
  connections: WokwiConnection[]
}

type AdapterMeta = {
  id: string
  title: string
}

export function wokwiDiagramToSimulationScene(input: unknown, meta: AdapterMeta): SimulationScene {
  const diagram = parseWokwiDiagram(input)
  return {
    schemaVersion: "simulation-scene/2",
    id: meta.id,
    title: meta.title,
    domain: "electronics",
    components: diagram.parts.map(partToComponent),
    wires: diagram.connections.map((connection, index) =>
      connectionToWire(connection, index + 1, diagram.parts),
    ),
    provenance: {
      source: {
        kind: "wokwi-diagram-json",
        label: diagram.author ?? "diagram.json",
        status: "draft",
      },
    },
    adapters: {
      source: "wokwi-diagram-json",
      solver: ["local", "fastapi", "ngspice-wasm"],
    },
  }
}

function parseWokwiDiagram(input: unknown): WokwiDiagram {
  if (!isRecord(input)) throw new Error("diagram must be an object")
  if (input.version !== 1) throw new Error("diagram.version must be 1")
  if (!Array.isArray(input.parts)) throw new Error("diagram.parts must be an array")
  if (!Array.isArray(input.connections)) throw new Error("diagram.connections must be an array")

  const parts = input.parts.map((part) => {
    if (!isRecord(part)) throw new Error("part must be an object")
    if (typeof part.id !== "string" || typeof part.type !== "string") {
      throw new Error("part id and type are required")
    }
    return {
      id: part.id,
      type: part.type,
      left: numberOrUndefined(part.left),
      top: numberOrUndefined(part.top),
      rotate: numberOrUndefined(part.rotate),
      attrs: attrsOrUndefined(part.attrs),
    }
  })

  const connections = input.connections.map((connection) => {
    if (!Array.isArray(connection) || connection.length < 3) {
      throw new Error("connection must be [from, to, color, path?]")
    }
    const [from, to, color, instructions] = connection
    if (typeof from !== "string" || typeof to !== "string" || typeof color !== "string") {
      throw new Error("connection endpoints and color must be strings")
    }
    if (instructions !== undefined && !isStringArray(instructions)) {
      throw new Error("connection path instructions must be strings")
    }
    return [from, to, color, instructions] satisfies WokwiConnection
  })

  return {
    version: 1,
    author: typeof input.author === "string" ? input.author : undefined,
    editor: typeof input.editor === "string" ? input.editor : undefined,
    parts,
    connections,
  }
}

function partToComponent(part: WokwiPart): SimulationComponent {
  return {
    id: part.id,
    type: part.type,
    label: labelForPartType(part.type),
    pose: {
      x: part.left ?? 0,
      y: part.top ?? 0,
      rotation: part.rotate,
    },
    attrs: part.attrs,
  }
}

function connectionToWire(
  connection: WokwiConnection,
  ordinal: number,
  parts: WokwiPart[],
): SimulationWire {
  const [from, to, color, instructions = []] = connection
  const source = partAnchor(from, parts)
  const target = partAnchor(to, parts)
  return {
    id: `wire-${ordinal}`,
    from,
    to,
    color: color === "" ? "#6b7280" : color,
    path: {
      kind: "orthogonal",
      points: orthogonalPath(source, target, instructions),
      sourceInstructions: instructions,
    },
  }
}

function orthogonalPath(
  source: SimulationPoint,
  target: SimulationPoint,
  instructions: string[],
): SimulationPoint[] {
  const points: SimulationPoint[] = [{ ...source }]
  let cursor = { ...source }
  for (const instruction of instructions) {
    if (instruction === "*") break
    const axis = instruction.slice(0, 1)
    const amount = Number(instruction.slice(1))
    if (!Number.isFinite(amount)) continue
    if (axis === "h") cursor = { x: cursor.x + amount, y: cursor.y }
    if (axis === "v") cursor = { x: cursor.x, y: cursor.y + amount }
    points.push({ ...cursor })
  }
  points.push({ x: cursor.x, y: target.y })
  points.push({ ...target })
  return points
}

function partAnchor(endpoint: string, parts: WokwiPart[]): SimulationPoint {
  const partId = endpoint.split(":")[0] ?? endpoint
  const part = parts.find((candidate) => candidate.id === partId)
  if (part === undefined) return { x: 0, y: 0 }
  const breadboardAnchor = anchorForBreadboardEndpoint(endpoint, part)
  if (breadboardAnchor !== null) return breadboardAnchor
  return anchorForComponentEndpoint(endpoint, part)
}

function anchorForBreadboardEndpoint(endpoint: string, part: WokwiPart): SimulationPoint | null {
  if (!part.type.includes("breadboard")) return null
  const scene: SimulationScene = {
    schemaVersion: "simulation-scene/2",
    id: `${part.id}-anchor`,
    title: part.id,
    domain: "electronics",
    breadboards: [createBreadboardModel(part.id)],
    components: [partToComponent(part)],
    wires: [],
    provenance: {
      source: {
        kind: "wokwi-diagram-json",
        label: "endpoint anchor",
        status: "draft",
      },
    },
    adapters: { source: "wokwi-diagram-json", solver: ["local"] },
  }
  const point = pointForSimulationSnapRef(endpoint, scene)
  if (point === null) return null
  return { x: (part.left ?? 0) + point.x, y: (part.top ?? 0) + point.y }
}

function anchorForComponentEndpoint(endpoint: string, part: WokwiPart): SimulationPoint {
  const pin = endpoint.slice(endpoint.indexOf(":") + 1)
  const x = part.left ?? 0
  const y = part.top ?? 0
  if (part.type.includes("resistor")) {
    return pin === "2" ? { x: x + 84, y } : { x: x - 84, y }
  }
  if (part.type.includes("led")) {
    if (pin === "C" || pin.toLowerCase() === "cathode") return { x: x + 34, y: y + 44 }
    return { x: x - 34, y: y + 44 }
  }
  if (part.type.includes("arduino")) {
    if (pin.startsWith("GND")) return { x: x + 124, y: y + 28 }
    if (pin === "13") return { x: x + 124, y: y + 2 }
  }
  return { x: x + 28, y: y + 28 }
}

function labelForPartType(type: string): string {
  return type
    .replace(/^wokwi-/, "")
    .replace(/^board-/, "")
    .replace(/-/g, " ")
}

function numberOrUndefined(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined
}

function attrsOrUndefined(value: unknown): Record<string, string | number | boolean> | undefined {
  if (!isRecord(value)) return undefined
  const attrs: Record<string, string | number | boolean> = {}
  for (const [key, attr] of Object.entries(value)) {
    if (typeof attr === "string" || typeof attr === "number" || typeof attr === "boolean") {
      attrs[key] = attr
    }
  }
  return attrs
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string")
}
