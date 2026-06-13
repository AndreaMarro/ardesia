// MAESTRO-Studio — S-UX-1: nessun emoji nei sorgenti UI.
// Legge i SORGENTI da disco e fallisce se qualcuno reintroduce un emoji pittografico
// (🎤 🔴 📦 ✅ ❌ …) in una stringa utente o in un commento di src/.
// SCOPE: emoji = pittogrammi a presentazione colorata. I glifi tipografici monocromi
// usati come icone funzionali (☰ ✕ ● ✓ ⚠ → ⇒ ↔) NON sono emoji e restano ammessi:
// hanno un test dedicato (design-tokens.test.ts §S-DESIGN-4, SDesign7.test.tsx).

import { describe, it, expect } from "vitest"
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..")

/** File UI sotto src/ (ricorsivo), esclusi i test stessi e node_modules. */
function walkUi(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) {
      if (name === "__tests__" || name === "node_modules") continue
      walkUi(p, out)
    } else if (/\.(tsx?|css|html)$/.test(name)) {
      out.push(p)
    }
  }
  return out
}

// Glifi tipografici monocromi usati come icone funzionali: NON sono emoji.
// (☰ men hamburger, ✕ chiusura, ✓ check, ⚠ alert testuale — vedi commento in testa)
const TYPOGRAPHIC_GLYPHS = new Set([
  0x2630, // ☰ TRIGRAM FOR HEAVEN (hamburger)
  0x2715, // ✕ MULTIPLICATION X (chiudi)
  0x2713, // ✓ CHECK MARK (testuale)
  0x26a0, // ⚠ WARNING SIGN (testuale, senza VS-16)
])

/** Un code point è emoji pittografico? */
function isEmojiCodePoint(cp: number): boolean {
  // Glifi tipografici esplicitamente ammessi.
  if (TYPOGRAPHIC_GLYPHS.has(cp)) return false
  // Piano emoji/pittogrammi/trasporti/simboli supplementari + bandiere regionali.
  if (cp >= 0x1f000 && cp <= 0x1faff) return true
  // Simboli vari + Dingbats: in larga parte a presentazione emoji di default
  // (⚡⛔⚽🔔✅❌…), inclusi quelli SENZA VS-16. Si bandisce l'intero blocco,
  // tranne i pochi glifi tipografici sopra: un anti-emoji guard non vuole
  // nemmeno ★♠♥ nella UI, e l'allowlist resta esplicita.
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

/** Code point emoji presenti in una riga, con posizione. */
function emojiOf(line: string): string[] {
  const hits: string[] = []
  for (const ch of line) {
    const cp = ch.codePointAt(0)!
    if (isEmojiCodePoint(cp)) hits.push(ch)
  }
  return hits
}

describe("S-UX-1 — zero emoji nei sorgenti UI", () => {
  it("il matcher riconosce gli emoji e ignora i glifi tipografici (non vacuo)", () => {
    // Se questo fallisce, il test sotto sarebbe vacuamente verde.
    expect(emojiOf("microfono 🎤 e led 🔴 e pacco 📦")).toEqual(["🎤", "🔴", "📦"])
    expect(emojiOf("ok ✅ no ❌")).toEqual(["✅", "❌"])
    // Emoji a presentazione-default del blocco 0x2600, SENZA VS-16 (buco trovato dal red-team).
    expect(emojiOf("⚡ ⛔ ⚽ 🔔")).toEqual(["⚡", "⛔", "⚽", "🔔"])
    expect(emojiOf("© ® ™")).toEqual(["©", "®", "™"])
    // Il triangolo ⚠ con VS-16 è emoji (catturo il VS-16); il triangolo nudo no.
    expect(emojiOf("warning ⚠️")).toEqual(["⚠️".charAt(1)])
    // Glifi funzionali ammessi: nessun match.
    expect(emojiOf("☰ ✕ ● ✓ ⚠ → ⇒ ↔ ←")).toEqual([])
  })

  it("nessun emoji in alcun file .ts/.tsx/.css/.html di src/", () => {
    const offenders: string[] = []
    for (const p of walkUi(SRC)) {
      const lines = readFileSync(p, "utf8").split("\n")
      lines.forEach((line, i) => {
        const hits = emojiOf(line)
        if (hits.length) offenders.push(`${p}:${i + 1} → ${hits.join(" ")}`)
      })
    }
    expect(offenders).toEqual([])
  })
})
