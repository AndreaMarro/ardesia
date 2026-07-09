import { z } from "zod"

// ElabScene = CircuitScene v1 + persisted physical geometry (ELAB-SCENE-FORGE-CANON §2).
// schemaVersion bump to circuit-scene/2 is driven by the one breaking change:
// connections[] -> wires[] (so each wire can carry an authored path). Everything
// else is additive. Geometry (component.pose, wire.path) is OPTIONAL on purpose:
// legacy/backfilled scenes must validate honestly with empty geometry, and the
// gap stays measurable via sceneGeometryStatus instead of being faked.

const poseSchema = z.strictObject({
  x: z.number(),
  y: z.number(),
  rotationDeg: z.number(),
  scale: z.number().positive(),
})

const checkResultSchema = z.enum(["pass", "fail", "unknown"])

const provenanceSchema = z.strictObject({
  status: z.enum(["candidate", "reviewed", "verified", "rejected", "deprecated"]),
  origin: z.enum(["hand-authored", "agent-authored", "imported", "generated"]),
  // Audit trail from CircuitScene v1 (canon §2): v2 must stay a superset.
  sourceRef: z.string().min(1).optional(),
  verifiedBy: z.string().min(1).optional(),
  verifiedAt: z.string().min(1).optional(),
  checks: z.strictObject({
    electrical: checkResultSchema,
    geometry: checkResultSchema,
    bookMatch: checkResultSchema,
    visualMatch: checkResultSchema,
  }),
})

const bookSchema = z.strictObject({
  volume: z.number().int().positive(),
  chapter: z.number().int().positive().optional(),
  exp: z.string().min(1).optional(),
  pages: z.array(z.number().int().positive()).min(1),
})

const sourceSchema = z.strictObject({
  cropBBox: z
    .tuple([z.number(), z.number(), z.number(), z.number()])
    .refine(([, , width, height]) => width > 0 && height > 0, {
      message: "cropBBox width and height must be positive",
    })
    .optional(),
  sourceImageHash: z
    .string()
    .regex(/^[0-9a-f]{64}$/, "sourceImageHash must be lowercase sha256 hex")
    .optional(),
})

const boardSchema = z.strictObject({
  pose: poseSchema,
  grid: z.strictObject({
    columns: z.number().int().positive(),
    columnPitch: z.number().positive(),
  }),
  orientation: z.enum(["elab-volume", "manual-figure-horizontal", "manual-figure-vertical"]),
})

const componentSchema = z.strictObject({
  id: z.string().min(1),
  type: z.string().min(1),
  value: z.union([z.string(), z.number()]).optional(),
  color: z.string().min(1).optional(),
  pose: poseSchema.optional(),
})

const wirePathSchema = z.strictObject({
  kind: z.enum(["polyline", "bezier"]),
  points: z.array(z.strictObject({ x: z.number(), y: z.number() })).min(2),
  bendRadius: z.number().positive().optional(),
})

const wireSchema = z.strictObject({
  id: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  color: z.string().min(1),
  path: wirePathSchema.optional(),
})

const visualFidelitySchema = z.strictObject({
  componentPoseErrorPx: z.number().min(0).optional(),
  wireEndpointErrorPx: z.number().min(0).optional(),
  visualOverlayScore: z.number().min(0).max(1).optional(),
})

function findDuplicateId(items: ReadonlyArray<{ id: string }>): string | null {
  const seen = new Set<string>()
  for (const item of items) {
    if (seen.has(item.id)) return item.id
    seen.add(item.id)
  }
  return null
}

export const elabSceneSchema = z
  .strictObject({
    schemaVersion: z.literal("circuit-scene/2"),
    experimentId: z.string().min(1),
    provenance: provenanceSchema,
    book: bookSchema,
    source: sourceSchema,
    board: boardSchema,
    components: z.array(componentSchema),
    wires: z.array(wireSchema),
    pinAssignments: z.record(z.string().min(1), z.string().min(1)),
    netlist: z.unknown().optional(),
    visualFidelity: visualFidelitySchema.optional(),
  })
  .superRefine((scene, ctx) => {
    const duplicateComponent = findDuplicateId(scene.components)
    if (duplicateComponent !== null) {
      ctx.addIssue({
        code: "custom",
        path: ["components"],
        message: `duplicate component id: ${duplicateComponent}`,
      })
    }
    const duplicateWire = findDuplicateId(scene.wires)
    if (duplicateWire !== null) {
      ctx.addIssue({
        code: "custom",
        path: ["wires"],
        message: `duplicate wire id: ${duplicateWire}`,
      })
    }
    // Ids must be unique ACROSS components and wires: downstream maps key by id
    // without knowing which array an id came from.
    const componentIds = new Set(scene.components.map((component) => component.id))
    const crossCollision = scene.wires.find((wire) => componentIds.has(wire.id))
    if (crossCollision !== undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["wires"],
        message: `wire id collides with a component id: ${crossCollision.id}`,
      })
    }
  })

export type ElabScene = z.infer<typeof elabSceneSchema>

export type ElabSceneFieldError = { path: string; message: string }

export type ElabSceneValidation =
  | { ok: true; scene: ElabScene }
  | { ok: false; errors: ElabSceneFieldError[] }

export function validateElabScene(input: unknown): ElabSceneValidation {
  const result = elabSceneSchema.safeParse(input)
  if (result.success) return { ok: true, scene: result.data }
  return {
    ok: false,
    errors: result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  }
}

