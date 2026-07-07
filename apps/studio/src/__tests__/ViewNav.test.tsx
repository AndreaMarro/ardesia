// @vitest-environment jsdom
// Product Flow Shell — la nav espone solo i due ingressi caricabili e preserva la stanza.

import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import ViewNav, { ARDESIA_VIEW_LINKS, viewHref } from "../design/ViewNav"

afterEach(() => {
  cleanup()
  window.history.replaceState(null, "", "/")
})

describe("viewHref — hash stanza preservato attraverso le viste", () => {
  it("lavagna con hash = stessa stanza; ELAB Plugin porta lo hash", () => {
    expect(viewHref("lavagna", "#wbstudio-abc")).toBe("/#wbstudio-abc")
    expect(viewHref("elab-lab", "#wbstudio-abc")).toBe("/?vista=elab-lab#wbstudio-abc")
  })
})

describe("ViewNav — sobria, solo lavagna/ELAB Plugin", () => {
  it("rende i 2 ingressi caricabili e marca aria-current sulla corrente", () => {
    window.history.replaceState(null, "", "/?vista=elab-lab#wbstudio-room1")
    const { container } = render(<ViewNav current="elab-lab" />)
    const items = container.querySelectorAll("[data-view-nav-item]")
    expect(items.length).toBe(ARDESIA_VIEW_LINKS.length)
    expect(ARDESIA_VIEW_LINKS.map((view) => view.id)).toEqual(["lavagna", "elab-lab"])
    expect(container.textContent).toContain("ELAB Plugin")
    expect(container.textContent).not.toContain("cruscotto")
    expect(container.textContent).not.toContain("lezioni")
    const current = container.querySelector('[aria-current="page"]')
    expect(current?.getAttribute("data-view-nav-item")).toBe("elab-lab")
    // Ogni link porta lo hash stanza corrente.
    for (const item of Array.from(items)) {
      expect(item.getAttribute("href")).toContain("#wbstudio-room1")
    }
    // La lavagna punta alla root (non a una vista query).
    expect(
      container.querySelector('[data-view-nav-item="lavagna"]')?.getAttribute("href"),
    ).toBe("/#wbstudio-room1")
  })
})
