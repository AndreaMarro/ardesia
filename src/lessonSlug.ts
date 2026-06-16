/** Slug per il filename di export .lesson.
 *
 * Deriva uno slug ASCII (a-z0-9 con trattini) dal nome lezione. Se il nome
 * non produce alcun carattere utile (vuoto, soli simboli, solo spazi) ricade
 * sul fallback (il room id) — così il download non diventa mai `lezione-.lesson`.
 * Lo strip dei trattini di bordo avviene PRIMA del taglio (come la logica
 * inline originale, così un nome lungo che inizia con spazio/trattino non
 * perde un carattere utile), poi un secondo strip toglie il trattino finale
 * che il taglio a 48 char può lasciare a metà parola.
 */
export function lessonSlug(name: string, fallback: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48)
    .replace(/-$/, "")
  return slug || fallback
}
