// Tool Lab — install+gate del tool Reference attraverso la pipeline REALE
// (ARCHITECTURE-CANON §8: "wire della pipeline install→sign→…→lifecycle in una
// route reale"). Nessun bypass: firma ed25519 verificata da installTool sui
// byte originali del manifest, lifecycle PluginManager, kill-switch overlay.
//
// La firma avviene a runtime con la chiave DEV first-party già checked-in
// (sim/keys.json, stessa disciplina di sim/bundle.ts e del test E2E): comodità
// di sviluppo per il tool Reference. Un plugin di marketplace arriva già
// firmato offline dal publisher — questo modulo non è quel percorso.

import manifestSourceRaw from "../../sim/manifest-source.json?raw"
import entryHtml from "../../sim/entry.html?raw"
import keys from "../../sim/keys.json"
import { PluginManager } from "./pluginManager"
import { isToolInstalled, manifestPath } from "./installer"
import type { InstallerStore } from "./installer"
import { ToolManifestSchema } from "../toolhost-protocol/manifest.ts"
import type { ToolManifest } from "../toolhost-protocol/index.ts"

export interface ToolLabOptions {
  /** Override della firma (test: firma manomessa → fail-closed). */
  signatureB64?: string
  now?: () => number
}

export type ToolLabGateResult =
  | { ok: true; manifest: ToolManifest; entryHtml: string }
  | { ok: false; reason: "install-failed" | "not-mountable"; detail: string }

function base64ToBytes(b64: string): ArrayBuffer {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes.buffer
}

function bytesToBase64(bytes: ArrayBuffer): string {
  let bin = ""
  for (const b of new Uint8Array(bytes)) bin += String.fromCharCode(b)
  return btoa(bin)
}

/**
 * Manifest del Reference: i byte RAW checked-in, verbatim. Il pubkey del
 * manifest coincide già con sim/keys.json (che include il prefisso ed25519:);
 * la firma va calcolata su QUESTI byte, gli stessi che installTool verifica.
 */
function buildManifestJson(): string {
  return manifestSourceRaw
}

async function signManifest(manifestJson: string): Promise<string> {
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    base64ToBytes(keys.privateKey),
    { name: "Ed25519" },
    false,
    ["sign"],
  )
  const sig = await crypto.subtle.sign(
    "Ed25519",
    privateKey,
    new TextEncoder().encode(manifestJson),
  )
  return bytesToBase64(sig)
}

/**
 * Installa (se serve) e verifica la mountabilità del tool Reference.
 * Fail-closed: qualunque errore della pipeline (firma invalida, kill-list,
 * contract incompatibile) → { ok: false }, nessun artefatto parziale.
 */
export async function installAndGateReferenceTool(
  store: InstallerStore,
  opts: ToolLabOptions = {},
): Promise<ToolLabGateResult> {
  const pm = new PluginManager(store, opts.now)
  const manifestJson = buildManifestJson()
  const toolId = (JSON.parse(manifestJson) as { id: string }).id
  try {
    if (!(await isToolInstalled(store, toolId))) {
      const signature = opts.signatureB64 ?? (await signManifest(manifestJson))
      await pm.install(manifestJson, new Blob([entryHtml]), signature)
    }
  } catch (error) {
    return { ok: false, reason: "install-failed", detail: String(error) }
  }
  if (!(await pm.canMount(toolId))) {
    return { ok: false, reason: "not-mountable", detail: `plugin "${toolId}" non montabile (disabled o revocato)` }
  }
  // Fonte di verità = i byte installati (firmati), non la variabile locale.
  const installedBytes = await store.read(manifestPath(toolId))
  if (installedBytes === null) {
    return { ok: false, reason: "not-mountable", detail: `manifest di "${toolId}" assente post-install` }
  }
  const manifest = ToolManifestSchema.parse(JSON.parse(await installedBytes.text()))
  return { ok: true, manifest, entryHtml }
}
