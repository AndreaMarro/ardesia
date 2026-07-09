// @vitest-environment jsdom

import { cleanup, fireEvent, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import SimulationPluginWorkbench from "../design/SimulationPluginWorkbench"

afterEach(() => {
  cleanup()
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: 1024,
  })
})

function readRequiredAttribute(element: Element, name: string): string {
  const value = element.getAttribute(name)
  expect(value).not.toBeNull()
  return value ?? ""
}

describe("Simulation wire editor UI", () => {
  it("edits selected wire handles while keeping route edits out of the normalized netlist", () => {
    const { container } = render(<SimulationPluginWorkbench />)
    const wireSelector = container.querySelector('[data-wire-select="wire-1"]')

    expect(wireSelector).not.toBeNull()
    fireEvent.click(wireSelector!)

    const editor = container.querySelector("[data-simulation-wire-editor]")
    expect(editor).not.toBeNull()
    expect(editor?.getAttribute("data-selected-wire-id")).toBe("wire-1")
    expect(container.querySelectorAll("[data-wire-endpoint-anchor-locked='true']")).toHaveLength(2)

    const waypoint = container.querySelector("[data-wire-waypoint-handle='wire-1:1']")
    expect(waypoint).not.toBeNull()
    expect(waypoint?.getAttribute("aria-disabled")).toBe("false")

    const netlistBeforeRoute = readRequiredAttribute(editor!, "data-wire-editor-normalized")
    const pathBeforeRoute = readRequiredAttribute(editor!, "data-wire-editor-path")

    fireEvent.pointerDown(waypoint!, { clientX: 180, clientY: 120 })
    fireEvent.pointerMove(waypoint!, { clientX: 240, clientY: 160 })
    fireEvent.pointerUp(waypoint!)

    const pathAfterRoute = readRequiredAttribute(editor!, "data-wire-editor-path")
    expect(pathAfterRoute).not.toBe(pathBeforeRoute)
    expect(readRequiredAttribute(editor!, "data-wire-editor-normalized")).toBe(
      netlistBeforeRoute,
    )
    expect(editor?.getAttribute("data-wire-editor-last-action")).toBe("route-only")

    fireEvent.click(container.querySelector("[data-wire-retarget-valid-to]")!)

    const netlistAfterEndpoint = readRequiredAttribute(editor!, "data-wire-editor-normalized")
    expect(netlistAfterEndpoint).not.toBe(netlistBeforeRoute)
    expect(
      container.querySelector('[data-wire-endpoint-anchor="to"]')?.getAttribute(
        "data-wire-endpoint-ref",
      ),
    ).toBe("bb1:bus-top-plus-2")
    expect(editor?.getAttribute("data-wire-editor-last-action")).toBe("endpoint-retargeted")

    fireEvent.click(container.querySelector("[data-wire-retarget-invalid-to]")!)

    expect(readRequiredAttribute(editor!, "data-wire-editor-normalized")).toBe(
      netlistAfterEndpoint,
    )
    expect(editor?.getAttribute("data-wire-editor-last-action")).toBe("endpoint-rejected")
    expect(editor?.getAttribute("data-wire-editor-diagnostics")).toContain(
      "invalid-wire-endpoint",
    )
  })
})
