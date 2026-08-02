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
import { auditPath } from "./audit.ts"
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

  // 4b. Integrità del bundle: se il manifest FIRMATO impegna un hash del bundle,
  // deve combaciare con i byte consegnati. Chiude il gap firma-payload: la firma
  // autentica il manifest, il manifest autentica (tramite questo hash) il codice
  // runtime. Manifest legacy senza `integrity` = nessun impegno (back-compat).
  // Fail-closed PRIMA di qualunque write: un bundle divergente non lascia traccia.
  if (manifest.integrity !== undefined && manifest.integrity.bundleSha256 !== bundleHash) {
    throw new Error(
      `bundle integrity mismatch for tool "${id}": manifest commits to a different bundle`,
    )
  }

  // 5. Verifica che il tool non sia già installato — sulla TRIADE completa
  // (P2.2): un parziale legacy (es. manifest orfano di un install interrotto)
  // non è "installato" e il reinstall è il percorso di recovery, non un deadlock.
  if (await isToolInstalled(store, id)) {
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

  // P2.2: mai artefatti parziali — se una write fallisce a metà, rollback
  // best-effort di ciò che è atterrato PRIMA di rilanciare. Un manifest orfano
  // farebbe da base a futuri "manifest presente = install valido".
  try {
    await store.write(manifestPath(id), new Blob([manifestJson], { type: "application/json" }))
    await store.write(bundlePath(id), bundleZip)
    await store.write(installRecordPath(id), new Blob([JSON.stringify(installRecord, null, 2)], { type: "application/json" }))
  } catch (err) {
    for (const p of [installRecordPath(id), bundlePath(id), manifestPath(id)]) {
      try {
        await store.delete(p)
      } catch {
        // rollback best-effort: l'errore originale resta quello riportato
      }
    }
    throw err
  }

  return manifest
}

// ---- Uninstall ----

/**
 * Path che il contratto dichiara DUREVOLI oltre l'uninstall totale.
 *
 * Oggi ce n'è uno solo — l'audit-log — e la spec §2 dice perché: dopo aver
 * disinstallato un plugin, chi insegna deve poter ancora rispondere a «cosa ha
 * letto questo tool?». Un registro d'audit che sparisce col suo soggetto non è
 * un registro d'audit.
 *
 * Esiste come funzione, e non come stringa dentro `uninstallTool`, perché è
 * l'UNICO elenco scritto a mano che questa semantica si concede: tutto il resto
 * si deriva. Chi domani vorrà preservare un secondo oggetto lo aggiunge qui, e
 * il test che pretende «sopravvive solo l'audit» diventa rosso finché non lo
 * dichiara — che è il modo giusto di accorgersi di un cambio di contratto.
 */
export function uninstallPreservedPaths(toolId: string): readonly string[] {
  return [auditPath(toolId)]
}

/**
 * Disinstalla un tool: rimuove TUTTO il suo sottoalbero tranne i path che il
 * contratto dichiara durevoli.
 *
 * ## Che cosa significa «totale»
 *
 * Totale dentro il WorkspaceStore e dentro il sottoalbero POSSEDUTO dal tool,
 * cioè `tools/<toolId>/`. Non è totale in senso assoluto, e ciò che resta fuori
 * non è una dimenticanza:
 * - il `customData` della scena, dove `caps/board.ts` fa vivere l'ownership
 *   degli oggetti di proposito: è un secondo canale di ritenzione, e toccarlo
 *   sarebbe una decisione di prodotto;
 * - l'event-log LessonOS in IndexedDB, che sta FUORI dal WorkspaceStore e che
 *   questa funzione non può raggiungere nemmeno in linea di principio;
 * - sul driver FSA, le directory rimaste vuote: `walkDir` elenca file, quindi
 *   quello che resta lì è una forma, non un dato.
 *
 * ## Precondizione: quiescenza
 *
 * Il chiamante deve aver FERMATO e DRENATO le scritture del tool. La purga
 * cancella lo snapshot che `store.list(root)` ha restituito, e senza quiescenza
 * l'esito di una write concorrente è NON DETERMINISTICO. Misurati i tre casi:
 * verso un path assente dallo snapshot sopravvive; verso un path elencato ma
 * non ancora cancellato viene cancellata; verso un path già cancellato
 * sopravvive. Non esiste un istante dopo il quale una write «si salva».
 *
 * Questa funzione non drena da sé — `PluginManager` non possiede gli host vivi
 * — e non promette niente contro le scritture concorrenti. Dove drenare è
 * possibile il progetto lo fa già: `ToolHost.uninstall()` attende
 * `ToolStorage.idle()` prima del purge.
 *
 * Il referente si DERIVA dal `toolId` validato invece di essere un elenco di
 * cose da cancellare. Prima lo era, e l'elenco è invecchiato: la PR che ha
 * introdotto lo stato per istanza in `tools/<id>/@instance/<inst>/state.json`
 * non poteva sapere che qui esistesse un `tools/<id>/state.json` scritto a mano,
 * e quello stato sopravviveva alla disinstallazione. Un elenco di path da
 * rimuovere va aggiornato da chi aggiunge un path; un sottoalbero no.
 *
 * Nota di sicurezza: la kill-list vive a `tools/kill-list.json`, cioè SOPRA il
 * sottoalbero del singolo tool, e questa cancellazione non la raggiunge. Un
 * plugin revocato resta revocato anche dopo essere stato disinstallato.
 *
 * Idempotente: alla seconda chiamata il sottoalbero contiene già soltanto i
 * path preservati, e non resta niente da cancellare.
 */
