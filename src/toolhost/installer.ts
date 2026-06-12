// TOOLHOST-SPEC-v0 §9 T3 — flusso pubblica/installa tool locale:
// - manifest firmato ed25519 (WebCrypto), verifica all'install
// - Zod .strict parse (riusa ToolManifestSchema)
// - check kill-list prima di installare
// - audit-log preservato all'uninstall (spec §2: "audit log conservato")
// - niente marketplace remoto (solo file locale)
//
// Path workspace:
//   tools/<toolId>/manifest.json        — manifest JSON ORIGINALE (stessi byte della firma)
//   tools/<toolId>/bundle.maestrotool   — zip originale (per re-install/recovery)
//   tools/<toolId>/install.json         — record install: versione, timestamp, firma
//   tools/<toolId>/state.json           — stato suspend (già in host.ts)
//   tools/<toolId>/storage/             — KV per-tool (già in caps/storage.ts)
//   tools/<toolId>/audit.jsonl          — audit log (già in audit.ts, SOPRAVVIVE all'uninstall)
//   tools/kill-list.json                — kill-list condivisa (killList.ts)

import { z } from "zod"
import { ToolManifestSchema, isValidToolId } from "../toolhost-protocol/index.ts"
import type { ToolManifest } from "../toolhost-protocol/index.ts"
import { assertNotKilled } from "./killList.ts"
import type { StorageReadWriteDelete } from "./killList.ts"
import type { AuditStore } from "./audit.ts"
import type { StorageEntryLike } from "./caps/storage.ts"

// ---- Schemi record install ----

export const InstallRecordSchema = z.strictObject({
  v: z.literal(1),
  toolId: z.string(),
  manifestVersion: z.literal(1),
  toolVersion: z.string(),
  /** Epoch ms in cui è stato installato. */
  t: z.number().int().nonnegative(),
  /** Base64 della firma ed25519 verificata all'install. */
  signature: z.string(),
  /** Hash SHA-256 del bundle (per fingerprint). */
  bundleHash: z.string(),
})
export type InstallRecord = z.infer<typeof InstallRecordSchema>

export interface InstallerStore extends StorageReadWriteDelete, AuditStore {
  list(prefix?: string): Promise<StorageEntryLike[]>
}

// ---- Helper ed25519 ----

/**
 * Verifica una firma ed25519 con WebCrypto.
 * message: raw bytes del JSON originale del manifest (quelli firmati dal publisher)
 * signature: firma raw bytes
 * pubkeyRawBytes: chiave pubblica ed25519 in bytes
 */
async function verifyEd25519(
  message: Uint8Array,
  signature: Uint8Array,
  pubkeyRawBytes: Uint8Array,
): Promise<boolean> {
  try {
    const keyDataArr: ArrayBuffer = pubkeyRawBytes.buffer.slice(
      pubkeyRawBytes.byteOffset,
      pubkeyRawBytes.byteOffset + pubkeyRawBytes.byteLength,
    ) as ArrayBuffer
    const key = await crypto.subtle.importKey(
      "raw",
      keyDataArr,
      { name: "Ed25519" },
      false,
      ["verify"],
    )
    const sigArr: ArrayBuffer = signature.buffer.slice(
      signature.byteOffset,
      signature.byteOffset + signature.byteLength,
    ) as ArrayBuffer
    const msgArr: ArrayBuffer = message.buffer.slice(
      message.byteOffset,
      message.byteOffset + message.byteLength,
    ) as ArrayBuffer
    return await crypto.subtle.verify("Ed25519", key, sigArr, msgArr)
  } catch {
    return false
  }
}

/** Estrae il segmento base64 dopo "ed25519:" dalla pubkey del manifest. */
function extractPubkeyBytes(pubkey: string): Uint8Array {
  const prefix = "ed25519:"
  if (!pubkey.startsWith(prefix)) throw new Error(`unsupported key format: expected ed25519:...`)
  const raw = pubkey.slice(prefix.length)
  return Uint8Array.from(atob(raw), (c) => c.charCodeAt(0))
}

/** Decodifica firma base64 in bytes. */
function decodeSignature(signatureB64: string): Uint8Array {
  return Uint8Array.from(atob(signatureB64), (c) => c.charCodeAt(0))
}

// ---- Path workspace ----

export function manifestPath(toolId: string): string {
  if (!isValidToolId(toolId)) throw new Error(`invalid tool id: ${toolId}`)
  return `tools/${toolId}/manifest.json`
}

export function bundlePath(toolId: string): string {
  if (!isValidToolId(toolId)) throw new Error(`invalid tool id: ${toolId}`)
  return `tools/${toolId}/bundle.maestrotool`
}

export function installRecordPath(toolId: string): string {
  if (!isValidToolId(toolId)) throw new Error(`invalid tool id: ${toolId}`)
  return `tools/${toolId}/install.json`
}

// ---- Install ----

