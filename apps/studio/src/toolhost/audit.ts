// TOOLHOST-SPEC-v0 §3 (innesto P3) — audit-log APPEND-ONLY per-tool, leggibile
// dal docente ("cosa ha letto questo tool?"). Ogni chiamata capability registrata:
// timestamp, tool, metodo, esito. Vive nel WorkspaceStore a tools/<toolId>/audit.jsonl
// e SOPRAVVIVE all'uninstall (la purge tocca solo storage/, mai l'audit).

import { z } from "zod"
import { ERR, isValidToolId } from "../toolhost-protocol/index.ts"
import type { JsonRpcResponse } from "../toolhost-protocol/index.ts"

export type AuditOutcome = "ok" | "denied" | "invalid" | "error"

export const AuditEntrySchema = z.strictObject({
  v: z.literal(1),
  t: z.number().int().nonnegative(),
  tool: z.string().min(1),
  method: z.string().min(1),
  outcome: z.enum(["ok", "denied", "invalid", "error"]),
  code: z.number().int().optional(),
})
export type AuditEntry = z.infer<typeof AuditEntrySchema>

export interface AuditEvent {
  method: string
  outcome: AuditOutcome
  code?: number
}

/** Esito docente-leggibile dalla response JSON-RPC del router. */
export function outcomeFromResponse(response: JsonRpcResponse): { outcome: AuditOutcome; code?: number } {
  if (!("error" in response)) return { outcome: "ok" }
  const code = response.error.code
  // denied = il tool ha chiesto qualcosa che per LUI non esiste o non è concesso
  if (code === ERR.CAPABILITY_DENIED || code === ERR.METHOD_NOT_FOUND) return { outcome: "denied", code }
  if (code === ERR.INTERNAL) return { outcome: "error", code }
  return { outcome: "invalid", code }
}

export function auditPath(toolId: string): string {
  if (!isValidToolId(toolId)) throw new Error(`invalid tool id: ${toolId}`)
  return `tools/${toolId}/audit.jsonl`
}

/** Sottoinsieme del WorkspaceStore usato dall'audit (testabile con store in-memory). */
export interface AuditStore {
  read(path: string): Promise<Blob | null>
  write(path: string, data: Blob): Promise<void>
}

/**
 * Log append-only per UN tool. Le append sono SERIALIZZATE (promise-chain,
 * lezione race di Room.tsx): il driver non ha una primitiva append, quindi
 * read-modify-write concorrenti perderebbero righe. Un'append fallita rigetta
 * la SUA promise ma non avvelena la catena.
 */
export class ToolAuditLog {
  private _store: AuditStore
  private _path: string
  private _tool: string
  private _now: () => number
  private _chain: Promise<void> = Promise.resolve()

  constructor(store: AuditStore, toolId: string, now?: () => number) {
    this._store = store
    this._path = auditPath(toolId)
    this._tool = toolId
    this._now = now ?? (() => Date.now())
  }

  append(event: AuditEvent): Promise<void> {
    const entry: AuditEntry = {
      v: 1,
      t: this._now(),
      tool: this._tool,
      method: event.method,
      outcome: event.outcome,
      ...(event.code !== undefined ? { code: event.code } : {}),
    }
    const p = this._chain.then(() => this._doAppend(entry))
    this._chain = p.then(
      () => {},
      () => {},
    )
    return p
  }

  /** Attende che tutte le append accodate siano atterrate (per shutdown/test). */
  idle(): Promise<void> {
    return this._chain
  }

  private async _doAppend(entry: AuditEntry): Promise<void> {
    const existing = await this._store.read(this._path)
    const prior = existing === null ? "" : await existing.text()
    const next = prior + JSON.stringify(entry) + "\n"
    await this._store.write(this._path, new Blob([next], { type: "application/x-ndjson" }))
  }
}

export interface AuditReadResult {
  entries: AuditEntry[]
  /** Righe non parseabili: contate e MAI spacciate per entry valide. */
  malformed: number
}

/** Lettura docente-side: tutte le chiamate del tool, in ordine di append. */
export async function readAuditLog(store: AuditStore, toolId: string): Promise<AuditReadResult> {
  const blob = await store.read(auditPath(toolId))
  if (blob === null) return { entries: [], malformed: 0 }
  const text = await blob.text()
  const entries: AuditEntry[] = []
  let malformed = 0
  for (const line of text.split("\n")) {
    if (line.trim() === "") continue
    try {
      entries.push(AuditEntrySchema.parse(JSON.parse(line)))
    } catch {
      malformed += 1
    }
  }
  return { entries, malformed }
}
