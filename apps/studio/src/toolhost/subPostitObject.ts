// S3 — sub-post-it: oggetto figlio di un'istanza plugin sulla board (Claude
// product lane, 2026-07-08). Rende visibili manuale/diagnostica/passi/note/
// esercizi INTORNO a un post-it plugin senza clutter, come oggetti figli
// durevoli e serializzabili con provenienza.
//
// Regole brief §C+3: il figlio è legato al parent per instanceId; round-trip
// serialize/restore con provenienza; orphan policy ESPLICITA; NESSUN branch
// specifico per plugin (role è un enum generico, un solo percorso di codice).
// Import solo da caps/instance e dal tipo PostitBounds: niente simulatore.

import { assertInstanceId } from "./caps/instance.ts"
import type { PostitBounds } from "./postitObject.ts"

// Ruoli GENERICI: nessuna semantica plugin-specifica cablata qui.
export const SUB_POSTIT_ROLES = ["manual", "diagnostics", "steps", "notes", "exercise"] as const
export type SubPostitRole = (typeof SUB_POSTIT_ROLES)[number]

// Provenienza: EvidenceRef namespace ("manual:vol1:p30" | "document:sha256:<h>"
// | "board:<id>" | "plugin:<id>@<v>"), stringhe come nel precedente studentPack.
export type SubPostitProvenance = { evidenceRefs: string[] }

export type SubPostitObject<TState = unknown> = {
  kind: "sub-postit-object"
  instanceId: string
  // null = orfano PROMOSSO a oggetto standalone ("pop out to board"), non un
  // figlio senza parent per errore. Un figlio legato ha sempre un id valido.
  parentInstanceId: string | null
  role: SubPostitRole
  bounds: PostitBounds
  provenance: SubPostitProvenance
  state: TState
}

export type CreateSubPostitObjectInput<TState> = {
  instanceId: string
  parentInstanceId: string | null
  role: SubPostitRole
  bounds: PostitBounds
  provenance?: SubPostitProvenance
  state: TState
}

export function createSubPostitObject<TState>(
  input: CreateSubPostitObjectInput<TState>,
): SubPostitObject<TState> {
  assertInstanceId(input.instanceId)
  assertParentInstanceId(input.parentInstanceId)
  assertRole(input.role)
  assertBounds(input.bounds)
  const provenance = input.provenance ?? { evidenceRefs: [] }
  assertProvenance(provenance)

  return {
    kind: "sub-postit-object",
    instanceId: input.instanceId,
    parentInstanceId: input.parentInstanceId,
    role: input.role,
    bounds: copyBounds(input.bounds),
    provenance: { evidenceRefs: [...provenance.evidenceRefs] },
    state: structuredClone(input.state),
  }
}

export function serializeSubPostitObject<TState>(
  child: SubPostitObject<TState>,
): SubPostitObject<TState> {
  return {
    ...child,
    bounds: copyBounds(child.bounds),
    provenance: { evidenceRefs: [...child.provenance.evidenceRefs] },
    state: structuredClone(child.state),
  }
}

/**
 * Restore fail-closed: kind/id/parent/role/bounds/provenance fuori schema =
 * throw, mai un figlio parzialmente ricostruito (stessa disciplina di
 * restorePluginPostitObject).
 */
export function restoreSubPostitObject<TState = unknown>(payload: unknown): SubPostitObject<TState> {
  if (!isRecord(payload)) throw new Error("serialized sub-post-it must be an object")
  if (payload.kind !== "sub-postit-object") throw new Error("invalid sub-post-it kind")
  if (typeof payload.instanceId !== "string") throw new Error("instanceId must be a string")
  if (payload.parentInstanceId !== null && typeof payload.parentInstanceId !== "string") {
    throw new Error("parentInstanceId must be a string or null")
  }
  if (!isRole(payload.role)) throw new Error("invalid sub-post-it role")
  if (!isBounds(payload.bounds)) throw new Error("bounds must be an object")
  if (!isProvenance(payload.provenance)) throw new Error("provenance must be { evidenceRefs: string[] }")

  return createSubPostitObject<TState>({
    instanceId: payload.instanceId,
    parentInstanceId: payload.parentInstanceId,
    role: payload.role,
    bounds: payload.bounds,
    provenance: payload.provenance,
    state: payload.state as TState,
  })
}

