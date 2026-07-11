// @vitest-environment jsdom
// Product Flow Shell — la nav espone gli ingressi caricabili e preserva la stanza.

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import ViewNav, { ARDESIA_VIEW_LINKS, viewHref } from "../design/ViewNav"

afterEach(() => {
  cleanup()
  window.history.replaceState(null, "", "/")
})

describe("viewHref — hash stanza preservato attraverso le viste", () => {
  it("lavagna con hash = stessa stanza; Knowledge, Library e Marketplace portano lo hash", () => {
    expect(viewHref("lavagna", "#wbstudio-abc")).toBe("/#wbstudio-abc")
    expect(viewHref("knowledge", "#wbstudio-abc")).toBe("/?vista=knowledge#wbstudio-abc")
    expect(viewHref("library", "#wbstudio-abc")).toBe("/?vista=library#wbstudio-abc")
    expect(viewHref("marketplace", "#wbstudio-abc")).toBe("/?vista=marketplace#wbstudio-abc")
  })
})

describe("StudioShell — struttura condivisa delle viste prodotto", () => {
  it("rende wordmark, launcher, azioni, rail e stage", async () => {
    const { default: StudioShell } = await import("../design/StudioShell")

    const { container } = render(
      <StudioShell
        current="knowledge"
        searchLabel="Cerca nella lezione"
        launcher={<button type="button">Cerca</button>}
        actions={<button type="button">Aggiorna</button>}
      >
        <p>Contenuto Knowledge</p>
      </StudioShell>,
    )

    expect(container.querySelector("[data-studio-shell]")?.getAttribute("data-current-view"))
      .toBe("knowledge")
    expect(container.querySelector(".st-shell-topbar")?.textContent).toContain("Ardesia")
    expect(screen.getByText("Cerca nella lezione")).not.toBeNull()
    expect(screen.getByRole("button", { name: "Cerca" })).not.toBeNull()
    expect(screen.getByRole("button", { name: "Aggiorna" })).not.toBeNull()
    expect(container.querySelector(".st-shell-stage")?.textContent).toContain("Contenuto Knowledge")
  })
})

describe("ViewNav — quattro destinazioni di prodotto", () => {
  it("rende gli ingressi caricabili e marca aria-current sulla corrente", () => {
    window.history.replaceState(null, "", "/?vista=library#wbstudio-room1")
    const { container } = render(<ViewNav current="library" />)
    const items = container.querySelectorAll("[data-view-nav-item]")
    expect(items.length).toBe(ARDESIA_VIEW_LINKS.length)
    expect(ARDESIA_VIEW_LINKS.map((view) => view.id)).toEqual([
      "lavagna",
      "knowledge",
      "library",
      "marketplace",
    ])
    expect(container.textContent).toContain("Knowledge")
    expect(container.textContent).toContain("Library")
    expect(container.textContent).toContain("Marketplace")
    expect(container.textContent).not.toContain("Simulatore")
    expect(container.textContent).not.toContain("ELABTutor")
    expect(container.textContent).not.toContain("cruscotto")
    expect(container.textContent).not.toContain("lezioni")
    const current = container.querySelector('[aria-current="page"]')
    expect(current?.getAttribute("data-view-nav-item")).toBe("library")
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
