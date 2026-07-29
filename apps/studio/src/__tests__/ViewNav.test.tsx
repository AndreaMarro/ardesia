// @vitest-environment jsdom
// Product Flow Shell — la nav espone gli ingressi caricabili e preserva la stanza.

import { cleanup, fireEvent, render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import ViewNav, { ARDESIA_VIEW_LINKS, viewHref } from "../design/ViewNav"

afterEach(() => {
  cleanup()
  window.history.replaceState(null, "", "/")
})

describe("viewHref — hash lezione preservato nelle tre superfici Founder Beta", () => {
  it("Lezione riapre la stanza; Continuità e Materiali portano lo stesso hash", () => {
    expect(viewHref("lezione", "#wbstudio-abc")).toBe("/#wbstudio-abc")
    expect(viewHref("continuita", "#wbstudio-abc")).toBe("/?vista=continuita#wbstudio-abc")
    expect(viewHref("materiali", "#wbstudio-abc")).toBe("/?vista=lezioni-salvate#wbstudio-abc")
  })
})

describe("ViewNav — sole Lezione, Continuità e Materiali", () => {
  it("rende esattamente le tre superfici e normalizza la route legacy corrente", () => {
    window.history.replaceState(null, "", "/?vista=cruscotto#wbstudio-room1")
    const { container } = render(<ViewNav current="cruscotto" />)
    const items = container.querySelectorAll("[data-view-nav-item]")
    expect(items.length).toBe(ARDESIA_VIEW_LINKS.length)
    expect(ARDESIA_VIEW_LINKS.map((view) => view.id)).toEqual([
      "lezione",
      "continuita",
      "materiali",
    ])
    expect(container.textContent).toContain("Lezione")
    expect(container.textContent).toContain("Continuità")
    expect(container.textContent).toContain("Materiali")
    expect(container.textContent).not.toContain("Simulatore")
    expect(container.textContent).not.toContain("ELABTutor")
    expect(container.textContent).not.toContain("Marketplace")
    const current = container.querySelector('[aria-current="page"]')
    expect(current?.getAttribute("data-view-nav-item")).toBe("continuita")
    // Ogni link porta lo hash stanza corrente.
    for (const item of Array.from(items)) {
      expect(item.getAttribute("href")).toContain("#wbstudio-room1")
    }
    // La superficie Lezione punta alla root (non a una vista query).
    expect(
      container.querySelector('[data-view-nav-item="lezione"]')?.getAttribute("href"),
    ).toBe("/#wbstudio-room1")
  })

  it("intercetta soltanto il click primario quando la superficie deve fare preflight", () => {
    window.history.replaceState(null, "", "/#wbstudio-room1")
    const onNavigate = vi.fn()
    const { container } = render(
      <ViewNav current="lavagna" onNavigate={onNavigate} />,
    )
    const continuity = container.querySelector<HTMLAnchorElement>(
      '[data-view-nav-item="continuita"]',
    )!

    fireEvent.click(continuity)
    expect(onNavigate).toHaveBeenCalledWith(
      "/?vista=continuita#wbstudio-room1",
    )
    expect(window.location.href).toBe("http://localhost:3000/#wbstudio-room1")

    onNavigate.mockClear()
    fireEvent.click(continuity, { metaKey: true })
    expect(onNavigate).not.toHaveBeenCalled()
  })
})
