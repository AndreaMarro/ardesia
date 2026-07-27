import { z } from "zod"
import { CapabilitiesSchema } from "./capabilities.ts"
import type { CapabilityName } from "./capabilities.ts"

// TOOLHOST-SPEC-v0 §2: wire = JSON-RPC 2.0 su MessageChannel dedicato.
// Ogni request/response è validata Zod LATO HOST (mai fidarsi del tool).

export const RequestIdSchema = z.union([z.string().min(1), z.number().int()])
export type RequestId = z.infer<typeof RequestIdSchema>

export const JsonRpcRequestSchema = z.strictObject({
  jsonrpc: z.literal("2.0"),
  id: RequestIdSchema,
  method: z.string().min(1),
  params: z.unknown().optional(),
})
export type JsonRpcRequest = z.infer<typeof JsonRpcRequestSchema>

export const JsonRpcNotificationSchema = z.strictObject({
  jsonrpc: z.literal("2.0"),
  method: z.string().min(1),
  params: z.unknown().optional(),
})

export const JsonRpcErrorObjectSchema = z.strictObject({
  code: z.number().int(),
  message: z.string(),
  data: z.unknown().optional(),
})

export const JsonRpcResponseSchema = z.union([
  z.strictObject({ jsonrpc: z.literal("2.0"), id: RequestIdSchema, result: z.unknown() }),
  z.strictObject({ jsonrpc: z.literal("2.0"), id: RequestIdSchema.nullable(), error: JsonRpcErrorObjectSchema }),
])
export type JsonRpcResponse = z.infer<typeof JsonRpcResponseSchema>

// Codici errore: standard JSON-RPC + dominio ToolHost.
export const ERR = {
  PARSE: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL: -32603,
  CAPABILITY_DENIED: -32001,
  HANDSHAKE_FAILED: -32002,
} as const

// ---- Handshake (lifecycle init → ready) ----
// host → finestra tool: notifica `host.hello` con la MessagePort nei transferables.
// NESSUN token qui: il bearer viaggia SOLO sulla porta, dopo verifica del nonce
// (pin T1: "handshake MessagePort con nonce monouso, MAI token in URL").
export const HostHelloParamsSchema = z.strictObject({
  protocolVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
  grantedCaps: CapabilitiesSchema,
  nonce: z.string().min(16),
  theme: z.enum(["light", "dark"]),
  locale: z.string().min(2),
})
export type HostHelloParams = z.infer<typeof HostHelloParamsSchema>

export const HostHelloSchema = z.strictObject({
  jsonrpc: z.literal("2.0"),
  method: z.literal("host.hello"),
  params: HostHelloParamsSchema,
})
export type HostHello = z.infer<typeof HostHelloSchema>

// tool → host sulla porta: request `tool.ready` che ECO il nonce.
export const ToolReadyParamsSchema = z.strictObject({
  nonce: z.string().min(16),
  protocolVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
})
export type ToolReadyParams = z.infer<typeof ToolReadyParamsSchema>

// host → tool: result di tool.ready, UNICO punto in cui il bearer è consegnato.
export const ReadyAckSchema = z.strictObject({
  bearerToken: z.string().min(1),
  grantedCaps: CapabilitiesSchema,
})
export type ReadyAck = z.infer<typeof ReadyAckSchema>

// ---- Lifecycle suspend/restore (host → tool sulla porta) ----
export const SuspendParamsSchema = z.strictObject({})
export const SuspendResultSchema = z.strictObject({ state: z.unknown() })
export const RestoreParamsSchema = z.strictObject({ state: z.unknown() })
export const RestoreResultSchema = z.strictObject({})

// ---- board.* v0 (tool → host) ----
export const BoardReadParamsSchema = z.strictObject({
  target: z.enum(["scene", "selection"]),
})
export const BoardReadResultSchema = z.strictObject({
  elements: z.array(z.unknown()),
})

