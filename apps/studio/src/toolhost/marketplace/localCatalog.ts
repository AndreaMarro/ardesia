// P0-D marketplace LOCALE-FIRST — catalogo dei tool del workspace + preview
// di un package .maestrotool prima dell'install.
//
// Nessun canale privilegiato e nessun marketplace remoto: il catalogo legge
// SOLO ciò che la pipeline reale ha scritto (manifest verificati all'install
// da installTool, lifecycle di PluginManager). La preview verifica la firma
// ed25519 sugli STESSI byte che l'installer verificherebbe, così l'UI può
// marcare un package manomesso PRIMA di proporre l'install — la verifica
// autoritativa resta comunque quella di installTool.
//
// Fail-visible: un manifest illeggibile/fuori schema nel workspace finisce in
// problems[] col suo toolId — mai una entry sparita in silenzio.

import { z } from "zod"
import { ToolManifestSchema } from "../../toolhost-protocol/manifest.ts"
import type { ToolManifest } from "../../toolhost-protocol/manifest.ts"
import { listInstalledTools, verifyInstalledTool } from "../installer.ts"
import type { InstallerStore } from "../installer.ts"
import { PluginManager } from "../pluginManager.ts"
import type { PluginState } from "../pluginManager.ts"
import { readPluginPackage } from "../authoring/packageFile.ts"

export interface LocalCatalogEntry {
  toolId: string
  name: string
  version: string
  kind?: ToolManifest["kind"]
  author?: ToolManifest["author"]
  visibility?: ToolManifest["visibility"]
  license?: ToolManifest["license"]
  /** Stato lifecycle autoritativo (PluginManager.getState). */
  state: PluginState
}

export interface LocalCatalogProblem {
  toolId: string
  problem: string
}

export interface LocalCatalog {
  /** Entry ordinate per toolId: catalogo deterministico. */
  entries: LocalCatalogEntry[]
  /** Tool presenti ma illeggibili: VISIBILI, mai omessi in silenzio. */
  problems: LocalCatalogProblem[]
}

/** Costruisce il catalogo locale dai tool installati nel workspace. */
export async function buildLocalCatalog(store: InstallerStore): Promise<LocalCatalog> {
  const pm = new PluginManager(store)
  const entries: LocalCatalogEntry[] = []
  const problems: LocalCatalogProblem[] = []

  for (const toolId of (await listInstalledTools(store)).sort()) {
    // Reverify fail-closed (Codex P1.1): firma ed25519 sui byte salvati +
    // id match + install record. Un manifest alterato post-install finisce
    // in problems[] col motivo — mai una entry trusted.
    const verified = await verifyInstalledTool(store, toolId)
    if (!verified.ok) {
      problems.push({ toolId, problem: `${verified.reason}: ${verified.detail}` })
      continue
    }
    const manifest = verified.manifest
    entries.push({
      toolId,
      name: manifest.name,
      version: manifest.version,
      ...(manifest.kind !== undefined ? { kind: manifest.kind } : {}),
      ...(manifest.author !== undefined ? { author: manifest.author } : {}),
      ...(manifest.visibility !== undefined ? { visibility: manifest.visibility } : {}),
      ...(manifest.license !== undefined ? { license: manifest.license } : {}),
      state: await pm.getState(toolId),
    })
  }

  return { entries, problems }
}

// ---- Preview di un package (pre-install) ----

export interface PluginPackagePreview {
  manifest: ToolManifest
  /**
   * true = la firma nel package verifica contro publisher.pubkey sugli stessi
   * byte che installTool verificherebbe. false = package manomesso o firma di
   * un'altra chiave: l'UI DEVE marcarlo prima di proporre l'install.
   */
  signatureValid: boolean
}

function base64ToBytes(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
}

async function verifySignature(
  manifestJson: string,
  signatureB64: string,
  pubkey: string,
): Promise<boolean> {
  try {
    const prefix = "ed25519:"
    if (!pubkey.startsWith(prefix)) return false
    const pub = base64ToBytes(pubkey.slice(prefix.length))
    const keyData: ArrayBuffer = pub.buffer.slice(
      pub.byteOffset,
      pub.byteOffset + pub.byteLength,
    ) as ArrayBuffer
    const key = await crypto.subtle.importKey("raw", keyData, { name: "Ed25519" }, false, [
      "verify",
    ])
    const sig = base64ToBytes(signatureB64)
    const sigData: ArrayBuffer = sig.buffer.slice(
      sig.byteOffset,
      sig.byteOffset + sig.byteLength,
    ) as ArrayBuffer
    const msg = new TextEncoder().encode(manifestJson)
    const msgData: ArrayBuffer = msg.buffer.slice(
      msg.byteOffset,
      msg.byteOffset + msg.byteLength,
    ) as ArrayBuffer
    return await crypto.subtle.verify("Ed25519", key, sigData, msgData)
  } catch {
    return false
  }
}

/**
 * Apre un package v1 SENZA installarlo: manifest validato .strict (fuori
 * schema = throw, nessuna preview di roba malformata) + verifica firma sui
 * byte originali. L'install resta l'unico percorso che scrive nel workspace.
 */
export async function previewPluginPackage(pkg: Blob): Promise<PluginPackagePreview> {
  const parsed = await readPluginPackage(pkg)
  let manifest: ToolManifest
  try {
    manifest = ToolManifestSchema.parse(JSON.parse(parsed.manifestJson))
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`invalid plugin package manifest: ${error.issues[0]?.message ?? "schema"}`)
    }
    throw error
  }
  const signatureValid = await verifySignature(
    parsed.manifestJson,
    parsed.signatureB64,
    manifest.publisher.pubkey,
  )
  return { manifest, signatureValid }
}
