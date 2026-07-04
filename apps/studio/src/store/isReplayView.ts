// MAESTRO-Studio — Vista replay (player della lezione registrata)
// Determina se l'URL contiene ?vista=replay.
// Separato in un file per testabilità (gemello di isRecapView.ts).

/** Controlla se l'URL richiede la vista replay della lezione. */
export function isReplayView(): boolean {
  try {
    if (typeof window === "undefined") return false
    const url = new URL(window.location.href)
    return url.searchParams.get("vista") === "replay"
  } catch {
    return false
  }
}
