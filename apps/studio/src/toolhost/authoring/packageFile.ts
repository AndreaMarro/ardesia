// P0-D authoring — PluginPackage v1: UN file .maestrotool condivisibile che
// contiene tutto ciò che serve all'install:
//
//   manifest.json   — byte ESATTI firmati dal publisher (mai re-serializzati)
//   signature.b64   — firma ed25519 base64 del manifest
//   <tutto il resto> — file del bundle (entry.html + eventuali asset)
//
// Il package NON è un canale privilegiato: installPluginPackage ricostruisce i
// tre argomenti e passa dalla pipeline REALE PluginManager.install (firma
// verificata, kill-list, contract gate, lifecycle). Un package manomesso
// fallisce esattamente come fallirebbe l'install manuale.

import { PluginManager } from "../pluginManager.ts"
import type { InstallerStore } from "../installer.ts"
import type { ToolManifest } from "../../toolhost-protocol/index.ts"
import { buildStoreZip, readStoreZip } from "./storeZip.ts"
import type { ZipEntry } from "./storeZip.ts"

export const PACKAGE_MANIFEST_PATH = "manifest.json"
export const PACKAGE_SIGNATURE_PATH = "signature.b64"

export interface PluginPackageSource {
  manifestJson: string
  signatureB64: string
  entryHtml: string
}

export interface ParsedPluginPackage {
  manifestJson: string
  signatureB64: string
  /** File del bundle (tutto tranne manifest e firma), ordine del package. */
  bundleFiles: ZipEntry[]
}

/** Impacchetta un output dello scaffolder in un singolo file package v1. */
export function buildPluginPackage(source: PluginPackageSource): Blob {
  const encoder = new TextEncoder()
  const zipBytes = buildStoreZip([
    { path: PACKAGE_MANIFEST_PATH, data: encoder.encode(source.manifestJson) },
    { path: PACKAGE_SIGNATURE_PATH, data: encoder.encode(source.signatureB64) },
    { path: "entry.html", data: encoder.encode(source.entryHtml) },
  ])
  const buffer: ArrayBuffer = zipBytes.buffer.slice(
    zipBytes.byteOffset,
    zipBytes.byteOffset + zipBytes.byteLength,
  ) as ArrayBuffer
  return new Blob([buffer], { type: "application/zip" })
}

/**
 * Apre un package v1. Fail-closed: zip non store-only/corrotto/ZipSlip
 * rifiutati dal reader; manifest o firma assenti = errore esplicito.
 * Il manifest resta una STRINGA di byte esatti: la verifica di firma a valle
 * è sui byte originali, mai su un oggetto re-serializzato.
 */
export async function readPluginPackage(pkg: Blob): Promise<ParsedPluginPackage> {
  const bytes = new Uint8Array(await pkg.arrayBuffer())
  const entries = readStoreZip(bytes)

  const decoder = new TextDecoder()
  let manifestJson: string | null = null
  let signatureB64: string | null = null
  const bundleFiles: ZipEntry[] = []

  for (const entry of entries) {
    if (entry.path === PACKAGE_MANIFEST_PATH) {
      manifestJson = decoder.decode(entry.data)
    } else if (entry.path === PACKAGE_SIGNATURE_PATH) {
      signatureB64 = decoder.decode(entry.data).trim()
    } else {
      bundleFiles.push(entry)
    }
  }

  if (manifestJson === null) {
    throw new Error(`invalid plugin package: ${PACKAGE_MANIFEST_PATH} missing`)
  }
  if (signatureB64 === null) {
    throw new Error(`invalid plugin package: ${PACKAGE_SIGNATURE_PATH} missing`)
  }

  return { manifestJson, signatureB64, bundleFiles }
}

/**
 * Installa da package v1 attraverso la pipeline reale. Il bundle zip viene
 * ricostruito dai file del package (store-only, deterministico) e consegnato
 * a PluginManager.install: firma, kill-list, contract gate e lifecycle sono
 * quelli di sempre.
 */
export async function installPluginPackage(
  store: InstallerStore,
  pkg: Blob,
  now?: () => number,
): Promise<ToolManifest> {
  const parsed = await readPluginPackage(pkg)
  const bundleBytes = buildStoreZip(parsed.bundleFiles)
  const bundleBuffer: ArrayBuffer = bundleBytes.buffer.slice(
    bundleBytes.byteOffset,
    bundleBytes.byteOffset + bundleBytes.byteLength,
  ) as ArrayBuffer
  const bundleZip = new Blob([bundleBuffer], { type: "application/zip" })

  const pm = new PluginManager(store, now)
  return pm.install(parsed.manifestJson, bundleZip, parsed.signatureB64)
}
