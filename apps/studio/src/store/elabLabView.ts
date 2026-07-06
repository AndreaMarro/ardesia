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

/** Esperimento di default della vista (il primo del libro, Vol.1 cap.6). */
export const ELAB_LAB_DEFAULT_EXPERIMENT_ID = "v1-cap6-esp1"

/**
 * Legge l'esperimento richiesto dall'URL (?esperimento=<id>); senza
 * parametro si usa il default. La VALIDAZIONE dell'id è della vista
 * (fail-closed su id ignoto), non di questo reader.
 */
export function readElabLabExperimentId(): string {
  try {
    if (typeof window === "undefined") return ELAB_LAB_DEFAULT_EXPERIMENT_ID
    const value = new URL(window.location.href).searchParams.get("esperimento")
    return value === null || value === "" ? ELAB_LAB_DEFAULT_EXPERIMENT_ID : value
  } catch {
    return ELAB_LAB_DEFAULT_EXPERIMENT_ID
  }
}
