// Determina se l'URL richiede il cruscotto docente (?vista=cruscotto):
// projection read-only del grafo LessonOS/event-log (TEACHER-DASHBOARD-SPEC).
// Separato in un file per testabilità (stesso pattern di isToolLabView).

/** Controlla se l'URL richiede la vista cruscotto docente. */
export function isTeacherDashboardView(): boolean {
  try {
    if (typeof window === "undefined") return false
    const url = new URL(window.location.href)
    return url.searchParams.get("vista") === "cruscotto"
  } catch {
    return false
  }
}
