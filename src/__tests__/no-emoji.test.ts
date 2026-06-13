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

/** Un code point è emoji pittografico? */
function isEmojiCodePoint(cp: number): boolean {
  // Piano emoji/pittogrammi/trasporti/simboli supplementari + bandiere regionali.
  if (cp >= 0x1f000 && cp <= 0x1faff) return true
  // Variation Selector-16: forza la presentazione emoji di un carattere base.
  if (cp === 0xfe0f) return true
  // Pittogrammi del BMP che NON sono glifi tipografici monocromi.
  const LEGACY_EMOJI = new Set([
    0x2705, 0x274c, 0x274e, 0x2714, 0x2716, 0x2728, 0x2b50, 0x2b55,
    0x2753, 0x2754, 0x2755, 0x2757, 0x203c, 0x2049, 0x231a, 0x231b,
    0x23f0, 0x23f3, 0x1f004,
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
    expect(emojiOf("warning ⚠️")).toEqual(["⚠️".charAt(1)]) // il VS-16, non il triangolo base
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
