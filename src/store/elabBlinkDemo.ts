// MAESTRO-Studio — Vista demo ELAB Sim (S-DESIGN-10)
// Determina se l'URL richiede la demo del primo tool del marketplace
// (?demo=elab-blink): la lavagna monta il tool ELAB Sim via ToolHost.
// Separato in un file per testabilità (i test mockano window.location).

/** Controlla se l'URL richiede la demo ELAB Blink (?demo=elab-blink). */
export function isElabBlinkDemo(): boolean {
  try {
    if (typeof window === "undefined") return false
    const url = new URL(window.location.href)
    return url.searchParams.get("demo") === "elab-blink"
  } catch {
    return false
  }
}