export async function uninstallTool(
  store: InstallerStore,
  toolId: string,
): Promise<void> {
  if (!isValidToolId(toolId)) throw new Error(`invalid tool id: ${toolId}`)

  const root = `tools/${toolId}/`
  const preserved = new Set(uninstallPreservedPaths(toolId))

  for (const entry of await store.list(root)) {
    // `list(prefix)` è un filtro richiesto, non garantito: lo riapplico qui.
    // Senza, uno store generoso cancellerebbe fuori dal sottoalbero del tool.
    if (!entry.path.startsWith(root)) continue
    if (preserved.has(entry.path)) continue
    await store.delete(entry.path)
  }
}

// ---- Query ----

/**
 * Verifica se un tool è installato: TRIADE completa (P2.2) — manifest + bundle
 * + install record VALIDO. La sola presenza del manifest era una definizione
 * pericolosa: true su install incompleti/interrotti.
 */
export async function isToolInstalled(store: InstallerStore, toolId: string): Promise<boolean> {
  if (!isValidToolId(toolId)) return false
  const manifest = await store.read(manifestPath(toolId))
  if (manifest === null) return false
  const bundle = await store.read(bundlePath(toolId))
  if (bundle === null) return false
  return (await getInstallRecord(store, toolId)) !== null
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

// ---- Reverify post-install (Codex P1.1) ----

export type InstalledToolVerificationFailure =
  | "not-installed"
  | "install-record-missing"
  | "install-record-invalid"
  | "record-id-mismatch"
  | "manifest-invalid"
  | "manifest-id-mismatch"
  | "signature-invalid"
  | "integrity-mismatch"

export type InstalledToolVerification =
  | { ok: true; manifest: ToolManifest }
  | { ok: false; reason: InstalledToolVerificationFailure; detail: string }

/**
 * Riverifica la catena di trust di un tool GIÀ installato, sui byte salvati.
 * installTool verifica at-install; questo helper è la difesa post-install:
 * un write locale a manifest.json (id spostato, capability extra, contenuto
 * riscritto) non deve mai produrre un manifest trusted, né aggirare la
 * kill-list sull'id originale (il check manifest.id === toolId chiude
 * l'id-shift: la kill-list è indicizzata per toolId ma il runtime guarda
 * manifest.id).
 *
 * Catena: install.json parse → record.toolId === toolId → manifest parse →
 * manifest.id === toolId → firma ed25519 sui byte salvati (record.signature,
 * manifest.publisher.pubkey) → integrity.bundleSha256 === record.bundleHash
 * (solo se il manifest la impegna; manifest legacy senza integrity = nessun
 * impegno, back-compat come installTool).
 *
 * Limite dichiarato: la catena è auto-referenziale dentro lo store (la pubkey
 * sta nel manifest stesso) — un attaccante che riscrive in modo coerente
 * manifest + install.json non è rilevabile senza un trust anchor fuori dallo
 * store (publisher trust store / firma offline, fuori scope). Difende da
 * tamper parziale, id-shift e corruzione. Fail-closed, mai throw per tamper:
 * il chiamante decide la superficie d'errore (problems[], not-mountable, …).
 */
export async function verifyInstalledTool(
  store: InstallerStore,
  toolId: string,
): Promise<InstalledToolVerification> {
  if (!isValidToolId(toolId)) {
    return { ok: false, reason: "not-installed", detail: `invalid tool id: ${toolId}` }
  }
  const manifestBlob = await store.read(manifestPath(toolId))
  if (manifestBlob === null) {
    return { ok: false, reason: "not-installed", detail: `no manifest.json for "${toolId}"` }
  }
  const recordBlob = await store.read(installRecordPath(toolId))
  if (recordBlob === null) {
    return { ok: false, reason: "install-record-missing", detail: `no install.json for "${toolId}"` }
  }
  let record: InstallRecord
  try {
    record = InstallRecordSchema.parse(JSON.parse(await recordBlob.text()))
  } catch (error) {
    return { ok: false, reason: "install-record-invalid", detail: String(error) }
  }
  if (record.toolId !== toolId) {
    return {
      ok: false,
      reason: "record-id-mismatch",
      detail: `install.json is for "${record.toolId}", expected "${toolId}"`,
    }
  }
  const manifestJson = await manifestBlob.text()
  let manifest: ToolManifest
  try {
    manifest = ToolManifestSchema.parse(JSON.parse(manifestJson))
  } catch (error) {
    return { ok: false, reason: "manifest-invalid", detail: String(error) }
  }
  if (manifest.id !== toolId) {
    return {
      ok: false,
      reason: "manifest-id-mismatch",
      detail: `manifest.id is "${manifest.id}", expected "${toolId}" (id shift = kill-list bypass)`,
    }
  }
  let signatureOk = false
  try {
    const pubkeyBytes = extractPubkeyBytes(manifest.publisher.pubkey)
    const sigBytes = decodeSignature(record.signature)
    signatureOk = await verifyEd25519(new TextEncoder().encode(manifestJson), sigBytes, pubkeyBytes)
  } catch {
    signatureOk = false
  }
  if (!signatureOk) {
    return {
      ok: false,
      reason: "signature-invalid",
      detail: `stored manifest bytes do not verify against install.json signature for "${toolId}"`,
    }
  }
  if (manifest.integrity !== undefined && manifest.integrity.bundleSha256 !== record.bundleHash) {
    return {
      ok: false,
      reason: "integrity-mismatch",
      detail: `manifest commits to a bundle hash different from install.json bundleHash for "${toolId}"`,
    }
  }
  return { ok: true, manifest }
}
