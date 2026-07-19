// @vitest-environment jsdom
// Product Flow Shell — la nav espone gli ingressi caricabili e preserva la stanza.

import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import ViewNav, { ARDESIA_VIEW_LINKS, viewHref } from "../design/ViewNav"

afterEach(() => {
  cleanup()
  window.history.replaceState(null, "", "/")
})

describe("viewHref — hash lezione preservato nelle tre superfici Founder Beta", () => {
  it("Lezione riapre la stanza; Continuità e Materiali portano lo stesso hash", () => {
    expect(viewHref("lezione", "#wbstudio-abc")).toBe("/#wbstudio-abc")
    expect(viewHref("continuita", "#wbstudio-abc")).toBe("/?vista=cruscotto#wbstudio-abc")
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
})
