export type MontaggioPlacementType = "resistor" | "led" | "wire"

export type MontaggioPlacement = {
  id: string
  type: MontaggioPlacementType
  holes: [string, string]
}

export type MontaggioSceneLike = {
  components: Array<{ id: string; type: string }>
  connections: Array<{ id?: string; from: string; to: string }>
  pinAssignments?: Record<string, string>
}

type FreeComponent =
  | {
      id: string
      type: "resistor"
      label: string
      value: number
      anchor: string
    }
  | {
      id: string
      type: "led"
      label: string
      color: string
      anchor: string
    }

type FreeWire = {
  id: string
  from: string
  to: string
  color: string
  kind: "wire"
}

type ProjectedMontaggioScene<
  S,
  C extends { id: string; type: string },
  W extends { from: string; to: string },
> = Omit<S, "components" | "connections" | "pinAssignments"> & {
  components: Array<C | FreeComponent>
  connections: Array<W | FreeWire>
  pinAssignments: Record<string, string>
}

export function requireMontaggioScene(value: unknown): MontaggioSceneLike {
  if (!isRecord(value) || !Array.isArray(value.components) || !Array.isArray(value.connections)) {
    throw new Error("montaggio scene must contain component and connection arrays")
  }
  const sceneIds = new Set<string>()
  for (const valueComponent of value.components) {
    if (
      !isRecord(valueComponent) ||
      !nonEmpty(valueComponent.id) ||
      !nonEmpty(valueComponent.type)
    ) {
      throw new Error("montaggio scene contains a malformed component")
    }
    if (sceneIds.has(valueComponent.id)) {
      throw new Error(`montaggio scene duplicate id "${valueComponent.id}"`)
    }
    sceneIds.add(valueComponent.id)
  }
  for (const valueConnection of value.connections) {
    if (
      !isRecord(valueConnection) ||
      !nonEmpty(valueConnection.from) ||
      !nonEmpty(valueConnection.to)
    ) {
      throw new Error("montaggio scene contains a malformed connection")
    }
    if (valueConnection.id !== undefined) {
      if (!nonEmpty(valueConnection.id)) {
        throw new Error("montaggio scene contains a malformed connection id")
      }
      if (sceneIds.has(valueConnection.id)) {
        throw new Error(`montaggio scene duplicate id "${valueConnection.id}"`)
      }
      sceneIds.add(valueConnection.id)
    }
  }
  if (
    value.pinAssignments !== undefined &&
    (!isRecord(value.pinAssignments) ||
      Object.values(value.pinAssignments).some((assignment) => !nonEmpty(assignment)))
  ) {
    throw new Error("montaggio scene contains malformed pin assignments")
  }
  return value as MontaggioSceneLike
}

export function parseMontaggioPlacements(value: unknown): MontaggioPlacement[] {
  if (!Array.isArray(value)) {
    throw new Error("montaggio placements must be an array")
  }
  const ids = new Set<string>()
  return value.map((candidate) => {
    if (!isRecord(candidate) || !nonEmpty(candidate.id)) {
      throw new Error("montaggio placement id must be a non-empty string")
    }
    if (
      candidate.type !== "resistor" &&
      candidate.type !== "led" &&
      candidate.type !== "wire"
    ) {
      throw new Error(`montaggio placement "${candidate.id}" has unsupported type`)
    }
    if (
      !Array.isArray(candidate.holes) ||
      candidate.holes.length !== 2 ||
      !nonEmpty(candidate.holes[0]) ||
      !nonEmpty(candidate.holes[1]) ||
      candidate.holes[0] === candidate.holes[1]
    ) {
      throw new Error(`montaggio placement "${candidate.id}" has invalid holes`)
    }
    if (ids.has(candidate.id)) {
      throw new Error(`montaggio duplicate placement id "${candidate.id}"`)
    }
    ids.add(candidate.id)
    return {
      id: candidate.id,
      type: candidate.type,
      holes: [candidate.holes[0], candidate.holes[1]],
    }
  })
}

