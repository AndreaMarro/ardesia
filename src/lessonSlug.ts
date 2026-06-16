/** Slug per il filename di export .lesson.
 *
 * Deriva uno slug ASCII (a-z0-9 con trattini) dal nome lezione. Se il nome
 * non produce alcun carattere utile (vuoto, soli simboli, solo spazi) ricade
 * sul fallback (il room id) — così il download non diventa mai `lezione-.lesson`.
 * Lo strip dei trattini è applicato DOPO il taglio a 48 char, così un taglio a
 * metà parola non lascia un trattino finale.
 */
export function lessonSlug(name: string, fallback: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48)
    .replace(/^-|-$/g, "")
  return slug || fallback
}
