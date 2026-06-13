// @vitest-environment jsdom
// MAESTRO-Studio — S-UX-2: vista vuota / di errore.

import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { createRoot, type Root } from "react-dom/client"
import { act } from "react"
import EmptyState from "../design/EmptyState"
import { hasEmoji } from "./emojiGuard"

describe("EmptyState — vista vuota/errore (S-UX-2)", () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    document.body.removeChild(container)
  })

  it("mostra titolo, dettaglio e suggerimento (cosa, cosa e' successo, cosa fare)", () => {
    act(() => {
      root.render(
        <EmptyState
          title="Ancora nessun appunto"
          detail="Questa lezione non contiene ancora elementi."
          hint="Torna alla lavagna e inizia a scrivere."
        />,
      )
    })
    expect(container.querySelector(".st-state-title")?.textContent).toBe("Ancora nessun appunto")
    expect(container.querySelector(".st-state-detail")?.textContent).toBe(
      "Questa lezione non contiene ancora elementi.",
    )
    expect(container.querySelector(".st-state-hint")?.textContent).toBe(
      "Torna alla lavagna e inizia a scrivere.",
    )
  })

  it("senza hint non renderizza il paragrafo suggerimento", () => {
    act(() => {
      root.render(<EmptyState title="t" detail="d" />)
    })
    expect(container.querySelector(".st-state-hint")).toBeNull()
  })

  it("tono neutro = role=status; tono error = role=alert + classe", () => {
    act(() => {
      root.render(<EmptyState title="t" detail="d" />)
    })
    expect(container.querySelector(".st-state")?.getAttribute("role")).toBe("status")
    expect(container.querySelector(".st-state-error")).toBeNull()

    act(() => {
      root.render(<EmptyState tone="error" title="t" detail="d" />)
    })
    const el = container.querySelector(".st-state")
    expect(el?.getAttribute("role")).toBe("alert")
    expect(el?.classList.contains("st-state-error")).toBe(true)
  })

  it("layout compatto applica la classe st-state-compact", () => {
    act(() => {
      root.render(<EmptyState compact title="t" detail="d" />)
    })
    expect(container.querySelector(".st-state-compact")).not.toBeNull()
  })

  it("il testo renderizzato non contiene emoji", () => {
    act(() => {
      root.render(
        <EmptyState
          tone="error"
          title="Riepilogo non disponibile"
          detail="Non è stato possibile preparare il riepilogo."
          hint="Riprova tra qualche istante."
        />,
      )
    })
    const text = container.textContent ?? ""
    expect(text.length).toBeGreaterThan(0)
    expect(hasEmoji(text)).toBe(false)
    // guardia non-vacua: il matcher individua un emoji se presente.
    expect(hasEmoji("riepilogo 📦")).toBe(true)
  })
})
