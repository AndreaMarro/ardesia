// Determina se l'URL richiede la vista "lezioni salvate"
// (?vista=lezioni-salvate): la route di prodotto che monta SavedLessonsPanel
// sul client LessonOS reale. Stesso pattern di isvista legacyView/isToolLabView.
//
// Configurazione fail-closed:
// - baseUrl: localStorage (override operativo) → VITE_LESSONOS_BASE_URL.
//   Nessun default inventato: senza baseUrl la vista NON fa fetch.
// - token: SOLO localStorage. MAI dall'URL — un token nella query string
//   finisce in cronologia, log del server e referrer (AUTH_STRICT resta gate).
// - room: parametro URL (identificatore di lezione, non sensibile).

export const LESSONOS_BASE_URL_STORAGE_KEY = "ardesia.lessonos.baseUrl"
export const LESSONOS_TOKEN_STORAGE_KEY = "ardesia.lessonos.token"

/** Controlla se l'URL richiede la vista lezioni salvate. */
export function isSavedLessonsView(): boolean {
  try {
    if (typeof window === "undefined") return false
    const url = new URL(window.location.href)
    return url.searchParams.get("vista") === "lezioni-salvate"
  } catch {
    return false
  }
}

export type SavedLessonsConfig = {
  baseUrl: string
  token?: string
  room?: string
}

/** Legge la configurazione LessonOS; null = non configurato (fail-closed). */
export function readSavedLessonsConfig(): SavedLessonsConfig | null {
  try {
    if (typeof window === "undefined") return null
    const stored = window.localStorage.getItem(LESSONOS_BASE_URL_STORAGE_KEY)
    const envBaseUrl = import.meta.env.VITE_LESSONOS_BASE_URL as string | undefined
    const baseUrl = stored !== null && stored !== "" ? stored : envBaseUrl
    if (baseUrl === undefined || baseUrl === "") return null

    const token = window.localStorage.getItem(LESSONOS_TOKEN_STORAGE_KEY) ?? undefined
    const room = new URL(window.location.href).searchParams.get("room") ?? undefined

    return {
      baseUrl,
      ...(token !== undefined && token !== "" ? { token } : {}),
      ...(room !== undefined && room !== "" ? { room } : {}),
    }
  } catch {
    return null
  }
}
