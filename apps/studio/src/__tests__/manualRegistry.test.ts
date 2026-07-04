// LessonOS — Test staticManualRegistry: risoluzione manuali keyed SOLO su documentId
// (identità content-addressed dal PR #42). Mai inferenza da documentName.

import { describe, it, expect } from "vitest"
import { staticManualRegistry } from "../lessonos/manualRegistry"

const ENTRIES = {
  "document:sha256:abc123": {
    manualId: "manual:vol1",
    title: "ELAB Volume 1",
    pages: [1, 40] as [number, number],
  },
  "document:sha256:off42": {
    manualId: "manual:vol2",
    pageOffset: 10,
  },
}

function view(over: Partial<{ documentId: string; documentName: string; page: number }>) {
  return {
    t: 1000,
    type: "pdf.page.view" as const,
    page: over.page ?? 3,
    totalPages: 40,
    ...(over.documentId !== undefined ? { documentId: over.documentId } : {}),
    ...(over.documentName !== undefined ? { documentName: over.documentName } : {}),
  }
}

describe("staticManualRegistry", () => {
  const registry = staticManualRegistry(ENTRIES)

  it("documentId registrato e pagina in range → ManualPageRef con label", () => {
    const ref = registry.resolve(view({ documentId: "document:sha256:abc123", page: 3 }))
    expect(ref).toEqual({
      manualId: "manual:vol1",
      page: 3,
      labels: { it: "ELAB Volume 1 — p.3" },
    })
  })

  it("documentId assente → undefined ANCHE se documentName combacia (mai inferenza dal nome)", () => {
    expect(registry.resolve(view({ documentName: "ELAB Volume 1.pdf" }))).toBeUndefined()
  })

  it("documentId sconosciuto → undefined", () => {
    expect(registry.resolve(view({ documentId: "document:sha256:zzz" }))).toBeUndefined()
  })

  it("pagina fuori range → undefined", () => {
    expect(registry.resolve(view({ documentId: "document:sha256:abc123", page: 41 }))).toBeUndefined()
    expect(registry.resolve(view({ documentId: "document:sha256:abc123", page: 0 }))).toBeUndefined()
  })

  it("pageOffset rimappa la pagina PDF sulla numerazione del manuale", () => {
    const ref = registry.resolve(view({ documentId: "document:sha256:off42", page: 5 }))
    expect(ref?.manualId).toBe("manual:vol2")
    expect(ref?.page).toBe(15)
    // senza title, la label usa il manualId
    expect(ref?.labels).toEqual({ it: "manual:vol2 — p.15" })
  })

  it("registry vuoto → sempre undefined", () => {
    expect(staticManualRegistry({}).resolve(view({ documentId: "document:sha256:abc123" }))).toBeUndefined()
  })
})
