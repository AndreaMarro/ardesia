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
import { emojiOf } from "./emojiGuard"

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