// State con tetto sul SERIALIZZATO: la scena è condivisa, un tool non deve
// poterla gonfiare oltre misura (256 KB per embed bastano per qualunque stato v0).
const boundedEmbedState = z.unknown().refine(
  (s) => {
    try {
      const json = JSON.stringify(s)
      return json === undefined || json.length <= 256 * 1024
    } catch {
      return false
    }
  },
  { message: "state too large or not serializable" },
)

export const BoardWriteParamsSchema = z.strictObject({
  embedId: z.string().min(1).max(128),
  state: boundedEmbedState,
})
export const BoardWriteResultSchema = z.strictObject({})

// ---- storage.* v0 (tool → host): KV namespaced per-tool ----
const STORAGE_KEY_RE = /^[A-Za-z0-9][A-Za-z0-9._/-]{0,255}$/

/** Grammatica UNICA delle chiavi storage: wire schema e capability la condividono. */
export function isValidStorageKey(key: string): boolean {
  // niente "." per evitare alias (a/./b vs a/b) con semantiche diverse tra driver
  return STORAGE_KEY_RE.test(key) && key.split("/").every((s) => s !== "" && s !== ".." && s !== ".")
}

const storageKey = z.string().refine(isValidStorageKey, { message: "unsafe key" })

export const StorageGetParamsSchema = z.strictObject({ key: storageKey })
export const StorageGetResultSchema = z.strictObject({ value: z.string().nullable() })
// tetto wire sul singolo valore (la quota totale resta quella del manifest)
export const StorageSetParamsSchema = z.strictObject({ key: storageKey, value: z.string().max(2 * 1024 * 1024) })
export const StorageSetResultSchema = z.strictObject({})
export const StorageDeleteParamsSchema = z.strictObject({ key: storageKey })
export const StorageDeleteResultSchema = z.strictObject({})
export const StorageListParamsSchema = z.strictObject({ prefix: z.string().max(256).optional() })
export const StorageListResultSchema = z.strictObject({ keys: z.array(z.string()) })

// ---- graph.query v0 (tool → host): vista READ-ONLY sul grafo LessonOS ----
// Il grafo NON è un secondo store: l'host lo deriva on-demand dall'event-log
// (materializer). Vocabolario kinds allineato a lessonos/materializer.ts —
// il wire lo ridichiara per non accoppiare il protocollo al modulo interno.
export const GRAPH_NODE_KINDS = ["lesson", "materiale", "errore", "esercizio", "concetto", "plugin"] as const
export const GRAPH_EDGE_KINDS = ["cita", "deriva-da", "corregge"] as const

const graphNodeKind = z.enum(GRAPH_NODE_KINDS)
const graphEdgeKind = z.enum(GRAPH_EDGE_KINDS)

export const GraphQueryParamsSchema = z
  .strictObject({
    select: z.enum(["summary", "nodes", "edges"]),
    kind: z.enum([...GRAPH_NODE_KINDS, ...GRAPH_EDGE_KINDS]).optional(),
    limit: z.number().int().min(1).max(500).optional(),
  })
  .superRefine((p, ctx) => {
    // cross-field: il filtro kind deve appartenere alla selezione richiesta
    if (p.kind === undefined) return
    if (p.select === "summary") {
      ctx.addIssue({ code: "custom", message: "kind non ammesso con select summary" })
    } else if (p.select === "nodes" && !graphNodeKind.safeParse(p.kind).success) {
      ctx.addIssue({ code: "custom", message: `kind "${p.kind}" non è un kind di nodo` })
    } else if (p.select === "edges" && !graphEdgeKind.safeParse(p.kind).success) {
      ctx.addIssue({ code: "custom", message: `kind "${p.kind}" non è un kind di arco` })
    }
  })
export type GraphQueryParams = z.infer<typeof GraphQueryParamsSchema>

