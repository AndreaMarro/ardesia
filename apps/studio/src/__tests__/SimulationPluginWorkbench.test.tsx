// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import SimulationPluginWorkbench from "../design/SimulationPluginWorkbench"
import ViewNav, { ARDESIA_VIEW_LINKS, viewHref } from "../design/ViewNav"
import { isSimulationPluginView } from "../store/simulationPluginView"

afterEach(() => {
  cleanup()
  window.history.replaceState(null, "", "/")
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: 1024,
  })
})

describe("Simulation Plugin route", () => {
  it("has its own query route, separate from ELABTutor", () => {
    window.history.replaceState(null, "", "/?vista=simulatore")
    expect(isSimulationPluginView()).toBe(true)
    window.history.replaceState(null, "", "/?vista=elab-lab")
    expect(isSimulationPluginView()).toBe(false)
  })

  it("puts the simulator before Knowledge and ELAB in the primary nav", () => {
    expect(ARDESIA_VIEW_LINKS.map((view) => view.id)).toEqual([
      "lavagna",
      "simulatore",
      "knowledge",
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
    expect(screen.getByText("ARDESIA Simulation Harness")).toBeTruthy()
    expect(screen.getByText("stato canvas")).toBeTruthy()
    expect(
      screen.getByText("simulation harness: canvas ELABTutor reale non ancora montato"),
    ).toBeTruthy()
    expect(screen.getByText("Wokwi diagram.json")).toBeTruthy()
    expect(screen.getByText("Immagine")).toBeTruthy()
    expect(screen.getByText("Descrizione")).toBeTruthy()
    expect(screen.getByText("diagnostica scena")).toBeTruthy()
    expect(container.querySelector("[data-simulation-canvas]")).not.toBeNull()
    expect(container.querySelector('[data-elab-comparable-canvas="false"]')).not.toBeNull()
    expect(container.querySelector('[data-elab-core-canvas-mounted="false"]')).not.toBeNull()
    expect(container.querySelector('[data-simulation-surface="harness"]')).not.toBeNull()
    expect(container.querySelector('[data-experiment-id="v1-cap6-esp1"]')).not.toBeNull()
    expect(container.querySelector('[data-bb-hole="bb1:j8"]')).not.toBeNull()
    expect(container.querySelector("[data-component-id='uno']")).toBeNull()
    expect(container.querySelector("[data-breadboard-snap='bb1:j8']")).toBeNull()
    expect(container.querySelector("[data-live-physics-status]")?.getAttribute(
      "data-live-physics-status",
    )).toBe("ok")
    expect(
      Number(container.querySelector("[data-live-physics-status]")?.getAttribute(
        "data-live-physics-current-ma",
      )),
    ).toBeGreaterThan(0)
    expect(container.querySelector("[data-scene-diagnostic-status]")?.textContent).toBe(
      "ready",
    )
    expect(container.textContent).not.toContain("ELAB Lab")
    expect(container.textContent).not.toContain("dal libro")
  })

  it("switches between Wokwi, image, and description scene sources", () => {
    const { container } = render(<SimulationPluginWorkbench />)

    expect(container.querySelector("[data-simulation-source-kind]")?.textContent).toBe(
      "wokwi-diagram-json",
    )
    fireEvent.click(screen.getByText("Immagine"))
    expect(container.querySelector("[data-simulation-source-kind]")?.textContent).toBe(
      "image-observation",
    )
    expect(container.querySelector('[data-experiment-id="v1-cap6-esp1"]')).not.toBeNull()
    expect(container.querySelector('[data-bb-hole="bb1:j8"]')).not.toBeNull()
    fireEvent.click(screen.getByText("Descrizione"))
    expect(container.querySelector("[data-simulation-source-kind]")?.textContent).toBe(
      "manual-description",
    )
    expect(container.querySelector('[data-experiment-id="v1-cap6-esp1"]')).not.toBeNull()
    expect(container.querySelector("[data-component-id='supply']")).toBeNull()
  })

  it("keeps the board interactive, not just a rendered reference image", () => {
    const { container } = render(<SimulationPluginWorkbench />)
    const resistorTool = container.querySelector('[aria-label="palette Resistenza"]')
    const firstHole = container.querySelector('[data-bb-hole="bb1:c3"]')
    const secondHole = container.querySelector('[data-bb-hole="bb1:c4"]')

    expect(resistorTool).not.toBeNull()
    expect(resistorTool?.getAttribute("aria-pressed")).toBe("false")
    expect(firstHole).not.toBeNull()
    expect(secondHole).not.toBeNull()
    expect(container.querySelector("[data-montaggio-canvas-count]")?.getAttribute(
      "data-montaggio-canvas-count",
    )).toBe("0")

    fireEvent.click(resistorTool!)
    expect(resistorTool?.getAttribute("aria-pressed")).toBe("true")
    fireEvent.click(firstHole!)
    expect(firstHole?.getAttribute("data-pending")).toBe("1")
    fireEvent.click(secondHole!)

    expect(container.querySelector("[data-montaggio-canvas-count]")?.getAttribute(
      "data-montaggio-canvas-count",
    )).toBe("1")
    expect(container.querySelector("[data-live-physics-status]")?.getAttribute(
      "data-live-physics-status",
    )).toBe("ok")
    expect(container.querySelector("[data-live-physics-status]")?.getAttribute(
      "data-free-assembly-findings",
    )).toBe("0")
    expect(
      container.querySelector('[aria-label="Resistore montaggio libero r-libero-1"]'),
    ).not.toBeNull()
  })

  it("keeps the scene canvas first on narrow viewports and responds to resize", () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1024,
    })

    const { container } = render(<SimulationPluginWorkbench />)
    const main = container.querySelector("[data-simulation-workbench-main]")

    expect(main).not.toBeNull()
    expect((main as HTMLElement).style.gridTemplateColumns).not.toBe("1fr")

    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 390,
    })
    fireEvent(window, new Event("resize"))

    expect((main as HTMLElement).style.gridTemplateColumns).toBe("1fr")
    expect(main?.firstElementChild?.getAttribute("aria-label")).toBe(
      "Simulation harness canvas",
    )
  })
})
