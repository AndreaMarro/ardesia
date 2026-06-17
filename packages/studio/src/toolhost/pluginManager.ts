// TOOLHOST-SPEC-v0 §2/§3 — lifecycle di un plugin installato, vincolato al
// contratto SDK Layer-0 (src/sdk). Unifica i mattoni già esistenti in UN'unica
// autorità di lifecycle:
//   - install/uninstall  → installer.ts (firma ed25519, audit preservato)
//   - enabled (a runtime) → lifecycle.json per-tool, NUOVO qui
//   - kill-switch         → killList.ts (overlay: vince sempre su `enabled`)
//
// Stati (fonte di verità unica = getState):
//   not-installed  — nessun manifest.json
//   disabled       — installato, intento `enabled=false` (o mai espresso)
//   enabled        — installato, `enabled=true`, NON revocato
//   revoked        — installato MA nella kill-list (il kill-switch oscura l'intento)
//
// Il kill-switch è un OVERLAY non distruttivo: revocare non cancella l'intento
// `enabled`; rimuovere dalla kill-list ripristina lo stato precedente. Questo
// tiene separate due decisioni distinte — "il docente lo vuole acceso?" (enabled)
// e "è sicuro eseguirlo?" (kill-switch) — come la spec §3 richiede.

import { z } from "zod"
import { isValidToolId } from "../toolhost-protocol/index.ts"
import type { ToolManifest } from "../toolhost-protocol/index.ts"
import { CONTRACT_VERSION } from "../sdk/index.ts"
import {
  installTool,
  uninstallTool,
  isToolInstalled,
  listInstalledTools,
} from "./installer.ts"
import type { InstallerStore } from "./installer.ts"
import { assertNotKilled, checkKillList } from "./killList.ts"

export type PluginState = "not-installed" | "disabled" | "enabled" | "revoked"

/** Documento di lifecycle per-tool. Schema versionato (AGENTS §4). */
export const LifecycleDocSchema = z.strictObject({
  v: z.literal(1),
  /** Intento del docente: il plugin deve poter essere montato? */
  enabled: z.boolean(),
  /** Epoch ms dell'ultima transizione enable/disable. */
  t: z.number().int().nonnegative(),
})
export type LifecycleDoc = z.infer<typeof LifecycleDocSchema>

export function lifecyclePath(toolId: string): string {
  if (!isValidToolId(toolId)) throw new Error(`invalid tool id: ${toolId}`)
  return `tools/${toolId}/lifecycle.json`
}

/**
 * Orchestratore del lifecycle di un plugin sul confine SDK Layer-0.
 *
 * Una istanza per workspace store. `contractVersion` lega questo manager alla
 * versione del contratto SDK con cui i plugin sono compilati: un registro può
 * interrogarla per rifiutare un plugin incompatibile PRIMA dell'install.
 */
export class PluginManager {
  /** Versione del contratto SDK Layer-0 onorato da questo manager (SemVer). */
  static readonly contractVersion = CONTRACT_VERSION

  private readonly store: InstallerStore
  private readonly _now: () => number

  constructor(store: InstallerStore, now: () => number = () => Date.now()) {
    this.store = store
    this._now = now
  }

  /**
   * Installa un plugin (delega a installTool: firma ed25519 + kill-list + Zod)
   * e lo marca `enabled` di default — un plugin appena installato dal docente è
   * pronto per essere montato. La scrittura del lifecycle avviene SOLO dopo che
   * l'install è riuscito: un install fallito non lascia un lifecycle orfano.
   */
  async install(manifestJson: string, bundleZip: Blob, signatureB64: string): Promise<ToolManifest> {
    const manifest = await installTool(this.store, manifestJson, bundleZip, signatureB64, this._now)
    await this._writeLifecycle(manifest.id, true)
    return manifest
  }

  /**
   * Disinstalla un plugin: artefatti + lifecycle rimossi, audit-log PRESERVATO
   * (installer.ts §2). Idempotente sui path mancanti (store.delete no-op).
   */
  async uninstall(toolId: string): Promise<void> {
    await uninstallTool(this.store, toolId)
    await this.store.delete(lifecyclePath(toolId))
  }

  /**
   * Abilita un plugin installato. Il kill-switch VINCE: un plugin revocato non
   * può essere abilitato (assertNotKilled throw) — riabilitarlo richiede prima
   * removeFromKillList. Throw se non installato.
   */
  async enable(toolId: string): Promise<void> {
    await this._requireInstalled(toolId)
    await assertNotKilled(this.store, toolId)
    await this._writeLifecycle(toolId, true)
  }

  /**
   * Disabilita un plugin installato (intento `enabled=false`). Consentito anche
   * su un plugin revocato: spegnere l'intento è sempre lecito e persiste oltre
   * la rimozione dalla kill-list. Throw se non installato.
   */
  async disable(toolId: string): Promise<void> {
    await this._requireInstalled(toolId)
    await this._writeLifecycle(toolId, false)
  }

  /**
   * Stato unico e autoritativo del plugin. Ordine di precedenza:
   * not-installed → revoked (kill-switch) → enabled/disabled (intento).
   *
   * Questa precedenza a READ-TIME è la GARANZIA di sicurezza, non l'ordine delle
   * write: enable() (assertNotKilled poi write) e addToKillList() non sono
   * serializzati tra loro, quindi una enable può "vincere" la corsa e lasciare
   * enabled=true su un tool già nella kill-list. È innocuo perché qui `revoked`
   * precede `enabled`: il kill-switch oscura sempre l'intento alla lettura.
   */
  async getState(toolId: string): Promise<PluginState> {
    if (!isValidToolId(toolId)) return "not-installed"
    if (!(await isToolInstalled(this.store, toolId))) return "not-installed"
    if (await checkKillList(this.store, toolId)) return "revoked"
    return (await this._readEnabled(toolId)) ? "enabled" : "disabled"
  }

  /** Gate runtime: il plugin può essere montato (ToolFrame) solo se enabled. */
  async canMount(toolId: string): Promise<boolean> {
    return (await this.getState(toolId)) === "enabled"
  }

  /** Lista i plugin installati con il loro stato di lifecycle (UI docente). */
  async list(): Promise<{ toolId: string; state: PluginState }[]> {
    const ids = await listInstalledTools(this.store)
    const out: { toolId: string; state: PluginState }[] = []
    for (const id of ids) {
      out.push({ toolId: id, state: await this.getState(id) })
    }
    return out
  }

  private async _requireInstalled(toolId: string): Promise<void> {
    if (!(await isToolInstalled(this.store, toolId))) {
      throw new Error(`tool "${toolId}" is not installed`)
    }
  }

  /**
   * Legge l'intento `enabled`. Lifecycle mancante = fail-safe DISABLED: un plugin
   * il cui intento non è stato espresso (install diretto via installer, o write
   * parziale) NON parte da solo. Un lifecycle corrotto è BLOCCANTE (mai trattare
   * spazzatura come "acceso", AGENTS §3).
   */
  private async _readEnabled(toolId: string): Promise<boolean> {
    const blob = await this.store.read(lifecyclePath(toolId))
    if (blob === null) return false
    let doc: LifecycleDoc
    try {
      doc = LifecycleDocSchema.parse(JSON.parse(await blob.text()))
    } catch {
      throw new Error(`corrupted lifecycle state: ${lifecyclePath(toolId)}`)
    }
    return doc.enabled
  }

  private async _writeLifecycle(toolId: string, enabled: boolean): Promise<void> {
    const doc: LifecycleDoc = { v: 1, enabled, t: this._now() }
    await this.store.write(
      lifecyclePath(toolId),
      new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" }),
    )
  }
}
