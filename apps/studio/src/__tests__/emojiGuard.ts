// MAESTRO-Studio — guard anti-emoji condiviso (test-only helper).
// Fonte UNICA di verita' per "questa stringa contiene un emoji pittografico?".
// Prima esisteva una EMOJI_RE duplicata in 4 file di test, piu' debole e flaggata
// da eslint (no-misleading-character-class): trattava i glifi tipografici
// funzionali ☰ ✕ ✓ ⚠ (blocco 0x2600-0x27BF) come emoji e ignorava i pittogrammi
// legacy © ® ™ ⬛ ⭐. Questo modulo itera i code point (no character-class) e
// rispetta l'allowlist tipografica, cosi' i test condividono la stessa semantica
// del gate S-UX-1 (no-emoji.test.ts).
//
// SCOPE: emoji = pittogrammi a presentazione colorata. I glifi tipografici
// monocromi usati come icone funzionali (☰ ✕ ● ✓ ⚠ → ⇒ ↔) NON sono emoji.

// Glifi tipografici monocromi usati come icone funzionali: NON sono emoji.
const TYPOGRAPHIC_GLYPHS = new Set([
  0x2630, // ☰ TRIGRAM FOR HEAVEN (hamburger)
  0x2715, // ✕ MULTIPLICATION X (chiudi)
  0x2713, // ✓ CHECK MARK (testuale)
  0x26a0, // ⚠ WARNING SIGN (testuale, senza VS-16)
])

/** Un code point e' emoji pittografico? */
export function isEmojiCodePoint(cp: number): boolean {
  // Glifi tipografici esplicitamente ammessi.
  if (TYPOGRAPHIC_GLYPHS.has(cp)) return false
  // Piano emoji/pittogrammi/trasporti/simboli supplementari + bandiere regionali.
  if (cp >= 0x1f000 && cp <= 0x1faff) return true
  // Simboli vari + Dingbats: in larga parte a presentazione emoji di default
  // (⚡⛔⚽🔔✅❌…), inclusi quelli SENZA VS-16. Si bandisce l'intero blocco,
  // tranne i pochi glifi tipografici sopra.
  if (cp >= 0x2600 && cp <= 0x27bf) return true
  // Variation Selector-16 (presentazione emoji) e Combining Enclosing Keycap.
  if (cp === 0xfe0f || cp === 0x20e3) return true
  // Pittogrammi sparsi fuori dai blocchi sopra.
  const LEGACY_EMOJI = new Set([
    0x00a9, 0x00ae, 0x2122, // © ® ™
    0x203c, 0x2049, // ‼ ⁉
    0x2b00, 0x2b1b, 0x2b1c, 0x2b50, 0x2b55, // ⬀ ⬛ ⬜ ⭐ ⭕
    0x231a, 0x231b, 0x2328, 0x23cf, 0x24c2, 0x25fb, 0x25fc, 0x25fd, 0x25fe,
  ])
  return LEGACY_EMOJI.has(cp)
}

/** Code point emoji presenti in una stringa, con posizione preservata. */
export function emojiOf(text: string): string[] {
  const hits: string[] = []
  for (const ch of text) {
    const cp = ch.codePointAt(0)!
    if (isEmojiCodePoint(cp)) hits.push(ch)
  }
  return hits
}

/** True se la stringa contiene almeno un emoji pittografico. */
export function hasEmoji(text: string): boolean {
  return emojiOf(text).length > 0
}