export const GraphNodeWireSchema = z.strictObject({
  id: z.string().min(1),
  kind: graphNodeKind,
  labels: z.record(z.string(), z.string()),
  evidenceRefs: z.array(z.string()),
  introducedAt: z.number(),
  correctedAt: z.number().optional(),
})
export const GraphEdgeWireSchema = z.strictObject({
  from: z.string().min(1),
  to: z.string().min(1),
  kind: graphEdgeKind,
  introducedAt: z.number(),
  evidenceRefs: z.array(z.string()),
})
export const GraphQueryResultSchema = z.strictObject({
  /** Conteggio PRE-limit della selezione: il tool vede se la risposta è troncata. */
  total: z.number().int().nonnegative(),
  summary: z
    .strictObject({
      nodeCounts: z.record(z.string(), z.number().int().nonnegative()),
      edgeCounts: z.record(z.string(), z.number().int().nonnegative()),
      uncorrectedErrors: z.number().int().nonnegative(),
    })
    .optional(),
  nodes: z.array(GraphNodeWireSchema).optional(),
  edges: z.array(GraphEdgeWireSchema).optional(),
})
export type GraphQueryResult = z.infer<typeof GraphQueryResultSchema>

// ---- lesson.event.emit v0 (tool → host): append controllato nell'event-log LessonOS ----
// Non è una write API generica sul grafo: il grafo resta una vista derivata dal
// log. In questa slice il tool può registrare solo eventi già supportati dal
// log, sempre con evidenza obbligatoria. La lista resta chiusa: ogni nuovo
// evento didattico entra qui solo quando EventLogStore/materializer lo sanno
// validare o ignorare deterministicamente.
const evidenceRef = z.string().regex(/^[a-z][a-z0-9-]*:.+$/)
const lessonLabels = z.record(z.string(), z.string())
const lessonEventBase = z.strictObject({
  t: z.number().finite(),
  evidence: z.array(evidenceRef).min(1),
})

export const LessonStartedEventSchema = lessonEventBase.extend({
  kind: z.literal("lesson.started"),
  room: z.string().min(1),
})

export const LessonEndedEventSchema = lessonEventBase.extend({
  kind: z.literal("lesson.ended"),
  room: z.string().min(1),
})

export const LessonConceptIntroducedEventSchema = lessonEventBase.extend({
  kind: z.literal("concept.introduced"),
  conceptId: z.string().min(1),
  labels: lessonLabels,
})

export const LessonMaterialCitedEventSchema = lessonEventBase.extend({
  kind: z.literal("material.cited"),
  materialId: z.string().min(1),
  conceptId: z.string().min(1).optional(),
  labels: lessonLabels,
})

export const LessonErrorObservedEventSchema = lessonEventBase.extend({
  kind: z.literal("error.observed"),
  errorId: z.string().min(1),
  conceptId: z.string().min(1),
  studentId: z.string().min(1).optional(),
  labels: lessonLabels,
})

export const LessonExerciseCompletedEventSchema = lessonEventBase.extend({
  kind: z.literal("exercise.completed"),
  exerciseId: z.string().min(1),
  conceptId: z.string().min(1).optional(),
  correctsErrorId: z.string().min(1).optional(),
  studentId: z.string().min(1).optional(),
  labels: lessonLabels,
})

export const LessonSimulationStepCompletedEventSchema = lessonEventBase.extend({
  kind: z.literal("simulation.step.completed"),
  stepId: z.string().min(1),
  sceneId: z.string().min(1).optional(),
  experimentId: z.string().min(1).optional(),
  conceptId: z.string().min(1).optional(),
  labels: lessonLabels,
})

export const LessonSimulationCircuitSolvedEventSchema = lessonEventBase.extend({
  kind: z.literal("simulation.circuit.solved"),
  experimentId: z.string().min(1),
  sceneId: z.string().min(1).optional(),
  conceptId: z.string().min(1).optional(),
  currentMa: z.number().finite().optional(),
  bookLayoutValid: z.boolean().optional(),
  labels: lessonLabels,
})

export const LessonSimulationErrorObservedEventSchema = lessonEventBase.extend({
  kind: z.literal("simulation.error.observed"),
  errorId: z.string().min(1),
  conceptId: z.string().min(1),
  sceneId: z.string().min(1).optional(),
  experimentId: z.string().min(1).optional(),
  studentId: z.string().min(1).optional(),
  labels: lessonLabels,
})

