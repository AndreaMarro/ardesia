// F5-7, flywheel — il finding del revisore diventa un controllo meccanico.
//
// Da quando `renderEmbeddable` importa `design-tokens.css`, i 732 token del
// Simulation Plugin sono dichiarati a `:root` nel documento dello studio.
// È la forma normale di un design system, e quel file è condiviso con l'app
// elab-tutor che li vuole lì: scoparli al canvas costerebbe una seconda copia
// dei 732 token, cioè la duplicazione che questo loop esiste per togliere.
//
// Il prezzo è che i due namespace ora si toccano. Il danno MISURATO (outline
// navy ELAB sulla shell) veniva dalle due regole globali di `design-system.css`
// e non dai token, ed è tenuto dalla spec e2e. Il rischio RESIDUO è diverso e
// non si vede in un browser: una futura CSS dello studio che legge un nome
// dichiarato anche dal plugin ne prenderebbe il valore, in silenzio.
//
// È una domanda sui NOMI, quindi si risponde sui file. Questo test è il gate.
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

function read(relative: string): string {
  return readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8")
}

/** Nomi di custom property dichiarati in un blocco `:root` (non gli usi). */
function rootTokenNames(css: string): Set<string> {
  const names = new Set<string>()
  for (const block of css.matchAll(/:root\s*\{([^}]*)\}/g)) {
    for (const declaration of block[1].matchAll(/(^|\s)(--[a-z0-9-]+)\s*:/gi)) {
      names.add(declaration[2])
    }
  }
  return names
}

describe("namespace dei token: studio ↔ Simulation Plugin", () => {
  const studio = rootTokenNames(read("../tokens.css") + "\n" + read("../index.css"))
  const plugin = rootTokenNames(read("../../../../plugins/elab-tutor/src/styles/design-tokens.css"))

  it("i due file sono stati letti davvero (l'oracolo non è vuoto)", () => {
    // Senza questo, un refactor dei percorsi renderebbe il test verde per
    // assenza di materia — il falso verde più facile da produrre.
    expect(studio.size).toBeGreaterThan(10)
    expect(plugin.size).toBeGreaterThan(500)
  })

  it("nessun nome in comune: il plugin non può cambiare un token dello studio", () => {
    const shared = [...studio].filter((name) => plugin.has(name)).sort()
    expect(
      shared,
      `token dichiarati da ENTRAMBI a :root — il plugin vincerebbe o perderebbe a seconda dell'ordine nel bundle: ${shared.join(", ")}`,
    ).toEqual([])
  })

  it("le regole globali restano fuori dal file che l'host importa", () => {
    const tokens = read("../../../../plugins/elab-tutor/src/styles/design-tokens.css")
    // `design-tokens.css` deve contenere UN solo blocco, quello dei token.
    // Qualunque altro selettore qui dentro entrerebbe nella shell dello studio:
    // è esattamente come `:focus-visible` ci era arrivato.
    const selectors = [...tokens.matchAll(/(^|\n)\s*([^\s/@][^{\n]*)\{/g)].map((match) =>
      match[2].trim(),
    )
    expect(selectors).toEqual([":root"])
  })
})
