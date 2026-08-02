// TOOLHOST-SPEC-v0 §2 capability storage — KV per-tool DENTRO il WorkspaceStore,
// namespace tools/<toolId>/storage/<key>. Il prefisso è costruito QUI dal toolId
// validato: il tool non può influenzarlo, quindi non può uscirne nemmeno per bug
// (le chiavi sono comunque ri-validate, defense-in-depth oltre il wire schema).

import { isValidStorageKey, isValidToolId } from "../../toolhost-protocol/index.ts"
import { assertInstanceId } from "./instance.ts"

/**
 * Sottoinsieme del WorkspaceStore/WorkspaceDriver usato dalla capability:
 * list ritorna entry con path E blob (come FileEntry), così la quota si calcola
 * senza una read per chiave. workspaceStore lo soddisfa strutturalmente.
 */
export interface StorageEntryLike {
  path: string
  data: Blob
}

export interface StorageDriverLike {
  read(path: string): Promise<Blob | null>
  write(path: string, data: Blob): Promise<void>
  delete(path: string): Promise<void>
  list(prefix?: string): Promise<StorageEntryLike[]>
}

export function storagePrefix(toolId: string, instanceId?: string): string {
  if (!isValidToolId(toolId)) throw new Error(`invalid tool id: ${toolId}`)
  if (instanceId === undefined) return `tools/${toolId}/storage/`
  // P0-C: il namespace istanza vive DENTRO storage/ del tool, così l'uninstall
  // (purge del prefisso tool) pulisce anche le istanze. "@instance" non può
  // collidere con una chiave legacy: le storage key iniziano alfanumeriche.
  assertInstanceId(instanceId)
  return `tools/${toolId}/storage/@instance/${instanceId}/`
}

// Sottoalbero delle istanze visto dal namespace legacy (senza instanceId):
// chiavi lì dentro non sono chiavi del namespace corrente, né per list né per quota.
const INSTANCE_SUBTREE = "@instance/"

function assertKey(key: string): void {
  if (!isValidStorageKey(key)) throw new Error(`invalid storage key: ${key}`)
}

// Ogni chiave pesa anche come metadato: overhead fisso nel computo quota, così
// un tool non può esaurire il filesystem con migliaia di chiavi a valore vuoto.
const KEY_OVERHEAD_BYTES = 1024

/**
 * Capability storage per UN tool, con quota dal MANIFEST (mai dal tool).
 * Le MUTAZIONI sono serializzate (promise-chain, stessa lezione dell'audit):
 * check quota e write separati da await sarebbero altrimenti una TOCTOU —
 * N set concorrenti passerebbero tutti il check prima che una write atterri.
 * I metodi ritornano già la forma wire dei result, da agganciare al router.
 */
export class ToolStorage {
  private _driver: StorageDriverLike
  private _prefix: string
  private _quotaBytes: number
  private _chain: Promise<unknown> = Promise.resolve()

  constructor(driver: StorageDriverLike, toolId: string, quotaMB: number, instanceId?: string) {
    if (!Number.isInteger(quotaMB) || quotaMB < 1) throw new Error(`invalid quota: ${quotaMB}`)
    this._driver = driver
    // Quota PER ISTANZA: le istanze le crea il docente host-side (mai il tool),
    // quindi il moltiplicatore è sotto il controllo del docente, non del plugin.
    this._prefix = storagePrefix(toolId, instanceId)
    this._quotaBytes = quotaMB * 1024 * 1024
  }

  /** Drena le mutazioni in coda (l'uninstall lo attende prima del purge). */
  idle(): Promise<void> {
    return this._chain.then(
      () => {},
      () => {},
    )
  }

  private _serialize<T>(op: () => Promise<T>): Promise<T> {
    const p = this._chain.then(op, op)
    this._chain = p.then(
      () => {},
      () => {},
    )
    return p
  }

  async get(key: string): Promise<{ value: string | null }> {
    assertKey(key)
    const blob = await this._driver.read(this._prefix + key)
    return { value: blob === null ? null : await blob.text() }
  }

  set(key: string, value: string): Promise<Record<string, never>> {
    assertKey(key)
    return this._serialize(async () => {
      const data = new Blob([value], { type: "text/plain" })
      const used = await this._usageExcluding(this._prefix + key)
      if (used + KEY_OVERHEAD_BYTES + data.size > this._quotaBytes) {
        throw new Error(`storage quota exceeded (${this._quotaBytes / (1024 * 1024)} MB)`)
      }
      await this._driver.write(this._prefix + key, data)
      return {}
    })
  }

  delete(key: string): Promise<Record<string, never>> {
    assertKey(key)
    return this._serialize(async () => {
      await this._driver.delete(this._prefix + key)
      return {}
    })
  }

  /** Chiavi RELATIVE al namespace (il path fisico non trapela mai al tool). */
  async list(prefix?: string): Promise<{ keys: string[] }> {
    const entries = await this._driver.list(this._prefix)
    const keys = entries
      .filter((e) => e.path.startsWith(this._prefix))
      .map((e) => e.path.slice(this._prefix.length))
      .filter((k) => !k.startsWith(INSTANCE_SUBTREE))
      .filter((k) => prefix === undefined || k.startsWith(prefix))
      .sort()
    return { keys }
  }

  private async _usageExcluding(targetPath: string): Promise<number> {
    const entries = await this._driver.list(this._prefix)
    let total = 0
    for (const e of entries) {
      if (!e.path.startsWith(this._prefix) || e.path === targetPath) continue
      // la quota di un namespace non conta i byte dei namespace istanza annidati
      if (e.path.slice(this._prefix.length).startsWith(INSTANCE_SUBTREE)) continue
      total += KEY_OVERHEAD_BYTES + e.data.size
    }
    return total
  }
}

/**
 * Uninstall (spec §2 lifecycle): purge del SOLO storage/ del tool. L'audit
 * (tools/<toolId>/audit.jsonl) sta FUORI dal prefisso e sopravvive per costruzione.
 */
export async function purgeToolStorage(driver: StorageDriverLike, toolId: string): Promise<number> {
  return purgeByPrefix(driver, storagePrefix(toolId))
}

/**
 * Uninstall di UNA istanza: purge del solo sottoalbero @instance/<id>/.
 * Disinstallare un post-it non deve svuotare il gemello dello stesso plugin
 * accanto — il referente è il prefisso DERIVATO dall'istanza, non una lista.
 */
export async function purgeInstanceStorage(
  driver: StorageDriverLike,
  toolId: string,
  instanceId: string,
): Promise<number> {
  return purgeByPrefix(driver, storagePrefix(toolId, instanceId))
}

async function purgeByPrefix(driver: StorageDriverLike, prefix: string): Promise<number> {
  const paths = (await driver.list(prefix)).map((e) => e.path).filter((p) => p.startsWith(prefix))
  for (const p of paths) await driver.delete(p)
  return paths.length
}
