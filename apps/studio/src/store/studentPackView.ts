// Vista di chi RICEVE uno student pack (?vista=pack).
// Separata in un file come le altre viste, cosi' i test possono mockarla e
// App.tsx resta il solo router.

/** Controlla se l'URL richiede la vista "apri il pack che ho ricevuto". */
export function isStudentPackView(): boolean {
  try {
    if (typeof window === "undefined") return false
    const url = new URL(window.location.href)
    return url.searchParams.get("vista") === "pack"
  } catch {
    return false
  }
}
