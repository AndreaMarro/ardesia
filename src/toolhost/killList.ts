// TOOLHOST-SPEC-v0 §3 (innesto P3) — kill-list locale: lista di toolId revocati/
// bannati, consultata all'install e all'avvio. Persiste in tools/kill-list.json
// nel WorkspaceStore. Il kill-switch remoto (spec §3) arriva post-v0; in locale
// il docente può revocare manualmente un tool.
//
// Le mutazioni sono serializzate (promise-chain come audit.ts) per evitare
// perdita di scritture su read-modify-write concorrenti.

import { z } from "zod"
import { isValidToolId } from "../toolhost-protocol/index.ts"

export interface StorageReadWriteDelete {
  read(path: string): Promise<Blob | null>
  write(path: string, data: Blob): Promise<void>
  delete(path: string): Promise<void>
}

export const KillListEntrySchema = z.strictObject({
  v: z.literal(1),
  toolId: z.string().refine(isValidToolId, { message: "invalid tool id" }),
  /** Epoch ms del momento in cui è stato aggiunto alla kill-list. */
  t: z.number().int().nonnegative(),
  reason: z.string().max(500).optional(),
})
export type KillListEntry = z.infer<typeof KillListEntrySchema>

export const KillListDocSchema = z.strictObject({
  v: z.literal(1),
  entries: z.array(KillListEntrySchema),
})

const KILL_LIST_PATH = "tools/kill-list.json"

/** Coda di serializzazione per le mutazioni del file kill-list. */
let _chain: Promise<void> = Promise.resolve()

async function readKillList(store: StorageReadWriteDelete): Promise<KillListEntry[]> {
  const blob = await store.read(KILL_LIST_PATH)
  if (blob === null) return []
  try {
    const doc = KillListDocSchema.parse(JSON.parse(await blob.text()))
    return doc.entries
  } catch {
    // kill-list corrotta → meglio bloccante: il docente la ripulisce
    throw new Error("corrupted kill-list, manual repair required")
  }
}

/** Controlla se un toolId è nella kill-list (bannato/revocato). */
export async function checkKillList(store: StorageReadWriteDelete, toolId: string): Promise<boolean> {
  const entries = await readKillList(store)
  return entries.some((e) => e.toolId === toolId)
}

/** Aggiunge un tool alla kill-list. Se già presente, aggiorna timestamp. */
export async function addToKillList(
  store: StorageReadWriteDelete,
  toolId: string,
  reason?: string,
  now?: () => number,
): Promise<void> {
  if (!isValidToolId(toolId)) throw new Error(`invalid tool id: ${toolId}`)
  const p = _chain.then(async () => {
    const entries = await readKillList(store)
    const filtered = entries.filter((e) => e.toolId !== toolId)
    filtered.push({
      v: 1,
      toolId,
      t: (now ?? (() => Date.now()))(),
      ...(reason !== undefined ? { reason } : {}),
    })
    const doc = JSON.stringify({ v: 1, entries: filtered }, null, 2)
    await store.write(KILL_LIST_PATH, new Blob([doc], { type: "application/json" }))
  })
  _chain = p.then(
    () => {},
    () => {},
  )
  return p
}

/** Rimuove un tool dalla kill-list (riabilitazione). */
export async function removeFromKillList(store: StorageReadWriteDelete, toolId: string): Promise<void> {
  const p = _chain.then(async () => {
    const entries = await readKillList(store)
    const filtered = entries.filter((e) => e.toolId !== toolId)
    const doc = JSON.stringify({ v: 1, entries: filtered }, null, 2)
    await store.write(KILL_LIST_PATH, new Blob([doc], { type: "application/json" }))
  })
  _chain = p.then(
    () => {},
    () => {},
  )
  return p
}

/** Legge la kill-list completa (per UI docente). */
export async function getKillList(store: StorageReadWriteDelete): Promise<KillListEntry[]> {
  return readKillList(store)
}

/** Controllo bloccante all'install: se il tool è nella kill-list, throw. */
export async function assertNotKilled(store: StorageReadWriteDelete, toolId: string): Promise<void> {
  if (await checkKillList(store, toolId)) {
    throw new Error(`tool "${toolId}" is revoked and cannot be installed`)
  }
}
