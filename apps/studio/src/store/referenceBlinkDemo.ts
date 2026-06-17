// MAESTRO-Studio — Vista demo Reference Sim (S-DESIGN-10)
// Determina se l'URL richiede la demo del primo tool del marketplace
// (?demo=reference-blink): la lavagna monta il tool Reference Sim via ToolHost.
// Separato in un file per testabilità (i test mockano window.location).

/** Controlla se l'URL richiede la demo Reference Blink (?demo=reference-blink). */
export function isReferenceBlinkDemo(): boolean {
  try {
    if (typeof window === "undefined") return false
    const url = new URL(window.location.href)
    return url.searchParams.get("demo") === "reference-blink"
  } catch {
    return false
  }
}
