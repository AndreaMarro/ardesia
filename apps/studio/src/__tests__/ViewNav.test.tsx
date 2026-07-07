// @vitest-environment jsdom
// Product Flow Shell — la nav preserva la stanza e dichiara la vista corrente.

import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import ViewNav, { ARDESIA_VIEW_LINKS, viewHref } from "../design/ViewNav"

afterEach(() => {
  cleanup()
  window.history.replaceState(null, "", "/")
})

describe("viewHref — hash stanza preservato attraverso le viste", () => {
  it("lavagna con hash = stessa stanza; viste query-routed portano lo hash", () => {
    expect(viewHref("lavagna", "#wbstudio-abc")).toBe("/#wbstudio-abc")
    expect(viewHref("elab-lab", "#wbstudio-abc")).toBe("/?vista=elab-lab#wbstudio-abc")
    expect(viewHref("cruscotto", "")).toBe("/?vista=cruscotto")
    expect(viewHref("lezioni-salvate", "wbstudio-x")).toBe(
      "/?vista=lezioni-salvate#wbstudio-x",
    )
  })
})

describe("ViewNav — sobria, completa, con vista corrente dichiarata", () => {
  it("rende le 4 viste del flusso docente e marca aria-current sulla corrente", () => {
    window.history.replaceState(null, "", "/?vista=elab-lab#wbstudio-room1")
    const { container } = render(<ViewNav current="elab-lab" />)
    const items = container.querySelectorAll("[data-view-nav-item]")
    expect(items.length).toBe(ARDESIA_VIEW_LINKS.length)
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
