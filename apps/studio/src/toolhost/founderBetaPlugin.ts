import { manifest as simulationManifest } from "../../plugins/simulation/manifest.ts"

/**
 * Etichetta di provenienza, NON esito di una verifica crittografica a runtime.
 * Dichiara due fatti veri e verificabili: il plugin è compilato dentro il
 * bundle Studio (quindi legato al commit SHA completo che il bundle espone) ed
 * è passato dalla review umana della Founder Beta. Non dichiara che una firma
 * del manifest o un digest del bundle siano stati verificati al mount: quel
 * confine non esiste ancora, perché in Founder Beta non c'è alcun percorso di
 * caricamento remoto da cui difendersi — l'allowlist è chiusa e il manifest è
 * un import in-process. Quando il loader ToolHost verificherà firma e digest,
 * questa costante deve sparire e il tier va derivato da quell'esito.
 */
export const FOUNDER_BETA_PLUGIN_TRUST_TIER = "builtin-reviewed" as const
const FOUNDER_BETA_PUBLISHER = Object.freeze({
  id: "maestro-sdk",
  pubkey: "ed25519:Jr4+9LNWwK1Mxs6qCzr+qgLZI72pbGZaXEZ87HALHFk=",
})

function assertFounderBetaPluginBoundary(): void {
  const capabilities = simulationManifest.capabilities
  const publisherKey = simulationManifest.publisher.pubkey

  if (simulationManifest.id !== "io.ardesia.simulation") {
    throw new Error("Founder Beta plugin id non autorizzato")
  }
  if (simulationManifest.kind !== "plugin") {
    throw new Error("Founder Beta capability non classificata come plugin")
  }
  if (simulationManifest.privacy.dataOut !== "none") {
    throw new Error("Founder Beta plugin con uscita dati non autorizzata")
  }
  if (capabilities["net.fetch"] !== undefined || capabilities["llm.generate"] !== undefined) {
    throw new Error("Founder Beta plugin con capability remota non autorizzata")
  }
  if (capabilities["board.write"]?.scope !== "own-embeds") {
    throw new Error("Founder Beta plugin deve scrivere soltanto nei propri embed")
  }
  if (
    simulationManifest.publisher.id !== FOUNDER_BETA_PUBLISHER.id
    || publisherKey !== FOUNDER_BETA_PUBLISHER.pubkey
  ) {
    throw new Error("Founder Beta plugin con publisher first-party non autorizzato")
  }
}

assertFounderBetaPluginBoundary()

/**
 * Allowlist chiusa della Founder Beta. Il plugin è parte del bundle Studio e
 * viene quindi legato allo SHA completo del producer in export/eventi; non
 * abilita catalogo, marketplace o caricamento di codice remoto.
 */
export const FOUNDER_BETA_PLUGINS = Object.freeze([
  Object.freeze({
    id: simulationManifest.id,
    version: simulationManifest.version,
    trustTier: FOUNDER_BETA_PLUGIN_TRUST_TIER,
    manifest: simulationManifest,
  }),
] as const)

export const FOUNDER_BETA_PLUGIN = FOUNDER_BETA_PLUGINS[0]
