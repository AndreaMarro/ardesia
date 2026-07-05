// Determina se l'URL richiede il Tool Lab (?vista=tool-lab): la route di
// prodotto che monta il tool Reference via pipeline firmata (toolhost/toolLab).
// Separato in un file per testabilità (stesso pattern di isReplayView).

/** Controlla se l'URL richiede la vista Tool Lab. */
export function isToolLabView(): boolean {
  try {
    if (typeof window === "undefined") return false
    const url = new URL(window.location.href)
    return url.searchParams.get("vista") === "tool-lab"
  } catch {
    return false
  }
}