// Solo scene `verified` con TUTTI e 4 i validator pass guidano lezioni reali
// (ELAB-SCENE-FORGE-CANON §3: i 4 validator sono il gate, non il solo status).
// candidate/reviewed servono solo in authoring/review; la vision emette sempre candidate.
export function canDriveLesson(scene: ElabScene): boolean {
  if (scene.provenance.status !== "verified") return false
  const { electrical, geometry, bookMatch, visualMatch } = scene.provenance.checks
  return [electrical, geometry, bookMatch, visualMatch].every((check) => check === "pass")
}

export type SceneGeometryStatus = {
  componentsTotal: number
  componentsWithPose: number
  wiresTotal: number
  wiresWithAuthoredPath: number
}

// Rende misurabile il gap "abbiamo netlist, non geometria px-verificata" invece
// di nasconderlo: il backfill legacy valida con geometria vuota e questo contatore dice quanta manca.
export function sceneGeometryStatus(scene: ElabScene): SceneGeometryStatus {
  return {
    componentsTotal: scene.components.length,
    componentsWithPose: scene.components.filter((component) => component.pose !== undefined).length,
    wiresTotal: scene.wires.length,
    wiresWithAuthoredPath: scene.wires.filter((wire) => wire.path !== undefined).length,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

// ELAB grid constants come persisted in the scene (canon §2: "persisti le costanti
// breadboardSnap nella scena"). Values mirror breadboardGeometry in
// sim/breadboard/simulationBreadboard.ts (30 columns, pitch 7.5).
const ELAB_DEFAULT_BOARD: ElabScene["board"] = {
  pose: { x: 0, y: 0, rotationDeg: 0, scale: 1 },
  grid: { columns: 30, columnPitch: 7.5 },
  orientation: "elab-volume",
}

// Read-shim for CircuitScene v1 (the 88-experiment lineage): connections[] -> wires[]
// with deterministic ids and NO invented geometry. v1 book carries a single `page`
// (plus ref/photo, dropped here); v2 wants pages[]. Output is re-validated, so the
// shim can never emit an invalid scene.
export function fromCircuitSceneV1(input: unknown): ElabScene {
  if (!isRecord(input)) throw new Error("CircuitScene v1 must be an object")

  const connections = input.connections
  if (!Array.isArray(connections)) {
    throw new Error("CircuitScene v1 is missing connections[]")
  }

  const provenance = isRecord(input.provenance) ? input.provenance : {}
  const checks = isRecord(provenance.checks) ? provenance.checks : {}

  const book = isRecord(input.book) ? input.book : {}
  const pages = Array.isArray(book.pages)
    ? book.pages
    : typeof book.page === "number"
      ? [book.page]
      : []

  const candidate = {
    schemaVersion: "circuit-scene/2" as const,
    experimentId: input.experimentId,
    provenance: {
      status: provenance.status,
      origin: provenance.origin,
      ...(provenance.sourceRef !== undefined ? { sourceRef: provenance.sourceRef } : {}),
      ...(provenance.verifiedBy !== undefined ? { verifiedBy: provenance.verifiedBy } : {}),
      ...(provenance.verifiedAt !== undefined ? { verifiedAt: provenance.verifiedAt } : {}),
      checks: {
        electrical: checks.electrical ?? "unknown",
        geometry: checks.geometry ?? "unknown",
        bookMatch: checks.bookMatch ?? "unknown",
        visualMatch: "unknown" as const,
      },
    },
    book: {
      volume: book.volume,
      ...(book.chapter !== undefined ? { chapter: book.chapter } : {}),
      ...(book.exp !== undefined ? { exp: book.exp } : {}),
      pages,
    },
    source: {},
    board: ELAB_DEFAULT_BOARD,
    components: input.components,
    wires: connections.map((connection, index) => {
      if (!isRecord(connection)) {
        throw new Error(`CircuitScene v1 connections[${index}] must be an object`)
      }
      // Stessa regola dei waypoints per OGNI chiave sconosciuta: rifiutare batte
      // droppare in silenzio. In particolare un `id` legacy verrebbe ri-chiavato
      // in `w<n>` spezzando eventuali riferimenti esterni senza traccia.
      for (const key of Object.keys(connection)) {
        if (key !== "from" && key !== "to" && key !== "color" && key !== "waypoints") {
          throw new Error(`CircuitScene v1 connections[${index}] carries unknown key ${key}`)
        }
      }
      // Authored waypoints are the moat geometry: refusing beats silently dropping
      // them. Mapping waypoints -> wire.path needs the v1 seam semantics verified
      // firsthand (WireRenderer waypoint format) before it can be written honestly.
      if (connection.waypoints !== undefined) {
        throw new Error(
          `CircuitScene v1 connections[${index}] carries waypoints — migration to wire.path is not implemented yet`,
        )
      }
      return {
        id: `w${index + 1}`,
        from: connection.from,
        to: connection.to,
        color: connection.color,
      }
    }),
    pinAssignments: input.pinAssignments,
    ...(input.netlist !== undefined ? { netlist: input.netlist } : {}),
  }

  const result = validateElabScene(candidate)
  if (!result.ok) {
    const detail = result.errors
      .map((error) => `${error.path}: ${error.message}`)
      .join("; ")
    throw new Error(`CircuitScene v1 shim produced an invalid scene — ${detail}`)
  }
  return result.scene
}
