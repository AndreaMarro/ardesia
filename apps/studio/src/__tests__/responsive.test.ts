// MAESTRO-Studio — S-UX-3: responsive <=768px senza overflow orizzontale.
// Guardia strutturale sul blocco @media: hamburger al posto della toolbar,
// drawer a tutta larghezza, pannelli che non sforano la viewport, barra che
// taglia l'overflow. Blocca le regressioni che reintrodurrebbero lo scroll-X.

import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../index.css"), "utf8")

/** Corpo della media query <=768px, estratto bilanciando le graffe. */
function mediaBlock(): string {
  const i = css.indexOf("@media (max-width: 768px)")
  expect(i, "manca la media query <=768px").toBeGreaterThanOrEqual(0)
  const start = css.indexOf("{", i)
  let depth = 0
  for (let k = start; k < css.length; k++) {
    if (css[k] === "{") depth++
    else if (css[k] === "}") {
      depth--
      if (depth === 0) return css.slice(start, k + 1)
    }
  }
  throw new Error("media query non bilanciata")
}

describe("S-UX-3: responsive <=768px senza overflow", () => {
  const block = mediaBlock()

  it("l'hamburger compare e la toolbar desktop si nasconde", () => {
    expect(block).toMatch(/\.st-menu-btn\s*\{[^}]*display:\s*inline-flex/)
    expect(block).toMatch(/\.st-actions\s*\{[^}]*display:\s*none/)
  })

  it("il drawer diventa a tutta larghezza (niente pannello laterale che sfora)", () => {
    expect(block).toMatch(/\.st-drawer\s*\{[^}]*width:\s*100vw/)
  })

  it("il pannello formula non supera la viewport", () => {
    expect(block).toMatch(/\.st-composer-panel\s*\{[^}]*width:\s*calc\(100vw/)
  })

  it("la barra header taglia l'overflow orizzontale", () => {
    expect(block).toMatch(/\.st-bar\s*\{[^}]*overflow:\s*hidden/)
  })
})
