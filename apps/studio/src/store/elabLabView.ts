// Determina se l'URL richiede l'ELAB Lab (?vista=elab-lab): la route di
// prodotto che monta il Simulation Plugin ELAB via renderEmbeddable()
// (canon ELAB-AS-PLUGIN §6, P0 accoppiato). Stesso pattern di isToolLabView.

/** Controlla se l'URL richiede la vista ELAB Lab. */
export function isElabLabView(): boolean {
  try {
    if (typeof window === "undefined") return false
    const url = new URL(window.location.href)
    return url.searchParams.get("vista") === "elab-lab"
  } catch {
    return false
  }
}