/** Figli di un dato parent (linkage esplicito per instanceId). */
export function childrenOf<TState>(
  children: readonly SubPostitObject<TState>[],
  parentInstanceId: string,
): SubPostitObject<TState>[] {
  return children.filter((child) => child.parentInstanceId === parentInstanceId)
}

// --- Orphan policy ESPLICITA. Orfano = figlio con parent NON tra quelli vivi.
// Un figlio già detached (parentInstanceId null) è standalone, NON orfano. ---
export type OrphanPolicy = "detach" | "remove" | "keep"

function isOrphan<TState>(child: SubPostitObject<TState>, parents: ReadonlySet<string>): boolean {
  return child.parentInstanceId !== null && !parents.has(child.parentInstanceId)
}

export function detectOrphans<TState>(
  children: readonly SubPostitObject<TState>[],
  existingParentIds: Iterable<string>,
): SubPostitObject<TState>[] {
  const parents = new Set(existingParentIds)
  return children.filter((child) => isOrphan(child, parents))
}

/** Promuove un figlio a standalone (parentInstanceId → null). */
export function detachSubPostit<TState>(child: SubPostitObject<TState>): SubPostitObject<TState> {
  return { ...child, parentInstanceId: null }
}

export function resolveOrphans<TState>(
  children: readonly SubPostitObject<TState>[],
  existingParentIds: Iterable<string>,
  policy: OrphanPolicy,
): SubPostitObject<TState>[] {
  const parents = new Set(existingParentIds)
  switch (policy) {
    case "keep":
      return children.map((child) => ({ ...child }))
    case "remove":
      return children.filter((child) => !isOrphan(child, parents))
    case "detach":
      return children.map((child) => (isOrphan(child, parents) ? detachSubPostit(child) : { ...child }))
    default:
      return assertNever(policy)
  }
}

// ---- validatori/guardie (fail-closed) ----

function assertParentInstanceId(parentInstanceId: string | null): void {
  if (parentInstanceId !== null) assertInstanceId(parentInstanceId)
}

function assertRole(role: SubPostitRole): void {
  if (!isRole(role)) throw new Error(`invalid sub-post-it role: ${String(role)}`)
}

function isRole(value: unknown): value is SubPostitRole {
  return typeof value === "string" && (SUB_POSTIT_ROLES as readonly string[]).includes(value)
}

function assertProvenance(provenance: SubPostitProvenance): void {
  if (!isProvenance(provenance)) throw new Error("provenance must be { evidenceRefs: string[] }")
}

function isProvenance(value: unknown): value is SubPostitProvenance {
  return (
    isRecord(value) &&
    Array.isArray(value.evidenceRefs) &&
    value.evidenceRefs.every((ref) => typeof ref === "string")
  )
}

function assertBounds(bounds: PostitBounds): void {
  for (const [key, value] of Object.entries(bounds)) {
    if (!Number.isFinite(value)) throw new Error(`invalid bounds.${key}`)
  }
  if (bounds.width <= 0 || bounds.height <= 0) {
    throw new Error("bounds width and height must be positive")
  }
}

function isBounds(value: unknown): value is PostitBounds {
  return (
    isRecord(value) &&
    typeof value.x === "number" &&
    typeof value.y === "number" &&
    typeof value.width === "number" &&
    typeof value.height === "number"
  )
}

function copyBounds(bounds: PostitBounds): PostitBounds {
  return { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function assertNever(value: never): never {
  throw new Error(`unexpected orphan policy: ${String(value)}`)
}