export const LessonPluginMountedEventSchema = lessonEventBase.extend({
  kind: z.literal("plugin.mounted"),
  pluginId: z.string().min(1),
  pluginKind: z.string().min(1),
  instanceId: z.string().min(1),
  room: z.string().min(1).optional(),
  labels: lessonLabels,
})

export const LessonEventEmitParamsSchema = z.strictObject({
  event: z.discriminatedUnion("kind", [
    LessonStartedEventSchema,
    LessonEndedEventSchema,
    LessonConceptIntroducedEventSchema,
    LessonMaterialCitedEventSchema,
    LessonErrorObservedEventSchema,
    LessonExerciseCompletedEventSchema,
    LessonSimulationStepCompletedEventSchema,
    LessonSimulationCircuitSolvedEventSchema,
    LessonSimulationErrorObservedEventSchema,
    LessonPluginMountedEventSchema,
  ]),
})
export const LessonEventEmitResultSchema = z.strictObject({
  seq: z.number().int().positive(),
})
export type LessonEventEmitParams = z.infer<typeof LessonEventEmitParamsSchema>

// ---- service.simulation: uso host-mediato del Simulation Plugin (P0-E) ----
// Il tool NON importa `simulation-runtime/1`: lo CHIEDE all'host. Metodi espliciti
// e schema stretto per ciascuno — un broker generico `service.call(payload opaco)`
// distruggerebbe la proprietà più forte di questo protocollo (ogni params validato
// lato host). L'identità di ISTANZA non compare in nessun params: la possiede
// l'host (ToolHostDeps.instanceId), come per storage e board. Da SDK 1.4 la sola
// mutazione ammessa sul wire è connect-wire: non è un patch endpoint generico e
// attraversa la pipeline canonica placement → provider → diagnostica.

const SimulationSceneSchema = z.strictObject({
  components: z
    .array(
      z.strictObject({
        id: z.string().min(1),
        type: z.string().min(1),
        label: z.string().optional(),
        value: z.number().optional(),
      }),
    )
    .max(500),
  connections: z
    .array(
      z.strictObject({
        id: z.string().min(1).optional(),
        from: z.string().min(1),
        to: z.string().min(1),
      }),
    )
    .max(2000),
  pinAssignments: z.record(z.string(), z.string()).optional(),
})
export type SimulationScene = z.infer<typeof SimulationSceneSchema>

/** Ricevuta di ogni chiamata: lega la risposta a istanza, contratto e topologia. */
export const SimulationReceiptSchema = z.strictObject({
  apiVersion: z.literal("simulation-runtime/1"),
  pluginId: z.literal("io.ardesia.simulation"),
  instanceId: z.string().min(1),
  sceneDigest: z.string().min(1),
})
export type SimulationReceipt = z.infer<typeof SimulationReceiptSchema>

export const SimulationDescribeParamsSchema = z.strictObject({})
export const SimulationDescribeResultSchema = z.looseObject({
  pluginId: z.literal("io.ardesia.simulation"),
  apiVersion: z.literal("simulation-runtime/1"),
  stateSchema: z.string().min(1),
})

export const SimulationLoadSceneParamsSchema = z.strictObject({
  scene: SimulationSceneSchema,
  diagnostics: z.array(z.string()).max(200).optional(),
})
export const SimulationLoadSceneResultSchema = z.strictObject({
  receipt: SimulationReceiptSchema,
})

export const SimulationSolveParamsSchema = z.strictObject({
  provider: z.enum(["local", "fastapi", "ngspice-wasm"]),
  mode: z.enum(["static", "run"]),
})
export const SimulationSolveResultSchema = z.strictObject({
  receipt: SimulationReceiptSchema,
  result: z.unknown(),
})

const SimulationConnectWireEnvelopeSchema = z.strictObject({
  schema: z.literal("simulation-operation/1"),
  id: z.string().min(1).max(256),
  actor: z.literal("manual"),
  origin: z.literal("canvas"),
  targetProvider: z.literal("local"),
  providerMode: z.literal("static"),
  operation: z.strictObject({
    kind: z.literal("connect-wire"),
    wire: z.strictObject({
      id: z.string().min(1).max(256),
      from: z.string().min(1).max(256),
      to: z.string().min(1).max(256),
      color: z.string().min(1).max(64),
    }),
  }),
})

