// Rotta della superficie di continuita' (?vista=continuita) e lettura
// osservativa dello scope dall'URL. Separato in un file per testabilita',
// stesso pattern di isTeacherDashboardView / isToolLabView.

import { validateRoomId } from "./roomPaths"

/** Controlla se l'URL richiede la superficie di continuita'. */
export function isContinuityView(): boolean {
  try {
    if (typeof window === "undefined") return false
    const url = new URL(window.location.href)
    return url.searchParams.get("vista") === "continuita"
  } catch {
    return false
  }
}

/**
 * Id della lezione da riprendere, letto dallo hash della stanza.
 *
 * `bootstrapLessonOs` fa `lessonId = validateRoomId(options.room)`
 * (bootstrap.ts:249): per una lezione live i due identificatori sono lo stesso
 * valore, quindi lo hash della stanza e' anche l'id lezione.
 *
 * Deliberatamente NON riusa `Room.getRoomId()`: quella funzione, quando lo hash
 * e' vuoto, ne genera uno nuovo e lo scrive in `location.hash`. Una superficie
 * che osserva non deve creare cio' che sta osservando - altrimenti mostrerebbe
 * "nessuna sessione" per una lezione che ha appena inventato lei.
 *
 * Restituisce `null` quando lo hash e' assente o non e' un room id valido: uno
 * scope assente e' uno stato da mostrare, non un errore da sollevare.
 */
export function continuityLessonIdFromLocation(): string | null {
  if (typeof window === "undefined") return null
  const hash = window.location.hash.replace(/^#/, "")
  if (hash === "") return null
  try {
    return validateRoomId(hash)
  } catch {
    return null
  }
}
