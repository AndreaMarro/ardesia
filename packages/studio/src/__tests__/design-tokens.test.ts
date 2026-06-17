// MAESTRO-Studio — S-DESIGN-1: enforcement del sistema di design (DESIGN-MAESTRO-v1 §2).
// Legge i SORGENTI da disco: fallisce se qualcuno reintroduce hex fuori da tokens.css,
// tocca i semafori, o riporta dentro i colori del template Vite.
// NOTA SCOPE: la verifica hex sui .tsx (MathComposer) arriva con S-DESIGN-4 come da spec §5.

import { describe, it, expect } from "vitest"
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..")
const ROOT = join(SRC, "..")

/** Strippa i commenti CSS: un token "definito" solo in un commento NON conta. */
function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "")
}

const tokensCss = stripCssComments(readFileSync(join(SRC, "tokens.css"), "utf8"))
const indexCss = stripCssComments(readFileSync(join(SRC, "index.css"), "utf8"))

const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g

/** Tutti i file sotto dir (ricorsivo), esclusi i test stessi */
function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) {
      if (name === "__tests__" || name === "node_modules") continue
      walk(p, out)
    } else {
      out.push(p)
    }
  }
  return out
}

// L'elenco COMPLETO dei token della spec §2 — se uno sparisce, il test fallisce.
const REQUIRED_TOKENS = [
  // carta
  "paper", "paper-veil", "canvas",
  // inchiostro
  "ink", "ink-2", "ink-3", "ink-4", "line", "line-2", "fill",
  // blu brand (fisso)
  "blue", "blue-down", "blue-deep", "blue-off", "blue-wash", "blue-light",
  // plastici (gli UNICI 11)
  "accent", "accent-down", "accent-deep", "accent-off", "accent-wash", "accent-light",
  "density", "track", "heading-font", "rule-weight", "h-scale",
  // semafori
  "rec", "rec-wash", "verified", "verified-wash", "warn", "error",
  // tipografia
  "font-display", "font-ui", "font-mono",
  "fs-2xs", "fs-xs", "fs-sm", "fs-md", "fs-lg", "fs-xl", "fs-2xl",
  // spazio / raggi / ombre / motion
  "sp-1", "sp-2", "sp-3", "sp-4", "sp-5", "sp-6",
  "r-pill", "r-card", "r-field",
  "shadow-card", "shadow-pop",
  "t-fast", "t-gentle", "ease",
]

const PLASTIC_TOKENS = [
  "accent", "accent-down", "accent-deep", "accent-off", "accent-wash", "accent-light",
  "density", "track", "heading-font", "rule-weight", "h-scale",
]

describe("design tokens — tokens.css (§2)", () => {
  it("definisce TUTTI i token --m-* della spec", () => {
    const missing = REQUIRED_TOKENS.filter(
      (t) => !new RegExp(`--m-${t}\\s*:`).test(tokensCss),
    )
    expect(missing).toEqual([])
  })

  /** Tutte le definizioni di un token (anche ridefinizioni che vincerebbero in cascade) */
  function definitionsOf(token: string, css: string): string[] {
    return [...css.matchAll(new RegExp(`--m-${token}\\s*:\\s*([^;}]+)`, "g"))].map((m) =>
      m[1].trim(),
    )
  }

  it("i semafori sono FISSI ai valori della spec, definiti UNA sola volta (mai plastici, mai ridefiniti)", () => {
    const fixed: Record<string, string> = {
      rec: "#cf222e",
      "rec-wash": "rgba(207,34,46,.07)",
      verified: "#1a7f37",
      "verified-wash": "rgba(26,127,55,.08)",
      warn: "#9a6700",
      error: "#b42318",
    }
    for (const [token, value] of Object.entries(fixed)) {
      expect({ token, defs: definitionsOf(token, tokensCss) }).toEqual({
        token,
        defs: [value],
      })
    }
  })

  it("carta, inchiostro e blu brand sono FISSI ai valori della spec (il wordmark non si ritema MAI)", () => {
    const fixed: Record<string, string> = {
      paper: "#faf9f6",
      canvas: "#fffefb",
      ink: "#14130f",
      blue: "#1763ff",
      "blue-down": "#0e4fd6",
      "blue-deep": "#0a3da6",
      "blue-off": "#9db9f5",
    }
    for (const [token, value] of Object.entries(fixed)) {
      expect({ token, defs: definitionsOf(token, tokensCss) }).toEqual({
        token,
        defs: [value],
      })
    }
  })

  it("gli 11 token plastici sono esattamente 11 e di default NEUTRI (accent = blu brand)", () => {
    expect(PLASTIC_TOKENS).toHaveLength(11)
    // Conta dal CSS, non dall'array del test: un 12° accent-* plastico nel CSS è un fail
    const accentDefs = [...tokensCss.matchAll(/--m-accent[\w-]*\s*:/g)].map((m) => m[0])
    expect(accentDefs).toHaveLength(6)
    expect(tokensCss).toMatch(/--m-accent\s*:\s*var\(--m-blue\)/)
    expect(tokensCss).toMatch(/--m-accent-down\s*:\s*var\(--m-blue-down\)/)
    expect(tokensCss).toMatch(/--m-accent-deep\s*:\s*var\(--m-blue-deep\)/)
    expect(tokensCss).toMatch(/--m-accent-off\s*:\s*var\(--m-blue-off\)/)
    expect(tokensCss).toMatch(/--m-accent-wash\s*:\s*var\(--m-blue-wash\)/)
    expect(tokensCss).toMatch(/--m-accent-light\s*:\s*var\(--m-blue-light\)/)
    expect(tokensCss).toMatch(/--m-density\s*:\s*1\.00/)
    expect(tokensCss).toMatch(/--m-heading-font\s*:\s*var\(--m-font-ui\)/)
  })

  it("hex SOLO dentro :root e scope .excalidraw", () => {
    const stripped = tokensCss.replace(
      /(:root|\.excalidraw[^{]*)\s*\{[^}]*\}/g,
      "",
    )
    expect(stripped.match(HEX_RE) ?? []).toEqual([])
  })

  it("espone il ponte variabili verso Excalidraw (--color-primary → --m-accent)", () => {
    expect(tokensCss).toMatch(/\.excalidraw\s*\{[^}]*--color-primary\s*:\s*var\(--m-accent\)/)
    expect(tokensCss).toMatch(/--ui-font\s*:\s*var\(--m-font-ui\)/)
    expect(tokensCss).toMatch(/--island-bg-color/)
  })
})

