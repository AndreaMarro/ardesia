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

export const BoardWriteParamsSchema = z.strictObject({
  embedId: z.string().min(1),
  state: z.unknown(),
})
export const BoardWriteResultSchema = z.strictObject({})

// ---- storage.* v0 (tool → host): KV namespaced per-tool ----
const STORAGE_KEY_RE = /^[A-Za-z0-9][A-Za-z0-9._/-]{0,255}$/
const storageKey = z
  .string()
  .regex(STORAGE_KEY_RE)
  .refine((k) => k.split("/").every((s) => s !== "" && s !== ".."), { message: "unsafe key" })

export const StorageGetParamsSchema = z.strictObject({ key: storageKey })
export const StorageGetResultSchema = z.strictObject({ value: z.string().nullable() })
export const StorageSetParamsSchema = z.strictObject({ key: storageKey, value: z.string() })
export const StorageSetResultSchema = z.strictObject({})
export const StorageDeleteParamsSchema = z.strictObject({ key: storageKey })
export const StorageDeleteResultSchema = z.strictObject({})
export const StorageListParamsSchema = z.strictObject({ prefix: z.string().max(256).optional() })
export const StorageListResultSchema = z.strictObject({ keys: z.array(z.string()) })

// ---- Registro metodi tool→host: method → capability richiesta + schemi ----
// Deny-by-default: un metodo fuori da questo registro NON esiste. In v0 il wire
// copre SOLO board.* e storage.* (pin T1); llm/graph/net/ui restano capability
// dichiarabili a manifest ma senza metodi raggiungibili finché T2/T3 non li aggiunge.
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
}
