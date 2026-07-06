// Tool Lab — install+gate del tool Reference attraverso la pipeline REALE
// (ARCHITECTURE-CANON §8: "wire della pipeline install→sign→…→lifecycle in una
// route reale"). Nessun bypass: firma ed25519 verificata da installTool sui
// byte originali del manifest, lifecycle PluginManager, kill-switch overlay.
//
// La firma del Reference è una FIXTURE PREFIRMATA (sim/manifest.sig.json,
// prodotta offline da sim/bundle.ts sui byte esatti di manifest-source.json):
// nessuna chiave privata nel repo né nel bundle client (Codex P1.3, guard
// statico in DevKeySecretGuard.test.ts). Un plugin di marketplace arriva
// firmato offline dal publisher — questo percorso ne replica la disciplina.

import manifestSourceRaw from "../../sim/manifest-source.json?raw"
import entryHtml from "../../sim/entry.html?raw"
import manifestSig from "../../sim/manifest.sig.json"
import { PluginManager } from "./pluginManager"
import { isToolInstalled, verifyInstalledTool } from "./installer"
import type { InstallerStore } from "./installer"
import type { ToolManifest } from "../toolhost-protocol/index.ts"

export interface ToolLabOptions {
  /** Override della firma (test: firma manomessa → fail-closed). */
  signatureB64?: string
  now?: () => number
}

export type ToolLabGateResult =
  | { ok: true; manifest: ToolManifest; entryHtml: string }
  | { ok: false; reason: "install-failed" | "not-mountable"; detail: string }

/**
 * Manifest del Reference: i byte RAW checked-in, verbatim. La fixture
 * sim/manifest.sig.json è la firma ed25519 di QUESTI byte (gli stessi che
 * installTool verifica) con la chiave del publisher dev — la firma è dato
 * pubblico, la chiave privata che l'ha prodotta non è nel repo.
 */
function buildManifestJson(): string {
  return manifestSourceRaw
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
      const signature = opts.signatureB64 ?? manifestSig.signatureB64
      await pm.install(manifestJson, new Blob([entryHtml]), signature)
    }
  } catch (error) {
    return { ok: false, reason: "install-failed", detail: String(error) }
  }
  if (!(await pm.canMount(toolId))) {
    return { ok: false, reason: "not-mountable", detail: `plugin "${toolId}" non montabile (disabled o revocato)` }
  }
  // Fonte di verità = i byte installati RIVERIFICATI (Codex P1.1): firma
  // ed25519 sui byte salvati + id match + install record. Un manifest.json
  // alterato post-install non è mai trusted (id-shift = bypass kill-list).
  const verified = await verifyInstalledTool(store, toolId)
  if (!verified.ok) {
    return {
      ok: false,
      reason: "not-mountable",
      detail: `installed artifacts di "${toolId}" non verificati (${verified.reason}): ${verified.detail}`,
    }
  }
  return { ok: true, manifest: verified.manifest, entryHtml }
}
