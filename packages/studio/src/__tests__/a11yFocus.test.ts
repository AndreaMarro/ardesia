// MAESTRO-Studio — S-UX-3: focus visibile da tastiera (WCAG 2.4.7).
// Verifica STRUTTURALE su index.css: ogni controllo interattivo ha una regola
// :focus-visible che disegna un anello con spessore e colore da token.

import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../index.css"), "utf8")

describe("S-UX-3: focus visibile (WCAG 2.4.7)", () => {
  // Controlli interattivi della shell, inclusi i non-<button> resi tabbabili.
  const controls = [
    "st-ghost",
    "st-primary",
    "st-chip",
    "st-menu-btn",
    "st-indicator-connect",
    "st-name",
    "st-card",
  ]

  it("ogni controllo interattivo ha una regola :focus-visible", () => {
    for (const c of controls) {
      // `:focus-visible` deve seguire ESATTAMENTE la classe: `.st-name:focus-visible`
      // non va soddisfatto da `.st-name-input:focus-visible` (substring).
      const re = new RegExp(`\\.${c}:focus-visible`)
      expect(re.test(css), `manca :focus-visible per .${c}`).toBe(true)
    }
  })

  it("le regole :focus-visible disegnano un outline visibile da token (mai outline:none)", () => {
    const blocks = css.match(/:focus-visible\s*\{[^}]*\}/g) ?? []
    expect(blocks.length).toBeGreaterThan(0)
    const joined = blocks.join("\n")
    // anello con spessore esplicito…
    expect(joined).toMatch(/outline:\s*\dpx/)
    // …colore d'accento da token (no hex)…
    expect(joined).toMatch(/var\(--m-accent\)/)
    // …distanziato dal bordo del controllo…
    expect(joined).toMatch(/outline-offset/)
    // …e MAI soppresso nel ramo di focus (regressione classica)
    expect(joined).not.toMatch(/outline:\s*none/)
  })
})