export const SimulationApplyOperationParamsSchema = z.strictObject({
  expectedSceneDigest: z.string().min(1).max(128),
  operation: SimulationConnectWireEnvelopeSchema,
})
export type SimulationApplyOperationParams = z.infer<
  typeof SimulationApplyOperationParamsSchema
>

export const SimulationApplyOperationResultSchema = z.strictObject({
  receipt: SimulationReceiptSchema,
  roomId: z.string().min(1).max(128),
  operationId: z.string().min(1).max(256),
  accepted: z.literal(true),
  solveOutcome: z.unknown(),
  diagnostics: z.unknown(),
})
export type SimulationApplyOperationResult = z.infer<
  typeof SimulationApplyOperationResultSchema
>

export const SimulationReadDiagnosticsParamsSchema = z.strictObject({})
export const SimulationReadDiagnosticsResultSchema = z.strictObject({
  receipt: SimulationReceiptSchema,
  diagnostics: z.unknown(),
})

export const SimulationSerializeStateParamsSchema = z.strictObject({})
export const SimulationSerializeStateResultSchema = z.strictObject({
  receipt: SimulationReceiptSchema,
  state: z.unknown(),
})

// ---- Registro metodi tool→host: method → capability richiesta + schemi ----
// Deny-by-default: un metodo fuori da questo registro NON esiste. In v1.2 il wire
// copre board.*, storage.* (pin T1), graph.query read-only (P0-D) e
// lesson.event.emit append-only controllato; da P0-E anche simulation.* sotto la
// capability service.simulation. llm/net/ui e graph.proposeClaims restano
// capability dichiarabili a manifest ma senza metodi raggiungibili finché
// T2/T3 non li aggiunge.
export interface MethodSpec {
  cap: CapabilityName
  params: z.ZodType
  result: z.ZodType
}

export const TOOL_METHODS: Record<string, MethodSpec> = {
  "board.read": { cap: "board.read", params: BoardReadParamsSchema, result: BoardReadResultSchema },
  "board.write": { cap: "board.write", params: BoardWriteParamsSchema, result: BoardWriteResultSchema },
  "storage.get": { cap: "storage", params: StorageGetParamsSchema, result: StorageGetResultSchema },
  "storage.set": { cap: "storage", params: StorageSetParamsSchema, result: StorageSetResultSchema },
  "storage.delete": { cap: "storage", params: StorageDeleteParamsSchema, result: StorageDeleteResultSchema },
  "storage.list": { cap: "storage", params: StorageListParamsSchema, result: StorageListResultSchema },
  "graph.query": { cap: "graph.query", params: GraphQueryParamsSchema, result: GraphQueryResultSchema },
  "lesson.event.emit": {
    cap: "lesson.event.emit",
    params: LessonEventEmitParamsSchema,
    result: LessonEventEmitResultSchema,
  },
  "simulation.describe": {
    cap: "service.simulation",
    params: SimulationDescribeParamsSchema,
    result: SimulationDescribeResultSchema,
  },
  "simulation.loadScene": {
    cap: "service.simulation",
    params: SimulationLoadSceneParamsSchema,
    result: SimulationLoadSceneResultSchema,
  },
  "simulation.applyOperation": {
    cap: "service.simulation",
    params: SimulationApplyOperationParamsSchema,
    result: SimulationApplyOperationResultSchema,
  },
  "simulation.solve": {
    cap: "service.simulation",
    params: SimulationSolveParamsSchema,
    result: SimulationSolveResultSchema,
  },
  "simulation.readDiagnostics": {
    cap: "service.simulation",
    params: SimulationReadDiagnosticsParamsSchema,
    result: SimulationReadDiagnosticsResultSchema,
  },
  "simulation.serializeState": {
    cap: "service.simulation",
    params: SimulationSerializeStateParamsSchema,
    result: SimulationSerializeStateResultSchema,
  },
}