/**
 * Installa un tool locale nel workspace.
 *
 * Passi:
 * 1. Parsa manifestJson come JSON + Zod .strict (chiavi sconosciute = reject)
 * 2. Verifica firma ed25519 contro i BYTE ORIGINALI del JSON (non re-serializzati)
 * 3. assertNotKilled() — kill-list check
 * 4. Calcola hash SHA-256 del bundle zip
 * 5. Scrive manifest.json (BYTE ORIGINALI), bundle.maestrotool, install.json
 *
 * @param store — workspace store
 * @param manifestJson — IL JSON ORIGINALE del manifest (stessi byte firmati dal publisher)
 * @param bundleZip — zip .maestrotool originale (entry.html + asset)
 * @param signatureB64 — firma ed25519 in base64 raw
 * @param now — clock iniettabile
 * @returns il manifest parsato (per grant/buildConsentSheet)
 */
export async function installTool(
  store: InstallerStore,
  manifestJson: string,
  bundleZip: Blob,
  signatureB64: string,
  now?: () => number,
): Promise<ToolManifest> {
  // 1. Parsa JSON + Zod
  const manifestRaw = JSON.parse(manifestJson)
  const manifest = ToolManifestSchema.parse(manifestRaw)
  const { id, publisher } = manifest

  // 2. Verifica firma contro i BYTE ORIGINALI del JSON
  const pubkeyBytes = extractPubkeyBytes(publisher.pubkey)
  const sigBytes = decodeSignature(signatureB64)
  const manifestBytes = new TextEncoder().encode(manifestJson)
  const valid = await verifyEd25519(manifestBytes, sigBytes, pubkeyBytes)
  if (!valid) {
    throw new Error(`signature verification failed for tool "${id}"`)
  }

  // 3. Kill-list check (prima di scrivere nulla)
  await assertNotKilled(store, id)

  // 4. Calcola hash SHA-256 del bundle per fingerprint
  const bundleBuffer = await bundleZip.arrayBuffer()
  const bundleHashBytes = new Uint8Array(await crypto.subtle.digest("SHA-256", bundleBuffer))
  const bundleHash = btoa(String.fromCharCode(...bundleHashBytes))

  // 5. Verifica che il tool non sia già installato
  const existing = await store.read(manifestPath(id))
  if (existing !== null) {
    throw new Error(`tool "${id}" is already installed`)
  }

  // 6. Scrivi artefatti — manifest.json come BYTE ORIGINALI (identici a quelli firmati)
  const t = (now ?? (() => Date.now()))()
  const installRecord: InstallRecord = {
    v: 1,
    toolId: id,
    manifestVersion: 1,
    toolVersion: manifest.version,
    t,
    signature: signatureB64,
    bundleHash,
  }

  await store.write(manifestPath(id), new Blob([manifestJson], { type: "application/json" }))
  await store.write(bundlePath(id), bundleZip)
  await store.write(installRecordPath(id), new Blob([JSON.stringify(installRecord, null, 2)], { type: "application/json" }))

  return manifest
}

// ---- Uninstall ----

/**
 * Disinstalla un tool: rimuove manifest, bundle, install record, storage e state.
 * L'audit-log SOPRAVVIVE (spec §2: "audit log conservato").
 */
export async function uninstallTool(
  store: InstallerStore,
  toolId: string,
): Promise<void> {
  if (!isValidToolId(toolId)) throw new Error(`invalid tool id: ${toolId}`)

  // Pulisce storage per-tool
  const sp = `tools/${toolId}/storage/`
  const entries = await store.list(sp)
  for (const entry of entries) {
    await store.delete(entry.path)
  }

  // Rimuovi artefatti di install
  await store.delete(manifestPath(toolId))
  await store.delete(bundlePath(toolId))
  await store.delete(installRecordPath(toolId))
  await store.delete(`tools/${toolId}/state.json`)

  // NOTA: tools/<toolId>/audit.jsonl NON viene cancellato (audit preservato)
}

// ---- Query ----

/** Verifica se un tool è installato (manifest.json esiste). */
export async function isToolInstalled(store: InstallerStore, toolId: string): Promise<boolean> {
  if (!isValidToolId(toolId)) return false
  const blob = await store.read(manifestPath(toolId))
  return blob !== null
}

/** Lista tutti i toolId installati scandendo tools/<id>/manifest.json. */
export async function listInstalledTools(store: InstallerStore): Promise<string[]> {
  const entries = await store.list("tools/")
  const toolIds = new Set<string>()
  for (const entry of entries) {
    const parts = entry.path.split("/")
    // tools/<toolId>/manifest.json → parts = ["tools", "<toolId>", "manifest.json"]
    if (parts.length >= 3 && parts[2] === "manifest.json") {
      toolIds.add(parts[1])
    }
  }
  return [...toolIds]
}

/** Legge il record di install di un tool. */
export async function getInstallRecord(store: InstallerStore, toolId: string): Promise<InstallRecord | null> {
  if (!isValidToolId(toolId)) return null
  const blob = await store.read(installRecordPath(toolId))
  if (blob === null) return null
  try {
    return InstallRecordSchema.parse(JSON.parse(await blob.text()))
  } catch {
    return null
  }
}