export function nextMontaggioPlacementId(
  type: MontaggioPlacementType,
  placements: readonly MontaggioPlacement[],
  reservedIds: readonly string[] = [],
): string {
  const prefix =
    type === "resistor" ? "r-libero-" : type === "wire" ? "cavo-libero-" : "led-libero-"
  const used = new Set([...reservedIds, ...placements.map((placement) => placement.id)])
  let ordinal = 0
  for (const id of used) {
    if (!id.startsWith(prefix)) continue
    const rawSuffix = id.slice(prefix.length)
    if (!/^\d+$/.test(rawSuffix)) continue
    const suffix = Number(rawSuffix)
    if (!Number.isSafeInteger(suffix)) {
      throw new Error(`montaggio ${type} id space exhausted`)
    }
    if (suffix > ordinal) ordinal = suffix
  }
  if (ordinal === Number.MAX_SAFE_INTEGER) {
    throw new Error(`montaggio ${type} id space exhausted`)
  }
  return `${prefix}${ordinal + 1}`
}

export function projectMontaggioPlacements<
  C extends { id: string; type: string },
  W extends { from: string; to: string },
  S extends {
    components: Array<C>
    connections: Array<W>
    pinAssignments?: Record<string, string>
  },
>(
  scene: S,
  rawPlacements: unknown,
  options: { rejectOccupiedHoles?: boolean } = {},
): ProjectedMontaggioScene<S, C, W> {
  const validatedScene = requireMontaggioScene(scene)
  const placements = parseMontaggioPlacements(rawPlacements)
  if (placements.length === 0) {
    const cloned = structuredClone(scene)
    return {
      ...cloned,
      pinAssignments: { ...(cloned.pinAssignments ?? {}) },
    }
  }
  const cloned = structuredClone(scene)
  const components: Array<C | FreeComponent> = [...cloned.components]
  const connections: Array<W | FreeWire> = [...cloned.connections]
  const pinAssignments = { ...(cloned.pinAssignments ?? {}) }
  const occupiedHoles = new Set(Object.values(pinAssignments))
  const reservedIds = new Set([
    ...validatedScene.components.map((component) => component.id),
    ...validatedScene.connections.flatMap((connection) =>
      connection.id === undefined ? [] : [connection.id]),
  ])

  for (const placement of placements) {
    if (reservedIds.has(placement.id)) {
      throw new Error(`montaggio placement id "${placement.id}" collides with base scene`)
    }
    reservedIds.add(placement.id)
    const [from, to] = placement.holes
    if (
      options.rejectOccupiedHoles !== false &&
      (occupiedHoles.has(from) || occupiedHoles.has(to))
    ) {
      throw new Error(`montaggio placement "${placement.id}" holes already occupied`)
    }
    occupiedHoles.add(from)
    occupiedHoles.add(to)
    if (placement.type === "wire") {
      connections.push({ id: placement.id, from, to, color: "green", kind: "wire" })
      continue
    }
    const pinKeys =
      placement.type === "resistor"
        ? [`${placement.id}:pin1`, `${placement.id}:pin2`]
        : [`${placement.id}:anode`, `${placement.id}:cathode`]
    if (pinKeys.some((key) => Object.hasOwn(pinAssignments, key))) {
      throw new Error(`montaggio placement "${placement.id}" collides with pin assignments`)
    }
    if (placement.type === "resistor") {
      components.push({
        id: placement.id,
        type: "resistor",
        label: "Resistore montaggio libero",
        value: 470,
        anchor: "bb1",
      })
    } else {
      components.push({
        id: placement.id,
        type: "led",
        label: "LED montaggio libero",
        color: "red",
        anchor: "bb1",
      })
    }
    pinAssignments[pinKeys[0]!] = from
    pinAssignments[pinKeys[1]!] = to
  }

  return { ...cloned, components, connections, pinAssignments }
}

export function jsonPlainEqual(left: unknown, right: unknown): boolean {
  return canonicalJson(left, new WeakSet()) === canonicalJson(right, new WeakSet())
}

function canonicalJson(value: unknown, seen: WeakSet<object>): string {
  if (value === null) return "null"
  if (typeof value === "string") return JSON.stringify(value)
  if (typeof value === "boolean") return value ? "true" : "false"
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("rich scene must contain finite numbers")
    return Object.is(value, -0) ? "0" : String(value)
  }
  if (typeof value !== "object") {
    throw new Error("rich scene must contain JSON-plain values")
  }
  if (seen.has(value)) throw new Error("rich scene must not contain cycles")
  seen.add(value)
  try {
    if (Array.isArray(value)) {
      return `[${value.map((entry) => canonicalJson(entry, seen)).join(",")}]`
    }
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) {
      throw new Error("rich scene must contain plain objects")
    }
    const record = value as Record<string, unknown>
    const keys = Object.keys(record).sort()
    return `{${keys
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key], seen)}`)
      .join(",")}}`
  } finally {
    seen.delete(value)
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.length > 0
}
