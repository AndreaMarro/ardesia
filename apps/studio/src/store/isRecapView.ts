// MAESTRO-Studio — Vista recap (riepilogo lezione)
// Determina se l'URL contiene ?vista=recap.
// Separato in un file per testabilità.

/** Controlla se l'URL richiede la vista riepilogo lezione. */
export function isRecapView(): boolean {
  try {
    if (typeof window === "undefined") return false
    const url = new URL(window.location.href)
    return url.searchParams.get("vista") === "recap"
  } catch {
    return false
  }
}