describe("purge template Vite — index.css e orfani", () => {
  it("index.css importa tokens.css come PRIMA regola", () => {
    const firstStatement = indexCss
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.length > 0 && !l.startsWith("/*"))
    expect(firstStatement).toBe('@import "./tokens.css";')
  })

  it("index.css non contiene NESSUN colore letterale: solo var(--m-*)", () => {
    expect(indexCss.match(HEX_RE) ?? []).toEqual([])
    // niente funzioni colore che evadrebbero il check hex
    expect(indexCss).not.toMatch(/\b(rgba?|hsla?|oklch|oklab|lab|lch|color-mix|color)\s*\(/)
  })

  it("nessun font-size sotto il floor della scala (--m-fs-2xs = 11px)", () => {
    // S-UX-1: testo UI sotto-scala = rottura di coerenza tipografica.
    // Le dichiarazioni font-size in px DEVONO stare >= 11px; il testo di scala
    // passa dai token --m-fs-*. (Il campo math, sopra-scala, resta in px.)
    const subScale = [...indexCss.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)]
      .map((m) => Number(m[1]))
      .filter((px) => px < 11)
    expect(subScale).toEqual([])
  })

  it("il blocco dark-mode del template è sparito", () => {
    expect(indexCss).not.toMatch(/prefers-color-scheme/)
    expect(indexCss).not.toMatch(/color-scheme/)
  })

  it("App.css e public/icons.svg (orfani del template) non esistono più", () => {
    expect(existsSync(join(SRC, "App.css"))).toBe(false)
    expect(existsSync(join(ROOT, "public", "icons.svg"))).toBe(false)
  })

  it("ogni altro .css in src/ ha zero hex (tokens.css è l'unica fonte)", () => {
    const cssFiles = walk(SRC).filter(
      (p) => p.endsWith(".css") && !p.endsWith("tokens.css"),
    )
    for (const p of cssFiles) {
      const hexes = readFileSync(p, "utf8").match(HEX_RE) ?? []
      expect({ file: p, hexes }).toEqual({ file: p, hexes: [] })
    }
  })
})

describe("colori del template Vite banditi da tutto src/", () => {
  // costruiti a runtime per non auto-flaggare questo file
  const banned = ["aa3bff", "863bff", "6965db", "c084fc"].map(
    (h) => new RegExp("#" + h, "i"),
  )

  it("zero #aa3bff / #863bff / #6965db / #c084fc in qualunque file di src/", () => {
    const offenders: string[] = []
    for (const p of walk(SRC)) {
      const content = readFileSync(p, "utf8")
      for (const re of banned) {
        if (re.test(content)) offenders.push(`${p} → ${re.source}`)
      }
    }
    expect(offenders).toEqual([])
  })
})

/* S-DESIGN-4 — MathComposer + Room glifi (§3.B, §5) */
describe("S-DESIGN-4 — MathComposer zero hex + Room zero glifi", () => {
  const SRC = join(dirname(fileURLToPath(import.meta.url)), "..")

  it("MathComposer.tsx non contiene hex #0a8a3a (verde CTA bandito)", () => {
    const content = readFileSync(join(SRC, "MathComposer.tsx"), "utf8")
    expect(content).not.toMatch(/#0a8a3a/i)
  })

  it("MathComposer.tsx non contiene hex #888 (grigio nudo)", () => {
    const content = readFileSync(join(SRC, "MathComposer.tsx"), "utf8")
    expect(content).not.toMatch(/#888\b/)
  })

  it("Room.tsx non contiene glifi ⚠ ✓ ↗ (rimpiazzati da icone)", () => {
    const content = readFileSync(join(SRC, "Room.tsx"), "utf8")
    expect(content).not.toMatch(/[\u26a0\u2713\u2197]/)
  })

  it("nessun file .tsx in src/ contiene #0a8a3a (verde fuori-legge)", () => {
    const offenders: string[] = []
    for (const p of walk(SRC)) {
      if (!p.endsWith(".tsx")) continue
      const content = readFileSync(p, "utf8")
      if (/#0a8a3a/i.test(content)) offenders.push(p)
    }
    expect(offenders).toEqual([])
  })
})
