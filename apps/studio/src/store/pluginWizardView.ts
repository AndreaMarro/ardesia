// Determina se l'URL richiede l'Officina plugin (?vista=officina-plugin):
// wizard di authoring P0-D che genera, collauda ed esporta un plugin firmato.
// Separato in un file per testabilità (stesso pattern di isToolLabView).

/** Controlla se l'URL richiede la vista Officina plugin. */
export function isPluginWizardView(): boolean {
  try {
    if (typeof window === "undefined") return false
    const url = new URL(window.location.href)
    return url.searchParams.get("vista") === "officina-plugin"
  } catch {
    return false
  }
}
