// LessonOS C1 — Config manuali ELAB reali: documentId content-addressed con la
// STESSA semantica del runtime loadFile.pdfToImages (sha256 hex lowercase
// dell'intero file → "document:sha256:<hex>"). Gli hash qui sotto sono stati
// calcolati firsthand con `shasum -a 256` sui PDF reali (2026-07-04); i range
// pagina e il pageOffset=0 sono verificati sul footer stampato dei PDF.

import { describe, it, expect } from "vitest"
import { ELAB_MANUAL_ENTRIES } from "../lessonos/manualConfig"
import { defaultManualRegistry } from "../lessonos/manualRegistry"

// MANUALE VOLUME 2 ITALIANO.pdf — 116 pagine, footer stampato == indice PDF
const VOL2_ID =
  "document:sha256:31431a4b8af6784444e1d29121536248c7a84876b0cff139a94b1a14c758272a"
// Manuale vol 3 versione 0.13.pdf — 172 pagine, footer stampato == indice PDF
const VOL3_ID =
  "document:sha256:6b20832c245be960c62a513ceb233cf04b2443d3206b46fdcc23a327adebab21"

function view(over: Partial<{ documentId: string; page: number }>) {
  return {
    t: 1000,
    type: "pdf.page.view" as const,
    page: over.page ?? 3,
    totalPages: 200,
    documentName: "manuale.pdf",
    ...(over.documentId !== undefined ? { documentId: over.documentId } : {}),
  }
}

describe("ELAB_MANUAL_ENTRIES (config manuali reali)", () => {
  it("ogni chiave è un documentId content-addressed nel formato runtime", () => {
    const keys = Object.keys(ELAB_MANUAL_ENTRIES)
    expect(keys.length).toBeGreaterThan(0)
    for (const key of keys) {
      expect(key).toMatch(/^document:sha256:[0-9a-f]{64}$/)
    }
  })

  it("ogni entry dichiara un range pagine esplicito (fail-closed sui fuori range)", () => {
    for (const entry of Object.values(ELAB_MANUAL_ENTRIES)) {
      expect(entry.pages).toBeDefined()
      expect(entry.pages![0]).toBeGreaterThanOrEqual(1)
      expect(entry.pages![1]).toBeGreaterThan(entry.pages![0])
    }
  })
})

describe("defaultManualRegistry con config reale", () => {
  it("risolve il Volume 2 reale (hash intero file) sulla pagina vista", () => {
    const ref = defaultManualRegistry.resolve(view({ documentId: VOL2_ID, page: 3 }))
    expect(ref).toEqual({
      manualId: "manual:vol2",
      page: 3,
      labels: { it: "ELAB Volume 2 — p.3" },
    })
  })

  it("risolve il Volume 3 reale su prima e ultima pagina del range", () => {
    expect(defaultManualRegistry.resolve(view({ documentId: VOL3_ID, page: 1 }))?.page).toBe(1)
    expect(defaultManualRegistry.resolve(view({ documentId: VOL3_ID, page: 172 }))?.page).toBe(172)
    expect(defaultManualRegistry.resolve(view({ documentId: VOL3_ID, page: 5 }))?.manualId).toBe(
      "manual:vol3",
    )
  })

  it("pagina fuori range → undefined (fail-closed, nessuna citazione inventata)", () => {
    expect(defaultManualRegistry.resolve(view({ documentId: VOL2_ID, page: 0 }))).toBeUndefined()
    expect(defaultManualRegistry.resolve(view({ documentId: VOL2_ID, page: 117 }))).toBeUndefined()
    expect(defaultManualRegistry.resolve(view({ documentId: VOL3_ID, page: 173 }))).toBeUndefined()
  })

  it("hash sconosciuto → undefined (nessun material.cited per PDF non registrati)", () => {
    const unknown = `document:sha256:${"f".repeat(64)}`
    expect(defaultManualRegistry.resolve(view({ documentId: unknown }))).toBeUndefined()
  })

  it("documentId assente → undefined anche con documentName plausibile (mai inferenza dal nome)", () => {
    expect(defaultManualRegistry.resolve(view({}))).toBeUndefined()
  })
})
