// @vitest-environment jsdom
// P0-C residuo — duplicazione dal canvas (copy/paste/Alt-drag di Excalidraw).
// BUG (a lettura codice, poi falsificato qui): il duplicato clona il LINK →
// elemento con id NUOVO ma embedId VECCHIO nel link. persistEmbedState matcha
// `el.id === embedId`, quindi il duplicato è un FANTASMA che edita lo stato
// dell'originale (cross-write tra post-it che l'utente crede indipendenti).
//
// Fix: normalizeDuplicatedToolEmbeds — ogni embeddable maestro-tool:// con
// id ≠ embedId del link viene riscritto come NUOVA istanza: embedId = id
// dell'elemento (unico per costruzione Excalidraw), stato clonato (il
// duplicato parte da dove era l'originale, poi vive di suo).

import { describe, expect, it } from "vitest"
import {
  createToolEmbedElement,
  normalizeDuplicatedToolEmbeds,
  parseToolLink,
  REFERENCE_SIM_TOOL_ID,
} from "../toolhost/ToolCanvasEmbeddable"

function duplicateOf(original: ReturnType<typeof createToolEmbedElement>, newId: string) {
  // Ciò che fa Excalidraw su copy/paste: id nuovo, link e customData clonati.
  return { ...original, id: newId, customData: structuredClone(original.customData) }
}

describe("normalizeDuplicatedToolEmbeds — duplicato = NUOVA istanza", () => {
  it("id coerente col link: nessuna riscrittura (referential equality)", () => {
    const original = createToolEmbedElement()
    const result = normalizeDuplicatedToolEmbeds([original])
    expect(result.changed).toBe(false)
    expect(result.elements[0]).toBe(original)
  })

  it("duplicato (id ≠ embedId): link riscritto con embedId = id elemento, stato clonato", () => {
    const original = createToolEmbedElement()
    const dup = duplicateOf(original, "excal-random-id-1")
    const result = normalizeDuplicatedToolEmbeds([original, dup])

    expect(result.changed).toBe(true)
    const normalized = result.elements[1] as typeof dup
    const parsed = parseToolLink(normalized.link)
    expect(parsed).toEqual({ toolId: REFERENCE_SIM_TOOL_ID, embedId: "excal-random-id-1" })
    // L'originale resta intatto (stesso riferimento).
    expect(result.elements[0]).toBe(original)
    // Lo stato è CLONATO, non condiviso per riferimento.
    expect(normalized.customData).not.toBe(dup.customData)
  })

  it("elementi non-tool e link estranei restano intatti", () => {
    const stranger = { id: "rect-1", type: "rectangle" }
    const external = { id: "iframe-1", type: "embeddable", link: "https://example.test" }
    const result = normalizeDuplicatedToolEmbeds([stranger, external])
    expect(result.changed).toBe(false)
    expect(result.elements[0]).toBe(stranger)
    expect(result.elements[1]).toBe(external)
  })

  it("FALSIFICAZIONE del bug: senza normalizzazione il duplicato scrive sull'originale", () => {
    // Documenta il comportamento rotto che il fix elimina: due elementi con lo
    // stesso embedId nel link → persistEmbedState(embedId) trova l'ORIGINALE.
    const original = createToolEmbedElement()
    const dup = duplicateOf(original, "excal-random-id-2")
    const sameEmbedId = parseToolLink(dup.link)?.embedId
    expect(sameEmbedId).toBe(parseToolLink(original.link)?.embedId)
    expect(dup.id).not.toBe(original.id)
  })
})
