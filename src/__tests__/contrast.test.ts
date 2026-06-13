// MAESTRO-Studio — S-UX-3: contrasto testo WCAG AA (>=4.5:1).
// Calcola il rapporto di contrasto reale dai token in tokens.css e impone la
// soglia AA per ogni livello di inchiostro testuale su carta e canvas.

import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../tokens.css"), "utf8")

/** Estrae il valore hex a 6 cifre del token (errore se assente/non-hex). */
function hex(name: string): string {
  // confine destro `(?![\w-])`: `--m-ink` non deve catturare `--m-ink-2`
  const m = css.match(new RegExp(`${name}(?![\\w-])\\s*:\\s*(#[0-9a-fA-F]{6})`))
  if (!m) throw new Error(`token ${name} non trovato come hex a 6 cifre`)
  return m[1]
}

function lin(c8: number): number {
  const s = c8 / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

function luminance(h: string): number {
  const r = parseInt(h.slice(1, 3), 16)
  const g = parseInt(h.slice(3, 5), 16)
  const b = parseInt(h.slice(5, 7), 16)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function ratio(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  const hi = Math.max(la, lb)
  const lo = Math.min(la, lb)
  return (hi + 0.05) / (lo + 0.05)
}

describe("S-UX-3: contrasto testo WCAG AA", () => {
  const paper = hex("--m-paper")
  const canvas = hex("--m-canvas")
  const blue = hex("--m-blue")

  it("ogni livello di inchiostro testuale supera 4.5:1 su carta e canvas", () => {
    for (const ink of ["--m-ink", "--m-ink-2", "--m-ink-3", "--m-ink-4"]) {
      const c = hex(ink)
      expect(ratio(c, paper), `${ink} su --m-paper`).toBeGreaterThanOrEqual(4.5)
      expect(ratio(c, canvas), `${ink} su --m-canvas`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it("il blu brand come testo-link ('scegli cartella…') supera 4.5:1 su carta", () => {
    expect(ratio(blue, paper)).toBeGreaterThanOrEqual(4.5)
  })

  it("il testo del bottone primario (canvas su accent=blue) supera 4.5:1", () => {
    expect(ratio(canvas, blue)).toBeGreaterThanOrEqual(4.5)
  })

  it("il rosso d'errore supera 4.5:1 su carta", () => {
    expect(ratio(hex("--m-error"), paper)).toBeGreaterThanOrEqual(4.5)
  })

  it("la metrica boccia un contrasto insufficiente (guardia non-vacua)", () => {
    // un grigio chiaro DEVE fallire la soglia: prova che il test non passa a vuoto.
    expect(ratio("#bdbdbd", paper)).toBeLessThan(4.5)
  })
})

// ── Testo su sfondo --m-fill (pill: .st-room, .st-chip-student) ──────────
// Il fill è un velo scuro semitrasparente: il fondo REALE non è la carta ma il
// composito fill-su-carta (più scuro), dove ink-4 NON arriva ad AA. Questi test
// modellano il fondo composito e bloccano la regressione (ink-4 su fill).

/** Composita rgba(r,g,b,a) sopra una base hex e restituisce l'hex risultante. */
function over(rgba: { r: number; g: number; b: number; a: number }, baseHex: string): string {
  const br = parseInt(baseHex.slice(1, 3), 16)
  const bg = parseInt(baseHex.slice(3, 5), 16)
  const bb = parseInt(baseHex.slice(5, 7), 16)
  const mix = (s: number, d: number) => Math.round(s * rgba.a + d * (1 - rgba.a))
  const h = (n: number) => n.toString(16).padStart(2, "0")
  return `#${h(mix(rgba.r, br))}${h(mix(rgba.g, bg))}${h(mix(rgba.b, bb))}`
}

/** Legge --m-fill come rgba(r,g,b,a) da tokens.css. */
function fillRgba(): { r: number; g: number; b: number; a: number } {
  const m = css.match(/--m-fill\s*:\s*rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/)
  if (!m) throw new Error("--m-fill non trovato come rgba")
  return { r: +m[1], g: +m[2], b: +m[3], a: +m[4] }
}

describe("S-UX-3: contrasto su sfondo --m-fill (pill della shell)", () => {
  const paper = hex("--m-paper")
  const canvas = hex("--m-canvas")
  const fill = fillRgba()
  const fillOnPaper = over(fill, paper)
  const fillOnCanvas = over(fill, canvas)

  it("il composito fill-su-carta è più scuro della carta (modello corretto)", () => {
    expect(luminance(fillOnPaper)).toBeLessThan(luminance(paper))
  })

  it("ink-4 su fill NON passa AA (motivo del fix: serviva un inchiostro più scuro)", () => {
    expect(ratio(hex("--m-ink-4"), fillOnPaper)).toBeLessThan(4.5)
  })

  it("ink-3 (colore ora usato sulle pill) supera 4.5:1 sul composito fill", () => {
    expect(ratio(hex("--m-ink-3"), fillOnPaper)).toBeGreaterThanOrEqual(4.5)
    expect(ratio(hex("--m-ink-3"), fillOnCanvas)).toBeGreaterThanOrEqual(4.5)
  })

  it(".st-room e .st-chip-student NON usano ink-4 su fill (lock anti-regressione)", () => {
    const index = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../index.css"), "utf8")
    for (const sel of ["st-room", "st-chip-student"]) {
      const body = index.match(new RegExp(`\\.${sel}\\s*\\{[^}]*\\}`))?.[0] ?? ""
      expect(body, `regola .${sel} non trovata`).not.toBe("")
      expect(body, `.${sel} usa ancora fill come sfondo`).toContain("var(--m-fill)")
      expect(body, `.${sel} reintrodurrebbe ink-4 su fill (sotto AA)`).not.toContain("var(--m-ink-4)")
    }
  })
})
