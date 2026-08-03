import {
  ERR,
  JsonRpcRequestSchema,
  JsonRpcNotificationSchema,
  TOOL_METHODS,
  RequestIdSchema,
  isGranted,
} from "../toolhost-protocol/index.ts"
import type {
  Capabilities,
  JsonRpcRequest,
  JsonRpcResponse,
  LessonEventEmitParams,
  RequestId,
} from "../toolhost-protocol/index.ts"
import { outcomeFromResponse } from "./audit.ts"
import type { AuditEvent } from "./audit.ts"

export type MethodHandler = (params: unknown) => unknown | Promise<unknown>

export interface RouterConfig {
  grantedCaps: Capabilities
  handlers: Partial<Record<string, MethodHandler>>
  /** board.write scope "own-embeds": senza predicato di ownership NESSUN embed è scrivibile (deny-by-default). */
  isOwnEmbed?: (embedId: string) => boolean
  /**
   * lesson.event.emit / `plugin.mounted`: l'identità di istanza è HOST-side e
   * "non esiste sul wire" (caps/instance.ts, ToolHostDeps.instanceId) — ma i
   * params di questo evento la PORTANO, insieme al pluginId. Senza predicato di
   * ownership NESSUNA identità è dichiarabile (deny-by-default, come own-embeds):
   * altrimenti un tool montato registra il montaggio di un'ALTRA istanza, e la
   * provenienza per-istanza di LessonOS diventa un'affermazione del non fidato.
   */
  isOwnPluginIdentity?: (pluginId: string, instanceId: string) => boolean
  /** Audit T2: invocato per OGNI request rispondibile (mai per le notification). */
  onAudit?: (event: AuditEvent) => void
}

function errorResponse(id: RequestId | null, code: number, message: string): JsonRpcResponse {
  return { jsonrpc: "2.0", id, error: { code, message } }
}

/** Estrae un id utilizzabile da un payload arbitrario, senza fidarsi della forma. */
export function extractRequestId(raw: unknown): RequestId | null {
  if (typeof raw !== "object" || raw === null) return null
  const candidate = (raw as { id?: unknown }).id
  const parsed = RequestIdSchema.safeParse(candidate)
  return parsed.success ? parsed.data : null
}

/**
 * Router minimo host-side (TOOLHOST-SPEC-v0 §1/§2): ogni messaggio del tool è
 * validato Zod QUI, lato host. Ritorna la response da inviare, o null se il
 * payload è una notification (JSON-RPC: alle notification non si risponde).
 * Con onAudit configurato, OGNI request rispondibile viene registrata con esito.
 */
export async function routeRequest(raw: unknown, cfg: RouterConfig): Promise<JsonRpcResponse | null> {
  const response = await dispatch(raw, cfg)
  if (response !== null && cfg.onAudit !== undefined) {
    const candidate = typeof raw === "object" && raw !== null ? (raw as { method?: unknown }).method : undefined
    // troncato: il nome metodo arriva dal tool, non deve poter gonfiare il log
    const method = typeof candidate === "string" && candidate.length > 0 ? candidate.slice(0, 128) : "<malformed>"
    try {
      cfg.onAudit({ method, ...outcomeFromResponse(response) })
    } catch {
      // un audit-sink rotto non deve MAI negare la response al tool (l'azione è già avvenuta)
    }
  }
  return response
}

async function dispatch(raw: unknown, cfg: RouterConfig): Promise<JsonRpcResponse | null> {
  const reqParse = JsonRpcRequestSchema.safeParse(raw)
  if (!reqParse.success) {
    if (JsonRpcNotificationSchema.safeParse(raw).success) return null
    return errorResponse(extractRequestId(raw), ERR.INVALID_REQUEST, "invalid JSON-RPC 2.0 request")
  }
  const req: JsonRpcRequest = reqParse.data

  const spec = TOOL_METHODS[req.method]
  if (spec === undefined) {
    return errorResponse(req.id, ERR.METHOD_NOT_FOUND, `unknown method: ${req.method}`)
  }

  if (!isGranted(cfg.grantedCaps, spec.cap)) {
    return errorResponse(req.id, ERR.CAPABILITY_DENIED, `capability not granted: ${spec.cap}`)
  }

  const paramsParse = spec.params.safeParse(req.params)
  if (!paramsParse.success) {
    return errorResponse(req.id, ERR.INVALID_PARAMS, `invalid params for ${req.method}`)
  }

  if (req.method === "board.write") {
    const embedId = (paramsParse.data as { embedId: string }).embedId
    if (cfg.isOwnEmbed === undefined || !cfg.isOwnEmbed(embedId)) {
      return errorResponse(req.id, ERR.CAPABILITY_DENIED, "board.write outside own-embeds scope")
    }
  }

  if (req.method === "lesson.event.emit") {
    const { event } = paramsParse.data as LessonEventEmitParams
    if (event.kind === "plugin.mounted") {
      if (cfg.isOwnPluginIdentity === undefined || !cfg.isOwnPluginIdentity(event.pluginId, event.instanceId)) {
        return errorResponse(req.id, ERR.CAPABILITY_DENIED, "plugin.mounted outside own instance identity")
      }
    }
  }

  const handler = cfg.handlers[req.method]
  if (handler === undefined) {
    return errorResponse(req.id, ERR.INTERNAL, `method not wired by host: ${req.method}`)
  }

  try {
    const result = await handler(paramsParse.data)
    return { jsonrpc: "2.0", id: req.id, result }
  } catch (e) {
    const message = e instanceof Error ? e.message : "handler failed"
    return errorResponse(req.id, ERR.INTERNAL, message)
  }
}
