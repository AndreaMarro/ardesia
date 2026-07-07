// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import SimulationPluginWorkbench from "../design/SimulationPluginWorkbench"
import ViewNav, { ARDESIA_VIEW_LINKS, viewHref } from "../design/ViewNav"
import { isSimulationPluginView } from "../store/simulationPluginView"

afterEach(() => {
  cleanup()
  window.history.replaceState(null, "", "/")
})

describe("Simulation Plugin route", () => {
  it("has its own query route, separate from ELABTutor", () => {
    window.history.replaceState(null, "", "/?vista=simulatore")
    expect(isSimulationPluginView()).toBe(true)
    window.history.replaceState(null, "", "/?vista=elab-lab")
    expect(isSimulationPluginView()).toBe(false)
  })

  it("puts the simulator before ELAB in the primary nav", () => {
    expect(ARDESIA_VIEW_LINKS.map((view) => view.id)).toEqual([
      "lavagna",
      "simulatore",
      "elab-lab",
    ])
    expect(viewHref("simulatore", "#wbstudio-abc")).toBe(
      "/?vista=simulatore#wbstudio-abc",
    )

    window.history.replaceState(null, "", "/?vista=simulatore#wbstudio-room1")
    const { container } = render(<ViewNav current="simulatore" />)
    expect(container.textContent).toContain("Simulatore")
    expect(container.textContent).toContain("ELABTutor")
    expect(
      container.querySelector('[data-view-nav-item="simulatore"]')?.getAttribute("aria-current"),
    ).toBe("page")
  })
})

describe("SimulationPluginWorkbench", () => {
  it("renders a standalone simulator plugin, not an ELAB Lab clone", () => {
    const { container } = render(<SimulationPluginWorkbench />)

    expect(
      container.querySelector('[data-simulation-workbench-state="ready"]'),
    ).not.toBeNull()
    expect(screen.getByText("ARDESIA Simulation")).toBeTruthy()
    expect(screen.getByText("Wokwi diagram.json")).toBeTruthy()
    expect(screen.getByText("Immagine")).toBeTruthy()
    expect(screen.getByText("Descrizione")).toBeTruthy()
    expect(container.querySelector("[data-simulation-canvas]")).not.toBeNull()
    expect(container.querySelector("[data-component-id='uno']")).not.toBeNull()
    expect(container.querySelector("[data-wire-id='wire-1']")).not.toBeNull()
    expect(container.textContent).not.toContain("ELAB Lab")
    expect(container.textContent).not.toContain("dal libro")
  })
})
