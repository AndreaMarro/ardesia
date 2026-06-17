// MAESTRO-Studio — Vista studente
// Determina se l'URL contiene ?vista=studente.
// Separato in un file per testabilità: i test possono mockare questa funzione.

/** Nodo centrale: determinazione vista studente. Separata per testabilità. */
export function isStudentView(): boolean {
  try {
    if (typeof window === "undefined") return false
    const url = new URL(window.location.href)
    return url.searchParams.get("vista") === "studente"
  } catch {
    return false
  }
}
